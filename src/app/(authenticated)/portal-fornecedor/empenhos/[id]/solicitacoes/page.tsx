'use client';

import { useParams, useRouter } from 'next/navigation';
import { PageHeader } from '@/components/ui/page-header';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/table';
import { StatusBadge } from '@/components/ui/status-badge';
import { Loading } from '@/components/ui/loading';
import { EmptyState } from '@/components/ui/empty-state';
import { useQuery } from '@tanstack/react-query';
import { solicitacoesApi } from '@/app/features/solicitacoes/api/solicitacoes-api';
import { FileText } from 'lucide-react';
import { formatCurrency } from '@/lib/formatters';

export default function SolicitacoesEmpenhoPage() {
	const params = useParams();
	const router = useRouter();
	const empenhoId = parseInt(params.id as string);

	const { data: solicitacoes, isLoading } = useQuery({
		queryKey: ['solicitacoes', empenhoId],
		queryFn: () => solicitacoesApi.getSolicitacoesByEmpenho(empenhoId),
	});

	if (isLoading) {
		return <Loading text="Carregando solicitações..." />;
	}

	const solicitacoesList = Array.isArray(solicitacoes) ? solicitacoes : [];

	return (
		<div>
			<PageHeader
				title={`Solicitações do Empenho ${empenhoId}`}
				description="Lista de solicitações de pagamento deste empenho"
				action={
					<Button onClick={() => router.push(`/portal-fornecedor/empenhos/${empenhoId}/solicitacoes/nova`)}>
						Nova Solicitação
					</Button>
				}
			/>

			{solicitacoesList.length === 0 ? (
				<Card>
					<EmptyState
						icon={<FileText className="w-12 h-12" />}
						title="Nenhuma solicitação cadastrada"
						description="Clique em 'Nova Solicitação' para criar uma solicitação de pagamento"
					/>
				</Card>
			) : (
				<Card>
					<Table>
						<TableHeader>
							<TableRow>
								<TableHead>Número</TableHead>
								<TableHead>Documento Fiscal</TableHead>
								<TableHead>Valor</TableHead>
								<TableHead>Status</TableHead>
								<TableHead className="text-right">Ações</TableHead>
							</TableRow>
						</TableHeader>
						<TableBody>
							{solicitacoesList.map((solicitacao) => (
								<TableRow key={solicitacao.id}>
									<TableCell className="font-medium">{solicitacao.numero}</TableCell>
									<TableCell>
										{solicitacao.documento_fiscal_tipo} {solicitacao.documento_fiscal_numero}
									</TableCell>
									<TableCell>{formatCurrency(parseFloat(String(solicitacao.valor)))}</TableCell>
									<TableCell>
										<StatusBadge status={solicitacao.status} />
									</TableCell>
									<TableCell className="text-right">
										<Button
											size="sm"
											onClick={() =>
												router.push(
													`/portal-fornecedor/solicitacoes/${solicitacao.id}/informacoes`
												)
											}>
											Ver Detalhes
										</Button>
									</TableCell>
								</TableRow>
							))}
						</TableBody>
					</Table>
				</Card>
			)}
		</div>
	);
}

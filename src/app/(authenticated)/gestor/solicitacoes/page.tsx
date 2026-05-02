'use client';

import { PageHeader } from '@/components/ui/page-header';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/table';
import { StatusBadge } from '@/components/ui/status-badge';
import { Loading } from '@/components/ui/loading';
import { EmptyState } from '@/components/ui/empty-state';
import { useQuery } from '@tanstack/react-query';
import { gestorApi } from '@/app/features/gestor/api/gestor-api';
import { useRouter } from 'next/navigation';
import { Paperclip, CheckCircle, XCircle, Clock } from 'lucide-react';
import { formatCurrency } from '@/lib/formatters';

export default function GestorSolicitacoesPage() {
	const router = useRouter();

	const { data: solicitacoes, isLoading } = useQuery({
		queryKey: ['solicitacoes-pendentes'],
		queryFn: gestorApi.getSolicitacoesPendentes,
	});

	if (isLoading) {
		return <Loading text="Carregando solicitações..." />;
	}

	const solicitacoesList = Array.isArray(solicitacoes) ? solicitacoes : [];

	return (
		<div>
			<PageHeader title="Aprovar Anexos" description="Lista de solicitações pendentes de aprovação de anexos" />

			{solicitacoesList.length === 0 ? (
				<Card>
					<EmptyState
						icon={<Paperclip className="w-12 h-12" />}
						title="Nenhuma solicitação pendente"
						description="Não há solicitações aguardando aprovação de anexos no momento"
					/>
				</Card>
			) : (
				<Card>
					<Table>
						<TableHeader>
							<TableRow>
								<TableHead>Número</TableHead>
								<TableHead>Solicitante</TableHead>
								<TableHead>Fornecedor</TableHead>
								<TableHead>Empenho</TableHead>
								<TableHead>Valor</TableHead>
								<TableHead>Data</TableHead>
								<TableHead>Anexos</TableHead>
								<TableHead>Status</TableHead>
								<TableHead className="text-right">Ações</TableHead>
							</TableRow>
						</TableHeader>
						<TableBody>
							{solicitacoesList.map((solicitacao) => (
								<TableRow key={solicitacao.id}>
									<TableCell className="font-medium">{solicitacao.numero}</TableCell>
									<TableCell>{solicitacao.solicitante}</TableCell>
									<TableCell>{solicitacao.fornecedor}</TableCell>
									<TableCell>{solicitacao.empenho}</TableCell>
									<TableCell>{formatCurrency(solicitacao.valor)}</TableCell>
									<TableCell>{solicitacao.data}</TableCell>
									<TableCell>
										<div className="flex items-center gap-2 text-sm">
											<span className="flex items-center gap-1 text-green-600">
												<CheckCircle className="w-4 h-4" />
												{solicitacao.anexos_aprovados}
											</span>
											<span className="flex items-center gap-1 text-yellow-600">
												<Clock className="w-4 h-4" />
												{solicitacao.anexos_pendentes}
											</span>
											<span className="flex items-center gap-1 text-red-600">
												<XCircle className="w-4 h-4" />
												{solicitacao.anexos_recusados}
											</span>
										</div>
									</TableCell>
									<TableCell>
										<StatusBadge status={solicitacao.status} />
									</TableCell>
									<TableCell className="text-right">
										<Button
											size="sm"
											onClick={() =>
												router.push(`/gestor/solicitacoes/${solicitacao.id}/anexos`)
											}>
											Avaliar Anexos
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

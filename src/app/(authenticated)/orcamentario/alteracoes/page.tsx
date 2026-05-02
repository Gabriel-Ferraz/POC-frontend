'use client';

import { PageHeader } from '@/components/ui/page-header';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/table';
import { Loading } from '@/components/ui/loading';
import { EmptyState } from '@/components/ui/empty-state';
import { useQuery } from '@tanstack/react-query';
import { orcamentarioApi } from '@/app/features/orcamentario/api/orcamentario-api';
import { useRouter } from 'next/navigation';
import { FileText, Download, Eye } from 'lucide-react';
import { formatCurrency } from '@/lib/formatters';

export default function AlteracoesOrcamentariasPage() {
	const router = useRouter();

	const { data: alteracoes, isLoading } = useQuery({
		queryKey: ['alteracoes-orcamentarias'],
		queryFn: orcamentarioApi.getAlteracoes,
	});

	if (isLoading) {
		return <Loading text="Carregando alterações orçamentárias..." />;
	}

	const alteracoesList = Array.isArray(alteracoes) ? alteracoes : [];

	return (
		<div>
			<PageHeader
				title="Alterações Orçamentárias"
				description="Lista de alterações orçamentárias e suas dotações"
				action={<Button onClick={() => router.push('/orcamentario/alteracoes/nova')}>Nova Alteração</Button>}
			/>

			{alteracoesList.length === 0 ? (
				<Card>
					<EmptyState
						icon={<FileText className="w-12 h-12" />}
						title="Nenhuma alteração cadastrada"
						description="Clique em 'Nova Alteração' para cadastrar"
					/>
				</Card>
			) : (
				<Card>
					<Table>
						<TableHeader>
							<TableRow>
								<TableHead>Decreto</TableHead>
								<TableHead>Lei/Ato</TableHead>
								<TableHead>Tipo Ato</TableHead>
								<TableHead>Tipo Crédito</TableHead>
								<TableHead>Valor</TableHead>
								<TableHead>Data Ato</TableHead>
								<TableHead className="text-right">Ações</TableHead>
							</TableRow>
						</TableHeader>
						<TableBody>
							{alteracoesList.map((alteracao) => (
								<TableRow key={alteracao.id}>
									<TableCell className="font-medium">{alteracao.decreto}</TableCell>
									<TableCell>
										{alteracao.lei_ato?.numero || '-'} - {alteracao.lei_ato?.tipo || '-'}
									</TableCell>
									<TableCell>{alteracao.tipo_ato}</TableCell>
									<TableCell>{alteracao.tipo_credito}</TableCell>
									<TableCell>{formatCurrency(parseFloat(String(alteracao.valor || 0)))}</TableCell>
									<TableCell>{new Date(alteracao.data_ato).toLocaleDateString('pt-BR')}</TableCell>
									<TableCell className="text-right space-x-2">
										<Button
											size="sm"
											variant="outline"
											onClick={() => router.push(`/orcamentario/alteracoes/${alteracao.id}`)}>
											<Eye className="w-4 h-4 mr-1" />
											Ver Dotações
										</Button>
										<a
											href={orcamentarioApi.getPdfUrl(alteracao.id)}
											target="_blank"
											rel="noopener noreferrer">
											<Button size="sm" variant="outline">
												<Download className="w-4 h-4 mr-1" />
												PDF
											</Button>
										</a>
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

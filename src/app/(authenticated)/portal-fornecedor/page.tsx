'use client';

import { useQuery } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { fornecedorApi } from '@/app/features/fornecedor/api/fornecedor-api';
import { PageHeader } from '@/components/ui/page-header';
import { Card } from '@/components/ui/card';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { StatusBadge } from '@/components/ui/status-badge';
import { Loading } from '@/components/ui/loading';
import { EmptyState } from '@/components/ui/empty-state';
import { formatCurrency, formatDate } from '@/lib/formatters';
import { FileText } from 'lucide-react';

export default function EmpenhosPage() {
	const router = useRouter();
	const {
		data: empenhos,
		isLoading,
		error,
	} = useQuery({
		queryKey: ['empenhos'],
		queryFn: fornecedorApi.getEmpenhos,
	});

	if (isLoading) {
		return <Loading text="Carregando empenhos..." />;
	}

	if (error) {
		return (
			<div className="p-4 bg-red-50 border border-red-200 rounded-md">
				<p className="text-red-800">Erro ao carregar empenhos. Tente novamente.</p>
				<pre className="text-xs mt-2 overflow-auto">{JSON.stringify(error, null, 2)}</pre>
			</div>
		);
	}

	// Garantir que empenhos é um array
	const empenhosList = Array.isArray(empenhos) ? empenhos : [];

	return (
		<div>
			<PageHeader title="Empenhos" description="Lista de empenhos vinculados ao fornecedor" />

			{empenhosList.length === 0 ? (
				<Card>
					<EmptyState
						icon={<FileText className="w-12 h-12" />}
						title="Nenhum empenho encontrado"
						description="Não há empenhos cadastrados para este fornecedor"
					/>
				</Card>
			) : (
				<Card>
					<Table>
						<TableHeader>
							<TableRow>
								<TableHead>Número</TableHead>
								<TableHead>Contrato</TableHead>
								<TableHead>Data Emissão</TableHead>
								<TableHead>Valor Empenhado</TableHead>
								<TableHead>Saldo Disponível</TableHead>
								<TableHead>Status</TableHead>
								<TableHead className="text-right">Ações</TableHead>
							</TableRow>
						</TableHeader>
						<TableBody>
							{empenhosList.map((empenho) => (
								<TableRow key={empenho.id}>
									<TableCell className="font-medium">{empenho.numero}</TableCell>
									<TableCell>{empenho.contrato || '-'}</TableCell>
									<TableCell>{empenho.data_emissao}</TableCell>
									<TableCell>{formatCurrency(parseFloat(empenho.valor))}</TableCell>
									<TableCell className="font-semibold">
										{formatCurrency(parseFloat(empenho.saldo))}
									</TableCell>
									<TableCell>
										<StatusBadge status={empenho.status} />
									</TableCell>
									<TableCell className="text-right">
										<Button
											size="sm"
											onClick={() =>
												router.push(`/portal-fornecedor/empenhos/${empenho.id}/solicitacoes`)
											}>
											Ver Solicitações
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

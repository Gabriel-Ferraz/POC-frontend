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
				<>
					{/* Tabela para desktop */}
					<Card className="hidden lg:block">
						<div className="overflow-x-auto">
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
						</div>
					</Card>

					{/* Cards para mobile e tablet */}
					<div className="lg:hidden space-y-3">
						{solicitacoesList.map((solicitacao) => (
							<Card key={solicitacao.id} className="p-4">
								<div className="space-y-3">
									<div className="flex items-start justify-between gap-2">
										<div>
											<p className="text-xs text-muted-foreground">Número</p>
											<p className="font-medium">{solicitacao.numero}</p>
										</div>
										<StatusBadge status={solicitacao.status} />
									</div>

									<div className="grid grid-cols-2 gap-3 text-sm">
										<div>
											<p className="text-xs text-muted-foreground">Solicitante</p>
											<p className="font-medium">{solicitacao.solicitante}</p>
										</div>
										<div>
											<p className="text-xs text-muted-foreground">Data</p>
											<p>{solicitacao.data}</p>
										</div>
									</div>

									<div className="grid grid-cols-2 gap-3 text-sm">
										<div>
											<p className="text-xs text-muted-foreground">Fornecedor</p>
											<p className="truncate">{solicitacao.fornecedor}</p>
										</div>
										<div>
											<p className="text-xs text-muted-foreground">Empenho</p>
											<p>{solicitacao.empenho}</p>
										</div>
									</div>

									<div>
										<p className="text-xs text-muted-foreground">Valor</p>
										<p className="font-semibold text-lg">{formatCurrency(solicitacao.valor)}</p>
									</div>

									<div className="border-t pt-3">
										<p className="text-xs text-muted-foreground mb-2">Anexos</p>
										<div className="flex items-center gap-4 text-sm">
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
									</div>

									<Button
										size="sm"
										className="w-full"
										onClick={() => router.push(`/gestor/solicitacoes/${solicitacao.id}/anexos`)}>
										Avaliar Anexos
									</Button>
								</div>
							</Card>
						))}
					</div>
				</>
			)}
		</div>
	);
}

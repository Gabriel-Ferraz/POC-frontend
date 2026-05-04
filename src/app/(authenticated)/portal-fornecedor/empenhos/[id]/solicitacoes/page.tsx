'use client';

import { useParams, useRouter } from 'next/navigation';
import { PageHeader } from '@/components/ui/page-header';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/table';
import { StatusBadge } from '@/components/ui/status-badge';
import { Loading } from '@/components/ui/loading';
import { EmptyState } from '@/components/ui/empty-state';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { solicitacoesApi } from '@/app/features/solicitacoes/api/solicitacoes-api';
import { FileText, Paperclip, XCircle, Info } from 'lucide-react';
import { formatCurrency } from '@/lib/formatters';
import { StatusSolicitacao } from '@/types/enums';
import { CancelarSolicitacaoModal } from '@/app/features/solicitacoes/components/CancelarSolicitacaoModal';
import { AnexosModal } from '@/app/features/solicitacoes/components/AnexosModal';
import { useState } from 'react';
import { toast } from 'sonner';

export default function SolicitacoesEmpenhoPage() {
	const params = useParams();
	const router = useRouter();
	const queryClient = useQueryClient();
	const empenhoId = parseInt(params.id as string);

	const [modalCancelarOpen, setModalCancelarOpen] = useState(false);
	const [modalAnexosOpen, setModalAnexosOpen] = useState(false);
	const [solicitacaoSelecionada, setSolicitacaoSelecionada] = useState<any>(null);

	const { data, isLoading } = useQuery({
		queryKey: ['solicitacoes', empenhoId],
		queryFn: () => solicitacoesApi.getSolicitacoesByEmpenho(empenhoId),
	});

	const empenho = data?.empenho;
	const solicitacoesList = data?.solicitacoes ?? [];

	const { mutate: cancelarSolicitacao, isPending: isCancelando } = useMutation({
		mutationFn: ({ motivo, dataCancelamento }: { motivo: string; dataCancelamento: string }) => {
			if (!solicitacaoSelecionada?.id) throw new Error('Nenhuma solicitação selecionada');
			return solicitacoesApi.cancelarSolicitacao(solicitacaoSelecionada.id, {
				data_cancelamento: dataCancelamento,
				motivo,
			});
		},
		onSuccess: () => {
			toast.success('Solicitação cancelada com sucesso!');
			queryClient.invalidateQueries({ queryKey: ['solicitacoes', empenhoId] });
			setModalCancelarOpen(false);
			setSolicitacaoSelecionada(null);
		},
		onError: (error: any) => {
			toast.error(error?.payload?.message || error?.message || 'Erro ao cancelar solicitação');
		},
	});

	if (isLoading) {
		return <Loading text="Carregando solicitações..." />;
	}

	return (
		<div>
			<PageHeader
				title={`Solicitações do Empenho ${empenho?.numero ?? empenhoId}`}
				description={
					empenho?.contrato
						? `Contrato ${empenho.contrato} · Saldo disponível: ${formatCurrency(Number(empenho.saldo))}`
						: 'Lista de solicitações de pagamento deste empenho'
				}
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
					<div className="overflow-x-auto">
						<Table>
							<TableHeader>
								<TableRow>
									<TableHead className="whitespace-nowrap">Número</TableHead>
									<TableHead className="whitespace-nowrap">Data</TableHead>
									<TableHead className="whitespace-nowrap">Documento Fiscal</TableHead>
									<TableHead className="whitespace-nowrap">Solicitante</TableHead>
									<TableHead className="whitespace-nowrap text-right">Valor</TableHead>
									<TableHead className="whitespace-nowrap">Status</TableHead>
									<TableHead className="whitespace-nowrap text-right">Ações</TableHead>
								</TableRow>
							</TableHeader>
							<TableBody>
								{solicitacoesList.map((solicitacao) => {
									const isPendente =
										solicitacao.status === StatusSolicitacao.RASCUNHO ||
										solicitacao.status === StatusSolicitacao.AGUARDANDO_APROVACAO;

									const podeEditarAnexos =
										isPendente || solicitacao.status === StatusSolicitacao.ANEXOS;

									const podeCancelar = isPendente || solicitacao.status === StatusSolicitacao.ANEXOS;

									const docFiscal = [
										(solicitacao as any).documento_fiscal_tipo,
										(solicitacao as any).documento_fiscal_numero,
									]
										.filter(Boolean)
										.join(' ');

									return (
										<TableRow key={solicitacao.id}>
											<TableCell className="font-medium whitespace-nowrap">
												{solicitacao.numero}
											</TableCell>
											<TableCell className="whitespace-nowrap text-sm text-muted-foreground">
												{(solicitacao as any).data ?? '—'}
											</TableCell>
											<TableCell className="whitespace-nowrap">
												{docFiscal || <span className="text-muted-foreground">—</span>}
											</TableCell>
											<TableCell className="whitespace-nowrap text-sm">
												{(solicitacao as any).solicitante ?? '—'}
											</TableCell>
											<TableCell className="whitespace-nowrap text-right tabular-nums">
												{formatCurrency(parseFloat(String(solicitacao.valor)))}
											</TableCell>
											<TableCell>
												<StatusBadge status={solicitacao.status} />
											</TableCell>
											<TableCell className="text-right">
												<div className="flex gap-1.5 justify-end">
													<Button
														size="sm"
														variant="outline"
														onClick={() =>
															router.push(
																`/portal-fornecedor/solicitacoes/${solicitacao.id}/informacoes`
															)
														}>
														<Info className="w-3.5 h-3.5 mr-1" />
														Informações
													</Button>

													<Button
														size="sm"
														variant="outline"
														disabled={!podeEditarAnexos}
														onClick={() => {
															setSolicitacaoSelecionada(solicitacao);
															setModalAnexosOpen(true);
														}}>
														<Paperclip className="w-3.5 h-3.5 mr-1" />
														Anexos
													</Button>

													<Button
														size="sm"
														variant="outline"
														disabled={!podeCancelar}
														onClick={() => {
															setSolicitacaoSelecionada(solicitacao);
															setModalCancelarOpen(true);
														}}>
														<XCircle className="w-3.5 h-3.5 mr-1" />
														Cancelar
													</Button>
												</div>
											</TableCell>
										</TableRow>
									);
								})}
							</TableBody>
						</Table>
					</div>
				</Card>
			)}

			<CancelarSolicitacaoModal
				open={modalCancelarOpen}
				onClose={() => {
					setModalCancelarOpen(false);
					setSolicitacaoSelecionada(null);
				}}
				onConfirm={(motivo, dataCancelamento) => cancelarSolicitacao({ motivo, dataCancelamento })}
				isPending={isCancelando}
			/>

			{solicitacaoSelecionada && (
				<AnexosModal
					open={modalAnexosOpen}
					onClose={() => {
						setModalAnexosOpen(false);
						setSolicitacaoSelecionada(null);
					}}
					solicitacao={solicitacaoSelecionada}
					onSuccess={() => {
						queryClient.invalidateQueries({ queryKey: ['solicitacoes', empenhoId] });
					}}
				/>
			)}
		</div>
	);
}

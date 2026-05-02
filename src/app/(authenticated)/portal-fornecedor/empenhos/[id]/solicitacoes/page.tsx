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
import { FileText, Paperclip, XCircle, Info } from 'lucide-react';
import { formatCurrency } from '@/lib/formatters';
import { StatusSolicitacao } from '@/types/enums';
import { CancelarSolicitacaoModal } from '@/app/features/solicitacoes/components/CancelarSolicitacaoModal';
import { AnexosModal } from '@/app/features/solicitacoes/components/AnexosModal';
import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

export default function SolicitacoesEmpenhoPage() {
	const params = useParams();
	const router = useRouter();
	const queryClient = useQueryClient();
	const empenhoId = parseInt(params.id as string);

	const [modalCancelarOpen, setModalCancelarOpen] = useState(false);
	const [modalAnexosOpen, setModalAnexosOpen] = useState(false);
	const [solicitacaoSelecionada, setSolicitacaoSelecionada] = useState<any>(null);

	const { data: solicitacoes, isLoading } = useQuery({
		queryKey: ['solicitacoes', empenhoId],
		queryFn: () => solicitacoesApi.getSolicitacoesByEmpenho(empenhoId),
	});

	const { mutate: cancelarSolicitacao, isPending: isCancelando } = useMutation({
		mutationFn: (data: { data_cancelamento: string; motivo: string }) => {
			if (!solicitacaoSelecionada?.id) throw new Error('Nenhuma solicitação selecionada');
			return solicitacoesApi.cancelarSolicitacao(solicitacaoSelecionada.id, data);
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
							{solicitacoesList.map((solicitacao) => {
								const isPendente =
									solicitacao.status?.toLowerCase() === 'pendente' ||
									solicitacao.status === StatusSolicitacao.PENDENTE;

								const podeEditarAnexos =
									isPendente ||
									solicitacao.status?.toLowerCase() === 'anexos_recusados' ||
									solicitacao.status?.toLowerCase() === 'anexos recusados';

								return (
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
											<div className="flex gap-2 justify-end">
												<Button
													size="sm"
													variant="outline"
													onClick={() =>
														router.push(
															`/portal-fornecedor/solicitacoes/${solicitacao.id}/informacoes`
														)
													}>
													<Info className="w-4 h-4 mr-1" />
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
													<Paperclip className="w-4 h-4 mr-1" />
													Anexos
												</Button>

												<Button
													size="sm"
													variant="outline"
													disabled={!isPendente}
													onClick={() => {
														setSolicitacaoSelecionada(solicitacao);
														setModalCancelarOpen(true);
													}}>
													<XCircle className="w-4 h-4 mr-1" />
													Cancelar
												</Button>
											</div>
										</TableCell>
									</TableRow>
								);
							})}
						</TableBody>
					</Table>
				</Card>
			)}

			<CancelarSolicitacaoModal
				open={modalCancelarOpen}
				onClose={() => {
					setModalCancelarOpen(false);
					setSolicitacaoSelecionada(null);
				}}
				onConfirm={cancelarSolicitacao}
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

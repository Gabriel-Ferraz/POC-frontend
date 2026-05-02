'use client';

import { useParams, useRouter } from 'next/navigation';
import { PageHeader } from '@/components/ui/page-header';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { StatusBadge } from '@/components/ui/status-badge';
import { Loading } from '@/components/ui/loading';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { gestorApi } from '@/app/features/gestor/api/gestor-api';
import { useState } from 'react';
import { toast } from 'sonner';
import { Download, CheckCircle, XCircle, FileText } from 'lucide-react';
import { formatCurrency } from '@/lib/formatters';

export default function AvaliarAnexosPage() {
	const params = useParams();
	const router = useRouter();
	const queryClient = useQueryClient();
	const solicitacaoId = parseInt(params.id as string);

	const [anexoSelecionado, setAnexoSelecionado] = useState<number | null>(null);
	const [motivoRecusa, setMotivoRecusa] = useState('');
	const [showRecusaModal, setShowRecusaModal] = useState(false);

	const { data, isLoading } = useQuery({
		queryKey: ['solicitacao-gestor', solicitacaoId],
		queryFn: () => gestorApi.getSolicitacaoDetalhes(solicitacaoId),
	});

	const { mutate: aprovar, isPending: isAprovando } = useMutation({
		mutationFn: (anexoId: number) => gestorApi.aprovarAnexo(anexoId),
		onSuccess: () => {
			toast.success('Anexo aprovado com sucesso!');
			queryClient.invalidateQueries({ queryKey: ['solicitacao-gestor', solicitacaoId] });
			queryClient.invalidateQueries({ queryKey: ['solicitacoes-pendentes'] });
		},
		onError: (error: any) => {
			toast.error(error?.message || 'Erro ao aprovar anexo');
		},
	});

	const { mutate: recusar, isPending: isRecusando } = useMutation({
		mutationFn: ({ anexoId, motivo }: { anexoId: number; motivo: string }) =>
			gestorApi.recusarAnexo(anexoId, motivo),
		onSuccess: () => {
			toast.success('Anexo recusado com sucesso!');
			queryClient.invalidateQueries({ queryKey: ['solicitacao-gestor', solicitacaoId] });
			queryClient.invalidateQueries({ queryKey: ['solicitacoes-pendentes'] });
			setShowRecusaModal(false);
			setAnexoSelecionado(null);
			setMotivoRecusa('');
		},
		onError: (error: any) => {
			toast.error(error?.message || 'Erro ao recusar anexo');
		},
	});

	const handleRecusar = () => {
		if (!motivoRecusa.trim()) {
			toast.error('Informe o motivo da recusa');
			return;
		}

		if (anexoSelecionado) {
			recusar({ anexoId: anexoSelecionado, motivo: motivoRecusa });
		}
	};

	if (isLoading) {
		return <Loading text="Carregando solicitação..." />;
	}

	if (!data) {
		return (
			<div>
				<PageHeader title="Solicitação não encontrada" description="A solicitação solicitada não existe" />
			</div>
		);
	}

	const { solicitacao, anexos } = data;

	return (
		<div className="space-y-6">
			<PageHeader
				title={`Avaliar Anexos - ${solicitacao.numero}`}
				description={`${solicitacao.fornecedor} - ${solicitacao.solicitante}`}
			/>

			<Card>
				<div className="p-6 space-y-4">
					<h3 className="font-semibold text-lg">Dados da Solicitação</h3>

					<div className="grid grid-cols-2 gap-4">
						<div>
							<p className="text-sm text-gray-500">Fornecedor</p>
							<p className="font-medium">{solicitacao.fornecedor}</p>
							<p className="text-sm text-gray-500">CNPJ: {solicitacao.cnpj}</p>
						</div>

						<div>
							<p className="text-sm text-gray-500">Solicitante</p>
							<p className="font-medium">{solicitacao.solicitante}</p>
						</div>

						<div>
							<p className="text-sm text-gray-500">Empenho</p>
							<p className="font-medium">{solicitacao.empenho}</p>
						</div>

						<div>
							<p className="text-sm text-gray-500">Contrato</p>
							<p className="font-medium">{solicitacao.contrato}</p>
						</div>

						<div>
							<p className="text-sm text-gray-500">Documento Fiscal</p>
							<p className="font-medium">
								{solicitacao.documento_fiscal.tipo} Nº {solicitacao.documento_fiscal.numero}
								{solicitacao.documento_fiscal.serie && ` - Série ${solicitacao.documento_fiscal.serie}`}
							</p>
							<p className="text-sm text-gray-500">
								Emissão: {solicitacao.documento_fiscal.data_emissao}
							</p>
						</div>

						<div>
							<p className="text-sm text-gray-500">Valor</p>
							<p className="font-medium text-lg">{formatCurrency(solicitacao.valor)}</p>
						</div>

						<div>
							<p className="text-sm text-gray-500">Status</p>
							<StatusBadge status={solicitacao.status} />
						</div>

						<div>
							<p className="text-sm text-gray-500">Data da Solicitação</p>
							<p className="font-medium">{solicitacao.data}</p>
						</div>
					</div>
				</div>
			</Card>

			<Card>
				<div className="p-6">
					<h3 className="font-semibold text-lg mb-4">Anexos para Aprovação</h3>

					<div className="space-y-4">
						{anexos.map((anexo) => (
							<div key={anexo.id} className="border rounded-lg p-4">
								<div className="flex items-start justify-between">
									<div className="flex-1">
										<div className="flex items-center gap-3 mb-2">
											<FileText className="w-5 h-5 text-gray-400" />
											<div>
												<h4 className="font-medium">{anexo.tipo_anexo_label}</h4>
												<p className="text-sm text-gray-500">Enviado em: {anexo.data_envio}</p>
											</div>
										</div>

										<div className="flex items-center gap-3 mt-3">
											<StatusBadge status={anexo.status} />

											<a
												href={gestorApi.getDownloadUrl(anexo.id)}
												target="_blank"
												rel="noopener noreferrer">
												<Button size="sm" variant="outline">
													<Download className="w-4 h-4 mr-2" />
													Visualizar
												</Button>
											</a>
										</div>

										{anexo.motivo_recusa && (
											<div className="mt-3 p-3 bg-red-50 border border-red-200 rounded">
												<p className="text-sm font-medium text-red-800">Motivo da recusa:</p>
												<p className="text-sm text-red-700 mt-1">{anexo.motivo_recusa}</p>
												{anexo.avaliado_por && (
													<p className="text-xs text-red-600 mt-1">
														Recusado por {anexo.avaliado_por} em {anexo.avaliado_em}
													</p>
												)}
											</div>
										)}

										{anexo.status === 'aprovado' && anexo.avaliado_por && (
											<p className="text-xs text-green-600 mt-2">
												Aprovado por {anexo.avaliado_por} em {anexo.avaliado_em}
											</p>
										)}
									</div>

									{anexo.status === 'aguardando_aprovacao' && (
										<div className="flex gap-2">
											<Button
												size="sm"
												variant="outline"
												className="text-green-600 hover:bg-green-50"
												onClick={() => aprovar(anexo.id)}
												disabled={isAprovando || isRecusando}>
												<CheckCircle className="w-4 h-4 mr-1" />
												Aprovar
											</Button>
											<Button
												size="sm"
												variant="outline"
												className="text-red-600 hover:bg-red-50"
												onClick={() => {
													setAnexoSelecionado(anexo.id);
													setShowRecusaModal(true);
												}}
												disabled={isAprovando || isRecusando}>
												<XCircle className="w-4 h-4 mr-1" />
												Recusar
											</Button>
										</div>
									)}
								</div>
							</div>
						))}
					</div>

					<div className="flex justify-end mt-6 pt-6 border-t">
						<Button variant="outline" onClick={() => router.back()}>
							Voltar
						</Button>
					</div>
				</div>
			</Card>

			{/* Modal de Recusa */}
			{showRecusaModal && (
				<div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
					<Card className="w-full max-w-md mx-4">
						<div className="p-6">
							<h3 className="font-semibold text-lg mb-4">Recusar Anexo</h3>

							<div className="space-y-4">
								<div>
									<Label htmlFor="motivo">Motivo da Recusa *</Label>
									<Textarea
										id="motivo"
										placeholder="Descreva o motivo da recusa..."
										rows={4}
										value={motivoRecusa}
										onChange={(e) => setMotivoRecusa(e.target.value)}
										disabled={isRecusando}
									/>
								</div>

								<div className="flex gap-3 justify-end">
									<Button
										variant="outline"
										onClick={() => {
											setShowRecusaModal(false);
											setAnexoSelecionado(null);
											setMotivoRecusa('');
										}}
										disabled={isRecusando}>
										Cancelar
									</Button>
									<Button onClick={handleRecusar} disabled={isRecusando}>
										{isRecusando ? 'Recusando...' : 'Confirmar Recusa'}
									</Button>
								</div>
							</div>
						</div>
					</Card>
				</div>
			)}
		</div>
	);
}

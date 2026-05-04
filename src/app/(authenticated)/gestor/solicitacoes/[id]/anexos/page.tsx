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
import {
	Download,
	CheckCircle,
	XCircle,
	FileText,
	AlertTriangle,
	Minimize2,
	ClipboardCheck,
	CheckCircle2,
} from 'lucide-react';
import { formatCurrency } from '@/lib/formatters';
import { useFormMinimize } from '@/hooks/useFormMinimize';

interface FormData {
	anexoSelecionado: number | null;
	tipoAnexoSelecionado: string;
	motivoRecusa: string;
	showRecusaModal: boolean;
}

export default function AvaliarAnexosPage() {
	const params = useParams();
	const router = useRouter();
	const queryClient = useQueryClient();
	const solicitacaoId = parseInt(params.id as string);

	const [anexoSelecionado, setAnexoSelecionado] = useState<number | null>(null);
	const [tipoAnexoSelecionado, setTipoAnexoSelecionado] = useState<string>('');
	const [motivoRecusa, setMotivoRecusa] = useState('');
	const [showRecusaModal, setShowRecusaModal] = useState(false);

	const { minimizar, isMinimizado, temDadosRestaurados } = useFormMinimize<FormData>({
		titulo: `Avaliar Anexos - Sol. ${solicitacaoId}`,
		icone: <ClipboardCheck className="w-4 h-4" />,
		onRestore: (dados) => {
			setAnexoSelecionado(dados.anexoSelecionado);
			setTipoAnexoSelecionado(dados.tipoAnexoSelecionado);
			setMotivoRecusa(dados.motivoRecusa);
			setShowRecusaModal(dados.showRecusaModal);
			toast.success('Avaliação de anexos restaurada!');
		},
	});

	const handleVisualizarAnexo = async (anexoId: number) => {
		try {
			const token = localStorage.getItem('auth_token');
			const response = await fetch(
				`${process.env.NEXT_PUBLIC_API_URL}/solicitacoes/${solicitacaoId}/anexos/${anexoId}/download`,
				{
					headers: {
						Authorization: `Bearer ${token}`,
					},
				}
			);

			if (!response.ok) {
				throw new Error('Erro ao visualizar anexo');
			}

			const blob = await response.blob();
			const url = window.URL.createObjectURL(blob);
			window.open(url, '_blank');
		} catch (error: any) {
			console.error('Erro:', error);
			toast.error(error.message || 'Erro ao visualizar anexo');
		}
	};

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

		if (motivoRecusa.trim().length < 10) {
			toast.error('O motivo deve ter no mínimo 10 caracteres');
			return;
		}

		if (anexoSelecionado) {
			recusar({ anexoId: anexoSelecionado, motivo: motivoRecusa });
		}
	};

	const handleMinimizar = () => {
		const formData: FormData = {
			anexoSelecionado,
			tipoAnexoSelecionado,
			motivoRecusa,
			showRecusaModal,
		};
		minimizar(formData);
	};

	// Se está minimizado, mostra tela em branco
	if (isMinimizado) {
		return (
			<div className="flex items-center justify-center h-[60vh]">
				<div className="text-center space-y-3">
					<div className="w-16 h-16 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center mx-auto">
						<Minimize2 className="w-8 h-8 text-blue-600 dark:text-blue-400" />
					</div>
					<h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Avaliação Minimizada</h3>
					<p className="text-sm text-gray-500 dark:text-gray-400">
						Clique na miniatura na barra inferior para restaurar
					</p>
				</div>
			</div>
		);
	}

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

	// Verificar se existe Documento Fiscal recusado
	const documentoFiscalRecusado = anexos.find(
		(a) => a.tipo_anexo_label.toLowerCase().includes('documento fiscal') && a.status.toLowerCase() === 'recusado'
	);

	// Verificar se é Documento Fiscal
	const isDocumentoFiscal = (tipoAnexo: string) => {
		return tipoAnexo.toLowerCase().includes('documento fiscal');
	};

	return (
		<div className="space-y-6">
			<div className="flex items-center justify-between">
				<PageHeader
					title={`Avaliar Anexos - ${solicitacao.numero}`}
					description={`${solicitacao.fornecedor} - ${solicitacao.solicitante}`}
				/>
				<Button
					variant="outline"
					onClick={handleMinimizar}
					disabled={isAprovando || isRecusando}
					className="flex items-center gap-2">
					<Minimize2 className="w-4 h-4" />
					Minimizar
				</Button>
			</div>

			{temDadosRestaurados && (
				<div className="bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
					<p className="text-sm text-blue-900 dark:text-blue-100">
						<CheckCircle2 className="w-4 h-4 inline mr-1" /> Avaliação restaurada com os dados salvos
						anteriormente
					</p>
				</div>
			)}

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

			{/* Alerta de Documento Fiscal Recusado */}
			{documentoFiscalRecusado && (
				<Card className="bg-red-50 border-red-200">
					<div className="p-4 flex items-start gap-3">
						<AlertTriangle className="w-5 h-5 text-red-600 mt-0.5" />
						<div className="flex-1">
							<p className="font-medium text-red-900">
								Documento Fiscal recusado - Solicitação deve ser cancelada
							</p>
							<p className="text-sm text-red-700 mt-1">
								O Documento Fiscal foi recusado. O Responsável Técnico deverá{' '}
								<strong>cancelar esta solicitação</strong> e criar uma nova com o documento correto.
								Outros anexos podem ser corrigidos diretamente.
							</p>
						</div>
					</div>
				</Card>
			)}

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

											<Button
												size="sm"
												variant="outline"
												onClick={() => handleVisualizarAnexo(anexo.id)}>
												<Download className="w-4 h-4 mr-2" />
												Visualizar
											</Button>
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

									{anexo.status.toLowerCase() === 'aguardando aprovação' && (
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
													setTipoAnexoSelecionado(anexo.tipo_anexo_label);
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

							{isDocumentoFiscal(tipoAnexoSelecionado) && (
								<div className="mb-4 p-3 bg-orange-50 border border-orange-200 rounded">
									<div className="flex gap-2">
										<AlertTriangle className="w-5 h-5 text-orange-600 flex-shrink-0" />
										<div>
											<p className="text-sm font-medium text-orange-900">
												Atenção: Documento Fiscal
											</p>
											<p className="text-sm text-orange-700 mt-1">
												Ao recusar o Documento Fiscal, o Responsável Técnico deverá{' '}
												<strong>cancelar a solicitação</strong> e criar uma nova. Este tipo de
												anexo não pode ser corrigido.
											</p>
										</div>
									</div>
								</div>
							)}

							<div className="space-y-4">
								<div>
									<div className="flex items-center justify-between mb-2">
										<Label htmlFor="motivo">Motivo da Recusa *</Label>
										<span
											className={`text-sm ${
												motivoRecusa.length < 10
													? 'text-red-600'
													: motivoRecusa.length < 500
														? 'text-green-600'
														: 'text-orange-600'
											}`}>
											{motivoRecusa.length}/500 caracteres{' '}
											{motivoRecusa.length < 10 && '(mínimo 10)'}
										</span>
									</div>
									<Textarea
										id="motivo"
										placeholder="Descreva o motivo da recusa (mínimo 10 caracteres)..."
										rows={4}
										value={motivoRecusa}
										onChange={(e) => setMotivoRecusa(e.target.value)}
										disabled={isRecusando}
										maxLength={500}
										required
										className={
											motivoRecusa.length > 0 && motivoRecusa.length < 10 ? 'border-red-500' : ''
										}
									/>
								</div>

								<div className="flex gap-3 justify-end">
									<Button
										variant="outline"
										onClick={() => {
											setShowRecusaModal(false);
											setAnexoSelecionado(null);
											setTipoAnexoSelecionado('');
											setMotivoRecusa('');
										}}
										disabled={isRecusando}>
										Cancelar
									</Button>
									<Button
										onClick={handleRecusar}
										disabled={isRecusando || motivoRecusa.trim().length < 10}>
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

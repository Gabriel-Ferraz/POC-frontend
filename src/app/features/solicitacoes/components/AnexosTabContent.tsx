'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Eye, X, AlertTriangle } from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

interface Anexo {
	id: number;
	tipo_anexo: string;
	tipo_anexo_label: string;
	arquivo_path: string | null;
	arquivo_nome: string | null;
	status: string;
	data_envio: string | null;
	motivo_recusa: string | null;
	is_documento_fiscal: boolean;
	pode_reenviar: boolean;
	pode_remover: boolean;
	enviado_por: string | null;
	enviado_em: string | null;
}

interface Solicitacao {
	id: number;
	numero: string;
	status: string;
	documento_fiscal_recusado: boolean;
	anexos: Anexo[];
}

interface AnexosTabContentProps {
	solicitacaoId: number;
	onSuccess?: () => void;
	onCancelar?: () => void;
}

export function AnexosTabContent({ solicitacaoId, onSuccess, onCancelar }: AnexosTabContentProps) {
	const [solicitacaoCompleta, setSolicitacaoCompleta] = useState<Solicitacao | null>(null);
	const [loading, setLoading] = useState(true);
	const [uploading, setUploading] = useState<number | null>(null);
	const [anexoExpandidoId, setAnexoExpandidoId] = useState<number | null>(null);

	// Define o primeiro anexo como expandido ao carregar
	useEffect(() => {
		if (solicitacaoCompleta?.anexos && solicitacaoCompleta.anexos.length > 0 && anexoExpandidoId === null) {
			setAnexoExpandidoId(solicitacaoCompleta.anexos[0].id);
		}
	}, [solicitacaoCompleta, anexoExpandidoId]);

	// 1. LISTAR ANEXOS
	const carregarAnexos = async () => {
		if (!solicitacaoId) return;

		try {
			setLoading(true);
			const token = localStorage.getItem('auth_token');
			const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/solicitacoes/${solicitacaoId}/anexos`, {
				headers: {
					Authorization: `Bearer ${token}`,
				},
			});

			if (!response.ok) throw new Error('Erro ao carregar anexos');

			const data = await response.json();
			setSolicitacaoCompleta(data.solicitacao);
		} catch (error) {
			console.error('Erro:', error);
			toast.error('Erro ao carregar anexos');
		} finally {
			setLoading(false);
		}
	};

	useEffect(() => {
		carregarAnexos();
	}, [solicitacaoId]);

	// 2. UPLOAD DE ARQUIVO
	const handleUpload = async (anexoId: number, file: File) => {
		// Validar tamanho (10MB)
		if (file.size > 10 * 1024 * 1024) {
			toast.error('O arquivo não pode ser maior que 10MB');
			return;
		}

		// Validar tipo
		if (file.type !== 'application/pdf') {
			toast.error('Apenas arquivos PDF são permitidos');
			return;
		}

		setUploading(anexoId);

		try {
			const token = localStorage.getItem('auth_token');
			const formData = new FormData();
			formData.append('arquivo', file);

			const response = await fetch(
				`${process.env.NEXT_PUBLIC_API_URL}/solicitacoes/${solicitacaoId}/anexos/${anexoId}/upload`,
				{
					method: 'POST',
					headers: {
						Authorization: `Bearer ${token}`,
					},
					body: formData,
				}
			);

			const data = await response.json();

			if (!response.ok) {
				throw new Error(data.message || 'Erro ao enviar anexo');
			}

			toast.success('Anexo enviado com sucesso!');
			carregarAnexos(); // Recarregar lista
		} catch (error: any) {
			console.error('Erro:', error);
			toast.error(error.message || 'Erro ao enviar anexo');
		} finally {
			setUploading(null);
		}
	};

	// 3. REMOVER ARQUIVO
	const handleRemover = async (anexoId: number) => {
		try {
			const token = localStorage.getItem('auth_token');
			const response = await fetch(
				`${process.env.NEXT_PUBLIC_API_URL}/solicitacoes/${solicitacaoId}/anexos/${anexoId}`,
				{
					method: 'DELETE',
					headers: {
						Authorization: `Bearer ${token}`,
					},
				}
			);

			const data = await response.json();

			if (!response.ok) {
				throw new Error(data.message || 'Erro ao remover anexo');
			}

			toast.success('Anexo removido com sucesso!');
			carregarAnexos();
		} catch (error: any) {
			console.error('Erro:', error);
			toast.error(error.message || 'Erro ao remover anexo');
		}
	};

	// 4. ENVIAR TODOS PARA APROVAÇÃO
	const handleEnviarTodos = async () => {
		try {
			const token = localStorage.getItem('auth_token');
			const response = await fetch(
				`${process.env.NEXT_PUBLIC_API_URL}/solicitacoes/${solicitacaoId}/anexos/enviar-todos`,
				{
					method: 'POST',
					headers: {
						Authorization: `Bearer ${token}`,
					},
				}
			);

			const data = await response.json();

			if (!response.ok) {
				throw new Error(data.message || 'Erro ao enviar anexos');
			}

			toast.success('Anexos enviados para aprovação com sucesso!');
			onSuccess?.();
			carregarAnexos();
		} catch (error: any) {
			console.error('Erro:', error);
			toast.error(error.message || 'Erro ao enviar anexos');
		}
	};

	// 5. VISUALIZAR/DOWNLOAD ANEXO
	const handleVisualizar = async (anexoId: number) => {
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

	if (loading) {
		return <div className="py-8 text-center text-muted-foreground">Carregando anexos...</div>;
	}

	// Verificar se todos os anexos têm arquivo
	const todosEnviados = solicitacaoCompleta?.anexos.every((a) => a.arquivo_path !== null) ?? false;

	const anexos = solicitacaoCompleta?.anexos || [];

	// Usar flag do backend
	const documentoFiscalRecusado = solicitacaoCompleta?.documento_fiscal_recusado ?? false;

	// Verificar se pode enviar anexos baseado no status
	const podeEnviarAnexos =
		solicitacaoCompleta?.status?.toLowerCase() === 'pendente' ||
		solicitacaoCompleta?.status?.toLowerCase() === 'anexos_recusados' ||
		solicitacaoCompleta?.status?.toLowerCase() === 'anexos recusados';

	return (
		<div className="space-y-4">
			{documentoFiscalRecusado && (
				<div className="p-4 bg-red-50 dark:bg-red-950/30 border-2 border-red-500 dark:border-red-600 rounded-lg">
					<div className="flex items-start gap-3 mb-3">
						<AlertTriangle className="w-6 h-6 text-red-600 dark:text-red-500 flex-shrink-0 mt-0.5" />
						<div>
							<p className="font-bold text-red-800 dark:text-red-400 text-lg">
								⚠️ ATENÇÃO: Documento Fiscal foi recusado!
							</p>
							<p className="text-red-700 dark:text-red-400 mt-2">
								Não é possível corrigir o Documento Fiscal. Você deve:
							</p>
							<ol className="list-decimal list-inside text-red-700 dark:text-red-400 mt-2 space-y-1">
								<li>Cancelar esta solicitação</li>
								<li>Criar uma nova solicitação com o documento correto</li>
							</ol>
						</div>
					</div>
					<Button variant="destructive" className="w-full bg-red-600 hover:bg-red-700" onClick={onCancelar}>
						Cancelar esta Solicitação
					</Button>
				</div>
			)}

			{anexos.length === 0 ? (
				<p className="text-center text-muted-foreground py-8">Nenhum anexo cadastrado para esta solicitação</p>
			) : (
				<>
					{anexos.map((anexo) => {
						const isExpandido = anexoExpandidoId === anexo.id;
						const temArquivo = !!anexo.arquivo_path;

						return (
							<div key={anexo.id} className="border dark:border-gray-700 rounded-lg overflow-hidden">
								{/* CABEÇALHO DO ANEXO */}
								<div
									className={cn(
										'px-4 py-3 cursor-pointer transition-colors',
										isExpandido
											? 'bg-blue-600 text-white'
											: 'bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700'
									)}
									onClick={() => setAnexoExpandidoId(anexo.id)}>
									<div className="flex items-center justify-between mb-2">
										<div className="flex items-center gap-3">
											{!temArquivo && !isExpandido && (
												<AlertTriangle className="w-5 h-5 text-yellow-500" />
											)}
											<div>
												<h4 className="font-medium">{anexo.tipo_anexo_label}</h4>
												{anexo.is_documento_fiscal && (
													<span
														className={cn(
															'text-xs px-2 py-0.5 rounded mt-1 inline-block',
															isExpandido
																? 'bg-orange-200 text-orange-900'
																: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200'
														)}>
														DOCUMENTO FISCAL
													</span>
												)}
											</div>
										</div>
										{temArquivo && !isExpandido && (
											<div className="flex gap-2">
												<Button
													size="sm"
													variant="ghost"
													className="dark:hover:bg-gray-600"
													onClick={(e) => {
														e.stopPropagation();
														handleVisualizar(anexo.id);
													}}>
													<Eye className="w-4 h-4" />
												</Button>
												{anexo.pode_remover && (
													<Button
														size="sm"
														variant="ghost"
														className="dark:hover:bg-gray-600"
														onClick={(e) => {
															e.stopPropagation();
															handleRemover(anexo.id);
														}}>
														<X className="w-4 h-4" />
													</Button>
												)}
											</div>
										)}
									</div>
									{/* Informações adicionais visíveis quando colapsado */}
									{!isExpandido && temArquivo && (anexo.enviado_por || anexo.enviado_em) && (
										<div className="text-xs text-gray-600 dark:text-gray-400 space-y-0.5">
											{anexo.enviado_por && (
												<p>
													Enviado por:{' '}
													<span className="font-medium">{anexo.enviado_por}</span>
												</p>
											)}
											{anexo.enviado_em && (
												<p>
													Em: <span className="font-medium">{anexo.enviado_em}</span>
												</p>
											)}
										</div>
									)}
								</div>

								{/* CONTEÚDO EXPANDIDO */}
								{isExpandido && (
									<div className="p-4 min-h-[200px] bg-white dark:bg-card">
										{anexo.motivo_recusa && (
											<div className="mb-3 p-3 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 rounded">
												<p className="text-sm font-medium text-red-800 dark:text-red-400">
													Motivo da recusa:
												</p>
												<p className="text-sm text-red-700 dark:text-red-300 mt-1">
													{anexo.motivo_recusa}
												</p>
											</div>
										)}

										{temArquivo ? (
											<div className="space-y-3">
												<div className="p-3 bg-muted dark:bg-gray-800 rounded border dark:border-gray-700">
													<div className="flex items-center justify-between mb-2">
														<span className="text-sm font-medium dark:text-foreground">
															{anexo.arquivo_nome}
														</span>
														<div className="flex gap-2">
															<Button
																size="sm"
																variant="ghost"
																onClick={() => handleVisualizar(anexo.id)}>
																<Eye className="w-4 h-4" />
															</Button>
															{anexo.pode_remover && (
																<Button
																	size="sm"
																	variant="ghost"
																	onClick={() => handleRemover(anexo.id)}>
																	<X className="w-4 h-4" />
																</Button>
															)}
														</div>
													</div>
													<div className="space-y-1">
														<p className="text-xs text-muted-foreground">
															Status: {anexo.status}
														</p>
														{anexo.enviado_por && (
															<p className="text-xs text-muted-foreground">
																Enviado por:{' '}
																<span className="font-medium text-foreground">
																	{anexo.enviado_por}
																</span>
															</p>
														)}
														{anexo.enviado_em && (
															<p className="text-xs text-muted-foreground">
																Em:{' '}
																<span className="font-medium text-foreground">
																	{anexo.enviado_em}
																</span>
															</p>
														)}
													</div>
												</div>

												{/* Botão de substituir/upload */}
												{anexo.pode_reenviar && (
													<label className="block">
														<Button
															variant="outline"
															className="w-full"
															disabled={uploading === anexo.id}
															asChild>
															<span>
																{uploading === anexo.id
																	? 'Enviando...'
																	: 'Substituir Arquivo'}
															</span>
														</Button>
														<input
															type="file"
															accept=".pdf"
															className="hidden"
															disabled={uploading === anexo.id}
															onChange={(e) => {
																const file = e.target.files?.[0];
																if (file) handleUpload(anexo.id, file);
															}}
														/>
													</label>
												)}

												{/* Indicador de bloqueio */}
												{!anexo.pode_reenviar && !temArquivo && (
													<div className="p-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded text-center">
														<p className="text-sm text-gray-600 dark:text-gray-400">
															🔒 Bloqueado
														</p>
													</div>
												)}

												{/* Status aprovado */}
												{anexo.status === 'Aprovado' && (
													<div className="p-3 bg-green-50 dark:bg-green-950/30 border border-green-200 dark:border-green-800 rounded text-center">
														<p className="text-sm text-green-700 dark:text-green-400 font-medium">
															✅ Aprovado
														</p>
													</div>
												)}
											</div>
										) : anexo.pode_reenviar ? (
											<div className="text-center py-8">
												<label>
													<Button disabled={uploading === anexo.id} asChild>
														<span>
															{uploading === anexo.id
																? 'Enviando...'
																: 'Procurar Arquivo'}
														</span>
													</Button>
													<input
														type="file"
														accept=".pdf"
														className="hidden"
														disabled={uploading === anexo.id}
														onChange={(e) => {
															const file = e.target.files?.[0];
															if (file) handleUpload(anexo.id, file);
														}}
													/>
												</label>
												<p className="text-xs text-muted-foreground mt-2">
													Apenas arquivos PDF (máximo 10MB)
												</p>
											</div>
										) : (
											<div className="text-center py-8">
												<p className="text-sm text-gray-600 dark:text-gray-400 font-medium mb-2">
													🔒 Envio bloqueado
												</p>
												<p className="text-xs text-gray-500 dark:text-gray-500">
													Este anexo está bloqueado para envio
												</p>
											</div>
										)}
									</div>
								)}
							</div>
						);
					})}
				</>
			)}

			{todosEnviados && !documentoFiscalRecusado && podeEnviarAnexos && anexos.length > 0 && (
				<div className="flex justify-end pt-4 border-t dark:border-gray-700">
					<Button onClick={handleEnviarTodos}>Enviar Todos para Aprovação</Button>
				</div>
			)}

			{!todosEnviados && !documentoFiscalRecusado && podeEnviarAnexos && anexos.length > 0 && (
				<p className="text-xs text-muted-foreground text-center pt-2">
					* Envie todos os anexos para habilitar o botão de aprovação
				</p>
			)}

			{!podeEnviarAnexos && !documentoFiscalRecusado && anexos.length > 0 && (
				<p className="text-xs text-orange-600 dark:text-orange-400 text-center pt-2">
					⚠️ Anexos não podem ser enviados neste status
				</p>
			)}
		</div>
	);
}

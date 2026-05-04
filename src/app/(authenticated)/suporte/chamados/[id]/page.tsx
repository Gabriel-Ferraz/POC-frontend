'use client';

import { useParams } from 'next/navigation';
import { PageHeader } from '@/components/ui/page-header';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Loading } from '@/components/ui/loading';
import { StatusBadge } from '@/components/ui/status-badge';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { suporteApi } from '@/app/features/suporte/api/suporte-api';
import { toast } from 'sonner';
import { useState } from 'react';
import { Upload, X, FileText, Eye, Send, MessageSquare, User, Clock, Paperclip, Lock, Lightbulb } from 'lucide-react';

export default function ChamadoDetalhePage() {
	const params = useParams();
	const chamadoId = parseInt(params.id as string);
	const queryClient = useQueryClient();

	const [novaMensagem, setNovaMensagem] = useState('');
	const [anexosNovaMensagem, setAnexosNovaMensagem] = useState<File[]>([]);

	const { data, isLoading, error } = useQuery({
		queryKey: ['chamado', chamadoId],
		queryFn: () => suporteApi.getChamado(chamadoId),
	});

	const { mutate: enviarResposta, isPending: isEnviando } = useMutation({
		mutationFn: () => suporteApi.responderChamado(chamadoId, novaMensagem, anexosNovaMensagem),
		onSuccess: () => {
			toast.success('Resposta enviada com sucesso!');
			setNovaMensagem('');
			setAnexosNovaMensagem([]);
			queryClient.invalidateQueries({ queryKey: ['chamado', chamadoId] });
		},
		onError: (error: any) => {
			toast.error(error?.message || 'Erro ao enviar resposta');
		},
	});

	const handleDownloadAnexo = async (arquivoPath: string, nome: string) => {
		try {
			await suporteApi.downloadAnexo(arquivoPath, nome);
		} catch (error) {
			toast.error('Erro ao baixar anexo');
			console.error('Erro ao baixar anexo:', error);
		}
	};

	const handleAdicionarAnexos = (e: React.ChangeEvent<HTMLInputElement>) => {
		const files = Array.from(e.target.files || []);
		if (files.length === 0) return;

		const arquivosGrandes = files.filter((f) => f.size > 10 * 1024 * 1024);
		if (arquivosGrandes.length > 0) {
			toast.error('Alguns arquivos excedem o tamanho máximo de 10MB');
			return;
		}

		setAnexosNovaMensagem([...anexosNovaMensagem, ...files]);
		toast.success(`${files.length} arquivo(s) adicionado(s)`);
		e.target.value = '';
	};

	const handleRemoverAnexo = (index: number) => {
		const novosAnexos = anexosNovaMensagem.filter((_, i) => i !== index);
		setAnexosNovaMensagem(novosAnexos);
		toast.success('Anexo removido');
	};

	const handleVisualizarAnexo = (file: File) => {
		const url = URL.createObjectURL(file);
		window.open(url, '_blank');
	};

	const handleEnviarResposta = () => {
		if (!novaMensagem.trim()) {
			toast.error('Digite uma mensagem');
			return;
		}

		enviarResposta();
	};

	if (isLoading) {
		return <Loading text="Carregando chamado..." />;
	}

	// Erro 403 - Sem permissão
	if (error && (error as any)?.status === 403) {
		return (
			<div>
				<PageHeader title="Acesso Negado" description="Você não tem permissão para visualizar este chamado" />
				<Card>
					<div className="p-8 text-center text-red-500">
						<p className="text-lg font-medium mb-2">
							<Lock className="w-5 h-5 inline mr-1" /> Acesso Negado
						</p>
						<p className="text-sm">Você não tem permissão para visualizar este chamado.</p>
						<p className="text-sm mt-2">
							Apenas o criador do chamado ou gestores de suporte podem visualizá-lo.
						</p>
					</div>
				</Card>
			</div>
		);
	}

	if (!data || !data.chamado) {
		return (
			<div>
				<PageHeader title="Chamado não encontrado" description="O chamado solicitado não existe" />
			</div>
		);
	}

	const chamado = data.chamado;
	const timeline = data.timeline || [];

	return (
		<div className="space-y-6">
			<PageHeader title={`Chamado #${chamado.id}`} description={chamado.assunto} />

			<Card>
				<div className="p-6 space-y-4">
					<div className="flex items-start justify-between">
						<div>
							<p className="text-sm text-gray-500">Módulo</p>
							<p className="font-medium">{chamado.modulo}</p>
						</div>

						<StatusBadge status={chamado.status} />
					</div>

					<div className="grid grid-cols-3 gap-4">
						<div>
							<p className="text-sm text-gray-500">Data de Abertura</p>
							<p className="font-medium">{chamado.data_cadastro}</p>
						</div>

						{chamado.data_ultima_resposta && (
							<div>
								<p className="text-sm text-gray-500">Data da Última Resposta</p>
								<p className="font-medium">{chamado.data_ultima_resposta}</p>
							</div>
						)}

						{chamado.data_conclusao && (
							<div>
								<p className="text-sm text-gray-500">Data de Conclusão</p>
								<p className="font-medium">{chamado.data_conclusao}</p>
							</div>
						)}
					</div>

					<div>
						<p className="text-sm text-gray-500">Usuário</p>
						<p className="font-medium">{chamado.usuario}</p>
					</div>
				</div>
			</Card>

			{timeline.length > 0 && (
				<Card>
					<div className="p-6">
						<h3 className="font-semibold mb-4">Timeline do Chamado</h3>
						<div className="space-y-4">
							{timeline.map((item: any, index: number) => (
								<div
									key={index}
									className={`border-l-4 pl-4 ${
										item.tipo === 'abertura'
											? 'border-blue-500'
											: item.tipo === 'resposta'
												? 'border-green-500'
												: 'border-gray-300'
									}`}>
									<div className="flex items-center gap-2 mb-1">
										<span
											className={`text-xs font-semibold uppercase px-2 py-1 rounded ${
												item.tipo === 'abertura'
													? 'bg-blue-100 text-blue-800'
													: item.tipo === 'resposta'
														? 'bg-green-100 text-green-800'
														: 'bg-gray-100 text-gray-800'
											}`}>
											{item.tipo}
										</span>
										<span className="text-sm text-gray-500">{item.data}</span>
									</div>
									<p className="text-sm font-medium text-gray-700 mb-1">{item.usuario}</p>
									<p className="text-sm text-gray-600">{item.mensagem}</p>

									{item.anexos && item.anexos.length > 0 && (
										<div className="mt-2">
											<p className="text-xs text-gray-500 mb-1">Anexos:</p>
											<div className="flex gap-2">
												{item.anexos.map((anexo: any, i: number) => {
													// Backend retorna arquivo_path com o path completo já (ex: /api/chamados/anexos/1/download)
													const arquivoPath =
														anexo.arquivo_path ||
														anexo.url ||
														`/api/chamados/anexos/${anexo.id}/download`;
													return (
														<button
															key={i}
															type="button"
															onClick={() => handleDownloadAnexo(arquivoPath, anexo.nome)}
															className="text-xs text-blue-600 hover:underline flex items-center gap-1">
															📎 {anexo.nome} ({anexo.tamanho})
														</button>
													);
												})}
											</div>
										</div>
									)}
								</div>
							))}
						</div>
					</div>
				</Card>
			)}

			{/* Formulário para enviar nova mensagem */}
			<Card className="border-2 border-blue-200 dark:border-blue-800">
				<div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950 dark:to-indigo-950 px-6 py-4 border-b border-blue-200 dark:border-blue-800">
					<div className="flex items-center gap-3">
						<div className="p-2 bg-blue-500 rounded-lg">
							<MessageSquare className="w-5 h-5 text-white" />
						</div>
						<div>
							<h3 className="font-semibold text-lg text-gray-900 dark:text-gray-100">Atendimento</h3>
							<p className="text-sm text-gray-600 dark:text-gray-400">
								Envie sua mensagem para continuar o atendimento
							</p>
						</div>
					</div>
				</div>

				<div className="p-6 space-y-5">
					<div className="relative">
						<Label htmlFor="nova-mensagem" className="text-base font-medium flex items-center gap-2">
							<MessageSquare className="w-4 h-4" />
							Sua mensagem
						</Label>
						<Textarea
							id="nova-mensagem"
							placeholder="Descreva sua dúvida, problema ou forneça mais informações..."
							rows={5}
							value={novaMensagem}
							onChange={(e) => setNovaMensagem(e.target.value)}
							disabled={isEnviando}
							className="mt-2 resize-none border-2 focus:border-blue-500 dark:focus:border-blue-400"
						/>
						<div className="absolute bottom-3 right-3 text-xs text-gray-400">
							{novaMensagem.length} caracteres
						</div>
					</div>

					{/* Anexos */}
					<div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
						<Label className="text-base font-medium flex items-center gap-2">
							<Paperclip className="w-4 h-4" />
							Anexos
							<span className="text-xs font-normal text-gray-500">(Opcional)</span>
						</Label>
						<div className="mt-3 space-y-3">
							<div>
								<input
									type="file"
									id="file-input-resposta"
									multiple
									className="hidden"
									onChange={handleAdicionarAnexos}
									disabled={isEnviando}
									accept=".pdf,.doc,.docx,.xls,.xlsx,.png,.jpg,.jpeg,.gif"
								/>
								<Button
									type="button"
									variant="outline"
									onClick={() => document.getElementById('file-input-resposta')?.click()}
									disabled={isEnviando}
									className="w-full border-dashed border-2 h-12 hover:bg-blue-50 dark:hover:bg-blue-950 hover:border-blue-400">
									<Upload className="w-4 h-4 mr-2" />
									<span className="font-medium">Adicionar arquivos</span>
								</Button>
								<p className="text-xs text-gray-500 mt-2 text-center">
									PDF, DOC, XLS, PNG, JPG - Máximo 10MB por arquivo
								</p>
							</div>

							{anexosNovaMensagem.length > 0 && (
								<div className="bg-white dark:bg-gray-800 border-2 border-blue-200 dark:border-blue-700 rounded-lg p-3">
									<div className="flex items-center justify-between mb-3">
										<p className="text-sm font-semibold text-blue-700 dark:text-blue-300 flex items-center gap-2">
											<Paperclip className="w-4 h-4" />
											{anexosNovaMensagem.length} arquivo
											{anexosNovaMensagem.length > 1 ? 's' : ''} anexado
											{anexosNovaMensagem.length > 1 ? 's' : ''}
										</p>
									</div>
									<div className="space-y-2">
										{anexosNovaMensagem.map((file, index) => (
											<div
												key={index}
												className="flex items-center justify-between p-3 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950 dark:to-indigo-950 rounded-lg border border-blue-200 dark:border-blue-800 hover:shadow-md transition-shadow">
												<div className="flex items-center gap-3 flex-1 min-w-0">
													<div className="p-2 bg-blue-500 rounded-lg flex-shrink-0">
														<FileText className="w-4 h-4 text-white" />
													</div>
													<div className="flex-1 min-w-0">
														<p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
															{file.name}
														</p>
														<p className="text-xs text-gray-500">
															{(file.size / 1024).toFixed(1)} KB
														</p>
													</div>
												</div>
												<div className="flex gap-1 ml-2">
													<Button
														type="button"
														variant="ghost"
														size="sm"
														onClick={() => handleVisualizarAnexo(file)}
														disabled={isEnviando}
														className="h-8 w-8 p-0">
														<Eye className="w-4 h-4 text-blue-600" />
													</Button>
													<Button
														type="button"
														variant="ghost"
														size="sm"
														onClick={() => handleRemoverAnexo(index)}
														disabled={isEnviando}
														className="h-8 w-8 p-0 hover:bg-red-50 dark:hover:bg-red-950">
														<X className="w-4 h-4 text-red-500" />
													</Button>
												</div>
											</div>
										))}
									</div>
								</div>
							)}
						</div>
					</div>

					<div className="flex items-center justify-between pt-4 border-t border-gray-200 dark:border-gray-700">
						<p className="text-sm text-gray-500">
							<span className="font-medium">
								<Lightbulb className="w-4 h-4 inline mr-1" /> Dica:
							</span>{' '}
							Seja claro e objetivo em sua mensagem
						</p>
						<Button
							onClick={handleEnviarResposta}
							disabled={isEnviando || !novaMensagem.trim()}
							size="lg"
							className="bg-blue-600 hover:bg-blue-700 text-white shadow-lg hover:shadow-xl transition-all">
							{isEnviando ? (
								<>
									<div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2"></div>
									Enviando...
								</>
							) : (
								<>
									<Send className="w-4 h-4 mr-2" />
									Enviar Resposta
								</>
							)}
						</Button>
					</div>
				</div>
			</Card>
		</div>
	);
}

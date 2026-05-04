'use client';

import { useParams, useRouter } from 'next/navigation';
import { PageHeader } from '@/components/ui/page-header';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loading } from '@/components/ui/loading';
import { StatusBadge } from '@/components/ui/status-badge';
import { useQuery } from '@tanstack/react-query';
import { suporteApi } from '@/app/features/suporte/api/suporte-api';
import { toast } from 'sonner';
import { ArrowLeft, Clock, User, Monitor, Globe, Wifi, Lock, ClipboardList } from 'lucide-react';

export default function ChamadoInfoPage() {
	const params = useParams();
	const router = useRouter();
	const chamadoId = parseInt(params.id as string);

	const { data, isLoading, error } = useQuery({
		queryKey: ['chamado', chamadoId],
		queryFn: () => suporteApi.getChamado(chamadoId),
	});

	const handleDownloadAnexo = async (arquivoPath: string, nome: string) => {
		try {
			await suporteApi.downloadAnexo(arquivoPath, nome);
		} catch (error) {
			toast.error('Erro ao baixar anexo');
			console.error('Erro ao baixar anexo:', error);
		}
	};

	if (isLoading) {
		return <Loading text="Carregando informações..." />;
	}

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
	const logSistema = data.log_sistema || {};

	return (
		<div className="space-y-6">
			<PageHeader
				title={`Informações - Chamado ${chamado.protocolo}`}
				description="Visualização completa de logs, anexos e informações do sistema"
				action={
					<Button variant="outline" onClick={() => router.push(`/suporte/chamados/${chamadoId}`)}>
						<ArrowLeft className="w-4 h-4 mr-2" />
						Voltar para Atendimento
					</Button>
				}
			/>

			{/* Card de Resumo */}
			<Card>
				<div className="p-6 space-y-4">
					<div className="flex items-start justify-between">
						<div>
							<h3 className="text-lg font-semibold mb-2">{chamado.assunto}</h3>
							<p className="text-sm text-gray-500">Módulo: {chamado.modulo}</p>
						</div>
						<StatusBadge status={chamado.status} />
					</div>

					<div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 border-t">
						<div>
							<p className="text-sm text-gray-500 mb-1">
								<User className="w-3 h-3 inline mr-1" />
								Usuário
							</p>
							<p className="font-medium">{chamado.usuario}</p>
						</div>
						<div>
							<p className="text-sm text-gray-500 mb-1">
								<Clock className="w-3 h-3 inline mr-1" />
								Data de Abertura
							</p>
							<p className="font-medium">{chamado.data_cadastro}</p>
						</div>
						{chamado.data_ultima_resposta && (
							<div>
								<p className="text-sm text-gray-500 mb-1">
									<Clock className="w-3 h-3 inline mr-1" />
									Última Resposta
								</p>
								<p className="font-medium">{chamado.data_ultima_resposta}</p>
							</div>
						)}
					</div>
				</div>
			</Card>

			{/* Timeline de Mensagens */}
			{timeline.length > 0 && (
				<Card>
					<div className="p-6">
						<h3 className="font-semibold text-lg mb-4">
							<ClipboardList className="w-5 h-5 inline mr-1" /> Histórico de Atendimento
						</h3>
						<div className="space-y-4">
							{timeline.map((item: any, index: number) => (
								<div
									key={index}
									className={`border-l-4 pl-4 py-3 rounded-r-lg ${
										item.tipo === 'abertura'
											? 'border-blue-500 bg-blue-50 dark:bg-blue-950'
											: item.tipo === 'resposta'
												? 'border-green-500 bg-green-50 dark:bg-green-950'
												: 'border-gray-300 bg-gray-50 dark:bg-gray-900'
									}`}>
									<div className="flex items-center gap-2 mb-2">
										<span
											className={`text-xs font-semibold uppercase px-2 py-1 rounded ${
												item.tipo === 'abertura'
													? 'bg-blue-200 text-blue-900 dark:bg-blue-800 dark:text-blue-100'
													: item.tipo === 'resposta'
														? 'bg-green-200 text-green-900 dark:bg-green-800 dark:text-green-100'
														: 'bg-gray-200 text-gray-900 dark:bg-gray-700 dark:text-gray-100'
											}`}>
											{item.tipo}
										</span>
										<span className="text-sm text-gray-600 dark:text-gray-400">{item.data}</span>
									</div>
									<p className="text-sm font-medium text-gray-800 dark:text-gray-200 mb-1">
										👤 {item.usuario}
									</p>
									<p className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
										{item.mensagem}
									</p>

									{item.anexos && item.anexos.length > 0 && (
										<div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
											<p className="text-xs text-gray-600 dark:text-gray-400 mb-2 font-medium">
												📎 Anexos ({item.anexos.length}):
											</p>
											<div className="flex flex-wrap gap-2">
												{item.anexos.map((anexo: any, i: number) => {
													const arquivoPath =
														anexo.arquivo_path ||
														anexo.url ||
														`/api/chamados/anexos/${anexo.id}/download`;
													return (
														<button
															key={i}
															type="button"
															onClick={() => handleDownloadAnexo(arquivoPath, anexo.nome)}
															className="text-xs px-3 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors flex items-center gap-2">
															<span>📄</span>
															<span className="font-medium">{anexo.nome}</span>
															<span className="text-gray-500">({anexo.tamanho})</span>
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

			{/* Log do Sistema */}
			<Card>
				<div className="p-6">
					<h3 className="font-semibold text-lg mb-4">🖥️ Informações do Sistema</h3>
					<p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
						Dados coletados no momento da abertura do chamado
					</p>

					<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
						<div className="p-4 bg-gray-50 dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700">
							<div className="flex items-center gap-2 mb-2">
								<Monitor className="w-4 h-4 text-blue-600" />
								<p className="text-sm font-semibold text-gray-700 dark:text-gray-300">Navegador</p>
							</div>
							<p className="text-sm text-gray-600 dark:text-gray-400">
								{logSistema.navegador || 'Não disponível'}
							</p>
						</div>

						<div className="p-4 bg-gray-50 dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700">
							<div className="flex items-center gap-2 mb-2">
								<Globe className="w-4 h-4 text-green-600" />
								<p className="text-sm font-semibold text-gray-700 dark:text-gray-300">
									Sistema Operacional
								</p>
							</div>
							<p className="text-sm text-gray-600 dark:text-gray-400">
								{logSistema.sistema_operacional || 'Não disponível'}
							</p>
						</div>

						<div className="p-4 bg-gray-50 dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700">
							<div className="flex items-center gap-2 mb-2">
								<Wifi className="w-4 h-4 text-purple-600" />
								<p className="text-sm font-semibold text-gray-700 dark:text-gray-300">Endereço IP</p>
							</div>
							<p className="text-sm text-gray-600 dark:text-gray-400 font-mono">
								{logSistema.ip || 'Não disponível'}
							</p>
						</div>

						<div className="p-4 bg-gray-50 dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700">
							<div className="flex items-center gap-2 mb-2">
								<Clock className="w-4 h-4 text-orange-600" />
								<p className="text-sm font-semibold text-gray-700 dark:text-gray-300">
									Data/Hora do Acesso
								</p>
							</div>
							<p className="text-sm text-gray-600 dark:text-gray-400">
								{logSistema.data_hora_acesso || 'Não disponível'}
							</p>
						</div>
					</div>

					{logSistema.user_agent && (
						<div className="mt-4 p-4 bg-gray-50 dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700">
							<p className="text-xs font-semibold text-gray-700 dark:text-gray-300 mb-2">User Agent:</p>
							<p className="text-xs text-gray-600 dark:text-gray-400 font-mono break-all">
								{logSistema.user_agent}
							</p>
						</div>
					)}
				</div>
			</Card>
		</div>
	);
}

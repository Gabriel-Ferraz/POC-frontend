'use client';

import { useParams, useRouter } from 'next/navigation';
import { PageHeader } from '@/components/ui/page-header';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loading } from '@/components/ui/loading';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { solicitacoesApi } from '@/app/features/solicitacoes/api/solicitacoes-api';
import { formatCurrency } from '@/lib/formatters';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ArrowLeft, CheckCircle2, Clock, Circle, Minimize2, Info, Check } from 'lucide-react';
import { cn } from '@/lib/utils';
import { AnexosTabContent } from '@/app/features/solicitacoes/components/AnexosTabContent';
import { CancelarSolicitacaoModal } from '@/app/features/solicitacoes/components/CancelarSolicitacaoModal';
import { useState } from 'react';
import { toast } from 'sonner';
import { useFormMinimize } from '@/hooks/useFormMinimize';

// Etapas do fluxo
const ETAPAS_FLUXO = [
	{ key: 'solicitacao_pagamento', label: 'Solicitação de Pagamento' },
	{ key: 'anexos', label: 'Anexos' },
	{ key: 'fiscal', label: 'Fiscal' },
	{ key: 'gestor', label: 'Gestor' },
	{ key: 'liquidacao', label: 'Liquidação' },
	{ key: 'secretario', label: 'Secretário(a)' },
	{ key: 'iss', label: 'ISS' },
	{ key: 'ordem_pagamento', label: 'Ordem de Pagamento' },
	{ key: 'autorizacao', label: 'Autorização' },
	{ key: 'bordero', label: 'Borderô' },
	{ key: 'remessa', label: 'Remessa' },
	{ key: 'pagamento', label: 'Pagamento' },
	{ key: 'pagamento_realizado', label: 'Pagamento Realizado' },
];

type StatusEtapa = 'concluido' | 'em_andamento' | 'pendente';

interface EtapaAndamento {
	key: string;
	label: string;
	status: StatusEtapa;
}

interface FormData {
	modalCancelarAberto: boolean;
	abaAtiva: string;
}

export default function InformacoesSolicitacaoPage() {
	const params = useParams();
	const router = useRouter();
	const queryClient = useQueryClient();
	const solicitacaoId = parseInt(params.id as string);
	const [modalCancelarAberto, setModalCancelarAberto] = useState(false);
	const [abaAtiva, setAbaAtiva] = useState('geral');

	const { minimizar, isMinimizado, temDadosRestaurados } = useFormMinimize<FormData>({
		titulo: `Informações - Sol. ${solicitacaoId}`,
		icone: <Info className="w-4 h-4" />,
		onRestore: (dados) => {
			setModalCancelarAberto(dados.modalCancelarAberto);
			setAbaAtiva(dados.abaAtiva);
			toast.success('Informações da solicitação restauradas!');
		},
	});

	const { data: solicitacao, isLoading } = useQuery({
		queryKey: ['solicitacao-info', solicitacaoId],
		queryFn: () => solicitacoesApi.getSolicitacao(solicitacaoId),
	});

	const { mutate: cancelar, isPending: isCancelando } = useMutation({
		mutationFn: (motivo: string) =>
			solicitacoesApi.cancelarSolicitacao(solicitacaoId, {
				data_cancelamento: new Date().toISOString().split('T')[0],
				motivo,
			}),
		onSuccess: () => {
			toast.success('Solicitação cancelada com sucesso');
			setModalCancelarAberto(false);
			queryClient.invalidateQueries({ queryKey: ['solicitacao-info', solicitacaoId] });
			router.back();
		},
		onError: (error: any) => {
			toast.error(error?.message || 'Erro ao cancelar solicitação');
		},
	});

	const handleMinimizar = () => {
		const formData: FormData = {
			modalCancelarAberto,
			abaAtiva,
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
					<h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Informações Minimizadas</h3>
					<p className="text-sm text-gray-500 dark:text-gray-400">
						Clique na miniatura na barra inferior para restaurar
					</p>
				</div>
			</div>
		);
	}

	if (isLoading) {
		return <Loading text="Carregando informações..." />;
	}

	if (!solicitacao) {
		return (
			<div>
				<PageHeader title="Solicitação não encontrada" description="A solicitação solicitada não existe" />
			</div>
		);
	}

	// Mapear etapas com status
	const etapas: EtapaAndamento[] = ETAPAS_FLUXO.map((etapa) => {
		const etapaInfo = solicitacao.andamento?.etapas?.find((e: any) => e.key === etapa.key);
		return {
			key: etapa.key,
			label: etapa.label,
			status: (etapaInfo?.status || 'pendente') as StatusEtapa,
		};
	});

	return (
		<div className="space-y-6">
			<div className="flex items-start gap-2 sm:gap-4">
				<Button variant="ghost" size="sm" onClick={() => router.back()} className="flex-shrink-0 mt-1">
					<ArrowLeft className="w-4 h-4" />
				</Button>
				<div className="flex-1 min-w-0">
					<PageHeader
						title={`Informações - Solicitação ${solicitacao.numero}`}
						description="Acompanhamento completo da tramitação"
						action={
							<Button
								variant="outline"
								onClick={handleMinimizar}
								className="w-full sm:w-auto flex-shrink-0">
								<Minimize2 className="w-4 h-4 sm:mr-2" />
								<span className="hidden sm:inline">Minimizar</span>
							</Button>
						}
					/>
				</div>
			</div>

			{temDadosRestaurados && (
				<div className="bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
					<p className="text-sm text-blue-900 dark:text-blue-100">
						<CheckCircle2 className="w-4 h-4 inline mr-1" /> Informações restauradas com os dados salvos
						anteriormente
					</p>
				</div>
			)}

			{/* BLOCO 1: ANDAMENTO - COMPACTO */}
			<Card>
				<div className="p-3 sm:p-4">
					<h3 className="font-semibold text-sm mb-3">Andamento</h3>

					<div className="flex items-center gap-1 sm:gap-2 overflow-x-auto pb-2 -mx-3 px-3 sm:mx-0 sm:px-0">
						{etapas.map((etapa, index) => (
							<div key={etapa.key} className="flex items-center gap-1 sm:gap-2 flex-shrink-0">
								{/* Círculo da etapa */}
								<div className="flex flex-col items-center gap-1 min-w-[60px] sm:min-w-[70px]">
									<div
										className={cn(
											'w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center border-2 transition-colors',
											{
												'bg-green-500 border-green-500 text-white':
													etapa.status === 'concluido',
												'bg-yellow-400 border-yellow-400 text-white':
													etapa.status === 'em_andamento',
												'bg-gray-300 border-gray-300 text-gray-600':
													etapa.status === 'pendente',
											}
										)}>
										{etapa.status === 'concluido' && (
											<CheckCircle2 className="w-4 h-4 sm:w-5 sm:h-5" />
										)}
										{etapa.status === 'em_andamento' && <Clock className="w-4 h-4 sm:w-5 sm:h-5" />}
										{etapa.status === 'pendente' && <Circle className="w-4 h-4 sm:w-5 sm:h-5" />}
									</div>
									<p
										className={cn(
											'text-[9px] sm:text-[10px] text-center font-medium leading-tight px-1',
											{
												'text-green-700 dark:text-green-600': etapa.status === 'concluido',
												'text-yellow-600 dark:text-yellow-500': etapa.status === 'em_andamento',
												'text-gray-500 dark:text-gray-400': etapa.status === 'pendente',
											}
										)}>
										{etapa.label}
									</p>
								</div>

								{/* Linha conectora */}
								{index < etapas.length - 1 && (
									<div
										className={cn('h-0.5 w-4 sm:w-8 flex-shrink-0', {
											'bg-green-500': etapa.status === 'concluido',
											'bg-gray-300': etapa.status !== 'concluido',
										})}
									/>
								)}
							</div>
						))}
					</div>
				</div>
			</Card>

			{/* BLOCO 2: ABAS */}
			<Card className="flex-1">
				<Tabs value={abaAtiva} onValueChange={setAbaAtiva} className="w-full h-full flex flex-col">
					{/* TabsList com scroll horizontal */}
					<div className="relative border-b overflow-x-auto">
						<TabsList className="w-full justify-start flex-nowrap h-auto bg-transparent p-0 inline-flex min-w-full">
							<TabsTrigger
								value="geral"
								className="whitespace-nowrap text-xs sm:text-sm py-2 px-2 sm:px-3">
								Geral
							</TabsTrigger>
							<TabsTrigger
								value="tramites"
								className="whitespace-nowrap text-xs sm:text-sm py-2 px-2 sm:px-3">
								<span className="hidden sm:inline">Trâmites da Solicitação de Pagamento</span>
								<span className="sm:hidden">Trâmites</span>
							</TabsTrigger>
							<TabsTrigger
								value="anexos"
								className="whitespace-nowrap text-xs sm:text-sm py-2 px-2 sm:px-3">
								<span className="hidden sm:inline">Anexos Pagamento</span>
								<span className="sm:hidden">Anexos</span>
							</TabsTrigger>
							<TabsTrigger
								value="gestor"
								className="whitespace-nowrap text-xs sm:text-sm py-2 px-2 sm:px-3">
								Gestor
							</TabsTrigger>
							<TabsTrigger
								value="liquidacao"
								className="whitespace-nowrap text-xs sm:text-sm py-2 px-2 sm:px-3">
								<span className="hidden sm:inline">Comissão de Liquidação</span>
								<span className="sm:hidden">Liquidação</span>
							</TabsTrigger>
							<TabsTrigger
								value="processo"
								className="whitespace-nowrap text-xs sm:text-sm py-2 px-2 sm:px-3">
								Processo
							</TabsTrigger>
							<TabsTrigger
								value="ordem_pagamento"
								className="whitespace-nowrap text-xs sm:text-sm py-2 px-2 sm:px-3">
								<span className="hidden sm:inline">Ordem de Pagamento</span>
								<span className="sm:hidden">Ordem Pag.</span>
							</TabsTrigger>
							<TabsTrigger value="iss" className="whitespace-nowrap text-xs sm:text-sm py-2 px-2 sm:px-3">
								ISS
							</TabsTrigger>
							<TabsTrigger
								value="forma_pagamento"
								className="whitespace-nowrap text-xs sm:text-sm py-2 px-2 sm:px-3">
								<span className="hidden sm:inline">Forma de Pagamento</span>
								<span className="sm:hidden">Pagamento</span>
							</TabsTrigger>
							<TabsTrigger
								value="bordero"
								className="whitespace-nowrap text-xs sm:text-sm py-2 px-2 sm:px-3">
								Borderô
							</TabsTrigger>
							<TabsTrigger
								value="remessa"
								className="whitespace-nowrap text-xs sm:text-sm py-2 px-2 sm:px-3">
								Remessa
							</TabsTrigger>
							<TabsTrigger
								value="pagamento_realizado"
								className="whitespace-nowrap text-xs sm:text-sm py-2 px-2 sm:px-3">
								<span className="hidden sm:inline">Pagamento Realizado</span>
								<span className="sm:hidden">Pag. Realizado</span>
							</TabsTrigger>
						</TabsList>
					</div>

					{/* ABA: GERAL */}
					<TabsContent value="geral" className="space-y-4 p-6">
						<h4 className="font-semibold mb-4 dark:text-foreground">Dados Gerais</h4>
						<div className="grid grid-cols-2 gap-4">
							<div>
								<p className="text-sm text-gray-500 dark:text-muted-foreground">
									N. Solicitação de Pagamento
								</p>
								<p className="font-medium dark:text-foreground">{solicitacao.numero}</p>
							</div>

							<div>
								<p className="text-sm text-gray-500 dark:text-muted-foreground">Data de Cadastro</p>
								<p className="font-medium dark:text-foreground">{solicitacao.created_at}</p>
							</div>

							<div>
								<p className="text-sm text-gray-500 dark:text-muted-foreground">Valor Solicitação</p>
								<p className="font-medium text-lg dark:text-foreground">
									{formatCurrency(parseFloat(String(solicitacao.valor)))}
								</p>
							</div>

							<div>
								<p className="text-sm text-gray-500 dark:text-muted-foreground">Solicitante</p>
								<p className="font-medium dark:text-foreground">
									{solicitacao.solicitante?.cpf} - {solicitacao.solicitante?.name}
								</p>
							</div>

							<div>
								<p className="text-sm text-gray-500 dark:text-muted-foreground">Empenho</p>
								<p className="font-medium dark:text-foreground">{solicitacao.empenho?.numero}</p>
							</div>

							<div>
								<p className="text-sm text-gray-500 dark:text-muted-foreground">Fornecedor</p>
								<p className="font-medium dark:text-foreground">
									{solicitacao.fornecedor?.cnpj} - {solicitacao.fornecedor?.razao_social}
								</p>
							</div>

							<div>
								<p className="text-sm text-gray-500 dark:text-muted-foreground">Contrato</p>
								<p className="font-medium dark:text-foreground">{solicitacao.contrato?.numero}</p>
							</div>

							<div>
								<p className="text-sm text-gray-500 dark:text-muted-foreground">Tipo de Documento</p>
								<p className="font-medium dark:text-foreground">{solicitacao.documento_fiscal_tipo}</p>
							</div>

							<div>
								<p className="text-sm text-gray-500 dark:text-muted-foreground">N. Doc Fiscal</p>
								<p className="font-medium dark:text-foreground">
									{solicitacao.documento_fiscal_numero}
								</p>
							</div>

							{solicitacao.documento_fiscal_serie && (
								<div>
									<p className="text-sm text-gray-500 dark:text-muted-foreground">Série Doc Fiscal</p>
									<p className="font-medium dark:text-foreground">
										{solicitacao.documento_fiscal_serie}
									</p>
								</div>
							)}

							<div>
								<p className="text-sm text-gray-500 dark:text-muted-foreground">
									Data Emissão Doc. Fiscal
								</p>
								<p className="font-medium dark:text-foreground">
									{solicitacao.documento_fiscal_data_emissao}
								</p>
							</div>
						</div>
					</TabsContent>

					{/* ABA: TRÂMITES */}
					<TabsContent value="tramites" className="p-6">
						<h4 className="font-semibold mb-3 dark:text-foreground">
							Trâmites da Solicitação de Pagamento
						</h4>
						{!solicitacao.tramites || solicitacao.tramites.length === 0 ? (
							<p className="text-center text-gray-500 dark:text-muted-foreground py-8">
								Nenhum trâmite registrado ainda
							</p>
						) : (
							<div className="space-y-3">
								{solicitacao.tramites.map((tramite: any) => (
									<div
										key={tramite.id}
										className="border-l-4 border-blue-500 dark:border-blue-400 pl-3 sm:pl-4 py-2.5 bg-blue-50 dark:bg-blue-950/30 rounded-r">
										{/* Fase e Data/Hora */}
										<div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1 sm:gap-0 mb-2">
											<h5 className="font-semibold text-blue-900 dark:text-blue-300 text-sm">
												{tramite.fase}
											</h5>
											<span className="text-xs text-gray-600 dark:text-gray-400 whitespace-nowrap bg-white dark:bg-gray-900 px-2 py-1 rounded w-fit">
												{tramite.created_at}
											</span>
										</div>

										{/* Grid compacto: Responsável + Origem + Destino */}
										<div className="grid grid-cols-1 sm:grid-cols-3 gap-2 sm:gap-3 text-xs">
											{tramite.usuario && (
												<div>
													<span className="text-gray-500 dark:text-gray-400">
														Responsável
													</span>
													<p className="text-gray-900 dark:text-gray-100 font-medium mt-0.5">
														{tramite.usuario.name}
													</p>
												</div>
											)}
											{tramite.origem && (
												<div>
													<span className="text-gray-500 dark:text-gray-400">Origem</span>
													<p className="text-gray-900 dark:text-gray-100 font-medium mt-0.5">
														{tramite.origem}
													</p>
												</div>
											)}
											{tramite.destino && (
												<div>
													<span className="text-gray-500 dark:text-gray-400">Destino</span>
													<p className="text-gray-900 dark:text-gray-100 font-medium mt-0.5">
														{tramite.destino}
													</p>
												</div>
											)}
										</div>

										{/* Motivo */}
										{tramite.motivo && (
											<div className="mt-2 pt-2 border-t border-blue-200 dark:border-blue-800">
												<span className="text-xs text-gray-500 dark:text-gray-400">Motivo</span>
												<p className="text-xs text-gray-900 dark:text-gray-100 mt-0.5">
													{tramite.motivo}
												</p>
											</div>
										)}
									</div>
								))}
							</div>
						)}
					</TabsContent>

					{/* ABA: ANEXOS PAGAMENTO */}
					<TabsContent value="anexos" className="p-6">
						<h4 className="font-semibold mb-4 dark:text-foreground">Anexos Pagamento</h4>
						<AnexosTabContent
							solicitacaoId={solicitacaoId}
							onCancelar={() => setModalCancelarAberto(true)}
						/>
					</TabsContent>

					{/* ABA: GESTOR */}
					<TabsContent value="gestor" className="p-6">
						<h4 className="font-semibold mb-4 dark:text-foreground">Gestor</h4>
						<p className="text-gray-500 dark:text-muted-foreground text-center py-8">
							Tramitação interna - Acompanhamento em tempo real
						</p>
					</TabsContent>

					{/* ABA: COMISSÃO DE LIQUIDAÇÃO */}
					<TabsContent value="liquidacao" className="p-6">
						<h4 className="font-semibold mb-4 dark:text-foreground">Comissão de Liquidação</h4>
						<p className="text-gray-500 dark:text-muted-foreground text-center py-8">
							Tramitação interna - Acompanhamento em tempo real
						</p>
					</TabsContent>

					{/* ABA: PROCESSO */}
					<TabsContent value="processo" className="p-6">
						<h4 className="font-semibold mb-4 dark:text-foreground">Processo</h4>
						<p className="text-gray-500 dark:text-muted-foreground text-center py-8">
							Tramitação interna - Acompanhamento em tempo real
						</p>
					</TabsContent>

					{/* ABA: ORDEM DE PAGAMENTO */}
					<TabsContent value="ordem_pagamento" className="p-6">
						<h4 className="font-semibold mb-4 dark:text-foreground">Ordem de Pagamento</h4>
						<p className="text-gray-500 dark:text-muted-foreground text-center py-8">
							Tramitação interna - Acompanhamento em tempo real
						</p>
					</TabsContent>

					{/* ABA: ISS */}
					<TabsContent value="iss" className="p-6">
						<h4 className="font-semibold mb-4 dark:text-foreground">ISS / Patrimônio</h4>
						<p className="text-gray-500 dark:text-muted-foreground text-center py-8">
							Tramitação conforme classificação do elemento de despesa
						</p>
					</TabsContent>

					{/* ABA: FORMA DE PAGAMENTO */}
					<TabsContent value="forma_pagamento" className="p-6">
						<h4 className="font-semibold mb-4 dark:text-foreground">Forma de Pagamento</h4>
						<div className="grid grid-cols-2 gap-4">
							<div>
								<p className="text-sm text-gray-500 dark:text-muted-foreground">Forma de Pagamento</p>
								<p className="font-medium dark:text-foreground">
									{solicitacao.forma_pagamento_tipo === 'conta_bancaria'
										? 'Conta Bancária'
										: 'Documento'}
								</p>
							</div>

							{solicitacao.banco && (
								<>
									<div>
										<p className="text-sm text-gray-500 dark:text-muted-foreground">Banco</p>
										<p className="font-medium dark:text-foreground">{solicitacao.banco}</p>
									</div>

									<div>
										<p className="text-sm text-gray-500 dark:text-muted-foreground">Agência</p>
										<p className="font-medium dark:text-foreground">
											{solicitacao.agencia}
											{solicitacao.agencia_digito && `-${solicitacao.agencia_digito}`}
										</p>
									</div>

									<div>
										<p className="text-sm text-gray-500 dark:text-muted-foreground">Conta</p>
										<p className="font-medium dark:text-foreground">
											{solicitacao.conta}
											{solicitacao.conta_digito && `-${solicitacao.conta_digito}`}
										</p>
									</div>

									{solicitacao.operacao && (
										<div>
											<p className="text-sm text-gray-500 dark:text-muted-foreground">Operação</p>
											<p className="font-medium dark:text-foreground">{solicitacao.operacao}</p>
										</div>
									)}

									{solicitacao.cidade_banco && (
										<div>
											<p className="text-sm text-gray-500 dark:text-muted-foreground">
												Cidade do Banco
											</p>
											<p className="font-medium dark:text-foreground">
												{solicitacao.cidade_banco}
											</p>
										</div>
									)}
								</>
							)}
						</div>
					</TabsContent>

					{/* ABA: BORDERÔ */}
					<TabsContent value="bordero" className="p-6">
						<h4 className="font-semibold mb-4 dark:text-foreground">Borderô</h4>
						<p className="text-gray-500 dark:text-muted-foreground text-center py-8">
							Tramitação interna - Acompanhamento em tempo real
						</p>
					</TabsContent>

					{/* ABA: REMESSA */}
					<TabsContent value="remessa" className="p-6">
						<h4 className="font-semibold mb-4 dark:text-foreground">Remessa</h4>
						<p className="text-gray-500 dark:text-muted-foreground text-center py-8">
							Tramitação interna - Acompanhamento em tempo real
						</p>
					</TabsContent>

					{/* ABA: PAGAMENTO REALIZADO */}
					<TabsContent value="pagamento_realizado" className="p-6">
						<h4 className="font-semibold mb-4 dark:text-foreground">Pagamento Realizado</h4>
						{solicitacao.pagamento_realizado ? (
							<div className="space-y-6">
								{/* Banner de confirmação */}
								<div className="flex items-center gap-3 p-4 bg-green-50 dark:bg-green-950/30 border border-green-200 dark:border-green-800 rounded-lg">
									<div className="w-10 h-10 rounded-full bg-green-500 flex items-center justify-center flex-shrink-0">
										<Check className="w-5 h-5 text-white" />
									</div>
									<div>
										<p className="font-semibold text-green-800 dark:text-green-300">
											Pagamento Realizado com Sucesso
										</p>
										<p className="text-sm text-green-700 dark:text-green-400">
											{solicitacao.pagamento_realizado.data_hora}
										</p>
									</div>
								</div>

								{/* Dados do registro de pagamento */}
								<div>
									<h5 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-3">
										Registro de Pagamento
									</h5>
									<div className="grid grid-cols-2 md:grid-cols-3 gap-4">
										<div>
											<p className="text-sm text-gray-500 dark:text-muted-foreground">
												Data/Hora
											</p>
											<p className="font-medium dark:text-foreground">
												{solicitacao.pagamento_realizado.data_hora}
											</p>
										</div>
										<div>
											<p className="text-sm text-gray-500 dark:text-muted-foreground">
												Valor Pago
											</p>
											<p className="font-bold text-green-600 text-lg">
												{formatCurrency(
													parseFloat(
														String(
															solicitacao.pagamento_realizado.valor_pago ??
																solicitacao.valor
														)
													)
												)}
											</p>
										</div>
										{solicitacao.pagamento_realizado.registrado_por && (
											<div>
												<p className="text-sm text-gray-500 dark:text-muted-foreground">
													Registrado por
												</p>
												<p className="font-medium dark:text-foreground">
													{solicitacao.pagamento_realizado.registrado_por}
												</p>
											</div>
										)}
										{solicitacao.pagamento_realizado.forma_pagamento && (
											<div>
												<p className="text-sm text-gray-500 dark:text-muted-foreground">
													Forma de Pagamento
												</p>
												<p className="font-medium dark:text-foreground">
													{solicitacao.pagamento_realizado.forma_pagamento ===
													'conta_bancaria'
														? 'Conta Bancária'
														: 'Documento'}
												</p>
											</div>
										)}
										{solicitacao.pagamento_realizado.banco && (
											<div>
												<p className="text-sm text-gray-500 dark:text-muted-foreground">
													Banco
												</p>
												<p className="font-medium dark:text-foreground">
													{solicitacao.pagamento_realizado.banco}
												</p>
											</div>
										)}
										{solicitacao.pagamento_realizado.agencia && (
											<div>
												<p className="text-sm text-gray-500 dark:text-muted-foreground">
													Agência / Conta
												</p>
												<p className="font-medium dark:text-foreground">
													Ag: {solicitacao.pagamento_realizado.agencia} — C:{' '}
													{solicitacao.pagamento_realizado.conta}
												</p>
											</div>
										)}
										{solicitacao.pagamento_realizado.observacao && (
											<div className="col-span-2 md:col-span-3">
												<p className="text-sm text-gray-500 dark:text-muted-foreground">
													Observação
												</p>
												<p className="font-medium dark:text-foreground">
													{solicitacao.pagamento_realizado.observacao}
												</p>
											</div>
										)}
									</div>
								</div>

								{/* Histórico de trâmites */}
								<div>
									<h5 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-3">
										Histórico de Trâmites
									</h5>
									<div className="space-y-2">
										{solicitacao.tramites?.map((tramite: any) => (
											<div
												key={tramite.id}
												className="border-l-2 border-green-500 dark:border-green-400 pl-3 py-2">
												<p className="text-sm font-medium dark:text-foreground">
													{tramite.fase}
												</p>
												<p className="text-xs text-gray-500 dark:text-gray-400">
													{tramite.created_at}
													{tramite.usuario?.name && ` — ${tramite.usuario.name}`}
												</p>
												{tramite.motivo && (
													<p className="text-xs text-gray-600 dark:text-gray-300 mt-0.5">
														{tramite.motivo}
													</p>
												)}
											</div>
										))}
									</div>
								</div>
							</div>
						) : (
							<div className="flex flex-col items-center justify-center py-12 text-center">
								<div className="w-14 h-14 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center mb-4">
									<Clock className="w-7 h-7 text-gray-400" />
								</div>
								<p className="text-gray-500 dark:text-muted-foreground font-medium">
									Pagamento ainda não foi realizado
								</p>
								<p className="text-sm text-gray-400 dark:text-gray-500 mt-1">
									Esta aba será preenchida automaticamente quando o pagamento for registrado
								</p>
							</div>
						)}
					</TabsContent>
				</Tabs>
			</Card>

			<CancelarSolicitacaoModal
				open={modalCancelarAberto}
				onClose={() => setModalCancelarAberto(false)}
				onConfirm={(motivo, dataCancelamento) => cancelar(motivo)}
				isPending={isCancelando}
			/>
		</div>
	);
}

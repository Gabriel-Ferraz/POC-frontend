'use client';

import { useParams, useRouter } from 'next/navigation';
import { PageHeader } from '@/components/ui/page-header';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { StatusBadge } from '@/components/ui/status-badge';
import { Loading } from '@/components/ui/loading';
import { useQuery } from '@tanstack/react-query';
import { solicitacoesApi } from '@/app/features/solicitacoes/api/solicitacoes-api';
import { formatCurrency } from '@/lib/formatters';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ArrowLeft, CheckCircle2, Clock, Circle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { AnexosTabContent } from '@/app/features/solicitacoes/components/AnexosTabContent';

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

export default function InformacoesSolicitacaoPage() {
	const params = useParams();
	const router = useRouter();
	const solicitacaoId = parseInt(params.id as string);

	const { data: solicitacao, isLoading } = useQuery({
		queryKey: ['solicitacao-info', solicitacaoId],
		queryFn: () => solicitacoesApi.getSolicitacao(solicitacaoId),
	});

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
			status: etapaInfo?.status || 'pendente',
		};
	});

	return (
		<div className="space-y-6">
			<div className="flex items-center gap-4">
				<Button variant="ghost" size="sm" onClick={() => router.back()}>
					<ArrowLeft className="w-4 h-4" />
				</Button>
				<PageHeader
					title={`Informações - Solicitação ${solicitacao.numero}`}
					description="Acompanhamento completo da tramitação"
				/>
			</div>

			{/* BLOCO 1: ANDAMENTO - COMPACTO */}
			<Card>
				<div className="p-4">
					<h3 className="font-semibold text-sm mb-3">Andamento</h3>

					<div className="flex items-center gap-2 overflow-x-auto pb-2">
						{etapas.map((etapa, index) => (
							<div key={etapa.key} className="flex items-center gap-2 flex-shrink-0">
								{/* Círculo da etapa - MENOR */}
								<div className="flex flex-col items-center gap-1 min-w-[70px]">
									<div
										className={cn(
											'w-10 h-10 rounded-full flex items-center justify-center border-2 transition-colors',
											{
												'bg-green-500 border-green-500 text-white':
													etapa.status === 'concluido',
												'bg-orange-500 border-orange-500 text-white':
													etapa.status === 'em_andamento',
												'bg-gray-300 border-gray-300 text-gray-600':
													etapa.status === 'pendente',
											}
										)}>
										{etapa.status === 'concluido' && <CheckCircle2 className="w-5 h-5" />}
										{etapa.status === 'em_andamento' && <Clock className="w-5 h-5" />}
										{etapa.status === 'pendente' && <Circle className="w-5 h-5" />}
									</div>
									<p
										className={cn('text-[10px] text-center font-medium leading-tight', {
											'text-green-700': etapa.status === 'concluido',
											'text-orange-700': etapa.status === 'em_andamento',
											'text-gray-500': etapa.status === 'pendente',
										})}>
										{etapa.label}
									</p>
								</div>

								{/* Linha conectora - MENOR */}
								{index < etapas.length - 1 && (
									<div
										className={cn('h-0.5 w-8 flex-shrink-0', {
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
				<Tabs defaultValue="geral" className="w-full h-full flex flex-col">
					{/* TabsList com scroll horizontal - MAIS FINO */}
					<div className="relative border-b">
						<TabsList className="w-full justify-start overflow-x-auto flex-nowrap h-auto bg-transparent p-0">
							<TabsTrigger value="geral" className="whitespace-nowrap text-xs py-2 px-3">
								Geral
							</TabsTrigger>
							<TabsTrigger value="tramites" className="whitespace-nowrap text-xs py-2 px-3">
								Trâmites da Solicitação de Pagamento
							</TabsTrigger>
							<TabsTrigger value="anexos" className="whitespace-nowrap text-xs py-2 px-3">
								Anexos Pagamento
							</TabsTrigger>
							<TabsTrigger value="gestor" className="whitespace-nowrap text-xs py-2 px-3">
								Gestor
							</TabsTrigger>
							<TabsTrigger value="liquidacao" className="whitespace-nowrap text-xs py-2 px-3">
								Comissão de Liquidação
							</TabsTrigger>
							<TabsTrigger value="processo" className="whitespace-nowrap text-xs py-2 px-3">
								Processo
							</TabsTrigger>
							<TabsTrigger value="ordem_pagamento" className="whitespace-nowrap text-xs py-2 px-3">
								Ordem de Pagamento
							</TabsTrigger>
							<TabsTrigger value="iss" className="whitespace-nowrap text-xs py-2 px-3">
								ISS
							</TabsTrigger>
							<TabsTrigger value="forma_pagamento" className="whitespace-nowrap text-xs py-2 px-3">
								Forma de Pagamento
							</TabsTrigger>
							<TabsTrigger value="bordero" className="whitespace-nowrap text-xs py-2 px-3">
								Borderô
							</TabsTrigger>
							<TabsTrigger value="remessa" className="whitespace-nowrap text-xs py-2 px-3">
								Remessa
							</TabsTrigger>
							<TabsTrigger value="pagamento_realizado" className="whitespace-nowrap text-xs py-2 px-3">
								Pagamento Realizado
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
										className="border-l-4 border-blue-500 dark:border-blue-400 pl-4 py-2.5 bg-blue-50 dark:bg-blue-950/30 rounded-r">
										{/* Fase e Data/Hora */}
										<div className="flex items-center justify-between mb-2">
											<h5 className="font-semibold text-blue-900 dark:text-blue-300 text-sm">
												{tramite.fase}
											</h5>
											<span className="text-xs text-gray-600 dark:text-gray-400 whitespace-nowrap bg-white dark:bg-gray-900 px-2 py-1 rounded">
												{tramite.created_at}
											</span>
										</div>

										{/* Grid compacto: Responsável + Origem + Destino */}
										<div className="grid grid-cols-3 gap-3 text-xs">
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
						<AnexosTabContent solicitacaoId={solicitacaoId} />
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
							<div className="space-y-4">
								<div className="p-4 bg-green-50 dark:bg-green-950/30 border border-green-200 dark:border-green-800 rounded-lg">
									<p className="font-semibold text-green-800 dark:text-green-300 text-lg mb-2">
										✅ Pagamento Realizado com Sucesso
									</p>
									<div className="grid grid-cols-2 gap-3">
										<div>
											<p className="text-sm text-gray-600 dark:text-gray-400">
												Data/Hora do Pagamento
											</p>
											<p className="font-medium dark:text-foreground">
												{solicitacao.pagamento_realizado.data_hora}
											</p>
										</div>
										<div>
											<p className="text-sm text-gray-600 dark:text-gray-400">Conta Destino</p>
											<p className="font-medium dark:text-foreground">
												{solicitacao.banco} - Ag: {solicitacao.agencia} - Conta:{' '}
												{solicitacao.conta}
											</p>
										</div>
									</div>
								</div>

								<h5 className="font-semibold mt-6 dark:text-foreground">Histórico de Trâmites</h5>
								<div className="space-y-2">
									{solicitacao.tramites?.map((tramite: any) => (
										<div
											key={tramite.id}
											className="border-l-2 border-green-500 dark:border-green-400 pl-3 py-2">
											<p className="text-sm font-medium dark:text-foreground">{tramite.fase}</p>
											<p className="text-xs text-gray-500 dark:text-gray-400">
												{tramite.created_at} - {tramite.usuario?.name}
											</p>
										</div>
									))}
								</div>
							</div>
						) : (
							<p className="text-center text-gray-500 dark:text-muted-foreground py-8">
								Pagamento ainda não foi realizado
							</p>
						)}
					</TabsContent>
				</Tabs>
			</Card>
		</div>
	);
}

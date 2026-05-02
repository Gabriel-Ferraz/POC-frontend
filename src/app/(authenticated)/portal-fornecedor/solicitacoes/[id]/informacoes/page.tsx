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

			{/* BLOCO 1: ANDAMENTO */}
			<Card>
				<div className="p-6">
					<h3 className="font-semibold text-lg mb-6">Andamento</h3>

					<div className="flex items-center gap-3 overflow-x-auto pb-4">
						{etapas.map((etapa, index) => (
							<div key={etapa.key} className="flex items-center gap-3 flex-shrink-0">
								{/* Círculo da etapa */}
								<div className="flex flex-col items-center gap-2 min-w-[100px]">
									<div
										className={cn(
											'w-16 h-16 rounded-full flex items-center justify-center border-4 transition-colors',
											{
												'bg-green-500 border-green-500 text-white':
													etapa.status === 'concluido',
												'bg-orange-500 border-orange-500 text-white':
													etapa.status === 'em_andamento',
												'bg-gray-300 border-gray-300 text-gray-600':
													etapa.status === 'pendente',
											}
										)}>
										{etapa.status === 'concluido' && <CheckCircle2 className="w-8 h-8" />}
										{etapa.status === 'em_andamento' && <Clock className="w-8 h-8" />}
										{etapa.status === 'pendente' && <Circle className="w-8 h-8" />}
									</div>
									<p
										className={cn('text-xs text-center font-medium', {
											'text-green-700': etapa.status === 'concluido',
											'text-orange-700': etapa.status === 'em_andamento',
											'text-gray-500': etapa.status === 'pendente',
										})}>
										{etapa.label}
									</p>
								</div>

								{/* Linha conectora */}
								{index < etapas.length - 1 && (
									<div
										className={cn('h-1 w-12 flex-shrink-0', {
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
			<Card>
				<div className="p-6">
					<Tabs defaultValue="geral" className="w-full">
						{/* TabsList com scroll horizontal */}
						<div className="relative">
							<TabsList className="w-full justify-start overflow-x-auto flex-nowrap h-auto">
								<TabsTrigger value="geral" className="whitespace-nowrap">
									Geral
								</TabsTrigger>
								<TabsTrigger value="tramites" className="whitespace-nowrap">
									Trâmites da Solicitação de Pagamento
								</TabsTrigger>
								<TabsTrigger value="anexos" className="whitespace-nowrap">
									Anexos Pagamento
								</TabsTrigger>
								<TabsTrigger value="gestor" className="whitespace-nowrap">
									Gestor
								</TabsTrigger>
								<TabsTrigger value="liquidacao" className="whitespace-nowrap">
									Comissão de Liquidação
								</TabsTrigger>
								<TabsTrigger value="processo" className="whitespace-nowrap">
									Processo
								</TabsTrigger>
								<TabsTrigger value="ordem_pagamento" className="whitespace-nowrap">
									Ordem de Pagamento
								</TabsTrigger>
								<TabsTrigger value="iss" className="whitespace-nowrap">
									ISS
								</TabsTrigger>
								<TabsTrigger value="forma_pagamento" className="whitespace-nowrap">
									Forma de Pagamento
								</TabsTrigger>
								<TabsTrigger value="bordero" className="whitespace-nowrap">
									Borderô
								</TabsTrigger>
								<TabsTrigger value="remessa" className="whitespace-nowrap">
									Remessa
								</TabsTrigger>
								<TabsTrigger value="pagamento_realizado" className="whitespace-nowrap">
									Pagamento Realizado
								</TabsTrigger>
							</TabsList>
						</div>

						{/* ABA: GERAL */}
						<TabsContent value="geral" className="space-y-4 mt-6">
							<h4 className="font-semibold mb-4">Dados Gerais</h4>
							<div className="grid grid-cols-2 gap-4">
								<div>
									<p className="text-sm text-gray-500">N. Solicitação de Pagamento</p>
									<p className="font-medium">{solicitacao.numero}</p>
								</div>

								<div>
									<p className="text-sm text-gray-500">Data de Cadastro</p>
									<p className="font-medium">{solicitacao.created_at}</p>
								</div>

								<div>
									<p className="text-sm text-gray-500">Valor Solicitação</p>
									<p className="font-medium text-lg">
										{formatCurrency(parseFloat(String(solicitacao.valor)))}
									</p>
								</div>

								<div>
									<p className="text-sm text-gray-500">Solicitante</p>
									<p className="font-medium">
										{solicitacao.solicitante?.cpf} - {solicitacao.solicitante?.name}
									</p>
								</div>

								<div>
									<p className="text-sm text-gray-500">Empenho</p>
									<p className="font-medium">{solicitacao.empenho?.numero}</p>
								</div>

								<div>
									<p className="text-sm text-gray-500">Fornecedor</p>
									<p className="font-medium">
										{solicitacao.fornecedor?.cnpj} - {solicitacao.fornecedor?.razao_social}
									</p>
								</div>

								<div>
									<p className="text-sm text-gray-500">Contrato</p>
									<p className="font-medium">{solicitacao.contrato?.numero}</p>
								</div>

								<div>
									<p className="text-sm text-gray-500">Tipo de Documento</p>
									<p className="font-medium">{solicitacao.documento_fiscal_tipo}</p>
								</div>

								<div>
									<p className="text-sm text-gray-500">N. Doc Fiscal</p>
									<p className="font-medium">{solicitacao.documento_fiscal_numero}</p>
								</div>

								{solicitacao.documento_fiscal_serie && (
									<div>
										<p className="text-sm text-gray-500">Série Doc Fiscal</p>
										<p className="font-medium">{solicitacao.documento_fiscal_serie}</p>
									</div>
								)}

								<div>
									<p className="text-sm text-gray-500">Data Emissão Doc. Fiscal</p>
									<p className="font-medium">{solicitacao.documento_fiscal_data_emissao}</p>
								</div>
							</div>
						</TabsContent>

						{/* ABA: TRÂMITES */}
						<TabsContent value="tramites" className="mt-6">
							<h4 className="font-semibold mb-4">Trâmites da Solicitação de Pagamento</h4>
							{!solicitacao.tramites || solicitacao.tramites.length === 0 ? (
								<p className="text-center text-gray-500 py-8">Nenhum trâmite registrado ainda</p>
							) : (
								<div className="space-y-4">
									{solicitacao.tramites.map((tramite: any) => (
										<div
											key={tramite.id}
											className="border-l-4 border-blue-500 pl-4 py-3 bg-blue-50">
											<div className="flex items-center justify-between mb-2">
												<span className="font-semibold text-blue-900">{tramite.fase}</span>
												<span className="text-sm text-gray-600">{tramite.created_at}</span>
											</div>
											{tramite.usuario && (
												<p className="text-sm text-gray-700">
													<strong>Responsável:</strong> {tramite.usuario.name}
												</p>
											)}
											{tramite.observacao && (
												<p className="text-sm text-gray-700 mt-1">
													<strong>Observação:</strong> {tramite.observacao}
												</p>
											)}
										</div>
									))}
								</div>
							)}
						</TabsContent>

						{/* ABA: ANEXOS PAGAMENTO */}
						<TabsContent value="anexos" className="mt-6">
							<h4 className="font-semibold mb-4">Anexos Pagamento</h4>
							{!solicitacao.anexos || solicitacao.anexos.length === 0 ? (
								<p className="text-center text-gray-500 py-8">Nenhum anexo cadastrado</p>
							) : (
								<div className="overflow-x-auto">
									<table className="w-full border-collapse">
										<thead>
											<tr className="bg-gray-100">
												<th className="border p-3 text-left">Tipo de Anexo</th>
												<th className="border p-3 text-left">Data de Cadastro</th>
												<th className="border p-3 text-left">Nome do Arquivo</th>
												<th className="border p-3 text-left">Situação</th>
												<th className="border p-3 text-left">Responsável</th>
											</tr>
										</thead>
										<tbody>
											{solicitacao.anexos.map((anexo: any) => (
												<tr key={anexo.id} className="hover:bg-gray-50">
													<td className="border p-3">{anexo.tipo_anexo_label}</td>
													<td className="border p-3">{anexo.data_envio || '-'}</td>
													<td className="border p-3">{anexo.arquivo_nome || '-'}</td>
													<td className="border p-3">
														<StatusBadge status={anexo.status} />
														{anexo.motivo_recusa && (
															<p className="text-xs text-red-600 mt-1">
																{anexo.motivo_recusa}
															</p>
														)}
													</td>
													<td className="border p-3">
														{anexo.avaliado_por || solicitacao.solicitante?.name}
													</td>
												</tr>
											))}
										</tbody>
									</table>
								</div>
							)}
						</TabsContent>

						{/* ABA: GESTOR */}
						<TabsContent value="gestor" className="mt-6">
							<h4 className="font-semibold mb-4">Gestor</h4>
							<p className="text-gray-500 text-center py-8">
								Tramitação interna - Acompanhamento em tempo real
							</p>
						</TabsContent>

						{/* ABA: COMISSÃO DE LIQUIDAÇÃO */}
						<TabsContent value="liquidacao" className="mt-6">
							<h4 className="font-semibold mb-4">Comissão de Liquidação</h4>
							<p className="text-gray-500 text-center py-8">
								Tramitação interna - Acompanhamento em tempo real
							</p>
						</TabsContent>

						{/* ABA: PROCESSO */}
						<TabsContent value="processo" className="mt-6">
							<h4 className="font-semibold mb-4">Processo</h4>
							<p className="text-gray-500 text-center py-8">
								Tramitação interna - Acompanhamento em tempo real
							</p>
						</TabsContent>

						{/* ABA: ORDEM DE PAGAMENTO */}
						<TabsContent value="ordem_pagamento" className="mt-6">
							<h4 className="font-semibold mb-4">Ordem de Pagamento</h4>
							<p className="text-gray-500 text-center py-8">
								Tramitação interna - Acompanhamento em tempo real
							</p>
						</TabsContent>

						{/* ABA: ISS */}
						<TabsContent value="iss" className="mt-6">
							<h4 className="font-semibold mb-4">ISS / Patrimônio</h4>
							<p className="text-gray-500 text-center py-8">
								Tramitação conforme classificação do elemento de despesa
							</p>
						</TabsContent>

						{/* ABA: FORMA DE PAGAMENTO */}
						<TabsContent value="forma_pagamento" className="mt-6">
							<h4 className="font-semibold mb-4">Forma de Pagamento</h4>
							<div className="grid grid-cols-2 gap-4">
								<div>
									<p className="text-sm text-gray-500">Forma de Pagamento</p>
									<p className="font-medium">
										{solicitacao.forma_pagamento_tipo === 'conta_bancaria'
											? 'Conta Bancária'
											: 'Documento'}
									</p>
								</div>

								{solicitacao.banco && (
									<>
										<div>
											<p className="text-sm text-gray-500">Banco</p>
											<p className="font-medium">{solicitacao.banco}</p>
										</div>

										<div>
											<p className="text-sm text-gray-500">Agência</p>
											<p className="font-medium">
												{solicitacao.agencia}
												{solicitacao.agencia_digito && `-${solicitacao.agencia_digito}`}
											</p>
										</div>

										<div>
											<p className="text-sm text-gray-500">Conta</p>
											<p className="font-medium">
												{solicitacao.conta}
												{solicitacao.conta_digito && `-${solicitacao.conta_digito}`}
											</p>
										</div>

										{solicitacao.operacao && (
											<div>
												<p className="text-sm text-gray-500">Operação</p>
												<p className="font-medium">{solicitacao.operacao}</p>
											</div>
										)}

										{solicitacao.cidade_banco && (
											<div>
												<p className="text-sm text-gray-500">Cidade do Banco</p>
												<p className="font-medium">{solicitacao.cidade_banco}</p>
											</div>
										)}
									</>
								)}
							</div>
						</TabsContent>

						{/* ABA: BORDERÔ */}
						<TabsContent value="bordero" className="mt-6">
							<h4 className="font-semibold mb-4">Borderô</h4>
							<p className="text-gray-500 text-center py-8">
								Tramitação interna - Acompanhamento em tempo real
							</p>
						</TabsContent>

						{/* ABA: REMESSA */}
						<TabsContent value="remessa" className="mt-6">
							<h4 className="font-semibold mb-4">Remessa</h4>
							<p className="text-gray-500 text-center py-8">
								Tramitação interna - Acompanhamento em tempo real
							</p>
						</TabsContent>

						{/* ABA: PAGAMENTO REALIZADO */}
						<TabsContent value="pagamento_realizado" className="mt-6">
							<h4 className="font-semibold mb-4">Pagamento Realizado</h4>
							{solicitacao.pagamento_realizado ? (
								<div className="space-y-4">
									<div className="p-4 bg-green-50 border border-green-200 rounded-lg">
										<p className="font-semibold text-green-800 text-lg mb-2">
											✅ Pagamento Realizado com Sucesso
										</p>
										<div className="grid grid-cols-2 gap-3">
											<div>
												<p className="text-sm text-gray-600">Data/Hora do Pagamento</p>
												<p className="font-medium">
													{solicitacao.pagamento_realizado.data_hora}
												</p>
											</div>
											<div>
												<p className="text-sm text-gray-600">Conta Destino</p>
												<p className="font-medium">
													{solicitacao.banco} - Ag: {solicitacao.agencia} - Conta:{' '}
													{solicitacao.conta}
												</p>
											</div>
										</div>
									</div>

									<h5 className="font-semibold mt-6">Histórico de Trâmites</h5>
									<div className="space-y-2">
										{solicitacao.tramites?.map((tramite: any) => (
											<div key={tramite.id} className="border-l-2 border-green-500 pl-3 py-2">
												<p className="text-sm font-medium">{tramite.fase}</p>
												<p className="text-xs text-gray-500">
													{tramite.created_at} - {tramite.usuario?.name}
												</p>
											</div>
										))}
									</div>
								</div>
							) : (
								<p className="text-center text-gray-500 py-8">Pagamento ainda não foi realizado</p>
							)}
						</TabsContent>
					</Tabs>
				</div>
			</Card>
		</div>
	);
}

'use client';

import { useParams } from 'next/navigation';
import { PageHeader } from '@/components/ui/page-header';
import { Card } from '@/components/ui/card';
import { StatusBadge } from '@/components/ui/status-badge';
import { Loading } from '@/components/ui/loading';
import { useQuery } from '@tanstack/react-query';
import { solicitacoesApi } from '@/app/features/solicitacoes/api/solicitacoes-api';
import { formatCurrency } from '@/lib/formatters';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export default function InformacoesSolicitacaoPage() {
	const params = useParams();
	const solicitacaoId = parseInt(params.id as string);

	const { data: solicitacao, isLoading } = useQuery({
		queryKey: ['solicitacao', solicitacaoId],
		queryFn: () => solicitacoesApi.getSolicitacao(solicitacaoId),
	});

	if (isLoading) {
		return <Loading text="Carregando solicitação..." />;
	}

	if (!solicitacao) {
		return (
			<div>
				<PageHeader title="Solicitação não encontrada" description="A solicitação solicitada não existe" />
			</div>
		);
	}

	return (
		<div className="space-y-6">
			<PageHeader
				title={`Solicitação ${solicitacao.numero}`}
				description="Detalhes completos da solicitação de pagamento"
			/>

			<Card>
				<div className="p-6">
					<Tabs defaultValue="geral">
						<TabsList>
							<TabsTrigger value="geral">Geral</TabsTrigger>
							<TabsTrigger value="documento">Documento Fiscal</TabsTrigger>
							<TabsTrigger value="pagamento">Forma de Pagamento</TabsTrigger>
							<TabsTrigger value="anexos">Anexos ({solicitacao.anexos?.length || 0})</TabsTrigger>
							<TabsTrigger value="tramites">Trâmites ({solicitacao.tramites?.length || 0})</TabsTrigger>
						</TabsList>

						<TabsContent value="geral" className="space-y-4">
							<div className="grid grid-cols-2 gap-4 mt-4">
								<div>
									<p className="text-sm text-muted-foreground">Número</p>
									<p className="font-medium">{solicitacao.numero}</p>
								</div>

								<div>
									<p className="text-sm text-muted-foreground">Status</p>
									<StatusBadge status={solicitacao.status} />
								</div>

								<div>
									<p className="text-sm text-muted-foreground">Valor</p>
									<p className="font-medium text-lg">
										{formatCurrency(parseFloat(String(solicitacao.valor)))}
									</p>
								</div>

								<div>
									<p className="text-sm text-muted-foreground">Data de Criação</p>
									<p className="font-medium">{solicitacao.created_at}</p>
								</div>

								{solicitacao.empenho && (
									<div>
										<p className="text-sm text-muted-foreground">Empenho</p>
										<p className="font-medium">{solicitacao.empenho.numero}</p>
									</div>
								)}

								{solicitacao.solicitante && (
									<div>
										<p className="text-sm text-muted-foreground">Solicitante</p>
										<p className="font-medium">{solicitacao.solicitante.name}</p>
									</div>
								)}

								{solicitacao.observacao && (
									<div className="col-span-2">
										<p className="text-sm text-muted-foreground">Observação</p>
										<p className="font-medium">{solicitacao.observacao}</p>
									</div>
								)}
							</div>
						</TabsContent>

						<TabsContent value="documento" className="space-y-4">
							<div className="grid grid-cols-2 gap-4 mt-4">
								<div>
									<p className="text-sm text-muted-foreground">Tipo de Documento</p>
									<p className="font-medium">{solicitacao.documento_fiscal_tipo}</p>
								</div>

								<div>
									<p className="text-sm text-muted-foreground">Número do Documento</p>
									<p className="font-medium">{solicitacao.documento_fiscal_numero}</p>
								</div>

								{solicitacao.documento_fiscal_serie && (
									<div>
										<p className="text-sm text-muted-foreground">Série</p>
										<p className="font-medium">{solicitacao.documento_fiscal_serie}</p>
									</div>
								)}

								<div>
									<p className="text-sm text-muted-foreground">Data de Emissão</p>
									<p className="font-medium">{solicitacao.documento_fiscal_data_emissao}</p>
								</div>
							</div>
						</TabsContent>

						<TabsContent value="pagamento" className="space-y-4">
							<div className="grid grid-cols-2 gap-4 mt-4">
								<div>
									<p className="text-sm text-muted-foreground">Forma de Pagamento</p>
									<p className="font-medium">
										{solicitacao.forma_pagamento_tipo === 'conta_bancaria'
											? 'Conta Bancária'
											: 'Documento'}
									</p>
								</div>

								{solicitacao.banco && (
									<>
										<div>
											<p className="text-sm text-muted-foreground">Banco</p>
											<p className="font-medium">{solicitacao.banco}</p>
										</div>

										<div>
											<p className="text-sm text-muted-foreground">Agência</p>
											<p className="font-medium">
												{solicitacao.agencia}
												{solicitacao.agencia_digito && `-${solicitacao.agencia_digito}`}
											</p>
										</div>

										<div>
											<p className="text-sm text-muted-foreground">Conta</p>
											<p className="font-medium">
												{solicitacao.conta}
												{solicitacao.conta_digito && `-${solicitacao.conta_digito}`}
											</p>
										</div>

										{solicitacao.operacao && (
											<div>
												<p className="text-sm text-muted-foreground">Operação</p>
												<p className="font-medium">{solicitacao.operacao}</p>
											</div>
										)}

										{solicitacao.cidade_banco && (
											<div>
												<p className="text-sm text-muted-foreground">Cidade do Banco</p>
												<p className="font-medium">{solicitacao.cidade_banco}</p>
											</div>
										)}
									</>
								)}
							</div>
						</TabsContent>

						<TabsContent value="anexos" className="mt-4">
							{!solicitacao.anexos || solicitacao.anexos.length === 0 ? (
								<p className="text-center text-muted-foreground py-8">Nenhum anexo cadastrado</p>
							) : (
								<div className="space-y-3">
									{solicitacao.anexos.map((anexo) => (
										<div key={anexo.id} className="border rounded-lg p-4">
											<div className="flex items-center justify-between">
												<div>
													<p className="font-medium">{anexo.tipo_anexo}</p>
													{anexo.data_envio && (
														<p className="text-sm text-muted-foreground">
															Enviado em: {anexo.data_envio}
														</p>
													)}
												</div>
												<StatusBadge status={anexo.status} />
											</div>

											{anexo.motivo_recusa && (
												<div className="mt-3 p-3 bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800 rounded">
													<p className="text-sm font-medium text-red-800 dark:text-red-200">
														Motivo da recusa:
													</p>
													<p className="text-sm text-red-700 dark:text-red-300 mt-1">
														{anexo.motivo_recusa}
													</p>
												</div>
											)}
										</div>
									))}
								</div>
							)}
						</TabsContent>

						<TabsContent value="tramites" className="mt-4">
							{!solicitacao.tramites || solicitacao.tramites.length === 0 ? (
								<p className="text-center text-muted-foreground py-8">Nenhum trâmite registrado</p>
							) : (
								<div className="space-y-4">
									{solicitacao.tramites.map((tramite) => (
										<div key={tramite.id} className="border-l-4 border-blue-500 pl-4 py-2">
											<div className="flex items-center gap-2 mb-1">
												<span className="text-sm font-semibold">{tramite.fase}</span>
												<span className="text-sm text-muted-foreground">
													{tramite.created_at}
												</span>
											</div>
											{tramite.usuario && (
												<p className="text-sm text-muted-foreground">
													Por: {tramite.usuario.name}
												</p>
											)}
											{tramite.observacao && <p className="text-sm mt-1">{tramite.observacao}</p>}
										</div>
									))}
								</div>
							)}
						</TabsContent>
					</Tabs>
				</div>
			</Card>
		</div>
	);
}

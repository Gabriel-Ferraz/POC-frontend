'use client';

import { useQuery } from '@tanstack/react-query';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/table';
import { Loading } from '@/components/ui/loading';
import { Badge } from '@/components/ui/badge';
import { Download, ExternalLink } from 'lucide-react';
import { formatDate, formatCurrency } from '@/lib/formatters';
import { obterAlteracao, getPdfUrl } from '@/services/orcamentario.service';
import { useRouter } from 'next/navigation';
import type { AlteracaoOrcamentaria } from '@/types/models';

interface AlteracaoInfoModalProps {
	alteracao: AlteracaoOrcamentaria | null;
	onClose: () => void;
}

const TIPO_ATO_LABELS: Record<string, string> = {
	decreto: 'Decreto',
	resolucao: 'Resolução',
	ato_gestor: 'Ato do Gestor',
};

const TIPO_CREDITO_LABELS: Record<string, string> = {
	especial: 'Especial',
	suplementar: 'Suplementar',
	extraordinario: 'Extraordinário',
};

const TIPO_RECURSO_LABELS: Record<string, string> = {
	superavit: 'Superávit',
	excesso_arrecadacao: 'Excesso de Arrecadação',
	valor_credito: 'Valor do Crédito',
};

function Field({ label, value }: { label: string; value: React.ReactNode }) {
	return (
		<div>
			<p className="text-xs text-muted-foreground uppercase tracking-wide font-medium">{label}</p>
			<p className="text-sm font-medium mt-0.5">{value}</p>
		</div>
	);
}

export function AlteracaoInfoModal({ alteracao, onClose }: AlteracaoInfoModalProps) {
	const router = useRouter();

	const { data, isLoading } = useQuery({
		queryKey: ['alteracao', alteracao?.id],
		queryFn: () => obterAlteracao(alteracao!.id),
		enabled: !!alteracao?.id,
	});

	const dotacoes = data?.dotacoes ?? [];
	const totalSuprimido = dotacoes.reduce((acc, d) => acc + Number(d.valor_suprimido || 0), 0);
	const totalSuplementado = dotacoes.reduce((acc, d) => acc + Number(d.valor_suplementado || 0), 0);
	const diferenca = totalSuplementado - totalSuprimido;

	const alt = data?.alteracao ?? alteracao;

	const getLeiAtoDisplay = (leiAto: any) => {
		if (typeof leiAto === 'string') return leiAto;
		if (leiAto && typeof leiAto === 'object') return leiAto.numero;
		return '-';
	};

	return (
		<Dialog open={!!alteracao} onOpenChange={(open) => !open && onClose()}>
			<DialogContent className="w-[calc(100%-2rem)] sm:max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
				<DialogHeader>
					<DialogTitle className="text-base sm:text-lg">
						Informações — {alteracao?.decreto_autorizador}
					</DialogTitle>
				</DialogHeader>

				<div className="overflow-y-auto flex-1 space-y-4 pr-1">
					{isLoading ? (
						<Loading text="Carregando informações..." />
					) : (
						<>
							{/* Cabeçalho com ações rápidas */}
							<div className="flex flex-wrap gap-2 justify-end">
								<Button
									size="sm"
									variant="outline"
									onClick={() => {
										onClose();
										router.push(`/orcamentario/alteracoes/${alteracao?.id}/dotacoes`);
									}}>
									<ExternalLink className="w-4 h-4 mr-1" />
									Gerenciar Dotações
								</Button>
								<Button
									size="sm"
									variant="outline"
									onClick={() => window.open(getPdfUrl(alteracao!.id), '_blank')}>
									<Download className="w-4 h-4 mr-1" />
									Imprimir PDF
								</Button>
							</div>

							{/* Dados da Lei/Ato */}
							<Card className="p-4">
								<h3 className="text-xs font-bold uppercase text-muted-foreground tracking-wide mb-3 pb-1 border-b">
									Lei / Ato Autorizador
								</h3>
								<div className="grid grid-cols-2 md:grid-cols-4 gap-3">
									<Field label="Lei / Ato" value={getLeiAtoDisplay(alt?.lei_ato)} />
									<Field
										label="Tipo"
										value={
											alt?.lei_ato && typeof alt.lei_ato === 'object'
												? (TIPO_ATO_LABELS[alt.lei_ato.tipo] ?? alt.lei_ato.tipo)
												: '-'
										}
									/>
									<Field
										label="Data do Ato"
										value={
											alt?.lei_ato && typeof alt.lei_ato === 'object'
												? formatDate((alt.lei_ato as any).data_ato)
												: '-'
										}
									/>
									<Field
										label="Data da Publicação"
										value={
											alt?.lei_ato && typeof alt.lei_ato === 'object'
												? formatDate((alt.lei_ato as any).data_publicacao)
												: '-'
										}
									/>
								</div>
							</Card>

							{/* Dados da Alteração */}
							<Card className="p-4">
								<h3 className="text-xs font-bold uppercase text-muted-foreground tracking-wide mb-3 pb-1 border-b">
									Dados da Alteração Orçamentária
								</h3>
								<div className="grid grid-cols-2 md:grid-cols-4 gap-3">
									<Field label="Decreto Autorizador" value={alt?.decreto_autorizador ?? '-'} />
									<Field
										label="Tipo de Ato"
										value={
											<Badge variant="secondary">
												{TIPO_ATO_LABELS[alt?.tipo_ato ?? ''] ?? alt?.tipo_ato ?? '-'}
											</Badge>
										}
									/>
									<Field label="Data do Ato" value={formatDate(alt?.data_ato)} />
									<Field label="Data da Publicação" value={formatDate(alt?.data_publicacao)} />
								</div>
								<div className="grid grid-cols-2 md:grid-cols-3 gap-3 mt-3">
									<Field
										label="Tipo de Crédito"
										value={
											<Badge variant="outline">
												{TIPO_CREDITO_LABELS[alt?.tipo_credito ?? ''] ??
													alt?.tipo_credito ??
													'-'}
											</Badge>
										}
									/>
									<Field
										label="Tipo de Recurso"
										value={
											<Badge variant="outline">
												{TIPO_RECURSO_LABELS[alt?.tipo_recurso ?? ''] ??
													alt?.tipo_recurso ??
													'-'}
											</Badge>
										}
									/>
									<Field
										label="Valor do Crédito"
										value={
											<span className="text-green-600 font-bold text-base">
												{formatCurrency(Number(alt?.valor_credito ?? 0))}
											</span>
										}
									/>
								</div>
							</Card>

							{/* Dotações */}
							<Card className="p-4">
								<div className="flex items-center justify-between mb-3 pb-1 border-b">
									<h3 className="text-xs font-bold uppercase text-muted-foreground tracking-wide">
										Dotações Orçamentárias ({dotacoes.length})
									</h3>
									{dotacoes.length > 0 && (
										<div className="flex gap-4 text-xs">
											<span className="text-red-600 font-medium">
												Suprimido: {formatCurrency(totalSuprimido)}
											</span>
											<span className="text-green-600 font-medium">
												Suplementado: {formatCurrency(totalSuplementado)}
											</span>
											<span
												className={`font-bold ${diferenca >= 0 ? 'text-blue-600' : 'text-red-600'}`}>
												Diferença: {formatCurrency(diferenca)}
											</span>
										</div>
									)}
								</div>

								{dotacoes.length === 0 ? (
									<p className="text-sm text-muted-foreground italic text-center py-4">
										Nenhuma dotação cadastrada para esta alteração.
									</p>
								) : (
									<div className="overflow-x-auto">
										<Table>
											<TableHeader>
												<TableRow>
													<TableHead>Dotação Orçamentária</TableHead>
													<TableHead>Conta Receita</TableHead>
													<TableHead className="text-right">Saldo Atual</TableHead>
													<TableHead className="text-right">Suprimido</TableHead>
													<TableHead className="text-right">Suplementado</TableHead>
													<TableHead className="text-right">Novo Saldo</TableHead>
												</TableRow>
											</TableHeader>
											<TableBody>
												{dotacoes.map((dot) => (
													<TableRow key={dot.id}>
														<TableCell className="font-mono text-xs">
															{dot.dotacao_orcamentaria}
														</TableCell>
														<TableCell className="text-xs">
															{dot.conta_receita || '-'}
														</TableCell>
														<TableCell className="text-right text-xs">
															{formatCurrency(Number(dot.saldo_atual))}
														</TableCell>
														<TableCell className="text-right text-xs text-red-600">
															{formatCurrency(Number(dot.valor_suprimido))}
														</TableCell>
														<TableCell className="text-right text-xs text-green-600">
															{formatCurrency(Number(dot.valor_suplementado))}
														</TableCell>
														<TableCell className="text-right text-xs font-bold">
															{formatCurrency(Number(dot.novo_saldo))}
														</TableCell>
													</TableRow>
												))}
												{/* Linha de totais */}
												<TableRow className="bg-muted/50 font-bold">
													<TableCell colSpan={3} className="text-xs">
														TOTAIS
													</TableCell>
													<TableCell className="text-right text-xs text-red-600">
														{formatCurrency(totalSuprimido)}
													</TableCell>
													<TableCell className="text-right text-xs text-green-600">
														{formatCurrency(totalSuplementado)}
													</TableCell>
													<TableCell
														className={`text-right text-xs font-bold ${diferenca >= 0 ? 'text-blue-600' : 'text-red-600'}`}>
														{formatCurrency(diferenca)}
													</TableCell>
												</TableRow>
											</TableBody>
										</Table>
									</div>
								)}
							</Card>
						</>
					)}
				</div>
			</DialogContent>
		</Dialog>
	);
}

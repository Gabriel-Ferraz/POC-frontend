'use client';

import { useState } from 'react';
import { PageHeader } from '@/components/ui/page-header';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/table';
import { Loading } from '@/components/ui/loading';
import { EmptyState } from '@/components/ui/empty-state';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import {
	AlertDialog,
	AlertDialogAction,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { FileText, Download, Eye, Plus, Minimize2, CheckCircle, Search, X, Pencil, Trash2, Info } from 'lucide-react';

import { formatDate, formatCurrency } from '@/lib/formatters';
import { toast } from 'sonner';
import { useFormMinimize } from '@/hooks/useFormMinimize';
import { listarAlteracoes, excluirAlteracao, getPdfUrl, type FiltrosAlteracoes } from '@/services/orcamentario.service';
import type { AlteracaoOrcamentaria } from '@/types/models';
import { AlteracaoForm } from './components/AlteracaoForm';
import { AlteracaoInfoModal } from './components/AlteracaoInfoModal';
import { TipoAto, TipoCredito, TipoRecurso } from '@/types/enums';

interface FormData {
	dialogOpen: boolean;
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

const EMPTY_FILTERS: FiltrosAlteracoes = {
	decreto: '',
	tipo_ato: '',
	tipo_credito: '',
	tipo_recurso: '',
	data_ato_de: '',
	data_ato_ate: '',
	data_publicacao_de: '',
	data_publicacao_ate: '',
};

export default function AlteracoesOrcamentariasPage() {
	const router = useRouter();
	const queryClient = useQueryClient();
	const [dialogOpen, setDialogOpen] = useState(false);
	const [editando, setEditando] = useState<AlteracaoOrcamentaria | null>(null);
	const [excluindo, setExcluindo] = useState<AlteracaoOrcamentaria | null>(null);
	const [visualizando, setVisualizando] = useState<AlteracaoOrcamentaria | null>(null);
	const [filtros, setFiltros] = useState<FiltrosAlteracoes>(EMPTY_FILTERS);
	const [filtrosAtivos, setFiltrosAtivos] = useState<FiltrosAlteracoes>(EMPTY_FILTERS);

	const temFiltrosAtivos = Object.values(filtrosAtivos).some(Boolean);

	const { minimizar, isMinimizado, temDadosRestaurados } = useFormMinimize<FormData>({
		titulo: 'Alterações Orçamentárias',
		icone: <FileText className="w-4 h-4" />,
		onRestore: (dados) => {
			setDialogOpen(dados.dialogOpen);
			toast.success('Dados restaurados com sucesso!');
		},
	});

	const { data: alteracoes, isLoading } = useQuery({
		queryKey: ['alteracoes-orcamentarias', filtrosAtivos],
		queryFn: () => listarAlteracoes(filtrosAtivos),
	});

	const deleteMutation = useMutation({
		mutationFn: (id: number) => excluirAlteracao(id),
		onSuccess: () => {
			toast.success('Alteração excluída com sucesso');
			queryClient.invalidateQueries({ queryKey: ['alteracoes-orcamentarias'] });
			setExcluindo(null);
		},
		onError: (error: any) => {
			toast.error(error?.message || 'Erro ao excluir alteração');
			setExcluindo(null);
		},
	});

	const handlePesquisar = (e: React.FormEvent) => {
		e.preventDefault();
		setFiltrosAtivos({ ...filtros });
	};

	const handleLimpar = () => {
		setFiltros(EMPTY_FILTERS);
		setFiltrosAtivos(EMPTY_FILTERS);
	};

	const handleNovaAlteracao = () => {
		setEditando(null);
		setDialogOpen(true);
	};

	const handleEditar = (alteracao: AlteracaoOrcamentaria) => {
		setEditando(alteracao);
		setDialogOpen(true);
	};

	const handleCloseDialog = () => {
		setDialogOpen(false);
		setEditando(null);
	};

	const handleMinimizar = () => {
		minimizar({ dialogOpen });
	};

	const handleDownloadPdf = (alteracao: AlteracaoOrcamentaria) => {
		const url = getPdfUrl(alteracao.id);
		window.open(url, '_blank');
	};

	const getLeiAtoDisplay = (leiAto: any) => {
		if (typeof leiAto === 'string') return leiAto;
		if (leiAto && typeof leiAto === 'object') {
			return `${leiAto.numero} - ${TIPO_ATO_LABELS[leiAto.tipo] || leiAto.tipo}`;
		}
		return '-';
	};

	if (isLoading) {
		return <Loading text="Carregando alterações orçamentárias..." />;
	}

	if (isMinimizado) {
		return (
			<div className="flex items-center justify-center h-[60vh]">
				<div className="text-center space-y-3">
					<div className="w-16 h-16 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center mx-auto">
						<Minimize2 className="w-8 h-8 text-blue-600 dark:text-blue-400" />
					</div>
					<h3 className="text-lg font-semibold">Tela Minimizada</h3>
					<p className="text-sm text-gray-500">Clique na miniatura na barra inferior para restaurar</p>
				</div>
			</div>
		);
	}

	const alteracoesList = alteracoes || [];

	return (
		<div>
			<PageHeader
				title="Alterações Orçamentárias"
				description="Gerencie as alterações orçamentárias e suas dotações"
				action={
					<div className="flex flex-col sm:flex-row gap-2">
						<Button variant="outline" onClick={handleMinimizar} className="w-full sm:w-auto">
							<Minimize2 className="w-4 h-4 sm:mr-2" />
							<span className="hidden sm:inline">Minimizar</span>
						</Button>
						<Button onClick={handleNovaAlteracao} className="w-full sm:w-auto">
							<Plus className="w-4 h-4 sm:mr-2" />
							<span className="sm:hidden">Nova</span>
							<span className="hidden sm:inline">Nova Alteração</span>
						</Button>
					</div>
				}
			/>

			{temDadosRestaurados && (
				<Alert className="mb-4">
					<CheckCircle className="w-4 h-4" />
					<AlertDescription>Dados restaurados com sucesso</AlertDescription>
				</Alert>
			)}

			{/* Filtros de Pesquisa */}
			<Card className="mb-4">
				<form onSubmit={handlePesquisar} className="p-4 space-y-4">
					<h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">Pesquisar</h3>

					<div className="grid grid-cols-1 md:grid-cols-3 gap-4">
						<div>
							<Label htmlFor="f_decreto">Decreto/Número</Label>
							<Input
								id="f_decreto"
								placeholder="Ex: 001/2024"
								value={filtros.decreto}
								onChange={(e) => setFiltros({ ...filtros, decreto: e.target.value })}
							/>
						</div>

						<div>
							<Label htmlFor="f_tipo_ato">Tipo de Ato</Label>
							<Select
								value={filtros.tipo_ato || 'todos'}
								onValueChange={(v) => setFiltros({ ...filtros, tipo_ato: v === 'todos' ? '' : v })}>
								<SelectTrigger id="f_tipo_ato">
									<SelectValue placeholder="Todos" />
								</SelectTrigger>
								<SelectContent>
									<SelectItem value="todos">Todos</SelectItem>
									<SelectItem value={TipoAto.DECRETO}>Decreto</SelectItem>
									<SelectItem value={TipoAto.RESOLUCAO}>Resolução</SelectItem>
									<SelectItem value={TipoAto.ATO_GESTOR}>Ato do Gestor</SelectItem>
								</SelectContent>
							</Select>
						</div>

						<div>
							<Label htmlFor="f_tipo_credito">Tipo de Crédito</Label>
							<Select
								value={filtros.tipo_credito || 'todos'}
								onValueChange={(v) => setFiltros({ ...filtros, tipo_credito: v === 'todos' ? '' : v })}>
								<SelectTrigger id="f_tipo_credito">
									<SelectValue placeholder="Todos" />
								</SelectTrigger>
								<SelectContent>
									<SelectItem value="todos">Todos</SelectItem>
									<SelectItem value={TipoCredito.ESPECIAL}>Especial</SelectItem>
									<SelectItem value={TipoCredito.SUPLEMENTAR}>Suplementar</SelectItem>
									<SelectItem value={TipoCredito.EXTRAORDINARIO}>Extraordinário</SelectItem>
								</SelectContent>
							</Select>
						</div>

						<div>
							<Label htmlFor="f_tipo_recurso">Tipo de Recurso</Label>
							<Select
								value={filtros.tipo_recurso || 'todos'}
								onValueChange={(v) => setFiltros({ ...filtros, tipo_recurso: v === 'todos' ? '' : v })}>
								<SelectTrigger id="f_tipo_recurso">
									<SelectValue placeholder="Todos" />
								</SelectTrigger>
								<SelectContent>
									<SelectItem value="todos">Todos</SelectItem>
									<SelectItem value={TipoRecurso.SUPERAVIT}>Superávit</SelectItem>
									<SelectItem value={TipoRecurso.EXCESSO_ARRECADACAO}>
										Excesso de Arrecadação
									</SelectItem>
									<SelectItem value={TipoRecurso.VALOR_CREDITO}>Valor do Crédito</SelectItem>
								</SelectContent>
							</Select>
						</div>

						<div className="col-span-1 md:col-span-2">
							<Label>Data do Ato</Label>
							<div className="flex items-center gap-2 mt-1">
								<Input
									type="date"
									value={filtros.data_ato_de}
									onChange={(e) => setFiltros({ ...filtros, data_ato_de: e.target.value })}
									className="flex-1"
								/>
								<span className="text-sm text-muted-foreground">até</span>
								<Input
									type="date"
									value={filtros.data_ato_ate}
									onChange={(e) => setFiltros({ ...filtros, data_ato_ate: e.target.value })}
									className="flex-1"
								/>
							</div>
						</div>

						<div className="col-span-1 md:col-span-2">
							<Label>Data da Publicação</Label>
							<div className="flex items-center gap-2 mt-1">
								<Input
									type="date"
									value={filtros.data_publicacao_de}
									onChange={(e) => setFiltros({ ...filtros, data_publicacao_de: e.target.value })}
									className="flex-1"
								/>
								<span className="text-sm text-muted-foreground">até</span>
								<Input
									type="date"
									value={filtros.data_publicacao_ate}
									onChange={(e) => setFiltros({ ...filtros, data_publicacao_ate: e.target.value })}
									className="flex-1"
								/>
							</div>
						</div>
					</div>

					<div className="flex gap-2">
						<Button type="submit" size="sm">
							<Search className="w-4 h-4 mr-2" />
							Pesquisar
						</Button>
						{temFiltrosAtivos && (
							<Button type="button" variant="outline" size="sm" onClick={handleLimpar}>
								<X className="w-4 h-4 mr-2" />
								Limpar Filtros
							</Button>
						)}
					</div>
				</form>
			</Card>

			{alteracoesList.length === 0 ? (
				<Card>
					<EmptyState
						icon={<FileText className="w-12 h-12" />}
						title={temFiltrosAtivos ? 'Nenhuma alteração encontrada' : 'Nenhuma alteração cadastrada'}
						description={
							temFiltrosAtivos
								? 'Tente ajustar os filtros de pesquisa'
								: "Clique em 'Nova Alteração' para começar"
						}
					/>
				</Card>
			) : (
				<>
					{/* Tabela desktop */}
					<Card className="hidden lg:block">
						<div className="overflow-x-auto">
							<Table>
								<TableHeader>
									<TableRow>
										<TableHead>Decreto Autorizador</TableHead>
										<TableHead>Lei/Ato</TableHead>
										<TableHead>Tipo de Ato</TableHead>
										<TableHead>Tipo de Crédito</TableHead>
										<TableHead>Tipo de Recurso</TableHead>
										<TableHead>Valor do Crédito</TableHead>
										<TableHead>Data do Ato</TableHead>
										<TableHead>Data da Publicação</TableHead>
										<TableHead className="text-right">Ações</TableHead>
									</TableRow>
								</TableHeader>
								<TableBody>
									{alteracoesList.map((alteracao) => (
										<TableRow key={alteracao.id}>
											<TableCell className="font-medium">
												{alteracao.decreto_autorizador}
											</TableCell>
											<TableCell>{getLeiAtoDisplay(alteracao.lei_ato)}</TableCell>
											<TableCell>
												{TIPO_ATO_LABELS[alteracao.tipo_ato] || alteracao.tipo_ato}
											</TableCell>
											<TableCell>
												{TIPO_CREDITO_LABELS[alteracao.tipo_credito] || alteracao.tipo_credito}
											</TableCell>
											<TableCell>
												{TIPO_RECURSO_LABELS[alteracao.tipo_recurso] || alteracao.tipo_recurso}
											</TableCell>
											<TableCell>
												{formatCurrency(Number(alteracao.valor_credito || 0))}
											</TableCell>
											<TableCell>{formatDate(alteracao.data_ato)}</TableCell>
											<TableCell>{formatDate(alteracao.data_publicacao)}</TableCell>
											<TableCell className="text-right">
												<div className="flex justify-end gap-1">
													<Button
														size="sm"
														variant="outline"
														onClick={() => setVisualizando(alteracao)}>
														<Info className="w-4 h-4 mr-1" />
														Informações
													</Button>
													<Button
														size="sm"
														variant="outline"
														onClick={() =>
															router.push(
																`/orcamentario/alteracoes/${alteracao.id}/dotacoes`
															)
														}>
														<Eye className="w-4 h-4 mr-1" />
														Dotações
													</Button>
													<Button
														size="sm"
														variant="outline"
														onClick={() => handleEditar(alteracao)}>
														<Pencil className="w-4 h-4 mr-1" />
														Alterar
													</Button>
													<Button
														size="sm"
														variant="outline"
														onClick={() => handleDownloadPdf(alteracao)}>
														<Download className="w-4 h-4 mr-1" />
														PDF
													</Button>
													<Button
														size="sm"
														variant="outline"
														className="text-red-600 hover:text-red-700 hover:bg-red-50"
														onClick={() => setExcluindo(alteracao)}>
														<Trash2 className="w-4 h-4" />
													</Button>
												</div>
											</TableCell>
										</TableRow>
									))}
								</TableBody>
							</Table>
						</div>
					</Card>

					{/* Cards mobile */}
					<div className="lg:hidden space-y-3">
						{alteracoesList.map((alteracao) => (
							<Card key={alteracao.id} className="p-4">
								<div className="space-y-3">
									<div className="flex items-start justify-between gap-2">
										<div>
											<p className="text-xs text-muted-foreground">Decreto Autorizador</p>
											<p className="font-medium">{alteracao.decreto_autorizador}</p>
										</div>
										<div className="text-right">
											<p className="text-xs text-muted-foreground">Data do Ato</p>
											<p className="font-medium text-sm">{formatDate(alteracao.data_ato)}</p>
										</div>
									</div>

									<div>
										<p className="text-xs text-muted-foreground">Lei/Ato</p>
										<p className="text-sm">{getLeiAtoDisplay(alteracao.lei_ato)}</p>
									</div>

									<div className="grid grid-cols-2 gap-3 text-sm">
										<div>
											<p className="text-xs text-muted-foreground">Tipo de Ato</p>
											<p>{TIPO_ATO_LABELS[alteracao.tipo_ato] || alteracao.tipo_ato}</p>
										</div>
										<div>
											<p className="text-xs text-muted-foreground">Tipo de Crédito</p>
											<p>
												{TIPO_CREDITO_LABELS[alteracao.tipo_credito] || alteracao.tipo_credito}
											</p>
										</div>
									</div>

									<div className="grid grid-cols-2 gap-3 text-sm">
										<div>
											<p className="text-xs text-muted-foreground">Tipo de Recurso</p>
											<p>
												{TIPO_RECURSO_LABELS[alteracao.tipo_recurso] || alteracao.tipo_recurso}
											</p>
										</div>
										<div>
											<p className="text-xs text-muted-foreground">Valor do Crédito</p>
											<p className="font-semibold text-green-600">
												{formatCurrency(Number(alteracao.valor_credito || 0))}
											</p>
										</div>
									</div>

									<div className="grid grid-cols-2 gap-2 pt-2 border-t">
										<Button size="sm" variant="outline" onClick={() => setVisualizando(alteracao)}>
											<Info className="w-4 h-4 mr-1" />
											Informações
										</Button>
										<Button
											size="sm"
											variant="outline"
											onClick={() =>
												router.push(`/orcamentario/alteracoes/${alteracao.id}/dotacoes`)
											}>
											<Eye className="w-4 h-4 mr-1" />
											Dotações
										</Button>
										<Button size="sm" variant="outline" onClick={() => handleEditar(alteracao)}>
											<Pencil className="w-4 h-4 mr-1" />
											Alterar
										</Button>
										<Button
											size="sm"
											variant="outline"
											onClick={() => handleDownloadPdf(alteracao)}>
											<Download className="w-4 h-4 mr-1" />
											PDF
										</Button>
										<Button
											size="sm"
											variant="outline"
											className="text-red-600 hover:text-red-700 hover:bg-red-50 col-span-2"
											onClick={() => setExcluindo(alteracao)}>
											<Trash2 className="w-4 h-4 mr-1" />
											Excluir
										</Button>
									</div>
								</div>
							</Card>
						))}
					</div>
				</>
			)}

			{/* Dialog criar/editar */}
			<Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
				<DialogContent className="w-[calc(100%-2rem)] sm:max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
					<DialogHeader>
						<DialogTitle className="text-base sm:text-lg">
							{editando ? 'Editar Alteração Orçamentária' : 'Nova Alteração Orçamentária'}
						</DialogTitle>
					</DialogHeader>
					<div className="overflow-y-auto flex-1">
						<AlteracaoForm alteracao={editando} onClose={handleCloseDialog} />
					</div>
				</DialogContent>
			</Dialog>

			{/* Modal de informações */}
			<AlteracaoInfoModal alteracao={visualizando} onClose={() => setVisualizando(null)} />

			{/* Confirmação de exclusão */}
			<AlertDialog open={!!excluindo} onOpenChange={(open) => !open && setExcluindo(null)}>
				<AlertDialogContent>
					<AlertDialogHeader>
						<AlertDialogTitle>Confirmar exclusão</AlertDialogTitle>
						<AlertDialogDescription>
							Deseja excluir a alteração <strong>{excluindo?.decreto_autorizador}</strong>? Esta ação não
							pode ser desfeita e todas as dotações vinculadas serão removidas.
						</AlertDialogDescription>
					</AlertDialogHeader>
					<AlertDialogFooter>
						<AlertDialogCancel>Cancelar</AlertDialogCancel>
						<AlertDialogAction
							className="bg-red-600 hover:bg-red-700"
							onClick={() => excluindo && deleteMutation.mutate(excluindo.id)}>
							Excluir
						</AlertDialogAction>
					</AlertDialogFooter>
				</AlertDialogContent>
			</AlertDialog>
		</div>
	);
}

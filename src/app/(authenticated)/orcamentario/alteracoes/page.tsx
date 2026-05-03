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
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { FileText, Download, Eye, Plus, Minimize2, CheckCircle, Search, X } from 'lucide-react';
import { formatDate, formatCurrency } from '@/lib/formatters';
import { toast } from 'sonner';
import { useFormMinimize } from '@/hooks/useFormMinimize';
import { listarAlteracoes, getPdfUrl, type FiltrosAlteracoes } from '@/services/orcamentario.service';
import type { AlteracaoOrcamentaria } from '@/types/models';
import { AlteracaoForm } from './components/AlteracaoForm';
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

	const handlePesquisar = (e: React.FormEvent) => {
		e.preventDefault();
		setFiltrosAtivos({ ...filtros });
	};

	const handleLimpar = () => {
		setFiltros(EMPTY_FILTERS);
		setFiltrosAtivos(EMPTY_FILTERS);
	};

	const handleCloseDialog = () => {
		setDialogOpen(false);
	};

	const handleMinimizar = () => {
		minimizar({ dialogOpen });
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
					<div className="flex gap-2">
						<Button variant="outline" onClick={handleMinimizar}>
							<Minimize2 className="w-4 h-4 mr-2" />
							Minimizar
						</Button>
						<Button onClick={() => setDialogOpen(true)}>
							<Plus className="w-4 h-4 mr-2" />
							Nova Alteração
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
				<Card>
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
								<TableHead className="text-right">Ações</TableHead>
							</TableRow>
						</TableHeader>
						<TableBody>
							{alteracoesList.map((alteracao) => (
								<TableRow key={alteracao.id}>
									<TableCell className="font-medium">{alteracao.decreto_autorizador}</TableCell>
									<TableCell>{getLeiAtoDisplay(alteracao.lei_ato)}</TableCell>
									<TableCell>{TIPO_ATO_LABELS[alteracao.tipo_ato] || alteracao.tipo_ato}</TableCell>
									<TableCell>
										{TIPO_CREDITO_LABELS[alteracao.tipo_credito] || alteracao.tipo_credito}
									</TableCell>
									<TableCell>
										{TIPO_RECURSO_LABELS[alteracao.tipo_recurso] || alteracao.tipo_recurso}
									</TableCell>
									<TableCell>{formatCurrency(Number(alteracao.valor_credito || 0))}</TableCell>
									<TableCell>{formatDate(alteracao.data_ato)}</TableCell>
									<TableCell className="text-right">
										<div className="flex justify-end gap-2">
											<Button
												size="sm"
												variant="outline"
												onClick={() =>
													router.push(`/orcamentario/alteracoes/${alteracao.id}/dotacoes`)
												}>
												<Eye className="w-4 h-4 mr-1" />
												Dotações
											</Button>
											<a href={getPdfUrl(alteracao.id)} target="_blank" rel="noopener noreferrer">
												<Button size="sm" variant="outline">
													<Download className="w-4 h-4 mr-1" />
													PDF
												</Button>
											</a>
										</div>
									</TableCell>
								</TableRow>
							))}
						</TableBody>
					</Table>
				</Card>
			)}

			<Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
				<DialogContent className="max-w-2xl">
					<DialogHeader>
						<DialogTitle>Nova Alteração Orçamentária</DialogTitle>
					</DialogHeader>
					<AlteracaoForm alteracao={null} onClose={handleCloseDialog} />
				</DialogContent>
			</Dialog>
		</div>
	);
}

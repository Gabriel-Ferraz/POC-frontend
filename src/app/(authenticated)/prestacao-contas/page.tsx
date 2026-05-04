'use client';

import { PageHeader } from '@/components/ui/page-header';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { SelectNative } from '@/components/ui/select-native';
import { Checkbox } from '@/components/ui/checkbox';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
import { useState, useEffect } from 'react';
import * as React from 'react';
import { useMutation, useQuery } from '@tanstack/react-query';
import { toast } from 'sonner';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/table';
import {
	Download,
	CheckCircle,
	Minimize2,
	FileArchive,
	ArrowUp,
	ArrowDown,
	ListOrdered,
	Loader2,
	AlertCircle,
} from 'lucide-react';
import { useFormMinimize } from '@/hooks/useFormMinimize';
import type {
	TipoGeracao,
	ModuloPrestacaoContas,
	LayoutArquivo,
	ExportarPrestacaoContasPayload,
	ExportacaoGerada,
} from '@/types/prestacao-contas.types';
import * as prestacaoContasService from '@/services/prestacao-contas.service';

interface FormData {
	ano: number;
	modulo: ModuloPrestacaoContas;
	tipoGeracao: TipoGeracao;
	mes?: number;
	somenteAtivos: boolean;
	arquivosSelecionados: string[];
	layouts: LayoutArquivo[];
}

export default function PrestacaoContasPage() {
	const currentYear = new Date().getFullYear();

	// Estados do formulário
	const [ano, setAno] = useState<number>(currentYear);
	const [modulo, setModulo] = useState<ModuloPrestacaoContas>('contabilidade');
	const [tipoGeracao, setTipoGeracao] = useState<TipoGeracao>('mensal');
	const [mes, setMes] = useState<number | undefined>(new Date().getMonth() + 1);
	const [somenteAtivos, setSomenteAtivos] = useState<boolean>(true);
	const [arquivosSelecionados, setArquivosSelecionados] = useState<string[]>([]);
	const [layouts, setLayouts] = useState<LayoutArquivo[]>([]);
	const [resultadoExportacao, setResultadoExportacao] = useState<ExportacaoGerada | null>(null);
	const [dialogOrdenacaoAberto, setDialogOrdenacaoAberto] = useState(false);

	// Sistema de minimização
	const { minimizar, isMinimizado, temDadosRestaurados } = useFormMinimize<FormData>({
		titulo: 'Exportador SIM-AM',
		icone: <FileArchive className="w-4 h-4" />,
		onRestore: (dados) => {
			setAno(dados.ano);
			setModulo(dados.modulo);
			setTipoGeracao(dados.tipoGeracao);
			setMes(dados.mes);
			setSomenteAtivos(dados.somenteAtivos);
			setArquivosSelecionados(dados.arquivosSelecionados);
			setLayouts(dados.layouts);
			toast.success('Exportador restaurado!');
		},
	});

	// Query para carregar layouts
	const { data: layoutsData, isLoading: loadingLayouts } = useQuery({
		queryKey: ['layouts'],
		queryFn: prestacaoContasService.listarLayouts,
		enabled: !isMinimizado,
	});

	// Atualizar layouts quando dados forem carregados
	React.useEffect(() => {
		if (layoutsData) {
			setLayouts(layoutsData);
		}
	}, [layoutsData]);

	// Mutation para exportar
	const { mutate: exportar, isPending: exportando } = useMutation({
		mutationFn: prestacaoContasService.exportarPrestacaoContas,
		onSuccess: (data) => {
			toast.success('Exportação realizada com sucesso!');
			setResultadoExportacao(data);
		},
		onError: (error: any) => {
			toast.error(error?.message || 'Erro ao exportar dados');
		},
	});

	// Handlers
	const handleArquivoToggle = (arquivoId: string) => {
		setArquivosSelecionados((prev) =>
			prev.includes(arquivoId) ? prev.filter((id) => id !== arquivoId) : [...prev, arquivoId]
		);
	};

	const handleSelecionarTodos = () => {
		const layoutsFiltrados = getLayoutsFiltrados();
		setArquivosSelecionados(layoutsFiltrados.map((l) => l.id));
	};

	const handleDesmarcarTodos = () => {
		setArquivosSelecionados([]);
	};

	const handleMoverLayoutAcima = (index: number) => {
		if (index === 0) return;
		const novosLayouts = [...layouts];
		[novosLayouts[index - 1], novosLayouts[index]] = [novosLayouts[index], novosLayouts[index - 1]];
		novosLayouts.forEach((layout, idx) => {
			layout.ordem = idx + 1;
		});
		setLayouts(novosLayouts);
	};

	const handleMoverLayoutAbaixo = (index: number) => {
		if (index === layouts.length - 1) return;
		const novosLayouts = [...layouts];
		[novosLayouts[index], novosLayouts[index + 1]] = [novosLayouts[index + 1], novosLayouts[index]];
		novosLayouts.forEach((layout, idx) => {
			layout.ordem = idx + 1;
		});
		setLayouts(novosLayouts);
	};

	const handleSalvarOrdenacao = async () => {
		try {
			await prestacaoContasService.reordenarLayouts(layouts.map((l) => l.id));
			toast.success('Ordem dos arquivos salva com sucesso!');
			setDialogOrdenacaoAberto(false);
		} catch (error: any) {
			toast.error(error?.message || 'Erro ao salvar ordenação');
		}
	};

	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault();

		if (!ano) {
			toast.error('Ano é obrigatório');
			return;
		}

		if (!modulo) {
			toast.error('Módulo é obrigatório');
			return;
		}

		if (!tipoGeracao) {
			toast.error('Tipo de geração é obrigatório');
			return;
		}

		if (tipoGeracao === 'mensal' && !mes) {
			toast.error('Mês é obrigatório para geração mensal');
			return;
		}

		if (arquivosSelecionados.length === 0) {
			toast.error('Selecione pelo menos um arquivo');
			return;
		}

		// Converter IDs dos layouts para keys que o backend espera
		const fileKeys = arquivosSelecionados
			.map((layoutId) => {
				const layout = layouts.find((l) => l.id === layoutId);
				return layout?.key;
			})
			.filter(Boolean) as string[];

		const payload: ExportarPrestacaoContasPayload = {
			year: ano,
			module: modulo,
			generationType: tipoGeracao,
			month: tipoGeracao === 'mensal' ? mes : undefined,
			onlyActive: somenteAtivos,
			files: fileKeys,
		};

		exportar(payload);
	};

	const handleLimpar = () => {
		setAno(currentYear);
		setModulo('contabilidade');
		setTipoGeracao('mensal');
		setMes(new Date().getMonth() + 1);
		setSomenteAtivos(true);
		setArquivosSelecionados([]);
		setResultadoExportacao(null);
		toast.success('Formulário limpo');
	};

	const handleMinimizar = () => {
		const formData: FormData = {
			ano,
			modulo,
			tipoGeracao,
			mes,
			somenteAtivos,
			arquivosSelecionados,
			layouts,
		};
		minimizar(formData);
	};

	const handleNovaExportacao = () => {
		setResultadoExportacao(null);
		handleLimpar();
	};

	const getLayoutsFiltrados = (): LayoutArquivo[] => {
		return layouts.filter((layout) => {
			if (somenteAtivos && !layout.ativo) return false;
			return true;
		});
	};

	// Se está minimizado
	if (isMinimizado) {
		return (
			<div className="flex items-center justify-center h-[60vh]">
				<div className="text-center space-y-3">
					<div className="w-16 h-16 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center mx-auto">
						<Minimize2 className="w-8 h-8 text-blue-600 dark:text-blue-400" />
					</div>
					<h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Exportador Minimizado</h3>
					<p className="text-sm text-gray-500 dark:text-gray-400">
						Clique na miniatura na barra inferior para restaurar
					</p>
				</div>
			</div>
		);
	}

	// Se tem resultado da exportação
	if (resultadoExportacao) {
		return (
			<div className="space-y-6">
				<PageHeader
					title="Exportador SIM-AM"
					description="Geração de Arquivos Concluída"
					action={
						<Button variant="outline" onClick={handleMinimizar} className="w-full sm:w-auto">
							<Minimize2 className="w-4 h-4 sm:mr-2" />
							<span className="hidden sm:inline">Minimizar</span>
						</Button>
					}
				/>

				{/* Card de Sucesso */}
				<Card className="bg-green-50 dark:bg-green-950 border-green-200 dark:border-green-800">
					<div className="p-4 sm:p-6">
						<div className="flex items-start gap-3 mb-4">
							<div className="p-2 sm:p-3 bg-green-500 rounded-full flex-shrink-0">
								<CheckCircle className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
							</div>
							<div className="flex-1 min-w-0">
								<p className="text-xs sm:text-sm font-medium text-green-700 dark:text-green-300 mb-1">
									Arquivo ZIP
								</p>
								<h3 className="font-semibold text-sm sm:text-base text-green-900 dark:text-green-100 break-all overflow-hidden">
									{resultadoExportacao.zipName}
								</h3>
								<p className="text-xs text-green-700 dark:text-green-300 mt-1">✓ Gerado com Sucesso</p>
							</div>
						</div>

						<Button
							onClick={() => prestacaoContasService.downloadZip(resultadoExportacao.id)}
							className="w-full sm:w-auto">
							<Download className="w-4 h-4 mr-2" />
							Baixar Arquivo ZIP Completo
						</Button>
					</div>
				</Card>

				{/* Arquivos Gerados */}
				<Card>
					<div className="p-4 sm:p-6">
						<h3 className="font-semibold text-base sm:text-lg mb-4">Arquivos Gerados</h3>

						{/* Tabela para Desktop */}
						<div className="hidden sm:block overflow-x-auto">
							<Table>
								<TableHeader>
									<TableRow>
										<TableHead>Arquivo</TableHead>
										<TableHead>Status</TableHead>
										<TableHead className="text-right">Qtde Registros</TableHead>
										<TableHead className="text-right">Ações</TableHead>
									</TableRow>
								</TableHeader>
								<TableBody>
									{resultadoExportacao.arquivos.map((arquivo) => (
										<TableRow key={arquivo.id}>
											<TableCell className="font-medium text-sm">{arquivo.nome}</TableCell>
											<TableCell>
												<div className="flex flex-col gap-1">
													<Badge
														variant={
															arquivo.status === 'gerado' ? 'default' : 'destructive'
														}
														className="w-fit text-xs">
														{arquivo.status === 'gerado' ? 'Gerado com sucesso' : 'Erro'}
													</Badge>
													<span className="text-xs text-muted-foreground">
														Gerado em {arquivo.geradoEm}
													</span>
												</div>
											</TableCell>
											<TableCell className="text-right text-sm">
												{arquivo.quantidadeRegistros}
											</TableCell>
											<TableCell className="text-right">
												<Button
													size="sm"
													variant="outline"
													onClick={() =>
														prestacaoContasService.downloadArquivo(
															resultadoExportacao.id,
															arquivo.id
														)
													}>
													Baixar
												</Button>
											</TableCell>
										</TableRow>
									))}
								</TableBody>
							</Table>
						</div>

						{/* Cards para Mobile */}
						<div className="sm:hidden space-y-3">
							{resultadoExportacao.arquivos.map((arquivo) => (
								<div key={arquivo.id} className="border rounded-lg p-3 space-y-3">
									<div className="flex items-start justify-between gap-2">
										<div className="flex-1 min-w-0">
											<p className="text-xs text-muted-foreground">Arquivo</p>
											<p className="font-medium text-sm break-all">{arquivo.nome}</p>
										</div>
										<Badge
											variant={arquivo.status === 'gerado' ? 'default' : 'destructive'}
											className="text-xs flex-shrink-0">
											{arquivo.status === 'gerado' ? 'Gerado' : 'Erro'}
										</Badge>
									</div>

									<div className="grid grid-cols-2 gap-3 text-sm">
										<div>
											<p className="text-xs text-muted-foreground">Gerado em</p>
											<p className="text-xs">{arquivo.geradoEm}</p>
										</div>
										<div>
											<p className="text-xs text-muted-foreground">Registros</p>
											<p className="text-xs font-medium">{arquivo.quantidadeRegistros}</p>
										</div>
									</div>

									<Button
										size="sm"
										variant="outline"
										onClick={() =>
											prestacaoContasService.downloadArquivo(resultadoExportacao.id, arquivo.id)
										}
										className="w-full text-xs">
										<Download className="w-3 h-3 mr-2" />
										Baixar Arquivo
									</Button>
								</div>
							))}
						</div>

						<div className="flex justify-end mt-6 pt-4 border-t">
							<Button onClick={handleNovaExportacao} className="w-full sm:w-auto">
								Nova Exportação
							</Button>
						</div>
					</div>
				</Card>
			</div>
		);
	}

	const layoutsFiltrados = getLayoutsFiltrados();

	// Formulário de exportação
	return (
		<div className="space-y-6">
			<PageHeader
				title="Exportador SIM-AM"
				description="Exportação de dados para o sistema SIM-AM/SIMAM do Tribunal de Contas"
				action={
					<Button
						variant="outline"
						onClick={handleMinimizar}
						disabled={exportando}
						className="w-full sm:w-auto">
						<Minimize2 className="w-4 h-4 sm:mr-2" />
						<span className="hidden sm:inline">Minimizar</span>
					</Button>
				}
			/>

			{temDadosRestaurados && (
				<Alert>
					<CheckCircle className="w-4 h-4" />
					<AlertDescription>Exportador restaurado com os dados salvos anteriormente</AlertDescription>
				</Alert>
			)}

			<Card>
				<div className="p-4 sm:p-6">
					<h3 className="font-semibold text-base sm:text-lg mb-4">Nova Exportação</h3>

					<form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
						{/* Linha 1: Filtros Principais */}
						<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
							<div>
								<Label htmlFor="ano">
									Ano <span className="text-red-500">*</span>
								</Label>
								<SelectNative
									id="ano"
									value={ano}
									onChange={(e) => setAno(parseInt(e.target.value))}
									disabled={exportando}
									required>
									<option value="">Selecione...</option>
									{Array.from({ length: 5 }, (_, i) => currentYear - i).map((year) => (
										<option key={year} value={year}>
											{year}
										</option>
									))}
								</SelectNative>
							</div>

							<div>
								<Label htmlFor="modulo">
									Módulo <span className="text-red-500">*</span>
								</Label>
								<SelectNative
									id="modulo"
									value={modulo}
									onChange={(e) => setModulo(e.target.value as ModuloPrestacaoContas)}
									disabled={exportando}
									required>
									<option value="contabilidade">Contabilidade</option>
								</SelectNative>
							</div>

							{tipoGeracao === 'mensal' && (
								<div>
									<Label htmlFor="mes">
										Mês <span className="text-red-500">*</span>
									</Label>
									<SelectNative
										id="mes"
										value={mes}
										onChange={(e) => setMes(parseInt(e.target.value))}
										disabled={exportando}
										required={tipoGeracao === 'mensal'}>
										<option value="">Selecione...</option>
										<option value="1">Janeiro</option>
										<option value="2">Fevereiro</option>
										<option value="3">Março</option>
										<option value="4">Abril</option>
										<option value="5">Maio</option>
										<option value="6">Junho</option>
										<option value="7">Julho</option>
										<option value="8">Agosto</option>
										<option value="9">Setembro</option>
										<option value="10">Outubro</option>
										<option value="11">Novembro</option>
										<option value="12">Dezembro</option>
									</SelectNative>
								</div>
							)}
						</div>

						<Separator />

						{/* Linha 2: Tipo de Geração e Somente Ativos */}
						<div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
							<div>
								<Label className="mb-3 block">
									Tipo de Geração <span className="text-red-500">*</span>
								</Label>
								<RadioGroup
									value={tipoGeracao}
									onValueChange={(value) => setTipoGeracao(value as TipoGeracao)}
									disabled={exportando}>
									<div className="flex items-center space-x-2">
										<RadioGroupItem value="mensal" id="mensal" />
										<Label htmlFor="mensal" className="font-normal cursor-pointer">
											Mensal
										</Label>
									</div>
									<div className="flex items-center space-x-2">
										<RadioGroupItem value="abertura" id="abertura" />
										<Label htmlFor="abertura" className="font-normal cursor-pointer">
											Abertura
										</Label>
									</div>
									<div className="flex items-center space-x-2">
										<RadioGroupItem value="diario" id="diario" />
										<Label htmlFor="diario" className="font-normal cursor-pointer">
											Diário
										</Label>
									</div>
									<div className="flex items-center space-x-2">
										<RadioGroupItem value="fechamento" id="fechamento" />
										<Label htmlFor="fechamento" className="font-normal cursor-pointer">
											Fechamento
										</Label>
									</div>
								</RadioGroup>
							</div>

							<div className="flex items-center space-x-2">
								<Checkbox
									id="somenteAtivos"
									checked={somenteAtivos}
									onCheckedChange={(checked) => setSomenteAtivos(checked as boolean)}
									disabled={exportando}
								/>
								<Label htmlFor="somenteAtivos" className="font-normal cursor-pointer">
									Somente ativos
								</Label>
							</div>
						</div>

						<Separator />

						{/* Tabela de Arquivos */}
						<div>
							<div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
								<Label className="text-sm sm:text-base">
									Arquivos Disponíveis <span className="text-red-500">*</span>
								</Label>
								<div className="flex flex-wrap gap-2">
									<Button
										type="button"
										variant="outline"
										size="sm"
										onClick={handleSelecionarTodos}
										disabled={exportando || layoutsFiltrados.length === 0}
										className="flex-1 sm:flex-none text-xs sm:text-sm">
										Selecionar Todos
									</Button>
									<Button
										type="button"
										variant="outline"
										size="sm"
										onClick={handleDesmarcarTodos}
										disabled={exportando || arquivosSelecionados.length === 0}
										className="flex-1 sm:flex-none text-xs sm:text-sm">
										Desmarcar Todos
									</Button>

									<Dialog open={dialogOrdenacaoAberto} onOpenChange={setDialogOrdenacaoAberto}>
										<DialogTrigger asChild>
											<Button
												type="button"
												variant="outline"
												size="sm"
												disabled={exportando}
												className="flex-1 sm:flex-none text-xs sm:text-sm">
												<ListOrdered className="w-4 h-4 sm:mr-2" />
												<span className="hidden sm:inline">Ordenar Geração</span>
												<span className="sm:hidden">Ordenar</span>
											</Button>
										</DialogTrigger>
										<DialogContent className="max-w-full sm:max-w-2xl max-h-[90vh] w-[calc(100%-2rem)] overflow-hidden flex flex-col">
											<DialogHeader>
												<DialogTitle className="text-base sm:text-lg">
													Ordenar Geração de Arquivos
												</DialogTitle>
											</DialogHeader>

											<div className="space-y-2 overflow-y-auto flex-1 pr-2">
												{layouts.map((layout, index) => (
													<div
														key={layout.id}
														className="flex items-center justify-between gap-2 p-3 border rounded-lg">
														<div className="flex items-center gap-2 flex-1 min-w-0">
															<Badge variant="outline" className="text-xs flex-shrink-0">
																{layout.ordem}
															</Badge>
															<span className="font-medium text-xs sm:text-sm truncate">
																{layout.nome}
															</span>
															{!layout.ativo && (
																<Badge
																	variant="secondary"
																	className="text-xs flex-shrink-0">
																	Inativo
																</Badge>
															)}
														</div>
														<div className="flex gap-1 flex-shrink-0">
															<Button
																type="button"
																variant="ghost"
																size="sm"
																onClick={() => handleMoverLayoutAcima(index)}
																disabled={index === 0}
																className="h-8 w-8 p-0">
																<ArrowUp className="w-4 h-4" />
															</Button>
															<Button
																type="button"
																variant="ghost"
																size="sm"
																onClick={() => handleMoverLayoutAbaixo(index)}
																disabled={index === layouts.length - 1}
																className="h-8 w-8 p-0">
																<ArrowDown className="w-4 h-4" />
															</Button>
														</div>
													</div>
												))}
											</div>

											<DialogFooter className="flex-col-reverse sm:flex-row gap-2 sm:gap-0">
												<Button
													type="button"
													variant="outline"
													onClick={() => setDialogOrdenacaoAberto(false)}
													className="w-full sm:w-auto">
													Cancelar
												</Button>
												<Button
													type="button"
													onClick={handleSalvarOrdenacao}
													className="w-full sm:w-auto">
													Salvar Ordem
												</Button>
											</DialogFooter>
										</DialogContent>
									</Dialog>
								</div>
							</div>

							{loadingLayouts ? (
								<div className="flex items-center justify-center py-8">
									<Loader2 className="w-6 h-6 animate-spin" />
								</div>
							) : layoutsFiltrados.length === 0 ? (
								<Alert>
									<AlertCircle className="w-4 h-4" />
									<AlertDescription>
										Nenhum arquivo disponível para os filtros selecionados
									</AlertDescription>
								</Alert>
							) : (
								<div className="overflow-x-auto -mx-4 sm:mx-0 px-4 sm:px-0">
									<Table>
										<TableHeader>
											<TableRow>
												<TableHead className="w-10 sm:w-12">
													<span className="sr-only sm:not-sr-only">Selecionar</span>
												</TableHead>
												<TableHead className="min-w-[200px]">Arquivo</TableHead>
												<TableHead className="hidden sm:table-cell min-w-[140px]">
													Última Geração
												</TableHead>
												<TableHead className="text-center w-16 sm:w-20">Ordem</TableHead>
											</TableRow>
										</TableHeader>
										<TableBody>
											{layoutsFiltrados.map((layout) => (
												<TableRow key={layout.id}>
													<TableCell className="w-10 sm:w-12">
														<Checkbox
															checked={arquivosSelecionados.includes(layout.id)}
															onCheckedChange={() => handleArquivoToggle(layout.id)}
															disabled={exportando}
														/>
													</TableCell>
													<TableCell className="font-medium text-xs sm:text-sm">
														{layout.nome}
													</TableCell>
													<TableCell className="hidden sm:table-cell text-xs sm:text-sm">
														{layout.ultimaGeracao ? (
															<span className="text-gray-600 dark:text-gray-400">
																{layout.ultimaGeracao}
															</span>
														) : (
															<span className="text-gray-400">Nunca gerado</span>
														)}
													</TableCell>
													<TableCell className="text-center w-16 sm:w-20">
														<Badge variant="outline" className="text-xs">
															{layout.ordem}
														</Badge>
													</TableCell>
												</TableRow>
											))}
										</TableBody>
									</Table>
								</div>
							)}
						</div>

						{/* Rodapé com botões */}
						<div className="flex flex-col-reverse sm:flex-row gap-2 sm:gap-3 sm:justify-end pt-4 border-t">
							<Button
								type="button"
								variant="outline"
								onClick={handleLimpar}
								disabled={exportando}
								className="w-full sm:w-auto">
								Limpar
							</Button>
							<Button type="submit" disabled={exportando} className="w-full sm:w-auto">
								{exportando ? (
									<>
										<Loader2 className="w-4 h-4 mr-2 animate-spin" />
										Exportando...
									</>
								) : (
									'Exportar'
								)}
							</Button>
						</div>
					</form>
				</div>
			</Card>
		</div>
	);
}

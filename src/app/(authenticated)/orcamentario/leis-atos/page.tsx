'use client';

import { PageHeader } from '@/components/ui/page-header';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { SelectNative } from '@/components/ui/select-native';
import { Textarea } from '@/components/ui/textarea';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/table';
import { Loading } from '@/components/ui/loading';
import { EmptyState } from '@/components/ui/empty-state';
import {
	AlertDialog,
	AlertDialogAction,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogTitle,
	AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { orcamentarioApi } from '@/app/features/orcamentario/api/orcamentario-api';
import { toast } from 'sonner';
import { FileText, Trash2, Plus, Edit2 } from 'lucide-react';

const TIPOS_ATO = [
	{ value: 'lei', label: 'Lei' },
	{ value: 'decreto', label: 'Decreto' },
	{ value: 'resolucao', label: 'Resolução' },
	{ value: 'ato_gestor', label: 'Ato do Gestor' },
];

export default function LeisAtosPage() {
	const queryClient = useQueryClient();
	const [showForm, setShowForm] = useState(false);
	const [editandoId, setEditandoId] = useState<number | null>(null);
	const [itemParaExcluir, setItemParaExcluir] = useState<number | null>(null);

	const [numero, setNumero] = useState('');
	const [tipo, setTipo] = useState('');
	const [dataAto, setDataAto] = useState('');
	const [dataPublicacao, setDataPublicacao] = useState('');
	const [descricao, setDescricao] = useState('');
	const [arquivo, setArquivo] = useState<File | null>(null);

	const { data: leisAtos, isLoading } = useQuery({
		queryKey: ['leis-atos'],
		queryFn: orcamentarioApi.getLeisAtos,
	});

	const { mutate: criar, isPending: isCriando } = useMutation({
		mutationFn: () =>
			orcamentarioApi.criarLeiAto({
				numero,
				tipo,
				data_ato: dataAto,
				data_publicacao: dataPublicacao,
				descricao,
				arquivo: arquivo || undefined,
			}),
		onSuccess: () => {
			toast.success('Lei/Ato cadastrado com sucesso!');
			queryClient.invalidateQueries({ queryKey: ['leis-atos'] });
			resetForm();
		},
		onError: (error: any) => {
			toast.error(error?.message || 'Erro ao cadastrar lei/ato');
		},
	});

	const { mutate: atualizar, isPending: isAtualizando } = useMutation({
		mutationFn: () =>
			orcamentarioApi.atualizarLeiAto(editandoId!, {
				numero,
				tipo,
				data_ato: dataAto,
				data_publicacao: dataPublicacao,
				descricao,
				arquivo: arquivo || undefined,
			}),
		onSuccess: () => {
			toast.success('Lei/Ato atualizado com sucesso!');
			queryClient.invalidateQueries({ queryKey: ['leis-atos'] });
			resetForm();
		},
		onError: (error: any) => {
			toast.error(error?.message || 'Erro ao atualizar lei/ato');
		},
	});

	const { mutate: deletar } = useMutation({
		mutationFn: orcamentarioApi.deletarLeiAto,
		onSuccess: () => {
			toast.success('Lei/Ato excluído com sucesso!');
			queryClient.invalidateQueries({ queryKey: ['leis-atos'] });
			setItemParaExcluir(null);
		},
		onError: (error: any) => {
			const mensagem = error?.message || 'Erro ao excluir lei/ato';
			if (mensagem.includes('vinculadas') || mensagem.includes('vinculada')) {
				toast.error('Não é possível excluir esta lei/ato pois existem alterações vinculadas');
			} else {
				toast.error(mensagem);
			}
			setItemParaExcluir(null);
		},
	});

	const resetForm = () => {
		setShowForm(false);
		setEditandoId(null);
		setNumero('');
		setTipo('');
		setDataAto('');
		setDataPublicacao('');
		setDescricao('');
		setArquivo(null);
	};

	const handleEdit = (leiAto: any) => {
		setEditandoId(leiAto.id);
		setNumero(leiAto.numero);
		setTipo(leiAto.tipo);
		setDataAto(leiAto.data_ato);
		setDataPublicacao(leiAto.data_publicacao);
		setDescricao(leiAto.descricao || '');
		setArquivo(null);
		setShowForm(true);
	};

	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault();

		if (!numero || !tipo || !dataAto || !dataPublicacao || !descricao) {
			toast.error('Preencha todos os campos obrigatórios');
			return;
		}

		if (editandoId) {
			atualizar();
		} else {
			criar();
		}
	};

	if (isLoading) {
		return <Loading text="Carregando leis e atos..." />;
	}

	const leisAtosList = Array.isArray(leisAtos) ? leisAtos : [];
	const isProcessando = isCriando || isAtualizando;

	const getTipoLabel = (tipo: string) => {
		const tipoObj = TIPOS_ATO.find((t) => t.value === tipo);
		return tipoObj?.label || tipo;
	};

	return (
		<div className="space-y-6">
			<PageHeader
				title="Leis e Atos"
				description="Cadastro e gerenciamento de leis e atos normativos"
				action={
					<Button
						onClick={() => {
							if (showForm) {
								resetForm();
							} else {
								setShowForm(true);
							}
						}}
						className="w-full sm:w-auto">
						<Plus className="w-4 h-4 sm:mr-2" />
						<span className="hidden sm:inline">{showForm ? 'Cancelar' : 'Nova Lei/Ato'}</span>
						<span className="sm:hidden">{showForm ? 'Cancelar' : 'Nova'}</span>
					</Button>
				}
			/>

			{showForm && (
				<Card>
					<div className="p-4 sm:p-6">
						<h3 className="font-semibold text-base sm:text-lg mb-4">
							{editandoId ? 'Editar Lei/Ato' : 'Nova Lei/Ato'}
						</h3>

						<form onSubmit={handleSubmit} className="space-y-4">
							<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
								<div>
									<Label htmlFor="numero">Número *</Label>
									<Input
										id="numero"
										placeholder="Ex: 001/2026"
										value={numero}
										onChange={(e) => setNumero(e.target.value)}
										disabled={isProcessando}
										required
									/>
								</div>

								<div>
									<Label htmlFor="tipo">Tipo *</Label>
									<SelectNative
										id="tipo"
										value={tipo}
										onChange={(e) => setTipo(e.target.value)}
										disabled={isProcessando}
										required>
										<option value="">Selecione...</option>
										{TIPOS_ATO.map((t) => (
											<option key={t.value} value={t.value}>
												{t.label}
											</option>
										))}
									</SelectNative>
								</div>

								<div>
									<Label htmlFor="data_ato">Data do Ato *</Label>
									<Input
										id="data_ato"
										type="date"
										value={dataAto}
										onChange={(e) => setDataAto(e.target.value)}
										disabled={isProcessando}
										required
									/>
								</div>

								<div>
									<Label htmlFor="data_publicacao">Data de Publicação *</Label>
									<Input
										id="data_publicacao"
										type="date"
										value={dataPublicacao}
										onChange={(e) => setDataPublicacao(e.target.value)}
										disabled={isProcessando}
										required
									/>
								</div>

								<div className="md:col-span-2">
									<Label htmlFor="descricao">Descrição *</Label>
									<Textarea
										id="descricao"
										placeholder="Descreva o conteúdo da lei/ato..."
										rows={3}
										value={descricao}
										onChange={(e) => setDescricao(e.target.value)}
										disabled={isProcessando}
										required
									/>
								</div>

								<div className="md:col-span-2">
									<Label htmlFor="arquivo">Arquivo (PDF)</Label>
									<Input
										id="arquivo"
										type="file"
										accept=".pdf"
										onChange={(e) => setArquivo(e.target.files?.[0] || null)}
										disabled={isProcessando}
									/>
								</div>
							</div>

							<div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-2 sm:gap-3 pt-4 border-t">
								<Button
									type="button"
									variant="outline"
									onClick={resetForm}
									disabled={isProcessando}
									className="w-full sm:w-auto">
									Cancelar
								</Button>
								<Button type="submit" disabled={isProcessando} className="w-full sm:w-auto">
									{isProcessando ? 'Salvando...' : 'Salvar'}
								</Button>
							</div>
						</form>
					</div>
				</Card>
			)}

			{leisAtosList.length === 0 ? (
				<Card>
					<EmptyState
						icon={<FileText className="w-12 h-12" />}
						title="Nenhuma lei ou ato cadastrado"
						description="Clique em 'Nova Lei/Ato' para cadastrar"
					/>
				</Card>
			) : (
				<>
					{/* Tabela para desktop */}
					<Card className="hidden lg:block">
						<div className="overflow-x-auto">
							<Table>
								<TableHeader>
									<TableRow>
										<TableHead>Número</TableHead>
										<TableHead>Tipo</TableHead>
										<TableHead>Data do Ato</TableHead>
										<TableHead>Data de Publicação</TableHead>
										<TableHead>Descrição</TableHead>
										<TableHead className="text-right">Ações</TableHead>
									</TableRow>
								</TableHeader>
								<TableBody>
									{leisAtosList.map((leiAto) => (
										<TableRow key={leiAto.id}>
											<TableCell className="font-medium">{leiAto.numero}</TableCell>
											<TableCell>{getTipoLabel(leiAto.tipo)}</TableCell>
											<TableCell>
												{new Date(leiAto.data_ato).toLocaleDateString('pt-BR')}
											</TableCell>
											<TableCell>
												{new Date(leiAto.data_publicacao).toLocaleDateString('pt-BR')}
											</TableCell>
											<TableCell className="max-w-md truncate">{leiAto.descricao}</TableCell>
											<TableCell className="text-right">
												<div className="flex justify-end gap-2">
													<Button
														size="sm"
														variant="ghost"
														onClick={() => handleEdit(leiAto)}>
														<Edit2 className="w-4 h-4" />
													</Button>
													<AlertDialog
														open={itemParaExcluir === leiAto.id}
														onOpenChange={(open) => !open && setItemParaExcluir(null)}>
														<AlertDialogTrigger asChild>
															<Button
																size="sm"
																variant="ghost"
																onClick={() => setItemParaExcluir(leiAto.id)}>
																<Trash2 className="w-4 h-4" />
															</Button>
														</AlertDialogTrigger>
														<AlertDialogContent className="max-w-[90vw] sm:max-w-lg">
															<AlertDialogHeader>
																<AlertDialogTitle>Confirmar Exclusão</AlertDialogTitle>
																<AlertDialogDescription>
																	Deseja realmente excluir esta lei/ato? Esta ação não
																	pode ser desfeita.
																</AlertDialogDescription>
															</AlertDialogHeader>
															<AlertDialogFooter>
																<AlertDialogCancel>Cancelar</AlertDialogCancel>
																<AlertDialogAction
																	onClick={() => deletar(leiAto.id)}
																	className="bg-red-600 hover:bg-red-700">
																	Excluir
																</AlertDialogAction>
															</AlertDialogFooter>
														</AlertDialogContent>
													</AlertDialog>
												</div>
											</TableCell>
										</TableRow>
									))}
								</TableBody>
							</Table>
						</div>
					</Card>

					{/* Cards para mobile e tablet */}
					<div className="lg:hidden space-y-3">
						{leisAtosList.map((leiAto) => (
							<Card key={leiAto.id} className="p-4">
								<div className="space-y-3">
									<div className="flex items-start justify-between gap-2">
										<div>
											<p className="text-xs text-muted-foreground">Número</p>
											<p className="font-medium">{leiAto.numero}</p>
										</div>
										<div className="text-right">
											<p className="text-xs text-muted-foreground">Tipo</p>
											<p className="font-medium text-sm">{getTipoLabel(leiAto.tipo)}</p>
										</div>
									</div>

									<div className="grid grid-cols-2 gap-3 text-sm">
										<div>
											<p className="text-xs text-muted-foreground">Data do Ato</p>
											<p>{new Date(leiAto.data_ato).toLocaleDateString('pt-BR')}</p>
										</div>
										<div>
											<p className="text-xs text-muted-foreground">Data de Publicação</p>
											<p>{new Date(leiAto.data_publicacao).toLocaleDateString('pt-BR')}</p>
										</div>
									</div>

									<div>
										<p className="text-xs text-muted-foreground mb-1">Descrição</p>
										<p className="text-sm line-clamp-2">{leiAto.descricao}</p>
									</div>

									<div className="flex gap-2 pt-2 border-t">
										<Button
											size="sm"
											variant="outline"
											className="flex-1"
											onClick={() => handleEdit(leiAto)}>
											<Edit2 className="w-4 h-4 mr-2" />
											Editar
										</Button>
										<AlertDialog
											open={itemParaExcluir === leiAto.id}
											onOpenChange={(open) => !open && setItemParaExcluir(null)}>
											<AlertDialogTrigger asChild>
												<Button
													size="sm"
													variant="outline"
													className="flex-1"
													onClick={() => setItemParaExcluir(leiAto.id)}>
													<Trash2 className="w-4 h-4 mr-2" />
													Excluir
												</Button>
											</AlertDialogTrigger>
											<AlertDialogContent className="max-w-[90vw] sm:max-w-lg">
												<AlertDialogHeader>
													<AlertDialogTitle>Confirmar Exclusão</AlertDialogTitle>
													<AlertDialogDescription>
														Deseja realmente excluir esta lei/ato? Esta ação não pode ser
														desfeita.
													</AlertDialogDescription>
												</AlertDialogHeader>
												<AlertDialogFooter>
													<AlertDialogCancel>Cancelar</AlertDialogCancel>
													<AlertDialogAction
														onClick={() => deletar(leiAto.id)}
														className="bg-red-600 hover:bg-red-700">
														Excluir
													</AlertDialogAction>
												</AlertDialogFooter>
											</AlertDialogContent>
										</AlertDialog>
									</div>
								</div>
							</Card>
						))}
					</div>
				</>
			)}
		</div>
	);
}

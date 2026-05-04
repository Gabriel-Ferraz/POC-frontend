'use client';

import { PageHeader } from '@/components/ui/page-header';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { suporteApi } from '@/app/features/suporte/api/suporte-api';
import { toast } from 'sonner';
import { Upload, X, FileText, Eye, Minimize2, Headset } from 'lucide-react';
import { useAuth } from '@/providers/AuthProvider';
import { useFormMinimize } from '@/hooks/useFormMinimize';

interface FormData {
	modulo: string;
	assunto: string;
	anexosInfo: Array<{ name: string; size: number; type: string }>;
}

export default function NovoChamadoPage() {
	const router = useRouter();
	const queryClient = useQueryClient();
	const { user } = useAuth();
	const [modulo, setModulo] = useState('');
	const [assunto, setAssunto] = useState('');
	const [anexos, setAnexos] = useState<File[]>([]);

	const { minimizar, isMinimizado, temDadosRestaurados } = useFormMinimize<FormData>({
		titulo: 'Novo Chamado de Suporte',
		icone: <Headset className="w-4 h-4" />,
		onRestore: (dados) => {
			setModulo(dados.modulo);
			setAssunto(dados.assunto);
			// Nota: Arquivos não podem ser restaurados (File API limitation)
			toast.success('Formulário restaurado! Anexos precisam ser adicionados novamente.');
		},
	});

	const { mutate: criarChamado, isPending } = useMutation({
		mutationFn: suporteApi.criarChamado,
		onSuccess: () => {
			toast.success('Chamado aberto com sucesso!');
			queryClient.invalidateQueries({ queryKey: ['chamados'] });
			router.push('/suporte');
		},
		onError: (error: any) => {
			toast.error(error?.message || 'Erro ao abrir chamado');
		},
	});

	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault();

		if (!modulo || !assunto) {
			toast.error('Preencha todos os campos obrigatórios');
			return;
		}

		criarChamado({ modulo, assunto, anexos });
	};

	const handleLimpar = () => {
		setModulo('');
		setAssunto('');
		setAnexos([]);
		toast.success('Formulário limpo');
	};

	const handleAdicionarAnexos = (e: React.ChangeEvent<HTMLInputElement>) => {
		const files = Array.from(e.target.files || []);
		if (files.length === 0) return;

		// Validar tamanho (máximo 10MB por arquivo)
		const arquivosGrandes = files.filter((f) => f.size > 10 * 1024 * 1024);
		if (arquivosGrandes.length > 0) {
			toast.error('Alguns arquivos excedem o tamanho máximo de 10MB');
			return;
		}

		setAnexos([...anexos, ...files]);
		toast.success(`${files.length} arquivo(s) adicionado(s)`);
		e.target.value = ''; // Limpar input para permitir adicionar o mesmo arquivo novamente
	};

	const handleRemoverAnexo = (index: number) => {
		const novosAnexos = anexos.filter((_, i) => i !== index);
		setAnexos(novosAnexos);
		toast.success('Anexo removido');
	};

	const handleVisualizarAnexo = (file: File) => {
		const url = URL.createObjectURL(file);
		window.open(url, '_blank');
	};

	const handleMinimizar = () => {
		const formData: FormData = {
			modulo,
			assunto,
			anexosInfo: anexos.map((f) => ({ name: f.name, size: f.size, type: f.type })),
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
					<h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Formulário Minimizado</h3>
					<p className="text-sm text-gray-500 dark:text-gray-400">
						Clique na miniatura na barra inferior para restaurar
					</p>
				</div>
			</div>
		);
	}

	return (
		<div className="space-y-6">
			<PageHeader
				title="Novo Chamado"
				description="Abrir um novo chamado de suporte"
				action={
					<Button
						variant="outline"
						onClick={handleMinimizar}
						disabled={isPending}
						className="w-full sm:w-auto">
						<Minimize2 className="w-4 h-4 sm:mr-2" />
						<span className="hidden sm:inline">Minimizar</span>
					</Button>
				}
			/>

			{temDadosRestaurados && (
				<div className="bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
					<p className="text-sm text-blue-900 dark:text-blue-100">
						✓ Formulário restaurado com os dados salvos anteriormente
					</p>
				</div>
			)}

			<Card>
				<div className="p-4 sm:p-6">
					<form className="space-y-4 sm:space-y-6" onSubmit={handleSubmit}>
						<div>
							<Label htmlFor="de">De</Label>
							<Input id="de" value={user?.name ?? ''} disabled className="mt-1.5" />
						</div>

						<div>
							<Label htmlFor="modulo">
								Módulo <span className="text-red-500">*</span>
							</Label>
							<Select value={modulo} onValueChange={setModulo} disabled={isPending}>
								<SelectTrigger id="modulo" className="mt-1.5">
									<SelectValue placeholder="Selecione o módulo" />
								</SelectTrigger>
								<SelectContent>
									<SelectItem value="Portal do Fornecedor">Portal do Fornecedor</SelectItem>
									<SelectItem value="Painel do Gestor">Painel do Gestor</SelectItem>
									<SelectItem value="Suporte ao Usuário">Suporte ao Usuário</SelectItem>
									<SelectItem value="Prestação de Contas">Prestação de Contas</SelectItem>
									<SelectItem value="Orçamentário">Orçamentário</SelectItem>
									<SelectItem value="Administrativo">Administrativo</SelectItem>
								</SelectContent>
							</Select>
						</div>

						<div>
							<Label htmlFor="assunto">
								Assunto <span className="text-red-500">*</span>
							</Label>
							<Textarea
								id="assunto"
								placeholder="Descreva detalhadamente o problema..."
								rows={6}
								value={assunto}
								onChange={(e) => setAssunto(e.target.value)}
								disabled={isPending}
								className="mt-1.5 resize-none"
							/>
						</div>

						{/* Anexos */}
						<div>
							<Label>Anexos (Opcional)</Label>
							<div className="mt-2 space-y-3">
								{/* Botão para adicionar anexos */}
								<div>
									<input
										type="file"
										id="file-input"
										multiple
										className="hidden"
										onChange={handleAdicionarAnexos}
										disabled={isPending}
										accept=".pdf,.doc,.docx,.xls,.xlsx,.png,.jpg,.jpeg,.gif"
									/>
									<Button
										type="button"
										variant="outline"
										onClick={() => document.getElementById('file-input')?.click()}
										disabled={isPending}
										className="w-full sm:w-auto">
										<Upload className="w-4 h-4 mr-2" />
										Procurar Arquivos
									</Button>
									<p className="text-xs text-muted-foreground mt-2">
										Máximo 10MB por arquivo. Formatos: PDF, DOC, XLS, PNG, JPG
									</p>
								</div>

								{/* Lista de anexos */}
								{anexos.length > 0 && (
									<div className="border rounded-md p-3 space-y-2">
										<p className="text-sm font-medium">Arquivos Anexados ({anexos.length})</p>
										<div className="space-y-2">
											{anexos.map((file, index) => (
												<div
													key={index}
													className="flex flex-col sm:flex-row sm:items-center gap-2 p-2 bg-muted rounded-md">
													<div className="flex items-center gap-2 flex-1 min-w-0">
														<FileText className="w-4 h-4 text-muted-foreground flex-shrink-0" />
														<div className="flex-1 min-w-0">
															<p className="text-sm truncate">{file.name}</p>
															<p className="text-xs text-muted-foreground">
																{(file.size / 1024).toFixed(1)} KB
															</p>
														</div>
													</div>
													<div className="flex items-center gap-2 sm:ml-2">
														<Button
															type="button"
															variant="ghost"
															size="sm"
															onClick={() => handleVisualizarAnexo(file)}
															disabled={isPending}
															className="flex-1 sm:flex-none">
															<Eye className="w-4 h-4 sm:mr-0" />
															<span className="sm:hidden ml-2">Visualizar</span>
														</Button>
														<Button
															type="button"
															variant="ghost"
															size="sm"
															onClick={() => handleRemoverAnexo(index)}
															disabled={isPending}
															className="flex-1 sm:flex-none text-red-500 hover:text-red-600">
															<X className="w-4 h-4 sm:mr-0" />
															<span className="sm:hidden ml-2">Remover</span>
														</Button>
													</div>
												</div>
											))}
										</div>
									</div>
								)}
							</div>
						</div>

						<div className="flex flex-col-reverse sm:flex-row gap-2 sm:gap-3 sm:justify-end pt-4 border-t">
							<Button
								variant="outline"
								onClick={() => router.back()}
								type="button"
								disabled={isPending}
								className="w-full sm:w-auto">
								Cancelar
							</Button>
							<Button
								variant="outline"
								onClick={handleLimpar}
								type="button"
								disabled={isPending}
								className="w-full sm:w-auto">
								Limpar
							</Button>
							<Button type="submit" disabled={isPending} className="w-full sm:w-auto">
								{isPending ? 'Enviando...' : 'Enviar Chamado'}
							</Button>
						</div>
					</form>
				</div>
			</Card>
		</div>
	);
}

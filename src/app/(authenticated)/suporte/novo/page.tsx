'use client';

import { PageHeader } from '@/components/ui/page-header';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { suporteApi } from '@/app/features/suporte/api/suporte-api';
import { toast } from 'sonner';
import { Upload, X, FileText, Eye } from 'lucide-react';

export default function NovoChamadoPage() {
	const router = useRouter();
	const queryClient = useQueryClient();
	const [modulo, setModulo] = useState('');
	const [assunto, setAssunto] = useState('');
	const [anexos, setAnexos] = useState<File[]>([]);

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

	return (
		<div>
			<PageHeader title="Novo Chamado" description="Abrir um novo chamado de suporte" />

			<Card>
				<div className="p-6">
					<form className="space-y-6" onSubmit={handleSubmit}>
						<div>
							<Label htmlFor="modulo">
								Módulo <span className="text-red-500">*</span>
							</Label>
							<Input
								id="modulo"
								placeholder="Ex: Portal do Fornecedor"
								value={modulo}
								onChange={(e) => setModulo(e.target.value)}
								disabled={isPending}
							/>
						</div>

						<div>
							<Label htmlFor="assunto">
								Assunto <span className="text-red-500">*</span>
							</Label>
							<Textarea
								id="assunto"
								placeholder="Descreva detalhadamente o problema..."
								rows={8}
								value={assunto}
								onChange={(e) => setAssunto(e.target.value)}
								disabled={isPending}
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
										className="w-full md:w-auto">
										<Upload className="w-4 h-4 mr-2" />
										Procurar Arquivos
									</Button>
									<p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
										Máximo 10MB por arquivo. Formatos: PDF, DOC, XLS, PNG, JPG
									</p>
								</div>

								{/* Lista de anexos */}
								{anexos.length > 0 && (
									<div className="border border-gray-300 dark:border-gray-600 rounded-md p-4 space-y-2">
										<p className="text-sm font-medium text-gray-700 dark:text-gray-300">
											Arquivos Anexados ({anexos.length})
										</p>
										{anexos.map((file, index) => (
											<div
												key={index}
												className="flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-800 rounded-md">
												<div className="flex items-center gap-2 flex-1 min-w-0">
													<FileText className="w-4 h-4 text-gray-500 flex-shrink-0" />
													<span className="text-sm text-gray-700 dark:text-gray-300 truncate">
														{file.name}
													</span>
													<span className="text-xs text-gray-500 flex-shrink-0">
														({(file.size / 1024).toFixed(1)} KB)
													</span>
												</div>
												<div className="flex items-center gap-2 ml-2">
													<Button
														type="button"
														variant="ghost"
														size="sm"
														onClick={() => handleVisualizarAnexo(file)}
														disabled={isPending}>
														<Eye className="w-4 h-4" />
													</Button>
													<Button
														type="button"
														variant="ghost"
														size="sm"
														onClick={() => handleRemoverAnexo(index)}
														disabled={isPending}>
														<X className="w-4 h-4 text-red-500" />
													</Button>
												</div>
											</div>
										))}
									</div>
								)}
							</div>
						</div>

						<div className="flex gap-3 justify-end pt-4 border-t border-gray-200 dark:border-gray-700">
							<Button variant="outline" onClick={() => router.back()} type="button" disabled={isPending}>
								Cancelar
							</Button>
							<Button variant="outline" onClick={handleLimpar} type="button" disabled={isPending}>
								Limpar
							</Button>
							<Button type="submit" disabled={isPending}>
								{isPending ? 'Enviando...' : 'Enviar Chamado'}
							</Button>
						</div>
					</form>
				</div>
			</Card>
		</div>
	);
}

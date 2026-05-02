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
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { orcamentarioApi } from '@/app/features/orcamentario/api/orcamentario-api';
import { toast } from 'sonner';
import { FileText, Trash2, Plus } from 'lucide-react';

const TIPOS_ATO = ['Lei', 'Decreto', 'Resolução', 'Portaria'];

export default function LeisAtosPage() {
	const queryClient = useQueryClient();
	const [showForm, setShowForm] = useState(false);

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
			setShowForm(false);
			// Reset form
			setNumero('');
			setTipo('');
			setDataAto('');
			setDataPublicacao('');
			setDescricao('');
			setArquivo(null);
		},
		onError: (error: any) => {
			toast.error(error?.message || 'Erro ao cadastrar lei/ato');
		},
	});

	const { mutate: deletar } = useMutation({
		mutationFn: orcamentarioApi.deletarLeiAto,
		onSuccess: () => {
			toast.success('Lei/Ato excluído com sucesso!');
			queryClient.invalidateQueries({ queryKey: ['leis-atos'] });
		},
		onError: (error: any) => {
			toast.error(error?.message || 'Erro ao excluir lei/ato');
		},
	});

	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault();

		if (!numero || !tipo || !dataAto || !dataPublicacao || !descricao) {
			toast.error('Preencha todos os campos obrigatórios');
			return;
		}

		criar();
	};

	if (isLoading) {
		return <Loading text="Carregando leis e atos..." />;
	}

	const leisAtosList = Array.isArray(leisAtos) ? leisAtos : [];

	return (
		<div className="space-y-6">
			<PageHeader
				title="Leis e Atos"
				description="Cadastro e gerenciamento de leis e atos normativos"
				action={
					<Button onClick={() => setShowForm(!showForm)}>
						<Plus className="w-4 h-4 mr-2" />
						{showForm ? 'Cancelar' : 'Nova Lei/Ato'}
					</Button>
				}
			/>

			{showForm && (
				<Card>
					<div className="p-6">
						<h3 className="font-semibold text-lg mb-4">Nova Lei/Ato</h3>

						<form onSubmit={handleSubmit} className="space-y-4">
							<div className="grid grid-cols-2 gap-4">
								<div>
									<Label htmlFor="numero">Número *</Label>
									<Input
										id="numero"
										placeholder="Ex: 001/2026"
										value={numero}
										onChange={(e) => setNumero(e.target.value)}
										disabled={isCriando}
										required
									/>
								</div>

								<div>
									<Label htmlFor="tipo">Tipo *</Label>
									<SelectNative
										id="tipo"
										value={tipo}
										onChange={(e) => setTipo(e.target.value)}
										disabled={isCriando}
										required>
										<option value="">Selecione...</option>
										{TIPOS_ATO.map((t) => (
											<option key={t} value={t}>
												{t}
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
										disabled={isCriando}
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
										disabled={isCriando}
										required
									/>
								</div>

								<div className="col-span-2">
									<Label htmlFor="descricao">Descrição *</Label>
									<Textarea
										id="descricao"
										placeholder="Descreva o conteúdo da lei/ato..."
										rows={3}
										value={descricao}
										onChange={(e) => setDescricao(e.target.value)}
										disabled={isCriando}
										required
									/>
								</div>

								<div className="col-span-2">
									<Label htmlFor="arquivo">Arquivo (PDF)</Label>
									<Input
										id="arquivo"
										type="file"
										accept=".pdf"
										onChange={(e) => setArquivo(e.target.files?.[0] || null)}
										disabled={isCriando}
									/>
								</div>
							</div>

							<div className="flex justify-end gap-3 pt-4 border-t">
								<Button type="button" variant="outline" onClick={() => setShowForm(false)}>
									Cancelar
								</Button>
								<Button type="submit" disabled={isCriando}>
									{isCriando ? 'Salvando...' : 'Salvar'}
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
				<Card>
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
									<TableCell>{leiAto.tipo}</TableCell>
									<TableCell>{new Date(leiAto.data_ato).toLocaleDateString('pt-BR')}</TableCell>
									<TableCell>
										{new Date(leiAto.data_publicacao).toLocaleDateString('pt-BR')}
									</TableCell>
									<TableCell className="max-w-md truncate">{leiAto.descricao}</TableCell>
									<TableCell className="text-right">
										<Button
											size="sm"
											variant="outline"
											onClick={() => {
												if (confirm('Deseja realmente excluir esta lei/ato?')) {
													deletar(leiAto.id);
												}
											}}>
											<Trash2 className="w-4 h-4" />
										</Button>
									</TableCell>
								</TableRow>
							))}
						</TableBody>
					</Table>
				</Card>
			)}
		</div>
	);
}

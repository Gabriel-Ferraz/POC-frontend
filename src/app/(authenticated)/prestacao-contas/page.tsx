'use client';

import { PageHeader } from '@/components/ui/page-header';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { SelectNative } from '@/components/ui/select-native';
import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { prestacaoContasApi } from '@/app/features/prestacao-contas/api/prestacao-contas-api';
import { toast } from 'sonner';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/table';
import { Download, FileDown } from 'lucide-react';

const MODULOS = ['Empenhos', 'Liquidações', 'Pagamentos', 'Contratos'];

const ARQUIVOS_DISPONIVEIS = [
	{ label: 'Plano Contábil', value: 'PlanoContabil' },
	{ label: 'Movimento Mensal', value: 'MovimentoMensal' },
	{ label: 'Balancete', value: 'Balancete' },
	{ label: 'Receita', value: 'Receita' },
	{ label: 'Despesa', value: 'Despesa' },
];

export default function PrestacaoContasPage() {
	const queryClient = useQueryClient();
	const currentYear = new Date().getFullYear();

	const [ano, setAno] = useState(currentYear.toString());
	const [modulo, setModulo] = useState('');
	const [mes, setMes] = useState('');
	const [arquivosSelecionados, setArquivosSelecionados] = useState<string[]>([]);

	const { data: exportacoes } = useQuery({
		queryKey: ['exportacoes'],
		queryFn: prestacaoContasApi.getExportacoes,
	});

	const { mutate: exportar, isPending } = useMutation({
		mutationFn: () =>
			prestacaoContasApi.exportar({
				ano: parseInt(ano),
				modulo,
				tipo_geracao: 'completo',
				mes: mes ? parseInt(mes) : undefined,
				arquivos_selecionados: arquivosSelecionados,
			}),
		onSuccess: (data) => {
			toast.success('Exportação realizada com sucesso!');
			queryClient.invalidateQueries({ queryKey: ['exportacoes'] });
			// Reset form
			setModulo('');
			setMes('');
			setArquivosSelecionados([]);
		},
		onError: (error: any) => {
			toast.error(error?.message || 'Erro ao exportar dados');
		},
	});

	const handleArquivoToggle = (arquivo: string) => {
		setArquivosSelecionados((prev) =>
			prev.includes(arquivo) ? prev.filter((a) => a !== arquivo) : [...prev, arquivo]
		);
	};

	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault();

		if (!ano || !modulo || arquivosSelecionados.length === 0) {
			toast.error('Preencha ano, módulo e selecione pelo menos um arquivo');
			return;
		}

		exportar();
	};

	const exportacoesList = Array.isArray(exportacoes) ? exportacoes : [];

	return (
		<div className="space-y-6">
			<PageHeader title="Exportador SIM-AM" description="Exportação de dados para o sistema SIM-AM da CGM" />

			<Card>
				<div className="p-6">
					<h3 className="font-semibold text-lg mb-4">Nova Exportação</h3>

					<form onSubmit={handleSubmit} className="space-y-4">
						<div className="grid grid-cols-3 gap-4">
							<div>
								<Label htmlFor="ano">Ano *</Label>
								<SelectNative
									id="ano"
									value={ano}
									onChange={(e) => setAno(e.target.value)}
									disabled={isPending}
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
								<Label htmlFor="modulo">Módulo *</Label>
								<SelectNative
									id="modulo"
									value={modulo}
									onChange={(e) => setModulo(e.target.value)}
									disabled={isPending}
									required>
									<option value="">Selecione...</option>
									{MODULOS.map((mod) => (
										<option key={mod} value={mod}>
											{mod}
										</option>
									))}
								</SelectNative>
							</div>

							<div>
								<Label htmlFor="mes">Mês (Opcional)</Label>
								<SelectNative
									id="mes"
									value={mes}
									onChange={(e) => setMes(e.target.value)}
									disabled={isPending}>
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
						</div>

						<div>
							<Label>Arquivos para Exportação *</Label>
							<div className="mt-2 space-y-2">
								{ARQUIVOS_DISPONIVEIS.map((arquivo) => (
									<label key={arquivo.value} className="flex items-center gap-2 cursor-pointer">
										<input
											type="checkbox"
											checked={arquivosSelecionados.includes(arquivo.value)}
											onChange={() => handleArquivoToggle(arquivo.value)}
											disabled={isPending}
											className="w-4 h-4"
										/>
										<span className="text-sm">{arquivo.label}</span>
									</label>
								))}
							</div>
						</div>

						<div className="flex justify-end pt-4 border-t">
							<Button type="submit" disabled={isPending}>
								{isPending ? 'Exportando...' : 'Exportar Dados'}
							</Button>
						</div>
					</form>
				</div>
			</Card>

			{exportacoesList.length > 0 && (
				<Card>
					<div className="p-6">
						<h3 className="font-semibold text-lg mb-4">Exportações Recentes</h3>

						<Table>
							<TableHeader>
								<TableRow>
									<TableHead>Data</TableHead>
									<TableHead>Ano/Mês</TableHead>
									<TableHead>Módulo</TableHead>
									<TableHead>Registros</TableHead>
									<TableHead className="text-right">Ações</TableHead>
								</TableRow>
							</TableHeader>
							<TableBody>
								{exportacoesList.map((exp) => (
									<TableRow key={exp.id}>
										<TableCell>{new Date(exp.created_at).toLocaleString('pt-BR')}</TableCell>
										<TableCell>
											{exp.ano}/{exp.mes.toString().padStart(2, '0')}
										</TableCell>
										<TableCell>{exp.modulo}</TableCell>
										<TableCell>{exp.quantidade_registros} registros</TableCell>
										<TableCell className="text-right">
											<a
												href={prestacaoContasApi.getDownloadUrl(exp.id)}
												target="_blank"
												rel="noopener noreferrer">
												<Button size="sm" variant="outline">
													<Download className="w-4 h-4 mr-2" />
													Download
												</Button>
											</a>
										</TableCell>
									</TableRow>
								))}
							</TableBody>
						</Table>
					</div>
				</Card>
			)}
		</div>
	);
}

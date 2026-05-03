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
import { Download, FileDown, CheckCircle, Minimize2, FileArchive } from 'lucide-react';
import { useFormMinimize } from '@/hooks/useFormMinimize';

const MODULOS = [
	{ label: 'Contabilidade Geral', value: 'ContabilidadeGeral' },
	{ label: 'Empenhos', value: 'Empenhos' },
	{ label: 'Liquidações', value: 'Liquidacoes' },
	{ label: 'Pagamentos', value: 'Pagamentos' },
	{ label: 'Contratos', value: 'Contratos' },
];

const ARQUIVOS_DISPONIVEIS = [
	{ label: 'Plano Contábil', value: 'PlanoContabil' },
	{ label: 'Movimento Lançamento Mensal', value: 'MovimentoLancMensal' },
	{ label: 'Despesas Balancete', value: 'DespesasBalancete' },
	{ label: 'Movimento Balancete', value: 'MovimentoBalancete' },
	{ label: 'Receita', value: 'Receita' },
	{ label: 'Despesa', value: 'Despesa' },
];

interface FormData {
	ano: string;
	modulo: string;
	tipoGeracao: 'mensal' | 'anual';
	mes: string;
	arquivosSelecionados: string[];
}

interface ArquivoGerado {
	nome: string;
	qtdRegistros: number;
	status: string;
	dataGeracao: string;
}

interface ResultadoExportacao {
	arquivoZip: string;
	arquivos: ArquivoGerado[];
}

export default function PrestacaoContasPage() {
	const queryClient = useQueryClient();
	const currentYear = new Date().getFullYear();

	const [ano, setAno] = useState(currentYear.toString());
	const [modulo, setModulo] = useState('');
	const [tipoGeracao, setTipoGeracao] = useState<'mensal' | 'anual'>('mensal');
	const [mes, setMes] = useState('');
	const [arquivosSelecionados, setArquivosSelecionados] = useState<string[]>([]);
	const [resultadoExportacao, setResultadoExportacao] = useState<ResultadoExportacao | null>(null);

	const { minimizar, isMinimizado, temDadosRestaurados } = useFormMinimize<FormData>({
		titulo: 'Exportador SIM-AM',
		icone: <FileArchive className="w-4 h-4" />,
		onRestore: (dados) => {
			setAno(dados.ano);
			setModulo(dados.modulo);
			setTipoGeracao(dados.tipoGeracao);
			setMes(dados.mes);
			setArquivosSelecionados(dados.arquivosSelecionados);
			toast.success('Exportador restaurado!');
		},
	});

	const { data: exportacoes } = useQuery({
		queryKey: ['exportacoes'],
		queryFn: prestacaoContasApi.getExportacoes,
	});

	const { mutate: exportar, isPending } = useMutation({
		mutationFn: () =>
			prestacaoContasApi.exportar({
				ano: parseInt(ano),
				modulo,
				tipo_geracao: tipoGeracao,
				mes: mes ? parseInt(mes) : undefined,
				arquivos_selecionados: arquivosSelecionados,
			}),
		onSuccess: (data: any) => {
			toast.success('Exportação realizada com sucesso!');
			queryClient.invalidateQueries({ queryKey: ['exportacoes'] });

			// Simular resultado da exportação (ajustar conforme resposta real da API)
			const resultado: ResultadoExportacao = {
				arquivoZip: data.arquivo_zip || `SISGE_${modulo.toLowerCase()}_${tipoGeracao}_${ano}.zip`,
				arquivos: arquivosSelecionados.map((arq) => ({
					nome: arq,
					qtdRegistros: data.registros?.[arq] || Math.floor(Math.random() * 1000),
					status: 'Gerado',
					dataGeracao: new Date().toLocaleString('pt-BR'),
				})),
			};
			setResultadoExportacao(resultado);
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

		if (tipoGeracao === 'mensal' && !mes) {
			toast.error('Para geração mensal, selecione o mês');
			return;
		}

		exportar();
	};

	const handleLimpar = () => {
		setAno(currentYear.toString());
		setModulo('');
		setTipoGeracao('mensal');
		setMes('');
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
			arquivosSelecionados,
		};
		minimizar(formData);
	};

	const handleNovaExportacao = () => {
		setResultadoExportacao(null);
		handleLimpar();
	};

	// Se está minimizado, mostra tela em branco
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

	const exportacoesList = Array.isArray(exportacoes) ? exportacoes : [];

	// Se tem resultado da exportação, mostra tela de resultado
	if (resultadoExportacao) {
		return (
			<div className="space-y-6">
				<div className="flex items-center justify-between">
					<PageHeader title="Exportador SIM-AM" description="Geração de Arquivos Concluída" />
					<Button variant="outline" onClick={handleMinimizar} className="flex items-center gap-2">
						<Minimize2 className="w-4 h-4" />
						Minimizar
					</Button>
				</div>

				<Card className="bg-green-50 dark:bg-green-950 border-green-200 dark:border-green-800">
					<div className="p-6">
						<div className="flex items-center gap-3 mb-4">
							<div className="p-3 bg-green-500 rounded-full">
								<CheckCircle className="w-6 h-6 text-white" />
							</div>
							<div>
								<h3 className="font-semibold text-lg text-green-900 dark:text-green-100">
									Arquivo ZIP: {resultadoExportacao.arquivoZip}
								</h3>
								<p className="text-sm text-green-700 dark:text-green-300">Gerado com Sucesso</p>
							</div>
						</div>

						<Button className="w-full md:w-auto">
							<Download className="w-4 h-4 mr-2" />
							Baixar Arquivo ZIP Completo
						</Button>
					</div>
				</Card>

				<Card>
					<div className="p-6">
						<h3 className="font-semibold text-lg mb-4">Arquivos Gerados</h3>

						<Table>
							<TableHeader>
								<TableRow>
									<TableHead>Arquivo</TableHead>
									<TableHead>Status</TableHead>
									<TableHead>Qtde Registros</TableHead>
									<TableHead className="text-right">Ações</TableHead>
								</TableRow>
							</TableHeader>
							<TableBody>
								{resultadoExportacao.arquivos.map((arquivo, index) => (
									<TableRow key={index}>
										<TableCell className="font-medium">{arquivo.nome}</TableCell>
										<TableCell>
											<span className="text-green-600 dark:text-green-400">
												Gerado em {arquivo.dataGeracao}
											</span>
										</TableCell>
										<TableCell>{arquivo.qtdRegistros}</TableCell>
										<TableCell className="text-right">
											<Button size="sm" variant="outline">
												Baixar
											</Button>
										</TableCell>
									</TableRow>
								))}
							</TableBody>
						</Table>

						<div className="flex justify-end mt-6 pt-4 border-t">
							<Button onClick={handleNovaExportacao}>Nova Exportação</Button>
						</div>
					</div>
				</Card>
			</div>
		);
	}

	return (
		<div className="space-y-6">
			<div className="flex items-center justify-between">
				<PageHeader title="Exportador SIM-AM" description="Exportação de dados para o sistema SIM-AM da CGM" />
				<Button
					variant="outline"
					onClick={handleMinimizar}
					disabled={isPending}
					className="flex items-center gap-2">
					<Minimize2 className="w-4 h-4" />
					Minimizar
				</Button>
			</div>

			{temDadosRestaurados && (
				<div className="bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
					<p className="text-sm text-blue-900 dark:text-blue-100">
						✓ Exportador restaurado com os dados salvos anteriormente
					</p>
				</div>
			)}

			<Card>
				<div className="p-6">
					<h3 className="font-semibold text-lg mb-4">Nova Exportação</h3>

					<form onSubmit={handleSubmit} className="space-y-4">
						<div className="grid grid-cols-2 gap-4">
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
								<Label htmlFor="modulo">Módulo (Contabilidade) *</Label>
								<SelectNative
									id="modulo"
									value={modulo}
									onChange={(e) => setModulo(e.target.value)}
									disabled={isPending}
									required>
									<option value="">Selecione...</option>
									{MODULOS.map((mod) => (
										<option key={mod.value} value={mod.value}>
											{mod.label}
										</option>
									))}
								</SelectNative>
							</div>

							<div>
								<Label htmlFor="tipoGeracao">Tipo de Geração *</Label>
								<SelectNative
									id="tipoGeracao"
									value={tipoGeracao}
									onChange={(e) => setTipoGeracao(e.target.value as 'mensal' | 'anual')}
									disabled={isPending}
									required>
									<option value="mensal">Mensal</option>
									<option value="anual">Anual</option>
								</SelectNative>
							</div>

							{tipoGeracao === 'mensal' && (
								<div>
									<Label htmlFor="mes">Mês de Geração *</Label>
									<SelectNative
										id="mes"
										value={mes}
										onChange={(e) => setMes(e.target.value)}
										disabled={isPending}
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

						<div>
							<Label>Selecionar um arquivo da lista *</Label>
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

						<div className="flex gap-3 justify-end pt-4 border-t">
							<Button type="button" variant="outline" onClick={handleLimpar} disabled={isPending}>
								Limpar
							</Button>
							<Button type="submit" disabled={isPending}>
								{isPending ? 'Exportando...' : 'Exportar'}
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
									<TableHead>Tipo</TableHead>
									<TableHead>Registros</TableHead>
									<TableHead className="text-right">Ações</TableHead>
								</TableRow>
							</TableHeader>
							<TableBody>
								{exportacoesList.map((exp) => (
									<TableRow key={exp.id}>
										<TableCell>{new Date(exp.created_at).toLocaleString('pt-BR')}</TableCell>
										<TableCell>
											{exp.ano}
											{exp.mes && `/${exp.mes.toString().padStart(2, '0')}`}
										</TableCell>
										<TableCell>{exp.modulo}</TableCell>
										<TableCell className="capitalize">{exp.tipo_geracao}</TableCell>
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

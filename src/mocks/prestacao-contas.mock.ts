import type { LayoutArquivo, ExportacaoGerada } from '@/types/prestacao-contas.types';

export const mockLayouts: LayoutArquivo[] = [
	{
		id: '1',
		nome: 'PlanoContabil',
		modulo: 'contabilidade',
		ordem: 1,
		ultimaGeracao: '01/05/2026 14:30',
		ativo: true,
	},
	{
		id: '2',
		nome: 'MovimentoContabilMensal',
		modulo: 'contabilidade',
		ordem: 2,
		ultimaGeracao: '28/04/2026 10:15',
		ativo: true,
	},
	{
		id: '3',
		nome: 'DiarioContabil',
		modulo: 'contabilidade',
		ordem: 3,
		ultimaGeracao: null,
		ativo: true,
	},
	{
		id: '4',
		nome: 'MovimentoRealizavel',
		modulo: 'contabilidade',
		ordem: 4,
		ultimaGeracao: '15/04/2026 09:00',
		ativo: true,
	},
	{
		id: '5',
		nome: 'BalanceteVerificacao',
		modulo: 'contabilidade',
		ordem: 5,
		ultimaGeracao: '01/05/2026 14:30',
		ativo: true,
	},
	{
		id: '6',
		nome: 'DespesaOrcamentaria',
		modulo: 'contabilidade',
		ordem: 6,
		ultimaGeracao: null,
		ativo: false,
	},
];

export const mockExportacaoGerada: ExportacaoGerada = {
	id: '1',
	zipName: '12526_contabil_II_mensal_2026_05.zip',
	status: 'sucesso',
	arquivos: [
		{
			id: '1',
			nome: 'PlanoContabil',
			status: 'gerado',
			quantidadeRegistros: 11,
			geradoEm: '03/05/2026 15:30:45',
			downloadUrl: '/downloads/plano_contabil.txt',
		},
		{
			id: '2',
			nome: 'MovimentoContabilMensal',
			status: 'gerado',
			quantidadeRegistros: 248,
			geradoEm: '03/05/2026 15:30:47',
			downloadUrl: '/downloads/movimento_contabil_mensal.txt',
		},
		{
			id: '3',
			nome: 'DiarioContabil',
			status: 'gerado',
			quantidadeRegistros: 1523,
			geradoEm: '03/05/2026 15:30:50',
			downloadUrl: '/downloads/diario_contabil.txt',
		},
	],
	createdAt: '2026-05-03T15:30:45.000Z',
};

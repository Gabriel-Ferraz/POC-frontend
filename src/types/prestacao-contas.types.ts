export type TipoGeracao = 'abertura' | 'diario' | 'fechamento' | 'mensal';

export type ModuloPrestacaoContas = 'contabilidade';

export type LayoutArquivo = {
	id: string;
	key: string; // Identificador único usado pelo backend para gerar o arquivo
	nome: string;
	modulo: ModuloPrestacaoContas;
	ordem: number;
	ultimaGeracao?: string | null;
	ativo: boolean;
};

export type ExportarPrestacaoContasPayload = {
	year: number;
	module: ModuloPrestacaoContas;
	generationType: TipoGeracao;
	month?: number;
	onlyActive: boolean;
	files: string[];
};

export type ArquivoGerado = {
	id: string;
	nome: string;
	status: 'gerado' | 'erro' | 'processando';
	quantidadeRegistros: number;
	geradoEm: string;
	downloadUrl?: string;
};

export type ExportacaoGerada = {
	id: string;
	zipName: string;
	status: 'sucesso' | 'erro' | 'processando';
	arquivos: ArquivoGerado[];
	createdAt: string;
};

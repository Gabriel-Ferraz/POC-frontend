import {
	PerfilUsuario,
	StatusEmpenho,
	StatusSolicitacao,
	StatusAnexo,
	StatusChamado,
	TipoAnexo,
	TipoAto,
	TipoCredito,
	TipoRecurso,
	FormaPagamento,
} from './enums';

export interface User {
	id: number;
	name: string;
	email: string;
	cpf: string;
	perfil: PerfilUsuario;
	fornecedor?: Fornecedor;
	created_at?: string;
	updated_at?: string;
}

export interface Fornecedor {
	id: number;
	nome: string;
	cnpj: string;
	responsavel_tecnico_id: number;
	responsavel_tecnico?: User;
	created_at?: string;
	updated_at?: string;
}

export interface Contrato {
	id: number;
	numero: string;
	fornecedor_id: number;
	fornecedor?: Fornecedor;
	data_inicio: string;
	data_fim: string;
	created_at?: string;
	updated_at?: string;
}

export interface Empenho {
	id: number;
	numero: string;
	contrato_id?: number;
	contrato?: string | Contrato; // API pode retornar string ou objeto
	valor: string | number; // API retorna como string
	saldo: string | number; // API retorna como string
	status: StatusEmpenho | string;
	data_emissao: string;
	created_at?: string;
	updated_at?: string;
}

export interface SolicitacaoPagamento {
	id: number;
	empenho_id: number;
	empenho?: Empenho;
	numero: string;
	valor: number;
	status: StatusSolicitacao;
	documento_fiscal_tipo: string;
	documento_fiscal_numero: string;
	documento_fiscal_serie?: string;
	documento_fiscal_data_emissao: string;
	forma_pagamento_tipo: FormaPagamento;
	banco?: string;
	agencia?: string;
	agencia_digito?: string;
	conta?: string;
	conta_digito?: string;
	operacao?: string;
	cidade_banco?: string;
	observacao?: string;
	solicitante?: User;
	created_at: string;
	updated_at: string;
	anexos?: AnexoSolicitacao[];
	tramites?: TramiteSolicitacao[];
}

export interface AnexoSolicitacao {
	id: number;
	solicitacao_id: number;
	solicitacao?: SolicitacaoPagamento;
	tipo_anexo: TipoAnexo;
	arquivo: string;
	arquivo_url?: string;
	status: StatusAnexo;
	motivo_recusa?: string;
	data_envio?: string;
	usuario_aprovacao_id?: number;
	usuario_aprovacao?: User;
	created_at?: string;
	updated_at?: string;
}

export interface TramiteSolicitacao {
	id: number;
	solicitacao_id: number;
	fase: string;
	usuario_id: number;
	usuario?: User;
	observacao?: string;
	created_at: string;
}

export interface Chamado {
	id: number;
	protocolo?: string;
	usuario_id: number;
	usuario?: string | User;
	responsavel?: string | null;
	responsavel_id?: number | null;
	modulo: string;
	assunto: string;
	mensagem?: string;
	status: StatusChamado | string;
	data_abertura?: string;
	data_cadastro?: string;
	data_ultima_resposta?: string;
	data_conclusao?: string;
	ultima_mensagem_por?: 'usuario' | 'gestor';
	tem_resposta_pendente?: boolean;
	created_at: string;
	updated_at: string;
	mensagens?: MensagemChamado[];
	anexos?: AnexoChamado[];
}

export interface MensagemChamado {
	id: number;
	chamado_id: number;
	usuario_id: number;
	usuario?: User;
	mensagem: string;
	created_at: string;
}

export interface AnexoChamado {
	id: number;
	chamado_id: number;
	arquivo: string;
	arquivo_url?: string;
	created_at: string;
}

export interface LeiAto {
	id: number;
	numero: string;
	tipo: string;
	data_ato: string;
	data_publicacao: string;
	descricao: string;
	arquivo?: string;
	arquivo_url?: string;
	created_at?: string;
	updated_at?: string;
}

export interface AlteracaoOrcamentaria {
	id: number;
	lei_ato_id: number;
	lei_ato?: LeiAto;
	decreto: string;
	tipo_ato: TipoAto;
	tipo_credito: TipoCredito;
	tipo_recurso: TipoRecurso;
	valor: number;
	data_ato: string;
	data_publicacao: string;
	dotacoes?: DotacaoAlterada[];
	created_at?: string;
	updated_at?: string;
}

export interface DotacaoAlterada {
	id: number;
	alteracao_id: number;
	dotacao: string;
	conta_receita: string;
	valor_suprimido: number;
	valor_suplementado: number;
	saldo_atual: number;
	novo_saldo: number;
	created_at?: string;
	updated_at?: string;
}

export interface ExportacaoPrestacaoContas {
	id: number;
	ano: number;
	modulo: string;
	tipo_geracao: string;
	mes: number;
	arquivos: string[];
	arquivo_gerado: string;
	arquivo_url?: string;
	quantidade_registros: number;
	created_at: string;
}

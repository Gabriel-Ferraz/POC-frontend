// Enums sincronizados com o backend Laravel

export enum PerfilUsuario {
	RESPONSAVEL_TECNICO = 'responsavel_tecnico',
	GESTOR_CONTRATO = 'gestor_contrato',
	OPERADOR_PMSJP = 'operador_pmsjp',
	GESTOR_SUPORTE = 'gestor_suporte',
	USUARIO_COMUM = 'usuario_comum',
	OPERADOR_ORCAMENTARIO = 'operador_orcamentario',
}

export enum StatusEmpenho {
	DISPONIVEL = 'Disponível',
	BLOQUEADO = 'Bloqueado',
	SEM_SALDO = 'Sem Saldo',
}

export enum StatusSolicitacao {
	PENDENTE = 'Pendente',
	AGUARDANDO_APROVACAO = 'Aguardando Aprovação dos Anexos',
	ANEXOS_RECUSADOS = 'Anexos Recusados',
	AGUARDANDO_GESTOR = 'Aguardando Autorização do Gestor',
	EM_LIQUIDACAO = 'Em Liquidação',
	EM_ORDEM_PAGAMENTO = 'Em Ordem de Pagamento',
	PAGAMENTO_REMESSA = 'Pagamento em Remessa',
	PAGAMENTO_REALIZADO = 'Pagamento Realizado',
	CANCELADA = 'Cancelada',
}

export enum StatusAnexo {
	PENDENTE = 'Pendente',
	ANEXO_CADASTRADO = 'Anexo Cadastrado',
	AGUARDANDO_APROVACAO = 'Aguardando Aprovação',
	APROVADO = 'Aprovado',
	RECUSADO = 'Recusado',
}

export enum StatusChamado {
	ABERTO = 'Aberto',
	EM_ATENDIMENTO = 'Em Atendimento',
	CONCLUIDO = 'Concluído',
}

export enum TipoAnexo {
	DOCUMENTO_FISCAL = 'Documento Fiscal',
	CND = 'Certidão Negativa de Débitos',
	CERTIDAO_TRIBUTARIA = 'Certidão Tributária',
	GPS = 'Guia de Previdência Social',
	FGTS = 'FGTS',
}

export enum TipoAto {
	DECRETO = 'Decreto',
	RESOLUCAO = 'Resolução',
	ATO_GESTOR = 'Ato Gestor',
}

export enum TipoCredito {
	ESPECIAL = 'Especial',
	SUPLEMENTAR = 'Suplementar',
	EXTRAORDINARIO = 'Extraordinário',
}

export enum TipoRecurso {
	SUPERAVIT = 'Superávit',
	EXCESSO_ARRECADACAO = 'Excesso de arrecadação',
}

export enum FormaPagamento {
	CONTA_BANCARIA = 'conta_bancaria',
	DOCUMENTO = 'documento',
}

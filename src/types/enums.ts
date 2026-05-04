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
	DISPONIVEL = 'disponivel',
	BLOQUEADO = 'bloqueado',
	SEM_SALDO = 'sem_saldo',
}

export enum StatusSolicitacao {
	// Fluxo natural (backend)
	PENDENTE = 'pendente',
	AGUARDANDO_APROVACAO_ANEXOS = 'aguardando_aprovacao_anexos',
	ANEXOS_RECUSADOS = 'anexos_recusados',
	AGUARDANDO_AUTORIZACAO_GESTOR = 'aguardando_autorizacao_gestor',
	EM_LIQUIDACAO = 'em_liquidacao',
	EM_ORDEM_PAGAMENTO = 'em_ordem_pagamento',
	PAGAMENTO_EM_REMESSA = 'pagamento_em_remessa',
	PAGAMENTO_REALIZADO = 'pagamento_realizado',
	CANCELADA = 'cancelada',
	// Statuses do admin (simplificados)
	RASCUNHO = 'rascunho',
	AGUARDANDO_APROVACAO = 'aguardando_aprovacao',
	ANEXOS = 'anexos',
	FISCAL = 'fiscal',
	GESTOR = 'gestor',
	LIQUIDACAO = 'liquidacao',
	SECRETARIO = 'secretario',
	ISS = 'iss',
	ORDEM_PAGAMENTO = 'ordem_pagamento',
	AUTORIZACAO = 'autorizacao',
	BORDERO = 'bordero',
	REMESSA = 'remessa',
	PAGAMENTO = 'pagamento',
	CANCELADO = 'cancelado',
}

export enum StatusAnexo {
	PENDENTE = 'pendente',
	ANEXO_CADASTRADO = 'anexo_cadastrado',
	AGUARDANDO_APROVACAO = 'aguardando_aprovacao',
	APROVADO = 'aprovado',
	RECUSADO = 'recusado',
}

export enum StatusChamado {
	ABERTO = 'aberto',
	EM_ATENDIMENTO = 'em_atendimento',
	CONCLUIDO = 'concluido',
}

export enum TipoAnexo {
	DOCUMENTO_FISCAL = 'Documento Fiscal',
	CND = 'Certidão Negativa de Débitos',
	CERTIDAO_TRIBUTARIA = 'Certidão Tributária',
	GPS = 'Guia de Previdência Social',
	FGTS = 'FGTS',
}

export enum TipoAto {
	DECRETO = 'decreto',
	RESOLUCAO = 'resolucao',
	ATO_GESTOR = 'ato_gestor',
}

export enum TipoCredito {
	ESPECIAL = 'especial',
	SUPLEMENTAR = 'suplementar',
	EXTRAORDINARIO = 'extraordinario',
}

export enum TipoRecurso {
	SUPERAVIT = 'superavit',
	EXCESSO_ARRECADACAO = 'excesso_arrecadacao',
	VALOR_CREDITO = 'valor_credito',
}

export enum TipoLei {
	LEI = 'lei',
	DECRETO = 'decreto',
	RESOLUCAO = 'resolucao',
	ATO_GESTOR = 'ato_gestor',
}

export enum FormaPagamento {
	CONTA_BANCARIA = 'conta_bancaria',
	DOCUMENTO = 'documento',
}

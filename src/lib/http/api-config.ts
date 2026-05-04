// Configuração da API Laravel
export const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3333/api';

export const API_ENDPOINTS = {
	// Auth
	auth: {
		login: '/auth/login',
		me: '/auth/me',
		logout: '/auth/logout',
	},
	// Fornecedor
	fornecedor: {
		empenhos: '/fornecedor/empenhos',
		empenho: (id: number) => `/fornecedor/empenhos/${id}`,
	},
	// Solicitações
	solicitacoes: {
		byEmpenho: (empenhoId: number) => `/empenhos/${empenhoId}/solicitacoes`,
		create: (empenhoId: number) => `/empenhos/${empenhoId}/solicitacoes`,
		show: (id: number) => `/solicitacoes/${id}`,
		cancelar: (id: number) => `/solicitacoes/${id}/cancelar`,
		tramites: (id: number) => `/solicitacoes/${id}/tramites`,
		removerAnexo: (solicitacaoId: number, anexoId: number) => `/solicitacoes/${solicitacaoId}/anexos/${anexoId}`,
	},
	// Anexos
	anexos: {
		bySolicitacao: (solicitacaoId: number) => `/solicitacoes/${solicitacaoId}/anexos`,
		upload: (solicitacaoId: number) => `/solicitacoes/${solicitacaoId}/anexos`,
		download: (id: number) => `/anexos/${id}/download`,
		aprovar: (id: number) => `/anexos/${id}/aprovar`,
		recusar: (id: number) => `/anexos/${id}/recusar`,
		delete: (id: number) => `/anexos/${id}`,
		enviarTodos: (solicitacaoId: number) => `/solicitacoes/${solicitacaoId}/anexos/enviar-todos`,
	},
	// Chamados / Suporte
	suporte: {
		chamados: '/chamados',
		criar: '/chamados',
		chamado: (id: number) => `/chamados/${id}`,
		responder: (id: number) => `/chamados/${id}/responder`,
		anexos: (id: number) => `/chamados/${id}/anexos`,
		concluir: (id: number) => `/chamados/${id}/concluir`,
	},
	// Alias para compatibilidade
	chamados: {
		list: '/chamados',
		create: '/chamados',
		show: (id: number) => `/chamados/${id}`,
		responder: (id: number) => `/chamados/${id}/responder`,
		anexos: (id: number) => `/chamados/${id}/anexos`,
		concluir: (id: number) => `/chamados/${id}/concluir`,
	},
	// Prestação de Contas
	prestacaoContas: {
		exportar: '/prestacao-contas/exportar',
		exportacoes: '/prestacao-contas/exportacoes',
		download: (id: number) => `/prestacao-contas/exportacoes/${id}/download`,
	},
	// Orçamentário
	orcamentario: {
		leisAtos: {
			list: '/orcamentario/leis-atos',
			create: '/orcamentario/leis-atos',
			update: (id: number) => `/orcamentario/leis-atos/${id}`,
			delete: (id: number) => `/orcamentario/leis-atos/${id}`,
		},
		alteracoes: {
			list: '/orcamentario/alteracoes',
			create: '/orcamentario/alteracoes',
			show: (id: number) => `/orcamentario/alteracoes/${id}`,
			update: (id: number) => `/orcamentario/alteracoes/${id}`,
			delete: (id: number) => `/orcamentario/alteracoes/${id}`,
			pdf: (id: number) => `/orcamentario/alteracoes/${id}/pdf`,
			dotacoes: {
				create: (alteracaoId: number) => `/orcamentario/alteracoes/${alteracaoId}/dotacoes`,
				delete: (alteracaoId: number, dotacaoId: number) =>
					`/orcamentario/alteracoes/${alteracaoId}/dotacoes/${dotacaoId}`,
			},
		},
	},
};

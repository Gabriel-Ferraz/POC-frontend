import { get, post } from '@/lib/http/http-methods';
import { API_ENDPOINTS } from '@/lib/http/api-config';
import type { SolicitacaoPagamento } from '@/types/models';

export interface NovaSolicitacaoData {
	valor: number;
	tipo_documento: string;
	numero_documento: string;
	serie?: string;
	data_emissao_documento: string;
	observacao_documento?: string;
	forma_pagamento: string;
	banco?: string;
	agencia?: string;
	digito_agencia?: string;
	conta?: string;
	digito_conta?: string;
	operacao?: string;
	cidade_banco?: string;
	observacao_pagamento?: string;
}

interface SolicitacoesResponse {
	empenho: any;
	solicitacoes: SolicitacaoPagamento[];
}

export const solicitacoesApi = {
	async getSolicitacoesByEmpenho(empenhoId: number): Promise<SolicitacaoPagamento[]> {
		const response = await get<SolicitacoesResponse>(API_ENDPOINTS.solicitacoes.byEmpenho(empenhoId));
		return response.solicitacoes || [];
	},

	async getSolicitacao(id: number): Promise<SolicitacaoPagamento> {
		const response = await get<any>(API_ENDPOINTS.solicitacoes.show(id));
		return response.solicitacao || response;
	},

	async criarSolicitacao(empenhoId: number, data: NovaSolicitacaoData): Promise<SolicitacaoPagamento> {
		const response = await post<any>(API_ENDPOINTS.solicitacoes.create(empenhoId), data);
		return response.solicitacao || response;
	},

	async cancelarSolicitacao(id: number, data: { data_cancelamento: string; motivo: string }): Promise<void> {
		await post(API_ENDPOINTS.solicitacoes.cancelar(id), data);
	},

	async uploadAnexo(solicitacaoId: number, anexoId: number, file: File): Promise<any> {
		const formData = new FormData();
		formData.append('arquivo', file);

		const token = typeof window !== 'undefined' ? localStorage.getItem('auth_token') : '';
		const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3333/api';

		const response = await fetch(`${apiUrl}/solicitacoes/${solicitacaoId}/anexos/${anexoId}/upload`, {
			method: 'POST',
			headers: {
				Authorization: `Bearer ${token}`,
			},
			body: formData,
		});

		if (!response.ok) {
			const error = await response.json().catch(() => ({}));
			throw new Error(error.message || 'Erro ao enviar anexo');
		}

		return response.json();
	},

	async removerAnexo(solicitacaoId: number, anexoId: number): Promise<void> {
		await post(API_ENDPOINTS.solicitacoes.removerAnexo(solicitacaoId, anexoId), {});
	},

	getAnexoUrl(solicitacaoId: number, anexoId: number): string {
		return `${process.env.NEXT_PUBLIC_API_URL}/solicitacoes/${solicitacaoId}/anexos/${anexoId}/download`;
	},
};

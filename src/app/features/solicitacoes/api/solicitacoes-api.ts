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

	async cancelarSolicitacao(id: number, motivo: string): Promise<void> {
		await post(API_ENDPOINTS.solicitacoes.cancelar(id), { motivo });
	},
};

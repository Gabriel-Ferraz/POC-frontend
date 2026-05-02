import { get, post } from '@/lib/http/http-methods';
import { API_ENDPOINTS } from '@/lib/http/api-config';
import type { SolicitacaoPagamento, TramiteSolicitacao } from '@/types/models';
import type { FormaPagamento } from '@/types/enums';

export interface CreateSolicitacaoRequest {
	valor: number;
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
}

export const solicitacaoApi = {
	async getSolicitacoesByEmpenho(empenhoId: number): Promise<SolicitacaoPagamento[]> {
		return await get<SolicitacaoPagamento[]>(API_ENDPOINTS.solicitacoes.byEmpenho(empenhoId));
	},

	async createSolicitacao(empenhoId: number, data: CreateSolicitacaoRequest): Promise<SolicitacaoPagamento> {
		return await post<SolicitacaoPagamento>(API_ENDPOINTS.solicitacoes.create(empenhoId), data);
	},

	async getSolicitacao(id: number): Promise<SolicitacaoPagamento> {
		return await get<SolicitacaoPagamento>(API_ENDPOINTS.solicitacoes.show(id));
	},

	async cancelarSolicitacao(id: number, motivo: string): Promise<void> {
		await post(API_ENDPOINTS.solicitacoes.cancelar(id), { motivo });
	},

	async getTramites(id: number): Promise<TramiteSolicitacao[]> {
		return await get<TramiteSolicitacao[]>(API_ENDPOINTS.solicitacoes.tramites(id));
	},
};

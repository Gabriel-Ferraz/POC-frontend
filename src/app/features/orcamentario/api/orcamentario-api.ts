import { get, post, put, del } from '@/lib/http/http-methods';
import { API_ENDPOINTS } from '@/lib/http/api-config';
import type { LeiAto, AlteracaoOrcamentaria } from '@/types/models';

export interface NovaLeiAtoData {
	numero: string;
	tipo: string;
	data_ato: string;
	data_publicacao: string;
	descricao: string;
	arquivo?: File;
}

export interface NovaAlteracaoData {
	lei_ato_id: number;
	decreto: string;
	tipo_ato: string;
	tipo_credito: string;
	tipo_recurso: string;
	valor: number;
	data_ato: string;
	data_publicacao: string;
}

export const orcamentarioApi = {
	// Leis e Atos
	async getLeisAtos(): Promise<LeiAto[]> {
		return await get<LeiAto[]>(API_ENDPOINTS.orcamentario.leisAtos.list);
	},

	async criarLeiAto(data: NovaLeiAtoData): Promise<LeiAto> {
		const formData = new FormData();
		formData.append('numero', data.numero);
		formData.append('tipo', data.tipo);
		formData.append('data_ato', data.data_ato);
		formData.append('data_publicacao', data.data_publicacao);
		formData.append('descricao', data.descricao);
		if (data.arquivo) {
			formData.append('arquivo', data.arquivo);
		}

		return await post<LeiAto>(API_ENDPOINTS.orcamentario.leisAtos.create, formData);
	},

	async deletarLeiAto(id: number): Promise<void> {
		await del(API_ENDPOINTS.orcamentario.leisAtos.delete(id));
	},

	// Alterações Orçamentárias
	async getAlteracoes(): Promise<AlteracaoOrcamentaria[]> {
		return await get<AlteracaoOrcamentaria[]>(API_ENDPOINTS.orcamentario.alteracoes.list);
	},

	async getAlteracao(id: number): Promise<AlteracaoOrcamentaria> {
		return await get<AlteracaoOrcamentaria>(API_ENDPOINTS.orcamentario.alteracoes.show(id));
	},

	async criarAlteracao(data: NovaAlteracaoData): Promise<AlteracaoOrcamentaria> {
		return await post<AlteracaoOrcamentaria>(API_ENDPOINTS.orcamentario.alteracoes.create, data);
	},

	getPdfUrl(id: number): string {
		return `${process.env.NEXT_PUBLIC_API_URL}${API_ENDPOINTS.orcamentario.alteracoes.pdf(id)}`;
	},
};

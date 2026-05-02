import { get } from '@/lib/http/http-methods';
import { API_ENDPOINTS } from '@/lib/http/api-config';
import type { Empenho, Fornecedor } from '@/types/models';

interface EmpenhosResponse {
	fornecedor: Fornecedor;
	empenhos: Empenho[];
}

export const fornecedorApi = {
	async getEmpenhos(): Promise<Empenho[]> {
		const response = await get<EmpenhosResponse>(API_ENDPOINTS.fornecedor.empenhos);
		return response.empenhos;
	},

	async getEmpenho(id: number): Promise<Empenho> {
		return await get<Empenho>(API_ENDPOINTS.fornecedor.empenho(id));
	},
};

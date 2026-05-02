import { get } from '@/lib/http/http-methods';
import { API_ENDPOINTS } from '@/lib/http/api-config';
import type { Empenho } from '@/types/models';

export const fornecedorApi = {
	async getEmpenhos(): Promise<Empenho[]> {
		return await get<Empenho[]>(API_ENDPOINTS.fornecedor.empenhos);
	},

	async getEmpenho(id: number): Promise<Empenho> {
		return await get<Empenho>(API_ENDPOINTS.fornecedor.empenho(id));
	},
};

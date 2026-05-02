import { get, post } from '@/lib/http/http-methods';
import { API_ENDPOINTS } from '@/lib/http/api-config';
import type { Chamado } from '@/types/models';

export interface NovoChamadoData {
	modulo: string;
	assunto: string;
	mensagem: string;
}

interface ChamadosResponse {
	chamados: Chamado[];
}

export const suporteApi = {
	async getChamados(): Promise<Chamado[]> {
		const response = await get<ChamadosResponse>(API_ENDPOINTS.suporte.chamados);
		return response.chamados;
	},

	async getChamado(id: number): Promise<any> {
		const response = await get<any>(API_ENDPOINTS.suporte.chamado(id));
		// API retorna { chamado: {...}, timeline: [...] }
		return response;
	},

	async criarChamado(data: NovoChamadoData): Promise<Chamado> {
		const response = await post<any>(API_ENDPOINTS.suporte.criar, data);
		// Se retornar { chamado: {...} }, extrair; senão, retornar direto
		return response.chamado || response;
	},
};

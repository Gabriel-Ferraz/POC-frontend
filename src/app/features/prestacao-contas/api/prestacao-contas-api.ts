import { get, post } from '@/lib/http/http-methods';
import { API_ENDPOINTS } from '@/lib/http/api-config';
import type { ExportacaoPrestacaoContas } from '@/types/models';

export interface ExportarPrestacaoContasData {
	ano: number;
	modulo: string;
	tipo_geracao: string;
	mes?: number;
	arquivos_selecionados: string[];
}

export const prestacaoContasApi = {
	async exportar(data: ExportarPrestacaoContasData): Promise<ExportacaoPrestacaoContas> {
		return await post<ExportacaoPrestacaoContas>(API_ENDPOINTS.prestacaoContas.exportar, data);
	},

	async getExportacoes(): Promise<ExportacaoPrestacaoContas[]> {
		return await get<ExportacaoPrestacaoContas[]>(API_ENDPOINTS.prestacaoContas.exportacoes);
	},

	getDownloadUrl(id: number): string {
		return `${process.env.NEXT_PUBLIC_API_URL}${API_ENDPOINTS.prestacaoContas.download(id)}`;
	},
};

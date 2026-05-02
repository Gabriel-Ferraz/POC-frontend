import { get, post } from '@/lib/http/http-methods';
import { API_ENDPOINTS } from '@/lib/http/api-config';
import type { Chamado } from '@/types/models';

export interface NovoChamadoData {
	modulo: string;
	assunto: string;
	anexos?: File[];
}

export interface FiltrosChamados {
	protocolo?: string;
	data_cadastro_inicio?: string;
	data_cadastro_fim?: string;
	data_resposta_inicio?: string;
	data_resposta_fim?: string;
	modulo?: string;
	usuario_id?: number;
	assunto?: string;
	status?: string;
}

export interface Usuario {
	id: number;
	name: string;
	perfil: string;
	perfil_label: string;
}

export interface ResponseUsuarios {
	usuarios?: Usuario[];
	usuario_atual?: Usuario;
}

interface ChamadosResponse {
	chamados: Chamado[];
}

export const suporteApi = {
	async getChamados(filtros?: FiltrosChamados): Promise<Chamado[]> {
		const params = new URLSearchParams();

		if (filtros?.protocolo) params.append('protocolo', filtros.protocolo);
		if (filtros?.data_cadastro_inicio) params.append('data_cadastro_inicio', filtros.data_cadastro_inicio);
		if (filtros?.data_cadastro_fim) params.append('data_cadastro_fim', filtros.data_cadastro_fim);
		if (filtros?.data_resposta_inicio) params.append('data_resposta_inicio', filtros.data_resposta_inicio);
		if (filtros?.data_resposta_fim) params.append('data_resposta_fim', filtros.data_resposta_fim);
		if (filtros?.modulo) params.append('modulo', filtros.modulo);
		if (filtros?.usuario_id) params.append('usuario_id', filtros.usuario_id.toString());
		if (filtros?.assunto) params.append('assunto', filtros.assunto);
		if (filtros?.status) params.append('status', filtros.status);

		const url = params.toString()
			? `${API_ENDPOINTS.suporte.chamados}?${params.toString()}`
			: API_ENDPOINTS.suporte.chamados;

		const response = await get<ChamadosResponse>(url);
		return response.chamados;
	},

	async getUsuarios(busca?: string): Promise<ResponseUsuarios> {
		const params = new URLSearchParams();
		if (busca) {
			params.append('busca', busca);
		}

		const url = params.toString() ? `/chamados/usuarios?${params.toString()}` : '/chamados/usuarios';
		const response = await get<ResponseUsuarios>(url);
		return response;
	},

	async getChamado(id: number): Promise<any> {
		const response = await get<any>(API_ENDPOINTS.suporte.chamado(id));
		// API retorna { chamado: {...}, timeline: [...] }
		return response;
	},

	async criarChamado(data: NovoChamadoData): Promise<Chamado> {
		const formData = new FormData();
		formData.append('modulo', data.modulo);
		formData.append('assunto', data.assunto);

		// Adicionar anexos se existirem
		if (data.anexos && data.anexos.length > 0) {
			data.anexos.forEach((arquivo) => {
				formData.append('anexos[]', arquivo);
			});
		}

		const response = await post<any>(API_ENDPOINTS.suporte.criar, formData);
		return response.chamado || response;
	},

	async downloadAnexo(arquivoPath: string, nome: string): Promise<void> {
		const token = localStorage.getItem('token');
		const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3333/api';

		const response = await fetch(`${apiUrl}${arquivoPath}`, {
			headers: {
				Authorization: `Bearer ${token}`,
			},
		});

		if (!response.ok) {
			throw new Error('Erro ao baixar anexo');
		}

		// Converter para Blob
		const blob = await response.blob();

		// Criar URL do Blob
		const blobUrl = URL.createObjectURL(blob);

		// Abrir em nova aba
		window.open(blobUrl, '_blank');

		// Limpar URL após um tempo (para não ocupar memória)
		setTimeout(() => {
			URL.revokeObjectURL(blobUrl);
		}, 100);
	},

	async responderChamado(chamadoId: number, mensagem: string, anexos?: File[]): Promise<any> {
		const formData = new FormData();
		formData.append('mensagem', mensagem);

		// Adicionar anexos se existirem
		if (anexos && anexos.length > 0) {
			anexos.forEach((arquivo) => {
				formData.append('anexos[]', arquivo);
			});
		}

		const response = await post<any>(`/chamados/${chamadoId}/responder`, formData);
		return response;
	},
};

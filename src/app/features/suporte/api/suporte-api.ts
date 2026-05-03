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
	responsavel_id?: number;
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
		if (filtros?.responsavel_id) params.append('responsavel_id', filtros.responsavel_id.toString());
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

	async getResponsaveis(busca?: string): Promise<{ usuarios: Usuario[] }> {
		const params = new URLSearchParams();
		if (busca) params.append('busca', busca);
		const url = params.toString() ? `/chamados/responsaveis?${params.toString()}` : '/chamados/responsaveis';
		return get<{ usuarios: Usuario[] }>(url);
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

		const token = typeof window !== 'undefined' ? localStorage.getItem('auth_token') : '';
		const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3333/api';

		// Logs de debug
		console.log('[Criar Chamado] Token:', token ? 'Presente' : 'Ausente');
		console.log('[Criar Chamado] URL:', `${apiUrl}/chamados`);
		console.log('[Criar Chamado] Módulo:', data.modulo);
		console.log('[Criar Chamado] Assunto:', data.assunto?.substring(0, 50));
		console.log('[Criar Chamado] Anexos:', data.anexos?.length || 0);

		if (!token) {
			throw new Error('Token de autenticação não encontrado. Faça login novamente.');
		}

		const response = await fetch(`${apiUrl}/chamados`, {
			method: 'POST',
			headers: {
				Authorization: `Bearer ${token}`,
			},
			body: formData,
		});

		console.log('[Criar Chamado] Status:', response.status);
		console.log('[Criar Chamado] Content-Type:', response.headers.get('content-type'));

		if (!response.ok) {
			const contentType = response.headers.get('content-type');

			// Se retornou JSON, extrair mensagem de erro
			if (contentType?.includes('application/json')) {
				const error = await response.json().catch(() => ({}));
				console.error('[Criar Chamado] Erro:', error);

				// Tratamento específico para erro 401
				if (response.status === 401) {
					localStorage.removeItem('token');
					throw new Error('Sessão expirada. Faça login novamente.');
				}

				// Tratamento para erro 422 (validação)
				if (response.status === 422 && error.errors) {
					const erros = Object.values(error.errors).flat().join(', ');
					throw new Error(`Dados inválidos: ${erros}`);
				}

				throw new Error(error.message || `Erro ${response.status} ao criar chamado`);
			}

			throw new Error(`Erro ${response.status} ao criar chamado`);
		}

		const result = await response.json();
		console.log('[Criar Chamado] Sucesso:', result);

		return result.chamado || result;
	},

	async downloadAnexo(arquivoPath: string, nome: string): Promise<void> {
		const token = typeof window !== 'undefined' ? localStorage.getItem('auth_token') : '';

		if (!token) {
			throw new Error('Token de autenticação não encontrado');
		}

		const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3333/api';

		// Garantir que o path começa com /api
		const fullPath = arquivoPath.startsWith('/api') ? arquivoPath : `/api${arquivoPath}`;
		const fullUrl = `${apiUrl}${fullPath.replace('/api', '')}`;

		console.log('[Download Anexo] URL:', fullUrl);
		console.log('[Download Anexo] Token:', token ? 'Presente' : 'Ausente');

		const response = await fetch(fullUrl, {
			method: 'GET',
			headers: {
				Authorization: `Bearer ${token}`,
				Accept: 'application/octet-stream, application/json',
			},
		});

		console.log('[Download Anexo] Status:', response.status);
		console.log('[Download Anexo] Content-Type:', response.headers.get('content-type'));

		if (!response.ok) {
			const contentType = response.headers.get('content-type');

			// Se retornou JSON, extrair mensagem de erro
			if (contentType?.includes('application/json')) {
				const error = await response.json().catch(() => ({}));
				throw new Error(error.message || `Erro ${response.status} ao baixar anexo`);
			}

			throw new Error(`Erro ${response.status} ao baixar anexo`);
		}

		// Converter para Blob
		const blob = await response.blob();
		console.log('[Download Anexo] Blob size:', blob.size);

		// Criar URL do Blob
		const blobUrl = URL.createObjectURL(blob);
		console.log('[Download Anexo] Blob URL criada:', blobUrl);

		// Abrir em nova aba
		const newWindow = window.open(blobUrl, '_blank');

		if (!newWindow) {
			console.warn('[Download Anexo] Popup bloqueado, tentando download direto');
			// Fallback: forçar download se popup foi bloqueado
			const link = document.createElement('a');
			link.href = blobUrl;
			link.download = nome;
			document.body.appendChild(link);
			link.click();
			document.body.removeChild(link);
		}

		// Limpar URL após um tempo (para não ocupar memória)
		setTimeout(() => {
			URL.revokeObjectURL(blobUrl);
		}, 1000);
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

		const token = typeof window !== 'undefined' ? localStorage.getItem('auth_token') : '';
		const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3333/api';

		const response = await fetch(`${apiUrl}/chamados/${chamadoId}/responder`, {
			method: 'POST',
			headers: {
				Authorization: `Bearer ${token}`,
			},
			body: formData,
		});

		if (!response.ok) {
			const error = await response.json().catch(() => ({}));
			throw new Error(error.message || 'Erro ao enviar resposta');
		}

		return response.json();
	},
};

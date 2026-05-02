import { get, post } from '@/lib/http/http-methods';
import { API_ENDPOINTS } from '@/lib/http/api-config';

export interface SolicitacaoPendente {
	id: number;
	numero: string;
	valor: number;
	status: string;
	data: string;
	solicitante: string;
	fornecedor: string;
	empenho: string;
	contrato: string;
	documento_fiscal: string;
	total_anexos: number;
	anexos_aprovados: number;
	anexos_pendentes: number;
	anexos_recusados: number;
}

export interface AnexoDetalhado {
	id: number;
	tipo_anexo: string;
	tipo_anexo_label: string;
	arquivo: string;
	status: string;
	motivo_recusa: string | null;
	avaliado_por: string | null;
	avaliado_em: string | null;
	data_envio: string;
}

export interface SolicitacaoDetalhada {
	solicitacao: {
		id: number;
		numero: string;
		valor: number;
		status: string;
		data: string;
		solicitante: string;
		fornecedor: string;
		cnpj: string;
		empenho: string;
		contrato: string;
		documento_fiscal: {
			tipo: string;
			numero: string;
			serie: string;
			data_emissao: string;
		};
	};
	anexos: AnexoDetalhado[];
}

export const gestorApi = {
	async getSolicitacoesPendentes(): Promise<SolicitacaoPendente[]> {
		const response = await get<any>('/gestor/solicitacoes-pendentes');
		return response.solicitacoes || [];
	},

	async getSolicitacaoDetalhes(id: number): Promise<SolicitacaoDetalhada> {
		return await get<SolicitacaoDetalhada>(`/gestor/solicitacoes/${id}`);
	},

	async aprovarAnexo(anexoId: number): Promise<void> {
		await post(`/anexos/${anexoId}/aprovar`, {});
	},

	async recusarAnexo(anexoId: number, motivo: string): Promise<void> {
		await post(`/anexos/${anexoId}/recusar`, { motivo });
	},

	getDownloadUrl(anexoId: number): string {
		return `${process.env.NEXT_PUBLIC_API_URL}/anexos/${anexoId}/download`;
	},
};

import { get, post, put, del } from '@/lib/http/http-methods';
import { API_ENDPOINTS } from '@/lib/http/api-config';
import type { AlteracaoOrcamentaria, DotacaoAlteracao, LeiAto } from '@/types/models';

// Payloads para Alterações Orçamentárias
export interface CriarAlteracaoPayload {
	lei_ato_id: number;
	decreto_autorizador: string;
	tipo_ato: string;
	tipo_credito: string;
	tipo_recurso: string;
	valor_credito: number;
	data_ato: string;
	data_publicacao: string;
}

// Payloads para Dotações
export interface CriarDotacaoPayload {
	dotacao_orcamentaria: string;
	conta_receita?: string;
	valor_suprimido: number;
	valor_suplementado: number;
	saldo_atual: number;
}

// ============================
// LEIS E ATOS
// ============================

export async function listarLeisAtos(): Promise<LeiAto[]> {
	const response = await get<{ leis_atos: LeiAto[] }>(API_ENDPOINTS.orcamentario.leisAtos.list);
	return response.leis_atos;
}

export async function atualizarLeiAto(id: number, formData: FormData): Promise<LeiAto> {
	const response = await post<LeiAto>(API_ENDPOINTS.orcamentario.leisAtos.update(id), formData);
	return response;
}

export async function excluirLeiAto(id: number): Promise<void> {
	await del(API_ENDPOINTS.orcamentario.leisAtos.delete(id));
}

// ============================
// ALTERAÇÕES ORÇAMENTÁRIAS
// ============================

export async function listarAlteracoes(): Promise<AlteracaoOrcamentaria[]> {
	const response = await get<{ alteracoes: AlteracaoOrcamentaria[] }>(API_ENDPOINTS.orcamentario.alteracoes.list);
	return response.alteracoes;
}

export async function obterAlteracao(
	id: number
): Promise<{ alteracao: AlteracaoOrcamentaria; dotacoes: DotacaoAlteracao[] }> {
	const response = await get<{ alteracao: AlteracaoOrcamentaria; dotacoes: DotacaoAlteracao[] }>(
		API_ENDPOINTS.orcamentario.alteracoes.show(id)
	);
	return response;
}

export async function criarAlteracao(payload: CriarAlteracaoPayload): Promise<AlteracaoOrcamentaria> {
	const response = await post<AlteracaoOrcamentaria>(API_ENDPOINTS.orcamentario.alteracoes.create, payload);
	return response;
}

// ============================
// DOTAÇÕES
// ============================

export async function criarDotacao(alteracaoId: number, payload: CriarDotacaoPayload): Promise<DotacaoAlteracao> {
	const response = await post<DotacaoAlteracao>(
		API_ENDPOINTS.orcamentario.alteracoes.dotacoes.create(alteracaoId),
		payload
	);
	return response;
}

// ============================
// UTILITÁRIOS
// ============================

export function getPdfUrl(alteracaoId: number): string {
	const token = localStorage.getItem('auth_token');
	return `${process.env.NEXT_PUBLIC_API_URL}${API_ENDPOINTS.orcamentario.alteracoes.pdf(alteracaoId)}?token=${token}`;
}

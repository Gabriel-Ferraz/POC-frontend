import type { ExportarPrestacaoContasPayload, ExportacaoGerada, LayoutArquivo } from '@/types/prestacao-contas.types';

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export async function listarLayouts(): Promise<LayoutArquivo[]> {
	const response = await fetch(`${API_URL}/prestacao-contas/layouts`, {
		headers: {
			Authorization: `Bearer ${localStorage.getItem('auth_token')}`,
		},
	});

	if (!response.ok) {
		throw new Error('Erro ao carregar layouts de exportação.');
	}

	const data = await response.json();

	// Backend retorna { layouts: [...] }
	return data.layouts || data;
}

export async function exportarPrestacaoContas(payload: ExportarPrestacaoContasPayload): Promise<ExportacaoGerada> {
	const response = await fetch(`${API_URL}/prestacao-contas/exportar`, {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json',
			'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
		},
		body: JSON.stringify(payload),
	});

	if (!response.ok) {
		const error = await response.json();
		throw new Error(error.message || 'Erro ao gerar arquivos de prestação de contas.');
	}

	const data = await response.json();

	// Backend retorna { exportacao: {...} }
	return data.exportacao || data;
}

export async function listarExportacoes(): Promise<any[]> {
	const response = await fetch(`${API_URL}/prestacao-contas/exportacoes`, {
		headers: {
			Authorization: `Bearer ${localStorage.getItem('auth_token')}`,
		},
	});

	if (!response.ok) {
		throw new Error('Erro ao carregar exportações.');
	}

	const data = await response.json();
	return data.exportacoes || data;
}

export async function reordenarLayouts(layoutIds: string[]): Promise<void> {
	const response = await fetch(`${API_URL}/prestacao-contas/layouts/reordenar`, {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json',
			'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
		},
		body: JSON.stringify({ layoutIds }),
	});

	if (!response.ok) {
		const error = await response.json();
		throw new Error(error.message || 'Erro ao reordenar arquivos.');
	}
}

export async function downloadZip(exportacaoId: string): Promise<void> {
	const token = localStorage.getItem('auth_token');
	window.open(`${API_URL}/prestacao-contas/exportacoes/${exportacaoId}/download?token=${token}`, '_blank');
}

export async function downloadArquivo(exportacaoId: string, arquivoId: string): Promise<void> {
	const token = localStorage.getItem('auth_token');
	window.open(
		`${API_URL}/prestacao-contas/exportacoes/${exportacaoId}/arquivos/${arquivoId}/download?token=${token}`,
		'_blank'
	);
}

// Funções utilitárias de formatação

export function formatCurrency(value: number): string {
	return new Intl.NumberFormat('pt-BR', {
		style: 'currency',
		currency: 'BRL',
	}).format(value);
}

export function formatDate(date: string | Date | null | undefined): string {
	if (!date) return '';
	if (typeof date === 'string') {
		// ISO date-only string (YYYY-MM-DD) — parse as local to avoid UTC day-shift
		const match = date.match(/^(\d{4})-(\d{2})-(\d{2})/);
		if (match) {
			return `${match[3]}/${match[2]}/${match[1]}`;
		}
	}
	const dateObj = typeof date === 'string' ? new Date(date) : date;
	return dateObj.toLocaleDateString('pt-BR');
}

export function formatDateTime(date: string | Date | null | undefined): string {
	if (!date) return '';
	const dateObj = typeof date === 'string' ? new Date(date) : date;
	return dateObj.toLocaleString('pt-BR');
}

export function formatCPF(cpf: string | null | undefined): string {
	if (!cpf) return '';
	const cleaned = cpf.replace(/\D/g, '');
	if (cleaned.length !== 11) return cpf;
	return cleaned.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
}

export function formatCNPJ(cnpj: string | null | undefined): string {
	if (!cnpj) return '';
	const cleaned = cnpj.replace(/\D/g, '');
	if (cleaned.length !== 14) return cnpj;
	return cleaned.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, '$1.$2.$3/$4-$5');
}

export function maskCPF(value: string): string {
	return value
		.replace(/\D/g, '')
		.replace(/(\d{3})(\d)/, '$1.$2')
		.replace(/(\d{3})(\d)/, '$1.$2')
		.replace(/(\d{3})(\d{1,2})$/, '$1-$2')
		.slice(0, 14);
}

export function maskCNPJ(value: string): string {
	return value
		.replace(/\D/g, '')
		.replace(/(\d{2})(\d)/, '$1.$2')
		.replace(/(\d{3})(\d)/, '$1.$2')
		.replace(/(\d{3})(\d)/, '$1/$2')
		.replace(/(\d{4})(\d{1,2})$/, '$1-$2')
		.slice(0, 18);
}

export function truncate(text: string | null | undefined, maxLength: number): string {
	if (!text) return '';
	if (text.length <= maxLength) return text;
	return text.slice(0, maxLength) + '...';
}

export function getInitials(name: string | null | undefined): string {
	if (!name) return '';
	return name
		.split(' ')
		.map((n) => n[0])
		.join('')
		.toUpperCase()
		.slice(0, 2);
}

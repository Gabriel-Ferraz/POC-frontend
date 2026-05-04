import * as React from 'react';

type StatusType = string;

interface StatusBadgeProps {
	status: StatusType;
	className?: string;
}

const STATUS_CONFIG: Record<string, { color: string; label: string }> = {
	// ── Empenho ──────────────────────────────────────────────────────────────
	disponivel: {
		color: 'bg-green-100 text-green-800 border-green-200 dark:bg-green-900/30 dark:text-green-300 dark:border-green-800',
		label: 'Disponível',
	},
	bloqueado: {
		color: 'bg-yellow-100 text-yellow-800 border-yellow-200 dark:bg-yellow-900/30 dark:text-yellow-300 dark:border-yellow-800',
		label: 'Bloqueado',
	},
	sem_saldo: {
		color: 'bg-red-100 text-red-800 border-red-200 dark:bg-red-900/30 dark:text-red-300 dark:border-red-800',
		label: 'Sem Saldo',
	},

	// ── Solicitação de Pagamento ──────────────────────────────────────────────
	rascunho: {
		color: 'bg-gray-100 text-gray-700 border-gray-200 dark:bg-muted dark:text-muted-foreground dark:border-border',
		label: 'Rascunho',
	},
	aguardando_aprovacao: {
		color: 'bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900/30 dark:text-blue-300 dark:border-blue-800',
		label: 'Aguardando Aprovação',
	},
	anexos: {
		color: 'bg-indigo-100 text-indigo-800 border-indigo-200 dark:bg-indigo-900/30 dark:text-indigo-300 dark:border-indigo-800',
		label: 'Análise de Anexos',
	},
	fiscal: {
		color: 'bg-violet-100 text-violet-800 border-violet-200 dark:bg-violet-900/30 dark:text-violet-300 dark:border-violet-800',
		label: 'Análise Fiscal',
	},
	gestor: {
		color: 'bg-purple-100 text-purple-800 border-purple-200 dark:bg-purple-900/30 dark:text-purple-300 dark:border-purple-800',
		label: 'Aprovação do Gestor',
	},
	liquidacao: {
		color: 'bg-pink-100 text-pink-800 border-pink-200 dark:bg-pink-900/30 dark:text-pink-300 dark:border-pink-800',
		label: 'Liquidação',
	},
	secretario: {
		color: 'bg-fuchsia-100 text-fuchsia-800 border-fuchsia-200 dark:bg-fuchsia-900/30 dark:text-fuchsia-300 dark:border-fuchsia-800',
		label: 'Aprovação do Secretário',
	},
	iss: {
		color: 'bg-cyan-100 text-cyan-800 border-cyan-200 dark:bg-cyan-900/30 dark:text-cyan-300 dark:border-cyan-800',
		label: 'Verificação ISS',
	},
	ordem_pagamento: {
		color: 'bg-teal-100 text-teal-800 border-teal-200 dark:bg-teal-900/30 dark:text-teal-300 dark:border-teal-800',
		label: 'Ordem de Pagamento',
	},
	autorizacao: {
		color: 'bg-emerald-100 text-emerald-800 border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-300 dark:border-emerald-800',
		label: 'Autorização',
	},
	bordero: {
		color: 'bg-lime-100 text-lime-800 border-lime-200 dark:bg-lime-900/30 dark:text-lime-300 dark:border-lime-800',
		label: 'Borderô',
	},
	remessa: {
		color: 'bg-amber-100 text-amber-800 border-amber-200 dark:bg-amber-900/30 dark:text-amber-300 dark:border-amber-800',
		label: 'Remessa Bancária',
	},
	pagamento: {
		color: 'bg-orange-100 text-orange-800 border-orange-200 dark:bg-orange-900/30 dark:text-orange-300 dark:border-orange-800',
		label: 'Em Pagamento',
	},
	pagamento_realizado: {
		color: 'bg-green-100 text-green-800 border-green-200 dark:bg-green-900/30 dark:text-green-300 dark:border-green-800',
		label: 'Pagamento Realizado',
	},
	cancelado: {
		color: 'bg-red-100 text-red-800 border-red-200 dark:bg-red-900/30 dark:text-red-300 dark:border-red-800',
		label: 'Cancelado',
	},
	cancelada: {
		color: 'bg-red-100 text-red-800 border-red-200 dark:bg-red-900/30 dark:text-red-300 dark:border-red-800',
		label: 'Cancelada',
	},

	// ── Anexo ────────────────────────────────────────────────────────────────
	pendente: {
		color: 'bg-gray-100 text-gray-700 border-gray-200 dark:bg-muted dark:text-muted-foreground dark:border-border',
		label: 'Pendente',
	},
	anexo_cadastrado: {
		color: 'bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900/30 dark:text-blue-300 dark:border-blue-800',
		label: 'Anexo Cadastrado',
	},
	// aguardando_aprovacao já cobre Anexo também (mesmo slug)
	aprovado: {
		color: 'bg-green-100 text-green-800 border-green-200 dark:bg-green-900/30 dark:text-green-300 dark:border-green-800',
		label: 'Aprovado',
	},
	recusado: {
		color: 'bg-red-100 text-red-800 border-red-200 dark:bg-red-900/30 dark:text-red-300 dark:border-red-800',
		label: 'Recusado',
	},

	// ── Chamado ──────────────────────────────────────────────────────────────
	aberto: {
		color: 'bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900/30 dark:text-blue-300 dark:border-blue-800',
		label: 'Aberto',
	},
	em_atendimento: {
		color: 'bg-yellow-100 text-yellow-800 border-yellow-200 dark:bg-yellow-900/30 dark:text-yellow-300 dark:border-yellow-800',
		label: 'Em Atendimento',
	},
	concluido: {
		color: 'bg-green-100 text-green-800 border-green-200 dark:bg-green-900/30 dark:text-green-300 dark:border-green-800',
		label: 'Concluído',
	},
};

export function StatusBadge({ status, className }: StatusBadgeProps) {
	const config = STATUS_CONFIG[status];
	const color =
		config?.color ??
		'bg-gray-100 text-gray-700 border-gray-200 dark:bg-muted dark:text-muted-foreground dark:border-border';
	const label = config?.label ?? status;

	return (
		<span
			className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${color} ${className ?? ''}`}>
			{label}
		</span>
	);
}

import * as React from 'react';
import { StatusEmpenho, StatusSolicitacao, StatusAnexo, StatusChamado } from '@/types/enums';

type StatusType = StatusEmpenho | StatusSolicitacao | StatusAnexo | StatusChamado | string;

interface StatusBadgeProps {
	status: StatusType;
	className?: string;
}

const STATUS_CONFIG: Record<string, { color: string; label: string }> = {
	// Empenho
	[StatusEmpenho.DISPONIVEL]: {
		color: 'bg-green-100 text-green-800 border-green-200 dark:bg-green-900/30 dark:text-green-300 dark:border-green-800',
		label: 'Disponível',
	},
	[StatusEmpenho.BLOQUEADO]: {
		color: 'bg-yellow-100 text-yellow-800 border-yellow-200 dark:bg-yellow-900/30 dark:text-yellow-300 dark:border-yellow-800',
		label: 'Bloqueado',
	},
	[StatusEmpenho.SEM_SALDO]: {
		color: 'bg-red-100 text-red-800 border-red-200 dark:bg-red-900/30 dark:text-red-300 dark:border-red-800',
		label: 'Sem Saldo',
	},

	// Solicitação
	[StatusSolicitacao.RASCUNHO]: {
		color: 'bg-gray-100 text-gray-700 border-gray-200 dark:bg-muted dark:text-muted-foreground dark:border-border',
		label: 'Rascunho',
	},
	[StatusSolicitacao.AGUARDANDO_APROVACAO]: {
		color: 'bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900/30 dark:text-blue-300 dark:border-blue-800',
		label: 'Aguardando Aprovação',
	},
	[StatusSolicitacao.ANEXOS]: {
		color: 'bg-indigo-100 text-indigo-800 border-indigo-200 dark:bg-indigo-900/30 dark:text-indigo-300 dark:border-indigo-800',
		label: 'Análise de Anexos',
	},
	[StatusSolicitacao.FISCAL]: {
		color: 'bg-violet-100 text-violet-800 border-violet-200 dark:bg-violet-900/30 dark:text-violet-300 dark:border-violet-800',
		label: 'Análise Fiscal',
	},
	[StatusSolicitacao.GESTOR]: {
		color: 'bg-purple-100 text-purple-800 border-purple-200 dark:bg-purple-900/30 dark:text-purple-300 dark:border-purple-800',
		label: 'Aprovação do Gestor',
	},
	[StatusSolicitacao.LIQUIDACAO]: {
		color: 'bg-pink-100 text-pink-800 border-pink-200 dark:bg-pink-900/30 dark:text-pink-300 dark:border-pink-800',
		label: 'Liquidação',
	},
	[StatusSolicitacao.SECRETARIO]: {
		color: 'bg-fuchsia-100 text-fuchsia-800 border-fuchsia-200 dark:bg-fuchsia-900/30 dark:text-fuchsia-300 dark:border-fuchsia-800',
		label: 'Aprovação do Secretário',
	},
	[StatusSolicitacao.ISS]: {
		color: 'bg-cyan-100 text-cyan-800 border-cyan-200 dark:bg-cyan-900/30 dark:text-cyan-300 dark:border-cyan-800',
		label: 'Verificação ISS',
	},
	[StatusSolicitacao.ORDEM_PAGAMENTO]: {
		color: 'bg-teal-100 text-teal-800 border-teal-200 dark:bg-teal-900/30 dark:text-teal-300 dark:border-teal-800',
		label: 'Ordem de Pagamento',
	},
	[StatusSolicitacao.AUTORIZACAO]: {
		color: 'bg-emerald-100 text-emerald-800 border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-300 dark:border-emerald-800',
		label: 'Autorização',
	},
	[StatusSolicitacao.BORDERO]: {
		color: 'bg-lime-100 text-lime-800 border-lime-200 dark:bg-lime-900/30 dark:text-lime-300 dark:border-lime-800',
		label: 'Borderô',
	},
	[StatusSolicitacao.REMESSA]: {
		color: 'bg-amber-100 text-amber-800 border-amber-200 dark:bg-amber-900/30 dark:text-amber-300 dark:border-amber-800',
		label: 'Remessa Bancária',
	},
	[StatusSolicitacao.PAGAMENTO]: {
		color: 'bg-orange-100 text-orange-800 border-orange-200 dark:bg-orange-900/30 dark:text-orange-300 dark:border-orange-800',
		label: 'Em Pagamento',
	},
	[StatusSolicitacao.PAGAMENTO_REALIZADO]: {
		color: 'bg-green-100 text-green-800 border-green-200 dark:bg-green-900/30 dark:text-green-300 dark:border-green-800',
		label: 'Pagamento Realizado',
	},
	[StatusSolicitacao.CANCELADO]: {
		color: 'bg-red-100 text-red-800 border-red-200 dark:bg-red-900/30 dark:text-red-300 dark:border-red-800',
		label: 'Cancelado',
	},

	// Anexo
	[StatusAnexo.PENDENTE]: {
		color: 'bg-gray-100 text-gray-700 border-gray-200 dark:bg-muted dark:text-muted-foreground dark:border-border',
		label: 'Pendente',
	},
	[StatusAnexo.ANEXO_CADASTRADO]: {
		color: 'bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900/30 dark:text-blue-300 dark:border-blue-800',
		label: 'Anexo Cadastrado',
	},
	[StatusAnexo.AGUARDANDO_APROVACAO]: {
		color: 'bg-yellow-100 text-yellow-800 border-yellow-200 dark:bg-yellow-900/30 dark:text-yellow-300 dark:border-yellow-800',
		label: 'Aguardando Aprovação',
	},
	[StatusAnexo.APROVADO]: {
		color: 'bg-green-100 text-green-800 border-green-200 dark:bg-green-900/30 dark:text-green-300 dark:border-green-800',
		label: 'Aprovado',
	},
	[StatusAnexo.RECUSADO]: {
		color: 'bg-red-100 text-red-800 border-red-200 dark:bg-red-900/30 dark:text-red-300 dark:border-red-800',
		label: 'Recusado',
	},

	// Chamado
	[StatusChamado.ABERTO]: {
		color: 'bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900/30 dark:text-blue-300 dark:border-blue-800',
		label: 'Aberto',
	},
	[StatusChamado.EM_ATENDIMENTO]: {
		color: 'bg-yellow-100 text-yellow-800 border-yellow-200 dark:bg-yellow-900/30 dark:text-yellow-300 dark:border-yellow-800',
		label: 'Em Atendimento',
	},
	[StatusChamado.CONCLUIDO]: {
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

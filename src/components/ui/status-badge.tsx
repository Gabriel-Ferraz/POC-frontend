import * as React from 'react';
import { StatusEmpenho, StatusSolicitacao, StatusAnexo, StatusChamado } from '@/types/enums';

type StatusType = StatusEmpenho | StatusSolicitacao | StatusAnexo | StatusChamado | string;

interface StatusBadgeProps {
	status: StatusType;
	className?: string;
}
function getColor(status: StatusType): string {
	// Empenho
	if (status === StatusEmpenho.DISPONIVEL)
		return 'bg-green-100 text-green-800 border-green-200 dark:bg-green-900/30 dark:text-green-300 dark:border-green-800';
	if (status === StatusEmpenho.BLOQUEADO)
		return 'bg-yellow-100 text-yellow-800 border-yellow-200 dark:bg-yellow-900/30 dark:text-yellow-300 dark:border-yellow-800';
	if (status === StatusEmpenho.SEM_SALDO)
		return 'bg-red-100 text-red-800 border-red-200 dark:bg-red-900/30 dark:text-red-300 dark:border-red-800';

	// Solicitação
	if (status === StatusSolicitacao.PENDENTE)
		return 'bg-gray-100 text-gray-800 border-gray-200 dark:bg-muted dark:text-muted-foreground dark:border-border';
	if (status === StatusSolicitacao.AGUARDANDO_APROVACAO)
		return 'bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900/30 dark:text-blue-300 dark:border-blue-800';
	if (status === StatusSolicitacao.ANEXOS_RECUSADOS)
		return 'bg-red-100 text-red-800 border-red-200 dark:bg-red-900/30 dark:text-red-300 dark:border-red-800';
	if (status === StatusSolicitacao.PAGAMENTO_REALIZADO)
		return 'bg-green-100 text-green-800 border-green-200 dark:bg-green-900/30 dark:text-green-300 dark:border-green-800';
	if (status === StatusSolicitacao.CANCELADA)
		return 'bg-red-100 text-red-800 border-red-200 dark:bg-red-900/30 dark:text-red-300 dark:border-red-800';

	// Anexo
	if (status === StatusAnexo.PENDENTE)
		return 'bg-gray-100 text-gray-800 border-gray-200 dark:bg-muted dark:text-muted-foreground dark:border-border';
	if (status === StatusAnexo.ANEXO_CADASTRADO)
		return 'bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900/30 dark:text-blue-300 dark:border-blue-800';
	if (status === StatusAnexo.AGUARDANDO_APROVACAO)
		return 'bg-yellow-100 text-yellow-800 border-yellow-200 dark:bg-yellow-900/30 dark:text-yellow-300 dark:border-yellow-800';
	if (status === StatusAnexo.APROVADO)
		return 'bg-green-100 text-green-800 border-green-200 dark:bg-green-900/30 dark:text-green-300 dark:border-green-800';
	if (status === StatusAnexo.RECUSADO)
		return 'bg-red-100 text-red-800 border-red-200 dark:bg-red-900/30 dark:text-red-300 dark:border-red-800';

	// Chamado
	if (status === StatusChamado.ABERTO)
		return 'bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900/30 dark:text-blue-300 dark:border-blue-800';
	if (status === StatusChamado.EM_ATENDIMENTO)
		return 'bg-yellow-100 text-yellow-800 border-yellow-200 dark:bg-yellow-900/30 dark:text-yellow-300 dark:border-yellow-800';
	if (status === StatusChamado.CONCLUIDO)
		return 'bg-green-100 text-green-800 border-green-200 dark:bg-green-900/30 dark:text-green-300 dark:border-green-800';

	return 'bg-gray-100 text-gray-800 border-gray-200 dark:bg-muted dark:text-muted-foreground dark:border-border';
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
	return (
		<span
			className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getColor(
				status
			)} ${className || ''}`}>
			{status}
		</span>
	);
}

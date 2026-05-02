import { MessageSquare, Info } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

interface ChamadoActionsProps {
	chamadoId: number;
	status: string;
	ultimaMensagemPor?: 'usuario' | 'gestor';
	temRespostaPendente?: boolean;
	onVerLog: (id: number) => void;
	onVerInformacoes: (id: number) => void;
}

export function ChamadoActions({
	chamadoId,
	status,
	ultimaMensagemPor,
	temRespostaPendente,
	onVerLog,
	onVerInformacoes,
}: ChamadoActionsProps) {
	// Determinar a cor do ícone de Log baseado nas regras
	const getLogIconColor = () => {
		// Cinza: chamado concluído
		if (status === 'concluido') {
			return {
				bg: 'bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700',
				icon: 'text-gray-600 dark:text-gray-400',
				tooltip: 'Chamado concluído - Consultar histórico',
			};
		}

		// Laranja: chamado respondido pelo gestor, pendente de resposta do usuário
		if (temRespostaPendente || ultimaMensagemPor === 'gestor') {
			return {
				bg: 'bg-orange-100 hover:bg-orange-200 dark:bg-orange-900 dark:hover:bg-orange-800',
				icon: 'text-orange-600 dark:text-orange-400',
				tooltip: 'Resposta recebida - Requer sua atenção',
			};
		}

		// Azul: chamado aberto ou última mensagem foi do usuário
		return {
			bg: 'bg-blue-100 hover:bg-blue-200 dark:bg-blue-900 dark:hover:bg-blue-800',
			icon: 'text-blue-600 dark:text-blue-400',
			tooltip: 'Chamado em atendimento',
		};
	};

	const logColors = getLogIconColor();

	return (
		<div className="flex items-center gap-2">
			<TooltipProvider>
				{/* Botão Log */}
				<Tooltip>
					<TooltipTrigger asChild>
						<Button
							variant="ghost"
							size="sm"
							onClick={() => onVerLog(chamadoId)}
							className={`${logColors.bg} transition-colors`}>
							<MessageSquare className={`w-4 h-4 ${logColors.icon}`} />
						</Button>
					</TooltipTrigger>
					<TooltipContent>
						<p>{logColors.tooltip}</p>
					</TooltipContent>
				</Tooltip>

				{/* Botão Informações */}
				<Tooltip>
					<TooltipTrigger asChild>
						<Button
							variant="ghost"
							size="sm"
							onClick={() => onVerInformacoes(chamadoId)}
							className="bg-indigo-100 hover:bg-indigo-200 dark:bg-indigo-900 dark:hover:bg-indigo-800 transition-colors">
							<Info className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
						</Button>
					</TooltipTrigger>
					<TooltipContent>
						<p>Ver informações completas e logs do sistema</p>
					</TooltipContent>
				</Tooltip>
			</TooltipProvider>
		</div>
	);
}

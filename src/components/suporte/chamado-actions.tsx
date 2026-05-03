import { MessageSquare, Info } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

interface ChamadoActionsProps {
	chamadoId: number;
	status: string;
	ultimaMensagemPor?: 'usuario' | 'gestor';
	onVerLog: (id: number) => void;
	onVerInformacoes: (id: number) => void;
}

export function ChamadoActions({
	chamadoId,
	status,
	ultimaMensagemPor,
	onVerLog,
	onVerInformacoes,
}: ChamadoActionsProps) {
	const getLogIconColor = () => {
		// Cinza: chamado concluído
		if (status === 'concluido') {
			return {
				bg: 'bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700',
				icon: 'text-gray-600 dark:text-gray-400',
				tooltip: 'Chamado concluído - Consultar histórico',
			};
		}

		// Laranja: última mensagem foi do atendente — usuário precisa responder
		if (ultimaMensagemPor === 'gestor') {
			return {
				bg: 'bg-orange-100 hover:bg-orange-200 dark:bg-orange-900/40 dark:hover:bg-orange-900/60',
				icon: 'text-orange-600 dark:text-orange-400',
				tooltip: 'Atendente respondeu - Aguardando sua resposta',
			};
		}

		// Azul: última mensagem foi do usuário solicitante (ou chamado recém aberto)
		return {
			bg: 'bg-blue-100 hover:bg-blue-200 dark:bg-blue-900/40 dark:hover:bg-blue-900/60',
			icon: 'text-blue-600 dark:text-blue-400',
			tooltip: 'Aguardando resposta do atendente',
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

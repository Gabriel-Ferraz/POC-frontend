'use client';

import { useMinimizedWindows } from '@/providers/MinimizedWindowsProvider';
import { X, Maximize2, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function MinimizedWindowsBar() {
	const { janelas, restaurar, fechar, limparTodas } = useMinimizedWindows();

	if (janelas.length === 0) {
		return null;
	}

	const formatarTempo = (timestamp: number) => {
		const agora = Date.now();
		const diff = agora - timestamp;
		const minutos = Math.floor(diff / 60000);

		if (minutos < 1) return 'agora';
		if (minutos === 1) return 'há 1 min';
		if (minutos < 60) return `há ${minutos} min`;

		const horas = Math.floor(minutos / 60);
		if (horas === 1) return 'há 1 hora';
		return `há ${horas} horas`;
	};

	return (
		<div className="fixed bottom-0 left-0 right-0 z-50 bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800 shadow-lg">
			<div className="max-w-[100vw] overflow-x-auto">
				<div className="flex items-center gap-2 p-3 min-w-max">
					{/* Header */}
					<div className="flex items-center gap-2 pr-3 border-r border-gray-200 dark:border-gray-700">
						<span className="text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase">
							Janelas ({janelas.length}/{5})
						</span>
						{janelas.length > 1 && (
							<Button variant="ghost" size="sm" onClick={limparTodas} className="h-6 px-2 text-xs">
								<Trash2 className="w-3 h-3 mr-1" />
								Limpar
							</Button>
						)}
					</div>

					{/* Miniaturas */}
					<div className="flex items-center gap-2">
						{janelas.map((janela) => (
							<div
								key={janela.id}
								className="group relative flex items-center gap-3 px-4 py-2 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950 dark:to-indigo-950 border-2 border-blue-200 dark:border-blue-800 rounded-lg hover:shadow-md transition-all cursor-pointer min-w-[200px] max-w-[250px]">
								{/* Conteúdo clicável para restaurar */}
								<div
									onClick={() => restaurar(janela.id)}
									className="flex items-center gap-3 flex-1 min-w-0">
									{/* Ícone */}
									<div className="flex-shrink-0 w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center text-white">
										{janela.icone || <Maximize2 className="w-4 h-4" />}
									</div>

									{/* Info */}
									<div className="flex-1 min-w-0">
										<p className="text-sm font-semibold text-gray-900 dark:text-gray-100 truncate">
											{janela.titulo}
										</p>
										<p className="text-xs text-gray-500 dark:text-gray-400">
											{formatarTempo(janela.timestamp)}
										</p>
									</div>
								</div>

								{/* Botão Fechar */}
								<button
									onClick={(e) => {
										e.stopPropagation();
										fechar(janela.id);
									}}
									className="flex-shrink-0 p-1 rounded-md hover:bg-red-100 dark:hover:bg-red-900 transition-colors opacity-0 group-hover:opacity-100">
									<X className="w-4 h-4 text-red-600 dark:text-red-400" />
								</button>
							</div>
						))}
					</div>
				</div>
			</div>
		</div>
	);
}

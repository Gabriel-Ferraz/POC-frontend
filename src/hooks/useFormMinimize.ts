import { useMinimizedWindows } from '@/providers/MinimizedWindowsProvider';
import { usePathname } from 'next/navigation';
import { useCallback, useEffect, useState } from 'react';

interface UseFormMinimizeOptions {
	titulo: string;
	icone?: React.ReactNode;
	onRestore?: (dados: any) => void;
}

export function useFormMinimize<T = any>({ titulo, icone, onRestore }: UseFormMinimizeOptions) {
	const { minimizar, janelas, fechar } = useMinimizedWindows();
	const pathname = usePathname();
	const [isMinimizado, setIsMinimizado] = useState(false);
	const [dadosRestaurados, setDadosRestaurados] = useState<T | null>(null);

	// Verificar se existe janela minimizada para esta rota e se deve restaurar
	useEffect(() => {
		const janelaExistente = janelas.find((j) => j.rota === pathname);

		// Se existe janela e não está minimizado, é porque clicou para restaurar
		if (janelaExistente && !isMinimizado) {
			setDadosRestaurados(janelaExistente.dados);
			setIsMinimizado(false);
			if (onRestore) {
				onRestore(janelaExistente.dados);
			}
			// Remove da barra após restaurar
			fechar(janelaExistente.id);
		}
	}, [pathname, janelas, isMinimizado, onRestore, fechar]);

	const handleMinimizar = useCallback(
		(dados: T) => {
			minimizar(titulo, pathname, dados, icone);
			setIsMinimizado(true);
		},
		[titulo, pathname, icone, minimizar]
	);

	const handleRestaurar = useCallback(() => {
		setIsMinimizado(false);
	}, []);

	return {
		minimizar: handleMinimizar,
		restaurar: handleRestaurar,
		isMinimizado,
		dadosRestaurados,
		temDadosRestaurados: dadosRestaurados !== null,
	};
}

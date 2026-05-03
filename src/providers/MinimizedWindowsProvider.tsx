'use client';

import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';

export interface MinimizedWindow {
	id: string;
	titulo: string;
	rota: string;
	dados: any;
	timestamp: number;
	icone?: React.ReactNode;
}

interface MinimizedWindowsContextType {
	janelas: MinimizedWindow[];
	minimizar: (titulo: string, rota: string, dados: any, icone?: React.ReactNode) => void;
	restaurar: (id: string) => void;
	fechar: (id: string) => void;
	limparTodas: () => void;
	obterDados: (id: string) => any;
}

const MinimizedWindowsContext = createContext<MinimizedWindowsContextType | undefined>(undefined);

const STORAGE_KEY = 'minimized_windows';
const MAX_WINDOWS = 5;

export function MinimizedWindowsProvider({ children }: { children: React.ReactNode }) {
	const [janelas, setJanelas] = useState<MinimizedWindow[]>([]);

	// Carregar do localStorage ao iniciar
	useEffect(() => {
		const stored = localStorage.getItem(STORAGE_KEY);
		if (stored) {
			try {
				const parsed = JSON.parse(stored);
				setJanelas(parsed);
			} catch (e) {
				console.error('Erro ao carregar janelas minimizadas:', e);
			}
		}
	}, []);

	// Salvar no localStorage sempre que mudar (sem o ícone, que não pode ser serializado)
	useEffect(() => {
		if (janelas.length > 0) {
			const janelasParaSalvar = janelas.map(({ icone, ...resto }) => resto);
			localStorage.setItem(STORAGE_KEY, JSON.stringify(janelasParaSalvar));
		} else {
			localStorage.removeItem(STORAGE_KEY);
		}
	}, [janelas]);

	const minimizar = useCallback(
		(titulo: string, rota: string, dados: any, icone?: React.ReactNode) => {
			// Verificar se já existe uma janela para essa rota
			const janelaExistente = janelas.find((j) => j.rota === rota);

			if (janelaExistente) {
				// Atualizar dados da janela existente
				setJanelas((prev) =>
					prev.map((j) => (j.id === janelaExistente.id ? { ...j, dados, timestamp: Date.now() } : j))
				);
				return;
			}

			// Verificar limite de janelas
			if (janelas.length >= MAX_WINDOWS) {
				alert(`Você já tem ${MAX_WINDOWS} janelas abertas. Feche alguma para abrir uma nova.`);
				return;
			}

			// Criar nova janela
			const novaJanela: MinimizedWindow = {
				id: `window-${Date.now()}`,
				titulo,
				rota,
				dados,
				timestamp: Date.now(),
				icone,
			};

			setJanelas((prev) => [...prev, novaJanela]);
		},
		[janelas]
	);

	const restaurar = useCallback(
		(id: string) => {
			const janela = janelas.find((j) => j.id === id);
			if (janela) {
				// Se já está na rota, apenas recarrega para forçar restauração
				// Senão, navega para a rota
				if (window.location.pathname === janela.rota) {
					window.location.reload();
				} else {
					window.location.href = janela.rota;
				}
			}
		},
		[janelas]
	);

	const fechar = useCallback((id: string) => {
		setJanelas((prev) => prev.filter((j) => j.id !== id));
	}, []);

	const limparTodas = useCallback(() => {
		if (confirm('Deseja fechar todas as janelas minimizadas?')) {
			setJanelas([]);
		}
	}, []);

	const obterDados = useCallback(
		(id: string) => {
			const janela = janelas.find((j) => j.id === id);
			return janela?.dados;
		},
		[janelas]
	);

	return (
		<MinimizedWindowsContext.Provider
			value={{
				janelas,
				minimizar,
				restaurar,
				fechar,
				limparTodas,
				obterDados,
			}}>
			{children}
		</MinimizedWindowsContext.Provider>
	);
}

export function useMinimizedWindows() {
	const context = useContext(MinimizedWindowsContext);
	if (!context) {
		throw new Error('useMinimizedWindows deve ser usado dentro de MinimizedWindowsProvider');
	}
	return context;
}

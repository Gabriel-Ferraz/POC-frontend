'use client';

import * as React from 'react';
import { toast } from 'sonner';
import { useAuth } from '@/providers/AuthProvider';

export function useLoginForm() {
	const [cpf, setCpf] = React.useState('');
	const [password, setPassword] = React.useState('');
	const [loading, setLoading] = React.useState(false);
	const [error, setError] = React.useState<string | null>(null);

	const { login } = useAuth();

	// Debug: monitora mudanças no error
	React.useEffect(() => {
		console.log('[useLoginForm] Error state changed:', error);
	}, [error]);

	const handleSubmit = React.useCallback(
		async (e: React.FormEvent<HTMLFormElement>) => {
			console.log('[useLoginForm] handleSubmit chamado');
			e.preventDefault();
			e.stopPropagation();

			console.log('[useLoginForm] preventDefault executado, iniciando login...');

			if (loading) {
				console.log('[useLoginForm] Já está carregando, ignorando');
				return;
			}

			setLoading(true);
			setError(null); // Limpa erro anterior apenas ao tentar novamente

			try {
				console.log('[useLoginForm] Chamando login...');
				await login(cpf, password);
				console.log('[useLoginForm] Login bem-sucedido!');
				// Não mostra toast de sucesso pois vai redirecionar
				// Se chegou aqui, login foi bem-sucedido
			} catch (err: any) {
				console.error('[useLoginForm] Erro capturado:', err);
				// Usa a mensagem do backend
				const msg = err?.payload?.message || err?.message || 'CPF ou senha inválidos';

				setError(msg);
				setLoading(false); // Para o loading imediatamente quando falha
				// Não faz redirect, mantém na página de login com erro visível
			}
		},
		[cpf, password, loading, login]
	);

	return {
		cpf,
		password,
		loading,
		error,
		setCpf,
		setPassword,
		handleSubmit,
	};
}

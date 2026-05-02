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

	const handleSubmit = React.useCallback(
		async (e: React.FormEvent<HTMLFormElement>) => {
			e.preventDefault();

			if (loading) return;

			setLoading(true);
			setError(null);

			try {
				await login(cpf, password);
				toast.success('Login realizado com sucesso!');
			} catch (err: any) {
				const msg = err?.payload?.message || err?.message || 'CPF ou senha inválidos';
				setError(msg);
				toast.error(msg);
			} finally {
				setLoading(false);
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

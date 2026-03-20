'use client';

import * as React from 'react';
import { toast } from 'sonner';

import { loginWithEmailAndPassword } from '../api/auth-api';
import { getMe } from '../api/me';
import { getFirstAccessibleRoute } from '@/lib/navigation/routes';

const NO_ACCESS_ROUTE = '/sem-acesso';

export function useLoginForm() {
    const [email, setEmail] = React.useState('');
    const [password, setPassword] = React.useState('');
    const [loading, setLoading] = React.useState(false);
    const [error, setError] = React.useState<string | null>(null);

    const handleSubmit = React.useCallback(
        async (e: React.FormEvent<HTMLFormElement>) => {
            e.preventDefault();

            if (loading) return;

            setLoading(true);
            setError(null);

            const loginPromise = loginWithEmailAndPassword(email, password);

            toast.promise(loginPromise, {
                loading: 'Entrando...',
                success: 'Login realizado com sucesso',
                error: (err: any) => {
                    const msg = err?.payload?.errors
                        ? Object.values(err.payload.errors).flat().join('. ')
                        : err?.message ?? 'Falha no login';

                    setError(msg);
                    return msg;
                },
            });

            try {
                await loginPromise;

                const me = await getMe();
                const destination = getFirstAccessibleRoute(me.user.permissions ?? [], me.user.roles ?? []);

                window.location.href = destination ?? NO_ACCESS_ROUTE;
            } catch {
                setLoading(false);
            }
        },
        [email, password, loading]
    );

    return {
        email,
        password,
        loading,
        error,
        setEmail,
        setPassword,
        handleSubmit,
    };
}

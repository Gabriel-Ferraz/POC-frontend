'use client';

import * as React from 'react';
import { toast } from 'sonner';

import { ApiError } from '@/lib/http/types';

import { resetPassword } from '../api/password';

export function useResetPasswordForm(token: string, email: string) {
    const [password, setPassword] = React.useState('');
    const [passwordConfirmation, setPasswordConfirmation] = React.useState('');
    const [loading, setLoading] = React.useState(false);
    const [error, setError] = React.useState<string | null>(null);
    const [fieldErrors, setFieldErrors] = React.useState<Record<string, string>>({});
    const [success, setSuccess] = React.useState(false);
    const [tokenExpired, setTokenExpired] = React.useState(false);

    const handleSubmit = React.useCallback(
        async (e: React.FormEvent<HTMLFormElement>) => {
            e.preventDefault();
            if (loading) return;

            setFieldErrors({});
            setError(null);

            if (password.length < 6) {
                setFieldErrors({ password: 'A senha deve ter pelo menos 6 caracteres.' });
                return;
            }

            if (password !== passwordConfirmation) {
                setFieldErrors({ password_confirmation: 'As senhas nao conferem.' });
                return;
            }

            setLoading(true);

            try {
                await resetPassword({
                    token,
                    email,
                    password,
                    password_confirmation: passwordConfirmation,
                });
                setSuccess(true);
                toast.success('Senha redefinida com sucesso');
            } catch (err: unknown) {
                if (err instanceof ApiError) {
                    if (err.status === 400) {
                        setTokenExpired(true);
                        setError('Token invalido ou expirado.');
                        toast.error('Token invalido ou expirado.');
                    } else if (err.status === 422) {
                        const errors = (err.payload as { errors?: Record<string, string[]> })?.errors;
                        if (errors) {
                            const mapped: Record<string, string> = {};
                            for (const key of Object.keys(errors)) {
                                mapped[key] = errors[key][0];
                            }
                            setFieldErrors(mapped);
                        } else {
                            setError(err.message);
                            toast.error(err.message);
                        }
                    } else {
                        setError(err.message);
                        toast.error(err.message);
                    }
                } else {
                    setError('Erro inesperado. Tente novamente.');
                    toast.error('Erro inesperado. Tente novamente.');
                }
            } finally {
                setLoading(false);
            }
        },
        [token, email, password, passwordConfirmation, loading]
    );

    return {
        password,
        setPassword,
        passwordConfirmation,
        setPasswordConfirmation,
        loading,
        error,
        fieldErrors,
        success,
        tokenExpired,
        handleSubmit,
    };
}

'use client';

import * as React from 'react';
import { toast } from 'sonner';

import { ApiError } from '@/lib/http/types';

import { forgotPassword } from '../api/password';

const COOLDOWN_STEPS = [60, 120, 300];

export function useForgotPasswordForm() {
    const [email, setEmail] = React.useState('');
    const [loading, setLoading] = React.useState(false);
    const [error, setError] = React.useState<string | null>(null);
    const [sent, setSent] = React.useState(false);
    const [cooldown, setCooldown] = React.useState(0);
    const [resendCount, setResendCount] = React.useState(0);

    React.useEffect(() => {
        if (cooldown <= 0) return;
        const timer = setInterval(() => {
            setCooldown((prev) => {
                if (prev <= 1) {
                    clearInterval(timer);
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);
        return () => clearInterval(timer);
    }, [cooldown]);

    function startCooldown() {
        const step = Math.min(resendCount, COOLDOWN_STEPS.length - 1);
        setCooldown(COOLDOWN_STEPS[step]);
        setResendCount((prev) => prev + 1);
    }

    function handleApiError(err: unknown) {
        if (err instanceof ApiError) {
            if (err.status === 429) {
                const msg = 'Aguarde antes de solicitar outro link.';
                setError(msg);
                toast.error(msg);
            } else if (err.status === 422) {
                const errors = (err.payload as { errors?: Record<string, string[]> })?.errors;
                const msg = errors?.email?.[0] ?? err.message;
                setError(msg);
                toast.error(msg);
            } else {
                setError(err.message);
                toast.error(err.message);
            }
        } else {
            const msg = 'Erro inesperado. Tente novamente.';
            setError(msg);
            toast.error(msg);
        }
    }

    const handleSubmit = React.useCallback(
        async (e: React.FormEvent<HTMLFormElement>) => {
            e.preventDefault();
            if (loading || cooldown > 0) return;

            setLoading(true);
            setError(null);

            try {
                await forgotPassword(email);
                setSent(true);
                startCooldown();
                toast.success('Email enviado com sucesso');
            } catch (err: unknown) {
                handleApiError(err);
            } finally {
                setLoading(false);
            }
        },
        [email, loading, cooldown, resendCount]
    );

    function handleResend() {
        if (loading || cooldown > 0) return;
        setLoading(true);
        setError(null);

        forgotPassword(email)
            .then(() => {
                toast.success('Email reenviado com sucesso');
                startCooldown();
            })
            .catch((err: unknown) => {
                handleApiError(err);
            })
            .finally(() => {
                setLoading(false);
            });
    }

    const cooldownFormatted = React.useMemo(() => {
        if (cooldown <= 0) return '';
        const min = Math.floor(cooldown / 60);
        const sec = cooldown % 60;
        return min > 0
            ? `${min}:${sec.toString().padStart(2, '0')}`
            : `${sec}s`;
    }, [cooldown]);

    return {
        email,
        setEmail,
        loading,
        error,
        sent,
        cooldown,
        cooldownFormatted,
        handleSubmit,
        handleResend,
    };
}

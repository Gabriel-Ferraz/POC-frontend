'use client';

import Link from 'next/link';
import { ArrowLeft, Mail, Loader2 } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

import { useForgotPasswordForm } from '../hooks/useForgotPasswordForm';

export function ForgotPasswordForm() {
    const {
        email,
        setEmail,
        loading,
        error,
        sent,
        cooldown,
        cooldownFormatted,
        handleSubmit,
        handleResend,
    } = useForgotPasswordForm();

    return (
        <div className="flex min-h-screen items-center justify-center bg-muted/30 p-4">
            <div className="w-full max-w-sm space-y-4">
                {/* TODO: Replace with your logo */}
                <div className="flex justify-center">
                    <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary text-xl font-bold text-primary-foreground">B</div>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle className="text-center">Esqueci minha senha</CardTitle>
                        <CardDescription className="text-center">
                            {sent
                                ? 'Verifique seu email para o link de redefinicao de senha.'
                                : 'Informe seu email para receber o link de redefinicao.'}
                        </CardDescription>
                    </CardHeader>

                    <CardContent>
                        {!sent ? (
                            <form className="space-y-3" onSubmit={handleSubmit}>
                                <div className="space-y-1">
                                    <Label htmlFor="forgot-email">Email</Label>
                                    <Input
                                        id="forgot-email"
                                        type="email"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        placeholder="voce@empresa.com"
                                        autoComplete="email"
                                        disabled={loading}
                                        required
                                    />
                                </div>

                                {error && <div className="text-center text-sm text-red-600">{error}</div>}

                                <Button type="submit" className="w-full" disabled={loading}>
                                    {loading && <Loader2 className="h-4 w-4 animate-spin" />}
                                    Enviar link
                                </Button>
                            </form>
                        ) : (
                            <div className="space-y-4">
                                <div className="flex flex-col items-center gap-3 py-2">
                                    <div className="rounded-full bg-emerald-100 p-3 dark:bg-emerald-900/40">
                                        <Mail className="h-6 w-6 text-emerald-600 dark:text-emerald-400" />
                                    </div>
                                    <p className="text-sm text-muted-foreground text-center">
                                        Enviamos um link para <strong className="text-foreground">{email}</strong>.
                                        Verifique sua caixa de entrada e spam.
                                    </p>
                                </div>

                                {error && <div className="text-center text-sm text-red-600">{error}</div>}

                                <Button
                                    type="button"
                                    variant="outline"
                                    className="w-full"
                                    disabled={loading || cooldown > 0}
                                    onClick={handleResend}
                                >
                                    {loading && <Loader2 className="h-4 w-4 animate-spin" />}
                                    {cooldown > 0
                                        ? `Reenviar em ${cooldownFormatted}`
                                        : 'Reenviar email'}
                                </Button>
                            </div>
                        )}
                    </CardContent>
                </Card>

                <div className="text-center">
                    <Link href="/login" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors">
                        <ArrowLeft className="h-3.5 w-3.5" />
                        Voltar para o login
                    </Link>
                </div>
            </div>
        </div>
    );
}

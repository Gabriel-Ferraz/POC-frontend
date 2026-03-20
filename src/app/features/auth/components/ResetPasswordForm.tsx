'use client';

import Link from 'next/link';
import { ArrowLeft, CheckCircle, AlertTriangle, Loader2 } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { PasswordInput } from '@/components/ui/password-input';

import { useResetPasswordForm } from '../hooks/useResetPasswordForm';

export function ResetPasswordForm({ token, email }: { token: string; email: string }) {
    const {
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
    } = useResetPasswordForm(token, email);

    return (
        <div className="flex min-h-screen items-center justify-center bg-muted/30 p-4">
            <div className="w-full max-w-sm space-y-4">
                {/* TODO: Replace with your logo */}
                <div className="flex justify-center">
                    <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary text-xl font-bold text-primary-foreground">B</div>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle className="text-center">
                            {success ? 'Senha redefinida' : tokenExpired ? 'Link expirado' : 'Nova senha'}
                        </CardTitle>
                        {!success && !tokenExpired && (
                            <CardDescription className="text-center">
                                Defina sua nova senha para acessar o sistema.
                            </CardDescription>
                        )}
                    </CardHeader>

                    <CardContent>
                        {success ? (
                            <div className="space-y-4">
                                <div className="flex flex-col items-center gap-3 py-2">
                                    <div className="rounded-full bg-emerald-100 p-3 dark:bg-emerald-900/40">
                                        <CheckCircle className="h-6 w-6 text-emerald-600 dark:text-emerald-400" />
                                    </div>
                                    <p className="text-sm text-muted-foreground text-center">
                                        Sua senha foi redefinida com sucesso. Agora voce pode fazer login com a nova senha.
                                    </p>
                                </div>

                                <Button asChild className="w-full">
                                    <Link href="/login">Ir para o login</Link>
                                </Button>
                            </div>
                        ) : tokenExpired ? (
                            <div className="space-y-4">
                                <div className="flex flex-col items-center gap-3 py-2">
                                    <div className="rounded-full bg-amber-100 p-3 dark:bg-amber-900/40">
                                        <AlertTriangle className="h-6 w-6 text-amber-600 dark:text-amber-400" />
                                    </div>
                                    <p className="text-sm text-muted-foreground text-center">
                                        O link de redefinicao de senha e invalido ou expirou. Solicite um novo link.
                                    </p>
                                </div>

                                <Button asChild className="w-full">
                                    <Link href="/esqueci-minha-senha">Solicitar novo link</Link>
                                </Button>
                            </div>
                        ) : (
                            <form className="space-y-3" onSubmit={handleSubmit}>
                                <div className="space-y-1">
                                    <Label htmlFor="reset-password">Nova senha</Label>
                                    <PasswordInput
                                        id="reset-password"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        autoComplete="new-password"
                                        disabled={loading}
                                        required
                                        minLength={6}
                                    />
                                    {fieldErrors.password && (
                                        <p className="text-xs text-red-600">{fieldErrors.password}</p>
                                    )}
                                </div>

                                <div className="space-y-1">
                                    <Label htmlFor="reset-password-confirm">Confirmar nova senha</Label>
                                    <PasswordInput
                                        id="reset-password-confirm"
                                        value={passwordConfirmation}
                                        onChange={(e) => setPasswordConfirmation(e.target.value)}
                                        autoComplete="new-password"
                                        disabled={loading}
                                        required
                                        minLength={6}
                                    />
                                    {fieldErrors.password_confirmation && (
                                        <p className="text-xs text-red-600">{fieldErrors.password_confirmation}</p>
                                    )}
                                </div>

                                {error && <div className="text-center text-sm text-red-600">{error}</div>}

                                <Button type="submit" className="w-full" disabled={loading}>
                                    {loading && <Loader2 className="h-4 w-4 animate-spin" />}
                                    Redefinir senha
                                </Button>
                            </form>
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

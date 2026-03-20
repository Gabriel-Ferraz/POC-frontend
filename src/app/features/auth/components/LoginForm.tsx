'use client';

import Link from 'next/link';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { PasswordInput } from '@/components/ui/password-input';

import { useLoginForm } from '../hooks/useLoginForm';

export function LoginForm() {

    const {
        email,
        password,
        loading,
        error,
        setEmail,
        setPassword,
        handleSubmit
    } = useLoginForm();

    return (
        <div className="flex min-h-screen items-center justify-center bg-muted/30 p-4">
            <div className="w-full max-w-sm space-y-4">
                {/* TODO: Replace with your logo */}
                <div className="flex justify-center">
                    <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary text-xl font-bold text-primary-foreground">B</div>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle className="text-center">Entrar</CardTitle>
                    </CardHeader>

                    <CardContent>
                        <form className="space-y-3" onSubmit={handleSubmit}>
                            <div className="space-y-1">
                                <Label htmlFor="email">Email</Label>
                                <Input
                                    id="email"
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="voce@empresa.com"
                                    autoComplete="email"
                                    disabled={loading}
                                />
                            </div>

                            <div className="space-y-1">
                                <Label htmlFor="password">Senha</Label>
                                <PasswordInput
                                    id="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    autoComplete="current-password"
                                    disabled={loading}
                                />
                            </div>

                            {error && <div className="text-center text-sm text-red-600">{error}</div>}

                            <Button type="submit" className="w-full" disabled={loading}>
                                {loading ? 'Entrando...' : 'Entrar'}
                            </Button>

                            <div className="text-center">
                                <Link href="/esqueci-minha-senha" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                                    Esqueci minha senha
                                </Link>
                            </div>
                        </form>
                    </CardContent>
                </Card>

                <div className="text-center text-xs text-muted-foreground">
                    © {new Date().getFullYear()} Your Company
                </div>
            </div>
        </div>
    );
}
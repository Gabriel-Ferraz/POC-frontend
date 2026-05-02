'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { PasswordInput } from '@/components/ui/password-input';

import { useLoginForm } from '../hooks/useLoginForm';

export function LoginForm() {
	const { cpf, password, loading, error, setCpf, setPassword, handleSubmit } = useLoginForm();

	return (
		<div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-blue-50 to-blue-100 dark:from-background dark:to-muted p-4">
			<div className="w-full max-w-md space-y-6">
				<div className="flex flex-col items-center space-y-2">
					<div className="flex h-16 w-16 items-center justify-center rounded-full bg-blue-900 text-2xl font-bold text-white">
						PMSJP
					</div>
					<h1 className="text-xl font-semibold text-gray-800 dark:text-foreground">Portal do Fornecedor</h1>
					<p className="text-sm text-gray-600 dark:text-muted-foreground">
						Prefeitura Municipal de São José dos Pinhais
					</p>
				</div>

				<Card>
					<CardHeader>
						<CardTitle className="text-center text-lg">Acesso ao Sistema</CardTitle>
					</CardHeader>

					<CardContent>
						<form className="space-y-4" onSubmit={handleSubmit}>
							<div className="space-y-2">
								<Label htmlFor="cpf">CPF</Label>
								<Input
									id="cpf"
									type="text"
									value={cpf}
									onChange={(e) => setCpf(e.target.value)}
									placeholder="000.000.000-00"
									autoComplete="username"
									disabled={loading}
									maxLength={14}
									className={error ? 'border-red-500 focus-visible:ring-red-500' : ''}
								/>
								{error && <p className="text-sm text-red-600 mt-1">{error}</p>}
							</div>

							<div className="space-y-2">
								<Label htmlFor="password">Senha</Label>
								<PasswordInput
									id="password"
									value={password}
									onChange={(e) => setPassword(e.target.value)}
									autoComplete="current-password"
									disabled={loading}
								/>
							</div>

							<Button type="submit" className="w-full" disabled={loading}>
								{loading ? 'Entrando...' : 'Entrar'}
							</Button>
						</form>
					</CardContent>
				</Card>

				<div className="text-center text-xs text-gray-600 dark:text-muted-foreground">
					© {new Date().getFullYear()} Prefeitura Municipal de São José dos Pinhais
				</div>
			</div>
		</div>
	);
}

'use client';

import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { AlertTriangle } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

import { ResetPasswordForm } from '../features/auth/components/ResetPasswordForm';

export default function ResetPasswordPage() {
	const searchParams = useSearchParams();
	const token = searchParams.get('token');
	const email = searchParams.get('email');

	if (!token || !email) {
		return (
			<div className="flex min-h-screen items-center justify-center bg-muted/30 p-4">
				<div className="w-full max-w-sm">
					<Card>
						<CardHeader>
							<CardTitle className="text-center">Link invalido</CardTitle>
						</CardHeader>
						<CardContent className="space-y-4">
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
						</CardContent>
					</Card>
				</div>
			</div>
		);
	}

	return <ResetPasswordForm token={token} email={email} />;
}

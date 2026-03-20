'use client';

import { ShieldX } from 'lucide-react';

export default function SemAcessoClient() {
	return (
		<div className="flex flex-1 items-center justify-center py-32">
			<div className="mx-auto max-w-md text-center space-y-6">
				<div className="mx-auto flex h-24 w-24 items-center justify-center rounded-full bg-orange-100 dark:bg-orange-950">
					<ShieldX className="h-12 w-12 text-orange-500" />
				</div>

				<div className="space-y-2">
					<h1 className="text-2xl font-bold tracking-tight">Acesso restrito</h1>
					<p className="text-muted-foreground">
						Sua conta não possui permissões para acessar nenhuma página do sistema.
					</p>
					<p className="text-muted-foreground">
						Solicite as permissões necessárias ao <strong>Administrador</strong>.
					</p>
				</div>
			</div>
		</div>
	);
}

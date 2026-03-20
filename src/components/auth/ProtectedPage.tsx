'use client';

import { AlertTriangle, ShieldX } from 'lucide-react';
import * as React from 'react';
import { toast } from 'sonner';

import { parsePermission } from '@/lib/casl/ability';
import { useAbility } from '@/providers/AbilityProvider';
import { useAuth } from '@/providers/AuthProvider';

export default function ProtectedPage({
	permission,
	children,
}: {
	permission: string;
	children: React.ReactNode;
}) {
	const { loading, permissions, roles } = useAuth();
	const ability = useAbility();
	const [state, setState] = React.useState<'loading' | 'allowed' | 'denied' | 'no-permissions'>('loading');
	const toastShown = React.useRef(false);

	React.useEffect(() => {
		if (loading) return;

		const isSuperAdmin = roles.includes('super-admin');

		if (!isSuperAdmin && permissions.length === 0) {
			setState('no-permissions');
			return;
		}

		const { action, subject } = parsePermission(permission);

		if (ability.can(action, subject)) {
			setState('allowed');
		} else {
			setState('denied');
			if (!toastShown.current) {
				toastShown.current = true;
				toast.error('Você não tem permissão para acessar esta página');
			}
		}
	}, [loading, permission, ability, permissions, roles]);

	if (state === 'loading') {
		return null;
	}

	if (state === 'allowed') {
		return <>{children}</>;
	}

	if (state === 'no-permissions') {
		return <NoPermissionsFallback />;
	}

	return <DeniedFallback />;
}

function NoPermissionsFallback() {
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

function DeniedFallback() {
	return (
		<div className="flex flex-1 items-center justify-center py-32">
			<div className="mx-auto max-w-md text-center space-y-6">
				<div className="mx-auto flex h-24 w-24 items-center justify-center rounded-full bg-orange-100 dark:bg-orange-950">
					<AlertTriangle className="h-12 w-12 text-orange-500" />
				</div>

				<div className="space-y-2">
					<h1 className="text-2xl font-bold tracking-tight">Página não autorizada</h1>
					<p className="text-muted-foreground">
						Você não tem permissão para acessar esta página.
					</p>
					<p className="text-muted-foreground">
						Use o menu lateral para navegar às páginas disponíveis ou solicite acesso ao <strong>Administrador</strong>.
					</p>
				</div>
			</div>
		</div>
	);
}

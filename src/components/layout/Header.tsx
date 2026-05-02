'use client';

import { useAuth } from '@/providers/AuthProvider';
import { Button } from '@/components/ui/button';
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Mail, User, LogOut } from 'lucide-react';
import Link from 'next/link';
import { formatCPF } from '@/lib/formatters';
import { ThemeToggle } from '@/components/theme/ThemeToggle';

const perfilLabels: Record<string, string> = {
	responsavel_tecnico: 'Responsável Técnico',
	gestor_contrato: 'Gestor do Contrato',
	operador_pmsjp: 'Operador PMSJP',
	gestor_suporte: 'Gestor de Suporte',
	usuario_comum: 'Usuário Comum',
	operador_orcamentario: 'Operador Orçamentário',
};

export function Header() {
	const { user, logout } = useAuth();

	console.log('[Header] Usuário:', user);

	if (!user) {
		console.log('[Header] Sem usuário, não renderizando header');
		return null;
	}

	return (
		<header className="h-16 bg-white dark:bg-card border-b dark:border-border flex items-center justify-between px-6">
			<div>
				<h1 className="text-lg font-semibold text-gray-800 dark:text-foreground">Portal do Fornecedor</h1>
				<p className="text-xs text-gray-500 dark:text-muted-foreground">São José dos Pinhais</p>
			</div>

			<div className="flex items-center gap-4">
				<ThemeToggle />
				<Link href="/suporte">
					<Button variant="outline" size="sm">
						<Mail className="w-4 h-4 mr-2" />
						Suporte
					</Button>
				</Link>

				<DropdownMenu>
					<DropdownMenuTrigger asChild>
						<Button variant="ghost" size="sm" className="gap-2">
							<User className="w-4 h-4" />
							<span>{user.name}</span>
						</Button>
					</DropdownMenuTrigger>
					<DropdownMenuContent align="end" className="w-56">
						<div className="p-2">
							<p className="text-sm font-medium">{user.name}</p>
							<p className="text-xs text-muted-foreground">CPF: {formatCPF(user.cpf)}</p>
							<p className="text-xs text-muted-foreground">
								Perfil: {perfilLabels[user.perfil] || user.perfil}
							</p>
							{user.fornecedor && (
								<p className="text-xs text-muted-foreground mt-1">Fornecedor: {user.fornecedor.nome}</p>
							)}
						</div>
						<DropdownMenuSeparator />
						<DropdownMenuItem onClick={() => logout()} className="cursor-pointer">
							<LogOut className="w-4 h-4 mr-2" />
							Sair
						</DropdownMenuItem>
					</DropdownMenuContent>
				</DropdownMenu>
			</div>
		</header>
	);
}

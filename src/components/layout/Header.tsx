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
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { Mail, User, LogOut, Menu } from 'lucide-react';
import Link from 'next/link';
import { formatCPF } from '@/lib/formatters';
import { ThemeToggle } from '@/components/theme/ThemeToggle';
import { MobileMenu } from './MobileMenu';
import { useState } from 'react';

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
	const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

	console.log('[Header] Usuário:', user);

	if (!user) {
		console.log('[Header] Sem usuário, não renderizando header');
		return null;
	}

	return (
		<header className="h-16 bg-white dark:bg-card border-b dark:border-border flex items-center justify-between px-4 md:px-6">
			<div className="flex items-center gap-3 min-w-0">
				{/* Menu Mobile */}
				<Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
					<SheetTrigger asChild>
						<Button variant="ghost" size="sm" className="md:hidden">
							<Menu className="w-5 h-5" />
						</Button>
					</SheetTrigger>
					<SheetContent side="left" className="w-64 p-0">
						<MobileMenu onNavigate={() => setMobileMenuOpen(false)} />
					</SheetContent>
				</Sheet>

				<div className="min-w-0">
					<h1 className="text-base md:text-lg font-semibold text-gray-800 dark:text-foreground truncate">
						Portal do Fornecedor
					</h1>
					<p className="text-xs text-gray-500 dark:text-muted-foreground hidden sm:block">
						São José dos Pinhais
					</p>
				</div>
			</div>

			<div className="flex items-center gap-2 md:gap-4">
				<ThemeToggle />
				<Link href="/suporte" className="hidden sm:block">
					<Button variant="outline" size="sm">
						<Mail className="w-4 h-4 md:mr-2" />
						<span className="hidden md:inline">Suporte</span>
					</Button>
				</Link>
				<Link href="/suporte" className="sm:hidden">
					<Button variant="outline" size="sm">
						<Mail className="w-4 h-4" />
					</Button>
				</Link>

				<DropdownMenu>
					<DropdownMenuTrigger asChild>
						<Button variant="ghost" size="sm" className="gap-2">
							<User className="w-4 h-4" />
							<span className="hidden md:inline max-w-[150px] truncate">{user.name}</span>
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

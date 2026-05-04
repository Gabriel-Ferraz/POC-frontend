'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/providers/AuthProvider';
import { PerfilUsuario } from '@/types/enums';
import {
	FileText,
	Paperclip,
	Mail,
	FileBarChart,
	Calculator,
	Settings,
	Building2,
	Shield,
	BookOpen,
} from 'lucide-react';

interface MenuItem {
	label: string;
	href: string;
	icon: React.ComponentType<{ className?: string }>;
}

interface MenuSection {
	title: string;
	perfis: PerfilUsuario[];
	items: MenuItem[];
}

export function Sidebar() {
	const { user } = useAuth();
	const pathname = usePathname();

	console.log('[Sidebar] Usuário:', user);
	console.log('[Sidebar] Perfil:', user?.perfil);

	const menuItems: MenuSection[] = [
		{
			title: 'Portal do Fornecedor',
			perfis: [PerfilUsuario.RESPONSAVEL_TECNICO],
			items: [{ label: 'Empenhos', href: '/portal-fornecedor', icon: FileText }],
		},
		{
			title: 'Gestor',
			perfis: [PerfilUsuario.GESTOR_CONTRATO],
			items: [
				{
					label: 'Aprovar Anexos',
					href: '/gestor/solicitacoes',
					icon: Paperclip,
				},
			],
		},
		{
			title: 'Prestação de Contas',
			perfis: [PerfilUsuario.OPERADOR_PMSJP],
			items: [
				{
					label: 'Exportador SIM-AM',
					href: '/prestacao-contas',
					icon: FileBarChart,
				},
			],
		},
		{
			title: 'Orçamentário',
			perfis: [PerfilUsuario.OPERADOR_ORCAMENTARIO],
			items: [
				{
					label: 'Leis e Atos',
					href: '/orcamentario/leis-atos',
					icon: Calculator,
				},
				{
					label: 'Alterações Orçamentárias',
					href: '/orcamentario/alteracoes',
					icon: Calculator,
				},
			],
		},
		{
			title: 'Demonstração',
			perfis: [PerfilUsuario.GESTOR_SUPORTE],
			items: [
				{
					label: 'Demonstração Técnica',
					href: '/demonstracao-tecnica',
					icon: Settings,
				},
				{
					label: 'Roteiro de Demonstração',
					href: '/roteiro-demonstracao',
					icon: BookOpen,
				},
			],
		},
		{
			title: 'Administração',
			perfis: [PerfilUsuario.GESTOR_SUPORTE],
			items: [
				{
					label: 'Painel Admin',
					href: '/admin',
					icon: Shield,
				},
			],
		},
	];

	const filteredMenu = menuItems.filter((section) => {
		const included = user?.perfil && section.perfis.includes(user.perfil as PerfilUsuario);
		console.log(`[Sidebar] Seção "${section.title}" incluída:`, included);
		return included;
	});

	console.log('[Sidebar] Menu filtrado:', filteredMenu);

	if (!user) {
		console.log('[Sidebar] Sem usuário, não renderizando sidebar');
		return null;
	}

	return (
		<aside className="w-64 bg-white dark:bg-card border-r dark:border-border min-h-screen">
			<div className="p-4 border-b">
				<div className="flex items-center gap-3">
					<div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-900 text-white font-bold">
						<Building2 className="h-6 w-6" />
					</div>
					<div>
						<h2 className="text-lg font-bold text-blue-900">PMSJP</h2>
						<p className="text-xs text-gray-500 dark:text-muted-foreground">Portal Integrado</p>
					</div>
				</div>
			</div>

			<nav className="p-4 space-y-6">
				{filteredMenu.map((section) => (
					<div key={section.title}>
						<h3 className="text-xs font-semibold text-gray-500 dark:text-muted-foreground uppercase mb-2 px-3">
							{section.title}
						</h3>
						<ul className="space-y-1">
							{section.items.map((item) => {
								const Icon = item.icon;
								const isActive = pathname === item.href;
								return (
									<li key={item.href}>
										<Link
											href={item.href}
											className={`flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-colors ${
												isActive
													? 'bg-blue-100 text-blue-900 font-medium dark:bg-sidebar-accent dark:text-sidebar-accent-foreground'
													: 'text-gray-700 hover:bg-gray-100 dark:text-sidebar-foreground dark:hover:bg-sidebar-accent'
											}`}>
											<Icon className="w-4 h-4" />
											{item.label}
										</Link>
									</li>
								);
							})}
						</ul>
					</div>
				))}
			</nav>
		</aside>
	);
}

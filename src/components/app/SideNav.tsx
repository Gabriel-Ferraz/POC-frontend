'use client';

import {
	LogOut,
	ChevronLeft,
	ChevronRight,
	ChevronDown,
	Sun,
	Moon,
	ShieldCheck,
	Users,
	Shield,
	Key,
	ScrollText,
} from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useTheme } from 'next-themes';
import * as React from 'react';

import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import { useAbility } from '@/providers/AbilityProvider';
import { useAuth } from '@/providers/AuthProvider';

type MenuItem = {
	href: string;
	label: string;
	icon: React.ElementType;
	subject: string;
};

type MenuCategory = {
	label: string;
	icon: React.ElementType;
	subject: string;
	items: MenuItem[];
};

/**
 * TODO: Configure your menu categories here.
 * Each item needs a `subject` that matches a backend permission (type=page).
 */
const menuCategories: MenuCategory[] = [
	{
		label: 'Administracao',
		icon: ShieldCheck,
		subject: 'admin',
		items: [
			{ href: '/admin/usuarios', label: 'Usuarios', icon: Users, subject: 'admin.users' },
			{ href: '/admin/perfis', label: 'Perfis', icon: Shield, subject: 'admin.roles' },
			{ href: '/admin/permissoes', label: 'Permissoes', icon: Key, subject: 'admin.permissions' },
			{ href: '/admin/logs-de-auditoria', label: 'Auditoria', icon: ScrollText, subject: 'admin.audit-logs' },
		],
	},
];

export default function SideNav({
	collapsed,
	onToggle,
	hideCollapseToggle,
	onNavigate,
}: {
	collapsed: boolean;
	onToggle: () => void;
	hideCollapseToggle?: boolean;
	onNavigate?: () => void;
}) {
	const path = usePathname();
	const { theme, setTheme, systemTheme } = useTheme();
	const { user, logout } = useAuth();
	const ability = useAbility();

	const [mounted, setMounted] = React.useState(false);

	const [expandedCategories, setExpandedCategories] = React.useState<Set<string>>(
		() => new Set(menuCategories.map((c) => c.label))
	);

	React.useEffect(() => {
		setMounted(true);
	}, []);

	const resolvedTheme = mounted ? (theme === 'system' ? systemTheme : theme) : theme;
	const currentTheme = resolvedTheme ?? 'light';

	function toggleCategory(label: string) {
		setExpandedCategories((prev) => {
			const next = new Set(prev);
			if (next.has(label)) next.delete(label);
			else next.add(label);
			return next;
		});
	}

	const visibleCategories = React.useMemo(() => {
		return menuCategories
			.map((category) => ({
				...category,
				items: category.items.filter((item) => ability.can('access', item.subject)),
			}))
			.filter((category) => category.items.length > 0);
	}, [ability]);

	return (
		<div className="flex h-full flex-col">
			{/* TODO: Replace with your logo/brand */}
			<div className={cn('flex items-center gap-3 p-4', collapsed && 'justify-center px-2')}>
				<div className="flex h-9 w-9 items-center justify-center rounded-md bg-muted font-semibold">B</div>

				{!collapsed && (
					<div className="leading-tight">
						<div className="text-sm font-semibold">Boilerplate</div>
						<div className="text-xs text-muted-foreground">Dashboard</div>
					</div>
				)}
			</div>

			{!hideCollapseToggle && (
				<div className={cn('px-4 pb-2', collapsed && 'px-2 flex justify-center')}>
					<button
						onClick={onToggle}
						className={cn(
							'flex w-full items-center gap-2 rounded-md border bg-background px-2 py-2 text-xs text-muted-foreground hover:bg-muted transition-colors',
							collapsed && 'w-10 justify-center px-0'
						)}
						title={collapsed ? 'Expandir menu' : 'Recolher menu'}
						type="button">
						{collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
						{!collapsed && <span>Recolher menu</span>}
					</button>
				</div>
			)}

			<nav className="flex-1 px-2 py-2 space-y-1 overflow-y-auto no-scrollbar">
				{visibleCategories.map((category) => {
					const CategoryIcon = category.icon;
					const isExpanded = expandedCategories.has(category.label);
					const hasActiveItem = category.items.some(
						(item) => path === item.href || path.startsWith(item.href + '/')
					);

					if (collapsed) {
						return (
							<Popover key={category.label}>
								<PopoverTrigger asChild>
									<button
										className={cn(
											'group flex w-full items-center justify-center rounded-md px-2 py-2 text-sm transition-colors',
											'hover:bg-muted',
											hasActiveItem && 'bg-muted font-medium'
										)}
										title={category.label}
										type="button">
										<CategoryIcon className="h-4 w-4 shrink-0" />
									</button>
								</PopoverTrigger>
								<PopoverContent side="right" align="start" className="w-52 p-1">
									<p className="px-3 py-1.5 text-xs font-semibold text-muted-foreground">{category.label}</p>
									{category.items.map((item) => {
										const active = path === item.href || path.startsWith(item.href + '/');
										const ItemIcon = item.icon;
										return (
											<Link
												key={item.href}
												href={item.href}
												onClick={() => onNavigate?.()}
												className={cn(
													'flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors',
													'hover:bg-muted',
													active && 'bg-muted font-medium'
												)}>
												<ItemIcon className="h-4 w-4 shrink-0" />
												<span className="truncate">{item.label}</span>
											</Link>
										);
									})}
								</PopoverContent>
							</Popover>
						);
					}

					return (
						<div key={category.label}>
							<button
								onClick={() => toggleCategory(category.label)}
								className={cn(
									'group flex w-full items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors',
									'hover:bg-muted',
									hasActiveItem && 'font-medium'
								)}
								type="button">
								<CategoryIcon className="h-4 w-4 shrink-0" />
								<span className="flex-1 truncate text-left">{category.label}</span>
								<ChevronDown
									className={cn(
										'h-4 w-4 shrink-0 transition-transform',
										isExpanded && 'rotate-180'
									)}
								/>
							</button>

							{isExpanded && (
								<div className="ml-4 mt-1 space-y-1 border-l border-border pl-2">
									{category.items.map((item) => {
										const active = path === item.href || path.startsWith(item.href + '/');
										const ItemIcon = item.icon;

										return (
											<Link
												key={item.href}
												href={item.href}
												onClick={() => onNavigate?.()}
												className={cn(
													'group flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors',
													'hover:bg-muted',
													active && 'bg-muted font-medium'
												)}>
												<ItemIcon className="h-4 w-4 shrink-0" />
												<span className="truncate">{item.label}</span>
											</Link>
										);
									})}
								</div>
							)}
						</div>
					);
				})}
			</nav>

			<div className="border-t p-3">
				<DropdownMenu>
					<DropdownMenuTrigger asChild>
						<button
							className={cn(
								'flex w-full items-center gap-3 rounded-lg px-2 py-2 text-left transition-colors hover:bg-muted',
								collapsed && 'justify-center px-0'
							)}
							type="button"
							title={collapsed ? user?.name ?? 'Usuario' : undefined}
						>
							<div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary text-xs font-semibold text-primary-foreground">
								{user?.name?.charAt(0).toUpperCase() ?? 'U'}
							</div>

							{!collapsed && (
								<div className="min-w-0 flex-1">
									<p className="truncate text-sm font-medium leading-tight">{user?.name ?? '—'}</p>
									<p className="truncate text-xs text-muted-foreground leading-tight">{user?.email ?? '—'}</p>
								</div>
							)}
						</button>
					</DropdownMenuTrigger>

					<DropdownMenuContent side="top" align="start" className="w-48">
						<DropdownMenuItem onClick={() => setTheme(currentTheme === 'dark' ? 'light' : 'dark')}>
							{currentTheme === 'dark' ? (
								<Sun className="mr-2 h-4 w-4" />
							) : (
								<Moon className="mr-2 h-4 w-4" />
							)}
							{currentTheme === 'dark' ? 'Tema claro' : 'Tema escuro'}
						</DropdownMenuItem>

						<DropdownMenuSeparator />

						<DropdownMenuItem
							onClick={logout}
							className="text-red-600 focus:text-red-600 focus:bg-red-50 dark:focus:bg-red-950"
						>
							<LogOut className="mr-2 h-4 w-4" />
							Sair
						</DropdownMenuItem>
					</DropdownMenuContent>
				</DropdownMenu>
			</div>
		</div>
	);
}

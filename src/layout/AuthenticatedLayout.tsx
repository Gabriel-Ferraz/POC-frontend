'use client';

import { Menu } from 'lucide-react';
import { useEffect, useState } from 'react';

import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import SideNav from '@/components/app/SideNav';
import { useBreakpoint } from '@/hooks/useBreakpoint';
import { cn } from '@/lib/utils';

export default function AuthenticatedLayout({ children }: { children: React.ReactNode }) {
	const { width, isDesktop } = useBreakpoint();

	const [collapsed, setCollapsed] = useState<boolean>(() => {
		if (typeof window === 'undefined') return false;
		return window.localStorage.getItem('sidebar_collapsed') === '1';
	});

	const [mobileOpen, setMobileOpen] = useState(false);

	useEffect(() => {
		if (width === null) return;
		if (!isDesktop) return;

		window.localStorage.setItem('sidebar_collapsed', collapsed ? '1' : '0');
	}, [collapsed, width, isDesktop]);

	if (width === null) return null;

	return (
		<div className="min-h-screen bg-muted/30">
			{isDesktop ? (
				<div className="flex min-h-screen">
					<aside
						className={cn(
							'sticky top-0 h-screen shrink-0 border-r bg-background',
							collapsed ? 'w-[72px]' : 'w-64'
						)}>
						<SideNav collapsed={collapsed} onToggle={() => setCollapsed((v) => !v)} />
					</aside>

					<main className="flex-1 min-w-0">
						<div className="p-6">{children}</div>
					</main>
				</div>
			) : (
				<div className="min-h-screen">
					<header className="sticky top-0 z-40 flex h-14 items-center gap-3 border-b bg-background/95 px-4 backdrop-blur supports-[backdrop-filter]:bg-background/70">
						<Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
							<SheetTrigger
								className="inline-flex h-9 w-9 items-center justify-center rounded-md border hover:bg-muted"
								aria-label="Abrir menu">
								<Menu className="h-5 w-5" />
							</SheetTrigger>

							<SheetContent side="left" className="w-72 p-0">
								<SideNav
									collapsed={false}
									onToggle={() => {}}
									hideCollapseToggle
									onNavigate={() => setMobileOpen(false)}
								/>
							</SheetContent>
						</Sheet>

						{/* TODO: Replace with your brand */}
						<div className="leading-tight">
							<div className="text-sm font-semibold">Boilerplate</div>
							<div className="text-xs text-muted-foreground">Dashboard</div>
						</div>
					</header>

					<main className="min-w-0">
						<div className="p-4">{children}</div>
					</main>
				</div>
			)}
		</div>
	);
}

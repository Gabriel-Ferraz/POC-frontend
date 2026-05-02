'use client';

import { useAuth } from '@/providers/AuthProvider';
import { Sidebar } from '@/components/layout/Sidebar';
import { Header } from '@/components/layout/Header';
import { useRouter, usePathname } from 'next/navigation';
import { useEffect } from 'react';

export default function AuthenticatedLayout({ children }: { children: React.ReactNode }) {
	const { user, loading } = useAuth();
	const router = useRouter();
	const pathname = usePathname();

	useEffect(() => {
		if (!loading && !user && pathname !== '/login') {
			router.push('/login');
		}
	}, [user, loading, pathname, router]);

	if (loading) {
		return (
			<div className="flex items-center justify-center min-h-screen bg-gray-50">
				<div className="text-center">
					<div className="w-16 h-16 border-4 border-blue-900 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
					<p className="text-gray-600">Carregando...</p>
				</div>
			</div>
		);
	}

	if (!user) {
		return null;
	}

	return (
		<div className="flex h-screen bg-gray-50">
			<Sidebar />
			<div className="flex-1 flex flex-col overflow-hidden">
				<Header />
				<main className="flex-1 overflow-y-auto p-6">{children}</main>
			</div>
		</div>
	);
}

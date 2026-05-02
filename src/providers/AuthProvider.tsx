'use client';

import { useRouter } from 'next/navigation';
import * as React from 'react';

import { login as loginApi, me as meApi, logout as logoutApi } from '@/app/features/auth/api/auth-api';
import type { User } from '@/types/models';
import { clearToken, getToken } from '@/lib/auth/token-storage';
import { PerfilUsuario } from '@/types/enums';

type AuthCtx = {
	user: User | null;
	loading: boolean;
	login: (cpf: string, password: string) => Promise<void>;
	logout: () => Promise<void>;
	refresh: () => Promise<void>;
	isPerfil: (perfil: PerfilUsuario) => boolean;
};

const AuthContext = React.createContext<AuthCtx>({
	user: null,
	loading: true,
	login: async () => {},
	logout: async () => {},
	refresh: async () => {},
	isPerfil: () => false,
});

export function useAuth() {
	return React.useContext(AuthContext);
}

export default function AuthProvider({ children }: { children: React.ReactNode }) {
	const [user, setUser] = React.useState<User | null>(null);
	const [loading, setLoading] = React.useState(true);

	const router = useRouter();

	const refresh = React.useCallback(async (): Promise<void> => {
		const token = getToken();

		if (!token) {
			setUser(null);
			setLoading(false);
			return;
		}

		try {
			const data = await meApi();
			setUser(data);
		} catch {
			clearToken();
			setUser(null);
		} finally {
			setLoading(false);
		}
	}, []);

	React.useEffect(() => {
		void refresh();
	}, [refresh]);

	const login = React.useCallback(
		async (cpf: string, password: string) => {
			const data = await loginApi(cpf, password);
			setUser(data.user);
			router.push('/portal-fornecedor');
		},
		[router]
	);

	const logout = React.useCallback(async () => {
		try {
			await logoutApi();
		} finally {
			clearToken();
			setUser(null);
			router.replace('/login');
		}
	}, [router]);

	const isPerfil = React.useCallback((perfil: PerfilUsuario) => user?.perfil === perfil, [user]);

	const value = React.useMemo(
		() => ({
			user,
			loading,
			login,
			logout,
			refresh,
			isPerfil,
		}),
		[user, loading, login, logout, refresh, isPerfil]
	);

	return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

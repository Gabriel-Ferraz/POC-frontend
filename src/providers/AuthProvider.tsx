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
			console.log('[AuthProvider] Sem token, usuário não autenticado');
			setUser(null);
			setLoading(false);
			return;
		}

		console.log('[AuthProvider] Token encontrado, buscando dados do usuário...');

		try {
			const data = await meApi();
			console.log('[AuthProvider] Usuário carregado:', data);
			setUser(data);
		} catch (error) {
			console.error('[AuthProvider] Erro ao buscar usuário:', error);
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
			try {
				const data = await loginApi(cpf, password);
				setUser(data.user);

				// Redireciona baseado no perfil do usuário
				const perfil = data.user.perfil;
				let redirectUrl = '/portal-fornecedor'; // default

				if (perfil === PerfilUsuario.GESTOR_CONTRATO) {
					redirectUrl = '/gestor/solicitacoes';
				} else if (perfil === PerfilUsuario.OPERADOR_PMSJP) {
					redirectUrl = '/prestacao-contas';
				} else if (perfil === PerfilUsuario.OPERADOR_ORCAMENTARIO) {
					redirectUrl = '/orcamentario/leis-atos';
				} else if (perfil === PerfilUsuario.GESTOR_SUPORTE || perfil === PerfilUsuario.USUARIO_COMUM) {
					redirectUrl = '/suporte';
				}

				// Força reload da página para garantir que o middleware pegue o cookie
				window.location.href = redirectUrl;
			} catch (error) {
				console.error('Erro no login:', error);
				throw error;
			}
		},
		[router]
	);

	const logout = React.useCallback(async () => {
		try {
			await logoutApi();
		} catch (error) {
			console.error('Erro no logout:', error);
		} finally {
			clearToken();
			setUser(null);
			window.location.href = '/login';
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

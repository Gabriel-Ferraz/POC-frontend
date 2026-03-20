'use client';

import { useRouter } from 'next/navigation';
import * as React from 'react';

import { getMe } from '@/app/features/auth/api/me';
import { logout as logoutRequest } from '@/app/features/auth/api/logout';
import type { User } from '@/app/features/auth/types/auth.types';
import { clearToken, getToken } from '@/lib/auth/token-storage';

type AuthCtx = {
	user: User | null;
	roles: string[];
	permissions: string[];
	loading: boolean;
	logout: () => Promise<void>;
	refresh: () => Promise<void>;
	hasRole: (role: string) => boolean;
	hasPermission: (permission: string) => boolean;
};

const AuthContext = React.createContext<AuthCtx>({
	user: null,
	roles: [],
	permissions: [],
	loading: true,
	logout: async () => { },
	refresh: async () => { },
	hasRole: () => false,
	hasPermission: () => false,
});

export function useAuth() {
	return React.useContext(AuthContext);
}

export default function AuthProvider({ children }: { children: React.ReactNode }) {
	const [user, setUser] = React.useState<User | null>(null);
	const [roles, setRoles] = React.useState<string[]>([]);
	const [permissions, setPermissions] = React.useState<string[]>([]);
	const [loading, setLoading] = React.useState(true);

	const router = useRouter();

	const refresh = React.useCallback(async (): Promise<void> => {
		const token = getToken();

		if (!token) {
			setUser(null);
			setRoles([]);
			setPermissions([]);
			setLoading(false);
			return;
		}

		try {
			const data = await getMe();
			setUser(data.user);
			setRoles(data.user.roles ?? []);
			setPermissions(data.user.permissions ?? []);
		} catch {
			clearToken();
			setUser(null);
			setRoles([]);
			setPermissions([]);
		} finally {
			setLoading(false);
		}
	}, []);

	React.useEffect(() => {
		void refresh();
	}, [refresh]);

	const logout = React.useCallback(async () => {
		try {
			await logoutRequest();
		} finally {
			clearToken();
			setUser(null);
			setRoles([]);
			setPermissions([]);
			router.replace('/login');
		}
	}, [router]);

	const isSuperAdmin = roles.includes('super-admin');

	const hasRole = React.useCallback(
		(role: string) => isSuperAdmin || roles.includes(role),
		[isSuperAdmin, roles],
	);

	const hasPermission = React.useCallback(
		(permission: string) => isSuperAdmin || permissions.includes(permission),
		[isSuperAdmin, permissions],
	);

	const value = React.useMemo(
		() => ({
			user,
			roles,
			permissions,
			loading,
			logout,
			refresh,
			hasRole,
			hasPermission,
		}),
		[user, roles, permissions, loading, logout, refresh, hasRole, hasPermission],
	);

	return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

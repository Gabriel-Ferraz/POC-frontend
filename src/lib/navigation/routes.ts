/**
 * Flat list of all protected routes and their required permission subjects.
 *
 * Used by:
 * - useLoginForm → find the first accessible page after login
 *
 * Order matters: the first match is where the user lands after login.
 *
 * TODO: Add your project's routes here.
 */
export const APP_ROUTES: { href: string; subject: string }[] = [
	// Example:
	// { href: '/dashboard', subject: 'dashboard' },
	{ href: '/admin/usuarios', subject: 'admin.users' },
	{ href: '/admin/perfis', subject: 'admin.roles' },
	{ href: '/admin/permissoes', subject: 'admin.permissions' },
	{ href: '/admin/logs-de-auditoria', subject: 'admin.audit-logs' },
];

/**
 * Given a list of permissions and roles, returns the href of the first
 * page the user can access — or null if none.
 */
export function getFirstAccessibleRoute(permissions: string[], roles: string[]): string | null {
	if (roles.includes('super-admin')) {
		return APP_ROUTES[0]?.href ?? null;
	}

	const accessSubjects = new Set<string>();
	for (const perm of permissions) {
		const parts = perm.split('.');
		const last = parts[parts.length - 1];
		const KNOWN_ACTIONS = ['index', 'show', 'store', 'update', 'destroy'];

		if (parts.length >= 2 && KNOWN_ACTIONS.includes(last)) {
			accessSubjects.add(parts.slice(0, -1).join('.'));
		} else {
			accessSubjects.add(perm);
		}
	}

	for (const route of APP_ROUTES) {
		if (accessSubjects.has(route.subject)) {
			return route.href;
		}
	}

	return null;
}

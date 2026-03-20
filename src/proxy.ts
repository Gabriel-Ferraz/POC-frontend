import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';

const PUBLIC_PATHS = ['/', '/login', '/esqueci-minha-senha', '/redefinir-senha'];

// TODO: Change to your app's default authenticated route
const AUTHENTICATED_REDIRECT = '/admin/usuarios';

const TOKEN_KEY = 'auth_token';

function isPublicPath(pathname: string) {
	return PUBLIC_PATHS.some((path) => {
		if (path === '/') return pathname === '/';
		return pathname === path || pathname.startsWith(`${path}/`);
	});
}

export function proxy(request: NextRequest) {
	const { pathname } = request.nextUrl;

	const isAsset =
		pathname.startsWith('/_next') ||
		pathname.startsWith('/api') ||
		pathname === '/favicon.ico' ||
		pathname.match(/\.\w+$/);

	if (isAsset) {
		return NextResponse.next();
	}

	const token = request.cookies.get(TOKEN_KEY)?.value ?? null;
	const publicRoute = isPublicPath(pathname);

	if (token && publicRoute) {
		return NextResponse.redirect(new URL(AUTHENTICATED_REDIRECT, request.url));
	}

	if (!token && !publicRoute) {
		return NextResponse.redirect(new URL('/login', request.url));
	}

	return NextResponse.next();
}

export const config = {
	matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};

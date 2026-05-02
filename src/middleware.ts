import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const PUBLIC_PATHS = ['/login'];
const AUTHENTICATED_REDIRECT = '/portal-fornecedor';

export function middleware(request: NextRequest) {
	const { pathname } = request.nextUrl;

	// Permitir assets e API routes
	if (
		pathname.startsWith('/_next') ||
		pathname.startsWith('/api') ||
		pathname === '/favicon.ico' ||
		pathname.match(/\.\w+$/)
	) {
		return NextResponse.next();
	}

	const token = request.cookies.get('auth_token')?.value;
	const isPublicPath = PUBLIC_PATHS.some((path) => pathname === path || pathname.startsWith(`${path}/`));

	// Se tem token e está tentando acessar página pública, redireciona para área autenticada
	if (token && isPublicPath) {
		return NextResponse.redirect(new URL(AUTHENTICATED_REDIRECT, request.url));
	}

	// Se não tem token e está tentando acessar área protegida, redireciona para login
	if (!token && !isPublicPath && pathname !== '/') {
		const loginUrl = new URL('/login', request.url);
		loginUrl.searchParams.set('redirect', pathname);
		return NextResponse.redirect(loginUrl);
	}

	// Se está na home sem token, redireciona para login
	if (pathname === '/' && !token) {
		return NextResponse.redirect(new URL('/login', request.url));
	}

	// Se está na home com token, redireciona para área autenticada
	if (pathname === '/' && token) {
		return NextResponse.redirect(new URL(AUTHENTICATED_REDIRECT, request.url));
	}

	return NextResponse.next();
}

export const config = {
	matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};

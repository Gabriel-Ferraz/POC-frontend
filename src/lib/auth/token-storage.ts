const TOKEN_KEY = 'auth_token';
const SEVEN_DAYS_IN_SECONDS = 60 * 60 * 24 * 7;

export function getToken(): string | null {
	if (typeof window === 'undefined') return null;

	// Primeiro tenta pegar do cookie
	const match = document.cookie.match(new RegExp(`(?:^|; )${TOKEN_KEY}=([^;]*)`));

	if (match) {
		return decodeURIComponent(match[1]);
	}

	// Fallback: tenta pegar do localStorage
	try {
		return localStorage.getItem(TOKEN_KEY);
	} catch {
		return null;
	}
}

export function setToken(token: string) {
	if (typeof window === 'undefined') return;

	// Salva no cookie
	document.cookie = [
		`${TOKEN_KEY}=${encodeURIComponent(token)}`,
		'Path=/',
		`Max-Age=${SEVEN_DAYS_IN_SECONDS}`,
		'SameSite=Lax',
	].join('; ');

	// Salva também no localStorage como backup
	try {
		localStorage.setItem(TOKEN_KEY, token);
	} catch (e) {
		console.error('Erro ao salvar token no localStorage:', e);
	}
}

export function clearToken() {
	if (typeof window === 'undefined') return;

	// Limpa o cookie
	document.cookie = [`${TOKEN_KEY}=`, 'Path=/', 'Max-Age=0', 'SameSite=Lax'].join('; ');

	// Limpa o localStorage
	try {
		localStorage.removeItem(TOKEN_KEY);
	} catch (e) {
		console.error('Erro ao limpar token do localStorage:', e);
	}
}

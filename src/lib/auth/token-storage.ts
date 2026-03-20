const TOKEN_KEY = 'auth_token';
const ONE_DAY_IN_SECONDS = 60 * 60 * 24;

export function getToken(): string | null {
    if (typeof document === 'undefined') return null;

    const match = document.cookie.match(
        new RegExp(`(?:^|; )${TOKEN_KEY}=([^;]*)`),
    );

    return match ? decodeURIComponent(match[1]) : null;
}

export function setToken(token: string) {
    if (typeof document === 'undefined') return;

    document.cookie = [
        `${TOKEN_KEY}=${encodeURIComponent(token)}`,
        'Path=/',
        `Max-Age=${ONE_DAY_IN_SECONDS}`,
        'SameSite=Lax',
    ].join('; ');
}

export function clearToken() {
    if (typeof document === 'undefined') return;

    document.cookie = [
        `${TOKEN_KEY}=`,
        'Path=/',
        'Max-Age=0',
        'SameSite=Lax',
    ].join('; ');
}

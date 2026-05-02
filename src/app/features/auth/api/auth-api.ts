import { setToken, clearToken } from '@/lib/auth/token-storage';
import { post, get } from '@/lib/http/http-methods';
import { API_ENDPOINTS } from '@/lib/http/api-config';
import type { User } from '@/types/models';

export interface LoginRequest {
	cpf: string;
	password: string;
}

export interface LoginResponse {
	token: string;
	user: User;
}

export async function login(cpf: string, password: string): Promise<LoginResponse> {
	const data = await post<LoginResponse>(API_ENDPOINTS.auth.login, {
		cpf,
		password,
	});
	setToken(data.token);
	return data;
}

export async function me(): Promise<User> {
	const response = await get<any>(API_ENDPOINTS.auth.me);
	console.log('[auth-api] Resposta /me:', response);

	// A API retorna { user: {...} } e não diretamente o user
	if (response.user) {
		return response.user;
	}

	return response;
}

export async function logout(): Promise<void> {
	try {
		await post(API_ENDPOINTS.auth.logout, {});
	} finally {
		clearToken();
	}
}

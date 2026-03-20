import { clearToken, getToken } from '../auth/token-storage';
import { ApiError, HttpMethod, RequestOptions } from '@/lib/http/types';

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3333';

function buildHeaders(headers?: HeadersInit, hasBody?: boolean): HeadersInit {
    const token = getToken();

    return {
        Accept: 'application/json',
        ...(hasBody ? { 'Content-Type': 'application/json' } : {}),
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...(headers ?? {}),
    };
}

function buildBody(body?: unknown): BodyInit | undefined {
    if (body === undefined || body === null) return undefined;

    if (
        body instanceof FormData ||
        body instanceof URLSearchParams ||
        body instanceof Blob ||
        typeof body === 'string'
    ) {
        return body;
    }

    return JSON.stringify(body);
}

export async function request<T>(
    method: HttpMethod,
    path: string,
    options: RequestOptions = {},
): Promise<T> {
    const { body, headers, ...rest } = options;
    const parsedBody = buildBody(body);
    const hasBody = body !== undefined && !(body instanceof FormData);

    const response = await fetch(`${API_URL}${path}`, {
        method,
        ...rest,
        headers: buildHeaders(headers, hasBody),
        body: parsedBody,
    });

    const contentType = response.headers.get('content-type') ?? '';
    const isJson = contentType.includes('application/json');

    if (response.status === 401) {
        clearToken();

        // Redirect to login — token expired or invalid
        if (typeof window !== 'undefined') {
            window.location.href = '/login';
        }

        const payload = isJson ? await response.json().catch(() => null) : null;
        throw new ApiError(
            (payload as { message?: string } | null)?.message ?? 'Sessao expirada',
            401,
            payload,
        );
    }

    if (!response.ok) {
        const payload = isJson ? await response.json().catch(() => null) : null;
        throw new ApiError(
            (payload as { message?: string } | null)?.message ?? `Erro ${response.status}`,
            response.status,
            payload,
        );
    }

    if (response.status === 204) {
        return null as T;
    }

    if (!isJson) {
        return null as T;
    }

    return response.json() as Promise<T>;
}

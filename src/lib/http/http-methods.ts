import { request } from '@/lib/http/http-client';
import { RequestOptions } from '@/lib/http/types';

export function get<T>(path: string, options?: Omit<RequestOptions, 'body'>) {
    return request<T>('GET', path, options);
}

export function post<T>(path: string, body?: unknown, options?: Omit<RequestOptions, 'body'>) {
    return request<T>('POST', path, { ...options, body });
}

export function put<T>(path: string, body?: unknown, options?: Omit<RequestOptions, 'body'>) {
    return request<T>('PUT', path, { ...options, body });
}

export function patch<T>(path: string, body?: unknown, options?: Omit<RequestOptions, 'body'>) {
    return request<T>('PATCH', path, { ...options, body });
}

export function del<T>(path: string, options?: RequestOptions) {
    return request<T>('DELETE', path, options);
}
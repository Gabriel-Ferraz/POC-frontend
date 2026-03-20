export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';

export type ApiErrorPayload = {
    message?: string;
    [key: string]: unknown;
};

export class ApiError extends Error {
    status: number;
    payload?: ApiErrorPayload | null;

    constructor(message: string, status: number, payload?: ApiErrorPayload | null) {
        super(message);
        this.name = 'ApiError';
        this.status = status;
        this.payload = payload;
    }
}

export type RequestOptions = Omit<RequestInit, 'body' | 'method'> & {
    body?: unknown;
    headers?: HeadersInit;
};
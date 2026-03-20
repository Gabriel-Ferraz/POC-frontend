import { post } from '@/lib/http/http-methods';

import type { ForgotPasswordResponse, ResetPasswordResponse } from '../types/auth.types';

export async function forgotPassword(email: string): Promise<ForgotPasswordResponse> {
    return post<ForgotPasswordResponse>('/api/auth/forgot-password', { email });
}

export async function resetPassword(payload: {
    token: string;
    email: string;
    password: string;
    password_confirmation: string;
}): Promise<ResetPasswordResponse> {
    return post<ResetPasswordResponse>('/api/auth/reset-password', payload);
}

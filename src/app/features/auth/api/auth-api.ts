import { setToken } from '@/lib/auth/token-storage';
import { post } from '@/lib/http/http-methods';

import type { LoginResponse } from '../types/auth.types';

export async function loginWithEmailAndPassword(email: string, password: string): Promise<void> {
    const data = await post<LoginResponse>('/api/auth/login', {
        email,
        password,
    });
    setToken(data.token);
}

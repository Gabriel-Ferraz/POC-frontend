
import { post } from '@/lib/http/http-methods';

export async function logout() {
    await post<void>('/api/auth/logout');
}
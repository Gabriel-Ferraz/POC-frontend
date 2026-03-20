import { get } from '@/lib/http/http-methods';

import type { MeResponse } from '../types/auth.types';

export async function getMe(): Promise<MeResponse> {
    return get<MeResponse>('/api/auth/me');
}

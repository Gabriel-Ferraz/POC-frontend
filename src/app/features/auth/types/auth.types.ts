export type User = {
    id: number;
    name: string;
    email: string;
    is_active: boolean;
    email_verified_at?: string | null;
    last_login_at: string | null;
    created_at: string;
    updated_at: string;
    deleted_at?: string | null;
    roles: string[];
    permissions: string[];
};

export type LoginResponse = {
    token: string;
};

export type MeResponse = {
    user: User;
};

export type ForgotPasswordResponse = {
    message: string;
};

export type ResetPasswordResponse = {
    message: string;
};

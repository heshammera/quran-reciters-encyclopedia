
export interface AdminUser {
    id: string;
    email: string | undefined;
    created_at: string;
    last_sign_in_at: string | undefined;
    role: string | null;
}

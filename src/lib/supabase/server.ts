import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { cookies } from "next/headers";

export async function createClient() {
    const cookieStore = await cookies();

    return createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
            cookies: {
                getAll() {
                    return cookieStore.getAll();
                },
                setAll(cookiesToSet: { name: string; value: string; options: CookieOptions }[]) {
                    try {
                        cookiesToSet.forEach(({ name, value, options }) =>
                            cookieStore.set(name, value, options)
                        );
                    } catch {
                        // The `setAll` method was called from a Server Component.
                        // This can be ignored if you have middleware refreshing
                        // user sessions.
                    }
                },
            },
        }
    );
}

export async function getUser() {
    const supabase = await createClient();
    const {
        data: { user },
    } = await supabase.auth.getUser();
    return user;
}

import { createAdminClient } from "@/lib/supabase/admin";

export async function isAdmin() {
    const user = await getUser();
    if (!user) return false;

    // Use admin client to bypass RLS issues for this critical check
    const supabase = createAdminClient();
    const { data } = await supabase
        .from("user_roles")
        .select("role, permissions")
        .eq("user_id", user.id)
        .single();

    if (!data) return false;

    // Allow Admins, Editors, and anyone with custom permissions
    if (data.role === 'admin' || data.role === 'editor') return true;
    if (data.permissions && Object.keys(data.permissions).length > 0) return true;

    return false;
}

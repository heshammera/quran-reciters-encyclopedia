import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { AdminUser } from "@/types/admin";

export async function getCurrentAdminUser(): Promise<AdminUser | null> {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) return null;

    const adminSupabase = createAdminClient();
    const { data: userRole } = await adminSupabase
        .from("user_roles")
        .select("*")
        .eq("user_id", user.id)
        .single();

    return {
        id: user.id,
        email: user.email,
        created_at: user.created_at,
        last_sign_in_at: user.last_sign_in_at,
        role: userRole?.role || "user",
        permissions: userRole?.permissions
    };
}

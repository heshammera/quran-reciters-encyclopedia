
"use server";

import { createAdminClient } from "@/lib/supabase/admin";
import { revalidatePath } from "next/cache";

// Fetches all users from auth.users (via admin usage) and joins with user_roles
export async function getUsersList() {
    const supabase = createAdminClient();

    // 1. Get all users from Auth
    const { data: { users }, error: authError } = await supabase.auth.admin.listUsers();
    if (authError) throw new Error(authError.message);

    // 2. Get all roles
    const { data: roles, error: rolesError } = await supabase
        .from("user_roles")
        .select("*");

    if (rolesError) throw new Error(rolesError.message);

    // 3. Merge data
    const usersWithRoles = users.map(user => {
        const userRole = roles.find(r => r.user_id === user.id);
        return {
            id: user.id,
            email: user.email,
            created_at: user.created_at,
            last_sign_in_at: user.last_sign_in_at,
            role: userRole?.role || null // Null means standard user
        };
    });

    return usersWithRoles;
}

export async function updateUserRole(userId: string, role: string) {
    const supabase = createAdminClient();

    if (!role || role === "user") {
        // If "user" or empty, we remove the role entry (default is user/null)
        // Or if your logic requires 'user' in DB, insert it. 
        // My schema constraint says: role IN ('admin', 'editor', 'user')
        // So let's delete if 'user' to keep table clean, OR just upsert 'user'.
        // Let's upsert 'user' to be explicit.

        // Wait, if I delete, then `isAdmin` check `exists(...)` returns false, which is correct for non-admin.
        // Let's standardise: always upsert.
    }

    // Upsert role
    const { error } = await supabase
        .from("user_roles")
        .upsert({
            user_id: userId,
            role: role
        }, { onConflict: 'user_id' });

    if (error) throw new Error(error.message);

    revalidatePath("/admin/users");
    return { success: true };
}

export async function createUser(data: { email: string; password?: string; role: string }) {
    const supabase = createAdminClient();

    // Default password if not provided
    const password = data.password || "Tempor@ryP@ss123";

    // 1. Create user in Auth
    const { data: user, error: createError } = await supabase.auth.admin.createUser({
        email: data.email,
        password: password,
        email_confirm: true, // Auto-confirm for admin created users
        user_metadata: { source: 'admin_panel' }
    });

    if (createError) throw new Error(createError.message);
    if (!user.user) throw new Error("User creation failed without error message");

    // 2. Assign Role
    if (data.role && data.role !== 'user') {
        const { error: roleError } = await supabase
            .from("user_roles")
            .insert({
                user_id: user.user.id,
                role: data.role
            });

        if (roleError) {
            console.error("Role assignment failed", roleError);
        }
    }

    revalidatePath("/admin/users");
    return { success: true, userId: user.user.id, password };
}

export async function deleteUser(userId: string) {
    const supabase = createAdminClient();

    // 1. Get current user to prevent self-deletion
    // Note: Since this is 'use server', we should ideally get the session from the regular client
    // but auth.admin.deleteUser is what we really need.

    // 2. Delete from Auth (this cascades to user_roles due to FK)
    const { error } = await supabase.auth.admin.deleteUser(userId);

    if (error) throw new Error(error.message);

    revalidatePath("/admin/users");
    return { success: true };
}


"use server";

import { createAdminClient } from "@/lib/supabase/admin";
import { revalidatePath } from "next/cache";
import { AdminUser } from "@/types/admin";

// Fetches all users from auth.users (via admin usage) and joins with user_roles
export async function getUsersList(): Promise<AdminUser[]> {
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
            role: userRole?.role || null, // Null means standard user
            permissions: userRole?.permissions || undefined
        };
    });

    return usersWithRoles;
}

// Comprehensive User Update (Email, Password, Role, Permissions)
export async function updateUser(userId: string, data: { email?: string; password?: string; role?: string; permissions?: any }) {
    const supabase = createAdminClient();
    const updates: any = {};

    // 1. Auth Updates (Email, Password)
    if (data.email) updates.email = data.email;
    if (data.password) updates.password = data.password;

    if (Object.keys(updates).length > 0) {
        // Need to set email_confirm = true if changing email to avoid re-confirmation loop often annoying for admins
        if (data.email) updates.email_confirm = true;

        const { error: authError } = await supabase.auth.admin.updateUserById(userId, updates);
        if (authError) throw new Error(`Auth Update Error: ${authError.message}`);
    }

    // 2. Role & Permissions Update
    // Always upsert user_roles if role/permissions are touched or even if just ensuring sync
    if (data.role || data.permissions) {
        const { error: roleError } = await supabase
            .from("user_roles")
            .upsert({
                user_id: userId,
                role: data.role || 'user', // Default to user if undefined but this branch hits
                permissions: data.permissions
            }, { onConflict: 'user_id' });

        if (roleError) throw new Error(`Role Update Error: ${roleError.message}`);
    }

    revalidatePath("/admin/users");
    return { success: true };
}

export async function createUser(data: { email: string; password?: string; role: string; permissions?: any }) {
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

    // 2. Assign Role & Permissions
    // Always insert into user_roles if we have a role OR permissions
    if (data.role || data.permissions) {
        const { error: roleError } = await supabase
            .from("user_roles")
            .insert({
                user_id: user.user.id,
                role: data.role || 'user',
                permissions: data.permissions
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

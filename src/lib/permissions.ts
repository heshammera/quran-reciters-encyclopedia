
import { AdminUser, PermissionAction, PermissionSchema, ADMIN_PERMISSIONS } from "@/types/admin";

/**
 * Check if a user has a specific permission.
 * If user is 'admin', always returns true.
 * If user has no permissions object, returns false (unless role is admin).
 */
export function hasPermission(user: AdminUser | null | undefined, resource: keyof PermissionSchema, action: PermissionAction | 'view'): boolean {
    if (!user) return false;

    // Super Admin always has access
    if (user.role === 'admin') return true;

    // Check granular permissions
    if (user.permissions) {
        // Handle special sections like analytics/system which don't have standard CRUD
        if (resource === 'analytics' || resource === 'system') {
            const section = user.permissions[resource] as any;
            return !!section[action === 'view' ? 'view' : action];
        }

        const section = user.permissions[resource] as any;
        return !!section?.[action];
    }

    // Fallback for Editor role if using rigid roles without permissions object (legacy support)
    if (user.role === 'editor') {
        // Editors can View/Create/Edit but not Delete usually
        if (action === 'delete') return false;
        if (['view', 'create', 'edit'].includes(action)) return true;
    }

    // Regular users (no role or role='user' without perms) types have no access
    return false;
}

export function canManageUsers(user: AdminUser) {
    return hasPermission(user, 'users', 'edit');
}

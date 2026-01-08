
export type PermissionAction = 'view' | 'create' | 'edit' | 'delete';

export interface ModulePermissions {
    view: boolean;
    create: boolean;
    edit: boolean;
    delete: boolean;
}

export interface PermissionSchema {
    reciters: ModulePermissions;
    recordings: ModulePermissions;
    sections: ModulePermissions;
    collections: ModulePermissions;
    pages: ModulePermissions;
    users: ModulePermissions;
    incomplete: { view: boolean };
    analytics: { view: boolean };
    system: { view_logs: boolean; manage_settings: boolean };
}

export const DEFAULT_PERMISSIONS: PermissionSchema = {
    reciters: { view: true, create: false, edit: false, delete: false },
    recordings: { view: true, create: false, edit: false, delete: false },
    sections: { view: false, create: false, edit: false, delete: false },
    collections: { view: false, create: false, edit: false, delete: false },
    pages: { view: false, create: false, edit: false, delete: false },
    users: { view: false, create: false, edit: false, delete: false },
    incomplete: { view: false },
    analytics: { view: false },
    system: { view_logs: false, manage_settings: false },
};

export const ADMIN_PERMISSIONS: PermissionSchema = {
    reciters: { view: true, create: true, edit: true, delete: true },
    recordings: { view: true, create: true, edit: true, delete: true },
    sections: { view: true, create: true, edit: true, delete: true },
    collections: { view: true, create: true, edit: true, delete: true },
    pages: { view: true, create: true, edit: true, delete: true },
    users: { view: true, create: true, edit: true, delete: true },
    incomplete: { view: true },
    analytics: { view: true },
    system: { view_logs: true, manage_settings: true },
};

export interface AdminUser {
    id: string;
    email: string | undefined;
    created_at: string;
    last_sign_in_at: string | undefined;
    role: string | null;
    permissions?: PermissionSchema;
}

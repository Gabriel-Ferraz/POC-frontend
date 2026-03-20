export const ADMIN = {
    module: 'admin',

    usersTab: 'admin.users',
    usersCreate: 'admin.users.store',
    usersEdit: 'admin.users.update',
    usersDelete: 'admin.users.destroy',
    usersRoles: 'admin.users.roles',
    usersSyncRoles: 'admin.users.roles.update',
    usersPermissions: 'admin.users.permissions',
    usersSyncPermissions: 'admin.users.permissions.update',

    rolesTab: 'admin.roles',
    rolesCreate: 'admin.roles.store',
    rolesEdit: 'admin.roles.update',
    rolesDelete: 'admin.roles.destroy',
    rolesPermissions: 'admin.roles.permissions',
    rolesSyncPermissions: 'admin.roles.permissions.update',

    permissionsTab: 'admin.permissions',
    permissionsCreate: 'admin.permissions.store',
    permissionsEdit: 'admin.permissions.update',
    permissionsDelete: 'admin.permissions.destroy',

    auditLogsTab: 'admin.audit-logs',
} as const;

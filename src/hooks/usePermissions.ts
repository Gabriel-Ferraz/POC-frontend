'use client';

import * as React from 'react';

import { useAuth } from '@/providers/AuthProvider';

export function usePermissions() {
    const { roles, permissions } = useAuth();

    const isSuperAdmin = roles.includes('super-admin');

    const canAccessPage = React.useCallback(
        (page: string): boolean => {
            if (isSuperAdmin) return true;
            return permissions.includes(page);
        },
        [isSuperAdmin, permissions],
    );

    const canPerformAction = React.useCallback(
        (action: string): boolean => {
            if (isSuperAdmin) return true;
            return permissions.includes(action);
        },
        [isSuperAdmin, permissions],
    );

    const hasModuleAccess = React.useCallback(
        (moduleName: string): boolean => {
            if (isSuperAdmin) return true;
            return permissions.some(
                (p) => p === moduleName || p.startsWith(`${moduleName}.`),
            );
        },
        [isSuperAdmin, permissions],
    );

    return {
        isSuperAdmin,
        canAccessPage,
        canPerformAction,
        hasModuleAccess,
    };
}

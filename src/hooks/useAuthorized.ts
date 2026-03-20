'use client';

import * as React from 'react';

import { parsePermission } from '@/lib/casl/ability';
import { useAbility } from '@/providers/AbilityProvider';

/**
 * Imperative permission check hook.
 *
 * Usage:
 *   const can = useAuthorized();
 *   const canCreate = can('logistic.planning.store');
 *   const canDelete = can('logistic.planning.destroy');
 *
 *   if (canCreate) { ... }
 */
export function useAuthorized() {
    const ability = useAbility();

    return React.useCallback(
        (permission: string): boolean => {
            const { action, subject } = parsePermission(permission);
            return ability.can(action, subject);
        },
        [ability],
    );
}

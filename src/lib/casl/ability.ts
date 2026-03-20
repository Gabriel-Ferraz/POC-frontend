import { PureAbility, AbilityBuilder } from '@casl/ability';

export type AppAbility = PureAbility<[string, string]>;

const KNOWN_ACTIONS = ['index', 'show', 'store', 'update', 'destroy'];

/**
 * Parses a flat backend permission string into a CASL { action, subject } pair.
 *
 * Convention:
 *   "logistic"                  → { action: 'access', subject: 'logistic' }
 *   "logistic.planning"         → { action: 'access', subject: 'logistic.planning' }
 *   "logistic.planning.store"   → { action: 'store',  subject: 'logistic.planning' }
 */
export function parsePermission(permission: string): { action: string; subject: string } {
    const parts = permission.split('.');
    const last = parts[parts.length - 1];

    if (parts.length >= 2 && KNOWN_ACTIONS.includes(last)) {
        return {
            action: last,
            subject: parts.slice(0, -1).join('.'),
        };
    }

    return { action: 'access', subject: permission };
}

/**
 * Builds a CASL ability instance from backend roles + permissions.
 * Super-admin gets `manage` on `all` (bypasses everything).
 */
export function buildAbility(permissions: string[], roles: string[]): AppAbility {
    const { can, build } = new AbilityBuilder<AppAbility>(PureAbility);

    if (roles.includes('super-admin')) {
        can('manage', 'all');
        return build();
    }

    for (const perm of permissions) {
        const { action, subject } = parsePermission(perm);
        can(action, subject);
    }

    return build();
}

/**
 * Creates an empty ability (no permissions).
 */
export function createEmptyAbility(): AppAbility {
    return new PureAbility<[string, string]>();
}

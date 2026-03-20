'use client';

import * as React from 'react';

import { parsePermission } from '@/lib/casl/ability';
import { useAbility } from '@/providers/AbilityProvider';

export default function Authorized({
	permission,
	fallback = null,
	children,
}: {
	permission: string;
	fallback?: React.ReactNode;
	children: React.ReactNode;
}) {
	const ability = useAbility();
	const { action, subject } = parsePermission(permission);

	if (ability.can(action, subject)) {
		return <>{children}</>;
	}

	return <>{fallback}</>;
}

'use client';

import { createContext } from 'react';
import { createContextualCan } from '@casl/react';
import * as React from 'react';

import { useAuth } from '@/providers/AuthProvider';
import { type AppAbility, buildAbility, createEmptyAbility } from '@/lib/casl/ability';

export const AbilityContext = createContext<AppAbility>(createEmptyAbility());

export const Can = createContextualCan(AbilityContext.Consumer);

export function useAbility() {
	return React.useContext(AbilityContext);
}

export default function AbilityProvider({ children }: { children: React.ReactNode }) {
	const { roles, permissions, loading } = useAuth();

	const ability = React.useMemo(() => {
		if (loading) return createEmptyAbility();
		return buildAbility(permissions, roles);
	}, [permissions, roles, loading]);

	return (
		<AbilityContext.Provider value={ability}>
			{children}
		</AbilityContext.Provider>
	);
}

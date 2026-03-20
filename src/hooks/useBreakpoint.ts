'use client';

import { useState, useEffect, useCallback } from 'react';

type Breakpoint = 'sm' | 'md' | 'lg' | 'xl' | '2xl';

const breakpoints: Record<Breakpoint, number> = {
	'sm': 640,
	'md': 768,
	'lg': 1024,
	'xl': 1280,
	'2xl': 1536,
};

export function useBreakpoint() {
	const [width, setWidth] = useState<number | null>(null);

	useEffect(() => {
		const updateWidth = () => setWidth(window.innerWidth);

		updateWidth();
		window.addEventListener('resize', updateWidth);

		return () => window.removeEventListener('resize', updateWidth);
	}, []);

	const isBelow = useCallback((bp: Breakpoint) => width !== null && width < breakpoints[bp], [width]);

	const isAbove = useCallback((bp: Breakpoint) => width !== null && width >= breakpoints[bp], [width]);

	return {
		width,
		isMobile: width !== null && width < breakpoints.md,
		isDesktop: width !== null && width >= breakpoints.md,
		isBelow,
		isAbove,
	};
}

'use client';

import { useTheme } from 'next-themes';
import { Sun, Moon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useEffect, useState } from 'react';

export function ThemeToggle() {
	const { theme, setTheme, resolvedTheme } = useTheme();
	const [mounted, setMounted] = useState(false);

	useEffect(() => setMounted(true), []);

	if (!mounted) return <div className="w-9 h-9" />;

	const isDark = resolvedTheme === 'dark';

	return (
		<Button
			variant="ghost"
			size="icon"
			onClick={() => setTheme(isDark ? 'light' : 'dark')}
			aria-label={isDark ? 'Ativar modo claro' : 'Ativar modo escuro'}>
			{isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
		</Button>
	);
}

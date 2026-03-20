'use client';

import { Eye, EyeOff } from 'lucide-react';
import * as React from 'react';

import { cn } from '@/lib/utils';

import { Input } from './input';

const PasswordInput = React.forwardRef<
	HTMLInputElement,
	Omit<React.ComponentProps<typeof Input>, 'type'>
>(({ className, ...props }, ref) => {
	const [visible, setVisible] = React.useState(false);

	return (
		<div className="relative">
			<Input
				ref={ref}
				type={visible ? 'text' : 'password'}
				className={cn('pr-9', className)}
				{...props}
			/>
			<button
				type="button"
				tabIndex={-1}
				onClick={() => setVisible((v) => !v)}
				className="absolute right-0 top-0 flex h-9 w-9 cursor-pointer items-center justify-center text-muted-foreground hover:text-foreground transition-colors"
				aria-label={visible ? 'Esconder senha' : 'Mostrar senha'}
			>
				{visible ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
			</button>
		</div>
	);
});

PasswordInput.displayName = 'PasswordInput';

export { PasswordInput };

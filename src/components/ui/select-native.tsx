import * as React from 'react';
import { cn } from '@/lib/utils';

export interface SelectNativeProps extends React.SelectHTMLAttributes<HTMLSelectElement> {}

const SelectNative = React.forwardRef<HTMLSelectElement, SelectNativeProps>(
	({ className, children, ...props }, ref) => {
		return (
			<select
				className={cn(
					'flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm ring-offset-white placeholder:text-gray-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50',
					className
				)}
				ref={ref}
				{...props}>
				{children}
			</select>
		);
	}
);
SelectNative.displayName = 'SelectNative';

export { SelectNative };

import * as React from 'react';
import { cn } from '@/lib/utils';

interface PageHeaderProps {
	title: string;
	description?: string;
	action?: React.ReactNode;
	className?: string;
}

export function PageHeader({ title, description, action, className }: PageHeaderProps) {
	return (
		<div className={cn('flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6', className)}>
			<div className="min-w-0 flex-1">
				<h1 className="text-xl md:text-2xl font-bold text-gray-900 dark:text-foreground truncate">{title}</h1>
				{description && (
					<p className="text-sm text-gray-600 dark:text-muted-foreground mt-1 line-clamp-2">{description}</p>
				)}
			</div>
			{action && <div className="flex-shrink-0 w-full sm:w-auto">{action}</div>}
		</div>
	);
}

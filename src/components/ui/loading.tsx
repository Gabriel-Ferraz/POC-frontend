import * as React from 'react';

export function Loading({ text = 'Carregando...' }: { text?: string }) {
	return (
		<div className="flex flex-col items-center justify-center py-12">
			<div className="w-12 h-12 border-4 border-blue-900 border-t-transparent rounded-full animate-spin mb-4"></div>
			<p className="text-gray-600 text-sm">{text}</p>
		</div>
	);
}

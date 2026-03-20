'use client';

import * as Dialog from '@radix-ui/react-dialog';
import { X } from 'lucide-react';
import * as React from 'react';

import { cn } from '@/lib/utils';

const Sheet = Dialog.Root;
const SheetTrigger = Dialog.Trigger;
const SheetClose = Dialog.Close;
const SheetPortal = Dialog.Portal;

const SheetOverlay = React.forwardRef<
	React.ElementRef<typeof Dialog.Overlay>,
	React.ComponentPropsWithoutRef<typeof Dialog.Overlay>
>(({ className, ...props }, ref) => (
	<Dialog.Overlay ref={ref} className={cn('fixed inset-0 z-50 bg-black/50 backdrop-blur-sm', className)} {...props} />
));
SheetOverlay.displayName = 'SheetOverlay';

const sheetVariants = {
	left: 'inset-y-0 left-0 h-full w-3/4 max-w-sm border-r',
	right: 'inset-y-0 right-0 h-full w-3/4 max-w-sm border-l',
	top: 'inset-x-0 top-0 w-full border-b',
	bottom: 'inset-x-0 bottom-0 w-full border-t',
};

type SheetContentProps = React.ComponentPropsWithoutRef<typeof Dialog.Content> & {
	side?: keyof typeof sheetVariants;
};

const SheetContent = React.forwardRef<React.ElementRef<typeof Dialog.Content>, SheetContentProps>(
	({ side = 'right', className, children, ...props }, ref) => (
		<SheetPortal>
			<SheetOverlay />
			<Dialog.Content
				ref={ref}
				className={cn('fixed z-50 bg-background shadow-lg outline-none', sheetVariants[side], className)}
				{...props}>
				{/* 🔒 TÍTULO OBRIGATÓRIO PARA ACESSIBILIDADE */}
				<Dialog.Title className="sr-only">Menu</Dialog.Title>

				{children}

				<SheetClose
					className="absolute right-4 top-4 inline-flex h-8 w-8 items-center justify-center rounded-md border bg-background/80 opacity-80 transition hover:opacity-100"
					aria-label="Fechar">
					<X className="h-4 w-4" />
				</SheetClose>
			</Dialog.Content>
		</SheetPortal>
	)
);
SheetContent.displayName = 'SheetContent';

export { Sheet, SheetTrigger, SheetClose, SheetContent };

import './globals.css';
import { Toaster } from 'sonner';

import { ThemeProvider } from '@/components/theme/theme-provider';
import { TooltipProvider } from '@/components/ui/tooltip';
import AuthProvider from '@/providers/AuthProvider';
import ReactQueryProvider from '@/providers/ReactQueryProvider';

export default function RootLayout({ children }: { children: React.ReactNode }) {
	return (
		<html lang="pt-BR" suppressHydrationWarning>
			<body suppressHydrationWarning>
				<ThemeProvider>
					<ReactQueryProvider>
						<AuthProvider>
							<TooltipProvider delayDuration={200}>
								{children}
								<Toaster richColors position="top-right" />
							</TooltipProvider>
						</AuthProvider>
					</ReactQueryProvider>
				</ThemeProvider>
			</body>
		</html>
	);
}

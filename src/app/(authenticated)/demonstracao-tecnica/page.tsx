'use client';

import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { PageHeader } from '@/components/ui/page-header';
import { Badge } from '@/components/ui/badge';

export default function DemonstracaoTecnicaPage() {
	return (
		<div>
			<PageHeader title="Demonstração Técnica" description="Arquitetura e stack tecnológica da POC" />

			<div className="grid gap-6">
				<Card>
					<CardHeader>
						<CardTitle>Arquitetura Frontend</CardTitle>
					</CardHeader>
					<CardContent>
						<div className="mb-4">
							<h3 className="text-sm font-semibold mb-2">Estrutura de Pastas (MVC Pattern)</h3>
							<pre className="bg-gray-50 dark:bg-muted p-4 rounded-lg text-xs overflow-x-auto border dark:border-border dark:text-foreground">
								{`src/
├── app/                      # Views (Pages)
│   ├── features/             # Módulos organizados por domínio
│   │   ├── fornecedor/
│   │   │   └── api/         # API calls (Controller)
│   │   ├── solicitacao/
│   │   │   ├── api/         # API calls
│   │   │   └── components/  # Componentes do módulo
│   │   ├── anexo/
│   │   ├── chamado/
│   │   ├── prestacao-contas/
│   │   └── orcamentario/
│   ├── portal-fornecedor/   # Páginas do Portal
│   ├── suporte/
│   ├── prestacao-contas/
│   └── orcamentario/
├── components/              # Componentes reutilizáveis
│   ├── ui/                 # Design System
│   └── layout/             # Sidebar, Header
├── lib/                    # Utilities
│   ├── http/              # HTTP Client
│   └── formatters.ts      # Formatação de dados
├── types/                 # Models (TypeScript)
│   ├── models.ts
│   └── enums.ts
└── providers/             # Context/State Management
    └── AuthProvider.tsx`}
							</pre>
						</div>

						<div className="grid md:grid-cols-2 gap-4 mt-4">
							<div>
								<h4 className="text-sm font-semibold mb-2">Separação de Responsabilidades:</h4>
								<ul className="text-sm space-y-1 text-gray-700 dark:text-muted-foreground">
									<li>
										• <strong>Views:</strong> Páginas em{' '}
										<code className="text-xs bg-gray-100 dark:bg-muted dark:text-foreground px-1 rounded">
											app/
										</code>
									</li>
									<li>
										• <strong>Controllers:</strong> APIs em{' '}
										<code className="text-xs bg-gray-100 dark:bg-muted dark:text-foreground px-1 rounded">
											features/*/api/
										</code>
									</li>
									<li>
										• <strong>Models:</strong> Types em{' '}
										<code className="text-xs bg-gray-100 dark:bg-muted dark:text-foreground px-1 rounded">
											types/
										</code>
									</li>
									<li>
										• <strong>Components:</strong> Reutilizáveis em{' '}
										<code className="text-xs bg-gray-100 dark:bg-muted dark:text-foreground px-1 rounded">
											components/
										</code>
									</li>
								</ul>
							</div>

							<div>
								<h4 className="text-sm font-semibold mb-2">Comunicação com API:</h4>
								<ul className="text-sm space-y-1 text-gray-700 dark:text-muted-foreground">
									<li>• HTTP Client centralizado</li>
									<li>• Bearer Token (Laravel Sanctum)</li>
									<li>• Interceptors para auth</li>
									<li>• Tratamento de erros global</li>
								</ul>
							</div>
						</div>
					</CardContent>
				</Card>

				<Card>
					<CardHeader>
						<CardTitle>Stack Técnica</CardTitle>
					</CardHeader>
					<CardContent>
						<div className="grid md:grid-cols-2 gap-6">
							<div>
								<h4 className="text-sm font-semibold mb-3">Frontend</h4>
								<div className="space-y-2">
									<div className="flex items-center justify-between">
										<span className="text-sm">Next.js 16 (App Router)</span>
										<Badge>✅</Badge>
									</div>
									<div className="flex items-center justify-between">
										<span className="text-sm">React 19</span>
										<Badge>✅</Badge>
									</div>
									<div className="flex items-center justify-between">
										<span className="text-sm">TypeScript</span>
										<Badge>✅</Badge>
									</div>
									<div className="flex items-center justify-between">
										<span className="text-sm">Tailwind CSS 4</span>
										<Badge>✅</Badge>
									</div>
									<div className="flex items-center justify-between">
										<span className="text-sm">shadcn/ui (Design System)</span>
										<Badge>✅</Badge>
									</div>
									<div className="flex items-center justify-between">
										<span className="text-sm">React Query (Data Fetching)</span>
										<Badge>✅</Badge>
									</div>
									<div className="flex items-center justify-between">
										<span className="text-sm">Zod (Validação)</span>
										<Badge>✅</Badge>
									</div>
									<div className="flex items-center justify-between">
										<span className="text-sm">Sonner (Toasts)</span>
										<Badge>✅</Badge>
									</div>
								</div>
							</div>

							<div>
								<h4 className="text-sm font-semibold mb-3">Backend Integration</h4>
								<div className="space-y-2">
									<div className="flex items-center justify-between">
										<span className="text-sm">Laravel 11</span>
										<Badge>✅</Badge>
									</div>
									<div className="flex items-center justify-between">
										<span className="text-sm">Sanctum (Auth)</span>
										<Badge>✅</Badge>
									</div>
									<div className="flex items-center justify-between">
										<span className="text-sm">REST API</span>
										<Badge>✅</Badge>
									</div>
									<div className="flex items-center justify-between">
										<span className="text-sm">MySQL/PostgreSQL</span>
										<Badge>✅</Badge>
									</div>
									<div className="flex items-center justify-between">
										<span className="text-sm">Eloquent ORM</span>
										<Badge>✅</Badge>
									</div>
									<div className="flex items-center justify-between">
										<span className="text-sm">File Upload</span>
										<Badge>✅</Badge>
									</div>
								</div>
							</div>
						</div>
					</CardContent>
				</Card>

				<Card>
					<CardHeader>
						<CardTitle>Compatibilidade de Navegadores</CardTitle>
					</CardHeader>
					<CardContent>
						<div className="grid md:grid-cols-4 gap-4">
							<div className="text-center p-4 border dark:border-border rounded-lg">
								<div className="text-2xl mb-2">🟢</div>
								<div className="font-semibold">Chrome</div>
								<div className="text-xs text-gray-600 dark:text-muted-foreground">90+</div>
							</div>
							<div className="text-center p-4 border dark:border-border rounded-lg">
								<div className="text-2xl mb-2">🟠</div>
								<div className="font-semibold">Firefox</div>
								<div className="text-xs text-gray-600 dark:text-muted-foreground">88+</div>
							</div>
							<div className="text-center p-4 border dark:border-border rounded-lg">
								<div className="text-2xl mb-2">🔵</div>
								<div className="font-semibold">Safari</div>
								<div className="text-xs text-gray-600 dark:text-muted-foreground">14+</div>
							</div>
							<div className="text-center p-4 border dark:border-border rounded-lg">
								<div className="text-2xl mb-2">🔷</div>
								<div className="font-semibold">Edge</div>
								<div className="text-xs text-gray-600 dark:text-muted-foreground">90+</div>
							</div>
						</div>

						<div className="mt-4 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
							<p className="text-sm text-blue-900 dark:text-blue-300">
								<strong>✅ Sem dependência de plugins externos</strong>
								<br />
								Toda a aplicação roda nativamente nos navegadores modernos sem necessidade de Flash,
								Java ou outros plugins.
							</p>
						</div>
					</CardContent>
				</Card>

				<Card>
					<CardHeader>
						<CardTitle>Componentes Reutilizáveis</CardTitle>
					</CardHeader>
					<CardContent>
						<div className="grid md:grid-cols-3 gap-4">
							<div>
								<h4 className="text-sm font-semibold mb-2">Layouts</h4>
								<ul className="text-xs space-y-1 text-gray-700 dark:text-muted-foreground">
									<li>• Sidebar (dinâmica por perfil)</li>
									<li>• Header (dropdown usuário)</li>
									<li>• AuthenticatedLayout</li>
									<li>• PageHeader</li>
								</ul>
							</div>

							<div>
								<h4 className="text-sm font-semibold mb-2">UI Components</h4>
								<ul className="text-xs space-y-1 text-gray-700 dark:text-muted-foreground">
									<li>• Button, Input, Select</li>
									<li>• Card, Badge</li>
									<li>• Table (DataTable)</li>
									<li>• Tabs, Dialog, Dropdown</li>
									<li>• StatusBadge (cores por status)</li>
								</ul>
							</div>

							<div>
								<h4 className="text-sm font-semibold mb-2">Estados</h4>
								<ul className="text-xs space-y-1 text-gray-700 dark:text-muted-foreground">
									<li>• Loading (spinner)</li>
									<li>• EmptyState</li>
									<li>• ErrorBoundary</li>
									<li>• Toast (feedback)</li>
								</ul>
							</div>
						</div>
					</CardContent>
				</Card>

				<Card>
					<CardHeader>
						<CardTitle>Segurança e Boas Práticas</CardTitle>
					</CardHeader>
					<CardContent>
						<div className="grid md:grid-cols-2 gap-4">
							<div>
								<h4 className="text-sm font-semibold mb-2">Segurança:</h4>
								<ul className="text-sm space-y-1 text-gray-700 dark:text-muted-foreground">
									<li>✅ Bearer Token Authentication</li>
									<li>✅ Auto-redirect em 401 (sessão expirada)</li>
									<li>✅ HTTPS ready</li>
									<li>✅ Validação client + server side</li>
									<li>✅ Sanitização de inputs</li>
								</ul>
							</div>

							<div>
								<h4 className="text-sm font-semibold mb-2">Performance:</h4>
								<ul className="text-sm space-y-1 text-gray-700 dark:text-muted-foreground">
									<li>✅ React Query (cache automático)</li>
									<li>✅ Server Components (Next.js)</li>
									<li>✅ Code splitting automático</li>
									<li>✅ Imagens otimizadas</li>
									<li>✅ Lazy loading</li>
								</ul>
							</div>
						</div>
					</CardContent>
				</Card>

				<Card>
					<CardHeader>
						<CardTitle>Módulos Implementados</CardTitle>
					</CardHeader>
					<CardContent>
						<div className="grid md:grid-cols-2 gap-3">
							<div className="flex items-center gap-2">
								<Badge variant="default">✅</Badge>
								<span className="text-sm">Login com CPF</span>
							</div>
							<div className="flex items-center gap-2">
								<Badge variant="default">✅</Badge>
								<span className="text-sm">Portal do Fornecedor</span>
							</div>
							<div className="flex items-center gap-2">
								<Badge variant="default">✅</Badge>
								<span className="text-sm">Gestão de Empenhos</span>
							</div>
							<div className="flex items-center gap-2">
								<Badge variant="outline">🔄</Badge>
								<span className="text-sm">Solicitações de Pagamento</span>
							</div>
							<div className="flex items-center gap-2">
								<Badge variant="outline">🔄</Badge>
								<span className="text-sm">Gestão de Anexos</span>
							</div>
							<div className="flex items-center gap-2">
								<Badge variant="outline">🔄</Badge>
								<span className="text-sm">Suporte ao Usuário</span>
							</div>
							<div className="flex items-center gap-2">
								<Badge variant="outline">🔄</Badge>
								<span className="text-sm">Prestação de Contas</span>
							</div>
							<div className="flex items-center gap-2">
								<Badge variant="outline">🔄</Badge>
								<span className="text-sm">Orçamentário</span>
							</div>
						</div>

						<div className="mt-4 p-3 bg-gray-50 dark:bg-muted rounded-lg border dark:border-border text-xs text-gray-600 dark:text-muted-foreground">
							<strong>Legenda:</strong> ✅ Implementado | 🔄 Em desenvolvimento | APIs prontas para
							integração
						</div>
					</CardContent>
				</Card>
			</div>
		</div>
	);
}

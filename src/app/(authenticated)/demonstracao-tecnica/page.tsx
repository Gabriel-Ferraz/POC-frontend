'use client';

import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { PageHeader } from '@/components/ui/page-header';
import { Badge } from '@/components/ui/badge';

const stack = {
	frontend: [
		{ label: 'Next.js 16.1.1', detail: 'App Router, Server Components' },
		{ label: 'React 19 + TypeScript 5', detail: 'Base da aplicação' },
		{ label: 'Tailwind CSS 4 + shadcn/ui', detail: 'Design system e estilos' },
		{ label: 'TanStack Query v5', detail: 'Cache e data fetching' },
		{ label: 'Zod v4', detail: 'Validação de schemas' },
		{ label: 'next-themes', detail: 'Tema dark / light' },
		{ label: 'Node.js ≥ 20', detail: 'Runtime' },
	],
	backend: [
		{ label: 'PHP 8.2 + Laravel 12', detail: 'Framework principal' },
		{ label: 'Laravel Octane + Swoole', detail: 'Alta performance assíncrona' },
		{ label: 'Laravel Sanctum', detail: 'Autenticação via Bearer Token' },
		{ label: 'Eloquent ORM', detail: 'Acesso a dados' },
		{ label: 'PostgreSQL 15', detail: 'Banco de dados relacional' },
		{ label: 'Redis 7', detail: 'Cache e filas' },
		{ label: 'Nginx', detail: 'Servidor web e proxy reverso' },
		{ label: 'Docker + Alpine Linux', detail: 'Containerização' },
	],
};

const modulos = [
	{ label: 'Login com CPF', detalhe: 'Autenticação com perfis de acesso distintos' },
	{ label: 'Portal do Fornecedor', detalhe: 'Consulta de empenhos e saldos' },
	{ label: 'Solicitações de Pagamento', detalhe: 'Criação, acompanhamento e cancelamento' },
	{ label: 'Gestão de Anexos', detalhe: 'Upload, aprovação, recusa e download' },
	{ label: 'Painel do Gestor', detalhe: 'Revisão de solicitações e anexos pendentes' },
	{ label: 'Suporte ao Usuário', detalhe: 'Abertura e acompanhamento de chamados' },
	{ label: 'Prestação de Contas', detalhe: 'Exportação de layouts SIM-AM' },
	{ label: 'Orçamentário', detalhe: 'Leis, atos, alterações e geração de PDF' },
	{ label: 'Painel Administrativo', detalhe: 'Gestão de usuários, fornecedores e empenhos' },
	{ label: 'Tema Dark / Light', detalhe: 'Alternância de tema em todas as telas' },
];

export default function DemonstracaoTecnicaPage() {
	return (
		<div>
			<PageHeader
				title="Demonstração Técnica"
				description="Arquitetura, stack e conformidade com os requisitos da licitação"
			/>

			<div className="grid gap-6">
				{/* Stack Técnica */}
				<Card>
					<CardHeader>
						<CardTitle>Stack Técnica</CardTitle>
					</CardHeader>
					<CardContent>
						<div className="grid md:grid-cols-2 gap-8">
							<div>
								<h4 className="text-sm font-semibold mb-3 text-muted-foreground uppercase tracking-wide">
									Frontend
								</h4>
								<div className="space-y-2.5">
									{stack.frontend.map((item) => (
										<div key={item.label} className="flex items-start justify-between gap-4">
											<div>
												<span className="text-sm font-medium">{item.label}</span>
												<p className="text-xs text-muted-foreground">{item.detail}</p>
											</div>
											<Badge className="shrink-0">✅</Badge>
										</div>
									))}
								</div>
							</div>
							<div>
								<h4 className="text-sm font-semibold mb-3 text-muted-foreground uppercase tracking-wide">
									Backend e Infraestrutura
								</h4>
								<div className="space-y-2.5">
									{stack.backend.map((item) => (
										<div key={item.label} className="flex items-start justify-between gap-4">
											<div>
												<span className="text-sm font-medium">{item.label}</span>
												<p className="text-xs text-muted-foreground">{item.detail}</p>
											</div>
											<Badge className="shrink-0">✅</Badge>
										</div>
									))}
								</div>
							</div>
						</div>
					</CardContent>
				</Card>

				{/* Requisitos do Edital */}
				<Card>
					<CardHeader>
						<CardTitle>Conformidade com o Ambiente de Demonstração</CardTitle>
					</CardHeader>
					<CardContent>
						<p className="text-sm text-muted-foreground mb-5">
							Correspondência dos requisitos especificados no edital com a arquitetura implantada.
						</p>
						<div className="grid md:grid-cols-2 gap-6">
							<div>
								<h4 className="text-sm font-semibold mb-3">Servidor de Aplicação</h4>
								<div className="space-y-3 text-sm">
									{[
										{
											req: 'Sistema Operacional Linux',
											impl: 'Containers Docker com Alpine Linux',
										},
										{
											req: 'Servidor de aplicação PHP',
											impl: 'PHP 8.2 com Octane + Swoole configurado',
										},
										{
											req: 'Servidor web',
											impl: 'Nginx com virtual host e proxy reverso (Traefik)',
										},
										{
											req: 'Geração de relatórios',
											impl: 'PDF gerado pelo backend PHP — sem dependência de Tomcat ou Java',
										},
										{
											req: 'Ferramentas de desenvolvimento (GIT)',
											impl: 'Git instalado no ambiente de desenvolvimento',
										},
									].map(({ req, impl }) => (
										<div key={req} className="flex items-start gap-2">
											<span className="text-green-600 dark:text-green-400 shrink-0 mt-0.5">
												✅
											</span>
											<div>
												<span className="font-medium">{req}</span>
												<p className="text-muted-foreground text-xs mt-0.5">{impl}</p>
											</div>
										</div>
									))}
								</div>
							</div>
							<div>
								<h4 className="text-sm font-semibold mb-3">Estação de Trabalho</h4>
								<div className="space-y-3 text-sm">
									{[
										{
											req: 'Sistema Operacional',
											impl: 'Windows 7 ou superior, Linux ou macOS — qualquer plataforma com navegador moderno',
										},
										{
											req: 'Navegador (Chrome e/ou Firefox)',
											impl: 'Chrome 90+, Firefox 88+, Safari 14+, Edge 90+ — sem plugins adicionais',
										},
										{
											req: 'Visualizador de PDF',
											impl: 'Nativo no navegador ou leitor externo para relatórios exportados',
										},
										{
											req: 'Ferramentas Office',
											impl: 'Para arquivos exportados pelo módulo de Prestação de Contas (XLSX)',
										},
										{
											req: 'Impressora',
											impl: 'Via impressão do navegador a partir dos PDFs gerados pelo sistema',
										},
									].map(({ req, impl }) => (
										<div key={req} className="flex items-start gap-2">
											<span className="text-green-600 dark:text-green-400 shrink-0 mt-0.5">
												✅
											</span>
											<div>
												<span className="font-medium">{req}</span>
												<p className="text-muted-foreground text-xs mt-0.5">{impl}</p>
											</div>
										</div>
									))}
								</div>
							</div>
						</div>
					</CardContent>
				</Card>

				{/* Módulos + Arquitetura em duas colunas */}
				<div className="grid md:grid-cols-2 gap-6">
					{/* Módulos */}
					<Card>
						<CardHeader>
							<CardTitle>Módulos Implementados</CardTitle>
						</CardHeader>
						<CardContent>
							<div className="space-y-2.5">
								{modulos.map(({ label, detalhe }) => (
									<div key={label} className="flex items-start gap-2">
										<Badge variant="default" className="shrink-0 mt-0.5">
											✅
										</Badge>
										<div>
											<span className="text-sm font-medium">{label}</span>
											<p className="text-xs text-muted-foreground">{detalhe}</p>
										</div>
									</div>
								))}
							</div>
						</CardContent>
					</Card>

					{/* Arquitetura Frontend */}
					<Card>
						<CardHeader>
							<CardTitle>Arquitetura Frontend</CardTitle>
						</CardHeader>
						<CardContent>
							<pre className="bg-muted/50 p-3 rounded-lg text-xs overflow-x-auto border border-border text-foreground mb-4 leading-5">
								{`src/
├── app/
│   ├── features/          # Lógica por domínio
│   │   ├── auth/
│   │   ├── fornecedor/
│   │   ├── solicitacoes/
│   │   ├── suporte/
│   │   ├── prestacao-contas/
│   │   └── orcamentario/
│   └── (authenticated)/   # Páginas por rota
│       ├── portal-fornecedor/
│       ├── gestor/
│       ├── suporte/
│       ├── admin/
│       └── ...
├── components/
│   ├── ui/        # Design System
│   ├── layout/    # Sidebar, Header
│   ├── suporte/
│   └── theme/
├── lib/http/      # HTTP Client
├── types/         # Models + Enums
└── providers/     # AuthProvider`}
							</pre>
							<div className="grid grid-cols-2 gap-3 text-xs text-muted-foreground">
								<div>
									<p className="font-semibold text-foreground mb-1">Padrões</p>
									<ul className="space-y-1">
										<li>• Separação por domínio</li>
										<li>• Bearer Token auth</li>
										<li>• Cache com TanStack Query</li>
										<li>• Validação Zod</li>
									</ul>
								</div>
								<div>
									<p className="font-semibold text-foreground mb-1">Segurança</p>
									<ul className="space-y-1">
										<li>• Auto-redirect em 401</li>
										<li>• Controle por perfil</li>
										<li>• Validação client + server</li>
										<li>• HTTPS ready</li>
									</ul>
								</div>
							</div>
						</CardContent>
					</Card>
				</div>
			</div>
		</div>
	);
}

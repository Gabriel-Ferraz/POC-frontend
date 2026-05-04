'use client';

import { useEffect, useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { PageHeader } from '@/components/ui/page-header';
import { ExternalLink, RefreshCw } from 'lucide-react';

// ── Serviços verificáveis via HTTP ──────────────────────────────────────────

interface ServiceCheck {
	label: string;
	url: string;
	description: string;
	linkLabel: string;
}

const SERVICES: ServiceCheck[] = [
	{
		label: 'Backend PHP (Laravel Octane)',
		url: '/api/version',
		description: 'PHP 8.2 + Laravel 12 + Swoole — roteado via Traefik',
		linkLabel: 'GET /api/version',
	},
	{
		label: 'Tomcat (Servidor de Relatórios)',
		url: 'http://localhost:8180',
		description: 'Apache Tomcat 10 — exigido pelo edital',
		linkLabel: 'localhost:8180',
	},
	{
		label: 'Adminer (Oracle Database)',
		url: 'http://localhost:8181',
		description: 'Oracle Database 23 Free via Adminer — acesso direto ao banco',
		linkLabel: 'localhost:8181',
	},
	{
		label: 'Traefik Dashboard',
		url: 'http://localhost:8080',
		description: 'Proxy reverso / roteamento de containers',
		linkLabel: 'localhost:8080',
	},
];

type Status = 'checking' | 'online' | 'offline';

function ServiceCard({ svc }: { svc: ServiceCheck }) {
	const [status, setStatus] = useState<Status>('checking');

	const check = async () => {
		setStatus('checking');
		try {
			await fetch(svc.url, { signal: AbortSignal.timeout(4000), mode: 'no-cors' });
			setStatus('online');
		} catch {
			setStatus('offline');
		}
	};

	useEffect(() => {
		check();
	}, []);

	return (
		<div className="flex items-center justify-between gap-4 py-3 border-b last:border-0">
			<div className="min-w-0">
				<div className="flex items-center gap-2">
					<span
						className={`w-2 h-2 rounded-full shrink-0 ${
							status === 'online'
								? 'bg-green-500'
								: status === 'offline'
									? 'bg-red-500'
									: 'bg-yellow-400 animate-pulse'
						}`}
					/>
					<span className="text-sm font-medium">{svc.label}</span>
					<Badge variant="outline" className="text-xs hidden sm:inline-flex">
						{status === 'checking' ? 'verificando…' : status === 'online' ? 'online' : 'offline'}
					</Badge>
				</div>
				<p className="text-xs text-muted-foreground mt-0.5 ml-4">{svc.description}</p>
			</div>
			<div className="flex items-center gap-2 shrink-0">
				<button
					onClick={check}
					className="text-muted-foreground hover:text-foreground"
					title="Verificar novamente">
					<RefreshCw className="w-3.5 h-3.5" />
				</button>
				<a
					href={svc.url}
					target="_blank"
					rel="noopener noreferrer"
					className="flex items-center gap-1 text-xs text-blue-600 dark:text-blue-400 hover:underline">
					{svc.linkLabel}
					<ExternalLink className="w-3 h-3" />
				</a>
			</div>
		</div>
	);
}

// ── Stack técnica ────────────────────────────────────────────────────────────

const stack = {
	frontend: [
		{ label: 'Next.js 16.1.1', detail: 'App Router, Server Components' },
		{ label: 'React 19 + TypeScript 5', detail: 'Base da aplicação' },
		{ label: 'Tailwind CSS 4 + shadcn/ui', detail: 'Design system' },
		{ label: 'TanStack Query v5', detail: 'Cache e data fetching' },
		{ label: 'Zod v4', detail: 'Validação de schemas' },
		{ label: 'next-themes', detail: 'Dark / Light mode' },
		{ label: 'Node.js ≥ 20', detail: 'Runtime' },
	],
	backend: [
		{ label: 'PHP 8.2 + Laravel 12', detail: 'Framework principal' },
		{ label: 'Laravel Octane + Swoole', detail: 'Alta performance assíncrona' },
		{ label: 'Laravel Sanctum', detail: 'Bearer Token auth' },
		{ label: 'Oracle Database 23 Free', detail: 'Banco de dados relacional' },
		{ label: 'Redis 7', detail: 'Cache e filas' },
		{ label: 'Nginx', detail: 'Servidor web + proxy reverso' },
		{ label: 'Apache Tomcat 10', detail: 'Servidor de relatórios (edital)' },
		{ label: 'Docker + Alpine Linux', detail: 'Containerização' },
	],
};

const modulos = [
	{ label: 'Login com CPF', detalhe: 'Autenticação com perfis de acesso distintos' },
	{ label: 'Portal do Fornecedor', detalhe: 'Empenhos emitidos e saldo' },
	{ label: 'Solicitações de Pagamento', detalhe: 'Criação, envio de anexos, cancelamento, consulta' },
	{ label: 'Gestão de Anexos', detalhe: 'Upload, aprovação, recusa e download' },
	{ label: 'Painel do Gestor', detalhe: 'Revisão de solicitações e aprovação de anexos' },
	{ label: 'Suporte ao Usuário', detalhe: 'Abertura, acompanhamento e resposta de chamados' },
	{ label: 'Prestação de Contas', detalhe: 'Exportação de layouts SIM-AM (ZIP + download)' },
	{ label: 'Orçamentário', detalhe: 'Leis/atos, alterações, dotações, geração de PDF' },
	{ label: 'Painel Administrativo', detalhe: 'Gestão de usuários, fornecedores, empenhos e status' },
	{ label: 'Tema Dark / Light', detalhe: 'Alternância em todas as telas' },
];

const editalItems = [
	{ req: 'SO Linux', impl: 'Docker Alpine/Slim Linux em todos os containers' },
	{ req: 'PHP instalado e configurado', impl: 'PHP 8.2 + Octane/Swoole — porta 3333' },
	{ req: 'Tomcat instalado e configurado', impl: 'Apache Tomcat 10 — porta 8180' },
	{ req: 'Servidor web', impl: 'Nginx + Traefik (proxy reverso) — porta 8008' },
	{ req: 'GIT instalado', impl: 'Git disponível no container de desenvolvimento' },
	{ req: 'Chrome e/ou Firefox', impl: 'Sem plugins adicionais — qualquer browser moderno' },
	{ req: 'Visualizador de PDF', impl: 'Nativo no navegador para relatórios exportados' },
	{ req: 'Ferramentas Office', impl: 'Para arquivos XLSX exportados pela Prestação de Contas' },
	{ req: 'Impressora', impl: 'Via impressão do navegador a partir dos PDFs gerados' },
];

export default function DemonstracaoTecnicaPage() {
	return (
		<div>
			<PageHeader
				title="Demonstração Técnica"
				description="Status dos serviços, stack e conformidade com o edital"
			/>

			<div className="grid gap-6">
				{/* Verificação de Serviços ao Vivo */}
				<Card>
					<CardHeader>
						<CardTitle className="flex items-center gap-2">
							Serviços em Execução
							<span className="text-xs font-normal text-muted-foreground">
								— verificação em tempo real
							</span>
						</CardTitle>
					</CardHeader>
					<CardContent>
						{SERVICES.map((svc) => (
							<ServiceCard key={svc.url} svc={svc} />
						))}
					</CardContent>
				</Card>

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

				{/* Conformidade com o Edital */}
				<Card>
					<CardHeader>
						<CardTitle>Conformidade com o Ambiente de Demonstração</CardTitle>
					</CardHeader>
					<CardContent>
						<p className="text-sm text-muted-foreground mb-5">
							Mapeamento dos requisitos do edital para a arquitetura implantada.
						</p>
						<div className="grid md:grid-cols-2 gap-x-8 gap-y-3">
							{editalItems.map(({ req, impl }) => (
								<div key={req} className="flex items-start gap-2 text-sm">
									<span className="text-green-600 dark:text-green-400 shrink-0 mt-0.5">✅</span>
									<div>
										<span className="font-medium">{req}</span>
										<p className="text-muted-foreground text-xs mt-0.5">{impl}</p>
									</div>
								</div>
							))}
						</div>
					</CardContent>
				</Card>

				{/* Módulos + Arquitetura */}
				<div className="grid md:grid-cols-2 gap-6">
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
									<p className="font-semibold text-foreground mb-1">Padrões (MVC)</p>
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

'use client';

import { useEffect, useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { PageHeader } from '@/components/ui/page-header';
import { ExternalLink, RefreshCw, Eye, EyeOff, ChevronDown, ChevronRight, Check } from 'lucide-react';

// ── Serviços verificáveis ────────────────────────────────────────────────────

interface ServiceCheck {
	label: string;
	url: string;
	description: string;
	linkLabel: string;
	linkHref: string;
	port?: number;
}

const SERVICES: ServiceCheck[] = [
	{
		label: 'Backend PHP (Laravel)',
		url: '/api/version',
		description: 'PHP 8.2 + Laravel 12 — porta 3333',
		linkLabel: 'GET /api/version',
		linkHref: '/api/version',
	},
	{
		label: 'Tomcat (Servidor de Relatórios)',
		url: '/tomcat',
		description: 'Apache Tomcat 9 — exigido pelo edital',
		linkLabel: '/tomcat',
		linkHref: '/tomcat',
	},
	{
		label: 'CloudBeaver (Oracle Database)',
		url: ':8978',
		description: 'Oracle Database 23 Free — interface de administração (DBeaver Web)',
		linkLabel: ':8978',
		linkHref: ':8978',
		port: 8978,
	},
];

type Status = 'checking' | 'online' | 'offline';

function ServiceCard({ svc }: { svc: ServiceCheck }) {
	const [status, setStatus] = useState<Status>('checking');

	const resolvedHref = svc.port
		? `${typeof window !== 'undefined' ? window.location.protocol : 'http:'}//${typeof window !== 'undefined' ? window.location.hostname : 'localhost'}:${svc.port}`
		: svc.linkHref;

	const resolvedUrl = svc.port
		? `${typeof window !== 'undefined' ? window.location.protocol : 'http:'}//${typeof window !== 'undefined' ? window.location.hostname : 'localhost'}:${svc.port}`
		: svc.url;

	const check = async () => {
		setStatus('checking');
		try {
			await fetch(resolvedUrl, { signal: AbortSignal.timeout(4000), mode: 'no-cors' });
			setStatus('online');
		} catch {
			setStatus('offline');
		}
	};

	useEffect(() => {
		check();
	}, []);

	return (
		<div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4 py-3 border-b last:border-0">
			<div className="min-w-0 flex-1">
				<div className="flex items-center gap-2 flex-wrap">
					<span
						className={`w-2 h-2 rounded-full shrink-0 ${
							status === 'online'
								? 'bg-green-500'
								: status === 'offline'
									? 'bg-red-500'
									: 'bg-yellow-400 animate-pulse'
						}`}
					/>
					<span className="text-xs sm:text-sm font-medium break-words">{svc.label}</span>
					<Badge variant="outline" className="text-[10px] sm:text-xs">
						{status === 'checking' ? 'verificando…' : status === 'online' ? 'online' : 'offline'}
					</Badge>
				</div>
				<p className="text-[10px] sm:text-xs text-muted-foreground mt-1 ml-0 sm:ml-4">{svc.description}</p>
			</div>
			<div className="flex items-center gap-2 shrink-0 ml-4 sm:ml-0">
				<button
					onClick={check}
					className="text-muted-foreground hover:text-foreground p-1"
					title="Verificar novamente">
					<RefreshCw className="w-3.5 h-3.5" />
				</button>
				<a
					href={resolvedHref}
					target="_blank"
					rel="noopener noreferrer"
					className="flex items-center gap-1 text-[10px] sm:text-xs text-blue-600 dark:text-blue-400 hover:underline break-all">
					<span className="truncate max-w-[120px] sm:max-w-none">{svc.linkLabel}</span>
					<ExternalLink className="w-3 h-3 flex-shrink-0" />
				</a>
			</div>
		</div>
	);
}

// ── Credenciais do banco ─────────────────────────────────────────────────────

function DbCredentials() {
	const [visible, setVisible] = useState(false);

	const creds = [
		{ label: 'Interface', value: '/cloudbeaver — porta 8978' },
		{ label: 'Login painel', value: 'CloudBeaver1521' },
		{ label: 'Senha painel', value: 'CloudBeaver1521' },
		{ label: 'Service Type', value: 'Service' },
		{ label: 'Driver', value: 'Oracle' },
		{ label: 'Host', value: 'oracle' },
		{ label: 'Porta', value: '1521' },
		{ label: 'Banco', value: 'FREEPDB1' },
		{ label: 'Usuário', value: 'poc_user' },
		{ label: 'Senha', value: 'poc_pass' },
		{ label: 'Senha SYS', value: 'oraclepass' },
	];

	return (
		<div className="mt-4 border rounded-lg overflow-hidden">
			<button
				onClick={() => setVisible((v) => !v)}
				className="w-full flex items-center justify-between px-3 sm:px-4 py-3 bg-muted/50 hover:bg-muted transition-colors text-xs sm:text-sm font-medium">
				<span className="flex items-center gap-2">
					{visible ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
					<span className="truncate">Credenciais do Banco de Dados</span>
				</span>
				<span className="text-[10px] sm:text-xs text-muted-foreground flex-shrink-0 ml-2">
					{visible ? 'ocultar' : 'exibir'}
				</span>
			</button>
			{visible && (
				<div className="px-3 sm:px-4 py-3 grid grid-cols-1 gap-3 text-xs sm:text-sm">
					{creds.map(({ label, value }) => (
						<div key={label} className="flex flex-col sm:flex-row sm:gap-2">
							<span className="text-muted-foreground font-medium mb-1 sm:mb-0 sm:shrink-0 sm:w-24">
								{label}:
							</span>
							<code className="font-mono text-[10px] sm:text-xs bg-muted px-2 py-1 rounded break-all">
								{value}
							</code>
						</div>
					))}
				</div>
			)}
		</div>
	);
}

// ── Stack técnica ────────────────────────────────────────────────────────────

const stack = {
	frontend: [
		{ label: 'Next.js 15 + React 19', detail: 'App Router, Server Components' },
		{ label: 'TypeScript 5', detail: 'Tipagem estática em todo o projeto' },
		{ label: 'Tailwind CSS 4 + shadcn/ui', detail: 'Design system' },
		{ label: 'TanStack Query v5', detail: 'Cache e data fetching' },
		{ label: 'Zod v4', detail: 'Validação de schemas' },
		{ label: 'next-themes', detail: 'Dark / Light mode' },
		{ label: 'Node.js ≥ 20', detail: 'Runtime' },
	],
	backend: [
		{ label: 'PHP 8.2 + Laravel 12', detail: 'Framework principal' },
		{ label: 'Laravel Sanctum', detail: 'Bearer Token auth' },
		{ label: 'Oracle Database 23 Free', detail: 'Banco de dados relacional' },
		{ label: 'Redis 7', detail: 'Cache e filas' },
		{ label: 'Apache Tomcat 9', detail: 'Servidor de relatórios (edital)' },
		{ label: 'Traefik v3', detail: 'Proxy reverso + roteamento' },
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
	{ label: 'Independência de Browser', detalhe: 'Funcional em Chrome, Firefox e Safari sem plugins' },
	{ label: 'Tema Dark / Light', detalhe: 'Alternância em todas as telas' },
];

const editalItems = [
	{ req: 'Servidor de Banco de Dados (Oracle)', impl: 'Oracle Database 23 Free em container Linux' },
	{ req: 'SO Linux', impl: 'Docker Alpine/Slim Linux em todos os containers' },
	{ req: 'PHP instalado e configurado', impl: 'PHP 8.2 + Laravel 12 — porta 3333' },
	{ req: 'Tomcat instalado e configurado', impl: 'Apache Tomcat 9 — acessível em /tomcat' },
	{ req: 'Servidor web', impl: 'Traefik v3 (proxy reverso) — porta 8008' },
	{ req: 'GIT instalado', impl: 'Git disponível no container de desenvolvimento' },
	{ req: 'Chrome, Firefox e/ou Safari', impl: 'Sem plugins adicionais — qualquer browser moderno' },
	{ req: 'Visualizador de PDF', impl: 'Nativo no navegador para relatórios exportados' },
	{ req: 'Ferramentas Office', impl: 'Para arquivos XLSX exportados pela Prestação de Contas' },
	{ req: 'Ferramentas de desenvolvimento', impl: 'IDE (VS Code) + CloudBeaver (acesso ao banco)' },
	{ req: 'Impressora', impl: 'Via impressão do navegador a partir dos PDFs gerados' },
];

// ── Arquitetura MVC ──────────────────────────────────────────────────────────

interface MvcLayer {
	title: string;
	subtitle: string;
	color: string;
	path: string;
	description: string;
	snippet: string;
}

const MVC_LAYERS: MvcLayer[] = [
	{
		title: 'Model',
		subtitle: 'Entidades e regras de negócio',
		color: 'border-blue-400 bg-blue-50 dark:bg-blue-950/40',
		path: 'app/Models/User.php',
		description: 'Eloquent ORM com tipagem, casts, relacionamentos e Sanctum para tokens de autenticação.',
		snippet: `// app/Models/User.php
class User extends Authenticatable
{
    use HasApiTokens, HasFactory, Notifiable, SoftDeletes;

    protected $fillable = [
        'name', 'email', 'cpf', 'password',
        'perfil', 'is_active', 'fornecedor_id',
    ];

    protected function casts(): array
    {
        return [
            'password'   => 'hashed',
            'is_active'  => 'boolean',
            'last_login_at' => 'datetime',
        ];
    }

    public function fornecedor(): BelongsTo
    {
        return $this->belongsTo(Fornecedor::class);
    }
}`,
	},
	{
		title: 'Controller',
		subtitle: 'Lógica de apresentação e orquestração',
		color: 'border-purple-400 bg-purple-50 dark:bg-purple-950/40',
		path: 'app/Http/Controllers/Auth/AuthController.php',
		description: 'Controllers finos que delegam para Models. Traits Auditable e Logger injetam rastreabilidade.',
		snippet: `// app/Http/Controllers/Auth/AuthController.php
class AuthController extends Controller
{
    use Auditable, Logger;

    public function login(LoginRequest $request): JsonResponse
    {
        $user = User::where('email', $request->email ?? $request->cpf)
            ->orWhere('cpf', $request->cpf ?? $request->email)
            ->first();

        if (!$user || !Hash::check($request->password, $user->password)) {
            return response()->json(['message' => 'Credenciais inválidas'], 401);
        }

        $token = $user->createToken('auth-token')->plainTextToken;
        $this->audit('login', 'User', $user->id, null, $user->id);

        return response()->json([
            'token' => $token,
            'user'  => new UserResource($user->load('fornecedor')),
        ]);
    }
}`,
	},
	{
		title: 'Route / API',
		subtitle: 'Definição de endpoints REST',
		color: 'border-green-400 bg-green-50 dark:bg-green-950/40',
		path: 'routes/api.php',
		description: 'Rotas agrupadas por domínio, protegidas por Sanctum. Prefixos semânticos por módulo.',
		snippet: `// routes/api.php
Route::prefix('auth')->group(function () {
    Route::post('/login',    [AuthController::class, 'login']);
    Route::post('/register', [AuthController::class, 'register']);
});

Route::middleware('auth:sanctum')->group(function () {
    Route::prefix('fornecedor')->group(function () {
        Route::get('/empenhos',      [FornecedorController::class, 'empenhos']);
        Route::get('/empenhos/{id}', [FornecedorController::class, 'showEmpenho']);
    });

    Route::prefix('chamados')->group(function () {
        Route::get('/',            [ChamadoController::class, 'index']);
        Route::post('/',           [ChamadoController::class, 'store']);
        Route::get('/{id}',        [ChamadoController::class, 'show']);
        Route::post('/{id}/responder', [ChamadoController::class, 'responder']);
    });
});`,
	},
	{
		title: 'View / Resource',
		subtitle: 'Serialização de resposta JSON',
		color: 'border-orange-400 bg-orange-50 dark:bg-orange-950/40',
		path: 'app/Http/Resources/Auth/UserResource.php',
		description: 'API Resources formatam o JSON de saída, garantindo controle sobre campos expostos por perfil.',
		snippet: `// app/Http/Resources/Auth/UserResource.php
class UserResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id'           => $this->id,
            'name'         => $this->name,
            'email'        => $this->email,
            'cpf'          => $this->cpf,
            'perfil'       => $this->perfil,
            'is_active'    => $this->is_active,
            'last_login_at' => $this->last_login_at?->toISOString(),
            'fornecedor'   => $this->whenLoaded('fornecedor', fn () => [
                'id'   => $this->fornecedor->id,
                'nome' => $this->fornecedor->nome,
                'cnpj' => $this->fornecedor->cnpj,
            ]),
        ];
    }
}`,
	},
	{
		title: 'Frontend — Provider',
		subtitle: 'Estado global de autenticação (React Context)',
		color: 'border-cyan-400 bg-cyan-50 dark:bg-cyan-950/40',
		path: 'src/providers/AuthProvider.tsx',
		description:
			'Context API gerencia o usuário autenticado, expõe login/logout e guarda o perfil para controle de acesso em toda a UI.',
		snippet: `// src/providers/AuthProvider.tsx
type AuthCtx = {
    user: User | null;
    loading: boolean;
    login: (cpf: string, password: string) => Promise<void>;
    logout: () => Promise<void>;
    isPerfil: (perfil: PerfilUsuario) => boolean;
};

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const router = useRouter();

    const login = async (cpf: string, password: string) => {
        const { token, user } = await loginApi(cpf, password);
        saveToken(token);
        setUser(user);
        router.push('/');
    };

    return (
        <AuthContext.Provider value={{ user, loading, login, logout, isPerfil }}>
            {children}
        </AuthContext.Provider>
    );
}`,
	},
];

function MvcCard({ layer }: { layer: MvcLayer }) {
	const [open, setOpen] = useState(false);

	return (
		<div className={`rounded-lg border-l-4 ${layer.color} border border-border overflow-hidden`}>
			<button
				onClick={() => setOpen((v) => !v)}
				className="w-full flex items-start justify-between gap-2 sm:gap-3 p-3 sm:p-4 text-left hover:bg-black/5 dark:hover:bg-white/5 transition-colors">
				<div className="min-w-0 flex-1">
					<div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2 flex-wrap">
						<span className="font-semibold text-xs sm:text-sm">{layer.title}</span>
						<span className="text-[10px] sm:text-xs text-muted-foreground">— {layer.subtitle}</span>
					</div>
					<p className="text-[10px] sm:text-xs text-muted-foreground mt-1 leading-relaxed">
						{layer.description}
					</p>
					<code className="text-[10px] sm:text-xs text-blue-600 dark:text-blue-400 font-mono mt-1 block break-all">
						{layer.path}
					</code>
				</div>
				{open ? (
					<ChevronDown className="w-4 h-4 text-muted-foreground shrink-0 mt-0.5" />
				) : (
					<ChevronRight className="w-4 h-4 text-muted-foreground shrink-0 mt-0.5" />
				)}
			</button>
			{open && (
				<pre className="text-[10px] sm:text-xs font-mono bg-gray-900 dark:bg-gray-950 text-gray-100 p-3 sm:p-4 overflow-x-auto leading-relaxed border-t border-border">
					{layer.snippet}
				</pre>
			)}
		</div>
	);
}

// ── Page ─────────────────────────────────────────────────────────────────────

export default function DemonstracaoTecnicaPage() {
	return (
		<div>
			<PageHeader
				title="Demonstração Técnica"
				description="Status dos serviços, stack, conformidade com o edital e arquitetura MVC"
			/>

			<div className="grid gap-6">
				{/* Verificação de Serviços */}
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
						<DbCredentials />
					</CardContent>
				</Card>

				{/* Stack Técnica */}
				<Card>
					<CardHeader>
						<CardTitle className="text-base sm:text-lg">Stack Técnica</CardTitle>
					</CardHeader>
					<CardContent>
						<div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8">
							<div>
								<h4 className="text-xs sm:text-sm font-semibold mb-3 text-muted-foreground uppercase tracking-wide">
									Frontend
								</h4>
								<div className="space-y-2.5">
									{stack.frontend.map((item) => (
										<div
											key={item.label}
											className="flex items-start justify-between gap-3 sm:gap-4">
											<div className="min-w-0 flex-1">
												<span className="text-xs sm:text-sm font-medium break-words">
													{item.label}
												</span>
												<p className="text-[10px] sm:text-xs text-muted-foreground">
													{item.detail}
												</p>
											</div>
											<Check className="w-4 h-4 text-green-600 dark:text-green-400 shrink-0" />
										</div>
									))}
								</div>
							</div>
							<div>
								<h4 className="text-xs sm:text-sm font-semibold mb-3 text-muted-foreground uppercase tracking-wide">
									Backend e Infraestrutura
								</h4>
								<div className="space-y-2.5">
									{stack.backend.map((item) => (
										<div
											key={item.label}
											className="flex items-start justify-between gap-3 sm:gap-4">
											<div className="min-w-0 flex-1">
												<span className="text-xs sm:text-sm font-medium break-words">
													{item.label}
												</span>
												<p className="text-[10px] sm:text-xs text-muted-foreground">
													{item.detail}
												</p>
											</div>
											<Check className="w-4 h-4 text-green-600 dark:text-green-400 shrink-0" />
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
									<Check className="w-4 h-4 text-green-600 dark:text-green-400 shrink-0 mt-0.5" />
									<div>
										<span className="font-medium">{req}</span>
										<p className="text-muted-foreground text-xs mt-0.5">{impl}</p>
									</div>
								</div>
							))}
						</div>
					</CardContent>
				</Card>

				{/* Módulos */}
				<Card>
					<CardHeader>
						<CardTitle>Módulos Implementados</CardTitle>
					</CardHeader>
					<CardContent>
						<div className="grid sm:grid-cols-2 gap-x-8 gap-y-2.5">
							{modulos.map(({ label, detalhe }) => (
								<div key={label} className="flex items-start gap-2">
									<Check className="w-4 h-4 text-green-600 dark:text-green-400 shrink-0 mt-0.5" />
									<div>
										<span className="text-sm font-medium">{label}</span>
										<p className="text-xs text-muted-foreground">{detalhe}</p>
									</div>
								</div>
							))}
						</div>
					</CardContent>
				</Card>

				{/* Arquitetura MVC */}
				<Card>
					<CardHeader>
						<CardTitle>Arquitetura MVC — Código Real da Aplicação</CardTitle>
					</CardHeader>
					<CardContent>
						<p className="text-sm text-muted-foreground mb-4">
							Clique em cada camada para ver o trecho real do código fonte. O path indica onde encontrar o
							arquivo no projeto.
						</p>
						<div className="space-y-3">
							{MVC_LAYERS.map((layer) => (
								<MvcCard key={layer.title} layer={layer} />
							))}
						</div>
					</CardContent>
				</Card>
			</div>
		</div>
	);
}

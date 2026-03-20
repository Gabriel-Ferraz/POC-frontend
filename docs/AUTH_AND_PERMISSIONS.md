# Autenticacao e Permissoes — Frontend

Documento tecnico de como o sistema de autenticacao e controle de permissoes funciona no frontend Next.js, e o que precisa ser feito para reutilizar como boilerplate.

---

## Indice

1. [Visao Geral da Arquitetura](#1-visao-geral-da-arquitetura)
2. [Fluxo de Autenticacao](#2-fluxo-de-autenticacao)
3. [Protecao de Rotas (Server-Side)](#3-protecao-de-rotas-server-side)
4. [HTTP Client](#4-http-client)
5. [Expiracao de Token e Sessao](#5-expiracao-de-token-e-sessao)
6. [Sistema de Permissoes (CASL)](#6-sistema-de-permissoes-casl)
7. [Controle no Sidebar](#7-controle-no-sidebar)
8. [Controle em Botoes e Funcionalidades](#8-controle-em-botoes-e-funcionalidades)
9. [Protecao de Rotas por Permissao](#9-protecao-de-rotas-por-permissao)
10. [Convencao de permissions.ts](#10-convencao-de-permissionsts)
11. [Requisitos do Backend](#11-requisitos-do-backend)
12. [Checklist para Boilerplate](#12-checklist-para-boilerplate)

---

## 1. Visao Geral da Arquitetura

```
Browser
  |
  |-- proxy.ts (Edge/Proxy) ---------> Redireciona se nao autenticado
  |
  |-- layout.tsx
  |     |-- AuthProvider        ----> Busca /api/auth/me, expoe user/roles/permissions
  |     |-- AbilityProvider     ----> Converte permissions[] em CASL Ability
  |     |-- {children}
  |
  |-- <ProtectedPage>           ----> Bloqueia pagina se usuario nao tem permissao
  |-- SideNav                   ----> Filtra menu por ability.can('access', subject)
  |-- <Authorized>              ----> Mostra/esconde botoes por permissao
  |-- useAuthorized()           ----> Check imperativo em logica JS
```

### Providers (ordem no layout.tsx)

```tsx
<AuthProvider>           // 1. Busca user (com roles + permissions) do backend
  <AbilityProvider>      // 2. Converte em CASL ability
    {children}           // 3. App renderiza com permissoes ja carregadas
  </AbilityProvider>
</AuthProvider>
```

---

## 2. Fluxo de Autenticacao

### Login

```
1. Usuario submete email + senha
2. POST /api/auth/login → { token }
3. Token salvo em COOKIE (nao localStorage)
4. GET /api/auth/me → { user: { ...dados, roles: string[], permissions: string[] } }
5. getFirstAccessibleRoute(user.permissions, user.roles) → primeira pagina acessivel
6. Se tem permissoes → redirect para a primeira pagina acessivel
7. Se zero permissoes → redirect para /sem-acesso (fallback com mensagem)
```

O redirect pos-login e **inteligente**: o `useLoginForm` chama `/me` logo apos salvar o token, calcula a primeira rota acessivel baseado nas permissoes do usuario, e redireciona direto. Nao depende de uma rota fixa.

### Arquivos envolvidos

| Arquivo | Responsabilidade |
|---------|-----------------|
| `src/app/features/auth/api/auth-api.ts` | `loginWithEmailAndPassword()` — chama POST /api/auth/login e salva token |
| `src/app/features/auth/api/me.ts` | `getMe()` — chama GET /api/auth/me |
| `src/app/features/auth/api/logout.ts` | `logout()` — chama POST /api/auth/logout |
| `src/app/features/auth/hooks/useLoginForm.ts` | Hook do form de login — chama login, /me, e redireciona inteligente |
| `src/app/features/auth/types/auth.types.ts` | Tipos: `User`, `LoginResponse` (apenas token), `MeResponse` |
| `src/lib/auth/token-storage.ts` | `getToken()`, `setToken()`, `clearToken()` — cookie management |
| `src/lib/navigation/routes.ts` | `APP_ROUTES`, `getFirstAccessibleRoute()` — mapa de rotas e redirect inteligente |

### Token Storage (Cookie)

O token e armazenado em **cookie** (nao localStorage) para que o `proxy.ts` (server-side) consiga ler e decidir redirecionamentos antes do React renderizar.

```ts
// setToken() → document.cookie = "auth_token=xxx; Path=/; Max-Age=86400; SameSite=Lax"
// getToken() → le do document.cookie
// clearToken() → Max-Age=0
```

### AuthProvider (`src/providers/AuthProvider.tsx`)

Expoe via context:

```ts
type AuthCtx = {
    user: User | null;           // Dados do usuario logado (inclui roles[] e permissions[])
    roles: string[];             // Extraido de user.roles — Ex: ['diretor']
    permissions: string[];       // Extraido de user.permissions — Ex: ['admin.users', 'estoque.dashboard-gerencial']
    loading: boolean;
    logout: () => Promise<void>;
    refresh: () => Promise<void>;
    hasRole: (role: string) => boolean;
    hasPermission: (permission: string) => boolean;
};
```

- No mount, chama `refresh()` que faz `getMe()` e extrai `user.roles` e `user.permissions`
- Se token invalido/expirado, limpa token e seta user=null
- `hasRole` e `hasPermission` fazem bypass automatico para `super-admin`

### Tipo `User` (`src/app/features/auth/types/auth.types.ts`)

```ts
export type User = {
    id: number;
    name: string;
    email: string;
    is_active: boolean;
    email_verified_at?: string | null;
    last_login_at: string | null;
    created_at: string;
    updated_at: string;
    deleted_at?: string | null;
    roles: string[];        // Roles do usuario (ex: ['super-admin', 'gestor'])
    permissions: string[];  // Permissoes flat (ex: ['admin.users', 'admin.users.store'])
};

export type LoginResponse = {
    token: string;          // POST /login retorna APENAS o token, sem user
};

export type MeResponse = {
    user: User;             // Tudo vem dentro de user — sem roles/permissions no top level
};
```

**Importante:** O POST `/login` retorna apenas `{ token }`. Os dados do usuario sao obtidos exclusivamente via GET `/me`, que retorna `{ user: { ...campos, roles, permissions } }`. Roles e permissions estao **dentro** do objeto `user`, nao no nivel top da resposta.

---

## 3. Protecao de Rotas (Server-Side)

**Arquivo:** `src/proxy.ts`

```ts
export function proxy(request: NextRequest) {
    // Ignora assets e APIs
    // Le cookie auth_token
    // Se tem token + rota publica → redirect para app
    // Se nao tem token + rota privada → redirect para /login
}
```

**Importante:** O proxy so verifica se o token EXISTE, nao valida. A validacao real e feita pelo backend no `getMe()`.

> **Next.js 16+:** A convencao mudou de `middleware.ts` exportando `middleware()` para `proxy.ts` exportando `proxy()`.

### Configuracao

```ts
const PUBLIC_PATHS = ['/', '/login'];           // Rotas sem autenticacao
const AUTHENTICATED_REDIRECT = '/estoque/...';  // Para onde redireciona apos login
const TOKEN_KEY = 'auth_token';                 // Nome do cookie
```

Para boilerplate: ajustar `PUBLIC_PATHS` e `AUTHENTICATED_REDIRECT`.

---

## 4. HTTP Client

**Arquivos:**
- `src/lib/http/http-client.ts` — fetch wrapper
- `src/lib/http/http-methods.ts` — `get()`, `post()`, `put()`, `patch()`, `del()`
- `src/lib/http/types.ts` — `ApiError`, `HttpMethod`, `RequestOptions`

### Funcionalidades

- Injeta `Authorization: Bearer {token}` automaticamente em toda request
- Se backend retorna 401, limpa token e redireciona para `/login` automaticamente
- Erros viram `ApiError` com `status` e `payload` (para validacao de forms)
- Suporta JSON, FormData, Blob

### Uso

```ts
import { get, post, put, del } from '@/lib/http/http-methods';

const users = await get<Paginated<User>>('/api/admin/users?page=1');
const created = await post<User>('/api/admin/users', { name, email, password });
```

---

## 5. Expiracao de Token e Sessao

Laravel Sanctum usa token unico — nao existe refresh token. Quando o token expira, o usuario precisa logar novamente.

### Cenarios de expiracao

| Cenario | O que acontece |
|---------|---------------|
| Token valido | API funciona normalmente |
| Token expira + usuario **navega** | `proxy.ts` ve cookie vazio → redirect para `/login` |
| Token expira + usuario **faz acao** (clica botao, salva form) | API retorna 401 → `http-client` limpa cookie → `window.location.href = '/login'` (redirect imediato) |
| Sem token no mount | `AuthProvider` seta user=null, middleware redireciona |

### Fluxo no http-client

```ts
// src/lib/http/http-client.ts
if (response.status === 401) {
    clearToken();                          // 1. Remove o cookie

    if (typeof window !== 'undefined') {
        window.location.href = '/login';   // 2. Redirect imediato
    }

    throw new ApiError('Sessao expirada', 401, payload);  // 3. Throw para quem chamou
}
```

O redirect acontece via `window.location.href` (hard navigation) e nao `router.push()` porque:
- O http-client e uma camada utilitaria sem acesso ao React router
- Hard navigation garante que todo estado do React e limpo
- O `proxy.ts` vai interceptar e confirmar o redirect para `/login`

### Camadas de protecao (resumo)

```
Camada 1: proxy.ts         → Protecao server-side (antes do React)
                              Se nao tem cookie, redireciona para /login
                              Roda em toda navegacao (Next.js 16 proxy)

Camada 2: AuthProvider     → Protecao no mount
                              Se getMe() falha, limpa estado
                              Usuario fica com user=null

Camada 3: ProtectedPage   → Protecao por permissao (por pagina)
                              Verifica se usuario tem permissao para a rota
                              Se nao tem → toast + fallback inline "Pagina nao autorizada"
                              Se nao tem NENHUMA permissao → fallback inline "Acesso restrito"
                              Nunca redireciona — sempre renderiza inline

Camada 4: http-client      → Protecao em runtime
                              Se qualquer API retorna 401, limpa cookie
                              e redireciona imediatamente para /login
```

### Sobre refresh token (futuro)

O comportamento atual (expirou → login) e o padrao do Laravel Sanctum. Se no futuro quiser refresh token:

1. Backend: criar endpoint `POST /api/auth/refresh` que gera novo token
2. Frontend: no bloco de 401 do `http-client`, tentar refresh antes de redirecionar
3. Se refresh falhar, ai sim redireciona pro `/login`
4. Implementar fila de requests para nao disparar multiplos refreshes simultaneos

---

## 6. Sistema de Permissoes (CASL)

### Dependencias

```bash
npm install @casl/ability @casl/react
```

### Como funciona

1. Backend retorna `user.permissions: string[]` (ex: `['admin.users', 'admin.users.store', 'estoque.dashboard-gerencial']`)
2. `buildAbility()` converte cada string em regra CASL `{ action, subject }`
3. Componentes consultam `ability.can(action, subject)`

### Parsing de permissoes (`src/lib/casl/ability.ts`)

```
Permissao                      →  action     subject
─────────────────────────────────────────────────────
"admin.users"                  →  "access"   "admin.users"        (page)
"admin.users.store"            →  "store"    "admin.users"        (action)
"logistic.planning.destroy"    →  "destroy"  "logistic.planning"  (action)
"estoque"                      →  "access"   "estoque"            (page)
```

**Regra:** se o ultimo segmento e uma action conhecida (`index`, `show`, `store`, `update`, `destroy`), ele vira a action do CASL. Senao, action = `"access"`.

### Super-admin

Se o usuario tem role `super-admin`, a ability recebe `can('manage', 'all')` — isso faz bypass de TUDO. Nenhuma verificacao de permissao bloqueia o super-admin.

### AbilityProvider (`src/providers/AbilityProvider.tsx`)

- Le `roles` e `permissions` do `AuthProvider`
- Cria a CASL ability e expoe via context
- Enquanto `loading=true`, ability esta vazia (nada renderiza)

---

## 7. Controle no Sidebar

**Arquivo:** `src/components/app/SideNav.tsx`

### Configuracao do menu

```ts
const menuCategories = [
    {
        label: 'Estoque (Sucata)',
        icon: Package,
        subject: 'estoque',                              // subject da categoria
        items: [
            { href: '/estoque/dashboard-gerencial', label: '...', icon: ..., subject: 'estoque.dashboard-gerencial' },
            { href: '/estoque/curva-abc',           label: '...', icon: ..., subject: 'estoque.curva-abc' },
        ],
    },
    // ...
];
```

### Filtragem

```ts
const visibleCategories = menuCategories
    .map((cat) => ({
        ...cat,
        items: cat.items.filter((item) => ability.can('access', item.subject)),
    }))
    .filter((cat) => cat.items.length > 0);
```

- Cada **item** e filtrado pelo seu `subject`
- Se uma **categoria** fica sem itens visiveis, desaparece inteira
- O `subject` do item deve bater com o nome da permissao type=page no backend

### Para adicionar novo item no menu

1. Adicionar no array `menuCategories` com o `subject` correto
2. Criar a permissao correspondente no backend (type=page)
3. Atribuir a permissao ao role desejado

### User dropdown (rodape do sidebar)

No rodape do sidebar ha um bloco com avatar (inicial do nome), nome e email do usuario logado.
Ao clicar, abre um `DropdownMenu` com:

- **Tema claro / Tema escuro** — alterna o tema da aplicacao
- **Sair** — chama `logout()` do `AuthProvider`

Quando o sidebar esta colapsado, mostra apenas o avatar redondo.

O componente le `user` do `useAuth()` para exibir nome e email.

---

## 8. Controle em Botoes e Funcionalidades

### Componente `<Authorized>` (declarativo)

```tsx
import Authorized from '@/components/auth/Authorized';
import { PLANNING } from '@/app/features/logistic/planning/permissions';

// Botao so aparece se usuario tem permissao
<Authorized permission={PLANNING.create}>
    <Button>Nova programacao</Button>
</Authorized>

// Com fallback
<Authorized permission={PLANNING.edit} fallback={<span>Sem acesso</span>}>
    <Button>Editar</Button>
</Authorized>
```

### Hook `useAuthorized()` (imperativo)

```tsx
import { useAuthorized } from '@/hooks/useAuthorized';

function MyComponent() {
    const can = useAuthorized();

    if (can('logistic.planning.store')) {
        // logica condicional
    }
}
```

### Quando usar cada um

| Cenario | Usar |
|---------|------|
| Esconder/mostrar um botao ou secao | `<Authorized permission="...">` |
| Logica condicional em JS | `useAuthorized()` |
| Filtrar lista de tabs/items | `useAuthorized()` |

---

## 9. Protecao de Rotas por Permissao

### Problema

O sidebar esconde itens que o usuario nao pode ver, mas se ele digitar a URL diretamente no navegador, a pagina renderiza normalmente (com dados ou vazia/quebrada). Isso e uma falha de UX e seguranca visual.

### Solucao: `<ProtectedPage>`

**Arquivo:** `src/components/auth/ProtectedPage.tsx`

Componente client que envolve o conteudo de cada pagina e verifica a permissao antes de renderizar.

```tsx
import ProtectedPage from '@/components/auth/ProtectedPage';
import { ESTOQUE } from '@/app/features/estoque/permissions';

// Em qualquer page.tsx:
<AuthenticatedLayout>
    <ProtectedPage permission={ESTOQUE.dashboardGerencial}>
        <DashboardClient ... />
    </ProtectedPage>
</AuthenticatedLayout>
```

### Comportamento

O `ProtectedPage` **nunca redireciona**. Sempre renderiza inline dentro do layout.

| Cenario | O que acontece |
|---------|----------------|
| Usuario tem a permissao | Renderiza o conteudo normalmente |
| Usuario tem ALGUMAS permissoes mas nao esta | Toast "Voce nao tem permissao" + fallback "Pagina nao autorizada" com instrucao para usar o menu lateral |
| Usuario tem ZERO permissoes (e nao e super-admin) | Fallback "Acesso restrito" com instrucao para solicitar permissoes ao administrador |
| Auth ainda carregando | Renderiza nada (aguarda) |

### Fallback "Pagina nao autorizada"

Quando o usuario tem permissoes mas nao para esta pagina especifica. Mostra:

- Icone de alerta (triangulo)
- Titulo "Pagina nao autorizada"
- Mensagem: "Use o menu lateral para navegar as paginas disponiveis ou solicite acesso ao Administrador"

O sidebar mostra as paginas que o usuario PODE acessar — ele navega por ali.

### Fallback "Acesso restrito"

Quando o usuario tem zero permissoes. Mostra:

- Icone de escudo (ShieldX)
- Titulo "Acesso restrito"
- Mensagem: "Solicite as permissoes necessarias ao Administrador"

O sidebar fica vazio (nenhum item visivel) mas o dropdown do usuario com logout continua acessivel.

### Pagina `/sem-acesso`

**Arquivo:** `src/app/sem-acesso/page.tsx`

Rota dedicada para o redirect pos-login quando o usuario tem zero permissoes. Usa `AuthenticatedLayout` e renderiza o mesmo fallback de acesso restrito. O login redireciona diretamente para ca via `getFirstAccessibleRoute()` que retorna `null`.

### Redirect inteligente pos-login

**Arquivo:** `src/lib/navigation/routes.ts`

O `useLoginForm` nao redireciona para uma rota fixa. Apos login:

1. Chama `getMe()` para obter o usuario com permissoes
2. Chama `getFirstAccessibleRoute(me.user.permissions, me.user.roles)` que percorre a lista `APP_ROUTES`
3. Retorna o `href` da primeira rota cujo `subject` o usuario pode acessar
4. Se nenhuma rota acessivel → retorna `null` → redireciona para `/sem-acesso`

```ts
// src/lib/navigation/routes.ts
export const APP_ROUTES: { href: string; subject: string }[] = [
    { href: '/estoque/dashboard-gerencial', subject: 'estoque.dashboard-gerencial' },
    { href: '/estoque/curva-abc', subject: 'estoque.curva-abc' },
    // ... todas as rotas na ordem de prioridade
];

export function getFirstAccessibleRoute(permissions, roles): string | null { ... }
```

**Importante:** ao adicionar uma nova pagina, incluir na lista `APP_ROUTES` para que o redirect pos-login a considere.

### Todas as paginas protegidas

| Rota | Permissao |
|------|-----------|
| `/estoque/dashboard-gerencial` | `estoque.dashboard-gerencial` |
| `/estoque/curva-abc` | `estoque.curva-abc` |
| `/estoque/risco-ruptura` | `estoque.risco-ruptura` |
| `/estoque/visao-geral` | `estoque.visao-geral` |
| `/almoxarifado/dashboard-gerencial` | `almoxarifado.dashboard-gerencial` |
| `/manutencao/visao-geral` | `manutencao.visao-geral` |
| `/manutencao/equipamentos` | `manutencao.equipamentos` |
| `/manutencao/ordens-servico` | `manutencao.ordens-servico` |
| `/manutencao/veiculos` | `manutencao.veiculos` |
| `/manutencao/disponibilidade` | `manutencao.disponibilidade` |
| `/manutencao/vencimento-oleo` | `manutencao.vencimento-oleo` |
| `/manutencao/pecas` | `manutencao.pecas` |
| `/logistica/programacao-de-rotas` | `logistic.planning` |
| `/admin/usuarios` | `admin.users` |
| `/admin/perfis` | `admin.roles` |
| `/admin/permissoes` | `admin.permissions` |
| `/admin/logs-de-auditoria` | `admin.audit-logs` |

### Para cada nova pagina

Ao criar uma nova pagina, **sempre** envolver o conteudo com `<ProtectedPage>`:

```tsx
<AuthenticatedLayout>
    <ProtectedPage permission={FEATURE.page}>
        <MinhaFeatureClient />
    </ProtectedPage>
</AuthenticatedLayout>
```

---

## 10. Convencao de permissions.ts

Cada feature deve ter um arquivo `permissions.ts` que mapeia as strings do backend para constantes tipadas.

### Estrutura

```
src/app/features/
  logistic/
    planning/
      permissions.ts      ← constantes de permissao
      components/          ← componentes que usam <Authorized>
      hooks/
      types/
  admin/
    permissions.ts
    components/
  estoque/
    permissions.ts
  manutencao/
    permissions.ts
```

### Formato para features com API (backend gera automaticamente)

```ts
// src/app/features/logistic/planning/permissions.ts
export const PLANNING = {
    page:   'logistic.planning',           // page - visibilidade no menu
    list:   'logistic.planning.index',     // action
    view:   'logistic.planning.show',      // action
    create: 'logistic.planning.store',     // action
    edit:   'logistic.planning.update',    // action
    delete: 'logistic.planning.destroy',   // action
} as const;
```

### Formato para features sem API (banco externo, permissoes manuais)

```ts
// src/app/features/estoque/permissions.ts
export const ESTOQUE = {
    module:             'estoque',                    // page - categoria no sidebar
    dashboardGerencial: 'estoque.dashboard-gerencial', // page
    curvaAbc:           'estoque.curva-abc',           // page
} as const;
```

### Formato para features read-only (sem CRUD)

```ts
// Exemplo: audit logs — somente leitura, sem actions
auditLogsTab: 'admin.audit-logs',   // apenas page visibility
```

### Regra: os nomes DEVEM bater exatamente com o backend

Se o backend tem `admin.users.store`, o frontend deve ter exatamente `'admin.users.store'` no permissions.ts. Sem excecao.

---

## 11. Requisitos do Backend

Para este sistema funcionar, o backend Laravel precisa fornecer:

### Endpoints obrigatorios

| Metodo | Rota | Retorno |
|--------|------|---------|
| POST | `/api/auth/login` | `{ token: string }` |
| GET | `/api/auth/me` | `{ user: User }` |
| POST | `/api/auth/logout` | `204` |

### Formato do `User` retornado pelo backend

```json
{
    "user": {
        "id": 227,
        "name": "Admin",
        "email": "admin@superlam.com",
        "is_active": true,
        "last_login_at": "2026-03-19T02:23:50.000000Z",
        "roles": ["super-admin"],
        "permissions": ["admin.users", "admin.users.store", "estoque.dashboard-gerencial"],
        "created_at": "2026-03-19T02:18:28.000000Z",
        "updated_at": "2026-03-19T02:23:50.000000Z"
    }
}
```

**Importante:** `roles` e `permissions` vem **dentro** do objeto `user` como arrays de strings. O frontend extrai `data.user.roles` e `data.user.permissions`.

### Modelo de permissao

```json
{
    "id": 1,
    "name": "admin.users.store",
    "type": "action",
    "module": "admin",
    "guard_name": "web"
}
```

- `type`: `"page"` (visibilidade de tela) ou `"action"` (funcionalidade/botao)
- `module`: agrupamento logico

### O que o `/me` deve retornar em `user.permissions[]`

Todas as permissoes do usuario, incluindo:
- Permissoes diretas do usuario
- Permissoes herdadas dos roles do usuario
- Formato flat array de strings: `["admin.users", "admin.users.store", "estoque.dashboard-gerencial"]`

### Super-admin

O role `super-admin` e tratado de forma especial no frontend:
- CASL recebe `can('manage', 'all')` → bypass total
- `hasRole()` e `hasPermission()` retornam `true` para tudo
- Nao precisa ter permissoes atribuidas

---

## 12. Checklist para Boilerplate

### Arquivos para copiar (nucleo — nao mudam entre projetos)

```
src/lib/auth/token-storage.ts          # Cookie token management
src/lib/http/http-client.ts            # Fetch wrapper com Bearer token
src/lib/http/http-methods.ts           # get, post, put, patch, del
src/lib/http/types.ts                  # ApiError, tipos HTTP
src/lib/casl/ability.ts                # parsePermission, buildAbility
src/providers/AuthProvider.tsx          # Auth context (extrai user.roles e user.permissions)
src/providers/AbilityProvider.tsx       # CASL context
src/components/auth/Authorized.tsx      # Componente declarativo
src/components/auth/ProtectedPage.tsx  # Protecao de rota por permissao + fallbacks inline
src/hooks/useAuthorized.ts             # Hook imperativo
src/proxy.ts                      # Protecao de rotas server-side (Next.js 16 proxy)
src/lib/navigation/routes.ts           # APP_ROUTES + getFirstAccessibleRoute
src/app/sem-acesso/                    # Pagina de fallback para zero permissoes
src/app/features/auth/                 # API + tipos de auth + useLoginForm
```

### O que ajustar por projeto

| Arquivo | O que mudar |
|---------|-------------|
| `src/proxy.ts` | `PUBLIC_PATHS`, `AUTHENTICATED_REDIRECT` (Next.js 16: exporta `proxy()`) |
| `http-client.ts` | `API_URL` (env var `NEXT_PUBLIC_API_URL`) |
| `token-storage.ts` | `TOKEN_KEY` se quiser nome diferente, `Max-Age` |
| `auth.types.ts` | Campos de `User` se o backend retornar campos diferentes |
| `layout.tsx` | Verificar ordem dos providers |
| `SideNav.tsx` | Menu categories e items (especifico por projeto) |
| `routes.ts` | `APP_ROUTES` — lista de rotas para redirect pos-login |

### Para cada nova feature

1. Criar `permissions.ts` na pasta da feature com os nomes exatos do backend
2. Envolver a pagina com `<ProtectedPage permission={FEATURE.page}>` no `page.tsx`
3. Usar `<Authorized permission={FEATURE.action}>` nos botoes
4. Adicionar item no `SideNav.tsx` com `subject` correto
5. Adicionar a rota em `APP_ROUTES` (`src/lib/navigation/routes.ts`)
6. Criar permissao no backend (auto-gerar ou manual)
7. Atribuir permissao ao role desejado

### Dependencias npm

```json
{
    "@casl/ability": "^6.x",
    "@casl/react": "^4.x"
}
```

### Variaveis de ambiente

```
NEXT_PUBLIC_API_URL=http://localhost:8000   # URL do backend Laravel
```

---

## Fluxo Completo (Resumo Visual)

```
[Login] → POST /login → { token } → cookie
                                    ↓
[useLoginForm] → GET /me → { user: { roles, permissions } }
                                    ↓
[getFirstAccessibleRoute(user.permissions, user.roles)]
   → Se achou: window.location.href = '/pagina-acessivel'
   → Se nao achou (zero permissoes): window.location.href = '/sem-acesso'
                                    ↓
[proxy.ts] ← le cookie ← se nao tem token, redireciona para /login (Next.js 16 proxy)
                                    ↓
[AuthProvider] → GET /me → { user: { roles, permissions } }
   → setRoles(data.user.roles)
   → setPermissions(data.user.permissions)
                                    ↓
[AbilityProvider] → buildAbility(permissions, roles) → CASL Ability
                                    ↓
[ProtectedPage] → ability.can('access', subject)
   → Se OK: renderiza pagina
   → Se nao tem permissao: toast + fallback inline "Pagina nao autorizada"
   → Se zero permissoes: fallback inline "Acesso restrito"
   → NUNCA redireciona — sempre renderiza inline
                                    ↓
         ┌──────────────────────────┼──────────────────────────┐
         ↓                          ↓                          ↓
   [SideNav]                  [<Authorized>]            [useAuthorized()]
   ability.can('access',      ability.can(action,       can('perm.string')
   item.subject)              subject)                  → true/false
   → mostra/esconde menu      → mostra/esconde botao    → logica JS
```

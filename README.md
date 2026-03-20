# Next.js Auth Boilerplate

Boilerplate com autenticacao, permissoes (CASL), forgot/reset password, sidebar com controle de acesso, e layout responsivo.

## Stack

- Next.js 16.1.1 (App Router)
- React 19
- TypeScript
- Tailwind CSS 4
- CASL (permissoes)
- React Query
- shadcn/ui
- Sonner (toasts)

## Setup

```bash
# 1. Instalar dependencias
npm install

# 2. Copiar env
cp .env.example .env.local

# 3. Configurar NEXT_PUBLIC_API_URL no .env.local

# 4. Rodar
npm run dev
```

## O que vem pronto

- Login, logout, esqueci minha senha, redefinir senha
- Token em cookie (proxy.ts protege rotas server-side)
- HTTP client com Bearer automatico e redirect no 401
- CASL permissions (parsing automatico de strings do backend)
- `<ProtectedPage>`, `<Authorized>`, `useAuthorized()` para controle de acesso
- SideNav com menu filtrado por permissao
- Layout responsivo (sidebar desktop, drawer mobile)
- Dark mode
- Paginas de admin como placeholder

## O que configurar no seu projeto

Procure por `TODO` no codigo. Os principais pontos:

1. **`src/proxy.ts`** — `AUTHENTICATED_REDIRECT` (rota padrao apos login)
2. **`src/components/app/SideNav.tsx`** — `menuCategories` (itens do menu)
3. **`src/lib/navigation/routes.ts`** — `APP_ROUTES` (rotas para redirect pos-login)
4. **`.env.local`** — `NEXT_PUBLIC_API_URL`
5. **Logo** — Substituir o placeholder "B" nos forms de auth e SideNav
6. **Brand** — Trocar "Boilerplate" por nome do projeto no SideNav e AuthenticatedLayout

## Endpoints do Backend (obrigatorios)

| Metodo | Rota | Retorno |
|--------|------|---------|
| POST | `/api/auth/login` | `{ token }` |
| GET | `/api/auth/me` | `{ user: { id, name, email, roles[], permissions[] } }` |
| POST | `/api/auth/logout` | `204` |
| POST | `/api/auth/forgot-password` | `{ message }` |
| POST | `/api/auth/reset-password` | `{ message }` |

## Documentacao detalhada

Ver `docs/AUTH_AND_PERMISSIONS.md` para documentacao tecnica completa.

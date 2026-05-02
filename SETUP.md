# 🚀 Setup do Frontend - POC São José dos Pinhais

## ✅ Configuração já feita:

### 1. Variável de ambiente configurada

- ✅ Arquivo `.env` atualizado com `NEXT_PUBLIC_API_URL=http://localhost:3333/api`
- ✅ HTTP Client configurado para usar a variável de ambiente

### 2. Estrutura de URLs:

- **Backend Laravel:** `http://localhost:3333`
- **API Endpoint:** `http://localhost:3333/api`
- **Frontend Next.js:** `http://localhost:3000`

---

## 🔧 Como rodar:

### 1. **REINICIE o servidor Next.js**

**IMPORTANTE:** O Next.js só lê variáveis de ambiente no start!

```bash
# Pare o servidor atual (Ctrl+C)

# Inicie novamente
npm run dev
```

### 2. Verifique se o backend Laravel está rodando

```bash
# Em outro terminal, no diretório do backend:
php artisan serve --port=3333

# Deve mostrar:
# Starting Laravel development server: http://127.0.0.1:3333
```

### 3. Teste o login

Acesse: `http://localhost:3000/login`

**Credenciais de teste (conforme backend):**

- CPF: `12345678900` (sem pontos/traços)
- Senha: conforme configurado no seeder do backend

---

## 🔍 Verificação de configuração:

### Confirme que está usando a URL correta:

**No browser, abra o DevTools (F12) → Console e digite:**

```javascript
console.log(process.env.NEXT_PUBLIC_API_URL);
// Deve mostrar: http://localhost:3333/api
```

Se mostrar `undefined`, o Next.js não foi reiniciado após alterar o `.env`

---

## 📁 Arquivos de configuração:

### `.env` (raiz do projeto)

```bash
NEXT_PUBLIC_API_URL=http://localhost:3333/api
```

### `src/lib/http/http-client.ts`

```typescript
const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3333/api';
```

### `src/lib/http/api-config.ts`

```typescript
export const API_ENDPOINTS = {
	auth: {
		login: '/auth/login', // será: http://localhost:3333/api/auth/login
		me: '/auth/me',
		logout: '/auth/logout',
	},
	// ... outros endpoints
};
```

---

## ❌ Erros comuns:

### 1. `ERR_CONNECTION_REFUSED`

**Causa:** Backend Laravel não está rodando na porta 3333
**Solução:**

```bash
cd ../backend
php artisan serve --port=3333
```

### 2. `404 Not Found` nas rotas de API

**Causa:** Rotas não registradas no Laravel
**Solução:** Verifique `routes/api.php` no backend

### 3. `401 Unauthorized`

**Causa:** Token inválido ou expirado
**Solução:** Faça logout e login novamente

### 4. Variável de ambiente `undefined`

**Causa:** Next.js não foi reiniciado
**Solução:**

```bash
# Pare o servidor (Ctrl+C)
npm run dev
```

---

## 🎯 Próximos passos:

1. ✅ Backend rodando (`php artisan serve`)
2. ✅ Frontend rodando (`npm run dev`)
3. ✅ Testar login em `http://localhost:3000/login`
4. ✅ Verificar no DevTools → Network que as requisições estão indo para `http://localhost:8000/api`

---

## 📝 URLs importantes:

- **Frontend:** http://localhost:3000
- **Backend API:** http://localhost:3333/api
- **Login:** http://localhost:3000/login
- **Portal Fornecedor:** http://localhost:3000/portal-fornecedor
- **Demonstração Técnica:** http://localhost:3000/demonstracao-tecnica

---

Tudo configurado! 🚀

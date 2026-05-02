# 📋 Guia de Implementação POC - Frontend

## ✅ O que já está pronto:

### **Infraestrutura Base**

- ✅ Tipos TypeScript completos (enums + models)
- ✅ HTTP Client configurado para Laravel Sanctum
- ✅ Autenticação completa (login com CPF)
- ✅ Layout base (Sidebar + Header + AuthenticatedLayout)
- ✅ Componentes UI (Table, Select, Tabs, Textarea, StatusBadge, PageHeader, Loading, EmptyState)
- ✅ Formatadores (moeda, data, CPF, CNPJ)
- ✅ API de Fornecedor/Empenhos
- ✅ API de Solicitações
- ✅ Página de listagem de empenhos

---

## 🚀 Páginas que faltam implementar:

### **1. Listagem de Solicitações de Pagamento**

**Arquivo:** `src/app/portal-fornecedor/empenhos/[id]/solicitacoes/page.tsx`

```typescript
'use client'

import { useQuery } from '@tanstack/react-query'
import { useRouter, useParams } from 'next/navigation'
import { solicitacaoApi } from '@/app/features/solicitacao/api/solicitacao-api'
import { PageHeader } from '@/components/ui/page-header'
import { Card } from '@/components/ui/card'
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { StatusBadge } from '@/components/ui/status-badge'
import { Loading } from '@/components/ui/loading'
import { formatCurrency, formatDate } from '@/lib/formatters'
import { Plus } from 'lucide-react'

export default function SolicitacoesPage() {
  const router = useRouter()
  const params = useParams()
  const empenhoId = Number(params.id)

  const { data: solicitacoes, isLoading } = useQuery({
    queryKey: ['solicitacoes', empenhoId],
    queryFn: () => solicitacaoApi.getSolicitacoesByEmpenho(empenhoId),
  })

  if (isLoading) return <Loading />

  return (
    <div>
      <PageHeader
        title="Solicitações de Pagamento"
        description={`Empenho ${params.id}`}
        action={
          <Button onClick={() => router.push(`/portal-fornecedor/empenhos/${empenhoId}/solicitacoes/nova`)}>
            <Plus className="w-4 h-4 mr-2" />
            Nova Solicitação
          </Button>
        }
      />

      <Card>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Número</TableHead>
              <TableHead>Data</TableHead>
              <TableHead>Valor</TableHead>
              <TableHead>Documento Fiscal</TableHead>
              <TableHead>Situação</TableHead>
              <TableHead className="text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {solicitacoes?.map((sol) => (
              <TableRow key={sol.id}>
                <TableCell>{sol.numero}</TableCell>
                <TableCell>{formatDate(sol.created_at)}</TableCell>
                <TableCell>{formatCurrency(sol.valor)}</TableCell>
                <TableCell>{sol.documento_fiscal_numero}</TableCell>
                <TableCell>
                  <StatusBadge status={sol.status} />
                </TableCell>
                <TableCell className="text-right space-x-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => router.push(`/portal-fornecedor/solicitacoes/${sol.id}/anexos`)}
                  >
                    Anexos
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => router.push(`/portal-fornecedor/solicitacoes/${sol.id}/informacoes`)}
                  >
                    Informações
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>
    </div>
  )
}
```

---

### **2. Nova Solicitação de Pagamento**

**Arquivo:** `src/app/portal-fornecedor/empenhos/[id]/solicitacoes/nova/page.tsx`

**Estrutura:**

- Form com 3 seções:
    - **Dados da Solicitação:** valor, observação
    - **Documento Fiscal:** tipo, número, série, data emissão
    - **Forma Pagamento:** tipo (select), campos condicionais (banco, agência, conta)
- Usar Zod para validação
- Ao salvar: `await solicitacaoApi.createSolicitacao(empenhoId, data)` e redirect para anexos

---

### **3. Gestão de Anexos**

**Arquivo:** `src/app/portal-fornecedor/solicitacoes/[id]/anexos/page.tsx`

**API de Anexos** (`src/app/features/anexo/api/anexo-api.ts`):

```typescript
import { get, post, del } from '@/lib/http/http-methods';
import { API_ENDPOINTS } from '@/lib/http/api-config';
import type { AnexoSolicitacao } from '@/types/models';

export const anexoApi = {
	async getAnexos(solicitacaoId: number): Promise<AnexoSolicitacao[]> {
		return await get<AnexoSolicitacao[]>(API_ENDPOINTS.anexos.bySolicitacao(solicitacaoId));
	},

	async uploadAnexo(solicitacaoId: number, file: File, tipoAnexo: string): Promise<AnexoSolicitacao> {
		const formData = new FormData();
		formData.append('arquivo', file);
		formData.append('tipo_anexo', tipoAnexo);

		return await post<AnexoSolicitacao>(API_ENDPOINTS.anexos.upload(solicitacaoId), formData);
	},

	async aprovarAnexo(anexoId: number): Promise<void> {
		await post(API_ENDPOINTS.anexos.aprovar(anexoId), {});
	},

	async recusarAnexo(anexoId: number, motivo: string): Promise<void> {
		await post(API_ENDPOINTS.anexos.recusar(anexoId), { motivo });
	},

	async deleteAnexo(anexoId: number): Promise<void> {
		await del(API_ENDPOINTS.anexos.delete(anexoId));
	},
};
```

**Página:**

- Listar 5 tipos obrigatórios (TipoAnexo enum)
- Input file por linha
- Upload usando FormData
- Mostrar status com StatusBadge
- Botão "Enviar Todos para Aprovação"

---

### **4. Página de Informações da Solicitação**

**Arquivo:** `src/app/portal-fornecedor/solicitacoes/[id]/informacoes/page.tsx`

**Componentes necessários:**

- **Stepper horizontal** com 13 fases (criar componente `src/components/ui/stepper.tsx`)
- **Tabs** com abas:
    - Geral (dados da solicitação)
    - Trâmites (timeline com `tramites`)
    - Anexos (lista de anexos)
    - Forma de Pagamento

---

### **5. Modal de Cancelamento**

**Arquivo:** `src/app/portal-fornecedor/solicitacoes/[id]/cancelar/page.tsx`

- Dialog com textarea (motivo obrigatório)
- Chamar `solicitacaoApi.cancelarSolicitacao(id, motivo)`
- Toast de sucesso e redirect

---

### **6. Módulo de Suporte**

**API** (`src/app/features/chamado/api/chamado-api.ts`):

```typescript
import { get, post } from '@/lib/http/http-methods';
import { API_ENDPOINTS } from '@/lib/http/api-config';
import type { Chamado, MensagemChamado } from '@/types/models';

export interface CreateChamadoRequest {
	modulo: string;
	assunto: string;
	mensagem: string;
}

export const chamadoApi = {
	async getChamados(): Promise<Chamado[]> {
		return await get<Chamado[]>(API_ENDPOINTS.chamados.list);
	},

	async createChamado(data: CreateChamadoRequest): Promise<Chamado> {
		return await post<Chamado>(API_ENDPOINTS.chamados.create, data);
	},

	async getChamado(id: number): Promise<Chamado> {
		return await get<Chamado>(API_ENDPOINTS.chamados.show(id));
	},

	async responderChamado(id: number, mensagem: string): Promise<void> {
		await post(API_ENDPOINTS.chamados.responder(id), { mensagem });
	},

	async concluirChamado(id: number): Promise<void> {
		await post(API_ENDPOINTS.chamados.concluir(id), {});
	},
};
```

**Páginas:**

- `src/app/suporte/novo/page.tsx` - Form de novo chamado
- `src/app/suporte/page.tsx` - Lista de chamados
- `src/app/suporte/chamados/[id]/page.tsx` - Detalhe com timeline de mensagens

---

### **7. Prestação de Contas**

**Arquivo:** `src/app/prestacao-contas/page.tsx`

- Selects: Ano, Módulo, Mês
- Lista de checkboxes (5 arquivos)
- Botão Exportar
- Card de sucesso com link para download

---

### **8. Orçamentário**

**Páginas:**

- `src/app/orcamentario/leis-atos/page.tsx` - CRUD de leis/atos
- `src/app/orcamentario/alteracoes/page.tsx` - Lista de alterações orçamentárias
- `src/app/orcamentario/alteracoes/[id]/page.tsx` - Detalhe com dotações

---

### **9. Demonstração Técnica**

**Arquivo:** `src/app/demonstracao-tecnica/page.tsx`

```typescript
'use client'

import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { PageHeader } from '@/components/ui/page-header'

export default function DemonstracaoTecnicaPage() {
  return (
    <div>
      <PageHeader title="Demonstração Técnica" />

      <div className="grid gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Arquitetura Frontend</CardTitle>
          </CardHeader>
          <CardContent>
            <pre className="bg-gray-100 p-4 rounded text-xs overflow-x-auto">
{`src/
├── app/                  # Next.js 14 App Router
│   ├── features/         # Módulos organizados
│   │   ├── fornecedor/
│   │   ├── solicitacao/
│   │   ├── anexo/
│   │   └── chamado/
│   └── portal-fornecedor/
├── components/           # Componentes reutilizáveis
│   ├── ui/              # shadcn/ui components
│   └── layout/
├── lib/                  # Utilities
│   └── http/            # HTTP Client
├── types/               # TypeScript types
└── providers/           # Context providers`}
            </pre>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Stack Técnica</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <p>✅ Next.js 14 (App Router)</p>
            <p>✅ TypeScript</p>
            <p>✅ Tailwind CSS</p>
            <p>✅ shadcn/ui Design System</p>
            <p>✅ React Query (data fetching)</p>
            <p>✅ Laravel Sanctum (autenticação)</p>
            <p>✅ Zod (validação)</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Compatibilidade de Navegadores</CardTitle>
          </CardHeader>
          <CardContent>
            <p>✅ Chrome 90+</p>
            <p>✅ Firefox 88+</p>
            <p>✅ Safari 14+</p>
            <p>✅ Edge 90+</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Integração com Backend Laravel</CardTitle>
          </CardHeader>
          <CardContent>
            <p>✅ Bearer Token Authentication</p>
            <p>✅ Endpoints REST bem definidos</p>
            <p>✅ Upload de arquivos via FormData</p>
            <p>✅ Validações sincronizadas</p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
```

---

## 📦 **Padrão Visual Consistente**

### **Todas as páginas devem seguir:**

```typescript
<div>
  <PageHeader
    title="Título da Página"
    description="Descrição opcional"
    action={<Button>Ação</Button>}
  />

  {isLoading && <Loading />}

  {error && <ErrorAlert />}

  <Card>
    {/* Conteúdo da página */}
  </Card>
</div>
```

### **Componentes sempre reutilizáveis:**

- `<PageHeader>` para título de página
- `<StatusBadge status={...}>` para status
- `<Loading>` para estados de carregamento
- `<EmptyState>` quando não há dados
- `<Card>` para envolver conteúdo

---

## ⚙️ **Como rodar:**

```bash
# Instalar dependências (caso precise)
npm install

# Rodar dev server
npm run dev

# Backend deve estar rodando em:
# http://localhost:3333
```

---

## 🎯 **Prioridade de Implementação:**

1. ✅ **Login e Layout** (PRONTO)
2. ✅ **Listagem de Empenhos** (PRONTO)
3. 🔄 **Listagem de Solicitações**
4. 🔄 **Nova Solicitação**
5. 🔄 **Gestão de Anexos**
6. 🔄 **Informações da Solicitação**
7. 🔄 **Suporte (Novo Chamado + Lista)**
8. 🔄 **Prestação de Contas**
9. 🔄 **Orçamentário**
10. 🔄 **Demonstração Técnica**

---

## 🚨 **Dicas Importantes:**

- Use `useQuery` do React Query para GET
- Use `useMutation` do React Query para POST/PUT/DELETE
- Sempre mostre toast de sucesso/erro (usando `sonner`)
- Validar forms com Zod
- Formatar datas com `formatDate` e valores com `formatCurrency`
- Status sempre usar `<StatusBadge>`

---

Boa sorte na POC! 🚀

# ✅ Integração Completa - Fluxo de Anexos

## 📋 Estado Atual da Implementação

### ✅ FRONTEND - 100% IMPLEMENTADO

| Componente                            | Status                 | Arquivo                                     |
| ------------------------------------- | ---------------------- | ------------------------------------------- |
| Modal de Anexos (Responsável Técnico) | ✅ Implementado        | `AnexosModal.tsx`                           |
| Tela de Aprovação (Gestor)            | ✅ Implementado        | `/gestor/solicitacoes/[id]/anexos/page.tsx` |
| API Config                            | ✅ Configurado         | `api-config.ts`                             |
| Endpoints Frontend                    | ✅ Todos implementados | Ver abaixo                                  |

---

## 🔄 Fluxo Completo Implementado

### 1️⃣ RESPONSÁVEL TÉCNICO - ENVIO DE ANEXOS

**Componente:** `AnexosModal.tsx`

**Funcionalidades implementadas:**

✅ **Listar anexos da solicitação**

```typescript
// Endpoint chamado
GET / api / solicitacoes / { solicitacaoId } / anexos;

// Implementação (linha 46-65)
const carregarAnexos = async () => {
	const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/solicitacoes/${solicitacao.id}/anexos`, {
		headers: { Authorization: `Bearer ${token}` },
	});
	const data = await response.json();
	setSolicitacaoCompleta(data.solicitacao);
};
```

✅ **Upload de anexo individual**

```typescript
// Endpoint chamado
POST /api/solicitacoes/{solicitacaoId}/anexos/{anexoId}/upload
Content-Type: multipart/form-data

// Implementação (linha 69-102)
const handleUpload = async (anexoId: number, file: File) => {
  // Valida PDF e 10MB
  const formData = new FormData();
  formData.append('arquivo', file);

  const response = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/solicitacoes/${solicitacao.id}/anexos/${anexoId}/upload`,
    {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
      body: formData,
    }
  );
};
```

✅ **Remover anexo**

```typescript
// Endpoint chamado
DELETE / api / solicitacoes / { solicitacaoId } / anexos / { anexoId };

// Implementação (linha 105-126)
const handleRemover = async (anexoId: number) => {
	const response = await fetch(
		`${process.env.NEXT_PUBLIC_API_URL}/solicitacoes/${solicitacao.id}/anexos/${anexoId}`,
		{
			method: 'DELETE',
			headers: { Authorization: `Bearer ${token}` },
		}
	);
};
```

✅ **Enviar todos para aprovação** ⭐

```typescript
// Endpoint chamado (O MAIS IMPORTANTE!)
POST / api / solicitacoes / { solicitacaoId } / anexos / enviar - todos;

// Implementação (linha 129-183)
const handleEnviarTodos = async () => {
	const response = await fetch(
		`${process.env.NEXT_PUBLIC_API_URL}/solicitacoes/${solicitacao.id}/anexos/enviar-todos`,
		{
			method: 'POST',
			headers: { Authorization: `Bearer ${token}` },
		}
	);

	// Sucesso: fecha modal e atualiza lista
	toast.success('Anexos enviados para aprovação com sucesso!');
	onSuccess?.();
	onClose();
};
```

✅ **Visualizar anexo**

```typescript
// Endpoint chamado
GET / api / solicitacoes / { solicitacaoId } / anexos / { anexoId } / download;

// Implementação (linha 186-207)
const handleVisualizar = async (anexoId: number) => {
	const response = await fetch(
		`${process.env.NEXT_PUBLIC_API_URL}/solicitacoes/${solicitacao.id}/anexos/${anexoId}/download`,
		{ headers: { Authorization: `Bearer ${token}` } }
	);

	const blob = await response.blob();
	const url = window.URL.createObjectURL(blob);
	window.open(url, '_blank');
};
```

✅ **Lógica de exibição do botão "Enviar Todos"**

```typescript
// Implementação (linha 210)
const todosEnviados = solicitacaoCompleta?.anexos.every((a) => a.arquivo_path !== null) ?? false;

// Botão só aparece quando: todosEnviados === true
{todosEnviados && (
  <Button onClick={handleEnviarTodos}>
    Enviar Todos para Aprovação
  </Button>
)}
```

---

### 2️⃣ GESTOR - APROVAÇÃO DE ANEXOS

**Componente:** `/gestor/solicitacoes/[id]/anexos/page.tsx`

**Funcionalidades implementadas:**

✅ **Listar solicitações pendentes**

```typescript
// Endpoint chamado
GET / api / gestor / solicitacoes - pendentes;

// API: gestorApi.getSolicitacoesPendentes()
// Arquivo: gestor-api.ts linha 56-59

// Backend deve retornar apenas:
// - status: 'aguardando_aprovacao_anexos'
// - status: 'anexos_recusados'
```

✅ **Detalhes da solicitação com anexos**

```typescript
// Endpoint chamado
GET / api / gestor / solicitacoes / { id };

// API: gestorApi.getSolicitacaoDetalhes(id)
// Arquivo: gestor-api.ts linha 61-63
```

✅ **Aprovar anexo**

```typescript
// Endpoint chamado
POST / api / anexos / { anexoId } / aprovar;

// API: gestorApi.aprovarAnexo(anexoId)
// Arquivo: gestor-api.ts linha 65-67

// Componente: página linha 33-43
const { mutate: aprovar } = useMutation({
	mutationFn: (anexoId: number) => gestorApi.aprovarAnexo(anexoId),
	onSuccess: () => {
		toast.success('Anexo aprovado com sucesso!');
		// Recarrega dados
	},
});
```

✅ **Recusar anexo**

```typescript
// Endpoint chamado
POST / api / anexos / { anexoId } / recusar;
Body: {
	motivo: '...';
}

// API: gestorApi.recusarAnexo(anexoId, motivo)
// Arquivo: gestor-api.ts linha 69-71

// Componente: página linha 45-59
const { mutate: recusar } = useMutation({
	mutationFn: ({ anexoId, motivo }: { anexoId: number; motivo: string }) => gestorApi.recusarAnexo(anexoId, motivo),
	onSuccess: () => {
		toast.success('Anexo recusado com sucesso!');
		// Recarrega dados
	},
});
```

✅ **Alerta especial para Documento Fiscal**

```typescript
// Implementação: página linha 89-100
const documentoFiscalRecusado = anexos.find(
  (a) =>
    a.tipo_anexo_label.toLowerCase().includes('documento fiscal') &&
    a.status.toLowerCase() === 'recusado'
);

// Se encontrado, exibe alerta:
{documentoFiscalRecusado && (
  <Card className="bg-red-50 border-red-200">
    <AlertTriangle />
    Documento Fiscal recusado - Solicitação deve ser cancelada
  </Card>
)}
```

✅ **Aviso no modal ao recusar Documento Fiscal**

```typescript
// Implementação: página linha 254-268
const isDocumentoFiscal = (tipoAnexo: string) => {
  return tipoAnexo.toLowerCase().includes('documento fiscal');
};

// No modal:
{isDocumentoFiscal(tipoAnexoSelecionado) && (
  <div className="bg-orange-50 border-orange-200">
    ⚠️ Atenção: Ao recusar o Documento Fiscal,
    o Responsável Técnico deverá cancelar a solicitação
    e criar uma nova.
  </div>
)}
```

---

## 🎯 Checklist de Integração Backend

### Endpoints que o Backend DEVE implementar:

#### 1. Listar Anexos

```
GET /api/solicitacoes/{solicitacaoId}/anexos
```

✅ Frontend: Implementado
⏳ Backend: **Verificar se retorna `data.solicitacao.anexos`**

#### 2. Upload Individual

```
POST /api/solicitacoes/{solicitacaoId}/anexos/{anexoId}/upload
Content-Type: multipart/form-data
Body: { arquivo: File }
```

✅ Frontend: Implementado
⏳ Backend: **Implementar upload e retornar anexo atualizado**

#### 3. Remover Anexo

```
DELETE /api/solicitacoes/{solicitacaoId}/anexos/{anexoId}
```

✅ Frontend: Implementado
⏳ Backend: **Implementar remoção (exceto se aprovado)**

#### 4. Enviar Todos para Aprovação ⭐

```
POST /api/solicitacoes/{solicitacaoId}/anexos/enviar-todos
```

✅ Frontend: Implementado
⏳ Backend: **IMPLEMENTAR ESTA LÓGICA:**

```php
public function enviarTodos(Request $request, int $solicitacaoId)
{
    $solicitacao = SolicitacaoPagamento::findOrFail($solicitacaoId);

    // 1. Verificar se todos os 5 anexos têm arquivo
    $anexosPendentes = $solicitacao->anexos()
        ->whereNull('arquivo_path')
        ->get();

    if ($anexosPendentes->count() > 0) {
        return response()->json([
            'message' => 'Existem anexos pendentes de envio',
            'anexos_pendentes' => $anexosPendentes->pluck('tipo_anexo'),
        ], 400);
    }

    // 2. Mudar status de TODOS os anexos
    $solicitacao->anexos()->update([
        'status' => 'aguardando_aprovacao',
    ]);

    // 3. Mudar status da SOLICITAÇÃO (AQUI QUE APARECE PRO GESTOR!)
    $solicitacao->update([
        'status' => 'aguardando_aprovacao_anexos',
    ]);

    // 4. Notificar Gestor
    event(new SolicitacaoEnviadaParaAprovacao($solicitacao));

    return response()->json([
        'message' => 'Anexos enviados para aprovação com sucesso',
    ]);
}
```

#### 5. Visualizar/Download Anexo

```
GET /api/solicitacoes/{solicitacaoId}/anexos/{anexoId}/download
```

✅ Frontend: Implementado
⏳ Backend: **Retornar arquivo PDF binário**

#### 6. Listar Solicitações Pendentes (Gestor)

```
GET /api/gestor/solicitacoes-pendentes
```

✅ Frontend: Implementado
⏳ Backend: **Filtrar APENAS status:**

```php
->whereIn('status', [
    'aguardando_aprovacao_anexos',
    'anexos_recusados',
])
```

#### 7. Detalhes da Solicitação (Gestor)

```
GET /api/gestor/solicitacoes/{id}
```

✅ Frontend: Implementado
⏳ Backend: **Retornar solicitação + anexos completos**

#### 8. Aprovar Anexo

```
POST /api/anexos/{anexoId}/aprovar
```

✅ Frontend: Implementado
⏳ Backend: **IMPLEMENTAR ESTA LÓGICA:**

```php
public function aprovar(int $anexoId)
{
    $anexo = Anexo::findOrFail($anexoId);
    $solicitacao = $anexo->solicitacao;

    // 1. Atualizar anexo
    $anexo->update([
        'status' => 'aprovado',
        'avaliado_por' => auth()->id(),
        'avaliado_em' => now(),
    ]);

    // 2. Verificar se TODOS os anexos estão aprovados
    $todosAprovados = $solicitacao->anexos()
        ->where('status', '!=', 'aprovado')
        ->count() === 0;

    if ($todosAprovados) {
        // 3. Mudar status da solicitação
        $solicitacao->update([
            'status' => 'aguardando_autorizacao_gestor',
        ]);

        // 4. Notificar Responsável Técnico
        event(new TodosAnexosAprovados($solicitacao));
    }

    return response()->json([
        'message' => 'Anexo aprovado com sucesso',
        'anexo' => $anexo->fresh(),
    ]);
}
```

#### 9. Recusar Anexo

```
POST /api/anexos/{anexoId}/recusar
Body: { motivo: "..." }
```

✅ Frontend: Implementado
⏳ Backend: **IMPLEMENTAR ESTA LÓGICA:**

```php
public function recusar(Request $request, int $anexoId)
{
    $validated = $request->validate([
        'motivo' => 'required|string|min:10|max:500',
    ]);

    $anexo = Anexo::findOrFail($anexoId);
    $solicitacao = $anexo->solicitacao;

    // 1. Atualizar anexo
    $anexo->update([
        'status' => 'recusado',
        'motivo_recusa' => $validated['motivo'],
        'avaliado_por' => auth()->id(),
        'avaliado_em' => now(),
    ]);

    // 2. Mudar status da solicitação
    $solicitacao->update([
        'status' => 'anexos_recusados',
    ]);

    // 3. Notificar Responsável Técnico
    $isDocumentoFiscal = str_contains(
        strtolower($anexo->tipo_anexo_label),
        'documento fiscal'
    );

    event(new AnexoRecusado($solicitacao, $anexo, $isDocumentoFiscal));

    return response()->json([
        'message' => 'Anexo recusado com sucesso',
        'anexo' => $anexo->fresh(),
    ]);
}
```

---

## 🔄 Fluxo de Estados

```
PENDENTE
  ↓ (Responsável faz upload dos 5 anexos)
PENDENTE (ainda)
  ↓ (Clica em "Enviar Todos para Aprovação")
AGUARDANDO_APROVACAO_ANEXOS ← APARECE PARA O GESTOR
  ↓
  ├─→ (Gestor aprova TODOS) → AGUARDANDO_AUTORIZACAO_GESTOR
  └─→ (Gestor recusa ALGUM) → ANEXOS_RECUSADOS
       ↓ (Responsável corrige e reenvia)
     AGUARDANDO_APROVACAO_ANEXOS (volta)
```

---

## ✅ Resumo

**Frontend:** 100% implementado e pronto

**Backend:** Precisa implementar os 9 endpoints conforme especificado

**Pontos críticos:**

1. ⭐ Endpoint `enviar-todos` - Muda status para `aguardando_aprovacao_anexos`
2. ⭐ Endpoint `aprovar` - Verifica se todos foram aprovados
3. ⭐ Endpoint `recusar` - Muda status para `anexos_recusados`
4. ⭐ Lista do gestor - Filtra apenas status corretos

**Documentos de referência:**

- `FLUXO_APROVACAO_ANEXOS.md` - Fluxo completo com exemplos
- `MAPA_API_ANEXOS_SOLICITACAO.md` - Especificação de todos os endpoints
- Este documento - Checklist de integração

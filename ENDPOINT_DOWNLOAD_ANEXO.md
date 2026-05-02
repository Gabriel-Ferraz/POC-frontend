# 🔧 URGENTE - Endpoint de Download de Anexo

## ❌ Erro Atual

```
GET http://localhost:3333/api/solicitacoes/{solicitacaoId}/anexos/{anexoId}/download
404 (Not Found)
```

**O backend NÃO tem este endpoint implementado!**

---

## ✅ Implementação Necessária

### Endpoint

```
GET /api/solicitacoes/{solicitacaoId}/anexos/{anexoId}/download
```

### Headers

```
Authorization: Bearer {token}
```

### Response

- Retorna o arquivo PDF binário
- Header: `Content-Type: application/pdf`
- Header: `Content-Disposition: inline; filename="arquivo.pdf"` (para abrir no browser)

---

## 📝 Código Laravel

### 1. Adicionar a rota (routes/api.php)

```php
Route::middleware('auth:sanctum')->group(function () {
    // ... outras rotas

    Route::get('/solicitacoes/{solicitacaoId}/anexos/{anexoId}/download',
        [AnexoController::class, 'download']
    );
});
```

### 2. Implementar o método no Controller

```php
<?php

namespace App\Http\Controllers;

use App\Models\Anexo;
use App\Models\SolicitacaoPagamento;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class AnexoController extends Controller
{
    public function download(Request $request, int $solicitacaoId, int $anexoId)
    {
        // 1. Buscar a solicitação
        $solicitacao = SolicitacaoPagamento::findOrFail($solicitacaoId);

        // 2. Buscar o anexo
        $anexo = $solicitacao->anexos()->findOrFail($anexoId);

        // 3. Verificar permissão (opcional, mas recomendado)
        $user = auth()->user();

        // Permitir se:
        // - É o responsável técnico da solicitação
        // - É gestor de contrato
        // - É operador PMSJP
        $canView = false;

        if ($user->perfil === 'responsavel_tecnico') {
            // Verificar se é o dono da solicitação
            $canView = $solicitacao->fornecedor_id === $user->fornecedor_id;
        } elseif (in_array($user->perfil, ['gestor_contrato', 'operador_pmsjp', 'operador_orcamentario'])) {
            $canView = true;
        }

        if (!$canView) {
            abort(403, 'Você não tem permissão para visualizar este anexo');
        }

        // 4. Verificar se o arquivo existe
        if (!$anexo->arquivo_path) {
            abort(404, 'Anexo não encontrado');
        }

        // 5. Verificar se o arquivo existe no storage
        if (!Storage::disk('public')->exists($anexo->arquivo_path)) {
            abort(404, 'Arquivo não encontrado no servidor');
        }

        // 6. Retornar o arquivo
        $filePath = Storage::disk('public')->path($anexo->arquivo_path);
        $fileName = $anexo->arquivo_nome ?? 'anexo.pdf';

        return response()->file($filePath, [
            'Content-Type' => 'application/pdf',
            'Content-Disposition' => 'inline; filename="' . $fileName . '"',
        ]);
    }
}
```

---

## 🎯 Alternativa: Endpoint Simplificado

Se preferir um endpoint mais simples sem o `solicitacaoId`:

### Rota

```php
Route::get('/anexos/{anexoId}/download', [AnexoController::class, 'download']);
```

### Controller

```php
public function download(Request $request, int $anexoId)
{
    $anexo = Anexo::with('solicitacao')->findOrFail($anexoId);

    // Verificar permissão
    $user = auth()->user();
    $canView = false;

    if ($user->perfil === 'responsavel_tecnico') {
        $canView = $anexo->solicitacao->fornecedor_id === $user->fornecedor_id;
    } elseif (in_array($user->perfil, ['gestor_contrato', 'operador_pmsjp', 'operador_orcamentario'])) {
        $canView = true;
    }

    if (!$canView) {
        abort(403, 'Você não tem permissão para visualizar este anexo');
    }

    if (!$anexo->arquivo_path) {
        abort(404, 'Anexo não encontrado');
    }

    if (!Storage::disk('public')->exists($anexo->arquivo_path)) {
        abort(404, 'Arquivo não encontrado no servidor');
    }

    $filePath = Storage::disk('public')->path($anexo->arquivo_path);
    $fileName = $anexo->arquivo_nome ?? 'anexo.pdf';

    return response()->file($filePath, [
        'Content-Type' => 'application/pdf',
        'Content-Disposition' => 'inline; filename="' . $fileName . '"',
    ]);
}
```

**Se usar este endpoint simplificado, precisa ajustar o frontend:**

```typescript
// Em ambos os lugares (gestor e responsável técnico)
const response = await fetch(
	`${process.env.NEXT_PUBLIC_API_URL}/anexos/${anexoId}/download`
	// ...
);
```

---

## 🧪 Testando

### Teste 1: Via CURL

```bash
curl -H "Authorization: Bearer SEU_TOKEN_AQUI" \
     http://localhost:3333/api/solicitacoes/4/anexos/15/download \
     --output teste.pdf
```

### Teste 2: Via Browser

1. Obter token do localStorage
2. Acessar: `http://localhost:3333/api/solicitacoes/4/anexos/15/download?token=SEU_TOKEN`

### Teste 3: Verificar se arquivo existe

```bash
# No servidor
ls -la storage/app/public/anexos/
```

---

## ⚠️ Checklist de Implementação

- [ ] Rota criada em `routes/api.php`
- [ ] Método `download` criado no `AnexoController`
- [ ] Verificação de permissão implementada
- [ ] Verificação de existência do arquivo
- [ ] Headers corretos (`Content-Type`, `Content-Disposition`)
- [ ] Testado com CURL
- [ ] Testado no browser

---

## 🚨 Problemas Comuns

### Erro 404

- Rota não foi adicionada
- Rota está em lugar errado (fora do `auth:sanctum`)
- Nome do método errado no controller

### Erro 403

- Permissão não configurada corretamente
- Usuário não tem perfil correto

### Erro 500

- Arquivo não existe no disco
- Caminho do storage incorreto
- Permissões de arquivo no servidor

### Arquivo não abre

- Header `Content-Type` errado
- Arquivo corrompido
- Arquivo não é PDF

---

## 📊 Estrutura do Banco

Certifique-se que a tabela `anexos` tem estas colunas:

```sql
CREATE TABLE anexos (
    id BIGINT PRIMARY KEY,
    solicitacao_pagamento_id BIGINT,
    tipo_anexo VARCHAR(255),
    arquivo_path VARCHAR(255), -- Ex: anexos/abc123.pdf
    arquivo_nome VARCHAR(255), -- Ex: nota_fiscal.pdf
    -- ...
);
```

E que os arquivos estão salvos em:

```
storage/app/public/anexos/abc123.pdf
```

---

## ✅ Implementação Rápida (5 minutos)

1. **Abrir** `routes/api.php`
2. **Adicionar** a rota dentro do `auth:sanctum`
3. **Criar/Editar** `AnexoController.php`
4. **Colar** o código do método `download`
5. **Testar** com CURL ou Postman

**Pronto!** O frontend já está implementado e vai funcionar assim que o endpoint estiver disponível.

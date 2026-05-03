# 🔄 GUIA: Sistema Completo de Status de Solicitações

## 🎯 OBJETIVO

Implementar sistema completo de status para solicitações de pagamento, permitindo movimentação manual pelo painel admin e refletindo automaticamente no fluxo normal.

---

## 📊 LISTA COMPLETA DE STATUS

### Status do Fluxo (em ordem)

1. **`rascunho`** - Solicitação criada, ainda não enviada
2. **`aguardando_aprovacao`** - Anexos enviados, aguardando análise
3. **`anexos`** - Em análise de documentos/anexos
4. **`fiscal`** - Em análise fiscal
5. **`gestor`** - Aguardando aprovação do gestor
6. **`liquidacao`** - Em processo de liquidação
7. **`secretario`** - Aguardando aprovação do secretário
8. **`iss`** - Verificação de impostos (ISS)
9. **`ordem_pagamento`** - Ordem de pagamento gerada
10. **`autorizacao`** - Pagamento autorizado
11. **`bordero`** - Borderô criado
12. **`remessa`** - Enviado para pagamento (remessa bancária)
13. **`pagamento`** - Em processo de pagamento
14. **`pagamento_realizado`** - Pagamento concluído
15. **`cancelado`** - Solicitação cancelada

---

## 🗄️ ESTRUTURA DO BANCO DE DADOS

### Tabela: `solicitacoes_pagamento`

```sql
ALTER TABLE solicitacoes_pagamento
MODIFY COLUMN status ENUM(
    'rascunho',
    'aguardando_aprovacao',
    'anexos',
    'fiscal',
    'gestor',
    'liquidacao',
    'secretario',
    'iss',
    'ordem_pagamento',
    'autorizacao',
    'bordero',
    'remessa',
    'pagamento',
    'pagamento_realizado',
    'cancelado'
) NOT NULL DEFAULT 'rascunho';
```

### Tabela: `tramites` (já existe)

Não precisa alterar - já registra todas as mudanças de status.

---

## 📡 ENDPOINT: Atualizar Status de Solicitação

**POST** `/api/admin/solicitacoes/{id}/status`

### Headers

```
Authorization: Bearer {token}
Content-Type: application/json
```

### Request Body

```json
{
	"status": "fiscal",
	"motivo": "Movido manualmente pelo administrador para análise fiscal"
}
```

### Validação

```php
$validated = $request->validate([
    'status' => [
        'required',
        'in:rascunho,aguardando_aprovacao,anexos,fiscal,gestor,liquidacao,secretario,iss,ordem_pagamento,autorizacao,bordero,remessa,pagamento,pagamento_realizado,cancelado'
    ],
    'motivo' => 'nullable|string|max:500'
]);
```

---

## 💻 IMPLEMENTAÇÃO

### Controller: `AdminController.php`

```php
<?php

namespace App\Http\Controllers;

use App\Models\SolicitacaoPagamento;
use App\Models\Tramite;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;

class AdminController extends Controller
{
    /**
     * Middleware de autenticação e autorização
     */
    public function __construct()
    {
        $this->middleware('auth:sanctum');
        $this->middleware(function ($request, $next) {
            $user = Auth::user();

            // Apenas gestor_suporte pode acessar
            if ($user->perfil !== 'gestor_suporte') {
                return response()->json([
                    'message' => 'Acesso negado. Apenas Gestor de Suporte pode acessar esta área.'
                ], 403);
            }

            return $next($request);
        });
    }

    /**
     * Atualizar status de solicitação manualmente
     */
    public function atualizarStatusSolicitacao(Request $request, $id)
    {
        $validated = $request->validate([
            'status' => [
                'required',
                'in:rascunho,aguardando_aprovacao,anexos,fiscal,gestor,liquidacao,secretario,iss,ordem_pagamento,autorizacao,bordero,remessa,pagamento,pagamento_realizado,cancelado'
            ],
            'motivo' => 'nullable|string|max:500'
        ]);

        DB::beginTransaction();

        try {
            $solicitacao = SolicitacaoPagamento::findOrFail($id);
            $statusAnterior = $solicitacao->status;
            $user = Auth::user();

            // Validar se pode alterar status
            if ($statusAnterior === 'pagamento_realizado') {
                return response()->json([
                    'message' => 'Não é possível alterar status de solicitação já paga'
                ], 422);
            }

            if ($statusAnterior === 'cancelado' && $validated['status'] !== 'rascunho') {
                return response()->json([
                    'message' => 'Solicitação cancelada só pode voltar para rascunho'
                ], 422);
            }

            // Atualizar status
            $solicitacao->update([
                'status' => $validated['status']
            ]);

            // Registrar no trâmite
            $observacao = $validated['motivo']
                ? $validated['motivo']
                : "Alteração manual pelo administrador ({$user->name})";

            Tramite::create([
                'solicitacao_id' => $solicitacao->id,
                'usuario_id' => $user->id,
                'fase' => $this->getStatusLabel($validated['status']),
                'observacao' => $observacao,
                'status_anterior' => $statusAnterior,
                'status_novo' => $validated['status']
            ]);

            DB::commit();

            return response()->json([
                'message' => 'Status atualizado com sucesso',
                'solicitacao' => [
                    'id' => $solicitacao->id,
                    'numero' => $solicitacao->numero,
                    'status_anterior' => $statusAnterior,
                    'status_atual' => $solicitacao->status,
                    'atualizado_em' => now()->format('d/m/Y H:i:s')
                ]
            ]);

        } catch (\Exception $e) {
            DB::rollBack();

            return response()->json([
                'message' => 'Erro ao atualizar status',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Retornar label do status
     */
    private function getStatusLabel($status)
    {
        $labels = [
            'rascunho' => 'Rascunho',
            'aguardando_aprovacao' => 'Aguardando Aprovação',
            'anexos' => 'Análise de Anexos',
            'fiscal' => 'Análise Fiscal',
            'gestor' => 'Aprovação do Gestor',
            'liquidacao' => 'Liquidação',
            'secretario' => 'Aprovação do Secretário',
            'iss' => 'Verificação ISS',
            'ordem_pagamento' => 'Ordem de Pagamento',
            'autorizacao' => 'Autorização',
            'bordero' => 'Borderô',
            'remessa' => 'Remessa Bancária',
            'pagamento' => 'Em Pagamento',
            'pagamento_realizado' => 'Pagamento Realizado',
            'cancelado' => 'Cancelado'
        ];

        return $labels[$status] ?? $status;
    }
}
```

---

## 🗺️ ROTAS

Adicionar em `routes/api.php`:

```php
Route::middleware('auth:sanctum')->prefix('admin')->group(function () {
    // ... outras rotas admin

    // Atualizar status de solicitação
    Route::post('/solicitacoes/{id}/status', [AdminController::class, 'atualizarStatusSolicitacao']);
});
```

---

## 📊 MIGRATION: Atualizar ENUM de Status

**Criar nova migration:**

```bash
php artisan make:migration update_solicitacoes_status_enum
```

**Conteúdo:**

```php
<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up()
    {
        // Mudar ENUM para TEXT temporariamente
        DB::statement("ALTER TABLE solicitacoes_pagamento MODIFY COLUMN status TEXT");

        // Atualizar para o novo ENUM
        DB::statement("
            ALTER TABLE solicitacoes_pagamento
            MODIFY COLUMN status ENUM(
                'rascunho',
                'aguardando_aprovacao',
                'anexos',
                'fiscal',
                'gestor',
                'liquidacao',
                'secretario',
                'iss',
                'ordem_pagamento',
                'autorizacao',
                'bordero',
                'remessa',
                'pagamento',
                'pagamento_realizado',
                'cancelado'
            ) NOT NULL DEFAULT 'rascunho'
        ");
    }

    public function down()
    {
        // Voltar para ENUM antigo
        DB::statement("
            ALTER TABLE solicitacoes_pagamento
            MODIFY COLUMN status ENUM(
                'rascunho',
                'aguardando_aprovacao',
                'em_analise',
                'aprovado',
                'em_pagamento',
                'pago',
                'cancelado',
                'recusado'
            ) NOT NULL DEFAULT 'rascunho'
        ");
    }
};
```

**Executar:**

```bash
php artisan migrate
```

---

## 📝 ATUALIZAR MODEL: Tramite.php

Adicionar campos novos na tabela tramites (se necessário):

```php
<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Tramite extends Model
{
    protected $fillable = [
        'solicitacao_id',
        'usuario_id',
        'fase',
        'observacao',
        'status_anterior',  // ⭐ NOVO
        'status_novo'       // ⭐ NOVO
    ];

    public function solicitacao()
    {
        return $this->belongsTo(SolicitacaoPagamento::class, 'solicitacao_id');
    }

    public function usuario()
    {
        return $this->belongsTo(User::class, 'usuario_id');
    }
}
```

**Migration para adicionar colunas (se não existirem):**

```php
Schema::table('tramites', function (Blueprint $table) {
    $table->string('status_anterior')->nullable()->after('observacao');
    $table->string('status_novo')->nullable()->after('status_anterior');
});
```

---

## 🧪 TESTES

### 1. Buscar Solicitação (endpoint já existente)

```bash
curl http://localhost:3333/api/solicitacoes/1 \
  -H "Authorization: Bearer {token}"
```

**Response:**

```json
{
  "solicitacao": {
    "id": 1,
    "numero": "SP-2023-000125",
    "valor": 15000.00,
    "status": "aguardando_aprovacao",
    ...
  }
}
```

### 2. Atualizar Status

```bash
curl -X POST http://localhost:3333/api/admin/solicitacoes/1/status \
  -H "Authorization: Bearer {token}" \
  -H "Content-Type: application/json" \
  -d '{
    "status": "fiscal",
    "motivo": "Movido para análise fiscal manualmente"
  }'
```

**Response (200 OK):**

```json
{
	"message": "Status atualizado com sucesso",
	"solicitacao": {
		"id": 1,
		"numero": "SP-2023-000125",
		"status_anterior": "aguardando_aprovacao",
		"status_atual": "fiscal",
		"atualizado_em": "03/05/2026 10:30:15"
	}
}
```

### 3. Verificar Trâmite

```bash
curl http://localhost:3333/api/solicitacoes/1/tramites \
  -H "Authorization: Bearer {token}"
```

**Deve mostrar o novo trâmite registrado.**

---

## 🎨 MAPEAMENTO DE CORES (Frontend)

Para exibir na timeline com cores:

```typescript
const statusColors = {
	rascunho: 'gray',
	aguardando_aprovacao: 'yellow',
	anexos: 'blue',
	fiscal: 'indigo',
	gestor: 'purple',
	liquidacao: 'pink',
	secretario: 'violet',
	iss: 'cyan',
	ordem_pagamento: 'teal',
	autorizacao: 'emerald',
	bordero: 'lime',
	remessa: 'amber',
	pagamento: 'orange',
	pagamento_realizado: 'green',
	cancelado: 'red',
};
```

---

## ✅ CHECKLIST DE IMPLEMENTAÇÃO

- [ ] Criar migration para atualizar ENUM de status
- [ ] Executar `php artisan migrate`
- [ ] Adicionar colunas `status_anterior` e `status_novo` na tabela tramites (se necessário)
- [ ] Implementar método `atualizarStatusSolicitacao()` no AdminController
- [ ] Adicionar método auxiliar `getStatusLabel()`
- [ ] Adicionar rota em `routes/api.php`
- [ ] Testar buscar solicitação existente
- [ ] Testar atualizar status de rascunho → fiscal
- [ ] Testar atualizar status de fiscal → gestor
- [ ] Verificar se trâmite foi registrado
- [ ] Testar com usuário sem permissão (deve retornar 403)
- [ ] Testar status inválido (deve retornar 422)
- [ ] Verificar se status é refletido na listagem de solicitações

---

## 🔄 FLUXO COMPLETO

1. **Frontend** → Usuário admin busca solicitação pelo ID
2. **Backend** → Retorna dados da solicitação com status atual
3. **Frontend** → Exibe status atual e permite selecionar novo status
4. **Frontend** → Envia POST para `/admin/solicitacoes/{id}/status`
5. **Backend** → Valida permissões e status
6. **Backend** → Atualiza status na tabela
7. **Backend** → Registra mudança na tabela tramites
8. **Backend** → Retorna sucesso
9. **Frontend** → Exibe mensagem de sucesso
10. **Sistema** → Status atualizado reflete em todas as telas

---

## 🎯 RESUMO

✅ **15 status implementados**  
✅ **Movimentação manual via painel admin**  
✅ **Registro automático de trâmites**  
✅ **Validações de segurança**  
✅ **Reflete automaticamente em todas as telas**  
✅ **Histórico completo de mudanças**

---

**🎉 Sistema completo de status de solicitações implementado!**

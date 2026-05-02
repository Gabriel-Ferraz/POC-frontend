# 🛠️ GUIA: Painel Administrativo - Backend

## 🎯 OBJETIVO

Criar endpoints administrativos para alimentar dados do sistema:

1. **Criar usuários** de qualquer perfil
2. **Criar fornecedores** com responsável técnico
3. **Criar empenhos** vinculados a fornecedores
4. **Atualizar status de solicitações** manualmente

---

## 🔐 AUTENTICAÇÃO E PERMISSÃO

**IMPORTANTE:** Todos os endpoints devem ser protegidos e acessíveis apenas por:

- Gestores de Suporte (`gestor_suporte`)
- Operadores PMSJP (`operador_pmsjp`)

```php
// Middleware de verificação
public function __construct()
{
    $this->middleware('auth:sanctum');
    $this->middleware(function ($request, $next) {
        $user = Auth::user();
        $perfisPermitidos = ['gestor_suporte', 'operador_pmsjp'];

        if (!in_array($user->perfil, $perfisPermitidos)) {
            return response()->json([
                'message' => 'Acesso negado. Apenas administradores podem acessar esta área.'
            ], 403);
        }

        return $next($request);
    });
}
```

---

## 📡 ENDPOINTS

### 1. Criar Usuário

**POST** `/api/admin/usuarios`

#### Request Body

```json
{
	"name": "João Silva",
	"email": "joao@example.com",
	"cpf": "123.456.789-00",
	"password": "senha123",
	"perfil": "responsavel_tecnico",
	"fornecedor_id": 1 // opcional, apenas se perfil = responsavel_tecnico
}
```

#### Validação

```php
$validated = $request->validate([
    'name' => 'required|string|max:255',
    'email' => 'required|email|unique:users,email',
    'cpf' => 'required|string|unique:users,cpf',
    'password' => 'required|string|min:6',
    'perfil' => 'required|in:responsavel_tecnico,gestor_contrato,gestor_suporte,operador_pmsjp,operador_orcamentario',
    'fornecedor_id' => 'required_if:perfil,responsavel_tecnico|nullable|exists:fornecedores,id'
]);
```

#### Implementação

```php
public function criarUsuario(Request $request)
{
    $validated = $request->validate([
        'name' => 'required|string|max:255',
        'email' => 'required|email|unique:users,email',
        'cpf' => 'required|string|unique:users,cpf',
        'password' => 'required|string|min:6',
        'perfil' => 'required|in:responsavel_tecnico,gestor_contrato,gestor_suporte,operador_pmsjp,operador_orcamentario',
        'fornecedor_id' => 'required_if:perfil,responsavel_tecnico|nullable|exists:fornecedores,id'
    ]);

    $user = User::create([
        'name' => $validated['name'],
        'email' => $validated['email'],
        'cpf' => $validated['cpf'],
        'password' => Hash::make($validated['password']),
        'perfil' => $validated['perfil'],
        'fornecedor_id' => $validated['fornecedor_id'] ?? null
    ]);

    return response()->json([
        'message' => 'Usuário criado com sucesso',
        'usuario' => [
            'id' => $user->id,
            'name' => $user->name,
            'email' => $user->email,
            'cpf' => $user->cpf,
            'perfil' => $user->perfil,
            'fornecedor_id' => $user->fornecedor_id
        ]
    ], 201);
}
```

#### Response (201 Created)

```json
{
	"message": "Usuário criado com sucesso",
	"usuario": {
		"id": 5,
		"name": "João Silva",
		"email": "joao@example.com",
		"cpf": "123.456.789-00",
		"perfil": "responsavel_tecnico",
		"fornecedor_id": 1
	}
}
```

---

### 2. Criar Fornecedor + Responsável Técnico

**POST** `/api/admin/fornecedores`

#### Request Body

```json
{
	"nome": "Empresa XYZ Ltda",
	"cnpj": "12.345.678/0001-90",
	"responsavel_tecnico_nome": "Maria Santos",
	"responsavel_tecnico_email": "maria@xyz.com",
	"responsavel_tecnico_cpf": "987.654.321-00",
	"responsavel_tecnico_password": "senha123"
}
```

#### Validação

```php
$validated = $request->validate([
    'nome' => 'required|string|max:255',
    'cnpj' => 'required|string|unique:fornecedores,cnpj',
    'responsavel_tecnico_nome' => 'required|string|max:255',
    'responsavel_tecnico_email' => 'required|email|unique:users,email',
    'responsavel_tecnico_cpf' => 'required|string|unique:users,cpf',
    'responsavel_tecnico_password' => 'required|string|min:6'
]);
```

#### Implementação

```php
public function criarFornecedor(Request $request)
{
    $validated = $request->validate([
        'nome' => 'required|string|max:255',
        'cnpj' => 'required|string|unique:fornecedores,cnpj',
        'responsavel_tecnico_nome' => 'required|string|max:255',
        'responsavel_tecnico_email' => 'required|email|unique:users,email',
        'responsavel_tecnico_cpf' => 'required|string|unique:users,cpf',
        'responsavel_tecnico_password' => 'required|string|min:6'
    ]);

    DB::beginTransaction();

    try {
        // 1. Criar fornecedor
        $fornecedor = Fornecedor::create([
            'nome' => $validated['nome'],
            'cnpj' => $validated['cnpj']
        ]);

        // 2. Criar responsável técnico
        $responsavelTecnico = User::create([
            'name' => $validated['responsavel_tecnico_nome'],
            'email' => $validated['responsavel_tecnico_email'],
            'cpf' => $validated['responsavel_tecnico_cpf'],
            'password' => Hash::make($validated['responsavel_tecnico_password']),
            'perfil' => 'responsavel_tecnico',
            'fornecedor_id' => $fornecedor->id
        ]);

        // 3. Atualizar fornecedor com o ID do responsável
        $fornecedor->update([
            'responsavel_tecnico_id' => $responsavelTecnico->id
        ]);

        DB::commit();

        return response()->json([
            'message' => 'Fornecedor e Responsável Técnico criados com sucesso',
            'fornecedor' => [
                'id' => $fornecedor->id,
                'nome' => $fornecedor->nome,
                'cnpj' => $fornecedor->cnpj,
                'responsavel_tecnico' => [
                    'id' => $responsavelTecnico->id,
                    'name' => $responsavelTecnico->name,
                    'email' => $responsavelTecnico->email
                ]
            ]
        ], 201);
    } catch (\Exception $e) {
        DB::rollBack();
        return response()->json([
            'message' => 'Erro ao criar fornecedor',
            'error' => $e->getMessage()
        ], 500);
    }
}
```

#### Response (201 Created)

```json
{
	"message": "Fornecedor e Responsável Técnico criados com sucesso",
	"fornecedor": {
		"id": 2,
		"nome": "Empresa XYZ Ltda",
		"cnpj": "12.345.678/0001-90",
		"responsavel_tecnico": {
			"id": 6,
			"name": "Maria Santos",
			"email": "maria@xyz.com"
		}
	}
}
```

---

### 3. Criar Empenho

**POST** `/api/admin/empenhos`

#### Request Body

```json
{
	"numero": "2026/0001",
	"fornecedor_id": 1,
	"valor": 50000.0,
	"saldo": 50000.0,
	"data_emissao": "2026-01-15",
	"status": "ativo"
}
```

#### Validação

```php
$validated = $request->validate([
    'numero' => 'required|string|unique:empenhos,numero',
    'fornecedor_id' => 'required|exists:fornecedores,id',
    'valor' => 'required|numeric|min:0',
    'saldo' => 'required|numeric|min:0',
    'data_emissao' => 'required|date',
    'status' => 'required|in:ativo,bloqueado,encerrado'
]);
```

#### Implementação

```php
public function criarEmpenho(Request $request)
{
    $validated = $request->validate([
        'numero' => 'required|string|unique:empenhos,numero',
        'fornecedor_id' => 'required|exists:fornecedores,id',
        'valor' => 'required|numeric|min:0',
        'saldo' => 'required|numeric|min:0',
        'data_emissao' => 'required|date',
        'status' => 'required|in:ativo,bloqueado,encerrado'
    ]);

    // Validar que saldo não excede valor
    if ($validated['saldo'] > $validated['valor']) {
        return response()->json([
            'message' => 'O saldo não pode ser maior que o valor total do empenho'
        ], 422);
    }

    $empenho = Empenho::create($validated);

    return response()->json([
        'message' => 'Empenho criado com sucesso',
        'empenho' => [
            'id' => $empenho->id,
            'numero' => $empenho->numero,
            'fornecedor_id' => $empenho->fornecedor_id,
            'valor' => $empenho->valor,
            'saldo' => $empenho->saldo,
            'data_emissao' => $empenho->data_emissao,
            'status' => $empenho->status
        ]
    ], 201);
}
```

#### Response (201 Created)

```json
{
	"message": "Empenho criado com sucesso",
	"empenho": {
		"id": 3,
		"numero": "2026/0001",
		"fornecedor_id": 1,
		"valor": 50000.0,
		"saldo": 50000.0,
		"data_emissao": "2026-01-15",
		"status": "ativo"
	}
}
```

---

### 4. Atualizar Status de Solicitação

**POST** `/api/admin/solicitacoes/{id}/status`

#### Request Body

```json
{
	"status": "aprovado",
	"motivo": "Aprovado manualmente pelo administrador" // opcional
}
```

#### Validação

```php
$validated = $request->validate([
    'status' => 'required|in:rascunho,aguardando_aprovacao,em_analise,aprovado,em_pagamento,pago,cancelado,recusado',
    'motivo' => 'nullable|string'
]);
```

#### Implementação

```php
public function atualizarStatusSolicitacao(Request $request, $id)
{
    $validated = $request->validate([
        'status' => 'required|in:rascunho,aguardando_aprovacao,em_analise,aprovado,em_pagamento,pago,cancelado,recusado',
        'motivo' => 'nullable|string'
    ]);

    $solicitacao = SolicitacaoPagamento::findOrFail($id);
    $statusAnterior = $solicitacao->status;

    $solicitacao->update([
        'status' => $validated['status']
    ]);

    // Registrar no trâmite
    Tramite::create([
        'solicitacao_id' => $solicitacao->id,
        'usuario_id' => Auth::id(),
        'fase' => "Status alterado de '{$statusAnterior}' para '{$validated['status']}'",
        'observacao' => $validated['motivo'] ?? 'Alteração manual pelo administrador'
    ]);

    return response()->json([
        'message' => 'Status atualizado com sucesso',
        'solicitacao' => [
            'id' => $solicitacao->id,
            'numero' => $solicitacao->numero,
            'status_anterior' => $statusAnterior,
            'status_atual' => $solicitacao->status
        ]
    ]);
}
```

#### Response (200 OK)

```json
{
	"message": "Status atualizado com sucesso",
	"solicitacao": {
		"id": 1,
		"numero": "SOL-2026-001",
		"status_anterior": "em_analise",
		"status_atual": "aprovado"
	}
}
```

---

## 🗺️ ROTAS

Adicionar em `routes/api.php`:

```php
use App\Http\Controllers\AdminController;

Route::middleware('auth:sanctum')->prefix('admin')->group(function () {
    // Criar usuário
    Route::post('/usuarios', [AdminController::class, 'criarUsuario']);

    // Criar fornecedor + responsável
    Route::post('/fornecedores', [AdminController::class, 'criarFornecedor']);

    // Criar empenho
    Route::post('/empenhos', [AdminController::class, 'criarEmpenho']);

    // Atualizar status de solicitação
    Route::post('/solicitacoes/{id}/status', [AdminController::class, 'atualizarStatusSolicitacao']);
});
```

---

## 💻 CONTROLLER COMPLETO

**Arquivo:** `app/Http/Controllers/AdminController.php`

```php
<?php

namespace App\Http\Controllers;

use App\Models\User;
use App\Models\Fornecedor;
use App\Models\Empenho;
use App\Models\SolicitacaoPagamento;
use App\Models\Tramite;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
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
            $perfisPermitidos = ['gestor_suporte', 'operador_pmsjp'];

            if (!in_array($user->perfil, $perfisPermitidos)) {
                return response()->json([
                    'message' => 'Acesso negado. Apenas administradores podem acessar esta área.'
                ], 403);
            }

            return $next($request);
        });
    }

    /**
     * Criar usuário
     */
    public function criarUsuario(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|email|unique:users,email',
            'cpf' => 'required|string|unique:users,cpf',
            'password' => 'required|string|min:6',
            'perfil' => 'required|in:responsavel_tecnico,gestor_contrato,gestor_suporte,operador_pmsjp,operador_orcamentario',
            'fornecedor_id' => 'required_if:perfil,responsavel_tecnico|nullable|exists:fornecedores,id'
        ]);

        $user = User::create([
            'name' => $validated['name'],
            'email' => $validated['email'],
            'cpf' => $validated['cpf'],
            'password' => Hash::make($validated['password']),
            'perfil' => $validated['perfil'],
            'fornecedor_id' => $validated['fornecedor_id'] ?? null
        ]);

        return response()->json([
            'message' => 'Usuário criado com sucesso',
            'usuario' => [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'cpf' => $user->cpf,
                'perfil' => $user->perfil,
                'fornecedor_id' => $user->fornecedor_id
            ]
        ], 201);
    }

    /**
     * Criar fornecedor + responsável técnico
     */
    public function criarFornecedor(Request $request)
    {
        $validated = $request->validate([
            'nome' => 'required|string|max:255',
            'cnpj' => 'required|string|unique:fornecedores,cnpj',
            'responsavel_tecnico_nome' => 'required|string|max:255',
            'responsavel_tecnico_email' => 'required|email|unique:users,email',
            'responsavel_tecnico_cpf' => 'required|string|unique:users,cpf',
            'responsavel_tecnico_password' => 'required|string|min:6'
        ]);

        DB::beginTransaction();

        try {
            // 1. Criar fornecedor
            $fornecedor = Fornecedor::create([
                'nome' => $validated['nome'],
                'cnpj' => $validated['cnpj']
            ]);

            // 2. Criar responsável técnico
            $responsavelTecnico = User::create([
                'name' => $validated['responsavel_tecnico_nome'],
                'email' => $validated['responsavel_tecnico_email'],
                'cpf' => $validated['responsavel_tecnico_cpf'],
                'password' => Hash::make($validated['responsavel_tecnico_password']),
                'perfil' => 'responsavel_tecnico',
                'fornecedor_id' => $fornecedor->id
            ]);

            // 3. Atualizar fornecedor com o ID do responsável
            $fornecedor->update([
                'responsavel_tecnico_id' => $responsavelTecnico->id
            ]);

            DB::commit();

            return response()->json([
                'message' => 'Fornecedor e Responsável Técnico criados com sucesso',
                'fornecedor' => [
                    'id' => $fornecedor->id,
                    'nome' => $fornecedor->nome,
                    'cnpj' => $fornecedor->cnpj,
                    'responsavel_tecnico' => [
                        'id' => $responsavelTecnico->id,
                        'name' => $responsavelTecnico->name,
                        'email' => $responsavelTecnico->email
                    ]
                ]
            ], 201);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'message' => 'Erro ao criar fornecedor',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Criar empenho
     */
    public function criarEmpenho(Request $request)
    {
        $validated = $request->validate([
            'numero' => 'required|string|unique:empenhos,numero',
            'fornecedor_id' => 'required|exists:fornecedores,id',
            'valor' => 'required|numeric|min:0',
            'saldo' => 'required|numeric|min:0',
            'data_emissao' => 'required|date',
            'status' => 'required|in:ativo,bloqueado,encerrado'
        ]);

        // Validar que saldo não excede valor
        if ($validated['saldo'] > $validated['valor']) {
            return response()->json([
                'message' => 'O saldo não pode ser maior que o valor total do empenho'
            ], 422);
        }

        $empenho = Empenho::create($validated);

        return response()->json([
            'message' => 'Empenho criado com sucesso',
            'empenho' => [
                'id' => $empenho->id,
                'numero' => $empenho->numero,
                'fornecedor_id' => $empenho->fornecedor_id,
                'valor' => $empenho->valor,
                'saldo' => $empenho->saldo,
                'data_emissao' => $empenho->data_emissao,
                'status' => $empenho->status
            ]
        ], 201);
    }

    /**
     * Atualizar status de solicitação
     */
    public function atualizarStatusSolicitacao(Request $request, $id)
    {
        $validated = $request->validate([
            'status' => 'required|in:rascunho,aguardando_aprovacao,em_analise,aprovado,em_pagamento,pago,cancelado,recusado',
            'motivo' => 'nullable|string'
        ]);

        $solicitacao = SolicitacaoPagamento::findOrFail($id);
        $statusAnterior = $solicitacao->status;

        $solicitacao->update([
            'status' => $validated['status']
        ]);

        // Registrar no trâmite
        Tramite::create([
            'solicitacao_id' => $solicitacao->id,
            'usuario_id' => Auth::id(),
            'fase' => "Status alterado de '{$statusAnterior}' para '{$validated['status']}'",
            'observacao' => $validated['motivo'] ?? 'Alteração manual pelo administrador'
        ]);

        return response()->json([
            'message' => 'Status atualizado com sucesso',
            'solicitacao' => [
                'id' => $solicitacao->id,
                'numero' => $solicitacao->numero,
                'status_anterior' => $statusAnterior,
                'status_atual' => $solicitacao->status
            ]
        ]);
    }
}
```

---

## 🧪 TESTES

### 1. Criar Usuário Gestor

```bash
curl -X POST http://localhost:3333/api/admin/usuarios \
  -H "Authorization: Bearer {token}" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Ana Paula",
    "email": "ana@pmsjp.com",
    "cpf": "111.222.333-44",
    "password": "senha123",
    "perfil": "gestor_contrato"
  }'
```

### 2. Criar Fornecedor + Responsável

```bash
curl -X POST http://localhost:3333/api/admin/fornecedores \
  -H "Authorization: Bearer {token}" \
  -H "Content-Type: application/json" \
  -d '{
    "nome": "Tech Solutions LTDA",
    "cnpj": "11.222.333/0001-44",
    "responsavel_tecnico_nome": "Carlos Souza",
    "responsavel_tecnico_email": "carlos@techsolutions.com",
    "responsavel_tecnico_cpf": "555.666.777-88",
    "responsavel_tecnico_password": "senha123"
  }'
```

### 3. Criar Empenho

```bash
curl -X POST http://localhost:3333/api/admin/empenhos \
  -H "Authorization: Bearer {token}" \
  -H "Content-Type: application/json" \
  -d '{
    "numero": "2026/0005",
    "fornecedor_id": 1,
    "valor": 75000.00,
    "saldo": 75000.00,
    "data_emissao": "2026-02-01",
    "status": "ativo"
  }'
```

### 4. Atualizar Status de Solicitação

```bash
curl -X POST http://localhost:3333/api/admin/solicitacoes/1/status \
  -H "Authorization: Bearer {token}" \
  -H "Content-Type: application/json" \
  -d '{
    "status": "aprovado",
    "motivo": "Aprovado manualmente para testes"
  }'
```

---

## ✅ CHECKLIST DE IMPLEMENTAÇÃO

- [ ] Criar `AdminController.php`
- [ ] Adicionar middleware de autorização no construtor
- [ ] Implementar método `criarUsuario()`
- [ ] Implementar método `criarFornecedor()`
- [ ] Implementar método `criarEmpenho()`
- [ ] Implementar método `atualizarStatusSolicitacao()`
- [ ] Adicionar rotas em `routes/api.php`
- [ ] Testar criação de usuário
- [ ] Testar criação de fornecedor
- [ ] Testar criação de empenho
- [ ] Testar atualização de status
- [ ] Verificar permissões (403 para usuários não autorizados)

---

## 🎯 RESUMO

✅ **4 endpoints administrativos criados**
✅ **Proteção por perfil (apenas admins)**
✅ **Validações completas**
✅ **Transações para operações complexas**
✅ **Registro de trâmites**
✅ **Mensagens de erro amigáveis**

---

**🎉 Guia completo do Painel Administrativo!**

# 📋 GUIA BACKEND - Permissões de Visualização de Chamados

## 🎯 OBJETIVO

Implementar controle de acesso aos chamados baseado no perfil do usuário:

- **Gestor de Suporte:** Vê TODOS os chamados
- **Usuário Comum:** Vê APENAS seus próprios chamados

---

## 🔐 REGRAS DE PERMISSÃO

### 1. Gestor de Suporte (`gestor_suporte`)

✅ **Pode visualizar:**

- Todos os chamados do sistema
- Chamados de qualquer usuário

✅ **Pode filtrar por:**

- Protocolo
- Módulo
- Assunto
- Status
- Data de Cadastro
- Data de Resposta
- **Usuário Origem** (nome do usuário que criou o chamado)

---

### 2. Usuário Comum (qualquer outro perfil)

✅ **Pode visualizar:**

- APENAS seus próprios chamados

✅ **Pode filtrar por:**

- Protocolo
- Módulo
- Assunto
- Status
- Data de Cadastro
- Data de Resposta

❌ **NÃO pode:**

- Ver chamados de outros usuários
- Filtrar por "Usuário Origem" (o filtro é automático pelo backend)

---

## 📡 IMPLEMENTAÇÃO NO BACKEND

### Controller: `ChamadoController.php`

```php
<?php

namespace App\Http\Controllers;

use App\Models\Chamado;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class ChamadoController extends Controller
{
    /**
     * Lista chamados com base no perfil do usuário
     */
    public function index(Request $request)
    {
        $user = Auth::user();

        // Inicia a query
        $query = Chamado::with('usuario');

        // ✅ REGRA DE PERMISSÃO: Usuários comuns só veem seus próprios chamados
        if ($user->perfil !== 'gestor_suporte') {
            $query->where('usuario_id', $user->id);
        }

        // Aplicar filtros opcionais

        // Protocolo (ID)
        if ($request->has('protocolo')) {
            $protocolo = str_replace('#', '', $request->protocolo);
            $query->where('id', $protocolo);
        }

        // Módulo (busca parcial)
        if ($request->has('modulo')) {
            $query->where('modulo', 'like', '%' . $request->modulo . '%');
        }

        // Assunto (busca parcial)
        if ($request->has('assunto')) {
            $query->where('assunto', 'like', '%' . $request->assunto . '%');
        }

        // Status
        if ($request->has('status')) {
            $query->where('status', $request->status);
        }

        // Data de Cadastro (período)
        if ($request->has('data_cadastro_inicio')) {
            $query->whereDate('created_at', '>=', $request->data_cadastro_inicio);
        }
        if ($request->has('data_cadastro_fim')) {
            $query->whereDate('created_at', '<=', $request->data_cadastro_fim);
        }

        // Data de Resposta (período)
        if ($request->has('data_resposta_inicio')) {
            $query->whereDate('data_resposta', '>=', $request->data_resposta_inicio);
        }
        if ($request->has('data_resposta_fim')) {
            $query->whereDate('data_resposta', '<=', $request->data_resposta_fim);
        }

        // ✅ Usuário Origem - APENAS PARA GESTOR DE SUPORTE
        if ($user->perfil === 'gestor_suporte' && $request->has('usuario_origem')) {
            $query->whereHas('usuario', function ($q) use ($request) {
                $q->where('name', 'like', '%' . $request->usuario_origem . '%');
            });
        }

        // Ordenar do mais recente para o mais velho
        $query->orderBy('created_at', 'desc');

        // Buscar resultados
        $chamados = $query->get();

        // Formatar response
        $chamadosFormatados = $chamados->map(function ($chamado) {
            return [
                'id' => $chamado->id,
                'protocolo' => '#' . $chamado->id,
                'modulo' => $chamado->modulo,
                'assunto' => $chamado->assunto,
                'usuario' => $chamado->usuario->name . ' (' . $this->getPerfilLabel($chamado->usuario->perfil) . ')',
                'status' => $chamado->status,
                'data_abertura' => $chamado->created_at->format('d/m/Y'),
                'data_cadastro' => $chamado->created_at->format('d/m/Y H:i'),
                'data_resposta' => $chamado->data_resposta ? $chamado->data_resposta->format('d/m/Y H:i') : null,
                'total_mensagens' => $chamado->mensagens()->count(),
            ];
        });

        return response()->json([
            'chamados' => $chamadosFormatados
        ]);
    }

    /**
     * Exibe um chamado específico
     */
    public function show(Request $request, $id)
    {
        $user = Auth::user();
        $chamado = Chamado::with(['usuario', 'mensagens.usuario'])->findOrFail($id);

        // ✅ REGRA DE PERMISSÃO: Usuários comuns só podem ver seus próprios chamados
        if ($user->perfil !== 'gestor_suporte' && $chamado->usuario_id !== $user->id) {
            return response()->json([
                'message' => 'Você não tem permissão para visualizar este chamado.'
            ], 403);
        }

        // Retornar dados do chamado
        return response()->json([
            'chamado' => [
                'id' => $chamado->id,
                'protocolo' => '#' . $chamado->id,
                'modulo' => $chamado->modulo,
                'assunto' => $chamado->assunto,
                'usuario' => $chamado->usuario->name,
                'status' => $chamado->status,
                'data_abertura' => $chamado->created_at->format('d/m/Y'),
                'mensagem_inicial' => $chamado->mensagem,
            ],
            'timeline' => $chamado->mensagens->map(function ($msg) {
                return [
                    'id' => $msg->id,
                    'tipo' => $msg->tipo,
                    'usuario' => $msg->usuario->name,
                    'mensagem' => $msg->mensagem,
                    'data' => $msg->created_at->format('d/m/Y H:i'),
                ];
            })
        ]);
    }

    /**
     * Helper para obter label do perfil
     */
    private function getPerfilLabel($perfil)
    {
        $perfis = [
            'responsavel_tecnico' => 'Responsável Técnico',
            'gestor_contrato' => 'Gestor do Contrato',
            'operador_pmsjp' => 'Operador PMSJP',
            'gestor_suporte' => 'Gestor de Suporte',
            'usuario_comum' => 'Usuário Comum',
            'operador_orcamentario' => 'Operador Orçamentário',
        ];

        return $perfis[$perfil] ?? $perfil;
    }
}
```

---

## 🔄 FLUXO DE AUTORIZAÇÃO

### Cenário 1: Usuário Comum Lista Chamados

**Request:**

```http
GET /api/chamados?status=aberto
Authorization: Bearer {token_usuario_comum}
```

**Backend processa:**

1. Identifica que o usuário NÃO é `gestor_suporte`
2. Adiciona automaticamente: `WHERE usuario_id = {id_do_usuario_logado}`
3. Aplica filtro de status: `WHERE status = 'aberto'`
4. Retorna APENAS os chamados do próprio usuário

**Response:**

```json
{
	"chamados": [
		{
			"id": 3,
			"protocolo": "#3",
			"usuario": "João Silva (Responsável Técnico)"
			// ... outros campos
		}
	]
}
```

---

### Cenário 2: Gestor de Suporte Lista Chamados

**Request:**

```http
GET /api/chamados?usuario_origem=João&status=aberto
Authorization: Bearer {token_gestor_suporte}
```

**Backend processa:**

1. Identifica que o usuário É `gestor_suporte`
2. NÃO adiciona filtro de `usuario_id` (vê todos)
3. Aplica filtro de usuário origem: `WHERE usuarios.name LIKE '%João%'`
4. Aplica filtro de status: `WHERE status = 'aberto'`
5. Retorna chamados de TODOS os usuários que atendem os critérios

**Response:**

```json
{
	"chamados": [
		{
			"id": 3,
			"protocolo": "#3",
			"usuario": "João Silva (Responsável Técnico)"
			// ...
		},
		{
			"id": 1,
			"protocolo": "#1",
			"usuario": "João Pedro (Gestor do Contrato)"
			// ...
		}
	]
}
```

---

### Cenário 3: Usuário Comum Tenta Ver Chamado de Outro Usuário

**Request:**

```http
GET /api/chamados/5
Authorization: Bearer {token_usuario_comum}
```

**Backend verifica:**

```php
if ($user->perfil !== 'gestor_suporte' && $chamado->usuario_id !== $user->id) {
    return response()->json(['message' => 'Você não tem permissão...'], 403);
}
```

**Response:**

```json
{
	"message": "Você não tem permissão para visualizar este chamado."
}
```

**Status:** `403 Forbidden`

---

## 📊 DIAGRAMA DE FLUXO

```
┌─────────────────────────────────────────────────────────┐
│                    Request: GET /api/chamados           │
└─────────────────────────────────────────────────────────┘
                            │
                            ▼
                ┌───────────────────────┐
                │  Verificar perfil do  │
                │  usuário autenticado  │
                └───────────────────────┘
                            │
                ┌───────────┴────────────┐
                │                        │
                ▼                        ▼
    ┌──────────────────┐    ┌──────────────────────┐
    │ Gestor Suporte?  │    │  Usuário Comum?      │
    └──────────────────┘    └──────────────────────┘
                │                        │
                ▼                        ▼
    ┌──────────────────┐    ┌──────────────────────┐
    │ VÊ TODOS         │    │ FILTRO AUTOMÁTICO:   │
    │ os chamados      │    │ usuario_id = auth_id │
    └──────────────────┘    └──────────────────────┘
                │                        │
                └───────────┬────────────┘
                            │
                            ▼
                ┌───────────────────────┐
                │  Aplicar filtros      │
                │  opcionais (status,   │
                │  módulo, data, etc)   │
                └───────────────────────┘
                            │
                            ▼
                ┌───────────────────────┐
                │  Ordenar por          │
                │  created_at DESC      │
                └───────────────────────┘
                            │
                            ▼
                ┌───────────────────────┐
                │  Retornar JSON        │
                └───────────────────────┘
```

---

## ✅ CHECKLIST DE IMPLEMENTAÇÃO

### Backend

- [ ] Adicionar verificação de perfil no método `index()`
- [ ] Aplicar filtro automático `where('usuario_id', $user->id)` para não gestores
- [ ] Permitir filtro `usuario_origem` APENAS para gestor_suporte
- [ ] Adicionar verificação de permissão no método `show()`
- [ ] Retornar 403 quando usuário comum tentar ver chamado de outro
- [ ] Testar com usuário comum (deve ver apenas próprios chamados)
- [ ] Testar com gestor de suporte (deve ver todos os chamados)

### Frontend

- [ ] Esconder campo "Usuário Origem" para não gestores ✅ (já implementado)
- [ ] Mostrar coluna "Usuário" na tabela apenas para gestor ✅ (já implementado)
- [ ] Tratar erro 403 ao tentar ver chamado sem permissão

---

## 🧪 TESTES

### Teste 1: Usuário Comum Lista Chamados

```bash
# Login como usuário comum
curl -X POST http://localhost:3333/api/login \
  -H "Content-Type: application/json" \
  -d '{"cpf": "12345678900", "password": "password"}'

# Listar chamados (deve retornar apenas os do próprio usuário)
curl -X GET http://localhost:3333/api/chamados \
  -H "Authorization: Bearer {token}"
```

**Esperado:** Apenas chamados do usuário logado

---

### Teste 2: Gestor de Suporte Lista Todos os Chamados

```bash
# Login como gestor de suporte
curl -X POST http://localhost:3333/api/login \
  -H "Content-Type: application/json" \
  -d '{"cpf": "98765432100", "password": "password"}'

# Listar chamados (deve retornar todos)
curl -X GET http://localhost:3333/api/chamados \
  -H "Authorization: Bearer {token}"
```

**Esperado:** Todos os chamados do sistema

---

### Teste 3: Gestor Filtra por Usuário

```bash
curl -X GET "http://localhost:3333/api/chamados?usuario_origem=João" \
  -H "Authorization: Bearer {token_gestor}"
```

**Esperado:** Apenas chamados de usuários com "João" no nome

---

### Teste 4: Usuário Comum Tenta Ver Chamado de Outro

```bash
curl -X GET http://localhost:3333/api/chamados/99 \
  -H "Authorization: Bearer {token_usuario_comum}"
```

**Esperado:**

```json
{
	"message": "Você não tem permissão para visualizar este chamado."
}
```

**Status:** 403

---

## 🔑 RESUMO

| Perfil                | Vê Próprios Chamados | Vê Chamados de Outros | Filtro "Usuário Origem" |
| --------------------- | -------------------- | --------------------- | ----------------------- |
| **Gestor de Suporte** | ✅ Sim               | ✅ Sim                | ✅ Habilitado           |
| **Usuário Comum**     | ✅ Sim               | ❌ Não                | ❌ Desabilitado         |

---

**🎉 Frontend já está preparado para receber essas permissões!**

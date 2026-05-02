# API - Cancelamento de Solicitação de Pagamento

## Endpoint

```
POST /api/solicitacoes/{id}/cancelar
```

## Headers

```
Authorization: Bearer {token}
Content-Type: application/json
```

## Parâmetros de Rota

- `id` (integer, required) - ID da solicitação de pagamento

## Request Body

```json
{
	"data_cancelamento": "2024-12-31",
	"motivo": "Descrição do motivo do cancelamento"
}
```

### Campos

| Campo             | Tipo   | Obrigatório | Descrição                                  |
| ----------------- | ------ | ----------- | ------------------------------------------ |
| data_cancelamento | string | Sim         | Data do cancelamento (formato: YYYY-MM-DD) |
| motivo            | string | Sim         | Motivo/justificativa do cancelamento       |

## Response Success (200)

```json
{
	"message": "Solicitação cancelada com sucesso",
	"solicitacao": {
		"id": 1,
		"numero": "SP-2024-000001",
		"status": "Cancelada",
		"data_cancelamento": "2024-12-31",
		"motivo_cancelamento": "Descrição do motivo do cancelamento",
		"updated_at": "2024-12-31T10:30:00.000000Z"
	}
}
```

## Response Errors

### 401 - Não autorizado

```json
{
	"message": "Não autenticado"
}
```

### 403 - Sem permissão

```json
{
	"message": "Você não tem permissão para cancelar esta solicitação"
}
```

### 404 - Solicitação não encontrada

```json
{
	"message": "Solicitação não encontrada"
}
```

### 422 - Validação falhou

```json
{
	"message": "Os dados fornecidos são inválidos",
	"errors": {
		"data_cancelamento": ["O campo data de cancelamento é obrigatório"],
		"motivo": ["O campo motivo é obrigatório"]
	}
}
```

### 400 - Regra de negócio violada

```json
{
	"message": "Não é possível cancelar uma solicitação com status diferente de 'Pendente'"
}
```

## Regras de Negócio

1. **Apenas solicitações com status "Pendente" podem ser canceladas**
    - Se a solicitação já foi processada, aprovada ou está em outro status, retornar erro 400

2. **Usuário deve ser o responsável técnico ou dono da solicitação**
    - Verificar permissões antes de permitir cancelamento

3. **Data de cancelamento não pode ser futura**
    - Validar que data_cancelamento <= data atual

4. **Motivo deve ter no mínimo 10 caracteres**
    - Validar tamanho mínimo do motivo

5. **Ao cancelar:**
    - Atualizar status da solicitação para "Cancelada"
    - Salvar data_cancelamento
    - Salvar motivo_cancelamento
    - Registrar tramite de cancelamento
    - Liberar saldo do empenho (se aplicável)

## Exemplo de Implementação Laravel

```php
// Controller
public function cancelar(Request $request, $id)
{
    $validated = $request->validate([
        'data_cancelamento' => 'required|date|before_or_equal:today',
        'motivo' => 'required|string|min:10|max:500',
    ]);

    $solicitacao = SolicitacaoPagamento::findOrFail($id);

    // Verificar permissão
    if ($solicitacao->fornecedor_id !== auth()->user()->fornecedor_id) {
        abort(403, 'Você não tem permissão para cancelar esta solicitação');
    }

    // Verificar status
    if ($solicitacao->status !== 'Pendente') {
        abort(400, 'Não é possível cancelar uma solicitação com status diferente de Pendente');
    }

    $solicitacao->update([
        'status' => 'Cancelada',
        'data_cancelamento' => $validated['data_cancelamento'],
        'motivo_cancelamento' => $validated['motivo'],
    ]);

    // Registrar trâmite
    $solicitacao->tramites()->create([
        'fase' => 'Cancelamento',
        'observacao' => $validated['motivo'],
        'usuario_id' => auth()->id(),
    ]);

    return response()->json([
        'message' => 'Solicitação cancelada com sucesso',
        'solicitacao' => $solicitacao->fresh(),
    ]);
}
```

## Observações

- O frontend já está preparado para consumir esta API
- O modal de cancelamento valida os campos antes de enviar
- Após o cancelamento bem-sucedido, a lista de solicitações é recarregada automaticamente
- Toast de sucesso/erro é exibido ao usuário

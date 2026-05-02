# 📋 GUIA BACKEND - Trâmites da Solicitação de Pagamento

## 🎯 VISÃO GERAL

A aba de **Trâmites** agora exibe informações completas de cada movimentação da solicitação, incluindo:

- Data/Hora
- Fase/Título
- Responsável
- Origem
- Destino
- Motivo (opcional)
- Observação (opcional)

---

## 📡 ESTRUTURA DO TRÂMITE

### Response Atualizado

```json
{
	"solicitacao": {
		"id": 4,
		"numero": "SP-2026-000004",
		// ... outros campos

		"tramites": [
			{
				"id": 1,
				"fase": "Solicitação Criada",
				"created_at": "02/05/2026 10:51",
				"usuario": {
					"id": 1,
					"name": "João Silva (Responsável Técnico)"
				},
				"origem": null,
				"destino": null,
				"motivo": null,
				"observacao": "Solicitação de pagamento criada pelo fornecedor"
			},
			{
				"id": 2,
				"fase": "Anexos Aprovados",
				"created_at": "02/05/2026 10:51",
				"usuario": {
					"id": 5,
					"name": "Maria Santos (Gestor Contrato)"
				},
				"origem": "Anexar Documentos",
				"destino": "Gestor",
				"motivo": null,
				"observacao": "Todos os anexos foram aprovados e aguardam autorização do Gestor do Contrato"
			},
			{
				"id": 3,
				"fase": "Pagamento Realizado",
				"created_at": "02/05/2026 10:51",
				"usuario": {
					"id": 10,
					"name": "Carlos Oliveira (Operador PMSJP)"
				},
				"origem": "Remessa",
				"destino": "Pagamento Realizado",
				"motivo": "Pagamento conforme programação financeira",
				"observacao": "Pagamento realizado via transferência bancária"
			}
		]
	}
}
```

---

## 🗄️ ESTRUTURA DA TABELA

### Tabela `tramites`

```sql
CREATE TABLE tramites (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    solicitacao_pagamento_id BIGINT NOT NULL,
    fase VARCHAR(255) NOT NULL,
    usuario_id BIGINT,
    origem VARCHAR(255) NULL,
    destino VARCHAR(255) NULL,
    motivo TEXT NULL,
    observacao TEXT NULL,
    created_at TIMESTAMP,
    updated_at TIMESTAMP,

    FOREIGN KEY (solicitacao_pagamento_id) REFERENCES solicitacoes_pagamento(id),
    FOREIGN KEY (usuario_id) REFERENCES users(id),

    INDEX idx_solicitacao (solicitacao_pagamento_id),
    INDEX idx_created_at (created_at)
);
```

### Campos Novos Adicionados:

- **`origem`** (VARCHAR 255, NULL): De onde veio a solicitação
- **`destino`** (VARCHAR 255, NULL): Para onde foi/vai a solicitação
- **`motivo`** (TEXT, NULL): Motivo da tramitação (usado principalmente em recusas ou situações especiais)

---

## 🔄 ETAPAS DO PROCESSO (Origem/Destino)

As etapas que devem ser usadas em **Origem** e **Destino**:

| Etapa                      | Descrição                               |
| -------------------------- | --------------------------------------- |
| `Solicitação de Pagamento` | Início do processo - solicitação criada |
| `Anexar Documentos`        | Fase de envio e aprovação de anexos     |
| `Fiscal`                   | Análise fiscal dos documentos           |
| `Gestor`                   | Aprovação do gestor do contrato         |
| `Comissão de Liquidação`   | Liquidação da despesa                   |
| `Secretário`               | Aprovação do secretário                 |
| `ISS`                      | Verificação de ISS/Patrimônio           |
| `Ordem de Pagamento`       | Emissão da ordem de pagamento           |
| `Borderô`                  | Inclusão no borderô                     |
| `Remessa`                  | Envio da remessa bancária               |
| `Pagamento`                | Processamento do pagamento              |
| `Pagamento Realizado`      | Pagamento efetivado                     |
| `Cancelada`                | Solicitação cancelada                   |

**Exemplo de transição:**

```
Origem: "Anexar Documentos" → Destino: "Gestor"
```

Significa: A solicitação saiu da etapa de anexação de documentos e foi para o gestor aprovar.

---

## 📝 EXEMPLOS DE TRÂMITES POR FASE

### 1. Criação da Solicitação

```php
$solicitacao->tramites()->create([
    'fase' => 'Solicitação Criada',
    'usuario_id' => auth()->id(),
    'origem' => null,
    'destino' => 'Aguardando Envio de Anexos',
    'motivo' => null,
    'observacao' => 'Solicitação de pagamento criada pelo fornecedor',
]);
```

### 2. Envio de Anexos para Aprovação

```php
$solicitacao->tramites()->create([
    'fase' => 'Anexos Enviados para Aprovação',
    'usuario_id' => auth()->id(),
    'origem' => 'Anexar Documentos',
    'destino' => 'Gestor',
    'motivo' => null,
    'observacao' => 'Todos os anexos foram enviados e aguardam aprovação do Gestor do Contrato',
]);
```

### 3. Anexo Aprovado pelo Gestor

```php
$solicitacao->tramites()->create([
    'fase' => 'Anexo Aprovado pelo Gestor',
    'usuario_id' => auth()->id(),
    'origem' => 'Gestor de Contrato',
    'destino' => 'Aguardando Aprovação de Outros Anexos',
    'motivo' => null,
    'observacao' => "Anexo '{$anexo->tipo_anexo_label}' aprovado",
]);
```

### 4. Anexo Recusado pelo Gestor

```php
$solicitacao->tramites()->create([
    'fase' => 'Anexo Recusado pelo Gestor',
    'usuario_id' => auth()->id(),
    'origem' => 'Gestor',
    'destino' => 'Anexar Documentos',
    'motivo' => $request->motivo, // Motivo da recusa
    'observacao' => "Anexo '{$anexo->tipo_anexo_label}' recusado",
]);
```

### 5. Todos Anexos Aprovados

```php
$solicitacao->tramites()->create([
    'fase' => 'Anexos Aprovados',
    'usuario_id' => auth()->id(),
    'origem' => 'Gestor',
    'destino' => 'Comissão de Liquidação',
    'motivo' => null,
    'observacao' => 'Todos os anexos foram aprovados',
]);
```

### 6. Autorizado pelo Gestor

```php
$solicitacao->tramites()->create([
    'fase' => 'Autorizado pelo Gestor de Contrato',
    'usuario_id' => auth()->id(),
    'origem' => 'Gestor',
    'destino' => 'Comissão de Liquidação',
    'motivo' => null,
    'observacao' => 'Solicitação autorizada e encaminhada para liquidação',
]);
```

### 7. Em Análise pela Comissão de Liquidação

```php
$solicitacao->tramites()->create([
    'fase' => 'Em Análise pela Comissão de Liquidação',
    'usuario_id' => auth()->id(),
    'origem' => 'Gestor',
    'destino' => 'Comissão de Liquidação',
    'motivo' => null,
    'observacao' => 'Documentação em análise pela comissão',
]);
```

### 8. Liquidado

```php
$solicitacao->tramites()->create([
    'fase' => 'Liquidado',
    'usuario_id' => auth()->id(),
    'origem' => 'Comissão de Liquidação',
    'destino' => 'Secretário',
    'motivo' => null,
    'observacao' => 'Solicitação liquidada e aguardando aprovação do secretário',
]);
```

### 9. Aprovado pelo Secretário

```php
$solicitacao->tramites()->create([
    'fase' => 'Aprovado pelo Secretário',
    'usuario_id' => auth()->id(),
    'origem' => 'Secretário',
    'destino' => 'ISS',
    'motivo' => null,
    'observacao' => 'Aprovado e encaminhado para verificação de ISS',
]);
```

### 10. Ordem de Pagamento Gerada

```php
$solicitacao->tramites()->create([
    'fase' => 'Ordem de Pagamento Gerada',
    'usuario_id' => auth()->id(),
    'origem' => 'ISS',
    'destino' => 'Ordem de Pagamento',
    'motivo' => null,
    'observacao' => "Ordem de Pagamento nº {$ordemPagamento->numero} gerada",
]);
```

### 11. Incluído no Borderô

```php
$solicitacao->tramites()->create([
    'fase' => 'Incluído no Borderô',
    'usuario_id' => auth()->id(),
    'origem' => 'Ordem de Pagamento',
    'destino' => 'Borderô',
    'motivo' => null,
    'observacao' => "Incluído no Borderô nº {$bordero->numero}",
]);
```

### 12. Enviado para Remessa Bancária

```php
$solicitacao->tramites()->create([
    'fase' => 'Enviado para Remessa Bancária',
    'usuario_id' => auth()->id(),
    'origem' => 'Borderô',
    'destino' => 'Remessa',
    'motivo' => null,
    'observacao' => 'Arquivo de remessa enviado ao banco',
]);
```

### 13. Pagamento Realizado

```php
$solicitacao->tramites()->create([
    'fase' => 'Pagamento Realizado',
    'usuario_id' => auth()->id(),
    'origem' => 'Remessa',
    'destino' => 'Pagamento Realizado',
    'motivo' => 'Pagamento conforme programação financeira',
    'observacao' => 'Pagamento realizado via transferência bancária',
]);
```

### 14. Solicitação Cancelada

```php
$solicitacao->tramites()->create([
    'fase' => 'Solicitação Cancelada',
    'usuario_id' => auth()->id(),
    'origem' => null, // Pode ser cancelada em qualquer etapa
    'destino' => 'Cancelada',
    'motivo' => $request->motivo, // Motivo do cancelamento
    'observacao' => "Solicitação cancelada em {$request->data_cancelamento}",
]);
```

---

## 🎨 LAYOUT NO FRONTEND

Cada trâmite é exibido como um card com:

```
┌─────────────────────────────────────────────────────────────┐
│ [Borda Azul]                                                 │
│                                                               │
│  Solicitação Criada                          02/05/2026 10:51│
│                                                               │
│  Responsável                    Origem                        │
│  João Silva (Responsável)       Responsável Técnico          │
│                                                               │
│  Destino                                                     │
│  Gestor de Contrato                                          │
│  ─────────────────────────────────────────────────────       │
│  Motivo                                                       │
│  Certidão vencida, necessário reenvio                        │
│  ─────────────────────────────────────────────────────       │
│  Observação                                                   │
│  Todos os anexos foram enviados                              │
│                                                               │
└─────────────────────────────────────────────────────────────┘
```

---

## 🔄 QUANDO REGISTRAR CADA CAMPO

### `origem` e `destino`

**IMPORTANTE:** Origem e Destino devem representar as **ETAPAS/STATUS** do processo, não pessoas ou departamentos.

**Exemplos corretos:**

- ✅ Origem: "Solicitação de Pagamento" → Destino: "Anexar Documentos"
- ✅ Origem: "Anexar Documentos" → Destino: "Fiscal"
- ✅ Origem: "Fiscal" → Destino: "Gestor"
- ✅ Origem: "Gestor" → Destino: "Comissão de Liquidação"
- ✅ Origem: "Comissão de Liquidação" → Destino: "Secretário"
- ✅ Origem: "Secretário" → Destino: "ISS"
- ✅ Origem: "ISS" → Destino: "Ordem de Pagamento"
- ✅ Origem: "Ordem de Pagamento" → Destino: "Borderô"
- ✅ Origem: "Borderô" → Destino: "Remessa"
- ✅ Origem: "Remessa" → Destino: "Pagamento"
- ✅ Origem: "Pagamento" → Destino: "Pagamento Realizado"

**NÃO usar nomes de pessoas/cargos:**

- ❌ Origem: "João Silva" → Destino: "Maria Santos"
- ❌ Origem: "Responsável Técnico" → Destino: "Gestor de Contrato"

### `motivo`

**Usar quando há uma RAZÃO ESPECÍFICA para a tramitação:**

- ✅ Recusa de anexo (motivo da recusa)
- ✅ Cancelamento (motivo do cancelamento)
- ✅ Devolução para correção
- ✅ Pagamento realizado (programação financeira)

**NÃO usar para fluxo normal:**

- ❌ Aprovações padrão
- ❌ Movimentações esperadas do fluxo

### `observacao`

**Usar para DETALHES ADICIONAIS:**

- ✅ Complemento de informação
- ✅ Números de documentos gerados
- ✅ Informações técnicas

---

## 📊 MÉTODO HELPER NO MODEL

```php
class SolicitacaoPagamento extends Model
{
    /**
     * Registra um trâmite da solicitação
     */
    public function registrarTramite(
        string $fase,
        ?string $origem = null,
        ?string $destino = null,
        ?string $motivo = null,
        ?string $observacao = null
    ) {
        return $this->tramites()->create([
            'fase' => $fase,
            'usuario_id' => auth()->id(),
            'origem' => $origem,
            'destino' => $destino,
            'motivo' => $motivo,
            'observacao' => $observacao,
            'created_at' => now(),
        ]);
    }
}
```

### Uso:

```php
$solicitacao->registrarTramite(
    fase: 'Anexo Recusado pelo Gestor',
    origem: 'Gestor de Contrato',
    destino: 'Responsável Técnico',
    motivo: 'Certidão vencida, necessário reenvio',
    observacao: "Anexo 'Certidão Negativa de Débitos' recusado"
);
```

---

## ✅ CHECKLIST DE IMPLEMENTAÇÃO

- [ ] Adicionar colunas `origem`, `destino`, `motivo` na tabela `tramites`
- [ ] Criar migration para adicionar as colunas
- [ ] Atualizar método `registrarTramite()` no model
- [ ] Atualizar todos os pontos que criam trâmites para incluir origem/destino/motivo quando aplicável
- [ ] Testar response do endpoint `/api/solicitacoes/{id}` com os novos campos
- [ ] Garantir que campos antigos ainda funcionam (backward compatibility)

---

## 🚀 MIGRATION EXEMPLO

```php
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class AddOrigemDestinoMotivoToTramitesTable extends Migration
{
    public function up()
    {
        Schema::table('tramites', function (Blueprint $table) {
            $table->string('origem')->nullable()->after('usuario_id');
            $table->string('destino')->nullable()->after('origem');
            $table->text('motivo')->nullable()->after('destino');
        });
    }

    public function down()
    {
        Schema::table('tramites', function (Blueprint $table) {
            $table->dropColumn(['origem', 'destino', 'motivo']);
        });
    }
}
```

---

**🎉 Frontend já está pronto e aguardando os campos completos do backend!**

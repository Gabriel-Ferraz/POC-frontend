# 📋 GUIA BACKEND - Responsável e Data de Envio dos Anexos

## 🎯 OBJETIVO

Adicionar informações de **quem enviou** o anexo e **quando foi enviado** na resposta da API de anexos.

---

## 📡 ENDPOINT AFETADO

**GET** `/api/solicitacoes/{id}/anexos`

---

## 🔄 RESPONSE ATUALIZADO

```json
{
	"solicitacao": {
		"id": 4,
		"numero": "SP-2026-000004",
		"status": "Pendente",
		"documento_fiscal_recusado": false,
		"anexos": [
			{
				"id": 1,
				"tipo_anexo": "certidao_negativa",
				"tipo_anexo_label": "Certidão Negativa de Débitos",
				"arquivo_path": "/storage/anexos/certidao_123.pdf",
				"arquivo_nome": "certidao_negativa.pdf",
				"status": "Aguardando Aprovação",
				"data_envio": "02/05/2026",
				"motivo_recusa": null,
				"is_documento_fiscal": false,
				"pode_reenviar": true,
				"pode_remover": true,

				// ✅ NOVOS CAMPOS
				"enviado_por": "João Silva (Responsável Técnico)",
				"enviado_em": "02/05/2026 14:30"
			},
			{
				"id": 2,
				"tipo_anexo": "documento_fiscal",
				"tipo_anexo_label": "Nota Fiscal Eletrônica",
				"arquivo_path": "/storage/anexos/nfe_456.pdf",
				"arquivo_nome": "nfe_12345.pdf",
				"status": "Aprovado",
				"data_envio": "02/05/2026",
				"motivo_recusa": null,
				"is_documento_fiscal": true,
				"pode_reenviar": false,
				"pode_remover": false,

				// ✅ NOVOS CAMPOS
				"enviado_por": "Maria Santos (Responsável Técnico)",
				"enviado_em": "02/05/2026 10:15"
			}
		]
	}
}
```

---

## 📊 ESTRUTURA DA TABELA

### Tabela `anexos_solicitacao_pagamento`

Verificar se já possui as colunas:

```sql
CREATE TABLE anexos_solicitacao_pagamento (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    solicitacao_pagamento_id BIGINT NOT NULL,
    tipo_anexo VARCHAR(255) NOT NULL,
    arquivo_path VARCHAR(255) NULL,
    arquivo_nome VARCHAR(255) NULL,
    status VARCHAR(50) NOT NULL,
    motivo_recusa TEXT NULL,

    -- ✅ Campos necessários para rastreamento
    enviado_por_usuario_id BIGINT NULL,  -- FK para users.id
    enviado_em TIMESTAMP NULL,            -- Data/hora do envio

    avaliado_por_usuario_id BIGINT NULL,
    avaliado_em TIMESTAMP NULL,

    created_at TIMESTAMP,
    updated_at TIMESTAMP,

    FOREIGN KEY (solicitacao_pagamento_id) REFERENCES solicitacoes_pagamento(id),
    FOREIGN KEY (enviado_por_usuario_id) REFERENCES users(id),
    FOREIGN KEY (avaliado_por_usuario_id) REFERENCES users(id)
);
```

---

## 🔧 IMPLEMENTAÇÃO NO LARAVEL

### 1. Migration (se os campos não existem)

```php
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class AddEnviadoPorToAnexosSolicitacaoPagamentoTable extends Migration
{
    public function up()
    {
        Schema::table('anexos_solicitacao_pagamento', function (Blueprint $table) {
            $table->unsignedBigInteger('enviado_por_usuario_id')->nullable()->after('motivo_recusa');
            $table->timestamp('enviado_em')->nullable()->after('enviado_por_usuario_id');

            $table->foreign('enviado_por_usuario_id')->references('id')->on('users');
        });
    }

    public function down()
    {
        Schema::table('anexos_solicitacao_pagamento', function (Blueprint $table) {
            $table->dropForeign(['enviado_por_usuario_id']);
            $table->dropColumn(['enviado_por_usuario_id', 'enviado_em']);
        });
    }
}
```

---

### 2. Model - Relacionamento

```php
class AnexoSolicitacaoPagamento extends Model
{
    protected $table = 'anexos_solicitacao_pagamento';

    protected $fillable = [
        'solicitacao_pagamento_id',
        'tipo_anexo',
        'arquivo_path',
        'arquivo_nome',
        'status',
        'motivo_recusa',
        'enviado_por_usuario_id',
        'enviado_em',
        'avaliado_por_usuario_id',
        'avaliado_em',
    ];

    // Relacionamentos
    public function enviadoPor()
    {
        return $this->belongsTo(User::class, 'enviado_por_usuario_id');
    }

    public function avaliadoPor()
    {
        return $this->belongsTo(User::class, 'avaliado_por_usuario_id');
    }
}
```

---

### 3. Controller - Upload de Anexo

**Quando o usuário faz upload**, registrar quem enviou e quando:

```php
public function uploadAnexo(Request $request, $solicitacaoId, $anexoId)
{
    $request->validate([
        'arquivo' => 'required|file|mimes:pdf|max:10240', // 10MB
    ]);

    $anexo = AnexoSolicitacaoPagamento::where('id', $anexoId)
        ->where('solicitacao_pagamento_id', $solicitacaoId)
        ->firstOrFail();

    // Upload do arquivo
    $arquivo = $request->file('arquivo');
    $nomeArquivo = time() . '_' . $arquivo->getClientOriginalName();
    $path = $arquivo->storeAs('anexos', $nomeArquivo, 'public');

    // ✅ Atualizar com informações de quem enviou
    $anexo->update([
        'arquivo_path' => $path,
        'arquivo_nome' => $arquivo->getClientOriginalName(),
        'status' => 'Pendente',
        'enviado_por_usuario_id' => auth()->id(),  // ✅ Quem enviou
        'enviado_em' => now(),                      // ✅ Quando enviou
    ]);

    return response()->json([
        'message' => 'Anexo enviado com sucesso',
        'anexo' => $this->formatarAnexo($anexo),
    ]);
}
```

---

### 4. Controller - Listar Anexos (Response)

```php
public function listarAnexos($solicitacaoId)
{
    $solicitacao = SolicitacaoPagamento::with([
        'anexos.enviadoPor',      // ✅ Eager load do usuário que enviou
        'anexos.avaliadoPor'      // ✅ Eager load do usuário que avaliou
    ])->findOrFail($solicitacaoId);

    return response()->json([
        'solicitacao' => [
            'id' => $solicitacao->id,
            'numero' => $solicitacao->numero,
            'status' => $solicitacao->status,
            'documento_fiscal_recusado' => $this->temDocumentoFiscalRecusado($solicitacao),
            'anexos' => $solicitacao->anexos->map(function ($anexo) {
                return $this->formatarAnexo($anexo);
            }),
        ],
    ]);
}

private function formatarAnexo($anexo)
{
    return [
        'id' => $anexo->id,
        'tipo_anexo' => $anexo->tipo_anexo,
        'tipo_anexo_label' => $this->getTipoAnexoLabel($anexo->tipo_anexo),
        'arquivo_path' => $anexo->arquivo_path,
        'arquivo_nome' => $anexo->arquivo_nome,
        'status' => $anexo->status,
        'data_envio' => $anexo->enviado_em ? $anexo->enviado_em->format('d/m/Y') : null,
        'motivo_recusa' => $anexo->motivo_recusa,
        'is_documento_fiscal' => $this->isDocumentoFiscal($anexo->tipo_anexo),
        'pode_reenviar' => $this->podeReenviar($anexo),
        'pode_remover' => $this->podeRemover($anexo),

        // ✅ NOVOS CAMPOS
        'enviado_por' => $anexo->enviadoPor ? $anexo->enviadoPor->name : null,
        'enviado_em' => $anexo->enviado_em ? $anexo->enviado_em->format('d/m/Y H:i') : null,
    ];
}
```

---

## ✅ CHECKLIST DE IMPLEMENTAÇÃO

- [ ] Verificar se as colunas `enviado_por_usuario_id` e `enviado_em` existem na tabela
- [ ] Criar migration se necessário
- [ ] Adicionar relacionamento `enviadoPor()` no model
- [ ] Atualizar método de upload para salvar `enviado_por_usuario_id` e `enviado_em`
- [ ] Adicionar eager loading no método de listagem
- [ ] Incluir campos `enviado_por` e `enviado_em` no response (formatados)
- [ ] Testar endpoint e verificar se os campos aparecem no JSON

---

## 🧪 TESTE

### Request:

```bash
GET /api/solicitacoes/4/anexos
Authorization: Bearer {token}
```

### Expected Response:

```json
{
	"solicitacao": {
		"id": 4,
		"anexos": [
			{
				"id": 1,
				"tipo_anexo_label": "Certidão Negativa",
				"arquivo_nome": "certidao.pdf",
				"status": "Pendente",
				"enviado_por": "João Silva (Responsável Técnico)", // ✅
				"enviado_em": "02/05/2026 14:30" // ✅
			}
		]
	}
}
```

---

**🎉 Frontend já está pronto para consumir esses campos!**

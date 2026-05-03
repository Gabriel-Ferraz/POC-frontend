# Guia de Implementação Backend - Alterações Orçamentárias

## 📋 Visão Geral

Este documento detalha a implementação backend necessária para o módulo de **Lançamento dos Atos de Alteração Orçamentária**, conforme especificação do sistema SIM-AM.

---

## 🗄️ Estrutura de Banco de Dados

### Tabela: `alteracoes_orcamentarias`

```sql
CREATE TABLE alteracoes_orcamentarias (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    lei_ato_id BIGINT UNSIGNED NOT NULL,
    numero_ato VARCHAR(50) NOT NULL,
    data_ato DATE NOT NULL,
    data_lancamento DATE NOT NULL,
    data_publicacao DATE NOT NULL,
    tipo_ato ENUM('Decreto', 'Resolução', 'Ato Gestor') NOT NULL,
    tipo_credito ENUM('Especial', 'Suplementar', 'Extraordinário') NOT NULL,
    tipo_recurso ENUM('Anulação', 'Excesso de arrecadação', 'Valor do Crédito') NOT NULL,
    solicitar_dotacoes_pendentes BOOLEAN DEFAULT FALSE,
    status ENUM('em_elaboracao', 'concluida') DEFAULT 'em_elaboracao',
    valor_total DECIMAL(15, 2) DEFAULT 0.00,
    created_at TIMESTAMP NULL DEFAULT NULL,
    updated_at TIMESTAMP NULL DEFAULT NULL,

    FOREIGN KEY (lei_ato_id) REFERENCES leis_atos(id) ON DELETE RESTRICT,
    INDEX idx_status (status),
    INDEX idx_data_ato (data_ato)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

### Tabela: `dotacoes_alteracoes`

```sql
CREATE TABLE dotacoes_alteracoes (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    alteracao_id BIGINT UNSIGNED NOT NULL,
    codigo_dotacao VARCHAR(50) NOT NULL,
    descricao_dotacao VARCHAR(255) NULL,
    conta_receita VARCHAR(50) NULL,
    valor_suprimido DECIMAL(15, 2) DEFAULT 0.00,
    valor_suplementado DECIMAL(15, 2) DEFAULT 0.00,
    saldo_anterior DECIMAL(15, 2) DEFAULT 0.00,
    saldo_resultante DECIMAL(15, 2) DEFAULT 0.00,
    observacao TEXT NULL,
    created_at TIMESTAMP NULL DEFAULT NULL,
    updated_at TIMESTAMP NULL DEFAULT NULL,

    FOREIGN KEY (alteracao_id) REFERENCES alteracoes_orcamentarias(id) ON DELETE CASCADE,
    INDEX idx_codigo_dotacao (codigo_dotacao),
    INDEX idx_alteracao_id (alteracao_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

### Migration Laravel

```php
<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('alteracoes_orcamentarias', function (Blueprint $table) {
            $table->id();
            $table->foreignId('lei_ato_id')->constrained('leis_atos')->onDelete('restrict');
            $table->string('numero_ato', 50);
            $table->date('data_ato');
            $table->date('data_lancamento');
            $table->date('data_publicacao');
            $table->enum('tipo_ato', ['Decreto', 'Resolução', 'Ato Gestor']);
            $table->enum('tipo_credito', ['Especial', 'Suplementar', 'Extraordinário']);
            $table->enum('tipo_recurso', ['Anulação', 'Excesso de arrecadação', 'Valor do Crédito']);
            $table->boolean('solicitar_dotacoes_pendentes')->default(false);
            $table->enum('status', ['em_elaboracao', 'concluida'])->default('em_elaboracao');
            $table->decimal('valor_total', 15, 2)->default(0.00);
            $table->timestamps();

            $table->index('status');
            $table->index('data_ato');
        });

        Schema::create('dotacoes_alteracoes', function (Blueprint $table) {
            $table->id();
            $table->foreignId('alteracao_id')->constrained('alteracoes_orcamentarias')->onDelete('cascade');
            $table->string('codigo_dotacao', 50);
            $table->string('descricao_dotacao')->nullable();
            $table->string('conta_receita', 50)->nullable();
            $table->decimal('valor_suprimido', 15, 2)->default(0.00);
            $table->decimal('valor_suplementado', 15, 2)->default(0.00);
            $table->decimal('saldo_anterior', 15, 2)->default(0.00);
            $table->decimal('saldo_resultante', 15, 2)->default(0.00);
            $table->text('observacao')->nullable();
            $table->timestamps();

            $table->index('codigo_dotacao');
            $table->index('alteracao_id');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('dotacoes_alteracoes');
        Schema::dropIfExists('alteracoes_orcamentarias');
    }
};
```

---

## 📦 Models Eloquent

### Model: `AlteracaoOrcamentaria`

```php
<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class AlteracaoOrcamentaria extends Model
{
    use HasFactory;

    protected $table = 'alteracoes_orcamentarias';

    protected $fillable = [
        'lei_ato_id',
        'numero_ato',
        'data_ato',
        'data_lancamento',
        'data_publicacao',
        'tipo_ato',
        'tipo_credito',
        'tipo_recurso',
        'solicitar_dotacoes_pendentes',
        'status',
        'valor_total',
    ];

    protected $casts = [
        'data_ato' => 'date',
        'data_lancamento' => 'date',
        'data_publicacao' => 'date',
        'solicitar_dotacoes_pendentes' => 'boolean',
        'valor_total' => 'decimal:2',
    ];

    protected $appends = ['valor_total_formatado'];

    // Relacionamentos
    public function leiAto(): BelongsTo
    {
        return $this->belongsTo(LeiAto::class, 'lei_ato_id');
    }

    public function dotacoes(): HasMany
    {
        return $this->hasMany(DotacaoAlteracao::class, 'alteracao_id');
    }

    // Acessores
    public function getValorTotalFormatadoAttribute(): string
    {
        return 'R$ ' . number_format($this->valor_total, 2, ',', '.');
    }

    // Métodos auxiliares
    public function calcularValorTotal(): void
    {
        $this->valor_total = $this->dotacoes()->sum('valor_suplementado');
        $this->save();
    }

    public function concluir(): bool
    {
        if ($this->status === 'concluida') {
            throw new \Exception('Esta alteração já foi concluída.');
        }

        if ($this->dotacoes()->count() === 0) {
            throw new \Exception('Adicione pelo menos uma dotação antes de concluir.');
        }

        $this->status = 'concluida';
        return $this->save();
    }

    public function podeEditar(): bool
    {
        return $this->status === 'em_elaboracao';
    }
}
```

### Model: `DotacaoAlteracao`

```php
<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class DotacaoAlteracao extends Model
{
    use HasFactory;

    protected $table = 'dotacoes_alteracoes';

    protected $fillable = [
        'alteracao_id',
        'codigo_dotacao',
        'descricao_dotacao',
        'conta_receita',
        'valor_suprimido',
        'valor_suplementado',
        'saldo_anterior',
        'saldo_resultante',
        'observacao',
    ];

    protected $casts = [
        'valor_suprimido' => 'decimal:2',
        'valor_suplementado' => 'decimal:2',
        'saldo_anterior' => 'decimal:2',
        'saldo_resultante' => 'decimal:2',
    ];

    // Relacionamentos
    public function alteracao(): BelongsTo
    {
        return $this->belongsTo(AlteracaoOrcamentaria::class, 'alteracao_id');
    }

    // Boot para recalcular total quando dotação for salva/excluída
    protected static function booted(): void
    {
        static::saved(function (DotacaoAlteracao $dotacao) {
            $dotacao->alteracao->calcularValorTotal();
        });

        static::deleted(function (DotacaoAlteracao $dotacao) {
            $dotacao->alteracao->calcularValorTotal();
        });
    }

    // Calcular saldo resultante automaticamente
    public function calcularSaldoResultante(): float
    {
        return $this->saldo_anterior - $this->valor_suprimido + $this->valor_suplementado;
    }
}
```

---

## 🛣️ Routes (api.php)

```php
<?php

use App\Http\Controllers\AlteracaoOrcamentariaController;
use Illuminate\Support\Facades\Route;

Route::middleware(['auth:sanctum'])->group(function () {

    // Alterações Orçamentárias
    Route::prefix('orcamentario/alteracoes')->group(function () {
        Route::get('/', [AlteracaoOrcamentariaController::class, 'index']);
        Route::post('/', [AlteracaoOrcamentariaController::class, 'store']);
        Route::get('/{id}', [AlteracaoOrcamentariaController::class, 'show']);
        Route::put('/{id}', [AlteracaoOrcamentariaController::class, 'update']);
        Route::delete('/{id}', [AlteracaoOrcamentariaController::class, 'destroy']);
        Route::post('/{id}/concluir', [AlteracaoOrcamentariaController::class, 'concluir']);
        Route::get('/{id}/pdf', [AlteracaoOrcamentariaController::class, 'gerarPdf']);

        // Dotações
        Route::get('/{id}/dotacoes', [AlteracaoOrcamentariaController::class, 'listarDotacoes']);
        Route::post('/{id}/dotacoes', [AlteracaoOrcamentariaController::class, 'criarDotacao']);
        Route::put('/{id}/dotacoes/{dotacaoId}', [AlteracaoOrcamentariaController::class, 'atualizarDotacao']);
        Route::delete('/{id}/dotacoes/{dotacaoId}', [AlteracaoOrcamentariaController::class, 'excluirDotacao']);
    });

    // Consulta de saldo de dotação
    Route::get('orcamentario/dotacoes/{codigoDotacao}/saldo', [AlteracaoOrcamentariaController::class, 'consultarSaldo']);
});
```

---

## 🎮 Controller

### `AlteracaoOrcamentariaController.php`

```php
<?php

namespace App\Http\Controllers;

use App\Models\AlteracaoOrcamentaria;
use App\Models\DotacaoAlteracao;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\DB;

class AlteracaoOrcamentariaController extends Controller
{
    /**
     * Listar todas as alterações orçamentárias
     */
    public function index(): JsonResponse
    {
        $alteracoes = AlteracaoOrcamentaria::with('leiAto', 'dotacoes')
            ->orderBy('data_ato', 'desc')
            ->get();

        return response()->json(['alteracoes' => $alteracoes]);
    }

    /**
     * Exibir uma alteração específica
     */
    public function show(int $id): JsonResponse
    {
        $alteracao = AlteracaoOrcamentaria::with('leiAto', 'dotacoes')
            ->findOrFail($id);

        return response()->json(['alteracao' => $alteracao]);
    }

    /**
     * Criar nova alteração orçamentária
     */
    public function store(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'lei_ato_id' => 'required|exists:leis_atos,id',
            'numero_ato' => 'required|string|max:50',
            'data_ato' => 'required|date',
            'data_lancamento' => 'required|date',
            'data_publicacao' => 'required|date',
            'tipo_ato' => 'required|in:Decreto,Resolução,Ato Gestor',
            'tipo_credito' => 'required|in:Especial,Suplementar,Extraordinário',
            'tipo_recurso' => 'required|in:Anulação,Excesso de arrecadação,Valor do Crédito',
            'solicitar_dotacoes_pendentes' => 'boolean',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $alteracao = AlteracaoOrcamentaria::create($validator->validated());
        $alteracao->load('leiAto');

        return response()->json(['alteracao' => $alteracao], 201);
    }

    /**
     * Atualizar alteração orçamentária
     */
    public function update(Request $request, int $id): JsonResponse
    {
        $alteracao = AlteracaoOrcamentaria::findOrFail($id);

        if (!$alteracao->podeEditar()) {
            return response()->json(['message' => 'Alteração concluída não pode ser editada.'], 403);
        }

        $validator = Validator::make($request->all(), [
            'lei_ato_id' => 'sometimes|exists:leis_atos,id',
            'numero_ato' => 'sometimes|string|max:50',
            'data_ato' => 'sometimes|date',
            'data_lancamento' => 'sometimes|date',
            'data_publicacao' => 'sometimes|date',
            'tipo_ato' => 'sometimes|in:Decreto,Resolução,Ato Gestor',
            'tipo_credito' => 'sometimes|in:Especial,Suplementar,Extraordinário',
            'tipo_recurso' => 'sometimes|in:Anulação,Excesso de arrecadação,Valor do Crédito',
            'solicitar_dotacoes_pendentes' => 'sometimes|boolean',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $alteracao->update($validator->validated());
        $alteracao->load('leiAto');

        return response()->json(['alteracao' => $alteracao]);
    }

    /**
     * Excluir alteração orçamentária
     */
    public function destroy(int $id): JsonResponse
    {
        $alteracao = AlteracaoOrcamentaria::findOrFail($id);

        if (!$alteracao->podeEditar()) {
            return response()->json(['message' => 'Alteração concluída não pode ser excluída.'], 403);
        }

        $alteracao->delete();

        return response()->json(['message' => 'Alteração excluída com sucesso.'], 200);
    }

    /**
     * Concluir alteração orçamentária
     */
    public function concluir(int $id): JsonResponse
    {
        $alteracao = AlteracaoOrcamentaria::findOrFail($id);

        try {
            $alteracao->concluir();
            $alteracao->load('leiAto', 'dotacoes');

            return response()->json(['alteracao' => $alteracao]);
        } catch (\Exception $e) {
            return response()->json(['message' => $e->getMessage()], 400);
        }
    }

    // ========== DOTAÇÕES ==========

    /**
     * Listar dotações de uma alteração
     */
    public function listarDotacoes(int $id): JsonResponse
    {
        $alteracao = AlteracaoOrcamentaria::findOrFail($id);
        $dotacoes = $alteracao->dotacoes()->orderBy('codigo_dotacao')->get();

        return response()->json(['dotacoes' => $dotacoes]);
    }

    /**
     * Criar dotação
     */
    public function criarDotacao(Request $request, int $id): JsonResponse
    {
        $alteracao = AlteracaoOrcamentaria::findOrFail($id);

        if (!$alteracao->podeEditar()) {
            return response()->json(['message' => 'Alteração concluída não pode ser editada.'], 403);
        }

        $validator = Validator::make($request->all(), [
            'codigo_dotacao' => 'required|string|max:50',
            'conta_receita' => 'nullable|string|max:50',
            'valor_suprimido' => 'required|numeric|min:0',
            'valor_suplementado' => 'required|numeric|min:0',
            'observacao' => 'nullable|string',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $dados = $validator->validated();

        // Consultar saldo da dotação
        $saldo = $this->buscarSaldoDotacao($dados['codigo_dotacao']);

        if (!$saldo) {
            return response()->json(['message' => 'Dotação não encontrada no sistema.'], 404);
        }

        // Validar se há saldo suficiente para suplementação
        if ($dados['valor_suplementado'] > $saldo['saldo_disponivel']) {
            return response()->json([
                'message' => 'Saldo insuficiente para suplementação. Saldo disponível: R$ ' .
                             number_format($saldo['saldo_disponivel'], 2, ',', '.')
            ], 400);
        }

        $dados['alteracao_id'] = $alteracao->id;
        $dados['descricao_dotacao'] = $saldo['descricao'];
        $dados['saldo_anterior'] = $saldo['saldo_disponivel'];
        $dados['saldo_resultante'] = $saldo['saldo_disponivel'] - $dados['valor_suprimido'] + $dados['valor_suplementado'];

        $dotacao = DotacaoAlteracao::create($dados);

        return response()->json(['dotacao' => $dotacao], 201);
    }

    /**
     * Atualizar dotação
     */
    public function atualizarDotacao(Request $request, int $id, int $dotacaoId): JsonResponse
    {
        $alteracao = AlteracaoOrcamentaria::findOrFail($id);

        if (!$alteracao->podeEditar()) {
            return response()->json(['message' => 'Alteração concluída não pode ser editada.'], 403);
        }

        $dotacao = DotacaoAlteracao::where('alteracao_id', $id)
            ->where('id', $dotacaoId)
            ->firstOrFail();

        $validator = Validator::make($request->all(), [
            'codigo_dotacao' => 'sometimes|string|max:50',
            'conta_receita' => 'nullable|string|max:50',
            'valor_suprimido' => 'sometimes|numeric|min:0',
            'valor_suplementado' => 'sometimes|numeric|min:0',
            'observacao' => 'nullable|string',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $dados = $validator->validated();

        // Se código mudou, reconsultar saldo
        if (isset($dados['codigo_dotacao']) && $dados['codigo_dotacao'] !== $dotacao->codigo_dotacao) {
            $saldo = $this->buscarSaldoDotacao($dados['codigo_dotacao']);

            if (!$saldo) {
                return response()->json(['message' => 'Dotação não encontrada no sistema.'], 404);
            }

            $dados['descricao_dotacao'] = $saldo['descricao'];
            $dados['saldo_anterior'] = $saldo['saldo_disponivel'];
        }

        // Recalcular saldo resultante
        $valorSuprimido = $dados['valor_suprimido'] ?? $dotacao->valor_suprimido;
        $valorSupplementado = $dados['valor_suplementado'] ?? $dotacao->valor_suplementado;
        $saldoAnterior = $dados['saldo_anterior'] ?? $dotacao->saldo_anterior;

        $dados['saldo_resultante'] = $saldoAnterior - $valorSuprimido + $valorSupplementado;

        // Validar saldo
        if ($valorSupplementado > $saldoAnterior) {
            return response()->json([
                'message' => 'Saldo insuficiente para suplementação. Saldo disponível: R$ ' .
                             number_format($saldoAnterior, 2, ',', '.')
            ], 400);
        }

        $dotacao->update($dados);

        return response()->json(['dotacao' => $dotacao]);
    }

    /**
     * Excluir dotação
     */
    public function excluirDotacao(int $id, int $dotacaoId): JsonResponse
    {
        $alteracao = AlteracaoOrcamentaria::findOrFail($id);

        if (!$alteracao->podeEditar()) {
            return response()->json(['message' => 'Alteração concluída não pode ser editada.'], 403);
        }

        $dotacao = DotacaoAlteracao::where('alteracao_id', $id)
            ->where('id', $dotacaoId)
            ->firstOrFail();

        $dotacao->delete();

        return response()->json(['message' => 'Dotação excluída com sucesso.'], 200);
    }

    /**
     * Consultar saldo de uma dotação
     */
    public function consultarSaldo(string $codigoDotacao): JsonResponse
    {
        $saldo = $this->buscarSaldoDotacao($codigoDotacao);

        if (!$saldo) {
            return response()->json(['message' => 'Dotação não encontrada.'], 404);
        }

        return response()->json(['saldo' => $saldo]);
    }

    /**
     * Gerar PDF da alteração orçamentária
     */
    public function gerarPdf(int $id): mixed
    {
        $alteracao = AlteracaoOrcamentaria::with('leiAto', 'dotacoes')
            ->findOrFail($id);

        // TODO: Implementar geração de PDF
        // Sugestão: usar biblioteca como TCPDF ou DomPDF
        // Exemplo básico:

        // $pdf = \PDF::loadView('pdfs.alteracao-orcamentaria', [
        //     'alteracao' => $alteracao,
        // ]);

        // return $pdf->download("alteracao-{$alteracao->numero_ato}.pdf");

        return response()->json([
            'message' => 'Funcionalidade de geração de PDF ainda não implementada.',
            'alteracao' => $alteracao,
        ]);
    }

    /**
     * Buscar saldo de uma dotação no sistema orçamentário
     *
     * NOTA: Este método deve ser implementado conforme sua estrutura de banco de dados.
     * Aqui está um exemplo genérico que você deve adaptar.
     */
    private function buscarSaldoDotacao(string $codigoDotacao): ?array
    {
        // TODO: Implementar consulta real à tabela de dotações orçamentárias
        // Exemplo genérico:

        // $dotacao = DB::table('dotacoes_orcamentarias')
        //     ->where('codigo', $codigoDotacao)
        //     ->first();

        // if (!$dotacao) {
        //     return null;
        // }

        // return [
        //     'codigo_dotacao' => $dotacao->codigo,
        //     'descricao' => $dotacao->descricao,
        //     'saldo_disponivel' => $dotacao->saldo_disponivel,
        //     'saldo_empenhado' => $dotacao->saldo_empenhado,
        //     'saldo_bloqueado' => $dotacao->saldo_bloqueado,
        // ];

        // Exemplo MOCK para desenvolvimento:
        return [
            'codigo_dotacao' => $codigoDotacao,
            'descricao' => 'Dotação ' . $codigoDotacao,
            'saldo_disponivel' => 50000.00,
            'saldo_empenhado' => 10000.00,
            'saldo_bloqueado' => 5000.00,
        ];
    }
}
```

---

## 📝 Validações e Regras de Negócio

### 1. Criação de Alteração Orçamentária

- **Campo obrigatórios:** lei_ato_id, numero_ato, data_ato, data_lancamento, data_publicacao, tipo_ato, tipo_credito, tipo_recurso
- **Status inicial:** Sempre `em_elaboracao`
- **Validação de datas:** data_ato deve ser anterior ou igual a data_publicacao

### 2. Edição de Alteração Orçamentária

- **Regra:** Apenas alterações com status `em_elaboracao` podem ser editadas
- **Validação:** Verificar `podeEditar()` antes de permitir qualquer modificação

### 3. Exclusão de Alteração Orçamentária

- **Regra:** Apenas alterações com status `em_elaboracao` podem ser excluídas
- **Cascade:** Ao excluir alteração, todas as dotações vinculadas são excluídas automaticamente

### 4. Concluir Alteração Orçamentária

- **Pré-requisitos:**
    - Status atual deve ser `em_elaboracao`
    - Deve ter pelo menos 1 dotação cadastrada
- **Ação:** Muda status para `concluida` (irreversível)

### 5. Criação de Dotação

- **Validações:**
    - Alteração deve estar em `em_elaboracao`
    - Código da dotação deve existir no sistema orçamentário
    - Valor suplementado não pode exceder saldo disponível
    - Se tipo_recurso = "Excesso de arrecadação", conta_receita é obrigatória

### 6. Cálculo Automático

- **Saldo resultante:** `saldo_anterior - valor_suprimido + valor_suplementado`
- **Valor total da alteração:** Soma de todos os `valor_suplementado` das dotações

---

## 🔍 Exemplos de Requisições

### Criar Alteração Orçamentária

```http
POST /api/orcamentario/alteracoes
Content-Type: application/json
Authorization: Bearer {token}

{
  "lei_ato_id": 1,
  "numero_ato": "001/2026",
  "data_ato": "2026-04-15",
  "data_lancamento": "2026-04-16",
  "data_publicacao": "2026-04-20",
  "tipo_ato": "Decreto",
  "tipo_credito": "Suplementar",
  "tipo_recurso": "Anulação",
  "solicitar_dotacoes_pendentes": false
}
```

**Resposta:**

```json
{
	"alteracao": {
		"id": 1,
		"lei_ato_id": 1,
		"numero_ato": "001/2026",
		"data_ato": "2026-04-15",
		"data_lancamento": "2026-04-16",
		"data_publicacao": "2026-04-20",
		"tipo_ato": "Decreto",
		"tipo_credito": "Suplementar",
		"tipo_recurso": "Anulação",
		"solicitar_dotacoes_pendentes": false,
		"status": "em_elaboracao",
		"valor_total": "0.00",
		"created_at": "2026-05-03T10:00:00.000000Z",
		"lei_ato": {
			"id": 1,
			"numero": "100/2026",
			"tipo": "Lei",
			"data_ato": "2026-03-01"
		}
	}
}
```

### Adicionar Dotação

```http
POST /api/orcamentario/alteracoes/1/dotacoes
Content-Type: application/json
Authorization: Bearer {token}

{
  "codigo_dotacao": "1001.3.3.90.30.00",
  "conta_receita": "1.1.1.2.00.00",
  "valor_suprimido": 5000.00,
  "valor_suplementado": 10000.00,
  "observacao": "Suplementação para material de consumo"
}
```

**Resposta:**

```json
{
	"dotacao": {
		"id": 1,
		"alteracao_id": 1,
		"codigo_dotacao": "1001.3.3.90.30.00",
		"descricao_dotacao": "Material de Consumo",
		"conta_receita": "1.1.1.2.00.00",
		"valor_suprimido": "5000.00",
		"valor_suplementado": "10000.00",
		"saldo_anterior": "50000.00",
		"saldo_resultante": "55000.00",
		"observacao": "Suplementação para material de consumo",
		"created_at": "2026-05-03T10:05:00.000000Z"
	}
}
```

### Consultar Saldo de Dotação

```http
GET /api/orcamentario/dotacoes/1001.3.3.90.30.00/saldo
Authorization: Bearer {token}
```

**Resposta:**

```json
{
	"saldo": {
		"codigo_dotacao": "1001.3.3.90.30.00",
		"descricao": "Material de Consumo",
		"saldo_disponivel": 50000.0,
		"saldo_empenhado": 10000.0,
		"saldo_bloqueado": 5000.0
	}
}
```

### Concluir Alteração

```http
POST /api/orcamentario/alteracoes/1/concluir
Authorization: Bearer {token}
```

**Resposta:**

```json
{
  "alteracao": {
    "id": 1,
    "status": "concluida",
    "valor_total": "10000.00",
    "dotacoes": [...]
  }
}
```

---

## 📄 Geração de PDF

Para implementar a geração de PDF, recomendamos usar uma das seguintes bibliotecas:

### Opção 1: DomPDF (Recomendado)

```bash
composer require barryvdh/laravel-dompdf
```

**Exemplo de implementação:**

```php
use Barryvdh\DomPDF\Facade\Pdf;

public function gerarPdf(int $id)
{
    $alteracao = AlteracaoOrcamentaria::with('leiAto', 'dotacoes')
        ->findOrFail($id);

    $pdf = Pdf::loadView('pdfs.alteracao-orcamentaria', [
        'alteracao' => $alteracao,
    ]);

    return $pdf->download("alteracao-{$alteracao->numero_ato}.pdf");
}
```

**View: `resources/views/pdfs/alteracao-orcamentaria.blade.php`**

```html
<!DOCTYPE html>
<html>
	<head>
		<meta charset="UTF-8" />
		<title>Alteração Orçamentária {{ $alteracao->numero_ato }}</title>
		<style>
			body {
				font-family: Arial, sans-serif;
				font-size: 12px;
			}
			.header {
				text-align: center;
				margin-bottom: 20px;
			}
			table {
				width: 100%;
				border-collapse: collapse;
			}
			th,
			td {
				border: 1px solid #000;
				padding: 5px;
				text-align: left;
			}
			th {
				background-color: #f0f0f0;
			}
			.totais {
				font-weight: bold;
				background-color: #e0e0e0;
			}
		</style>
	</head>
	<body>
		<div class="header">
			<h2>ALTERAÇÃO ORÇAMENTÁRIA</h2>
			<h3>{{ $alteracao->tipo_ato }} Nº {{ $alteracao->numero_ato }}</h3>
		</div>

		<table>
			<tr>
				<th>Lei/Ato Base:</th>
				<td>{{ $alteracao->leiAto->numero }} - {{ $alteracao->leiAto->tipo }}</td>
			</tr>
			<tr>
				<th>Data do Ato:</th>
				<td>{{ $alteracao->data_ato->format('d/m/Y') }}</td>
			</tr>
			<tr>
				<th>Data de Lançamento:</th>
				<td>{{ $alteracao->data_lancamento->format('d/m/Y') }}</td>
			</tr>
			<tr>
				<th>Data de Publicação:</th>
				<td>{{ $alteracao->data_publicacao->format('d/m/Y') }}</td>
			</tr>
			<tr>
				<th>Tipo de Crédito:</th>
				<td>{{ $alteracao->tipo_credito }}</td>
			</tr>
			<tr>
				<th>Tipo de Recurso:</th>
				<td>{{ $alteracao->tipo_recurso }}</td>
			</tr>
		</table>

		<h3>Dotações Alteradas</h3>
		<table>
			<thead>
				<tr>
					<th>Código Dotação</th>
					<th>Conta Receita</th>
					<th>Suprimido (R$)</th>
					<th>Suplementado (R$)</th>
					<th>Saldo Anterior (R$)</th>
					<th>Saldo Resultante (R$)</th>
				</tr>
			</thead>
			<tbody>
				@foreach($alteracao->dotacoes as $dotacao)
				<tr>
					<td>{{ $dotacao->codigo_dotacao }}</td>
					<td>{{ $dotacao->conta_receita ?? '-' }}</td>
					<td>{{ number_format($dotacao->valor_suprimido, 2, ',', '.') }}</td>
					<td>{{ number_format($dotacao->valor_suplementado, 2, ',', '.') }}</td>
					<td>{{ number_format($dotacao->saldo_anterior, 2, ',', '.') }}</td>
					<td>{{ number_format($dotacao->saldo_resultante, 2, ',', '.') }}</td>
				</tr>
				@endforeach
			</tbody>
			<tfoot>
				<tr class="totais">
					<td colspan="2">TOTAIS:</td>
					<td>{{ number_format($alteracao->dotacoes->sum('valor_suprimido'), 2, ',', '.') }}</td>
					<td>{{ number_format($alteracao->dotacoes->sum('valor_suplementado'), 2, ',', '.') }}</td>
					<td colspan="2"></td>
				</tr>
			</tfoot>
		</table>
	</body>
</html>
```

---

## 🔐 Permissões

Recomenda-se criar um middleware para verificar se o usuário tem permissão para gerenciar alterações orçamentárias:

```php
<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;

class CheckOrcamentarioPermission
{
    public function handle(Request $request, Closure $next)
    {
        if (!auth()->user()->hasRole('operador_orcamentario')) {
            return response()->json(['message' => 'Acesso negado.'], 403);
        }

        return $next($request);
    }
}
```

Aplicar no grupo de rotas:

```php
Route::middleware(['auth:sanctum', 'operador_orcamentario'])->group(function () {
    // Rotas de alterações orçamentárias...
});
```

---

## 🧪 Testes

### Teste de Criação de Alteração

```php
public function test_criar_alteracao_orcamentaria()
{
    $leiAto = LeiAto::factory()->create();

    $response = $this->postJson('/api/orcamentario/alteracoes', [
        'lei_ato_id' => $leiAto->id,
        'numero_ato' => '001/2026',
        'data_ato' => '2026-04-15',
        'data_lancamento' => '2026-04-16',
        'data_publicacao' => '2026-04-20',
        'tipo_ato' => 'Decreto',
        'tipo_credito' => 'Suplementar',
        'tipo_recurso' => 'Anulação',
        'solicitar_dotacoes_pendentes' => false,
    ]);

    $response->assertStatus(201)
        ->assertJsonStructure(['alteracao']);
}
```

---

## 📚 Documentação Adicional

- Sempre retornar respostas JSON estruturadas
- Usar HTTP status codes apropriados (200, 201, 400, 403, 404, 422, 500)
- Implementar logs para auditoria de alterações
- Considerar implementar versionamento de alterações orçamentárias
- Criar índices no banco para otimizar consultas

---

## ✅ Checklist de Implementação

- [ ] Criar migrations
- [ ] Criar models com relacionamentos
- [ ] Criar controller com todos os métodos
- [ ] Configurar rotas
- [ ] Implementar validações
- [ ] Implementar método de consulta de saldo real
- [ ] Implementar geração de PDF
- [ ] Configurar permissões
- [ ] Criar testes unitários e de integração
- [ ] Documentar API (Swagger/Postman)

---

**Versão:** 1.0  
**Data:** 03/05/2026  
**Autor:** Claude Code

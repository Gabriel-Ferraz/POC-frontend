# 📊 GUIA COMPLETO: Backend Exportador SIM-AM/SIMAM

## 🎯 OBJETIVO

Implementar backend completo do sistema de exportação de prestação de contas para o SIM-AM/SIMAM do Tribunal de Contas, conforme requisitos da especificação oficial.

---

## 📋 DIFERENÇAS EM RELAÇÃO AO GUIA ANTERIOR

Este guia **substitui** o anterior e implementa:

- ✅ Seleção de tipo de geração (Abertura/Diário/Fechamento/Mensal)
- ✅ Filtro "Somente ativos"
- ✅ Sistema de ordenação de arquivos
- ✅ Layouts configuráveis no banco de dados
- ✅ Estrutura mais robusta e escalável

---

## 🗄️ ESTRUTURA DO BANCO DE DADOS

### 1. Tabela: `simam_layouts`

Armazena os layouts/arquivos disponíveis para exportação.

```sql
CREATE TABLE simam_layouts (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    chave VARCHAR(100) NOT NULL UNIQUE COMMENT 'Identificador único (ex: plano_contabil)',
    nome VARCHAR(150) NOT NULL COMMENT 'Nome de exibição (ex: PlanoContabil)',
    modulo VARCHAR(100) NOT NULL COMMENT 'Módulo (contabilidade)',
    tipos_geracao JSON NOT NULL COMMENT '["mensal", "abertura", "diario", "fechamento"]',
    ordem_geracao INT NOT NULL DEFAULT 1,
    ativo BOOLEAN DEFAULT TRUE,
    ultima_geracao TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    INDEX idx_modulo (modulo),
    INDEX idx_ativo (ativo),
    INDEX idx_ordem (ordem_geracao)
);
```

**Dados iniciais:**

```sql
INSERT INTO simam_layouts (chave, nome, modulo, tipos_geracao, ordem_geracao, ativo) VALUES
('plano_contabil', 'PlanoContabil', 'contabilidade', '["mensal", "abertura"]', 1, TRUE),
('movimento_contabil_mensal', 'MovimentoContabilMensal', 'contabilidade', '["mensal"]', 2, TRUE),
('diario_contabil', 'DiarioContabil', 'contabilidade', '["diario"]', 3, TRUE),
('movimento_realizavel', 'MovimentoRealizavel', 'contabilidade', '["mensal", "fechamento"]', 4, TRUE),
('balancete_verificacao', 'BalanceteVerificacao', 'contabilidade', '["mensal", "fechamento"]', 5, TRUE),
('despesa_orcamentaria', 'DespesaOrcamentaria', 'contabilidade', '["mensal"]', 6, FALSE);
```

---

### 2. Tabela: `simam_exportacoes`

Armazena o histórico de exportações realizadas.

```sql
CREATE TABLE simam_exportacoes (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    ano INT NOT NULL,
    mes INT NULL COMMENT 'NULL para tipo anual',
    modulo VARCHAR(100) NOT NULL,
    tipo_geracao ENUM('mensal', 'abertura', 'diario', 'fechamento') NOT NULL,
    somente_ativos BOOLEAN DEFAULT TRUE,
    nome_zip VARCHAR(255) NOT NULL,
    caminho_zip VARCHAR(500) NOT NULL,
    status ENUM('sucesso', 'erro', 'processando') NOT NULL DEFAULT 'processando',
    usuario_id BIGINT UNSIGNED NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    FOREIGN KEY (usuario_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_usuario (usuario_id),
    INDEX idx_ano_mes (ano, mes),
    INDEX idx_status (status)
);
```

---

### 3. Tabela: `simam_arquivos_gerados`

Armazena os arquivos individuais gerados em cada exportação.

```sql
CREATE TABLE simam_arquivos_gerados (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    exportacao_id BIGINT UNSIGNED NOT NULL,
    layout_chave VARCHAR(100) NOT NULL,
    nome_arquivo VARCHAR(255) NOT NULL,
    caminho_arquivo VARCHAR(500) NOT NULL,
    status ENUM('gerado', 'erro', 'processando') NOT NULL DEFAULT 'processando',
    quantidade_registros INT NOT NULL DEFAULT 0,
    mensagem_erro TEXT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (exportacao_id) REFERENCES simam_exportacoes(id) ON DELETE CASCADE,
    INDEX idx_exportacao (exportacao_id),
    INDEX idx_layout (layout_chave)
);
```

---

## 📡 ENDPOINTS

### 1. GET /api/prestacao-contas/layouts

Lista layouts disponíveis (com filtro de ativos opcionalmente).

**Headers:**

```
Authorization: Bearer {token}
```

**Query Params:**

- `somente_ativos` (boolean, opcional): Se true, retorna só layouts ativos

**Response (200 OK):**

```json
[
	{
		"id": 1,
		"chave": "plano_contabil",
		"nome": "PlanoContabil",
		"modulo": "contabilidade",
		"tipos_geracao": ["mensal", "abertura"],
		"ordem_geracao": 1,
		"ativo": true,
		"ultima_geracao": "2026-05-01T14:30:00.000Z"
	},
	{
		"id": 2,
		"chave": "movimento_contabil_mensal",
		"nome": "MovimentoContabilMensal",
		"modulo": "contabilidade",
		"tipos_geracao": ["mensal"],
		"ordem_geracao": 2,
		"ativo": true,
		"ultima_geracao": "2026-04-28T10:15:00.000Z"
	}
]
```

---

### 2. POST /api/prestacao-contas/exportar

Gera arquivos de prestação de contas e compacta em ZIP.

**Headers:**

```
Authorization: Bearer {token}
Content-Type: application/json
```

**Request Body:**

```json
{
	"year": 2026,
	"module": "contabilidade",
	"generationType": "mensal",
	"month": 5,
	"onlyActive": true,
	"files": ["plano_contabil", "movimento_contabil_mensal"]
}
```

**Validação:**

```php
$validated = $request->validate([
    'year' => 'required|integer|min:2000|max:2100',
    'module' => 'required|string|in:contabilidade',
    'generationType' => 'required|in:mensal,abertura,diario,fechamento',
    'month' => 'nullable|integer|min:1|max:12',
    'onlyActive' => 'required|boolean',
    'files' => 'required|array|min:1',
    'files.*' => 'required|string|exists:simam_layouts,chave'
]);

// Validar mês obrigatório para tipo mensal
if ($validated['generationType'] === 'mensal' && empty($validated['month'])) {
    return response()->json([
        'message' => 'O campo mês é obrigatório para geração mensal'
    ], 422);
}
```

**Response (200 OK):**

```json
{
	"id": 42,
	"zipName": "12526_contabil_II_mensal_2026_05.zip",
	"status": "sucesso",
	"arquivos": [
		{
			"id": "101",
			"nome": "PlanoContabil",
			"status": "gerado",
			"quantidadeRegistros": 11,
			"geradoEm": "03/05/2026 15:30:45",
			"downloadUrl": "/api/prestacao-contas/exportacoes/42/arquivos/101/download"
		},
		{
			"id": "102",
			"nome": "MovimentoContabilMensal",
			"status": "gerado",
			"quantidadeRegistros": 248,
			"geradoEm": "03/05/2026 15:30:47",
			"downloadUrl": "/api/prestacao-contas/exportacoes/42/arquivos/102/download"
		}
	],
	"createdAt": "2026-05-03T15:30:45.000Z"
}
```

---

### 3. POST /api/prestacao-contas/layouts/reordenar

Reordena os layouts (altera campo `ordem_geracao`).

**Headers:**

```
Authorization: Bearer {token}
Content-Type: application/json
```

**Request Body:**

```json
{
	"layoutIds": ["movimento_contabil_mensal", "plano_contabil", "diario_contabil"]
}
```

**Response (200 OK):**

```json
{
	"message": "Ordem atualizada com sucesso"
}
```

---

### 4. GET /api/prestacao-contas/exportacoes

Lista exportações do usuário logado.

**Response (200 OK):**

```json
[
	{
		"id": 42,
		"ano": 2026,
		"mes": 5,
		"modulo": "contabilidade",
		"tipo_geracao": "mensal",
		"nome_zip": "12526_contabil_II_mensal_2026_05.zip",
		"status": "sucesso",
		"created_at": "2026-05-03T15:30:45.000Z"
	}
]
```

---

### 5. GET /api/prestacao-contas/exportacoes/{id}/download

Download do arquivo ZIP completo.

**Response:**

- Content-Type: `application/zip`
- Binary stream

---

### 6. GET /api/prestacao-contas/exportacoes/{exportacaoId}/arquivos/{arquivoId}/download

Download de arquivo individual.

**Response:**

- Content-Type: `text/plain` ou conforme formato
- Binary stream

---

## 💻 IMPLEMENTAÇÃO LARAVEL

### Controller: `PrestacaoContasController.php`

```php
<?php

namespace App\Http\Controllers;

use App\Models\SimamLayout;
use App\Models\SimamExportacao;
use App\Models\SimamArquivoGerado;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use ZipArchive;

class PrestacaoContasController extends Controller
{
    public function __construct()
    {
        $this->middleware('auth:sanctum');
    }

    /**
     * Listar layouts disponíveis
     */
    public function listarLayouts(Request $request)
    {
        $query = SimamLayout::query();

        if ($request->boolean('somente_ativos')) {
            $query->where('ativo', true);
        }

        $layouts = $query->orderBy('ordem_geracao')->get();

        return response()->json($layouts->map(function ($layout) {
            return [
                'id' => $layout->chave,
                'nome' => $layout->nome,
                'modulo' => $layout->modulo,
                'ordem' => $layout->ordem_geracao,
                'ultimaGeracao' => $layout->ultima_geracao
                    ? $layout->ultima_geracao->format('d/m/Y H:i')
                    : null,
                'ativo' => $layout->ativo,
            ];
        }));
    }

    /**
     * Exportar prestação de contas
     */
    public function exportar(Request $request)
    {
        $validated = $request->validate([
            'year' => 'required|integer|min:2000|max:2100',
            'module' => 'required|string|in:contabilidade',
            'generationType' => 'required|in:mensal,abertura,diario,fechamento',
            'month' => 'nullable|integer|min:1|max:12',
            'onlyActive' => 'required|boolean',
            'files' => 'required|array|min:1',
            'files.*' => 'required|string|exists:simam_layouts,chave'
        ]);

        if ($validated['generationType'] === 'mensal' && empty($validated['month'])) {
            return response()->json([
                'message' => 'O campo mês é obrigatório para geração mensal'
            ], 422);
        }

        DB::beginTransaction();

        try {
            $ano = $validated['year'];
            $mes = $validated['month'] ?? null;
            $modulo = $validated['module'];
            $tipoGeracao = $validated['generationType'];
            $arquivosSelecionados = $validated['files'];

            // Nome do ZIP
            $nomeZip = sprintf(
                '12526_%s_%s_%d%s.zip',
                strtolower($modulo),
                $this->getTipoSigla($tipoGeracao),
                $ano,
                $mes ? sprintf('_%02d', $mes) : ''
            );

            // Criar exportação
            $exportacao = SimamExportacao::create([
                'ano' => $ano,
                'mes' => $mes,
                'modulo' => $modulo,
                'tipo_geracao' => $tipoGeracao,
                'somente_ativos' => $validated['onlyActive'],
                'nome_zip' => $nomeZip,
                'caminho_zip' => 'prestacao-contas/' . $nomeZip,
                'status' => 'processando',
                'usuario_id' => Auth::id(),
            ]);

            // Criar diretório temporário
            $tempDir = storage_path('app/temp/exportacao_' . $exportacao->id);
            if (!file_exists($tempDir)) {
                mkdir($tempDir, 0755, true);
            }

            $arquivosGerados = [];

            // Buscar layouts selecionados
            $layouts = SimamLayout::whereIn('chave', $arquivosSelecionados)
                ->orderBy('ordem_geracao')
                ->get();

            // Gerar cada arquivo
            foreach ($layouts as $layout) {
                $nomeArquivo = sprintf(
                    '%s_%d%s.txt',
                    $layout->nome,
                    $ano,
                    $mes ? sprintf('_%02d', $mes) : ''
                );

                $caminhoCompleto = $tempDir . '/' . $nomeArquivo;

                // Gerar arquivo (implementar lógica específica)
                $qtdRegistros = $this->gerarArquivoLayout(
                    $layout->chave,
                    $ano,
                    $mes,
                    $validated['onlyActive'],
                    $caminhoCompleto
                );

                // Registrar arquivo gerado
                $arquivoGerado = SimamArquivoGerado::create([
                    'exportacao_id' => $exportacao->id,
                    'layout_chave' => $layout->chave,
                    'nome_arquivo' => $nomeArquivo,
                    'caminho_arquivo' => 'prestacao-contas/' . $exportacao->id . '/' . $nomeArquivo,
                    'status' => 'gerado',
                    'quantidade_registros' => $qtdRegistros,
                ]);

                $arquivosGerados[] = [
                    'id' => (string) $arquivoGerado->id,
                    'nome' => $layout->nome,
                    'status' => 'gerado',
                    'quantidadeRegistros' => $qtdRegistros,
                    'geradoEm' => now()->format('d/m/Y H:i:s'),
                    'downloadUrl' => route('prestacao-contas.arquivo.download', [
                        'exportacaoId' => $exportacao->id,
                        'arquivoId' => $arquivoGerado->id
                    ]),
                ];

                // Atualizar última geração do layout
                $layout->update(['ultima_geracao' => now()]);
            }

            // Criar ZIP
            $caminhoZip = storage_path('app/prestacao-contas/' . $nomeZip);
            if (!file_exists(dirname($caminhoZip))) {
                mkdir(dirname($caminhoZip), 0755, true);
            }

            $zip = new ZipArchive();
            if ($zip->open($caminhoZip, ZipArchive::CREATE | ZipArchive::OVERWRITE) !== true) {
                throw new \Exception('Não foi possível criar arquivo ZIP');
            }

            foreach (glob($tempDir . '/*') as $arquivo) {
                $zip->addFile($arquivo, basename($arquivo));
            }

            $zip->close();

            // Limpar arquivos temporários
            array_map('unlink', glob($tempDir . '/*'));
            rmdir($tempDir);

            // Atualizar status da exportação
            $exportacao->update(['status' => 'sucesso']);

            DB::commit();

            return response()->json([
                'id' => (string) $exportacao->id,
                'zipName' => $nomeZip,
                'status' => 'sucesso',
                'arquivos' => $arquivosGerados,
                'createdAt' => $exportacao->created_at->toISOString(),
            ]);

        } catch (\Exception $e) {
            DB::rollBack();

            // Limpar temp se existir
            if (isset($tempDir) && file_exists($tempDir)) {
                array_map('unlink', glob($tempDir . '/*'));
                rmdir($tempDir);
            }

            return response()->json([
                'message' => 'Erro ao gerar exportação',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Reordenar layouts
     */
    public function reordenarLayouts(Request $request)
    {
        $validated = $request->validate([
            'layoutIds' => 'required|array|min:1',
            'layoutIds.*' => 'required|string|exists:simam_layouts,chave'
        ]);

        DB::beginTransaction();

        try {
            foreach ($validated['layoutIds'] as $index => $chave) {
                SimamLayout::where('chave', $chave)->update([
                    'ordem_geracao' => $index + 1
                ]);
            }

            DB::commit();

            return response()->json([
                'message' => 'Ordem atualizada com sucesso'
            ]);

        } catch (\Exception $e) {
            DB::rollBack();

            return response()->json([
                'message' => 'Erro ao atualizar ordem',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Download do ZIP
     */
    public function downloadZip($exportacaoId)
    {
        $exportacao = SimamExportacao::where('id', $exportacaoId)
            ->where('usuario_id', Auth::id())
            ->firstOrFail();

        $caminhoCompleto = storage_path('app/' . $exportacao->caminho_zip);

        if (!file_exists($caminhoCompleto)) {
            return response()->json([
                'message' => 'Arquivo não encontrado'
            ], 404);
        }

        return response()->download($caminhoCompleto, $exportacao->nome_zip);
    }

    /**
     * Download de arquivo individual
     */
    public function downloadArquivo($exportacaoId, $arquivoId)
    {
        $arquivo = SimamArquivoGerado::where('id', $arquivoId)
            ->whereHas('exportacao', function ($query) use ($exportacaoId) {
                $query->where('id', $exportacaoId)
                      ->where('usuario_id', Auth::id());
            })
            ->firstOrFail();

        $caminhoCompleto = storage_path('app/' . $arquivo->caminho_arquivo);

        if (!file_exists($caminhoCompleto)) {
            return response()->json([
                'message' => 'Arquivo não encontrado'
            ], 404);
        }

        return response()->download($caminhoCompleto, $arquivo->nome_arquivo);
    }

    /**
     * Gerar arquivo de layout (IMPLEMENTAR LÓGICA ESPECÍFICA)
     */
    private function gerarArquivoLayout($layoutChave, $ano, $mes, $somenteAtivos, $caminhoArquivo)
    {
        // TODO: Implementar lógica específica de cada layout
        // Buscar dados do banco conforme o layout
        // Formatar no padrão SIM-AM/SIMAM
        // Escrever no arquivo

        // Exemplo simulado:
        $handle = fopen($caminhoArquivo, 'w');
        $qtdRegistros = rand(10, 500);

        for ($i = 0; $i < $qtdRegistros; $i++) {
            fwrite($handle, "LINHA_EXEMPLO_" . ($i + 1) . "\n");
        }

        fclose($handle);

        return $qtdRegistros;
    }

    /**
     * Converter tipo de geração para sigla
     */
    private function getTipoSigla($tipo)
    {
        return match($tipo) {
            'mensal' => 'mensal',
            'abertura' => 'abertura',
            'diario' => 'diario',
            'fechamento' => 'fechamento',
            default => 'mensal'
        };
    }
}
```

---

## 🗺️ ROTAS

```php
Route::middleware('auth:sanctum')->prefix('prestacao-contas')->group(function () {
    Route::get('/layouts', [PrestacaoContasController::class, 'listarLayouts']);
    Route::post('/exportar', [PrestacaoContasController::class, 'exportar']);
    Route::post('/layouts/reordenar', [PrestacaoContasController::class, 'reordenarLayouts']);
    Route::get('/exportacoes/{id}/download', [PrestacaoContasController::class, 'downloadZip']);
    Route::get('/exportacoes/{exportacaoId}/arquivos/{arquivoId}/download',
        [PrestacaoContasController::class, 'downloadArquivo']
    )->name('prestacao-contas.arquivo.download');
});
```

---

## ✅ CHECKLIST DE IMPLEMENTAÇÃO

- [ ] Criar migrations para as 3 tabelas
- [ ] Executar `php artisan migrate`
- [ ] Inserir dados iniciais em `simam_layouts`
- [ ] Criar Models (SimamLayout, SimamExportacao, SimamArquivoGerado)
- [ ] Implementar controller PrestacaoContasController
- [ ] Adicionar rotas em `routes/api.php`
- [ ] Implementar método `gerarArquivoLayout()` com lógicas específicas
- [ ] Criar diretório `storage/app/prestacao-contas/`
- [ ] Testar endpoint de layouts
- [ ] Testar exportação
- [ ] Testar reordenação
- [ ] Testar downloads
- [ ] Validar formatos de arquivo SIM-AM

---

**🎉 Sistema completo de exportação SIM-AM/SIMAM implementado!**

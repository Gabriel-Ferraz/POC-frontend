# 📊 GUIA: Sistema de Exportação - Prestação de Contas (SIM-AM)

## 🎯 OBJETIVO

Implementar sistema completo de exportação de dados contábeis para o sistema SIM-AM da CGM, com geração de arquivos individuais e arquivo ZIP consolidado.

---

## 📋 REQUISITOS FUNCIONAIS

### 1. Formulário de Exportação

**Campos:**

- **Ano** (obrigatório) - Ano da exportação
- **Módulo** (obrigatório) - Módulo contábil (ex: ContabilidadeGeral, Empenhos, etc)
- **Tipo de Geração** (obrigatório) - "mensal" ou "anual"
- **Mês** (condicional) - Obrigatório se Tipo = "mensal"
- **Arquivos** (obrigatório) - Lista de checkboxes para selecionar arquivos

**Validações:**

- Se tipo_geracao = "mensal" → campo mês é obrigatório
- Se tipo_geracao = "anual" → campo mês deve ser null
- Ao menos 1 arquivo deve ser selecionado

### 2. Arquivos Disponíveis

```php
$arquivosDisponiveis = [
    'PlanoContabil' => 'Plano Contábil',
    'MovimentoLancMensal' => 'Movimento Lançamento Mensal',
    'DespesasBalancete' => 'Despesas Balancete',
    'MovimentoBalancete' => 'Movimento Balancete',
    'Receita' => 'Receita',
    'Despesa' => 'Despesa',
];
```

### 3. Processo de Exportação

1. Receber parâmetros do frontend
2. Validar dados
3. Gerar cada arquivo selecionado (.txt ou .csv)
4. Compactar todos em um arquivo ZIP
5. Salvar registro no banco de dados
6. Retornar estrutura de resposta com:
    - Nome do arquivo ZIP
    - Lista de arquivos gerados com quantidade de registros

---

## 🗄️ ESTRUTURA DO BANCO DE DADOS

### Tabela: `exportacoes_prestacao_contas`

```sql
CREATE TABLE exportacoes_prestacao_contas (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    ano INT NOT NULL,
    mes INT NULL,
    modulo VARCHAR(100) NOT NULL,
    tipo_geracao ENUM('mensal', 'anual') NOT NULL,
    arquivos_gerados JSON NOT NULL COMMENT 'Lista de arquivos com qtd de registros',
    caminho_zip VARCHAR(255) NOT NULL,
    quantidade_registros_total INT NOT NULL DEFAULT 0,
    usuario_id BIGINT UNSIGNED NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    FOREIGN KEY (usuario_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_ano_mes (ano, mes),
    INDEX idx_modulo (modulo),
    INDEX idx_usuario (usuario_id)
);
```

**Exemplo de JSON em `arquivos_gerados`:**

```json
[
	{
		"nome": "PlanoContabil",
		"qtdRegistros": 523,
		"nomeArquivo": "PlanoContabil_2026_01.txt"
	},
	{
		"nome": "MovimentoLancMensal",
		"qtdRegistros": 1842,
		"nomeArquivo": "MovimentoLancMensal_2026_01.txt"
	}
]
```

---

## 📡 ENDPOINTS

### 1. POST /api/prestacao-contas/exportar

**Request:**

```json
{
	"ano": 2026,
	"modulo": "ContabilidadeGeral",
	"tipo_geracao": "mensal",
	"mes": 5,
	"arquivos_selecionados": ["PlanoContabil", "MovimentoLancMensal", "DespesasBalancete"]
}
```

**Validação:**

```php
$validated = $request->validate([
    'ano' => 'required|integer|min:2000|max:2100',
    'modulo' => 'required|string|max:100',
    'tipo_geracao' => 'required|in:mensal,anual',
    'mes' => 'nullable|integer|min:1|max:12',
    'arquivos_selecionados' => 'required|array|min:1',
    'arquivos_selecionados.*' => 'required|string|in:PlanoContabil,MovimentoLancMensal,DespesasBalancete,MovimentoBalancete,Receita,Despesa'
]);

// Validar mes obrigatório para mensal
if ($validated['tipo_geracao'] === 'mensal' && empty($validated['mes'])) {
    return response()->json([
        'message' => 'O campo mês é obrigatório para geração mensal'
    ], 422);
}
```

**Response (200 OK):**

```json
{
	"message": "Exportação realizada com sucesso",
	"exportacao": {
		"id": 42,
		"arquivo_zip": "SISGE_contabilidadegeral_mensal_2026_05.zip",
		"arquivos": [
			{
				"nome": "PlanoContabil",
				"qtdRegistros": 523,
				"nomeArquivo": "PlanoContabil_2026_05.txt",
				"status": "Gerado",
				"dataGeracao": "03/05/2026 15:30:45"
			},
			{
				"nome": "MovimentoLancMensal",
				"qtdRegistros": 1842,
				"nomeArquivo": "MovimentoLancMensal_2026_05.txt",
				"status": "Gerado",
				"dataGeracao": "03/05/2026 15:30:47"
			}
		],
		"quantidade_registros_total": 2365,
		"url_download": "/api/prestacao-contas/exportacoes/42/download"
	}
}
```

### 2. GET /api/prestacao-contas/exportacoes

Lista exportações do usuário logado

**Response (200 OK):**

```json
[
	{
		"id": 42,
		"ano": 2026,
		"mes": 5,
		"modulo": "ContabilidadeGeral",
		"tipo_geracao": "mensal",
		"quantidade_registros_total": 2365,
		"created_at": "2026-05-03T15:30:45.000000Z"
	},
	{
		"id": 41,
		"ano": 2026,
		"mes": null,
		"modulo": "Empenhos",
		"tipo_geracao": "anual",
		"quantidade_registros_total": 15623,
		"created_at": "2026-04-28T10:15:22.000000Z"
	}
]
```

### 3. GET /api/prestacao-contas/exportacoes/{id}/download

Download do arquivo ZIP

**Response:**

- Content-Type: `application/zip`
- Content-Disposition: `attachment; filename="SISGE_contabilidadegeral_mensal_2026_05.zip"`
- Binary stream do arquivo ZIP

---

## 💻 IMPLEMENTAÇÃO BACKEND

### Controller: `PrestacaoContasController.php`

```php
<?php

namespace App\Http\Controllers;

use App\Models\ExportacaoPrestacaoContas;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use ZipArchive;

class PrestacaoContasController extends Controller
{
    public function __construct()
    {
        $this->middleware('auth:sanctum');
    }

    /**
     * Listar exportações do usuário
     */
    public function index()
    {
        $exportacoes = ExportacaoPrestacaoContas::where('usuario_id', Auth::id())
            ->orderBy('created_at', 'desc')
            ->get();

        return response()->json($exportacoes);
    }

    /**
     * Exportar dados para SIM-AM
     */
    public function exportar(Request $request)
    {
        $validated = $request->validate([
            'ano' => 'required|integer|min:2000|max:2100',
            'modulo' => 'required|string|max:100',
            'tipo_geracao' => 'required|in:mensal,anual',
            'mes' => 'nullable|integer|min:1|max:12',
            'arquivos_selecionados' => 'required|array|min:1',
            'arquivos_selecionados.*' => 'required|string|in:PlanoContabil,MovimentoLancMensal,DespesasBalancete,MovimentoBalancete,Receita,Despesa'
        ]);

        // Validar mês obrigatório para mensal
        if ($validated['tipo_geracao'] === 'mensal' && empty($validated['mes'])) {
            return response()->json([
                'message' => 'O campo mês é obrigatório para geração mensal'
            ], 422);
        }

        DB::beginTransaction();

        try {
            $ano = $validated['ano'];
            $mes = $validated['mes'] ?? null;
            $modulo = $validated['modulo'];
            $tipoGeracao = $validated['tipo_geracao'];
            $arquivosSelecionados = $validated['arquivos_selecionados'];

            // Criar diretório temporário
            $tempDir = storage_path('app/temp/exportacao_' . time());
            if (!file_exists($tempDir)) {
                mkdir($tempDir, 0755, true);
            }

            $arquivosGerados = [];
            $totalRegistros = 0;

            // Gerar cada arquivo selecionado
            foreach ($arquivosSelecionados as $tipoArquivo) {
                $resultado = $this->gerarArquivo($tipoArquivo, $ano, $mes, $modulo, $tempDir);
                $arquivosGerados[] = $resultado;
                $totalRegistros += $resultado['qtdRegistros'];
            }

            // Nome do arquivo ZIP
            $mesSufixo = $mes ? sprintf('_%02d', $mes) : '';
            $nomeZip = sprintf(
                'SISGE_%s_%s_%d%s.zip',
                strtolower($modulo),
                $tipoGeracao,
                $ano,
                $mesSufixo
            );

            // Caminho completo do ZIP
            $caminhoZip = storage_path('app/prestacao-contas/' . $nomeZip);

            // Criar diretório se não existir
            if (!file_exists(dirname($caminhoZip))) {
                mkdir(dirname($caminhoZip), 0755, true);
            }

            // Criar arquivo ZIP
            $zip = new ZipArchive();
            if ($zip->open($caminhoZip, ZipArchive::CREATE | ZipArchive::OVERWRITE) !== true) {
                throw new \Exception('Não foi possível criar arquivo ZIP');
            }

            // Adicionar arquivos ao ZIP
            foreach ($arquivosGerados as $arquivo) {
                $zip->addFile($arquivo['caminho'], $arquivo['nomeArquivo']);
            }

            $zip->close();

            // Limpar arquivos temporários
            foreach ($arquivosGerados as $arquivo) {
                if (file_exists($arquivo['caminho'])) {
                    unlink($arquivo['caminho']);
                }
            }
            rmdir($tempDir);

            // Salvar no banco
            $exportacao = ExportacaoPrestacaoContas::create([
                'ano' => $ano,
                'mes' => $mes,
                'modulo' => $modulo,
                'tipo_geracao' => $tipoGeracao,
                'arquivos_gerados' => json_encode($arquivosGerados),
                'caminho_zip' => $nomeZip,
                'quantidade_registros_total' => $totalRegistros,
                'usuario_id' => Auth::id(),
            ]);

            DB::commit();

            return response()->json([
                'message' => 'Exportação realizada com sucesso',
                'exportacao' => [
                    'id' => $exportacao->id,
                    'arquivo_zip' => $nomeZip,
                    'arquivos' => array_map(function ($arq) {
                        return [
                            'nome' => $arq['nome'],
                            'qtdRegistros' => $arq['qtdRegistros'],
                            'nomeArquivo' => $arq['nomeArquivo'],
                            'status' => 'Gerado',
                            'dataGeracao' => now()->format('d/m/Y H:i:s'),
                        ];
                    }, $arquivosGerados),
                    'quantidade_registros_total' => $totalRegistros,
                    'url_download' => route('prestacao-contas.download', $exportacao->id),
                ],
            ]);

        } catch (\Exception $e) {
            DB::rollBack();

            // Limpar arquivos em caso de erro
            if (isset($tempDir) && file_exists($tempDir)) {
                array_map('unlink', glob("$tempDir/*.*"));
                rmdir($tempDir);
            }

            return response()->json([
                'message' => 'Erro ao gerar exportação',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Download do arquivo ZIP
     */
    public function download($id)
    {
        $exportacao = ExportacaoPrestacaoContas::where('id', $id)
            ->where('usuario_id', Auth::id())
            ->firstOrFail();

        $caminhoCompleto = storage_path('app/prestacao-contas/' . $exportacao->caminho_zip);

        if (!file_exists($caminhoCompleto)) {
            return response()->json([
                'message' => 'Arquivo não encontrado'
            ], 404);
        }

        return response()->download($caminhoCompleto, $exportacao->caminho_zip);
    }

    /**
     * Gerar arquivo individual
     */
    private function gerarArquivo($tipo, $ano, $mes, $modulo, $tempDir)
    {
        $mesSufixo = $mes ? sprintf('_%02d', $mes) : '';
        $nomeArquivo = sprintf('%s_%d%s.txt', $tipo, $ano, $mesSufixo);
        $caminhoCompleto = $tempDir . '/' . $nomeArquivo;

        // Buscar dados do banco conforme o tipo
        $dados = $this->buscarDados($tipo, $ano, $mes, $modulo);

        // Escrever arquivo
        $handle = fopen($caminhoCompleto, 'w');

        foreach ($dados as $linha) {
            fwrite($handle, $this->formatarLinha($tipo, $linha) . "\n");
        }

        fclose($handle);

        return [
            'nome' => $tipo,
            'qtdRegistros' => count($dados),
            'nomeArquivo' => $nomeArquivo,
            'caminho' => $caminhoCompleto,
        ];
    }

    /**
     * Buscar dados do banco
     */
    private function buscarDados($tipo, $ano, $mes, $modulo)
    {
        // IMPLEMENTAR: Buscar dados reais do banco conforme o tipo
        // Este é apenas um exemplo - adaptar para sua estrutura de dados

        $query = match($tipo) {
            'PlanoContabil' => DB::table('plano_contabil')
                ->where('ano', $ano),

            'MovimentoLancMensal' => DB::table('lancamentos')
                ->whereYear('data', $ano)
                ->when($mes, fn($q) => $q->whereMonth('data', $mes)),

            'DespesasBalancete' => DB::table('despesas')
                ->whereYear('data_emissao', $ano)
                ->when($mes, fn($q) => $q->whereMonth('data_emissao', $mes)),

            'MovimentoBalancete' => DB::table('movimento_balancete')
                ->where('ano', $ano)
                ->when($mes, fn($q) => $q->where('mes', $mes)),

            'Receita' => DB::table('receitas')
                ->whereYear('data', $ano)
                ->when($mes, fn($q) => $q->whereMonth('data', $mes)),

            'Despesa' => DB::table('despesas')
                ->whereYear('data', $ano)
                ->when($mes, fn($q) => $q->whereMonth('data', $mes)),

            default => throw new \Exception("Tipo de arquivo não suportado: $tipo")
        };

        return $query->get();
    }

    /**
     * Formatar linha conforme layout SIM-AM
     */
    private function formatarLinha($tipo, $dados)
    {
        // IMPLEMENTAR: Formatar conforme layout específico do SIM-AM
        // Este é apenas um exemplo - adaptar para o layout real

        return match($tipo) {
            'PlanoContabil' => sprintf(
                '%s|%s|%s',
                $dados->codigo ?? '',
                $dados->descricao ?? '',
                $dados->natureza ?? ''
            ),

            'MovimentoLancMensal' => sprintf(
                '%s|%s|%s|%s',
                $dados->data ?? '',
                $dados->conta ?? '',
                $dados->valor ?? '',
                $dados->historico ?? ''
            ),

            // ... outros tipos

            default => json_encode($dados)
        };
    }
}
```

### Model: `ExportacaoPrestacaoContas.php`

```php
<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ExportacaoPrestacaoContas extends Model
{
    protected $table = 'exportacoes_prestacao_contas';

    protected $fillable = [
        'ano',
        'mes',
        'modulo',
        'tipo_geracao',
        'arquivos_gerados',
        'caminho_zip',
        'quantidade_registros_total',
        'usuario_id',
    ];

    protected $casts = [
        'arquivos_gerados' => 'array',
        'quantidade_registros_total' => 'integer',
    ];

    public function usuario()
    {
        return $this->belongsTo(User::class, 'usuario_id');
    }
}
```

---

## 🗺️ ROTAS

```php
Route::middleware('auth:sanctum')->prefix('prestacao-contas')->group(function () {
    Route::get('/exportacoes', [PrestacaoContasController::class, 'index']);
    Route::post('/exportar', [PrestacaoContasController::class, 'exportar']);
    Route::get('/exportacoes/{id}/download', [PrestacaoContasController::class, 'download'])
        ->name('prestacao-contas.download');
});
```

---

## 🧪 TESTES

### 1. Exportação Mensal

```bash
curl -X POST http://localhost:3333/api/prestacao-contas/exportar \
  -H "Authorization: Bearer {token}" \
  -H "Content-Type: application/json" \
  -d '{
    "ano": 2026,
    "modulo": "ContabilidadeGeral",
    "tipo_geracao": "mensal",
    "mes": 5,
    "arquivos_selecionados": ["PlanoContabil", "MovimentoLancMensal"]
  }'
```

### 2. Exportação Anual

```bash
curl -X POST http://localhost:3333/api/prestacao-contas/exportar \
  -H "Authorization: Bearer {token}" \
  -H "Content-Type: application/json" \
  -d '{
    "ano": 2026,
    "modulo": "Empenhos",
    "tipo_geracao": "anual",
    "arquivos_selecionados": ["Despesa", "Receita"]
  }'
```

### 3. Listar Exportações

```bash
curl http://localhost:3333/api/prestacao-contas/exportacoes \
  -H "Authorization: Bearer {token}"
```

### 4. Download ZIP

```bash
curl http://localhost:3333/api/prestacao-contas/exportacoes/42/download \
  -H "Authorization: Bearer {token}" \
  --output exportacao.zip
```

---

## ✅ CHECKLIST DE IMPLEMENTAÇÃO

- [ ] Criar migration `exportacoes_prestacao_contas`
- [ ] Executar `php artisan migrate`
- [ ] Criar model `ExportacaoPrestacaoContas`
- [ ] Implementar controller `PrestacaoContasController`
- [ ] Adicionar rotas em `routes/api.php`
- [ ] Implementar método `buscarDados()` com queries reais
- [ ] Implementar método `formatarLinha()` conforme layout SIM-AM
- [ ] Criar diretório `storage/app/prestacao-contas/`
- [ ] Testar exportação mensal
- [ ] Testar exportação anual
- [ ] Testar download de ZIP
- [ ] Testar validação de campos obrigatórios
- [ ] Testar permissões (usuário só vê suas exportações)
- [ ] Adicionar logs de auditoria

---

## 📝 OBSERVAÇÕES IMPORTANTES

1. **Layout SIM-AM**: Os métodos `formatarLinha()` e `buscarDados()` precisam ser implementados conforme o layout específico exigido pelo sistema SIM-AM da CGM
2. **Permissões**: Implementar verificação de perfil se necessário (ex: apenas operador_pmsjp pode exportar)
3. **Performance**: Para grandes volumes, considerar usar Jobs assíncronos
4. **Limpeza**: Criar task agendada para limpar arquivos ZIP antigos (ex: após 30 dias)
5. **Storage**: Configurar storage adequado em produção (S3, etc)

---

**🎉 Sistema completo de exportação para SIM-AM implementado!**

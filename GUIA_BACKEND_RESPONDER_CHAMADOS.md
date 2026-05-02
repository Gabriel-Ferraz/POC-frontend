# 📨 GUIA: Responder Chamados com Anexos

## 🎯 OBJETIVO

Permitir que usuários e gestores respondam chamados, criando um histórico de mensagens (timeline) com anexos.

---

## 📊 ESTRUTURA DE DADOS

### Tabela: `chamado_mensagens`

```sql
CREATE TABLE chamado_mensagens (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    chamado_id BIGINT UNSIGNED NOT NULL,
    usuario_id BIGINT UNSIGNED NOT NULL,
    tipo ENUM('abertura', 'resposta') NOT NULL,
    mensagem TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (chamado_id) REFERENCES chamados(id) ON DELETE CASCADE,
    FOREIGN KEY (usuario_id) REFERENCES users(id)
);
```

**Observação:** A mensagem de abertura do chamado já deve ter sido criada quando o chamado foi aberto.

---

## 📡 ENDPOINT: Responder Chamado

**POST** `/api/chamados/{id}/responder`

### Headers

```
Authorization: Bearer {token}
Content-Type: multipart/form-data
```

### Path Parameters

- `id` (integer, required): ID do chamado

### Body (FormData)

```
mensagem: "Resposta do usuário ou gestor..."
anexos[]: File[] (opcional, múltiplos arquivos)
```

### Validações

- `mensagem`: obrigatório, string
- `anexos`: opcional, array de arquivos
    - Máximo 10MB por arquivo
    - Formatos: pdf, doc, docx, xls, xlsx, png, jpg, jpeg, gif

---

## 🔐 REGRAS DE NEGÓCIO

### Quem pode responder:

1. **Criador do chamado** (usuário comum)
2. **Gestor de suporte** (`gestor_suporte`)
3. **Gestor de contrato** (`gestor_contrato`)

### Comportamento ao responder:

1. Criar nova mensagem na tabela `chamado_mensagens` com `tipo = 'resposta'`
2. Salvar anexos vinculados à mensagem (se houver)
3. Atualizar `data_ultima_resposta` do chamado
4. Mudar status do chamado para `em_atendimento` (se estiver `aberto`)

---

## 💻 IMPLEMENTAÇÃO

### Controller: `ChamadoController.php`

```php
<?php

namespace App\Http\Controllers;

use App\Models\Chamado;
use App\Models\ChamadoMensagem;
use App\Models\ChamadoAnexo;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

class ChamadoController extends Controller
{
    /**
     * Responder um chamado
     */
    public function responder(Request $request, $id)
    {
        $validated = $request->validate([
            'mensagem' => 'required|string',
            'anexos' => 'nullable|array',
            'anexos.*' => 'file|max:10240|mimes:pdf,doc,docx,xls,xlsx,png,jpg,jpeg,gif'
        ]);

        $user = Auth::user();
        $chamado = Chamado::findOrFail($id);

        // Verificar permissão
        $perfisGestores = ['gestor_suporte', 'gestor_contrato'];
        $podeResponder = $chamado->usuario_id === $user->id || in_array($user->perfil, $perfisGestores);

        if (!$podeResponder) {
            return response()->json([
                'message' => 'Você não tem permissão para responder este chamado.'
            ], 403);
        }

        // Criar mensagem de resposta
        $mensagem = ChamadoMensagem::create([
            'chamado_id' => $chamado->id,
            'usuario_id' => $user->id,
            'tipo' => 'resposta',
            'mensagem' => $validated['mensagem']
        ]);

        // Atualizar data da última resposta e status do chamado
        $chamado->update([
            'data_ultima_resposta' => now(),
            'status' => $chamado->status === 'aberto' ? 'em_atendimento' : $chamado->status
        ]);

        // Salvar anexos (se houver)
        if ($request->hasFile('anexos')) {
            foreach ($request->file('anexos') as $arquivo) {
                $nomeOriginal = $arquivo->getClientOriginalName();
                $nomeSalvo = time() . '_' . Str::slug(pathinfo($nomeOriginal, PATHINFO_FILENAME)) . '.' . $arquivo->extension();
                $caminho = $arquivo->storeAs('chamados/' . $chamado->id, $nomeSalvo, 'local');

                ChamadoAnexo::create([
                    'chamado_id' => $chamado->id,
                    'mensagem_id' => $mensagem->id,
                    'nome_original' => $nomeOriginal,
                    'nome_salvo' => $nomeSalvo,
                    'caminho' => $caminho,
                    'tamanho' => $arquivo->getSize(),
                    'tipo' => $arquivo->getMimeType(),
                    'enviado_por_usuario_id' => $user->id
                ]);
            }
        }

        return response()->json([
            'message' => 'Resposta enviada com sucesso',
            'mensagem' => [
                'id' => $mensagem->id,
                'tipo' => $mensagem->tipo,
                'usuario' => $user->name,
                'mensagem' => $mensagem->mensagem,
                'data' => $mensagem->created_at->format('d/m/Y H:i'),
                'anexos_count' => $mensagem->anexos()->count()
            ]
        ]);
    }
}
```

---

## 📤 RESPONSE ESPERADO

### Sucesso (200 OK)

```json
{
	"message": "Resposta enviada com sucesso",
	"mensagem": {
		"id": 5,
		"tipo": "resposta",
		"usuario": "Ana Paula",
		"mensagem": "Resposta do gestor...",
		"data": "02/05/2026 15:45",
		"anexos_count": 2
	}
}
```

### Erro - Sem permissão (403 Forbidden)

```json
{
	"message": "Você não tem permissão para responder este chamado."
}
```

### Erro - Validação (422 Unprocessable Entity)

```json
{
	"message": "The mensagem field is required.",
	"errors": {
		"mensagem": ["The mensagem field is required."]
	}
}
```

---

## 🔄 ATUALIZAÇÃO DO ENDPOINT `show()`

O endpoint de detalhes do chamado já deve estar retornando a timeline. Certifique-se de que está assim:

```php
public function show($id)
{
    $user = Auth::user();
    $chamado = Chamado::with(['usuario', 'mensagens.usuario', 'mensagens.anexos'])->findOrFail($id);

    // Permissão
    $perfisGestores = ['gestor_suporte', 'gestor_contrato'];
    if (!in_array($user->perfil, $perfisGestores) && $chamado->usuario_id !== $user->id) {
        return response()->json([
            'message' => 'Você não tem permissão para visualizar este chamado.'
        ], 403);
    }

    return response()->json([
        'chamado' => [
            'id' => $chamado->id,
            'protocolo' => '#' . $chamado->id,
            'modulo' => $chamado->modulo,
            'usuario' => $chamado->usuario->name,
            'status' => $chamado->status,
            'data_abertura' => $chamado->created_at->format('d/m/Y'),
            'data_cadastro' => $chamado->created_at->format('d/m/Y H:i'),
            'data_ultima_resposta' => $chamado->data_ultima_resposta ? $chamado->data_ultima_resposta->format('d/m/Y H:i') : null,
            'data_conclusao' => $chamado->data_conclusao ? $chamado->data_conclusao->format('d/m/Y H:i') : null,
            'mensagem_inicial' => $chamado->assunto
        ],
        'timeline' => $chamado->mensagens->map(function ($msg) {
            return [
                'id' => $msg->id,
                'tipo' => $msg->tipo,
                'usuario' => $msg->usuario->name,
                'mensagem' => $msg->mensagem,
                'data' => $msg->created_at->format('d/m/Y H:i'),
                'anexos' => $msg->anexos->map(function ($anexo) {
                    return [
                        'id' => $anexo->id,
                        'nome' => $anexo->nome_original,
                        'tamanho' => number_format($anexo->tamanho / 1024, 1) . ' KB',
                        'url' => '/chamados/anexos/' . $anexo->id . '/download'
                    ];
                })
            ];
        })
    ]);
}
```

---

## 🗺️ ROTAS

Certifique-se de que a rota está registrada em `routes/api.php`:

```php
Route::middleware('auth:sanctum')->group(function () {
    // Chamados
    Route::get('/chamados', [ChamadoController::class, 'index']);
    Route::post('/chamados', [ChamadoController::class, 'store']);
    Route::get('/chamados/usuarios', [ChamadoController::class, 'usuarios']);
    Route::get('/chamados/anexos/{id}/download', [ChamadoController::class, 'downloadAnexo']);
    Route::get('/chamados/{id}', [ChamadoController::class, 'show']);
    Route::post('/chamados/{id}/responder', [ChamadoController::class, 'responder']); // ← ADICIONAR ESTA
});
```

**IMPORTANTE:** A rota `/anexos/{id}/download` deve vir ANTES da rota genérica `/{id}`.

---

## 📋 RELACIONAMENTOS NO MODEL

### Model: `Chamado.php`

```php
<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Chamado extends Model
{
    protected $fillable = [
        'usuario_id',
        'modulo',
        'assunto',
        'status',
        'data_ultima_resposta',
        'data_conclusao'
    ];

    protected $casts = [
        'data_ultima_resposta' => 'datetime',
        'data_conclusao' => 'datetime'
    ];

    public function usuario()
    {
        return $this->belongsTo(User::class, 'usuario_id');
    }

    public function mensagens()
    {
        return $this->hasMany(ChamadoMensagem::class, 'chamado_id')->orderBy('created_at', 'asc');
    }

    public function anexos()
    {
        return $this->hasMany(ChamadoAnexo::class, 'chamado_id');
    }
}
```

### Model: `ChamadoMensagem.php`

```php
<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ChamadoMensagem extends Model
{
    protected $table = 'chamado_mensagens';

    protected $fillable = [
        'chamado_id',
        'usuario_id',
        'tipo',
        'mensagem'
    ];

    public $timestamps = false; // Usar apenas created_at

    protected $casts = [
        'created_at' => 'datetime'
    ];

    public function chamado()
    {
        return $this->belongsTo(Chamado::class, 'chamado_id');
    }

    public function usuario()
    {
        return $this->belongsTo(User::class, 'usuario_id');
    }

    public function anexos()
    {
        return $this->hasMany(ChamadoAnexo::class, 'mensagem_id');
    }
}
```

### Model: `ChamadoAnexo.php`

```php
<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ChamadoAnexo extends Model
{
    protected $table = 'chamado_anexos';

    protected $fillable = [
        'chamado_id',
        'mensagem_id',
        'nome_original',
        'nome_salvo',
        'caminho',
        'tamanho',
        'tipo',
        'enviado_por_usuario_id'
    ];

    public $timestamps = false;

    protected $casts = [
        'created_at' => 'datetime'
    ];

    public function chamado()
    {
        return $this->belongsTo(Chamado::class, 'chamado_id');
    }

    public function mensagem()
    {
        return $this->belongsTo(ChamadoMensagem::class, 'mensagem_id');
    }

    public function enviadoPor()
    {
        return $this->belongsTo(User::class, 'enviado_por_usuario_id');
    }
}
```

---

## 🧪 TESTE

### 1. Responder chamado sem anexos

```bash
curl -X POST http://localhost:3333/api/chamados/4/responder \
  -H "Authorization: Bearer {token}" \
  -F "mensagem=Estamos analisando o problema"
```

### 2. Responder chamado com anexos

```bash
curl -X POST http://localhost:3333/api/chamados/4/responder \
  -H "Authorization: Bearer {token}" \
  -F "mensagem=Segue solução em anexo" \
  -F "anexos[]=@/path/to/solucao.pdf" \
  -F "anexos[]=@/path/to/print.png"
```

### 3. Ver detalhes do chamado (timeline atualizada)

```bash
curl -X GET http://localhost:3333/api/chamados/4 \
  -H "Authorization: Bearer {token}"
```

---

## ✅ CHECKLIST DE IMPLEMENTAÇÃO

- [ ] Tabela `chamado_mensagens` criada
- [ ] Tabela `chamado_anexos` com coluna `mensagem_id`
- [ ] Model `ChamadoMensagem` criado com relacionamentos
- [ ] Model `ChamadoAnexo` criado com relacionamentos
- [ ] Endpoint `/chamados/{id}/responder` implementado
- [ ] Validação de permissão (apenas criador ou gestor)
- [ ] Atualização de `data_ultima_resposta` no chamado
- [ ] Mudança de status para `em_atendimento`
- [ ] Salvamento de anexos vinculados à mensagem
- [ ] Endpoint `show()` retornando timeline completa
- [ ] Rota registrada em `routes/api.php`
- [ ] Testar com usuário comum
- [ ] Testar com gestor
- [ ] Testar upload de anexos
- [ ] Testar download de anexos da timeline

---

## 🎯 RESUMO DO FLUXO

1. Usuário ou gestor acessa detalhes do chamado
2. Frontend exibe timeline com todas as mensagens
3. Usuário digita nova mensagem e pode anexar arquivos
4. Clica em "Enviar Resposta"
5. Frontend envia `POST /api/chamados/{id}/responder` com FormData
6. Backend cria nova mensagem tipo "resposta"
7. Backend salva anexos vinculados à mensagem
8. Backend atualiza `data_ultima_resposta` e status
9. Frontend recarrega chamado (timeline atualizada)
10. Nova mensagem aparece na timeline com anexos clicáveis

---

**🎉 Guia completo para implementação de respostas com histórico!**

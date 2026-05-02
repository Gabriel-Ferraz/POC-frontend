# 🎨 GUIA: Lista de Chamados Melhorada com Ações Inteligentes

## 🎯 OBJETIVO

Melhorar a listagem de chamados adicionando:

1. **Ícone de Log** com cores indicativas do status de atendimento
2. **Ícone de Informações** para visualizar logs do sistema e histórico completo
3. Campos adicionais no retorno da API para controlar as cores dos ícones

---

## 📊 CAMPOS ADICIONAIS NA RESPOSTA DA API

### Endpoint: `GET /api/chamados`

A resposta atual precisa incluir os seguintes campos adicionais para cada chamado:

```json
{
	"chamados": [
		{
			"id": 1,
			"protocolo": "#1",
			"modulo": "Portal do Fornecedor",
			"assunto": "Erro ao fazer login",
			"usuario": "João Silva",
			"usuario_id": 5,
			"status": "aberto", // "aberto" | "em_atendimento" | "concluido"
			"data_abertura": "01/05/2026",
			"data_cadastro": "01/05/2026 14:30",
			"data_ultima_resposta": "01/05/2026 16:45", // ou null
			"data_conclusao": null, // ou "02/05/2026 10:00"

			// ⭐ NOVOS CAMPOS NECESSÁRIOS:
			"ultima_mensagem_por": "gestor", // "usuario" | "gestor" | null
			"tem_resposta_pendente": true // boolean
		}
	]
}
```

---

## 🎨 REGRAS DE COR DO ÍCONE DE LOG

O frontend usa a seguinte lógica para definir a cor do ícone:

### 🔵 AZUL

**Quando exibir:** Chamado aberto OU última mensagem foi do usuário

- `status == "aberto"` OU
- `ultima_mensagem_por == "usuario"`

**Significado:** Chamado em atendimento, aguardando resposta do gestor

### 🟠 LARANJA

**Quando exibir:** Chamado respondido pelo gestor, pendente de resposta do usuário

- `tem_resposta_pendente == true` OU
- `ultima_mensagem_por == "gestor"`

**Significado:** Resposta recebida, requer atenção do usuário

### ⚫ CINZA

**Quando exibir:** Chamado concluído

- `status == "concluido"`

**Significado:** Chamado finalizado, apenas para consulta

---

## 💻 IMPLEMENTAÇÃO NO BACKEND

### 1. Atualizar o Controller `ChamadoController.php`

```php
<?php

namespace App\Http\Controllers;

use App\Models\Chamado;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class ChamadoController extends Controller
{
    /**
     * Listar chamados com filtros
     */
    public function index(Request $request)
    {
        $user = Auth::user();
        $query = Chamado::with(['usuario', 'mensagens.usuario'])
            ->orderBy('created_at', 'desc');

        // Permissão: gestores veem todos, usuários comuns só os seus
        $perfisGestores = ['gestor_suporte', 'gestor_contrato'];
        if (!in_array($user->perfil, $perfisGestores)) {
            $query->where('usuario_id', $user->id);
        }

        // Aplicar filtros (protocolo, módulo, status, etc.)
        if ($request->has('protocolo')) {
            $query->where('id', 'like', '%' . $request->protocolo . '%');
        }

        if ($request->has('modulo')) {
            $query->where('modulo', 'like', '%' . $request->modulo . '%');
        }

        if ($request->has('assunto')) {
            $query->where('assunto', 'like', '%' . $request->assunto . '%');
        }

        if ($request->has('status')) {
            $statusList = explode(',', $request->status);
            $query->whereIn('status', $statusList);
        }

        if ($request->has('usuario_id')) {
            $query->where('usuario_id', $request->usuario_id);
        }

        if ($request->has('data_cadastro_inicio')) {
            $query->whereDate('created_at', '>=', $request->data_cadastro_inicio);
        }

        if ($request->has('data_cadastro_fim')) {
            $query->whereDate('created_at', '<=', $request->data_cadastro_fim);
        }

        if ($request->has('data_resposta_inicio')) {
            $query->whereDate('data_ultima_resposta', '>=', $request->data_resposta_inicio);
        }

        if ($request->has('data_resposta_fim')) {
            $query->whereDate('data_ultima_resposta', '<=', $request->data_resposta_fim);
        }

        $chamados = $query->get();

        return response()->json([
            'chamados' => $chamados->map(function ($chamado) use ($user) {
                // Determinar quem enviou a última mensagem
                $ultimaMensagem = $chamado->mensagens()->orderBy('created_at', 'desc')->first();
                $ultimaMensagemPor = null;
                $temRespostaPendente = false;

                if ($ultimaMensagem) {
                    $perfisGestores = ['gestor_suporte', 'gestor_contrato'];
                    $mensagemDeGestor = in_array($ultimaMensagem->usuario->perfil, $perfisGestores);

                    $ultimaMensagemPor = $mensagemDeGestor ? 'gestor' : 'usuario';

                    // Se a última mensagem foi de um gestor e o chamado não está concluído
                    // e o usuário logado é o criador do chamado
                    if ($mensagemDeGestor &&
                        $chamado->status !== 'concluido' &&
                        $chamado->usuario_id === $user->id) {
                        $temRespostaPendente = true;
                    }
                }

                return [
                    'id' => $chamado->id,
                    'protocolo' => '#' . $chamado->id,
                    'modulo' => $chamado->modulo,
                    'assunto' => $chamado->assunto,
                    'usuario' => $chamado->usuario->name,
                    'usuario_id' => $chamado->usuario_id,
                    'status' => $chamado->status,
                    'data_abertura' => $chamado->created_at->format('d/m/Y'),
                    'data_cadastro' => $chamado->created_at->format('d/m/Y H:i'),
                    'data_ultima_resposta' => $chamado->data_ultima_resposta
                        ? $chamado->data_ultima_resposta->format('d/m/Y H:i')
                        : null,
                    'data_conclusao' => $chamado->data_conclusao
                        ? $chamado->data_conclusao->format('d/m/Y H:i')
                        : null,

                    // NOVOS CAMPOS
                    'ultima_mensagem_por' => $ultimaMensagemPor,
                    'tem_resposta_pendente' => $temRespostaPendente,
                ];
            })
        ]);
    }
}
```

---

## 📡 NOVO ENDPOINT: Informações Completas do Chamado

### Endpoint: `GET /api/chamados/{id}`

Atualizar o endpoint existente para incluir o log do sistema:

```php
public function show($id)
{
    $user = Auth::user();
    $chamado = Chamado::with(['usuario', 'mensagens.usuario', 'mensagens.anexos'])->findOrFail($id);

    // Verificar permissão
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
            'assunto' => $chamado->assunto,
            'usuario' => $chamado->usuario->name,
            'status' => $chamado->status,
            'data_abertura' => $chamado->created_at->format('d/m/Y'),
            'data_cadastro' => $chamado->created_at->format('d/m/Y H:i'),
            'data_ultima_resposta' => $chamado->data_ultima_resposta
                ? $chamado->data_ultima_resposta->format('d/m/Y H:i')
                : null,
            'data_conclusao' => $chamado->data_conclusao
                ? $chamado->data_conclusao->format('d/m/Y H:i')
                : null,
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
                        'arquivo_path' => '/chamados/anexos/' . $anexo->id . '/download',
                        'url' => '/api/chamados/anexos/' . $anexo->id . '/download'
                    ];
                })
            ];
        }),
        // ⭐ NOVO: Log do sistema
        'log_sistema' => [
            'navegador' => $chamado->navegador ?? 'Não disponível',
            'sistema_operacional' => $chamado->sistema_operacional ?? 'Não disponível',
            'ip' => $chamado->ip_origem ?? 'Não disponível',
            'data_hora_acesso' => $chamado->created_at->format('d/m/Y H:i:s'),
            'user_agent' => $chamado->user_agent ?? 'Não disponível',
        ]
    ]);
}
```

---

## 🗄️ MIGRAÇÃO: Adicionar Colunas de Log do Sistema

Criar migração para adicionar campos de log na tabela `chamados`:

```php
<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::table('chamados', function (Blueprint $table) {
            $table->string('navegador')->nullable()->after('status');
            $table->string('sistema_operacional')->nullable()->after('navegador');
            $table->string('ip_origem')->nullable()->after('sistema_operacional');
            $table->text('user_agent')->nullable()->after('ip_origem');
        });
    }

    public function down()
    {
        Schema::table('chamados', function (Blueprint $table) {
            $table->dropColumn(['navegador', 'sistema_operacional', 'ip_origem', 'user_agent']);
        });
    }
};
```

Executar: `php artisan migrate`

---

## 🔧 CAPTURAR INFORMAÇÕES DO SISTEMA NA CRIAÇÃO DO CHAMADO

Atualizar o método `store` no `ChamadoController`:

```php
public function store(Request $request)
{
    $validated = $request->validate([
        'modulo' => 'required|string',
        'assunto' => 'required|string',
        'anexos' => 'nullable|array',
        'anexos.*' => 'file|max:10240|mimes:pdf,doc,docx,xls,xlsx,png,jpg,jpeg,gif'
    ]);

    $user = Auth::user();

    // Capturar informações do sistema
    $userAgent = $request->header('User-Agent');
    $navegador = $this->detectarNavegador($userAgent);
    $sistemaOperacional = $this->detectarSO($userAgent);
    $ip = $request->ip();

    // Criar chamado
    $chamado = Chamado::create([
        'usuario_id' => $user->id,
        'modulo' => $validated['modulo'],
        'assunto' => $validated['assunto'],
        'status' => 'aberto',
        'navegador' => $navegador,
        'sistema_operacional' => $sistemaOperacional,
        'ip_origem' => $ip,
        'user_agent' => $userAgent
    ]);

    // Criar mensagem de abertura
    ChamadoMensagem::create([
        'chamado_id' => $chamado->id,
        'usuario_id' => $user->id,
        'tipo' => 'abertura',
        'mensagem' => $validated['assunto']
    ]);

    // Salvar anexos (se houver)...

    return response()->json([
        'message' => 'Chamado criado com sucesso',
        'chamado' => $chamado
    ], 201);
}

// Funções auxiliares
private function detectarNavegador($userAgent)
{
    if (str_contains($userAgent, 'Chrome')) return 'Google Chrome';
    if (str_contains($userAgent, 'Firefox')) return 'Mozilla Firefox';
    if (str_contains($userAgent, 'Safari')) return 'Safari';
    if (str_contains($userAgent, 'Edge')) return 'Microsoft Edge';
    if (str_contains($userAgent, 'Opera')) return 'Opera';
    return 'Outro';
}

private function detectarSO($userAgent)
{
    if (str_contains($userAgent, 'Windows')) return 'Windows';
    if (str_contains($userAgent, 'Mac OS')) return 'MacOS';
    if (str_contains($userAgent, 'Linux')) return 'Linux';
    if (str_contains($userAgent, 'Android')) return 'Android';
    if (str_contains($userAgent, 'iOS')) return 'iOS';
    return 'Outro';
}
```

---

## ✅ CHECKLIST DE IMPLEMENTAÇÃO

- [ ] Atualizar `index()` para retornar `ultima_mensagem_por` e `tem_resposta_pendente`
- [ ] Criar migração para adicionar colunas de log do sistema
- [ ] Executar `php artisan migrate`
- [ ] Atualizar `store()` para capturar informações do sistema
- [ ] Atualizar `show()` para retornar `log_sistema`
- [ ] Adicionar métodos `detectarNavegador()` e `detectarSO()`
- [ ] Testar listagem de chamados (verificar novos campos)
- [ ] Testar criação de chamado (verificar se captura logs)
- [ ] Testar endpoint de detalhes (verificar se retorna log_sistema)

---

## 🎯 RESULTADO ESPERADO

### Listagem (`GET /api/chamados`)

```json
{
	"chamados": [
		{
			"id": 1,
			"protocolo": "#1",
			"status": "em_atendimento",
			"ultima_mensagem_por": "gestor",
			"tem_resposta_pendente": true
			// ... outros campos
		}
	]
}
```

### Detalhes (`GET /api/chamados/1`)

```json
{
	"chamado": {
		/* ... */
	},
	"timeline": [
		/* ... */
	],
	"log_sistema": {
		"navegador": "Google Chrome",
		"sistema_operacional": "Windows",
		"ip": "192.168.1.10",
		"data_hora_acesso": "01/05/2026 14:30:45",
		"user_agent": "Mozilla/5.0..."
	}
}
```

---

**🎉 Guia completo para implementação das melhorias na lista de chamados!**

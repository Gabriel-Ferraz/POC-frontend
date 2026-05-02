# 📋 GUIA COMPLETO: Sistema de Chamados de Suporte

## 🎯 VISÃO GERAL

Sistema completo de abertura e gerenciamento de chamados com:

- Abertura de chamado com anexos
- Responder chamados com novos anexos
- Histórico completo (timeline)
- Filtros avançados
- Controle de permissões por perfil

---

## 📊 ESTRUTURA DE DADOS

### Tabela: `chamados`

```sql
CREATE TABLE chamados (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    usuario_id BIGINT UNSIGNED NOT NULL,
    modulo VARCHAR(255) NOT NULL,
    mensagem TEXT NOT NULL,
    status ENUM('aberto', 'em_atendimento', 'concluido') DEFAULT 'aberto',
    data_ultima_resposta TIMESTAMP NULL,
    data_conclusao TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (usuario_id) REFERENCES users(id)
);
```

### Tabela: `chamado_mensagens` (Timeline)

```sql
CREATE TABLE chamado_mensagens (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    chamado_id BIGINT UNSIGNED NOT NULL,
    usuario_id BIGINT UNSIGNED NOT NULL,
    tipo ENUM('abertura', 'resposta', 'conclusao') NOT NULL,
    mensagem TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (chamado_id) REFERENCES chamados(id) ON DELETE CASCADE,
    FOREIGN KEY (usuario_id) REFERENCES users(id)
);
```

### Tabela: `chamado_anexos`

```sql
CREATE TABLE chamado_anexos (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    chamado_id BIGINT UNSIGNED NOT NULL,
    mensagem_id BIGINT UNSIGNED NULL,
    nome_original VARCHAR(255) NOT NULL,
    nome_salvo VARCHAR(255) NOT NULL,
    caminho VARCHAR(500) NOT NULL,
    tamanho BIGINT NOT NULL,
    tipo VARCHAR(100) NOT NULL,
    enviado_por_usuario_id BIGINT UNSIGNED NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (chamado_id) REFERENCES chamados(id) ON DELETE CASCADE,
    FOREIGN KEY (mensagem_id) REFERENCES chamado_mensagens(id) ON DELETE CASCADE,
    FOREIGN KEY (enviado_por_usuario_id) REFERENCES users(id)
);
```

---

## 📡 ENDPOINTS

### 1. Criar Chamado com Anexos

**POST** `/api/chamados`

#### Headers

```
Authorization: Bearer {token}
Content-Type: multipart/form-data
```

#### Body (FormData)

```
modulo: "Portal do Fornecedor"
mensagem: "Descrição detalhada do problema..."
anexos[]: File (opcional, múltiplos arquivos)
```

#### Validações

- `modulo`: obrigatório, string, max 255
- `mensagem`: obrigatório, string
- `anexos`: opcional, array de arquivos
    - Máximo 10MB por arquivo
    - Formatos: pdf, doc, docx, xls, xlsx, png, jpg, jpeg, gif

#### Response (201 Created)

```json
{
	"chamado": {
		"id": 5,
		"protocolo": "#5",
		"modulo": "Portal do Fornecedor",
		"assunto": "Erro ao acessar sistema",
		"usuario": "João Silva (Responsável Técnico)",
		"status": "aberto",
		"data_cadastro": "10/05/2026 14:30",
		"data_abertura": "10/05/2026",
		"anexos_count": 2
	}
}
```

#### Implementação (Controller)

```php
public function store(Request $request)
{
    $validated = $request->validate([
        'modulo' => 'required|string|max:255',
        'mensagem' => 'required|string',
        'anexos' => 'nullable|array',
        'anexos.*' => 'file|max:10240|mimes:pdf,doc,docx,xls,xlsx,png,jpg,jpeg,gif'
    ]);

    $user = Auth::user();

    // Criar chamado
    $chamado = Chamado::create([
        'usuario_id' => $user->id,
        'modulo' => $validated['modulo'],
        'mensagem' => $validated['mensagem'],
        'status' => 'aberto'
    ]);

    // Criar mensagem de abertura na timeline
    $mensagem = ChamadoMensagem::create([
        'chamado_id' => $chamado->id,
        'usuario_id' => $user->id,
        'tipo' => 'abertura',
        'mensagem' => $validated['mensagem']
    ]);

    // Salvar anexos
    if ($request->hasFile('anexos')) {
        foreach ($request->file('anexos') as $arquivo) {
            $nomeOriginal = $arquivo->getClientOriginalName();
            $nomeSalvo = time() . '_' . Str::slug(pathinfo($nomeOriginal, PATHINFO_FILENAME)) . '.' . $arquivo->extension();
            $caminho = $arquivo->storeAs('chamados/' . $chamado->id, $nomeSalvo, 'private');

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
        'chamado' => [
            'id' => $chamado->id,
            'protocolo' => '#' . $chamado->id,
            'modulo' => $chamado->modulo,
            'mensagem' => $chamado->mensagem,
            'usuario' => $user->name . ' (' . $this->getPerfilLabel($user->perfil) . ')',
            'status' => $chamado->status,
            'data_cadastro' => $chamado->created_at->format('d/m/Y H:i'),
            'data_abertura' => $chamado->created_at->format('d/m/Y'),
            'anexos_count' => $chamado->anexos()->count()
        ]
    ], 201);
}
```

---

### 2. Listar Chamados (com filtros)

**GET** `/api/chamados`

#### Query Parameters

| Parâmetro              | Tipo    | Descrição                                                          |
| ---------------------- | ------- | ------------------------------------------------------------------ |
| `protocolo`            | String  | Busca pelo número do protocolo (ex: "3" ou "#3")                   |
| `modulo`               | String  | Busca parcial no módulo                                            |
| `mensagem`             | String  | Busca parcial na descrição do problema                             |
| `status`               | String  | Filtro por status (pode enviar múltiplos: "aberto,em_atendimento") |
| `usuario_id`           | Integer | Filtro por ID do usuário (apenas gestores)                         |
| `data_cadastro_inicio` | Date    | Data inicial (formato: Y-m-d)                                      |
| `data_cadastro_fim`    | Date    | Data final (formato: Y-m-d)                                        |
| `data_resposta_inicio` | Date    | Data inicial última resposta                                       |
| `data_resposta_fim`    | Date    | Data final última resposta                                         |

#### Response (200 OK)

```json
{
	"chamados": [
		{
			"id": 5,
			"protocolo": "#5",
			"modulo": "Portal do Fornecedor",
			"assunto": "Erro ao acessar sistema",
			"usuario": "João Silva (Responsável Técnico)",
			"status": "aberto",
			"data_abertura": "10/05/2026",
			"data_cadastro": "10/05/2026 14:30",
			"data_ultima_resposta": null,
			"total_mensagens": 1,
			"total_anexos": 2
		}
	]
}
```

#### Implementação

```php
public function index(Request $request)
{
    $user = Auth::user();
    $query = Chamado::with(['usuario', 'anexos']);

    // Permissão: usuários comuns só veem próprios chamados
    $perfisGestores = ['gestor_suporte', 'gestor_contrato'];
    if (!in_array($user->perfil, $perfisGestores)) {
        $query->where('usuario_id', $user->id);
    }

    // Filtros

    // Protocolo
    if ($request->has('protocolo')) {
        $protocolo = str_replace('#', '', $request->protocolo);
        $query->where('id', $protocolo);
    }

    // Módulo (busca parcial)
    if ($request->has('modulo')) {
        $query->where('modulo', 'like', '%' . $request->modulo . '%');
    }

    // Mensagem/Descrição (busca parcial)
    if ($request->has('mensagem')) {
        $query->where('mensagem', 'like', '%' . $request->mensagem . '%');
    }

    // Status (múltiplos)
    if ($request->has('status')) {
        $statuses = explode(',', $request->status);
        $query->whereIn('status', $statuses);
    }

    // Usuário (apenas para gestores)
    if (in_array($user->perfil, $perfisGestores) && $request->has('usuario_id')) {
        $query->where('usuario_id', $request->usuario_id);
    }

    // Data de Cadastro
    if ($request->has('data_cadastro_inicio')) {
        $query->whereDate('created_at', '>=', $request->data_cadastro_inicio);
    }
    if ($request->has('data_cadastro_fim')) {
        $query->whereDate('created_at', '<=', $request->data_cadastro_fim);
    }

    // Data da Última Resposta
    if ($request->has('data_resposta_inicio')) {
        $query->whereDate('data_ultima_resposta', '>=', $request->data_resposta_inicio);
    }
    if ($request->has('data_resposta_fim')) {
        $query->whereDate('data_ultima_resposta', '<=', $request->data_resposta_fim);
    }

    // Ordenar do mais recente para o mais velho
    $query->orderBy('created_at', 'desc');

    $chamados = $query->get();

    return response()->json([
        'chamados' => $chamados->map(function ($chamado) {
            return [
                'id' => $chamado->id,
                'protocolo' => '#' . $chamado->id,
                'modulo' => $chamado->modulo,
                'mensagem' => Str::limit($chamado->mensagem, 100),
                'usuario' => $chamado->usuario->name . ' (' . $this->getPerfilLabel($chamado->usuario->perfil) . ')',
                'status' => $chamado->status,
                'data_abertura' => $chamado->created_at->format('d/m/Y'),
                'data_cadastro' => $chamado->created_at->format('d/m/Y H:i'),
                'data_ultima_resposta' => $chamado->data_ultima_resposta ? $chamado->data_ultima_resposta->format('d/m/Y H:i') : null,
                'total_mensagens' => $chamado->mensagens()->count(),
                'total_anexos' => $chamado->anexos()->count()
            ];
        })
    ]);
}
```

---

### 3. Buscar Usuários (Autocomplete)

**GET** `/api/chamados/usuarios?busca={termo}`

#### Query Parameters

- `busca` (opcional): termo para buscar no nome do usuário

#### Response para Usuário Comum

```json
{
	"usuario_atual": {
		"id": 1,
		"name": "João Silva",
		"perfil": "responsavel_tecnico",
		"perfil_label": "Responsável Técnico"
	}
}
```

#### Response para Gestor

```json
{
	"usuarios": [
		{
			"id": 1,
			"name": "João Silva",
			"perfil": "responsavel_tecnico",
			"perfil_label": "Responsável Técnico"
		},
		{
			"id": 2,
			"name": "Maria Santos",
			"perfil": "gestor_contrato",
			"perfil_label": "Gestor do Contrato"
		}
	]
}
```

#### Implementação

```php
public function usuarios(Request $request)
{
    $user = Auth::user();
    $perfisGestores = ['gestor_suporte', 'gestor_contrato'];

    // Usuário comum: retorna apenas seus dados
    if (!in_array($user->perfil, $perfisGestores)) {
        return response()->json([
            'usuario_atual' => [
                'id' => $user->id,
                'name' => $user->name,
                'perfil' => $user->perfil,
                'perfil_label' => $this->getPerfilLabel($user->perfil)
            ]
        ]);
    }

    // Gestor: retorna lista de usuários que já criaram chamados
    $query = User::whereHas('chamados')
        ->orderBy('name', 'asc')
        ->limit(20);

    // Busca por nome
    if ($request->has('busca') && $request->busca) {
        $query->where('name', 'like', '%' . $request->busca . '%');
    }

    $usuarios = $query->get();

    return response()->json([
        'usuarios' => $usuarios->map(function ($usuario) {
            return [
                'id' => $usuario->id,
                'name' => $usuario->name,
                'perfil' => $usuario->perfil,
                'perfil_label' => $this->getPerfilLabel($usuario->perfil)
            ];
        })
    ]);
}
```

---

### 4. Ver Detalhes do Chamado

**GET** `/api/chamados/{id}`

#### Response (200 OK)

```json
{
	"chamado": {
		"id": 5,
		"protocolo": "#5",
		"modulo": "Portal do Fornecedor",
		"assunto": "Erro ao acessar sistema",
		"usuario": "João Silva",
		"status": "aberto",
		"data_abertura": "10/05/2026",
		"data_cadastro": "10/05/2026 14:30",
		"data_ultima_resposta": null,
		"data_conclusao": null,
		"mensagem_inicial": "Descrição do problema..."
	},
	"timeline": [
		{
			"id": 1,
			"tipo": "abertura",
			"usuario": "João Silva",
			"mensagem": "Descrição do problema...",
			"data": "10/05/2026 14:30",
			"anexos": [
				{
					"id": 1,
					"nome": "screenshot.png",
					"tamanho": "245 KB",
					"url": "/api/chamados/anexos/1/download"
				}
			]
		}
	]
}
```

#### Implementação

```php
public function show($id)
{
    $user = Auth::user();
    $chamado = Chamado::with(['usuario', 'mensagens.usuario', 'mensagens.anexos'])->findOrFail($id);

    // Permissão: só pode ver se for o criador ou gestor
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
            'mensagem_inicial' => $chamado->mensagem
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
                        'url' => '/api/chamados/anexos/' . $anexo->id . '/download'
                    ];
                })
            ];
        })
    ]);
}
```

---

### 5. Responder Chamado (com anexos)

**POST** `/api/chamados/{id}/responder`

#### Body (FormData)

```
mensagem: "Resposta do gestor..."
anexos[]: File (opcional)
```

#### Response (200 OK)

```json
{
	"message": "Resposta adicionada com sucesso",
	"mensagem": {
		"id": 2,
		"tipo": "resposta",
		"usuario": "Ana Paula",
		"mensagem": "Resposta do gestor...",
		"data": "10/05/2026 15:45",
		"anexos_count": 1
	}
}
```

#### Implementação

```php
public function responder(Request $request, $id)
{
    $validated = $request->validate([
        'mensagem' => 'required|string',
        'anexos' => 'nullable|array',
        'anexos.*' => 'file|max:10240|mimes:pdf,doc,docx,xls,xlsx,png,jpg,jpeg,gif'
    ]);

    $user = Auth::user();
    $chamado = Chamado::findOrFail($id);

    // Criar mensagem de resposta
    $mensagem = ChamadoMensagem::create([
        'chamado_id' => $chamado->id,
        'usuario_id' => $user->id,
        'tipo' => 'resposta',
        'mensagem' => $validated['mensagem']
    ]);

    // Atualizar data da última resposta e status
    $chamado->update([
        'data_ultima_resposta' => now(),
        'status' => 'em_atendimento'
    ]);

    // Salvar anexos
    if ($request->hasFile('anexos')) {
        foreach ($request->file('anexos') as $arquivo) {
            $nomeOriginal = $arquivo->getClientOriginalName();
            $nomeSalvo = time() . '_' . Str::slug(pathinfo($nomeOriginal, PATHINFO_FILENAME)) . '.' . $arquivo->extension();
            $caminho = $arquivo->storeAs('chamados/' . $chamado->id, $nomeSalvo, 'private');

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
        'message' => 'Resposta adicionada com sucesso',
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
```

---

### 6. Download de Anexo

**GET** `/api/chamados/anexos/{id}/download`

#### Response

```
Content-Type: application/octet-stream
Content-Disposition: attachment; filename="screenshot.png"
```

#### Implementação

```php
public function downloadAnexo($id)
{
    $anexo = ChamadoAnexo::findOrFail($id);
    $user = Auth::user();
    $chamado = $anexo->chamado;

    // Permissão
    $perfisGestores = ['gestor_suporte', 'gestor_contrato'];
    if (!in_array($user->perfil, $perfisGestores) && $chamado->usuario_id !== $user->id) {
        abort(403, 'Sem permissão');
    }

    return Storage::disk('private')->download($anexo->caminho, $anexo->nome_original);
}
```

---

## 🔐 PERMISSÕES

| Ação                   | Usuário Comum    | Gestor   |
| ---------------------- | ---------------- | -------- |
| Criar chamado          | ✅ Sim           | ✅ Sim   |
| Ver próprios chamados  | ✅ Sim           | ✅ Sim   |
| Ver chamados de outros | ❌ Não           | ✅ Sim   |
| Filtrar por usuário    | ❌ Não           | ✅ Sim   |
| Responder chamado      | ❌ Não           | ✅ Sim   |
| Download de anexos     | ✅ Seus chamados | ✅ Todos |

---

## ✅ CHECKLIST DE IMPLEMENTAÇÃO

- [ ] Criar migração das tabelas
- [ ] Criar models com relacionamentos
- [ ] Endpoint criar chamado com anexos
- [ ] Endpoint listar chamados com filtros
- [ ] Endpoint buscar usuários (autocomplete)
- [ ] Endpoint ver detalhes + timeline
- [ ] Endpoint responder chamado com anexos
- [ ] Endpoint download de anexo
- [ ] Validar permissões em todos os endpoints
- [ ] Testar com diferentes perfis

---

**🎉 Guia completo para implementação!**

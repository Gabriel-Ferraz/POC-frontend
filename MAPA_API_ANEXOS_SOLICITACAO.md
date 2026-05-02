# API - Gerenciamento de Anexos de Solicitação de Pagamento

## 1. Listar Anexos da Solicitação

**Endpoint:**

```
GET /api/solicitacoes/{id}
```

**Headers:**

```
Authorization: Bearer {token}
```

**Response Success (200):**

```json
{
	"solicitacao": {
		"id": 1,
		"numero": "SP-2024-000001",
		"status": "Pendente",
		"anexos": [
			{
				"id": 1,
				"tipo_anexo": "Documento Fiscal (NF, Recibo, Guias, Faturas, etc.)",
				"arquivo_path": "/storage/anexos/nf_001.pdf",
				"arquivo_nome": "NF.pdf",
				"status": "Aguardando Aprovação",
				"data_envio": "2024-12-31",
				"motivo_recusa": null
			},
			{
				"id": 2,
				"tipo_anexo": "Certidão Negativa de Débitos",
				"arquivo_path": null,
				"arquivo_nome": null,
				"status": "Pendente",
				"data_envio": null,
				"motivo_recusa": null
			},
			{
				"id": 3,
				"tipo_anexo": "Certidão Tributária",
				"arquivo_path": "/storage/anexos/certidao.pdf",
				"arquivo_nome": "certidao.pdf",
				"status": "Recusado",
				"data_envio": "2024-12-30",
				"motivo_recusa": "Certidão vencida. Por favor, envie uma certidão atualizada."
			},
			{
				"id": 4,
				"tipo_anexo": "Guia de Previdência Social",
				"arquivo_path": null,
				"arquivo_nome": null,
				"status": "Pendente",
				"data_envio": null,
				"motivo_recusa": null
			},
			{
				"id": 5,
				"tipo_anexo": "FGTS",
				"arquivo_path": null,
				"arquivo_nome": null,
				"status": "Pendente",
				"data_envio": null,
				"motivo_recusa": null
			}
		]
	}
}
```

---

## 2. Upload de Anexo

**Endpoint:**

```
POST /api/solicitacoes/{solicitacao_id}/anexos/{anexo_id}/upload
```

**Headers:**

```
Authorization: Bearer {token}
Content-Type: multipart/form-data
```

**Request Body (FormData):**

- `arquivo` (file, required) - Arquivo PDF (máximo 10MB)

**Response Success (200):**

```json
{
	"message": "Anexo enviado com sucesso",
	"anexo": {
		"id": 1,
		"tipo_anexo": "Documento Fiscal (NF, Recibo, Guias, Faturas, etc.)",
		"arquivo_path": "/storage/anexos/nf_001.pdf",
		"arquivo_nome": "NF.pdf",
		"status": "Anexo Cadastrado",
		"data_envio": "2024-12-31"
	}
}
```

**Response Errors:**

### 422 - Validação falhou

```json
{
	"message": "Os dados fornecidos são inválidos",
	"errors": {
		"arquivo": [
			"O campo arquivo é obrigatório",
			"O arquivo deve ser um PDF",
			"O arquivo não pode ser maior que 10MB"
		]
	}
}
```

---

## 3. Remover Anexo

**Endpoint:**

```
POST /api/solicitacoes/{solicitacao_id}/anexos/{anexo_id}
```

ou

```
DELETE /api/solicitacoes/{solicitacao_id}/anexos/{anexo_id}
```

**Headers:**

```
Authorization: Bearer {token}
```

**Response Success (200):**

```json
{
	"message": "Anexo removido com sucesso"
}
```

**Response Errors:**

### 400 - Anexo já aprovado

```json
{
	"message": "Não é possível remover um anexo já aprovado"
}
```

---

## 4. Download/Visualizar Anexo

**Endpoint:**

```
GET /api/solicitacoes/{solicitacao_id}/anexos/{anexo_id}/download
```

**Headers:**

```
Authorization: Bearer {token}
```

**Response:**

- Retorna o arquivo PDF para download/visualização

---

## Regras de Negócio

### 1. Tipos de Anexos Obrigatórios

Os anexos são relacionados pelos operadores da PMSJP de acordo com o tipo de Empenho e exigências do Contrato. Os tipos padrões são:

1. **Documento Fiscal (NF, Recibo, Guias, Faturas, etc.)**
2. **Certidão Negativa de Débitos (CND)**
3. **Certidão Tributária**
4. **Guia de Previdência Social (GPS)**
5. **FGTS**

### 2. Status dos Anexos

- `Pendente` - Anexo ainda não foi enviado (ícone de exclamação laranja)
- `Anexo Cadastrado` - Arquivo foi enviado mas ainda não foi para aprovação
- `Aguardando Aprovação` - Anexo enviado e aguardando análise do Gestor (ícone amarelo)
- `Aprovado` - Anexo aprovado pelo Gestor (ícone verde com check)
- `Recusado` - Anexo recusado pelo Gestor (ícone vermelho com exclamação)

### 3. Fluxo de Aprovação

**Após envio de todos os anexos:**

- A solicitação é automaticamente encaminhada para o Gestor do Contrato
- Status da solicitação muda para "Aguardando Aprovação dos Anexos"

**Se todos os anexos forem aprovados:**

- Status da solicitação muda para "Aguardando Autorização do Gestor"
- Solicitação prossegue no fluxo interno da PMSJP

**Se algum anexo for recusado (exceto Documento Fiscal):**

- Solicitação volta para "Anexos Recusados"
- Responsável Técnico pode corrigir enviando novo anexo
- Após correção, solicitação retorna para aprovação do Gestor

**Se o Documento Fiscal/Recibo for recusado:**

- Não é possível corrigir
- Responsável Técnico deve **cancelar** a solicitação
- Criar uma nova solicitação com documento correto

### 4. Validações de Upload

- **Formato:** Apenas PDF
- **Tamanho:** Máximo 10MB
- **Anexos aprovados:** Não podem ser removidos ou substituídos
- **Permissão:** Apenas o Responsável Técnico/dono da solicitação pode enviar

### 5. Encaminhamento Automático

Quando todos os anexos obrigatórios forem enviados:

```php
// Pseudo-código
if ($solicitacao->anexos()->count() === $solicitacao->anexos()->whereNotNull('arquivo_path')->count()) {
    // Todos os anexos foram enviados
    $solicitacao->update(['status' => 'Aguardando Aprovação dos Anexos']);

    // Notificar Gestor do Contrato
    event(new SolicitacaoProntaParaAprovacao($solicitacao));
}
```

---

## Exemplo de Implementação Laravel

```php
// Controller: AnexoController.php

public function upload(Request $request, $solicitacaoId, $anexoId)
{
    $request->validate([
        'arquivo' => 'required|file|mimes:pdf|max:10240', // 10MB
    ]);

    $solicitacao = SolicitacaoPagamento::findOrFail($solicitacaoId);
    $anexo = $solicitacao->anexos()->findOrFail($anexoId);

    // Verificar permissão
    if ($solicitacao->fornecedor_id !== auth()->user()->fornecedor_id) {
        abort(403, 'Você não tem permissão para enviar anexos desta solicitação');
    }

    // Verificar se já está aprovado
    if ($anexo->status === 'Aprovado') {
        abort(400, 'Não é possível substituir um anexo já aprovado');
    }

    // Upload do arquivo
    $path = $request->file('arquivo')->store('anexos', 'public');

    $anexo->update([
        'arquivo_path' => $path,
        'arquivo_nome' => $request->file('arquivo')->getClientOriginalName(),
        'status' => 'Anexo Cadastrado',
        'data_envio' => now()->format('Y-m-d'),
        'motivo_recusa' => null, // Limpa motivo de recusa anterior
    ]);

    // Verificar se todos os anexos foram enviados
    $todosEnviados = $solicitacao->anexos()
        ->whereNull('arquivo_path')
        ->count() === 0;

    if ($todosEnviados) {
        $solicitacao->update([
            'status' => 'Aguardando Aprovação dos Anexos'
        ]);

        // Notificar Gestor
        event(new SolicitacaoProntaParaAprovacao($solicitacao));
    }

    return response()->json([
        'message' => 'Anexo enviado com sucesso',
        'anexo' => $anexo->fresh(),
    ]);
}

public function remover($solicitacaoId, $anexoId)
{
    $solicitacao = SolicitacaoPagamento::findOrFail($solicitacaoId);
    $anexo = $solicitacao->anexos()->findOrFail($anexoId);

    // Verificar permissão
    if ($solicitacao->fornecedor_id !== auth()->user()->fornecedor_id) {
        abort(403, 'Você não tem permissão para remover anexos desta solicitação');
    }

    // Verificar se já está aprovado
    if ($anexo->status === 'Aprovado') {
        abort(400, 'Não é possível remover um anexo já aprovado');
    }

    // Remover arquivo físico
    if ($anexo->arquivo_path) {
        Storage::disk('public')->delete($anexo->arquivo_path);
    }

    $anexo->update([
        'arquivo_path' => null,
        'arquivo_nome' => null,
        'status' => 'Pendente',
        'data_envio' => null,
    ]);

    return response()->json([
        'message' => 'Anexo removido com sucesso',
    ]);
}

public function download($solicitacaoId, $anexoId)
{
    $solicitacao = SolicitacaoPagamento::findOrFail($solicitacaoId);
    $anexo = $solicitacao->anexos()->findOrFail($anexoId);

    // Verificar permissão
    if ($solicitacao->fornecedor_id !== auth()->user()->fornecedor_id) {
        abort(403, 'Você não tem permissão para visualizar este anexo');
    }

    if (!$anexo->arquivo_path) {
        abort(404, 'Anexo não encontrado');
    }

    return Storage::disk('public')->download($anexo->arquivo_path, $anexo->arquivo_nome);
}
```

---

## Estrutura do Banco de Dados

### Tabela: `anexos`

```sql
CREATE TABLE anexos (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    solicitacao_pagamento_id BIGINT NOT NULL,
    tipo_anexo VARCHAR(255) NOT NULL,
    arquivo_path VARCHAR(255) NULL,
    arquivo_nome VARCHAR(255) NULL,
    status ENUM('Pendente', 'Anexo Cadastrado', 'Aguardando Aprovação', 'Aprovado', 'Recusado') DEFAULT 'Pendente',
    data_envio DATE NULL,
    motivo_recusa TEXT NULL,
    aprovado_por BIGINT NULL,
    data_aprovacao DATETIME NULL,
    created_at TIMESTAMP,
    updated_at TIMESTAMP,
    FOREIGN KEY (solicitacao_pagamento_id) REFERENCES solicitacoes_pagamento(id),
    FOREIGN KEY (aprovado_por) REFERENCES users(id)
);
```

---

## Observações

- O frontend já está implementado e funcional
- Exibe ícones de status (exclamação laranja/vermelho/amarelo, check verde)
- Validação de arquivo (PDF, 10MB) é feita no frontend E deve ser revalidada no backend
- Mensagem de "todos anexos enviados" aparece automaticamente
- Botão de remover é ocultado para anexos aprovados
- Visualização abre o PDF em nova aba

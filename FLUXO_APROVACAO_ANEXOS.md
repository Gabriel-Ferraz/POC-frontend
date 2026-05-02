# Fluxo de Aprovação de Anexos - Gestor de Contrato

## 📋 Visão Geral do Fluxo

```
1. Responsável Técnico envia todos os 5 anexos
   ↓
2. Clica em "Enviar Todos para Aprovação"
   ↓
3. Status da solicitação muda para "Aguardando Aprovação dos Anexos"
   ↓
4. Gestor de Contrato recebe a solicitação na lista de pendentes
   ↓
5. Gestor avalia cada anexo (Aprovar ou Recusar)
   ↓
6a. TODOS APROVADOS → Solicitação segue para próxima fase
6b. ALGUM RECUSADO → Volta para Responsável Técnico corrigir
```

## 🎯 Regras de Negócio

### 1. Quando TODOS os anexos são APROVADOS

- Status da solicitação muda para: **"Aguardando Autorização do Gestor"**
- Solicitação prossegue no fluxo interno da PMSJP
- Responsável Técnico pode acompanhar o progresso em tempo real
- Fluxo continua: Liquidação → Ordem de Pagamento → Pagamento em Remessa → Pagamento Realizado

### 2. Quando ALGUM anexo é RECUSADO (exceto Documento Fiscal)

- Status da solicitação muda para: **"Anexos Recusados"**
- Responsável Técnico é notificado
- Responsável Técnico pode:
    - Substituir o anexo recusado
    - Clicar novamente em "Enviar Todos para Aprovação"
- Solicitação retorna para fila do Gestor

### 3. Quando DOCUMENTO FISCAL é RECUSADO (regra especial ⚠️)

- **NÃO É POSSÍVEL CORRIGIR**
- Responsável Técnico DEVE:
    1. Cancelar a solicitação atual
    2. Criar uma nova solicitação
    3. Enviar o documento fiscal correto
- Frontend mostra alerta especial ao Gestor
- Frontend mostra alerta especial ao Responsável Técnico

## 🔄 Estados da Solicitação

| Status                           | Descrição                                    | Quem vê             |
| -------------------------------- | -------------------------------------------- | ------------------- |
| Pendente                         | Criada, anexos ainda não enviados            | Responsável Técnico |
| Aguardando Aprovação dos Anexos  | Todos anexos enviados                        | Gestor de Contrato  |
| Anexos Recusados                 | Algum anexo foi recusado (exceto Doc Fiscal) | Responsável Técnico |
| Aguardando Autorização do Gestor | Todos anexos aprovados                       | Gestor de Contrato  |
| Em Liquidação                    | Autorizada pelo gestor                       | PMSJP               |
| Em Ordem de Pagamento            | Liquidada                                    | PMSJP               |
| Pagamento em Remessa             | Ordem criada                                 | PMSJP               |
| Pagamento Realizado              | Pagamento efetuado                           | Todos               |
| Cancelada                        | Cancelada pelo Responsável Técnico           | Todos               |

## 📡 Endpoints Necessários no Backend

### 1. Aprovar Anexo

```
POST /api/anexos/{anexoId}/aprovar

Response (Sucesso):
{
  "message": "Anexo aprovado com sucesso",
  "anexo": {
    "id": 16,
    "status": "Aprovado",
    "avaliado_por": "João Silva (Gestor)",
    "avaliado_em": "2026-05-02 14:30:00"
  }
}

Lógica Backend:
1. Atualizar status do anexo para "Aprovado"
2. Registrar usuário e data da aprovação
3. VERIFICAR se todos os 5 anexos estão aprovados:
   - Se SIM: mudar status da solicitação para "Aguardando Autorização do Gestor"
   - Se NÃO: manter status "Aguardando Aprovação dos Anexos"
```

### 2. Recusar Anexo

```
POST /api/anexos/{anexoId}/recusar

Body:
{
  "motivo": "Certidão vencida. Por favor, envie uma certidão atualizada."
}

Response (Sucesso):
{
  "message": "Anexo recusado com sucesso",
  "anexo": {
    "id": 17,
    "status": "Recusado",
    "motivo_recusa": "Certidão vencida. Por favor, envie uma certidão atualizada.",
    "avaliado_por": "João Silva (Gestor)",
    "avaliado_em": "2026-05-02 14:35:00"
  }
}

Lógica Backend:
1. Atualizar status do anexo para "Recusado"
2. Salvar motivo da recusa
3. Registrar usuário e data da recusa
4. Mudar status da solicitação para "Anexos Recusados"
5. NOTIFICAR Responsável Técnico (email/sistema)
```

### 3. Listar Solicitações Pendentes (Gestor)

```
GET /api/gestor/solicitacoes-pendentes

Response:
{
  "solicitacoes": [
    {
      "id": 4,
      "numero": "SP-2026-000004",
      "fornecedor": "Empresa X LTDA",
      "solicitante": "João Silva",
      "empenho": "2026/1234",
      "valor": 12000.00,
      "data": "2026-05-02",
      "status": "Aguardando Aprovação dos Anexos",
      "anexos_aprovados": 2,
      "anexos_pendentes": 3,
      "anexos_recusados": 0
    }
  ]
}
```

### 4. Detalhes da Solicitação (Gestor)

```
GET /api/gestor/solicitacoes/{id}

Response:
{
  "solicitacao": {
    "id": 4,
    "numero": "SP-2026-000004",
    "fornecedor": "Empresa X LTDA",
    "cnpj": "12.345.678/0001-90",
    "solicitante": "João Silva",
    "empenho": "2026/1234",
    "contrato": "CT-2026/001",
    "documento_fiscal": {
      "tipo": "Nota Fiscal Eletrônica",
      "numero": "12345",
      "serie": "A",
      "data_emissao": "2026-04-30"
    },
    "valor": 12000.00,
    "data": "2026-05-02",
    "status": "Aguardando Aprovação dos Anexos"
  },
  "anexos": [
    {
      "id": 16,
      "tipo_anexo": "documento_fiscal",
      "tipo_anexo_label": "Documento Fiscal (NF, Recibo, Guias, Faturas, etc.)",
      "arquivo": "abc123.pdf",
      "status": "Aguardando Aprovação",
      "data_envio": "2026-05-02",
      "motivo_recusa": null,
      "avaliado_por": null,
      "avaliado_em": null
    },
    {
      "id": 17,
      "tipo_anexo": "cnd",
      "tipo_anexo_label": "Certidão Negativa de Débitos",
      "arquivo": "def456.pdf",
      "status": "Aprovado",
      "data_envio": "2026-05-02",
      "motivo_recusa": null,
      "avaliado_por": "João Silva (Gestor)",
      "avaliado_em": "2026-05-02 14:30:00"
    }
  ]
}
```

## 🎨 Interface do Frontend (Gestor)

### Tela: Lista de Solicitações Pendentes

```
┌─────────────────────────────────────────────────────────────┐
│  Aprovar Anexos                                              │
│  Lista de solicitações pendentes de aprovação de anexos      │
├─────────────────────────────────────────────────────────────┤
│  Número      Fornecedor   Empenho   Valor      Anexos        │
│  SP-2026-004 Empresa X    2026/1234 R$ 12.000 ✅ 2 ⏳ 3 ❌ 0 │
│                                                [Avaliar]      │
└─────────────────────────────────────────────────────────────┘
```

### Tela: Avaliar Anexos

```
┌─────────────────────────────────────────────────────────────┐
│  ⚠️  Documento Fiscal recusado - Solicitação deve ser        │
│      cancelada                                               │
│      O Responsável Técnico deverá cancelar e criar nova.     │
├─────────────────────────────────────────────────────────────┤
│  📄 Documento Fiscal (NF, Recibo...)                         │
│     Status: Aguardando Aprovação                             │
│     [Visualizar] [✓ Aprovar] [✗ Recusar]                    │
├─────────────────────────────────────────────────────────────┤
│  📄 Certidão Negativa de Débitos                             │
│     Status: Aprovado ✅                                       │
│     Aprovado por João Silva em 02/05/2026 14:30             │
│     [Visualizar]                                             │
├─────────────────────────────────────────────────────────────┤
│  📄 Certidão Tributária                                      │
│     Status: Recusado ❌                                       │
│     Motivo: Certidão vencida. Envie atualizada.             │
│     Recusado por João Silva em 02/05/2026 14:35             │
│     [Visualizar]                                             │
└─────────────────────────────────────────────────────────────┘
```

### Modal: Recusar Anexo (Documento Fiscal)

```
┌─────────────────────────────────────────────────────────────┐
│  Recusar Anexo                                               │
├─────────────────────────────────────────────────────────────┤
│  ⚠️  Atenção: Documento Fiscal                               │
│      Ao recusar o Documento Fiscal, o Responsável Técnico   │
│      deverá cancelar a solicitação e criar uma nova.         │
│      Este tipo de anexo não pode ser corrigido.              │
├─────────────────────────────────────────────────────────────┤
│  Motivo da Recusa *                                          │
│  ┌─────────────────────────────────────────────────────────┐│
│  │ Nota fiscal com erro no CNPJ...                         ││
│  │                                                          ││
│  └─────────────────────────────────────────────────────────┘│
│                                           [Cancelar] [Confirmar]
└─────────────────────────────────────────────────────────────┘
```

## ✅ Frontend - Já Implementado

✅ Tela de lista de solicitações pendentes (`/gestor/solicitacoes`)
✅ Tela de avaliação de anexos (`/gestor/solicitacoes/[id]/anexos`)
✅ Botões de Aprovar e Recusar para cada anexo
✅ Modal de recusa com campo de motivo obrigatório
✅ Alerta especial quando Documento Fiscal é recusado
✅ Alerta no modal ao recusar Documento Fiscal
✅ Download/visualização de anexos
✅ Exibição de status de cada anexo (Aprovado/Recusado/Aguardando)
✅ Exibição de motivo da recusa
✅ Exibição de quem aprovou/recusou e quando

## 🔔 Notificações Recomendadas

### Quando anexos são enviados para aprovação

- **Notificar**: Gestor de Contrato
- **Mensagem**: "Nova solicitação aguardando aprovação de anexos - SP-2026-000004"

### Quando todos anexos são aprovados

- **Notificar**: Responsável Técnico
- **Mensagem**: "Todos os anexos foram aprovados! Solicitação SP-2026-000004 segue para próxima fase."

### Quando algum anexo é recusado

- **Notificar**: Responsável Técnico
- **Mensagem**: "Anexos recusados na solicitação SP-2026-000004. Corrija e reenvie."
- **Se Documento Fiscal**: "⚠️ Documento Fiscal recusado. Cancele a solicitação e crie uma nova."

## 📊 Exemplo de Implementação Backend (Laravel)

```php
// Aprovar Anexo
public function aprovarAnexo($anexoId)
{
    $anexo = Anexo::findOrFail($anexoId);
    $solicitacao = $anexo->solicitacao;

    $anexo->update([
        'status' => 'Aprovado',
        'avaliado_por' => auth()->id(),
        'avaliado_em' => now(),
    ]);

    // Verificar se todos os anexos estão aprovados
    $todosAprovados = $solicitacao->anexos()
        ->where('status', '!=', 'Aprovado')
        ->count() === 0;

    if ($todosAprovados) {
        $solicitacao->update([
            'status' => 'Aguardando Autorização do Gestor'
        ]);

        // Notificar Responsável Técnico
        event(new AnexosAprovados($solicitacao));
    }

    return response()->json([
        'message' => 'Anexo aprovado com sucesso',
        'anexo' => $anexo->fresh()
    ]);
}

// Recusar Anexo
public function recusarAnexo(Request $request, $anexoId)
{
    $validated = $request->validate([
        'motivo' => 'required|string|min:10|max:500'
    ]);

    $anexo = Anexo::findOrFail($anexoId);
    $solicitacao = $anexo->solicitacao;

    $anexo->update([
        'status' => 'Recusado',
        'motivo_recusa' => $validated['motivo'],
        'avaliado_por' => auth()->id(),
        'avaliado_em' => now(),
    ]);

    $solicitacao->update([
        'status' => 'Anexos Recusados'
    ]);

    // Notificar Responsável Técnico
    $isDocumentoFiscal = str_contains(strtolower($anexo->tipo_anexo_label), 'documento fiscal');
    event(new AnexoRecusado($solicitacao, $anexo, $isDocumentoFiscal));

    return response()->json([
        'message' => 'Anexo recusado com sucesso',
        'anexo' => $anexo->fresh()
    ]);
}
```

## 🎉 Resumo

O fluxo está **totalmente implementado no frontend** e pronto para integração com o backend. Apenas implemente os endpoints conforme especificado neste documento.

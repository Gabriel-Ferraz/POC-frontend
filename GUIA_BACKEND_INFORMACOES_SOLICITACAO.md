# 📋 GUIA BACKEND - Informações da Solicitação de Pagamento

## 🎯 VISÃO GERAL

A página de **Informações da Solicitação de Pagamento** exibe:

1. **Andamento visual** com 13 etapas (verde = concluído, laranja = em andamento, cinza = pendente)
2. **12 abas** com informações detalhadas de cada fase do processo

---

## 📡 ENDPOINT PRINCIPAL

### GET /api/solicitacoes/{id}

**Response completo:**

```json
{
	"solicitacao": {
		"id": 4,
		"numero": "SP-2026-000004",
		"status": "aguardando_aprovacao_anexos",
		"valor": 12000.0,
		"created_at": "16/01/2023",

		// DADOS GERAIS
		"solicitante": {
			"id": 10,
			"name": "João Silva - RESPONSÁVEL TÉCNICO DO FORNECEDOR",
			"cpf": "123.456.789-00"
		},
		"empenho": {
			"id": 1,
			"numero": "1234/2023"
		},
		"fornecedor": {
			"id": 5,
			"cnpj": "12.345.678/0001-90",
			"razao_social": "FORNECEDOR LTDA"
		},
		"contrato": {
			"id": 2,
			"numero": "1234/2023"
		},

		// DOCUMENTO FISCAL
		"documento_fiscal_tipo": "NOTA FISCAL",
		"documento_fiscal_numero": "1234",
		"documento_fiscal_serie": "A1",
		"documento_fiscal_data_emissao": "16/01/2023",

		// FORMA DE PAGAMENTO
		"forma_pagamento_tipo": "conta_bancaria",
		"banco": "Banco do Brasil",
		"agencia": "1234",
		"agencia_digito": "5",
		"conta": "12345",
		"conta_digito": "6",
		"operacao": "013",
		"cidade_banco": "São José dos Pinhais",

		// ANDAMENTO (⭐ IMPORTANTE)
		"andamento": {
			"etapas": [
				{
					"key": "solicitacao_pagamento",
					"label": "Solicitação de Pagamento",
					"status": "concluido",
					"data_conclusao": "16/01/2023 10:30",
					"usuario": "João Silva"
				},
				{
					"key": "anexos",
					"label": "Anexos",
					"status": "em_andamento",
					"data_inicio": "16/01/2023 11:00"
				},
				{
					"key": "fiscal",
					"label": "Fiscal",
					"status": "pendente"
				},
				{
					"key": "gestor",
					"label": "Gestor",
					"status": "pendente"
				},
				{
					"key": "liquidacao",
					"label": "Liquidação",
					"status": "pendente"
				},
				{
					"key": "secretario",
					"label": "Secretário(a)",
					"status": "pendente"
				},
				{
					"key": "iss",
					"label": "ISS",
					"status": "pendente"
				},
				{
					"key": "ordem_pagamento",
					"label": "Ordem de Pagamento",
					"status": "pendente"
				},
				{
					"key": "autorizacao",
					"label": "Autorização",
					"status": "pendente"
				},
				{
					"key": "bordero",
					"label": "Borderô",
					"status": "pendente"
				},
				{
					"key": "remessa",
					"label": "Remessa",
					"status": "pendente"
				},
				{
					"key": "pagamento",
					"label": "Pagamento",
					"status": "pendente"
				},
				{
					"key": "pagamento_realizado",
					"label": "Pagamento Realizado",
					"status": "pendente"
				}
			]
		},

		// TRÂMITES
		"tramites": [
			{
				"id": 1,
				"fase": "Solicitação Criada",
				"created_at": "16/01/2023 10:30",
				"usuario": {
					"id": 10,
					"name": "João Silva"
				},
				"observacao": "Solicitação criada pelo responsável técnico"
			},
			{
				"id": 2,
				"fase": "Anexos Enviados para Aprovação",
				"created_at": "16/01/2023 11:00",
				"usuario": {
					"id": 10,
					"name": "João Silva"
				},
				"observacao": null
			}
		],

		// ANEXOS PAGAMENTO
		"anexos": [
			{
				"id": 16,
				"tipo_anexo": "documento_fiscal",
				"tipo_anexo_label": "Documento Fiscal (NF, Recibo, Guias, Faturas, etc.)",
				"arquivo_nome": "nota_fiscal.pdf",
				"arquivo_path": "/storage/anexos/abc123.pdf",
				"status": "Aguardando Aprovação",
				"data_envio": "16/01/2023",
				"avaliado_por": null,
				"motivo_recusa": null
			},
			{
				"id": 17,
				"tipo_anexo": "certidao_negativa_debitos",
				"tipo_anexo_label": "Certidão Negativa de Débitos",
				"arquivo_nome": "certidao.pdf",
				"arquivo_path": "/storage/anexos/def456.pdf",
				"status": "Aprovado",
				"data_envio": "16/01/2023",
				"avaliado_por": "Maria Santos (Gestor)",
				"motivo_recusa": null
			},
			{
				"id": 18,
				"tipo_anexo": "certidao_tributaria",
				"tipo_anexo_label": "Certidão Tributária",
				"arquivo_nome": "certidao_trib.pdf",
				"arquivo_path": "/storage/anexos/ghi789.pdf",
				"status": "Recusado",
				"data_envio": "16/01/2023",
				"avaliado_por": "Maria Santos (Gestor)",
				"motivo_recusa": "Certidão vencida. Favor enviar atualizada."
			}
		],

		// PAGAMENTO REALIZADO
		"pagamento_realizado": null
		// OU quando finalizado:
		// "pagamento_realizado": {
		//   "id": 1,
		//   "data_hora": "20/01/2023 14:30",
		//   "valor": 12000.00,
		//   "comprovante": "/storage/comprovantes/pagamento_123.pdf"
		// }
	}
}
```

---

## 🔄 LÓGICA DO ANDAMENTO

### Status das Etapas

```php
class SolicitacaoPagamento extends Model
{
    public function getAndamentoAttribute()
    {
        $etapas = [
            ['key' => 'solicitacao_pagamento', 'label' => 'Solicitação de Pagamento'],
            ['key' => 'anexos', 'label' => 'Anexos'],
            ['key' => 'fiscal', 'label' => 'Fiscal'],
            ['key' => 'gestor', 'label' => 'Gestor'],
            ['key' => 'liquidacao', 'label' => 'Liquidação'],
            ['key' => 'secretario', 'label' => 'Secretário(a)'],
            ['key' => 'iss', 'label' => 'ISS'],
            ['key' => 'ordem_pagamento', 'label' => 'Ordem de Pagamento'],
            ['key' => 'autorizacao', 'label' => 'Autorização'],
            ['key' => 'bordero', 'label' => 'Borderô'],
            ['key' => 'remessa', 'label' => 'Remessa'],
            ['key' => 'pagamento', 'label' => 'Pagamento'],
            ['key' => 'pagamento_realizado', 'label' => 'Pagamento Realizado'],
        ];

        return [
            'etapas' => array_map(function($etapa) {
                return [
                    'key' => $etapa['key'],
                    'label' => $etapa['label'],
                    'status' => $this->getStatusEtapa($etapa['key']),
                ];
            }, $etapas)
        ];
    }

    private function getStatusEtapa($key)
    {
        // Mapear status da solicitação para etapa
        $mapa = [
            'pendente' => ['solicitacao_pagamento' => 'em_andamento'],
            'aguardando_aprovacao_anexos' => [
                'solicitacao_pagamento' => 'concluido',
                'anexos' => 'em_andamento'
            ],
            'anexos_recusados' => [
                'solicitacao_pagamento' => 'concluido',
                'anexos' => 'em_andamento'
            ],
            'aguardando_autorizacao_gestor' => [
                'solicitacao_pagamento' => 'concluido',
                'anexos' => 'concluido',
                'fiscal' => 'concluido',
                'gestor' => 'em_andamento'
            ],
            'em_liquidacao' => [
                'solicitacao_pagamento' => 'concluido',
                'anexos' => 'concluido',
                'fiscal' => 'concluido',
                'gestor' => 'concluido',
                'liquidacao' => 'em_andamento'
            ],
            'aguardando_secretario' => [
                'solicitacao_pagamento' => 'concluido',
                'anexos' => 'concluido',
                'fiscal' => 'concluido',
                'gestor' => 'concluido',
                'liquidacao' => 'concluido',
                'secretario' => 'em_andamento'
            ],
            'em_iss' => [
                'solicitacao_pagamento' => 'concluido',
                'anexos' => 'concluido',
                'fiscal' => 'concluido',
                'gestor' => 'concluido',
                'liquidacao' => 'concluido',
                'secretario' => 'concluido',
                'iss' => 'em_andamento'
            ],
            'em_ordem_pagamento' => [
                'solicitacao_pagamento' => 'concluido',
                'anexos' => 'concluido',
                'fiscal' => 'concluido',
                'gestor' => 'concluido',
                'liquidacao' => 'concluido',
                'secretario' => 'concluido',
                'iss' => 'concluido',
                'ordem_pagamento' => 'em_andamento'
            ],
            'aguardando_autorizacao' => [
                'solicitacao_pagamento' => 'concluido',
                'anexos' => 'concluido',
                'fiscal' => 'concluido',
                'gestor' => 'concluido',
                'liquidacao' => 'concluido',
                'secretario' => 'concluido',
                'iss' => 'concluido',
                'ordem_pagamento' => 'concluido',
                'autorizacao' => 'em_andamento'
            ],
            'em_bordero' => [
                'solicitacao_pagamento' => 'concluido',
                'anexos' => 'concluido',
                'fiscal' => 'concluido',
                'gestor' => 'concluido',
                'liquidacao' => 'concluido',
                'secretario' => 'concluido',
                'iss' => 'concluido',
                'ordem_pagamento' => 'concluido',
                'autorizacao' => 'concluido',
                'bordero' => 'em_andamento'
            ],
            'em_remessa' => [
                'solicitacao_pagamento' => 'concluido',
                'anexos' => 'concluido',
                'fiscal' => 'concluido',
                'gestor' => 'concluido',
                'liquidacao' => 'concluido',
                'secretario' => 'concluido',
                'iss' => 'concluido',
                'ordem_pagamento' => 'concluido',
                'autorizacao' => 'concluido',
                'bordero' => 'concluido',
                'remessa' => 'em_andamento'
            ],
            'pagamento_em_remessa' => [
                'solicitacao_pagamento' => 'concluido',
                'anexos' => 'concluido',
                'fiscal' => 'concluido',
                'gestor' => 'concluido',
                'liquidacao' => 'concluido',
                'secretario' => 'concluido',
                'iss' => 'concluido',
                'ordem_pagamento' => 'concluido',
                'autorizacao' => 'concluido',
                'bordero' => 'concluido',
                'remessa' => 'concluido',
                'pagamento' => 'em_andamento'
            ],
            'pagamento_realizado' => [
                'solicitacao_pagamento' => 'concluido',
                'anexos' => 'concluido',
                'fiscal' => 'concluido',
                'gestor' => 'concluido',
                'liquidacao' => 'concluido',
                'secretario' => 'concluido',
                'iss' => 'concluido',
                'ordem_pagamento' => 'concluido',
                'autorizacao' => 'concluido',
                'bordero' => 'concluido',
                'remessa' => 'concluido',
                'pagamento' => 'concluido',
                'pagamento_realizado' => 'concluido'
            ],
        ];

        $statusAtual = $this->status;

        if (isset($mapa[$statusAtual][$key])) {
            return $mapa[$statusAtual][$key];
        }

        return 'pendente';
    }
}
```

---

## 📊 TABELA DE TRÂMITES

### Estrutura da Tabela `tramites`

```sql
CREATE TABLE tramites (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    solicitacao_pagamento_id BIGINT NOT NULL,
    fase VARCHAR(255) NOT NULL,
    usuario_id BIGINT,
    observacao TEXT,
    created_at TIMESTAMP,
    updated_at TIMESTAMP,

    FOREIGN KEY (solicitacao_pagamento_id) REFERENCES solicitacoes_pagamento(id),
    FOREIGN KEY (usuario_id) REFERENCES users(id)
);
```

### Registrar Trâmite

```php
public function registrarTramite($fase, $observacao = null)
{
    $this->tramites()->create([
        'fase' => $fase,
        'usuario_id' => auth()->id(),
        'observacao' => $observacao,
        'created_at' => now(),
    ]);
}
```

### Exemplos de Fases

- `"Solicitação Criada"`
- `"Anexos Enviados para Aprovação"`
- `"Anexo Aprovado pelo Gestor"`
- `"Anexo Recusado pelo Gestor"`
- `"Autorizado pelo Gestor de Contrato"`
- `"Em Análise pela Comissão de Liquidação"`
- `"Liquidado"`
- `"Aprovado pelo Secretário"`
- `"Enviado para ISS"`
- `"Ordem de Pagamento Gerada"`
- `"Autorizado para Pagamento"`
- `"Incluído no Borderô"`
- `"Enviado para Remessa Bancária"`
- `"Pagamento Realizado"`

---

## 🎨 12 ABAS - ESPECIFICAÇÕES

### 1. ABA: GERAL

**Exibe:** Dados gerais da solicitação

- N. Solicitação
- Data de Cadastro
- Valor
- Solicitante (CPF + Nome)
- Empenho
- Fornecedor (CNPJ + Razão Social)
- Contrato
- Tipo de Documento
- N. Doc Fiscal
- Série Doc Fiscal
- Data Emissão Doc. Fiscal

### 2. ABA: TRÂMITES DA SOLICITAÇÃO DE PAGAMENTO

**Exibe:** Lista cronológica de todos os trâmites

- Fase
- Data/Hora
- Usuário responsável
- Observação

**Sempre registrar:**

- Operador da PMSJP que tramitou
- Data
- Observação (opcional)

### 3. ABA: ANEXOS PAGAMENTO

**Exibe:** Tabela com todos os anexos

- Tipo de Anexo
- Data de Cadastro
- Nome do Arquivo
- Situação (Anexo Cadastrado / Anexo Aprovado / Anexo Recusado)
- Responsável pela inserção

### 4. ABA: GESTOR

**Exibe:** Tramitação interna (sem interação do Responsável Técnico)

- Apenas acompanhamento

### 5. ABA: COMISSÃO DE LIQUIDAÇÃO

**Exibe:** Tramitação interna

- Apenas acompanhamento

### 6. ABA: PROCESSO

**Exibe:** Tramitação interna

- Apenas acompanhamento

### 7. ABA: ORDEM DE PAGAMENTO

**Exibe:** Tramitação interna

- Apenas acompanhamento

### 8. ABA: ISS / PATRIMÔNIO

**Exibe:** Tramitação conforme classificação do elemento de despesa

- Depende do Produto da requisição de compras que gerou o empenho

### 9. ABA: FORMA DE PAGAMENTO

**Exibe:** Informações bancárias indicadas na inserção

- Forma de Pagamento (Conta Bancária / Documento)
- Banco
- Agência
- Conta
- Operação
- Cidade do Banco

### 10. ABA: BORDERÔ

**Exibe:** Tramitação interna

- Apenas acompanhamento

### 11. ABA: REMESSA

**Exibe:** Tramitação interna

- Apenas acompanhamento

### 12. ABA: PAGAMENTO REALIZADO

**Exibe:** Quando finalizado:

- ✅ Pagamento Realizado com Sucesso
- Data/Hora do Pagamento
- Conta Destino
- Histórico completo de todos os trâmites

**Andamento:** Todos os indicadores devem estar VERDES (concluídos)

---

## ✅ CHECKLIST DE IMPLEMENTAÇÃO BACKEND

- [ ] Criar campo `andamento` dinâmico na resposta da API
- [ ] Mapear status da solicitação para status das etapas (concluido/em_andamento/pendente)
- [ ] Criar tabela `tramites` com campos: fase, usuario_id, observacao, created_at
- [ ] Implementar método `registrarTramite()` no model
- [ ] Registrar trâmite em TODA mudança de status da solicitação
- [ ] Incluir relação `tramites` no response da API
- [ ] Incluir relação `anexos` com campos completos (status, avaliado_por, motivo_recusa)
- [ ] Adicionar campo `pagamento_realizado` (null ou objeto com data/hora)
- [ ] Incluir dados do `solicitante`, `empenho`, `fornecedor`, `contrato` no response
- [ ] Testar todos os status e verificar se andamento está correto

---

## 🎯 EXEMPLO DE FLUXO COMPLETO

1. **Responsável cria solicitação** → Status: `pendente`
    - Andamento: Solicitação (laranja), demais (cinza)
    - Tramite: "Solicitação Criada"

2. **Responsável envia anexos** → Status: `aguardando_aprovacao_anexos`
    - Andamento: Solicitação (verde), Anexos (laranja), demais (cinza)
    - Tramite: "Anexos Enviados para Aprovação"

3. **Gestor aprova anexos** → Status: `aguardando_autorizacao_gestor`
    - Andamento: Solicitação e Anexos (verde), Gestor (laranja), demais (cinza)
    - Tramite: "Todos Anexos Aprovados"

4. **Gestor autoriza** → Status: `em_liquidacao`
    - Andamento: até Gestor (verde), Liquidação (laranja), demais (cinza)
    - Tramite: "Autorizado pelo Gestor de Contrato"

5. ... (continua até)

6. **Pagamento realizado** → Status: `pagamento_realizado`
    - Andamento: TODOS (verde)
    - Tramite: "Pagamento Realizado"

---

## 🚀 PRONTO PARA INTEGRAÇÃO!

Frontend já implementado e aguardando o backend seguir esta especificação.

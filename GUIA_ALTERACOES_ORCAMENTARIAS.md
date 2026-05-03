# Guia Completo - Alterações Orçamentárias Frontend

## 1. Instalar Dependência Faltante

Primeiro, instale a dependência do AlertDialog do Radix UI. Escolha um dos comandos abaixo conforme seu gerenciador de pacotes:

```bash
# Se usar npm:
npm install @radix-ui/react-alert-dialog

# Se usar yarn:
yarn add @radix-ui/react-alert-dialog

# Se usar pnpm:
pnpm add @radix-ui/react-alert-dialog
```

## 2. Estrutura de Arquivos Criada

```
src/app/(authenticated)/orcamentario/alteracoes/
├── page.tsx                              # Listagem de alterações
├── components/
│   └── AlteracaoForm.tsx                 # Formulário de alteração
├── [id]/
    ├── page.tsx                          # Redireciona para /dotacoes
    └── dotacoes/
        ├── page.tsx                      # Gestão de dotações
        └── components/
            └── DotacaoForm.tsx           # Formulário de dotação

src/components/ui/
├── alert-dialog.tsx                      # Novo componente criado
└── badge.tsx                             # Atualizado com variantes success/warning

src/services/
└── orcamentario.service.ts               # Já criado anteriormente
```

## 3. Como Usar as Telas

### 3.1. Listagem de Alterações

**Rota:** `/orcamentario/alteracoes`

**Funcionalidades:**

- Ver todas as alterações orçamentárias
- Criar nova alteração (botão no topo)
- Editar alteração em elaboração (ícone de lápis)
- Excluir alteração em elaboração (ícone de lixeira)
- Ver dotações (botão "Dotações")
- Baixar PDF (botão "PDF")
- Badge de status (verde = concluída, amarelo = em elaboração)

**Como testar:**

1. Acesse `/orcamentario/alteracoes`
2. Clique em "Nova Alteração" para abrir o formulário
3. Preencha todos os campos obrigatórios
4. Clique em "Salvar"

### 3.2. Criar/Editar Alteração

**Modal:** Aberto pela listagem

**Campos do Formulário:**

- **Lei/Ato:** Dropdown com leis cadastradas no sistema
- **Número do Ato:** Texto livre (ex: "001/2024")
- **Data do Ato:** Seletor de data
- **Data do Lançamento:** Seletor de data
- **Data da Publicação:** Seletor de data
- **Tipo de Ato:** Dropdown (Decreto, Resolução, Ato Gestor)
- **Tipo de Crédito:** Dropdown (Especial, Suplementar, Extraordinário)
- **Tipo de Recurso:** Dropdown (Anulação, Excesso de arrecadação, Valor do Crédito)
- **Solicitar dotações pendentes:** Checkbox

**Validações:**

- Todos os campos (exceto checkbox) são obrigatórios
- Toast de erro se algum campo estiver vazio

### 3.3. Gestão de Dotações

**Rota:** `/orcamentario/alteracoes/[id]/dotacoes`

**Funcionalidades:**

- Ver informações da alteração no cabeçalho
- Cards com totalizadores:
    - Total Suprimido (vermelho)
    - Total Suplementado (verde)
    - Diferença (calculada automaticamente)
- Listar todas as dotações
- Adicionar nova dotação (se em elaboração)
- Editar dotação (se em elaboração)
- Excluir dotação (se em elaboração)
- Concluir alteração (se em elaboração e tem dotações)
- Voltar para listagem

**Como testar:**

1. Na listagem, clique em "Dotações" em uma alteração
2. Clique em "Adicionar Dotação"
3. Preencha o código da dotação
4. Clique em "Consultar Saldo"
5. Preencha valores suprimido e suplementado
6. Clique em "Salvar"
7. Quando terminar, clique em "Concluir Alteração"

### 3.4. Adicionar/Editar Dotação

**Modal:** Aberto pela página de dotações

**Campos do Formulário:**

- **Código da Dotação:** Texto (ex: "1.2.3.4.5.6.7")
    - Botão "Consultar Saldo" ao lado
- **Conta Receita:** Texto (aparece só para tipos específicos)
- **Valor Suprimido:** Número com 2 casas decimais
- **Valor Suplementado:** Número com 2 casas decimais
- **Observação:** Texto livre (textarea)

**Cards Informativos:**

1. **Card Azul** (aparece após consultar saldo):
    - Descrição da dotação
    - Saldo disponível
    - Saldo empenhado
    - Saldo bloqueado

2. **Card Verde** (aparece após consultar saldo):
    - Saldo Resultante calculado em tempo real
    - Fórmula: Saldo Disponível - Valor Suprimido + Valor Suplementado

**Validações:**

- Valor suprimido não pode exceder saldo disponível
- Saldo resultante não pode ser negativo
- Botão "Salvar" fica desabilitado se houver erro

## 4. Fluxo Completo de Uso

### 4.1. Criar uma Alteração Orçamentária

1. Acesse `/orcamentario/alteracoes`
2. Clique em "Nova Alteração"
3. Preencha todos os campos:
    - Selecione uma Lei/Ato
    - Digite o número do ato
    - Selecione as datas
    - Escolha tipo de ato, crédito e recurso
    - Marque checkbox se desejar
4. Clique em "Salvar"
5. Alteração criada com status "Em Elaboração"

### 4.2. Adicionar Dotações

1. Na listagem, clique em "Dotações" na alteração criada
2. Clique em "Adicionar Dotação"
3. Digite o código da dotação
4. Clique em "Consultar Saldo"
5. Verifique as informações da dotação no card azul
6. Preencha valores:
    - Valor Suprimido (quanto vai retirar)
    - Valor Suplementado (quanto vai adicionar)
7. Observe o Saldo Resultante no card verde
8. Se tiver observação, adicione
9. Clique em "Salvar"
10. Repita para adicionar mais dotações

### 4.3. Concluir Alteração

1. Na página de dotações, revise os totalizadores
2. Verifique se a diferença está correta
3. Clique em "Concluir Alteração"
4. Confirme no dialog
5. Alteração agora está com status "Concluída"
6. Não é mais possível editar ou adicionar dotações

### 4.4. Gerar PDF

1. Na listagem, clique no botão "PDF"
2. PDF será baixado automaticamente

## 5. Regras de Negócio Importantes

### Status "Em Elaboração"

- Pode editar alteração
- Pode excluir alteração
- Pode adicionar/editar/excluir dotações
- Pode concluir alteração

### Status "Concluída"

- NÃO pode editar alteração
- NÃO pode excluir alteração
- NÃO pode adicionar/editar/excluir dotações
- Pode apenas visualizar e gerar PDF

### Campo Conta Receita

Aparece APENAS quando o Tipo de Recurso for:

- "Excesso de arrecadação"
- "Valor do Crédito"

Para tipo "Anulação", o campo não aparece.

### Validações de Dotação

- Valor Suprimido ≤ Saldo Disponível
- Saldo Resultante ≥ 0
- Saldo Resultante = Saldo Disponível - Suprimido + Suplementado

### Totalizadores

- **Total Suprimido:** Soma de todos os valores suprimidos
- **Total Suplementado:** Soma de todos os valores suplementados
- **Diferença:** Total Suplementado - Total Suprimido

## 6. Cores e Badges

### Status

- **Em Elaboração:** Badge amarelo
- **Concluída:** Badge verde

### Valores

- **Suprimido:** Vermelho (negativo)
- **Suplementado:** Verde (positivo)
- **Diferença:**
    - Verde: positivo
    - Vermelho: negativo
    - Azul: zero (equilibrado)

## 7. Toasts (Notificações)

### Sucesso (Verde)

- "Alteração orçamentária criada com sucesso"
- "Alteração orçamentária atualizada com sucesso"
- "Alteração orçamentária excluída com sucesso"
- "Dotação criada com sucesso"
- "Dotação atualizada com sucesso"
- "Dotação excluída com sucesso"
- "Saldo consultado com sucesso"
- "Alteração orçamentária concluída com sucesso"

### Erro (Vermelho)

- "Erro ao criar alteração orçamentária"
- "Erro ao atualizar alteração orçamentária"
- "Erro ao excluir alteração orçamentária"
- "Erro ao criar dotação"
- "Erro ao atualizar dotação"
- "Erro ao excluir dotação"
- "Erro ao consultar saldo da dotação"
- "Erro ao concluir alteração orçamentária"

### Aviso (Amarelo)

- "Não é possível editar uma alteração concluída"
- "Não é possível excluir uma alteração concluída"
- "Informe o código da dotação"
- "Por favor, preencha todos os campos obrigatórios"
- "Valor suprimido não pode ser maior que o saldo disponível"

## 8. Testando a Integração

### 8.1. Verificar Service

Certifique-se que o service está correto em `src/services/orcamentario.service.ts`

### 8.2. Verificar API Config

Verifique se os endpoints estão corretos em `src/lib/http/api-config.ts`

### 8.3. Testar Chamadas

Use o navegador para verificar as requisições:

1. Abra DevTools (F12)
2. Vá na aba Network
3. Faça uma ação (criar alteração, consultar saldo, etc)
4. Verifique se as requisições estão sendo feitas corretamente
5. Verifique o status code e response

### 8.4. Testar Fluxo Completo

1. Criar alteração
2. Adicionar 2-3 dotações
3. Verificar totalizadores
4. Concluir alteração
5. Tentar editar (deve dar aviso)
6. Gerar PDF

## 9. Troubleshooting

### Problema: "Module not found: @radix-ui/react-alert-dialog"

**Solução:** Instale a dependência conforme item 1 deste guia

### Problema: Formulário não está salvando

**Solução:** Verifique:

1. Todos os campos obrigatórios estão preenchidos?
2. O service está configurado corretamente?
3. A API está respondendo? (veja Network no DevTools)

### Problema: Saldo não está sendo consultado

**Solução:** Verifique:

1. O código da dotação está correto?
2. A API de consulta de saldo está funcionando?
3. Veja o erro no toast ou console

### Problema: Totalizadores errados

**Solução:** Verifique:

1. Os valores das dotações estão corretos?
2. A API está retornando os dados corretos?
3. A formatação dos números está correta?

### Problema: Badge ou AlertDialog não aparece

**Solução:**

1. Instale `@radix-ui/react-alert-dialog`
2. Verifique se o componente `alert-dialog.tsx` foi criado
3. Verifique se o `badge.tsx` foi atualizado com as variantes

## 10. Comandos Úteis

```bash
# Instalar dependência
npm install @radix-ui/react-alert-dialog

# Rodar desenvolvimento
npm run dev

# Build para produção
npm run build

# Verificar erros de lint
npm run lint
```

## 11. Próximos Passos Após Implementação

1. [ ] Instalar dependência do AlertDialog
2. [ ] Testar criação de alteração
3. [ ] Testar adição de dotações
4. [ ] Testar consulta de saldo
5. [ ] Testar conclusão de alteração
6. [ ] Testar geração de PDF
7. [ ] Verificar responsividade mobile
8. [ ] Testar validações de formulário
9. [ ] Testar toasts e feedbacks
10. [ ] Validar com backend real

## 12. Contato e Suporte

Se encontrar problemas:

1. Verifique o console do navegador (F12)
2. Verifique os toasts de erro
3. Verifique a aba Network no DevTools
4. Leia este guia novamente
5. Entre em contato com o time de desenvolvimento

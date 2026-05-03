# Implementação de Alterações Orçamentárias

## Arquivos Criados/Modificados

### 1. Tela de Listagem

**Arquivo:** `src/app/(authenticated)/orcamentario/alteracoes/page.tsx`

- Listagem de todas as alterações orçamentárias
- Dialog para criar/editar alteração
- Ações: Editar (modal), Excluir (apenas em elaboração), Ver Dotações, Gerar PDF
- Badge de status (em elaboração / concluída)
- Botão "Nova Alteração"

### 2. Formulário de Alteração

**Arquivo:** `src/app/(authenticated)/orcamentario/alteracoes/components/AlteracaoForm.tsx`

- Select de Lei/Ato (carrega de listarLeisAtos())
- Número do Ato (text)
- Data do Ato (date)
- Data do Lançamento (date)
- Data da Publicação (date)
- Tipo de Ato (select: Decreto, Resolução, Ato Gestor)
- Tipo de Crédito (select: Especial, Suplementar, Extraordinário)
- Tipo de Recurso (select: Anulação, Excesso de arrecadação, Valor do Crédito)
- Checkbox "Solicitar dotações pendentes"
- Botões: Cancelar, Salvar

### 3. Página de Gestão de Dotações

**Arquivo:** `src/app/(authenticated)/orcamentario/alteracoes/[id]/dotacoes/page.tsx`

- Cabeçalho com informações da alteração
- Botão voltar
- Cards com totalizadores (Total Suprimido, Total Suplementado, Diferença)
- Listagem de dotações em tabela
- Botão "Adicionar Dotação" (se em elaboração)
- Botão "Concluir Alteração" (se em elaboração e tem dotações)
- Ações por dotação: Editar, Excluir (se em elaboração)

### 4. Formulário de Dotação

**Arquivo:** `src/app/(authenticated)/orcamentario/alteracoes/[id]/dotacoes/components/DotacaoForm.tsx`

- Campo Código da Dotação (text)
- Botão "Consultar Saldo" ao lado do código
- Exibir saldo disponível quando consultado
- Campo Conta Receita (text) - condicional conforme tipo_recurso
- Campo Valor Suprimido (number)
- Campo Valor Suplementado (number)
- Campo Observação (textarea)
- Exibir cálculo do Saldo Resultante em tempo real
- Validações de saldo
- Botões: Cancelar, Salvar

### 5. Página de Redirecionamento

**Arquivo:** `src/app/(authenticated)/orcamentario/alteracoes/[id]/page.tsx`

- Redireciona automaticamente para `/dotacoes`

## Componentes UI Criados/Modificados

### AlertDialog

**Arquivo:** `src/components/ui/alert-dialog.tsx`

- Novo componente criado para diálogos de confirmação
- **REQUER INSTALAÇÃO:** `@radix-ui/react-alert-dialog`

### Badge

**Arquivo:** `src/components/ui/badge.tsx`

- Adicionadas variantes `success` e `warning`

## Dependências Necessárias

Execute o comando abaixo para instalar as dependências necessárias:

```bash
npm install @radix-ui/react-alert-dialog
# ou
yarn add @radix-ui/react-alert-dialog
# ou
pnpm add @radix-ui/react-alert-dialog
```

## Services Utilizados

O sistema utiliza o service criado em `src/services/orcamentario.service.ts` com as seguintes funções:

### Leis e Atos

- `listarLeisAtos()` - Lista todas as leis e atos disponíveis

### Alterações Orçamentárias

- `listarAlteracoes()` - Lista todas as alterações
- `obterAlteracao(id)` - Obtém uma alteração específica
- `criarAlteracao(payload)` - Cria nova alteração
- `atualizarAlteracao(id, payload)` - Atualiza alteração existente
- `excluirAlteracao(id)` - Exclui alteração (apenas em elaboração)
- `concluirAlteracao(id)` - Marca alteração como concluída

### Dotações

- `listarDotacoes(alteracaoId)` - Lista dotações de uma alteração
- `criarDotacao(alteracaoId, payload)` - Cria nova dotação
- `atualizarDotacao(alteracaoId, dotacaoId, payload)` - Atualiza dotação
- `excluirDotacao(alteracaoId, dotacaoId)` - Exclui dotação
- `consultarSaldoDotacao(codigoDotacao)` - Consulta saldo de uma dotação

### Utilitários

- `getPdfUrl(alteracaoId)` - Retorna URL para download do PDF

## Padrões Implementados

1. **React Query** - Todas as operações de API usam useQuery e useMutation
2. **Toast (Sonner)** - Feedbacks de sucesso/erro
3. **Componentes shadcn/ui** - Interface consistente
4. **Formatação** - formatCurrency e formatDate de @/lib/formatters
5. **Loading e EmptyState** - Estados de carregamento e vazio
6. **Validações** - Validações de formulário e regras de negócio

## Regras de Negócio Implementadas

1. **Status da Alteração:**
    - Em Elaboração: Permite editar, excluir, adicionar/remover dotações
    - Concluída: Apenas visualização e geração de PDF

2. **Validações de Dotação:**
    - Valor suprimido não pode exceder saldo disponível
    - Saldo resultante não pode ser negativo
    - Campo Conta Receita obrigatório para tipos "Excesso de arrecadação" e "Valor do Crédito"

3. **Totalizadores:**
    - Total Suprimido (vermelho)
    - Total Suplementado (verde)
    - Diferença (azul se zero, verde se positivo, vermelho se negativo)

4. **Ações Condicionais:**
    - Botão "Concluir Alteração" só aparece se há dotações cadastradas
    - Edição/exclusão só disponível para alterações em elaboração

## Próximos Passos

1. Instalar dependência `@radix-ui/react-alert-dialog`
2. Testar fluxo completo de criação de alteração orçamentária
3. Testar fluxo de adição de dotações
4. Testar conclusão de alteração
5. Testar geração de PDF
6. Validar integração com backend

## Notas Técnicas

- Todos os componentes usam 'use client' no topo
- Formulários implementados com useState (não usa react-hook-form)
- Invalidação de queries após mutations bem-sucedidas
- Tratamento adequado de erros com toast
- Componentização seguindo padrões do projeto

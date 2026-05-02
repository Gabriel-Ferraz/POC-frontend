# 🗺️ Guia de Navegação - POC São José dos Pinhais

## 🎯 Visão Geral

O sistema possui **menu lateral fixo** que aparece automaticamente após login. A navegação é dinâmica baseada no **perfil do usuário**.

---

## 🏗️ Estrutura da Aplicação

```
┌─────────────────────────────────────────────────┐
│  PMSJP - Portal Integrado          [👤] [🔔]   │ ← Header
├──────────────┬──────────────────────────────────┤
│              │                                  │
│  📋 Portal   │                                  │
│  Fornecedor  │        CONTEÚDO DA PÁGINA        │
│              │                                  │
│  👤 Gestor   │                                  │
│              │                                  │
│  💬 Suporte  │                                  │
│              │                                  │
│  📊 Prestação│                                  │
│  Contas      │                                  │
│              │                                  │
│  💰 Orçamen- │                                  │
│  tário       │                                  │
│              │                                  │
│  ⚙️ Demons-  │                                  │
│  tração      │                                  │
│              │                                  │
└──────────────┴──────────────────────────────────┘
   Sidebar            Área Principal
   (Fixa)             (Rola)
```

---

## 🔐 Perfis de Usuário

### **1. Responsável Técnico**

**Menu disponível:**

- ✅ Portal do Fornecedor → Empenhos
- ✅ Suporte → Meus Chamados / Novo Chamado
- ✅ Demonstração Técnica

**Fluxo principal:**

```
Login → Empenhos → Solicitações → Anexos → Andamento
```

### **2. Gestor do Contrato**

**Menu disponível:**

- ✅ Gestor → Aprovar Anexos
- ✅ Suporte → Meus Chamados / Novo Chamado
- ✅ Demonstração Técnica

**Fluxo principal:**

```
Login → Aprovar Anexos → Analisar documentos → Aprovar/Recusar
```

### **3. Operador PMSJP**

**Menu disponível:**

- ✅ Prestação de Contas → Exportador SIM-AM
- ✅ Suporte
- ✅ Demonstração Técnica

### **4. Operador Orçamentário**

**Menu disponível:**

- ✅ Orçamentário → Leis e Atos
- ✅ Orçamentário → Alterações Orçamentárias
- ✅ Suporte
- ✅ Demonstração Técnica

### **5. Gestor de Suporte**

**Menu disponível:**

- ✅ Suporte → Ver TODOS os chamados
- ✅ Demonstração Técnica

### **6. Usuário Comum**

**Menu disponível:**

- ✅ Suporte → Apenas seus próprios chamados
- ✅ Demonstração Técnica

---

## 🚀 Fluxos de Navegação Principais

### **Fluxo 1: Criar Solicitação de Pagamento**

```
1. Login (http://localhost:3000/login)
   ↓
2. Portal Fornecedor (http://localhost:3000/portal-fornecedor)
   → Lista de Empenhos
   → Clique em "Ver Solicitações"
   ↓
3. Solicitações do Empenho (http://localhost:3000/portal-fornecedor/empenhos/1/solicitacoes)
   → Clique em "Nova Solicitação"
   ↓
4. Nova Solicitação (http://localhost:3000/portal-fornecedor/empenhos/1/solicitacoes/nova)
   → Preencher dados fiscais
   → Preencher forma de pagamento
   → Salvar
   ↓
5. Gestão de Anexos (http://localhost:3000/portal-fornecedor/solicitacoes/1/anexos)
   → Upload dos 5 anexos obrigatórios
   → Enviar para aprovação
```

### **Fluxo 2: Aprovar Anexos (Gestor)**

```
1. Login como Gestor
   ↓
2. Menu Lateral → Gestor → Aprovar Anexos
   ↓
3. Lista de Solicitações Pendentes
   → Clique em "Ver Anexos"
   ↓
4. Visualizar Anexos
   → Aprovar ou Recusar (com motivo)
```

### **Fluxo 3: Consultar Andamento**

```
1. Portal Fornecedor → Empenhos
   ↓
2. Ver Solicitações
   ↓
3. Clique em "Informações"
   ↓
4. Ver Stepper (13 fases) + Abas (Geral, Trâmites, Anexos)
```

### **Fluxo 4: Abrir Chamado de Suporte**

```
OPÇÃO A: Pelo Menu Lateral
Menu → Suporte → Novo Chamado

OPÇÃO B: Pelo Header (qualquer tela)
Botão "Suporte" (canto superior direito) → Formulário
```

---

## 📍 URLs da Aplicação

### **Públicas (sem autenticação)**

- `/login` - Tela de login

### **Portal do Fornecedor (Responsável Técnico)**

- `/portal-fornecedor` - Lista de empenhos
- `/portal-fornecedor/empenhos/[id]/solicitacoes` - Solicitações do empenho
- `/portal-fornecedor/empenhos/[id]/solicitacoes/nova` - Criar nova solicitação
- `/portal-fornecedor/solicitacoes/[id]/anexos` - Gestão de anexos
- `/portal-fornecedor/solicitacoes/[id]/informacoes` - Andamento completo
- `/portal-fornecedor/solicitacoes/[id]/cancelar` - Cancelar solicitação

### **Gestor**

- `/gestor/solicitacoes` - Lista de solicitações para aprovar
- `/gestor/solicitacoes/[id]/anexos` - Aprovar/recusar anexos

### **Suporte (Todos)**

- `/suporte` - Lista de chamados
- `/suporte/novo` - Abrir novo chamado
- `/suporte/chamados/[id]` - Detalhe do chamado (timeline)

### **Prestação de Contas (Operador PMSJP)**

- `/prestacao-contas` - Exportador SIM-AM

### **Orçamentário (Operador Orçamentário)**

- `/orcamentario/leis-atos` - Cadastro de Leis e Atos
- `/orcamentario/alteracoes` - Lista de Alterações Orçamentárias
- `/orcamentario/alteracoes/[id]` - Detalhe da alteração (dotações)

### **Demonstração Técnica (Todos)**

- `/demonstracao-tecnica` - Arquitetura e stack técnica

---

## 🎨 Componentes do Layout

### **Sidebar (Menu Lateral)**

- **Fixa:** Sempre visível (exceto no login)
- **Dinâmica:** Mostra apenas menus do perfil do usuário
- **Highlight:** Item ativo destacado em azul
- **Responsiva:** Em mobile vira drawer/hamburger

### **Header (Barra Superior)**

- **Esquerda:** Logo PMSJP + Título da página
- **Direita:**
    - Botão "Suporte" (ícone 🆘)
    - Dropdown do usuário (nome, CPF, perfil, logout)

### **Área Principal**

- **PageHeader:** Título + descrição + ação (botão)
- **Conteúdo:** Cards, tabelas, forms
- **Scrollável:** Apenas o conteúdo rola (sidebar e header fixos)

---

## 🎯 Elementos Visuais Padrão

### **Badges de Status**

- 🟢 **Verde:** Aprovado, Disponível, Pagamento Realizado, Concluído
- 🟡 **Amarelo:** Aguardando Aprovação, Em Atendimento, Bloqueado
- 🔴 **Vermelho:** Recusado, Cancelada, Sem Saldo
- ⚪ **Cinza:** Pendente

### **Botões**

- **Primário (Azul):** Ações principais (Salvar, Criar, Enviar)
- **Outline (Branco):** Ações secundárias (Cancelar, Voltar)
- **Vermelho:** Ações destrutivas (Excluir, Recusar)

### **Toasts (Notificações)**

- **Sucesso:** Verde no canto superior direito
- **Erro:** Vermelho no canto superior direito
- **Duração:** 3-5 segundos

---

## 🧭 Como Navegar (Passo a Passo)

### **Primeira vez no sistema:**

1. **Acesse:** `http://localhost:3000/login`
2. **Login:**
    - CPF: (conforme backend - exemplo: `12345678900`)
    - Senha: (conforme backend)
3. **Após login:**
    - Você será redirecionado para `/portal-fornecedor`
    - Menu lateral aparecerá automaticamente
4. **Navegue:** Clique nos itens do menu lateral

### **Para testar diferentes perfis:**

1. Faça logout (dropdown no header → Sair)
2. Faça login com CPF de outro perfil
3. O menu lateral mudará automaticamente

---

## 🔍 Troubleshooting

### **Menu lateral não aparece**

✅ Verifique se está logado
✅ Limpe o cache do navegador
✅ Verifique se o token está salvo (`localStorage.getItem('auth_token')`)

### **Itens do menu não aparecem**

✅ Seu perfil não tem permissão para aquele módulo
✅ Verifique `user.perfil` no console

### **Redirect para login após segundos**

✅ Token expirou
✅ Backend retornou 401
✅ Faça login novamente

### **Página em branco**

✅ Abra DevTools (F12) → Console
✅ Verifique erros de requisição (Network)
✅ Confirme que backend está rodando na porta 3333

---

## 📱 Responsividade

### **Desktop (>1024px)**

- Sidebar fixa (264px)
- Conteúdo ao lado

### **Tablet/Mobile (<1024px)**

- Sidebar vira drawer (hamburger menu)
- Header mostra botão de menu
- Conteúdo ocupa largura total

---

## 🎓 Comandos Úteis

### **Limpar estado:**

```javascript
// No console do navegador (F12)
localStorage.clear();
location.reload();
```

### **Ver usuário logado:**

```javascript
// No console
console.log(JSON.parse(localStorage.getItem('auth_token')));
```

### **Ver perfil atual:**

```javascript
// No React DevTools ou Console
// Procure por AuthProvider → user.perfil
```

---

## 🗺️ Mapa Mental de Navegação

```
LOGIN
  │
  ├─ Responsável Técnico
  │   └─ Portal Fornecedor
  │       ├─ Empenhos
  │       │   └─ Solicitações
  │       │       ├─ Nova Solicitação
  │       │       ├─ Anexos
  │       │       ├─ Informações
  │       │       └─ Cancelar
  │       └─ Suporte
  │
  ├─ Gestor do Contrato
  │   ├─ Aprovar Anexos
  │   └─ Suporte
  │
  ├─ Operador PMSJP
  │   ├─ Prestação de Contas
  │   └─ Suporte
  │
  ├─ Operador Orçamentário
  │   ├─ Leis e Atos
  │   ├─ Alterações Orçamentárias
  │   └─ Suporte
  │
  └─ Todos
      └─ Demonstração Técnica
```

---

## ✅ Checklist de Teste da Navegação

- [ ] Login funciona e redireciona para portal
- [ ] Menu lateral aparece após login
- [ ] Menu mostra apenas itens do perfil
- [ ] Item ativo do menu fica destacado
- [ ] Botão de suporte no header funciona
- [ ] Dropdown do usuário mostra dados corretos
- [ ] Logout funciona e volta para login
- [ ] Navegação entre páginas mantém sidebar
- [ ] Breadcrumbs mostram caminho correto
- [ ] Responsivo funciona (testar em mobile)

---

**Navegação está pronta! Use o menu lateral para acessar todos os módulos.** 🚀

**NOTA:** Algumas páginas ainda precisam ser implementadas conforme o [IMPLEMENTACAO.md](IMPLEMENTACAO.md:1)

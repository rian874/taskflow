# Planejamento do Frontend

Este documento descreve a visão de interfaces, comportamentos e componentes visuais do **TaskFlow – Sistema de Produtividade Acadêmica**.
Em uma primeira etapa, os dados serão renderizados de forma **estática**, mantendo pontos de integração marcados para a API.
As interações de UI serão responsabilidade do **JavaScript** (responsividade, navegação, modais, filtros e atualização visual de status).

---

## Objetivo e público-alvo

- **Objetivo:** facilitar o planejamento acadêmico, a execução de tarefas e o acompanhamento de metas.
- **Público-alvo:** estudantes, monitores e pequenos grupos acadêmicos.
- **Tonalidade visual:** leve, limpa e focada em produtividade (com sensação de progresso e clareza).

---

## Áreas do sistema

O sistema é composto por **três áreas** com necessidades visuais e funcionais distintas:

1. **Área Pública** (visitante sem login)
2. **Área de Aplicação** (usuário autenticado)
3. **Área Administrativa** (gestão e moderação)

---

## Área Pública

Área de entrada, com foco em conversão e clareza sobre o valor do produto.

### Interfaces

- **Página Inicial (Landing Page):** apresentação institucional, benefícios e chamada para cadastro.
- **Tela de Login:** formulário de autenticação com acesso rápido.
- **Tela de Cadastro:** formulário de criação de conta (nome, e-mail, senha, confirmação de senha).

### Responsabilidades do JavaScript

- Validação primária de campos obrigatórios.
- Feedback visual de erro/sucesso em formulários.
- Alternância de visibilidade da senha (ícone de olho).

---

## Área de Aplicação

Núcleo operacional para usuários autenticados, onde ocorre o planejamento e o acompanhamento de produtividade.

### Interfaces

- **Dashboard do Aluno:** cards de métricas e resumo semanal (Total, Pendente, Em andamento, Concluído).
- **Gerenciamento de Tarefas (Kanban/Listagem):** colunas para os 4 status do sistema.
- **Perfil do Usuário:** dados pessoais, preferências e senha.
- **Barra de Filtros:** busca por texto, disciplina e prioridade.
- **Modal de Criação/Edição:** formulário da tarefa (título, descrição, disciplina, prioridade, status, data de entrega).

### Fluxo de status das tarefas

- **Pendente** → **Em Andamento** → **Concluído**
- **Cancelado** pode ser acionado a partir de qualquer estado.

### Responsabilidades do JavaScript

- Abertura/fechamento do modal de tarefas.
- Controle do menu lateral em telas menores (hambúrguer).
- Simulação visual de mudança de status no kanban.
- Aplicação de filtros por status, disciplina e prioridade.
- Preparação para integração futura com `HttpClientBase.js`.

---

## Área Administrativa

Ambiente restrito para a equipe gestora com foco em métricas e controle de usuários.

### Interfaces

- **Admin Dashboard:** métricas globais (usuários ativos, tarefas criadas, taxa de conclusão).
- **Gerenciamento de Usuários:** listagem com ações de ativar, suspender e banir.

### Responsabilidades do JavaScript

- Controle de abas e painéis de navegação administrativa.
- Modais de confirmação de segurança.

---

## Componentes visuais comuns

- **Header** com navegação principal e indicadores rápidos.
- **Sidebar** (app/admin) com atalhos e status do usuário.
- **Cards** para métricas e tarefas.
- **Badges** para status (cores consistentes por estado).
- **Modais** para criação/edição e confirmações.
- **Formulários** com feedback visual claro.

---

## Estados de interface obrigatórios

- **Carregando:** placeholders/skeleton ou mensagem “Carregando...”.
- **Vazio:** mensagens educativas quando não houver tarefas.
- **Erro:** alerta visual quando ocorrer falha na API (futuro).

---

## Padrões de UX/UI

- Design responsivo com foco em mobile-first.
- Tipografia legível e espaços generosos.
- Cores claras com contraste adequado.
- Microinterações discretas para mudança de status.
- Sempre indicar o estado atual da tarefa.

---

## Integração futura com API

- Utilizar `HttpClientBase.js` para requisições HTTP.
- Tratar erros assíncronos e exibir mensagens amigáveis.
- Marcar pontos de integração no HTML com `TODO`.
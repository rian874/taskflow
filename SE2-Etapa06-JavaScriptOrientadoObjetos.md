# SE2 — Etapa 06 — JavaScript Orientado a Objetos

## Objetivo

Refatorar o frontend da Etapa 05 para aplicar **POO Clássica** e **POO Prototípica**, demonstrando na prática as diferenças e complementariedades entre classes declaradas com `class` e objetos construídos a partir de protótipos (`Object.create`).

---

## Parte A — POO Clássica com `class`

### 1. Classes de Entidade no Frontend (`views/assets/_common/models/`)

Para cada entidade do domínio manipulada pelo frontend, foi criada uma classe com:
- propriedades privadas encapsuladas com prefixo `#`;
- construtor com valores padrão;
- getters e setters com validações de tipo e obrigatoriedade;
- métodos de negócio do domínio;
- conversão entre payload da API e objeto JavaScript (`toJSON()` e `static fromJSON()`).

Classes implementadas:
- **`Task.js`** (Entidade principal): encapsula `id`, `userId`, `title`, `description`, `priority`, `dueDate`, `statusId`, `active`. Contém métodos `isCompleted()`, `toggleStatus()`, `isOverdue()`, `getFormattedDueDate()`, `getStatusLabel()`.
- **`Faq.js`** (Entidade de apoio): encapsula `id`, `faqsCategoryId`, `question`, `answer`, `active` com métodos `isActive()`, `toggleActive()`.
- **`FaqCategory.js`** (Entidade de apoio): encapsula `id`, `name`, `active`.
- **`User.js`** (Entidade de usuários): encapsula `id`, `typeId`, `name`, `email`, `photo`, `active` com métodos `isAdmin()`, `getFirstName()`, `getInitials()`.

### 2. Classes de Serviço HTTP (`views/assets/_common/classes/`)

Classes de serviço que estendem `HttpClientBase` para isolar a comunicação com a API:
- **`Tasks.js`**: Métodos `list()`, `listById()`, `create()`, `update()`, `remove()`, `toggleStatus()`.
- **`Faqs.js`**: Métodos `listAll()`, `listAllAdmin()`, `listById()`, `insert()`, `update()`, `remove()`.
- **`FaqCategories.js`**: Métodos `listAll()`, `listById()`, `insert()`, `update()`, `remove()`.
- **`Users.js`**: Métodos `login()`, `register()`, `list()`, `update()`.

Nenhum script de tela faz requisições `fetch` avulsas nem manipula HTML de dentro dos serviços.

---

## Parte B — POO Prototípica

Foram desenvolvidas **duas funcionalidades reutilizáveis baseadas estritamente em herança prototípica (`Object.create`)**, sem a utilização da palavra-chave `class`:

### 1. Componente `Toast` (`views/assets/_common/prototypes/toast.js`)

Implementado através do protótipo compartilhado `ToastPrototype` e instanciado com `Object.create(ToastPrototype)`:
- **Métodos no protótipo**: `show(message, type, duration)`, `success(msg)`, `warning(msg)`, `error(msg)`, `handleApiResponse(res)`, `dismiss(el)`, `clearAll()`.
- **Estilização**: Classes CSS em `views/assets/_common/styles/toast.css` com suporte visual a `success` (verde), `warning` (amarelo) e `error` (vermelho).
- **Vantagem Prototípica**: Todas as instâncias de Toast compartilham os métodos do protótipo em memória sem recriar funções por objeto.

### 2. Controlador de Formulários `FormController` (`views/assets/_common/prototypes/form-controller.js`)

Implementado através do protótipo compartilhado `FormControllerPrototype` e instanciado com `Object.create(FormControllerPrototype)`:
- **Métodos no protótipo**: `serialize()`, `toFormData()`, `populate(data)`, `reset()`, `validate(rules)`, `setBusy(isBusy, text)`, `showFieldError(name, msg)`, `clearErrors()`.
- **Vantagem Prototípica**: Utilizado tanto no formulário de criação/edição de tarefas no dashboard quanto nos formulários de login e FAQ, demonstrando múltiplos objetos compartilhando a mesma cadeia de protótipos.

---

## Integração nas Telas

- **Área Pública (`index.html`)**: Landing page moderna com modal de autenticação (Login e Cadastro), accordion dinâmico de FAQs integrado à API com busca e filtros por categoria.
- **Área do Usuário (`app/index.html` e `views/assets/app/scripts/app.js`)**: Dashboard completo de tarefas com listagem assíncrona, filtros por status, busca por palavra-chave, criação e edição via modal semântico (`<dialog>`), alternância de status de conclusão com 1 clique, exclusão confirmada e notificações com Toast prototípico.
- **Painel Administrativo (`admin/index.html` e `views/assets/admin/scripts/admin-app.js`)**: Gestão completa de FAQs e Categorias de FAQs com busca, filtros, toggle de ativação e notificações integradas.

---

## Critérios Atendidos

| Requisito | Status | Implementação |
|---|:---:|---|
| POO Clássica com `class` para Entidades | ✅ Concluído | `Task.js`, `Faq.js`, `FaqCategory.js`, `User.js` em `_common/models/` |
| Propriedades privadas `#` e Getters/Setters com Validação | ✅ Concluído | Todas as entidades possuem atributos privados e validações |
| Serviços HTTP derivados de `HttpClientBase` | ✅ Concluído | `Tasks.js`, `Faqs.js`, `FaqCategories.js`, `Users.js` em `_common/classes/` |
| POO Prototípica (Funcionalidade 1) | ✅ Concluído | `ToastPrototype` em `_common/prototypes/toast.js` |
| POO Prototípica (Funcionalidade 2) | ✅ Concluído | `FormControllerPrototype` em `_common/prototypes/form-controller.js` |
| CRUD Completo da Entidade Principal | ✅ Concluído | `GET /tasks/list`, `POST /tasks`, `PUT /tasks/{id}`, `DELETE /tasks/{id}` |
| CRUD Completo de Entidades Relacionadas | ✅ Concluído | FAQs e Categorias no painel `/admin` |
| Feedback com Toast (`success`, `warning`, `error`) | ✅ Concluído | Notificações visuais elegantes substituindo `alert()` |

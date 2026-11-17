# TaskFlow — Gestão de Tarefas e Produtividade

Micro SaaS para organização de tarefas, prazos, anexos e acompanhamento de rotina diária.

## Visão do Produto

O TaskFlow centraliza o gerenciamento de tarefas diárias em uma interface única. O usuário autenticado cadastra e acompanha suas atividades, define prioridades, gerencia galerias de imagens associadas a cada tarefa e atualiza seu perfil, enquanto o administrador gerencia as perguntas frequentes (FAQs) e categorias da plataforma.

### Áreas Implementadas

| Área | Entrada | Perfil (`type_id`) | Responsabilidade |
|---|---|---:|---|
| **Área Pública** | `index.html` | Visitante | Apresentação do produto, planos, listagem de FAQs integrada à API (`GET /faqs`) e modal de autenticação (Login, Cadastro e Recuperação). |
| **Painel do Usuário** | `app/index.html` | `2` (`USER`) | Dashboard protegido por sessão JWT, CRUD completo de tarefas, galeria de imagens por tarefa (relação 1:N), atualização de dados pessoais e upload de foto de perfil. |
| **Painel Administrativo** | `admin/index.html` | `1` (`ADMIN`) | Acesso exclusivo via `/admin`, sessão separada, CRUD completo de FAQs e de categorias de FAQ com ativação/inativação e exclusão lógica. |

Não existe link público para o painel administrativo.

---

## Arquitetura MVC

```text
Interface (HTML/CSS/JS) → API REST (api/index.php) → Controller → Model → MySQL (db_taskflow)
                                                                    ↓
                                                              Resposta JSON
```

| Camada | Pasta | Responsabilidade |
|---|---|---|
| **Controllers** | `api/source/Controller/` | Rotas, validação de entrada, autenticação JWT, upload com `Source\Support\Upload` e respostas JSON padronizadas. |
| **Models (Backend)** | `api/source/Models/` | SQL com prepared statements, regras de persistência e exclusão lógica (`softDeleteById`). |
| **Core & Support** | `api/source/Core/`, `api/source/Support/` | Conexão PDO (`Connect.php`), `Model.php` base, `JWTToken.php` e `Upload.php`. |
| **Views / Assets** | `views/assets/` | Interfaces, folhas de estilo separadas por área e JavaScript modular orientado a objetos. |
| **Banco de Dados** | `data-base/taskflow-dump.sql` | Estrutura DDL e carga inicial das tabelas `users_types`, `users`, `faqs_categories`, `faqs`, `tasks` e `task_images`. |

---

## Contratos da API REST (Etapas 05, 06 e 07)

| Módulo | Operação | Método e Rota | Autenticação | Corpo / Parâmetros | Resposta de Sucesso |
|---|---|---|---|---|---|
| **Usuários** | Cadastro | `POST /users/register` | Pública | `name`, `email`, `password` | `201 created` |
| **Usuários** | Login | `POST /users/login` | Pública | `email`, `password` | `200 success` (retorna `data.token`) |
| **Usuários** | Login Admin | `POST /users/login-admin` | Pública (`type_id = 1`) | `email`, `password` | `200 success` (retorna `data.token`) |
| **Usuários** | Perfil atual | `GET /users/me` | Bearer JWT | — | `200 success` |
| **Usuários** | Atualizar perfil | `PUT /users/update` | Bearer JWT | `name`, `email`, `current_password` (opc.), `new_password` (opc.) | `200 success` |
| **Usuários** | Upload de foto | `POST /users/photo` | Bearer JWT | `multipart/form-data` com campo `photo` (JPG, PNG, WEBP até 5 MB) | `200 success` (retorna URL da foto) |
| **Tarefas** | Listar tarefas | `GET /tasks/list` | Bearer JWT | Filtra pelo usuário autenticado no token | `200 success` |
| **Tarefas** | Detalhe da tarefa | `GET /tasks/list/:taskId` | Bearer JWT | `:taskId` na URL | `200 success` |
| **Tarefas** | Criar tarefa | `POST /tasks` | Bearer JWT | `title`, `description`, `priority`, `due_date`, `status_id` | `201 created` |
| **Tarefas** | Atualizar tarefa | `PUT /tasks/:taskId` | Bearer JWT | `:taskId` + campos atualizados | `200 success` |
| **Tarefas** | Excluir tarefa | `DELETE /tasks/:taskId` | Bearer JWT | `:taskId` (soft delete + limpeza de imagens) | `200 success` |
| **Galeria (1:N)** | Listar imagens | `GET /tasks/:taskId/images` | Bearer JWT | `:taskId` | `200 success` |
| **Galeria (1:N)** | Enviar imagem(ns) | `POST /tasks/:taskId/images` | Bearer JWT | `multipart/form-data` com `images[]` (ou `image`) e `alt_text` | `201 created` |
| **Galeria (1:N)** | Remover imagem | `DELETE /tasks/:taskId/images/:imageId` | Bearer JWT | `:taskId` e `:imageId` | `200 success` |
| **FAQs** | Listar públicas | `GET /faqs` | Pública | — | `200 success` |
| **FAQs** | Listar no Admin | `GET /faqs/admin/list` | Bearer JWT (`ADMIN`) | — | `200 success` |
| **FAQs** | Criar / Editar / Excluir | `POST /faqs`, `PUT /faqs/:faqId`, `DELETE /faqs/:faqId` | Bearer JWT (`ADMIN`) | `faqs_category_id`, `question`, `answer`, `active` | `201 created` / `200 success` |
| **Categorias FAQ** | Listar / Criar / Editar / Excluir | `GET /faqs-categories`, `POST /faqs-categories`, `PUT /faqs-categories/:id`, `DELETE /faqs-categories/:id` | Pública (`GET`) / Bearer JWT (`ADMIN`) | `name`, `active` | `200 success` / `201 created` |

---

## POO Clássica e POO Prototípica (Etapa 06)

### Parte A — POO Clássica (`class`)

1. **Classes de Entidade (`views/assets/_common/models/`):**
   - `Task.js`: propriedades privadas (`#id`, `#userId`, `#title`, `#description`, `#priority`, `#dueDate`, `#statusId`, `#active`), construtor, getters e setters com validação, métodos `isCompleted()`, `toggleStatus()`, `isOverdue()`, `getFormattedDueDate()`, `toJSON()` e `static fromJSON()`.
   - `TaskImage.js`: modela cada imagem da relação 1:N (`#id`, `#taskId`, `#imagePath`, `#url`, `#altText`, `#position`, `#createdAt`).
   - `Faq.js` e `FaqCategory.js`: modelam perguntas frequentes e categorias com validações de preenchimento.
   - `User.js`: modela o usuário autenticado (`getFirstName()`, `getInitials()`, `isAdmin()`).

2. **Classes de Serviço HTTP (`views/assets/_common/classes/`):**
   - Todas herdam de `HttpClientBase.js`: `Tasks.js`, `TaskImages.js`, `Users.js`, `Faqs.js` e `FaqCategories.js`.

### Parte B — POO Prototípica (`Object.create`)

Implementada em `views/assets/_common/prototypes/` sem uso de `class`:

1. **`ToastPrototype` (`toast.js`):**
   - Criado via `Object.create(ToastPrototype)`.
   - Suporta os tipos `success` (verde), `warning` (amarelo) e `error` (vermelho).
   - Duas instâncias criadas a partir do mesmo protótipo: `createToast()` no dashboard do usuário (`app.js`) e `createToast("admin-toast-container")` no painel administrativo (`admin-app.js`).

2. **`FormControllerPrototype` (`form-controller.js`):**
   - Criado via `Object.create(FormControllerPrototype)`.
   - Duas instâncias criadas em `app.js` a partir do mesmo protótipo:
     - `this.taskFormController = createFormController(this.form)` (formulário de tarefas);
     - `this.profileFormController = createFormController(this.profileForm)` (formulário de perfil).
   - **O que é compartilhado no protótipo:** os métodos `serialize()`, `toFormData()`, `populate()`, `reset()`, `validate()`, `showFieldError()`, `clearErrors()` e `setBusy()` permanecem uma única vez em `FormControllerPrototype`, enquanto cada objeto armazena apenas o estado próprio (`this.form`, `this.submitButton`, `this.errorElements`).

### Conceitos Aplicados

- **Encapsulamento:** uso de campos privados (`#`) nas entidades (`Task`, `TaskImage`, `Faq`, `FaqCategory`, `User`) e no `SessionStorage` (`#tokenKey`, `#userKey`), protegendo o estado interno e validando alterações via setters.
- **Herança:** as classes `Tasks`, `TaskImages`, `Users`, `Faqs` e `FaqCategories` usam `extends HttpClientBase` para herdar `get()`, `post()`, `postForm()`, `put()`, `putForm()`, `delete()` e `setAuthToken()`.
- **Composição:** `AppDashboard` (`app.js`) e `AdminApp` (`admin-app.js`) compõem instâncias de `SessionStorage`, serviços HTTP (`Tasks`, `TaskImages`, `Users`, `Faqs`, `FaqCategories`) e objetos prototípicos (`Toast`, `FormController`) para coordenar a tela sem acoplamento direto ao `fetch`.
- **Protótipos:** delegação direta via cadeia de protótipos (`Object.create`), compartilhando comportamento entre múltiplos controladores de formulário e notificações.

---

## Upload de Imagens e Galeria 1:N (Etapa 07)

1. **Foto do Perfil (`POST /users/photo`):**
   - Na aba **Meu Perfil** de `app/index.html`, o usuário seleciona uma imagem (`JPG`, `PNG` ou `WEBP`, até 5 MB), visualiza a prévia instantânea e envia via `FormData`.
   - O controller `Users::uploadPhoto` utiliza `Source\Support\Upload` para validar o MIME real (`finfo` e `getimagesize`), grava em `uploads/users/` e remove a foto anterior somente após atualizar o banco.

2. **Galeria de Imagens da Tarefa — Relação 1:N (`task_images`):**
   - Tabela `task_images` com chave estrangeira `task_id` referenciando `tasks(id)` (`ON DELETE CASCADE ON UPDATE CASCADE`).
   - Cada card de tarefa em `app/index.html` possui o botão **Imagens**, que abre o modal da galeria com prévia local de múltiplos arquivos, envio via `FormData`, listagem persistida (`GET /tasks/:taskId/images`) e remoção individual (`DELETE /tasks/:taskId/images/:imageId`) tanto do banco quanto do diretório `uploads/tasks/`.

---

## Banco de Dados e Execução

1. Importe o arquivo `data-base/taskflow-dump.sql` no MySQL:
   ```bash
   mysql -u root -p < data-base/taskflow-dump.sql
   ```
2. Credenciais iniciais no banco:
   - **Admin (`/admin`):** `admin@taskflow.com` / `12345678`
   - **Usuário (`/app`):** crie uma conta pela modal **Começar Grátis** na página inicial (`index.html`).

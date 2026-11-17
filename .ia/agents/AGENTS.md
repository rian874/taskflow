# Contexto Geral dos Agentes — TaskFlow

## Produto

O **TaskFlow** é uma solução para gerenciamento inteligente de tarefas, produtividade e acompanhamento de rotinas. Possui uma área pública com apresentação e FAQs, um painel autenticado para usuários gerenciarem suas tarefas e uma área administrativa restrita para gestão de conteúdo.

## Áreas do Sistema

| Perfil | Tipo | Entrada | Escopo de Sessão | Responsabilidade |
|---|---:|---|---|---|
| Administrador | 1 | `admin/index.html` | `admin` | Gerencia FAQs, categorias e conteúdo |
| Usuário Comum | 2 | `app/index.html` | padrão | Gerencia suas tarefas, prazos e conclusão |
| Visitante | - | `index.html` | - | Visualiza informações, FAQs e se autentica |

## Modelo de Dados (`db_taskflow`)

- `users_types`: ADMIN (1) e USER (2).
- `users`: id, type_id, name, email, password, photo, active.
- `faqs_categories`: id, name, active.
- `faqs`: id, faqs_category_id, question, answer, active.
- `tasks`: id, user_id, title, description, priority, due_date, status_id, active.

## Rotas da API REST

```text
POST   /users/register
POST   /users/login
GET    /users/list
PUT    /users/update

GET    /tasks/list
GET    /tasks/list/:taskId
POST   /tasks
PUT    /tasks/:taskId
DELETE /tasks/:taskId

GET    /faqs
GET    /faqs/admin/list
GET    /faqs/:faqId
GET    /faqs/category/:categoryId
POST   /faqs
PUT    /faqs/:faqId
DELETE /faqs/:faqId

GET    /faqs-categories
GET    /faqs-categories/:categoryId
POST   /faqs-categories
PUT    /faqs-categories/:categoryId
DELETE /faqs-categories/:categoryId
```

# Instruções Centrais do TaskFlow

## Contexto do Produto

O **TaskFlow** é uma plataforma e micro SaaS moderna para organização de tarefas, rotinas diárias e projetos, construída sobre a arquitetura PHP MVC no backend com API REST e interfaces ricas no frontend.

As áreas do sistema são:
- `index.html`: landing page pública com apresentação, planos, accordion de FAQs integrado à API e modal de autenticação (Login e Cadastro);
- `app/index.html`: dashboard autenticado do usuário para gerenciamento completo de tarefas (CRUD, filtros, busca, conclusão de tarefas e métricas);
- `admin/index.html`: painel administrativo restrito (`type_id = 1`) para gestão operacional, CRUD de FAQs e CRUD de categorias de FAQ.

## Idioma e Nomenclatura

- Interface do usuário, mensagens e documentação: Português do Brasil (pt-BR).
- Código-fonte, classes, métodos, identificadores e nomes de arquivos: English.
- Nomenclatura no banco de dados e payloads da API: `snake_case` (ex: `user_id`, `due_date`, `status_id`).

## Arquitetura a Preservar

```text
HTML/JavaScript → Apache/API → api/index.php → Controller → Model → MySQL
                                                            ↓
                                                      JSON da API
```

- **Backend (`api/`)**:
  - `api/source/Controller/`: validação de entrada, autenticação JWT, autorização e respostas JSON padronizadas via `Api.php`.
  - `api/source/Core/`: classes centrais como `Connect.php` (PDO Singleton), `JWTToken.php` e `Model.php` (ORM com prepared statements).
  - `api/source/Models/`: representação das tabelas com regras de persistência e prepared statements.
- **Frontend (`views/assets/`)**:
  - `_common/`: recursos compartilhados, incluindo `HttpClientBase`, serviços HTTP, classes de entidade (`models/`), protótipos (`prototypes/`), `auth-guard.js` e `storage.js`.
  - `public/`: scripts e estilos da landing page pública.
  - `app/`: scripts e estilos do dashboard do usuário.
  - `admin/`: scripts e estilos do painel administrativo.

## Regras de Frontend e POO

- HTML semântico (`<header>`, `<nav>`, `<main>`, `<section>`, `<article>`, `<dialog>`, etc.).
- Não usar `onclick` inline nem `alert()` ou `prompt()`.
- Usar POO Clássica (`class`) para classes de Entidade com propriedades privadas `#` e serviços derivados de `HttpClientBase`.
- Usar POO Prototípica (`Object.create`) para `Toast` e `FormController`.
- Requisições à API devem sempre passar pelos serviços HTTP derivados de `HttpClientBase`.

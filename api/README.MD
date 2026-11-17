# API TaskFlow

**Entidade Principal:** `tasks` (Tarefas)  
**Banco de Dados:** `db_taskflow`

---

## Autenticação (Usuários)

* **POST /users/register** - Criar uma nova conta de usuário
* **POST /users/login** - Fazer login no sistema

**Exemplo de JSON (Login/Register):**
```json
{
    "email": "usuario@email.com",
    "password": "senha123"
}
```

---

## Rotas (CRUD - Tasks)

* **GET /tasks/list** - Listar todas as tarefas
* **GET /tasks/list/{id}** - Buscar tarefa específica
* **DELETE /tasks/{id}** - Excluir uma tarefa

### POST /tasks (Criar nova tarefa)
**Exemplo de JSON (Corpo da Requisição):**
```json
{
    "user_id": 1,
    "title": "Estudar Banco de Dados",
    "description": "Revisar comandos SQL",
    "priority": "Alta",
    "due_date": "2026-06-30"
}
```

### PUT /tasks/{id} (Atualizar tarefa)
**Exemplo de JSON (Corpo da Requisição):**
```json
{
    "title": "Estudar Banco de Dados (Revisado)",
    "status_id": 2,
    "priority": "Média"
}
```

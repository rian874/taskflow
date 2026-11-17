# 📁 views/

## Views — O "V" do MVC (Front-End)

---

### 🎯 Para que serve esta pasta?

A pasta `views/` contém tudo relacionado ao **front-end** do projeto — ou seja, tudo que o
**usuário vê e interage** no navegador. Aqui ficam as páginas HTML e os recursos visuais
(assets) como CSS, JavaScript e imagens.

---

### 📖 O que é uma View no MVC?

No padrão MVC, a **View** é a camada de **apresentação**. Ela é responsável por:

- 🖥️ Exibir a interface para o usuário
- 🎨 Aplicar estilos visuais (CSS)
- ⚡ Adicionar interatividade (JavaScript)
- 🔄 Consumir a API para buscar e enviar dados

> 🚫 A View **NÃO** deve conter regras de negócio ou acesso ao banco de dados.
> Ela apenas **exibe dados** que recebe da API.

---

### 📂 Estrutura desta pasta

```
views/
└── assets/         ← Recursos estáticos organizados por área do sistema
    ├── _common/    ← Recursos compartilhados entre todas as áreas
    ├── admin/      ← Área administrativa (painel do administrador)
    ├── app/        ← Área da aplicação (usuário logado)
    └── public/     ← Área pública (visitante, sem login)
```

---

### 🌐 As três áreas do sistema

O projeto é dividido em **três áreas** diferentes, cada uma com seus próprios recursos visuais:

| Área        | Quem acessa?                     | Exemplo de telas                     |
|-------------|----------------------------------|--------------------------------------|
| **public**  | Qualquer visitante (sem login)   | Home, Sobre, Contato, Login          |
| **app**     | Usuário autenticado (logado)     | Dashboard, Perfil, Configurações     |
| **admin**   | Administrador do sistema         | Gerenciar usuários, Relatórios       |

---

### 🔗 Como as Views se comunicam com a API?

As Views usam **JavaScript** (com `fetch` ou `XMLHttpRequest`) para consumir a API:

```javascript
// Exemplo 1: Buscando a lista de tarefas da API (GET)
fetch("http://localhost/taskflow/api/tasks/list")
    .then(response => response.json())
    .then(data => {
        console.log("Tarefas:", data);
        // Atualiza o HTML com as tarefas recebidas
    })
    .catch(error => console.error("Erro:", error));

// Exemplo 2: Criando uma nova tarefa enviando um JSON (POST)
const novaTarefa = {
    user_id: 1,
    title: "Estudar para a prova",
    priority: "Alta",
    due_date: "2026-06-30"
};

fetch("http://localhost/taskflow/api/tasks", {
    method: "POST",
    headers: {
        "Content-Type": "application/json"
    },
    body: JSON.stringify(novaTarefa)
})
.then(response => response.json())
.then(data => {
    console.log("Tarefa criada com sucesso:", data);
})
.catch(error => console.error("Erro ao criar:", error));
```

---

> 📚 Acesse a pasta `assets/` para entender a organização dos recursos estáticos.


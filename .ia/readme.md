# 🤖 `.ia/` — Central de Instruções e Diretrizes para IAs do TaskFlow

> 📖 **Leia este arquivo primeiro** — ele orienta como utilizar agentes e skills com LLMs no projeto TaskFlow.  
> 🎯 **Público:** Estudantes da disciplina e desenvolvedores do projeto.

---

## 🧭 Visão Geral

| O que é | Papel no Projeto | Exemplo |
|---|---|---|
| **Agent** | 📋 O **"o quê"** — contexto, arquitetura, telas, requisitos | "Quais campos uma Tarefa deve ter?" |
| **Skill** | 🔧 O **"como"** — regras de implementação prática | "Use tags semânticas, POO clássica e prototípica" |

---

## 📂 Estrutura da Pasta `.ia/`

```text
.ia/
├── readme.md                   ← Este guia explicativo
├── copilot-instructions.md     ← Instruções resumidas para qualquer IA / Copilot
│
├── agents/                     ← Contexto e planejamento
│   ├── AGENTS.md               ← Contexto geral da aplicação TaskFlow
│   └── AGENT-frontend-design.md ← Telas, design system e componentes visuais
│
└── skills/                     ← Regras práticas de código
    └── SKILL-frontend-design.md ← Como estruturar HTML, CSS, JS modular e POO
```

---

## 🏗️ Convenções do Projeto

1. **Edite sempre em `.ia/`** — é a fonte oficial do projeto.
2. **Textos em Português do Brasil**, código e nomes de arquivos em **Inglês**.
3. **Preserve a arquitetura MVC** e a separação de responsabilidades.

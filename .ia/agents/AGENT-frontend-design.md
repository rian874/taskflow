# Agent de Frontend Design — TaskFlow

## Visão Visual e Design System

O TaskFlow utiliza uma estética visual moderna, limpa e profissional com foco em alta produtividade.

### Cores Principais
- Primary: `#4F46E5` (Índigo moderno)
- Primary Hover: `#4338CA`
- Primary Light: `#EEF2FF`
- Surface Background: `#F8FAFC`
- Surface Card: `#FFFFFF`
- Surface Dark: `#0F172A`
- Status Sucesso: `#10B981` (Verde esmeralda)
- Status Aviso / Em Andamento: `#F59E0B` (Âmbar)
- Status Erro / Alta Prioridade: `#EF4444` (Vermelho)

### Tipografia e Ícones
- Fonte: `Inter` (Google Fonts)
- Ícones: `Lucide Icons` via CDN

## Componentes Chave

1. **Modal de Autenticação (`#auth-modal`)**: Tabs de Login, Cadastro e Recuperação com validação e feedback visual.
2. **Dashboard de Tarefas (`app/index.html`)**:
   - Sidebar responsiva com navegação por filtros;
   - Topbar com identificação do usuário e avatar com iniciais;
   - Linha de métricas (Total, Concluídas, Em Andamento);
   - Barra de ferramentas com input de busca e tabs de filtro de status;
   - Cards de tarefas com checkbox de conclusão rápida, tags de prioridade, data limite e botões de editar e excluir;
   - Modal semântico (`<dialog id="task-dialog">`) para criar e editar tarefas;
   - Notificações Toast para todas as ações.
3. **Painel Administrativo (`admin/index.html`)**:
   - Tela de login administrativo protegida;
   - Visão geral com métricas de conteúdo;
   - Gerenciador de FAQs com filtros por categoria e busca;
   - Gerenciador de Categorias de FAQ.

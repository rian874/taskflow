<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Minhas tarefas — TaskFlow</title>
  <link rel="stylesheet" href="assets/_common/styles/base.css">
  <link rel="stylesheet" href="assets/app/styles/tasks.css">
</head>
<body>
  <header class="app-header">
    <nav aria-label="Navegação principal">
      <a class="brand" href="../index.html">TaskFlow</a>
      <ul class="primary-actions" aria-label="Atalhos">
        <li><a href="dashboard.php">Dashboard</a></li>
        <li><a href="profile.php">Perfil</a></li>
      </ul>
    </nav>
  </header>

  <main>
    <section class="section-intro" aria-labelledby="tasks-title">
      <h1 id="tasks-title">Gerenciamento de tarefas</h1>
      <p>Visualize todas as atividades e organize por status ou prioridade.</p>
    </section>

    <section class="filter-panel" aria-labelledby="filters-title">
      <h2 id="filters-title">Filtros rápidos</h2>
      <form>
        <label for="search">Buscar por palavra-chave</label>
        <input id="search" name="search" type="search" placeholder="Ex: prova, resumo, leitura">

        <label for="subject">Disciplina</label>
        <select id="subject" name="subject">
          <option value="">Todas</option>
          <option value="estatistica">Estatística</option>
          <option value="metodologia">Metodologia</option>
        </select>

        <label for="priority">Prioridade</label>
        <select id="priority" name="priority">
          <option value="">Todas</option>
          <option value="high">Alta</option>
          <option value="medium">Média</option>
          <option value="low">Baixa</option>
        </select>
      </form>
    </section>

    <section class="kanban-board" aria-labelledby="kanban-title">
      <h2 id="kanban-title">Quadro Kanban</h2>
      <p>Atualize o status com os botões rápidos.</p>

      <section class="kanban-columns" aria-label="Colunas do kanban">
        <section class="kanban-column" aria-labelledby="pending-title">
          <h3 id="pending-title">Pendente</h3>
          <ol data-status-list="pending">
            <li>
              <article class="task-card" data-task-id="501" data-status="pending">
                <h4>Leitura sobre ética acadêmica</h4>
                <p>Resumo de 1 página até quinta-feira.</p>
                <menu class="task-actions">
                  <button type="button" class="js-task-status" data-next-status="in-progress" data-status-label="Em andamento">Iniciar</button>
                  <button type="button" class="js-task-status" data-next-status="canceled" data-status-label="Cancelado">Cancelar</button>
                </menu>
                <!-- TODO: substituir por dados reais da API -->
              </article>
            </li>
          </ol>
        </section>

        <section class="kanban-column" aria-labelledby="progress-title">
          <h3 id="progress-title">Em andamento</h3>
          <ol data-status-list="in-progress">
            <li>
              <article class="task-card" data-task-id="502" data-status="in-progress">
                <h4>Ficha de leitura de Sociologia</h4>
                <p>Falta revisar a conclusão.</p>
                <menu class="task-actions">
                  <button type="button" class="js-task-status" data-next-status="done" data-status-label="Concluído">Concluir</button>
                  <button type="button" class="js-task-status" data-next-status="canceled" data-status-label="Cancelado">Cancelar</button>
                </menu>
                <!-- TODO: substituir por dados reais da API -->
              </article>
            </li>
          </ol>
        </section>

        <section class="kanban-column" aria-labelledby="done-title">
          <h3 id="done-title">Concluído</h3>
          <ol data-status-list="done">
            <li>
              <article class="task-card" data-task-id="503" data-status="done">
                <h4>Entrega do seminário</h4>
                <p>Slides enviados para o professor.</p>
                <menu class="task-actions">
                  <button type="button" class="js-task-status" data-next-status="pending" data-status-label="Pendente">Reabrir</button>
                </menu>
                <!-- TODO: substituir por dados reais da API -->
              </article>
            </li>
          </ol>
        </section>

        <section class="kanban-column" aria-labelledby="canceled-title">
          <h3 id="canceled-title">Cancelado</h3>
          <ol data-status-list="canceled">
            <li>
              <article class="task-card" data-task-id="504" data-status="canceled">
                <h4>Revisão de literatura</h4>
                <p>Projeto pausado temporariamente.</p>
                <menu class="task-actions">
                  <button type="button" class="js-task-status" data-next-status="pending" data-status-label="Pendente">Reabrir</button>
                </menu>
                <!-- TODO: substituir por dados reais da API -->
              </article>
            </li>
          </ol>
        </section>
      </section>
      <output id="tasks-status-message" aria-live="polite"></output>
    </section>
  </main>

  <footer class="app-footer">
    <p>TaskFlow · Organize tarefas e avance com clareza.</p>
  </footer>

  <script src="assets/app/scripts/tasks.js"></script>
</body>
</html>

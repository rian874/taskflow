<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Dashboard do Aluno — TaskFlow</title>
  <link rel="stylesheet" href="assets/_common/styles/base.css">
  <link rel="stylesheet" href="assets/app/styles/dashboard.css">
</head>
<body>
  <header class="app-header">
    <nav aria-label="Navegação principal">
      <a class="brand" href="../index.html">TaskFlow</a>
      <ul class="primary-actions" aria-label="Atalhos">
        <li><a class="secondary" href="tasks.php">Minhas tarefas</a></li>
        <li><a href="profile.php">Meu perfil</a></li>
      </ul>
    </nav>
  </header>

  <main>
    <section aria-labelledby="dashboard-title">
      <h1 id="dashboard-title">Painel de produtividade acadêmica</h1>
      <p>Organize estudos, acompanhe metas e mantenha o foco nas entregas.</p>
    </section>

    <section class="dashboard-grid" aria-label="Resumo de produtividade">
      <article>
        <section class="metric-list" aria-label="Métricas">
          <article class="metric-card">
            <h3>Tarefas concluídas na semana</h3>
            <p>12</p>
            <!-- TODO: substituir por dado real da API -->
          </article>
          <article class="metric-card">
            <h3>Horas focadas hoje</h3>
            <p>3h 40m</p>
            <!-- TODO: substituir por dado real da API -->
          </article>
          <article class="metric-card">
            <h3>Meta de produtividade</h3>
            <p>78%</p>
            <!-- TODO: substituir por dado real da API -->
          </article>
        </section>
      </article>

      <aside class="chart-panel" aria-label="Gráfico de evolução">
        <h2>Evolução semanal</h2>
        <p>Veja como seu ritmo de estudo evoluiu nos últimos 7 dias.</p>
        <figure>
          <figcaption>Gráfico de foco diário (mock)</figcaption>
          <canvas aria-label="Gráfico de produtividade semanal" height="160"></canvas>
          <!-- TODO: substituir por gráfico real -->
        </figure>
      </aside>
    </section>

    <section class="filters-panel" aria-labelledby="filters-title">
      <h2 id="filters-title">Filtros rápidos</h2>
      <form>
        <fieldset>
          <legend>Status das tarefas</legend>
          <menu>
            <button type="button" class="js-filter is-active" data-status-filter="all">Todas</button>
            <button type="button" class="js-filter" data-status-filter="pending">Pendente</button>
            <button type="button" class="js-filter" data-status-filter="in-progress">Em andamento</button>
            <button type="button" class="js-filter" data-status-filter="done">Concluído</button>
            <button type="button" class="js-filter" data-status-filter="canceled">Cancelado</button>
          </menu>
        </fieldset>
      </form>
    </section>

    <section class="kanban-board" aria-labelledby="kanban-title">
      <h2 id="kanban-title">Quadro de tarefas</h2>
      <p>Arraste as tarefas ou atualize o status com os botões abaixo.</p>

      <section class="kanban-columns" aria-label="Colunas do kanban">
        <section class="kanban-column" aria-labelledby="pending-title">
          <h3 id="pending-title">Pendente</h3>
          <ol data-status-list="pending">
            <li>
              <article class="task-card" data-task-id="101" data-status="pending">
                <h4>Resumo do artigo de metodologia</h4>
                <p>Entrega até sexta-feira.</p>
                <button type="button" class="js-status-change" data-next-status="in-progress" data-status-label="Em andamento">
                  Iniciar
                </button>
                <!-- TODO: substituir por dados reais da API -->
              </article>
            </li>
          </ol>
        </section>

        <section class="kanban-column" aria-labelledby="progress-title">
          <h3 id="progress-title">Em andamento</h3>
          <ol data-status-list="in-progress">
            <li>
              <article class="task-card" data-task-id="205" data-status="in-progress">
                <h4>Revisão de estatística</h4>
                <p>Checklist com 4 capítulos.</p>
                <button type="button" class="js-status-change" data-next-status="done" data-status-label="Concluído">
                  Concluir
                </button>
                <!-- TODO: substituir por dados reais da API -->
              </article>
            </li>
          </ol>
        </section>

        <section class="kanban-column" aria-labelledby="done-title">
          <h3 id="done-title">Concluído</h3>
          <ol data-status-list="done">
            <li>
              <article class="task-card" data-task-id="309" data-status="done">
                <h4>Leitura de capítulo 3</h4>
                <p>Resumo entregue ao professor.</p>
                <button type="button" class="js-status-change" data-next-status="canceled" data-status-label="Cancelado">
                  Cancelar
                </button>
                <!-- TODO: substituir por dados reais da API -->
              </article>
            </li>
          </ol>
        </section>

        <section class="kanban-column" aria-labelledby="canceled-title">
          <h3 id="canceled-title">Cancelado</h3>
          <ol data-status-list="canceled">
            <li>
              <article class="task-card" data-task-id="401" data-status="canceled">
                <h4>Inscrição no workshop</h4>
                <p>Sem vagas disponíveis.</p>
                <button type="button" class="js-status-change" data-next-status="pending" data-status-label="Pendente">
                  Reabrir
                </button>
                <!-- TODO: substituir por dados reais da API -->
              </article>
            </li>
          </ol>
        </section>
      </section>

      <output id="status-message" class="status-message" aria-live="polite"></output>
    </section>
  </main>

  <footer class="app-footer">
    <p>TaskFlow · Organização acadêmica com foco e clareza.</p>
  </footer>

  <script src="assets/_common/scripts/HttpClientBase.js"></script>
  <script src="assets/app/scripts/dashboard.js"></script>
</body>
</html>

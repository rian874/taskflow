<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Painel administrativo — TaskFlow</title>
  <link rel="stylesheet" href="assets/_common/styles/base.css">
  <link rel="stylesheet" href="assets/admin/styles/admin-dashboard.css">
</head>
<body>
  <header class="admin-header">
    <nav aria-label="Navegação administrativa">
      <a class="brand" href="../index.html">TaskFlow Admin</a>
      <ul class="primary-actions" aria-label="Atalhos">
        <li><a href="admin-users.php">Usuários</a></li>
        <li><a href="dashboard.php">Área app</a></li>
      </ul>
    </nav>
  </header>

  <main>
    <section aria-labelledby="admin-title">
      <h1 id="admin-title">Visão geral da plataforma</h1>
      <p>Acompanhe indicadores gerais do TaskFlow.</p>
    </section>

    <section class="admin-metrics" aria-label="Métricas globais">
      <article class="admin-card">
        <h2>Usuários ativos</h2>
        <p>1.245</p>
        <button type="button" class="js-refresh-metric">Atualizar</button>
        <!-- TODO: substituir por dados reais da API -->
      </article>
      <article class="admin-card">
        <h2>Tarefas criadas</h2>
        <p>8.920</p>
        <button type="button" class="js-refresh-metric">Atualizar</button>
        <!-- TODO: substituir por dados reais da API -->
      </article>
      <article class="admin-card">
        <h2>Taxa de conclusão</h2>
        <p>74%</p>
        <button type="button" class="js-refresh-metric">Atualizar</button>
        <!-- TODO: substituir por dados reais da API -->
      </article>
    </section>

    <section class="admin-panel" aria-labelledby="alerts-title">
      <h2 id="alerts-title">Alertas recentes</h2>
      <ul>
        <li>
          <span>3 contas aguardando revisão.</span>
          <button type="button">Ver detalhes</button>
        </li>
        <li>
          <span>Pico de acessos no período da manhã.</span>
          <button type="button">Ver detalhes</button>
        </li>
      </ul>
      <!-- TODO: substituir por dados reais da API -->
    </section>
  </main>

  <script src="assets/admin/scripts/admin-dashboard.js"></script>
</body>
</html>

<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Usuários — TaskFlow Admin</title>
  <link rel="stylesheet" href="assets/_common/styles/base.css">
  <link rel="stylesheet" href="assets/admin/styles/users.css">
</head>
<body>
  <header class="admin-header">
    <nav aria-label="Navegação administrativa">
      <a class="brand" href="../index.html">TaskFlow Admin</a>
      <ul class="primary-actions" aria-label="Atalhos">
        <li><a href="admin-dashboard.php">Painel</a></li>
        <li><a href="dashboard.php">Área app</a></li>
      </ul>
    </nav>
  </header>

  <main>
    <section class="users-panel" aria-labelledby="users-title">
      <h1 id="users-title">Gerenciamento de usuários</h1>
      <p>Revise e modere contas cadastradas na plataforma.</p>

      <ol>
        <li>
          <article>
            <h2>Ana Martins</h2>
            <p>Status: Ativo</p>
            <menu>
              <button type="button" class="js-user-action" data-action-label="Suspender">Suspender</button>
              <button type="button" class="js-user-action" data-action-label="Banir">Banir</button>
            </menu>
          </article>
        </li>
        <li>
          <article>
            <h2>Lucas Pereira</h2>
            <p>Status: Em análise</p>
            <menu>
              <button type="button" class="js-user-action" data-action-label="Aprovar">Aprovar</button>
              <button type="button" class="js-user-action" data-action-label="Suspender">Suspender</button>
            </menu>
          </article>
        </li>
      </ol>
      <output id="admin-status" aria-live="polite"></output>
      <!-- TODO: substituir por dados reais da API -->
    </section>
  </main>

  <script src="assets/admin/scripts/users.js"></script>
</body>
</html>

<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Meu perfil — TaskFlow</title>
  <link rel="stylesheet" href="assets/_common/styles/base.css">
  <link rel="stylesheet" href="assets/app/styles/profile.css">
</head>
<body>
  <header class="app-header">
    <nav aria-label="Navegação principal">
      <a class="brand" href="../index.html">TaskFlow</a>
      <ul class="primary-actions" aria-label="Atalhos">
        <li><a href="dashboard.php">Dashboard</a></li>
        <li><a href="tasks.php">Minhas tarefas</a></li>
      </ul>
    </nav>
  </header>

  <main>
    <section class="profile-wrapper" aria-labelledby="profile-title">
      <h1 id="profile-title">Meu perfil</h1>
      <p>Atualize seus dados pessoais e preferências de estudo.</p>
      <form id="profile-form">
        <label for="name">Nome completo</label>
        <input id="name" name="name" type="text" value="Ana Oliveira">

        <label for="email">E-mail</label>
        <input id="email" name="email" type="email" value="ana@email.com">

        <label for="course">Curso</label>
        <input id="course" name="course" type="text" value="Administração">

        <button type="submit">Salvar alterações</button>
      </form>
      <output id="profile-status" aria-live="polite"></output>
      <!-- TODO: substituir por dados reais da API -->
    </section>
  </main>

  <script src="assets/app/scripts/profile.js"></script>
</body>
</html>

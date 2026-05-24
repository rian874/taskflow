<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Criar conta — TaskFlow</title>
  <link rel="stylesheet" href="assets/_common/styles/base.css">
  <link rel="stylesheet" href="assets/public/styles/auth.css">
</head>
<body>
  <header class="public-header">
    <nav aria-label="Navegação principal">
      <a class="brand" href="../index.html">TaskFlow</a>
      <a class="cta-primary" href="login.php">Entrar</a>
    </nav>
  </header>

  <main>
    <section class="auth-wrapper" aria-labelledby="register-title">
      <h1 id="register-title">Crie sua conta</h1>
      <p>Comece a organizar seu plano de estudos hoje.</p>
      <form>
        <label for="name">Nome completo</label>
        <input id="name" name="name" type="text" placeholder="Seu nome" required>

        <label for="email">E-mail</label>
        <input id="email" name="email" type="email" placeholder="seu@email.com" required>

        <label for="password">Senha</label>
        <input id="password" name="password" type="password" placeholder="Crie uma senha" required>
        <button type="button" class="js-toggle-password" data-target="password">Mostrar</button>

        <button type="submit">Criar conta</button>
      </form>
      <p class="auth-helper">Já tem conta? <a href="login.php">Faça login</a>.</p>
    </section>
  </main>

  <script src="assets/public/scripts/auth.js"></script>
</body>
</html>

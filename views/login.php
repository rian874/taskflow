<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Login — TaskFlow</title>
  <link rel="stylesheet" href="assets/_common/styles/base.css">
  <link rel="stylesheet" href="assets/public/styles/auth.css">
</head>
<body>
  <header class="public-header">
    <nav aria-label="Navegação principal">
      <a class="brand" href="../index.html">TaskFlow</a>
      <a class="cta-primary" href="register.php">Criar conta</a>
    </nav>
  </header>

  <main>
    <section class="auth-wrapper" aria-labelledby="login-title">
      <h1 id="login-title">Bem-vindo de volta</h1>
      <p>Entre com seus dados para acessar seu painel.</p>
      <form>
        <label for="email">E-mail</label>
        <input id="email" name="email" type="email" placeholder="seu@email.com" required>

        <label for="password">Senha</label>
        <input id="password" name="password" type="password" placeholder="Sua senha" required>
        <button type="button" class="js-toggle-password" data-target="password">Mostrar</button>

        <button type="submit">Entrar</button>
      </form>
      <p class="auth-helper">Ainda não tem conta? <a href="register.php">Cadastre-se agora</a>.</p>
    </section>
  </main>

  <script src="assets/public/scripts/auth.js"></script>
</body>
</html>

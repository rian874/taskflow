# SE2 — Etapa 05 — Integração do backend com o frontend

## Objetivo

Integrar as telas do frontend ao web service da equipe, substituindo dados estáticos e chamadas improvisadas por requisições assíncronas para a API REST do TaskFlow. As regras de negócio, validações, autenticação, autorização e formatos de resposta já definidos no backend devem ser respeitados nesta integração.

## Premissas e fonte de consulta

Não é necessário criar ou alterar as rotas nesta etapa. Antes de iniciar o frontend, consulte a pasta `api/` e os controllers para obter informações sobre:

- endpoints, métodos HTTP, parâmetros e corpos das requisições;
- formato das respostas, mensagens e códigos HTTP;
- autenticação, autorização e perfis de acesso;
- comportamento de exclusão lógica (soft delete).

As regras definidas no backend continuam sendo a referência oficial. Se houver divergência entre a tela e a API, adapte o frontend ao contrato já definido; não crie uma regra paralela no cliente.

## Cadastro e login de usuários

O frontend deve integrar o fluxo completo de autenticação de usuários:

1. **Cadastro de Usuário**: Formulário com `POST /users/register`. Valide no frontend os campos conforme o contrato (Nome, E-mail e Senha). O backend é responsável pelo hash seguro da senha; nunca salve a senha em texto puro no frontend.
2. **Login de Usuário**: Formulário com `POST /users/login`. O frontend envia as credenciais, armazena o token retornado e exibe mensagens de erro claras caso as credenciais sejam inválidas.
3. **Armazenamento de Sessão**: Após o login bem-sucedido, armazene o token JWT e os dados mínimos do usuário no `localStorage` através da classe compartilhada `views/assets/_common/scripts/storage.js`.
4. **Proteção de Rotas**: Proteja as telas autenticadas no frontend com `AuthGuard` e envie o token no cabeçalho HTTP `Authorization: Bearer <token>`.
5. **Logout**: Remova a sessão local e redirecione o usuário não autenticado para a página inicial (`index.html`).

O fluxo mínimo a ser demonstrado é:

```text
Cadastro → Resposta da API → Login → Token JWT → Acesso a rota protegida (/app ou /admin) → Logout
```

## Token e `localStorage`

Após um login bem-sucedido, a API retorna o token em `data.token`. Esse token representa a sessão autenticada do usuário:

```js
saveSession(token, user = null) {
    localStorage.setItem(this.#tokenKey, token);
    if (user) {
        localStorage.setItem(this.#userKey, JSON.stringify(user));
    }
}

getToken() {
    return localStorage.getItem(this.#tokenKey);
}
```

Nas chamadas protegidas, o token é lido do armazenamento e configurado no cliente HTTP:

```js
const token = this.storage.getToken();
this.tasksService.setAuthToken(token);
```

O `HttpClientBase` transforma esse token no cabeçalho HTTP `Authorization: Bearer <token>`. No backend, `api/source/Controller/Api.php` decodifica o JWT e valida os privilégios.

## Formato de resposta padronizado

```json
{
  "code": 200,
  "type": "success",
  "status": "success",
  "message": "Operação realizada com sucesso",
  "data": {}
}
```

Em caso de erro, a API retorna `type: "error"`, status descritivo e código HTTP correspondente (`400` para dados inválidos, `401` para não autenticado, `403` para sem permissão, `404` para não encontrado e `500` para erro interno).

## Requisitos do frontend

1. Use `async/await`, trate respostas de sucesso e erro e atualize a interface sem recarregamento de página.
2. Implemente o CRUD completo da entidade principal (`tasks`) e de duas entidades relacionadas (`faqs` e `faqs_categories`): cadastro (`POST`), listagem/detalhes (`GET`), edição (`PUT`) e exclusão lógica confirmada (`DELETE`).
3. Mostre estados visuais de carregamento (spinner), lista vazia, sucesso e erro.
4. Não use `onclick`, jQuery ou `alert()`. Registre eventos em JavaScript com `addEventListener` e utilize componentes modulares.
5. Implemente autenticação e controle de acesso com `AuthGuard`.

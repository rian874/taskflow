# Skill de Frontend Design — TaskFlow

## Regras de Implementação

- Use HTML semântico: `<header>`, `<nav>`, `<main>`, `<section>`, `<article>`, `<aside>`, `<form>`, `<dialog>`, `<footer>`.
- Não use `<div>` quando uma tag semântica for mais apropriada.
- CSS deve ficar em arquivo separado; evite estilos inline.
- JavaScript deve ser modular (ES Modules `type="module"`).
- Registre eventos via `addEventListener`; nunca use atributos inline como `onclick`.
- Use `document.querySelector` e `document.querySelectorAll`. Não use jQuery.
- Requisições à API devem ser feitas através dos serviços HTTP em `views/assets/_common/classes/` derivados de `HttpClientBase`.
- Toda mensagem ao usuário deve usar o componente prototípico `Toast` (`toast.success()`, `toast.warning()`, `toast.error()`). Nunca use `alert()`, `prompt()` ou `confirm()` nativo feio sem motivo.
- Formulários devem ser gerenciados com o `FormController` prototípico.
- Estados de interface obrigatórios: carregamento (spinner), lista vazia (empty state amigável), erro e sucesso.

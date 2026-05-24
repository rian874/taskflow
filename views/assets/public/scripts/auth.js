const passwordToggles = document.querySelectorAll(".js-toggle-password");

passwordToggles.forEach((button) => {
  button.addEventListener("click", handleTogglePassword);
});

function handleTogglePassword(event) {
  const button = event.currentTarget;
  const targetId = button.dataset.target;
  const input = document.querySelector(`#${targetId}`);

  if (!input) {
    return;
  }

  const isPassword = input.type === "password";
  input.type = isPassword ? "text" : "password";
  button.textContent = isPassword ? "Ocultar" : "Mostrar";
}

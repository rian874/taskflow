const moderationButtons = document.querySelectorAll(".js-user-action");
const moderationOutput = document.querySelector("#admin-status");

moderationButtons.forEach((button) => {
  button.addEventListener("click", handleUserAction);
});

function handleUserAction(event) {
  const button = event.currentTarget;
  updateAdminStatus(`Ação '${button.dataset.actionLabel}' registrada.`);
}

function updateAdminStatus(message) {
  if (!moderationOutput) {
    return;
  }

  moderationOutput.textContent = message;
}

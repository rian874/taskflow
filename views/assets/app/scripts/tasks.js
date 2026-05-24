const statusButtons = document.querySelectorAll(".js-task-status");
const statusOutput = document.querySelector("#tasks-status-message");

statusButtons.forEach((button) => {
  button.addEventListener("click", handleStatusClick);
});

function handleStatusClick(event) {
  const button = event.currentTarget;
  const taskCard = button.closest("article[data-task-id]");

  if (!taskCard) {
    return;
  }

  const targetStatus = button.dataset.nextStatus;
  const targetList = document.querySelector(
    `ol[data-status-list="${targetStatus}"]`
  );

  if (targetList) {
    targetList.appendChild(taskCard);
    taskCard.dataset.status = targetStatus;
  }

  updateStatusMessage(`Tarefa movida para ${button.dataset.statusLabel}.`);
}

function updateStatusMessage(message) {
  if (!statusOutput) {
    return;
  }

  statusOutput.textContent = message;
}

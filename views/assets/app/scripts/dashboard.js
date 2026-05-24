const client = new HttpClientBase();

const statusButtons = document.querySelectorAll(".js-status-change");
const statusOutput = document.querySelector("#status-message");
const filterButtons = document.querySelectorAll(".js-filter");

statusButtons.forEach((button) => {
  button.addEventListener("click", handleStatusChange);
});

filterButtons.forEach((button) => {
  button.addEventListener("click", handleFilterClick);
});

async function handleStatusChange(event) {
  const button = event.currentTarget;
  const taskCard = button.closest("article[data-task-id]");

  if (!taskCard) {
    return;
  }

  const taskId = taskCard.dataset.taskId;
  const nextStatus = button.dataset.nextStatus;

  try {
    // TODO: substituir pelo endpoint real da API
    await client.patch(`/tasks/${taskId}`, { status: nextStatus });

    const targetList = document.querySelector(
      `ol[data-status-list="${nextStatus}"]`
    );

    if (targetList) {
      targetList.appendChild(taskCard);
    }

    updateStatusMessage(
      `Status da tarefa atualizado para ${button.dataset.statusLabel}.`
    );
  } catch (error) {
    updateStatusMessage("Erro ao atualizar o status. Tente novamente.");
  }
}

function handleFilterClick(event) {
  const button = event.currentTarget;
  const status = button.dataset.statusFilter;

  filterButtons.forEach((btn) => btn.classList.remove("is-active"));
  button.classList.add("is-active");

  const taskCards = document.querySelectorAll("article[data-task-id]");

  taskCards.forEach((card) => {
    const currentStatus = card.dataset.status;
    const shouldShow = status === "all" || status === currentStatus;
    card.hidden = !shouldShow;
  });
}

function updateStatusMessage(message) {
  if (!statusOutput) {
    return;
  }

  statusOutput.textContent = message;
}

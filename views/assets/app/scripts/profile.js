const profileForm = document.querySelector("#profile-form");
const profileStatus = document.querySelector("#profile-status");

if (profileForm) {
  profileForm.addEventListener("submit", handleProfileSubmit);
}

function handleProfileSubmit(event) {
  event.preventDefault();
  updateProfileStatus("Dados atualizados com sucesso.");
}

function updateProfileStatus(message) {
  if (!profileStatus) {
    return;
  }

  profileStatus.textContent = message;
}

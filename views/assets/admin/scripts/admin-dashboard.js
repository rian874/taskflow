const metricButtons = document.querySelectorAll(".js-refresh-metric");

metricButtons.forEach((button) => {
  button.addEventListener("click", handleMetricRefresh);
});

function handleMetricRefresh(event) {
  const button = event.currentTarget;
  button.textContent = "Atualizado";
}

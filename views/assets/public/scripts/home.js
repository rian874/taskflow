const menuButton = document.querySelector("#btn-menu");
const navList = document.querySelector("#public-menu");

if (menuButton && navList) {
  menuButton.addEventListener("click", () => {
    const isExpanded = menuButton.getAttribute("aria-expanded") === "true";
    menuButton.setAttribute("aria-expanded", String(!isExpanded));
    navList.hidden = isExpanded;
  });
}

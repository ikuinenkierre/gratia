var toggleButton = document.querySelector(".main-header__toggle");
var mainMenu = document.querySelector(".main-header__pages");

toggleButton.addEventListener("click", function (evt) {
  evt.preventDefault();
  toggleButton.classList.toggle("main-header__toggle--close");
  mainMenu.classList.toggle("main-header__pages--open");
});


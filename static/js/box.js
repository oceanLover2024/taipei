function goHomePage() {
  document
    .querySelector(".nav_title")
    .addEventListener("click", () => (location.href = window.location.origin));
}
function generateSignInBox() {
  document.querySelector(".nav_sign").addEventListener("click", () => {
    document.querySelector(".sign_in_box").style.display = "block";
    document.querySelector(".shadow").style.display = "block";
  });

  document.querySelector(".sign_in_x").addEventListener("click", () => {
    document.querySelector(".sign_in_box").style.display = "none";
    document.querySelector(".shadow").style.display = "none";
  });
}
function sign_to_register() {
  document.querySelector(".sign_to_register").addEventListener("click", () => {
    document.querySelector(".sign_in_box").style.display = "none";
    document.querySelector(".register_box").style.display = "block";
  });
}
function register_to_sign() {
  document.querySelector(".register_to_sign").addEventListener("click", () => {
    document.querySelector(".register_box").style.display = "none";
    document.querySelector(".sign_in_box").style.display = "block";
  });
  document.querySelector(".register_x").addEventListener("click", () => {
    document.querySelector(".register_box").style.display = "none";
    document.querySelector(".shadow").style.display = "none";
  });
}
function navReserve() {
  document.querySelector(".nav_reserve").addEventListener("click", () => {
    document.querySelector(".nav_sign").click();
  });
}
export function createBox() {
  goHomePage();
  let token = localStorage.getItem("token");
  if (!token) {
    generateSignInBox();
    sign_to_register();
    register_to_sign();
    navReserve();
  }
}

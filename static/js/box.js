function goHomePage() {
  document
    .querySelector(".nav_title")
    .addEventListener("click", () => (location.href = window.location.origin));
}
function generateSignInBox() {
  document.querySelector(".nav_sign").addEventListener("click", () => {
    document.querySelector(".shadow").classList.add("active");
    document.querySelector(".sign_in_box").classList.add("active");
  });

  document.querySelector(".sign_in_x").addEventListener("click", () => {
    document.querySelector(".sign_in_box").classList.remove("active");
    document.querySelector(".shadow").classList.remove("active");
  });
}
function sign_to_register() {
  document.querySelector(".sign_to_register").addEventListener("click", () => {
    document.querySelector(".sign_in_box").classList.remove("active");
    document.querySelector(".register_box").classList.add("active");
  });
}
function register_to_sign() {
  document.querySelector(".register_to_sign").addEventListener("click", () => {
    document.querySelector(".register_box").classList.remove("active");
    document.querySelector(".sign_in_box").classList.add("active");
  });
  document.querySelector(".register_x").addEventListener("click", () => {
    document.querySelector(".register_box").classList.remove("active");
    document.querySelector(".shadow").classList.remove("active");
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

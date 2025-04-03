export function createBox() {
  let token = localStorage.getItem("token");
  document
    .querySelector(".nav_title")
    .addEventListener("click", () => (location.href = window.location.origin));
  if (!token) {
    document.querySelector(".nav_sign").addEventListener("click", () => {
      document.querySelector(".sign_in_box").style.display = "block";
      document.querySelector(".shadow").style.display = "block";
    });
  }

  document.querySelector(".sign_to_register").addEventListener("click", () => {
    document.querySelector(".sign_in_box").style.display = "none";
    document.querySelector(".register_box").style.display = "block";
  });
  document.querySelector(".register_to_sign").addEventListener("click", () => {
    document.querySelector(".register_box").style.display = "none";
    document.querySelector(".sign_in_box").style.display = "block";
  });

  document.querySelector(".sign_in_x").addEventListener("click", () => {
    document.querySelector(".sign_in_box").style.display = "none";
    document.querySelector(".shadow").style.display = "none";
  });
  document.querySelector(".register_x").addEventListener("click", () => {
    document.querySelector(".register_box").style.display = "none";
    document.querySelector(".shadow").style.display = "none";
  });
}

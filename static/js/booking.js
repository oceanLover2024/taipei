import { createBox } from "./box.js";
import { auth } from "./auth.js";
import { renderName, detailInfo } from "./bookRender.js";
document.addEventListener("DOMContentLoaded", () => {
  let token = localStorage.getItem("token");
  if (!token) {
    location.href = `${window.location.origin}`;
  }
  createBox();
  auth();
  renderName();
  detailInfo();
});

export function auth() {
  let token = localStorage.getItem("token");
  if (token) {
    fetch("/api/user/auth", {
      method: "GET",
      headers: {
        Authorization: "Bearer " + localStorage.getItem("token"),
      },
    })
      .then((response) => response.json())
      .then((data) => {
        let navSign = document.querySelector(".nav_sign");
        if (data.data) {
          navSign.textContent = "登出系統";
          navSign.addEventListener("click", () => {
            localStorage.removeItem("token");
            location.reload();
          });
        } else {
          navSign.textContent = "登入/註冊";
        }
      });
  }

  document
    .querySelector(".sign_in_box button")
    .addEventListener("click", () => {
      fetch("/api/user/auth", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: document.querySelector(".signInEmail").value,
          password: document.querySelector(".signInPassword").value,
        }),
      })
        .then((response) => response.json())
        .then((data) => {
          if (data.token) {
            localStorage.setItem("token", data.token);
            location.reload();
            fetch("/api/user/auth", {
              method: "GET",
              headers: {
                Authorization: "Bearer " + localStorage.getItem("token"),
              },
            });
          } else {
            document.querySelector(".sign_in_box .alert_text").textContent =
              "電子郵件或密碼錯誤";
          }
        });
    });
  document
    .querySelector(".register_box button")
    .addEventListener("click", () => {
      fetch("/api/user", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: document.querySelector(".registerName").value,
          email: document.querySelector(".registerEmail").value,
          password: document.querySelector(".registerPassword").value,
        }),
      })
        .then((response) => response.json())
        .then((data) => {
          if (data.ok) {
            document.querySelector(".register_box .alert_text").textContent =
              "註冊成功";
            document.querySelector(".register_box .alert_text").style.color =
              "green";
          } else {
            document.querySelector(".register_box .alert_text").textContent =
              "註冊失敗，輸入錯誤，或電子信箱已被註冊";
            document.querySelector(".register_box .alert_text").style.color =
              "red";
          }
        });
    });
}

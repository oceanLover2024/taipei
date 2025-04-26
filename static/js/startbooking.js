import { startloading, endloading } from "./loading.js";
export function startbooking() {
  let token = localStorage.getItem("token");
  let submitBTN = document.querySelector(".submit_btn");
  let today = new Date();
  let y = today.getFullYear();
  let m = String(today.getMonth() + 1).padStart(2, "0");
  let d = String(today.getDate()).padStart(2, "0");
  let todayText = `${y}-${m}-${d}`;
  document.querySelector('input[type="date"]').setAttribute("min", todayText);
  submitBTN.addEventListener("click", () => {
    if (token) {
      let date = document.querySelector('input[type = "date"]').value;
      let timeInput = document.querySelector('input[type="radio"]:checked');
      let price = document.querySelector(".fee").textContent.slice(3, -1);

      if (!date || !timeInput) {
        alert("請選擇日期與時間");
        return;
      }

      let time = timeInput.value;
      startloading();
      fetch("/api/booking", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer " + localStorage.getItem("token"),
        },
        body: JSON.stringify({
          attractionId: window.location.pathname.split("/attraction/")[1],
          date: date,
          time: time,
          price: price,
        }),
      })
        .then((res) => res.json())
        .then((data) => {
          if (data.ok) {
            endloading();
            setTimeout(() => {
              location.href = `${window.location.origin}/booking`;
            }, 500);
          }
        });
    } else {
      document.querySelector(".sign_in_box").style.display = "block";
      document.querySelector(".shadow").style.display = "block";
    }
  });
}

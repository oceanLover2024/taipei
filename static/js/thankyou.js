import { createBox } from "./box.js";
import { auth } from "./auth.js";
let num = window.location.search.split("?number=")[1];
document.addEventListener("DOMContentLoaded", async () => {
  let token = localStorage.getItem("token");
  if (!token) {
    location.href = `${window.location.origin}`;
  }
  createBox();
  auth();
  const data = await orderinfo(num);
  number(
    num,
    data.trip.attraction.name,
    data.trip.date,
    data.trip.time,
    data.price
  );
});
function number(number, attraction, date, time, fee) {
  let orderNum = document.querySelector(".num");
  orderNum.textContent = "訂單編號：" + number;
  let orderAttraction = document.querySelector(".attraction");
  orderAttraction.textContent = "訂購行程：" + attraction;
  let orderDate = document.querySelector(".date");
  let timeText = "9:00-16:00";
  if (time === "afternoon") {
    timeText = "14:00-21:00";
  }
  orderDate.textContent = "日期 / 時段：" + date + " / " + timeText;
  let orderFee = document.querySelector(".fee");
  orderFee.textContent = "費用：" + fee;
}
async function orderinfo(orderNumber) {
  const res = await fetch(`/api/order/${orderNumber}`, {
    headers: {
      Authorization: "Bearer " + localStorage.getItem("token"),
    },
  });
  const result = await res.json();
  return result.data;
}

import { createBox } from "./box.js";
import { auth } from "./auth.js";
import { renderName, detailInfo } from "./bookRender.js";
import { tappay } from "./tappay.js";
import { startloading, endloading } from "./loading.js";
document.addEventListener("DOMContentLoaded", async () => {
  let token = localStorage.getItem("token");
  if (!token) {
    location.href = `${window.location.origin}`;
  }
  createBox();
  auth();
  renderName();
  await detailInfo();
  tappay();
  let btn = document.querySelector(".price_btn");
  btn.addEventListener("click", () => {
    let mail = document.querySelector(".contact_mail").value.trim();
    let name = document.querySelector(".contact_name").value.trim();
    let tel = document.querySelector(".contact_tel").value.trim();
    if (!mail || !name || !tel) {
      alert("請注意資料是否填寫完整");
      return;
    }
    let emailRule = /^[\w\.-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]+$/;
    if (!emailRule.test(mail)) {
      alert("電子信箱格式錯誤");
      return;
    }
    startloading();
    fetch("api/booking", {
      headers: { Authorization: "Bearer " + localStorage.getItem("token") },
    })
      .then((res) => res.json())
      .then((data) => {
        const bookingData = data.data;
        TPDirect.card.getPrime((result) => {
          if (result.status !== 0) {
            alert("信用卡資料錯誤");
            return endloading();
          }
          const prime = result.card.prime;
          const orderData = {
            prime: prime,
            order: {
              price: bookingData.price,
              trip: {
                attraction: {
                  attraction_id: bookingData.attraction.id,
                  attraction_name: bookingData.attraction.name,
                  address: bookingData.attraction.address,
                  image: bookingData.attraction.image,
                },
                date: bookingData.date,
                time: bookingData.time,
              },
              contact: {
                name: document.querySelector(".contact_name").value,
                email: document.querySelector(".contact_mail").value,
                phone: document.querySelector(".contact_tel").value,
              },
            },
          };
          fetch("/api/orders", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: "Bearer " + localStorage.getItem("token"),
            },
            body: JSON.stringify(orderData),
          })
            .then((res) => res.json())
            .then((result) => {
              if (result.data && result.data.payment.status === 0) {
                location.href = "/thankyou?number=" + result.data.number;
              }
            })
            .catch(() => endloading())
            .finally(() => endloading());
        });
      });
  });
});

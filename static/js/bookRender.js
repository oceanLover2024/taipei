import { renderContact } from "./renderContact.js";
import { renderCard } from "./renderCard.js";
import { renderPrice } from "./renderPrice.js";
export async function renderName() {
  let firstLine = document.querySelector(".first_line_text");
  firstLine.textContent =
    "您好，" + (await findName()) + "，待預訂的行程如下：";
}
export async function detailInfo() {
  try {
    let info = await getBookingInfo();
    console.log(info);
    if (info) {
      renderAttractionContext(info);
      renderContact();
      renderCard();
      renderPrice(info);
    } else {
      noSchedule();
    }
  } catch (e) {
    console.log("錯誤:", e);
  }
}
function findName() {
  return fetch("/api/user/auth", {
    headers: { Authorization: "Bearer " + localStorage.getItem("token") },
  })
    .then((res) => res.json())
    .then((result) => result.data.name);
}
function getBookingInfo() {
  return fetch("/api/booking", {
    headers: { Authorization: "Bearer " + localStorage.getItem("token") },
  })
    .then((res) => res.json())
    .then((result) => result.data);
}
async function renderAttractionContext(info) {
  let mainLayout = document.querySelector(".main_layout");
  let picTextLayout = document.createElement("div");
  picTextLayout.setAttribute("class", "pic_text_layout");

  let schedulePic = document.createElement("div");
  schedulePic.setAttribute("class", "schedule_pic");

  let img = document.createElement("img");
  img.src = info.attraction.image;

  let scheduleInfoLayout = document.createElement("div");
  scheduleInfoLayout.setAttribute("class", "schedule_info_layout");

  let attractionTitle = document.createElement("div");
  attractionTitle.setAttribute("class", "attraction_title");
  attractionTitle.textContent = "台北一日遊：" + info.attraction.name;

  let date = document.createElement("div");
  date.setAttribute("class", "bolder_text");
  date.textContent = "日期：";

  let dateResult = document.createElement("span");
  dateResult.setAttribute("class", "content_text");
  dateResult.textContent = info.date;

  let time = document.createElement("div");
  time.setAttribute("class", "bolder_text");
  time.textContent = "時間：";

  let timeResult = document.createElement("span");
  timeResult.setAttribute("class", "content_text");
  timeResult.textContent =
    info.time === "morning" ? "早上9點到下午4點" : "下午2點到晚上9點";

  let fee = document.createElement("div");
  fee.setAttribute("class", "bolder_text");
  fee.textContent = "費用：";

  let feeResult = document.createElement("span");
  feeResult.setAttribute("class", "content_text");
  feeResult.textContent = "新台幣" + info.price + "元";

  let address = document.createElement("div");
  address.setAttribute("class", "bolder_text");
  address.textContent = "地址：";

  let addressResult = document.createElement("span");
  addressResult.setAttribute("class", "content_text");
  addressResult.textContent = info.attraction.address;

  let deleteIcon = document.createElement("img");
  deleteIcon.src = "/static/img/delete.png";
  deleteIcon.setAttribute("class", "delete_icon");

  mainLayout.appendChild(picTextLayout);
  picTextLayout.appendChild(schedulePic);
  schedulePic.appendChild(img);
  picTextLayout.appendChild(scheduleInfoLayout);
  scheduleInfoLayout.appendChild(attractionTitle);
  scheduleInfoLayout.appendChild(date);
  date.appendChild(dateResult);
  scheduleInfoLayout.appendChild(time);
  time.appendChild(timeResult);
  scheduleInfoLayout.appendChild(fee);
  fee.appendChild(feeResult);
  scheduleInfoLayout.appendChild(address);
  address.appendChild(addressResult);
  scheduleInfoLayout.appendChild(deleteIcon);
  deleteSchedule(deleteIcon);
}

function noSchedule() {
  let mainLayout = document.querySelector(".main_layout");
  let text = document.createElement("div");
  text.textContent = "目前沒有任何待預訂的行程";
  text.setAttribute("class", "no_schedule_text");
  mainLayout.appendChild(text);
  let footer = document.querySelector("footer");
  footer.setAttribute("class", "no_schedule_footer");
}
function deleteSchedule(e) {
  e.addEventListener("click", () => {
    fetch("/api/booking", {
      method: "DELETE",
      headers: { Authorization: "Bearer " + localStorage.getItem("token") },
    })
      .then((res) => res.json())
      .then((result) => {
        if (result.ok) {
          location.reload();
        }
      });
  });
}

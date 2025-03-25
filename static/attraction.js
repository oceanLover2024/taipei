async function fetchAttraction() {
  try {
    const response = await fetch(
      `${window.location.origin}/api${window.location.pathname}`
    );
    return await response.json();
  } catch (e) {
    console.log("fetchError:", e);
  }
}
fetchAttraction().then((result) => {
  if (!result) return;
  const data = result["data"];
  document.querySelector(".profile_title").innerHTML = data["name"];
  document.querySelector(
    ".profile_detail"
  ).innerHTML = `${data["category"]} at ${data["mrt"]}`;
  document.querySelector(".info").innerHTML = data["description"];
  let address = document.querySelector(".address");
  let address_title = document.createElement("div");
  address_title.setAttribute("class", "address_title");
  address_title.innerHTML = "景點地址：";
  address.appendChild(address_title);
  address.innerHTML += data["address"];
  let transport = document.querySelector(".transport");
  let transport_title = document.createElement("div");
  transport_title.setAttribute("class", "transport_title");
  transport_title.innerHTML = "交通方式：";
  transport.appendChild(transport_title);
  transport.innerHTML += data["transport"];
  let current_pic = document.querySelector(".current_pic");
  let circles = document.querySelector(".circles");
  for (let i = 0; i < data["imgs"].length; i++) {
    let img = document.createElement("img");
    img.setAttribute("src", data["imgs"][i]);
    img.setAttribute("class", "img_style");
    current_pic.appendChild(img);
    let circle = document.createElement("div");
    circle.setAttribute("class", "circle choosed_circle");
    circles.appendChild(circle);
  }
  showSlides(slideIndex);

  let radioInput = document.querySelectorAll('input[type="radio"]');
  radioInput[0].addEventListener(
    "click",
    () => (document.querySelector(".fee").innerHTML = "新台幣2000元")
  );
  radioInput[1].addEventListener(
    "click",
    () => (document.querySelector(".fee").innerHTML = "新台幣2500元")
  );
  document
    .querySelector(".nav_title")
    .addEventListener("click", () => (location.href = window.location.origin));
});
let slideIndex = 0;
function showSlides(x) {
  let slideimgs = document.querySelectorAll(".img_style");
  let circle = document.querySelectorAll(".circle");
  if (x > slideimgs.length - 1) slideIndex = 0;
  if (x < 0) slideIndex = slideimgs.length - 1;
  for (let i = 0; i < slideimgs.length; i++) {
    slideimgs[i].style.display = "none";
    circle[i].className = circle[i].className.replace("choosed_circle", "");
  }
  slideimgs[slideIndex].style.display = "block";
  circle[slideIndex].className += "choosed_circle";
}
function plusSlide(n) {
  showSlides((slideIndex += n));
}

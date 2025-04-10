export async function renderPrice(info) {
  let main = document.querySelector("main");
  let line = document.createElement("div");
  line.setAttribute("class", "line");
  let mainLayout = document.createElement("div");
  mainLayout.setAttribute("class", "main_layout");
  let priceText = document.createElement("div");
  let priceBtn = document.createElement("button");
  priceText.setAttribute("class", "price_text");
  priceText.textContent = "總價：新台幣" + info.price + "元";
  priceBtn.setAttribute("class", "price_btn");
  priceBtn.textContent = "確認訂購並付款";
  main.appendChild(line);
  main.appendChild(mainLayout);
  mainLayout.appendChild(priceText);
  mainLayout.appendChild(priceBtn);
}

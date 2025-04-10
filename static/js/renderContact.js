export function renderContact() {
  let main = document.querySelector("main");
  let line = document.createElement("div");
  line.setAttribute("class", "line");
  let mainLayout = document.createElement("div");
  mainLayout.setAttribute("class", "main_layout");
  main.appendChild(line);
  main.appendChild(mainLayout);
  let contactTitle = document.createElement("div");
  contactTitle.setAttribute("class", "first_line_text");
  contactTitle.textContent = "您的聯絡資訊";
  let nameLabel = document.createElement("label");
  nameLabel.textContent = "聯絡姓名：";
  let mailLabel = document.createElement("label");
  mailLabel.textContent = "連絡信箱：";
  let phoneLabel = document.createElement("label");
  phoneLabel.textContent = "手機號碼：";
  let nameInput = document.createElement("input");
  nameInput.type = "text";
  let mailInput = document.createElement("input");
  mailInput.type = "text";
  let phoneInput = document.createElement("input");
  phoneInput.type = "tel";
  let contactText = document.createElement("div");
  contactText.setAttribute("class", "bolder_text");
  contactText.textContent =
    "請保持手機暢通，準時到達，導覽人員將用手機與您聯繫，務必留下正確的聯絡方式。";
  mainLayout.appendChild(contactTitle);
  mainLayout.appendChild(nameLabel);
  mainLayout.appendChild(nameInput);
  mainLayout.appendChild(document.createElement("br"));
  mainLayout.appendChild(mailLabel);
  mainLayout.appendChild(mailInput);
  mainLayout.appendChild(document.createElement("br"));
  mainLayout.appendChild(phoneLabel);
  mainLayout.appendChild(phoneInput);
  mainLayout.appendChild(contactText);
}

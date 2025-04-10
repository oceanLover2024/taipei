export function startbooking() {
  let token = localStorage.getItem("token");
  let submitBTN = document.querySelector(".submit_btn");
  submitBTN.addEventListener("click", () => {
    if (token) {
      fetch("/api/booking", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer " + localStorage.getItem("token"),
        },
        body: JSON.stringify({
          attractionId: window.location.pathname.split("/attraction/")[1],
          date: document.querySelector('input[type = "date"]').value,
          time: document.querySelector('input[type="radio"]:checked').value,
          price: document.querySelector(".fee").textContent.slice(3, -1),
        }),
      })
        .then((res) => res.json())
        .then((data) => {
          if (data.ok) {
            location.href = `${window.location.origin}/booking`;
          } else {
            alert("請注意資料是否輸入正確");
          }
        });
    } else {
      document.querySelector(".sign_in_box").style.display = "block";
      document.querySelector(".shadow").style.display = "block";
    }
  });
}

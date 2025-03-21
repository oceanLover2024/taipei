let attraction_name = [];
let categoryList = [];
let mrtList = [];
let imageList = [];
let nextPage = 0;
let loading = false;
let keyword = "";
const options = {
  root: null,
  rootMargin: "0px",
  threshold: 0.5,
};
function callback(entries) {
  entries.forEach(function (entry) {
    if (entry.isIntersecting && nextPage !== null && !loading) {
      getData(nextPage);
    }
  });
}
async function fetchData(url) {
  try {
    const response = await fetch(`${window.location.origin}${url}`);
    return await response.json();
  } catch (e) {
    console.log("fetchDataError:", e);
    return null;
  }
}
function getData(page) {
  loading = true;
  let url = `/api/attractions?page=${nextPage}`;
  if (keyword) {
    url += `&keyword=${keyword}`;
  }
  fetchData(url)
    .then((result) => {
      if (!result) return;
      const data = result["data"];
      nextPage = result["nextPage"];
      for (d of data) {
        attraction_name.push(d["name"]);
        categoryList.push(d["category"]);
        mrtList.push(d["mrt"]);
        imageList.push(d["images"][0]);
      }
      renderData();
    })
    .finally(() => (loading = false));
}
function renderData() {
  let attractions = document.querySelector(".attractions");
  for (i = 0; i < attraction_name.length; i++) {
    let attraction = document.createElement("div");
    attraction.setAttribute("class", "attraction");
    attractions.appendChild(attraction);
    let ImgBlock = document.createElement("div");
    ImgBlock.setAttribute("class", "img_block");
    attraction.appendChild(ImgBlock);
    let detailBlock = document.createElement("div");
    detailBlock.setAttribute("class", "detail_block");
    attraction.appendChild(detailBlock);
    let img = document.createElement("img");
    ImgBlock.appendChild(img);
    img.src = imageList[i];
    let name = document.createElement("div");
    name.innerHTML = attraction_name[i];
    name.setAttribute("class", "attraction_name");
    ImgBlock.appendChild(name);
    let mrtStation = document.createElement("div");
    mrtStation.innerHTML = mrtList[i];
    mrtStation.setAttribute("class", "mrt_station");
    detailBlock.appendChild(mrtStation);
    let category = document.createElement("div");
    category.innerHTML = categoryList[i];
    category.setAttribute("class", "category");
    detailBlock.appendChild(category);
  }
  attraction_name = [];
  categoryList = [];
  mrtList = [];
  imageList = [];
}

function searchKeyword() {
  keyword = document.querySelector(".keyword_box").value;
  let attractions = document.querySelector(".attractions");
  attractions.innerHTML = "";
  nextPage = 0;
  getData(nextPage);
}
function scrollMrt() {
  let url = "/api/mrts";
  let mrt = document.querySelector(".mrt");

  fetchData(url).then((result) => {
    if (!result) return;
    const data = result["data"];
    for (d in data) {
      let scrollStation = document.createElement("div");
      scrollStation.setAttribute("class", "station");
      scrollStation.setAttribute("id", "st" + d);
      scrollStation.innerHTML = data[d];
      mrt.appendChild(scrollStation);
    }
    let rightIcon = document.querySelector(".right_direction_icon");
    let leftIcon = document.querySelector(".left_direction_icon");
    let scrolling = null;
    let goRight = mrt.scrollTo(mrt.scrollLeft + 50, 0);
    let goLeft = mrt.scrollTo(mrt.scrollLeft - 50, 0);
    rightIcon.addEventListener("click", () => goleft);
    rightIcon.addEventListener("mousedown", () => {
      removeEventListener("click", goRight);
      scrolling = setInterval(() => mrt.scrollTo(mrt.scrollLeft + 5, 0), 20);
    });
    rightIcon.addEventListener("mouseup", () => clearInterval(scrolling));
    rightIcon.addEventListener("mouseleave", () => clearInterval(scrolling));
    leftIcon.addEventListener("click", () => goLeft);
    leftIcon.addEventListener("mousedown", () => {
      removeEventListener("click", goLeft);
      scrolling = setInterval(() => mrt.scrollTo(mrt.scrollLeft - 5, 0), 20);
    });
    leftIcon.addEventListener("mouseup", () => clearInterval(scrolling));
    leftIcon.addEventListener("mouseleave", () => clearInterval(scrolling));

    let keywordBox = document.querySelector(".keyword_box");
    for (let num = 0; num < data.length; num++) {
      let st = document.getElementById("st" + num);
      st.addEventListener("click", function () {
        let attractions = document.querySelector(".attractions");
        attractions.innerHTML = "";
        keywordBox.value = st.innerHTML;
        searchKeyword(keywordBox.value);
      });
    }
  });
}
document.addEventListener("DOMContentLoaded", function () {
  getData(nextPage);
  scrollMrt();
  const observer = new IntersectionObserver(callback, options);
  observer.observe(document.querySelector("footer"));
  document.querySelector(".keyword_box").addEventListener("keyup", (e) => {
    if (e.key === "Enter") searchKeyword();
  });
});

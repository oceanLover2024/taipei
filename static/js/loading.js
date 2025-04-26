let loading = document.querySelector(".loading");
export function startloading() {
  loading.style.transition = "none";
  loading.style.opacity = "1";
  loading.style.width = "0%";
  void loading.offsetWidth;
  loading.style.transition = "width 2s ";
  loading.style.width = "90%";
}
export function endloading() {
  loading.style.width = "100%";
  setTimeout(() => {
    loading.style.opacity = "0";
  }, 500);
}

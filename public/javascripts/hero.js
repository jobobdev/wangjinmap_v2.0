const shareButton = document.getElementById("share-btn");

shareButton.addEventListener("click", async () => {
  try {
    await navigator.share({
      title: "왕진병원 찾기, 똑똑의사!",
      text: "왕진이 필요하다면 똑똑의사를 찾아주세요.",
      url: "",
    });
    console.log("공유 성공");
  } catch (e) {
    console.log("공유 실패");
  }
});

if (typeof navigator.share === "undefined") {
  // 공유하기 버튼을 지원하지 않는 경우에 대한 폴백 처리
  shareButton.hidden = true;
}

const closeBtn = document.querySelector(".app-main-modal_close");
const appModal = document.querySelector("#app-modal");
closeBtn.addEventListener("click", (e) => {
  appModal.style.display = "none";
});

const openModal = document.querySelector("#go-btn");
openModal.addEventListener("click", (e) => {
  appModal.style.display = "flex";
});

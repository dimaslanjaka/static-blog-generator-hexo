import { initClickable } from "./clickable";
import initFancybox from "./fancybox";
import { highlightMain, initClipBoard } from "./highlight";
import initloader from "./loader";
import initToc from "./toc";

document.addEventListener("DOMContentLoaded", () => {
  highlightMain();
  initClipBoard();
  initFancybox();
  initToc();
  initClickable();

  // layout/partials/nav.njk
  const mobileMenuButton = document.querySelector('button[aria-controls="mobile-menu"]');
  const mobileMenu = document.getElementById("mobile-menu");
  if (mobileMenuButton && mobileMenu) {
    if (!mobileMenu.classList.contains("hidden")) {
      mobileMenu.classList.add("hidden");
    }
    mobileMenuButton.addEventListener("click", () => {
      mobileMenu.classList.toggle("hidden");
    });
  }
});

window.addEventListener("load", function () {
  // fix: loader not hidden after page load
  initloader();
});

import { initClickable } from "./clickable";
import initFancybox from "./fancybox";
import { highlightMain, initClipBoard } from "./highlight";
import initloader from "./loader";
import initNavigationMenu from "./nav";
import initToc from "./toc";

document.addEventListener("DOMContentLoaded", () => {
  highlightMain();
  initClipBoard();
  initFancybox();
  initToc();
  initClickable();
  initNavigationMenu();
});

window.addEventListener("load", function () {
  // fix: loader not hidden after page load
  initloader();
});

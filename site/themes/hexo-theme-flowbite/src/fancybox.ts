import { Fancybox } from "@fancyapps/ui";

export default function initFancybox() {
  const wrapper = document.querySelector<HTMLElement>(".post");
  document.querySelectorAll("img").forEach((el) => {
    if (!el.hasAttribute("data-caption")) {
      let caption = "";
      caption += el.getAttribute("title") || "";
      if (caption.trim().length > 0) caption += " - ";
      caption += el.getAttribute("alt") || "";
      el.setAttribute("data-caption", caption);
    }
    if (!el.hasAttribute("data-fancybox")) el.setAttribute("data-fancybox", "true");
  });
  Fancybox.bind(wrapper, "[data-fancybox=true]", {
    // Your custom options
  });

  // mansonry - \layout\macro\gallery-mansonry.njk
  // Select all buttons with the masonry-target attribute
  const buttons = document.querySelectorAll("[masonry-target]");

  // Loop through each button and add a click event listener
  buttons.forEach((button) => {
    button.addEventListener("click", function (e) {
      e.preventDefault();
      // Get the target ID from the masonry-target attribute
      const targetId = this.getAttribute("masonry-target");
      const image = document.getElementById(targetId);
      if (image) {
        // Get the src of the original image
        const imageSrc = image.getAttribute("src");

        // Show Fancybox with the image
        Fancybox.show([
          {
            src: imageSrc, // Use the copied src instead of inline
            type: "image" // Specify type as image
          }
        ]);
      }
    });
  });
}

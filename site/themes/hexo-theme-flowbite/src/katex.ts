export default function initKatex() {
  const hasKatexClass = document.body.querySelector('[class^="katex-"]');

  if (hasKatexClass) {
    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = "https://cdn.jsdelivr.net/npm/katex/dist/katex.min.css";
    document.head.appendChild(link);
  }
}

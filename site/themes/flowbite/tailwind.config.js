/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: "class", // Enables dark mode based on class
  content: [
    "./node_modules/flowbite/**/*.js",
    "./layout/**/*.njk",
    "./layout/**/*.html",
    "./source/**/*.js",
    "./source/**/*.cjs",
    "./src/**/*"
  ],
  theme: {
    extend: {
      colors: {
        clifford: "#da373d",
        ocean: "#1ca9c9",
        forest: "#228b22",
        sunset: "#ff4500",
        sky: "#87ceeb",
        sand: "#c2b280",
        berry: "#cc66cc",
        cyan: "#00ffff",
        magenta: "#ff00ff",
        polkador: "#ff6347",
        skip: "#d3d3d3", // light gray
        silver: "#c0c0c0",
        mutedGray: "#b0b0b0",
        lightGray: "#d3d3d3"
      },
      typography: {
        DEFAULT: {
          css: {
            pre: {
              // background color should same with .hljs background color
              // see src/highlight
              "background-color": "#22272e"
            }
          }
        }
      }
    }
  },
  plugins: [require("flowbite/plugin"), require("flowbite-typography")]
};

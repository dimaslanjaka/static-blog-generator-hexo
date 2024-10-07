const commonjs = require("@rollup/plugin-commonjs");
const json = require("@rollup/plugin-json");
const resolve = require("@rollup/plugin-node-resolve");
const typescript = require("@rollup/plugin-typescript");
const fs = require("fs");

const pkg = JSON.parse(fs.readFileSync("./package.json", "utf-8"));
const _deps = Object.keys(pkg.dependencies).concat(Object.keys(pkg.devDependencies));
const globals = {
  jquery: "$",
  lodash: "_",
  axios: "axios",
  "highlight.js": "hljs"
};

module.exports = {
  input: "src/index.ts", // Replace with your entry file(s)
  output: [
    {
      file: "source/js/script.js", // Output file
      format: "iife", // Browser-compatible format
      name: "HexoThemeFlowbite", // Global name for your bundle
      sourcemap: false, // Enable sourcemaps for easier debugging
      globals
    }
  ],
  plugins: [
    json.default(),
    resolve.nodeResolve({
      browser: true, // Resolve for browser environment
      extensions: [".mjs", ".js", ".json", ".node", "ts"] // Resolve both JavaScript and TypeScript
    }),
    commonjs.default({
      include: "node_modules/**" // Include node_modules
    }),
    typescript.default({
      tsconfig: false,
      compilerOptions: {
        lib: ["DOM", "DOM.Iterable", "ES2020"],
        typeRoots: ["./src/types", "./node_modules/@types", "./node_modules/nodejs-package-types/typings"]
      },
      include: ["./package.json", "./src/**/*", "./src/globals.d.ts", "./src/**/*.json"]
    })
  ]
  // external: deps // Exclude external dependencies from the bundle
};

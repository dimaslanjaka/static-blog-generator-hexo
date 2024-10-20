'use strict';

Object.defineProperty(exports, "__esModule", { value: true });
exports.hexoThemeTailwindBuild = hexoThemeTailwindBuild;
const tslib_1 = require("tslib");
const cp = tslib_1.__importStar(require("cross-spawn"));
const path = tslib_1.__importStar(require("upath"));
const cwd = path.join(__dirname, "../");
async function hexoThemeTailwindBuild() {
    await cp.spawnAsync("npm", ["run", "build"], { cwd, stdio: "inherit" });
}

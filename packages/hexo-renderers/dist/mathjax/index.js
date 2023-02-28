"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.rendererMathjax = void 0;
var path_1 = __importDefault(require("path"));
var ejs_1 = __importDefault(require("ejs"));
var fs_1 = __importDefault(require("fs"));
var layout = 'layout.ejs';
var bodyTag = '</body>';
var mathjaxScript = fs_1.default.readFileSync(path_1.default.join(__dirname, 'mathjax.html'));
/**
 * hexo-renderer-mathjax
 * @param hexo
 */
function rendererMathjax(hexo) {
    hexo.extend.renderer.register('ejs', 'html', function (data, options) {
        var path = (options.filename = data.path);
        var content = data.text;
        if (layout === path.substring(path.length - layout.length)) {
            content = content.replace(bodyTag, mathjaxScript + '\n' + bodyTag);
        }
        return ejs_1.default.render(content, options, { async: true });
    });
}
exports.rendererMathjax = rendererMathjax;

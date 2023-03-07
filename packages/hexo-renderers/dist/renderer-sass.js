"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.rendererSass = void 0;
var node_sass_1 = __importDefault(require("node-sass"));
var util = __importStar(require("util"));
var extend = util['_extend'];
var sassRenderer = function (ext) {
    return function (data) {
        // support global and theme-specific config
        var userConfig = extend(this.theme.config.node_sass || {}, this.config.node_sass || {});
        var config = extend({
            data: data.text,
            file: data.path,
            outputStyle: 'nested',
            sourceComments: false,
            indentedSyntax: ext === 'sass'
        }, userConfig);
        try {
            // node-sass result object:
            // https://github.com/sass/node-sass#result-object
            var result = node_sass_1.default.renderSync(config);
            // result is now Buffer instead of String
            // https://github.com/sass/node-sass/issues/711
            return Promise.resolve(result.css.toString());
        }
        catch (error) {
            console.error(error.toString());
            throw error;
        }
    };
};
function rendererSass(hexo) {
    // associate the Sass renderer with .scss AND .sass extensions
    hexo.extend.renderer.register('scss', 'css', sassRenderer('scss'));
    hexo.extend.renderer.register('sass', 'css', sassRenderer('sass'));
}
exports.rendererSass = rendererSass;

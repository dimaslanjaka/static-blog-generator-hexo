"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.exit = exports.validateFile = void 0;
var ansi_colors_1 = __importDefault(require("ansi-colors"));
var fs_1 = __importDefault(require("fs"));
var jsdom_1 = __importDefault(require("jsdom"));
/**
 * validate file
 * @param file file absolute path
 * @param as alias name
 */
function validateFile(file, as, options) {
    options = Object.assign({ size: true, body: true }, options);
    if (options.size && fs_1.default.statSync(file).size === 0) {
        console.error("".concat(ansi_colors_1.default.redBright('file is empty'), " ").concat(as || file));
        exit();
    }
    if (options.body) {
        var dom = new jsdom_1.default.JSDOM(fs_1.default.readFileSync(file));
        var window_1 = dom.window;
        var document_1 = window_1.document;
        var bodyEmpty = document_1.body.innerHTML.trim().length === 0;
        // throw when body is empty
        if (bodyEmpty) {
            console.error("".concat(ansi_colors_1.default.redBright('html body is empty'), " ").concat(as || file));
            exit();
        }
        document_1.close();
        window_1.close();
    }
    console.log(ansi_colors_1.default.greenBright('success'), file);
}
exports.validateFile = validateFile;
/**
 * process exit
 * @param code exit code. 1=exit failure, 0=exit success, default=1
 */
function exit(code) {
    if (code === void 0) { code = 1; }
    process.exit(code || 1);
}
exports.exit = exit;

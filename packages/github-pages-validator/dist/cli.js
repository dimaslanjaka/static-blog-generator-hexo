"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var minimist_1 = __importDefault(require("minimist"));
var validate_1 = require("./validate");
var path_1 = __importDefault(require("path"));
var fs_1 = __importDefault(require("fs"));
/**
 * - `gpv -f test/empty-body.html`
 */
var argv = (0, minimist_1.default)(process.argv.slice(2));
var file = argv.f || argv.file;
var alias = argv.a || argv.alias;
var scope = argv.s || argv.scope || '';
if (file.length > 0) {
    var options = scope.split(',');
    console.log(options);
    var toCheck = file;
    if (!fs_1.default.existsSync(file))
        toCheck = path_1.default.resolve(process.cwd(), file);
    (0, validate_1.validateFile)(toCheck, alias);
}
else {
    // throw exit
    throw new Error(file + ' not exist');
}

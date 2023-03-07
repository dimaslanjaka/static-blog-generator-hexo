"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var fs_1 = __importDefault(require("fs"));
var minimist_1 = __importDefault(require("minimist"));
var path_1 = __importDefault(require("path"));
var validate_1 = require("./validate");
/**
 * - `gpv -f test/empty-body.html`
 */
var argv = (0, minimist_1.default)(process.argv.slice(2));
var file = argv.f || argv.file;
var alias = argv.a || argv.alias;
var scope = argv.s || argv.scope || '';
if (file.length > 0) {
    var options_1 = {};
    scope.split(',').forEach(function (str) {
        options_1[str] = true;
    });
    var toCheck = file;
    if (!fs_1.default.existsSync(file))
        toCheck = path_1.default.resolve(process.cwd(), file);
    (0, validate_1.validateFile)(toCheck, alias, options_1);
}
else {
    // throw exit
    throw new Error(file + ' not exist');
}

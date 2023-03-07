var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var fs = require('fs');
var spawn = require('git-command-helper').spawn;
var args = require('minimist')(process.argv.slice(2));
var root = process.cwd();
var jsdom = require('jsdom');
var path = require('path');
var yaml = require('yaml');
/**
 * @type {import('./tmp/schema.json')}
 */
var config = yaml.parse(fs.readFileSync(path.join(root, 'github-actions-validator.config.yml')).toString());
// save schema
if (!fs.existsSync(path.join(__dirname, 'tmp'))) {
    fs.mkdirSync(path.join(__dirname, 'tmp'));
}
fs.writeFileSync(path.join(__dirname, 'tmp/schema.json'), JSON.stringify(config));
var hasErrors = false;
(function () {
    return __awaiter(this, void 0, void 0, function () {
        var array, i, p, cwd, _err_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    Object.keys(config['validate'] || {}).forEach(function (name) {
                        var full = path.resolve(root, config['validate'][name]);
                        console.log('validating', name, full.replace(root, ''));
                        validate(full, name);
                    });
                    array = config['install'] || [];
                    i = 0;
                    _a.label = 1;
                case 1:
                    if (!(i < array.length)) return [3 /*break*/, 6];
                    p = array[i];
                    _a.label = 2;
                case 2:
                    _a.trys.push([2, 4, , 5]);
                    cwd = path.resolve(root, p);
                    return [4 /*yield*/, spawn('npm', ['install', '--omit=dev', '--production'], {
                            cwd: cwd
                        })];
                case 3:
                    _a.sent();
                    return [3 /*break*/, 5];
                case 4:
                    _err_1 = _a.sent();
                    console.error('cannot installing', p, _err_1.message);
                    return [3 /*break*/, 5];
                case 5:
                    i++;
                    return [3 /*break*/, 1];
                case 6: return [2 /*return*/];
            }
        });
    });
})();
/**
 * start validation
 * @param {string} file
 * @param {string} as what is this file used for. ex: homepage
 */
function validate(file, as) {
    if (fs.statSync(file).size === 0) {
        throw new Error("file is empty ".concat(as || file));
    }
    var dom = new jsdom.JSDOM(fs.readFileSync(file));
    var window = dom.window;
    var document = window.document;
    var bodyEmpty = document.body.innerHTML.trim().length === 0;
    // throw when body is empty
    if (bodyEmpty)
        throw new Error("body is empty file ".concat(as || file));
    document.close();
    window.close();
}

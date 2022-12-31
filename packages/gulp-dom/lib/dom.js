/* eslint-disable @typescript-eslint/triple-slash-reference */
/* jshint node: true, strict: true */
'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
exports.gulpDomPath = exports.customPath = void 0;
const tslib_1 = require("tslib");
const jsdom_1 = tslib_1.__importDefault(require("jsdom"));
const fs_1 = tslib_1.__importDefault(require("fs"));
const upath_1 = tslib_1.__importDefault(require("upath"));
const plugin_error_1 = tslib_1.__importDefault(require("plugin-error"));
const through2_1 = tslib_1.__importDefault(require("through2"));
const true_case_path_1 = tslib_1.__importDefault(require("true-case-path"));
const pluginName = 'gulp-dom';
const path = {
    join: (...str) => upath_1.default.toUnix(true_case_path_1.default.trueCasePathSync(upath_1.default.join(...str))),
    dirname: (str) => upath_1.default.toUnix(true_case_path_1.default.trueCasePathSync(upath_1.default.dirname(str))),
    toUnix: (str) => upath_1.default.toUnix(true_case_path_1.default.trueCasePathSync(str))
};
exports.customPath = path;
exports.gulpDomPath = path;
/**
 * gulpDom
 * @param mutator callback
 * @returns
 */
function gulpDom(mutator) {
    const stream = through2_1.default.obj(function (file, _enc, callback) {
        if (file.isNull()) {
            return callback(null, file);
        }
        if (file.isStream()) {
            return stream.emit('error', new plugin_error_1.default(pluginName, 'Streaming not supported'));
        }
        if (file.isBuffer()) {
            try {
                const dom = new jsdom_1.default.JSDOM(file.contents.toString('utf8'));
                const mutated = mutator.call(dom.window.document, file.path);
                file.contents = Buffer.from(typeof mutated === 'string' ? mutated : dom.serialize());
                callback(null, file);
                dom.window.close();
            }
            catch (e) {
                if (e instanceof Error) {
                    console.log(e.message);
                }
                console.log(pluginName, 'drop file', file.path);
                // drop file
                callback();
            }
        }
    });
    return stream;
}
exports.default = gulpDom;
/**
 * write to file recursively
 * @param {string} dest
 * @param {any} data
 */
function writefile(dest, data) {
    if (!fs_1.default.existsSync(path.dirname(dest)))
        fs_1.default.mkdirSync(path.dirname(dest), { recursive: true });
    if (fs_1.default.existsSync(dest)) {
        if (fs_1.default.statSync(dest).isDirectory())
            throw dest + ' is directory';
    }
    fs_1.default.writeFileSync(dest, data);
}

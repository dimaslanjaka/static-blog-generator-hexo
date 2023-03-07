"use strict";
var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.registerCustomHelper = exports.getTheAuthor = void 0;
var fs_1 = __importDefault(require("fs"));
var lodash_toarray_1 = __importDefault(require("lodash.toarray"));
var path_1 = __importDefault(require("path"));
var url_1 = require("url");
var yaml_1 = __importDefault(require("yaml"));
var partial_1 = require("./helper/partial");
var config = yaml_1.default.parse(fs_1.default.readFileSync(path_1.default.join(process.cwd(), '_config.yml')).toString());
var THEME_LOCATION = path_1.default.join(process.cwd(), 'themes', config.theme || 'landscape');
var _THEME_SCRIPTS = path_1.default.join(THEME_LOCATION, 'scripts');
// loadScripts(THEME_SCRIPTS);
/**
 * load all scripts
 * @param base
 */
function _loadScripts(base) {
    if (fs_1.default.existsSync(base)) {
        fs_1.default.readdirSync(base).forEach(function (p) {
            var full = path_1.default.join(base, p);
            if (fs_1.default.statSync(full).isFile()) {
                require(full);
            }
            else if (fs_1.default.statSync(full).isDirectory()) {
                _loadScripts(full);
            }
        });
    }
}
function isObject(value) {
    return typeof value === 'object' && value !== null && value !== undefined;
}
function toArray(value) {
    if (isObject(value) && typeof value.toArray === 'function') {
        return value.toArray();
    }
    else if (Array.isArray(value)) {
        return value;
    }
    return (0, lodash_toarray_1.default)(value);
}
function getTheAuthor(authorObj) {
    if (typeof authorObj === 'string')
        return authorObj;
    if (typeof authorObj.name === 'string')
        return authorObj.name;
    if (typeof authorObj.nick === 'string')
        return authorObj.nick;
    if (typeof authorObj.nickname === 'string')
        return authorObj.nickname;
}
exports.getTheAuthor = getTheAuthor;
/**
 * register custom helpers
 * @param hexo
 */
function registerCustomHelper(hexo) {
    hexo.extend.helper.register('toArray', toArray);
    hexo.extend.helper.register('isObject', isObject);
    /**
     * Export theme config
     */
    hexo.extend.helper.register('json_config', function () {
        var hexo = this;
        var config = hexo.config, theme = hexo.theme, url_for = hexo.url_for, __ = hexo.__;
        var theme_config = {
            hostname: (0, url_1.parse)(config.url).hostname || config.url,
            root: config.root
        };
        var hexo_config = {
            homepage: url_for('/')
        };
        return {
            theme: Object.assign(theme, theme_config),
            project: Object.assign(config, hexo_config)
        };
    });
    hexo.extend.helper.register('json_data', function (name) {
        var data = [];
        for (var _i = 1; _i < arguments.length; _i++) {
            data[_i - 1] = arguments[_i];
        }
        var json = data.length === 1 ? data[0] : Object.assign.apply(Object, __spreadArray([{}], data, false));
        return "<script class=\"json-config\" data-name=\"".concat(name, "\" type=\"application/json\">").concat(JSON.stringify(json).replace(/</g, '\\u003c'), "</script>");
    });
    hexo.extend.helper.register('getPosts', 
    /**
     * @returns
     */
    function () {
        var page = this['page'];
        return page.posts;
    });
    hexo.extend.helper.register('getAuthor', function (author, fallback) {
        if (!author)
            return fallback;
        var test1 = getTheAuthor(author);
        if (typeof test1 === 'string')
            return test1;
        var test2 = getTheAuthor(this.config.author);
        if (typeof test2 === 'string')
            return test2;
        return 'default user';
    });
    hexo.extend.helper.register('getPostByLabel', 
    /**
     * hexo get post by key with name
     * @param by
     * @param filternames
     * @returns
     */
    function (by, filternames) {
        var hexo = this;
        var data = hexo.site[by].data;
        if (Array.isArray(data)) {
            var map = filternames
                .map(function (filtername) {
                var filter = data.filter(function (_a) {
                    var name = _a.name;
                    return String(name).toLowerCase() == filtername.toLowerCase();
                });
                return filter.map(function (group) {
                    return group.posts.map(function (_a) {
                        var title = _a.title, permalink = _a.permalink, thumbnail = _a.thumbnail, photos = _a.photos;
                        // get title and permalink
                        // for more keys, you can look at https://github.com/dimaslanjaka/nodejs-package-types/blob/ec9b509d81eefdfada79f1658ac02118936a1e5a/index.d.ts#L757-L762
                        return { title: title, permalink: permalink, thumbnail: thumbnail, photos: photos };
                    });
                });
            })
                // flattern all multidimensional arrays
                // to get array of hexo post object
                .flat(2);
            // dump
            // console.log(map);
            // return an JSON string
            // return JSON.stringify(map, null, 2);
            // return an Array
            return map;
        }
        return [];
    });
}
exports.registerCustomHelper = registerCustomHelper;
hexo.extend.helper.register('partialWithLayout', partial_1.partialWithLayout);

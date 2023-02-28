var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
var parse = require('url').parse;
var _toArray = require('lodash.toarray');
var yaml = require('yaml');
var fs = require('fs');
var path = require('path');
/**
 * @type {import('hexo').Config}
 */
var config = yaml.parse(fs.readFileSync(path.join(process.cwd(), '_config.yml')).toString());
var THEME_LOCATION = path.join(process.cwd(), 'themes', config.theme);
var THEME_SCRIPTS = path.join(THEME_LOCATION, 'scripts');
// loadScripts(THEME_SCRIPTS);
/**
 * load all scripts
 * @param {string} base
 */
function loadScripts(base) {
    if (fs.existsSync(base)) {
        fs.readdirSync(base).forEach(function (p) {
            var full = path.join(base, p);
            if (fs.statSync(full).isFile()) {
                require(full);
            }
            else if (fs.statSync(full).isDirectory()) {
                loadScripts(full);
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
    return _toArray(value);
}
/**
 * register custom helpers
 * @param {import('hexo')} hexo
 */
function registerCustomHelper(hexo) {
    hexo.extend.helper.register('toArray', toArray);
    /**
     * Export theme config
     */
    hexo.extend.helper.register('json_config', function () {
        /** @type {import('hexo')} */
        var hexo = this;
        var config = hexo.config, theme = hexo.theme, url_for = hexo.url_for, __ = hexo.__;
        var theme_config = {
            hostname: parse(config.url).hostname || config.url,
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
        /** @type {import('hexo')} */
        var hexo = this;
        var page = hexo.page;
        return page.posts;
    });
    hexo.extend.helper.register('getAuthor', function (author, fallback) {
        if (typeof author === 'string')
            return author;
        if (!author)
            return fallback;
        if (author.name)
            return author.name;
        if (author.nick)
            return author.nick;
        if (author.nickname)
            return author.nickname;
    });
    hexo.extend.helper.register('getPostByLabel', 
    /**
     * hexo get post by key with name
     * @param {'tags'|'categories'} by
     * @param {string[]} filternames
     * @returns {Record<string, string>[]}
     */
    function (by, filternames) {
        /** @type {import('hexo')} */
        var hexo = this;
        /**
         * @type {any[]}
         */
        var data = hexo.site[by].data;
        if (Array.isArray(data)) {
            var map = filternames
                .map(function (filtername) {
                var filter = data.filter(function (_a) {
                    var name = _a.name;
                    return String(name).toLowerCase() == filtername.toLowerCase();
                });
                return filter.map(function (group) {
                    return group.posts.map(
                    /**
                     * @param {import('hexo').Post.Data} post
                     */
                    function (_a) {
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
module.exports = { toArray: toArray, isObject: isObject, registerCustomHelper: registerCustomHelper };

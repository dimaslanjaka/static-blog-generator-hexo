'use strict';

var require$$0 = require('cheerio');
var require$$1 = require('nunjucks');
var require$$2 = require('hexo-util');
var fs = require('fs-extra');
var path = require('path');
var hpp = require('hexo-post-parser');
var sanitize = require('sanitize-filename');
var utility = require('sbg-utility');
var _ = require('lodash');
var deepmergeTs = require('deepmerge-ts');
var Hexo = require('hexo');
var yaml = require('yaml');

function getDefaultExportFromCjs (x) {
	return x && x.__esModule && Object.prototype.hasOwnProperty.call(x, 'default') ? x['default'] : x;
}

var scripts = {};

var date = {};

var hasRequiredDate;

function requireDate () {
	if (hasRequiredDate) return date;
	hasRequiredDate = 1;
	hexo.extend.helper.register("currentYear", function () {
	  return new Date().getFullYear();
	});
	return date;
}

var fancybox = {};

/* eslint-disable no-useless-escape */

var hasRequiredFancybox;

function requireFancybox () {
	if (hasRequiredFancybox) return fancybox;
	hasRequiredFancybox = 1;
	var rUrl =
	  /((([A-Za-z]{3,9}:(?:\/\/)?)(?:[-;:&=\+\$,\w]+@)?[A-Za-z0-9.-]+|(?:www.|[-;:&=\+\$,\w]+@)[A-Za-z0-9.-]+)((?:\/[\+~%\/.\w-_]*)?\??(?:[-\+=&;%@.\w_]*)#?(?:[.\!\/\\w]*))?)/;

	/**
	 * Fancybox tag
	 *
	 * Syntax:
	 *   {% fancybox /path/to/image [/path/to/thumbnail] [title] %}
	 */

	hexo.extend.tag.register("fancybox", function (args) {
	  var original = args.shift(),
	    thumbnail = "";

	  if (args.length && rUrl.test(args[0])) {
	    thumbnail = args.shift();
	  }

	  var title = args.join(" ");

	  return `<a data-fancybox="gallery" href="${original}" data-caption="${title}">
    <img src="${thumbnail || original}" alt="${title}">
    </a>
    ${title ? `<span class="caption">${title}</span>` : ""}`;
	});
	return fancybox;
}

var helpers = {};

var hasRequiredHelpers;

function requireHelpers () {
	if (hasRequiredHelpers) return helpers;
	hasRequiredHelpers = 1;

	const cheerio = require$$0;

	hexo.extend.helper.register("getPosts", function () {
	  const self = this;
	  const { page } = self;
	  return page.posts;
	});

	hexo.extend.helper.register("getLanguage", function (page) {
	  let lang;
	  if ("lang" in page) {
	    lang = page.lang;
	  } else if ("language" in page) {
	    lang = page.language;
	  } else if ("lang" in hexo.config) {
	    lang = hexo.config.lang;
	  } else if ("language" in hexo.config) {
	    lang = hexo.config.language;
	  }
	  if (typeof lang == "string") {
	    return lang;
	  } else if (Array.isArray(lang)) {
	    return lang[0];
	  }
	  return "en";
	});

	hexo.extend.helper.register(
	  "getPostByLabel",
	  /**
	   * hexo get post by key with name
	   * @param {'tags'|'categories'} by
	   * @param {string[]} filternames
	   * @returns {Record<string, string>[]}
	   */
	  function (by, filternames) {
	    const hexo = this;
	    /**
	     * @type {any[]}
	     */
	    const data = hexo.site[by].data;
	    const map = filternames
	      .map((filtername) => {
	        const filter = data.filter(({ name }) => String(name).toLowerCase() == filtername.toLowerCase());
	        return filter.map((group) => {
	          return group.posts.map(
	            /**
	             * @param {import('hexo').Post.Data} post
	             */
	            function ({ title, permalink, thumbnail, photos }) {
	              // get title and permalink
	              // for more keys, you can look at https://github.com/dimaslanjaka/nodejs-package-types/blob/ec9b509d81eefdfada79f1658ac02118936a1e5a/index.d.ts#L757-L762
	              return { title, permalink, thumbnail, photos };
	            }
	          );
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
	);

	/**
	 * Returns a JSON stringified version of the value, safe for inclusion in an
	 * inline <script> tag. The optional argument 'spaces' can be used for
	 * pretty-printing.
	 *
	 * Output is NOT safe for inclusion in HTML! If that's what you need, use the
	 * built-in 'dump' filter instead.
	 *
	 * @example
	 * {{ json_stringify(data, 2) }}
	 */
	hexo.extend.helper.register("json_stringify", function (value, spaces) {
	  const nunjucks = require$$1;
	  if (value instanceof nunjucks.runtime.SafeString) {
	    value = value.toString();
	  }
	  const jsonString = JSON.stringify(value, null, spaces).replace(/</g, "\\u003c");
	  return nunjucks.runtime.markSafe(jsonString);
	});

	hexo.extend.helper.register("object_keys", function (obj) {
	  return Object.keys(obj);
	});

	hexo.extend.helper.register("is_array", function (obj) {
	  return Array.isArray(obj);
	});

	/**
	 * fix url
	 * - remove double slashes
	 * - decode url
	 * @param {string} url
	 * @param {Record<string,any>} options
	 * @returns
	 */
	function fixURL(url, options = {}) {
	  const fixed = url.replace(/([^:]\/)\/+/gm, "$1");
	  if (options) {
	    if (options.decode) return decodeURI(fixed);
	  }
	  return fixed;
	}

	hexo.extend.helper.register("fixURL", fixURL);

	hexo.extend.helper.register("canonical_url", function (lang) {
	  let path = this.page.path;
	  if (lang && lang !== "en") path = lang + "/" + path;
	  const util = require$$2;
	  return util.full_url_for(path);
	});

	hexo.extend.helper.register("url_for_lang", function (path) {
	  const lang = this.page.lang;
	  let url = this.url_for(path);

	  if (lang !== "en" && url[0] === "/") url = "/" + lang + url;

	  return url;
	});

	hexo.extend.helper.register("lang_name", function (lang) {
	  const data = this.site.data.languages[lang];
	  return data.name || data;
	});

	hexo.extend.filter.register("template_locals", function (locals) {
	  const { page } = locals;
	  if (page.archive) page.title = "Archive";
	});

	hexo.extend.helper.register("parseToc", function (content) {
	  if (typeof content === "string") {
	    const $ = cheerio.load(content);

	    // Function to extract TOC
	    const parseTOC = () => {
	      const toc = [];
	      const stack = []; // Stack to manage current levels

	      // Loop through h1 to h6 tags to create TOC
	      $("h1, h2, h3, h4, h5, h6").each((_, element) => {
	        const heading = $(element);
	        const title = heading.text().trim(); // Trim the title
	        const link = `#${title.toLowerCase().replace(/\s+/g, "-")}`; // Create an anchor link based on title
	        const level = parseInt(heading.prop("tagName").charAt(1)); // Get the heading level (h1 -> 1, h2 -> 2, ...)

	        const item = { title, link, subItems: [] };

	        // Manage the current level for nesting
	        while (stack.length > 0 && level <= stack[stack.length - 1].level) {
	          stack.pop(); // Go up a level
	        }

	        if (stack.length === 0) {
	          toc.push(item); // Push to the root level if the stack is empty
	        } else {
	          stack[stack.length - 1].item.subItems.push(item); // Add to the last level's subItems
	        }

	        // Add the new item to the stack with its level
	        stack.push({ level, item });
	      });

	      return toc;
	    };

	    return parseTOC(); // Return the generated TOC
	  }
	  // Return an array of error object if content is not a string
	  return [{ error: "Cannot parse table of content" }];
	});
	return helpers;
}

var injector = {};

var hasRequiredInjector;

function requireInjector () {
	if (hasRequiredInjector) return injector;
	hasRequiredInjector = 1;
	const fs$1 = fs;
	const path$1 = path;

	hexo.extend.helper.register("injectHeadHtml", function () {
	  const file = path$1.join(hexo.base_dir, "source/_data/hexo-theme-flowbite/head.html");
	  if (fs$1.existsSync(file)) {
	    return fs$1.readFileSync(file, "utf-8");
	  }
	  return "";
	});

	hexo.extend.helper.register("injectBodyHtml", function () {
	  const file = path$1.join(hexo.base_dir, "source/_data/hexo-theme-flowbite/body.html");
	  if (fs$1.existsSync(file)) {
	    return fs$1.readFileSync(file, "utf-8");
	  }
	  return "";
	});

	hexo.extend.helper.register("injectBeforePostHtml", function () {
	  const file = path$1.join(hexo.base_dir, "source/_data/hexo-theme-flowbite/before-post.html");
	  if (fs$1.existsSync(file)) {
	    return fs$1.readFileSync(file, "utf-8");
	  }
	  return "";
	});

	hexo.extend.helper.register("injectAfterPostHtml", function () {
	  const file = path$1.join(hexo.base_dir, "source/_data/hexo-theme-flowbite/after-post.html");
	  if (fs$1.existsSync(file)) {
	    return fs$1.readFileSync(file, "utf-8");
	  }
	  return "";
	});

	hexo.extend.helper.register("injectAsideHtml", function () {
	  const file = path$1.join(hexo.base_dir, "source/_data/hexo-theme-flowbite/aside.html");
	  if (fs$1.existsSync(file)) {
	    return fs$1.readFileSync(file, "utf-8");
	  }
	  return "";
	});
	return injector;
}

var paginator = {};

var hasRequiredPaginator;

function requirePaginator () {
	if (hasRequiredPaginator) return paginator;
	hasRequiredPaginator = 1;

	hexo.extend.helper.register("next_paginator", function () {
	  const prev = this.__("accessibility.prev_page");
	  const next = this.__("accessibility.next_page");
	  let paginator = this.paginator({
	    prev_text: '<i class="fa-solid fa-angle-left"></i>',
	    next_text: '<i class="fa-solid fa-angle-right"></i>',
	    mid_size: 1,
	    escape: false
	  });
	  paginator = paginator
	    .replace('rel="prev"', `rel="prev" title="${prev}" aria-label="${prev}"`)
	    .replace('rel="next"', `rel="next" title="${next}" aria-label="${next}"`);
	  return paginator;
	});
	return paginator;
}

/**
 * get author name
 * @param author
 * @returns
 */
function getAuthorName(author) {
    if (typeof author === "string")
        return author;
    if (author && typeof author === "object" && !Array.isArray(author)) {
        if (typeof author.name === "string")
            return author.name;
        if (typeof author.nick === "string")
            return author.nick;
        if (typeof author.nickname === "string")
            return author.nickname;
        if (typeof author.author_obj === "object")
            return getAuthorName(author.author_obj);
    }
}
hexo.extend.helper.register("getAuthorName", function (author, fallback) {
    var resultAuthor = getAuthorName(author);
    if (resultAuthor)
        return resultAuthor;
    var resultFallback = getAuthorName(fallback);
    if (resultFallback)
        return resultFallback;
    return getAuthorName(hexo.config) || "Unknown";
});

/******************************************************************************
Copyright (c) Microsoft Corporation.

Permission to use, copy, modify, and/or distribute this software for any
purpose with or without fee is hereby granted.

THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES WITH
REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF MERCHANTABILITY
AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR ANY SPECIAL, DIRECT,
INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES WHATSOEVER RESULTING FROM
LOSS OF USE, DATA OR PROFITS, WHETHER IN AN ACTION OF CONTRACT, NEGLIGENCE OR
OTHER TORTIOUS ACTION, ARISING OUT OF OR IN CONNECTION WITH THE USE OR
PERFORMANCE OF THIS SOFTWARE.
***************************************************************************** */
/* global Reflect, Promise, SuppressedError, Symbol, Iterator */


function __awaiter(thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
}

function __generator(thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
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
}

typeof SuppressedError === "function" ? SuppressedError : function (error, suppressed, message) {
    var e = new Error(message);
    return e.name = "SuppressedError", e.error = error, e.suppressed = suppressed, e;
};

function getHexoArgs() {
    // detect hexo arguments
    var hexoCmd = "";
    if (hexo.env.args._ && hexo.env.args._.length > 0) {
        for (var i = 0; i < hexo.env.args._.length; i++) {
            if (hexo.env.args._[i] == "s" || hexo.env.args._[i] == "server") {
                hexoCmd = "server";
                break;
            }
            if (hexo.env.args._[i] == "d" || hexo.env.args._[i] == "deploy") {
                hexoCmd = "deploy";
                break;
            }
            if (hexo.env.args._[i] == "g" || hexo.env.args._[i] == "generate") {
                hexoCmd = "generate";
                break;
            }
            if (hexo.env.args._[i] == "c" || hexo.env.args._[i] == "clean") {
                hexoCmd = "clean";
                break;
            }
        }
    }
    return hexoCmd;
}

var searchFiles = [
    path.join(hexo.base_dir, hexo.config.source_dir, "hexo-search.json"),
    path.join(hexo.base_dir, hexo.config.public_dir, "hexo-search.json")
];
// Queue to hold the save operations
var saveQueue = [];
var isProcessing$1 = false;
/**
 * Initializes the search files if they don't exist.
 */
function initializeSearchFiles() {
    return __awaiter(this, void 0, void 0, function () {
        var _i, searchFiles_1, file;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _i = 0, searchFiles_1 = searchFiles;
                    _a.label = 1;
                case 1:
                    if (!(_i < searchFiles_1.length)) return [3 /*break*/, 5];
                    file = searchFiles_1[_i];
                    if (!!fs.existsSync(file)) return [3 /*break*/, 4];
                    return [4 /*yield*/, fs.ensureDir(path.dirname(file))];
                case 2:
                    _a.sent();
                    return [4 /*yield*/, fs.writeJSON(file, [])];
                case 3:
                    _a.sent();
                    _a.label = 4;
                case 4:
                    _i++;
                    return [3 /*break*/, 1];
                case 5: return [2 /*return*/];
            }
        });
    });
}
/**
 * Saves data as search in JSON files, processing requests in a queue.
 *
 * @param data - The object containing url, title, and description to save.
 */
function saveAsSearch(data) {
    return __awaiter(this, void 0, void 0, function () {
        var saveOperation;
        var _this = this;
        return __generator(this, function (_a) {
            saveOperation = function () { return __awaiter(_this, void 0, void 0, function () {
                var existingDataPromises, existingDataArray, writePromises;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, initializeSearchFiles()];
                        case 1:
                            _a.sent(); // Ensure the files are initialized
                            existingDataPromises = searchFiles.map(function (file) { return fs.readJSON(file); });
                            return [4 /*yield*/, Promise.all(existingDataPromises)];
                        case 2:
                            existingDataArray = _a.sent();
                            existingDataArray.forEach(function (existingData) {
                                appendOrReplace(existingData, data); // Append or replace data in each existing data array
                            });
                            writePromises = searchFiles.map(function (file, index) { return fs.writeJSON(file, existingDataArray[index]); });
                            return [4 /*yield*/, Promise.all(writePromises)];
                        case 3:
                            _a.sent(); // Wait for all write operations to complete
                            return [2 /*return*/];
                    }
                });
            }); };
            // Add the save operation to the queue
            saveQueue.push(saveOperation);
            // Process the queue if not already processing
            scheduleProcessing$1();
            return [2 /*return*/];
        });
    });
}
/**
 * Processes the save queue one operation at a time.
 */
function scheduleProcessing$1() {
    return __awaiter(this, void 0, void 0, function () {
        var currentOperation, error_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    if (isProcessing$1 || saveQueue.length === 0) {
                        return [2 /*return*/]; // If already processing or no items in the queue, exit
                    }
                    isProcessing$1 = true;
                    currentOperation = saveQueue.shift();
                    if (!currentOperation) return [3 /*break*/, 5];
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 3, 4, 5]);
                    return [4 /*yield*/, currentOperation()];
                case 2:
                    _a.sent(); // Execute the operation
                    return [3 /*break*/, 5];
                case 3:
                    error_1 = _a.sent();
                    hexo.log.error("Error saving search data:", error_1.message);
                    return [3 /*break*/, 5];
                case 4:
                    isProcessing$1 = false; // Mark processing as complete
                    scheduleProcessing$1(); // Continue to the next item in the queue
                    return [7 /*endfinally*/];
                case 5: return [2 /*return*/];
            }
        });
    });
}
/**
 * Appends a new object to the array or replaces an existing object
 * based on the 'url' property, after validating that the 'url' is not empty.
 *
 * @param array - The array of objects to update.
 * @param newObj - The new object to add or replace.
 */
function appendOrReplace(array, newObj) {
    // Validate that the url is not empty
    if (!newObj.url || typeof newObj.url !== "string") {
        hexo.log.warn("Invalid URL: The 'url' property must be a non-empty string.");
        return; // Exit the function if the URL is invalid
    }
    var index = array.findIndex(function (item) { return item.url === newObj.url; });
    if (index !== -1) {
        // Replace the existing object
        array[index] = newObj;
    }
    else {
        // Append the new object
        array.push(newObj);
    }
}

hpp.setConfig(hexo.config);
// Queue to hold the pages to be processed
var pageQueue = [];
var isProcessing = false;
function getCachePath(page) {
    var hash = "empty-hash";
    if (page && "full_source" in page && page.full_source)
        utility.md5FileSync(page.full_source);
    if (hash === "empty-hash") {
        if (page.content) {
            hash = utility.md5(page.content);
        }
        else if (page._content) {
            hash = utility.md5(page._content);
        }
    }
    var result = path.join(process.cwd(), "tmp", "metadata", hexo.config.theme, "post-" + sanitize((page.title || new String(page._id)).substring(0, 100) + "-" + hash));
    utility.fs.ensureDirSync(path.dirname(result));
    return result;
}
/**
 * Preprocess a page and save its parsed result to a cache file
 *
 * @param page - The page object to be processed.
 * @param callback - The callback that handles the result or error.
 */
function metadataProcess(page, callback) {
    return __awaiter(this, void 0, void 0, function () {
        var cachePath, cleanMetadata, handleResult, result, parse, html, $_1, imgTags, randomIndex, result, error_1, err_1;
        var _this = this;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    if (!page.full_source) {
                        hexo.log.warn("fail parse metadata from", page.title || page.subtitle || page.permalink);
                        return [2 /*return*/];
                    }
                    cachePath = getCachePath(page);
                    if (utility.fs.existsSync(cachePath) && getHexoArgs() === "generate") {
                        return [2 /*return*/]; // Skip if already parsed
                    }
                    cleanMetadata = function (metadata) {
                        Object.keys(metadata).forEach(function (key) {
                            if (metadata[key] == null)
                                delete metadata[key];
                        });
                    };
                    handleResult = function (result) { return __awaiter(_this, void 0, void 0, function () {
                        var error_2;
                        return __generator(this, function (_a) {
                            switch (_a.label) {
                                case 0:
                                    if (!result.metadata)
                                        return [2 /*return*/];
                                    cleanMetadata(result.metadata);
                                    if (!result.metadata.permalink && page.permalink) {
                                        result.metadata.permalink = require$$2.url_for.bind(hexo)(page.path);
                                    }
                                    _a.label = 1;
                                case 1:
                                    _a.trys.push([1, 3, , 6]);
                                    return [4 /*yield*/, utility.fs.promises.writeFile(cachePath, utility.jsonStringifyWithCircularRefs(result))];
                                case 2:
                                    _a.sent();
                                    callback(null, { result: result, cachePath: cachePath });
                                    return [3 /*break*/, 6];
                                case 3:
                                    error_2 = _a.sent();
                                    hexo.log.error("fail save post info", error_2.message);
                                    if (!utility.fs.existsSync(cachePath)) return [3 /*break*/, 5];
                                    return [4 /*yield*/, utility.fs.promises.rm(cachePath, { force: true, recursive: true })];
                                case 4:
                                    _a.sent();
                                    _a.label = 5;
                                case 5:
                                    callback(error_2, null);
                                    return [3 /*break*/, 6];
                                case 6: return [2 /*return*/];
                            }
                        });
                    }); };
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 4, , 15]);
                    return [4 /*yield*/, hpp.parsePost(page.full_source, { fix: true, cache: true })];
                case 2:
                    result = _a.sent();
                    return [4 /*yield*/, handleResult(result)];
                case 3:
                    _a.sent();
                    return [3 /*break*/, 15];
                case 4:
                    _a.sent();
                    _a.label = 5;
                case 5:
                    _a.trys.push([5, 13, , 14]);
                    if (!page.full_source) return [3 /*break*/, 12];
                    return [4 /*yield*/, hpp.parsePost(page.full_source)];
                case 6:
                    parse = _a.sent();
                    if (!parse.attributes) return [3 /*break*/, 12];
                    html = hpp.renderMarked(parse.body);
                    $_1 = require$$0.load(html);
                    if (!parse.attributes.description) {
                        parse.attributes.description = $_1.text().slice(0, 150);
                    }
                    if (!parse.attributes.thumbnail) {
                        parse.attributes.thumbnail =
                            "https://rawcdn.githack.com/dimaslanjaka/public-source/6a0117ddb2ea327c80dbcc7327cceca1e1b7794e/images/no-image-svgrepo-com.svg";
                        imgTags = $_1("img").filter(function (i, el) { var _a; return ((_a = $_1(el).attr("src")) === null || _a === void 0 ? void 0 : _a.trim()) !== ""; });
                        if (imgTags.length > 0) {
                            randomIndex = Math.floor(Math.random() * imgTags.length);
                            parse.attributes.thumbnail = $_1(imgTags[randomIndex]).attr("src");
                        }
                    }
                    if (!parse.attributes.permalink && page.permalink) {
                        parse.attributes.permalink = page.permalink;
                    }
                    result = { metadata: parse.attributes, rawbody: parse.body };
                    cleanMetadata(result.metadata);
                    _a.label = 7;
                case 7:
                    _a.trys.push([7, 9, , 12]);
                    return [4 /*yield*/, utility.fs.promises.writeFile(cachePath, utility.jsonStringifyWithCircularRefs(result))];
                case 8:
                    _a.sent();
                    callback(null, { result: result, cachePath: cachePath });
                    return [3 /*break*/, 12];
                case 9:
                    error_1 = _a.sent();
                    hexo.log.error("fail save post info", error_1.message);
                    if (!utility.fs.existsSync(cachePath)) return [3 /*break*/, 11];
                    return [4 /*yield*/, utility.fs.promises.rm(cachePath, { force: true, recursive: true })];
                case 10:
                    _a.sent();
                    _a.label = 11;
                case 11:
                    callback(error_1, null);
                    return [3 /*break*/, 12];
                case 12: return [3 /*break*/, 14];
                case 13:
                    err_1 = _a.sent();
                    callback(new Error("fallback metadata failed: " + err_1.message), null);
                    return [3 /*break*/, 14];
                case 14: return [3 /*break*/, 15];
                case 15: return [2 /*return*/];
            }
        });
    });
}
/**
 * Schedule the processing of pages one by one.
 */
function scheduleProcessing() {
    if (isProcessing || pageQueue.length === 0) {
        return; // If already processing or no items in the queue, exit
    }
    isProcessing = true;
    var page = pageQueue.shift(); // Get the first item in the queue
    if (page) {
        metadataProcess(page, function (err, data) {
            if (err) {
                hexo.log.error("Error processing page:", err.message);
            }
            else {
                isProcessing = false;
                if ((data === null || data === void 0 ? void 0 : data.result) && data.result.metadata) {
                    saveAsSearch({
                        url: data.result.metadata.permalink || "",
                        title: data.result.metadata.title || "",
                        description: data.result.metadata.description || ""
                    });
                }
                setTimeout(scheduleProcessing, 500); // Continue to next item after delay (optional)
            }
        });
    }
}
/**
 * Add pages to the queue and start processing.
 *
 * @param page - The page object to be added to the queue.
 */
function addToQueue(page) {
    pageQueue.push(page);
    scheduleProcessing(); // Start processing if not already running
}
var metadataHelper = function (page) {
    addToQueue(page);
    var cachePath = getCachePath(page);
    if (utility.fs.existsSync(cachePath)) {
        try {
            var result = utility.jsonParseWithCircularRefs(utility.fs.readFileSync(cachePath, "utf-8"));
            if (result && result.metadata) {
                // Assign values to the page object if they exist and are not undefined or null
                for (var key in result.metadata) {
                    if (["type"].includes(key))
                        continue;
                    if (Object.hasOwnProperty.call(result.metadata, key)) {
                        var value = result.metadata[key];
                        if (value !== undefined && value !== null && !page[key]) {
                            // fix: thumbnail always undefined
                            if (key === "cover" && value.includes("no-image-svgrepo"))
                                continue;
                            if (key === "thumbnail" && value.includes("no-image-svgrepo"))
                                continue;
                            page[key] = value;
                        }
                    }
                }
            }
        }
        catch (error) {
            hexo.log.error("fail load post info", error.message);
        }
    }
    return page; // Return the original page for now
};
hexo.extend.helper.register("pageInfo", metadataHelper);

/**
 * get all images from page/post
 * @param page
 */
function getImages(page) {
    var results = [];
    if (page && typeof page === "object") {
        if (typeof page.thumbnail === "string")
            results.push(page.thumbnail);
        if (typeof page.cover === "string")
            results.push(page.cover);
        if (Array.isArray(page.photos)) {
            results.push.apply(results, page.photos);
        }
    }
    if (page.content || page._content) {
        // Collect all image URLs from url
        var $_1 = require$$0.load(page.content || page._content);
        $_1("img").each(function (_, img) {
            var element = $_1(img);
            // Collect URLs from 'src', 'data-src', and 'srcset'
            var src = element.attr("src");
            var dataSrc = element.attr("data-src");
            var srcset = element.attr("srcset");
            if (src)
                results.push(src);
            if (dataSrc)
                results.push(dataSrc);
            // If 'srcset' exists, split it into individual URLs (ignoring size descriptors)
            if (srcset) {
                var srcsetUrls = srcset.split(",").map(function (entry) { return entry.trim().split(" ")[0]; });
                results.push.apply(results, srcsetUrls);
            }
        });
    }
    var final = _.filter(_.uniq(results), _.identity).filter(function (str) { return !str.includes("no-image-svgrepo-com"); });
    return final;
}
hexo.extend.helper.register("getImages", getImages);
/**
 * get thumbnail url
 * @param {import("hexo/dist/hexo/locals-d").HexoLocalsData} page
 */
function getThumbnail(page) {
    if (page && typeof page === "object") {
        // priority defined thumbnail in frontmatter
        if (typeof page.thumbnail === "string")
            return page.thumbnail;
        if (typeof page.cover === "string")
            return page.cover;
    }
    return _.sample(getImages(page));
}
hexo.extend.helper.register("getThumbnail", function (page) {
    var result = getThumbnail(page);
    if (result)
        return result;
    return "https://rawcdn.githack.com/dimaslanjaka/public-source/6a0117ddb2ea327c80dbcc7327cceca1e1b7794e/images/no-image-svgrepo-com.svg";
});

var utils = {};

var array = {};

var hasRequiredArray;

function requireArray () {
	if (hasRequiredArray) return array;
	hasRequiredArray = 1;
	function chunkArray(array, size) {
	  const result = [];
	  for (let i = 0; i < array.length; i += size) {
	    result.push(array.slice(i, i + size));
	  }
	  return result;
	}

	hexo.extend.helper.register("chunkArray", chunkArray);
	return array;
}

var hasRequiredUtils;

function requireUtils () {
	if (hasRequiredUtils) return utils;
	hasRequiredUtils = 1;
	requireArray();
	return utils;
}

// themes/<your_theme>/scripts/example.js
function themeConfig() {
    var config = {};
    var instance = this instanceof Hexo ? this : hexo;
    var theme_names = [instance.config.theme, "hexo-theme-" + instance.config.theme];
    var theme_dirs = theme_names
        .map(function (name) {
        return [path.join(instance.base_dir, "themes", name), path.join(instance.base_dir, "node_modules", name)];
    })
        .flat()
        .filter(fs.existsSync);
    var theme_config_file = theme_dirs
        .map(function (dir) { return path.join(dir, "_config.yml"); })
        .filter(function (filePath) { return fs.existsSync(filePath); })[0];
    if (theme_config_file) {
        config = yaml.parse(fs.readFileSync(theme_config_file, "utf-8"));
    }
    var user_defined_theme_config_file = theme_names
        .map(function (name) {
        return [
            path.join(instance.base_dir, "_config.".concat(name, ".yml")),
            path.join(instance.base_dir, "_config.hexo-theme-".concat(name, ".yml"))
        ];
    })
        .flat()
        .filter(function (filePath) { return fs.existsSync(filePath); })[0];
    if (user_defined_theme_config_file) {
        config = Object.assign(config, yaml.parse(fs.readFileSync(user_defined_theme_config_file, "utf-8")));
    }
    if ("nav" in instance.config.theme_config) {
        delete instance.config.theme_config.nav;
    }
    if ("footer_nav" in instance.config.theme_config) {
        delete instance.config.theme_config.footer_nav;
    }
    config = deepmergeTs.deepmerge(instance.config.theme_config, config);
    return config;
}
hexo.extend.helper.register("themeConfig", themeConfig);

// clean build and temp folder on `hexo clean`
hexo.extend.filter.register("after_clean", function () {
    // remove some other temporary files
    hexo.log.debug("cleaning build and temp folder");
    var folders = [
        path.join(hexo.base_dir, "tmp/hexo-theme-flowbite"),
        path.join(hexo.base_dir, "tmp/hexo-theme-claudia"),
        path.join(hexo.base_dir, "tmp/hexo-theme-butterfly")
    ]
        .concat(searchFiles)
        .flat();
    for (var i = 0; i < folders.length; i++) {
        var folder = folders[i];
        try {
            if (fs.existsSync(folder))
                fs.rmSync(folder, { recursive: true, force: true });
        }
        catch (error) {
            hexo.log.warn("fail delete " + folder, error.message);
        }
    }
});

function getKeywords(page) {
    var results = [];
    if (page.keywords && Array.isArray(page.keywords))
        return page.keywords;
    if (page.tags) {
        page.tags.each(function (label) {
            results.push(label.name);
        });
    }
    if (page.categories) {
        page.categories.each(function (label) {
            results.push(label.name);
        });
    }
    return results;
}
hexo.extend.helper.register("getKeywords", getKeywords);

function fix_url_for(source) {
    var instance = this instanceof Hexo ? this : hexo;
    var _a = instance.config.root, root = _a === void 0 ? null : _a;
    // skip hash source or global protocol url
    if (source.startsWith("#") || source.startsWith("//"))
        return source;
    // process non url source
    if (!utility.isValidHttpUrl(source) && root) {
        if (!source.startsWith(root))
            return require$$2.url_for.bind(instance)(source);
        return source;
    }
    return source;
}
hexo.extend.helper.register("urlFor", fix_url_for);

// re-implementation fixer of hexo-seo
/**
 * fix SEO on anchors
 * @param $ CherrioAPI
 * @returns
 */
function fixAnchor($, data) {
    $("a").each(function () {
        // avoid duplicate rels
        var currentRel = $(this).attr("rel");
        if (currentRel) {
            // Create a Set to store unique rels
            var rels = new Set(currentRel.split(" "));
            // Update the rel attribute with unique values
            $(this).attr("rel", Array.from(rels).join(" "));
        }
        // add anchor title
        if ($(this).attr("title")) {
            $(this).attr("title", data.title ? "".concat(data.title, " ").concat($(this).attr("href")) : $(this).attr("href"));
        }
    });
    return $;
}
function fixImages($, data) {
    $("img").each(function () {
        var src = $(this).attr("src") || $(this).attr("data-src");
        var alt = $(this).attr("alt") || "";
        if (alt.length === 0) {
            $(this).attr("alt", data.title ? "".concat(data.title, " ").concat(src) : src);
        }
        var title = $(this).attr("title") || "";
        if (title.length === 0) {
            $(this).attr("title", data.title ? "".concat(data.title, " ").concat(src) : src);
        }
        var itemprop = $(this).attr("itemprop");
        if (!itemprop || itemprop.trim() === "") {
            $(this).attr("itemprop", "image");
        }
    });
    return $;
}
/**
 * callback for after_render:html
 * @param content rendered html string
 * @param data current page data
 */
function htmlSeoFixer(content, data) {
    var $ = require$$0.load(content);
    $ = fixAnchor($, data);
    $ = fixImages($, data);
    return $.html();
}
hexo.extend.filter.register("after_render:html", htmlSeoFixer);

// forked from hexo-theme-butterfly
// do not include this into hexo-theme-butterfly scripts
/**
 * Function to process the content inside the gallery block and return an array of images with captions and URLs.
 * @param content - The content between {% gallery %} and {% endgallery %}
 * @returns An array of objects containing the image URL and caption
 */
function processGalleryContent(content) {
    // Split the content by newlines to get individual image markdown
    var imageLines = content.trim().split("\n");
    // Initialize an array to store image data
    var images = [];
    // Iterate over each image line
    imageLines.forEach(function (line) {
        // Extract the caption and URL from the markdown image format ![caption](URL)
        var match = line.match(/!\[([^\]]*)\]\((.*)\)/);
        if (match) {
            var caption = match[1]; // The image caption
            var url = match[2]; // The image URL
            images.push({
                url: url,
                caption: caption || "" // If no caption, set as an empty string
            });
        }
    });
    return images;
}
hexo.extend.tag.register("gallery", function (_args, content) {
    // Call the processGalleryContent function to get image data
    var images = processGalleryContent(content).map(function (o) {
        o.alt = o.caption;
        return o;
    });
    // Return the JSON array
    return "<div class=\"gallery-container\"><div class=\"gallery-items\">".concat(JSON.stringify(images, null, 2), "</div></div>");
}, { ends: true });
hexo.extend.tag.register("galleryGroup", function (args) {
    var name = args[0], description = args[1], url = args[2], imgUrl = args[3];
    // Return the required HTML structure
    return "\n      <figure class=\"gallery-group\">\n        <img class=\"gallery-group-img\" src=\"".concat(imgUrl, "\" alt=\"Group Image Gallery\" title=\"Group Image Gallery\" itemprop=\"image\">\n        <figcaption>\n          <div class=\"gallery-group-name\">").concat(name, "</div>\n          <p>").concat(description, "</p>\n          <a href=\"").concat(url, "\"></a>\n        </figcaption>\n      </figure>\n    ");
});

var hasRequiredScripts;

function requireScripts () {
	if (hasRequiredScripts) return scripts;
	hasRequiredScripts = 1;
	requireDate();
	requireFancybox();
	requireHelpers();
	requireInjector();
	requirePaginator();



	requireUtils();
	return scripts;
}

var scriptsExports = requireScripts();
var index = /*@__PURE__*/getDefaultExportFromCjs(scriptsExports);

module.exports = index;

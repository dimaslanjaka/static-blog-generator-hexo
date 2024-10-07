'use strict';

var require$$0 = require('cheerio');
var require$$1 = require('nunjucks');
var require$$2 = require('hexo-util');
var require$$0$1 = require('fs-extra');
var path = require('path');
var hexoPostParser = require('hexo-post-parser');
var sanitize = require('sanitize-filename');
var sbgUtility = require('sbg-utility');
var _ = require('lodash');
var require$$0$2 = require('hexo');
var require$$3 = require('yaml');
var require$$4 = require('deepmerge-ts');

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
	const fs = require$$0$1;
	const path$1 = path;

	hexo.extend.helper.register("injectHeadHtml", function () {
	  const file = path$1.join(hexo.base_dir, "source/_data/hexo-theme-flowbite/head.html");
	  if (fs.existsSync(file)) {
	    return fs.readFileSync(file, "utf-8");
	  }
	  return "";
	});

	hexo.extend.helper.register("injectBodyHtml", function () {
	  const file = path$1.join(hexo.base_dir, "source/_data/hexo-theme-flowbite/body.html");
	  if (fs.existsSync(file)) {
	    return fs.readFileSync(file, "utf-8");
	  }
	  return "";
	});

	hexo.extend.helper.register("injectBeforePostHtml", function () {
	  const file = path$1.join(hexo.base_dir, "source/_data/hexo-theme-flowbite/before-post.html");
	  if (fs.existsSync(file)) {
	    return fs.readFileSync(file, "utf-8");
	  }
	  return "";
	});

	hexo.extend.helper.register("injectAfterPostHtml", function () {
	  const file = path$1.join(hexo.base_dir, "source/_data/hexo-theme-flowbite/after-post.html");
	  if (fs.existsSync(file)) {
	    return fs.readFileSync(file, "utf-8");
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

hexoPostParser.setConfig(hexo.config);
// Queue to hold the pages to be processed
var pageQueue = [];
var isProcessing = false;
function getCachePath(page) {
    var hash;
    if (page && "full_source" in page)
        sbgUtility.md5FileSync(page.full_source);
    if (!hash)
        hash = sbgUtility.md5(page.content || page._content);
    return path.join(process.cwd(), "tmp/hexo-theme-flowbite/caches/post-" +
        sanitize((page.title || new String(page._id)).substring(0, 100) + "-" + hash));
}
/**
 * Preprocess a page and save its parsed result to a cache file
 *
 * @param page - The page object to be processed.
 * @param callback - The callback that handles the result or error.
 */
function preprocess(page, callback) {
    var cachePath = getCachePath(page);
    sbgUtility.fs.ensureDirSync(path.dirname(cachePath));
    hexoPostParser
        .parsePost(page.full_source, { fix: true })
        .then(function (result) {
        // Remove keys with undefined or null values
        Object.keys(result.metadata).forEach(function (key) {
            if (result.metadata[key] === undefined || result.metadata[key] === null) {
                delete result.metadata[key];
            }
        });
        try {
            sbgUtility.fs.writeFileSync(cachePath, sbgUtility.jsonStringifyWithCircularRefs(result));
            callback(null, { result: result, cachePath: cachePath }); // Pass cachePath in the callback
        }
        catch (error) {
            hexo.log.error("fail save post info", error.message);
            callback(error, null); // Invoke callback on error
        }
    })
        .catch(function (err) {
        callback(err, null); // Catch parsePost errors
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
        preprocess(page, function (err, _data) {
            if (err) {
                hexo.log.error("Error processing page:", err.message);
            }
            else {
                isProcessing = false;
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
hexo.extend.helper.register("pageInfo", function (page) {
    addToQueue(page);
    var cachePath = getCachePath(page);
    if (sbgUtility.fs.existsSync(cachePath)) {
        try {
            var result = sbgUtility.jsonParseWithCircularRefs(sbgUtility.fs.readFileSync(cachePath, "utf-8"));
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
});

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

var config;
var hasRequiredConfig;

function requireConfig () {
	if (hasRequiredConfig) return config;
	hasRequiredConfig = 1;
	const Hexo = require$$0$2;
	const path$1 = path;
	const fs = require$$0$1;
	const yaml = require$$3;
	const { deepmerge } = require$$4;

	// themes/<your_theme>/scripts/example.js
	function themeConfig() {
	  let config = {};

	  const theme_names = [hexo.config.theme, "hexo-theme-" + hexo.config.theme];
	  const theme_dirs = theme_names
	    .map((name) => {
	      return [path$1.join(hexo.base_dir, "themes", name), path$1.join(hexo.base_dir, "node_modules", name)];
	    })
	    .flat()
	    .filter(fs.existsSync);
	  const theme_config_file = theme_dirs
	    .map((dir) => path$1.join(dir, "_config.yml"))
	    .filter((filePath) => fs.existsSync(filePath))[0];
	  if (theme_config_file) {
	    config = yaml.parse(fs.readFileSync(theme_config_file, "utf-8"));
	  }

	  const user_defined_theme_config_file = theme_names
	    .map((name) => {
	      return [
	        path$1.join(hexo.base_dir, `_config.${name}.yml`),
	        path$1.join(hexo.base_dir, `_config.hexo-theme-${name}.yml`)
	      ];
	    })
	    .flat()
	    .filter((filePath) => fs.existsSync(filePath))[0];
	  if (user_defined_theme_config_file) {
	    config = Object.assign(config, yaml.parse(fs.readFileSync(user_defined_theme_config_file, "utf-8")));
	  }

	  if (this instanceof Hexo) {
	    config = deepmerge(config, this.config.theme_config);
	  } else {
	    config = deepmerge(config, hexo.config.theme_config);
	  }

	  return config;
	}

	// Please see: https://hexo.io/api/filter
	// hexo.extend.filter.register("after_init", themeConfig);

	// Also you can use it in a template engine (e.g: EJS)
	// https://hexo.io/docs/helpers
	hexo.extend.helper.register("getThemeConfig", themeConfig);

	config = themeConfig;
	return config;
}

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
	requireConfig();
	return scripts;
}

var scriptsExports = requireScripts();
var index = /*@__PURE__*/getDefaultExportFromCjs(scriptsExports);

module.exports = index;

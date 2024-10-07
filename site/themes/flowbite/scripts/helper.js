'use strict';

var require$$0 = require('cheerio');
var require$$1 = require('nunjucks');
var require$$2 = require('hexo-util');
var require$$0$1 = require('fs-extra');
var require$$1$1 = require('path');
var require$$0$2 = require('lodash');
var require$$0$3 = require('hexo-post-parser');
var require$$3 = require('sbg-utility');
var require$$4 = require('sanitize-filename');

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
	const path = require$$1$1;

	hexo.extend.helper.register("injectHeadHtml", function () {
	  const file = path.join(hexo.base_dir, "source/_data/hexo-theme-flowbite/head.html");
	  if (fs.existsSync(file)) {
	    return fs.readFileSync(file, "utf-8");
	  }
	  return "";
	});

	hexo.extend.helper.register("injectBodyHtml", function () {
	  const file = path.join(hexo.base_dir, "source/_data/hexo-theme-flowbite/body.html");
	  if (fs.existsSync(file)) {
	    return fs.readFileSync(file, "utf-8");
	  }
	  return "";
	});

	hexo.extend.helper.register("injectBeforePostHtml", function () {
	  const file = path.join(hexo.base_dir, "source/_data/hexo-theme-flowbite/before-post.html");
	  if (fs.existsSync(file)) {
	    return fs.readFileSync(file, "utf-8");
	  }
	  return "";
	});

	hexo.extend.helper.register("injectAfterPostHtml", function () {
	  const file = path.join(hexo.base_dir, "source/_data/hexo-theme-flowbite/after-post.html");
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

var post = {};

var author = {};

/**
 * get author name
 * @param {Partial<string|Record<string, any>|import("hexo/dist/hexo/index-d").HexoConfig>} author
 * @returns
 */

var hasRequiredAuthor;

function requireAuthor () {
	if (hasRequiredAuthor) return author;
	hasRequiredAuthor = 1;
	function getAuthorName(author) {
	  if (typeof author === "string") return author;
	  if (author && typeof author === "object" && !Array.isArray(author)) {
	    if (typeof author.name === "string") return author.name;
	    if (typeof author.nick === "string") return author.nick;
	    if (typeof author.nickname === "string") return author.nickname;
	    if (typeof author.author_obj === "object") return getAuthorName(author.author_obj);
	  }
	}

	hexo.extend.helper.register("getAuthorName", function (author, fallback) {
	  const resultAuthor = getAuthorName(author);
	  if (resultAuthor) return resultAuthor;
	  const resultFallback = getAuthorName(fallback);
	  if (resultFallback) return resultFallback;
	  return getAuthorName(hexo.config) || "Unknown";
	});
	return author;
}

var thumbnail = {};

var hasRequiredThumbnail;

function requireThumbnail () {
	if (hasRequiredThumbnail) return thumbnail;
	hasRequiredThumbnail = 1;
	const _ = require$$0$2;
	const cheerio = require$$0;

	/**
	 * get all images from page/post
	 * @param {Partial<import("hexo/dist/types").PageSchema|import("hexo/dist/types").PostSchema>} page
	 */
	function getImages(page) {
	  /**
	   * @type {string[]}
	   */
	  const results = [];
	  if (page && typeof page === "object") {
	    if (typeof page.thumbnail === "string") results.push(page.thumbnail);
	    if (typeof page.cover === "string") results.push(page.cover);
	    if (Array.isArray(page.photos)) {
	      results.push(...page.photos);
	    }
	  }
	  if (page.content || page._content) {
	    // Collect all image URLs from url
	    const $ = cheerio.load(page.content || page._content);
	    $("img").each((_, img) => {
	      const element = $(img);

	      // Collect URLs from 'src', 'data-src', and 'srcset'
	      const src = element.attr("src");
	      const dataSrc = element.attr("data-src");
	      const srcset = element.attr("srcset");

	      if (src) results.push(src);
	      if (dataSrc) results.push(dataSrc);

	      // If 'srcset' exists, split it into individual URLs (ignoring size descriptors)
	      if (srcset) {
	        const srcsetUrls = srcset.split(",").map((entry) => entry.trim().split(" ")[0]);
	        results.push(...srcsetUrls);
	      }
	    });
	  }
	  const final = _.filter(_.uniq(results), _.identity).filter((str) => !str.includes("no-image-svgrepo-com"));
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
	    if (typeof page.thumbnail === "string") return page.thumbnail;
	    if (typeof page.cover === "string") return page.cover;
	  }
	  return _.sample(getImages(page));
	}

	hexo.extend.helper.register("getThumbnail", function (page) {
	  const result = getThumbnail(page);
	  if (result) return result;
	  return "https://rawcdn.githack.com/dimaslanjaka/public-source/6a0117ddb2ea327c80dbcc7327cceca1e1b7794e/images/no-image-svgrepo-com.svg";
	});
	return thumbnail;
}

var metadata = {};

var hasRequiredMetadata;

function requireMetadata () {
	if (hasRequiredMetadata) return metadata;
	hasRequiredMetadata = 1;
	const hexoPostParser = require$$0$3;
	const _ = require$$0$2;
	const path = require$$1$1;
	const { md5, fs, jsonStringifyWithCircularRefs, jsonParseWithCircularRefs } = require$$3;
	const sanitize = require$$4;

	hexoPostParser.setConfig(hexo.config);

	/**
	 *
	 * @param {import("hexo/dist/types").PostSchema|import("hexo/dist/types").PageSchema} page
	 */
	function preprocess(page) {
	  const cachePath = path.join(
	    process.cwd(),
	    "tmp/hexo-theme-flowbite/caches/post-" +
	      sanitize((page.title || page._id).substring(0, 100) + "-" + md5(page.content || page._content))
	  );
	  fs.ensureDirSync(path.dirname(cachePath));
	  hexoPostParser
	    .parsePost(page.full_source, { fix: true })
	    .then((result) => {
	      // Remove keys with undefined or null values
	      Object.keys(result.metadata).forEach((key) => {
	        if (result.metadata[key] === undefined || result.metadata[key] === null) {
	          delete result.metadata[key];
	        }
	      });
	      try {
	        fs.writeFileSync(cachePath, jsonStringifyWithCircularRefs(result));
	      } catch (error) {
	        hexo.log.error("fail save post info", error.message);
	      }
	    })
	    .catch(_.noop);
	  if (fs.existsSync(cachePath)) {
	    try {
	      const extract = jsonParseWithCircularRefs(fs.readFileSync(cachePath, "utf-8"));
	      return extract;
	    } catch (error) {
	      hexo.log.error("fail load post info", error.message);
	    }
	  }
	}

	hexo.extend.helper.register("pageInfo", (page) => {
	  const result = preprocess(page);
	  if (result && result.metadata) {
	    // Assign values to the page object if they exist and are not undefined or null
	    for (const key in result.metadata) {
	      if (["type"].includes(key)) continue;
	      if (Object.hasOwnProperty.call(result.metadata, key)) {
	        const value = result.metadata[key];
	        if (value !== undefined && value !== null && !page[key]) {
	          // fix: thumbnail always undefined
	          if (key === "cover" && value.includes("no-image-svgrepo")) continue;
	          if (key === "thumbnail" && value.includes("no-image-svgrepo")) continue;
	          page[key] = value;
	        }
	      }
	    }
	  }
	  return page;
	});
	return metadata;
}

var hasRequiredPost;

function requirePost () {
	if (hasRequiredPost) return post;
	hasRequiredPost = 1;
	requireAuthor();
	requireThumbnail();
	requireMetadata();
	return post;
}

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

var hasRequiredScripts;

function requireScripts () {
	if (hasRequiredScripts) return scripts;
	hasRequiredScripts = 1;
	requireDate();
	requireFancybox();
	requireHelpers();
	requireInjector();
	requirePaginator();
	requirePost();
	requireUtils();
	return scripts;
}

var scriptsExports = requireScripts();
var index = /*@__PURE__*/getDefaultExportFromCjs(scriptsExports);

module.exports = index;

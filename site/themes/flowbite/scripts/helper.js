'use strict';

var require$$0 = require('cheerio');
var require$$1 = require('nunjucks');
var require$$2$1 = require('hexo-util');
var fs = require('fs-extra');
var path = require('path');
var hexoPostParser = require('hexo-post-parser');
var sanitize = require('sanitize-filename');
var sbgUtility = require('sbg-utility');
var _ = require('lodash');
var deepmergeTs = require('deepmerge-ts');
var Hexo = require('hexo');
var yaml = require('yaml');

var commonjsGlobal = typeof globalThis !== 'undefined' ? globalThis : typeof window !== 'undefined' ? window : typeof global !== 'undefined' ? global : typeof self !== 'undefined' ? self : {};

function getDefaultExportFromCjs (x) {
	return x && x.__esModule && Object.prototype.hasOwnProperty.call(x, 'default') ? x['default'] : x;
}

function getAugmentedNamespace(n) {
  if (n.__esModule) return n;
  var f = n.default;
	if (typeof f == "function") {
		var a = function a () {
			if (this instanceof a) {
        return Reflect.construct(f, arguments, this.constructor);
			}
			return f.apply(this, arguments);
		};
		a.prototype = f.prototype;
  } else a = {};
  Object.defineProperty(a, '__esModule', {value: true});
	Object.keys(n).forEach(function (k) {
		var d = Object.getOwnPropertyDescriptor(n, k);
		Object.defineProperty(a, k, d.get ? d : {
			enumerable: true,
			get: function () {
				return n[k];
			}
		});
	});
	return a;
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
	  const util = require$$2$1;
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

var toHtml = {};

var index_cjs$8 = {};

var hasRequiredIndex_cjs$8;

function requireIndex_cjs$8 () {
	if (hasRequiredIndex_cjs$8) return index_cjs$8;
	hasRequiredIndex_cjs$8 = 1;

	/* eslint-disable no-bitwise */

	const decodeCache = {};

	function getDecodeCache (exclude) {
	  let cache = decodeCache[exclude];
	  if (cache) { return cache }

	  cache = decodeCache[exclude] = [];

	  for (let i = 0; i < 128; i++) {
	    const ch = String.fromCharCode(i);
	    cache.push(ch);
	  }

	  for (let i = 0; i < exclude.length; i++) {
	    const ch = exclude.charCodeAt(i);
	    cache[ch] = '%' + ('0' + ch.toString(16).toUpperCase()).slice(-2);
	  }

	  return cache
	}

	// Decode percent-encoded string.
	//
	function decode (string, exclude) {
	  if (typeof exclude !== 'string') {
	    exclude = decode.defaultChars;
	  }

	  const cache = getDecodeCache(exclude);

	  return string.replace(/(%[a-f0-9]{2})+/gi, function (seq) {
	    let result = '';

	    for (let i = 0, l = seq.length; i < l; i += 3) {
	      const b1 = parseInt(seq.slice(i + 1, i + 3), 16);

	      if (b1 < 0x80) {
	        result += cache[b1];
	        continue
	      }

	      if ((b1 & 0xE0) === 0xC0 && (i + 3 < l)) {
	        // 110xxxxx 10xxxxxx
	        const b2 = parseInt(seq.slice(i + 4, i + 6), 16);

	        if ((b2 & 0xC0) === 0x80) {
	          const chr = ((b1 << 6) & 0x7C0) | (b2 & 0x3F);

	          if (chr < 0x80) {
	            result += '\ufffd\ufffd';
	          } else {
	            result += String.fromCharCode(chr);
	          }

	          i += 3;
	          continue
	        }
	      }

	      if ((b1 & 0xF0) === 0xE0 && (i + 6 < l)) {
	        // 1110xxxx 10xxxxxx 10xxxxxx
	        const b2 = parseInt(seq.slice(i + 4, i + 6), 16);
	        const b3 = parseInt(seq.slice(i + 7, i + 9), 16);

	        if ((b2 & 0xC0) === 0x80 && (b3 & 0xC0) === 0x80) {
	          const chr = ((b1 << 12) & 0xF000) | ((b2 << 6) & 0xFC0) | (b3 & 0x3F);

	          if (chr < 0x800 || (chr >= 0xD800 && chr <= 0xDFFF)) {
	            result += '\ufffd\ufffd\ufffd';
	          } else {
	            result += String.fromCharCode(chr);
	          }

	          i += 6;
	          continue
	        }
	      }

	      if ((b1 & 0xF8) === 0xF0 && (i + 9 < l)) {
	        // 111110xx 10xxxxxx 10xxxxxx 10xxxxxx
	        const b2 = parseInt(seq.slice(i + 4, i + 6), 16);
	        const b3 = parseInt(seq.slice(i + 7, i + 9), 16);
	        const b4 = parseInt(seq.slice(i + 10, i + 12), 16);

	        if ((b2 & 0xC0) === 0x80 && (b3 & 0xC0) === 0x80 && (b4 & 0xC0) === 0x80) {
	          let chr = ((b1 << 18) & 0x1C0000) | ((b2 << 12) & 0x3F000) | ((b3 << 6) & 0xFC0) | (b4 & 0x3F);

	          if (chr < 0x10000 || chr > 0x10FFFF) {
	            result += '\ufffd\ufffd\ufffd\ufffd';
	          } else {
	            chr -= 0x10000;
	            result += String.fromCharCode(0xD800 + (chr >> 10), 0xDC00 + (chr & 0x3FF));
	          }

	          i += 9;
	          continue
	        }
	      }

	      result += '\ufffd';
	    }

	    return result
	  })
	}

	decode.defaultChars = ';/?:@&=+$,#';
	decode.componentChars = '';

	const encodeCache = {};

	// Create a lookup array where anything but characters in `chars` string
	// and alphanumeric chars is percent-encoded.
	//
	function getEncodeCache (exclude) {
	  let cache = encodeCache[exclude];
	  if (cache) { return cache }

	  cache = encodeCache[exclude] = [];

	  for (let i = 0; i < 128; i++) {
	    const ch = String.fromCharCode(i);

	    if (/^[0-9a-z]$/i.test(ch)) {
	      // always allow unencoded alphanumeric characters
	      cache.push(ch);
	    } else {
	      cache.push('%' + ('0' + i.toString(16).toUpperCase()).slice(-2));
	    }
	  }

	  for (let i = 0; i < exclude.length; i++) {
	    cache[exclude.charCodeAt(i)] = exclude[i];
	  }

	  return cache
	}

	// Encode unsafe characters with percent-encoding, skipping already
	// encoded sequences.
	//
	//  - string       - string to encode
	//  - exclude      - list of characters to ignore (in addition to a-zA-Z0-9)
	//  - keepEscaped  - don't encode '%' in a correct escape sequence (default: true)
	//
	function encode (string, exclude, keepEscaped) {
	  if (typeof exclude !== 'string') {
	    // encode(string, keepEscaped)
	    keepEscaped = exclude;
	    exclude = encode.defaultChars;
	  }

	  if (typeof keepEscaped === 'undefined') {
	    keepEscaped = true;
	  }

	  const cache = getEncodeCache(exclude);
	  let result = '';

	  for (let i = 0, l = string.length; i < l; i++) {
	    const code = string.charCodeAt(i);

	    if (keepEscaped && code === 0x25 /* % */ && i + 2 < l) {
	      if (/^[0-9a-f]{2}$/i.test(string.slice(i + 1, i + 3))) {
	        result += string.slice(i, i + 3);
	        i += 2;
	        continue
	      }
	    }

	    if (code < 128) {
	      result += cache[code];
	      continue
	    }

	    if (code >= 0xD800 && code <= 0xDFFF) {
	      if (code >= 0xD800 && code <= 0xDBFF && i + 1 < l) {
	        const nextCode = string.charCodeAt(i + 1);
	        if (nextCode >= 0xDC00 && nextCode <= 0xDFFF) {
	          result += encodeURIComponent(string[i] + string[i + 1]);
	          i++;
	          continue
	        }
	      }
	      result += '%EF%BF%BD';
	      continue
	    }

	    result += encodeURIComponent(string[i]);
	  }

	  return result
	}

	encode.defaultChars = ";/?:@&=+$,-_.!~*'()#";
	encode.componentChars = "-_.!~*'()";

	function format (url) {
	  let result = '';

	  result += url.protocol || '';
	  result += url.slashes ? '//' : '';
	  result += url.auth ? url.auth + '@' : '';

	  if (url.hostname && url.hostname.indexOf(':') !== -1) {
	    // ipv6 address
	    result += '[' + url.hostname + ']';
	  } else {
	    result += url.hostname || '';
	  }

	  result += url.port ? ':' + url.port : '';
	  result += url.pathname || '';
	  result += url.search || '';
	  result += url.hash || '';

	  return result
	}

	// Copyright Joyent, Inc. and other Node contributors.
	//
	// Permission is hereby granted, free of charge, to any person obtaining a
	// copy of this software and associated documentation files (the
	// "Software"), to deal in the Software without restriction, including
	// without limitation the rights to use, copy, modify, merge, publish,
	// distribute, sublicense, and/or sell copies of the Software, and to permit
	// persons to whom the Software is furnished to do so, subject to the
	// following conditions:
	//
	// The above copyright notice and this permission notice shall be included
	// in all copies or substantial portions of the Software.
	//
	// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
	// OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
	// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
	// NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
	// DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
	// OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
	// USE OR OTHER DEALINGS IN THE SOFTWARE.

	//
	// Changes from joyent/node:
	//
	// 1. No leading slash in paths,
	//    e.g. in `url.parse('http://foo?bar')` pathname is ``, not `/`
	//
	// 2. Backslashes are not replaced with slashes,
	//    so `http:\\example.org\` is treated like a relative path
	//
	// 3. Trailing colon is treated like a part of the path,
	//    i.e. in `http://example.org:foo` pathname is `:foo`
	//
	// 4. Nothing is URL-encoded in the resulting object,
	//    (in joyent/node some chars in auth and paths are encoded)
	//
	// 5. `url.parse()` does not have `parseQueryString` argument
	//
	// 6. Removed extraneous result properties: `host`, `path`, `query`, etc.,
	//    which can be constructed using other parts of the url.
	//

	function Url () {
	  this.protocol = null;
	  this.slashes = null;
	  this.auth = null;
	  this.port = null;
	  this.hostname = null;
	  this.hash = null;
	  this.search = null;
	  this.pathname = null;
	}

	// Reference: RFC 3986, RFC 1808, RFC 2396

	// define these here so at least they only have to be
	// compiled once on the first module load.
	const protocolPattern = /^([a-z0-9.+-]+:)/i;
	const portPattern = /:[0-9]*$/;

	// Special case for a simple path URL
	/* eslint-disable-next-line no-useless-escape */
	const simplePathPattern = /^(\/\/?(?!\/)[^\?\s]*)(\?[^\s]*)?$/;

	// RFC 2396: characters reserved for delimiting URLs.
	// We actually just auto-escape these.
	const delims = ['<', '>', '"', '`', ' ', '\r', '\n', '\t'];

	// RFC 2396: characters not allowed for various reasons.
	const unwise = ['{', '}', '|', '\\', '^', '`'].concat(delims);

	// Allowed by RFCs, but cause of XSS attacks.  Always escape these.
	const autoEscape = ['\''].concat(unwise);
	// Characters that are never ever allowed in a hostname.
	// Note that any invalid chars are also handled, but these
	// are the ones that are *expected* to be seen, so we fast-path
	// them.
	const nonHostChars = ['%', '/', '?', ';', '#'].concat(autoEscape);
	const hostEndingChars = ['/', '?', '#'];
	const hostnameMaxLen = 255;
	const hostnamePartPattern = /^[+a-z0-9A-Z_-]{0,63}$/;
	const hostnamePartStart = /^([+a-z0-9A-Z_-]{0,63})(.*)$/;
	// protocols that can allow "unsafe" and "unwise" chars.
	// protocols that never have a hostname.
	const hostlessProtocol = {
	  javascript: true,
	  'javascript:': true
	};
	// protocols that always contain a // bit.
	const slashedProtocol = {
	  http: true,
	  https: true,
	  ftp: true,
	  gopher: true,
	  file: true,
	  'http:': true,
	  'https:': true,
	  'ftp:': true,
	  'gopher:': true,
	  'file:': true
	};

	function urlParse (url, slashesDenoteHost) {
	  if (url && url instanceof Url) return url

	  const u = new Url();
	  u.parse(url, slashesDenoteHost);
	  return u
	}

	Url.prototype.parse = function (url, slashesDenoteHost) {
	  let lowerProto, hec, slashes;
	  let rest = url;

	  // trim before proceeding.
	  // This is to support parse stuff like "  http://foo.com  \n"
	  rest = rest.trim();

	  if (!slashesDenoteHost && url.split('#').length === 1) {
	    // Try fast path regexp
	    const simplePath = simplePathPattern.exec(rest);
	    if (simplePath) {
	      this.pathname = simplePath[1];
	      if (simplePath[2]) {
	        this.search = simplePath[2];
	      }
	      return this
	    }
	  }

	  let proto = protocolPattern.exec(rest);
	  if (proto) {
	    proto = proto[0];
	    lowerProto = proto.toLowerCase();
	    this.protocol = proto;
	    rest = rest.substr(proto.length);
	  }

	  // figure out if it's got a host
	  // user@server is *always* interpreted as a hostname, and url
	  // resolution will treat //foo/bar as host=foo,path=bar because that's
	  // how the browser resolves relative URLs.
	  /* eslint-disable-next-line no-useless-escape */
	  if (slashesDenoteHost || proto || rest.match(/^\/\/[^@\/]+@[^@\/]+/)) {
	    slashes = rest.substr(0, 2) === '//';
	    if (slashes && !(proto && hostlessProtocol[proto])) {
	      rest = rest.substr(2);
	      this.slashes = true;
	    }
	  }

	  if (!hostlessProtocol[proto] &&
	      (slashes || (proto && !slashedProtocol[proto]))) {
	    // there's a hostname.
	    // the first instance of /, ?, ;, or # ends the host.
	    //
	    // If there is an @ in the hostname, then non-host chars *are* allowed
	    // to the left of the last @ sign, unless some host-ending character
	    // comes *before* the @-sign.
	    // URLs are obnoxious.
	    //
	    // ex:
	    // http://a@b@c/ => user:a@b host:c
	    // http://a@b?@c => user:a host:c path:/?@c

	    // v0.12 TODO(isaacs): This is not quite how Chrome does things.
	    // Review our test case against browsers more comprehensively.

	    // find the first instance of any hostEndingChars
	    let hostEnd = -1;
	    for (let i = 0; i < hostEndingChars.length; i++) {
	      hec = rest.indexOf(hostEndingChars[i]);
	      if (hec !== -1 && (hostEnd === -1 || hec < hostEnd)) {
	        hostEnd = hec;
	      }
	    }

	    // at this point, either we have an explicit point where the
	    // auth portion cannot go past, or the last @ char is the decider.
	    let auth, atSign;
	    if (hostEnd === -1) {
	      // atSign can be anywhere.
	      atSign = rest.lastIndexOf('@');
	    } else {
	      // atSign must be in auth portion.
	      // http://a@b/c@d => host:b auth:a path:/c@d
	      atSign = rest.lastIndexOf('@', hostEnd);
	    }

	    // Now we have a portion which is definitely the auth.
	    // Pull that off.
	    if (atSign !== -1) {
	      auth = rest.slice(0, atSign);
	      rest = rest.slice(atSign + 1);
	      this.auth = auth;
	    }

	    // the host is the remaining to the left of the first non-host char
	    hostEnd = -1;
	    for (let i = 0; i < nonHostChars.length; i++) {
	      hec = rest.indexOf(nonHostChars[i]);
	      if (hec !== -1 && (hostEnd === -1 || hec < hostEnd)) {
	        hostEnd = hec;
	      }
	    }
	    // if we still have not hit it, then the entire thing is a host.
	    if (hostEnd === -1) {
	      hostEnd = rest.length;
	    }

	    if (rest[hostEnd - 1] === ':') { hostEnd--; }
	    const host = rest.slice(0, hostEnd);
	    rest = rest.slice(hostEnd);

	    // pull out port.
	    this.parseHost(host);

	    // we've indicated that there is a hostname,
	    // so even if it's empty, it has to be present.
	    this.hostname = this.hostname || '';

	    // if hostname begins with [ and ends with ]
	    // assume that it's an IPv6 address.
	    const ipv6Hostname = this.hostname[0] === '[' &&
	        this.hostname[this.hostname.length - 1] === ']';

	    // validate a little.
	    if (!ipv6Hostname) {
	      const hostparts = this.hostname.split(/\./);
	      for (let i = 0, l = hostparts.length; i < l; i++) {
	        const part = hostparts[i];
	        if (!part) { continue }
	        if (!part.match(hostnamePartPattern)) {
	          let newpart = '';
	          for (let j = 0, k = part.length; j < k; j++) {
	            if (part.charCodeAt(j) > 127) {
	              // we replace non-ASCII char with a temporary placeholder
	              // we need this to make sure size of hostname is not
	              // broken by replacing non-ASCII by nothing
	              newpart += 'x';
	            } else {
	              newpart += part[j];
	            }
	          }
	          // we test again with ASCII char only
	          if (!newpart.match(hostnamePartPattern)) {
	            const validParts = hostparts.slice(0, i);
	            const notHost = hostparts.slice(i + 1);
	            const bit = part.match(hostnamePartStart);
	            if (bit) {
	              validParts.push(bit[1]);
	              notHost.unshift(bit[2]);
	            }
	            if (notHost.length) {
	              rest = notHost.join('.') + rest;
	            }
	            this.hostname = validParts.join('.');
	            break
	          }
	        }
	      }
	    }

	    if (this.hostname.length > hostnameMaxLen) {
	      this.hostname = '';
	    }

	    // strip [ and ] from the hostname
	    // the host field still retains them, though
	    if (ipv6Hostname) {
	      this.hostname = this.hostname.substr(1, this.hostname.length - 2);
	    }
	  }

	  // chop off from the tail first.
	  const hash = rest.indexOf('#');
	  if (hash !== -1) {
	    // got a fragment string.
	    this.hash = rest.substr(hash);
	    rest = rest.slice(0, hash);
	  }
	  const qm = rest.indexOf('?');
	  if (qm !== -1) {
	    this.search = rest.substr(qm);
	    rest = rest.slice(0, qm);
	  }
	  if (rest) { this.pathname = rest; }
	  if (slashedProtocol[lowerProto] &&
	      this.hostname && !this.pathname) {
	    this.pathname = '';
	  }

	  return this
	};

	Url.prototype.parseHost = function (host) {
	  let port = portPattern.exec(host);
	  if (port) {
	    port = port[0];
	    if (port !== ':') {
	      this.port = port.substr(1);
	    }
	    host = host.substr(0, host.length - port.length);
	  }
	  if (host) { this.hostname = host; }
	};

	index_cjs$8.decode = decode;
	index_cjs$8.encode = encode;
	index_cjs$8.format = format;
	index_cjs$8.parse = urlParse;
	return index_cjs$8;
}

var index_cjs$7 = {};

var hasRequiredIndex_cjs$7;

function requireIndex_cjs$7 () {
	if (hasRequiredIndex_cjs$7) return index_cjs$7;
	hasRequiredIndex_cjs$7 = 1;

	var regex$5 = /[\0-\uD7FF\uE000-\uFFFF]|[\uD800-\uDBFF][\uDC00-\uDFFF]|[\uD800-\uDBFF](?![\uDC00-\uDFFF])|(?:[^\uD800-\uDBFF]|^)[\uDC00-\uDFFF]/;

	var regex$4 = /[\0-\x1F\x7F-\x9F]/;

	var regex$3 = /[\xAD\u0600-\u0605\u061C\u06DD\u070F\u0890\u0891\u08E2\u180E\u200B-\u200F\u202A-\u202E\u2060-\u2064\u2066-\u206F\uFEFF\uFFF9-\uFFFB]|\uD804[\uDCBD\uDCCD]|\uD80D[\uDC30-\uDC3F]|\uD82F[\uDCA0-\uDCA3]|\uD834[\uDD73-\uDD7A]|\uDB40[\uDC01\uDC20-\uDC7F]/;

	var regex$2 = /[!-#%-\*,-\/:;\?@\[-\]_\{\}\xA1\xA7\xAB\xB6\xB7\xBB\xBF\u037E\u0387\u055A-\u055F\u0589\u058A\u05BE\u05C0\u05C3\u05C6\u05F3\u05F4\u0609\u060A\u060C\u060D\u061B\u061D-\u061F\u066A-\u066D\u06D4\u0700-\u070D\u07F7-\u07F9\u0830-\u083E\u085E\u0964\u0965\u0970\u09FD\u0A76\u0AF0\u0C77\u0C84\u0DF4\u0E4F\u0E5A\u0E5B\u0F04-\u0F12\u0F14\u0F3A-\u0F3D\u0F85\u0FD0-\u0FD4\u0FD9\u0FDA\u104A-\u104F\u10FB\u1360-\u1368\u1400\u166E\u169B\u169C\u16EB-\u16ED\u1735\u1736\u17D4-\u17D6\u17D8-\u17DA\u1800-\u180A\u1944\u1945\u1A1E\u1A1F\u1AA0-\u1AA6\u1AA8-\u1AAD\u1B5A-\u1B60\u1B7D\u1B7E\u1BFC-\u1BFF\u1C3B-\u1C3F\u1C7E\u1C7F\u1CC0-\u1CC7\u1CD3\u2010-\u2027\u2030-\u2043\u2045-\u2051\u2053-\u205E\u207D\u207E\u208D\u208E\u2308-\u230B\u2329\u232A\u2768-\u2775\u27C5\u27C6\u27E6-\u27EF\u2983-\u2998\u29D8-\u29DB\u29FC\u29FD\u2CF9-\u2CFC\u2CFE\u2CFF\u2D70\u2E00-\u2E2E\u2E30-\u2E4F\u2E52-\u2E5D\u3001-\u3003\u3008-\u3011\u3014-\u301F\u3030\u303D\u30A0\u30FB\uA4FE\uA4FF\uA60D-\uA60F\uA673\uA67E\uA6F2-\uA6F7\uA874-\uA877\uA8CE\uA8CF\uA8F8-\uA8FA\uA8FC\uA92E\uA92F\uA95F\uA9C1-\uA9CD\uA9DE\uA9DF\uAA5C-\uAA5F\uAADE\uAADF\uAAF0\uAAF1\uABEB\uFD3E\uFD3F\uFE10-\uFE19\uFE30-\uFE52\uFE54-\uFE61\uFE63\uFE68\uFE6A\uFE6B\uFF01-\uFF03\uFF05-\uFF0A\uFF0C-\uFF0F\uFF1A\uFF1B\uFF1F\uFF20\uFF3B-\uFF3D\uFF3F\uFF5B\uFF5D\uFF5F-\uFF65]|\uD800[\uDD00-\uDD02\uDF9F\uDFD0]|\uD801\uDD6F|\uD802[\uDC57\uDD1F\uDD3F\uDE50-\uDE58\uDE7F\uDEF0-\uDEF6\uDF39-\uDF3F\uDF99-\uDF9C]|\uD803[\uDEAD\uDF55-\uDF59\uDF86-\uDF89]|\uD804[\uDC47-\uDC4D\uDCBB\uDCBC\uDCBE-\uDCC1\uDD40-\uDD43\uDD74\uDD75\uDDC5-\uDDC8\uDDCD\uDDDB\uDDDD-\uDDDF\uDE38-\uDE3D\uDEA9]|\uD805[\uDC4B-\uDC4F\uDC5A\uDC5B\uDC5D\uDCC6\uDDC1-\uDDD7\uDE41-\uDE43\uDE60-\uDE6C\uDEB9\uDF3C-\uDF3E]|\uD806[\uDC3B\uDD44-\uDD46\uDDE2\uDE3F-\uDE46\uDE9A-\uDE9C\uDE9E-\uDEA2\uDF00-\uDF09]|\uD807[\uDC41-\uDC45\uDC70\uDC71\uDEF7\uDEF8\uDF43-\uDF4F\uDFFF]|\uD809[\uDC70-\uDC74]|\uD80B[\uDFF1\uDFF2]|\uD81A[\uDE6E\uDE6F\uDEF5\uDF37-\uDF3B\uDF44]|\uD81B[\uDE97-\uDE9A\uDFE2]|\uD82F\uDC9F|\uD836[\uDE87-\uDE8B]|\uD83A[\uDD5E\uDD5F]/;

	var regex$1 = /[\$\+<->\^`\|~\xA2-\xA6\xA8\xA9\xAC\xAE-\xB1\xB4\xB8\xD7\xF7\u02C2-\u02C5\u02D2-\u02DF\u02E5-\u02EB\u02ED\u02EF-\u02FF\u0375\u0384\u0385\u03F6\u0482\u058D-\u058F\u0606-\u0608\u060B\u060E\u060F\u06DE\u06E9\u06FD\u06FE\u07F6\u07FE\u07FF\u0888\u09F2\u09F3\u09FA\u09FB\u0AF1\u0B70\u0BF3-\u0BFA\u0C7F\u0D4F\u0D79\u0E3F\u0F01-\u0F03\u0F13\u0F15-\u0F17\u0F1A-\u0F1F\u0F34\u0F36\u0F38\u0FBE-\u0FC5\u0FC7-\u0FCC\u0FCE\u0FCF\u0FD5-\u0FD8\u109E\u109F\u1390-\u1399\u166D\u17DB\u1940\u19DE-\u19FF\u1B61-\u1B6A\u1B74-\u1B7C\u1FBD\u1FBF-\u1FC1\u1FCD-\u1FCF\u1FDD-\u1FDF\u1FED-\u1FEF\u1FFD\u1FFE\u2044\u2052\u207A-\u207C\u208A-\u208C\u20A0-\u20C0\u2100\u2101\u2103-\u2106\u2108\u2109\u2114\u2116-\u2118\u211E-\u2123\u2125\u2127\u2129\u212E\u213A\u213B\u2140-\u2144\u214A-\u214D\u214F\u218A\u218B\u2190-\u2307\u230C-\u2328\u232B-\u2426\u2440-\u244A\u249C-\u24E9\u2500-\u2767\u2794-\u27C4\u27C7-\u27E5\u27F0-\u2982\u2999-\u29D7\u29DC-\u29FB\u29FE-\u2B73\u2B76-\u2B95\u2B97-\u2BFF\u2CE5-\u2CEA\u2E50\u2E51\u2E80-\u2E99\u2E9B-\u2EF3\u2F00-\u2FD5\u2FF0-\u2FFF\u3004\u3012\u3013\u3020\u3036\u3037\u303E\u303F\u309B\u309C\u3190\u3191\u3196-\u319F\u31C0-\u31E3\u31EF\u3200-\u321E\u322A-\u3247\u3250\u3260-\u327F\u328A-\u32B0\u32C0-\u33FF\u4DC0-\u4DFF\uA490-\uA4C6\uA700-\uA716\uA720\uA721\uA789\uA78A\uA828-\uA82B\uA836-\uA839\uAA77-\uAA79\uAB5B\uAB6A\uAB6B\uFB29\uFBB2-\uFBC2\uFD40-\uFD4F\uFDCF\uFDFC-\uFDFF\uFE62\uFE64-\uFE66\uFE69\uFF04\uFF0B\uFF1C-\uFF1E\uFF3E\uFF40\uFF5C\uFF5E\uFFE0-\uFFE6\uFFE8-\uFFEE\uFFFC\uFFFD]|\uD800[\uDD37-\uDD3F\uDD79-\uDD89\uDD8C-\uDD8E\uDD90-\uDD9C\uDDA0\uDDD0-\uDDFC]|\uD802[\uDC77\uDC78\uDEC8]|\uD805\uDF3F|\uD807[\uDFD5-\uDFF1]|\uD81A[\uDF3C-\uDF3F\uDF45]|\uD82F\uDC9C|\uD833[\uDF50-\uDFC3]|\uD834[\uDC00-\uDCF5\uDD00-\uDD26\uDD29-\uDD64\uDD6A-\uDD6C\uDD83\uDD84\uDD8C-\uDDA9\uDDAE-\uDDEA\uDE00-\uDE41\uDE45\uDF00-\uDF56]|\uD835[\uDEC1\uDEDB\uDEFB\uDF15\uDF35\uDF4F\uDF6F\uDF89\uDFA9\uDFC3]|\uD836[\uDC00-\uDDFF\uDE37-\uDE3A\uDE6D-\uDE74\uDE76-\uDE83\uDE85\uDE86]|\uD838[\uDD4F\uDEFF]|\uD83B[\uDCAC\uDCB0\uDD2E\uDEF0\uDEF1]|\uD83C[\uDC00-\uDC2B\uDC30-\uDC93\uDCA0-\uDCAE\uDCB1-\uDCBF\uDCC1-\uDCCF\uDCD1-\uDCF5\uDD0D-\uDDAD\uDDE6-\uDE02\uDE10-\uDE3B\uDE40-\uDE48\uDE50\uDE51\uDE60-\uDE65\uDF00-\uDFFF]|\uD83D[\uDC00-\uDED7\uDEDC-\uDEEC\uDEF0-\uDEFC\uDF00-\uDF76\uDF7B-\uDFD9\uDFE0-\uDFEB\uDFF0]|\uD83E[\uDC00-\uDC0B\uDC10-\uDC47\uDC50-\uDC59\uDC60-\uDC87\uDC90-\uDCAD\uDCB0\uDCB1\uDD00-\uDE53\uDE60-\uDE6D\uDE70-\uDE7C\uDE80-\uDE88\uDE90-\uDEBD\uDEBF-\uDEC5\uDECE-\uDEDB\uDEE0-\uDEE8\uDEF0-\uDEF8\uDF00-\uDF92\uDF94-\uDFCA]/;

	var regex = /[ \xA0\u1680\u2000-\u200A\u2028\u2029\u202F\u205F\u3000]/;

	index_cjs$7.Any = regex$5;
	index_cjs$7.Cc = regex$4;
	index_cjs$7.Cf = regex$3;
	index_cjs$7.P = regex$2;
	index_cjs$7.S = regex$1;
	index_cjs$7.Z = regex;
	return index_cjs$7;
}

var lib = {};

var decode$1 = {};

var decodeDataHtml = {};

var hasRequiredDecodeDataHtml;

function requireDecodeDataHtml () {
	if (hasRequiredDecodeDataHtml) return decodeDataHtml;
	hasRequiredDecodeDataHtml = 1;
	// Generated using scripts/write-decode-map.ts
	Object.defineProperty(decodeDataHtml, "__esModule", { value: true });
	decodeDataHtml.default = new Uint16Array(
	// prettier-ignore
	"\u1d41<\xd5\u0131\u028a\u049d\u057b\u05d0\u0675\u06de\u07a2\u07d6\u080f\u0a4a\u0a91\u0da1\u0e6d\u0f09\u0f26\u10ca\u1228\u12e1\u1415\u149d\u14c3\u14df\u1525\0\0\0\0\0\0\u156b\u16cd\u198d\u1c12\u1ddd\u1f7e\u2060\u21b0\u228d\u23c0\u23fb\u2442\u2824\u2912\u2d08\u2e48\u2fce\u3016\u32ba\u3639\u37ac\u38fe\u3a28\u3a71\u3ae0\u3b2e\u0800EMabcfglmnoprstu\\bfms\x7f\x84\x8b\x90\x95\x98\xa6\xb3\xb9\xc8\xcflig\u803b\xc6\u40c6P\u803b&\u4026cute\u803b\xc1\u40c1reve;\u4102\u0100iyx}rc\u803b\xc2\u40c2;\u4410r;\uc000\ud835\udd04rave\u803b\xc0\u40c0pha;\u4391acr;\u4100d;\u6a53\u0100gp\x9d\xa1on;\u4104f;\uc000\ud835\udd38plyFunction;\u6061ing\u803b\xc5\u40c5\u0100cs\xbe\xc3r;\uc000\ud835\udc9cign;\u6254ilde\u803b\xc3\u40c3ml\u803b\xc4\u40c4\u0400aceforsu\xe5\xfb\xfe\u0117\u011c\u0122\u0127\u012a\u0100cr\xea\xf2kslash;\u6216\u0176\xf6\xf8;\u6ae7ed;\u6306y;\u4411\u0180crt\u0105\u010b\u0114ause;\u6235noullis;\u612ca;\u4392r;\uc000\ud835\udd05pf;\uc000\ud835\udd39eve;\u42d8c\xf2\u0113mpeq;\u624e\u0700HOacdefhilorsu\u014d\u0151\u0156\u0180\u019e\u01a2\u01b5\u01b7\u01ba\u01dc\u0215\u0273\u0278\u027ecy;\u4427PY\u803b\xa9\u40a9\u0180cpy\u015d\u0162\u017aute;\u4106\u0100;i\u0167\u0168\u62d2talDifferentialD;\u6145leys;\u612d\u0200aeio\u0189\u018e\u0194\u0198ron;\u410cdil\u803b\xc7\u40c7rc;\u4108nint;\u6230ot;\u410a\u0100dn\u01a7\u01adilla;\u40b8terDot;\u40b7\xf2\u017fi;\u43a7rcle\u0200DMPT\u01c7\u01cb\u01d1\u01d6ot;\u6299inus;\u6296lus;\u6295imes;\u6297o\u0100cs\u01e2\u01f8kwiseContourIntegral;\u6232eCurly\u0100DQ\u0203\u020foubleQuote;\u601duote;\u6019\u0200lnpu\u021e\u0228\u0247\u0255on\u0100;e\u0225\u0226\u6237;\u6a74\u0180git\u022f\u0236\u023aruent;\u6261nt;\u622fourIntegral;\u622e\u0100fr\u024c\u024e;\u6102oduct;\u6210nterClockwiseContourIntegral;\u6233oss;\u6a2fcr;\uc000\ud835\udc9ep\u0100;C\u0284\u0285\u62d3ap;\u624d\u0580DJSZacefios\u02a0\u02ac\u02b0\u02b4\u02b8\u02cb\u02d7\u02e1\u02e6\u0333\u048d\u0100;o\u0179\u02a5trahd;\u6911cy;\u4402cy;\u4405cy;\u440f\u0180grs\u02bf\u02c4\u02c7ger;\u6021r;\u61a1hv;\u6ae4\u0100ay\u02d0\u02d5ron;\u410e;\u4414l\u0100;t\u02dd\u02de\u6207a;\u4394r;\uc000\ud835\udd07\u0100af\u02eb\u0327\u0100cm\u02f0\u0322ritical\u0200ADGT\u0300\u0306\u0316\u031ccute;\u40b4o\u0174\u030b\u030d;\u42d9bleAcute;\u42ddrave;\u4060ilde;\u42dcond;\u62c4ferentialD;\u6146\u0470\u033d\0\0\0\u0342\u0354\0\u0405f;\uc000\ud835\udd3b\u0180;DE\u0348\u0349\u034d\u40a8ot;\u60dcqual;\u6250ble\u0300CDLRUV\u0363\u0372\u0382\u03cf\u03e2\u03f8ontourIntegra\xec\u0239o\u0274\u0379\0\0\u037b\xbb\u0349nArrow;\u61d3\u0100eo\u0387\u03a4ft\u0180ART\u0390\u0396\u03a1rrow;\u61d0ightArrow;\u61d4e\xe5\u02cang\u0100LR\u03ab\u03c4eft\u0100AR\u03b3\u03b9rrow;\u67f8ightArrow;\u67faightArrow;\u67f9ight\u0100AT\u03d8\u03derrow;\u61d2ee;\u62a8p\u0241\u03e9\0\0\u03efrrow;\u61d1ownArrow;\u61d5erticalBar;\u6225n\u0300ABLRTa\u0412\u042a\u0430\u045e\u047f\u037crrow\u0180;BU\u041d\u041e\u0422\u6193ar;\u6913pArrow;\u61f5reve;\u4311eft\u02d2\u043a\0\u0446\0\u0450ightVector;\u6950eeVector;\u695eector\u0100;B\u0459\u045a\u61bdar;\u6956ight\u01d4\u0467\0\u0471eeVector;\u695fector\u0100;B\u047a\u047b\u61c1ar;\u6957ee\u0100;A\u0486\u0487\u62a4rrow;\u61a7\u0100ct\u0492\u0497r;\uc000\ud835\udc9frok;\u4110\u0800NTacdfglmopqstux\u04bd\u04c0\u04c4\u04cb\u04de\u04e2\u04e7\u04ee\u04f5\u0521\u052f\u0536\u0552\u055d\u0560\u0565G;\u414aH\u803b\xd0\u40d0cute\u803b\xc9\u40c9\u0180aiy\u04d2\u04d7\u04dcron;\u411arc\u803b\xca\u40ca;\u442dot;\u4116r;\uc000\ud835\udd08rave\u803b\xc8\u40c8ement;\u6208\u0100ap\u04fa\u04fecr;\u4112ty\u0253\u0506\0\0\u0512mallSquare;\u65fberySmallSquare;\u65ab\u0100gp\u0526\u052aon;\u4118f;\uc000\ud835\udd3csilon;\u4395u\u0100ai\u053c\u0549l\u0100;T\u0542\u0543\u6a75ilde;\u6242librium;\u61cc\u0100ci\u0557\u055ar;\u6130m;\u6a73a;\u4397ml\u803b\xcb\u40cb\u0100ip\u056a\u056fsts;\u6203onentialE;\u6147\u0280cfios\u0585\u0588\u058d\u05b2\u05ccy;\u4424r;\uc000\ud835\udd09lled\u0253\u0597\0\0\u05a3mallSquare;\u65fcerySmallSquare;\u65aa\u0370\u05ba\0\u05bf\0\0\u05c4f;\uc000\ud835\udd3dAll;\u6200riertrf;\u6131c\xf2\u05cb\u0600JTabcdfgorst\u05e8\u05ec\u05ef\u05fa\u0600\u0612\u0616\u061b\u061d\u0623\u066c\u0672cy;\u4403\u803b>\u403emma\u0100;d\u05f7\u05f8\u4393;\u43dcreve;\u411e\u0180eiy\u0607\u060c\u0610dil;\u4122rc;\u411c;\u4413ot;\u4120r;\uc000\ud835\udd0a;\u62d9pf;\uc000\ud835\udd3eeater\u0300EFGLST\u0635\u0644\u064e\u0656\u065b\u0666qual\u0100;L\u063e\u063f\u6265ess;\u62dbullEqual;\u6267reater;\u6aa2ess;\u6277lantEqual;\u6a7eilde;\u6273cr;\uc000\ud835\udca2;\u626b\u0400Aacfiosu\u0685\u068b\u0696\u069b\u069e\u06aa\u06be\u06caRDcy;\u442a\u0100ct\u0690\u0694ek;\u42c7;\u405eirc;\u4124r;\u610clbertSpace;\u610b\u01f0\u06af\0\u06b2f;\u610dizontalLine;\u6500\u0100ct\u06c3\u06c5\xf2\u06a9rok;\u4126mp\u0144\u06d0\u06d8ownHum\xf0\u012fqual;\u624f\u0700EJOacdfgmnostu\u06fa\u06fe\u0703\u0707\u070e\u071a\u071e\u0721\u0728\u0744\u0778\u078b\u078f\u0795cy;\u4415lig;\u4132cy;\u4401cute\u803b\xcd\u40cd\u0100iy\u0713\u0718rc\u803b\xce\u40ce;\u4418ot;\u4130r;\u6111rave\u803b\xcc\u40cc\u0180;ap\u0720\u072f\u073f\u0100cg\u0734\u0737r;\u412ainaryI;\u6148lie\xf3\u03dd\u01f4\u0749\0\u0762\u0100;e\u074d\u074e\u622c\u0100gr\u0753\u0758ral;\u622bsection;\u62c2isible\u0100CT\u076c\u0772omma;\u6063imes;\u6062\u0180gpt\u077f\u0783\u0788on;\u412ef;\uc000\ud835\udd40a;\u4399cr;\u6110ilde;\u4128\u01eb\u079a\0\u079ecy;\u4406l\u803b\xcf\u40cf\u0280cfosu\u07ac\u07b7\u07bc\u07c2\u07d0\u0100iy\u07b1\u07b5rc;\u4134;\u4419r;\uc000\ud835\udd0dpf;\uc000\ud835\udd41\u01e3\u07c7\0\u07ccr;\uc000\ud835\udca5rcy;\u4408kcy;\u4404\u0380HJacfos\u07e4\u07e8\u07ec\u07f1\u07fd\u0802\u0808cy;\u4425cy;\u440cppa;\u439a\u0100ey\u07f6\u07fbdil;\u4136;\u441ar;\uc000\ud835\udd0epf;\uc000\ud835\udd42cr;\uc000\ud835\udca6\u0580JTaceflmost\u0825\u0829\u082c\u0850\u0863\u09b3\u09b8\u09c7\u09cd\u0a37\u0a47cy;\u4409\u803b<\u403c\u0280cmnpr\u0837\u083c\u0841\u0844\u084dute;\u4139bda;\u439bg;\u67ealacetrf;\u6112r;\u619e\u0180aey\u0857\u085c\u0861ron;\u413ddil;\u413b;\u441b\u0100fs\u0868\u0970t\u0500ACDFRTUVar\u087e\u08a9\u08b1\u08e0\u08e6\u08fc\u092f\u095b\u0390\u096a\u0100nr\u0883\u088fgleBracket;\u67e8row\u0180;BR\u0899\u089a\u089e\u6190ar;\u61e4ightArrow;\u61c6eiling;\u6308o\u01f5\u08b7\0\u08c3bleBracket;\u67e6n\u01d4\u08c8\0\u08d2eeVector;\u6961ector\u0100;B\u08db\u08dc\u61c3ar;\u6959loor;\u630aight\u0100AV\u08ef\u08f5rrow;\u6194ector;\u694e\u0100er\u0901\u0917e\u0180;AV\u0909\u090a\u0910\u62a3rrow;\u61a4ector;\u695aiangle\u0180;BE\u0924\u0925\u0929\u62b2ar;\u69cfqual;\u62b4p\u0180DTV\u0937\u0942\u094cownVector;\u6951eeVector;\u6960ector\u0100;B\u0956\u0957\u61bfar;\u6958ector\u0100;B\u0965\u0966\u61bcar;\u6952ight\xe1\u039cs\u0300EFGLST\u097e\u098b\u0995\u099d\u09a2\u09adqualGreater;\u62daullEqual;\u6266reater;\u6276ess;\u6aa1lantEqual;\u6a7dilde;\u6272r;\uc000\ud835\udd0f\u0100;e\u09bd\u09be\u62d8ftarrow;\u61daidot;\u413f\u0180npw\u09d4\u0a16\u0a1bg\u0200LRlr\u09de\u09f7\u0a02\u0a10eft\u0100AR\u09e6\u09ecrrow;\u67f5ightArrow;\u67f7ightArrow;\u67f6eft\u0100ar\u03b3\u0a0aight\xe1\u03bfight\xe1\u03caf;\uc000\ud835\udd43er\u0100LR\u0a22\u0a2ceftArrow;\u6199ightArrow;\u6198\u0180cht\u0a3e\u0a40\u0a42\xf2\u084c;\u61b0rok;\u4141;\u626a\u0400acefiosu\u0a5a\u0a5d\u0a60\u0a77\u0a7c\u0a85\u0a8b\u0a8ep;\u6905y;\u441c\u0100dl\u0a65\u0a6fiumSpace;\u605flintrf;\u6133r;\uc000\ud835\udd10nusPlus;\u6213pf;\uc000\ud835\udd44c\xf2\u0a76;\u439c\u0480Jacefostu\u0aa3\u0aa7\u0aad\u0ac0\u0b14\u0b19\u0d91\u0d97\u0d9ecy;\u440acute;\u4143\u0180aey\u0ab4\u0ab9\u0aberon;\u4147dil;\u4145;\u441d\u0180gsw\u0ac7\u0af0\u0b0eative\u0180MTV\u0ad3\u0adf\u0ae8ediumSpace;\u600bhi\u0100cn\u0ae6\u0ad8\xeb\u0ad9eryThi\xee\u0ad9ted\u0100GL\u0af8\u0b06reaterGreate\xf2\u0673essLes\xf3\u0a48Line;\u400ar;\uc000\ud835\udd11\u0200Bnpt\u0b22\u0b28\u0b37\u0b3areak;\u6060BreakingSpace;\u40a0f;\u6115\u0680;CDEGHLNPRSTV\u0b55\u0b56\u0b6a\u0b7c\u0ba1\u0beb\u0c04\u0c5e\u0c84\u0ca6\u0cd8\u0d61\u0d85\u6aec\u0100ou\u0b5b\u0b64ngruent;\u6262pCap;\u626doubleVerticalBar;\u6226\u0180lqx\u0b83\u0b8a\u0b9bement;\u6209ual\u0100;T\u0b92\u0b93\u6260ilde;\uc000\u2242\u0338ists;\u6204reater\u0380;EFGLST\u0bb6\u0bb7\u0bbd\u0bc9\u0bd3\u0bd8\u0be5\u626fqual;\u6271ullEqual;\uc000\u2267\u0338reater;\uc000\u226b\u0338ess;\u6279lantEqual;\uc000\u2a7e\u0338ilde;\u6275ump\u0144\u0bf2\u0bfdownHump;\uc000\u224e\u0338qual;\uc000\u224f\u0338e\u0100fs\u0c0a\u0c27tTriangle\u0180;BE\u0c1a\u0c1b\u0c21\u62eaar;\uc000\u29cf\u0338qual;\u62ecs\u0300;EGLST\u0c35\u0c36\u0c3c\u0c44\u0c4b\u0c58\u626equal;\u6270reater;\u6278ess;\uc000\u226a\u0338lantEqual;\uc000\u2a7d\u0338ilde;\u6274ested\u0100GL\u0c68\u0c79reaterGreater;\uc000\u2aa2\u0338essLess;\uc000\u2aa1\u0338recedes\u0180;ES\u0c92\u0c93\u0c9b\u6280qual;\uc000\u2aaf\u0338lantEqual;\u62e0\u0100ei\u0cab\u0cb9verseElement;\u620cghtTriangle\u0180;BE\u0ccb\u0ccc\u0cd2\u62ebar;\uc000\u29d0\u0338qual;\u62ed\u0100qu\u0cdd\u0d0cuareSu\u0100bp\u0ce8\u0cf9set\u0100;E\u0cf0\u0cf3\uc000\u228f\u0338qual;\u62e2erset\u0100;E\u0d03\u0d06\uc000\u2290\u0338qual;\u62e3\u0180bcp\u0d13\u0d24\u0d4eset\u0100;E\u0d1b\u0d1e\uc000\u2282\u20d2qual;\u6288ceeds\u0200;EST\u0d32\u0d33\u0d3b\u0d46\u6281qual;\uc000\u2ab0\u0338lantEqual;\u62e1ilde;\uc000\u227f\u0338erset\u0100;E\u0d58\u0d5b\uc000\u2283\u20d2qual;\u6289ilde\u0200;EFT\u0d6e\u0d6f\u0d75\u0d7f\u6241qual;\u6244ullEqual;\u6247ilde;\u6249erticalBar;\u6224cr;\uc000\ud835\udca9ilde\u803b\xd1\u40d1;\u439d\u0700Eacdfgmoprstuv\u0dbd\u0dc2\u0dc9\u0dd5\u0ddb\u0de0\u0de7\u0dfc\u0e02\u0e20\u0e22\u0e32\u0e3f\u0e44lig;\u4152cute\u803b\xd3\u40d3\u0100iy\u0dce\u0dd3rc\u803b\xd4\u40d4;\u441eblac;\u4150r;\uc000\ud835\udd12rave\u803b\xd2\u40d2\u0180aei\u0dee\u0df2\u0df6cr;\u414cga;\u43a9cron;\u439fpf;\uc000\ud835\udd46enCurly\u0100DQ\u0e0e\u0e1aoubleQuote;\u601cuote;\u6018;\u6a54\u0100cl\u0e27\u0e2cr;\uc000\ud835\udcaaash\u803b\xd8\u40d8i\u016c\u0e37\u0e3cde\u803b\xd5\u40d5es;\u6a37ml\u803b\xd6\u40d6er\u0100BP\u0e4b\u0e60\u0100ar\u0e50\u0e53r;\u603eac\u0100ek\u0e5a\u0e5c;\u63deet;\u63b4arenthesis;\u63dc\u0480acfhilors\u0e7f\u0e87\u0e8a\u0e8f\u0e92\u0e94\u0e9d\u0eb0\u0efcrtialD;\u6202y;\u441fr;\uc000\ud835\udd13i;\u43a6;\u43a0usMinus;\u40b1\u0100ip\u0ea2\u0eadncareplan\xe5\u069df;\u6119\u0200;eio\u0eb9\u0eba\u0ee0\u0ee4\u6abbcedes\u0200;EST\u0ec8\u0ec9\u0ecf\u0eda\u627aqual;\u6aaflantEqual;\u627cilde;\u627eme;\u6033\u0100dp\u0ee9\u0eeeuct;\u620fortion\u0100;a\u0225\u0ef9l;\u621d\u0100ci\u0f01\u0f06r;\uc000\ud835\udcab;\u43a8\u0200Ufos\u0f11\u0f16\u0f1b\u0f1fOT\u803b\"\u4022r;\uc000\ud835\udd14pf;\u611acr;\uc000\ud835\udcac\u0600BEacefhiorsu\u0f3e\u0f43\u0f47\u0f60\u0f73\u0fa7\u0faa\u0fad\u1096\u10a9\u10b4\u10bearr;\u6910G\u803b\xae\u40ae\u0180cnr\u0f4e\u0f53\u0f56ute;\u4154g;\u67ebr\u0100;t\u0f5c\u0f5d\u61a0l;\u6916\u0180aey\u0f67\u0f6c\u0f71ron;\u4158dil;\u4156;\u4420\u0100;v\u0f78\u0f79\u611cerse\u0100EU\u0f82\u0f99\u0100lq\u0f87\u0f8eement;\u620builibrium;\u61cbpEquilibrium;\u696fr\xbb\u0f79o;\u43a1ght\u0400ACDFTUVa\u0fc1\u0feb\u0ff3\u1022\u1028\u105b\u1087\u03d8\u0100nr\u0fc6\u0fd2gleBracket;\u67e9row\u0180;BL\u0fdc\u0fdd\u0fe1\u6192ar;\u61e5eftArrow;\u61c4eiling;\u6309o\u01f5\u0ff9\0\u1005bleBracket;\u67e7n\u01d4\u100a\0\u1014eeVector;\u695dector\u0100;B\u101d\u101e\u61c2ar;\u6955loor;\u630b\u0100er\u102d\u1043e\u0180;AV\u1035\u1036\u103c\u62a2rrow;\u61a6ector;\u695biangle\u0180;BE\u1050\u1051\u1055\u62b3ar;\u69d0qual;\u62b5p\u0180DTV\u1063\u106e\u1078ownVector;\u694feeVector;\u695cector\u0100;B\u1082\u1083\u61bear;\u6954ector\u0100;B\u1091\u1092\u61c0ar;\u6953\u0100pu\u109b\u109ef;\u611dndImplies;\u6970ightarrow;\u61db\u0100ch\u10b9\u10bcr;\u611b;\u61b1leDelayed;\u69f4\u0680HOacfhimoqstu\u10e4\u10f1\u10f7\u10fd\u1119\u111e\u1151\u1156\u1161\u1167\u11b5\u11bb\u11bf\u0100Cc\u10e9\u10eeHcy;\u4429y;\u4428FTcy;\u442ccute;\u415a\u0280;aeiy\u1108\u1109\u110e\u1113\u1117\u6abcron;\u4160dil;\u415erc;\u415c;\u4421r;\uc000\ud835\udd16ort\u0200DLRU\u112a\u1134\u113e\u1149ownArrow\xbb\u041eeftArrow\xbb\u089aightArrow\xbb\u0fddpArrow;\u6191gma;\u43a3allCircle;\u6218pf;\uc000\ud835\udd4a\u0272\u116d\0\0\u1170t;\u621aare\u0200;ISU\u117b\u117c\u1189\u11af\u65a1ntersection;\u6293u\u0100bp\u118f\u119eset\u0100;E\u1197\u1198\u628fqual;\u6291erset\u0100;E\u11a8\u11a9\u6290qual;\u6292nion;\u6294cr;\uc000\ud835\udcaear;\u62c6\u0200bcmp\u11c8\u11db\u1209\u120b\u0100;s\u11cd\u11ce\u62d0et\u0100;E\u11cd\u11d5qual;\u6286\u0100ch\u11e0\u1205eeds\u0200;EST\u11ed\u11ee\u11f4\u11ff\u627bqual;\u6ab0lantEqual;\u627dilde;\u627fTh\xe1\u0f8c;\u6211\u0180;es\u1212\u1213\u1223\u62d1rset\u0100;E\u121c\u121d\u6283qual;\u6287et\xbb\u1213\u0580HRSacfhiors\u123e\u1244\u1249\u1255\u125e\u1271\u1276\u129f\u12c2\u12c8\u12d1ORN\u803b\xde\u40deADE;\u6122\u0100Hc\u124e\u1252cy;\u440by;\u4426\u0100bu\u125a\u125c;\u4009;\u43a4\u0180aey\u1265\u126a\u126fron;\u4164dil;\u4162;\u4422r;\uc000\ud835\udd17\u0100ei\u127b\u1289\u01f2\u1280\0\u1287efore;\u6234a;\u4398\u0100cn\u128e\u1298kSpace;\uc000\u205f\u200aSpace;\u6009lde\u0200;EFT\u12ab\u12ac\u12b2\u12bc\u623cqual;\u6243ullEqual;\u6245ilde;\u6248pf;\uc000\ud835\udd4bipleDot;\u60db\u0100ct\u12d6\u12dbr;\uc000\ud835\udcafrok;\u4166\u0ae1\u12f7\u130e\u131a\u1326\0\u132c\u1331\0\0\0\0\0\u1338\u133d\u1377\u1385\0\u13ff\u1404\u140a\u1410\u0100cr\u12fb\u1301ute\u803b\xda\u40dar\u0100;o\u1307\u1308\u619fcir;\u6949r\u01e3\u1313\0\u1316y;\u440eve;\u416c\u0100iy\u131e\u1323rc\u803b\xdb\u40db;\u4423blac;\u4170r;\uc000\ud835\udd18rave\u803b\xd9\u40d9acr;\u416a\u0100di\u1341\u1369er\u0100BP\u1348\u135d\u0100ar\u134d\u1350r;\u405fac\u0100ek\u1357\u1359;\u63dfet;\u63b5arenthesis;\u63ddon\u0100;P\u1370\u1371\u62c3lus;\u628e\u0100gp\u137b\u137fon;\u4172f;\uc000\ud835\udd4c\u0400ADETadps\u1395\u13ae\u13b8\u13c4\u03e8\u13d2\u13d7\u13f3rrow\u0180;BD\u1150\u13a0\u13a4ar;\u6912ownArrow;\u61c5ownArrow;\u6195quilibrium;\u696eee\u0100;A\u13cb\u13cc\u62a5rrow;\u61a5own\xe1\u03f3er\u0100LR\u13de\u13e8eftArrow;\u6196ightArrow;\u6197i\u0100;l\u13f9\u13fa\u43d2on;\u43a5ing;\u416ecr;\uc000\ud835\udcb0ilde;\u4168ml\u803b\xdc\u40dc\u0480Dbcdefosv\u1427\u142c\u1430\u1433\u143e\u1485\u148a\u1490\u1496ash;\u62abar;\u6aeby;\u4412ash\u0100;l\u143b\u143c\u62a9;\u6ae6\u0100er\u1443\u1445;\u62c1\u0180bty\u144c\u1450\u147aar;\u6016\u0100;i\u144f\u1455cal\u0200BLST\u1461\u1465\u146a\u1474ar;\u6223ine;\u407ceparator;\u6758ilde;\u6240ThinSpace;\u600ar;\uc000\ud835\udd19pf;\uc000\ud835\udd4dcr;\uc000\ud835\udcb1dash;\u62aa\u0280cefos\u14a7\u14ac\u14b1\u14b6\u14bcirc;\u4174dge;\u62c0r;\uc000\ud835\udd1apf;\uc000\ud835\udd4ecr;\uc000\ud835\udcb2\u0200fios\u14cb\u14d0\u14d2\u14d8r;\uc000\ud835\udd1b;\u439epf;\uc000\ud835\udd4fcr;\uc000\ud835\udcb3\u0480AIUacfosu\u14f1\u14f5\u14f9\u14fd\u1504\u150f\u1514\u151a\u1520cy;\u442fcy;\u4407cy;\u442ecute\u803b\xdd\u40dd\u0100iy\u1509\u150drc;\u4176;\u442br;\uc000\ud835\udd1cpf;\uc000\ud835\udd50cr;\uc000\ud835\udcb4ml;\u4178\u0400Hacdefos\u1535\u1539\u153f\u154b\u154f\u155d\u1560\u1564cy;\u4416cute;\u4179\u0100ay\u1544\u1549ron;\u417d;\u4417ot;\u417b\u01f2\u1554\0\u155boWidt\xe8\u0ad9a;\u4396r;\u6128pf;\u6124cr;\uc000\ud835\udcb5\u0be1\u1583\u158a\u1590\0\u15b0\u15b6\u15bf\0\0\0\0\u15c6\u15db\u15eb\u165f\u166d\0\u1695\u169b\u16b2\u16b9\0\u16becute\u803b\xe1\u40e1reve;\u4103\u0300;Ediuy\u159c\u159d\u15a1\u15a3\u15a8\u15ad\u623e;\uc000\u223e\u0333;\u623frc\u803b\xe2\u40e2te\u80bb\xb4\u0306;\u4430lig\u803b\xe6\u40e6\u0100;r\xb2\u15ba;\uc000\ud835\udd1erave\u803b\xe0\u40e0\u0100ep\u15ca\u15d6\u0100fp\u15cf\u15d4sym;\u6135\xe8\u15d3ha;\u43b1\u0100ap\u15dfc\u0100cl\u15e4\u15e7r;\u4101g;\u6a3f\u0264\u15f0\0\0\u160a\u0280;adsv\u15fa\u15fb\u15ff\u1601\u1607\u6227nd;\u6a55;\u6a5clope;\u6a58;\u6a5a\u0380;elmrsz\u1618\u1619\u161b\u161e\u163f\u164f\u1659\u6220;\u69a4e\xbb\u1619sd\u0100;a\u1625\u1626\u6221\u0461\u1630\u1632\u1634\u1636\u1638\u163a\u163c\u163e;\u69a8;\u69a9;\u69aa;\u69ab;\u69ac;\u69ad;\u69ae;\u69aft\u0100;v\u1645\u1646\u621fb\u0100;d\u164c\u164d\u62be;\u699d\u0100pt\u1654\u1657h;\u6222\xbb\xb9arr;\u637c\u0100gp\u1663\u1667on;\u4105f;\uc000\ud835\udd52\u0380;Eaeiop\u12c1\u167b\u167d\u1682\u1684\u1687\u168a;\u6a70cir;\u6a6f;\u624ad;\u624bs;\u4027rox\u0100;e\u12c1\u1692\xf1\u1683ing\u803b\xe5\u40e5\u0180cty\u16a1\u16a6\u16a8r;\uc000\ud835\udcb6;\u402amp\u0100;e\u12c1\u16af\xf1\u0288ilde\u803b\xe3\u40e3ml\u803b\xe4\u40e4\u0100ci\u16c2\u16c8onin\xf4\u0272nt;\u6a11\u0800Nabcdefiklnoprsu\u16ed\u16f1\u1730\u173c\u1743\u1748\u1778\u177d\u17e0\u17e6\u1839\u1850\u170d\u193d\u1948\u1970ot;\u6aed\u0100cr\u16f6\u171ek\u0200ceps\u1700\u1705\u170d\u1713ong;\u624cpsilon;\u43f6rime;\u6035im\u0100;e\u171a\u171b\u623dq;\u62cd\u0176\u1722\u1726ee;\u62bded\u0100;g\u172c\u172d\u6305e\xbb\u172drk\u0100;t\u135c\u1737brk;\u63b6\u0100oy\u1701\u1741;\u4431quo;\u601e\u0280cmprt\u1753\u175b\u1761\u1764\u1768aus\u0100;e\u010a\u0109ptyv;\u69b0s\xe9\u170cno\xf5\u0113\u0180ahw\u176f\u1771\u1773;\u43b2;\u6136een;\u626cr;\uc000\ud835\udd1fg\u0380costuvw\u178d\u179d\u17b3\u17c1\u17d5\u17db\u17de\u0180aiu\u1794\u1796\u179a\xf0\u0760rc;\u65efp\xbb\u1371\u0180dpt\u17a4\u17a8\u17adot;\u6a00lus;\u6a01imes;\u6a02\u0271\u17b9\0\0\u17becup;\u6a06ar;\u6605riangle\u0100du\u17cd\u17d2own;\u65bdp;\u65b3plus;\u6a04e\xe5\u1444\xe5\u14adarow;\u690d\u0180ako\u17ed\u1826\u1835\u0100cn\u17f2\u1823k\u0180lst\u17fa\u05ab\u1802ozenge;\u69ebriangle\u0200;dlr\u1812\u1813\u1818\u181d\u65b4own;\u65beeft;\u65c2ight;\u65b8k;\u6423\u01b1\u182b\0\u1833\u01b2\u182f\0\u1831;\u6592;\u65914;\u6593ck;\u6588\u0100eo\u183e\u184d\u0100;q\u1843\u1846\uc000=\u20e5uiv;\uc000\u2261\u20e5t;\u6310\u0200ptwx\u1859\u185e\u1867\u186cf;\uc000\ud835\udd53\u0100;t\u13cb\u1863om\xbb\u13cctie;\u62c8\u0600DHUVbdhmptuv\u1885\u1896\u18aa\u18bb\u18d7\u18db\u18ec\u18ff\u1905\u190a\u1910\u1921\u0200LRlr\u188e\u1890\u1892\u1894;\u6557;\u6554;\u6556;\u6553\u0280;DUdu\u18a1\u18a2\u18a4\u18a6\u18a8\u6550;\u6566;\u6569;\u6564;\u6567\u0200LRlr\u18b3\u18b5\u18b7\u18b9;\u655d;\u655a;\u655c;\u6559\u0380;HLRhlr\u18ca\u18cb\u18cd\u18cf\u18d1\u18d3\u18d5\u6551;\u656c;\u6563;\u6560;\u656b;\u6562;\u655fox;\u69c9\u0200LRlr\u18e4\u18e6\u18e8\u18ea;\u6555;\u6552;\u6510;\u650c\u0280;DUdu\u06bd\u18f7\u18f9\u18fb\u18fd;\u6565;\u6568;\u652c;\u6534inus;\u629flus;\u629eimes;\u62a0\u0200LRlr\u1919\u191b\u191d\u191f;\u655b;\u6558;\u6518;\u6514\u0380;HLRhlr\u1930\u1931\u1933\u1935\u1937\u1939\u193b\u6502;\u656a;\u6561;\u655e;\u653c;\u6524;\u651c\u0100ev\u0123\u1942bar\u803b\xa6\u40a6\u0200ceio\u1951\u1956\u195a\u1960r;\uc000\ud835\udcb7mi;\u604fm\u0100;e\u171a\u171cl\u0180;bh\u1968\u1969\u196b\u405c;\u69c5sub;\u67c8\u016c\u1974\u197el\u0100;e\u1979\u197a\u6022t\xbb\u197ap\u0180;Ee\u012f\u1985\u1987;\u6aae\u0100;q\u06dc\u06db\u0ce1\u19a7\0\u19e8\u1a11\u1a15\u1a32\0\u1a37\u1a50\0\0\u1ab4\0\0\u1ac1\0\0\u1b21\u1b2e\u1b4d\u1b52\0\u1bfd\0\u1c0c\u0180cpr\u19ad\u19b2\u19ddute;\u4107\u0300;abcds\u19bf\u19c0\u19c4\u19ca\u19d5\u19d9\u6229nd;\u6a44rcup;\u6a49\u0100au\u19cf\u19d2p;\u6a4bp;\u6a47ot;\u6a40;\uc000\u2229\ufe00\u0100eo\u19e2\u19e5t;\u6041\xee\u0693\u0200aeiu\u19f0\u19fb\u1a01\u1a05\u01f0\u19f5\0\u19f8s;\u6a4don;\u410ddil\u803b\xe7\u40e7rc;\u4109ps\u0100;s\u1a0c\u1a0d\u6a4cm;\u6a50ot;\u410b\u0180dmn\u1a1b\u1a20\u1a26il\u80bb\xb8\u01adptyv;\u69b2t\u8100\xa2;e\u1a2d\u1a2e\u40a2r\xe4\u01b2r;\uc000\ud835\udd20\u0180cei\u1a3d\u1a40\u1a4dy;\u4447ck\u0100;m\u1a47\u1a48\u6713ark\xbb\u1a48;\u43c7r\u0380;Ecefms\u1a5f\u1a60\u1a62\u1a6b\u1aa4\u1aaa\u1aae\u65cb;\u69c3\u0180;el\u1a69\u1a6a\u1a6d\u42c6q;\u6257e\u0261\u1a74\0\0\u1a88rrow\u0100lr\u1a7c\u1a81eft;\u61baight;\u61bb\u0280RSacd\u1a92\u1a94\u1a96\u1a9a\u1a9f\xbb\u0f47;\u64c8st;\u629birc;\u629aash;\u629dnint;\u6a10id;\u6aefcir;\u69c2ubs\u0100;u\u1abb\u1abc\u6663it\xbb\u1abc\u02ec\u1ac7\u1ad4\u1afa\0\u1b0aon\u0100;e\u1acd\u1ace\u403a\u0100;q\xc7\xc6\u026d\u1ad9\0\0\u1ae2a\u0100;t\u1ade\u1adf\u402c;\u4040\u0180;fl\u1ae8\u1ae9\u1aeb\u6201\xee\u1160e\u0100mx\u1af1\u1af6ent\xbb\u1ae9e\xf3\u024d\u01e7\u1afe\0\u1b07\u0100;d\u12bb\u1b02ot;\u6a6dn\xf4\u0246\u0180fry\u1b10\u1b14\u1b17;\uc000\ud835\udd54o\xe4\u0254\u8100\xa9;s\u0155\u1b1dr;\u6117\u0100ao\u1b25\u1b29rr;\u61b5ss;\u6717\u0100cu\u1b32\u1b37r;\uc000\ud835\udcb8\u0100bp\u1b3c\u1b44\u0100;e\u1b41\u1b42\u6acf;\u6ad1\u0100;e\u1b49\u1b4a\u6ad0;\u6ad2dot;\u62ef\u0380delprvw\u1b60\u1b6c\u1b77\u1b82\u1bac\u1bd4\u1bf9arr\u0100lr\u1b68\u1b6a;\u6938;\u6935\u0270\u1b72\0\0\u1b75r;\u62dec;\u62dfarr\u0100;p\u1b7f\u1b80\u61b6;\u693d\u0300;bcdos\u1b8f\u1b90\u1b96\u1ba1\u1ba5\u1ba8\u622arcap;\u6a48\u0100au\u1b9b\u1b9ep;\u6a46p;\u6a4aot;\u628dr;\u6a45;\uc000\u222a\ufe00\u0200alrv\u1bb5\u1bbf\u1bde\u1be3rr\u0100;m\u1bbc\u1bbd\u61b7;\u693cy\u0180evw\u1bc7\u1bd4\u1bd8q\u0270\u1bce\0\0\u1bd2re\xe3\u1b73u\xe3\u1b75ee;\u62ceedge;\u62cfen\u803b\xa4\u40a4earrow\u0100lr\u1bee\u1bf3eft\xbb\u1b80ight\xbb\u1bbde\xe4\u1bdd\u0100ci\u1c01\u1c07onin\xf4\u01f7nt;\u6231lcty;\u632d\u0980AHabcdefhijlorstuwz\u1c38\u1c3b\u1c3f\u1c5d\u1c69\u1c75\u1c8a\u1c9e\u1cac\u1cb7\u1cfb\u1cff\u1d0d\u1d7b\u1d91\u1dab\u1dbb\u1dc6\u1dcdr\xf2\u0381ar;\u6965\u0200glrs\u1c48\u1c4d\u1c52\u1c54ger;\u6020eth;\u6138\xf2\u1133h\u0100;v\u1c5a\u1c5b\u6010\xbb\u090a\u016b\u1c61\u1c67arow;\u690fa\xe3\u0315\u0100ay\u1c6e\u1c73ron;\u410f;\u4434\u0180;ao\u0332\u1c7c\u1c84\u0100gr\u02bf\u1c81r;\u61catseq;\u6a77\u0180glm\u1c91\u1c94\u1c98\u803b\xb0\u40b0ta;\u43b4ptyv;\u69b1\u0100ir\u1ca3\u1ca8sht;\u697f;\uc000\ud835\udd21ar\u0100lr\u1cb3\u1cb5\xbb\u08dc\xbb\u101e\u0280aegsv\u1cc2\u0378\u1cd6\u1cdc\u1ce0m\u0180;os\u0326\u1cca\u1cd4nd\u0100;s\u0326\u1cd1uit;\u6666amma;\u43ddin;\u62f2\u0180;io\u1ce7\u1ce8\u1cf8\u40f7de\u8100\xf7;o\u1ce7\u1cf0ntimes;\u62c7n\xf8\u1cf7cy;\u4452c\u026f\u1d06\0\0\u1d0arn;\u631eop;\u630d\u0280lptuw\u1d18\u1d1d\u1d22\u1d49\u1d55lar;\u4024f;\uc000\ud835\udd55\u0280;emps\u030b\u1d2d\u1d37\u1d3d\u1d42q\u0100;d\u0352\u1d33ot;\u6251inus;\u6238lus;\u6214quare;\u62a1blebarwedg\xe5\xfan\u0180adh\u112e\u1d5d\u1d67ownarrow\xf3\u1c83arpoon\u0100lr\u1d72\u1d76ef\xf4\u1cb4igh\xf4\u1cb6\u0162\u1d7f\u1d85karo\xf7\u0f42\u026f\u1d8a\0\0\u1d8ern;\u631fop;\u630c\u0180cot\u1d98\u1da3\u1da6\u0100ry\u1d9d\u1da1;\uc000\ud835\udcb9;\u4455l;\u69f6rok;\u4111\u0100dr\u1db0\u1db4ot;\u62f1i\u0100;f\u1dba\u1816\u65bf\u0100ah\u1dc0\u1dc3r\xf2\u0429a\xf2\u0fa6angle;\u69a6\u0100ci\u1dd2\u1dd5y;\u445fgrarr;\u67ff\u0900Dacdefglmnopqrstux\u1e01\u1e09\u1e19\u1e38\u0578\u1e3c\u1e49\u1e61\u1e7e\u1ea5\u1eaf\u1ebd\u1ee1\u1f2a\u1f37\u1f44\u1f4e\u1f5a\u0100Do\u1e06\u1d34o\xf4\u1c89\u0100cs\u1e0e\u1e14ute\u803b\xe9\u40e9ter;\u6a6e\u0200aioy\u1e22\u1e27\u1e31\u1e36ron;\u411br\u0100;c\u1e2d\u1e2e\u6256\u803b\xea\u40ealon;\u6255;\u444dot;\u4117\u0100Dr\u1e41\u1e45ot;\u6252;\uc000\ud835\udd22\u0180;rs\u1e50\u1e51\u1e57\u6a9aave\u803b\xe8\u40e8\u0100;d\u1e5c\u1e5d\u6a96ot;\u6a98\u0200;ils\u1e6a\u1e6b\u1e72\u1e74\u6a99nters;\u63e7;\u6113\u0100;d\u1e79\u1e7a\u6a95ot;\u6a97\u0180aps\u1e85\u1e89\u1e97cr;\u4113ty\u0180;sv\u1e92\u1e93\u1e95\u6205et\xbb\u1e93p\u01001;\u1e9d\u1ea4\u0133\u1ea1\u1ea3;\u6004;\u6005\u6003\u0100gs\u1eaa\u1eac;\u414bp;\u6002\u0100gp\u1eb4\u1eb8on;\u4119f;\uc000\ud835\udd56\u0180als\u1ec4\u1ece\u1ed2r\u0100;s\u1eca\u1ecb\u62d5l;\u69e3us;\u6a71i\u0180;lv\u1eda\u1edb\u1edf\u43b5on\xbb\u1edb;\u43f5\u0200csuv\u1eea\u1ef3\u1f0b\u1f23\u0100io\u1eef\u1e31rc\xbb\u1e2e\u0269\u1ef9\0\0\u1efb\xed\u0548ant\u0100gl\u1f02\u1f06tr\xbb\u1e5dess\xbb\u1e7a\u0180aei\u1f12\u1f16\u1f1als;\u403dst;\u625fv\u0100;D\u0235\u1f20D;\u6a78parsl;\u69e5\u0100Da\u1f2f\u1f33ot;\u6253rr;\u6971\u0180cdi\u1f3e\u1f41\u1ef8r;\u612fo\xf4\u0352\u0100ah\u1f49\u1f4b;\u43b7\u803b\xf0\u40f0\u0100mr\u1f53\u1f57l\u803b\xeb\u40ebo;\u60ac\u0180cip\u1f61\u1f64\u1f67l;\u4021s\xf4\u056e\u0100eo\u1f6c\u1f74ctatio\xee\u0559nential\xe5\u0579\u09e1\u1f92\0\u1f9e\0\u1fa1\u1fa7\0\0\u1fc6\u1fcc\0\u1fd3\0\u1fe6\u1fea\u2000\0\u2008\u205allingdotse\xf1\u1e44y;\u4444male;\u6640\u0180ilr\u1fad\u1fb3\u1fc1lig;\u8000\ufb03\u0269\u1fb9\0\0\u1fbdg;\u8000\ufb00ig;\u8000\ufb04;\uc000\ud835\udd23lig;\u8000\ufb01lig;\uc000fj\u0180alt\u1fd9\u1fdc\u1fe1t;\u666dig;\u8000\ufb02ns;\u65b1of;\u4192\u01f0\u1fee\0\u1ff3f;\uc000\ud835\udd57\u0100ak\u05bf\u1ff7\u0100;v\u1ffc\u1ffd\u62d4;\u6ad9artint;\u6a0d\u0100ao\u200c\u2055\u0100cs\u2011\u2052\u03b1\u201a\u2030\u2038\u2045\u2048\0\u2050\u03b2\u2022\u2025\u2027\u202a\u202c\0\u202e\u803b\xbd\u40bd;\u6153\u803b\xbc\u40bc;\u6155;\u6159;\u615b\u01b3\u2034\0\u2036;\u6154;\u6156\u02b4\u203e\u2041\0\0\u2043\u803b\xbe\u40be;\u6157;\u615c5;\u6158\u01b6\u204c\0\u204e;\u615a;\u615d8;\u615el;\u6044wn;\u6322cr;\uc000\ud835\udcbb\u0880Eabcdefgijlnorstv\u2082\u2089\u209f\u20a5\u20b0\u20b4\u20f0\u20f5\u20fa\u20ff\u2103\u2112\u2138\u0317\u213e\u2152\u219e\u0100;l\u064d\u2087;\u6a8c\u0180cmp\u2090\u2095\u209dute;\u41f5ma\u0100;d\u209c\u1cda\u43b3;\u6a86reve;\u411f\u0100iy\u20aa\u20aerc;\u411d;\u4433ot;\u4121\u0200;lqs\u063e\u0642\u20bd\u20c9\u0180;qs\u063e\u064c\u20c4lan\xf4\u0665\u0200;cdl\u0665\u20d2\u20d5\u20e5c;\u6aa9ot\u0100;o\u20dc\u20dd\u6a80\u0100;l\u20e2\u20e3\u6a82;\u6a84\u0100;e\u20ea\u20ed\uc000\u22db\ufe00s;\u6a94r;\uc000\ud835\udd24\u0100;g\u0673\u061bmel;\u6137cy;\u4453\u0200;Eaj\u065a\u210c\u210e\u2110;\u6a92;\u6aa5;\u6aa4\u0200Eaes\u211b\u211d\u2129\u2134;\u6269p\u0100;p\u2123\u2124\u6a8arox\xbb\u2124\u0100;q\u212e\u212f\u6a88\u0100;q\u212e\u211bim;\u62e7pf;\uc000\ud835\udd58\u0100ci\u2143\u2146r;\u610am\u0180;el\u066b\u214e\u2150;\u6a8e;\u6a90\u8300>;cdlqr\u05ee\u2160\u216a\u216e\u2173\u2179\u0100ci\u2165\u2167;\u6aa7r;\u6a7aot;\u62d7Par;\u6995uest;\u6a7c\u0280adels\u2184\u216a\u2190\u0656\u219b\u01f0\u2189\0\u218epro\xf8\u209er;\u6978q\u0100lq\u063f\u2196les\xf3\u2088i\xed\u066b\u0100en\u21a3\u21adrtneqq;\uc000\u2269\ufe00\xc5\u21aa\u0500Aabcefkosy\u21c4\u21c7\u21f1\u21f5\u21fa\u2218\u221d\u222f\u2268\u227dr\xf2\u03a0\u0200ilmr\u21d0\u21d4\u21d7\u21dbrs\xf0\u1484f\xbb\u2024il\xf4\u06a9\u0100dr\u21e0\u21e4cy;\u444a\u0180;cw\u08f4\u21eb\u21efir;\u6948;\u61adar;\u610firc;\u4125\u0180alr\u2201\u220e\u2213rts\u0100;u\u2209\u220a\u6665it\xbb\u220alip;\u6026con;\u62b9r;\uc000\ud835\udd25s\u0100ew\u2223\u2229arow;\u6925arow;\u6926\u0280amopr\u223a\u223e\u2243\u225e\u2263rr;\u61fftht;\u623bk\u0100lr\u2249\u2253eftarrow;\u61a9ightarrow;\u61aaf;\uc000\ud835\udd59bar;\u6015\u0180clt\u226f\u2274\u2278r;\uc000\ud835\udcbdas\xe8\u21f4rok;\u4127\u0100bp\u2282\u2287ull;\u6043hen\xbb\u1c5b\u0ae1\u22a3\0\u22aa\0\u22b8\u22c5\u22ce\0\u22d5\u22f3\0\0\u22f8\u2322\u2367\u2362\u237f\0\u2386\u23aa\u23b4cute\u803b\xed\u40ed\u0180;iy\u0771\u22b0\u22b5rc\u803b\xee\u40ee;\u4438\u0100cx\u22bc\u22bfy;\u4435cl\u803b\xa1\u40a1\u0100fr\u039f\u22c9;\uc000\ud835\udd26rave\u803b\xec\u40ec\u0200;ino\u073e\u22dd\u22e9\u22ee\u0100in\u22e2\u22e6nt;\u6a0ct;\u622dfin;\u69dcta;\u6129lig;\u4133\u0180aop\u22fe\u231a\u231d\u0180cgt\u2305\u2308\u2317r;\u412b\u0180elp\u071f\u230f\u2313in\xe5\u078ear\xf4\u0720h;\u4131f;\u62b7ed;\u41b5\u0280;cfot\u04f4\u232c\u2331\u233d\u2341are;\u6105in\u0100;t\u2338\u2339\u621eie;\u69dddo\xf4\u2319\u0280;celp\u0757\u234c\u2350\u235b\u2361al;\u62ba\u0100gr\u2355\u2359er\xf3\u1563\xe3\u234darhk;\u6a17rod;\u6a3c\u0200cgpt\u236f\u2372\u2376\u237by;\u4451on;\u412ff;\uc000\ud835\udd5aa;\u43b9uest\u803b\xbf\u40bf\u0100ci\u238a\u238fr;\uc000\ud835\udcben\u0280;Edsv\u04f4\u239b\u239d\u23a1\u04f3;\u62f9ot;\u62f5\u0100;v\u23a6\u23a7\u62f4;\u62f3\u0100;i\u0777\u23aelde;\u4129\u01eb\u23b8\0\u23bccy;\u4456l\u803b\xef\u40ef\u0300cfmosu\u23cc\u23d7\u23dc\u23e1\u23e7\u23f5\u0100iy\u23d1\u23d5rc;\u4135;\u4439r;\uc000\ud835\udd27ath;\u4237pf;\uc000\ud835\udd5b\u01e3\u23ec\0\u23f1r;\uc000\ud835\udcbfrcy;\u4458kcy;\u4454\u0400acfghjos\u240b\u2416\u2422\u2427\u242d\u2431\u2435\u243bppa\u0100;v\u2413\u2414\u43ba;\u43f0\u0100ey\u241b\u2420dil;\u4137;\u443ar;\uc000\ud835\udd28reen;\u4138cy;\u4445cy;\u445cpf;\uc000\ud835\udd5ccr;\uc000\ud835\udcc0\u0b80ABEHabcdefghjlmnoprstuv\u2470\u2481\u2486\u248d\u2491\u250e\u253d\u255a\u2580\u264e\u265e\u2665\u2679\u267d\u269a\u26b2\u26d8\u275d\u2768\u278b\u27c0\u2801\u2812\u0180art\u2477\u247a\u247cr\xf2\u09c6\xf2\u0395ail;\u691barr;\u690e\u0100;g\u0994\u248b;\u6a8bar;\u6962\u0963\u24a5\0\u24aa\0\u24b1\0\0\0\0\0\u24b5\u24ba\0\u24c6\u24c8\u24cd\0\u24f9ute;\u413amptyv;\u69b4ra\xee\u084cbda;\u43bbg\u0180;dl\u088e\u24c1\u24c3;\u6991\xe5\u088e;\u6a85uo\u803b\xab\u40abr\u0400;bfhlpst\u0899\u24de\u24e6\u24e9\u24eb\u24ee\u24f1\u24f5\u0100;f\u089d\u24e3s;\u691fs;\u691d\xeb\u2252p;\u61abl;\u6939im;\u6973l;\u61a2\u0180;ae\u24ff\u2500\u2504\u6aabil;\u6919\u0100;s\u2509\u250a\u6aad;\uc000\u2aad\ufe00\u0180abr\u2515\u2519\u251drr;\u690crk;\u6772\u0100ak\u2522\u252cc\u0100ek\u2528\u252a;\u407b;\u405b\u0100es\u2531\u2533;\u698bl\u0100du\u2539\u253b;\u698f;\u698d\u0200aeuy\u2546\u254b\u2556\u2558ron;\u413e\u0100di\u2550\u2554il;\u413c\xec\u08b0\xe2\u2529;\u443b\u0200cqrs\u2563\u2566\u256d\u257da;\u6936uo\u0100;r\u0e19\u1746\u0100du\u2572\u2577har;\u6967shar;\u694bh;\u61b2\u0280;fgqs\u258b\u258c\u0989\u25f3\u25ff\u6264t\u0280ahlrt\u2598\u25a4\u25b7\u25c2\u25e8rrow\u0100;t\u0899\u25a1a\xe9\u24f6arpoon\u0100du\u25af\u25b4own\xbb\u045ap\xbb\u0966eftarrows;\u61c7ight\u0180ahs\u25cd\u25d6\u25derrow\u0100;s\u08f4\u08a7arpoon\xf3\u0f98quigarro\xf7\u21f0hreetimes;\u62cb\u0180;qs\u258b\u0993\u25falan\xf4\u09ac\u0280;cdgs\u09ac\u260a\u260d\u261d\u2628c;\u6aa8ot\u0100;o\u2614\u2615\u6a7f\u0100;r\u261a\u261b\u6a81;\u6a83\u0100;e\u2622\u2625\uc000\u22da\ufe00s;\u6a93\u0280adegs\u2633\u2639\u263d\u2649\u264bppro\xf8\u24c6ot;\u62d6q\u0100gq\u2643\u2645\xf4\u0989gt\xf2\u248c\xf4\u099bi\xed\u09b2\u0180ilr\u2655\u08e1\u265asht;\u697c;\uc000\ud835\udd29\u0100;E\u099c\u2663;\u6a91\u0161\u2669\u2676r\u0100du\u25b2\u266e\u0100;l\u0965\u2673;\u696alk;\u6584cy;\u4459\u0280;acht\u0a48\u2688\u268b\u2691\u2696r\xf2\u25c1orne\xf2\u1d08ard;\u696bri;\u65fa\u0100io\u269f\u26a4dot;\u4140ust\u0100;a\u26ac\u26ad\u63b0che\xbb\u26ad\u0200Eaes\u26bb\u26bd\u26c9\u26d4;\u6268p\u0100;p\u26c3\u26c4\u6a89rox\xbb\u26c4\u0100;q\u26ce\u26cf\u6a87\u0100;q\u26ce\u26bbim;\u62e6\u0400abnoptwz\u26e9\u26f4\u26f7\u271a\u272f\u2741\u2747\u2750\u0100nr\u26ee\u26f1g;\u67ecr;\u61fdr\xeb\u08c1g\u0180lmr\u26ff\u270d\u2714eft\u0100ar\u09e6\u2707ight\xe1\u09f2apsto;\u67fcight\xe1\u09fdparrow\u0100lr\u2725\u2729ef\xf4\u24edight;\u61ac\u0180afl\u2736\u2739\u273dr;\u6985;\uc000\ud835\udd5dus;\u6a2dimes;\u6a34\u0161\u274b\u274fst;\u6217\xe1\u134e\u0180;ef\u2757\u2758\u1800\u65cange\xbb\u2758ar\u0100;l\u2764\u2765\u4028t;\u6993\u0280achmt\u2773\u2776\u277c\u2785\u2787r\xf2\u08a8orne\xf2\u1d8car\u0100;d\u0f98\u2783;\u696d;\u600eri;\u62bf\u0300achiqt\u2798\u279d\u0a40\u27a2\u27ae\u27bbquo;\u6039r;\uc000\ud835\udcc1m\u0180;eg\u09b2\u27aa\u27ac;\u6a8d;\u6a8f\u0100bu\u252a\u27b3o\u0100;r\u0e1f\u27b9;\u601arok;\u4142\u8400<;cdhilqr\u082b\u27d2\u2639\u27dc\u27e0\u27e5\u27ea\u27f0\u0100ci\u27d7\u27d9;\u6aa6r;\u6a79re\xe5\u25f2mes;\u62c9arr;\u6976uest;\u6a7b\u0100Pi\u27f5\u27f9ar;\u6996\u0180;ef\u2800\u092d\u181b\u65c3r\u0100du\u2807\u280dshar;\u694ahar;\u6966\u0100en\u2817\u2821rtneqq;\uc000\u2268\ufe00\xc5\u281e\u0700Dacdefhilnopsu\u2840\u2845\u2882\u288e\u2893\u28a0\u28a5\u28a8\u28da\u28e2\u28e4\u0a83\u28f3\u2902Dot;\u623a\u0200clpr\u284e\u2852\u2863\u287dr\u803b\xaf\u40af\u0100et\u2857\u2859;\u6642\u0100;e\u285e\u285f\u6720se\xbb\u285f\u0100;s\u103b\u2868to\u0200;dlu\u103b\u2873\u2877\u287bow\xee\u048cef\xf4\u090f\xf0\u13d1ker;\u65ae\u0100oy\u2887\u288cmma;\u6a29;\u443cash;\u6014asuredangle\xbb\u1626r;\uc000\ud835\udd2ao;\u6127\u0180cdn\u28af\u28b4\u28c9ro\u803b\xb5\u40b5\u0200;acd\u1464\u28bd\u28c0\u28c4s\xf4\u16a7ir;\u6af0ot\u80bb\xb7\u01b5us\u0180;bd\u28d2\u1903\u28d3\u6212\u0100;u\u1d3c\u28d8;\u6a2a\u0163\u28de\u28e1p;\u6adb\xf2\u2212\xf0\u0a81\u0100dp\u28e9\u28eeels;\u62a7f;\uc000\ud835\udd5e\u0100ct\u28f8\u28fdr;\uc000\ud835\udcc2pos\xbb\u159d\u0180;lm\u2909\u290a\u290d\u43bctimap;\u62b8\u0c00GLRVabcdefghijlmoprstuvw\u2942\u2953\u297e\u2989\u2998\u29da\u29e9\u2a15\u2a1a\u2a58\u2a5d\u2a83\u2a95\u2aa4\u2aa8\u2b04\u2b07\u2b44\u2b7f\u2bae\u2c34\u2c67\u2c7c\u2ce9\u0100gt\u2947\u294b;\uc000\u22d9\u0338\u0100;v\u2950\u0bcf\uc000\u226b\u20d2\u0180elt\u295a\u2972\u2976ft\u0100ar\u2961\u2967rrow;\u61cdightarrow;\u61ce;\uc000\u22d8\u0338\u0100;v\u297b\u0c47\uc000\u226a\u20d2ightarrow;\u61cf\u0100Dd\u298e\u2993ash;\u62afash;\u62ae\u0280bcnpt\u29a3\u29a7\u29ac\u29b1\u29ccla\xbb\u02deute;\u4144g;\uc000\u2220\u20d2\u0280;Eiop\u0d84\u29bc\u29c0\u29c5\u29c8;\uc000\u2a70\u0338d;\uc000\u224b\u0338s;\u4149ro\xf8\u0d84ur\u0100;a\u29d3\u29d4\u666el\u0100;s\u29d3\u0b38\u01f3\u29df\0\u29e3p\u80bb\xa0\u0b37mp\u0100;e\u0bf9\u0c00\u0280aeouy\u29f4\u29fe\u2a03\u2a10\u2a13\u01f0\u29f9\0\u29fb;\u6a43on;\u4148dil;\u4146ng\u0100;d\u0d7e\u2a0aot;\uc000\u2a6d\u0338p;\u6a42;\u443dash;\u6013\u0380;Aadqsx\u0b92\u2a29\u2a2d\u2a3b\u2a41\u2a45\u2a50rr;\u61d7r\u0100hr\u2a33\u2a36k;\u6924\u0100;o\u13f2\u13f0ot;\uc000\u2250\u0338ui\xf6\u0b63\u0100ei\u2a4a\u2a4ear;\u6928\xed\u0b98ist\u0100;s\u0ba0\u0b9fr;\uc000\ud835\udd2b\u0200Eest\u0bc5\u2a66\u2a79\u2a7c\u0180;qs\u0bbc\u2a6d\u0be1\u0180;qs\u0bbc\u0bc5\u2a74lan\xf4\u0be2i\xed\u0bea\u0100;r\u0bb6\u2a81\xbb\u0bb7\u0180Aap\u2a8a\u2a8d\u2a91r\xf2\u2971rr;\u61aear;\u6af2\u0180;sv\u0f8d\u2a9c\u0f8c\u0100;d\u2aa1\u2aa2\u62fc;\u62facy;\u445a\u0380AEadest\u2ab7\u2aba\u2abe\u2ac2\u2ac5\u2af6\u2af9r\xf2\u2966;\uc000\u2266\u0338rr;\u619ar;\u6025\u0200;fqs\u0c3b\u2ace\u2ae3\u2aeft\u0100ar\u2ad4\u2ad9rro\xf7\u2ac1ightarro\xf7\u2a90\u0180;qs\u0c3b\u2aba\u2aealan\xf4\u0c55\u0100;s\u0c55\u2af4\xbb\u0c36i\xed\u0c5d\u0100;r\u0c35\u2afei\u0100;e\u0c1a\u0c25i\xe4\u0d90\u0100pt\u2b0c\u2b11f;\uc000\ud835\udd5f\u8180\xac;in\u2b19\u2b1a\u2b36\u40acn\u0200;Edv\u0b89\u2b24\u2b28\u2b2e;\uc000\u22f9\u0338ot;\uc000\u22f5\u0338\u01e1\u0b89\u2b33\u2b35;\u62f7;\u62f6i\u0100;v\u0cb8\u2b3c\u01e1\u0cb8\u2b41\u2b43;\u62fe;\u62fd\u0180aor\u2b4b\u2b63\u2b69r\u0200;ast\u0b7b\u2b55\u2b5a\u2b5flle\xec\u0b7bl;\uc000\u2afd\u20e5;\uc000\u2202\u0338lint;\u6a14\u0180;ce\u0c92\u2b70\u2b73u\xe5\u0ca5\u0100;c\u0c98\u2b78\u0100;e\u0c92\u2b7d\xf1\u0c98\u0200Aait\u2b88\u2b8b\u2b9d\u2ba7r\xf2\u2988rr\u0180;cw\u2b94\u2b95\u2b99\u619b;\uc000\u2933\u0338;\uc000\u219d\u0338ghtarrow\xbb\u2b95ri\u0100;e\u0ccb\u0cd6\u0380chimpqu\u2bbd\u2bcd\u2bd9\u2b04\u0b78\u2be4\u2bef\u0200;cer\u0d32\u2bc6\u0d37\u2bc9u\xe5\u0d45;\uc000\ud835\udcc3ort\u026d\u2b05\0\0\u2bd6ar\xe1\u2b56m\u0100;e\u0d6e\u2bdf\u0100;q\u0d74\u0d73su\u0100bp\u2beb\u2bed\xe5\u0cf8\xe5\u0d0b\u0180bcp\u2bf6\u2c11\u2c19\u0200;Ees\u2bff\u2c00\u0d22\u2c04\u6284;\uc000\u2ac5\u0338et\u0100;e\u0d1b\u2c0bq\u0100;q\u0d23\u2c00c\u0100;e\u0d32\u2c17\xf1\u0d38\u0200;Ees\u2c22\u2c23\u0d5f\u2c27\u6285;\uc000\u2ac6\u0338et\u0100;e\u0d58\u2c2eq\u0100;q\u0d60\u2c23\u0200gilr\u2c3d\u2c3f\u2c45\u2c47\xec\u0bd7lde\u803b\xf1\u40f1\xe7\u0c43iangle\u0100lr\u2c52\u2c5ceft\u0100;e\u0c1a\u2c5a\xf1\u0c26ight\u0100;e\u0ccb\u2c65\xf1\u0cd7\u0100;m\u2c6c\u2c6d\u43bd\u0180;es\u2c74\u2c75\u2c79\u4023ro;\u6116p;\u6007\u0480DHadgilrs\u2c8f\u2c94\u2c99\u2c9e\u2ca3\u2cb0\u2cb6\u2cd3\u2ce3ash;\u62adarr;\u6904p;\uc000\u224d\u20d2ash;\u62ac\u0100et\u2ca8\u2cac;\uc000\u2265\u20d2;\uc000>\u20d2nfin;\u69de\u0180Aet\u2cbd\u2cc1\u2cc5rr;\u6902;\uc000\u2264\u20d2\u0100;r\u2cca\u2ccd\uc000<\u20d2ie;\uc000\u22b4\u20d2\u0100At\u2cd8\u2cdcrr;\u6903rie;\uc000\u22b5\u20d2im;\uc000\u223c\u20d2\u0180Aan\u2cf0\u2cf4\u2d02rr;\u61d6r\u0100hr\u2cfa\u2cfdk;\u6923\u0100;o\u13e7\u13e5ear;\u6927\u1253\u1a95\0\0\0\0\0\0\0\0\0\0\0\0\0\u2d2d\0\u2d38\u2d48\u2d60\u2d65\u2d72\u2d84\u1b07\0\0\u2d8d\u2dab\0\u2dc8\u2dce\0\u2ddc\u2e19\u2e2b\u2e3e\u2e43\u0100cs\u2d31\u1a97ute\u803b\xf3\u40f3\u0100iy\u2d3c\u2d45r\u0100;c\u1a9e\u2d42\u803b\xf4\u40f4;\u443e\u0280abios\u1aa0\u2d52\u2d57\u01c8\u2d5alac;\u4151v;\u6a38old;\u69bclig;\u4153\u0100cr\u2d69\u2d6dir;\u69bf;\uc000\ud835\udd2c\u036f\u2d79\0\0\u2d7c\0\u2d82n;\u42dbave\u803b\xf2\u40f2;\u69c1\u0100bm\u2d88\u0df4ar;\u69b5\u0200acit\u2d95\u2d98\u2da5\u2da8r\xf2\u1a80\u0100ir\u2d9d\u2da0r;\u69beoss;\u69bbn\xe5\u0e52;\u69c0\u0180aei\u2db1\u2db5\u2db9cr;\u414dga;\u43c9\u0180cdn\u2dc0\u2dc5\u01cdron;\u43bf;\u69b6pf;\uc000\ud835\udd60\u0180ael\u2dd4\u2dd7\u01d2r;\u69b7rp;\u69b9\u0380;adiosv\u2dea\u2deb\u2dee\u2e08\u2e0d\u2e10\u2e16\u6228r\xf2\u1a86\u0200;efm\u2df7\u2df8\u2e02\u2e05\u6a5dr\u0100;o\u2dfe\u2dff\u6134f\xbb\u2dff\u803b\xaa\u40aa\u803b\xba\u40bagof;\u62b6r;\u6a56lope;\u6a57;\u6a5b\u0180clo\u2e1f\u2e21\u2e27\xf2\u2e01ash\u803b\xf8\u40f8l;\u6298i\u016c\u2e2f\u2e34de\u803b\xf5\u40f5es\u0100;a\u01db\u2e3as;\u6a36ml\u803b\xf6\u40f6bar;\u633d\u0ae1\u2e5e\0\u2e7d\0\u2e80\u2e9d\0\u2ea2\u2eb9\0\0\u2ecb\u0e9c\0\u2f13\0\0\u2f2b\u2fbc\0\u2fc8r\u0200;ast\u0403\u2e67\u2e72\u0e85\u8100\xb6;l\u2e6d\u2e6e\u40b6le\xec\u0403\u0269\u2e78\0\0\u2e7bm;\u6af3;\u6afdy;\u443fr\u0280cimpt\u2e8b\u2e8f\u2e93\u1865\u2e97nt;\u4025od;\u402eil;\u6030enk;\u6031r;\uc000\ud835\udd2d\u0180imo\u2ea8\u2eb0\u2eb4\u0100;v\u2ead\u2eae\u43c6;\u43d5ma\xf4\u0a76ne;\u660e\u0180;tv\u2ebf\u2ec0\u2ec8\u43c0chfork\xbb\u1ffd;\u43d6\u0100au\u2ecf\u2edfn\u0100ck\u2ed5\u2eddk\u0100;h\u21f4\u2edb;\u610e\xf6\u21f4s\u0480;abcdemst\u2ef3\u2ef4\u1908\u2ef9\u2efd\u2f04\u2f06\u2f0a\u2f0e\u402bcir;\u6a23ir;\u6a22\u0100ou\u1d40\u2f02;\u6a25;\u6a72n\u80bb\xb1\u0e9dim;\u6a26wo;\u6a27\u0180ipu\u2f19\u2f20\u2f25ntint;\u6a15f;\uc000\ud835\udd61nd\u803b\xa3\u40a3\u0500;Eaceinosu\u0ec8\u2f3f\u2f41\u2f44\u2f47\u2f81\u2f89\u2f92\u2f7e\u2fb6;\u6ab3p;\u6ab7u\xe5\u0ed9\u0100;c\u0ece\u2f4c\u0300;acens\u0ec8\u2f59\u2f5f\u2f66\u2f68\u2f7eppro\xf8\u2f43urlye\xf1\u0ed9\xf1\u0ece\u0180aes\u2f6f\u2f76\u2f7approx;\u6ab9qq;\u6ab5im;\u62e8i\xed\u0edfme\u0100;s\u2f88\u0eae\u6032\u0180Eas\u2f78\u2f90\u2f7a\xf0\u2f75\u0180dfp\u0eec\u2f99\u2faf\u0180als\u2fa0\u2fa5\u2faalar;\u632eine;\u6312urf;\u6313\u0100;t\u0efb\u2fb4\xef\u0efbrel;\u62b0\u0100ci\u2fc0\u2fc5r;\uc000\ud835\udcc5;\u43c8ncsp;\u6008\u0300fiopsu\u2fda\u22e2\u2fdf\u2fe5\u2feb\u2ff1r;\uc000\ud835\udd2epf;\uc000\ud835\udd62rime;\u6057cr;\uc000\ud835\udcc6\u0180aeo\u2ff8\u3009\u3013t\u0100ei\u2ffe\u3005rnion\xf3\u06b0nt;\u6a16st\u0100;e\u3010\u3011\u403f\xf1\u1f19\xf4\u0f14\u0a80ABHabcdefhilmnoprstux\u3040\u3051\u3055\u3059\u30e0\u310e\u312b\u3147\u3162\u3172\u318e\u3206\u3215\u3224\u3229\u3258\u326e\u3272\u3290\u32b0\u32b7\u0180art\u3047\u304a\u304cr\xf2\u10b3\xf2\u03ddail;\u691car\xf2\u1c65ar;\u6964\u0380cdenqrt\u3068\u3075\u3078\u307f\u308f\u3094\u30cc\u0100eu\u306d\u3071;\uc000\u223d\u0331te;\u4155i\xe3\u116emptyv;\u69b3g\u0200;del\u0fd1\u3089\u308b\u308d;\u6992;\u69a5\xe5\u0fd1uo\u803b\xbb\u40bbr\u0580;abcfhlpstw\u0fdc\u30ac\u30af\u30b7\u30b9\u30bc\u30be\u30c0\u30c3\u30c7\u30cap;\u6975\u0100;f\u0fe0\u30b4s;\u6920;\u6933s;\u691e\xeb\u225d\xf0\u272el;\u6945im;\u6974l;\u61a3;\u619d\u0100ai\u30d1\u30d5il;\u691ao\u0100;n\u30db\u30dc\u6236al\xf3\u0f1e\u0180abr\u30e7\u30ea\u30eer\xf2\u17e5rk;\u6773\u0100ak\u30f3\u30fdc\u0100ek\u30f9\u30fb;\u407d;\u405d\u0100es\u3102\u3104;\u698cl\u0100du\u310a\u310c;\u698e;\u6990\u0200aeuy\u3117\u311c\u3127\u3129ron;\u4159\u0100di\u3121\u3125il;\u4157\xec\u0ff2\xe2\u30fa;\u4440\u0200clqs\u3134\u3137\u313d\u3144a;\u6937dhar;\u6969uo\u0100;r\u020e\u020dh;\u61b3\u0180acg\u314e\u315f\u0f44l\u0200;ips\u0f78\u3158\u315b\u109cn\xe5\u10bbar\xf4\u0fa9t;\u65ad\u0180ilr\u3169\u1023\u316esht;\u697d;\uc000\ud835\udd2f\u0100ao\u3177\u3186r\u0100du\u317d\u317f\xbb\u047b\u0100;l\u1091\u3184;\u696c\u0100;v\u318b\u318c\u43c1;\u43f1\u0180gns\u3195\u31f9\u31fcht\u0300ahlrst\u31a4\u31b0\u31c2\u31d8\u31e4\u31eerrow\u0100;t\u0fdc\u31ada\xe9\u30c8arpoon\u0100du\u31bb\u31bfow\xee\u317ep\xbb\u1092eft\u0100ah\u31ca\u31d0rrow\xf3\u0feaarpoon\xf3\u0551ightarrows;\u61c9quigarro\xf7\u30cbhreetimes;\u62ccg;\u42daingdotse\xf1\u1f32\u0180ahm\u320d\u3210\u3213r\xf2\u0feaa\xf2\u0551;\u600foust\u0100;a\u321e\u321f\u63b1che\xbb\u321fmid;\u6aee\u0200abpt\u3232\u323d\u3240\u3252\u0100nr\u3237\u323ag;\u67edr;\u61fer\xeb\u1003\u0180afl\u3247\u324a\u324er;\u6986;\uc000\ud835\udd63us;\u6a2eimes;\u6a35\u0100ap\u325d\u3267r\u0100;g\u3263\u3264\u4029t;\u6994olint;\u6a12ar\xf2\u31e3\u0200achq\u327b\u3280\u10bc\u3285quo;\u603ar;\uc000\ud835\udcc7\u0100bu\u30fb\u328ao\u0100;r\u0214\u0213\u0180hir\u3297\u329b\u32a0re\xe5\u31f8mes;\u62cai\u0200;efl\u32aa\u1059\u1821\u32ab\u65b9tri;\u69celuhar;\u6968;\u611e\u0d61\u32d5\u32db\u32df\u332c\u3338\u3371\0\u337a\u33a4\0\0\u33ec\u33f0\0\u3428\u3448\u345a\u34ad\u34b1\u34ca\u34f1\0\u3616\0\0\u3633cute;\u415bqu\xef\u27ba\u0500;Eaceinpsy\u11ed\u32f3\u32f5\u32ff\u3302\u330b\u330f\u331f\u3326\u3329;\u6ab4\u01f0\u32fa\0\u32fc;\u6ab8on;\u4161u\xe5\u11fe\u0100;d\u11f3\u3307il;\u415frc;\u415d\u0180Eas\u3316\u3318\u331b;\u6ab6p;\u6abaim;\u62e9olint;\u6a13i\xed\u1204;\u4441ot\u0180;be\u3334\u1d47\u3335\u62c5;\u6a66\u0380Aacmstx\u3346\u334a\u3357\u335b\u335e\u3363\u336drr;\u61d8r\u0100hr\u3350\u3352\xeb\u2228\u0100;o\u0a36\u0a34t\u803b\xa7\u40a7i;\u403bwar;\u6929m\u0100in\u3369\xf0nu\xf3\xf1t;\u6736r\u0100;o\u3376\u2055\uc000\ud835\udd30\u0200acoy\u3382\u3386\u3391\u33a0rp;\u666f\u0100hy\u338b\u338fcy;\u4449;\u4448rt\u026d\u3399\0\0\u339ci\xe4\u1464ara\xec\u2e6f\u803b\xad\u40ad\u0100gm\u33a8\u33b4ma\u0180;fv\u33b1\u33b2\u33b2\u43c3;\u43c2\u0400;deglnpr\u12ab\u33c5\u33c9\u33ce\u33d6\u33de\u33e1\u33e6ot;\u6a6a\u0100;q\u12b1\u12b0\u0100;E\u33d3\u33d4\u6a9e;\u6aa0\u0100;E\u33db\u33dc\u6a9d;\u6a9fe;\u6246lus;\u6a24arr;\u6972ar\xf2\u113d\u0200aeit\u33f8\u3408\u340f\u3417\u0100ls\u33fd\u3404lsetm\xe9\u336ahp;\u6a33parsl;\u69e4\u0100dl\u1463\u3414e;\u6323\u0100;e\u341c\u341d\u6aaa\u0100;s\u3422\u3423\u6aac;\uc000\u2aac\ufe00\u0180flp\u342e\u3433\u3442tcy;\u444c\u0100;b\u3438\u3439\u402f\u0100;a\u343e\u343f\u69c4r;\u633ff;\uc000\ud835\udd64a\u0100dr\u344d\u0402es\u0100;u\u3454\u3455\u6660it\xbb\u3455\u0180csu\u3460\u3479\u349f\u0100au\u3465\u346fp\u0100;s\u1188\u346b;\uc000\u2293\ufe00p\u0100;s\u11b4\u3475;\uc000\u2294\ufe00u\u0100bp\u347f\u348f\u0180;es\u1197\u119c\u3486et\u0100;e\u1197\u348d\xf1\u119d\u0180;es\u11a8\u11ad\u3496et\u0100;e\u11a8\u349d\xf1\u11ae\u0180;af\u117b\u34a6\u05b0r\u0165\u34ab\u05b1\xbb\u117car\xf2\u1148\u0200cemt\u34b9\u34be\u34c2\u34c5r;\uc000\ud835\udcc8tm\xee\xf1i\xec\u3415ar\xe6\u11be\u0100ar\u34ce\u34d5r\u0100;f\u34d4\u17bf\u6606\u0100an\u34da\u34edight\u0100ep\u34e3\u34eapsilo\xee\u1ee0h\xe9\u2eafs\xbb\u2852\u0280bcmnp\u34fb\u355e\u1209\u358b\u358e\u0480;Edemnprs\u350e\u350f\u3511\u3515\u351e\u3523\u352c\u3531\u3536\u6282;\u6ac5ot;\u6abd\u0100;d\u11da\u351aot;\u6ac3ult;\u6ac1\u0100Ee\u3528\u352a;\u6acb;\u628alus;\u6abfarr;\u6979\u0180eiu\u353d\u3552\u3555t\u0180;en\u350e\u3545\u354bq\u0100;q\u11da\u350feq\u0100;q\u352b\u3528m;\u6ac7\u0100bp\u355a\u355c;\u6ad5;\u6ad3c\u0300;acens\u11ed\u356c\u3572\u3579\u357b\u3326ppro\xf8\u32faurlye\xf1\u11fe\xf1\u11f3\u0180aes\u3582\u3588\u331bppro\xf8\u331aq\xf1\u3317g;\u666a\u0680123;Edehlmnps\u35a9\u35ac\u35af\u121c\u35b2\u35b4\u35c0\u35c9\u35d5\u35da\u35df\u35e8\u35ed\u803b\xb9\u40b9\u803b\xb2\u40b2\u803b\xb3\u40b3;\u6ac6\u0100os\u35b9\u35bct;\u6abeub;\u6ad8\u0100;d\u1222\u35c5ot;\u6ac4s\u0100ou\u35cf\u35d2l;\u67c9b;\u6ad7arr;\u697bult;\u6ac2\u0100Ee\u35e4\u35e6;\u6acc;\u628blus;\u6ac0\u0180eiu\u35f4\u3609\u360ct\u0180;en\u121c\u35fc\u3602q\u0100;q\u1222\u35b2eq\u0100;q\u35e7\u35e4m;\u6ac8\u0100bp\u3611\u3613;\u6ad4;\u6ad6\u0180Aan\u361c\u3620\u362drr;\u61d9r\u0100hr\u3626\u3628\xeb\u222e\u0100;o\u0a2b\u0a29war;\u692alig\u803b\xdf\u40df\u0be1\u3651\u365d\u3660\u12ce\u3673\u3679\0\u367e\u36c2\0\0\0\0\0\u36db\u3703\0\u3709\u376c\0\0\0\u3787\u0272\u3656\0\0\u365bget;\u6316;\u43c4r\xeb\u0e5f\u0180aey\u3666\u366b\u3670ron;\u4165dil;\u4163;\u4442lrec;\u6315r;\uc000\ud835\udd31\u0200eiko\u3686\u369d\u36b5\u36bc\u01f2\u368b\0\u3691e\u01004f\u1284\u1281a\u0180;sv\u3698\u3699\u369b\u43b8ym;\u43d1\u0100cn\u36a2\u36b2k\u0100as\u36a8\u36aeppro\xf8\u12c1im\xbb\u12acs\xf0\u129e\u0100as\u36ba\u36ae\xf0\u12c1rn\u803b\xfe\u40fe\u01ec\u031f\u36c6\u22e7es\u8180\xd7;bd\u36cf\u36d0\u36d8\u40d7\u0100;a\u190f\u36d5r;\u6a31;\u6a30\u0180eps\u36e1\u36e3\u3700\xe1\u2a4d\u0200;bcf\u0486\u36ec\u36f0\u36f4ot;\u6336ir;\u6af1\u0100;o\u36f9\u36fc\uc000\ud835\udd65rk;\u6ada\xe1\u3362rime;\u6034\u0180aip\u370f\u3712\u3764d\xe5\u1248\u0380adempst\u3721\u374d\u3740\u3751\u3757\u375c\u375fngle\u0280;dlqr\u3730\u3731\u3736\u3740\u3742\u65b5own\xbb\u1dbbeft\u0100;e\u2800\u373e\xf1\u092e;\u625cight\u0100;e\u32aa\u374b\xf1\u105aot;\u65ecinus;\u6a3alus;\u6a39b;\u69cdime;\u6a3bezium;\u63e2\u0180cht\u3772\u377d\u3781\u0100ry\u3777\u377b;\uc000\ud835\udcc9;\u4446cy;\u445brok;\u4167\u0100io\u378b\u378ex\xf4\u1777head\u0100lr\u3797\u37a0eftarro\xf7\u084fightarrow\xbb\u0f5d\u0900AHabcdfghlmoprstuw\u37d0\u37d3\u37d7\u37e4\u37f0\u37fc\u380e\u381c\u3823\u3834\u3851\u385d\u386b\u38a9\u38cc\u38d2\u38ea\u38f6r\xf2\u03edar;\u6963\u0100cr\u37dc\u37e2ute\u803b\xfa\u40fa\xf2\u1150r\u01e3\u37ea\0\u37edy;\u445eve;\u416d\u0100iy\u37f5\u37farc\u803b\xfb\u40fb;\u4443\u0180abh\u3803\u3806\u380br\xf2\u13adlac;\u4171a\xf2\u13c3\u0100ir\u3813\u3818sht;\u697e;\uc000\ud835\udd32rave\u803b\xf9\u40f9\u0161\u3827\u3831r\u0100lr\u382c\u382e\xbb\u0957\xbb\u1083lk;\u6580\u0100ct\u3839\u384d\u026f\u383f\0\0\u384arn\u0100;e\u3845\u3846\u631cr\xbb\u3846op;\u630fri;\u65f8\u0100al\u3856\u385acr;\u416b\u80bb\xa8\u0349\u0100gp\u3862\u3866on;\u4173f;\uc000\ud835\udd66\u0300adhlsu\u114b\u3878\u387d\u1372\u3891\u38a0own\xe1\u13b3arpoon\u0100lr\u3888\u388cef\xf4\u382digh\xf4\u382fi\u0180;hl\u3899\u389a\u389c\u43c5\xbb\u13faon\xbb\u389aparrows;\u61c8\u0180cit\u38b0\u38c4\u38c8\u026f\u38b6\0\0\u38c1rn\u0100;e\u38bc\u38bd\u631dr\xbb\u38bdop;\u630eng;\u416fri;\u65f9cr;\uc000\ud835\udcca\u0180dir\u38d9\u38dd\u38e2ot;\u62f0lde;\u4169i\u0100;f\u3730\u38e8\xbb\u1813\u0100am\u38ef\u38f2r\xf2\u38a8l\u803b\xfc\u40fcangle;\u69a7\u0780ABDacdeflnoprsz\u391c\u391f\u3929\u392d\u39b5\u39b8\u39bd\u39df\u39e4\u39e8\u39f3\u39f9\u39fd\u3a01\u3a20r\xf2\u03f7ar\u0100;v\u3926\u3927\u6ae8;\u6ae9as\xe8\u03e1\u0100nr\u3932\u3937grt;\u699c\u0380eknprst\u34e3\u3946\u394b\u3952\u395d\u3964\u3996app\xe1\u2415othin\xe7\u1e96\u0180hir\u34eb\u2ec8\u3959op\xf4\u2fb5\u0100;h\u13b7\u3962\xef\u318d\u0100iu\u3969\u396dgm\xe1\u33b3\u0100bp\u3972\u3984setneq\u0100;q\u397d\u3980\uc000\u228a\ufe00;\uc000\u2acb\ufe00setneq\u0100;q\u398f\u3992\uc000\u228b\ufe00;\uc000\u2acc\ufe00\u0100hr\u399b\u399fet\xe1\u369ciangle\u0100lr\u39aa\u39afeft\xbb\u0925ight\xbb\u1051y;\u4432ash\xbb\u1036\u0180elr\u39c4\u39d2\u39d7\u0180;be\u2dea\u39cb\u39cfar;\u62bbq;\u625alip;\u62ee\u0100bt\u39dc\u1468a\xf2\u1469r;\uc000\ud835\udd33tr\xe9\u39aesu\u0100bp\u39ef\u39f1\xbb\u0d1c\xbb\u0d59pf;\uc000\ud835\udd67ro\xf0\u0efbtr\xe9\u39b4\u0100cu\u3a06\u3a0br;\uc000\ud835\udccb\u0100bp\u3a10\u3a18n\u0100Ee\u3980\u3a16\xbb\u397en\u0100Ee\u3992\u3a1e\xbb\u3990igzag;\u699a\u0380cefoprs\u3a36\u3a3b\u3a56\u3a5b\u3a54\u3a61\u3a6airc;\u4175\u0100di\u3a40\u3a51\u0100bg\u3a45\u3a49ar;\u6a5fe\u0100;q\u15fa\u3a4f;\u6259erp;\u6118r;\uc000\ud835\udd34pf;\uc000\ud835\udd68\u0100;e\u1479\u3a66at\xe8\u1479cr;\uc000\ud835\udccc\u0ae3\u178e\u3a87\0\u3a8b\0\u3a90\u3a9b\0\0\u3a9d\u3aa8\u3aab\u3aaf\0\0\u3ac3\u3ace\0\u3ad8\u17dc\u17dftr\xe9\u17d1r;\uc000\ud835\udd35\u0100Aa\u3a94\u3a97r\xf2\u03c3r\xf2\u09f6;\u43be\u0100Aa\u3aa1\u3aa4r\xf2\u03b8r\xf2\u09eba\xf0\u2713is;\u62fb\u0180dpt\u17a4\u3ab5\u3abe\u0100fl\u3aba\u17a9;\uc000\ud835\udd69im\xe5\u17b2\u0100Aa\u3ac7\u3acar\xf2\u03cer\xf2\u0a01\u0100cq\u3ad2\u17b8r;\uc000\ud835\udccd\u0100pt\u17d6\u3adcr\xe9\u17d4\u0400acefiosu\u3af0\u3afd\u3b08\u3b0c\u3b11\u3b15\u3b1b\u3b21c\u0100uy\u3af6\u3afbte\u803b\xfd\u40fd;\u444f\u0100iy\u3b02\u3b06rc;\u4177;\u444bn\u803b\xa5\u40a5r;\uc000\ud835\udd36cy;\u4457pf;\uc000\ud835\udd6acr;\uc000\ud835\udcce\u0100cm\u3b26\u3b29y;\u444el\u803b\xff\u40ff\u0500acdefhiosw\u3b42\u3b48\u3b54\u3b58\u3b64\u3b69\u3b6d\u3b74\u3b7a\u3b80cute;\u417a\u0100ay\u3b4d\u3b52ron;\u417e;\u4437ot;\u417c\u0100et\u3b5d\u3b61tr\xe6\u155fa;\u43b6r;\uc000\ud835\udd37cy;\u4436grarr;\u61ddpf;\uc000\ud835\udd6bcr;\uc000\ud835\udccf\u0100jn\u3b85\u3b87;\u600dj;\u600c"
	    .split("")
	    .map(function (c) { return c.charCodeAt(0); }));
	
	return decodeDataHtml;
}

var decodeDataXml = {};

var hasRequiredDecodeDataXml;

function requireDecodeDataXml () {
	if (hasRequiredDecodeDataXml) return decodeDataXml;
	hasRequiredDecodeDataXml = 1;
	// Generated using scripts/write-decode-map.ts
	Object.defineProperty(decodeDataXml, "__esModule", { value: true });
	decodeDataXml.default = new Uint16Array(
	// prettier-ignore
	"\u0200aglq\t\x15\x18\x1b\u026d\x0f\0\0\x12p;\u4026os;\u4027t;\u403et;\u403cuot;\u4022"
	    .split("")
	    .map(function (c) { return c.charCodeAt(0); }));
	
	return decodeDataXml;
}

var decode_codepoint = {};

var hasRequiredDecode_codepoint;

function requireDecode_codepoint () {
	if (hasRequiredDecode_codepoint) return decode_codepoint;
	hasRequiredDecode_codepoint = 1;
	(function (exports) {
		// Adapted from https://github.com/mathiasbynens/he/blob/36afe179392226cf1b6ccdb16ebbb7a5a844d93a/src/he.js#L106-L134
		var _a;
		Object.defineProperty(exports, "__esModule", { value: true });
		exports.replaceCodePoint = exports.fromCodePoint = void 0;
		var decodeMap = new Map([
		    [0, 65533],
		    // C1 Unicode control character reference replacements
		    [128, 8364],
		    [130, 8218],
		    [131, 402],
		    [132, 8222],
		    [133, 8230],
		    [134, 8224],
		    [135, 8225],
		    [136, 710],
		    [137, 8240],
		    [138, 352],
		    [139, 8249],
		    [140, 338],
		    [142, 381],
		    [145, 8216],
		    [146, 8217],
		    [147, 8220],
		    [148, 8221],
		    [149, 8226],
		    [150, 8211],
		    [151, 8212],
		    [152, 732],
		    [153, 8482],
		    [154, 353],
		    [155, 8250],
		    [156, 339],
		    [158, 382],
		    [159, 376],
		]);
		/**
		 * Polyfill for `String.fromCodePoint`. It is used to create a string from a Unicode code point.
		 */
		exports.fromCodePoint = 
		// eslint-disable-next-line @typescript-eslint/no-unnecessary-condition, node/no-unsupported-features/es-builtins
		(_a = String.fromCodePoint) !== null && _a !== void 0 ? _a : function (codePoint) {
		    var output = "";
		    if (codePoint > 0xffff) {
		        codePoint -= 0x10000;
		        output += String.fromCharCode(((codePoint >>> 10) & 0x3ff) | 0xd800);
		        codePoint = 0xdc00 | (codePoint & 0x3ff);
		    }
		    output += String.fromCharCode(codePoint);
		    return output;
		};
		/**
		 * Replace the given code point with a replacement character if it is a
		 * surrogate or is outside the valid range. Otherwise return the code
		 * point unchanged.
		 */
		function replaceCodePoint(codePoint) {
		    var _a;
		    if ((codePoint >= 0xd800 && codePoint <= 0xdfff) || codePoint > 0x10ffff) {
		        return 0xfffd;
		    }
		    return (_a = decodeMap.get(codePoint)) !== null && _a !== void 0 ? _a : codePoint;
		}
		exports.replaceCodePoint = replaceCodePoint;
		/**
		 * Replace the code point if relevant, then convert it to a string.
		 *
		 * @deprecated Use `fromCodePoint(replaceCodePoint(codePoint))` instead.
		 * @param codePoint The code point to decode.
		 * @returns The decoded code point.
		 */
		function decodeCodePoint(codePoint) {
		    return (0, exports.fromCodePoint)(replaceCodePoint(codePoint));
		}
		exports.default = decodeCodePoint;
		
	} (decode_codepoint));
	return decode_codepoint;
}

var hasRequiredDecode;

function requireDecode () {
	if (hasRequiredDecode) return decode$1;
	hasRequiredDecode = 1;
	(function (exports) {
		var __createBinding = (decode$1 && decode$1.__createBinding) || (Object.create ? (function(o, m, k, k2) {
		    if (k2 === undefined) k2 = k;
		    var desc = Object.getOwnPropertyDescriptor(m, k);
		    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
		      desc = { enumerable: true, get: function() { return m[k]; } };
		    }
		    Object.defineProperty(o, k2, desc);
		}) : (function(o, m, k, k2) {
		    if (k2 === undefined) k2 = k;
		    o[k2] = m[k];
		}));
		var __setModuleDefault = (decode$1 && decode$1.__setModuleDefault) || (Object.create ? (function(o, v) {
		    Object.defineProperty(o, "default", { enumerable: true, value: v });
		}) : function(o, v) {
		    o["default"] = v;
		});
		var __importStar = (decode$1 && decode$1.__importStar) || function (mod) {
		    if (mod && mod.__esModule) return mod;
		    var result = {};
		    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
		    __setModuleDefault(result, mod);
		    return result;
		};
		var __importDefault = (decode$1 && decode$1.__importDefault) || function (mod) {
		    return (mod && mod.__esModule) ? mod : { "default": mod };
		};
		Object.defineProperty(exports, "__esModule", { value: true });
		exports.decodeXML = exports.decodeHTMLStrict = exports.decodeHTMLAttribute = exports.decodeHTML = exports.determineBranch = exports.EntityDecoder = exports.DecodingMode = exports.BinTrieFlags = exports.fromCodePoint = exports.replaceCodePoint = exports.decodeCodePoint = exports.xmlDecodeTree = exports.htmlDecodeTree = void 0;
		var decode_data_html_js_1 = __importDefault(/*@__PURE__*/ requireDecodeDataHtml());
		exports.htmlDecodeTree = decode_data_html_js_1.default;
		var decode_data_xml_js_1 = __importDefault(/*@__PURE__*/ requireDecodeDataXml());
		exports.xmlDecodeTree = decode_data_xml_js_1.default;
		var decode_codepoint_js_1 = __importStar(/*@__PURE__*/ requireDecode_codepoint());
		exports.decodeCodePoint = decode_codepoint_js_1.default;
		var decode_codepoint_js_2 = /*@__PURE__*/ requireDecode_codepoint();
		Object.defineProperty(exports, "replaceCodePoint", { enumerable: true, get: function () { return decode_codepoint_js_2.replaceCodePoint; } });
		Object.defineProperty(exports, "fromCodePoint", { enumerable: true, get: function () { return decode_codepoint_js_2.fromCodePoint; } });
		var CharCodes;
		(function (CharCodes) {
		    CharCodes[CharCodes["NUM"] = 35] = "NUM";
		    CharCodes[CharCodes["SEMI"] = 59] = "SEMI";
		    CharCodes[CharCodes["EQUALS"] = 61] = "EQUALS";
		    CharCodes[CharCodes["ZERO"] = 48] = "ZERO";
		    CharCodes[CharCodes["NINE"] = 57] = "NINE";
		    CharCodes[CharCodes["LOWER_A"] = 97] = "LOWER_A";
		    CharCodes[CharCodes["LOWER_F"] = 102] = "LOWER_F";
		    CharCodes[CharCodes["LOWER_X"] = 120] = "LOWER_X";
		    CharCodes[CharCodes["LOWER_Z"] = 122] = "LOWER_Z";
		    CharCodes[CharCodes["UPPER_A"] = 65] = "UPPER_A";
		    CharCodes[CharCodes["UPPER_F"] = 70] = "UPPER_F";
		    CharCodes[CharCodes["UPPER_Z"] = 90] = "UPPER_Z";
		})(CharCodes || (CharCodes = {}));
		/** Bit that needs to be set to convert an upper case ASCII character to lower case */
		var TO_LOWER_BIT = 32;
		var BinTrieFlags;
		(function (BinTrieFlags) {
		    BinTrieFlags[BinTrieFlags["VALUE_LENGTH"] = 49152] = "VALUE_LENGTH";
		    BinTrieFlags[BinTrieFlags["BRANCH_LENGTH"] = 16256] = "BRANCH_LENGTH";
		    BinTrieFlags[BinTrieFlags["JUMP_TABLE"] = 127] = "JUMP_TABLE";
		})(BinTrieFlags = exports.BinTrieFlags || (exports.BinTrieFlags = {}));
		function isNumber(code) {
		    return code >= CharCodes.ZERO && code <= CharCodes.NINE;
		}
		function isHexadecimalCharacter(code) {
		    return ((code >= CharCodes.UPPER_A && code <= CharCodes.UPPER_F) ||
		        (code >= CharCodes.LOWER_A && code <= CharCodes.LOWER_F));
		}
		function isAsciiAlphaNumeric(code) {
		    return ((code >= CharCodes.UPPER_A && code <= CharCodes.UPPER_Z) ||
		        (code >= CharCodes.LOWER_A && code <= CharCodes.LOWER_Z) ||
		        isNumber(code));
		}
		/**
		 * Checks if the given character is a valid end character for an entity in an attribute.
		 *
		 * Attribute values that aren't terminated properly aren't parsed, and shouldn't lead to a parser error.
		 * See the example in https://html.spec.whatwg.org/multipage/parsing.html#named-character-reference-state
		 */
		function isEntityInAttributeInvalidEnd(code) {
		    return code === CharCodes.EQUALS || isAsciiAlphaNumeric(code);
		}
		var EntityDecoderState;
		(function (EntityDecoderState) {
		    EntityDecoderState[EntityDecoderState["EntityStart"] = 0] = "EntityStart";
		    EntityDecoderState[EntityDecoderState["NumericStart"] = 1] = "NumericStart";
		    EntityDecoderState[EntityDecoderState["NumericDecimal"] = 2] = "NumericDecimal";
		    EntityDecoderState[EntityDecoderState["NumericHex"] = 3] = "NumericHex";
		    EntityDecoderState[EntityDecoderState["NamedEntity"] = 4] = "NamedEntity";
		})(EntityDecoderState || (EntityDecoderState = {}));
		var DecodingMode;
		(function (DecodingMode) {
		    /** Entities in text nodes that can end with any character. */
		    DecodingMode[DecodingMode["Legacy"] = 0] = "Legacy";
		    /** Only allow entities terminated with a semicolon. */
		    DecodingMode[DecodingMode["Strict"] = 1] = "Strict";
		    /** Entities in attributes have limitations on ending characters. */
		    DecodingMode[DecodingMode["Attribute"] = 2] = "Attribute";
		})(DecodingMode = exports.DecodingMode || (exports.DecodingMode = {}));
		/**
		 * Token decoder with support of writing partial entities.
		 */
		var EntityDecoder = /** @class */ (function () {
		    function EntityDecoder(
		    /** The tree used to decode entities. */
		    decodeTree, 
		    /**
		     * The function that is called when a codepoint is decoded.
		     *
		     * For multi-byte named entities, this will be called multiple times,
		     * with the second codepoint, and the same `consumed` value.
		     *
		     * @param codepoint The decoded codepoint.
		     * @param consumed The number of bytes consumed by the decoder.
		     */
		    emitCodePoint, 
		    /** An object that is used to produce errors. */
		    errors) {
		        this.decodeTree = decodeTree;
		        this.emitCodePoint = emitCodePoint;
		        this.errors = errors;
		        /** The current state of the decoder. */
		        this.state = EntityDecoderState.EntityStart;
		        /** Characters that were consumed while parsing an entity. */
		        this.consumed = 1;
		        /**
		         * The result of the entity.
		         *
		         * Either the result index of a numeric entity, or the codepoint of a
		         * numeric entity.
		         */
		        this.result = 0;
		        /** The current index in the decode tree. */
		        this.treeIndex = 0;
		        /** The number of characters that were consumed in excess. */
		        this.excess = 1;
		        /** The mode in which the decoder is operating. */
		        this.decodeMode = DecodingMode.Strict;
		    }
		    /** Resets the instance to make it reusable. */
		    EntityDecoder.prototype.startEntity = function (decodeMode) {
		        this.decodeMode = decodeMode;
		        this.state = EntityDecoderState.EntityStart;
		        this.result = 0;
		        this.treeIndex = 0;
		        this.excess = 1;
		        this.consumed = 1;
		    };
		    /**
		     * Write an entity to the decoder. This can be called multiple times with partial entities.
		     * If the entity is incomplete, the decoder will return -1.
		     *
		     * Mirrors the implementation of `getDecoder`, but with the ability to stop decoding if the
		     * entity is incomplete, and resume when the next string is written.
		     *
		     * @param string The string containing the entity (or a continuation of the entity).
		     * @param offset The offset at which the entity begins. Should be 0 if this is not the first call.
		     * @returns The number of characters that were consumed, or -1 if the entity is incomplete.
		     */
		    EntityDecoder.prototype.write = function (str, offset) {
		        switch (this.state) {
		            case EntityDecoderState.EntityStart: {
		                if (str.charCodeAt(offset) === CharCodes.NUM) {
		                    this.state = EntityDecoderState.NumericStart;
		                    this.consumed += 1;
		                    return this.stateNumericStart(str, offset + 1);
		                }
		                this.state = EntityDecoderState.NamedEntity;
		                return this.stateNamedEntity(str, offset);
		            }
		            case EntityDecoderState.NumericStart: {
		                return this.stateNumericStart(str, offset);
		            }
		            case EntityDecoderState.NumericDecimal: {
		                return this.stateNumericDecimal(str, offset);
		            }
		            case EntityDecoderState.NumericHex: {
		                return this.stateNumericHex(str, offset);
		            }
		            case EntityDecoderState.NamedEntity: {
		                return this.stateNamedEntity(str, offset);
		            }
		        }
		    };
		    /**
		     * Switches between the numeric decimal and hexadecimal states.
		     *
		     * Equivalent to the `Numeric character reference state` in the HTML spec.
		     *
		     * @param str The string containing the entity (or a continuation of the entity).
		     * @param offset The current offset.
		     * @returns The number of characters that were consumed, or -1 if the entity is incomplete.
		     */
		    EntityDecoder.prototype.stateNumericStart = function (str, offset) {
		        if (offset >= str.length) {
		            return -1;
		        }
		        if ((str.charCodeAt(offset) | TO_LOWER_BIT) === CharCodes.LOWER_X) {
		            this.state = EntityDecoderState.NumericHex;
		            this.consumed += 1;
		            return this.stateNumericHex(str, offset + 1);
		        }
		        this.state = EntityDecoderState.NumericDecimal;
		        return this.stateNumericDecimal(str, offset);
		    };
		    EntityDecoder.prototype.addToNumericResult = function (str, start, end, base) {
		        if (start !== end) {
		            var digitCount = end - start;
		            this.result =
		                this.result * Math.pow(base, digitCount) +
		                    parseInt(str.substr(start, digitCount), base);
		            this.consumed += digitCount;
		        }
		    };
		    /**
		     * Parses a hexadecimal numeric entity.
		     *
		     * Equivalent to the `Hexademical character reference state` in the HTML spec.
		     *
		     * @param str The string containing the entity (or a continuation of the entity).
		     * @param offset The current offset.
		     * @returns The number of characters that were consumed, or -1 if the entity is incomplete.
		     */
		    EntityDecoder.prototype.stateNumericHex = function (str, offset) {
		        var startIdx = offset;
		        while (offset < str.length) {
		            var char = str.charCodeAt(offset);
		            if (isNumber(char) || isHexadecimalCharacter(char)) {
		                offset += 1;
		            }
		            else {
		                this.addToNumericResult(str, startIdx, offset, 16);
		                return this.emitNumericEntity(char, 3);
		            }
		        }
		        this.addToNumericResult(str, startIdx, offset, 16);
		        return -1;
		    };
		    /**
		     * Parses a decimal numeric entity.
		     *
		     * Equivalent to the `Decimal character reference state` in the HTML spec.
		     *
		     * @param str The string containing the entity (or a continuation of the entity).
		     * @param offset The current offset.
		     * @returns The number of characters that were consumed, or -1 if the entity is incomplete.
		     */
		    EntityDecoder.prototype.stateNumericDecimal = function (str, offset) {
		        var startIdx = offset;
		        while (offset < str.length) {
		            var char = str.charCodeAt(offset);
		            if (isNumber(char)) {
		                offset += 1;
		            }
		            else {
		                this.addToNumericResult(str, startIdx, offset, 10);
		                return this.emitNumericEntity(char, 2);
		            }
		        }
		        this.addToNumericResult(str, startIdx, offset, 10);
		        return -1;
		    };
		    /**
		     * Validate and emit a numeric entity.
		     *
		     * Implements the logic from the `Hexademical character reference start
		     * state` and `Numeric character reference end state` in the HTML spec.
		     *
		     * @param lastCp The last code point of the entity. Used to see if the
		     *               entity was terminated with a semicolon.
		     * @param expectedLength The minimum number of characters that should be
		     *                       consumed. Used to validate that at least one digit
		     *                       was consumed.
		     * @returns The number of characters that were consumed.
		     */
		    EntityDecoder.prototype.emitNumericEntity = function (lastCp, expectedLength) {
		        var _a;
		        // Ensure we consumed at least one digit.
		        if (this.consumed <= expectedLength) {
		            (_a = this.errors) === null || _a === void 0 ? void 0 : _a.absenceOfDigitsInNumericCharacterReference(this.consumed);
		            return 0;
		        }
		        // Figure out if this is a legit end of the entity
		        if (lastCp === CharCodes.SEMI) {
		            this.consumed += 1;
		        }
		        else if (this.decodeMode === DecodingMode.Strict) {
		            return 0;
		        }
		        this.emitCodePoint((0, decode_codepoint_js_1.replaceCodePoint)(this.result), this.consumed);
		        if (this.errors) {
		            if (lastCp !== CharCodes.SEMI) {
		                this.errors.missingSemicolonAfterCharacterReference();
		            }
		            this.errors.validateNumericCharacterReference(this.result);
		        }
		        return this.consumed;
		    };
		    /**
		     * Parses a named entity.
		     *
		     * Equivalent to the `Named character reference state` in the HTML spec.
		     *
		     * @param str The string containing the entity (or a continuation of the entity).
		     * @param offset The current offset.
		     * @returns The number of characters that were consumed, or -1 if the entity is incomplete.
		     */
		    EntityDecoder.prototype.stateNamedEntity = function (str, offset) {
		        var decodeTree = this.decodeTree;
		        var current = decodeTree[this.treeIndex];
		        // The mask is the number of bytes of the value, including the current byte.
		        var valueLength = (current & BinTrieFlags.VALUE_LENGTH) >> 14;
		        for (; offset < str.length; offset++, this.excess++) {
		            var char = str.charCodeAt(offset);
		            this.treeIndex = determineBranch(decodeTree, current, this.treeIndex + Math.max(1, valueLength), char);
		            if (this.treeIndex < 0) {
		                return this.result === 0 ||
		                    // If we are parsing an attribute
		                    (this.decodeMode === DecodingMode.Attribute &&
		                        // We shouldn't have consumed any characters after the entity,
		                        (valueLength === 0 ||
		                            // And there should be no invalid characters.
		                            isEntityInAttributeInvalidEnd(char)))
		                    ? 0
		                    : this.emitNotTerminatedNamedEntity();
		            }
		            current = decodeTree[this.treeIndex];
		            valueLength = (current & BinTrieFlags.VALUE_LENGTH) >> 14;
		            // If the branch is a value, store it and continue
		            if (valueLength !== 0) {
		                // If the entity is terminated by a semicolon, we are done.
		                if (char === CharCodes.SEMI) {
		                    return this.emitNamedEntityData(this.treeIndex, valueLength, this.consumed + this.excess);
		                }
		                // If we encounter a non-terminated (legacy) entity while parsing strictly, then ignore it.
		                if (this.decodeMode !== DecodingMode.Strict) {
		                    this.result = this.treeIndex;
		                    this.consumed += this.excess;
		                    this.excess = 0;
		                }
		            }
		        }
		        return -1;
		    };
		    /**
		     * Emit a named entity that was not terminated with a semicolon.
		     *
		     * @returns The number of characters consumed.
		     */
		    EntityDecoder.prototype.emitNotTerminatedNamedEntity = function () {
		        var _a;
		        var _b = this, result = _b.result, decodeTree = _b.decodeTree;
		        var valueLength = (decodeTree[result] & BinTrieFlags.VALUE_LENGTH) >> 14;
		        this.emitNamedEntityData(result, valueLength, this.consumed);
		        (_a = this.errors) === null || _a === void 0 ? void 0 : _a.missingSemicolonAfterCharacterReference();
		        return this.consumed;
		    };
		    /**
		     * Emit a named entity.
		     *
		     * @param result The index of the entity in the decode tree.
		     * @param valueLength The number of bytes in the entity.
		     * @param consumed The number of characters consumed.
		     *
		     * @returns The number of characters consumed.
		     */
		    EntityDecoder.prototype.emitNamedEntityData = function (result, valueLength, consumed) {
		        var decodeTree = this.decodeTree;
		        this.emitCodePoint(valueLength === 1
		            ? decodeTree[result] & ~BinTrieFlags.VALUE_LENGTH
		            : decodeTree[result + 1], consumed);
		        if (valueLength === 3) {
		            // For multi-byte values, we need to emit the second byte.
		            this.emitCodePoint(decodeTree[result + 2], consumed);
		        }
		        return consumed;
		    };
		    /**
		     * Signal to the parser that the end of the input was reached.
		     *
		     * Remaining data will be emitted and relevant errors will be produced.
		     *
		     * @returns The number of characters consumed.
		     */
		    EntityDecoder.prototype.end = function () {
		        var _a;
		        switch (this.state) {
		            case EntityDecoderState.NamedEntity: {
		                // Emit a named entity if we have one.
		                return this.result !== 0 &&
		                    (this.decodeMode !== DecodingMode.Attribute ||
		                        this.result === this.treeIndex)
		                    ? this.emitNotTerminatedNamedEntity()
		                    : 0;
		            }
		            // Otherwise, emit a numeric entity if we have one.
		            case EntityDecoderState.NumericDecimal: {
		                return this.emitNumericEntity(0, 2);
		            }
		            case EntityDecoderState.NumericHex: {
		                return this.emitNumericEntity(0, 3);
		            }
		            case EntityDecoderState.NumericStart: {
		                (_a = this.errors) === null || _a === void 0 ? void 0 : _a.absenceOfDigitsInNumericCharacterReference(this.consumed);
		                return 0;
		            }
		            case EntityDecoderState.EntityStart: {
		                // Return 0 if we have no entity.
		                return 0;
		            }
		        }
		    };
		    return EntityDecoder;
		}());
		exports.EntityDecoder = EntityDecoder;
		/**
		 * Creates a function that decodes entities in a string.
		 *
		 * @param decodeTree The decode tree.
		 * @returns A function that decodes entities in a string.
		 */
		function getDecoder(decodeTree) {
		    var ret = "";
		    var decoder = new EntityDecoder(decodeTree, function (str) { return (ret += (0, decode_codepoint_js_1.fromCodePoint)(str)); });
		    return function decodeWithTrie(str, decodeMode) {
		        var lastIndex = 0;
		        var offset = 0;
		        while ((offset = str.indexOf("&", offset)) >= 0) {
		            ret += str.slice(lastIndex, offset);
		            decoder.startEntity(decodeMode);
		            var len = decoder.write(str, 
		            // Skip the "&"
		            offset + 1);
		            if (len < 0) {
		                lastIndex = offset + decoder.end();
		                break;
		            }
		            lastIndex = offset + len;
		            // If `len` is 0, skip the current `&` and continue.
		            offset = len === 0 ? lastIndex + 1 : lastIndex;
		        }
		        var result = ret + str.slice(lastIndex);
		        // Make sure we don't keep a reference to the final string.
		        ret = "";
		        return result;
		    };
		}
		/**
		 * Determines the branch of the current node that is taken given the current
		 * character. This function is used to traverse the trie.
		 *
		 * @param decodeTree The trie.
		 * @param current The current node.
		 * @param nodeIdx The index right after the current node and its value.
		 * @param char The current character.
		 * @returns The index of the next node, or -1 if no branch is taken.
		 */
		function determineBranch(decodeTree, current, nodeIdx, char) {
		    var branchCount = (current & BinTrieFlags.BRANCH_LENGTH) >> 7;
		    var jumpOffset = current & BinTrieFlags.JUMP_TABLE;
		    // Case 1: Single branch encoded in jump offset
		    if (branchCount === 0) {
		        return jumpOffset !== 0 && char === jumpOffset ? nodeIdx : -1;
		    }
		    // Case 2: Multiple branches encoded in jump table
		    if (jumpOffset) {
		        var value = char - jumpOffset;
		        return value < 0 || value >= branchCount
		            ? -1
		            : decodeTree[nodeIdx + value] - 1;
		    }
		    // Case 3: Multiple branches encoded in dictionary
		    // Binary search for the character.
		    var lo = nodeIdx;
		    var hi = lo + branchCount - 1;
		    while (lo <= hi) {
		        var mid = (lo + hi) >>> 1;
		        var midVal = decodeTree[mid];
		        if (midVal < char) {
		            lo = mid + 1;
		        }
		        else if (midVal > char) {
		            hi = mid - 1;
		        }
		        else {
		            return decodeTree[mid + branchCount];
		        }
		    }
		    return -1;
		}
		exports.determineBranch = determineBranch;
		var htmlDecoder = getDecoder(decode_data_html_js_1.default);
		var xmlDecoder = getDecoder(decode_data_xml_js_1.default);
		/**
		 * Decodes an HTML string.
		 *
		 * @param str The string to decode.
		 * @param mode The decoding mode.
		 * @returns The decoded string.
		 */
		function decodeHTML(str, mode) {
		    if (mode === void 0) { mode = DecodingMode.Legacy; }
		    return htmlDecoder(str, mode);
		}
		exports.decodeHTML = decodeHTML;
		/**
		 * Decodes an HTML string in an attribute.
		 *
		 * @param str The string to decode.
		 * @returns The decoded string.
		 */
		function decodeHTMLAttribute(str) {
		    return htmlDecoder(str, DecodingMode.Attribute);
		}
		exports.decodeHTMLAttribute = decodeHTMLAttribute;
		/**
		 * Decodes an HTML string, requiring all entities to be terminated by a semicolon.
		 *
		 * @param str The string to decode.
		 * @returns The decoded string.
		 */
		function decodeHTMLStrict(str) {
		    return htmlDecoder(str, DecodingMode.Strict);
		}
		exports.decodeHTMLStrict = decodeHTMLStrict;
		/**
		 * Decodes an XML string, requiring all entities to be terminated by a semicolon.
		 *
		 * @param str The string to decode.
		 * @returns The decoded string.
		 */
		function decodeXML(str) {
		    return xmlDecoder(str, DecodingMode.Strict);
		}
		exports.decodeXML = decodeXML;
		
	} (decode$1));
	return decode$1;
}

var encode$1 = {};

var encodeHtml = {};

var hasRequiredEncodeHtml;

function requireEncodeHtml () {
	if (hasRequiredEncodeHtml) return encodeHtml;
	hasRequiredEncodeHtml = 1;
	// Generated using scripts/write-encode-map.ts
	Object.defineProperty(encodeHtml, "__esModule", { value: true });
	function restoreDiff(arr) {
	    for (var i = 1; i < arr.length; i++) {
	        arr[i][0] += arr[i - 1][0] + 1;
	    }
	    return arr;
	}
	// prettier-ignore
	encodeHtml.default = new Map(/* #__PURE__ */ restoreDiff([[9, "&Tab;"], [0, "&NewLine;"], [22, "&excl;"], [0, "&quot;"], [0, "&num;"], [0, "&dollar;"], [0, "&percnt;"], [0, "&amp;"], [0, "&apos;"], [0, "&lpar;"], [0, "&rpar;"], [0, "&ast;"], [0, "&plus;"], [0, "&comma;"], [1, "&period;"], [0, "&sol;"], [10, "&colon;"], [0, "&semi;"], [0, { v: "&lt;", n: 8402, o: "&nvlt;" }], [0, { v: "&equals;", n: 8421, o: "&bne;" }], [0, { v: "&gt;", n: 8402, o: "&nvgt;" }], [0, "&quest;"], [0, "&commat;"], [26, "&lbrack;"], [0, "&bsol;"], [0, "&rbrack;"], [0, "&Hat;"], [0, "&lowbar;"], [0, "&DiacriticalGrave;"], [5, { n: 106, o: "&fjlig;" }], [20, "&lbrace;"], [0, "&verbar;"], [0, "&rbrace;"], [34, "&nbsp;"], [0, "&iexcl;"], [0, "&cent;"], [0, "&pound;"], [0, "&curren;"], [0, "&yen;"], [0, "&brvbar;"], [0, "&sect;"], [0, "&die;"], [0, "&copy;"], [0, "&ordf;"], [0, "&laquo;"], [0, "&not;"], [0, "&shy;"], [0, "&circledR;"], [0, "&macr;"], [0, "&deg;"], [0, "&PlusMinus;"], [0, "&sup2;"], [0, "&sup3;"], [0, "&acute;"], [0, "&micro;"], [0, "&para;"], [0, "&centerdot;"], [0, "&cedil;"], [0, "&sup1;"], [0, "&ordm;"], [0, "&raquo;"], [0, "&frac14;"], [0, "&frac12;"], [0, "&frac34;"], [0, "&iquest;"], [0, "&Agrave;"], [0, "&Aacute;"], [0, "&Acirc;"], [0, "&Atilde;"], [0, "&Auml;"], [0, "&angst;"], [0, "&AElig;"], [0, "&Ccedil;"], [0, "&Egrave;"], [0, "&Eacute;"], [0, "&Ecirc;"], [0, "&Euml;"], [0, "&Igrave;"], [0, "&Iacute;"], [0, "&Icirc;"], [0, "&Iuml;"], [0, "&ETH;"], [0, "&Ntilde;"], [0, "&Ograve;"], [0, "&Oacute;"], [0, "&Ocirc;"], [0, "&Otilde;"], [0, "&Ouml;"], [0, "&times;"], [0, "&Oslash;"], [0, "&Ugrave;"], [0, "&Uacute;"], [0, "&Ucirc;"], [0, "&Uuml;"], [0, "&Yacute;"], [0, "&THORN;"], [0, "&szlig;"], [0, "&agrave;"], [0, "&aacute;"], [0, "&acirc;"], [0, "&atilde;"], [0, "&auml;"], [0, "&aring;"], [0, "&aelig;"], [0, "&ccedil;"], [0, "&egrave;"], [0, "&eacute;"], [0, "&ecirc;"], [0, "&euml;"], [0, "&igrave;"], [0, "&iacute;"], [0, "&icirc;"], [0, "&iuml;"], [0, "&eth;"], [0, "&ntilde;"], [0, "&ograve;"], [0, "&oacute;"], [0, "&ocirc;"], [0, "&otilde;"], [0, "&ouml;"], [0, "&div;"], [0, "&oslash;"], [0, "&ugrave;"], [0, "&uacute;"], [0, "&ucirc;"], [0, "&uuml;"], [0, "&yacute;"], [0, "&thorn;"], [0, "&yuml;"], [0, "&Amacr;"], [0, "&amacr;"], [0, "&Abreve;"], [0, "&abreve;"], [0, "&Aogon;"], [0, "&aogon;"], [0, "&Cacute;"], [0, "&cacute;"], [0, "&Ccirc;"], [0, "&ccirc;"], [0, "&Cdot;"], [0, "&cdot;"], [0, "&Ccaron;"], [0, "&ccaron;"], [0, "&Dcaron;"], [0, "&dcaron;"], [0, "&Dstrok;"], [0, "&dstrok;"], [0, "&Emacr;"], [0, "&emacr;"], [2, "&Edot;"], [0, "&edot;"], [0, "&Eogon;"], [0, "&eogon;"], [0, "&Ecaron;"], [0, "&ecaron;"], [0, "&Gcirc;"], [0, "&gcirc;"], [0, "&Gbreve;"], [0, "&gbreve;"], [0, "&Gdot;"], [0, "&gdot;"], [0, "&Gcedil;"], [1, "&Hcirc;"], [0, "&hcirc;"], [0, "&Hstrok;"], [0, "&hstrok;"], [0, "&Itilde;"], [0, "&itilde;"], [0, "&Imacr;"], [0, "&imacr;"], [2, "&Iogon;"], [0, "&iogon;"], [0, "&Idot;"], [0, "&imath;"], [0, "&IJlig;"], [0, "&ijlig;"], [0, "&Jcirc;"], [0, "&jcirc;"], [0, "&Kcedil;"], [0, "&kcedil;"], [0, "&kgreen;"], [0, "&Lacute;"], [0, "&lacute;"], [0, "&Lcedil;"], [0, "&lcedil;"], [0, "&Lcaron;"], [0, "&lcaron;"], [0, "&Lmidot;"], [0, "&lmidot;"], [0, "&Lstrok;"], [0, "&lstrok;"], [0, "&Nacute;"], [0, "&nacute;"], [0, "&Ncedil;"], [0, "&ncedil;"], [0, "&Ncaron;"], [0, "&ncaron;"], [0, "&napos;"], [0, "&ENG;"], [0, "&eng;"], [0, "&Omacr;"], [0, "&omacr;"], [2, "&Odblac;"], [0, "&odblac;"], [0, "&OElig;"], [0, "&oelig;"], [0, "&Racute;"], [0, "&racute;"], [0, "&Rcedil;"], [0, "&rcedil;"], [0, "&Rcaron;"], [0, "&rcaron;"], [0, "&Sacute;"], [0, "&sacute;"], [0, "&Scirc;"], [0, "&scirc;"], [0, "&Scedil;"], [0, "&scedil;"], [0, "&Scaron;"], [0, "&scaron;"], [0, "&Tcedil;"], [0, "&tcedil;"], [0, "&Tcaron;"], [0, "&tcaron;"], [0, "&Tstrok;"], [0, "&tstrok;"], [0, "&Utilde;"], [0, "&utilde;"], [0, "&Umacr;"], [0, "&umacr;"], [0, "&Ubreve;"], [0, "&ubreve;"], [0, "&Uring;"], [0, "&uring;"], [0, "&Udblac;"], [0, "&udblac;"], [0, "&Uogon;"], [0, "&uogon;"], [0, "&Wcirc;"], [0, "&wcirc;"], [0, "&Ycirc;"], [0, "&ycirc;"], [0, "&Yuml;"], [0, "&Zacute;"], [0, "&zacute;"], [0, "&Zdot;"], [0, "&zdot;"], [0, "&Zcaron;"], [0, "&zcaron;"], [19, "&fnof;"], [34, "&imped;"], [63, "&gacute;"], [65, "&jmath;"], [142, "&circ;"], [0, "&caron;"], [16, "&breve;"], [0, "&DiacriticalDot;"], [0, "&ring;"], [0, "&ogon;"], [0, "&DiacriticalTilde;"], [0, "&dblac;"], [51, "&DownBreve;"], [127, "&Alpha;"], [0, "&Beta;"], [0, "&Gamma;"], [0, "&Delta;"], [0, "&Epsilon;"], [0, "&Zeta;"], [0, "&Eta;"], [0, "&Theta;"], [0, "&Iota;"], [0, "&Kappa;"], [0, "&Lambda;"], [0, "&Mu;"], [0, "&Nu;"], [0, "&Xi;"], [0, "&Omicron;"], [0, "&Pi;"], [0, "&Rho;"], [1, "&Sigma;"], [0, "&Tau;"], [0, "&Upsilon;"], [0, "&Phi;"], [0, "&Chi;"], [0, "&Psi;"], [0, "&ohm;"], [7, "&alpha;"], [0, "&beta;"], [0, "&gamma;"], [0, "&delta;"], [0, "&epsi;"], [0, "&zeta;"], [0, "&eta;"], [0, "&theta;"], [0, "&iota;"], [0, "&kappa;"], [0, "&lambda;"], [0, "&mu;"], [0, "&nu;"], [0, "&xi;"], [0, "&omicron;"], [0, "&pi;"], [0, "&rho;"], [0, "&sigmaf;"], [0, "&sigma;"], [0, "&tau;"], [0, "&upsi;"], [0, "&phi;"], [0, "&chi;"], [0, "&psi;"], [0, "&omega;"], [7, "&thetasym;"], [0, "&Upsi;"], [2, "&phiv;"], [0, "&piv;"], [5, "&Gammad;"], [0, "&digamma;"], [18, "&kappav;"], [0, "&rhov;"], [3, "&epsiv;"], [0, "&backepsilon;"], [10, "&IOcy;"], [0, "&DJcy;"], [0, "&GJcy;"], [0, "&Jukcy;"], [0, "&DScy;"], [0, "&Iukcy;"], [0, "&YIcy;"], [0, "&Jsercy;"], [0, "&LJcy;"], [0, "&NJcy;"], [0, "&TSHcy;"], [0, "&KJcy;"], [1, "&Ubrcy;"], [0, "&DZcy;"], [0, "&Acy;"], [0, "&Bcy;"], [0, "&Vcy;"], [0, "&Gcy;"], [0, "&Dcy;"], [0, "&IEcy;"], [0, "&ZHcy;"], [0, "&Zcy;"], [0, "&Icy;"], [0, "&Jcy;"], [0, "&Kcy;"], [0, "&Lcy;"], [0, "&Mcy;"], [0, "&Ncy;"], [0, "&Ocy;"], [0, "&Pcy;"], [0, "&Rcy;"], [0, "&Scy;"], [0, "&Tcy;"], [0, "&Ucy;"], [0, "&Fcy;"], [0, "&KHcy;"], [0, "&TScy;"], [0, "&CHcy;"], [0, "&SHcy;"], [0, "&SHCHcy;"], [0, "&HARDcy;"], [0, "&Ycy;"], [0, "&SOFTcy;"], [0, "&Ecy;"], [0, "&YUcy;"], [0, "&YAcy;"], [0, "&acy;"], [0, "&bcy;"], [0, "&vcy;"], [0, "&gcy;"], [0, "&dcy;"], [0, "&iecy;"], [0, "&zhcy;"], [0, "&zcy;"], [0, "&icy;"], [0, "&jcy;"], [0, "&kcy;"], [0, "&lcy;"], [0, "&mcy;"], [0, "&ncy;"], [0, "&ocy;"], [0, "&pcy;"], [0, "&rcy;"], [0, "&scy;"], [0, "&tcy;"], [0, "&ucy;"], [0, "&fcy;"], [0, "&khcy;"], [0, "&tscy;"], [0, "&chcy;"], [0, "&shcy;"], [0, "&shchcy;"], [0, "&hardcy;"], [0, "&ycy;"], [0, "&softcy;"], [0, "&ecy;"], [0, "&yucy;"], [0, "&yacy;"], [1, "&iocy;"], [0, "&djcy;"], [0, "&gjcy;"], [0, "&jukcy;"], [0, "&dscy;"], [0, "&iukcy;"], [0, "&yicy;"], [0, "&jsercy;"], [0, "&ljcy;"], [0, "&njcy;"], [0, "&tshcy;"], [0, "&kjcy;"], [1, "&ubrcy;"], [0, "&dzcy;"], [7074, "&ensp;"], [0, "&emsp;"], [0, "&emsp13;"], [0, "&emsp14;"], [1, "&numsp;"], [0, "&puncsp;"], [0, "&ThinSpace;"], [0, "&hairsp;"], [0, "&NegativeMediumSpace;"], [0, "&zwnj;"], [0, "&zwj;"], [0, "&lrm;"], [0, "&rlm;"], [0, "&dash;"], [2, "&ndash;"], [0, "&mdash;"], [0, "&horbar;"], [0, "&Verbar;"], [1, "&lsquo;"], [0, "&CloseCurlyQuote;"], [0, "&lsquor;"], [1, "&ldquo;"], [0, "&CloseCurlyDoubleQuote;"], [0, "&bdquo;"], [1, "&dagger;"], [0, "&Dagger;"], [0, "&bull;"], [2, "&nldr;"], [0, "&hellip;"], [9, "&permil;"], [0, "&pertenk;"], [0, "&prime;"], [0, "&Prime;"], [0, "&tprime;"], [0, "&backprime;"], [3, "&lsaquo;"], [0, "&rsaquo;"], [3, "&oline;"], [2, "&caret;"], [1, "&hybull;"], [0, "&frasl;"], [10, "&bsemi;"], [7, "&qprime;"], [7, { v: "&MediumSpace;", n: 8202, o: "&ThickSpace;" }], [0, "&NoBreak;"], [0, "&af;"], [0, "&InvisibleTimes;"], [0, "&ic;"], [72, "&euro;"], [46, "&tdot;"], [0, "&DotDot;"], [37, "&complexes;"], [2, "&incare;"], [4, "&gscr;"], [0, "&hamilt;"], [0, "&Hfr;"], [0, "&Hopf;"], [0, "&planckh;"], [0, "&hbar;"], [0, "&imagline;"], [0, "&Ifr;"], [0, "&lagran;"], [0, "&ell;"], [1, "&naturals;"], [0, "&numero;"], [0, "&copysr;"], [0, "&weierp;"], [0, "&Popf;"], [0, "&Qopf;"], [0, "&realine;"], [0, "&real;"], [0, "&reals;"], [0, "&rx;"], [3, "&trade;"], [1, "&integers;"], [2, "&mho;"], [0, "&zeetrf;"], [0, "&iiota;"], [2, "&bernou;"], [0, "&Cayleys;"], [1, "&escr;"], [0, "&Escr;"], [0, "&Fouriertrf;"], [1, "&Mellintrf;"], [0, "&order;"], [0, "&alefsym;"], [0, "&beth;"], [0, "&gimel;"], [0, "&daleth;"], [12, "&CapitalDifferentialD;"], [0, "&dd;"], [0, "&ee;"], [0, "&ii;"], [10, "&frac13;"], [0, "&frac23;"], [0, "&frac15;"], [0, "&frac25;"], [0, "&frac35;"], [0, "&frac45;"], [0, "&frac16;"], [0, "&frac56;"], [0, "&frac18;"], [0, "&frac38;"], [0, "&frac58;"], [0, "&frac78;"], [49, "&larr;"], [0, "&ShortUpArrow;"], [0, "&rarr;"], [0, "&darr;"], [0, "&harr;"], [0, "&updownarrow;"], [0, "&nwarr;"], [0, "&nearr;"], [0, "&LowerRightArrow;"], [0, "&LowerLeftArrow;"], [0, "&nlarr;"], [0, "&nrarr;"], [1, { v: "&rarrw;", n: 824, o: "&nrarrw;" }], [0, "&Larr;"], [0, "&Uarr;"], [0, "&Rarr;"], [0, "&Darr;"], [0, "&larrtl;"], [0, "&rarrtl;"], [0, "&LeftTeeArrow;"], [0, "&mapstoup;"], [0, "&map;"], [0, "&DownTeeArrow;"], [1, "&hookleftarrow;"], [0, "&hookrightarrow;"], [0, "&larrlp;"], [0, "&looparrowright;"], [0, "&harrw;"], [0, "&nharr;"], [1, "&lsh;"], [0, "&rsh;"], [0, "&ldsh;"], [0, "&rdsh;"], [1, "&crarr;"], [0, "&cularr;"], [0, "&curarr;"], [2, "&circlearrowleft;"], [0, "&circlearrowright;"], [0, "&leftharpoonup;"], [0, "&DownLeftVector;"], [0, "&RightUpVector;"], [0, "&LeftUpVector;"], [0, "&rharu;"], [0, "&DownRightVector;"], [0, "&dharr;"], [0, "&dharl;"], [0, "&RightArrowLeftArrow;"], [0, "&udarr;"], [0, "&LeftArrowRightArrow;"], [0, "&leftleftarrows;"], [0, "&upuparrows;"], [0, "&rightrightarrows;"], [0, "&ddarr;"], [0, "&leftrightharpoons;"], [0, "&Equilibrium;"], [0, "&nlArr;"], [0, "&nhArr;"], [0, "&nrArr;"], [0, "&DoubleLeftArrow;"], [0, "&DoubleUpArrow;"], [0, "&DoubleRightArrow;"], [0, "&dArr;"], [0, "&DoubleLeftRightArrow;"], [0, "&DoubleUpDownArrow;"], [0, "&nwArr;"], [0, "&neArr;"], [0, "&seArr;"], [0, "&swArr;"], [0, "&lAarr;"], [0, "&rAarr;"], [1, "&zigrarr;"], [6, "&larrb;"], [0, "&rarrb;"], [15, "&DownArrowUpArrow;"], [7, "&loarr;"], [0, "&roarr;"], [0, "&hoarr;"], [0, "&forall;"], [0, "&comp;"], [0, { v: "&part;", n: 824, o: "&npart;" }], [0, "&exist;"], [0, "&nexist;"], [0, "&empty;"], [1, "&Del;"], [0, "&Element;"], [0, "&NotElement;"], [1, "&ni;"], [0, "&notni;"], [2, "&prod;"], [0, "&coprod;"], [0, "&sum;"], [0, "&minus;"], [0, "&MinusPlus;"], [0, "&dotplus;"], [1, "&Backslash;"], [0, "&lowast;"], [0, "&compfn;"], [1, "&radic;"], [2, "&prop;"], [0, "&infin;"], [0, "&angrt;"], [0, { v: "&ang;", n: 8402, o: "&nang;" }], [0, "&angmsd;"], [0, "&angsph;"], [0, "&mid;"], [0, "&nmid;"], [0, "&DoubleVerticalBar;"], [0, "&NotDoubleVerticalBar;"], [0, "&and;"], [0, "&or;"], [0, { v: "&cap;", n: 65024, o: "&caps;" }], [0, { v: "&cup;", n: 65024, o: "&cups;" }], [0, "&int;"], [0, "&Int;"], [0, "&iiint;"], [0, "&conint;"], [0, "&Conint;"], [0, "&Cconint;"], [0, "&cwint;"], [0, "&ClockwiseContourIntegral;"], [0, "&awconint;"], [0, "&there4;"], [0, "&becaus;"], [0, "&ratio;"], [0, "&Colon;"], [0, "&dotminus;"], [1, "&mDDot;"], [0, "&homtht;"], [0, { v: "&sim;", n: 8402, o: "&nvsim;" }], [0, { v: "&backsim;", n: 817, o: "&race;" }], [0, { v: "&ac;", n: 819, o: "&acE;" }], [0, "&acd;"], [0, "&VerticalTilde;"], [0, "&NotTilde;"], [0, { v: "&eqsim;", n: 824, o: "&nesim;" }], [0, "&sime;"], [0, "&NotTildeEqual;"], [0, "&cong;"], [0, "&simne;"], [0, "&ncong;"], [0, "&ap;"], [0, "&nap;"], [0, "&ape;"], [0, { v: "&apid;", n: 824, o: "&napid;" }], [0, "&backcong;"], [0, { v: "&asympeq;", n: 8402, o: "&nvap;" }], [0, { v: "&bump;", n: 824, o: "&nbump;" }], [0, { v: "&bumpe;", n: 824, o: "&nbumpe;" }], [0, { v: "&doteq;", n: 824, o: "&nedot;" }], [0, "&doteqdot;"], [0, "&efDot;"], [0, "&erDot;"], [0, "&Assign;"], [0, "&ecolon;"], [0, "&ecir;"], [0, "&circeq;"], [1, "&wedgeq;"], [0, "&veeeq;"], [1, "&triangleq;"], [2, "&equest;"], [0, "&ne;"], [0, { v: "&Congruent;", n: 8421, o: "&bnequiv;" }], [0, "&nequiv;"], [1, { v: "&le;", n: 8402, o: "&nvle;" }], [0, { v: "&ge;", n: 8402, o: "&nvge;" }], [0, { v: "&lE;", n: 824, o: "&nlE;" }], [0, { v: "&gE;", n: 824, o: "&ngE;" }], [0, { v: "&lnE;", n: 65024, o: "&lvertneqq;" }], [0, { v: "&gnE;", n: 65024, o: "&gvertneqq;" }], [0, { v: "&ll;", n: new Map(/* #__PURE__ */ restoreDiff([[824, "&nLtv;"], [7577, "&nLt;"]])) }], [0, { v: "&gg;", n: new Map(/* #__PURE__ */ restoreDiff([[824, "&nGtv;"], [7577, "&nGt;"]])) }], [0, "&between;"], [0, "&NotCupCap;"], [0, "&nless;"], [0, "&ngt;"], [0, "&nle;"], [0, "&nge;"], [0, "&lesssim;"], [0, "&GreaterTilde;"], [0, "&nlsim;"], [0, "&ngsim;"], [0, "&LessGreater;"], [0, "&gl;"], [0, "&NotLessGreater;"], [0, "&NotGreaterLess;"], [0, "&pr;"], [0, "&sc;"], [0, "&prcue;"], [0, "&sccue;"], [0, "&PrecedesTilde;"], [0, { v: "&scsim;", n: 824, o: "&NotSucceedsTilde;" }], [0, "&NotPrecedes;"], [0, "&NotSucceeds;"], [0, { v: "&sub;", n: 8402, o: "&NotSubset;" }], [0, { v: "&sup;", n: 8402, o: "&NotSuperset;" }], [0, "&nsub;"], [0, "&nsup;"], [0, "&sube;"], [0, "&supe;"], [0, "&NotSubsetEqual;"], [0, "&NotSupersetEqual;"], [0, { v: "&subne;", n: 65024, o: "&varsubsetneq;" }], [0, { v: "&supne;", n: 65024, o: "&varsupsetneq;" }], [1, "&cupdot;"], [0, "&UnionPlus;"], [0, { v: "&sqsub;", n: 824, o: "&NotSquareSubset;" }], [0, { v: "&sqsup;", n: 824, o: "&NotSquareSuperset;" }], [0, "&sqsube;"], [0, "&sqsupe;"], [0, { v: "&sqcap;", n: 65024, o: "&sqcaps;" }], [0, { v: "&sqcup;", n: 65024, o: "&sqcups;" }], [0, "&CirclePlus;"], [0, "&CircleMinus;"], [0, "&CircleTimes;"], [0, "&osol;"], [0, "&CircleDot;"], [0, "&circledcirc;"], [0, "&circledast;"], [1, "&circleddash;"], [0, "&boxplus;"], [0, "&boxminus;"], [0, "&boxtimes;"], [0, "&dotsquare;"], [0, "&RightTee;"], [0, "&dashv;"], [0, "&DownTee;"], [0, "&bot;"], [1, "&models;"], [0, "&DoubleRightTee;"], [0, "&Vdash;"], [0, "&Vvdash;"], [0, "&VDash;"], [0, "&nvdash;"], [0, "&nvDash;"], [0, "&nVdash;"], [0, "&nVDash;"], [0, "&prurel;"], [1, "&LeftTriangle;"], [0, "&RightTriangle;"], [0, { v: "&LeftTriangleEqual;", n: 8402, o: "&nvltrie;" }], [0, { v: "&RightTriangleEqual;", n: 8402, o: "&nvrtrie;" }], [0, "&origof;"], [0, "&imof;"], [0, "&multimap;"], [0, "&hercon;"], [0, "&intcal;"], [0, "&veebar;"], [1, "&barvee;"], [0, "&angrtvb;"], [0, "&lrtri;"], [0, "&bigwedge;"], [0, "&bigvee;"], [0, "&bigcap;"], [0, "&bigcup;"], [0, "&diam;"], [0, "&sdot;"], [0, "&sstarf;"], [0, "&divideontimes;"], [0, "&bowtie;"], [0, "&ltimes;"], [0, "&rtimes;"], [0, "&leftthreetimes;"], [0, "&rightthreetimes;"], [0, "&backsimeq;"], [0, "&curlyvee;"], [0, "&curlywedge;"], [0, "&Sub;"], [0, "&Sup;"], [0, "&Cap;"], [0, "&Cup;"], [0, "&fork;"], [0, "&epar;"], [0, "&lessdot;"], [0, "&gtdot;"], [0, { v: "&Ll;", n: 824, o: "&nLl;" }], [0, { v: "&Gg;", n: 824, o: "&nGg;" }], [0, { v: "&leg;", n: 65024, o: "&lesg;" }], [0, { v: "&gel;", n: 65024, o: "&gesl;" }], [2, "&cuepr;"], [0, "&cuesc;"], [0, "&NotPrecedesSlantEqual;"], [0, "&NotSucceedsSlantEqual;"], [0, "&NotSquareSubsetEqual;"], [0, "&NotSquareSupersetEqual;"], [2, "&lnsim;"], [0, "&gnsim;"], [0, "&precnsim;"], [0, "&scnsim;"], [0, "&nltri;"], [0, "&NotRightTriangle;"], [0, "&nltrie;"], [0, "&NotRightTriangleEqual;"], [0, "&vellip;"], [0, "&ctdot;"], [0, "&utdot;"], [0, "&dtdot;"], [0, "&disin;"], [0, "&isinsv;"], [0, "&isins;"], [0, { v: "&isindot;", n: 824, o: "&notindot;" }], [0, "&notinvc;"], [0, "&notinvb;"], [1, { v: "&isinE;", n: 824, o: "&notinE;" }], [0, "&nisd;"], [0, "&xnis;"], [0, "&nis;"], [0, "&notnivc;"], [0, "&notnivb;"], [6, "&barwed;"], [0, "&Barwed;"], [1, "&lceil;"], [0, "&rceil;"], [0, "&LeftFloor;"], [0, "&rfloor;"], [0, "&drcrop;"], [0, "&dlcrop;"], [0, "&urcrop;"], [0, "&ulcrop;"], [0, "&bnot;"], [1, "&profline;"], [0, "&profsurf;"], [1, "&telrec;"], [0, "&target;"], [5, "&ulcorn;"], [0, "&urcorn;"], [0, "&dlcorn;"], [0, "&drcorn;"], [2, "&frown;"], [0, "&smile;"], [9, "&cylcty;"], [0, "&profalar;"], [7, "&topbot;"], [6, "&ovbar;"], [1, "&solbar;"], [60, "&angzarr;"], [51, "&lmoustache;"], [0, "&rmoustache;"], [2, "&OverBracket;"], [0, "&bbrk;"], [0, "&bbrktbrk;"], [37, "&OverParenthesis;"], [0, "&UnderParenthesis;"], [0, "&OverBrace;"], [0, "&UnderBrace;"], [2, "&trpezium;"], [4, "&elinters;"], [59, "&blank;"], [164, "&circledS;"], [55, "&boxh;"], [1, "&boxv;"], [9, "&boxdr;"], [3, "&boxdl;"], [3, "&boxur;"], [3, "&boxul;"], [3, "&boxvr;"], [7, "&boxvl;"], [7, "&boxhd;"], [7, "&boxhu;"], [7, "&boxvh;"], [19, "&boxH;"], [0, "&boxV;"], [0, "&boxdR;"], [0, "&boxDr;"], [0, "&boxDR;"], [0, "&boxdL;"], [0, "&boxDl;"], [0, "&boxDL;"], [0, "&boxuR;"], [0, "&boxUr;"], [0, "&boxUR;"], [0, "&boxuL;"], [0, "&boxUl;"], [0, "&boxUL;"], [0, "&boxvR;"], [0, "&boxVr;"], [0, "&boxVR;"], [0, "&boxvL;"], [0, "&boxVl;"], [0, "&boxVL;"], [0, "&boxHd;"], [0, "&boxhD;"], [0, "&boxHD;"], [0, "&boxHu;"], [0, "&boxhU;"], [0, "&boxHU;"], [0, "&boxvH;"], [0, "&boxVh;"], [0, "&boxVH;"], [19, "&uhblk;"], [3, "&lhblk;"], [3, "&block;"], [8, "&blk14;"], [0, "&blk12;"], [0, "&blk34;"], [13, "&square;"], [8, "&blacksquare;"], [0, "&EmptyVerySmallSquare;"], [1, "&rect;"], [0, "&marker;"], [2, "&fltns;"], [1, "&bigtriangleup;"], [0, "&blacktriangle;"], [0, "&triangle;"], [2, "&blacktriangleright;"], [0, "&rtri;"], [3, "&bigtriangledown;"], [0, "&blacktriangledown;"], [0, "&dtri;"], [2, "&blacktriangleleft;"], [0, "&ltri;"], [6, "&loz;"], [0, "&cir;"], [32, "&tridot;"], [2, "&bigcirc;"], [8, "&ultri;"], [0, "&urtri;"], [0, "&lltri;"], [0, "&EmptySmallSquare;"], [0, "&FilledSmallSquare;"], [8, "&bigstar;"], [0, "&star;"], [7, "&phone;"], [49, "&female;"], [1, "&male;"], [29, "&spades;"], [2, "&clubs;"], [1, "&hearts;"], [0, "&diamondsuit;"], [3, "&sung;"], [2, "&flat;"], [0, "&natural;"], [0, "&sharp;"], [163, "&check;"], [3, "&cross;"], [8, "&malt;"], [21, "&sext;"], [33, "&VerticalSeparator;"], [25, "&lbbrk;"], [0, "&rbbrk;"], [84, "&bsolhsub;"], [0, "&suphsol;"], [28, "&LeftDoubleBracket;"], [0, "&RightDoubleBracket;"], [0, "&lang;"], [0, "&rang;"], [0, "&Lang;"], [0, "&Rang;"], [0, "&loang;"], [0, "&roang;"], [7, "&longleftarrow;"], [0, "&longrightarrow;"], [0, "&longleftrightarrow;"], [0, "&DoubleLongLeftArrow;"], [0, "&DoubleLongRightArrow;"], [0, "&DoubleLongLeftRightArrow;"], [1, "&longmapsto;"], [2, "&dzigrarr;"], [258, "&nvlArr;"], [0, "&nvrArr;"], [0, "&nvHarr;"], [0, "&Map;"], [6, "&lbarr;"], [0, "&bkarow;"], [0, "&lBarr;"], [0, "&dbkarow;"], [0, "&drbkarow;"], [0, "&DDotrahd;"], [0, "&UpArrowBar;"], [0, "&DownArrowBar;"], [2, "&Rarrtl;"], [2, "&latail;"], [0, "&ratail;"], [0, "&lAtail;"], [0, "&rAtail;"], [0, "&larrfs;"], [0, "&rarrfs;"], [0, "&larrbfs;"], [0, "&rarrbfs;"], [2, "&nwarhk;"], [0, "&nearhk;"], [0, "&hksearow;"], [0, "&hkswarow;"], [0, "&nwnear;"], [0, "&nesear;"], [0, "&seswar;"], [0, "&swnwar;"], [8, { v: "&rarrc;", n: 824, o: "&nrarrc;" }], [1, "&cudarrr;"], [0, "&ldca;"], [0, "&rdca;"], [0, "&cudarrl;"], [0, "&larrpl;"], [2, "&curarrm;"], [0, "&cularrp;"], [7, "&rarrpl;"], [2, "&harrcir;"], [0, "&Uarrocir;"], [0, "&lurdshar;"], [0, "&ldrushar;"], [2, "&LeftRightVector;"], [0, "&RightUpDownVector;"], [0, "&DownLeftRightVector;"], [0, "&LeftUpDownVector;"], [0, "&LeftVectorBar;"], [0, "&RightVectorBar;"], [0, "&RightUpVectorBar;"], [0, "&RightDownVectorBar;"], [0, "&DownLeftVectorBar;"], [0, "&DownRightVectorBar;"], [0, "&LeftUpVectorBar;"], [0, "&LeftDownVectorBar;"], [0, "&LeftTeeVector;"], [0, "&RightTeeVector;"], [0, "&RightUpTeeVector;"], [0, "&RightDownTeeVector;"], [0, "&DownLeftTeeVector;"], [0, "&DownRightTeeVector;"], [0, "&LeftUpTeeVector;"], [0, "&LeftDownTeeVector;"], [0, "&lHar;"], [0, "&uHar;"], [0, "&rHar;"], [0, "&dHar;"], [0, "&luruhar;"], [0, "&ldrdhar;"], [0, "&ruluhar;"], [0, "&rdldhar;"], [0, "&lharul;"], [0, "&llhard;"], [0, "&rharul;"], [0, "&lrhard;"], [0, "&udhar;"], [0, "&duhar;"], [0, "&RoundImplies;"], [0, "&erarr;"], [0, "&simrarr;"], [0, "&larrsim;"], [0, "&rarrsim;"], [0, "&rarrap;"], [0, "&ltlarr;"], [1, "&gtrarr;"], [0, "&subrarr;"], [1, "&suplarr;"], [0, "&lfisht;"], [0, "&rfisht;"], [0, "&ufisht;"], [0, "&dfisht;"], [5, "&lopar;"], [0, "&ropar;"], [4, "&lbrke;"], [0, "&rbrke;"], [0, "&lbrkslu;"], [0, "&rbrksld;"], [0, "&lbrksld;"], [0, "&rbrkslu;"], [0, "&langd;"], [0, "&rangd;"], [0, "&lparlt;"], [0, "&rpargt;"], [0, "&gtlPar;"], [0, "&ltrPar;"], [3, "&vzigzag;"], [1, "&vangrt;"], [0, "&angrtvbd;"], [6, "&ange;"], [0, "&range;"], [0, "&dwangle;"], [0, "&uwangle;"], [0, "&angmsdaa;"], [0, "&angmsdab;"], [0, "&angmsdac;"], [0, "&angmsdad;"], [0, "&angmsdae;"], [0, "&angmsdaf;"], [0, "&angmsdag;"], [0, "&angmsdah;"], [0, "&bemptyv;"], [0, "&demptyv;"], [0, "&cemptyv;"], [0, "&raemptyv;"], [0, "&laemptyv;"], [0, "&ohbar;"], [0, "&omid;"], [0, "&opar;"], [1, "&operp;"], [1, "&olcross;"], [0, "&odsold;"], [1, "&olcir;"], [0, "&ofcir;"], [0, "&olt;"], [0, "&ogt;"], [0, "&cirscir;"], [0, "&cirE;"], [0, "&solb;"], [0, "&bsolb;"], [3, "&boxbox;"], [3, "&trisb;"], [0, "&rtriltri;"], [0, { v: "&LeftTriangleBar;", n: 824, o: "&NotLeftTriangleBar;" }], [0, { v: "&RightTriangleBar;", n: 824, o: "&NotRightTriangleBar;" }], [11, "&iinfin;"], [0, "&infintie;"], [0, "&nvinfin;"], [4, "&eparsl;"], [0, "&smeparsl;"], [0, "&eqvparsl;"], [5, "&blacklozenge;"], [8, "&RuleDelayed;"], [1, "&dsol;"], [9, "&bigodot;"], [0, "&bigoplus;"], [0, "&bigotimes;"], [1, "&biguplus;"], [1, "&bigsqcup;"], [5, "&iiiint;"], [0, "&fpartint;"], [2, "&cirfnint;"], [0, "&awint;"], [0, "&rppolint;"], [0, "&scpolint;"], [0, "&npolint;"], [0, "&pointint;"], [0, "&quatint;"], [0, "&intlarhk;"], [10, "&pluscir;"], [0, "&plusacir;"], [0, "&simplus;"], [0, "&plusdu;"], [0, "&plussim;"], [0, "&plustwo;"], [1, "&mcomma;"], [0, "&minusdu;"], [2, "&loplus;"], [0, "&roplus;"], [0, "&Cross;"], [0, "&timesd;"], [0, "&timesbar;"], [1, "&smashp;"], [0, "&lotimes;"], [0, "&rotimes;"], [0, "&otimesas;"], [0, "&Otimes;"], [0, "&odiv;"], [0, "&triplus;"], [0, "&triminus;"], [0, "&tritime;"], [0, "&intprod;"], [2, "&amalg;"], [0, "&capdot;"], [1, "&ncup;"], [0, "&ncap;"], [0, "&capand;"], [0, "&cupor;"], [0, "&cupcap;"], [0, "&capcup;"], [0, "&cupbrcap;"], [0, "&capbrcup;"], [0, "&cupcup;"], [0, "&capcap;"], [0, "&ccups;"], [0, "&ccaps;"], [2, "&ccupssm;"], [2, "&And;"], [0, "&Or;"], [0, "&andand;"], [0, "&oror;"], [0, "&orslope;"], [0, "&andslope;"], [1, "&andv;"], [0, "&orv;"], [0, "&andd;"], [0, "&ord;"], [1, "&wedbar;"], [6, "&sdote;"], [3, "&simdot;"], [2, { v: "&congdot;", n: 824, o: "&ncongdot;" }], [0, "&easter;"], [0, "&apacir;"], [0, { v: "&apE;", n: 824, o: "&napE;" }], [0, "&eplus;"], [0, "&pluse;"], [0, "&Esim;"], [0, "&Colone;"], [0, "&Equal;"], [1, "&ddotseq;"], [0, "&equivDD;"], [0, "&ltcir;"], [0, "&gtcir;"], [0, "&ltquest;"], [0, "&gtquest;"], [0, { v: "&leqslant;", n: 824, o: "&nleqslant;" }], [0, { v: "&geqslant;", n: 824, o: "&ngeqslant;" }], [0, "&lesdot;"], [0, "&gesdot;"], [0, "&lesdoto;"], [0, "&gesdoto;"], [0, "&lesdotor;"], [0, "&gesdotol;"], [0, "&lap;"], [0, "&gap;"], [0, "&lne;"], [0, "&gne;"], [0, "&lnap;"], [0, "&gnap;"], [0, "&lEg;"], [0, "&gEl;"], [0, "&lsime;"], [0, "&gsime;"], [0, "&lsimg;"], [0, "&gsiml;"], [0, "&lgE;"], [0, "&glE;"], [0, "&lesges;"], [0, "&gesles;"], [0, "&els;"], [0, "&egs;"], [0, "&elsdot;"], [0, "&egsdot;"], [0, "&el;"], [0, "&eg;"], [2, "&siml;"], [0, "&simg;"], [0, "&simlE;"], [0, "&simgE;"], [0, { v: "&LessLess;", n: 824, o: "&NotNestedLessLess;" }], [0, { v: "&GreaterGreater;", n: 824, o: "&NotNestedGreaterGreater;" }], [1, "&glj;"], [0, "&gla;"], [0, "&ltcc;"], [0, "&gtcc;"], [0, "&lescc;"], [0, "&gescc;"], [0, "&smt;"], [0, "&lat;"], [0, { v: "&smte;", n: 65024, o: "&smtes;" }], [0, { v: "&late;", n: 65024, o: "&lates;" }], [0, "&bumpE;"], [0, { v: "&PrecedesEqual;", n: 824, o: "&NotPrecedesEqual;" }], [0, { v: "&sce;", n: 824, o: "&NotSucceedsEqual;" }], [2, "&prE;"], [0, "&scE;"], [0, "&precneqq;"], [0, "&scnE;"], [0, "&prap;"], [0, "&scap;"], [0, "&precnapprox;"], [0, "&scnap;"], [0, "&Pr;"], [0, "&Sc;"], [0, "&subdot;"], [0, "&supdot;"], [0, "&subplus;"], [0, "&supplus;"], [0, "&submult;"], [0, "&supmult;"], [0, "&subedot;"], [0, "&supedot;"], [0, { v: "&subE;", n: 824, o: "&nsubE;" }], [0, { v: "&supE;", n: 824, o: "&nsupE;" }], [0, "&subsim;"], [0, "&supsim;"], [2, { v: "&subnE;", n: 65024, o: "&varsubsetneqq;" }], [0, { v: "&supnE;", n: 65024, o: "&varsupsetneqq;" }], [2, "&csub;"], [0, "&csup;"], [0, "&csube;"], [0, "&csupe;"], [0, "&subsup;"], [0, "&supsub;"], [0, "&subsub;"], [0, "&supsup;"], [0, "&suphsub;"], [0, "&supdsub;"], [0, "&forkv;"], [0, "&topfork;"], [0, "&mlcp;"], [8, "&Dashv;"], [1, "&Vdashl;"], [0, "&Barv;"], [0, "&vBar;"], [0, "&vBarv;"], [1, "&Vbar;"], [0, "&Not;"], [0, "&bNot;"], [0, "&rnmid;"], [0, "&cirmid;"], [0, "&midcir;"], [0, "&topcir;"], [0, "&nhpar;"], [0, "&parsim;"], [9, { v: "&parsl;", n: 8421, o: "&nparsl;" }], [44343, { n: new Map(/* #__PURE__ */ restoreDiff([[56476, "&Ascr;"], [1, "&Cscr;"], [0, "&Dscr;"], [2, "&Gscr;"], [2, "&Jscr;"], [0, "&Kscr;"], [2, "&Nscr;"], [0, "&Oscr;"], [0, "&Pscr;"], [0, "&Qscr;"], [1, "&Sscr;"], [0, "&Tscr;"], [0, "&Uscr;"], [0, "&Vscr;"], [0, "&Wscr;"], [0, "&Xscr;"], [0, "&Yscr;"], [0, "&Zscr;"], [0, "&ascr;"], [0, "&bscr;"], [0, "&cscr;"], [0, "&dscr;"], [1, "&fscr;"], [1, "&hscr;"], [0, "&iscr;"], [0, "&jscr;"], [0, "&kscr;"], [0, "&lscr;"], [0, "&mscr;"], [0, "&nscr;"], [1, "&pscr;"], [0, "&qscr;"], [0, "&rscr;"], [0, "&sscr;"], [0, "&tscr;"], [0, "&uscr;"], [0, "&vscr;"], [0, "&wscr;"], [0, "&xscr;"], [0, "&yscr;"], [0, "&zscr;"], [52, "&Afr;"], [0, "&Bfr;"], [1, "&Dfr;"], [0, "&Efr;"], [0, "&Ffr;"], [0, "&Gfr;"], [2, "&Jfr;"], [0, "&Kfr;"], [0, "&Lfr;"], [0, "&Mfr;"], [0, "&Nfr;"], [0, "&Ofr;"], [0, "&Pfr;"], [0, "&Qfr;"], [1, "&Sfr;"], [0, "&Tfr;"], [0, "&Ufr;"], [0, "&Vfr;"], [0, "&Wfr;"], [0, "&Xfr;"], [0, "&Yfr;"], [1, "&afr;"], [0, "&bfr;"], [0, "&cfr;"], [0, "&dfr;"], [0, "&efr;"], [0, "&ffr;"], [0, "&gfr;"], [0, "&hfr;"], [0, "&ifr;"], [0, "&jfr;"], [0, "&kfr;"], [0, "&lfr;"], [0, "&mfr;"], [0, "&nfr;"], [0, "&ofr;"], [0, "&pfr;"], [0, "&qfr;"], [0, "&rfr;"], [0, "&sfr;"], [0, "&tfr;"], [0, "&ufr;"], [0, "&vfr;"], [0, "&wfr;"], [0, "&xfr;"], [0, "&yfr;"], [0, "&zfr;"], [0, "&Aopf;"], [0, "&Bopf;"], [1, "&Dopf;"], [0, "&Eopf;"], [0, "&Fopf;"], [0, "&Gopf;"], [1, "&Iopf;"], [0, "&Jopf;"], [0, "&Kopf;"], [0, "&Lopf;"], [0, "&Mopf;"], [1, "&Oopf;"], [3, "&Sopf;"], [0, "&Topf;"], [0, "&Uopf;"], [0, "&Vopf;"], [0, "&Wopf;"], [0, "&Xopf;"], [0, "&Yopf;"], [1, "&aopf;"], [0, "&bopf;"], [0, "&copf;"], [0, "&dopf;"], [0, "&eopf;"], [0, "&fopf;"], [0, "&gopf;"], [0, "&hopf;"], [0, "&iopf;"], [0, "&jopf;"], [0, "&kopf;"], [0, "&lopf;"], [0, "&mopf;"], [0, "&nopf;"], [0, "&oopf;"], [0, "&popf;"], [0, "&qopf;"], [0, "&ropf;"], [0, "&sopf;"], [0, "&topf;"], [0, "&uopf;"], [0, "&vopf;"], [0, "&wopf;"], [0, "&xopf;"], [0, "&yopf;"], [0, "&zopf;"]])) }], [8906, "&fflig;"], [0, "&filig;"], [0, "&fllig;"], [0, "&ffilig;"], [0, "&ffllig;"]]));
	
	return encodeHtml;
}

var _escape = {};

var hasRequired_escape;

function require_escape () {
	if (hasRequired_escape) return _escape;
	hasRequired_escape = 1;
	(function (exports) {
		Object.defineProperty(exports, "__esModule", { value: true });
		exports.escapeText = exports.escapeAttribute = exports.escapeUTF8 = exports.escape = exports.encodeXML = exports.getCodePoint = exports.xmlReplacer = void 0;
		exports.xmlReplacer = /["&'<>$\x80-\uFFFF]/g;
		var xmlCodeMap = new Map([
		    [34, "&quot;"],
		    [38, "&amp;"],
		    [39, "&apos;"],
		    [60, "&lt;"],
		    [62, "&gt;"],
		]);
		// For compatibility with node < 4, we wrap `codePointAt`
		exports.getCodePoint = 
		// eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
		String.prototype.codePointAt != null
		    ? function (str, index) { return str.codePointAt(index); }
		    : // http://mathiasbynens.be/notes/javascript-encoding#surrogate-formulae
		        function (c, index) {
		            return (c.charCodeAt(index) & 0xfc00) === 0xd800
		                ? (c.charCodeAt(index) - 0xd800) * 0x400 +
		                    c.charCodeAt(index + 1) -
		                    0xdc00 +
		                    0x10000
		                : c.charCodeAt(index);
		        };
		/**
		 * Encodes all non-ASCII characters, as well as characters not valid in XML
		 * documents using XML entities.
		 *
		 * If a character has no equivalent entity, a
		 * numeric hexadecimal reference (eg. `&#xfc;`) will be used.
		 */
		function encodeXML(str) {
		    var ret = "";
		    var lastIdx = 0;
		    var match;
		    while ((match = exports.xmlReplacer.exec(str)) !== null) {
		        var i = match.index;
		        var char = str.charCodeAt(i);
		        var next = xmlCodeMap.get(char);
		        if (next !== undefined) {
		            ret += str.substring(lastIdx, i) + next;
		            lastIdx = i + 1;
		        }
		        else {
		            ret += "".concat(str.substring(lastIdx, i), "&#x").concat((0, exports.getCodePoint)(str, i).toString(16), ";");
		            // Increase by 1 if we have a surrogate pair
		            lastIdx = exports.xmlReplacer.lastIndex += Number((char & 0xfc00) === 0xd800);
		        }
		    }
		    return ret + str.substr(lastIdx);
		}
		exports.encodeXML = encodeXML;
		/**
		 * Encodes all non-ASCII characters, as well as characters not valid in XML
		 * documents using numeric hexadecimal reference (eg. `&#xfc;`).
		 *
		 * Have a look at `escapeUTF8` if you want a more concise output at the expense
		 * of reduced transportability.
		 *
		 * @param data String to escape.
		 */
		exports.escape = encodeXML;
		/**
		 * Creates a function that escapes all characters matched by the given regular
		 * expression using the given map of characters to escape to their entities.
		 *
		 * @param regex Regular expression to match characters to escape.
		 * @param map Map of characters to escape to their entities.
		 *
		 * @returns Function that escapes all characters matched by the given regular
		 * expression using the given map of characters to escape to their entities.
		 */
		function getEscaper(regex, map) {
		    return function escape(data) {
		        var match;
		        var lastIdx = 0;
		        var result = "";
		        while ((match = regex.exec(data))) {
		            if (lastIdx !== match.index) {
		                result += data.substring(lastIdx, match.index);
		            }
		            // We know that this character will be in the map.
		            result += map.get(match[0].charCodeAt(0));
		            // Every match will be of length 1
		            lastIdx = match.index + 1;
		        }
		        return result + data.substring(lastIdx);
		    };
		}
		/**
		 * Encodes all characters not valid in XML documents using XML entities.
		 *
		 * Note that the output will be character-set dependent.
		 *
		 * @param data String to escape.
		 */
		exports.escapeUTF8 = getEscaper(/[&<>'"]/g, xmlCodeMap);
		/**
		 * Encodes all characters that have to be escaped in HTML attributes,
		 * following {@link https://html.spec.whatwg.org/multipage/parsing.html#escapingString}.
		 *
		 * @param data String to escape.
		 */
		exports.escapeAttribute = getEscaper(/["&\u00A0]/g, new Map([
		    [34, "&quot;"],
		    [38, "&amp;"],
		    [160, "&nbsp;"],
		]));
		/**
		 * Encodes all characters that have to be escaped in HTML text,
		 * following {@link https://html.spec.whatwg.org/multipage/parsing.html#escapingString}.
		 *
		 * @param data String to escape.
		 */
		exports.escapeText = getEscaper(/[&<>\u00A0]/g, new Map([
		    [38, "&amp;"],
		    [60, "&lt;"],
		    [62, "&gt;"],
		    [160, "&nbsp;"],
		]));
		
	} (_escape));
	return _escape;
}

var hasRequiredEncode;

function requireEncode () {
	if (hasRequiredEncode) return encode$1;
	hasRequiredEncode = 1;
	var __importDefault = (encode$1 && encode$1.__importDefault) || function (mod) {
	    return (mod && mod.__esModule) ? mod : { "default": mod };
	};
	Object.defineProperty(encode$1, "__esModule", { value: true });
	encode$1.encodeNonAsciiHTML = encode$1.encodeHTML = void 0;
	var encode_html_js_1 = __importDefault(/*@__PURE__*/ requireEncodeHtml());
	var escape_js_1 = /*@__PURE__*/ require_escape();
	var htmlReplacer = /[\t\n!-,./:-@[-`\f{-}$\x80-\uFFFF]/g;
	/**
	 * Encodes all characters in the input using HTML entities. This includes
	 * characters that are valid ASCII characters in HTML documents, such as `#`.
	 *
	 * To get a more compact output, consider using the `encodeNonAsciiHTML`
	 * function, which will only encode characters that are not valid in HTML
	 * documents, as well as non-ASCII characters.
	 *
	 * If a character has no equivalent entity, a numeric hexadecimal reference
	 * (eg. `&#xfc;`) will be used.
	 */
	function encodeHTML(data) {
	    return encodeHTMLTrieRe(htmlReplacer, data);
	}
	encode$1.encodeHTML = encodeHTML;
	/**
	 * Encodes all non-ASCII characters, as well as characters not valid in HTML
	 * documents using HTML entities. This function will not encode characters that
	 * are valid in HTML documents, such as `#`.
	 *
	 * If a character has no equivalent entity, a numeric hexadecimal reference
	 * (eg. `&#xfc;`) will be used.
	 */
	function encodeNonAsciiHTML(data) {
	    return encodeHTMLTrieRe(escape_js_1.xmlReplacer, data);
	}
	encode$1.encodeNonAsciiHTML = encodeNonAsciiHTML;
	function encodeHTMLTrieRe(regExp, str) {
	    var ret = "";
	    var lastIdx = 0;
	    var match;
	    while ((match = regExp.exec(str)) !== null) {
	        var i = match.index;
	        ret += str.substring(lastIdx, i);
	        var char = str.charCodeAt(i);
	        var next = encode_html_js_1.default.get(char);
	        if (typeof next === "object") {
	            // We are in a branch. Try to match the next char.
	            if (i + 1 < str.length) {
	                var nextChar = str.charCodeAt(i + 1);
	                var value = typeof next.n === "number"
	                    ? next.n === nextChar
	                        ? next.o
	                        : undefined
	                    : next.n.get(nextChar);
	                if (value !== undefined) {
	                    ret += value;
	                    lastIdx = regExp.lastIndex += 1;
	                    continue;
	                }
	            }
	            next = next.v;
	        }
	        // We might have a tree node without a value; skip and use a numeric entity.
	        if (next !== undefined) {
	            ret += next;
	            lastIdx = i + 1;
	        }
	        else {
	            var cp = (0, escape_js_1.getCodePoint)(str, i);
	            ret += "&#x".concat(cp.toString(16), ";");
	            // Increase by 1 if we have a surrogate pair
	            lastIdx = regExp.lastIndex += Number(cp !== char);
	        }
	    }
	    return ret + str.substr(lastIdx);
	}
	
	return encode$1;
}

var hasRequiredLib;

function requireLib () {
	if (hasRequiredLib) return lib;
	hasRequiredLib = 1;
	(function (exports) {
		Object.defineProperty(exports, "__esModule", { value: true });
		exports.decodeXMLStrict = exports.decodeHTML5Strict = exports.decodeHTML4Strict = exports.decodeHTML5 = exports.decodeHTML4 = exports.decodeHTMLAttribute = exports.decodeHTMLStrict = exports.decodeHTML = exports.decodeXML = exports.DecodingMode = exports.EntityDecoder = exports.encodeHTML5 = exports.encodeHTML4 = exports.encodeNonAsciiHTML = exports.encodeHTML = exports.escapeText = exports.escapeAttribute = exports.escapeUTF8 = exports.escape = exports.encodeXML = exports.encode = exports.decodeStrict = exports.decode = exports.EncodingMode = exports.EntityLevel = void 0;
		var decode_js_1 = /*@__PURE__*/ requireDecode();
		var encode_js_1 = /*@__PURE__*/ requireEncode();
		var escape_js_1 = /*@__PURE__*/ require_escape();
		/** The level of entities to support. */
		var EntityLevel;
		(function (EntityLevel) {
		    /** Support only XML entities. */
		    EntityLevel[EntityLevel["XML"] = 0] = "XML";
		    /** Support HTML entities, which are a superset of XML entities. */
		    EntityLevel[EntityLevel["HTML"] = 1] = "HTML";
		})(EntityLevel = exports.EntityLevel || (exports.EntityLevel = {}));
		var EncodingMode;
		(function (EncodingMode) {
		    /**
		     * The output is UTF-8 encoded. Only characters that need escaping within
		     * XML will be escaped.
		     */
		    EncodingMode[EncodingMode["UTF8"] = 0] = "UTF8";
		    /**
		     * The output consists only of ASCII characters. Characters that need
		     * escaping within HTML, and characters that aren't ASCII characters will
		     * be escaped.
		     */
		    EncodingMode[EncodingMode["ASCII"] = 1] = "ASCII";
		    /**
		     * Encode all characters that have an equivalent entity, as well as all
		     * characters that are not ASCII characters.
		     */
		    EncodingMode[EncodingMode["Extensive"] = 2] = "Extensive";
		    /**
		     * Encode all characters that have to be escaped in HTML attributes,
		     * following {@link https://html.spec.whatwg.org/multipage/parsing.html#escapingString}.
		     */
		    EncodingMode[EncodingMode["Attribute"] = 3] = "Attribute";
		    /**
		     * Encode all characters that have to be escaped in HTML text,
		     * following {@link https://html.spec.whatwg.org/multipage/parsing.html#escapingString}.
		     */
		    EncodingMode[EncodingMode["Text"] = 4] = "Text";
		})(EncodingMode = exports.EncodingMode || (exports.EncodingMode = {}));
		/**
		 * Decodes a string with entities.
		 *
		 * @param data String to decode.
		 * @param options Decoding options.
		 */
		function decode(data, options) {
		    if (options === void 0) { options = EntityLevel.XML; }
		    var level = typeof options === "number" ? options : options.level;
		    if (level === EntityLevel.HTML) {
		        var mode = typeof options === "object" ? options.mode : undefined;
		        return (0, decode_js_1.decodeHTML)(data, mode);
		    }
		    return (0, decode_js_1.decodeXML)(data);
		}
		exports.decode = decode;
		/**
		 * Decodes a string with entities. Does not allow missing trailing semicolons for entities.
		 *
		 * @param data String to decode.
		 * @param options Decoding options.
		 * @deprecated Use `decode` with the `mode` set to `Strict`.
		 */
		function decodeStrict(data, options) {
		    var _a;
		    if (options === void 0) { options = EntityLevel.XML; }
		    var opts = typeof options === "number" ? { level: options } : options;
		    (_a = opts.mode) !== null && _a !== void 0 ? _a : (opts.mode = decode_js_1.DecodingMode.Strict);
		    return decode(data, opts);
		}
		exports.decodeStrict = decodeStrict;
		/**
		 * Encodes a string with entities.
		 *
		 * @param data String to encode.
		 * @param options Encoding options.
		 */
		function encode(data, options) {
		    if (options === void 0) { options = EntityLevel.XML; }
		    var opts = typeof options === "number" ? { level: options } : options;
		    // Mode `UTF8` just escapes XML entities
		    if (opts.mode === EncodingMode.UTF8)
		        return (0, escape_js_1.escapeUTF8)(data);
		    if (opts.mode === EncodingMode.Attribute)
		        return (0, escape_js_1.escapeAttribute)(data);
		    if (opts.mode === EncodingMode.Text)
		        return (0, escape_js_1.escapeText)(data);
		    if (opts.level === EntityLevel.HTML) {
		        if (opts.mode === EncodingMode.ASCII) {
		            return (0, encode_js_1.encodeNonAsciiHTML)(data);
		        }
		        return (0, encode_js_1.encodeHTML)(data);
		    }
		    // ASCII and Extensive are equivalent
		    return (0, escape_js_1.encodeXML)(data);
		}
		exports.encode = encode;
		var escape_js_2 = /*@__PURE__*/ require_escape();
		Object.defineProperty(exports, "encodeXML", { enumerable: true, get: function () { return escape_js_2.encodeXML; } });
		Object.defineProperty(exports, "escape", { enumerable: true, get: function () { return escape_js_2.escape; } });
		Object.defineProperty(exports, "escapeUTF8", { enumerable: true, get: function () { return escape_js_2.escapeUTF8; } });
		Object.defineProperty(exports, "escapeAttribute", { enumerable: true, get: function () { return escape_js_2.escapeAttribute; } });
		Object.defineProperty(exports, "escapeText", { enumerable: true, get: function () { return escape_js_2.escapeText; } });
		var encode_js_2 = /*@__PURE__*/ requireEncode();
		Object.defineProperty(exports, "encodeHTML", { enumerable: true, get: function () { return encode_js_2.encodeHTML; } });
		Object.defineProperty(exports, "encodeNonAsciiHTML", { enumerable: true, get: function () { return encode_js_2.encodeNonAsciiHTML; } });
		// Legacy aliases (deprecated)
		Object.defineProperty(exports, "encodeHTML4", { enumerable: true, get: function () { return encode_js_2.encodeHTML; } });
		Object.defineProperty(exports, "encodeHTML5", { enumerable: true, get: function () { return encode_js_2.encodeHTML; } });
		var decode_js_2 = /*@__PURE__*/ requireDecode();
		Object.defineProperty(exports, "EntityDecoder", { enumerable: true, get: function () { return decode_js_2.EntityDecoder; } });
		Object.defineProperty(exports, "DecodingMode", { enumerable: true, get: function () { return decode_js_2.DecodingMode; } });
		Object.defineProperty(exports, "decodeXML", { enumerable: true, get: function () { return decode_js_2.decodeXML; } });
		Object.defineProperty(exports, "decodeHTML", { enumerable: true, get: function () { return decode_js_2.decodeHTML; } });
		Object.defineProperty(exports, "decodeHTMLStrict", { enumerable: true, get: function () { return decode_js_2.decodeHTMLStrict; } });
		Object.defineProperty(exports, "decodeHTMLAttribute", { enumerable: true, get: function () { return decode_js_2.decodeHTMLAttribute; } });
		// Legacy aliases (deprecated)
		Object.defineProperty(exports, "decodeHTML4", { enumerable: true, get: function () { return decode_js_2.decodeHTML; } });
		Object.defineProperty(exports, "decodeHTML5", { enumerable: true, get: function () { return decode_js_2.decodeHTML; } });
		Object.defineProperty(exports, "decodeHTML4Strict", { enumerable: true, get: function () { return decode_js_2.decodeHTMLStrict; } });
		Object.defineProperty(exports, "decodeHTML5Strict", { enumerable: true, get: function () { return decode_js_2.decodeHTMLStrict; } });
		Object.defineProperty(exports, "decodeXMLStrict", { enumerable: true, get: function () { return decode_js_2.decodeXML; } });
		
	} (lib));
	return lib;
}

var index_cjs$6;
var hasRequiredIndex_cjs$6;

function requireIndex_cjs$6 () {
	if (hasRequiredIndex_cjs$6) return index_cjs$6;
	hasRequiredIndex_cjs$6 = 1;

	var uc_micro = requireIndex_cjs$7();

	function reFactory (opts) {
	  const re = {};
	  opts = opts || {};

	  re.src_Any = uc_micro.Any.source;
	  re.src_Cc = uc_micro.Cc.source;
	  re.src_Z = uc_micro.Z.source;
	  re.src_P = uc_micro.P.source;

	  // \p{\Z\P\Cc\CF} (white spaces + control + format + punctuation)
	  re.src_ZPCc = [re.src_Z, re.src_P, re.src_Cc].join('|');

	  // \p{\Z\Cc} (white spaces + control)
	  re.src_ZCc = [re.src_Z, re.src_Cc].join('|');

	  // Experimental. List of chars, completely prohibited in links
	  // because can separate it from other part of text
	  const text_separators = '[><\uff5c]';

	  // All possible word characters (everything without punctuation, spaces & controls)
	  // Defined via punctuation & spaces to save space
	  // Should be something like \p{\L\N\S\M} (\w but without `_`)
	  re.src_pseudo_letter = '(?:(?!' + text_separators + '|' + re.src_ZPCc + ')' + re.src_Any + ')';
	  // The same as abothe but without [0-9]
	  // var src_pseudo_letter_non_d = '(?:(?![0-9]|' + src_ZPCc + ')' + src_Any + ')';

	  re.src_ip4 =

	    '(?:(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\\.){3}(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)';

	  // Prohibit any of "@/[]()" in user/pass to avoid wrong domain fetch.
	  re.src_auth = '(?:(?:(?!' + re.src_ZCc + '|[@/\\[\\]()]).)+@)?';

	  re.src_port =

	    '(?::(?:6(?:[0-4]\\d{3}|5(?:[0-4]\\d{2}|5(?:[0-2]\\d|3[0-5])))|[1-5]?\\d{1,4}))?';

	  re.src_host_terminator =

	    '(?=$|' + text_separators + '|' + re.src_ZPCc + ')' +
	    '(?!' + (opts['---'] ? '-(?!--)|' : '-|') + '_|:\\d|\\.-|\\.(?!$|' + re.src_ZPCc + '))';

	  re.src_path =

	    '(?:' +
	      '[/?#]' +
	        '(?:' +
	          '(?!' + re.src_ZCc + '|' + text_separators + '|[()[\\]{}.,"\'?!\\-;]).|' +
	          '\\[(?:(?!' + re.src_ZCc + '|\\]).)*\\]|' +
	          '\\((?:(?!' + re.src_ZCc + '|[)]).)*\\)|' +
	          '\\{(?:(?!' + re.src_ZCc + '|[}]).)*\\}|' +
	          '\\"(?:(?!' + re.src_ZCc + '|["]).)+\\"|' +
	          "\\'(?:(?!" + re.src_ZCc + "|[']).)+\\'|" +

	          // allow `I'm_king` if no pair found
	          "\\'(?=" + re.src_pseudo_letter + '|[-])|' +

	          // google has many dots in "google search" links (#66, #81).
	          // github has ... in commit range links,
	          // Restrict to
	          // - english
	          // - percent-encoded
	          // - parts of file path
	          // - params separator
	          // until more examples found.
	          '\\.{2,}[a-zA-Z0-9%/&]|' +

	          '\\.(?!' + re.src_ZCc + '|[.]|$)|' +
	          (opts['---']
	            ? '\\-(?!--(?:[^-]|$))(?:-*)|' // `---` => long dash, terminate
	            : '\\-+|'
	          ) +
	          // allow `,,,` in paths
	          ',(?!' + re.src_ZCc + '|$)|' +

	          // allow `;` if not followed by space-like char
	          ';(?!' + re.src_ZCc + '|$)|' +

	          // allow `!!!` in paths, but not at the end
	          '\\!+(?!' + re.src_ZCc + '|[!]|$)|' +

	          '\\?(?!' + re.src_ZCc + '|[?]|$)' +
	        ')+' +
	      '|\\/' +
	    ')?';

	  // Allow anything in markdown spec, forbid quote (") at the first position
	  // because emails enclosed in quotes are far more common
	  re.src_email_name =

	    '[\\-;:&=\\+\\$,\\.a-zA-Z0-9_][\\-;:&=\\+\\$,\\"\\.a-zA-Z0-9_]*';

	  re.src_xn =

	    'xn--[a-z0-9\\-]{1,59}';

	  // More to read about domain names
	  // http://serverfault.com/questions/638260/

	  re.src_domain_root =

	    // Allow letters & digits (http://test1)
	    '(?:' +
	      re.src_xn +
	      '|' +
	      re.src_pseudo_letter + '{1,63}' +
	    ')';

	  re.src_domain =

	    '(?:' +
	      re.src_xn +
	      '|' +
	      '(?:' + re.src_pseudo_letter + ')' +
	      '|' +
	      '(?:' + re.src_pseudo_letter + '(?:-|' + re.src_pseudo_letter + '){0,61}' + re.src_pseudo_letter + ')' +
	    ')';

	  re.src_host =

	    '(?:' +
	    // Don't need IP check, because digits are already allowed in normal domain names
	    //   src_ip4 +
	    // '|' +
	      '(?:(?:(?:' + re.src_domain + ')\\.)*' + re.src_domain/* _root */ + ')' +
	    ')';

	  re.tpl_host_fuzzy =

	    '(?:' +
	      re.src_ip4 +
	    '|' +
	      '(?:(?:(?:' + re.src_domain + ')\\.)+(?:%TLDS%))' +
	    ')';

	  re.tpl_host_no_ip_fuzzy =

	    '(?:(?:(?:' + re.src_domain + ')\\.)+(?:%TLDS%))';

	  re.src_host_strict =

	    re.src_host + re.src_host_terminator;

	  re.tpl_host_fuzzy_strict =

	    re.tpl_host_fuzzy + re.src_host_terminator;

	  re.src_host_port_strict =

	    re.src_host + re.src_port + re.src_host_terminator;

	  re.tpl_host_port_fuzzy_strict =

	    re.tpl_host_fuzzy + re.src_port + re.src_host_terminator;

	  re.tpl_host_port_no_ip_fuzzy_strict =

	    re.tpl_host_no_ip_fuzzy + re.src_port + re.src_host_terminator;

	  //
	  // Main rules
	  //

	  // Rude test fuzzy links by host, for quick deny
	  re.tpl_host_fuzzy_test =

	    'localhost|www\\.|\\.\\d{1,3}\\.|(?:\\.(?:%TLDS%)(?:' + re.src_ZPCc + '|>|$))';

	  re.tpl_email_fuzzy =

	      '(^|' + text_separators + '|"|\\(|' + re.src_ZCc + ')' +
	      '(' + re.src_email_name + '@' + re.tpl_host_fuzzy_strict + ')';

	  re.tpl_link_fuzzy =
	      // Fuzzy link can't be prepended with .:/\- and non punctuation.
	      // but can start with > (markdown blockquote)
	      '(^|(?![.:/\\-_@])(?:[$+<=>^`|\uff5c]|' + re.src_ZPCc + '))' +
	      '((?![$+<=>^`|\uff5c])' + re.tpl_host_port_fuzzy_strict + re.src_path + ')';

	  re.tpl_link_no_ip_fuzzy =
	      // Fuzzy link can't be prepended with .:/\- and non punctuation.
	      // but can start with > (markdown blockquote)
	      '(^|(?![.:/\\-_@])(?:[$+<=>^`|\uff5c]|' + re.src_ZPCc + '))' +
	      '((?![$+<=>^`|\uff5c])' + re.tpl_host_port_no_ip_fuzzy_strict + re.src_path + ')';

	  return re
	}

	//
	// Helpers
	//

	// Merge objects
	//
	function assign (obj /* from1, from2, from3, ... */) {
	  const sources = Array.prototype.slice.call(arguments, 1);

	  sources.forEach(function (source) {
	    if (!source) { return }

	    Object.keys(source).forEach(function (key) {
	      obj[key] = source[key];
	    });
	  });

	  return obj
	}

	function _class (obj) { return Object.prototype.toString.call(obj) }
	function isString (obj) { return _class(obj) === '[object String]' }
	function isObject (obj) { return _class(obj) === '[object Object]' }
	function isRegExp (obj) { return _class(obj) === '[object RegExp]' }
	function isFunction (obj) { return _class(obj) === '[object Function]' }

	function escapeRE (str) { return str.replace(/[.?*+^$[\]\\(){}|-]/g, '\\$&') }

	//

	const defaultOptions = {
	  fuzzyLink: true,
	  fuzzyEmail: true,
	  fuzzyIP: false
	};

	function isOptionsObj (obj) {
	  return Object.keys(obj || {}).reduce(function (acc, k) {
	    /* eslint-disable-next-line no-prototype-builtins */
	    return acc || defaultOptions.hasOwnProperty(k)
	  }, false)
	}

	const defaultSchemas = {
	  'http:': {
	    validate: function (text, pos, self) {
	      const tail = text.slice(pos);

	      if (!self.re.http) {
	        // compile lazily, because "host"-containing variables can change on tlds update.
	        self.re.http = new RegExp(
	          '^\\/\\/' + self.re.src_auth + self.re.src_host_port_strict + self.re.src_path, 'i'
	        );
	      }
	      if (self.re.http.test(tail)) {
	        return tail.match(self.re.http)[0].length
	      }
	      return 0
	    }
	  },
	  'https:': 'http:',
	  'ftp:': 'http:',
	  '//': {
	    validate: function (text, pos, self) {
	      const tail = text.slice(pos);

	      if (!self.re.no_http) {
	      // compile lazily, because "host"-containing variables can change on tlds update.
	        self.re.no_http = new RegExp(
	          '^' +
	          self.re.src_auth +
	          // Don't allow single-level domains, because of false positives like '//test'
	          // with code comments
	          '(?:localhost|(?:(?:' + self.re.src_domain + ')\\.)+' + self.re.src_domain_root + ')' +
	          self.re.src_port +
	          self.re.src_host_terminator +
	          self.re.src_path,

	          'i'
	        );
	      }

	      if (self.re.no_http.test(tail)) {
	        // should not be `://` & `///`, that protects from errors in protocol name
	        if (pos >= 3 && text[pos - 3] === ':') { return 0 }
	        if (pos >= 3 && text[pos - 3] === '/') { return 0 }
	        return tail.match(self.re.no_http)[0].length
	      }
	      return 0
	    }
	  },
	  'mailto:': {
	    validate: function (text, pos, self) {
	      const tail = text.slice(pos);

	      if (!self.re.mailto) {
	        self.re.mailto = new RegExp(
	          '^' + self.re.src_email_name + '@' + self.re.src_host_strict, 'i'
	        );
	      }
	      if (self.re.mailto.test(tail)) {
	        return tail.match(self.re.mailto)[0].length
	      }
	      return 0
	    }
	  }
	};

	// RE pattern for 2-character tlds (autogenerated by ./support/tlds_2char_gen.js)
	/* eslint-disable-next-line max-len */
	const tlds_2ch_src_re = 'a[cdefgilmnoqrstuwxz]|b[abdefghijmnorstvwyz]|c[acdfghiklmnoruvwxyz]|d[ejkmoz]|e[cegrstu]|f[ijkmor]|g[abdefghilmnpqrstuwy]|h[kmnrtu]|i[delmnoqrst]|j[emop]|k[eghimnprwyz]|l[abcikrstuvy]|m[acdeghklmnopqrstuvwxyz]|n[acefgilopruz]|om|p[aefghklmnrstwy]|qa|r[eosuw]|s[abcdeghijklmnortuvxyz]|t[cdfghjklmnortvwz]|u[agksyz]|v[aceginu]|w[fs]|y[et]|z[amw]';

	// DON'T try to make PRs with changes. Extend TLDs with LinkifyIt.tlds() instead
	const tlds_default = 'biz|com|edu|gov|net|org|pro|web|xxx|aero|asia|coop|info|museum|name|shop|рф'.split('|');

	function resetScanCache (self) {
	  self.__index__ = -1;
	  self.__text_cache__ = '';
	}

	function createValidator (re) {
	  return function (text, pos) {
	    const tail = text.slice(pos);

	    if (re.test(tail)) {
	      return tail.match(re)[0].length
	    }
	    return 0
	  }
	}

	function createNormalizer () {
	  return function (match, self) {
	    self.normalize(match);
	  }
	}

	// Schemas compiler. Build regexps.
	//
	function compile (self) {
	  // Load & clone RE patterns.
	  const re = self.re = reFactory(self.__opts__);

	  // Define dynamic patterns
	  const tlds = self.__tlds__.slice();

	  self.onCompile();

	  if (!self.__tlds_replaced__) {
	    tlds.push(tlds_2ch_src_re);
	  }
	  tlds.push(re.src_xn);

	  re.src_tlds = tlds.join('|');

	  function untpl (tpl) { return tpl.replace('%TLDS%', re.src_tlds) }

	  re.email_fuzzy = RegExp(untpl(re.tpl_email_fuzzy), 'i');
	  re.link_fuzzy = RegExp(untpl(re.tpl_link_fuzzy), 'i');
	  re.link_no_ip_fuzzy = RegExp(untpl(re.tpl_link_no_ip_fuzzy), 'i');
	  re.host_fuzzy_test = RegExp(untpl(re.tpl_host_fuzzy_test), 'i');

	  //
	  // Compile each schema
	  //

	  const aliases = [];

	  self.__compiled__ = {}; // Reset compiled data

	  function schemaError (name, val) {
	    throw new Error('(LinkifyIt) Invalid schema "' + name + '": ' + val)
	  }

	  Object.keys(self.__schemas__).forEach(function (name) {
	    const val = self.__schemas__[name];

	    // skip disabled methods
	    if (val === null) { return }

	    const compiled = { validate: null, link: null };

	    self.__compiled__[name] = compiled;

	    if (isObject(val)) {
	      if (isRegExp(val.validate)) {
	        compiled.validate = createValidator(val.validate);
	      } else if (isFunction(val.validate)) {
	        compiled.validate = val.validate;
	      } else {
	        schemaError(name, val);
	      }

	      if (isFunction(val.normalize)) {
	        compiled.normalize = val.normalize;
	      } else if (!val.normalize) {
	        compiled.normalize = createNormalizer();
	      } else {
	        schemaError(name, val);
	      }

	      return
	    }

	    if (isString(val)) {
	      aliases.push(name);
	      return
	    }

	    schemaError(name, val);
	  });

	  //
	  // Compile postponed aliases
	  //

	  aliases.forEach(function (alias) {
	    if (!self.__compiled__[self.__schemas__[alias]]) {
	      // Silently fail on missed schemas to avoid errons on disable.
	      // schemaError(alias, self.__schemas__[alias]);
	      return
	    }

	    self.__compiled__[alias].validate =
	      self.__compiled__[self.__schemas__[alias]].validate;
	    self.__compiled__[alias].normalize =
	      self.__compiled__[self.__schemas__[alias]].normalize;
	  });

	  //
	  // Fake record for guessed links
	  //
	  self.__compiled__[''] = { validate: null, normalize: createNormalizer() };

	  //
	  // Build schema condition
	  //
	  const slist = Object.keys(self.__compiled__)
	    .filter(function (name) {
	      // Filter disabled & fake schemas
	      return name.length > 0 && self.__compiled__[name]
	    })
	    .map(escapeRE)
	    .join('|');
	  // (?!_) cause 1.5x slowdown
	  self.re.schema_test = RegExp('(^|(?!_)(?:[><\uff5c]|' + re.src_ZPCc + '))(' + slist + ')', 'i');
	  self.re.schema_search = RegExp('(^|(?!_)(?:[><\uff5c]|' + re.src_ZPCc + '))(' + slist + ')', 'ig');
	  self.re.schema_at_start = RegExp('^' + self.re.schema_search.source, 'i');

	  self.re.pretest = RegExp(
	    '(' + self.re.schema_test.source + ')|(' + self.re.host_fuzzy_test.source + ')|@',
	    'i'
	  );

	  //
	  // Cleanup
	  //

	  resetScanCache(self);
	}

	/**
	 * class Match
	 *
	 * Match result. Single element of array, returned by [[LinkifyIt#match]]
	 **/
	function Match (self, shift) {
	  const start = self.__index__;
	  const end = self.__last_index__;
	  const text = self.__text_cache__.slice(start, end);

	  /**
	   * Match#schema -> String
	   *
	   * Prefix (protocol) for matched string.
	   **/
	  this.schema = self.__schema__.toLowerCase();
	  /**
	   * Match#index -> Number
	   *
	   * First position of matched string.
	   **/
	  this.index = start + shift;
	  /**
	   * Match#lastIndex -> Number
	   *
	   * Next position after matched string.
	   **/
	  this.lastIndex = end + shift;
	  /**
	   * Match#raw -> String
	   *
	   * Matched string.
	   **/
	  this.raw = text;
	  /**
	   * Match#text -> String
	   *
	   * Notmalized text of matched string.
	   **/
	  this.text = text;
	  /**
	   * Match#url -> String
	   *
	   * Normalized url of matched string.
	   **/
	  this.url = text;
	}

	function createMatch (self, shift) {
	  const match = new Match(self, shift);

	  self.__compiled__[match.schema].normalize(match, self);

	  return match
	}

	/**
	 * class LinkifyIt
	 **/

	/**
	 * new LinkifyIt(schemas, options)
	 * - schemas (Object): Optional. Additional schemas to validate (prefix/validator)
	 * - options (Object): { fuzzyLink|fuzzyEmail|fuzzyIP: true|false }
	 *
	 * Creates new linkifier instance with optional additional schemas.
	 * Can be called without `new` keyword for convenience.
	 *
	 * By default understands:
	 *
	 * - `http(s)://...` , `ftp://...`, `mailto:...` & `//...` links
	 * - "fuzzy" links and emails (example.com, foo@bar.com).
	 *
	 * `schemas` is an object, where each key/value describes protocol/rule:
	 *
	 * - __key__ - link prefix (usually, protocol name with `:` at the end, `skype:`
	 *   for example). `linkify-it` makes shure that prefix is not preceeded with
	 *   alphanumeric char and symbols. Only whitespaces and punctuation allowed.
	 * - __value__ - rule to check tail after link prefix
	 *   - _String_ - just alias to existing rule
	 *   - _Object_
	 *     - _validate_ - validator function (should return matched length on success),
	 *       or `RegExp`.
	 *     - _normalize_ - optional function to normalize text & url of matched result
	 *       (for example, for @twitter mentions).
	 *
	 * `options`:
	 *
	 * - __fuzzyLink__ - recognige URL-s without `http(s):` prefix. Default `true`.
	 * - __fuzzyIP__ - allow IPs in fuzzy links above. Can conflict with some texts
	 *   like version numbers. Default `false`.
	 * - __fuzzyEmail__ - recognize emails without `mailto:` prefix.
	 *
	 **/
	function LinkifyIt (schemas, options) {
	  if (!(this instanceof LinkifyIt)) {
	    return new LinkifyIt(schemas, options)
	  }

	  if (!options) {
	    if (isOptionsObj(schemas)) {
	      options = schemas;
	      schemas = {};
	    }
	  }

	  this.__opts__ = assign({}, defaultOptions, options);

	  // Cache last tested result. Used to skip repeating steps on next `match` call.
	  this.__index__ = -1;
	  this.__last_index__ = -1; // Next scan position
	  this.__schema__ = '';
	  this.__text_cache__ = '';

	  this.__schemas__ = assign({}, defaultSchemas, schemas);
	  this.__compiled__ = {};

	  this.__tlds__ = tlds_default;
	  this.__tlds_replaced__ = false;

	  this.re = {};

	  compile(this);
	}

	/** chainable
	 * LinkifyIt#add(schema, definition)
	 * - schema (String): rule name (fixed pattern prefix)
	 * - definition (String|RegExp|Object): schema definition
	 *
	 * Add new rule definition. See constructor description for details.
	 **/
	LinkifyIt.prototype.add = function add (schema, definition) {
	  this.__schemas__[schema] = definition;
	  compile(this);
	  return this
	};

	/** chainable
	 * LinkifyIt#set(options)
	 * - options (Object): { fuzzyLink|fuzzyEmail|fuzzyIP: true|false }
	 *
	 * Set recognition options for links without schema.
	 **/
	LinkifyIt.prototype.set = function set (options) {
	  this.__opts__ = assign(this.__opts__, options);
	  return this
	};

	/**
	 * LinkifyIt#test(text) -> Boolean
	 *
	 * Searches linkifiable pattern and returns `true` on success or `false` on fail.
	 **/
	LinkifyIt.prototype.test = function test (text) {
	  // Reset scan cache
	  this.__text_cache__ = text;
	  this.__index__ = -1;

	  if (!text.length) { return false }

	  let m, ml, me, len, shift, next, re, tld_pos, at_pos;

	  // try to scan for link with schema - that's the most simple rule
	  if (this.re.schema_test.test(text)) {
	    re = this.re.schema_search;
	    re.lastIndex = 0;
	    while ((m = re.exec(text)) !== null) {
	      len = this.testSchemaAt(text, m[2], re.lastIndex);
	      if (len) {
	        this.__schema__ = m[2];
	        this.__index__ = m.index + m[1].length;
	        this.__last_index__ = m.index + m[0].length + len;
	        break
	      }
	    }
	  }

	  if (this.__opts__.fuzzyLink && this.__compiled__['http:']) {
	    // guess schemaless links
	    tld_pos = text.search(this.re.host_fuzzy_test);
	    if (tld_pos >= 0) {
	      // if tld is located after found link - no need to check fuzzy pattern
	      if (this.__index__ < 0 || tld_pos < this.__index__) {
	        if ((ml = text.match(this.__opts__.fuzzyIP ? this.re.link_fuzzy : this.re.link_no_ip_fuzzy)) !== null) {
	          shift = ml.index + ml[1].length;

	          if (this.__index__ < 0 || shift < this.__index__) {
	            this.__schema__ = '';
	            this.__index__ = shift;
	            this.__last_index__ = ml.index + ml[0].length;
	          }
	        }
	      }
	    }
	  }

	  if (this.__opts__.fuzzyEmail && this.__compiled__['mailto:']) {
	    // guess schemaless emails
	    at_pos = text.indexOf('@');
	    if (at_pos >= 0) {
	      // We can't skip this check, because this cases are possible:
	      // 192.168.1.1@gmail.com, my.in@example.com
	      if ((me = text.match(this.re.email_fuzzy)) !== null) {
	        shift = me.index + me[1].length;
	        next = me.index + me[0].length;

	        if (this.__index__ < 0 || shift < this.__index__ ||
	            (shift === this.__index__ && next > this.__last_index__)) {
	          this.__schema__ = 'mailto:';
	          this.__index__ = shift;
	          this.__last_index__ = next;
	        }
	      }
	    }
	  }

	  return this.__index__ >= 0
	};

	/**
	 * LinkifyIt#pretest(text) -> Boolean
	 *
	 * Very quick check, that can give false positives. Returns true if link MAY BE
	 * can exists. Can be used for speed optimization, when you need to check that
	 * link NOT exists.
	 **/
	LinkifyIt.prototype.pretest = function pretest (text) {
	  return this.re.pretest.test(text)
	};

	/**
	 * LinkifyIt#testSchemaAt(text, name, position) -> Number
	 * - text (String): text to scan
	 * - name (String): rule (schema) name
	 * - position (Number): text offset to check from
	 *
	 * Similar to [[LinkifyIt#test]] but checks only specific protocol tail exactly
	 * at given position. Returns length of found pattern (0 on fail).
	 **/
	LinkifyIt.prototype.testSchemaAt = function testSchemaAt (text, schema, pos) {
	  // If not supported schema check requested - terminate
	  if (!this.__compiled__[schema.toLowerCase()]) {
	    return 0
	  }
	  return this.__compiled__[schema.toLowerCase()].validate(text, pos, this)
	};

	/**
	 * LinkifyIt#match(text) -> Array|null
	 *
	 * Returns array of found link descriptions or `null` on fail. We strongly
	 * recommend to use [[LinkifyIt#test]] first, for best speed.
	 *
	 * ##### Result match description
	 *
	 * - __schema__ - link schema, can be empty for fuzzy links, or `//` for
	 *   protocol-neutral  links.
	 * - __index__ - offset of matched text
	 * - __lastIndex__ - index of next char after mathch end
	 * - __raw__ - matched text
	 * - __text__ - normalized text
	 * - __url__ - link, generated from matched text
	 **/
	LinkifyIt.prototype.match = function match (text) {
	  const result = [];
	  let shift = 0;

	  // Try to take previous element from cache, if .test() called before
	  if (this.__index__ >= 0 && this.__text_cache__ === text) {
	    result.push(createMatch(this, shift));
	    shift = this.__last_index__;
	  }

	  // Cut head if cache was used
	  let tail = shift ? text.slice(shift) : text;

	  // Scan string until end reached
	  while (this.test(tail)) {
	    result.push(createMatch(this, shift));

	    tail = tail.slice(this.__last_index__);
	    shift += this.__last_index__;
	  }

	  if (result.length) {
	    return result
	  }

	  return null
	};

	/**
	 * LinkifyIt#matchAtStart(text) -> Match|null
	 *
	 * Returns fully-formed (not fuzzy) link if it starts at the beginning
	 * of the string, and null otherwise.
	 **/
	LinkifyIt.prototype.matchAtStart = function matchAtStart (text) {
	  // Reset scan cache
	  this.__text_cache__ = text;
	  this.__index__ = -1;

	  if (!text.length) return null

	  const m = this.re.schema_at_start.exec(text);
	  if (!m) return null

	  const len = this.testSchemaAt(text, m[2], m[0].length);
	  if (!len) return null

	  this.__schema__ = m[2];
	  this.__index__ = m.index + m[1].length;
	  this.__last_index__ = m.index + m[0].length + len;

	  return createMatch(this, 0)
	};

	/** chainable
	 * LinkifyIt#tlds(list [, keepOld]) -> this
	 * - list (Array): list of tlds
	 * - keepOld (Boolean): merge with current list if `true` (`false` by default)
	 *
	 * Load (or merge) new tlds list. Those are user for fuzzy links (without prefix)
	 * to avoid false positives. By default this algorythm used:
	 *
	 * - hostname with any 2-letter root zones are ok.
	 * - biz|com|edu|gov|net|org|pro|web|xxx|aero|asia|coop|info|museum|name|shop|рф
	 *   are ok.
	 * - encoded (`xn--...`) root zones are ok.
	 *
	 * If list is replaced, then exact match for 2-chars root zones will be checked.
	 **/
	LinkifyIt.prototype.tlds = function tlds (list, keepOld) {
	  list = Array.isArray(list) ? list : [list];

	  if (!keepOld) {
	    this.__tlds__ = list.slice();
	    this.__tlds_replaced__ = true;
	    compile(this);
	    return this
	  }

	  this.__tlds__ = this.__tlds__.concat(list)
	    .sort()
	    .filter(function (el, idx, arr) {
	      return el !== arr[idx - 1]
	    })
	    .reverse();

	  compile(this);
	  return this
	};

	/**
	 * LinkifyIt#normalize(match)
	 *
	 * Default normalizer (if schema does not define it's own).
	 **/
	LinkifyIt.prototype.normalize = function normalize (match) {
	  // Do minimal possible changes by default. Need to collect feedback prior
	  // to move forward https://github.com/markdown-it/linkify-it/issues/1

	  if (!match.schema) { match.url = 'http://' + match.url; }

	  if (match.schema === 'mailto:' && !/^mailto:/i.test(match.url)) {
	    match.url = 'mailto:' + match.url;
	  }
	};

	/**
	 * LinkifyIt#onCompile()
	 *
	 * Override to modify basic RegExp-s.
	 **/
	LinkifyIt.prototype.onCompile = function onCompile () {
	};

	index_cjs$6 = LinkifyIt;
	return index_cjs$6;
}

/** Highest positive signed 32-bit float value */
const maxInt = 2147483647; // aka. 0x7FFFFFFF or 2^31-1

/** Bootstring parameters */
const base = 36;
const tMin = 1;
const tMax = 26;
const skew = 38;
const damp = 700;
const initialBias = 72;
const initialN = 128; // 0x80
const delimiter = '-'; // '\x2D'

/** Regular expressions */
const regexPunycode = /^xn--/;
const regexNonASCII = /[^\0-\x7F]/; // Note: U+007F DEL is excluded too.
const regexSeparators = /[\x2E\u3002\uFF0E\uFF61]/g; // RFC 3490 separators

/** Error messages */
const errors = {
	'overflow': 'Overflow: input needs wider integers to process',
	'not-basic': 'Illegal input >= 0x80 (not a basic code point)',
	'invalid-input': 'Invalid input'
};

/** Convenience shortcuts */
const baseMinusTMin = base - tMin;
const floor = Math.floor;
const stringFromCharCode = String.fromCharCode;

/*--------------------------------------------------------------------------*/

/**
 * A generic error utility function.
 * @private
 * @param {String} type The error type.
 * @returns {Error} Throws a `RangeError` with the applicable error message.
 */
function error(type) {
	throw new RangeError(errors[type]);
}

/**
 * A generic `Array#map` utility function.
 * @private
 * @param {Array} array The array to iterate over.
 * @param {Function} callback The function that gets called for every array
 * item.
 * @returns {Array} A new array of values returned by the callback function.
 */
function map(array, callback) {
	const result = [];
	let length = array.length;
	while (length--) {
		result[length] = callback(array[length]);
	}
	return result;
}

/**
 * A simple `Array#map`-like wrapper to work with domain name strings or email
 * addresses.
 * @private
 * @param {String} domain The domain name or email address.
 * @param {Function} callback The function that gets called for every
 * character.
 * @returns {String} A new string of characters returned by the callback
 * function.
 */
function mapDomain(domain, callback) {
	const parts = domain.split('@');
	let result = '';
	if (parts.length > 1) {
		// In email addresses, only the domain name should be punycoded. Leave
		// the local part (i.e. everything up to `@`) intact.
		result = parts[0] + '@';
		domain = parts[1];
	}
	// Avoid `split(regex)` for IE8 compatibility. See #17.
	domain = domain.replace(regexSeparators, '\x2E');
	const labels = domain.split('.');
	const encoded = map(labels, callback).join('.');
	return result + encoded;
}

/**
 * Creates an array containing the numeric code points of each Unicode
 * character in the string. While JavaScript uses UCS-2 internally,
 * this function will convert a pair of surrogate halves (each of which
 * UCS-2 exposes as separate characters) into a single code point,
 * matching UTF-16.
 * @see `punycode.ucs2.encode`
 * @see <https://mathiasbynens.be/notes/javascript-encoding>
 * @memberOf punycode.ucs2
 * @name decode
 * @param {String} string The Unicode input string (UCS-2).
 * @returns {Array} The new array of code points.
 */
function ucs2decode(string) {
	const output = [];
	let counter = 0;
	const length = string.length;
	while (counter < length) {
		const value = string.charCodeAt(counter++);
		if (value >= 0xD800 && value <= 0xDBFF && counter < length) {
			// It's a high surrogate, and there is a next character.
			const extra = string.charCodeAt(counter++);
			if ((extra & 0xFC00) == 0xDC00) { // Low surrogate.
				output.push(((value & 0x3FF) << 10) + (extra & 0x3FF) + 0x10000);
			} else {
				// It's an unmatched surrogate; only append this code unit, in case the
				// next code unit is the high surrogate of a surrogate pair.
				output.push(value);
				counter--;
			}
		} else {
			output.push(value);
		}
	}
	return output;
}

/**
 * Creates a string based on an array of numeric code points.
 * @see `punycode.ucs2.decode`
 * @memberOf punycode.ucs2
 * @name encode
 * @param {Array} codePoints The array of numeric code points.
 * @returns {String} The new Unicode string (UCS-2).
 */
const ucs2encode = codePoints => String.fromCodePoint(...codePoints);

/**
 * Converts a basic code point into a digit/integer.
 * @see `digitToBasic()`
 * @private
 * @param {Number} codePoint The basic numeric code point value.
 * @returns {Number} The numeric value of a basic code point (for use in
 * representing integers) in the range `0` to `base - 1`, or `base` if
 * the code point does not represent a value.
 */
const basicToDigit = function(codePoint) {
	if (codePoint >= 0x30 && codePoint < 0x3A) {
		return 26 + (codePoint - 0x30);
	}
	if (codePoint >= 0x41 && codePoint < 0x5B) {
		return codePoint - 0x41;
	}
	if (codePoint >= 0x61 && codePoint < 0x7B) {
		return codePoint - 0x61;
	}
	return base;
};

/**
 * Converts a digit/integer into a basic code point.
 * @see `basicToDigit()`
 * @private
 * @param {Number} digit The numeric value of a basic code point.
 * @returns {Number} The basic code point whose value (when used for
 * representing integers) is `digit`, which needs to be in the range
 * `0` to `base - 1`. If `flag` is non-zero, the uppercase form is
 * used; else, the lowercase form is used. The behavior is undefined
 * if `flag` is non-zero and `digit` has no uppercase form.
 */
const digitToBasic = function(digit, flag) {
	//  0..25 map to ASCII a..z or A..Z
	// 26..35 map to ASCII 0..9
	return digit + 22 + 75 * (digit < 26) - ((flag != 0) << 5);
};

/**
 * Bias adaptation function as per section 3.4 of RFC 3492.
 * https://tools.ietf.org/html/rfc3492#section-3.4
 * @private
 */
const adapt = function(delta, numPoints, firstTime) {
	let k = 0;
	delta = firstTime ? floor(delta / damp) : delta >> 1;
	delta += floor(delta / numPoints);
	for (/* no initialization */; delta > baseMinusTMin * tMax >> 1; k += base) {
		delta = floor(delta / baseMinusTMin);
	}
	return floor(k + (baseMinusTMin + 1) * delta / (delta + skew));
};

/**
 * Converts a Punycode string of ASCII-only symbols to a string of Unicode
 * symbols.
 * @memberOf punycode
 * @param {String} input The Punycode string of ASCII-only symbols.
 * @returns {String} The resulting string of Unicode symbols.
 */
const decode = function(input) {
	// Don't use UCS-2.
	const output = [];
	const inputLength = input.length;
	let i = 0;
	let n = initialN;
	let bias = initialBias;

	// Handle the basic code points: let `basic` be the number of input code
	// points before the last delimiter, or `0` if there is none, then copy
	// the first basic code points to the output.

	let basic = input.lastIndexOf(delimiter);
	if (basic < 0) {
		basic = 0;
	}

	for (let j = 0; j < basic; ++j) {
		// if it's not a basic code point
		if (input.charCodeAt(j) >= 0x80) {
			error('not-basic');
		}
		output.push(input.charCodeAt(j));
	}

	// Main decoding loop: start just after the last delimiter if any basic code
	// points were copied; start at the beginning otherwise.

	for (let index = basic > 0 ? basic + 1 : 0; index < inputLength; /* no final expression */) {

		// `index` is the index of the next character to be consumed.
		// Decode a generalized variable-length integer into `delta`,
		// which gets added to `i`. The overflow checking is easier
		// if we increase `i` as we go, then subtract off its starting
		// value at the end to obtain `delta`.
		const oldi = i;
		for (let w = 1, k = base; /* no condition */; k += base) {

			if (index >= inputLength) {
				error('invalid-input');
			}

			const digit = basicToDigit(input.charCodeAt(index++));

			if (digit >= base) {
				error('invalid-input');
			}
			if (digit > floor((maxInt - i) / w)) {
				error('overflow');
			}

			i += digit * w;
			const t = k <= bias ? tMin : (k >= bias + tMax ? tMax : k - bias);

			if (digit < t) {
				break;
			}

			const baseMinusT = base - t;
			if (w > floor(maxInt / baseMinusT)) {
				error('overflow');
			}

			w *= baseMinusT;

		}

		const out = output.length + 1;
		bias = adapt(i - oldi, out, oldi == 0);

		// `i` was supposed to wrap around from `out` to `0`,
		// incrementing `n` each time, so we'll fix that now:
		if (floor(i / out) > maxInt - n) {
			error('overflow');
		}

		n += floor(i / out);
		i %= out;

		// Insert `n` at position `i` of the output.
		output.splice(i++, 0, n);

	}

	return String.fromCodePoint(...output);
};

/**
 * Converts a string of Unicode symbols (e.g. a domain name label) to a
 * Punycode string of ASCII-only symbols.
 * @memberOf punycode
 * @param {String} input The string of Unicode symbols.
 * @returns {String} The resulting Punycode string of ASCII-only symbols.
 */
const encode = function(input) {
	const output = [];

	// Convert the input in UCS-2 to an array of Unicode code points.
	input = ucs2decode(input);

	// Cache the length.
	const inputLength = input.length;

	// Initialize the state.
	let n = initialN;
	let delta = 0;
	let bias = initialBias;

	// Handle the basic code points.
	for (const currentValue of input) {
		if (currentValue < 0x80) {
			output.push(stringFromCharCode(currentValue));
		}
	}

	const basicLength = output.length;
	let handledCPCount = basicLength;

	// `handledCPCount` is the number of code points that have been handled;
	// `basicLength` is the number of basic code points.

	// Finish the basic string with a delimiter unless it's empty.
	if (basicLength) {
		output.push(delimiter);
	}

	// Main encoding loop:
	while (handledCPCount < inputLength) {

		// All non-basic code points < n have been handled already. Find the next
		// larger one:
		let m = maxInt;
		for (const currentValue of input) {
			if (currentValue >= n && currentValue < m) {
				m = currentValue;
			}
		}

		// Increase `delta` enough to advance the decoder's <n,i> state to <m,0>,
		// but guard against overflow.
		const handledCPCountPlusOne = handledCPCount + 1;
		if (m - n > floor((maxInt - delta) / handledCPCountPlusOne)) {
			error('overflow');
		}

		delta += (m - n) * handledCPCountPlusOne;
		n = m;

		for (const currentValue of input) {
			if (currentValue < n && ++delta > maxInt) {
				error('overflow');
			}
			if (currentValue === n) {
				// Represent delta as a generalized variable-length integer.
				let q = delta;
				for (let k = base; /* no condition */; k += base) {
					const t = k <= bias ? tMin : (k >= bias + tMax ? tMax : k - bias);
					if (q < t) {
						break;
					}
					const qMinusT = q - t;
					const baseMinusT = base - t;
					output.push(
						stringFromCharCode(digitToBasic(t + qMinusT % baseMinusT, 0))
					);
					q = floor(qMinusT / baseMinusT);
				}

				output.push(stringFromCharCode(digitToBasic(q, 0)));
				bias = adapt(delta, handledCPCountPlusOne, handledCPCount === basicLength);
				delta = 0;
				++handledCPCount;
			}
		}

		++delta;
		++n;

	}
	return output.join('');
};

/**
 * Converts a Punycode string representing a domain name or an email address
 * to Unicode. Only the Punycoded parts of the input will be converted, i.e.
 * it doesn't matter if you call it on a string that has already been
 * converted to Unicode.
 * @memberOf punycode
 * @param {String} input The Punycoded domain name or email address to
 * convert to Unicode.
 * @returns {String} The Unicode representation of the given Punycode
 * string.
 */
const toUnicode = function(input) {
	return mapDomain(input, function(string) {
		return regexPunycode.test(string)
			? decode(string.slice(4).toLowerCase())
			: string;
	});
};

/**
 * Converts a Unicode string representing a domain name or an email address to
 * Punycode. Only the non-ASCII parts of the domain name will be converted,
 * i.e. it doesn't matter if you call it with a domain that's already in
 * ASCII.
 * @memberOf punycode
 * @param {String} input The domain name or email address to convert, as a
 * Unicode string.
 * @returns {String} The Punycode representation of the given domain name or
 * email address.
 */
const toASCII = function(input) {
	return mapDomain(input, function(string) {
		return regexNonASCII.test(string)
			? 'xn--' + encode(string)
			: string;
	});
};

/*--------------------------------------------------------------------------*/

/** Define the public API */
const punycode = {
	/**
	 * A string representing the current Punycode.js version number.
	 * @memberOf punycode
	 * @type String
	 */
	'version': '2.3.1',
	/**
	 * An object of methods to convert from JavaScript's internal character
	 * representation (UCS-2) to Unicode code points, and back.
	 * @see <https://mathiasbynens.be/notes/javascript-encoding>
	 * @memberOf punycode
	 * @type Object
	 */
	'ucs2': {
		'decode': ucs2decode,
		'encode': ucs2encode
	},
	'decode': decode,
	'encode': encode,
	'toASCII': toASCII,
	'toUnicode': toUnicode
};

var punycode_es6 = /*#__PURE__*/Object.freeze({
	__proto__: null,
	decode: decode,
	default: punycode,
	encode: encode,
	toASCII: toASCII,
	toUnicode: toUnicode,
	ucs2decode: ucs2decode,
	ucs2encode: ucs2encode
});

var require$$4 = /*@__PURE__*/getAugmentedNamespace(punycode_es6);

var index_cjs$5;
var hasRequiredIndex_cjs$5;

function requireIndex_cjs$5 () {
	if (hasRequiredIndex_cjs$5) return index_cjs$5;
	hasRequiredIndex_cjs$5 = 1;

	var mdurl = requireIndex_cjs$8();
	var ucmicro = requireIndex_cjs$7();
	var entities = /*@__PURE__*/ requireLib();
	var LinkifyIt = requireIndex_cjs$6();
	var punycode = require$$4;

	function _interopNamespaceDefault(e) {
	  var n = Object.create(null);
	  if (e) {
	    Object.keys(e).forEach(function (k) {
	      if (k !== 'default') {
	        var d = Object.getOwnPropertyDescriptor(e, k);
	        Object.defineProperty(n, k, d.get ? d : {
	          enumerable: true,
	          get: function () { return e[k]; }
	        });
	      }
	    });
	  }
	  n.default = e;
	  return Object.freeze(n);
	}

	var mdurl__namespace = /*#__PURE__*/_interopNamespaceDefault(mdurl);
	var ucmicro__namespace = /*#__PURE__*/_interopNamespaceDefault(ucmicro);

	// Utilities
	//

	function _class(obj) {
	  return Object.prototype.toString.call(obj);
	}
	function isString(obj) {
	  return _class(obj) === '[object String]';
	}
	const _hasOwnProperty = Object.prototype.hasOwnProperty;
	function has(object, key) {
	  return _hasOwnProperty.call(object, key);
	}

	// Merge objects
	//
	function assign(obj /* from1, from2, from3, ... */) {
	  const sources = Array.prototype.slice.call(arguments, 1);
	  sources.forEach(function (source) {
	    if (!source) {
	      return;
	    }
	    if (typeof source !== 'object') {
	      throw new TypeError(source + 'must be object');
	    }
	    Object.keys(source).forEach(function (key) {
	      obj[key] = source[key];
	    });
	  });
	  return obj;
	}

	// Remove element from array and put another array at those position.
	// Useful for some operations with tokens
	function arrayReplaceAt(src, pos, newElements) {
	  return [].concat(src.slice(0, pos), newElements, src.slice(pos + 1));
	}
	function isValidEntityCode(c) {
	  /* eslint no-bitwise:0 */
	  // broken sequence
	  if (c >= 0xD800 && c <= 0xDFFF) {
	    return false;
	  }
	  // never used
	  if (c >= 0xFDD0 && c <= 0xFDEF) {
	    return false;
	  }
	  if ((c & 0xFFFF) === 0xFFFF || (c & 0xFFFF) === 0xFFFE) {
	    return false;
	  }
	  // control codes
	  if (c >= 0x00 && c <= 0x08) {
	    return false;
	  }
	  if (c === 0x0B) {
	    return false;
	  }
	  if (c >= 0x0E && c <= 0x1F) {
	    return false;
	  }
	  if (c >= 0x7F && c <= 0x9F) {
	    return false;
	  }
	  // out of range
	  if (c > 0x10FFFF) {
	    return false;
	  }
	  return true;
	}
	function fromCodePoint(c) {
	  /* eslint no-bitwise:0 */
	  if (c > 0xffff) {
	    c -= 0x10000;
	    const surrogate1 = 0xd800 + (c >> 10);
	    const surrogate2 = 0xdc00 + (c & 0x3ff);
	    return String.fromCharCode(surrogate1, surrogate2);
	  }
	  return String.fromCharCode(c);
	}
	const UNESCAPE_MD_RE = /\\([!"#$%&'()*+,\-./:;<=>?@[\\\]^_`{|}~])/g;
	const ENTITY_RE = /&([a-z#][a-z0-9]{1,31});/gi;
	const UNESCAPE_ALL_RE = new RegExp(UNESCAPE_MD_RE.source + '|' + ENTITY_RE.source, 'gi');
	const DIGITAL_ENTITY_TEST_RE = /^#((?:x[a-f0-9]{1,8}|[0-9]{1,8}))$/i;
	function replaceEntityPattern(match, name) {
	  if (name.charCodeAt(0) === 0x23 /* # */ && DIGITAL_ENTITY_TEST_RE.test(name)) {
	    const code = name[1].toLowerCase() === 'x' ? parseInt(name.slice(2), 16) : parseInt(name.slice(1), 10);
	    if (isValidEntityCode(code)) {
	      return fromCodePoint(code);
	    }
	    return match;
	  }
	  const decoded = entities.decodeHTML(match);
	  if (decoded !== match) {
	    return decoded;
	  }
	  return match;
	}

	/* function replaceEntities(str) {
	  if (str.indexOf('&') < 0) { return str; }

	  return str.replace(ENTITY_RE, replaceEntityPattern);
	} */

	function unescapeMd(str) {
	  if (str.indexOf('\\') < 0) {
	    return str;
	  }
	  return str.replace(UNESCAPE_MD_RE, '$1');
	}
	function unescapeAll(str) {
	  if (str.indexOf('\\') < 0 && str.indexOf('&') < 0) {
	    return str;
	  }
	  return str.replace(UNESCAPE_ALL_RE, function (match, escaped, entity) {
	    if (escaped) {
	      return escaped;
	    }
	    return replaceEntityPattern(match, entity);
	  });
	}
	const HTML_ESCAPE_TEST_RE = /[&<>"]/;
	const HTML_ESCAPE_REPLACE_RE = /[&<>"]/g;
	const HTML_REPLACEMENTS = {
	  '&': '&amp;',
	  '<': '&lt;',
	  '>': '&gt;',
	  '"': '&quot;'
	};
	function replaceUnsafeChar(ch) {
	  return HTML_REPLACEMENTS[ch];
	}
	function escapeHtml(str) {
	  if (HTML_ESCAPE_TEST_RE.test(str)) {
	    return str.replace(HTML_ESCAPE_REPLACE_RE, replaceUnsafeChar);
	  }
	  return str;
	}
	const REGEXP_ESCAPE_RE = /[.?*+^$[\]\\(){}|-]/g;
	function escapeRE(str) {
	  return str.replace(REGEXP_ESCAPE_RE, '\\$&');
	}
	function isSpace(code) {
	  switch (code) {
	    case 0x09:
	    case 0x20:
	      return true;
	  }
	  return false;
	}

	// Zs (unicode class) || [\t\f\v\r\n]
	function isWhiteSpace(code) {
	  if (code >= 0x2000 && code <= 0x200A) {
	    return true;
	  }
	  switch (code) {
	    case 0x09: // \t
	    case 0x0A: // \n
	    case 0x0B: // \v
	    case 0x0C: // \f
	    case 0x0D: // \r
	    case 0x20:
	    case 0xA0:
	    case 0x1680:
	    case 0x202F:
	    case 0x205F:
	    case 0x3000:
	      return true;
	  }
	  return false;
	}

	/* eslint-disable max-len */

	// Currently without astral characters support.
	function isPunctChar(ch) {
	  return ucmicro__namespace.P.test(ch) || ucmicro__namespace.S.test(ch);
	}

	// Markdown ASCII punctuation characters.
	//
	// !, ", #, $, %, &, ', (, ), *, +, ,, -, ., /, :, ;, <, =, >, ?, @, [, \, ], ^, _, `, {, |, }, or ~
	// http://spec.commonmark.org/0.15/#ascii-punctuation-character
	//
	// Don't confuse with unicode punctuation !!! It lacks some chars in ascii range.
	//
	function isMdAsciiPunct(ch) {
	  switch (ch) {
	    case 0x21 /* ! */:
	    case 0x22 /* " */:
	    case 0x23 /* # */:
	    case 0x24 /* $ */:
	    case 0x25 /* % */:
	    case 0x26 /* & */:
	    case 0x27 /* ' */:
	    case 0x28 /* ( */:
	    case 0x29 /* ) */:
	    case 0x2A /* * */:
	    case 0x2B /* + */:
	    case 0x2C /* , */:
	    case 0x2D /* - */:
	    case 0x2E /* . */:
	    case 0x2F /* / */:
	    case 0x3A /* : */:
	    case 0x3B /* ; */:
	    case 0x3C /* < */:
	    case 0x3D /* = */:
	    case 0x3E /* > */:
	    case 0x3F /* ? */:
	    case 0x40 /* @ */:
	    case 0x5B /* [ */:
	    case 0x5C /* \ */:
	    case 0x5D /* ] */:
	    case 0x5E /* ^ */:
	    case 0x5F /* _ */:
	    case 0x60 /* ` */:
	    case 0x7B /* { */:
	    case 0x7C /* | */:
	    case 0x7D /* } */:
	    case 0x7E /* ~ */:
	      return true;
	    default:
	      return false;
	  }
	}

	// Hepler to unify [reference labels].
	//
	function normalizeReference(str) {
	  // Trim and collapse whitespace
	  //
	  str = str.trim().replace(/\s+/g, ' ');

	  // In node v10 'ẞ'.toLowerCase() === 'Ṿ', which is presumed to be a bug
	  // fixed in v12 (couldn't find any details).
	  //
	  // So treat this one as a special case
	  // (remove this when node v10 is no longer supported).
	  //
	  if ('ẞ'.toLowerCase() === 'Ṿ') {
	    str = str.replace(/ẞ/g, 'ß');
	  }

	  // .toLowerCase().toUpperCase() should get rid of all differences
	  // between letter variants.
	  //
	  // Simple .toLowerCase() doesn't normalize 125 code points correctly,
	  // and .toUpperCase doesn't normalize 6 of them (list of exceptions:
	  // İ, ϴ, ẞ, Ω, K, Å - those are already uppercased, but have differently
	  // uppercased versions).
	  //
	  // Here's an example showing how it happens. Lets take greek letter omega:
	  // uppercase U+0398 (Θ), U+03f4 (ϴ) and lowercase U+03b8 (θ), U+03d1 (ϑ)
	  //
	  // Unicode entries:
	  // 0398;GREEK CAPITAL LETTER THETA;Lu;0;L;;;;;N;;;;03B8;
	  // 03B8;GREEK SMALL LETTER THETA;Ll;0;L;;;;;N;;;0398;;0398
	  // 03D1;GREEK THETA SYMBOL;Ll;0;L;<compat> 03B8;;;;N;GREEK SMALL LETTER SCRIPT THETA;;0398;;0398
	  // 03F4;GREEK CAPITAL THETA SYMBOL;Lu;0;L;<compat> 0398;;;;N;;;;03B8;
	  //
	  // Case-insensitive comparison should treat all of them as equivalent.
	  //
	  // But .toLowerCase() doesn't change ϑ (it's already lowercase),
	  // and .toUpperCase() doesn't change ϴ (already uppercase).
	  //
	  // Applying first lower then upper case normalizes any character:
	  // '\u0398\u03f4\u03b8\u03d1'.toLowerCase().toUpperCase() === '\u0398\u0398\u0398\u0398'
	  //
	  // Note: this is equivalent to unicode case folding; unicode normalization
	  // is a different step that is not required here.
	  //
	  // Final result should be uppercased, because it's later stored in an object
	  // (this avoid a conflict with Object.prototype members,
	  // most notably, `__proto__`)
	  //
	  return str.toLowerCase().toUpperCase();
	}

	// Re-export libraries commonly used in both markdown-it and its plugins,
	// so plugins won't have to depend on them explicitly, which reduces their
	// bundled size (e.g. a browser build).
	//
	const lib = {
	  mdurl: mdurl__namespace,
	  ucmicro: ucmicro__namespace
	};

	var utils = /*#__PURE__*/Object.freeze({
	  __proto__: null,
	  arrayReplaceAt: arrayReplaceAt,
	  assign: assign,
	  escapeHtml: escapeHtml,
	  escapeRE: escapeRE,
	  fromCodePoint: fromCodePoint,
	  has: has,
	  isMdAsciiPunct: isMdAsciiPunct,
	  isPunctChar: isPunctChar,
	  isSpace: isSpace,
	  isString: isString,
	  isValidEntityCode: isValidEntityCode,
	  isWhiteSpace: isWhiteSpace,
	  lib: lib,
	  normalizeReference: normalizeReference,
	  unescapeAll: unescapeAll,
	  unescapeMd: unescapeMd
	});

	// Parse link label
	//
	// this function assumes that first character ("[") already matches;
	// returns the end of the label
	//

	function parseLinkLabel(state, start, disableNested) {
	  let level, found, marker, prevPos;
	  const max = state.posMax;
	  const oldPos = state.pos;
	  state.pos = start + 1;
	  level = 1;
	  while (state.pos < max) {
	    marker = state.src.charCodeAt(state.pos);
	    if (marker === 0x5D /* ] */) {
	      level--;
	      if (level === 0) {
	        found = true;
	        break;
	      }
	    }
	    prevPos = state.pos;
	    state.md.inline.skipToken(state);
	    if (marker === 0x5B /* [ */) {
	      if (prevPos === state.pos - 1) {
	        // increase level if we find text `[`, which is not a part of any token
	        level++;
	      } else if (disableNested) {
	        state.pos = oldPos;
	        return -1;
	      }
	    }
	  }
	  let labelEnd = -1;
	  if (found) {
	    labelEnd = state.pos;
	  }

	  // restore old state
	  state.pos = oldPos;
	  return labelEnd;
	}

	// Parse link destination
	//

	function parseLinkDestination(str, start, max) {
	  let code;
	  let pos = start;
	  const result = {
	    ok: false,
	    pos: 0,
	    str: ''
	  };
	  if (str.charCodeAt(pos) === 0x3C /* < */) {
	    pos++;
	    while (pos < max) {
	      code = str.charCodeAt(pos);
	      if (code === 0x0A /* \n */) {
	        return result;
	      }
	      if (code === 0x3C /* < */) {
	        return result;
	      }
	      if (code === 0x3E /* > */) {
	        result.pos = pos + 1;
	        result.str = unescapeAll(str.slice(start + 1, pos));
	        result.ok = true;
	        return result;
	      }
	      if (code === 0x5C /* \ */ && pos + 1 < max) {
	        pos += 2;
	        continue;
	      }
	      pos++;
	    }

	    // no closing '>'
	    return result;
	  }

	  // this should be ... } else { ... branch

	  let level = 0;
	  while (pos < max) {
	    code = str.charCodeAt(pos);
	    if (code === 0x20) {
	      break;
	    }

	    // ascii control characters
	    if (code < 0x20 || code === 0x7F) {
	      break;
	    }
	    if (code === 0x5C /* \ */ && pos + 1 < max) {
	      if (str.charCodeAt(pos + 1) === 0x20) {
	        break;
	      }
	      pos += 2;
	      continue;
	    }
	    if (code === 0x28 /* ( */) {
	      level++;
	      if (level > 32) {
	        return result;
	      }
	    }
	    if (code === 0x29 /* ) */) {
	      if (level === 0) {
	        break;
	      }
	      level--;
	    }
	    pos++;
	  }
	  if (start === pos) {
	    return result;
	  }
	  if (level !== 0) {
	    return result;
	  }
	  result.str = unescapeAll(str.slice(start, pos));
	  result.pos = pos;
	  result.ok = true;
	  return result;
	}

	// Parse link title
	//


	// Parse link title within `str` in [start, max] range,
	// or continue previous parsing if `prev_state` is defined (equal to result of last execution).
	//
	function parseLinkTitle(str, start, max, prev_state) {
	  let code;
	  let pos = start;
	  const state = {
	    // if `true`, this is a valid link title
	    ok: false,
	    // if `true`, this link can be continued on the next line
	    can_continue: false,
	    // if `ok`, it's the position of the first character after the closing marker
	    pos: 0,
	    // if `ok`, it's the unescaped title
	    str: '',
	    // expected closing marker character code
	    marker: 0
	  };
	  if (prev_state) {
	    // this is a continuation of a previous parseLinkTitle call on the next line,
	    // used in reference links only
	    state.str = prev_state.str;
	    state.marker = prev_state.marker;
	  } else {
	    if (pos >= max) {
	      return state;
	    }
	    let marker = str.charCodeAt(pos);
	    if (marker !== 0x22 /* " */ && marker !== 0x27 /* ' */ && marker !== 0x28 /* ( */) {
	      return state;
	    }
	    start++;
	    pos++;

	    // if opening marker is "(", switch it to closing marker ")"
	    if (marker === 0x28) {
	      marker = 0x29;
	    }
	    state.marker = marker;
	  }
	  while (pos < max) {
	    code = str.charCodeAt(pos);
	    if (code === state.marker) {
	      state.pos = pos + 1;
	      state.str += unescapeAll(str.slice(start, pos));
	      state.ok = true;
	      return state;
	    } else if (code === 0x28 /* ( */ && state.marker === 0x29 /* ) */) {
	      return state;
	    } else if (code === 0x5C /* \ */ && pos + 1 < max) {
	      pos++;
	    }
	    pos++;
	  }

	  // no closing marker found, but this link title may continue on the next line (for references)
	  state.can_continue = true;
	  state.str += unescapeAll(str.slice(start, pos));
	  return state;
	}

	// Just a shortcut for bulk export

	var helpers = /*#__PURE__*/Object.freeze({
	  __proto__: null,
	  parseLinkDestination: parseLinkDestination,
	  parseLinkLabel: parseLinkLabel,
	  parseLinkTitle: parseLinkTitle
	});

	/**
	 * class Renderer
	 *
	 * Generates HTML from parsed token stream. Each instance has independent
	 * copy of rules. Those can be rewritten with ease. Also, you can add new
	 * rules if you create plugin and adds new token types.
	 **/

	const default_rules = {};
	default_rules.code_inline = function (tokens, idx, options, env, slf) {
	  const token = tokens[idx];
	  return '<code' + slf.renderAttrs(token) + '>' + escapeHtml(token.content) + '</code>';
	};
	default_rules.code_block = function (tokens, idx, options, env, slf) {
	  const token = tokens[idx];
	  return '<pre' + slf.renderAttrs(token) + '><code>' + escapeHtml(tokens[idx].content) + '</code></pre>\n';
	};
	default_rules.fence = function (tokens, idx, options, env, slf) {
	  const token = tokens[idx];
	  const info = token.info ? unescapeAll(token.info).trim() : '';
	  let langName = '';
	  let langAttrs = '';
	  if (info) {
	    const arr = info.split(/(\s+)/g);
	    langName = arr[0];
	    langAttrs = arr.slice(2).join('');
	  }
	  let highlighted;
	  if (options.highlight) {
	    highlighted = options.highlight(token.content, langName, langAttrs) || escapeHtml(token.content);
	  } else {
	    highlighted = escapeHtml(token.content);
	  }
	  if (highlighted.indexOf('<pre') === 0) {
	    return highlighted + '\n';
	  }

	  // If language exists, inject class gently, without modifying original token.
	  // May be, one day we will add .deepClone() for token and simplify this part, but
	  // now we prefer to keep things local.
	  if (info) {
	    const i = token.attrIndex('class');
	    const tmpAttrs = token.attrs ? token.attrs.slice() : [];
	    if (i < 0) {
	      tmpAttrs.push(['class', options.langPrefix + langName]);
	    } else {
	      tmpAttrs[i] = tmpAttrs[i].slice();
	      tmpAttrs[i][1] += ' ' + options.langPrefix + langName;
	    }

	    // Fake token just to render attributes
	    const tmpToken = {
	      attrs: tmpAttrs
	    };
	    return `<pre><code${slf.renderAttrs(tmpToken)}>${highlighted}</code></pre>\n`;
	  }
	  return `<pre><code${slf.renderAttrs(token)}>${highlighted}</code></pre>\n`;
	};
	default_rules.image = function (tokens, idx, options, env, slf) {
	  const token = tokens[idx];

	  // "alt" attr MUST be set, even if empty. Because it's mandatory and
	  // should be placed on proper position for tests.
	  //
	  // Replace content with actual value

	  token.attrs[token.attrIndex('alt')][1] = slf.renderInlineAsText(token.children, options, env);
	  return slf.renderToken(tokens, idx, options);
	};
	default_rules.hardbreak = function (tokens, idx, options /*, env */) {
	  return options.xhtmlOut ? '<br />\n' : '<br>\n';
	};
	default_rules.softbreak = function (tokens, idx, options /*, env */) {
	  return options.breaks ? options.xhtmlOut ? '<br />\n' : '<br>\n' : '\n';
	};
	default_rules.text = function (tokens, idx /*, options, env */) {
	  return escapeHtml(tokens[idx].content);
	};
	default_rules.html_block = function (tokens, idx /*, options, env */) {
	  return tokens[idx].content;
	};
	default_rules.html_inline = function (tokens, idx /*, options, env */) {
	  return tokens[idx].content;
	};

	/**
	 * new Renderer()
	 *
	 * Creates new [[Renderer]] instance and fill [[Renderer#rules]] with defaults.
	 **/
	function Renderer() {
	  /**
	   * Renderer#rules -> Object
	   *
	   * Contains render rules for tokens. Can be updated and extended.
	   *
	   * ##### Example
	   *
	   * ```javascript
	   * var md = require('markdown-it')();
	   *
	   * md.renderer.rules.strong_open  = function () { return '<b>'; };
	   * md.renderer.rules.strong_close = function () { return '</b>'; };
	   *
	   * var result = md.renderInline(...);
	   * ```
	   *
	   * Each rule is called as independent static function with fixed signature:
	   *
	   * ```javascript
	   * function my_token_render(tokens, idx, options, env, renderer) {
	   *   // ...
	   *   return renderedHTML;
	   * }
	   * ```
	   *
	   * See [source code](https://github.com/markdown-it/markdown-it/blob/master/lib/renderer.mjs)
	   * for more details and examples.
	   **/
	  this.rules = assign({}, default_rules);
	}

	/**
	 * Renderer.renderAttrs(token) -> String
	 *
	 * Render token attributes to string.
	 **/
	Renderer.prototype.renderAttrs = function renderAttrs(token) {
	  let i, l, result;
	  if (!token.attrs) {
	    return '';
	  }
	  result = '';
	  for (i = 0, l = token.attrs.length; i < l; i++) {
	    result += ' ' + escapeHtml(token.attrs[i][0]) + '="' + escapeHtml(token.attrs[i][1]) + '"';
	  }
	  return result;
	};

	/**
	 * Renderer.renderToken(tokens, idx, options) -> String
	 * - tokens (Array): list of tokens
	 * - idx (Numbed): token index to render
	 * - options (Object): params of parser instance
	 *
	 * Default token renderer. Can be overriden by custom function
	 * in [[Renderer#rules]].
	 **/
	Renderer.prototype.renderToken = function renderToken(tokens, idx, options) {
	  const token = tokens[idx];
	  let result = '';

	  // Tight list paragraphs
	  if (token.hidden) {
	    return '';
	  }

	  // Insert a newline between hidden paragraph and subsequent opening
	  // block-level tag.
	  //
	  // For example, here we should insert a newline before blockquote:
	  //  - a
	  //    >
	  //
	  if (token.block && token.nesting !== -1 && idx && tokens[idx - 1].hidden) {
	    result += '\n';
	  }

	  // Add token name, e.g. `<img`
	  result += (token.nesting === -1 ? '</' : '<') + token.tag;

	  // Encode attributes, e.g. `<img src="foo"`
	  result += this.renderAttrs(token);

	  // Add a slash for self-closing tags, e.g. `<img src="foo" /`
	  if (token.nesting === 0 && options.xhtmlOut) {
	    result += ' /';
	  }

	  // Check if we need to add a newline after this tag
	  let needLf = false;
	  if (token.block) {
	    needLf = true;
	    if (token.nesting === 1) {
	      if (idx + 1 < tokens.length) {
	        const nextToken = tokens[idx + 1];
	        if (nextToken.type === 'inline' || nextToken.hidden) {
	          // Block-level tag containing an inline tag.
	          //
	          needLf = false;
	        } else if (nextToken.nesting === -1 && nextToken.tag === token.tag) {
	          // Opening tag + closing tag of the same type. E.g. `<li></li>`.
	          //
	          needLf = false;
	        }
	      }
	    }
	  }
	  result += needLf ? '>\n' : '>';
	  return result;
	};

	/**
	 * Renderer.renderInline(tokens, options, env) -> String
	 * - tokens (Array): list on block tokens to render
	 * - options (Object): params of parser instance
	 * - env (Object): additional data from parsed input (references, for example)
	 *
	 * The same as [[Renderer.render]], but for single token of `inline` type.
	 **/
	Renderer.prototype.renderInline = function (tokens, options, env) {
	  let result = '';
	  const rules = this.rules;
	  for (let i = 0, len = tokens.length; i < len; i++) {
	    const type = tokens[i].type;
	    if (typeof rules[type] !== 'undefined') {
	      result += rules[type](tokens, i, options, env, this);
	    } else {
	      result += this.renderToken(tokens, i, options);
	    }
	  }
	  return result;
	};

	/** internal
	 * Renderer.renderInlineAsText(tokens, options, env) -> String
	 * - tokens (Array): list on block tokens to render
	 * - options (Object): params of parser instance
	 * - env (Object): additional data from parsed input (references, for example)
	 *
	 * Special kludge for image `alt` attributes to conform CommonMark spec.
	 * Don't try to use it! Spec requires to show `alt` content with stripped markup,
	 * instead of simple escaping.
	 **/
	Renderer.prototype.renderInlineAsText = function (tokens, options, env) {
	  let result = '';
	  for (let i = 0, len = tokens.length; i < len; i++) {
	    switch (tokens[i].type) {
	      case 'text':
	        result += tokens[i].content;
	        break;
	      case 'image':
	        result += this.renderInlineAsText(tokens[i].children, options, env);
	        break;
	      case 'html_inline':
	      case 'html_block':
	        result += tokens[i].content;
	        break;
	      case 'softbreak':
	      case 'hardbreak':
	        result += '\n';
	        break;
	      // all other tokens are skipped
	    }
	  }
	  return result;
	};

	/**
	 * Renderer.render(tokens, options, env) -> String
	 * - tokens (Array): list on block tokens to render
	 * - options (Object): params of parser instance
	 * - env (Object): additional data from parsed input (references, for example)
	 *
	 * Takes token stream and generates HTML. Probably, you will never need to call
	 * this method directly.
	 **/
	Renderer.prototype.render = function (tokens, options, env) {
	  let result = '';
	  const rules = this.rules;
	  for (let i = 0, len = tokens.length; i < len; i++) {
	    const type = tokens[i].type;
	    if (type === 'inline') {
	      result += this.renderInline(tokens[i].children, options, env);
	    } else if (typeof rules[type] !== 'undefined') {
	      result += rules[type](tokens, i, options, env, this);
	    } else {
	      result += this.renderToken(tokens, i, options, env);
	    }
	  }
	  return result;
	};

	/**
	 * class Ruler
	 *
	 * Helper class, used by [[MarkdownIt#core]], [[MarkdownIt#block]] and
	 * [[MarkdownIt#inline]] to manage sequences of functions (rules):
	 *
	 * - keep rules in defined order
	 * - assign the name to each rule
	 * - enable/disable rules
	 * - add/replace rules
	 * - allow assign rules to additional named chains (in the same)
	 * - cacheing lists of active rules
	 *
	 * You will not need use this class directly until write plugins. For simple
	 * rules control use [[MarkdownIt.disable]], [[MarkdownIt.enable]] and
	 * [[MarkdownIt.use]].
	 **/

	/**
	 * new Ruler()
	 **/
	function Ruler() {
	  // List of added rules. Each element is:
	  //
	  // {
	  //   name: XXX,
	  //   enabled: Boolean,
	  //   fn: Function(),
	  //   alt: [ name2, name3 ]
	  // }
	  //
	  this.__rules__ = [];

	  // Cached rule chains.
	  //
	  // First level - chain name, '' for default.
	  // Second level - diginal anchor for fast filtering by charcodes.
	  //
	  this.__cache__ = null;
	}

	// Helper methods, should not be used directly

	// Find rule index by name
	//
	Ruler.prototype.__find__ = function (name) {
	  for (let i = 0; i < this.__rules__.length; i++) {
	    if (this.__rules__[i].name === name) {
	      return i;
	    }
	  }
	  return -1;
	};

	// Build rules lookup cache
	//
	Ruler.prototype.__compile__ = function () {
	  const self = this;
	  const chains = [''];

	  // collect unique names
	  self.__rules__.forEach(function (rule) {
	    if (!rule.enabled) {
	      return;
	    }
	    rule.alt.forEach(function (altName) {
	      if (chains.indexOf(altName) < 0) {
	        chains.push(altName);
	      }
	    });
	  });
	  self.__cache__ = {};
	  chains.forEach(function (chain) {
	    self.__cache__[chain] = [];
	    self.__rules__.forEach(function (rule) {
	      if (!rule.enabled) {
	        return;
	      }
	      if (chain && rule.alt.indexOf(chain) < 0) {
	        return;
	      }
	      self.__cache__[chain].push(rule.fn);
	    });
	  });
	};

	/**
	 * Ruler.at(name, fn [, options])
	 * - name (String): rule name to replace.
	 * - fn (Function): new rule function.
	 * - options (Object): new rule options (not mandatory).
	 *
	 * Replace rule by name with new function & options. Throws error if name not
	 * found.
	 *
	 * ##### Options:
	 *
	 * - __alt__ - array with names of "alternate" chains.
	 *
	 * ##### Example
	 *
	 * Replace existing typographer replacement rule with new one:
	 *
	 * ```javascript
	 * var md = require('markdown-it')();
	 *
	 * md.core.ruler.at('replacements', function replace(state) {
	 *   //...
	 * });
	 * ```
	 **/
	Ruler.prototype.at = function (name, fn, options) {
	  const index = this.__find__(name);
	  const opt = options || {};
	  if (index === -1) {
	    throw new Error('Parser rule not found: ' + name);
	  }
	  this.__rules__[index].fn = fn;
	  this.__rules__[index].alt = opt.alt || [];
	  this.__cache__ = null;
	};

	/**
	 * Ruler.before(beforeName, ruleName, fn [, options])
	 * - beforeName (String): new rule will be added before this one.
	 * - ruleName (String): name of added rule.
	 * - fn (Function): rule function.
	 * - options (Object): rule options (not mandatory).
	 *
	 * Add new rule to chain before one with given name. See also
	 * [[Ruler.after]], [[Ruler.push]].
	 *
	 * ##### Options:
	 *
	 * - __alt__ - array with names of "alternate" chains.
	 *
	 * ##### Example
	 *
	 * ```javascript
	 * var md = require('markdown-it')();
	 *
	 * md.block.ruler.before('paragraph', 'my_rule', function replace(state) {
	 *   //...
	 * });
	 * ```
	 **/
	Ruler.prototype.before = function (beforeName, ruleName, fn, options) {
	  const index = this.__find__(beforeName);
	  const opt = options || {};
	  if (index === -1) {
	    throw new Error('Parser rule not found: ' + beforeName);
	  }
	  this.__rules__.splice(index, 0, {
	    name: ruleName,
	    enabled: true,
	    fn,
	    alt: opt.alt || []
	  });
	  this.__cache__ = null;
	};

	/**
	 * Ruler.after(afterName, ruleName, fn [, options])
	 * - afterName (String): new rule will be added after this one.
	 * - ruleName (String): name of added rule.
	 * - fn (Function): rule function.
	 * - options (Object): rule options (not mandatory).
	 *
	 * Add new rule to chain after one with given name. See also
	 * [[Ruler.before]], [[Ruler.push]].
	 *
	 * ##### Options:
	 *
	 * - __alt__ - array with names of "alternate" chains.
	 *
	 * ##### Example
	 *
	 * ```javascript
	 * var md = require('markdown-it')();
	 *
	 * md.inline.ruler.after('text', 'my_rule', function replace(state) {
	 *   //...
	 * });
	 * ```
	 **/
	Ruler.prototype.after = function (afterName, ruleName, fn, options) {
	  const index = this.__find__(afterName);
	  const opt = options || {};
	  if (index === -1) {
	    throw new Error('Parser rule not found: ' + afterName);
	  }
	  this.__rules__.splice(index + 1, 0, {
	    name: ruleName,
	    enabled: true,
	    fn,
	    alt: opt.alt || []
	  });
	  this.__cache__ = null;
	};

	/**
	 * Ruler.push(ruleName, fn [, options])
	 * - ruleName (String): name of added rule.
	 * - fn (Function): rule function.
	 * - options (Object): rule options (not mandatory).
	 *
	 * Push new rule to the end of chain. See also
	 * [[Ruler.before]], [[Ruler.after]].
	 *
	 * ##### Options:
	 *
	 * - __alt__ - array with names of "alternate" chains.
	 *
	 * ##### Example
	 *
	 * ```javascript
	 * var md = require('markdown-it')();
	 *
	 * md.core.ruler.push('my_rule', function replace(state) {
	 *   //...
	 * });
	 * ```
	 **/
	Ruler.prototype.push = function (ruleName, fn, options) {
	  const opt = options || {};
	  this.__rules__.push({
	    name: ruleName,
	    enabled: true,
	    fn,
	    alt: opt.alt || []
	  });
	  this.__cache__ = null;
	};

	/**
	 * Ruler.enable(list [, ignoreInvalid]) -> Array
	 * - list (String|Array): list of rule names to enable.
	 * - ignoreInvalid (Boolean): set `true` to ignore errors when rule not found.
	 *
	 * Enable rules with given names. If any rule name not found - throw Error.
	 * Errors can be disabled by second param.
	 *
	 * Returns list of found rule names (if no exception happened).
	 *
	 * See also [[Ruler.disable]], [[Ruler.enableOnly]].
	 **/
	Ruler.prototype.enable = function (list, ignoreInvalid) {
	  if (!Array.isArray(list)) {
	    list = [list];
	  }
	  const result = [];

	  // Search by name and enable
	  list.forEach(function (name) {
	    const idx = this.__find__(name);
	    if (idx < 0) {
	      if (ignoreInvalid) {
	        return;
	      }
	      throw new Error('Rules manager: invalid rule name ' + name);
	    }
	    this.__rules__[idx].enabled = true;
	    result.push(name);
	  }, this);
	  this.__cache__ = null;
	  return result;
	};

	/**
	 * Ruler.enableOnly(list [, ignoreInvalid])
	 * - list (String|Array): list of rule names to enable (whitelist).
	 * - ignoreInvalid (Boolean): set `true` to ignore errors when rule not found.
	 *
	 * Enable rules with given names, and disable everything else. If any rule name
	 * not found - throw Error. Errors can be disabled by second param.
	 *
	 * See also [[Ruler.disable]], [[Ruler.enable]].
	 **/
	Ruler.prototype.enableOnly = function (list, ignoreInvalid) {
	  if (!Array.isArray(list)) {
	    list = [list];
	  }
	  this.__rules__.forEach(function (rule) {
	    rule.enabled = false;
	  });
	  this.enable(list, ignoreInvalid);
	};

	/**
	 * Ruler.disable(list [, ignoreInvalid]) -> Array
	 * - list (String|Array): list of rule names to disable.
	 * - ignoreInvalid (Boolean): set `true` to ignore errors when rule not found.
	 *
	 * Disable rules with given names. If any rule name not found - throw Error.
	 * Errors can be disabled by second param.
	 *
	 * Returns list of found rule names (if no exception happened).
	 *
	 * See also [[Ruler.enable]], [[Ruler.enableOnly]].
	 **/
	Ruler.prototype.disable = function (list, ignoreInvalid) {
	  if (!Array.isArray(list)) {
	    list = [list];
	  }
	  const result = [];

	  // Search by name and disable
	  list.forEach(function (name) {
	    const idx = this.__find__(name);
	    if (idx < 0) {
	      if (ignoreInvalid) {
	        return;
	      }
	      throw new Error('Rules manager: invalid rule name ' + name);
	    }
	    this.__rules__[idx].enabled = false;
	    result.push(name);
	  }, this);
	  this.__cache__ = null;
	  return result;
	};

	/**
	 * Ruler.getRules(chainName) -> Array
	 *
	 * Return array of active functions (rules) for given chain name. It analyzes
	 * rules configuration, compiles caches if not exists and returns result.
	 *
	 * Default chain name is `''` (empty string). It can't be skipped. That's
	 * done intentionally, to keep signature monomorphic for high speed.
	 **/
	Ruler.prototype.getRules = function (chainName) {
	  if (this.__cache__ === null) {
	    this.__compile__();
	  }

	  // Chain can be empty, if rules disabled. But we still have to return Array.
	  return this.__cache__[chainName] || [];
	};

	// Token class

	/**
	 * class Token
	 **/

	/**
	 * new Token(type, tag, nesting)
	 *
	 * Create new token and fill passed properties.
	 **/
	function Token(type, tag, nesting) {
	  /**
	   * Token#type -> String
	   *
	   * Type of the token (string, e.g. "paragraph_open")
	   **/
	  this.type = type;

	  /**
	   * Token#tag -> String
	   *
	   * html tag name, e.g. "p"
	   **/
	  this.tag = tag;

	  /**
	   * Token#attrs -> Array
	   *
	   * Html attributes. Format: `[ [ name1, value1 ], [ name2, value2 ] ]`
	   **/
	  this.attrs = null;

	  /**
	   * Token#map -> Array
	   *
	   * Source map info. Format: `[ line_begin, line_end ]`
	   **/
	  this.map = null;

	  /**
	   * Token#nesting -> Number
	   *
	   * Level change (number in {-1, 0, 1} set), where:
	   *
	   * -  `1` means the tag is opening
	   * -  `0` means the tag is self-closing
	   * - `-1` means the tag is closing
	   **/
	  this.nesting = nesting;

	  /**
	   * Token#level -> Number
	   *
	   * nesting level, the same as `state.level`
	   **/
	  this.level = 0;

	  /**
	   * Token#children -> Array
	   *
	   * An array of child nodes (inline and img tokens)
	   **/
	  this.children = null;

	  /**
	   * Token#content -> String
	   *
	   * In a case of self-closing tag (code, html, fence, etc.),
	   * it has contents of this tag.
	   **/
	  this.content = '';

	  /**
	   * Token#markup -> String
	   *
	   * '*' or '_' for emphasis, fence string for fence, etc.
	   **/
	  this.markup = '';

	  /**
	   * Token#info -> String
	   *
	   * Additional information:
	   *
	   * - Info string for "fence" tokens
	   * - The value "auto" for autolink "link_open" and "link_close" tokens
	   * - The string value of the item marker for ordered-list "list_item_open" tokens
	   **/
	  this.info = '';

	  /**
	   * Token#meta -> Object
	   *
	   * A place for plugins to store an arbitrary data
	   **/
	  this.meta = null;

	  /**
	   * Token#block -> Boolean
	   *
	   * True for block-level tokens, false for inline tokens.
	   * Used in renderer to calculate line breaks
	   **/
	  this.block = false;

	  /**
	   * Token#hidden -> Boolean
	   *
	   * If it's true, ignore this element when rendering. Used for tight lists
	   * to hide paragraphs.
	   **/
	  this.hidden = false;
	}

	/**
	 * Token.attrIndex(name) -> Number
	 *
	 * Search attribute index by name.
	 **/
	Token.prototype.attrIndex = function attrIndex(name) {
	  if (!this.attrs) {
	    return -1;
	  }
	  const attrs = this.attrs;
	  for (let i = 0, len = attrs.length; i < len; i++) {
	    if (attrs[i][0] === name) {
	      return i;
	    }
	  }
	  return -1;
	};

	/**
	 * Token.attrPush(attrData)
	 *
	 * Add `[ name, value ]` attribute to list. Init attrs if necessary
	 **/
	Token.prototype.attrPush = function attrPush(attrData) {
	  if (this.attrs) {
	    this.attrs.push(attrData);
	  } else {
	    this.attrs = [attrData];
	  }
	};

	/**
	 * Token.attrSet(name, value)
	 *
	 * Set `name` attribute to `value`. Override old value if exists.
	 **/
	Token.prototype.attrSet = function attrSet(name, value) {
	  const idx = this.attrIndex(name);
	  const attrData = [name, value];
	  if (idx < 0) {
	    this.attrPush(attrData);
	  } else {
	    this.attrs[idx] = attrData;
	  }
	};

	/**
	 * Token.attrGet(name)
	 *
	 * Get the value of attribute `name`, or null if it does not exist.
	 **/
	Token.prototype.attrGet = function attrGet(name) {
	  const idx = this.attrIndex(name);
	  let value = null;
	  if (idx >= 0) {
	    value = this.attrs[idx][1];
	  }
	  return value;
	};

	/**
	 * Token.attrJoin(name, value)
	 *
	 * Join value to existing attribute via space. Or create new attribute if not
	 * exists. Useful to operate with token classes.
	 **/
	Token.prototype.attrJoin = function attrJoin(name, value) {
	  const idx = this.attrIndex(name);
	  if (idx < 0) {
	    this.attrPush([name, value]);
	  } else {
	    this.attrs[idx][1] = this.attrs[idx][1] + ' ' + value;
	  }
	};

	// Core state object
	//

	function StateCore(src, md, env) {
	  this.src = src;
	  this.env = env;
	  this.tokens = [];
	  this.inlineMode = false;
	  this.md = md; // link to parser instance
	}

	// re-export Token class to use in core rules
	StateCore.prototype.Token = Token;

	// Normalize input string

	// https://spec.commonmark.org/0.29/#line-ending
	const NEWLINES_RE = /\r\n?|\n/g;
	const NULL_RE = /\0/g;
	function normalize(state) {
	  let str;

	  // Normalize newlines
	  str = state.src.replace(NEWLINES_RE, '\n');

	  // Replace NULL characters
	  str = str.replace(NULL_RE, '\uFFFD');
	  state.src = str;
	}

	function block(state) {
	  let token;
	  if (state.inlineMode) {
	    token = new state.Token('inline', '', 0);
	    token.content = state.src;
	    token.map = [0, 1];
	    token.children = [];
	    state.tokens.push(token);
	  } else {
	    state.md.block.parse(state.src, state.md, state.env, state.tokens);
	  }
	}

	function inline(state) {
	  const tokens = state.tokens;

	  // Parse inlines
	  for (let i = 0, l = tokens.length; i < l; i++) {
	    const tok = tokens[i];
	    if (tok.type === 'inline') {
	      state.md.inline.parse(tok.content, state.md, state.env, tok.children);
	    }
	  }
	}

	// Replace link-like texts with link nodes.
	//
	// Currently restricted by `md.validateLink()` to http/https/ftp
	//

	function isLinkOpen$1(str) {
	  return /^<a[>\s]/i.test(str);
	}
	function isLinkClose$1(str) {
	  return /^<\/a\s*>/i.test(str);
	}
	function linkify$1(state) {
	  const blockTokens = state.tokens;
	  if (!state.md.options.linkify) {
	    return;
	  }
	  for (let j = 0, l = blockTokens.length; j < l; j++) {
	    if (blockTokens[j].type !== 'inline' || !state.md.linkify.pretest(blockTokens[j].content)) {
	      continue;
	    }
	    let tokens = blockTokens[j].children;
	    let htmlLinkLevel = 0;

	    // We scan from the end, to keep position when new tags added.
	    // Use reversed logic in links start/end match
	    for (let i = tokens.length - 1; i >= 0; i--) {
	      const currentToken = tokens[i];

	      // Skip content of markdown links
	      if (currentToken.type === 'link_close') {
	        i--;
	        while (tokens[i].level !== currentToken.level && tokens[i].type !== 'link_open') {
	          i--;
	        }
	        continue;
	      }

	      // Skip content of html tag links
	      if (currentToken.type === 'html_inline') {
	        if (isLinkOpen$1(currentToken.content) && htmlLinkLevel > 0) {
	          htmlLinkLevel--;
	        }
	        if (isLinkClose$1(currentToken.content)) {
	          htmlLinkLevel++;
	        }
	      }
	      if (htmlLinkLevel > 0) {
	        continue;
	      }
	      if (currentToken.type === 'text' && state.md.linkify.test(currentToken.content)) {
	        const text = currentToken.content;
	        let links = state.md.linkify.match(text);

	        // Now split string to nodes
	        const nodes = [];
	        let level = currentToken.level;
	        let lastPos = 0;

	        // forbid escape sequence at the start of the string,
	        // this avoids http\://example.com/ from being linkified as
	        // http:<a href="//example.com/">//example.com/</a>
	        if (links.length > 0 && links[0].index === 0 && i > 0 && tokens[i - 1].type === 'text_special') {
	          links = links.slice(1);
	        }
	        for (let ln = 0; ln < links.length; ln++) {
	          const url = links[ln].url;
	          const fullUrl = state.md.normalizeLink(url);
	          if (!state.md.validateLink(fullUrl)) {
	            continue;
	          }
	          let urlText = links[ln].text;

	          // Linkifier might send raw hostnames like "example.com", where url
	          // starts with domain name. So we prepend http:// in those cases,
	          // and remove it afterwards.
	          //
	          if (!links[ln].schema) {
	            urlText = state.md.normalizeLinkText('http://' + urlText).replace(/^http:\/\//, '');
	          } else if (links[ln].schema === 'mailto:' && !/^mailto:/i.test(urlText)) {
	            urlText = state.md.normalizeLinkText('mailto:' + urlText).replace(/^mailto:/, '');
	          } else {
	            urlText = state.md.normalizeLinkText(urlText);
	          }
	          const pos = links[ln].index;
	          if (pos > lastPos) {
	            const token = new state.Token('text', '', 0);
	            token.content = text.slice(lastPos, pos);
	            token.level = level;
	            nodes.push(token);
	          }
	          const token_o = new state.Token('link_open', 'a', 1);
	          token_o.attrs = [['href', fullUrl]];
	          token_o.level = level++;
	          token_o.markup = 'linkify';
	          token_o.info = 'auto';
	          nodes.push(token_o);
	          const token_t = new state.Token('text', '', 0);
	          token_t.content = urlText;
	          token_t.level = level;
	          nodes.push(token_t);
	          const token_c = new state.Token('link_close', 'a', -1);
	          token_c.level = --level;
	          token_c.markup = 'linkify';
	          token_c.info = 'auto';
	          nodes.push(token_c);
	          lastPos = links[ln].lastIndex;
	        }
	        if (lastPos < text.length) {
	          const token = new state.Token('text', '', 0);
	          token.content = text.slice(lastPos);
	          token.level = level;
	          nodes.push(token);
	        }

	        // replace current node
	        blockTokens[j].children = tokens = arrayReplaceAt(tokens, i, nodes);
	      }
	    }
	  }
	}

	// Simple typographic replacements
	//
	// (c) (C) → ©
	// (tm) (TM) → ™
	// (r) (R) → ®
	// +- → ±
	// ... → … (also ?.... → ?.., !.... → !..)
	// ???????? → ???, !!!!! → !!!, `,,` → `,`
	// -- → &ndash;, --- → &mdash;
	//

	// TODO:
	// - fractionals 1/2, 1/4, 3/4 -> ½, ¼, ¾
	// - multiplications 2 x 4 -> 2 × 4

	const RARE_RE = /\+-|\.\.|\?\?\?\?|!!!!|,,|--/;

	// Workaround for phantomjs - need regex without /g flag,
	// or root check will fail every second time
	const SCOPED_ABBR_TEST_RE = /\((c|tm|r)\)/i;
	const SCOPED_ABBR_RE = /\((c|tm|r)\)/ig;
	const SCOPED_ABBR = {
	  c: '©',
	  r: '®',
	  tm: '™'
	};
	function replaceFn(match, name) {
	  return SCOPED_ABBR[name.toLowerCase()];
	}
	function replace_scoped(inlineTokens) {
	  let inside_autolink = 0;
	  for (let i = inlineTokens.length - 1; i >= 0; i--) {
	    const token = inlineTokens[i];
	    if (token.type === 'text' && !inside_autolink) {
	      token.content = token.content.replace(SCOPED_ABBR_RE, replaceFn);
	    }
	    if (token.type === 'link_open' && token.info === 'auto') {
	      inside_autolink--;
	    }
	    if (token.type === 'link_close' && token.info === 'auto') {
	      inside_autolink++;
	    }
	  }
	}
	function replace_rare(inlineTokens) {
	  let inside_autolink = 0;
	  for (let i = inlineTokens.length - 1; i >= 0; i--) {
	    const token = inlineTokens[i];
	    if (token.type === 'text' && !inside_autolink) {
	      if (RARE_RE.test(token.content)) {
	        token.content = token.content.replace(/\+-/g, '±')
	        // .., ..., ....... -> …
	        // but ?..... & !..... -> ?.. & !..
	        .replace(/\.{2,}/g, '…').replace(/([?!])…/g, '$1..').replace(/([?!]){4,}/g, '$1$1$1').replace(/,{2,}/g, ',')
	        // em-dash
	        .replace(/(^|[^-])---(?=[^-]|$)/mg, '$1\u2014')
	        // en-dash
	        .replace(/(^|\s)--(?=\s|$)/mg, '$1\u2013').replace(/(^|[^-\s])--(?=[^-\s]|$)/mg, '$1\u2013');
	      }
	    }
	    if (token.type === 'link_open' && token.info === 'auto') {
	      inside_autolink--;
	    }
	    if (token.type === 'link_close' && token.info === 'auto') {
	      inside_autolink++;
	    }
	  }
	}
	function replace(state) {
	  let blkIdx;
	  if (!state.md.options.typographer) {
	    return;
	  }
	  for (blkIdx = state.tokens.length - 1; blkIdx >= 0; blkIdx--) {
	    if (state.tokens[blkIdx].type !== 'inline') {
	      continue;
	    }
	    if (SCOPED_ABBR_TEST_RE.test(state.tokens[blkIdx].content)) {
	      replace_scoped(state.tokens[blkIdx].children);
	    }
	    if (RARE_RE.test(state.tokens[blkIdx].content)) {
	      replace_rare(state.tokens[blkIdx].children);
	    }
	  }
	}

	// Convert straight quotation marks to typographic ones
	//

	const QUOTE_TEST_RE = /['"]/;
	const QUOTE_RE = /['"]/g;
	const APOSTROPHE = '\u2019'; /* ’ */

	function replaceAt(str, index, ch) {
	  return str.slice(0, index) + ch + str.slice(index + 1);
	}
	function process_inlines(tokens, state) {
	  let j;
	  const stack = [];
	  for (let i = 0; i < tokens.length; i++) {
	    const token = tokens[i];
	    const thisLevel = tokens[i].level;
	    for (j = stack.length - 1; j >= 0; j--) {
	      if (stack[j].level <= thisLevel) {
	        break;
	      }
	    }
	    stack.length = j + 1;
	    if (token.type !== 'text') {
	      continue;
	    }
	    let text = token.content;
	    let pos = 0;
	    let max = text.length;

	    /* eslint no-labels:0,block-scoped-var:0 */
	    OUTER: while (pos < max) {
	      QUOTE_RE.lastIndex = pos;
	      const t = QUOTE_RE.exec(text);
	      if (!t) {
	        break;
	      }
	      let canOpen = true;
	      let canClose = true;
	      pos = t.index + 1;
	      const isSingle = t[0] === "'";

	      // Find previous character,
	      // default to space if it's the beginning of the line
	      //
	      let lastChar = 0x20;
	      if (t.index - 1 >= 0) {
	        lastChar = text.charCodeAt(t.index - 1);
	      } else {
	        for (j = i - 1; j >= 0; j--) {
	          if (tokens[j].type === 'softbreak' || tokens[j].type === 'hardbreak') break; // lastChar defaults to 0x20
	          if (!tokens[j].content) continue; // should skip all tokens except 'text', 'html_inline' or 'code_inline'

	          lastChar = tokens[j].content.charCodeAt(tokens[j].content.length - 1);
	          break;
	        }
	      }

	      // Find next character,
	      // default to space if it's the end of the line
	      //
	      let nextChar = 0x20;
	      if (pos < max) {
	        nextChar = text.charCodeAt(pos);
	      } else {
	        for (j = i + 1; j < tokens.length; j++) {
	          if (tokens[j].type === 'softbreak' || tokens[j].type === 'hardbreak') break; // nextChar defaults to 0x20
	          if (!tokens[j].content) continue; // should skip all tokens except 'text', 'html_inline' or 'code_inline'

	          nextChar = tokens[j].content.charCodeAt(0);
	          break;
	        }
	      }
	      const isLastPunctChar = isMdAsciiPunct(lastChar) || isPunctChar(String.fromCharCode(lastChar));
	      const isNextPunctChar = isMdAsciiPunct(nextChar) || isPunctChar(String.fromCharCode(nextChar));
	      const isLastWhiteSpace = isWhiteSpace(lastChar);
	      const isNextWhiteSpace = isWhiteSpace(nextChar);
	      if (isNextWhiteSpace) {
	        canOpen = false;
	      } else if (isNextPunctChar) {
	        if (!(isLastWhiteSpace || isLastPunctChar)) {
	          canOpen = false;
	        }
	      }
	      if (isLastWhiteSpace) {
	        canClose = false;
	      } else if (isLastPunctChar) {
	        if (!(isNextWhiteSpace || isNextPunctChar)) {
	          canClose = false;
	        }
	      }
	      if (nextChar === 0x22 /* " */ && t[0] === '"') {
	        if (lastChar >= 0x30 /* 0 */ && lastChar <= 0x39 /* 9 */) {
	          // special case: 1"" - count first quote as an inch
	          canClose = canOpen = false;
	        }
	      }
	      if (canOpen && canClose) {
	        // Replace quotes in the middle of punctuation sequence, but not
	        // in the middle of the words, i.e.:
	        //
	        // 1. foo " bar " baz - not replaced
	        // 2. foo-"-bar-"-baz - replaced
	        // 3. foo"bar"baz     - not replaced
	        //
	        canOpen = isLastPunctChar;
	        canClose = isNextPunctChar;
	      }
	      if (!canOpen && !canClose) {
	        // middle of word
	        if (isSingle) {
	          token.content = replaceAt(token.content, t.index, APOSTROPHE);
	        }
	        continue;
	      }
	      if (canClose) {
	        // this could be a closing quote, rewind the stack to get a match
	        for (j = stack.length - 1; j >= 0; j--) {
	          let item = stack[j];
	          if (stack[j].level < thisLevel) {
	            break;
	          }
	          if (item.single === isSingle && stack[j].level === thisLevel) {
	            item = stack[j];
	            let openQuote;
	            let closeQuote;
	            if (isSingle) {
	              openQuote = state.md.options.quotes[2];
	              closeQuote = state.md.options.quotes[3];
	            } else {
	              openQuote = state.md.options.quotes[0];
	              closeQuote = state.md.options.quotes[1];
	            }

	            // replace token.content *before* tokens[item.token].content,
	            // because, if they are pointing at the same token, replaceAt
	            // could mess up indices when quote length != 1
	            token.content = replaceAt(token.content, t.index, closeQuote);
	            tokens[item.token].content = replaceAt(tokens[item.token].content, item.pos, openQuote);
	            pos += closeQuote.length - 1;
	            if (item.token === i) {
	              pos += openQuote.length - 1;
	            }
	            text = token.content;
	            max = text.length;
	            stack.length = j;
	            continue OUTER;
	          }
	        }
	      }
	      if (canOpen) {
	        stack.push({
	          token: i,
	          pos: t.index,
	          single: isSingle,
	          level: thisLevel
	        });
	      } else if (canClose && isSingle) {
	        token.content = replaceAt(token.content, t.index, APOSTROPHE);
	      }
	    }
	  }
	}
	function smartquotes(state) {
	  /* eslint max-depth:0 */
	  if (!state.md.options.typographer) {
	    return;
	  }
	  for (let blkIdx = state.tokens.length - 1; blkIdx >= 0; blkIdx--) {
	    if (state.tokens[blkIdx].type !== 'inline' || !QUOTE_TEST_RE.test(state.tokens[blkIdx].content)) {
	      continue;
	    }
	    process_inlines(state.tokens[blkIdx].children, state);
	  }
	}

	// Join raw text tokens with the rest of the text
	//
	// This is set as a separate rule to provide an opportunity for plugins
	// to run text replacements after text join, but before escape join.
	//
	// For example, `\:)` shouldn't be replaced with an emoji.
	//

	function text_join(state) {
	  let curr, last;
	  const blockTokens = state.tokens;
	  const l = blockTokens.length;
	  for (let j = 0; j < l; j++) {
	    if (blockTokens[j].type !== 'inline') continue;
	    const tokens = blockTokens[j].children;
	    const max = tokens.length;
	    for (curr = 0; curr < max; curr++) {
	      if (tokens[curr].type === 'text_special') {
	        tokens[curr].type = 'text';
	      }
	    }
	    for (curr = last = 0; curr < max; curr++) {
	      if (tokens[curr].type === 'text' && curr + 1 < max && tokens[curr + 1].type === 'text') {
	        // collapse two adjacent text nodes
	        tokens[curr + 1].content = tokens[curr].content + tokens[curr + 1].content;
	      } else {
	        if (curr !== last) {
	          tokens[last] = tokens[curr];
	        }
	        last++;
	      }
	    }
	    if (curr !== last) {
	      tokens.length = last;
	    }
	  }
	}

	/** internal
	 * class Core
	 *
	 * Top-level rules executor. Glues block/inline parsers and does intermediate
	 * transformations.
	 **/

	const _rules$2 = [['normalize', normalize], ['block', block], ['inline', inline], ['linkify', linkify$1], ['replacements', replace], ['smartquotes', smartquotes],
	// `text_join` finds `text_special` tokens (for escape sequences)
	// and joins them with the rest of the text
	['text_join', text_join]];

	/**
	 * new Core()
	 **/
	function Core() {
	  /**
	   * Core#ruler -> Ruler
	   *
	   * [[Ruler]] instance. Keep configuration of core rules.
	   **/
	  this.ruler = new Ruler();
	  for (let i = 0; i < _rules$2.length; i++) {
	    this.ruler.push(_rules$2[i][0], _rules$2[i][1]);
	  }
	}

	/**
	 * Core.process(state)
	 *
	 * Executes core chain rules.
	 **/
	Core.prototype.process = function (state) {
	  const rules = this.ruler.getRules('');
	  for (let i = 0, l = rules.length; i < l; i++) {
	    rules[i](state);
	  }
	};
	Core.prototype.State = StateCore;

	// Parser state class

	function StateBlock(src, md, env, tokens) {
	  this.src = src;

	  // link to parser instance
	  this.md = md;
	  this.env = env;

	  //
	  // Internal state vartiables
	  //

	  this.tokens = tokens;
	  this.bMarks = []; // line begin offsets for fast jumps
	  this.eMarks = []; // line end offsets for fast jumps
	  this.tShift = []; // offsets of the first non-space characters (tabs not expanded)
	  this.sCount = []; // indents for each line (tabs expanded)

	  // An amount of virtual spaces (tabs expanded) between beginning
	  // of each line (bMarks) and real beginning of that line.
	  //
	  // It exists only as a hack because blockquotes override bMarks
	  // losing information in the process.
	  //
	  // It's used only when expanding tabs, you can think about it as
	  // an initial tab length, e.g. bsCount=21 applied to string `\t123`
	  // means first tab should be expanded to 4-21%4 === 3 spaces.
	  //
	  this.bsCount = [];

	  // block parser variables

	  // required block content indent (for example, if we are
	  // inside a list, it would be positioned after list marker)
	  this.blkIndent = 0;
	  this.line = 0; // line index in src
	  this.lineMax = 0; // lines count
	  this.tight = false; // loose/tight mode for lists
	  this.ddIndent = -1; // indent of the current dd block (-1 if there isn't any)
	  this.listIndent = -1; // indent of the current list block (-1 if there isn't any)

	  // can be 'blockquote', 'list', 'root', 'paragraph' or 'reference'
	  // used in lists to determine if they interrupt a paragraph
	  this.parentType = 'root';
	  this.level = 0;

	  // Create caches
	  // Generate markers.
	  const s = this.src;
	  for (let start = 0, pos = 0, indent = 0, offset = 0, len = s.length, indent_found = false; pos < len; pos++) {
	    const ch = s.charCodeAt(pos);
	    if (!indent_found) {
	      if (isSpace(ch)) {
	        indent++;
	        if (ch === 0x09) {
	          offset += 4 - offset % 4;
	        } else {
	          offset++;
	        }
	        continue;
	      } else {
	        indent_found = true;
	      }
	    }
	    if (ch === 0x0A || pos === len - 1) {
	      if (ch !== 0x0A) {
	        pos++;
	      }
	      this.bMarks.push(start);
	      this.eMarks.push(pos);
	      this.tShift.push(indent);
	      this.sCount.push(offset);
	      this.bsCount.push(0);
	      indent_found = false;
	      indent = 0;
	      offset = 0;
	      start = pos + 1;
	    }
	  }

	  // Push fake entry to simplify cache bounds checks
	  this.bMarks.push(s.length);
	  this.eMarks.push(s.length);
	  this.tShift.push(0);
	  this.sCount.push(0);
	  this.bsCount.push(0);
	  this.lineMax = this.bMarks.length - 1; // don't count last fake line
	}

	// Push new token to "stream".
	//
	StateBlock.prototype.push = function (type, tag, nesting) {
	  const token = new Token(type, tag, nesting);
	  token.block = true;
	  if (nesting < 0) this.level--; // closing tag
	  token.level = this.level;
	  if (nesting > 0) this.level++; // opening tag

	  this.tokens.push(token);
	  return token;
	};
	StateBlock.prototype.isEmpty = function isEmpty(line) {
	  return this.bMarks[line] + this.tShift[line] >= this.eMarks[line];
	};
	StateBlock.prototype.skipEmptyLines = function skipEmptyLines(from) {
	  for (let max = this.lineMax; from < max; from++) {
	    if (this.bMarks[from] + this.tShift[from] < this.eMarks[from]) {
	      break;
	    }
	  }
	  return from;
	};

	// Skip spaces from given position.
	StateBlock.prototype.skipSpaces = function skipSpaces(pos) {
	  for (let max = this.src.length; pos < max; pos++) {
	    const ch = this.src.charCodeAt(pos);
	    if (!isSpace(ch)) {
	      break;
	    }
	  }
	  return pos;
	};

	// Skip spaces from given position in reverse.
	StateBlock.prototype.skipSpacesBack = function skipSpacesBack(pos, min) {
	  if (pos <= min) {
	    return pos;
	  }
	  while (pos > min) {
	    if (!isSpace(this.src.charCodeAt(--pos))) {
	      return pos + 1;
	    }
	  }
	  return pos;
	};

	// Skip char codes from given position
	StateBlock.prototype.skipChars = function skipChars(pos, code) {
	  for (let max = this.src.length; pos < max; pos++) {
	    if (this.src.charCodeAt(pos) !== code) {
	      break;
	    }
	  }
	  return pos;
	};

	// Skip char codes reverse from given position - 1
	StateBlock.prototype.skipCharsBack = function skipCharsBack(pos, code, min) {
	  if (pos <= min) {
	    return pos;
	  }
	  while (pos > min) {
	    if (code !== this.src.charCodeAt(--pos)) {
	      return pos + 1;
	    }
	  }
	  return pos;
	};

	// cut lines range from source.
	StateBlock.prototype.getLines = function getLines(begin, end, indent, keepLastLF) {
	  if (begin >= end) {
	    return '';
	  }
	  const queue = new Array(end - begin);
	  for (let i = 0, line = begin; line < end; line++, i++) {
	    let lineIndent = 0;
	    const lineStart = this.bMarks[line];
	    let first = lineStart;
	    let last;
	    if (line + 1 < end || keepLastLF) {
	      // No need for bounds check because we have fake entry on tail.
	      last = this.eMarks[line] + 1;
	    } else {
	      last = this.eMarks[line];
	    }
	    while (first < last && lineIndent < indent) {
	      const ch = this.src.charCodeAt(first);
	      if (isSpace(ch)) {
	        if (ch === 0x09) {
	          lineIndent += 4 - (lineIndent + this.bsCount[line]) % 4;
	        } else {
	          lineIndent++;
	        }
	      } else if (first - lineStart < this.tShift[line]) {
	        // patched tShift masked characters to look like spaces (blockquotes, list markers)
	        lineIndent++;
	      } else {
	        break;
	      }
	      first++;
	    }
	    if (lineIndent > indent) {
	      // partially expanding tabs in code blocks, e.g '\t\tfoobar'
	      // with indent=2 becomes '  \tfoobar'
	      queue[i] = new Array(lineIndent - indent + 1).join(' ') + this.src.slice(first, last);
	    } else {
	      queue[i] = this.src.slice(first, last);
	    }
	  }
	  return queue.join('');
	};

	// re-export Token class to use in block rules
	StateBlock.prototype.Token = Token;

	// GFM table, https://github.github.com/gfm/#tables-extension-


	// Limit the amount of empty autocompleted cells in a table,
	// see https://github.com/markdown-it/markdown-it/issues/1000,
	//
	// Both pulldown-cmark and commonmark-hs limit the number of cells this way to ~200k.
	// We set it to 65k, which can expand user input by a factor of x370
	// (256x256 square is 1.8kB expanded into 650kB).
	const MAX_AUTOCOMPLETED_CELLS = 0x10000;
	function getLine(state, line) {
	  const pos = state.bMarks[line] + state.tShift[line];
	  const max = state.eMarks[line];
	  return state.src.slice(pos, max);
	}
	function escapedSplit(str) {
	  const result = [];
	  const max = str.length;
	  let pos = 0;
	  let ch = str.charCodeAt(pos);
	  let isEscaped = false;
	  let lastPos = 0;
	  let current = '';
	  while (pos < max) {
	    if (ch === 0x7c /* | */) {
	      if (!isEscaped) {
	        // pipe separating cells, '|'
	        result.push(current + str.substring(lastPos, pos));
	        current = '';
	        lastPos = pos + 1;
	      } else {
	        // escaped pipe, '\|'
	        current += str.substring(lastPos, pos - 1);
	        lastPos = pos;
	      }
	    }
	    isEscaped = ch === 0x5c /* \ */;
	    pos++;
	    ch = str.charCodeAt(pos);
	  }
	  result.push(current + str.substring(lastPos));
	  return result;
	}
	function table(state, startLine, endLine, silent) {
	  // should have at least two lines
	  if (startLine + 2 > endLine) {
	    return false;
	  }
	  let nextLine = startLine + 1;
	  if (state.sCount[nextLine] < state.blkIndent) {
	    return false;
	  }

	  // if it's indented more than 3 spaces, it should be a code block
	  if (state.sCount[nextLine] - state.blkIndent >= 4) {
	    return false;
	  }

	  // first character of the second line should be '|', '-', ':',
	  // and no other characters are allowed but spaces;
	  // basically, this is the equivalent of /^[-:|][-:|\s]*$/ regexp

	  let pos = state.bMarks[nextLine] + state.tShift[nextLine];
	  if (pos >= state.eMarks[nextLine]) {
	    return false;
	  }
	  const firstCh = state.src.charCodeAt(pos++);
	  if (firstCh !== 0x7C /* | */ && firstCh !== 0x2D /* - */ && firstCh !== 0x3A /* : */) {
	    return false;
	  }
	  if (pos >= state.eMarks[nextLine]) {
	    return false;
	  }
	  const secondCh = state.src.charCodeAt(pos++);
	  if (secondCh !== 0x7C /* | */ && secondCh !== 0x2D /* - */ && secondCh !== 0x3A /* : */ && !isSpace(secondCh)) {
	    return false;
	  }

	  // if first character is '-', then second character must not be a space
	  // (due to parsing ambiguity with list)
	  if (firstCh === 0x2D /* - */ && isSpace(secondCh)) {
	    return false;
	  }
	  while (pos < state.eMarks[nextLine]) {
	    const ch = state.src.charCodeAt(pos);
	    if (ch !== 0x7C /* | */ && ch !== 0x2D /* - */ && ch !== 0x3A /* : */ && !isSpace(ch)) {
	      return false;
	    }
	    pos++;
	  }
	  let lineText = getLine(state, startLine + 1);
	  let columns = lineText.split('|');
	  const aligns = [];
	  for (let i = 0; i < columns.length; i++) {
	    const t = columns[i].trim();
	    if (!t) {
	      // allow empty columns before and after table, but not in between columns;
	      // e.g. allow ` |---| `, disallow ` ---||--- `
	      if (i === 0 || i === columns.length - 1) {
	        continue;
	      } else {
	        return false;
	      }
	    }
	    if (!/^:?-+:?$/.test(t)) {
	      return false;
	    }
	    if (t.charCodeAt(t.length - 1) === 0x3A /* : */) {
	      aligns.push(t.charCodeAt(0) === 0x3A /* : */ ? 'center' : 'right');
	    } else if (t.charCodeAt(0) === 0x3A /* : */) {
	      aligns.push('left');
	    } else {
	      aligns.push('');
	    }
	  }
	  lineText = getLine(state, startLine).trim();
	  if (lineText.indexOf('|') === -1) {
	    return false;
	  }
	  if (state.sCount[startLine] - state.blkIndent >= 4) {
	    return false;
	  }
	  columns = escapedSplit(lineText);
	  if (columns.length && columns[0] === '') columns.shift();
	  if (columns.length && columns[columns.length - 1] === '') columns.pop();

	  // header row will define an amount of columns in the entire table,
	  // and align row should be exactly the same (the rest of the rows can differ)
	  const columnCount = columns.length;
	  if (columnCount === 0 || columnCount !== aligns.length) {
	    return false;
	  }
	  if (silent) {
	    return true;
	  }
	  const oldParentType = state.parentType;
	  state.parentType = 'table';

	  // use 'blockquote' lists for termination because it's
	  // the most similar to tables
	  const terminatorRules = state.md.block.ruler.getRules('blockquote');
	  const token_to = state.push('table_open', 'table', 1);
	  const tableLines = [startLine, 0];
	  token_to.map = tableLines;
	  const token_tho = state.push('thead_open', 'thead', 1);
	  token_tho.map = [startLine, startLine + 1];
	  const token_htro = state.push('tr_open', 'tr', 1);
	  token_htro.map = [startLine, startLine + 1];
	  for (let i = 0; i < columns.length; i++) {
	    const token_ho = state.push('th_open', 'th', 1);
	    if (aligns[i]) {
	      token_ho.attrs = [['style', 'text-align:' + aligns[i]]];
	    }
	    const token_il = state.push('inline', '', 0);
	    token_il.content = columns[i].trim();
	    token_il.children = [];
	    state.push('th_close', 'th', -1);
	  }
	  state.push('tr_close', 'tr', -1);
	  state.push('thead_close', 'thead', -1);
	  let tbodyLines;
	  let autocompletedCells = 0;
	  for (nextLine = startLine + 2; nextLine < endLine; nextLine++) {
	    if (state.sCount[nextLine] < state.blkIndent) {
	      break;
	    }
	    let terminate = false;
	    for (let i = 0, l = terminatorRules.length; i < l; i++) {
	      if (terminatorRules[i](state, nextLine, endLine, true)) {
	        terminate = true;
	        break;
	      }
	    }
	    if (terminate) {
	      break;
	    }
	    lineText = getLine(state, nextLine).trim();
	    if (!lineText) {
	      break;
	    }
	    if (state.sCount[nextLine] - state.blkIndent >= 4) {
	      break;
	    }
	    columns = escapedSplit(lineText);
	    if (columns.length && columns[0] === '') columns.shift();
	    if (columns.length && columns[columns.length - 1] === '') columns.pop();

	    // note: autocomplete count can be negative if user specifies more columns than header,
	    // but that does not affect intended use (which is limiting expansion)
	    autocompletedCells += columnCount - columns.length;
	    if (autocompletedCells > MAX_AUTOCOMPLETED_CELLS) {
	      break;
	    }
	    if (nextLine === startLine + 2) {
	      const token_tbo = state.push('tbody_open', 'tbody', 1);
	      token_tbo.map = tbodyLines = [startLine + 2, 0];
	    }
	    const token_tro = state.push('tr_open', 'tr', 1);
	    token_tro.map = [nextLine, nextLine + 1];
	    for (let i = 0; i < columnCount; i++) {
	      const token_tdo = state.push('td_open', 'td', 1);
	      if (aligns[i]) {
	        token_tdo.attrs = [['style', 'text-align:' + aligns[i]]];
	      }
	      const token_il = state.push('inline', '', 0);
	      token_il.content = columns[i] ? columns[i].trim() : '';
	      token_il.children = [];
	      state.push('td_close', 'td', -1);
	    }
	    state.push('tr_close', 'tr', -1);
	  }
	  if (tbodyLines) {
	    state.push('tbody_close', 'tbody', -1);
	    tbodyLines[1] = nextLine;
	  }
	  state.push('table_close', 'table', -1);
	  tableLines[1] = nextLine;
	  state.parentType = oldParentType;
	  state.line = nextLine;
	  return true;
	}

	// Code block (4 spaces padded)

	function code(state, startLine, endLine /*, silent */) {
	  if (state.sCount[startLine] - state.blkIndent < 4) {
	    return false;
	  }
	  let nextLine = startLine + 1;
	  let last = nextLine;
	  while (nextLine < endLine) {
	    if (state.isEmpty(nextLine)) {
	      nextLine++;
	      continue;
	    }
	    if (state.sCount[nextLine] - state.blkIndent >= 4) {
	      nextLine++;
	      last = nextLine;
	      continue;
	    }
	    break;
	  }
	  state.line = last;
	  const token = state.push('code_block', 'code', 0);
	  token.content = state.getLines(startLine, last, 4 + state.blkIndent, false) + '\n';
	  token.map = [startLine, state.line];
	  return true;
	}

	// fences (``` lang, ~~~ lang)

	function fence(state, startLine, endLine, silent) {
	  let pos = state.bMarks[startLine] + state.tShift[startLine];
	  let max = state.eMarks[startLine];

	  // if it's indented more than 3 spaces, it should be a code block
	  if (state.sCount[startLine] - state.blkIndent >= 4) {
	    return false;
	  }
	  if (pos + 3 > max) {
	    return false;
	  }
	  const marker = state.src.charCodeAt(pos);
	  if (marker !== 0x7E /* ~ */ && marker !== 0x60 /* ` */) {
	    return false;
	  }

	  // scan marker length
	  let mem = pos;
	  pos = state.skipChars(pos, marker);
	  let len = pos - mem;
	  if (len < 3) {
	    return false;
	  }
	  const markup = state.src.slice(mem, pos);
	  const params = state.src.slice(pos, max);
	  if (marker === 0x60 /* ` */) {
	    if (params.indexOf(String.fromCharCode(marker)) >= 0) {
	      return false;
	    }
	  }

	  // Since start is found, we can report success here in validation mode
	  if (silent) {
	    return true;
	  }

	  // search end of block
	  let nextLine = startLine;
	  let haveEndMarker = false;
	  for (;;) {
	    nextLine++;
	    if (nextLine >= endLine) {
	      // unclosed block should be autoclosed by end of document.
	      // also block seems to be autoclosed by end of parent
	      break;
	    }
	    pos = mem = state.bMarks[nextLine] + state.tShift[nextLine];
	    max = state.eMarks[nextLine];
	    if (pos < max && state.sCount[nextLine] < state.blkIndent) {
	      // non-empty line with negative indent should stop the list:
	      // - ```
	      //  test
	      break;
	    }
	    if (state.src.charCodeAt(pos) !== marker) {
	      continue;
	    }
	    if (state.sCount[nextLine] - state.blkIndent >= 4) {
	      // closing fence should be indented less than 4 spaces
	      continue;
	    }
	    pos = state.skipChars(pos, marker);

	    // closing code fence must be at least as long as the opening one
	    if (pos - mem < len) {
	      continue;
	    }

	    // make sure tail has spaces only
	    pos = state.skipSpaces(pos);
	    if (pos < max) {
	      continue;
	    }
	    haveEndMarker = true;
	    // found!
	    break;
	  }

	  // If a fence has heading spaces, they should be removed from its inner block
	  len = state.sCount[startLine];
	  state.line = nextLine + (haveEndMarker ? 1 : 0);
	  const token = state.push('fence', 'code', 0);
	  token.info = params;
	  token.content = state.getLines(startLine + 1, nextLine, len, true);
	  token.markup = markup;
	  token.map = [startLine, state.line];
	  return true;
	}

	// Block quotes

	function blockquote(state, startLine, endLine, silent) {
	  let pos = state.bMarks[startLine] + state.tShift[startLine];
	  let max = state.eMarks[startLine];
	  const oldLineMax = state.lineMax;

	  // if it's indented more than 3 spaces, it should be a code block
	  if (state.sCount[startLine] - state.blkIndent >= 4) {
	    return false;
	  }

	  // check the block quote marker
	  if (state.src.charCodeAt(pos) !== 0x3E /* > */) {
	    return false;
	  }

	  // we know that it's going to be a valid blockquote,
	  // so no point trying to find the end of it in silent mode
	  if (silent) {
	    return true;
	  }
	  const oldBMarks = [];
	  const oldBSCount = [];
	  const oldSCount = [];
	  const oldTShift = [];
	  const terminatorRules = state.md.block.ruler.getRules('blockquote');
	  const oldParentType = state.parentType;
	  state.parentType = 'blockquote';
	  let lastLineEmpty = false;
	  let nextLine;

	  // Search the end of the block
	  //
	  // Block ends with either:
	  //  1. an empty line outside:
	  //     ```
	  //     > test
	  //
	  //     ```
	  //  2. an empty line inside:
	  //     ```
	  //     >
	  //     test
	  //     ```
	  //  3. another tag:
	  //     ```
	  //     > test
	  //      - - -
	  //     ```
	  for (nextLine = startLine; nextLine < endLine; nextLine++) {
	    // check if it's outdented, i.e. it's inside list item and indented
	    // less than said list item:
	    //
	    // ```
	    // 1. anything
	    //    > current blockquote
	    // 2. checking this line
	    // ```
	    const isOutdented = state.sCount[nextLine] < state.blkIndent;
	    pos = state.bMarks[nextLine] + state.tShift[nextLine];
	    max = state.eMarks[nextLine];
	    if (pos >= max) {
	      // Case 1: line is not inside the blockquote, and this line is empty.
	      break;
	    }
	    if (state.src.charCodeAt(pos++) === 0x3E /* > */ && !isOutdented) {
	      // This line is inside the blockquote.

	      // set offset past spaces and ">"
	      let initial = state.sCount[nextLine] + 1;
	      let spaceAfterMarker;
	      let adjustTab;

	      // skip one optional space after '>'
	      if (state.src.charCodeAt(pos) === 0x20 /* space */) {
	        // ' >   test '
	        //     ^ -- position start of line here:
	        pos++;
	        initial++;
	        adjustTab = false;
	        spaceAfterMarker = true;
	      } else if (state.src.charCodeAt(pos) === 0x09 /* tab */) {
	        spaceAfterMarker = true;
	        if ((state.bsCount[nextLine] + initial) % 4 === 3) {
	          // '  >\t  test '
	          //       ^ -- position start of line here (tab has width===1)
	          pos++;
	          initial++;
	          adjustTab = false;
	        } else {
	          // ' >\t  test '
	          //    ^ -- position start of line here + shift bsCount slightly
	          //         to make extra space appear
	          adjustTab = true;
	        }
	      } else {
	        spaceAfterMarker = false;
	      }
	      let offset = initial;
	      oldBMarks.push(state.bMarks[nextLine]);
	      state.bMarks[nextLine] = pos;
	      while (pos < max) {
	        const ch = state.src.charCodeAt(pos);
	        if (isSpace(ch)) {
	          if (ch === 0x09) {
	            offset += 4 - (offset + state.bsCount[nextLine] + (adjustTab ? 1 : 0)) % 4;
	          } else {
	            offset++;
	          }
	        } else {
	          break;
	        }
	        pos++;
	      }
	      lastLineEmpty = pos >= max;
	      oldBSCount.push(state.bsCount[nextLine]);
	      state.bsCount[nextLine] = state.sCount[nextLine] + 1 + (spaceAfterMarker ? 1 : 0);
	      oldSCount.push(state.sCount[nextLine]);
	      state.sCount[nextLine] = offset - initial;
	      oldTShift.push(state.tShift[nextLine]);
	      state.tShift[nextLine] = pos - state.bMarks[nextLine];
	      continue;
	    }

	    // Case 2: line is not inside the blockquote, and the last line was empty.
	    if (lastLineEmpty) {
	      break;
	    }

	    // Case 3: another tag found.
	    let terminate = false;
	    for (let i = 0, l = terminatorRules.length; i < l; i++) {
	      if (terminatorRules[i](state, nextLine, endLine, true)) {
	        terminate = true;
	        break;
	      }
	    }
	    if (terminate) {
	      // Quirk to enforce "hard termination mode" for paragraphs;
	      // normally if you call `tokenize(state, startLine, nextLine)`,
	      // paragraphs will look below nextLine for paragraph continuation,
	      // but if blockquote is terminated by another tag, they shouldn't
	      state.lineMax = nextLine;
	      if (state.blkIndent !== 0) {
	        // state.blkIndent was non-zero, we now set it to zero,
	        // so we need to re-calculate all offsets to appear as
	        // if indent wasn't changed
	        oldBMarks.push(state.bMarks[nextLine]);
	        oldBSCount.push(state.bsCount[nextLine]);
	        oldTShift.push(state.tShift[nextLine]);
	        oldSCount.push(state.sCount[nextLine]);
	        state.sCount[nextLine] -= state.blkIndent;
	      }
	      break;
	    }
	    oldBMarks.push(state.bMarks[nextLine]);
	    oldBSCount.push(state.bsCount[nextLine]);
	    oldTShift.push(state.tShift[nextLine]);
	    oldSCount.push(state.sCount[nextLine]);

	    // A negative indentation means that this is a paragraph continuation
	    //
	    state.sCount[nextLine] = -1;
	  }
	  const oldIndent = state.blkIndent;
	  state.blkIndent = 0;
	  const token_o = state.push('blockquote_open', 'blockquote', 1);
	  token_o.markup = '>';
	  const lines = [startLine, 0];
	  token_o.map = lines;
	  state.md.block.tokenize(state, startLine, nextLine);
	  const token_c = state.push('blockquote_close', 'blockquote', -1);
	  token_c.markup = '>';
	  state.lineMax = oldLineMax;
	  state.parentType = oldParentType;
	  lines[1] = state.line;

	  // Restore original tShift; this might not be necessary since the parser
	  // has already been here, but just to make sure we can do that.
	  for (let i = 0; i < oldTShift.length; i++) {
	    state.bMarks[i + startLine] = oldBMarks[i];
	    state.tShift[i + startLine] = oldTShift[i];
	    state.sCount[i + startLine] = oldSCount[i];
	    state.bsCount[i + startLine] = oldBSCount[i];
	  }
	  state.blkIndent = oldIndent;
	  return true;
	}

	// Horizontal rule

	function hr(state, startLine, endLine, silent) {
	  const max = state.eMarks[startLine];
	  // if it's indented more than 3 spaces, it should be a code block
	  if (state.sCount[startLine] - state.blkIndent >= 4) {
	    return false;
	  }
	  let pos = state.bMarks[startLine] + state.tShift[startLine];
	  const marker = state.src.charCodeAt(pos++);

	  // Check hr marker
	  if (marker !== 0x2A /* * */ && marker !== 0x2D /* - */ && marker !== 0x5F /* _ */) {
	    return false;
	  }

	  // markers can be mixed with spaces, but there should be at least 3 of them

	  let cnt = 1;
	  while (pos < max) {
	    const ch = state.src.charCodeAt(pos++);
	    if (ch !== marker && !isSpace(ch)) {
	      return false;
	    }
	    if (ch === marker) {
	      cnt++;
	    }
	  }
	  if (cnt < 3) {
	    return false;
	  }
	  if (silent) {
	    return true;
	  }
	  state.line = startLine + 1;
	  const token = state.push('hr', 'hr', 0);
	  token.map = [startLine, state.line];
	  token.markup = Array(cnt + 1).join(String.fromCharCode(marker));
	  return true;
	}

	// Lists


	// Search `[-+*][\n ]`, returns next pos after marker on success
	// or -1 on fail.
	function skipBulletListMarker(state, startLine) {
	  const max = state.eMarks[startLine];
	  let pos = state.bMarks[startLine] + state.tShift[startLine];
	  const marker = state.src.charCodeAt(pos++);
	  // Check bullet
	  if (marker !== 0x2A /* * */ && marker !== 0x2D /* - */ && marker !== 0x2B /* + */) {
	    return -1;
	  }
	  if (pos < max) {
	    const ch = state.src.charCodeAt(pos);
	    if (!isSpace(ch)) {
	      // " -test " - is not a list item
	      return -1;
	    }
	  }
	  return pos;
	}

	// Search `\d+[.)][\n ]`, returns next pos after marker on success
	// or -1 on fail.
	function skipOrderedListMarker(state, startLine) {
	  const start = state.bMarks[startLine] + state.tShift[startLine];
	  const max = state.eMarks[startLine];
	  let pos = start;

	  // List marker should have at least 2 chars (digit + dot)
	  if (pos + 1 >= max) {
	    return -1;
	  }
	  let ch = state.src.charCodeAt(pos++);
	  if (ch < 0x30 /* 0 */ || ch > 0x39 /* 9 */) {
	    return -1;
	  }
	  for (;;) {
	    // EOL -> fail
	    if (pos >= max) {
	      return -1;
	    }
	    ch = state.src.charCodeAt(pos++);
	    if (ch >= 0x30 /* 0 */ && ch <= 0x39 /* 9 */) {
	      // List marker should have no more than 9 digits
	      // (prevents integer overflow in browsers)
	      if (pos - start >= 10) {
	        return -1;
	      }
	      continue;
	    }

	    // found valid marker
	    if (ch === 0x29 /* ) */ || ch === 0x2e /* . */) {
	      break;
	    }
	    return -1;
	  }
	  if (pos < max) {
	    ch = state.src.charCodeAt(pos);
	    if (!isSpace(ch)) {
	      // " 1.test " - is not a list item
	      return -1;
	    }
	  }
	  return pos;
	}
	function markTightParagraphs(state, idx) {
	  const level = state.level + 2;
	  for (let i = idx + 2, l = state.tokens.length - 2; i < l; i++) {
	    if (state.tokens[i].level === level && state.tokens[i].type === 'paragraph_open') {
	      state.tokens[i + 2].hidden = true;
	      state.tokens[i].hidden = true;
	      i += 2;
	    }
	  }
	}
	function list(state, startLine, endLine, silent) {
	  let max, pos, start, token;
	  let nextLine = startLine;
	  let tight = true;

	  // if it's indented more than 3 spaces, it should be a code block
	  if (state.sCount[nextLine] - state.blkIndent >= 4) {
	    return false;
	  }

	  // Special case:
	  //  - item 1
	  //   - item 2
	  //    - item 3
	  //     - item 4
	  //      - this one is a paragraph continuation
	  if (state.listIndent >= 0 && state.sCount[nextLine] - state.listIndent >= 4 && state.sCount[nextLine] < state.blkIndent) {
	    return false;
	  }
	  let isTerminatingParagraph = false;

	  // limit conditions when list can interrupt
	  // a paragraph (validation mode only)
	  if (silent && state.parentType === 'paragraph') {
	    // Next list item should still terminate previous list item;
	    //
	    // This code can fail if plugins use blkIndent as well as lists,
	    // but I hope the spec gets fixed long before that happens.
	    //
	    if (state.sCount[nextLine] >= state.blkIndent) {
	      isTerminatingParagraph = true;
	    }
	  }

	  // Detect list type and position after marker
	  let isOrdered;
	  let markerValue;
	  let posAfterMarker;
	  if ((posAfterMarker = skipOrderedListMarker(state, nextLine)) >= 0) {
	    isOrdered = true;
	    start = state.bMarks[nextLine] + state.tShift[nextLine];
	    markerValue = Number(state.src.slice(start, posAfterMarker - 1));

	    // If we're starting a new ordered list right after
	    // a paragraph, it should start with 1.
	    if (isTerminatingParagraph && markerValue !== 1) return false;
	  } else if ((posAfterMarker = skipBulletListMarker(state, nextLine)) >= 0) {
	    isOrdered = false;
	  } else {
	    return false;
	  }

	  // If we're starting a new unordered list right after
	  // a paragraph, first line should not be empty.
	  if (isTerminatingParagraph) {
	    if (state.skipSpaces(posAfterMarker) >= state.eMarks[nextLine]) return false;
	  }

	  // For validation mode we can terminate immediately
	  if (silent) {
	    return true;
	  }

	  // We should terminate list on style change. Remember first one to compare.
	  const markerCharCode = state.src.charCodeAt(posAfterMarker - 1);

	  // Start list
	  const listTokIdx = state.tokens.length;
	  if (isOrdered) {
	    token = state.push('ordered_list_open', 'ol', 1);
	    if (markerValue !== 1) {
	      token.attrs = [['start', markerValue]];
	    }
	  } else {
	    token = state.push('bullet_list_open', 'ul', 1);
	  }
	  const listLines = [nextLine, 0];
	  token.map = listLines;
	  token.markup = String.fromCharCode(markerCharCode);

	  //
	  // Iterate list items
	  //

	  let prevEmptyEnd = false;
	  const terminatorRules = state.md.block.ruler.getRules('list');
	  const oldParentType = state.parentType;
	  state.parentType = 'list';
	  while (nextLine < endLine) {
	    pos = posAfterMarker;
	    max = state.eMarks[nextLine];
	    const initial = state.sCount[nextLine] + posAfterMarker - (state.bMarks[nextLine] + state.tShift[nextLine]);
	    let offset = initial;
	    while (pos < max) {
	      const ch = state.src.charCodeAt(pos);
	      if (ch === 0x09) {
	        offset += 4 - (offset + state.bsCount[nextLine]) % 4;
	      } else if (ch === 0x20) {
	        offset++;
	      } else {
	        break;
	      }
	      pos++;
	    }
	    const contentStart = pos;
	    let indentAfterMarker;
	    if (contentStart >= max) {
	      // trimming space in "-    \n  3" case, indent is 1 here
	      indentAfterMarker = 1;
	    } else {
	      indentAfterMarker = offset - initial;
	    }

	    // If we have more than 4 spaces, the indent is 1
	    // (the rest is just indented code block)
	    if (indentAfterMarker > 4) {
	      indentAfterMarker = 1;
	    }

	    // "  -  test"
	    //  ^^^^^ - calculating total length of this thing
	    const indent = initial + indentAfterMarker;

	    // Run subparser & write tokens
	    token = state.push('list_item_open', 'li', 1);
	    token.markup = String.fromCharCode(markerCharCode);
	    const itemLines = [nextLine, 0];
	    token.map = itemLines;
	    if (isOrdered) {
	      token.info = state.src.slice(start, posAfterMarker - 1);
	    }

	    // change current state, then restore it after parser subcall
	    const oldTight = state.tight;
	    const oldTShift = state.tShift[nextLine];
	    const oldSCount = state.sCount[nextLine];

	    //  - example list
	    // ^ listIndent position will be here
	    //   ^ blkIndent position will be here
	    //
	    const oldListIndent = state.listIndent;
	    state.listIndent = state.blkIndent;
	    state.blkIndent = indent;
	    state.tight = true;
	    state.tShift[nextLine] = contentStart - state.bMarks[nextLine];
	    state.sCount[nextLine] = offset;
	    if (contentStart >= max && state.isEmpty(nextLine + 1)) {
	      // workaround for this case
	      // (list item is empty, list terminates before "foo"):
	      // ~~~~~~~~
	      //   -
	      //
	      //     foo
	      // ~~~~~~~~
	      state.line = Math.min(state.line + 2, endLine);
	    } else {
	      state.md.block.tokenize(state, nextLine, endLine, true);
	    }

	    // If any of list item is tight, mark list as tight
	    if (!state.tight || prevEmptyEnd) {
	      tight = false;
	    }
	    // Item become loose if finish with empty line,
	    // but we should filter last element, because it means list finish
	    prevEmptyEnd = state.line - nextLine > 1 && state.isEmpty(state.line - 1);
	    state.blkIndent = state.listIndent;
	    state.listIndent = oldListIndent;
	    state.tShift[nextLine] = oldTShift;
	    state.sCount[nextLine] = oldSCount;
	    state.tight = oldTight;
	    token = state.push('list_item_close', 'li', -1);
	    token.markup = String.fromCharCode(markerCharCode);
	    nextLine = state.line;
	    itemLines[1] = nextLine;
	    if (nextLine >= endLine) {
	      break;
	    }

	    //
	    // Try to check if list is terminated or continued.
	    //
	    if (state.sCount[nextLine] < state.blkIndent) {
	      break;
	    }

	    // if it's indented more than 3 spaces, it should be a code block
	    if (state.sCount[nextLine] - state.blkIndent >= 4) {
	      break;
	    }

	    // fail if terminating block found
	    let terminate = false;
	    for (let i = 0, l = terminatorRules.length; i < l; i++) {
	      if (terminatorRules[i](state, nextLine, endLine, true)) {
	        terminate = true;
	        break;
	      }
	    }
	    if (terminate) {
	      break;
	    }

	    // fail if list has another type
	    if (isOrdered) {
	      posAfterMarker = skipOrderedListMarker(state, nextLine);
	      if (posAfterMarker < 0) {
	        break;
	      }
	      start = state.bMarks[nextLine] + state.tShift[nextLine];
	    } else {
	      posAfterMarker = skipBulletListMarker(state, nextLine);
	      if (posAfterMarker < 0) {
	        break;
	      }
	    }
	    if (markerCharCode !== state.src.charCodeAt(posAfterMarker - 1)) {
	      break;
	    }
	  }

	  // Finalize list
	  if (isOrdered) {
	    token = state.push('ordered_list_close', 'ol', -1);
	  } else {
	    token = state.push('bullet_list_close', 'ul', -1);
	  }
	  token.markup = String.fromCharCode(markerCharCode);
	  listLines[1] = nextLine;
	  state.line = nextLine;
	  state.parentType = oldParentType;

	  // mark paragraphs tight if needed
	  if (tight) {
	    markTightParagraphs(state, listTokIdx);
	  }
	  return true;
	}

	function reference(state, startLine, _endLine, silent) {
	  let pos = state.bMarks[startLine] + state.tShift[startLine];
	  let max = state.eMarks[startLine];
	  let nextLine = startLine + 1;

	  // if it's indented more than 3 spaces, it should be a code block
	  if (state.sCount[startLine] - state.blkIndent >= 4) {
	    return false;
	  }
	  if (state.src.charCodeAt(pos) !== 0x5B /* [ */) {
	    return false;
	  }
	  function getNextLine(nextLine) {
	    const endLine = state.lineMax;
	    if (nextLine >= endLine || state.isEmpty(nextLine)) {
	      // empty line or end of input
	      return null;
	    }
	    let isContinuation = false;

	    // this would be a code block normally, but after paragraph
	    // it's considered a lazy continuation regardless of what's there
	    if (state.sCount[nextLine] - state.blkIndent > 3) {
	      isContinuation = true;
	    }

	    // quirk for blockquotes, this line should already be checked by that rule
	    if (state.sCount[nextLine] < 0) {
	      isContinuation = true;
	    }
	    if (!isContinuation) {
	      const terminatorRules = state.md.block.ruler.getRules('reference');
	      const oldParentType = state.parentType;
	      state.parentType = 'reference';

	      // Some tags can terminate paragraph without empty line.
	      let terminate = false;
	      for (let i = 0, l = terminatorRules.length; i < l; i++) {
	        if (terminatorRules[i](state, nextLine, endLine, true)) {
	          terminate = true;
	          break;
	        }
	      }
	      state.parentType = oldParentType;
	      if (terminate) {
	        // terminated by another block
	        return null;
	      }
	    }
	    const pos = state.bMarks[nextLine] + state.tShift[nextLine];
	    const max = state.eMarks[nextLine];

	    // max + 1 explicitly includes the newline
	    return state.src.slice(pos, max + 1);
	  }
	  let str = state.src.slice(pos, max + 1);
	  max = str.length;
	  let labelEnd = -1;
	  for (pos = 1; pos < max; pos++) {
	    const ch = str.charCodeAt(pos);
	    if (ch === 0x5B /* [ */) {
	      return false;
	    } else if (ch === 0x5D /* ] */) {
	      labelEnd = pos;
	      break;
	    } else if (ch === 0x0A /* \n */) {
	      const lineContent = getNextLine(nextLine);
	      if (lineContent !== null) {
	        str += lineContent;
	        max = str.length;
	        nextLine++;
	      }
	    } else if (ch === 0x5C /* \ */) {
	      pos++;
	      if (pos < max && str.charCodeAt(pos) === 0x0A) {
	        const lineContent = getNextLine(nextLine);
	        if (lineContent !== null) {
	          str += lineContent;
	          max = str.length;
	          nextLine++;
	        }
	      }
	    }
	  }
	  if (labelEnd < 0 || str.charCodeAt(labelEnd + 1) !== 0x3A /* : */) {
	    return false;
	  }

	  // [label]:   destination   'title'
	  //         ^^^ skip optional whitespace here
	  for (pos = labelEnd + 2; pos < max; pos++) {
	    const ch = str.charCodeAt(pos);
	    if (ch === 0x0A) {
	      const lineContent = getNextLine(nextLine);
	      if (lineContent !== null) {
	        str += lineContent;
	        max = str.length;
	        nextLine++;
	      }
	    } else if (isSpace(ch)) ; else {
	      break;
	    }
	  }

	  // [label]:   destination   'title'
	  //            ^^^^^^^^^^^ parse this
	  const destRes = state.md.helpers.parseLinkDestination(str, pos, max);
	  if (!destRes.ok) {
	    return false;
	  }
	  const href = state.md.normalizeLink(destRes.str);
	  if (!state.md.validateLink(href)) {
	    return false;
	  }
	  pos = destRes.pos;

	  // save cursor state, we could require to rollback later
	  const destEndPos = pos;
	  const destEndLineNo = nextLine;

	  // [label]:   destination   'title'
	  //                       ^^^ skipping those spaces
	  const start = pos;
	  for (; pos < max; pos++) {
	    const ch = str.charCodeAt(pos);
	    if (ch === 0x0A) {
	      const lineContent = getNextLine(nextLine);
	      if (lineContent !== null) {
	        str += lineContent;
	        max = str.length;
	        nextLine++;
	      }
	    } else if (isSpace(ch)) ; else {
	      break;
	    }
	  }

	  // [label]:   destination   'title'
	  //                          ^^^^^^^ parse this
	  let titleRes = state.md.helpers.parseLinkTitle(str, pos, max);
	  while (titleRes.can_continue) {
	    const lineContent = getNextLine(nextLine);
	    if (lineContent === null) break;
	    str += lineContent;
	    pos = max;
	    max = str.length;
	    nextLine++;
	    titleRes = state.md.helpers.parseLinkTitle(str, pos, max, titleRes);
	  }
	  let title;
	  if (pos < max && start !== pos && titleRes.ok) {
	    title = titleRes.str;
	    pos = titleRes.pos;
	  } else {
	    title = '';
	    pos = destEndPos;
	    nextLine = destEndLineNo;
	  }

	  // skip trailing spaces until the rest of the line
	  while (pos < max) {
	    const ch = str.charCodeAt(pos);
	    if (!isSpace(ch)) {
	      break;
	    }
	    pos++;
	  }
	  if (pos < max && str.charCodeAt(pos) !== 0x0A) {
	    if (title) {
	      // garbage at the end of the line after title,
	      // but it could still be a valid reference if we roll back
	      title = '';
	      pos = destEndPos;
	      nextLine = destEndLineNo;
	      while (pos < max) {
	        const ch = str.charCodeAt(pos);
	        if (!isSpace(ch)) {
	          break;
	        }
	        pos++;
	      }
	    }
	  }
	  if (pos < max && str.charCodeAt(pos) !== 0x0A) {
	    // garbage at the end of the line
	    return false;
	  }
	  const label = normalizeReference(str.slice(1, labelEnd));
	  if (!label) {
	    // CommonMark 0.20 disallows empty labels
	    return false;
	  }

	  // Reference can not terminate anything. This check is for safety only.
	  /* istanbul ignore if */
	  if (silent) {
	    return true;
	  }
	  if (typeof state.env.references === 'undefined') {
	    state.env.references = {};
	  }
	  if (typeof state.env.references[label] === 'undefined') {
	    state.env.references[label] = {
	      title,
	      href
	    };
	  }
	  state.line = nextLine;
	  return true;
	}

	// List of valid html blocks names, according to commonmark spec
	// https://spec.commonmark.org/0.30/#html-blocks

	var block_names = ['address', 'article', 'aside', 'base', 'basefont', 'blockquote', 'body', 'caption', 'center', 'col', 'colgroup', 'dd', 'details', 'dialog', 'dir', 'div', 'dl', 'dt', 'fieldset', 'figcaption', 'figure', 'footer', 'form', 'frame', 'frameset', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'head', 'header', 'hr', 'html', 'iframe', 'legend', 'li', 'link', 'main', 'menu', 'menuitem', 'nav', 'noframes', 'ol', 'optgroup', 'option', 'p', 'param', 'search', 'section', 'summary', 'table', 'tbody', 'td', 'tfoot', 'th', 'thead', 'title', 'tr', 'track', 'ul'];

	// Regexps to match html elements

	const attr_name = '[a-zA-Z_:][a-zA-Z0-9:._-]*';
	const unquoted = '[^"\'=<>`\\x00-\\x20]+';
	const single_quoted = "'[^']*'";
	const double_quoted = '"[^"]*"';
	const attr_value = '(?:' + unquoted + '|' + single_quoted + '|' + double_quoted + ')';
	const attribute = '(?:\\s+' + attr_name + '(?:\\s*=\\s*' + attr_value + ')?)';
	const open_tag = '<[A-Za-z][A-Za-z0-9\\-]*' + attribute + '*\\s*\\/?>';
	const close_tag = '<\\/[A-Za-z][A-Za-z0-9\\-]*\\s*>';
	const comment = '<!---?>|<!--(?:[^-]|-[^-]|--[^>])*-->';
	const processing = '<[?][\\s\\S]*?[?]>';
	const declaration = '<![A-Za-z][^>]*>';
	const cdata = '<!\\[CDATA\\[[\\s\\S]*?\\]\\]>';
	const HTML_TAG_RE = new RegExp('^(?:' + open_tag + '|' + close_tag + '|' + comment + '|' + processing + '|' + declaration + '|' + cdata + ')');
	const HTML_OPEN_CLOSE_TAG_RE = new RegExp('^(?:' + open_tag + '|' + close_tag + ')');

	// HTML block


	// An array of opening and corresponding closing sequences for html tags,
	// last argument defines whether it can terminate a paragraph or not
	//
	const HTML_SEQUENCES = [[/^<(script|pre|style|textarea)(?=(\s|>|$))/i, /<\/(script|pre|style|textarea)>/i, true], [/^<!--/, /-->/, true], [/^<\?/, /\?>/, true], [/^<![A-Z]/, />/, true], [/^<!\[CDATA\[/, /\]\]>/, true], [new RegExp('^</?(' + block_names.join('|') + ')(?=(\\s|/?>|$))', 'i'), /^$/, true], [new RegExp(HTML_OPEN_CLOSE_TAG_RE.source + '\\s*$'), /^$/, false]];
	function html_block(state, startLine, endLine, silent) {
	  let pos = state.bMarks[startLine] + state.tShift[startLine];
	  let max = state.eMarks[startLine];

	  // if it's indented more than 3 spaces, it should be a code block
	  if (state.sCount[startLine] - state.blkIndent >= 4) {
	    return false;
	  }
	  if (!state.md.options.html) {
	    return false;
	  }
	  if (state.src.charCodeAt(pos) !== 0x3C /* < */) {
	    return false;
	  }
	  let lineText = state.src.slice(pos, max);
	  let i = 0;
	  for (; i < HTML_SEQUENCES.length; i++) {
	    if (HTML_SEQUENCES[i][0].test(lineText)) {
	      break;
	    }
	  }
	  if (i === HTML_SEQUENCES.length) {
	    return false;
	  }
	  if (silent) {
	    // true if this sequence can be a terminator, false otherwise
	    return HTML_SEQUENCES[i][2];
	  }
	  let nextLine = startLine + 1;

	  // If we are here - we detected HTML block.
	  // Let's roll down till block end.
	  if (!HTML_SEQUENCES[i][1].test(lineText)) {
	    for (; nextLine < endLine; nextLine++) {
	      if (state.sCount[nextLine] < state.blkIndent) {
	        break;
	      }
	      pos = state.bMarks[nextLine] + state.tShift[nextLine];
	      max = state.eMarks[nextLine];
	      lineText = state.src.slice(pos, max);
	      if (HTML_SEQUENCES[i][1].test(lineText)) {
	        if (lineText.length !== 0) {
	          nextLine++;
	        }
	        break;
	      }
	    }
	  }
	  state.line = nextLine;
	  const token = state.push('html_block', '', 0);
	  token.map = [startLine, nextLine];
	  token.content = state.getLines(startLine, nextLine, state.blkIndent, true);
	  return true;
	}

	// heading (#, ##, ...)

	function heading(state, startLine, endLine, silent) {
	  let pos = state.bMarks[startLine] + state.tShift[startLine];
	  let max = state.eMarks[startLine];

	  // if it's indented more than 3 spaces, it should be a code block
	  if (state.sCount[startLine] - state.blkIndent >= 4) {
	    return false;
	  }
	  let ch = state.src.charCodeAt(pos);
	  if (ch !== 0x23 /* # */ || pos >= max) {
	    return false;
	  }

	  // count heading level
	  let level = 1;
	  ch = state.src.charCodeAt(++pos);
	  while (ch === 0x23 /* # */ && pos < max && level <= 6) {
	    level++;
	    ch = state.src.charCodeAt(++pos);
	  }
	  if (level > 6 || pos < max && !isSpace(ch)) {
	    return false;
	  }
	  if (silent) {
	    return true;
	  }

	  // Let's cut tails like '    ###  ' from the end of string

	  max = state.skipSpacesBack(max, pos);
	  const tmp = state.skipCharsBack(max, 0x23, pos); // #
	  if (tmp > pos && isSpace(state.src.charCodeAt(tmp - 1))) {
	    max = tmp;
	  }
	  state.line = startLine + 1;
	  const token_o = state.push('heading_open', 'h' + String(level), 1);
	  token_o.markup = '########'.slice(0, level);
	  token_o.map = [startLine, state.line];
	  const token_i = state.push('inline', '', 0);
	  token_i.content = state.src.slice(pos, max).trim();
	  token_i.map = [startLine, state.line];
	  token_i.children = [];
	  const token_c = state.push('heading_close', 'h' + String(level), -1);
	  token_c.markup = '########'.slice(0, level);
	  return true;
	}

	// lheading (---, ===)

	function lheading(state, startLine, endLine /*, silent */) {
	  const terminatorRules = state.md.block.ruler.getRules('paragraph');

	  // if it's indented more than 3 spaces, it should be a code block
	  if (state.sCount[startLine] - state.blkIndent >= 4) {
	    return false;
	  }
	  const oldParentType = state.parentType;
	  state.parentType = 'paragraph'; // use paragraph to match terminatorRules

	  // jump line-by-line until empty one or EOF
	  let level = 0;
	  let marker;
	  let nextLine = startLine + 1;
	  for (; nextLine < endLine && !state.isEmpty(nextLine); nextLine++) {
	    // this would be a code block normally, but after paragraph
	    // it's considered a lazy continuation regardless of what's there
	    if (state.sCount[nextLine] - state.blkIndent > 3) {
	      continue;
	    }

	    //
	    // Check for underline in setext header
	    //
	    if (state.sCount[nextLine] >= state.blkIndent) {
	      let pos = state.bMarks[nextLine] + state.tShift[nextLine];
	      const max = state.eMarks[nextLine];
	      if (pos < max) {
	        marker = state.src.charCodeAt(pos);
	        if (marker === 0x2D /* - */ || marker === 0x3D /* = */) {
	          pos = state.skipChars(pos, marker);
	          pos = state.skipSpaces(pos);
	          if (pos >= max) {
	            level = marker === 0x3D /* = */ ? 1 : 2;
	            break;
	          }
	        }
	      }
	    }

	    // quirk for blockquotes, this line should already be checked by that rule
	    if (state.sCount[nextLine] < 0) {
	      continue;
	    }

	    // Some tags can terminate paragraph without empty line.
	    let terminate = false;
	    for (let i = 0, l = terminatorRules.length; i < l; i++) {
	      if (terminatorRules[i](state, nextLine, endLine, true)) {
	        terminate = true;
	        break;
	      }
	    }
	    if (terminate) {
	      break;
	    }
	  }
	  if (!level) {
	    // Didn't find valid underline
	    return false;
	  }
	  const content = state.getLines(startLine, nextLine, state.blkIndent, false).trim();
	  state.line = nextLine + 1;
	  const token_o = state.push('heading_open', 'h' + String(level), 1);
	  token_o.markup = String.fromCharCode(marker);
	  token_o.map = [startLine, state.line];
	  const token_i = state.push('inline', '', 0);
	  token_i.content = content;
	  token_i.map = [startLine, state.line - 1];
	  token_i.children = [];
	  const token_c = state.push('heading_close', 'h' + String(level), -1);
	  token_c.markup = String.fromCharCode(marker);
	  state.parentType = oldParentType;
	  return true;
	}

	// Paragraph

	function paragraph(state, startLine, endLine) {
	  const terminatorRules = state.md.block.ruler.getRules('paragraph');
	  const oldParentType = state.parentType;
	  let nextLine = startLine + 1;
	  state.parentType = 'paragraph';

	  // jump line-by-line until empty one or EOF
	  for (; nextLine < endLine && !state.isEmpty(nextLine); nextLine++) {
	    // this would be a code block normally, but after paragraph
	    // it's considered a lazy continuation regardless of what's there
	    if (state.sCount[nextLine] - state.blkIndent > 3) {
	      continue;
	    }

	    // quirk for blockquotes, this line should already be checked by that rule
	    if (state.sCount[nextLine] < 0) {
	      continue;
	    }

	    // Some tags can terminate paragraph without empty line.
	    let terminate = false;
	    for (let i = 0, l = terminatorRules.length; i < l; i++) {
	      if (terminatorRules[i](state, nextLine, endLine, true)) {
	        terminate = true;
	        break;
	      }
	    }
	    if (terminate) {
	      break;
	    }
	  }
	  const content = state.getLines(startLine, nextLine, state.blkIndent, false).trim();
	  state.line = nextLine;
	  const token_o = state.push('paragraph_open', 'p', 1);
	  token_o.map = [startLine, state.line];
	  const token_i = state.push('inline', '', 0);
	  token_i.content = content;
	  token_i.map = [startLine, state.line];
	  token_i.children = [];
	  state.push('paragraph_close', 'p', -1);
	  state.parentType = oldParentType;
	  return true;
	}

	/** internal
	 * class ParserBlock
	 *
	 * Block-level tokenizer.
	 **/

	const _rules$1 = [
	// First 2 params - rule name & source. Secondary array - list of rules,
	// which can be terminated by this one.
	['table', table, ['paragraph', 'reference']], ['code', code], ['fence', fence, ['paragraph', 'reference', 'blockquote', 'list']], ['blockquote', blockquote, ['paragraph', 'reference', 'blockquote', 'list']], ['hr', hr, ['paragraph', 'reference', 'blockquote', 'list']], ['list', list, ['paragraph', 'reference', 'blockquote']], ['reference', reference], ['html_block', html_block, ['paragraph', 'reference', 'blockquote']], ['heading', heading, ['paragraph', 'reference', 'blockquote']], ['lheading', lheading], ['paragraph', paragraph]];

	/**
	 * new ParserBlock()
	 **/
	function ParserBlock() {
	  /**
	   * ParserBlock#ruler -> Ruler
	   *
	   * [[Ruler]] instance. Keep configuration of block rules.
	   **/
	  this.ruler = new Ruler();
	  for (let i = 0; i < _rules$1.length; i++) {
	    this.ruler.push(_rules$1[i][0], _rules$1[i][1], {
	      alt: (_rules$1[i][2] || []).slice()
	    });
	  }
	}

	// Generate tokens for input range
	//
	ParserBlock.prototype.tokenize = function (state, startLine, endLine) {
	  const rules = this.ruler.getRules('');
	  const len = rules.length;
	  const maxNesting = state.md.options.maxNesting;
	  let line = startLine;
	  let hasEmptyLines = false;
	  while (line < endLine) {
	    state.line = line = state.skipEmptyLines(line);
	    if (line >= endLine) {
	      break;
	    }

	    // Termination condition for nested calls.
	    // Nested calls currently used for blockquotes & lists
	    if (state.sCount[line] < state.blkIndent) {
	      break;
	    }

	    // If nesting level exceeded - skip tail to the end. That's not ordinary
	    // situation and we should not care about content.
	    if (state.level >= maxNesting) {
	      state.line = endLine;
	      break;
	    }

	    // Try all possible rules.
	    // On success, rule should:
	    //
	    // - update `state.line`
	    // - update `state.tokens`
	    // - return true
	    const prevLine = state.line;
	    let ok = false;
	    for (let i = 0; i < len; i++) {
	      ok = rules[i](state, line, endLine, false);
	      if (ok) {
	        if (prevLine >= state.line) {
	          throw new Error("block rule didn't increment state.line");
	        }
	        break;
	      }
	    }

	    // this can only happen if user disables paragraph rule
	    if (!ok) throw new Error('none of the block rules matched');

	    // set state.tight if we had an empty line before current tag
	    // i.e. latest empty line should not count
	    state.tight = !hasEmptyLines;

	    // paragraph might "eat" one newline after it in nested lists
	    if (state.isEmpty(state.line - 1)) {
	      hasEmptyLines = true;
	    }
	    line = state.line;
	    if (line < endLine && state.isEmpty(line)) {
	      hasEmptyLines = true;
	      line++;
	      state.line = line;
	    }
	  }
	};

	/**
	 * ParserBlock.parse(str, md, env, outTokens)
	 *
	 * Process input string and push block tokens into `outTokens`
	 **/
	ParserBlock.prototype.parse = function (src, md, env, outTokens) {
	  if (!src) {
	    return;
	  }
	  const state = new this.State(src, md, env, outTokens);
	  this.tokenize(state, state.line, state.lineMax);
	};
	ParserBlock.prototype.State = StateBlock;

	// Inline parser state

	function StateInline(src, md, env, outTokens) {
	  this.src = src;
	  this.env = env;
	  this.md = md;
	  this.tokens = outTokens;
	  this.tokens_meta = Array(outTokens.length);
	  this.pos = 0;
	  this.posMax = this.src.length;
	  this.level = 0;
	  this.pending = '';
	  this.pendingLevel = 0;

	  // Stores { start: end } pairs. Useful for backtrack
	  // optimization of pairs parse (emphasis, strikes).
	  this.cache = {};

	  // List of emphasis-like delimiters for current tag
	  this.delimiters = [];

	  // Stack of delimiter lists for upper level tags
	  this._prev_delimiters = [];

	  // backtick length => last seen position
	  this.backticks = {};
	  this.backticksScanned = false;

	  // Counter used to disable inline linkify-it execution
	  // inside <a> and markdown links
	  this.linkLevel = 0;
	}

	// Flush pending text
	//
	StateInline.prototype.pushPending = function () {
	  const token = new Token('text', '', 0);
	  token.content = this.pending;
	  token.level = this.pendingLevel;
	  this.tokens.push(token);
	  this.pending = '';
	  return token;
	};

	// Push new token to "stream".
	// If pending text exists - flush it as text token
	//
	StateInline.prototype.push = function (type, tag, nesting) {
	  if (this.pending) {
	    this.pushPending();
	  }
	  const token = new Token(type, tag, nesting);
	  let token_meta = null;
	  if (nesting < 0) {
	    // closing tag
	    this.level--;
	    this.delimiters = this._prev_delimiters.pop();
	  }
	  token.level = this.level;
	  if (nesting > 0) {
	    // opening tag
	    this.level++;
	    this._prev_delimiters.push(this.delimiters);
	    this.delimiters = [];
	    token_meta = {
	      delimiters: this.delimiters
	    };
	  }
	  this.pendingLevel = this.level;
	  this.tokens.push(token);
	  this.tokens_meta.push(token_meta);
	  return token;
	};

	// Scan a sequence of emphasis-like markers, and determine whether
	// it can start an emphasis sequence or end an emphasis sequence.
	//
	//  - start - position to scan from (it should point at a valid marker);
	//  - canSplitWord - determine if these markers can be found inside a word
	//
	StateInline.prototype.scanDelims = function (start, canSplitWord) {
	  const max = this.posMax;
	  const marker = this.src.charCodeAt(start);

	  // treat beginning of the line as a whitespace
	  const lastChar = start > 0 ? this.src.charCodeAt(start - 1) : 0x20;
	  let pos = start;
	  while (pos < max && this.src.charCodeAt(pos) === marker) {
	    pos++;
	  }
	  const count = pos - start;

	  // treat end of the line as a whitespace
	  const nextChar = pos < max ? this.src.charCodeAt(pos) : 0x20;
	  const isLastPunctChar = isMdAsciiPunct(lastChar) || isPunctChar(String.fromCharCode(lastChar));
	  const isNextPunctChar = isMdAsciiPunct(nextChar) || isPunctChar(String.fromCharCode(nextChar));
	  const isLastWhiteSpace = isWhiteSpace(lastChar);
	  const isNextWhiteSpace = isWhiteSpace(nextChar);
	  const left_flanking = !isNextWhiteSpace && (!isNextPunctChar || isLastWhiteSpace || isLastPunctChar);
	  const right_flanking = !isLastWhiteSpace && (!isLastPunctChar || isNextWhiteSpace || isNextPunctChar);
	  const can_open = left_flanking && (canSplitWord || !right_flanking || isLastPunctChar);
	  const can_close = right_flanking && (canSplitWord || !left_flanking || isNextPunctChar);
	  return {
	    can_open,
	    can_close,
	    length: count
	  };
	};

	// re-export Token class to use in block rules
	StateInline.prototype.Token = Token;

	// Skip text characters for text token, place those to pending buffer
	// and increment current pos

	// Rule to skip pure text
	// '{}$%@~+=:' reserved for extentions

	// !, ", #, $, %, &, ', (, ), *, +, ,, -, ., /, :, ;, <, =, >, ?, @, [, \, ], ^, _, `, {, |, }, or ~

	// !!!! Don't confuse with "Markdown ASCII Punctuation" chars
	// http://spec.commonmark.org/0.15/#ascii-punctuation-character
	function isTerminatorChar(ch) {
	  switch (ch) {
	    case 0x0A /* \n */:
	    case 0x21 /* ! */:
	    case 0x23 /* # */:
	    case 0x24 /* $ */:
	    case 0x25 /* % */:
	    case 0x26 /* & */:
	    case 0x2A /* * */:
	    case 0x2B /* + */:
	    case 0x2D /* - */:
	    case 0x3A /* : */:
	    case 0x3C /* < */:
	    case 0x3D /* = */:
	    case 0x3E /* > */:
	    case 0x40 /* @ */:
	    case 0x5B /* [ */:
	    case 0x5C /* \ */:
	    case 0x5D /* ] */:
	    case 0x5E /* ^ */:
	    case 0x5F /* _ */:
	    case 0x60 /* ` */:
	    case 0x7B /* { */:
	    case 0x7D /* } */:
	    case 0x7E /* ~ */:
	      return true;
	    default:
	      return false;
	  }
	}
	function text(state, silent) {
	  let pos = state.pos;
	  while (pos < state.posMax && !isTerminatorChar(state.src.charCodeAt(pos))) {
	    pos++;
	  }
	  if (pos === state.pos) {
	    return false;
	  }
	  if (!silent) {
	    state.pending += state.src.slice(state.pos, pos);
	  }
	  state.pos = pos;
	  return true;
	}

	// Alternative implementation, for memory.
	//
	// It costs 10% of performance, but allows extend terminators list, if place it
	// to `ParserInline` property. Probably, will switch to it sometime, such
	// flexibility required.

	/*
	var TERMINATOR_RE = /[\n!#$%&*+\-:<=>@[\\\]^_`{}~]/;

	module.exports = function text(state, silent) {
	  var pos = state.pos,
	      idx = state.src.slice(pos).search(TERMINATOR_RE);

	  // first char is terminator -> empty text
	  if (idx === 0) { return false; }

	  // no terminator -> text till end of string
	  if (idx < 0) {
	    if (!silent) { state.pending += state.src.slice(pos); }
	    state.pos = state.src.length;
	    return true;
	  }

	  if (!silent) { state.pending += state.src.slice(pos, pos + idx); }

	  state.pos += idx;

	  return true;
	}; */

	// Process links like https://example.org/

	// RFC3986: scheme = ALPHA *( ALPHA / DIGIT / "+" / "-" / "." )
	const SCHEME_RE = /(?:^|[^a-z0-9.+-])([a-z][a-z0-9.+-]*)$/i;
	function linkify(state, silent) {
	  if (!state.md.options.linkify) return false;
	  if (state.linkLevel > 0) return false;
	  const pos = state.pos;
	  const max = state.posMax;
	  if (pos + 3 > max) return false;
	  if (state.src.charCodeAt(pos) !== 0x3A /* : */) return false;
	  if (state.src.charCodeAt(pos + 1) !== 0x2F /* / */) return false;
	  if (state.src.charCodeAt(pos + 2) !== 0x2F /* / */) return false;
	  const match = state.pending.match(SCHEME_RE);
	  if (!match) return false;
	  const proto = match[1];
	  const link = state.md.linkify.matchAtStart(state.src.slice(pos - proto.length));
	  if (!link) return false;
	  let url = link.url;

	  // invalid link, but still detected by linkify somehow;
	  // need to check to prevent infinite loop below
	  if (url.length <= proto.length) return false;

	  // disallow '*' at the end of the link (conflicts with emphasis)
	  url = url.replace(/\*+$/, '');
	  const fullUrl = state.md.normalizeLink(url);
	  if (!state.md.validateLink(fullUrl)) return false;
	  if (!silent) {
	    state.pending = state.pending.slice(0, -proto.length);
	    const token_o = state.push('link_open', 'a', 1);
	    token_o.attrs = [['href', fullUrl]];
	    token_o.markup = 'linkify';
	    token_o.info = 'auto';
	    const token_t = state.push('text', '', 0);
	    token_t.content = state.md.normalizeLinkText(url);
	    const token_c = state.push('link_close', 'a', -1);
	    token_c.markup = 'linkify';
	    token_c.info = 'auto';
	  }
	  state.pos += url.length - proto.length;
	  return true;
	}

	// Proceess '\n'

	function newline(state, silent) {
	  let pos = state.pos;
	  if (state.src.charCodeAt(pos) !== 0x0A /* \n */) {
	    return false;
	  }
	  const pmax = state.pending.length - 1;
	  const max = state.posMax;

	  // '  \n' -> hardbreak
	  // Lookup in pending chars is bad practice! Don't copy to other rules!
	  // Pending string is stored in concat mode, indexed lookups will cause
	  // convertion to flat mode.
	  if (!silent) {
	    if (pmax >= 0 && state.pending.charCodeAt(pmax) === 0x20) {
	      if (pmax >= 1 && state.pending.charCodeAt(pmax - 1) === 0x20) {
	        // Find whitespaces tail of pending chars.
	        let ws = pmax - 1;
	        while (ws >= 1 && state.pending.charCodeAt(ws - 1) === 0x20) ws--;
	        state.pending = state.pending.slice(0, ws);
	        state.push('hardbreak', 'br', 0);
	      } else {
	        state.pending = state.pending.slice(0, -1);
	        state.push('softbreak', 'br', 0);
	      }
	    } else {
	      state.push('softbreak', 'br', 0);
	    }
	  }
	  pos++;

	  // skip heading spaces for next line
	  while (pos < max && isSpace(state.src.charCodeAt(pos))) {
	    pos++;
	  }
	  state.pos = pos;
	  return true;
	}

	// Process escaped chars and hardbreaks

	const ESCAPED = [];
	for (let i = 0; i < 256; i++) {
	  ESCAPED.push(0);
	}
	'\\!"#$%&\'()*+,./:;<=>?@[]^_`{|}~-'.split('').forEach(function (ch) {
	  ESCAPED[ch.charCodeAt(0)] = 1;
	});
	function escape(state, silent) {
	  let pos = state.pos;
	  const max = state.posMax;
	  if (state.src.charCodeAt(pos) !== 0x5C /* \ */) return false;
	  pos++;

	  // '\' at the end of the inline block
	  if (pos >= max) return false;
	  let ch1 = state.src.charCodeAt(pos);
	  if (ch1 === 0x0A) {
	    if (!silent) {
	      state.push('hardbreak', 'br', 0);
	    }
	    pos++;
	    // skip leading whitespaces from next line
	    while (pos < max) {
	      ch1 = state.src.charCodeAt(pos);
	      if (!isSpace(ch1)) break;
	      pos++;
	    }
	    state.pos = pos;
	    return true;
	  }
	  let escapedStr = state.src[pos];
	  if (ch1 >= 0xD800 && ch1 <= 0xDBFF && pos + 1 < max) {
	    const ch2 = state.src.charCodeAt(pos + 1);
	    if (ch2 >= 0xDC00 && ch2 <= 0xDFFF) {
	      escapedStr += state.src[pos + 1];
	      pos++;
	    }
	  }
	  const origStr = '\\' + escapedStr;
	  if (!silent) {
	    const token = state.push('text_special', '', 0);
	    if (ch1 < 256 && ESCAPED[ch1] !== 0) {
	      token.content = escapedStr;
	    } else {
	      token.content = origStr;
	    }
	    token.markup = origStr;
	    token.info = 'escape';
	  }
	  state.pos = pos + 1;
	  return true;
	}

	// Parse backticks

	function backtick(state, silent) {
	  let pos = state.pos;
	  const ch = state.src.charCodeAt(pos);
	  if (ch !== 0x60 /* ` */) {
	    return false;
	  }
	  const start = pos;
	  pos++;
	  const max = state.posMax;

	  // scan marker length
	  while (pos < max && state.src.charCodeAt(pos) === 0x60 /* ` */) {
	    pos++;
	  }
	  const marker = state.src.slice(start, pos);
	  const openerLength = marker.length;
	  if (state.backticksScanned && (state.backticks[openerLength] || 0) <= start) {
	    if (!silent) state.pending += marker;
	    state.pos += openerLength;
	    return true;
	  }
	  let matchEnd = pos;
	  let matchStart;

	  // Nothing found in the cache, scan until the end of the line (or until marker is found)
	  while ((matchStart = state.src.indexOf('`', matchEnd)) !== -1) {
	    matchEnd = matchStart + 1;

	    // scan marker length
	    while (matchEnd < max && state.src.charCodeAt(matchEnd) === 0x60 /* ` */) {
	      matchEnd++;
	    }
	    const closerLength = matchEnd - matchStart;
	    if (closerLength === openerLength) {
	      // Found matching closer length.
	      if (!silent) {
	        const token = state.push('code_inline', 'code', 0);
	        token.markup = marker;
	        token.content = state.src.slice(pos, matchStart).replace(/\n/g, ' ').replace(/^ (.+) $/, '$1');
	      }
	      state.pos = matchEnd;
	      return true;
	    }

	    // Some different length found, put it in cache as upper limit of where closer can be found
	    state.backticks[closerLength] = matchStart;
	  }

	  // Scanned through the end, didn't find anything
	  state.backticksScanned = true;
	  if (!silent) state.pending += marker;
	  state.pos += openerLength;
	  return true;
	}

	// ~~strike through~~
	//

	// Insert each marker as a separate text token, and add it to delimiter list
	//
	function strikethrough_tokenize(state, silent) {
	  const start = state.pos;
	  const marker = state.src.charCodeAt(start);
	  if (silent) {
	    return false;
	  }
	  if (marker !== 0x7E /* ~ */) {
	    return false;
	  }
	  const scanned = state.scanDelims(state.pos, true);
	  let len = scanned.length;
	  const ch = String.fromCharCode(marker);
	  if (len < 2) {
	    return false;
	  }
	  let token;
	  if (len % 2) {
	    token = state.push('text', '', 0);
	    token.content = ch;
	    len--;
	  }
	  for (let i = 0; i < len; i += 2) {
	    token = state.push('text', '', 0);
	    token.content = ch + ch;
	    state.delimiters.push({
	      marker,
	      length: 0,
	      // disable "rule of 3" length checks meant for emphasis
	      token: state.tokens.length - 1,
	      end: -1,
	      open: scanned.can_open,
	      close: scanned.can_close
	    });
	  }
	  state.pos += scanned.length;
	  return true;
	}
	function postProcess$1(state, delimiters) {
	  let token;
	  const loneMarkers = [];
	  const max = delimiters.length;
	  for (let i = 0; i < max; i++) {
	    const startDelim = delimiters[i];
	    if (startDelim.marker !== 0x7E /* ~ */) {
	      continue;
	    }
	    if (startDelim.end === -1) {
	      continue;
	    }
	    const endDelim = delimiters[startDelim.end];
	    token = state.tokens[startDelim.token];
	    token.type = 's_open';
	    token.tag = 's';
	    token.nesting = 1;
	    token.markup = '~~';
	    token.content = '';
	    token = state.tokens[endDelim.token];
	    token.type = 's_close';
	    token.tag = 's';
	    token.nesting = -1;
	    token.markup = '~~';
	    token.content = '';
	    if (state.tokens[endDelim.token - 1].type === 'text' && state.tokens[endDelim.token - 1].content === '~') {
	      loneMarkers.push(endDelim.token - 1);
	    }
	  }

	  // If a marker sequence has an odd number of characters, it's splitted
	  // like this: `~~~~~` -> `~` + `~~` + `~~`, leaving one marker at the
	  // start of the sequence.
	  //
	  // So, we have to move all those markers after subsequent s_close tags.
	  //
	  while (loneMarkers.length) {
	    const i = loneMarkers.pop();
	    let j = i + 1;
	    while (j < state.tokens.length && state.tokens[j].type === 's_close') {
	      j++;
	    }
	    j--;
	    if (i !== j) {
	      token = state.tokens[j];
	      state.tokens[j] = state.tokens[i];
	      state.tokens[i] = token;
	    }
	  }
	}

	// Walk through delimiter list and replace text tokens with tags
	//
	function strikethrough_postProcess(state) {
	  const tokens_meta = state.tokens_meta;
	  const max = state.tokens_meta.length;
	  postProcess$1(state, state.delimiters);
	  for (let curr = 0; curr < max; curr++) {
	    if (tokens_meta[curr] && tokens_meta[curr].delimiters) {
	      postProcess$1(state, tokens_meta[curr].delimiters);
	    }
	  }
	}
	var r_strikethrough = {
	  tokenize: strikethrough_tokenize,
	  postProcess: strikethrough_postProcess
	};

	// Process *this* and _that_
	//

	// Insert each marker as a separate text token, and add it to delimiter list
	//
	function emphasis_tokenize(state, silent) {
	  const start = state.pos;
	  const marker = state.src.charCodeAt(start);
	  if (silent) {
	    return false;
	  }
	  if (marker !== 0x5F /* _ */ && marker !== 0x2A /* * */) {
	    return false;
	  }
	  const scanned = state.scanDelims(state.pos, marker === 0x2A);
	  for (let i = 0; i < scanned.length; i++) {
	    const token = state.push('text', '', 0);
	    token.content = String.fromCharCode(marker);
	    state.delimiters.push({
	      // Char code of the starting marker (number).
	      //
	      marker,
	      // Total length of these series of delimiters.
	      //
	      length: scanned.length,
	      // A position of the token this delimiter corresponds to.
	      //
	      token: state.tokens.length - 1,
	      // If this delimiter is matched as a valid opener, `end` will be
	      // equal to its position, otherwise it's `-1`.
	      //
	      end: -1,
	      // Boolean flags that determine if this delimiter could open or close
	      // an emphasis.
	      //
	      open: scanned.can_open,
	      close: scanned.can_close
	    });
	  }
	  state.pos += scanned.length;
	  return true;
	}
	function postProcess(state, delimiters) {
	  const max = delimiters.length;
	  for (let i = max - 1; i >= 0; i--) {
	    const startDelim = delimiters[i];
	    if (startDelim.marker !== 0x5F /* _ */ && startDelim.marker !== 0x2A /* * */) {
	      continue;
	    }

	    // Process only opening markers
	    if (startDelim.end === -1) {
	      continue;
	    }
	    const endDelim = delimiters[startDelim.end];

	    // If the previous delimiter has the same marker and is adjacent to this one,
	    // merge those into one strong delimiter.
	    //
	    // `<em><em>whatever</em></em>` -> `<strong>whatever</strong>`
	    //
	    const isStrong = i > 0 && delimiters[i - 1].end === startDelim.end + 1 &&
	    // check that first two markers match and adjacent
	    delimiters[i - 1].marker === startDelim.marker && delimiters[i - 1].token === startDelim.token - 1 &&
	    // check that last two markers are adjacent (we can safely assume they match)
	    delimiters[startDelim.end + 1].token === endDelim.token + 1;
	    const ch = String.fromCharCode(startDelim.marker);
	    const token_o = state.tokens[startDelim.token];
	    token_o.type = isStrong ? 'strong_open' : 'em_open';
	    token_o.tag = isStrong ? 'strong' : 'em';
	    token_o.nesting = 1;
	    token_o.markup = isStrong ? ch + ch : ch;
	    token_o.content = '';
	    const token_c = state.tokens[endDelim.token];
	    token_c.type = isStrong ? 'strong_close' : 'em_close';
	    token_c.tag = isStrong ? 'strong' : 'em';
	    token_c.nesting = -1;
	    token_c.markup = isStrong ? ch + ch : ch;
	    token_c.content = '';
	    if (isStrong) {
	      state.tokens[delimiters[i - 1].token].content = '';
	      state.tokens[delimiters[startDelim.end + 1].token].content = '';
	      i--;
	    }
	  }
	}

	// Walk through delimiter list and replace text tokens with tags
	//
	function emphasis_post_process(state) {
	  const tokens_meta = state.tokens_meta;
	  const max = state.tokens_meta.length;
	  postProcess(state, state.delimiters);
	  for (let curr = 0; curr < max; curr++) {
	    if (tokens_meta[curr] && tokens_meta[curr].delimiters) {
	      postProcess(state, tokens_meta[curr].delimiters);
	    }
	  }
	}
	var r_emphasis = {
	  tokenize: emphasis_tokenize,
	  postProcess: emphasis_post_process
	};

	// Process [link](<to> "stuff")

	function link(state, silent) {
	  let code, label, res, ref;
	  let href = '';
	  let title = '';
	  let start = state.pos;
	  let parseReference = true;
	  if (state.src.charCodeAt(state.pos) !== 0x5B /* [ */) {
	    return false;
	  }
	  const oldPos = state.pos;
	  const max = state.posMax;
	  const labelStart = state.pos + 1;
	  const labelEnd = state.md.helpers.parseLinkLabel(state, state.pos, true);

	  // parser failed to find ']', so it's not a valid link
	  if (labelEnd < 0) {
	    return false;
	  }
	  let pos = labelEnd + 1;
	  if (pos < max && state.src.charCodeAt(pos) === 0x28 /* ( */) {
	    //
	    // Inline link
	    //

	    // might have found a valid shortcut link, disable reference parsing
	    parseReference = false;

	    // [link](  <href>  "title"  )
	    //        ^^ skipping these spaces
	    pos++;
	    for (; pos < max; pos++) {
	      code = state.src.charCodeAt(pos);
	      if (!isSpace(code) && code !== 0x0A) {
	        break;
	      }
	    }
	    if (pos >= max) {
	      return false;
	    }

	    // [link](  <href>  "title"  )
	    //          ^^^^^^ parsing link destination
	    start = pos;
	    res = state.md.helpers.parseLinkDestination(state.src, pos, state.posMax);
	    if (res.ok) {
	      href = state.md.normalizeLink(res.str);
	      if (state.md.validateLink(href)) {
	        pos = res.pos;
	      } else {
	        href = '';
	      }

	      // [link](  <href>  "title"  )
	      //                ^^ skipping these spaces
	      start = pos;
	      for (; pos < max; pos++) {
	        code = state.src.charCodeAt(pos);
	        if (!isSpace(code) && code !== 0x0A) {
	          break;
	        }
	      }

	      // [link](  <href>  "title"  )
	      //                  ^^^^^^^ parsing link title
	      res = state.md.helpers.parseLinkTitle(state.src, pos, state.posMax);
	      if (pos < max && start !== pos && res.ok) {
	        title = res.str;
	        pos = res.pos;

	        // [link](  <href>  "title"  )
	        //                         ^^ skipping these spaces
	        for (; pos < max; pos++) {
	          code = state.src.charCodeAt(pos);
	          if (!isSpace(code) && code !== 0x0A) {
	            break;
	          }
	        }
	      }
	    }
	    if (pos >= max || state.src.charCodeAt(pos) !== 0x29 /* ) */) {
	      // parsing a valid shortcut link failed, fallback to reference
	      parseReference = true;
	    }
	    pos++;
	  }
	  if (parseReference) {
	    //
	    // Link reference
	    //
	    if (typeof state.env.references === 'undefined') {
	      return false;
	    }
	    if (pos < max && state.src.charCodeAt(pos) === 0x5B /* [ */) {
	      start = pos + 1;
	      pos = state.md.helpers.parseLinkLabel(state, pos);
	      if (pos >= 0) {
	        label = state.src.slice(start, pos++);
	      } else {
	        pos = labelEnd + 1;
	      }
	    } else {
	      pos = labelEnd + 1;
	    }

	    // covers label === '' and label === undefined
	    // (collapsed reference link and shortcut reference link respectively)
	    if (!label) {
	      label = state.src.slice(labelStart, labelEnd);
	    }
	    ref = state.env.references[normalizeReference(label)];
	    if (!ref) {
	      state.pos = oldPos;
	      return false;
	    }
	    href = ref.href;
	    title = ref.title;
	  }

	  //
	  // We found the end of the link, and know for a fact it's a valid link;
	  // so all that's left to do is to call tokenizer.
	  //
	  if (!silent) {
	    state.pos = labelStart;
	    state.posMax = labelEnd;
	    const token_o = state.push('link_open', 'a', 1);
	    const attrs = [['href', href]];
	    token_o.attrs = attrs;
	    if (title) {
	      attrs.push(['title', title]);
	    }
	    state.linkLevel++;
	    state.md.inline.tokenize(state);
	    state.linkLevel--;
	    state.push('link_close', 'a', -1);
	  }
	  state.pos = pos;
	  state.posMax = max;
	  return true;
	}

	// Process ![image](<src> "title")

	function image(state, silent) {
	  let code, content, label, pos, ref, res, title, start;
	  let href = '';
	  const oldPos = state.pos;
	  const max = state.posMax;
	  if (state.src.charCodeAt(state.pos) !== 0x21 /* ! */) {
	    return false;
	  }
	  if (state.src.charCodeAt(state.pos + 1) !== 0x5B /* [ */) {
	    return false;
	  }
	  const labelStart = state.pos + 2;
	  const labelEnd = state.md.helpers.parseLinkLabel(state, state.pos + 1, false);

	  // parser failed to find ']', so it's not a valid link
	  if (labelEnd < 0) {
	    return false;
	  }
	  pos = labelEnd + 1;
	  if (pos < max && state.src.charCodeAt(pos) === 0x28 /* ( */) {
	    //
	    // Inline link
	    //

	    // [link](  <href>  "title"  )
	    //        ^^ skipping these spaces
	    pos++;
	    for (; pos < max; pos++) {
	      code = state.src.charCodeAt(pos);
	      if (!isSpace(code) && code !== 0x0A) {
	        break;
	      }
	    }
	    if (pos >= max) {
	      return false;
	    }

	    // [link](  <href>  "title"  )
	    //          ^^^^^^ parsing link destination
	    start = pos;
	    res = state.md.helpers.parseLinkDestination(state.src, pos, state.posMax);
	    if (res.ok) {
	      href = state.md.normalizeLink(res.str);
	      if (state.md.validateLink(href)) {
	        pos = res.pos;
	      } else {
	        href = '';
	      }
	    }

	    // [link](  <href>  "title"  )
	    //                ^^ skipping these spaces
	    start = pos;
	    for (; pos < max; pos++) {
	      code = state.src.charCodeAt(pos);
	      if (!isSpace(code) && code !== 0x0A) {
	        break;
	      }
	    }

	    // [link](  <href>  "title"  )
	    //                  ^^^^^^^ parsing link title
	    res = state.md.helpers.parseLinkTitle(state.src, pos, state.posMax);
	    if (pos < max && start !== pos && res.ok) {
	      title = res.str;
	      pos = res.pos;

	      // [link](  <href>  "title"  )
	      //                         ^^ skipping these spaces
	      for (; pos < max; pos++) {
	        code = state.src.charCodeAt(pos);
	        if (!isSpace(code) && code !== 0x0A) {
	          break;
	        }
	      }
	    } else {
	      title = '';
	    }
	    if (pos >= max || state.src.charCodeAt(pos) !== 0x29 /* ) */) {
	      state.pos = oldPos;
	      return false;
	    }
	    pos++;
	  } else {
	    //
	    // Link reference
	    //
	    if (typeof state.env.references === 'undefined') {
	      return false;
	    }
	    if (pos < max && state.src.charCodeAt(pos) === 0x5B /* [ */) {
	      start = pos + 1;
	      pos = state.md.helpers.parseLinkLabel(state, pos);
	      if (pos >= 0) {
	        label = state.src.slice(start, pos++);
	      } else {
	        pos = labelEnd + 1;
	      }
	    } else {
	      pos = labelEnd + 1;
	    }

	    // covers label === '' and label === undefined
	    // (collapsed reference link and shortcut reference link respectively)
	    if (!label) {
	      label = state.src.slice(labelStart, labelEnd);
	    }
	    ref = state.env.references[normalizeReference(label)];
	    if (!ref) {
	      state.pos = oldPos;
	      return false;
	    }
	    href = ref.href;
	    title = ref.title;
	  }

	  //
	  // We found the end of the link, and know for a fact it's a valid link;
	  // so all that's left to do is to call tokenizer.
	  //
	  if (!silent) {
	    content = state.src.slice(labelStart, labelEnd);
	    const tokens = [];
	    state.md.inline.parse(content, state.md, state.env, tokens);
	    const token = state.push('image', 'img', 0);
	    const attrs = [['src', href], ['alt', '']];
	    token.attrs = attrs;
	    token.children = tokens;
	    token.content = content;
	    if (title) {
	      attrs.push(['title', title]);
	    }
	  }
	  state.pos = pos;
	  state.posMax = max;
	  return true;
	}

	// Process autolinks '<protocol:...>'

	/* eslint max-len:0 */
	const EMAIL_RE = /^([a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*)$/;
	/* eslint-disable-next-line no-control-regex */
	const AUTOLINK_RE = /^([a-zA-Z][a-zA-Z0-9+.-]{1,31}):([^<>\x00-\x20]*)$/;
	function autolink(state, silent) {
	  let pos = state.pos;
	  if (state.src.charCodeAt(pos) !== 0x3C /* < */) {
	    return false;
	  }
	  const start = state.pos;
	  const max = state.posMax;
	  for (;;) {
	    if (++pos >= max) return false;
	    const ch = state.src.charCodeAt(pos);
	    if (ch === 0x3C /* < */) return false;
	    if (ch === 0x3E /* > */) break;
	  }
	  const url = state.src.slice(start + 1, pos);
	  if (AUTOLINK_RE.test(url)) {
	    const fullUrl = state.md.normalizeLink(url);
	    if (!state.md.validateLink(fullUrl)) {
	      return false;
	    }
	    if (!silent) {
	      const token_o = state.push('link_open', 'a', 1);
	      token_o.attrs = [['href', fullUrl]];
	      token_o.markup = 'autolink';
	      token_o.info = 'auto';
	      const token_t = state.push('text', '', 0);
	      token_t.content = state.md.normalizeLinkText(url);
	      const token_c = state.push('link_close', 'a', -1);
	      token_c.markup = 'autolink';
	      token_c.info = 'auto';
	    }
	    state.pos += url.length + 2;
	    return true;
	  }
	  if (EMAIL_RE.test(url)) {
	    const fullUrl = state.md.normalizeLink('mailto:' + url);
	    if (!state.md.validateLink(fullUrl)) {
	      return false;
	    }
	    if (!silent) {
	      const token_o = state.push('link_open', 'a', 1);
	      token_o.attrs = [['href', fullUrl]];
	      token_o.markup = 'autolink';
	      token_o.info = 'auto';
	      const token_t = state.push('text', '', 0);
	      token_t.content = state.md.normalizeLinkText(url);
	      const token_c = state.push('link_close', 'a', -1);
	      token_c.markup = 'autolink';
	      token_c.info = 'auto';
	    }
	    state.pos += url.length + 2;
	    return true;
	  }
	  return false;
	}

	// Process html tags

	function isLinkOpen(str) {
	  return /^<a[>\s]/i.test(str);
	}
	function isLinkClose(str) {
	  return /^<\/a\s*>/i.test(str);
	}
	function isLetter(ch) {
	  /* eslint no-bitwise:0 */
	  const lc = ch | 0x20; // to lower case
	  return lc >= 0x61 /* a */ && lc <= 0x7a /* z */;
	}
	function html_inline(state, silent) {
	  if (!state.md.options.html) {
	    return false;
	  }

	  // Check start
	  const max = state.posMax;
	  const pos = state.pos;
	  if (state.src.charCodeAt(pos) !== 0x3C /* < */ || pos + 2 >= max) {
	    return false;
	  }

	  // Quick fail on second char
	  const ch = state.src.charCodeAt(pos + 1);
	  if (ch !== 0x21 /* ! */ && ch !== 0x3F /* ? */ && ch !== 0x2F /* / */ && !isLetter(ch)) {
	    return false;
	  }
	  const match = state.src.slice(pos).match(HTML_TAG_RE);
	  if (!match) {
	    return false;
	  }
	  if (!silent) {
	    const token = state.push('html_inline', '', 0);
	    token.content = match[0];
	    if (isLinkOpen(token.content)) state.linkLevel++;
	    if (isLinkClose(token.content)) state.linkLevel--;
	  }
	  state.pos += match[0].length;
	  return true;
	}

	// Process html entity - &#123;, &#xAF;, &quot;, ...

	const DIGITAL_RE = /^&#((?:x[a-f0-9]{1,6}|[0-9]{1,7}));/i;
	const NAMED_RE = /^&([a-z][a-z0-9]{1,31});/i;
	function entity(state, silent) {
	  const pos = state.pos;
	  const max = state.posMax;
	  if (state.src.charCodeAt(pos) !== 0x26 /* & */) return false;
	  if (pos + 1 >= max) return false;
	  const ch = state.src.charCodeAt(pos + 1);
	  if (ch === 0x23 /* # */) {
	    const match = state.src.slice(pos).match(DIGITAL_RE);
	    if (match) {
	      if (!silent) {
	        const code = match[1][0].toLowerCase() === 'x' ? parseInt(match[1].slice(1), 16) : parseInt(match[1], 10);
	        const token = state.push('text_special', '', 0);
	        token.content = isValidEntityCode(code) ? fromCodePoint(code) : fromCodePoint(0xFFFD);
	        token.markup = match[0];
	        token.info = 'entity';
	      }
	      state.pos += match[0].length;
	      return true;
	    }
	  } else {
	    const match = state.src.slice(pos).match(NAMED_RE);
	    if (match) {
	      const decoded = entities.decodeHTML(match[0]);
	      if (decoded !== match[0]) {
	        if (!silent) {
	          const token = state.push('text_special', '', 0);
	          token.content = decoded;
	          token.markup = match[0];
	          token.info = 'entity';
	        }
	        state.pos += match[0].length;
	        return true;
	      }
	    }
	  }
	  return false;
	}

	// For each opening emphasis-like marker find a matching closing one
	//

	function processDelimiters(delimiters) {
	  const openersBottom = {};
	  const max = delimiters.length;
	  if (!max) return;

	  // headerIdx is the first delimiter of the current (where closer is) delimiter run
	  let headerIdx = 0;
	  let lastTokenIdx = -2; // needs any value lower than -1
	  const jumps = [];
	  for (let closerIdx = 0; closerIdx < max; closerIdx++) {
	    const closer = delimiters[closerIdx];
	    jumps.push(0);

	    // markers belong to same delimiter run if:
	    //  - they have adjacent tokens
	    //  - AND markers are the same
	    //
	    if (delimiters[headerIdx].marker !== closer.marker || lastTokenIdx !== closer.token - 1) {
	      headerIdx = closerIdx;
	    }
	    lastTokenIdx = closer.token;

	    // Length is only used for emphasis-specific "rule of 3",
	    // if it's not defined (in strikethrough or 3rd party plugins),
	    // we can default it to 0 to disable those checks.
	    //
	    closer.length = closer.length || 0;
	    if (!closer.close) continue;

	    // Previously calculated lower bounds (previous fails)
	    // for each marker, each delimiter length modulo 3,
	    // and for whether this closer can be an opener;
	    // https://github.com/commonmark/cmark/commit/34250e12ccebdc6372b8b49c44fab57c72443460
	    /* eslint-disable-next-line no-prototype-builtins */
	    if (!openersBottom.hasOwnProperty(closer.marker)) {
	      openersBottom[closer.marker] = [-1, -1, -1, -1, -1, -1];
	    }
	    const minOpenerIdx = openersBottom[closer.marker][(closer.open ? 3 : 0) + closer.length % 3];
	    let openerIdx = headerIdx - jumps[headerIdx] - 1;
	    let newMinOpenerIdx = openerIdx;
	    for (; openerIdx > minOpenerIdx; openerIdx -= jumps[openerIdx] + 1) {
	      const opener = delimiters[openerIdx];
	      if (opener.marker !== closer.marker) continue;
	      if (opener.open && opener.end < 0) {
	        let isOddMatch = false;

	        // from spec:
	        //
	        // If one of the delimiters can both open and close emphasis, then the
	        // sum of the lengths of the delimiter runs containing the opening and
	        // closing delimiters must not be a multiple of 3 unless both lengths
	        // are multiples of 3.
	        //
	        if (opener.close || closer.open) {
	          if ((opener.length + closer.length) % 3 === 0) {
	            if (opener.length % 3 !== 0 || closer.length % 3 !== 0) {
	              isOddMatch = true;
	            }
	          }
	        }
	        if (!isOddMatch) {
	          // If previous delimiter cannot be an opener, we can safely skip
	          // the entire sequence in future checks. This is required to make
	          // sure algorithm has linear complexity (see *_*_*_*_*_... case).
	          //
	          const lastJump = openerIdx > 0 && !delimiters[openerIdx - 1].open ? jumps[openerIdx - 1] + 1 : 0;
	          jumps[closerIdx] = closerIdx - openerIdx + lastJump;
	          jumps[openerIdx] = lastJump;
	          closer.open = false;
	          opener.end = closerIdx;
	          opener.close = false;
	          newMinOpenerIdx = -1;
	          // treat next token as start of run,
	          // it optimizes skips in **<...>**a**<...>** pathological case
	          lastTokenIdx = -2;
	          break;
	        }
	      }
	    }
	    if (newMinOpenerIdx !== -1) {
	      // If match for this delimiter run failed, we want to set lower bound for
	      // future lookups. This is required to make sure algorithm has linear
	      // complexity.
	      //
	      // See details here:
	      // https://github.com/commonmark/cmark/issues/178#issuecomment-270417442
	      //
	      openersBottom[closer.marker][(closer.open ? 3 : 0) + (closer.length || 0) % 3] = newMinOpenerIdx;
	    }
	  }
	}
	function link_pairs(state) {
	  const tokens_meta = state.tokens_meta;
	  const max = state.tokens_meta.length;
	  processDelimiters(state.delimiters);
	  for (let curr = 0; curr < max; curr++) {
	    if (tokens_meta[curr] && tokens_meta[curr].delimiters) {
	      processDelimiters(tokens_meta[curr].delimiters);
	    }
	  }
	}

	// Clean up tokens after emphasis and strikethrough postprocessing:
	// merge adjacent text nodes into one and re-calculate all token levels
	//
	// This is necessary because initially emphasis delimiter markers (*, _, ~)
	// are treated as their own separate text tokens. Then emphasis rule either
	// leaves them as text (needed to merge with adjacent text) or turns them
	// into opening/closing tags (which messes up levels inside).
	//

	function fragments_join(state) {
	  let curr, last;
	  let level = 0;
	  const tokens = state.tokens;
	  const max = state.tokens.length;
	  for (curr = last = 0; curr < max; curr++) {
	    // re-calculate levels after emphasis/strikethrough turns some text nodes
	    // into opening/closing tags
	    if (tokens[curr].nesting < 0) level--; // closing tag
	    tokens[curr].level = level;
	    if (tokens[curr].nesting > 0) level++; // opening tag

	    if (tokens[curr].type === 'text' && curr + 1 < max && tokens[curr + 1].type === 'text') {
	      // collapse two adjacent text nodes
	      tokens[curr + 1].content = tokens[curr].content + tokens[curr + 1].content;
	    } else {
	      if (curr !== last) {
	        tokens[last] = tokens[curr];
	      }
	      last++;
	    }
	  }
	  if (curr !== last) {
	    tokens.length = last;
	  }
	}

	/** internal
	 * class ParserInline
	 *
	 * Tokenizes paragraph content.
	 **/


	// Parser rules

	const _rules = [['text', text], ['linkify', linkify], ['newline', newline], ['escape', escape], ['backticks', backtick], ['strikethrough', r_strikethrough.tokenize], ['emphasis', r_emphasis.tokenize], ['link', link], ['image', image], ['autolink', autolink], ['html_inline', html_inline], ['entity', entity]];

	// `rule2` ruleset was created specifically for emphasis/strikethrough
	// post-processing and may be changed in the future.
	//
	// Don't use this for anything except pairs (plugins working with `balance_pairs`).
	//
	const _rules2 = [['balance_pairs', link_pairs], ['strikethrough', r_strikethrough.postProcess], ['emphasis', r_emphasis.postProcess],
	// rules for pairs separate '**' into its own text tokens, which may be left unused,
	// rule below merges unused segments back with the rest of the text
	['fragments_join', fragments_join]];

	/**
	 * new ParserInline()
	 **/
	function ParserInline() {
	  /**
	   * ParserInline#ruler -> Ruler
	   *
	   * [[Ruler]] instance. Keep configuration of inline rules.
	   **/
	  this.ruler = new Ruler();
	  for (let i = 0; i < _rules.length; i++) {
	    this.ruler.push(_rules[i][0], _rules[i][1]);
	  }

	  /**
	   * ParserInline#ruler2 -> Ruler
	   *
	   * [[Ruler]] instance. Second ruler used for post-processing
	   * (e.g. in emphasis-like rules).
	   **/
	  this.ruler2 = new Ruler();
	  for (let i = 0; i < _rules2.length; i++) {
	    this.ruler2.push(_rules2[i][0], _rules2[i][1]);
	  }
	}

	// Skip single token by running all rules in validation mode;
	// returns `true` if any rule reported success
	//
	ParserInline.prototype.skipToken = function (state) {
	  const pos = state.pos;
	  const rules = this.ruler.getRules('');
	  const len = rules.length;
	  const maxNesting = state.md.options.maxNesting;
	  const cache = state.cache;
	  if (typeof cache[pos] !== 'undefined') {
	    state.pos = cache[pos];
	    return;
	  }
	  let ok = false;
	  if (state.level < maxNesting) {
	    for (let i = 0; i < len; i++) {
	      // Increment state.level and decrement it later to limit recursion.
	      // It's harmless to do here, because no tokens are created. But ideally,
	      // we'd need a separate private state variable for this purpose.
	      //
	      state.level++;
	      ok = rules[i](state, true);
	      state.level--;
	      if (ok) {
	        if (pos >= state.pos) {
	          throw new Error("inline rule didn't increment state.pos");
	        }
	        break;
	      }
	    }
	  } else {
	    // Too much nesting, just skip until the end of the paragraph.
	    //
	    // NOTE: this will cause links to behave incorrectly in the following case,
	    //       when an amount of `[` is exactly equal to `maxNesting + 1`:
	    //
	    //       [[[[[[[[[[[[[[[[[[[[[foo]()
	    //
	    // TODO: remove this workaround when CM standard will allow nested links
	    //       (we can replace it by preventing links from being parsed in
	    //       validation mode)
	    //
	    state.pos = state.posMax;
	  }
	  if (!ok) {
	    state.pos++;
	  }
	  cache[pos] = state.pos;
	};

	// Generate tokens for input range
	//
	ParserInline.prototype.tokenize = function (state) {
	  const rules = this.ruler.getRules('');
	  const len = rules.length;
	  const end = state.posMax;
	  const maxNesting = state.md.options.maxNesting;
	  while (state.pos < end) {
	    // Try all possible rules.
	    // On success, rule should:
	    //
	    // - update `state.pos`
	    // - update `state.tokens`
	    // - return true
	    const prevPos = state.pos;
	    let ok = false;
	    if (state.level < maxNesting) {
	      for (let i = 0; i < len; i++) {
	        ok = rules[i](state, false);
	        if (ok) {
	          if (prevPos >= state.pos) {
	            throw new Error("inline rule didn't increment state.pos");
	          }
	          break;
	        }
	      }
	    }
	    if (ok) {
	      if (state.pos >= end) {
	        break;
	      }
	      continue;
	    }
	    state.pending += state.src[state.pos++];
	  }
	  if (state.pending) {
	    state.pushPending();
	  }
	};

	/**
	 * ParserInline.parse(str, md, env, outTokens)
	 *
	 * Process input string and push inline tokens into `outTokens`
	 **/
	ParserInline.prototype.parse = function (str, md, env, outTokens) {
	  const state = new this.State(str, md, env, outTokens);
	  this.tokenize(state);
	  const rules = this.ruler2.getRules('');
	  const len = rules.length;
	  for (let i = 0; i < len; i++) {
	    rules[i](state);
	  }
	};
	ParserInline.prototype.State = StateInline;

	// markdown-it default options

	var cfg_default = {
	  options: {
	    // Enable HTML tags in source
	    html: false,
	    // Use '/' to close single tags (<br />)
	    xhtmlOut: false,
	    // Convert '\n' in paragraphs into <br>
	    breaks: false,
	    // CSS language prefix for fenced blocks
	    langPrefix: 'language-',
	    // autoconvert URL-like texts to links
	    linkify: false,
	    // Enable some language-neutral replacements + quotes beautification
	    typographer: false,
	    // Double + single quotes replacement pairs, when typographer enabled,
	    // and smartquotes on. Could be either a String or an Array.
	    //
	    // For example, you can use '«»„“' for Russian, '„“‚‘' for German,
	    // and ['«\xA0', '\xA0»', '‹\xA0', '\xA0›'] for French (including nbsp).
	    quotes: '\u201c\u201d\u2018\u2019',
	    /* “”‘’ */

	    // Highlighter function. Should return escaped HTML,
	    // or '' if the source string is not changed and should be escaped externaly.
	    // If result starts with <pre... internal wrapper is skipped.
	    //
	    // function (/*str, lang*/) { return ''; }
	    //
	    highlight: null,
	    // Internal protection, recursion limit
	    maxNesting: 100
	  },
	  components: {
	    core: {},
	    block: {},
	    inline: {}
	  }
	};

	// "Zero" preset, with nothing enabled. Useful for manual configuring of simple
	// modes. For example, to parse bold/italic only.

	var cfg_zero = {
	  options: {
	    // Enable HTML tags in source
	    html: false,
	    // Use '/' to close single tags (<br />)
	    xhtmlOut: false,
	    // Convert '\n' in paragraphs into <br>
	    breaks: false,
	    // CSS language prefix for fenced blocks
	    langPrefix: 'language-',
	    // autoconvert URL-like texts to links
	    linkify: false,
	    // Enable some language-neutral replacements + quotes beautification
	    typographer: false,
	    // Double + single quotes replacement pairs, when typographer enabled,
	    // and smartquotes on. Could be either a String or an Array.
	    //
	    // For example, you can use '«»„“' for Russian, '„“‚‘' for German,
	    // and ['«\xA0', '\xA0»', '‹\xA0', '\xA0›'] for French (including nbsp).
	    quotes: '\u201c\u201d\u2018\u2019',
	    /* “”‘’ */

	    // Highlighter function. Should return escaped HTML,
	    // or '' if the source string is not changed and should be escaped externaly.
	    // If result starts with <pre... internal wrapper is skipped.
	    //
	    // function (/*str, lang*/) { return ''; }
	    //
	    highlight: null,
	    // Internal protection, recursion limit
	    maxNesting: 20
	  },
	  components: {
	    core: {
	      rules: ['normalize', 'block', 'inline', 'text_join']
	    },
	    block: {
	      rules: ['paragraph']
	    },
	    inline: {
	      rules: ['text'],
	      rules2: ['balance_pairs', 'fragments_join']
	    }
	  }
	};

	// Commonmark default options

	var cfg_commonmark = {
	  options: {
	    // Enable HTML tags in source
	    html: true,
	    // Use '/' to close single tags (<br />)
	    xhtmlOut: true,
	    // Convert '\n' in paragraphs into <br>
	    breaks: false,
	    // CSS language prefix for fenced blocks
	    langPrefix: 'language-',
	    // autoconvert URL-like texts to links
	    linkify: false,
	    // Enable some language-neutral replacements + quotes beautification
	    typographer: false,
	    // Double + single quotes replacement pairs, when typographer enabled,
	    // and smartquotes on. Could be either a String or an Array.
	    //
	    // For example, you can use '«»„“' for Russian, '„“‚‘' for German,
	    // and ['«\xA0', '\xA0»', '‹\xA0', '\xA0›'] for French (including nbsp).
	    quotes: '\u201c\u201d\u2018\u2019',
	    /* “”‘’ */

	    // Highlighter function. Should return escaped HTML,
	    // or '' if the source string is not changed and should be escaped externaly.
	    // If result starts with <pre... internal wrapper is skipped.
	    //
	    // function (/*str, lang*/) { return ''; }
	    //
	    highlight: null,
	    // Internal protection, recursion limit
	    maxNesting: 20
	  },
	  components: {
	    core: {
	      rules: ['normalize', 'block', 'inline', 'text_join']
	    },
	    block: {
	      rules: ['blockquote', 'code', 'fence', 'heading', 'hr', 'html_block', 'lheading', 'list', 'reference', 'paragraph']
	    },
	    inline: {
	      rules: ['autolink', 'backticks', 'emphasis', 'entity', 'escape', 'html_inline', 'image', 'link', 'newline', 'text'],
	      rules2: ['balance_pairs', 'emphasis', 'fragments_join']
	    }
	  }
	};

	// Main parser class

	const config = {
	  default: cfg_default,
	  zero: cfg_zero,
	  commonmark: cfg_commonmark
	};

	//
	// This validator can prohibit more than really needed to prevent XSS. It's a
	// tradeoff to keep code simple and to be secure by default.
	//
	// If you need different setup - override validator method as you wish. Or
	// replace it with dummy function and use external sanitizer.
	//

	const BAD_PROTO_RE = /^(vbscript|javascript|file|data):/;
	const GOOD_DATA_RE = /^data:image\/(gif|png|jpeg|webp);/;
	function validateLink(url) {
	  // url should be normalized at this point, and existing entities are decoded
	  const str = url.trim().toLowerCase();
	  return BAD_PROTO_RE.test(str) ? GOOD_DATA_RE.test(str) : true;
	}
	const RECODE_HOSTNAME_FOR = ['http:', 'https:', 'mailto:'];
	function normalizeLink(url) {
	  const parsed = mdurl__namespace.parse(url, true);
	  if (parsed.hostname) {
	    // Encode hostnames in urls like:
	    // `http://host/`, `https://host/`, `mailto:user@host`, `//host/`
	    //
	    // We don't encode unknown schemas, because it's likely that we encode
	    // something we shouldn't (e.g. `skype:name` treated as `skype:host`)
	    //
	    if (!parsed.protocol || RECODE_HOSTNAME_FOR.indexOf(parsed.protocol) >= 0) {
	      try {
	        parsed.hostname = punycode.toASCII(parsed.hostname);
	      } catch (er) {/**/}
	    }
	  }
	  return mdurl__namespace.encode(mdurl__namespace.format(parsed));
	}
	function normalizeLinkText(url) {
	  const parsed = mdurl__namespace.parse(url, true);
	  if (parsed.hostname) {
	    // Encode hostnames in urls like:
	    // `http://host/`, `https://host/`, `mailto:user@host`, `//host/`
	    //
	    // We don't encode unknown schemas, because it's likely that we encode
	    // something we shouldn't (e.g. `skype:name` treated as `skype:host`)
	    //
	    if (!parsed.protocol || RECODE_HOSTNAME_FOR.indexOf(parsed.protocol) >= 0) {
	      try {
	        parsed.hostname = punycode.toUnicode(parsed.hostname);
	      } catch (er) {/**/}
	    }
	  }

	  // add '%' to exclude list because of https://github.com/markdown-it/markdown-it/issues/720
	  return mdurl__namespace.decode(mdurl__namespace.format(parsed), mdurl__namespace.decode.defaultChars + '%');
	}

	/**
	 * class MarkdownIt
	 *
	 * Main parser/renderer class.
	 *
	 * ##### Usage
	 *
	 * ```javascript
	 * // node.js, "classic" way:
	 * var MarkdownIt = require('markdown-it'),
	 *     md = new MarkdownIt();
	 * var result = md.render('# markdown-it rulezz!');
	 *
	 * // node.js, the same, but with sugar:
	 * var md = require('markdown-it')();
	 * var result = md.render('# markdown-it rulezz!');
	 *
	 * // browser without AMD, added to "window" on script load
	 * // Note, there are no dash.
	 * var md = window.markdownit();
	 * var result = md.render('# markdown-it rulezz!');
	 * ```
	 *
	 * Single line rendering, without paragraph wrap:
	 *
	 * ```javascript
	 * var md = require('markdown-it')();
	 * var result = md.renderInline('__markdown-it__ rulezz!');
	 * ```
	 **/

	/**
	 * new MarkdownIt([presetName, options])
	 * - presetName (String): optional, `commonmark` / `zero`
	 * - options (Object)
	 *
	 * Creates parser instanse with given config. Can be called without `new`.
	 *
	 * ##### presetName
	 *
	 * MarkdownIt provides named presets as a convenience to quickly
	 * enable/disable active syntax rules and options for common use cases.
	 *
	 * - ["commonmark"](https://github.com/markdown-it/markdown-it/blob/master/lib/presets/commonmark.mjs) -
	 *   configures parser to strict [CommonMark](http://commonmark.org/) mode.
	 * - [default](https://github.com/markdown-it/markdown-it/blob/master/lib/presets/default.mjs) -
	 *   similar to GFM, used when no preset name given. Enables all available rules,
	 *   but still without html, typographer & autolinker.
	 * - ["zero"](https://github.com/markdown-it/markdown-it/blob/master/lib/presets/zero.mjs) -
	 *   all rules disabled. Useful to quickly setup your config via `.enable()`.
	 *   For example, when you need only `bold` and `italic` markup and nothing else.
	 *
	 * ##### options:
	 *
	 * - __html__ - `false`. Set `true` to enable HTML tags in source. Be careful!
	 *   That's not safe! You may need external sanitizer to protect output from XSS.
	 *   It's better to extend features via plugins, instead of enabling HTML.
	 * - __xhtmlOut__ - `false`. Set `true` to add '/' when closing single tags
	 *   (`<br />`). This is needed only for full CommonMark compatibility. In real
	 *   world you will need HTML output.
	 * - __breaks__ - `false`. Set `true` to convert `\n` in paragraphs into `<br>`.
	 * - __langPrefix__ - `language-`. CSS language class prefix for fenced blocks.
	 *   Can be useful for external highlighters.
	 * - __linkify__ - `false`. Set `true` to autoconvert URL-like text to links.
	 * - __typographer__  - `false`. Set `true` to enable [some language-neutral
	 *   replacement](https://github.com/markdown-it/markdown-it/blob/master/lib/rules_core/replacements.mjs) +
	 *   quotes beautification (smartquotes).
	 * - __quotes__ - `“”‘’`, String or Array. Double + single quotes replacement
	 *   pairs, when typographer enabled and smartquotes on. For example, you can
	 *   use `'«»„“'` for Russian, `'„“‚‘'` for German, and
	 *   `['«\xA0', '\xA0»', '‹\xA0', '\xA0›']` for French (including nbsp).
	 * - __highlight__ - `null`. Highlighter function for fenced code blocks.
	 *   Highlighter `function (str, lang)` should return escaped HTML. It can also
	 *   return empty string if the source was not changed and should be escaped
	 *   externaly. If result starts with <pre... internal wrapper is skipped.
	 *
	 * ##### Example
	 *
	 * ```javascript
	 * // commonmark mode
	 * var md = require('markdown-it')('commonmark');
	 *
	 * // default mode
	 * var md = require('markdown-it')();
	 *
	 * // enable everything
	 * var md = require('markdown-it')({
	 *   html: true,
	 *   linkify: true,
	 *   typographer: true
	 * });
	 * ```
	 *
	 * ##### Syntax highlighting
	 *
	 * ```js
	 * var hljs = require('highlight.js') // https://highlightjs.org/
	 *
	 * var md = require('markdown-it')({
	 *   highlight: function (str, lang) {
	 *     if (lang && hljs.getLanguage(lang)) {
	 *       try {
	 *         return hljs.highlight(str, { language: lang, ignoreIllegals: true }).value;
	 *       } catch (__) {}
	 *     }
	 *
	 *     return ''; // use external default escaping
	 *   }
	 * });
	 * ```
	 *
	 * Or with full wrapper override (if you need assign class to `<pre>` or `<code>`):
	 *
	 * ```javascript
	 * var hljs = require('highlight.js') // https://highlightjs.org/
	 *
	 * // Actual default values
	 * var md = require('markdown-it')({
	 *   highlight: function (str, lang) {
	 *     if (lang && hljs.getLanguage(lang)) {
	 *       try {
	 *         return '<pre><code class="hljs">' +
	 *                hljs.highlight(str, { language: lang, ignoreIllegals: true }).value +
	 *                '</code></pre>';
	 *       } catch (__) {}
	 *     }
	 *
	 *     return '<pre><code class="hljs">' + md.utils.escapeHtml(str) + '</code></pre>';
	 *   }
	 * });
	 * ```
	 *
	 **/
	function MarkdownIt(presetName, options) {
	  if (!(this instanceof MarkdownIt)) {
	    return new MarkdownIt(presetName, options);
	  }
	  if (!options) {
	    if (!isString(presetName)) {
	      options = presetName || {};
	      presetName = 'default';
	    }
	  }

	  /**
	   * MarkdownIt#inline -> ParserInline
	   *
	   * Instance of [[ParserInline]]. You may need it to add new rules when
	   * writing plugins. For simple rules control use [[MarkdownIt.disable]] and
	   * [[MarkdownIt.enable]].
	   **/
	  this.inline = new ParserInline();

	  /**
	   * MarkdownIt#block -> ParserBlock
	   *
	   * Instance of [[ParserBlock]]. You may need it to add new rules when
	   * writing plugins. For simple rules control use [[MarkdownIt.disable]] and
	   * [[MarkdownIt.enable]].
	   **/
	  this.block = new ParserBlock();

	  /**
	   * MarkdownIt#core -> Core
	   *
	   * Instance of [[Core]] chain executor. You may need it to add new rules when
	   * writing plugins. For simple rules control use [[MarkdownIt.disable]] and
	   * [[MarkdownIt.enable]].
	   **/
	  this.core = new Core();

	  /**
	   * MarkdownIt#renderer -> Renderer
	   *
	   * Instance of [[Renderer]]. Use it to modify output look. Or to add rendering
	   * rules for new token types, generated by plugins.
	   *
	   * ##### Example
	   *
	   * ```javascript
	   * var md = require('markdown-it')();
	   *
	   * function myToken(tokens, idx, options, env, self) {
	   *   //...
	   *   return result;
	   * };
	   *
	   * md.renderer.rules['my_token'] = myToken
	   * ```
	   *
	   * See [[Renderer]] docs and [source code](https://github.com/markdown-it/markdown-it/blob/master/lib/renderer.mjs).
	   **/
	  this.renderer = new Renderer();

	  /**
	   * MarkdownIt#linkify -> LinkifyIt
	   *
	   * [linkify-it](https://github.com/markdown-it/linkify-it) instance.
	   * Used by [linkify](https://github.com/markdown-it/markdown-it/blob/master/lib/rules_core/linkify.mjs)
	   * rule.
	   **/
	  this.linkify = new LinkifyIt();

	  /**
	   * MarkdownIt#validateLink(url) -> Boolean
	   *
	   * Link validation function. CommonMark allows too much in links. By default
	   * we disable `javascript:`, `vbscript:`, `file:` schemas, and almost all `data:...` schemas
	   * except some embedded image types.
	   *
	   * You can change this behaviour:
	   *
	   * ```javascript
	   * var md = require('markdown-it')();
	   * // enable everything
	   * md.validateLink = function () { return true; }
	   * ```
	   **/
	  this.validateLink = validateLink;

	  /**
	   * MarkdownIt#normalizeLink(url) -> String
	   *
	   * Function used to encode link url to a machine-readable format,
	   * which includes url-encoding, punycode, etc.
	   **/
	  this.normalizeLink = normalizeLink;

	  /**
	   * MarkdownIt#normalizeLinkText(url) -> String
	   *
	   * Function used to decode link url to a human-readable format`
	   **/
	  this.normalizeLinkText = normalizeLinkText;

	  // Expose utils & helpers for easy acces from plugins

	  /**
	   * MarkdownIt#utils -> utils
	   *
	   * Assorted utility functions, useful to write plugins. See details
	   * [here](https://github.com/markdown-it/markdown-it/blob/master/lib/common/utils.mjs).
	   **/
	  this.utils = utils;

	  /**
	   * MarkdownIt#helpers -> helpers
	   *
	   * Link components parser functions, useful to write plugins. See details
	   * [here](https://github.com/markdown-it/markdown-it/blob/master/lib/helpers).
	   **/
	  this.helpers = assign({}, helpers);
	  this.options = {};
	  this.configure(presetName);
	  if (options) {
	    this.set(options);
	  }
	}

	/** chainable
	 * MarkdownIt.set(options)
	 *
	 * Set parser options (in the same format as in constructor). Probably, you
	 * will never need it, but you can change options after constructor call.
	 *
	 * ##### Example
	 *
	 * ```javascript
	 * var md = require('markdown-it')()
	 *             .set({ html: true, breaks: true })
	 *             .set({ typographer, true });
	 * ```
	 *
	 * __Note:__ To achieve the best possible performance, don't modify a
	 * `markdown-it` instance options on the fly. If you need multiple configurations
	 * it's best to create multiple instances and initialize each with separate
	 * config.
	 **/
	MarkdownIt.prototype.set = function (options) {
	  assign(this.options, options);
	  return this;
	};

	/** chainable, internal
	 * MarkdownIt.configure(presets)
	 *
	 * Batch load of all options and compenent settings. This is internal method,
	 * and you probably will not need it. But if you will - see available presets
	 * and data structure [here](https://github.com/markdown-it/markdown-it/tree/master/lib/presets)
	 *
	 * We strongly recommend to use presets instead of direct config loads. That
	 * will give better compatibility with next versions.
	 **/
	MarkdownIt.prototype.configure = function (presets) {
	  const self = this;
	  if (isString(presets)) {
	    const presetName = presets;
	    presets = config[presetName];
	    if (!presets) {
	      throw new Error('Wrong `markdown-it` preset "' + presetName + '", check name');
	    }
	  }
	  if (!presets) {
	    throw new Error('Wrong `markdown-it` preset, can\'t be empty');
	  }
	  if (presets.options) {
	    self.set(presets.options);
	  }
	  if (presets.components) {
	    Object.keys(presets.components).forEach(function (name) {
	      if (presets.components[name].rules) {
	        self[name].ruler.enableOnly(presets.components[name].rules);
	      }
	      if (presets.components[name].rules2) {
	        self[name].ruler2.enableOnly(presets.components[name].rules2);
	      }
	    });
	  }
	  return this;
	};

	/** chainable
	 * MarkdownIt.enable(list, ignoreInvalid)
	 * - list (String|Array): rule name or list of rule names to enable
	 * - ignoreInvalid (Boolean): set `true` to ignore errors when rule not found.
	 *
	 * Enable list or rules. It will automatically find appropriate components,
	 * containing rules with given names. If rule not found, and `ignoreInvalid`
	 * not set - throws exception.
	 *
	 * ##### Example
	 *
	 * ```javascript
	 * var md = require('markdown-it')()
	 *             .enable(['sub', 'sup'])
	 *             .disable('smartquotes');
	 * ```
	 **/
	MarkdownIt.prototype.enable = function (list, ignoreInvalid) {
	  let result = [];
	  if (!Array.isArray(list)) {
	    list = [list];
	  }
	  ['core', 'block', 'inline'].forEach(function (chain) {
	    result = result.concat(this[chain].ruler.enable(list, true));
	  }, this);
	  result = result.concat(this.inline.ruler2.enable(list, true));
	  const missed = list.filter(function (name) {
	    return result.indexOf(name) < 0;
	  });
	  if (missed.length && !ignoreInvalid) {
	    throw new Error('MarkdownIt. Failed to enable unknown rule(s): ' + missed);
	  }
	  return this;
	};

	/** chainable
	 * MarkdownIt.disable(list, ignoreInvalid)
	 * - list (String|Array): rule name or list of rule names to disable.
	 * - ignoreInvalid (Boolean): set `true` to ignore errors when rule not found.
	 *
	 * The same as [[MarkdownIt.enable]], but turn specified rules off.
	 **/
	MarkdownIt.prototype.disable = function (list, ignoreInvalid) {
	  let result = [];
	  if (!Array.isArray(list)) {
	    list = [list];
	  }
	  ['core', 'block', 'inline'].forEach(function (chain) {
	    result = result.concat(this[chain].ruler.disable(list, true));
	  }, this);
	  result = result.concat(this.inline.ruler2.disable(list, true));
	  const missed = list.filter(function (name) {
	    return result.indexOf(name) < 0;
	  });
	  if (missed.length && !ignoreInvalid) {
	    throw new Error('MarkdownIt. Failed to disable unknown rule(s): ' + missed);
	  }
	  return this;
	};

	/** chainable
	 * MarkdownIt.use(plugin, params)
	 *
	 * Load specified plugin with given params into current parser instance.
	 * It's just a sugar to call `plugin(md, params)` with curring.
	 *
	 * ##### Example
	 *
	 * ```javascript
	 * var iterator = require('markdown-it-for-inline');
	 * var md = require('markdown-it')()
	 *             .use(iterator, 'foo_replace', 'text', function (tokens, idx) {
	 *               tokens[idx].content = tokens[idx].content.replace(/foo/g, 'bar');
	 *             });
	 * ```
	 **/
	MarkdownIt.prototype.use = function (plugin /*, params, ... */) {
	  const args = [this].concat(Array.prototype.slice.call(arguments, 1));
	  plugin.apply(plugin, args);
	  return this;
	};

	/** internal
	 * MarkdownIt.parse(src, env) -> Array
	 * - src (String): source string
	 * - env (Object): environment sandbox
	 *
	 * Parse input string and return list of block tokens (special token type
	 * "inline" will contain list of inline tokens). You should not call this
	 * method directly, until you write custom renderer (for example, to produce
	 * AST).
	 *
	 * `env` is used to pass data between "distributed" rules and return additional
	 * metadata like reference info, needed for the renderer. It also can be used to
	 * inject data in specific cases. Usually, you will be ok to pass `{}`,
	 * and then pass updated object to renderer.
	 **/
	MarkdownIt.prototype.parse = function (src, env) {
	  if (typeof src !== 'string') {
	    throw new Error('Input data should be a String');
	  }
	  const state = new this.core.State(src, this, env);
	  this.core.process(state);
	  return state.tokens;
	};

	/**
	 * MarkdownIt.render(src [, env]) -> String
	 * - src (String): source string
	 * - env (Object): environment sandbox
	 *
	 * Render markdown string into html. It does all magic for you :).
	 *
	 * `env` can be used to inject additional metadata (`{}` by default).
	 * But you will not need it with high probability. See also comment
	 * in [[MarkdownIt.parse]].
	 **/
	MarkdownIt.prototype.render = function (src, env) {
	  env = env || {};
	  return this.renderer.render(this.parse(src, env), this.options, env);
	};

	/** internal
	 * MarkdownIt.parseInline(src, env) -> Array
	 * - src (String): source string
	 * - env (Object): environment sandbox
	 *
	 * The same as [[MarkdownIt.parse]] but skip all block rules. It returns the
	 * block tokens list with the single `inline` element, containing parsed inline
	 * tokens in `children` property. Also updates `env` object.
	 **/
	MarkdownIt.prototype.parseInline = function (src, env) {
	  const state = new this.core.State(src, this, env);
	  state.inlineMode = true;
	  this.core.process(state);
	  return state.tokens;
	};

	/**
	 * MarkdownIt.renderInline(src [, env]) -> String
	 * - src (String): source string
	 * - env (Object): environment sandbox
	 *
	 * Similar to [[MarkdownIt.render]] but for single paragraph content. Result
	 * will NOT be wrapped into `<p>` tags.
	 **/
	MarkdownIt.prototype.renderInline = function (src, env) {
	  env = env || {};
	  return this.renderer.render(this.parseInline(src, env), this.options, env);
	};

	index_cjs$5 = MarkdownIt;
	return index_cjs$5;
}

var index_cjs$4;
var hasRequiredIndex_cjs$4;

function requireIndex_cjs$4 () {
	if (hasRequiredIndex_cjs$4) return index_cjs$4;
	hasRequiredIndex_cjs$4 = 1;

	// Enclose abbreviations in <abbr> tags
	//
	function abbr_plugin(md) {
	  const escapeRE = md.utils.escapeRE;
	  const arrayReplaceAt = md.utils.arrayReplaceAt;

	  // ASCII characters in Cc, Sc, Sm, Sk categories we should terminate on;
	  // you can check character classes here:
	  // http://www.unicode.org/Public/UNIDATA/UnicodeData.txt
	  const OTHER_CHARS = ' \r\n$+<=>^`|~';
	  const UNICODE_PUNCT_RE = md.utils.lib.ucmicro.P.source;
	  const UNICODE_SPACE_RE = md.utils.lib.ucmicro.Z.source;
	  function abbr_def(state, startLine, endLine, silent) {
	    let labelEnd;
	    let pos = state.bMarks[startLine] + state.tShift[startLine];
	    const max = state.eMarks[startLine];
	    if (pos + 2 >= max) {
	      return false;
	    }
	    if (state.src.charCodeAt(pos++) !== 0x2A /* * */) {
	      return false;
	    }
	    if (state.src.charCodeAt(pos++) !== 0x5B /* [ */) {
	      return false;
	    }
	    const labelStart = pos;
	    for (; pos < max; pos++) {
	      const ch = state.src.charCodeAt(pos);
	      if (ch === 0x5B /* [ */) {
	        return false;
	      } else if (ch === 0x5D /* ] */) {
	        labelEnd = pos;
	        break;
	      } else if (ch === 0x5C /* \ */) {
	        pos++;
	      }
	    }
	    if (labelEnd < 0 || state.src.charCodeAt(labelEnd + 1) !== 0x3A /* : */) {
	      return false;
	    }
	    if (silent) {
	      return true;
	    }
	    const label = state.src.slice(labelStart, labelEnd).replace(/\\(.)/g, '$1');
	    const title = state.src.slice(labelEnd + 2, max).trim();
	    if (label.length === 0) {
	      return false;
	    }
	    if (title.length === 0) {
	      return false;
	    }
	    if (!state.env.abbreviations) {
	      state.env.abbreviations = {};
	    }
	    // prepend ':' to avoid conflict with Object.prototype members
	    if (typeof state.env.abbreviations[':' + label] === 'undefined') {
	      state.env.abbreviations[':' + label] = title;
	    }
	    state.line = startLine + 1;
	    return true;
	  }
	  function abbr_replace(state) {
	    const blockTokens = state.tokens;
	    if (!state.env.abbreviations) {
	      return;
	    }
	    const regSimple = new RegExp('(?:' + Object.keys(state.env.abbreviations).map(function (x) {
	      return x.substr(1);
	    }).sort(function (a, b) {
	      return b.length - a.length;
	    }).map(escapeRE).join('|') + ')');
	    const regText = '(^|' + UNICODE_PUNCT_RE + '|' + UNICODE_SPACE_RE + '|[' + OTHER_CHARS.split('').map(escapeRE).join('') + '])' + '(' + Object.keys(state.env.abbreviations).map(function (x) {
	      return x.substr(1);
	    }).sort(function (a, b) {
	      return b.length - a.length;
	    }).map(escapeRE).join('|') + ')' + '($|' + UNICODE_PUNCT_RE + '|' + UNICODE_SPACE_RE + '|[' + OTHER_CHARS.split('').map(escapeRE).join('') + '])';
	    const reg = new RegExp(regText, 'g');
	    for (let j = 0, l = blockTokens.length; j < l; j++) {
	      if (blockTokens[j].type !== 'inline') {
	        continue;
	      }
	      let tokens = blockTokens[j].children;

	      // We scan from the end, to keep position when new tags added.
	      for (let i = tokens.length - 1; i >= 0; i--) {
	        const currentToken = tokens[i];
	        if (currentToken.type !== 'text') {
	          continue;
	        }
	        let pos = 0;
	        const text = currentToken.content;
	        reg.lastIndex = 0;
	        const nodes = [];

	        // fast regexp run to determine whether there are any abbreviated words
	        // in the current token
	        if (!regSimple.test(text)) {
	          continue;
	        }
	        let m;
	        while (m = reg.exec(text)) {
	          if (m.index > 0 || m[1].length > 0) {
	            const token = new state.Token('text', '', 0);
	            token.content = text.slice(pos, m.index + m[1].length);
	            nodes.push(token);
	          }
	          const token_o = new state.Token('abbr_open', 'abbr', 1);
	          token_o.attrs = [['title', state.env.abbreviations[':' + m[2]]]];
	          nodes.push(token_o);
	          const token_t = new state.Token('text', '', 0);
	          token_t.content = m[2];
	          nodes.push(token_t);
	          const token_c = new state.Token('abbr_close', 'abbr', -1);
	          nodes.push(token_c);
	          reg.lastIndex -= m[3].length;
	          pos = reg.lastIndex;
	        }
	        if (!nodes.length) {
	          continue;
	        }
	        if (pos < text.length) {
	          const token = new state.Token('text', '', 0);
	          token.content = text.slice(pos);
	          nodes.push(token);
	        }

	        // replace current node
	        blockTokens[j].children = tokens = arrayReplaceAt(tokens, i, nodes);
	      }
	    }
	  }
	  md.block.ruler.before('reference', 'abbr_def', abbr_def, {
	    alt: ['paragraph', 'reference']
	  });
	  md.core.ruler.after('linkify', 'abbr_replace', abbr_replace);
	}

	index_cjs$4 = abbr_plugin;
	return index_cjs$4;
}

var e=!1,n={false:"push",true:"unshift",after:"push",before:"unshift"},t={isPermalinkSymbol:!0};function r(r,a,i,l){var o;if(!e){var c="Using deprecated markdown-it-anchor permalink option, see https://github.com/valeriangalliat/markdown-it-anchor#permalinks";"object"==typeof process&&process&&process.emitWarning?process.emitWarning(c):console.warn(c),e=!0;}var s=[Object.assign(new i.Token("link_open","a",1),{attrs:[].concat(a.permalinkClass?[["class",a.permalinkClass]]:[],[["href",a.permalinkHref(r,i)]],Object.entries(a.permalinkAttrs(r,i)))}),Object.assign(new i.Token("html_block","",0),{content:a.permalinkSymbol,meta:t}),new i.Token("link_close","a",-1)];a.permalinkSpace&&i.tokens[l+1].children[n[a.permalinkBefore]](Object.assign(new i.Token("text","",0),{content:" "})),(o=i.tokens[l+1].children)[n[a.permalinkBefore]].apply(o,s);}function a(e){return "#"+e}function i(e){return {}}var l={class:"header-anchor",symbol:"#",renderHref:a,renderAttrs:i};function o(e){function n(t){return t=Object.assign({},n.defaults,t),function(n,r,a,i){return e(n,t,r,a,i)}}return n.defaults=Object.assign({},l),n.renderPermalinkImpl=e,n}var c=o(function(e,r,a,i,l){var o,c=[Object.assign(new i.Token("link_open","a",1),{attrs:[].concat(r.class?[["class",r.class]]:[],[["href",r.renderHref(e,i)]],r.ariaHidden?[["aria-hidden","true"]]:[],Object.entries(r.renderAttrs(e,i)))}),Object.assign(new i.Token("html_inline","",0),{content:r.symbol,meta:t}),new i.Token("link_close","a",-1)];if(r.space){var s="string"==typeof r.space?r.space:" ";i.tokens[l+1].children[n[r.placement]](Object.assign(new i.Token("string"==typeof r.space?"html_inline":"text","",0),{content:s}));}(o=i.tokens[l+1].children)[n[r.placement]].apply(o,c);});Object.assign(c.defaults,{space:!0,placement:"after",ariaHidden:!1});var s=o(c.renderPermalinkImpl);s.defaults=Object.assign({},c.defaults,{ariaHidden:!0});var u=o(function(e,n,t,r,a){var i=[Object.assign(new r.Token("link_open","a",1),{attrs:[].concat(n.class?[["class",n.class]]:[],[["href",n.renderHref(e,r)]],Object.entries(n.renderAttrs(e,r)))})].concat(n.safariReaderFix?[new r.Token("span_open","span",1)]:[],r.tokens[a+1].children,n.safariReaderFix?[new r.Token("span_close","span",-1)]:[],[new r.Token("link_close","a",-1)]);r.tokens[a+1]=Object.assign(new r.Token("inline","",0),{children:i});});Object.assign(u.defaults,{safariReaderFix:!1});var d=o(function(e,r,a,i,l){var o;if(!["visually-hidden","aria-label","aria-describedby","aria-labelledby"].includes(r.style))throw new Error("`permalink.linkAfterHeader` called with unknown style option `"+r.style+"`");if(!["aria-describedby","aria-labelledby"].includes(r.style)&&!r.assistiveText)throw new Error("`permalink.linkAfterHeader` called without the `assistiveText` option in `"+r.style+"` style");if("visually-hidden"===r.style&&!r.visuallyHiddenClass)throw new Error("`permalink.linkAfterHeader` called without the `visuallyHiddenClass` option in `visually-hidden` style");var c=i.tokens[l+1].children.filter(function(e){return "text"===e.type||"code_inline"===e.type}).reduce(function(e,n){return e+n.content},""),s=[],u=[];if(r.class&&u.push(["class",r.class]),u.push(["href",r.renderHref(e,i)]),u.push.apply(u,Object.entries(r.renderAttrs(e,i))),"visually-hidden"===r.style){if(s.push(Object.assign(new i.Token("span_open","span",1),{attrs:[["class",r.visuallyHiddenClass]]}),Object.assign(new i.Token("text","",0),{content:r.assistiveText(c)}),new i.Token("span_close","span",-1)),r.space){var d="string"==typeof r.space?r.space:" ";s[n[r.placement]](Object.assign(new i.Token("string"==typeof r.space?"html_inline":"text","",0),{content:d}));}s[n[r.placement]](Object.assign(new i.Token("span_open","span",1),{attrs:[["aria-hidden","true"]]}),Object.assign(new i.Token("html_inline","",0),{content:r.symbol,meta:t}),new i.Token("span_close","span",-1));}else s.push(Object.assign(new i.Token("html_inline","",0),{content:r.symbol,meta:t}));"aria-label"===r.style?u.push(["aria-label",r.assistiveText(c)]):["aria-describedby","aria-labelledby"].includes(r.style)&&u.push([r.style,e]);var f=[Object.assign(new i.Token("link_open","a",1),{attrs:u})].concat(s,[new i.Token("link_close","a",-1)]);(o=i.tokens).splice.apply(o,[l+3,0].concat(f)),r.wrapper&&(i.tokens.splice(l,0,Object.assign(new i.Token("html_block","",0),{content:r.wrapper[0]+"\n"})),i.tokens.splice(l+3+f.length+1,0,Object.assign(new i.Token("html_block","",0),{content:r.wrapper[1]+"\n"})));});function f(e,n,t,r){var a=e,i=r;if(t&&Object.prototype.hasOwnProperty.call(n,a))throw new Error("User defined `id` attribute `"+e+"` is not unique. Please fix it in your Markdown to continue.");for(;Object.prototype.hasOwnProperty.call(n,a);)a=e+"-"+i,i+=1;return n[a]=!0,a}function p(e,n){n=Object.assign({},p.defaults,n),e.core.ruler.push("anchor",function(e){for(var t,a={},i=e.tokens,l=Array.isArray(n.level)?(t=n.level,function(e){return t.includes(e)}):function(e){return function(n){return n>=e}}(n.level),o=0;o<i.length;o++){var c=i[o];if("heading_open"===c.type&&l(Number(c.tag.substr(1)))){var s=n.getTokensText(i[o+1].children),u=c.attrGet("id");u=null==u?f(n.slugify(s),a,!1,n.uniqueSlugStartIndex):f(u,a,!0,n.uniqueSlugStartIndex),c.attrSet("id",u),!1!==n.tabIndex&&c.attrSet("tabindex",""+n.tabIndex),"function"==typeof n.permalink?n.permalink(u,n,e,o):(n.permalink||n.renderPermalink&&n.renderPermalink!==r)&&n.renderPermalink(u,n,e,o),o=i.indexOf(c),n.callback&&n.callback(c,{slug:u,title:s});}}});}Object.assign(d.defaults,{style:"visually-hidden",space:!0,placement:"after",wrapper:null}),p.permalink={__proto__:null,legacy:r,renderHref:a,renderAttrs:i,makePermalink:o,linkInsideHeader:c,ariaHidden:s,headerLink:u,linkAfterHeader:d},p.defaults={level:1,slugify:function(e){return encodeURIComponent(String(e).trim().toLowerCase().replace(/\s+/g,"-"))},uniqueSlugStartIndex:1,tabIndex:"-1",getTokensText:function(e){return e.filter(function(e){return ["text","code_inline"].includes(e.type)}).map(function(e){return e.content}).join("")},permalink:!1,renderPermalink:r,permalinkClass:s.defaults.class,permalinkSpace:s.defaults.space,permalinkSymbol:"¶",permalinkBefore:"before"===s.defaults.placement,permalinkHref:s.defaults.renderHref,permalinkAttrs:s.defaults.renderAttrs},p.default=p;

var markdownItAnchor = /*#__PURE__*/Object.freeze({
	__proto__: null,
	default: p
});

var require$$2 = /*@__PURE__*/getAugmentedNamespace(markdownItAnchor);

var utils$1 = {};

/**
 * parse {.class #id key=val} strings
 * @param {string} str: string to parse
 * @param {int} start: where to start parsing (including {)
 * @returns {2d array}: [['key', 'val'], ['class', 'red']]
 */

var hasRequiredUtils$1;

function requireUtils$1 () {
	if (hasRequiredUtils$1) return utils$1;
	hasRequiredUtils$1 = 1;
	utils$1.getAttrs = function (str, start, options) {
	  // not tab, line feed, form feed, space, solidus, greater than sign, quotation mark, apostrophe and equals sign
	  const allowedKeyChars = /[^\t\n\f />"'=]/;
	  const pairSeparator = ' ';
	  const keySeparator = '=';
	  const classChar = '.';
	  const idChar = '#';

	  const attrs = [];
	  let key = '';
	  let value = '';
	  let parsingKey = true;
	  let valueInsideQuotes = false;

	  // read inside {}
	  // start + left delimiter length to avoid beginning {
	  // breaks when } is found or end of string
	  for (let i = start + options.leftDelimiter.length; i < str.length; i++) {
	    if (str.slice(i, i + options.rightDelimiter.length) === options.rightDelimiter) {
	      if (key !== '') { attrs.push([key, value]); }
	      break;
	    }
	    const char_ = str.charAt(i);

	    // switch to reading value if equal sign
	    if (char_ === keySeparator && parsingKey) {
	      parsingKey = false;
	      continue;
	    }

	    // {.class} {..css-module}
	    if (char_ === classChar && key === '') {
	      if (str.charAt(i + 1) === classChar) {
	        key = 'css-module';
	        i += 1;
	      } else {
	        key = 'class';
	      }
	      parsingKey = false;
	      continue;
	    }

	    // {#id}
	    if (char_ === idChar && key === '') {
	      key = 'id';
	      parsingKey = false;
	      continue;
	    }

	    // {value="inside quotes"}
	    if (char_ === '"' && value === '' && !valueInsideQuotes) {
	      valueInsideQuotes = true;
	      continue;
	    }
	    if (char_ === '"' && valueInsideQuotes) {
	      valueInsideQuotes = false;
	      continue;
	    }

	    // read next key/value pair
	    if ((char_ === pairSeparator && !valueInsideQuotes)) {
	      if (key === '') {
	        // beginning or ending space: { .red } vs {.red}
	        continue;
	      }
	      attrs.push([key, value]);
	      key = '';
	      value = '';
	      parsingKey = true;
	      continue;
	    }

	    // continue if character not allowed
	    if (parsingKey && char_.search(allowedKeyChars) === -1) {
	      continue;
	    }

	    // no other conditions met; append to key/value
	    if (parsingKey) {
	      key += char_;
	      continue;
	    }
	    value += char_;
	  }

	  if (options.allowedAttributes && options.allowedAttributes.length) {
	    const allowedAttributes = options.allowedAttributes;

	    return attrs.filter(function (attrPair) {
	      const attr = attrPair[0];

	      function isAllowedAttribute (allowedAttribute) {
	        return (attr === allowedAttribute
	          || (allowedAttribute instanceof RegExp && allowedAttribute.test(attr))
	        );
	      }

	      return allowedAttributes.some(isAllowedAttribute);
	    });

	  }
	  return attrs;

	};

	/**
	 * add attributes from [['key', 'val']] list
	 * @param {array} attrs: [['key', 'val']]
	 * @param {token} token: which token to add attributes
	 * @returns token
	 */
	utils$1.addAttrs = function (attrs, token) {
	  for (let j = 0, l = attrs.length; j < l; ++j) {
	    const key = attrs[j][0];
	    if (key === 'class') {
	      token.attrJoin('class', attrs[j][1]);
	    } else if (key === 'css-module') {
	      token.attrJoin('css-module', attrs[j][1]);
	    } else {
	      token.attrPush(attrs[j]);
	    }
	  }
	  return token;
	};

	/**
	 * Does string have properly formatted curly?
	 *
	 * start: '{.a} asdf'
	 * end: 'asdf {.a}'
	 * only: '{.a}'
	 *
	 * @param {string} where to expect {} curly. start, end or only.
	 * @return {function(string)} Function which testes if string has curly.
	 */
	utils$1.hasDelimiters = function (where, options) {

	  if (!where) {
	    throw new Error('Parameter `where` not passed. Should be "start", "end" or "only".');
	  }

	  /**
	   * @param {string} str
	   * @return {boolean}
	   */
	  return function (str) {
	    // we need minimum three chars, for example {b}
	    const minCurlyLength = options.leftDelimiter.length + 1 + options.rightDelimiter.length;
	    if (!str || typeof str !== 'string' || str.length < minCurlyLength) {
	      return false;
	    }

	    function validCurlyLength (curly) {
	      const isClass = curly.charAt(options.leftDelimiter.length) === '.';
	      const isId = curly.charAt(options.leftDelimiter.length) === '#';
	      return (isClass || isId)
	        ? curly.length >= (minCurlyLength + 1)
	        : curly.length >= minCurlyLength;
	    }

	    let start, end, slice, nextChar;
	    const rightDelimiterMinimumShift = minCurlyLength - options.rightDelimiter.length;
	    switch (where) {
	    case 'start':
	      // first char should be {, } found in char 2 or more
	      slice = str.slice(0, options.leftDelimiter.length);
	      start = slice === options.leftDelimiter ? 0 : -1;
	      end = start === -1 ? -1 : str.indexOf(options.rightDelimiter, rightDelimiterMinimumShift);
	      // check if next character is not one of the delimiters
	      nextChar = str.charAt(end + options.rightDelimiter.length);
	      if (nextChar && options.rightDelimiter.indexOf(nextChar) !== -1) {
	        end = -1;
	      }
	      break;

	    case 'end':
	      // last char should be }
	      start = str.lastIndexOf(options.leftDelimiter);
	      end = start === -1 ? -1 : str.indexOf(options.rightDelimiter, start + rightDelimiterMinimumShift);
	      end = end === str.length - options.rightDelimiter.length ? end : -1;
	      break;

	    case 'only':
	      // '{.a}'
	      slice = str.slice(0, options.leftDelimiter.length);
	      start = slice === options.leftDelimiter ? 0 : -1;
	      slice = str.slice(str.length - options.rightDelimiter.length);
	      end = slice === options.rightDelimiter ? str.length - options.rightDelimiter.length : -1;
	      break;

	    default:
	      throw new Error(`Unexpected case ${where}, expected 'start', 'end' or 'only'`);
	    }

	    return start !== -1 && end !== -1 && validCurlyLength(str.substring(start, end + options.rightDelimiter.length));
	  };
	};

	/**
	 * Removes last curly from string.
	 */
	utils$1.removeDelimiter = function (str, options) {
	  const start = escapeRegExp(options.leftDelimiter);
	  const end = escapeRegExp(options.rightDelimiter);

	  const curly = new RegExp(
	    '[ \\n]?' + start + '[^' + start + end + ']+' + end + '$'
	  );
	  const pos = str.search(curly);

	  return pos !== -1 ? str.slice(0, pos) : str;
	};

	/**
	 * Escapes special characters in string s such that the string
	 * can be used in `new RegExp`. For example "[" becomes "\\[".
	 *
	 * @param {string} s Regex string.
	 * @return {string} Escaped string.
	 */
	function escapeRegExp (s) {
	  return s.replace(/[-/\\^$*+?.()|[\]{}]/g, '\\$&');
	}
	utils$1.escapeRegExp = escapeRegExp;

	/**
	 * find corresponding opening block
	 */
	utils$1.getMatchingOpeningToken = function (tokens, i) {
	  if (tokens[i].type === 'softbreak') {
	    return false;
	  }
	  // non closing blocks, example img
	  if (tokens[i].nesting === 0) {
	    return tokens[i];
	  }

	  const level = tokens[i].level;
	  const type = tokens[i].type.replace('_close', '_open');

	  for (; i >= 0; --i) {
	    if (tokens[i].type === type && tokens[i].level === level) {
	      return tokens[i];
	    }
	  }

	  return false;
	};


	/**
	 * from https://github.com/markdown-it/markdown-it/blob/master/lib/common/utils.js
	 */
	const HTML_ESCAPE_TEST_RE = /[&<>"]/;
	const HTML_ESCAPE_REPLACE_RE = /[&<>"]/g;
	const HTML_REPLACEMENTS = {
	  '&': '&amp;',
	  '<': '&lt;',
	  '>': '&gt;',
	  '"': '&quot;'
	};

	function replaceUnsafeChar(ch) {
	  return HTML_REPLACEMENTS[ch];
	}

	utils$1.escapeHtml = function (str) {
	  if (HTML_ESCAPE_TEST_RE.test(str)) {
	    return str.replace(HTML_ESCAPE_REPLACE_RE, replaceUnsafeChar);
	  }
	  return str;
	};
	return utils$1;
}

var patterns;
var hasRequiredPatterns;

function requirePatterns () {
	if (hasRequiredPatterns) return patterns;
	hasRequiredPatterns = 1;
	/**
	 * If a pattern matches the token stream,
	 * then run transform.
	 */

	const utils = requireUtils$1();

	patterns = options => {
	  const __hr = new RegExp('^ {0,3}[-*_]{3,} ?'
	                          + utils.escapeRegExp(options.leftDelimiter)
	                          + '[^' + utils.escapeRegExp(options.rightDelimiter) + ']');

	  return ([
	    {
	      /**
	       * ```python {.cls}
	       * for i in range(10):
	       *     print(i)
	       * ```
	       */
	      name: 'fenced code blocks',
	      tests: [
	        {
	          shift: 0,
	          block: true,
	          info: utils.hasDelimiters('end', options)
	        }
	      ],
	      transform: (tokens, i) => {
	        const token = tokens[i];
	        const start = token.info.lastIndexOf(options.leftDelimiter);
	        const attrs = utils.getAttrs(token.info, start, options);
	        utils.addAttrs(attrs, token);
	        token.info = utils.removeDelimiter(token.info, options);
	      }
	    }, {
	      /**
	       * bla `click()`{.c} ![](img.png){.d}
	       *
	       * differs from 'inline attributes' as it does
	       * not have a closing tag (nesting: -1)
	       */
	      name: 'inline nesting 0',
	      tests: [
	        {
	          shift: 0,
	          type: 'inline',
	          children: [
	            {
	              shift: -1,
	              type: (str) => str === 'image' || str === 'code_inline'
	            }, {
	              shift: 0,
	              type: 'text',
	              content: utils.hasDelimiters('start', options)
	            }
	          ]
	        }
	      ],
	      transform: (tokens, i, j) => {
	        const token = tokens[i].children[j];
	        const endChar = token.content.indexOf(options.rightDelimiter);
	        const attrToken = tokens[i].children[j - 1];
	        const attrs = utils.getAttrs(token.content, 0, options);
	        utils.addAttrs(attrs, attrToken);
	        if (token.content.length === (endChar + options.rightDelimiter.length)) {
	          tokens[i].children.splice(j, 1);
	        } else {
	          token.content = token.content.slice(endChar + options.rightDelimiter.length);
	        }
	      }
	    }, {
	      /**
	       * | h1 |
	       * | -- |
	       * | c1 |
	       *
	       * {.c}
	       */
	      name: 'tables',
	      tests: [
	        {
	          // let this token be i, such that for-loop continues at
	          // next token after tokens.splice
	          shift: 0,
	          type: 'table_close'
	        }, {
	          shift: 1,
	          type: 'paragraph_open'
	        }, {
	          shift: 2,
	          type: 'inline',
	          content: utils.hasDelimiters('only', options)
	        }
	      ],
	      transform: (tokens, i) => {
	        const token = tokens[i + 2];
	        const tableOpen = utils.getMatchingOpeningToken(tokens, i);
	        const attrs = utils.getAttrs(token.content, 0, options);
	        // add attributes
	        utils.addAttrs(attrs, tableOpen);
	        // remove <p>{.c}</p>
	        tokens.splice(i + 1, 3);
	      }
	    }, {
	      /**
	       * *emphasis*{.with attrs=1}
	       */
	      name: 'inline attributes',
	      tests: [
	        {
	          shift: 0,
	          type: 'inline',
	          children: [
	            {
	              shift: -1,
	              nesting: -1  // closing inline tag, </em>{.a}
	            }, {
	              shift: 0,
	              type: 'text',
	              content: utils.hasDelimiters('start', options)
	            }
	          ]
	        }
	      ],
	      transform: (tokens, i, j) => {
	        const token = tokens[i].children[j];
	        const content = token.content;
	        const attrs = utils.getAttrs(content, 0, options);
	        const openingToken = utils.getMatchingOpeningToken(tokens[i].children, j - 1);
	        utils.addAttrs(attrs, openingToken);
	        token.content = content.slice(content.indexOf(options.rightDelimiter) + options.rightDelimiter.length);
	      }
	    }, {
	      /**
	       * - item
	       * {.a}
	       */
	      name: 'list softbreak',
	      tests: [
	        {
	          shift: -2,
	          type: 'list_item_open'
	        }, {
	          shift: 0,
	          type: 'inline',
	          children: [
	            {
	              position: -2,
	              type: 'softbreak'
	            }, {
	              position: -1,
	              type: 'text',
	              content: utils.hasDelimiters('only', options)
	            }
	          ]
	        }
	      ],
	      transform: (tokens, i, j) => {
	        const token = tokens[i].children[j];
	        const content = token.content;
	        const attrs = utils.getAttrs(content, 0, options);
	        let ii = i - 2;
	        while (tokens[ii - 1] &&
	          tokens[ii - 1].type !== 'ordered_list_open' &&
	          tokens[ii - 1].type !== 'bullet_list_open') { ii--; }
	        utils.addAttrs(attrs, tokens[ii - 1]);
	        tokens[i].children = tokens[i].children.slice(0, -2);
	      }
	    }, {
	      /**
	       * - nested list
	       *   - with double \n
	       *   {.a} <-- apply to nested ul
	       *
	       * {.b} <-- apply to root <ul>
	       */
	      name: 'list double softbreak',
	      tests: [
	        {
	          // let this token be i = 0 so that we can erase
	          // the <p>{.a}</p> tokens below
	          shift: 0,
	          type: (str) =>
	            str === 'bullet_list_close' ||
	            str === 'ordered_list_close'
	        }, {
	          shift: 1,
	          type: 'paragraph_open'
	        }, {
	          shift: 2,
	          type: 'inline',
	          content: utils.hasDelimiters('only', options),
	          children: (arr) => arr.length === 1
	        }, {
	          shift: 3,
	          type: 'paragraph_close'
	        }
	      ],
	      transform: (tokens, i) => {
	        const token = tokens[i + 2];
	        const content = token.content;
	        const attrs = utils.getAttrs(content, 0, options);
	        const openingToken = utils.getMatchingOpeningToken(tokens, i);
	        utils.addAttrs(attrs, openingToken);
	        tokens.splice(i + 1, 3);
	      }
	    }, {
	      /**
	       * - end of {.list-item}
	       */
	      name: 'list item end',
	      tests: [
	        {
	          shift: -2,
	          type: 'list_item_open'
	        }, {
	          shift: 0,
	          type: 'inline',
	          children: [
	            {
	              position: -1,
	              type: 'text',
	              content: utils.hasDelimiters('end', options)
	            }
	          ]
	        }
	      ],
	      transform: (tokens, i, j) => {
	        const token = tokens[i].children[j];
	        const content = token.content;
	        const attrs = utils.getAttrs(content, content.lastIndexOf(options.leftDelimiter), options);
	        utils.addAttrs(attrs, tokens[i - 2]);
	        const trimmed = content.slice(0, content.lastIndexOf(options.leftDelimiter));
	        token.content = last(trimmed) !== ' ' ?
	          trimmed : trimmed.slice(0, -1);
	      }
	    }, {
	      /**
	       * something with softbreak
	       * {.cls}
	       */
	      name: '\n{.a} softbreak then curly in start',
	      tests: [
	        {
	          shift: 0,
	          type: 'inline',
	          children: [
	            {
	              position: -2,
	              type: 'softbreak'
	            }, {
	              position: -1,
	              type: 'text',
	              content: utils.hasDelimiters('only', options)
	            }
	          ]
	        }
	      ],
	      transform: (tokens, i, j) => {
	        const token = tokens[i].children[j];
	        const attrs = utils.getAttrs(token.content, 0, options);
	        // find last closing tag
	        let ii = i + 1;
	        while (tokens[ii + 1] && tokens[ii + 1].nesting === -1) { ii++; }
	        const openingToken = utils.getMatchingOpeningToken(tokens, ii);
	        utils.addAttrs(attrs, openingToken);
	        tokens[i].children = tokens[i].children.slice(0, -2);
	      }
	    }, {
	      /**
	       * horizontal rule --- {#id}
	       */
	      name: 'horizontal rule',
	      tests: [
	        {
	          shift: 0,
	          type: 'paragraph_open'
	        },
	        {
	          shift: 1,
	          type: 'inline',
	          children: (arr) => arr.length === 1,
	          content: (str) => str.match(__hr) !== null,
	        },
	        {
	          shift: 2,
	          type: 'paragraph_close'
	        }
	      ],
	      transform: (tokens, i) => {
	        const token = tokens[i];
	        token.type = 'hr';
	        token.tag = 'hr';
	        token.nesting = 0;
	        const content = tokens[i + 1].content;
	        const start = content.lastIndexOf(options.leftDelimiter);
	        const attrs = utils.getAttrs(content, start, options);
	        utils.addAttrs(attrs, token);
	        token.markup = content;
	        tokens.splice(i + 1, 2);
	      }
	    }, {
	      /**
	       * end of {.block}
	       */
	      name: 'end of block',
	      tests: [
	        {
	          shift: 0,
	          type: 'inline',
	          children: [
	            {
	              position: -1,
	              content: utils.hasDelimiters('end', options),
	              type: (t) => t !== 'code_inline' && t !== 'math_inline'
	            }
	          ]
	        }
	      ],
	      transform: (tokens, i, j) => {
	        const token = tokens[i].children[j];
	        const content = token.content;
	        const attrs = utils.getAttrs(content, content.lastIndexOf(options.leftDelimiter), options);
	        let ii = i + 1;
	        do if (tokens[ii] && tokens[ii].nesting === -1) { break; } while (ii++ < tokens.length);
	        const openingToken = utils.getMatchingOpeningToken(tokens, ii);
	        utils.addAttrs(attrs, openingToken);
	        const trimmed = content.slice(0, content.lastIndexOf(options.leftDelimiter));
	        token.content = last(trimmed) !== ' ' ?
	          trimmed : trimmed.slice(0, -1);
	      }
	    }
	  ]);
	};

	// get last element of array or string
	function last(arr) {
	  return arr.slice(-1)[0];
	}
	return patterns;
}

var markdownItAttrs;
var hasRequiredMarkdownItAttrs;

function requireMarkdownItAttrs () {
	if (hasRequiredMarkdownItAttrs) return markdownItAttrs;
	hasRequiredMarkdownItAttrs = 1;

	const patternsConfig = requirePatterns();

	const defaultOptions = {
	  leftDelimiter: '{',
	  rightDelimiter: '}',
	  allowedAttributes: []
	};

	markdownItAttrs = function attributes(md, options_) {
	  let options = Object.assign({}, defaultOptions);
	  options = Object.assign(options, options_);

	  const patterns = patternsConfig(options);

	  function curlyAttrs(state) {
	    const tokens = state.tokens;

	    for (let i = 0; i < tokens.length; i++) {
	      for (let p = 0; p < patterns.length; p++) {
	        const pattern = patterns[p];
	        let j = null; // position of child with offset 0
	        const match = pattern.tests.every(t => {
	          const res = test(tokens, i, t);
	          if (res.j !== null) { j = res.j; }
	          return res.match;
	        });
	        if (match) {
	          pattern.transform(tokens, i, j);
	          if (pattern.name === 'inline attributes' || pattern.name === 'inline nesting 0') {
	            // retry, may be several inline attributes
	            p--;
	          }
	        }
	      }
	    }
	  }

	  md.core.ruler.before('linkify', 'curly_attributes', curlyAttrs);
	};

	/**
	 * Test if t matches token stream.
	 *
	 * @param {array} tokens
	 * @param {number} i
	 * @param {object} t Test to match.
	 * @return {object} { match: true|false, j: null|number }
	 */
	function test(tokens, i, t) {
	  const res = {
	    match: false,
	    j: null  // position of child
	  };

	  const ii = t.shift !== undefined
	    ? i + t.shift
	    : t.position;

	  if (t.shift !== undefined && ii < 0) {
	    // we should never shift to negative indexes (rolling around to back of array)
	    return res;
	  }

	  const token = get(tokens, ii);  // supports negative ii


	  if (token === undefined) { return res; }

	  for (const key of Object.keys(t)) {
	    if (key === 'shift' || key === 'position') { continue; }

	    if (token[key] === undefined) { return res; }

	    if (key === 'children' && isArrayOfObjects(t.children)) {
	      if (token.children.length === 0) {
	        return res;
	      }
	      let match;
	      const childTests = t.children;
	      const children = token.children;
	      if (childTests.every(tt => tt.position !== undefined)) {
	        // positions instead of shifts, do not loop all children
	        match = childTests.every(tt => test(children, tt.position, tt).match);
	        if (match) {
	          // we may need position of child in transform
	          const j = last(childTests).position;
	          res.j = j >= 0 ? j : children.length + j;
	        }
	      } else {
	        for (let j = 0; j < children.length; j++) {
	          match = childTests.every(tt => test(children, j, tt).match);
	          if (match) {
	            res.j = j;
	            // all tests true, continue with next key of pattern t
	            break;
	          }
	        }
	      }

	      if (match === false) { return res; }

	      continue;
	    }

	    switch (typeof t[key]) {
	    case 'boolean':
	    case 'number':
	    case 'string':
	      if (token[key] !== t[key]) { return res; }
	      break;
	    case 'function':
	      if (!t[key](token[key])) { return res; }
	      break;
	    case 'object':
	      if (isArrayOfFunctions(t[key])) {
	        const r = t[key].every(tt => tt(token[key]));
	        if (r === false) { return res; }
	        break;
	      }
	    // fall through for objects !== arrays of functions
	    default:
	      throw new Error(`Unknown type of pattern test (key: ${key}). Test should be of type boolean, number, string, function or array of functions.`);
	    }
	  }

	  // no tests returned false -> all tests returns true
	  res.match = true;
	  return res;
	}

	function isArrayOfObjects(arr) {
	  return Array.isArray(arr) && arr.length && arr.every(i => typeof i === 'object');
	}

	function isArrayOfFunctions(arr) {
	  return Array.isArray(arr) && arr.length && arr.every(i => typeof i === 'function');
	}

	/**
	 * Get n item of array. Supports negative n, where -1 is last
	 * element in array.
	 * @param {array} arr
	 * @param {number} n
	 */
	function get(arr, n) {
	  return n >= 0 ? arr[n] : arr[arr.length + n];
	}

	// get last element of array, safe - returns {} if not found
	function last(arr) {
	  return arr.slice(-1)[0] || {};
	}
	return markdownItAttrs;
}

var index_cjs$3;
var hasRequiredIndex_cjs$3;

function requireIndex_cjs$3 () {
	if (hasRequiredIndex_cjs$3) return index_cjs$3;
	hasRequiredIndex_cjs$3 = 1;

	// Process footnotes
	//

	/// /////////////////////////////////////////////////////////////////////////////
	// Renderer partials
	function render_footnote_anchor_name(tokens, idx, options, env /*, slf */) {
	  const n = Number(tokens[idx].meta.id + 1).toString();
	  let prefix = '';
	  if (typeof env.docId === 'string') prefix = `-${env.docId}-`;
	  return prefix + n;
	}
	function render_footnote_caption(tokens, idx /*, options, env, slf */) {
	  let n = Number(tokens[idx].meta.id + 1).toString();
	  if (tokens[idx].meta.subId > 0) n += `:${tokens[idx].meta.subId}`;
	  return `[${n}]`;
	}
	function render_footnote_ref(tokens, idx, options, env, slf) {
	  const id = slf.rules.footnote_anchor_name(tokens, idx, options, env, slf);
	  const caption = slf.rules.footnote_caption(tokens, idx, options, env, slf);
	  let refid = id;
	  if (tokens[idx].meta.subId > 0) refid += `:${tokens[idx].meta.subId}`;
	  return `<sup class="footnote-ref"><a href="#fn${id}" id="fnref${refid}">${caption}</a></sup>`;
	}
	function render_footnote_block_open(tokens, idx, options) {
	  return (options.xhtmlOut ? '<hr class="footnotes-sep" />\n' : '<hr class="footnotes-sep">\n') + '<section class="footnotes">\n' + '<ol class="footnotes-list">\n';
	}
	function render_footnote_block_close() {
	  return '</ol>\n</section>\n';
	}
	function render_footnote_open(tokens, idx, options, env, slf) {
	  let id = slf.rules.footnote_anchor_name(tokens, idx, options, env, slf);
	  if (tokens[idx].meta.subId > 0) id += `:${tokens[idx].meta.subId}`;
	  return `<li id="fn${id}" class="footnote-item">`;
	}
	function render_footnote_close() {
	  return '</li>\n';
	}
	function render_footnote_anchor(tokens, idx, options, env, slf) {
	  let id = slf.rules.footnote_anchor_name(tokens, idx, options, env, slf);
	  if (tokens[idx].meta.subId > 0) id += `:${tokens[idx].meta.subId}`;

	  /* ↩ with escape code to prevent display as Apple Emoji on iOS */
	  return ` <a href="#fnref${id}" class="footnote-backref">\u21a9\uFE0E</a>`;
	}
	function footnote_plugin(md) {
	  const parseLinkLabel = md.helpers.parseLinkLabel;
	  const isSpace = md.utils.isSpace;
	  md.renderer.rules.footnote_ref = render_footnote_ref;
	  md.renderer.rules.footnote_block_open = render_footnote_block_open;
	  md.renderer.rules.footnote_block_close = render_footnote_block_close;
	  md.renderer.rules.footnote_open = render_footnote_open;
	  md.renderer.rules.footnote_close = render_footnote_close;
	  md.renderer.rules.footnote_anchor = render_footnote_anchor;

	  // helpers (only used in other rules, no tokens are attached to those)
	  md.renderer.rules.footnote_caption = render_footnote_caption;
	  md.renderer.rules.footnote_anchor_name = render_footnote_anchor_name;

	  // Process footnote block definition
	  function footnote_def(state, startLine, endLine, silent) {
	    const start = state.bMarks[startLine] + state.tShift[startLine];
	    const max = state.eMarks[startLine];

	    // line should be at least 5 chars - "[^x]:"
	    if (start + 4 > max) return false;
	    if (state.src.charCodeAt(start) !== 0x5B /* [ */) return false;
	    if (state.src.charCodeAt(start + 1) !== 0x5E /* ^ */) return false;
	    let pos;
	    for (pos = start + 2; pos < max; pos++) {
	      if (state.src.charCodeAt(pos) === 0x20) return false;
	      if (state.src.charCodeAt(pos) === 0x5D /* ] */) {
	        break;
	      }
	    }
	    if (pos === start + 2) return false; // no empty footnote labels
	    if (pos + 1 >= max || state.src.charCodeAt(++pos) !== 0x3A /* : */) return false;
	    if (silent) return true;
	    pos++;
	    if (!state.env.footnotes) state.env.footnotes = {};
	    if (!state.env.footnotes.refs) state.env.footnotes.refs = {};
	    const label = state.src.slice(start + 2, pos - 2);
	    state.env.footnotes.refs[`:${label}`] = -1;
	    const token_fref_o = new state.Token('footnote_reference_open', '', 1);
	    token_fref_o.meta = {
	      label
	    };
	    token_fref_o.level = state.level++;
	    state.tokens.push(token_fref_o);
	    const oldBMark = state.bMarks[startLine];
	    const oldTShift = state.tShift[startLine];
	    const oldSCount = state.sCount[startLine];
	    const oldParentType = state.parentType;
	    const posAfterColon = pos;
	    const initial = state.sCount[startLine] + pos - (state.bMarks[startLine] + state.tShift[startLine]);
	    let offset = initial;
	    while (pos < max) {
	      const ch = state.src.charCodeAt(pos);
	      if (isSpace(ch)) {
	        if (ch === 0x09) {
	          offset += 4 - offset % 4;
	        } else {
	          offset++;
	        }
	      } else {
	        break;
	      }
	      pos++;
	    }
	    state.tShift[startLine] = pos - posAfterColon;
	    state.sCount[startLine] = offset - initial;
	    state.bMarks[startLine] = posAfterColon;
	    state.blkIndent += 4;
	    state.parentType = 'footnote';
	    if (state.sCount[startLine] < state.blkIndent) {
	      state.sCount[startLine] += state.blkIndent;
	    }
	    state.md.block.tokenize(state, startLine, endLine, true);
	    state.parentType = oldParentType;
	    state.blkIndent -= 4;
	    state.tShift[startLine] = oldTShift;
	    state.sCount[startLine] = oldSCount;
	    state.bMarks[startLine] = oldBMark;
	    const token_fref_c = new state.Token('footnote_reference_close', '', -1);
	    token_fref_c.level = --state.level;
	    state.tokens.push(token_fref_c);
	    return true;
	  }

	  // Process inline footnotes (^[...])
	  function footnote_inline(state, silent) {
	    const max = state.posMax;
	    const start = state.pos;
	    if (start + 2 >= max) return false;
	    if (state.src.charCodeAt(start) !== 0x5E /* ^ */) return false;
	    if (state.src.charCodeAt(start + 1) !== 0x5B /* [ */) return false;
	    const labelStart = start + 2;
	    const labelEnd = parseLinkLabel(state, start + 1);

	    // parser failed to find ']', so it's not a valid note
	    if (labelEnd < 0) return false;

	    // We found the end of the link, and know for a fact it's a valid link;
	    // so all that's left to do is to call tokenizer.
	    //
	    if (!silent) {
	      if (!state.env.footnotes) state.env.footnotes = {};
	      if (!state.env.footnotes.list) state.env.footnotes.list = [];
	      const footnoteId = state.env.footnotes.list.length;
	      const tokens = [];
	      state.md.inline.parse(state.src.slice(labelStart, labelEnd), state.md, state.env, tokens);
	      const token = state.push('footnote_ref', '', 0);
	      token.meta = {
	        id: footnoteId
	      };
	      state.env.footnotes.list[footnoteId] = {
	        content: state.src.slice(labelStart, labelEnd),
	        tokens
	      };
	    }
	    state.pos = labelEnd + 1;
	    state.posMax = max;
	    return true;
	  }

	  // Process footnote references ([^...])
	  function footnote_ref(state, silent) {
	    const max = state.posMax;
	    const start = state.pos;

	    // should be at least 4 chars - "[^x]"
	    if (start + 3 > max) return false;
	    if (!state.env.footnotes || !state.env.footnotes.refs) return false;
	    if (state.src.charCodeAt(start) !== 0x5B /* [ */) return false;
	    if (state.src.charCodeAt(start + 1) !== 0x5E /* ^ */) return false;
	    let pos;
	    for (pos = start + 2; pos < max; pos++) {
	      if (state.src.charCodeAt(pos) === 0x20) return false;
	      if (state.src.charCodeAt(pos) === 0x0A) return false;
	      if (state.src.charCodeAt(pos) === 0x5D /* ] */) {
	        break;
	      }
	    }
	    if (pos === start + 2) return false; // no empty footnote labels
	    if (pos >= max) return false;
	    pos++;
	    const label = state.src.slice(start + 2, pos - 1);
	    if (typeof state.env.footnotes.refs[`:${label}`] === 'undefined') return false;
	    if (!silent) {
	      if (!state.env.footnotes.list) state.env.footnotes.list = [];
	      let footnoteId;
	      if (state.env.footnotes.refs[`:${label}`] < 0) {
	        footnoteId = state.env.footnotes.list.length;
	        state.env.footnotes.list[footnoteId] = {
	          label,
	          count: 0
	        };
	        state.env.footnotes.refs[`:${label}`] = footnoteId;
	      } else {
	        footnoteId = state.env.footnotes.refs[`:${label}`];
	      }
	      const footnoteSubId = state.env.footnotes.list[footnoteId].count;
	      state.env.footnotes.list[footnoteId].count++;
	      const token = state.push('footnote_ref', '', 0);
	      token.meta = {
	        id: footnoteId,
	        subId: footnoteSubId,
	        label
	      };
	    }
	    state.pos = pos;
	    state.posMax = max;
	    return true;
	  }

	  // Glue footnote tokens to end of token stream
	  function footnote_tail(state) {
	    let tokens;
	    let current;
	    let currentLabel;
	    let insideRef = false;
	    const refTokens = {};
	    if (!state.env.footnotes) {
	      return;
	    }
	    state.tokens = state.tokens.filter(function (tok) {
	      if (tok.type === 'footnote_reference_open') {
	        insideRef = true;
	        current = [];
	        currentLabel = tok.meta.label;
	        return false;
	      }
	      if (tok.type === 'footnote_reference_close') {
	        insideRef = false;
	        // prepend ':' to avoid conflict with Object.prototype members
	        refTokens[':' + currentLabel] = current;
	        return false;
	      }
	      if (insideRef) {
	        current.push(tok);
	      }
	      return !insideRef;
	    });
	    if (!state.env.footnotes.list) {
	      return;
	    }
	    const list = state.env.footnotes.list;
	    state.tokens.push(new state.Token('footnote_block_open', '', 1));
	    for (let i = 0, l = list.length; i < l; i++) {
	      const token_fo = new state.Token('footnote_open', '', 1);
	      token_fo.meta = {
	        id: i,
	        label: list[i].label
	      };
	      state.tokens.push(token_fo);
	      if (list[i].tokens) {
	        tokens = [];
	        const token_po = new state.Token('paragraph_open', 'p', 1);
	        token_po.block = true;
	        tokens.push(token_po);
	        const token_i = new state.Token('inline', '', 0);
	        token_i.children = list[i].tokens;
	        token_i.content = list[i].content;
	        tokens.push(token_i);
	        const token_pc = new state.Token('paragraph_close', 'p', -1);
	        token_pc.block = true;
	        tokens.push(token_pc);
	      } else if (list[i].label) {
	        tokens = refTokens[`:${list[i].label}`];
	      }
	      if (tokens) state.tokens = state.tokens.concat(tokens);
	      let lastParagraph;
	      if (state.tokens[state.tokens.length - 1].type === 'paragraph_close') {
	        lastParagraph = state.tokens.pop();
	      } else {
	        lastParagraph = null;
	      }
	      const t = list[i].count > 0 ? list[i].count : 1;
	      for (let j = 0; j < t; j++) {
	        const token_a = new state.Token('footnote_anchor', '', 0);
	        token_a.meta = {
	          id: i,
	          subId: j,
	          label: list[i].label
	        };
	        state.tokens.push(token_a);
	      }
	      if (lastParagraph) {
	        state.tokens.push(lastParagraph);
	      }
	      state.tokens.push(new state.Token('footnote_close', '', -1));
	    }
	    state.tokens.push(new state.Token('footnote_block_close', '', -1));
	  }
	  md.block.ruler.before('reference', 'footnote_def', footnote_def, {
	    alt: ['paragraph', 'reference']
	  });
	  md.inline.ruler.after('image', 'footnote_inline', footnote_inline);
	  md.inline.ruler.after('footnote_inline', 'footnote_ref', footnote_ref);
	  md.core.ruler.after('inline', 'footnote_tail', footnote_tail);
	}

	index_cjs$3 = footnote_plugin;
	return index_cjs$3;
}

var index_cjs$2;
var hasRequiredIndex_cjs$2;

function requireIndex_cjs$2 () {
	if (hasRequiredIndex_cjs$2) return index_cjs$2;
	hasRequiredIndex_cjs$2 = 1;

	function ins_plugin(md) {
	  // Insert each marker as a separate text token, and add it to delimiter list
	  //
	  function tokenize(state, silent) {
	    const start = state.pos;
	    const marker = state.src.charCodeAt(start);
	    if (silent) {
	      return false;
	    }
	    if (marker !== 0x3D /* = */) {
	      return false;
	    }
	    const scanned = state.scanDelims(state.pos, true);
	    let len = scanned.length;
	    const ch = String.fromCharCode(marker);
	    if (len < 2) {
	      return false;
	    }
	    if (len % 2) {
	      const token = state.push('text', '', 0);
	      token.content = ch;
	      len--;
	    }
	    for (let i = 0; i < len; i += 2) {
	      const token = state.push('text', '', 0);
	      token.content = ch + ch;
	      if (!scanned.can_open && !scanned.can_close) {
	        continue;
	      }
	      state.delimiters.push({
	        marker,
	        length: 0,
	        // disable "rule of 3" length checks meant for emphasis
	        jump: i / 2,
	        // 1 delimiter = 2 characters
	        token: state.tokens.length - 1,
	        end: -1,
	        open: scanned.can_open,
	        close: scanned.can_close
	      });
	    }
	    state.pos += scanned.length;
	    return true;
	  }

	  // Walk through delimiter list and replace text tokens with tags
	  //
	  function postProcess(state, delimiters) {
	    const loneMarkers = [];
	    const max = delimiters.length;
	    for (let i = 0; i < max; i++) {
	      const startDelim = delimiters[i];
	      if (startDelim.marker !== 0x3D /* = */) {
	        continue;
	      }
	      if (startDelim.end === -1) {
	        continue;
	      }
	      const endDelim = delimiters[startDelim.end];
	      const token_o = state.tokens[startDelim.token];
	      token_o.type = 'mark_open';
	      token_o.tag = 'mark';
	      token_o.nesting = 1;
	      token_o.markup = '==';
	      token_o.content = '';
	      const token_c = state.tokens[endDelim.token];
	      token_c.type = 'mark_close';
	      token_c.tag = 'mark';
	      token_c.nesting = -1;
	      token_c.markup = '==';
	      token_c.content = '';
	      if (state.tokens[endDelim.token - 1].type === 'text' && state.tokens[endDelim.token - 1].content === '=') {
	        loneMarkers.push(endDelim.token - 1);
	      }
	    }

	    // If a marker sequence has an odd number of characters, it's splitted
	    // like this: `~~~~~` -> `~` + `~~` + `~~`, leaving one marker at the
	    // start of the sequence.
	    //
	    // So, we have to move all those markers after subsequent s_close tags.
	    //
	    while (loneMarkers.length) {
	      const i = loneMarkers.pop();
	      let j = i + 1;
	      while (j < state.tokens.length && state.tokens[j].type === 'mark_close') {
	        j++;
	      }
	      j--;
	      if (i !== j) {
	        const token = state.tokens[j];
	        state.tokens[j] = state.tokens[i];
	        state.tokens[i] = token;
	      }
	    }
	  }
	  md.inline.ruler.before('emphasis', 'mark', tokenize);
	  md.inline.ruler2.before('emphasis', 'mark', function (state) {
	    let curr;
	    const tokens_meta = state.tokens_meta;
	    const max = (state.tokens_meta || []).length;
	    postProcess(state, state.delimiters);
	    for (curr = 0; curr < max; curr++) {
	      if (tokens_meta[curr] && tokens_meta[curr].delimiters) {
	        postProcess(state, tokens_meta[curr].delimiters);
	      }
	    }
	  });
	}

	index_cjs$2 = ins_plugin;
	return index_cjs$2;
}

var index_cjs$1;
var hasRequiredIndex_cjs$1;

function requireIndex_cjs$1 () {
	if (hasRequiredIndex_cjs$1) return index_cjs$1;
	hasRequiredIndex_cjs$1 = 1;

	// Process ~subscript~

	// same as UNESCAPE_MD_RE plus a space
	const UNESCAPE_RE = /\\([ \\!"#$%&'()*+,./:;<=>?@[\]^_`{|}~-])/g;
	function subscript(state, silent) {
	  const max = state.posMax;
	  const start = state.pos;
	  if (state.src.charCodeAt(start) !== 0x7E /* ~ */) {
	    return false;
	  }
	  if (silent) {
	    return false;
	  } // don't run any pairs in validation mode
	  if (start + 2 >= max) {
	    return false;
	  }
	  state.pos = start + 1;
	  let found = false;
	  while (state.pos < max) {
	    if (state.src.charCodeAt(state.pos) === 0x7E /* ~ */) {
	      found = true;
	      break;
	    }
	    state.md.inline.skipToken(state);
	  }
	  if (!found || start + 1 === state.pos) {
	    state.pos = start;
	    return false;
	  }
	  const content = state.src.slice(start + 1, state.pos);

	  // don't allow unescaped spaces/newlines inside
	  if (content.match(/(^|[^\\])(\\\\)*\s/)) {
	    state.pos = start;
	    return false;
	  }

	  // found!
	  state.posMax = state.pos;
	  state.pos = start + 1;

	  // Earlier we checked !silent, but this implementation does not need it
	  const token_so = state.push('sub_open', 'sub', 1);
	  token_so.markup = '~';
	  const token_t = state.push('text', '', 0);
	  token_t.content = content.replace(UNESCAPE_RE, '$1');
	  const token_sc = state.push('sub_close', 'sub', -1);
	  token_sc.markup = '~';
	  state.pos = state.posMax + 1;
	  state.posMax = max;
	  return true;
	}
	function sub_plugin(md) {
	  md.inline.ruler.after('emphasis', 'sub', subscript);
	}

	index_cjs$1 = sub_plugin;
	return index_cjs$1;
}

var index_cjs;
var hasRequiredIndex_cjs;

function requireIndex_cjs () {
	if (hasRequiredIndex_cjs) return index_cjs;
	hasRequiredIndex_cjs = 1;

	// Process ^superscript^

	// same as UNESCAPE_MD_RE plus a space
	const UNESCAPE_RE = /\\([ \\!"#$%&'()*+,./:;<=>?@[\]^_`{|}~-])/g;
	function superscript(state, silent) {
	  const max = state.posMax;
	  const start = state.pos;
	  if (state.src.charCodeAt(start) !== 0x5E /* ^ */) {
	    return false;
	  }
	  if (silent) {
	    return false;
	  } // don't run any pairs in validation mode
	  if (start + 2 >= max) {
	    return false;
	  }
	  state.pos = start + 1;
	  let found = false;
	  while (state.pos < max) {
	    if (state.src.charCodeAt(state.pos) === 0x5E /* ^ */) {
	      found = true;
	      break;
	    }
	    state.md.inline.skipToken(state);
	  }
	  if (!found || start + 1 === state.pos) {
	    state.pos = start;
	    return false;
	  }
	  const content = state.src.slice(start + 1, state.pos);

	  // don't allow unescaped spaces/newlines inside
	  if (content.match(/(^|[^\\])(\\\\)*\s/)) {
	    state.pos = start;
	    return false;
	  }

	  // found!
	  state.posMax = state.pos;
	  state.pos = start + 1;

	  // Earlier we checked !silent, but this implementation does not need it
	  const token_so = state.push('sup_open', 'sup', 1);
	  token_so.markup = '^';
	  const token_t = state.push('text', '', 0);
	  token_t.content = content.replace(UNESCAPE_RE, '$1');
	  const token_sc = state.push('sup_close', 'sup', -1);
	  token_sc.markup = '^';
	  state.pos = state.posMax + 1;
	  state.posMax = max;
	  return true;
	}
	function sup_plugin(md) {
	  md.inline.ruler.after('emphasis', 'sup', superscript);
	}

	index_cjs = sup_plugin;
	return index_cjs;
}

var showdown$1 = {exports: {}};

var showdown = showdown$1.exports;

var hasRequiredShowdown;

function requireShowdown () {
	if (hasRequiredShowdown) return showdown$1.exports;
	hasRequiredShowdown = 1;
	(function (module) {
		(function(){
		/**
		 * Created by Tivie on 13-07-2015.
		 */

		function getDefaultOpts (simple) {

		  var defaultOptions = {
		    omitExtraWLInCodeBlocks: {
		      defaultValue: false,
		      describe: 'Omit the default extra whiteline added to code blocks',
		      type: 'boolean'
		    },
		    noHeaderId: {
		      defaultValue: false,
		      describe: 'Turn on/off generated header id',
		      type: 'boolean'
		    },
		    prefixHeaderId: {
		      defaultValue: false,
		      describe: 'Add a prefix to the generated header ids. Passing a string will prefix that string to the header id. Setting to true will add a generic \'section-\' prefix',
		      type: 'string'
		    },
		    rawPrefixHeaderId: {
		      defaultValue: false,
		      describe: 'Setting this option to true will prevent showdown from modifying the prefix. This might result in malformed IDs (if, for instance, the " char is used in the prefix)',
		      type: 'boolean'
		    },
		    ghCompatibleHeaderId: {
		      defaultValue: false,
		      describe: 'Generate header ids compatible with github style (spaces are replaced with dashes, a bunch of non alphanumeric chars are removed)',
		      type: 'boolean'
		    },
		    rawHeaderId: {
		      defaultValue: false,
		      describe: 'Remove only spaces, \' and " from generated header ids (including prefixes), replacing them with dashes (-). WARNING: This might result in malformed ids',
		      type: 'boolean'
		    },
		    headerLevelStart: {
		      defaultValue: false,
		      describe: 'The header blocks level start',
		      type: 'integer'
		    },
		    parseImgDimensions: {
		      defaultValue: false,
		      describe: 'Turn on/off image dimension parsing',
		      type: 'boolean'
		    },
		    simplifiedAutoLink: {
		      defaultValue: false,
		      describe: 'Turn on/off GFM autolink style',
		      type: 'boolean'
		    },
		    excludeTrailingPunctuationFromURLs: {
		      defaultValue: false,
		      describe: 'Excludes trailing punctuation from links generated with autoLinking',
		      type: 'boolean'
		    },
		    literalMidWordUnderscores: {
		      defaultValue: false,
		      describe: 'Parse midword underscores as literal underscores',
		      type: 'boolean'
		    },
		    literalMidWordAsterisks: {
		      defaultValue: false,
		      describe: 'Parse midword asterisks as literal asterisks',
		      type: 'boolean'
		    },
		    strikethrough: {
		      defaultValue: false,
		      describe: 'Turn on/off strikethrough support',
		      type: 'boolean'
		    },
		    tables: {
		      defaultValue: false,
		      describe: 'Turn on/off tables support',
		      type: 'boolean'
		    },
		    tablesHeaderId: {
		      defaultValue: false,
		      describe: 'Add an id to table headers',
		      type: 'boolean'
		    },
		    ghCodeBlocks: {
		      defaultValue: true,
		      describe: 'Turn on/off GFM fenced code blocks support',
		      type: 'boolean'
		    },
		    tasklists: {
		      defaultValue: false,
		      describe: 'Turn on/off GFM tasklist support',
		      type: 'boolean'
		    },
		    smoothLivePreview: {
		      defaultValue: false,
		      describe: 'Prevents weird effects in live previews due to incomplete input',
		      type: 'boolean'
		    },
		    smartIndentationFix: {
		      defaultValue: false,
		      describe: 'Tries to smartly fix indentation in es6 strings',
		      type: 'boolean'
		    },
		    disableForced4SpacesIndentedSublists: {
		      defaultValue: false,
		      describe: 'Disables the requirement of indenting nested sublists by 4 spaces',
		      type: 'boolean'
		    },
		    simpleLineBreaks: {
		      defaultValue: false,
		      describe: 'Parses simple line breaks as <br> (GFM Style)',
		      type: 'boolean'
		    },
		    requireSpaceBeforeHeadingText: {
		      defaultValue: false,
		      describe: 'Makes adding a space between `#` and the header text mandatory (GFM Style)',
		      type: 'boolean'
		    },
		    ghMentions: {
		      defaultValue: false,
		      describe: 'Enables github @mentions',
		      type: 'boolean'
		    },
		    ghMentionsLink: {
		      defaultValue: 'https://github.com/{u}',
		      describe: 'Changes the link generated by @mentions. Only applies if ghMentions option is enabled.',
		      type: 'string'
		    },
		    encodeEmails: {
		      defaultValue: true,
		      describe: 'Encode e-mail addresses through the use of Character Entities, transforming ASCII e-mail addresses into its equivalent decimal entities',
		      type: 'boolean'
		    },
		    openLinksInNewWindow: {
		      defaultValue: false,
		      describe: 'Open all links in new windows',
		      type: 'boolean'
		    },
		    backslashEscapesHTMLTags: {
		      defaultValue: false,
		      describe: 'Support for HTML Tag escaping. ex: \<div>foo\</div>',
		      type: 'boolean'
		    },
		    emoji: {
		      defaultValue: false,
		      describe: 'Enable emoji support. Ex: `this is a :smile: emoji`',
		      type: 'boolean'
		    },
		    underline: {
		      defaultValue: false,
		      describe: 'Enable support for underline. Syntax is double or triple underscores: `__underline word__`. With this option enabled, underscores no longer parses into `<em>` and `<strong>`',
		      type: 'boolean'
		    },
		    ellipsis: {
		      defaultValue: true,
		      describe: 'Replaces three dots with the ellipsis unicode character',
		      type: 'boolean'
		    },
		    completeHTMLDocument: {
		      defaultValue: false,
		      describe: 'Outputs a complete html document, including `<html>`, `<head>` and `<body>` tags',
		      type: 'boolean'
		    },
		    metadata: {
		      defaultValue: false,
		      describe: 'Enable support for document metadata (defined at the top of the document between `«««` and `»»»` or between `---` and `---`).',
		      type: 'boolean'
		    },
		    splitAdjacentBlockquotes: {
		      defaultValue: false,
		      describe: 'Split adjacent blockquote blocks',
		      type: 'boolean'
		    }
		  };
		  if (simple === false) {
		    return JSON.parse(JSON.stringify(defaultOptions));
		  }
		  var ret = {};
		  for (var opt in defaultOptions) {
		    if (defaultOptions.hasOwnProperty(opt)) {
		      ret[opt] = defaultOptions[opt].defaultValue;
		    }
		  }
		  return ret;
		}

		function allOptionsOn () {
		  var options = getDefaultOpts(true),
		      ret = {};
		  for (var opt in options) {
		    if (options.hasOwnProperty(opt)) {
		      ret[opt] = true;
		    }
		  }
		  return ret;
		}

		/**
		 * Created by Tivie on 06-01-2015.
		 */

		// Private properties
		var showdown = {},
		    parsers = {},
		    extensions = {},
		    globalOptions = getDefaultOpts(true),
		    setFlavor = 'vanilla',
		    flavor = {
		      github: {
		        omitExtraWLInCodeBlocks:              true,
		        simplifiedAutoLink:                   true,
		        excludeTrailingPunctuationFromURLs:   true,
		        literalMidWordUnderscores:            true,
		        strikethrough:                        true,
		        tables:                               true,
		        tablesHeaderId:                       true,
		        ghCodeBlocks:                         true,
		        tasklists:                            true,
		        disableForced4SpacesIndentedSublists: true,
		        simpleLineBreaks:                     true,
		        requireSpaceBeforeHeadingText:        true,
		        ghCompatibleHeaderId:                 true,
		        ghMentions:                           true,
		        backslashEscapesHTMLTags:             true,
		        emoji:                                true,
		        splitAdjacentBlockquotes:             true
		      },
		      original: {
		        noHeaderId:                           true,
		        ghCodeBlocks:                         false
		      },
		      ghost: {
		        omitExtraWLInCodeBlocks:              true,
		        parseImgDimensions:                   true,
		        simplifiedAutoLink:                   true,
		        excludeTrailingPunctuationFromURLs:   true,
		        literalMidWordUnderscores:            true,
		        strikethrough:                        true,
		        tables:                               true,
		        tablesHeaderId:                       true,
		        ghCodeBlocks:                         true,
		        tasklists:                            true,
		        smoothLivePreview:                    true,
		        simpleLineBreaks:                     true,
		        requireSpaceBeforeHeadingText:        true,
		        ghMentions:                           false,
		        encodeEmails:                         true
		      },
		      vanilla: getDefaultOpts(true),
		      allOn: allOptionsOn()
		    };

		/**
		 * helper namespace
		 * @type {{}}
		 */
		showdown.helper = {};

		/**
		 * TODO LEGACY SUPPORT CODE
		 * @type {{}}
		 */
		showdown.extensions = {};

		/**
		 * Set a global option
		 * @static
		 * @param {string} key
		 * @param {*} value
		 * @returns {showdown}
		 */
		showdown.setOption = function (key, value) {
		  globalOptions[key] = value;
		  return this;
		};

		/**
		 * Get a global option
		 * @static
		 * @param {string} key
		 * @returns {*}
		 */
		showdown.getOption = function (key) {
		  return globalOptions[key];
		};

		/**
		 * Get the global options
		 * @static
		 * @returns {{}}
		 */
		showdown.getOptions = function () {
		  return globalOptions;
		};

		/**
		 * Reset global options to the default values
		 * @static
		 */
		showdown.resetOptions = function () {
		  globalOptions = getDefaultOpts(true);
		};

		/**
		 * Set the flavor showdown should use as default
		 * @param {string} name
		 */
		showdown.setFlavor = function (name) {
		  if (!flavor.hasOwnProperty(name)) {
		    throw Error(name + ' flavor was not found');
		  }
		  showdown.resetOptions();
		  var preset = flavor[name];
		  setFlavor = name;
		  for (var option in preset) {
		    if (preset.hasOwnProperty(option)) {
		      globalOptions[option] = preset[option];
		    }
		  }
		};

		/**
		 * Get the currently set flavor
		 * @returns {string}
		 */
		showdown.getFlavor = function () {
		  return setFlavor;
		};

		/**
		 * Get the options of a specified flavor. Returns undefined if the flavor was not found
		 * @param {string} name Name of the flavor
		 * @returns {{}|undefined}
		 */
		showdown.getFlavorOptions = function (name) {
		  if (flavor.hasOwnProperty(name)) {
		    return flavor[name];
		  }
		};

		/**
		 * Get the default options
		 * @static
		 * @param {boolean} [simple=true]
		 * @returns {{}}
		 */
		showdown.getDefaultOptions = function (simple) {
		  return getDefaultOpts(simple);
		};

		/**
		 * Get or set a subParser
		 *
		 * subParser(name)       - Get a registered subParser
		 * subParser(name, func) - Register a subParser
		 * @static
		 * @param {string} name
		 * @param {function} [func]
		 * @returns {*}
		 */
		showdown.subParser = function (name, func) {
		  if (showdown.helper.isString(name)) {
		    if (typeof func !== 'undefined') {
		      parsers[name] = func;
		    } else {
		      if (parsers.hasOwnProperty(name)) {
		        return parsers[name];
		      } else {
		        throw Error('SubParser named ' + name + ' not registered!');
		      }
		    }
		  }
		};

		/**
		 * Gets or registers an extension
		 * @static
		 * @param {string} name
		 * @param {object|object[]|function=} ext
		 * @returns {*}
		 */
		showdown.extension = function (name, ext) {

		  if (!showdown.helper.isString(name)) {
		    throw Error('Extension \'name\' must be a string');
		  }

		  name = showdown.helper.stdExtName(name);

		  // Getter
		  if (showdown.helper.isUndefined(ext)) {
		    if (!extensions.hasOwnProperty(name)) {
		      throw Error('Extension named ' + name + ' is not registered!');
		    }
		    return extensions[name];

		    // Setter
		  } else {
		    // Expand extension if it's wrapped in a function
		    if (typeof ext === 'function') {
		      ext = ext();
		    }

		    // Ensure extension is an array
		    if (!showdown.helper.isArray(ext)) {
		      ext = [ext];
		    }

		    var validExtension = validate(ext, name);

		    if (validExtension.valid) {
		      extensions[name] = ext;
		    } else {
		      throw Error(validExtension.error);
		    }
		  }
		};

		/**
		 * Gets all extensions registered
		 * @returns {{}}
		 */
		showdown.getAllExtensions = function () {
		  return extensions;
		};

		/**
		 * Remove an extension
		 * @param {string} name
		 */
		showdown.removeExtension = function (name) {
		  delete extensions[name];
		};

		/**
		 * Removes all extensions
		 */
		showdown.resetExtensions = function () {
		  extensions = {};
		};

		/**
		 * Validate extension
		 * @param {array} extension
		 * @param {string} name
		 * @returns {{valid: boolean, error: string}}
		 */
		function validate (extension, name) {

		  var errMsg = (name) ? 'Error in ' + name + ' extension->' : 'Error in unnamed extension',
		      ret = {
		        valid: true,
		        error: ''
		      };

		  if (!showdown.helper.isArray(extension)) {
		    extension = [extension];
		  }

		  for (var i = 0; i < extension.length; ++i) {
		    var baseMsg = errMsg + ' sub-extension ' + i + ': ',
		        ext = extension[i];
		    if (typeof ext !== 'object') {
		      ret.valid = false;
		      ret.error = baseMsg + 'must be an object, but ' + typeof ext + ' given';
		      return ret;
		    }

		    if (!showdown.helper.isString(ext.type)) {
		      ret.valid = false;
		      ret.error = baseMsg + 'property "type" must be a string, but ' + typeof ext.type + ' given';
		      return ret;
		    }

		    var type = ext.type = ext.type.toLowerCase();

		    // normalize extension type
		    if (type === 'language') {
		      type = ext.type = 'lang';
		    }

		    if (type === 'html') {
		      type = ext.type = 'output';
		    }

		    if (type !== 'lang' && type !== 'output' && type !== 'listener') {
		      ret.valid = false;
		      ret.error = baseMsg + 'type ' + type + ' is not recognized. Valid values: "lang/language", "output/html" or "listener"';
		      return ret;
		    }

		    if (type === 'listener') {
		      if (showdown.helper.isUndefined(ext.listeners)) {
		        ret.valid = false;
		        ret.error = baseMsg + '. Extensions of type "listener" must have a property called "listeners"';
		        return ret;
		      }
		    } else {
		      if (showdown.helper.isUndefined(ext.filter) && showdown.helper.isUndefined(ext.regex)) {
		        ret.valid = false;
		        ret.error = baseMsg + type + ' extensions must define either a "regex" property or a "filter" method';
		        return ret;
		      }
		    }

		    if (ext.listeners) {
		      if (typeof ext.listeners !== 'object') {
		        ret.valid = false;
		        ret.error = baseMsg + '"listeners" property must be an object but ' + typeof ext.listeners + ' given';
		        return ret;
		      }
		      for (var ln in ext.listeners) {
		        if (ext.listeners.hasOwnProperty(ln)) {
		          if (typeof ext.listeners[ln] !== 'function') {
		            ret.valid = false;
		            ret.error = baseMsg + '"listeners" property must be an hash of [event name]: [callback]. listeners.' + ln +
		              ' must be a function but ' + typeof ext.listeners[ln] + ' given';
		            return ret;
		          }
		        }
		      }
		    }

		    if (ext.filter) {
		      if (typeof ext.filter !== 'function') {
		        ret.valid = false;
		        ret.error = baseMsg + '"filter" must be a function, but ' + typeof ext.filter + ' given';
		        return ret;
		      }
		    } else if (ext.regex) {
		      if (showdown.helper.isString(ext.regex)) {
		        ext.regex = new RegExp(ext.regex, 'g');
		      }
		      if (!(ext.regex instanceof RegExp)) {
		        ret.valid = false;
		        ret.error = baseMsg + '"regex" property must either be a string or a RegExp object, but ' + typeof ext.regex + ' given';
		        return ret;
		      }
		      if (showdown.helper.isUndefined(ext.replace)) {
		        ret.valid = false;
		        ret.error = baseMsg + '"regex" extensions must implement a replace string or function';
		        return ret;
		      }
		    }
		  }
		  return ret;
		}

		/**
		 * Validate extension
		 * @param {object} ext
		 * @returns {boolean}
		 */
		showdown.validateExtension = function (ext) {

		  var validateExtension = validate(ext, null);
		  if (!validateExtension.valid) {
		    console.warn(validateExtension.error);
		    return false;
		  }
		  return true;
		};

		/**
		 * showdownjs helper functions
		 */

		if (!showdown.hasOwnProperty('helper')) {
		  showdown.helper = {};
		}

		/**
		 * Check if var is string
		 * @static
		 * @param {string} a
		 * @returns {boolean}
		 */
		showdown.helper.isString = function (a) {
		  return (typeof a === 'string' || a instanceof String);
		};

		/**
		 * Check if var is a function
		 * @static
		 * @param {*} a
		 * @returns {boolean}
		 */
		showdown.helper.isFunction = function (a) {
		  var getType = {};
		  return a && getType.toString.call(a) === '[object Function]';
		};

		/**
		 * isArray helper function
		 * @static
		 * @param {*} a
		 * @returns {boolean}
		 */
		showdown.helper.isArray = function (a) {
		  return Array.isArray(a);
		};

		/**
		 * Check if value is undefined
		 * @static
		 * @param {*} value The value to check.
		 * @returns {boolean} Returns `true` if `value` is `undefined`, else `false`.
		 */
		showdown.helper.isUndefined = function (value) {
		  return typeof value === 'undefined';
		};

		/**
		 * ForEach helper function
		 * Iterates over Arrays and Objects (own properties only)
		 * @static
		 * @param {*} obj
		 * @param {function} callback Accepts 3 params: 1. value, 2. key, 3. the original array/object
		 */
		showdown.helper.forEach = function (obj, callback) {
		  // check if obj is defined
		  if (showdown.helper.isUndefined(obj)) {
		    throw new Error('obj param is required');
		  }

		  if (showdown.helper.isUndefined(callback)) {
		    throw new Error('callback param is required');
		  }

		  if (!showdown.helper.isFunction(callback)) {
		    throw new Error('callback param must be a function/closure');
		  }

		  if (typeof obj.forEach === 'function') {
		    obj.forEach(callback);
		  } else if (showdown.helper.isArray(obj)) {
		    for (var i = 0; i < obj.length; i++) {
		      callback(obj[i], i, obj);
		    }
		  } else if (typeof (obj) === 'object') {
		    for (var prop in obj) {
		      if (obj.hasOwnProperty(prop)) {
		        callback(obj[prop], prop, obj);
		      }
		    }
		  } else {
		    throw new Error('obj does not seem to be an array or an iterable object');
		  }
		};

		/**
		 * Standardidize extension name
		 * @static
		 * @param {string} s extension name
		 * @returns {string}
		 */
		showdown.helper.stdExtName = function (s) {
		  return s.replace(/[_?*+\/\\.^-]/g, '').replace(/\s/g, '').toLowerCase();
		};

		function escapeCharactersCallback (wholeMatch, m1) {
		  var charCodeToEscape = m1.charCodeAt(0);
		  return '¨E' + charCodeToEscape + 'E';
		}

		/**
		 * Callback used to escape characters when passing through String.replace
		 * @static
		 * @param {string} wholeMatch
		 * @param {string} m1
		 * @returns {string}
		 */
		showdown.helper.escapeCharactersCallback = escapeCharactersCallback;

		/**
		 * Escape characters in a string
		 * @static
		 * @param {string} text
		 * @param {string} charsToEscape
		 * @param {boolean} afterBackslash
		 * @returns {XML|string|void|*}
		 */
		showdown.helper.escapeCharacters = function (text, charsToEscape, afterBackslash) {
		  // First we have to escape the escape characters so that
		  // we can build a character class out of them
		  var regexString = '([' + charsToEscape.replace(/([\[\]\\])/g, '\\$1') + '])';

		  if (afterBackslash) {
		    regexString = '\\\\' + regexString;
		  }

		  var regex = new RegExp(regexString, 'g');
		  text = text.replace(regex, escapeCharactersCallback);

		  return text;
		};

		/**
		 * Unescape HTML entities
		 * @param txt
		 * @returns {string}
		 */
		showdown.helper.unescapeHTMLEntities = function (txt) {

		  return txt
		    .replace(/&quot;/g, '"')
		    .replace(/&lt;/g, '<')
		    .replace(/&gt;/g, '>')
		    .replace(/&amp;/g, '&');
		};

		var rgxFindMatchPos = function (str, left, right, flags) {
		  var f = flags || '',
		      g = f.indexOf('g') > -1,
		      x = new RegExp(left + '|' + right, 'g' + f.replace(/g/g, '')),
		      l = new RegExp(left, f.replace(/g/g, '')),
		      pos = [],
		      t, s, m, start, end;

		  do {
		    t = 0;
		    while ((m = x.exec(str))) {
		      if (l.test(m[0])) {
		        if (!(t++)) {
		          s = x.lastIndex;
		          start = s - m[0].length;
		        }
		      } else if (t) {
		        if (!--t) {
		          end = m.index + m[0].length;
		          var obj = {
		            left: {start: start, end: s},
		            match: {start: s, end: m.index},
		            right: {start: m.index, end: end},
		            wholeMatch: {start: start, end: end}
		          };
		          pos.push(obj);
		          if (!g) {
		            return pos;
		          }
		        }
		      }
		    }
		  } while (t && (x.lastIndex = s));

		  return pos;
		};

		/**
		 * matchRecursiveRegExp
		 *
		 * (c) 2007 Steven Levithan <stevenlevithan.com>
		 * MIT License
		 *
		 * Accepts a string to search, a left and right format delimiter
		 * as regex patterns, and optional regex flags. Returns an array
		 * of matches, allowing nested instances of left/right delimiters.
		 * Use the "g" flag to return all matches, otherwise only the
		 * first is returned. Be careful to ensure that the left and
		 * right format delimiters produce mutually exclusive matches.
		 * Backreferences are not supported within the right delimiter
		 * due to how it is internally combined with the left delimiter.
		 * When matching strings whose format delimiters are unbalanced
		 * to the left or right, the output is intentionally as a
		 * conventional regex library with recursion support would
		 * produce, e.g. "<<x>" and "<x>>" both produce ["x"] when using
		 * "<" and ">" as the delimiters (both strings contain a single,
		 * balanced instance of "<x>").
		 *
		 * examples:
		 * matchRecursiveRegExp("test", "\\(", "\\)")
		 * returns: []
		 * matchRecursiveRegExp("<t<<e>><s>>t<>", "<", ">", "g")
		 * returns: ["t<<e>><s>", ""]
		 * matchRecursiveRegExp("<div id=\"x\">test</div>", "<div\\b[^>]*>", "</div>", "gi")
		 * returns: ["test"]
		 */
		showdown.helper.matchRecursiveRegExp = function (str, left, right, flags) {

		  var matchPos = rgxFindMatchPos (str, left, right, flags),
		      results = [];

		  for (var i = 0; i < matchPos.length; ++i) {
		    results.push([
		      str.slice(matchPos[i].wholeMatch.start, matchPos[i].wholeMatch.end),
		      str.slice(matchPos[i].match.start, matchPos[i].match.end),
		      str.slice(matchPos[i].left.start, matchPos[i].left.end),
		      str.slice(matchPos[i].right.start, matchPos[i].right.end)
		    ]);
		  }
		  return results;
		};

		/**
		 *
		 * @param {string} str
		 * @param {string|function} replacement
		 * @param {string} left
		 * @param {string} right
		 * @param {string} flags
		 * @returns {string}
		 */
		showdown.helper.replaceRecursiveRegExp = function (str, replacement, left, right, flags) {

		  if (!showdown.helper.isFunction(replacement)) {
		    var repStr = replacement;
		    replacement = function () {
		      return repStr;
		    };
		  }

		  var matchPos = rgxFindMatchPos(str, left, right, flags),
		      finalStr = str,
		      lng = matchPos.length;

		  if (lng > 0) {
		    var bits = [];
		    if (matchPos[0].wholeMatch.start !== 0) {
		      bits.push(str.slice(0, matchPos[0].wholeMatch.start));
		    }
		    for (var i = 0; i < lng; ++i) {
		      bits.push(
		        replacement(
		          str.slice(matchPos[i].wholeMatch.start, matchPos[i].wholeMatch.end),
		          str.slice(matchPos[i].match.start, matchPos[i].match.end),
		          str.slice(matchPos[i].left.start, matchPos[i].left.end),
		          str.slice(matchPos[i].right.start, matchPos[i].right.end)
		        )
		      );
		      if (i < lng - 1) {
		        bits.push(str.slice(matchPos[i].wholeMatch.end, matchPos[i + 1].wholeMatch.start));
		      }
		    }
		    if (matchPos[lng - 1].wholeMatch.end < str.length) {
		      bits.push(str.slice(matchPos[lng - 1].wholeMatch.end));
		    }
		    finalStr = bits.join('');
		  }
		  return finalStr;
		};

		/**
		 * Returns the index within the passed String object of the first occurrence of the specified regex,
		 * starting the search at fromIndex. Returns -1 if the value is not found.
		 *
		 * @param {string} str string to search
		 * @param {RegExp} regex Regular expression to search
		 * @param {int} [fromIndex = 0] Index to start the search
		 * @returns {Number}
		 * @throws InvalidArgumentError
		 */
		showdown.helper.regexIndexOf = function (str, regex, fromIndex) {
		  if (!showdown.helper.isString(str)) {
		    throw 'InvalidArgumentError: first parameter of showdown.helper.regexIndexOf function must be a string';
		  }
		  if (regex instanceof RegExp === false) {
		    throw 'InvalidArgumentError: second parameter of showdown.helper.regexIndexOf function must be an instance of RegExp';
		  }
		  var indexOf = str.substring(fromIndex || 0).search(regex);
		  return (indexOf >= 0) ? (indexOf + (fromIndex || 0)) : indexOf;
		};

		/**
		 * Splits the passed string object at the defined index, and returns an array composed of the two substrings
		 * @param {string} str string to split
		 * @param {int} index index to split string at
		 * @returns {[string,string]}
		 * @throws InvalidArgumentError
		 */
		showdown.helper.splitAtIndex = function (str, index) {
		  if (!showdown.helper.isString(str)) {
		    throw 'InvalidArgumentError: first parameter of showdown.helper.regexIndexOf function must be a string';
		  }
		  return [str.substring(0, index), str.substring(index)];
		};

		/**
		 * Obfuscate an e-mail address through the use of Character Entities,
		 * transforming ASCII characters into their equivalent decimal or hex entities.
		 *
		 * Since it has a random component, subsequent calls to this function produce different results
		 *
		 * @param {string} mail
		 * @returns {string}
		 */
		showdown.helper.encodeEmailAddress = function (mail) {
		  var encode = [
		    function (ch) {
		      return '&#' + ch.charCodeAt(0) + ';';
		    },
		    function (ch) {
		      return '&#x' + ch.charCodeAt(0).toString(16) + ';';
		    },
		    function (ch) {
		      return ch;
		    }
		  ];

		  mail = mail.replace(/./g, function (ch) {
		    if (ch === '@') {
		      // this *must* be encoded. I insist.
		      ch = encode[Math.floor(Math.random() * 2)](ch);
		    } else {
		      var r = Math.random();
		      // roughly 10% raw, 45% hex, 45% dec
		      ch = (
		        r > 0.9 ? encode[2](ch) : r > 0.45 ? encode[1](ch) : encode[0](ch)
		      );
		    }
		    return ch;
		  });

		  return mail;
		};

		/**
		 *
		 * @param str
		 * @param targetLength
		 * @param padString
		 * @returns {string}
		 */
		showdown.helper.padEnd = function padEnd (str, targetLength, padString) {
		  /*jshint bitwise: false*/
		  // eslint-disable-next-line space-infix-ops
		  targetLength = targetLength>>0; //floor if number or convert non-number to 0;
		  /*jshint bitwise: true*/
		  padString = String(padString || ' ');
		  if (str.length > targetLength) {
		    return String(str);
		  } else {
		    targetLength = targetLength - str.length;
		    if (targetLength > padString.length) {
		      padString += padString.repeat(targetLength / padString.length); //append to original to ensure we are longer than needed
		    }
		    return String(str) + padString.slice(0,targetLength);
		  }
		};

		/**
		 * POLYFILLS
		 */
		// use this instead of builtin is undefined for IE8 compatibility
		if (typeof (console) === 'undefined') {
		  console = {
		    warn: function (msg) {
		      alert(msg);
		    },
		    log: function (msg) {
		      alert(msg);
		    },
		    error: function (msg) {
		      throw msg;
		    }
		  };
		}

		/**
		 * Common regexes.
		 * We declare some common regexes to improve performance
		 */
		showdown.helper.regexes = {
		  asteriskDashAndColon: /([*_:~])/g
		};

		/**
		 * EMOJIS LIST
		 */
		showdown.helper.emojis = {
		  '+1':'\ud83d\udc4d',
		  '-1':'\ud83d\udc4e',
		  '100':'\ud83d\udcaf',
		  '1234':'\ud83d\udd22',
		  '1st_place_medal':'\ud83e\udd47',
		  '2nd_place_medal':'\ud83e\udd48',
		  '3rd_place_medal':'\ud83e\udd49',
		  '8ball':'\ud83c\udfb1',
		  'a':'\ud83c\udd70\ufe0f',
		  'ab':'\ud83c\udd8e',
		  'abc':'\ud83d\udd24',
		  'abcd':'\ud83d\udd21',
		  'accept':'\ud83c\ude51',
		  'aerial_tramway':'\ud83d\udea1',
		  'airplane':'\u2708\ufe0f',
		  'alarm_clock':'\u23f0',
		  'alembic':'\u2697\ufe0f',
		  'alien':'\ud83d\udc7d',
		  'ambulance':'\ud83d\ude91',
		  'amphora':'\ud83c\udffa',
		  'anchor':'\u2693\ufe0f',
		  'angel':'\ud83d\udc7c',
		  'anger':'\ud83d\udca2',
		  'angry':'\ud83d\ude20',
		  'anguished':'\ud83d\ude27',
		  'ant':'\ud83d\udc1c',
		  'apple':'\ud83c\udf4e',
		  'aquarius':'\u2652\ufe0f',
		  'aries':'\u2648\ufe0f',
		  'arrow_backward':'\u25c0\ufe0f',
		  'arrow_double_down':'\u23ec',
		  'arrow_double_up':'\u23eb',
		  'arrow_down':'\u2b07\ufe0f',
		  'arrow_down_small':'\ud83d\udd3d',
		  'arrow_forward':'\u25b6\ufe0f',
		  'arrow_heading_down':'\u2935\ufe0f',
		  'arrow_heading_up':'\u2934\ufe0f',
		  'arrow_left':'\u2b05\ufe0f',
		  'arrow_lower_left':'\u2199\ufe0f',
		  'arrow_lower_right':'\u2198\ufe0f',
		  'arrow_right':'\u27a1\ufe0f',
		  'arrow_right_hook':'\u21aa\ufe0f',
		  'arrow_up':'\u2b06\ufe0f',
		  'arrow_up_down':'\u2195\ufe0f',
		  'arrow_up_small':'\ud83d\udd3c',
		  'arrow_upper_left':'\u2196\ufe0f',
		  'arrow_upper_right':'\u2197\ufe0f',
		  'arrows_clockwise':'\ud83d\udd03',
		  'arrows_counterclockwise':'\ud83d\udd04',
		  'art':'\ud83c\udfa8',
		  'articulated_lorry':'\ud83d\ude9b',
		  'artificial_satellite':'\ud83d\udef0',
		  'astonished':'\ud83d\ude32',
		  'athletic_shoe':'\ud83d\udc5f',
		  'atm':'\ud83c\udfe7',
		  'atom_symbol':'\u269b\ufe0f',
		  'avocado':'\ud83e\udd51',
		  'b':'\ud83c\udd71\ufe0f',
		  'baby':'\ud83d\udc76',
		  'baby_bottle':'\ud83c\udf7c',
		  'baby_chick':'\ud83d\udc24',
		  'baby_symbol':'\ud83d\udebc',
		  'back':'\ud83d\udd19',
		  'bacon':'\ud83e\udd53',
		  'badminton':'\ud83c\udff8',
		  'baggage_claim':'\ud83d\udec4',
		  'baguette_bread':'\ud83e\udd56',
		  'balance_scale':'\u2696\ufe0f',
		  'balloon':'\ud83c\udf88',
		  'ballot_box':'\ud83d\uddf3',
		  'ballot_box_with_check':'\u2611\ufe0f',
		  'bamboo':'\ud83c\udf8d',
		  'banana':'\ud83c\udf4c',
		  'bangbang':'\u203c\ufe0f',
		  'bank':'\ud83c\udfe6',
		  'bar_chart':'\ud83d\udcca',
		  'barber':'\ud83d\udc88',
		  'baseball':'\u26be\ufe0f',
		  'basketball':'\ud83c\udfc0',
		  'basketball_man':'\u26f9\ufe0f',
		  'basketball_woman':'\u26f9\ufe0f&zwj;\u2640\ufe0f',
		  'bat':'\ud83e\udd87',
		  'bath':'\ud83d\udec0',
		  'bathtub':'\ud83d\udec1',
		  'battery':'\ud83d\udd0b',
		  'beach_umbrella':'\ud83c\udfd6',
		  'bear':'\ud83d\udc3b',
		  'bed':'\ud83d\udecf',
		  'bee':'\ud83d\udc1d',
		  'beer':'\ud83c\udf7a',
		  'beers':'\ud83c\udf7b',
		  'beetle':'\ud83d\udc1e',
		  'beginner':'\ud83d\udd30',
		  'bell':'\ud83d\udd14',
		  'bellhop_bell':'\ud83d\udece',
		  'bento':'\ud83c\udf71',
		  'biking_man':'\ud83d\udeb4',
		  'bike':'\ud83d\udeb2',
		  'biking_woman':'\ud83d\udeb4&zwj;\u2640\ufe0f',
		  'bikini':'\ud83d\udc59',
		  'biohazard':'\u2623\ufe0f',
		  'bird':'\ud83d\udc26',
		  'birthday':'\ud83c\udf82',
		  'black_circle':'\u26ab\ufe0f',
		  'black_flag':'\ud83c\udff4',
		  'black_heart':'\ud83d\udda4',
		  'black_joker':'\ud83c\udccf',
		  'black_large_square':'\u2b1b\ufe0f',
		  'black_medium_small_square':'\u25fe\ufe0f',
		  'black_medium_square':'\u25fc\ufe0f',
		  'black_nib':'\u2712\ufe0f',
		  'black_small_square':'\u25aa\ufe0f',
		  'black_square_button':'\ud83d\udd32',
		  'blonde_man':'\ud83d\udc71',
		  'blonde_woman':'\ud83d\udc71&zwj;\u2640\ufe0f',
		  'blossom':'\ud83c\udf3c',
		  'blowfish':'\ud83d\udc21',
		  'blue_book':'\ud83d\udcd8',
		  'blue_car':'\ud83d\ude99',
		  'blue_heart':'\ud83d\udc99',
		  'blush':'\ud83d\ude0a',
		  'boar':'\ud83d\udc17',
		  'boat':'\u26f5\ufe0f',
		  'bomb':'\ud83d\udca3',
		  'book':'\ud83d\udcd6',
		  'bookmark':'\ud83d\udd16',
		  'bookmark_tabs':'\ud83d\udcd1',
		  'books':'\ud83d\udcda',
		  'boom':'\ud83d\udca5',
		  'boot':'\ud83d\udc62',
		  'bouquet':'\ud83d\udc90',
		  'bowing_man':'\ud83d\ude47',
		  'bow_and_arrow':'\ud83c\udff9',
		  'bowing_woman':'\ud83d\ude47&zwj;\u2640\ufe0f',
		  'bowling':'\ud83c\udfb3',
		  'boxing_glove':'\ud83e\udd4a',
		  'boy':'\ud83d\udc66',
		  'bread':'\ud83c\udf5e',
		  'bride_with_veil':'\ud83d\udc70',
		  'bridge_at_night':'\ud83c\udf09',
		  'briefcase':'\ud83d\udcbc',
		  'broken_heart':'\ud83d\udc94',
		  'bug':'\ud83d\udc1b',
		  'building_construction':'\ud83c\udfd7',
		  'bulb':'\ud83d\udca1',
		  'bullettrain_front':'\ud83d\ude85',
		  'bullettrain_side':'\ud83d\ude84',
		  'burrito':'\ud83c\udf2f',
		  'bus':'\ud83d\ude8c',
		  'business_suit_levitating':'\ud83d\udd74',
		  'busstop':'\ud83d\ude8f',
		  'bust_in_silhouette':'\ud83d\udc64',
		  'busts_in_silhouette':'\ud83d\udc65',
		  'butterfly':'\ud83e\udd8b',
		  'cactus':'\ud83c\udf35',
		  'cake':'\ud83c\udf70',
		  'calendar':'\ud83d\udcc6',
		  'call_me_hand':'\ud83e\udd19',
		  'calling':'\ud83d\udcf2',
		  'camel':'\ud83d\udc2b',
		  'camera':'\ud83d\udcf7',
		  'camera_flash':'\ud83d\udcf8',
		  'camping':'\ud83c\udfd5',
		  'cancer':'\u264b\ufe0f',
		  'candle':'\ud83d\udd6f',
		  'candy':'\ud83c\udf6c',
		  'canoe':'\ud83d\udef6',
		  'capital_abcd':'\ud83d\udd20',
		  'capricorn':'\u2651\ufe0f',
		  'car':'\ud83d\ude97',
		  'card_file_box':'\ud83d\uddc3',
		  'card_index':'\ud83d\udcc7',
		  'card_index_dividers':'\ud83d\uddc2',
		  'carousel_horse':'\ud83c\udfa0',
		  'carrot':'\ud83e\udd55',
		  'cat':'\ud83d\udc31',
		  'cat2':'\ud83d\udc08',
		  'cd':'\ud83d\udcbf',
		  'chains':'\u26d3',
		  'champagne':'\ud83c\udf7e',
		  'chart':'\ud83d\udcb9',
		  'chart_with_downwards_trend':'\ud83d\udcc9',
		  'chart_with_upwards_trend':'\ud83d\udcc8',
		  'checkered_flag':'\ud83c\udfc1',
		  'cheese':'\ud83e\uddc0',
		  'cherries':'\ud83c\udf52',
		  'cherry_blossom':'\ud83c\udf38',
		  'chestnut':'\ud83c\udf30',
		  'chicken':'\ud83d\udc14',
		  'children_crossing':'\ud83d\udeb8',
		  'chipmunk':'\ud83d\udc3f',
		  'chocolate_bar':'\ud83c\udf6b',
		  'christmas_tree':'\ud83c\udf84',
		  'church':'\u26ea\ufe0f',
		  'cinema':'\ud83c\udfa6',
		  'circus_tent':'\ud83c\udfaa',
		  'city_sunrise':'\ud83c\udf07',
		  'city_sunset':'\ud83c\udf06',
		  'cityscape':'\ud83c\udfd9',
		  'cl':'\ud83c\udd91',
		  'clamp':'\ud83d\udddc',
		  'clap':'\ud83d\udc4f',
		  'clapper':'\ud83c\udfac',
		  'classical_building':'\ud83c\udfdb',
		  'clinking_glasses':'\ud83e\udd42',
		  'clipboard':'\ud83d\udccb',
		  'clock1':'\ud83d\udd50',
		  'clock10':'\ud83d\udd59',
		  'clock1030':'\ud83d\udd65',
		  'clock11':'\ud83d\udd5a',
		  'clock1130':'\ud83d\udd66',
		  'clock12':'\ud83d\udd5b',
		  'clock1230':'\ud83d\udd67',
		  'clock130':'\ud83d\udd5c',
		  'clock2':'\ud83d\udd51',
		  'clock230':'\ud83d\udd5d',
		  'clock3':'\ud83d\udd52',
		  'clock330':'\ud83d\udd5e',
		  'clock4':'\ud83d\udd53',
		  'clock430':'\ud83d\udd5f',
		  'clock5':'\ud83d\udd54',
		  'clock530':'\ud83d\udd60',
		  'clock6':'\ud83d\udd55',
		  'clock630':'\ud83d\udd61',
		  'clock7':'\ud83d\udd56',
		  'clock730':'\ud83d\udd62',
		  'clock8':'\ud83d\udd57',
		  'clock830':'\ud83d\udd63',
		  'clock9':'\ud83d\udd58',
		  'clock930':'\ud83d\udd64',
		  'closed_book':'\ud83d\udcd5',
		  'closed_lock_with_key':'\ud83d\udd10',
		  'closed_umbrella':'\ud83c\udf02',
		  'cloud':'\u2601\ufe0f',
		  'cloud_with_lightning':'\ud83c\udf29',
		  'cloud_with_lightning_and_rain':'\u26c8',
		  'cloud_with_rain':'\ud83c\udf27',
		  'cloud_with_snow':'\ud83c\udf28',
		  'clown_face':'\ud83e\udd21',
		  'clubs':'\u2663\ufe0f',
		  'cocktail':'\ud83c\udf78',
		  'coffee':'\u2615\ufe0f',
		  'coffin':'\u26b0\ufe0f',
		  'cold_sweat':'\ud83d\ude30',
		  'comet':'\u2604\ufe0f',
		  'computer':'\ud83d\udcbb',
		  'computer_mouse':'\ud83d\uddb1',
		  'confetti_ball':'\ud83c\udf8a',
		  'confounded':'\ud83d\ude16',
		  'confused':'\ud83d\ude15',
		  'congratulations':'\u3297\ufe0f',
		  'construction':'\ud83d\udea7',
		  'construction_worker_man':'\ud83d\udc77',
		  'construction_worker_woman':'\ud83d\udc77&zwj;\u2640\ufe0f',
		  'control_knobs':'\ud83c\udf9b',
		  'convenience_store':'\ud83c\udfea',
		  'cookie':'\ud83c\udf6a',
		  'cool':'\ud83c\udd92',
		  'policeman':'\ud83d\udc6e',
		  'copyright':'\u00a9\ufe0f',
		  'corn':'\ud83c\udf3d',
		  'couch_and_lamp':'\ud83d\udecb',
		  'couple':'\ud83d\udc6b',
		  'couple_with_heart_woman_man':'\ud83d\udc91',
		  'couple_with_heart_man_man':'\ud83d\udc68&zwj;\u2764\ufe0f&zwj;\ud83d\udc68',
		  'couple_with_heart_woman_woman':'\ud83d\udc69&zwj;\u2764\ufe0f&zwj;\ud83d\udc69',
		  'couplekiss_man_man':'\ud83d\udc68&zwj;\u2764\ufe0f&zwj;\ud83d\udc8b&zwj;\ud83d\udc68',
		  'couplekiss_man_woman':'\ud83d\udc8f',
		  'couplekiss_woman_woman':'\ud83d\udc69&zwj;\u2764\ufe0f&zwj;\ud83d\udc8b&zwj;\ud83d\udc69',
		  'cow':'\ud83d\udc2e',
		  'cow2':'\ud83d\udc04',
		  'cowboy_hat_face':'\ud83e\udd20',
		  'crab':'\ud83e\udd80',
		  'crayon':'\ud83d\udd8d',
		  'credit_card':'\ud83d\udcb3',
		  'crescent_moon':'\ud83c\udf19',
		  'cricket':'\ud83c\udfcf',
		  'crocodile':'\ud83d\udc0a',
		  'croissant':'\ud83e\udd50',
		  'crossed_fingers':'\ud83e\udd1e',
		  'crossed_flags':'\ud83c\udf8c',
		  'crossed_swords':'\u2694\ufe0f',
		  'crown':'\ud83d\udc51',
		  'cry':'\ud83d\ude22',
		  'crying_cat_face':'\ud83d\ude3f',
		  'crystal_ball':'\ud83d\udd2e',
		  'cucumber':'\ud83e\udd52',
		  'cupid':'\ud83d\udc98',
		  'curly_loop':'\u27b0',
		  'currency_exchange':'\ud83d\udcb1',
		  'curry':'\ud83c\udf5b',
		  'custard':'\ud83c\udf6e',
		  'customs':'\ud83d\udec3',
		  'cyclone':'\ud83c\udf00',
		  'dagger':'\ud83d\udde1',
		  'dancer':'\ud83d\udc83',
		  'dancing_women':'\ud83d\udc6f',
		  'dancing_men':'\ud83d\udc6f&zwj;\u2642\ufe0f',
		  'dango':'\ud83c\udf61',
		  'dark_sunglasses':'\ud83d\udd76',
		  'dart':'\ud83c\udfaf',
		  'dash':'\ud83d\udca8',
		  'date':'\ud83d\udcc5',
		  'deciduous_tree':'\ud83c\udf33',
		  'deer':'\ud83e\udd8c',
		  'department_store':'\ud83c\udfec',
		  'derelict_house':'\ud83c\udfda',
		  'desert':'\ud83c\udfdc',
		  'desert_island':'\ud83c\udfdd',
		  'desktop_computer':'\ud83d\udda5',
		  'male_detective':'\ud83d\udd75\ufe0f',
		  'diamond_shape_with_a_dot_inside':'\ud83d\udca0',
		  'diamonds':'\u2666\ufe0f',
		  'disappointed':'\ud83d\ude1e',
		  'disappointed_relieved':'\ud83d\ude25',
		  'dizzy':'\ud83d\udcab',
		  'dizzy_face':'\ud83d\ude35',
		  'do_not_litter':'\ud83d\udeaf',
		  'dog':'\ud83d\udc36',
		  'dog2':'\ud83d\udc15',
		  'dollar':'\ud83d\udcb5',
		  'dolls':'\ud83c\udf8e',
		  'dolphin':'\ud83d\udc2c',
		  'door':'\ud83d\udeaa',
		  'doughnut':'\ud83c\udf69',
		  'dove':'\ud83d\udd4a',
		  'dragon':'\ud83d\udc09',
		  'dragon_face':'\ud83d\udc32',
		  'dress':'\ud83d\udc57',
		  'dromedary_camel':'\ud83d\udc2a',
		  'drooling_face':'\ud83e\udd24',
		  'droplet':'\ud83d\udca7',
		  'drum':'\ud83e\udd41',
		  'duck':'\ud83e\udd86',
		  'dvd':'\ud83d\udcc0',
		  'e-mail':'\ud83d\udce7',
		  'eagle':'\ud83e\udd85',
		  'ear':'\ud83d\udc42',
		  'ear_of_rice':'\ud83c\udf3e',
		  'earth_africa':'\ud83c\udf0d',
		  'earth_americas':'\ud83c\udf0e',
		  'earth_asia':'\ud83c\udf0f',
		  'egg':'\ud83e\udd5a',
		  'eggplant':'\ud83c\udf46',
		  'eight_pointed_black_star':'\u2734\ufe0f',
		  'eight_spoked_asterisk':'\u2733\ufe0f',
		  'electric_plug':'\ud83d\udd0c',
		  'elephant':'\ud83d\udc18',
		  'email':'\u2709\ufe0f',
		  'end':'\ud83d\udd1a',
		  'envelope_with_arrow':'\ud83d\udce9',
		  'euro':'\ud83d\udcb6',
		  'european_castle':'\ud83c\udff0',
		  'european_post_office':'\ud83c\udfe4',
		  'evergreen_tree':'\ud83c\udf32',
		  'exclamation':'\u2757\ufe0f',
		  'expressionless':'\ud83d\ude11',
		  'eye':'\ud83d\udc41',
		  'eye_speech_bubble':'\ud83d\udc41&zwj;\ud83d\udde8',
		  'eyeglasses':'\ud83d\udc53',
		  'eyes':'\ud83d\udc40',
		  'face_with_head_bandage':'\ud83e\udd15',
		  'face_with_thermometer':'\ud83e\udd12',
		  'fist_oncoming':'\ud83d\udc4a',
		  'factory':'\ud83c\udfed',
		  'fallen_leaf':'\ud83c\udf42',
		  'family_man_woman_boy':'\ud83d\udc6a',
		  'family_man_boy':'\ud83d\udc68&zwj;\ud83d\udc66',
		  'family_man_boy_boy':'\ud83d\udc68&zwj;\ud83d\udc66&zwj;\ud83d\udc66',
		  'family_man_girl':'\ud83d\udc68&zwj;\ud83d\udc67',
		  'family_man_girl_boy':'\ud83d\udc68&zwj;\ud83d\udc67&zwj;\ud83d\udc66',
		  'family_man_girl_girl':'\ud83d\udc68&zwj;\ud83d\udc67&zwj;\ud83d\udc67',
		  'family_man_man_boy':'\ud83d\udc68&zwj;\ud83d\udc68&zwj;\ud83d\udc66',
		  'family_man_man_boy_boy':'\ud83d\udc68&zwj;\ud83d\udc68&zwj;\ud83d\udc66&zwj;\ud83d\udc66',
		  'family_man_man_girl':'\ud83d\udc68&zwj;\ud83d\udc68&zwj;\ud83d\udc67',
		  'family_man_man_girl_boy':'\ud83d\udc68&zwj;\ud83d\udc68&zwj;\ud83d\udc67&zwj;\ud83d\udc66',
		  'family_man_man_girl_girl':'\ud83d\udc68&zwj;\ud83d\udc68&zwj;\ud83d\udc67&zwj;\ud83d\udc67',
		  'family_man_woman_boy_boy':'\ud83d\udc68&zwj;\ud83d\udc69&zwj;\ud83d\udc66&zwj;\ud83d\udc66',
		  'family_man_woman_girl':'\ud83d\udc68&zwj;\ud83d\udc69&zwj;\ud83d\udc67',
		  'family_man_woman_girl_boy':'\ud83d\udc68&zwj;\ud83d\udc69&zwj;\ud83d\udc67&zwj;\ud83d\udc66',
		  'family_man_woman_girl_girl':'\ud83d\udc68&zwj;\ud83d\udc69&zwj;\ud83d\udc67&zwj;\ud83d\udc67',
		  'family_woman_boy':'\ud83d\udc69&zwj;\ud83d\udc66',
		  'family_woman_boy_boy':'\ud83d\udc69&zwj;\ud83d\udc66&zwj;\ud83d\udc66',
		  'family_woman_girl':'\ud83d\udc69&zwj;\ud83d\udc67',
		  'family_woman_girl_boy':'\ud83d\udc69&zwj;\ud83d\udc67&zwj;\ud83d\udc66',
		  'family_woman_girl_girl':'\ud83d\udc69&zwj;\ud83d\udc67&zwj;\ud83d\udc67',
		  'family_woman_woman_boy':'\ud83d\udc69&zwj;\ud83d\udc69&zwj;\ud83d\udc66',
		  'family_woman_woman_boy_boy':'\ud83d\udc69&zwj;\ud83d\udc69&zwj;\ud83d\udc66&zwj;\ud83d\udc66',
		  'family_woman_woman_girl':'\ud83d\udc69&zwj;\ud83d\udc69&zwj;\ud83d\udc67',
		  'family_woman_woman_girl_boy':'\ud83d\udc69&zwj;\ud83d\udc69&zwj;\ud83d\udc67&zwj;\ud83d\udc66',
		  'family_woman_woman_girl_girl':'\ud83d\udc69&zwj;\ud83d\udc69&zwj;\ud83d\udc67&zwj;\ud83d\udc67',
		  'fast_forward':'\u23e9',
		  'fax':'\ud83d\udce0',
		  'fearful':'\ud83d\ude28',
		  'feet':'\ud83d\udc3e',
		  'female_detective':'\ud83d\udd75\ufe0f&zwj;\u2640\ufe0f',
		  'ferris_wheel':'\ud83c\udfa1',
		  'ferry':'\u26f4',
		  'field_hockey':'\ud83c\udfd1',
		  'file_cabinet':'\ud83d\uddc4',
		  'file_folder':'\ud83d\udcc1',
		  'film_projector':'\ud83d\udcfd',
		  'film_strip':'\ud83c\udf9e',
		  'fire':'\ud83d\udd25',
		  'fire_engine':'\ud83d\ude92',
		  'fireworks':'\ud83c\udf86',
		  'first_quarter_moon':'\ud83c\udf13',
		  'first_quarter_moon_with_face':'\ud83c\udf1b',
		  'fish':'\ud83d\udc1f',
		  'fish_cake':'\ud83c\udf65',
		  'fishing_pole_and_fish':'\ud83c\udfa3',
		  'fist_raised':'\u270a',
		  'fist_left':'\ud83e\udd1b',
		  'fist_right':'\ud83e\udd1c',
		  'flags':'\ud83c\udf8f',
		  'flashlight':'\ud83d\udd26',
		  'fleur_de_lis':'\u269c\ufe0f',
		  'flight_arrival':'\ud83d\udeec',
		  'flight_departure':'\ud83d\udeeb',
		  'floppy_disk':'\ud83d\udcbe',
		  'flower_playing_cards':'\ud83c\udfb4',
		  'flushed':'\ud83d\ude33',
		  'fog':'\ud83c\udf2b',
		  'foggy':'\ud83c\udf01',
		  'football':'\ud83c\udfc8',
		  'footprints':'\ud83d\udc63',
		  'fork_and_knife':'\ud83c\udf74',
		  'fountain':'\u26f2\ufe0f',
		  'fountain_pen':'\ud83d\udd8b',
		  'four_leaf_clover':'\ud83c\udf40',
		  'fox_face':'\ud83e\udd8a',
		  'framed_picture':'\ud83d\uddbc',
		  'free':'\ud83c\udd93',
		  'fried_egg':'\ud83c\udf73',
		  'fried_shrimp':'\ud83c\udf64',
		  'fries':'\ud83c\udf5f',
		  'frog':'\ud83d\udc38',
		  'frowning':'\ud83d\ude26',
		  'frowning_face':'\u2639\ufe0f',
		  'frowning_man':'\ud83d\ude4d&zwj;\u2642\ufe0f',
		  'frowning_woman':'\ud83d\ude4d',
		  'middle_finger':'\ud83d\udd95',
		  'fuelpump':'\u26fd\ufe0f',
		  'full_moon':'\ud83c\udf15',
		  'full_moon_with_face':'\ud83c\udf1d',
		  'funeral_urn':'\u26b1\ufe0f',
		  'game_die':'\ud83c\udfb2',
		  'gear':'\u2699\ufe0f',
		  'gem':'\ud83d\udc8e',
		  'gemini':'\u264a\ufe0f',
		  'ghost':'\ud83d\udc7b',
		  'gift':'\ud83c\udf81',
		  'gift_heart':'\ud83d\udc9d',
		  'girl':'\ud83d\udc67',
		  'globe_with_meridians':'\ud83c\udf10',
		  'goal_net':'\ud83e\udd45',
		  'goat':'\ud83d\udc10',
		  'golf':'\u26f3\ufe0f',
		  'golfing_man':'\ud83c\udfcc\ufe0f',
		  'golfing_woman':'\ud83c\udfcc\ufe0f&zwj;\u2640\ufe0f',
		  'gorilla':'\ud83e\udd8d',
		  'grapes':'\ud83c\udf47',
		  'green_apple':'\ud83c\udf4f',
		  'green_book':'\ud83d\udcd7',
		  'green_heart':'\ud83d\udc9a',
		  'green_salad':'\ud83e\udd57',
		  'grey_exclamation':'\u2755',
		  'grey_question':'\u2754',
		  'grimacing':'\ud83d\ude2c',
		  'grin':'\ud83d\ude01',
		  'grinning':'\ud83d\ude00',
		  'guardsman':'\ud83d\udc82',
		  'guardswoman':'\ud83d\udc82&zwj;\u2640\ufe0f',
		  'guitar':'\ud83c\udfb8',
		  'gun':'\ud83d\udd2b',
		  'haircut_woman':'\ud83d\udc87',
		  'haircut_man':'\ud83d\udc87&zwj;\u2642\ufe0f',
		  'hamburger':'\ud83c\udf54',
		  'hammer':'\ud83d\udd28',
		  'hammer_and_pick':'\u2692',
		  'hammer_and_wrench':'\ud83d\udee0',
		  'hamster':'\ud83d\udc39',
		  'hand':'\u270b',
		  'handbag':'\ud83d\udc5c',
		  'handshake':'\ud83e\udd1d',
		  'hankey':'\ud83d\udca9',
		  'hatched_chick':'\ud83d\udc25',
		  'hatching_chick':'\ud83d\udc23',
		  'headphones':'\ud83c\udfa7',
		  'hear_no_evil':'\ud83d\ude49',
		  'heart':'\u2764\ufe0f',
		  'heart_decoration':'\ud83d\udc9f',
		  'heart_eyes':'\ud83d\ude0d',
		  'heart_eyes_cat':'\ud83d\ude3b',
		  'heartbeat':'\ud83d\udc93',
		  'heartpulse':'\ud83d\udc97',
		  'hearts':'\u2665\ufe0f',
		  'heavy_check_mark':'\u2714\ufe0f',
		  'heavy_division_sign':'\u2797',
		  'heavy_dollar_sign':'\ud83d\udcb2',
		  'heavy_heart_exclamation':'\u2763\ufe0f',
		  'heavy_minus_sign':'\u2796',
		  'heavy_multiplication_x':'\u2716\ufe0f',
		  'heavy_plus_sign':'\u2795',
		  'helicopter':'\ud83d\ude81',
		  'herb':'\ud83c\udf3f',
		  'hibiscus':'\ud83c\udf3a',
		  'high_brightness':'\ud83d\udd06',
		  'high_heel':'\ud83d\udc60',
		  'hocho':'\ud83d\udd2a',
		  'hole':'\ud83d\udd73',
		  'honey_pot':'\ud83c\udf6f',
		  'horse':'\ud83d\udc34',
		  'horse_racing':'\ud83c\udfc7',
		  'hospital':'\ud83c\udfe5',
		  'hot_pepper':'\ud83c\udf36',
		  'hotdog':'\ud83c\udf2d',
		  'hotel':'\ud83c\udfe8',
		  'hotsprings':'\u2668\ufe0f',
		  'hourglass':'\u231b\ufe0f',
		  'hourglass_flowing_sand':'\u23f3',
		  'house':'\ud83c\udfe0',
		  'house_with_garden':'\ud83c\udfe1',
		  'houses':'\ud83c\udfd8',
		  'hugs':'\ud83e\udd17',
		  'hushed':'\ud83d\ude2f',
		  'ice_cream':'\ud83c\udf68',
		  'ice_hockey':'\ud83c\udfd2',
		  'ice_skate':'\u26f8',
		  'icecream':'\ud83c\udf66',
		  'id':'\ud83c\udd94',
		  'ideograph_advantage':'\ud83c\ude50',
		  'imp':'\ud83d\udc7f',
		  'inbox_tray':'\ud83d\udce5',
		  'incoming_envelope':'\ud83d\udce8',
		  'tipping_hand_woman':'\ud83d\udc81',
		  'information_source':'\u2139\ufe0f',
		  'innocent':'\ud83d\ude07',
		  'interrobang':'\u2049\ufe0f',
		  'iphone':'\ud83d\udcf1',
		  'izakaya_lantern':'\ud83c\udfee',
		  'jack_o_lantern':'\ud83c\udf83',
		  'japan':'\ud83d\uddfe',
		  'japanese_castle':'\ud83c\udfef',
		  'japanese_goblin':'\ud83d\udc7a',
		  'japanese_ogre':'\ud83d\udc79',
		  'jeans':'\ud83d\udc56',
		  'joy':'\ud83d\ude02',
		  'joy_cat':'\ud83d\ude39',
		  'joystick':'\ud83d\udd79',
		  'kaaba':'\ud83d\udd4b',
		  'key':'\ud83d\udd11',
		  'keyboard':'\u2328\ufe0f',
		  'keycap_ten':'\ud83d\udd1f',
		  'kick_scooter':'\ud83d\udef4',
		  'kimono':'\ud83d\udc58',
		  'kiss':'\ud83d\udc8b',
		  'kissing':'\ud83d\ude17',
		  'kissing_cat':'\ud83d\ude3d',
		  'kissing_closed_eyes':'\ud83d\ude1a',
		  'kissing_heart':'\ud83d\ude18',
		  'kissing_smiling_eyes':'\ud83d\ude19',
		  'kiwi_fruit':'\ud83e\udd5d',
		  'koala':'\ud83d\udc28',
		  'koko':'\ud83c\ude01',
		  'label':'\ud83c\udff7',
		  'large_blue_circle':'\ud83d\udd35',
		  'large_blue_diamond':'\ud83d\udd37',
		  'large_orange_diamond':'\ud83d\udd36',
		  'last_quarter_moon':'\ud83c\udf17',
		  'last_quarter_moon_with_face':'\ud83c\udf1c',
		  'latin_cross':'\u271d\ufe0f',
		  'laughing':'\ud83d\ude06',
		  'leaves':'\ud83c\udf43',
		  'ledger':'\ud83d\udcd2',
		  'left_luggage':'\ud83d\udec5',
		  'left_right_arrow':'\u2194\ufe0f',
		  'leftwards_arrow_with_hook':'\u21a9\ufe0f',
		  'lemon':'\ud83c\udf4b',
		  'leo':'\u264c\ufe0f',
		  'leopard':'\ud83d\udc06',
		  'level_slider':'\ud83c\udf9a',
		  'libra':'\u264e\ufe0f',
		  'light_rail':'\ud83d\ude88',
		  'link':'\ud83d\udd17',
		  'lion':'\ud83e\udd81',
		  'lips':'\ud83d\udc44',
		  'lipstick':'\ud83d\udc84',
		  'lizard':'\ud83e\udd8e',
		  'lock':'\ud83d\udd12',
		  'lock_with_ink_pen':'\ud83d\udd0f',
		  'lollipop':'\ud83c\udf6d',
		  'loop':'\u27bf',
		  'loud_sound':'\ud83d\udd0a',
		  'loudspeaker':'\ud83d\udce2',
		  'love_hotel':'\ud83c\udfe9',
		  'love_letter':'\ud83d\udc8c',
		  'low_brightness':'\ud83d\udd05',
		  'lying_face':'\ud83e\udd25',
		  'm':'\u24c2\ufe0f',
		  'mag':'\ud83d\udd0d',
		  'mag_right':'\ud83d\udd0e',
		  'mahjong':'\ud83c\udc04\ufe0f',
		  'mailbox':'\ud83d\udceb',
		  'mailbox_closed':'\ud83d\udcea',
		  'mailbox_with_mail':'\ud83d\udcec',
		  'mailbox_with_no_mail':'\ud83d\udced',
		  'man':'\ud83d\udc68',
		  'man_artist':'\ud83d\udc68&zwj;\ud83c\udfa8',
		  'man_astronaut':'\ud83d\udc68&zwj;\ud83d\ude80',
		  'man_cartwheeling':'\ud83e\udd38&zwj;\u2642\ufe0f',
		  'man_cook':'\ud83d\udc68&zwj;\ud83c\udf73',
		  'man_dancing':'\ud83d\udd7a',
		  'man_facepalming':'\ud83e\udd26&zwj;\u2642\ufe0f',
		  'man_factory_worker':'\ud83d\udc68&zwj;\ud83c\udfed',
		  'man_farmer':'\ud83d\udc68&zwj;\ud83c\udf3e',
		  'man_firefighter':'\ud83d\udc68&zwj;\ud83d\ude92',
		  'man_health_worker':'\ud83d\udc68&zwj;\u2695\ufe0f',
		  'man_in_tuxedo':'\ud83e\udd35',
		  'man_judge':'\ud83d\udc68&zwj;\u2696\ufe0f',
		  'man_juggling':'\ud83e\udd39&zwj;\u2642\ufe0f',
		  'man_mechanic':'\ud83d\udc68&zwj;\ud83d\udd27',
		  'man_office_worker':'\ud83d\udc68&zwj;\ud83d\udcbc',
		  'man_pilot':'\ud83d\udc68&zwj;\u2708\ufe0f',
		  'man_playing_handball':'\ud83e\udd3e&zwj;\u2642\ufe0f',
		  'man_playing_water_polo':'\ud83e\udd3d&zwj;\u2642\ufe0f',
		  'man_scientist':'\ud83d\udc68&zwj;\ud83d\udd2c',
		  'man_shrugging':'\ud83e\udd37&zwj;\u2642\ufe0f',
		  'man_singer':'\ud83d\udc68&zwj;\ud83c\udfa4',
		  'man_student':'\ud83d\udc68&zwj;\ud83c\udf93',
		  'man_teacher':'\ud83d\udc68&zwj;\ud83c\udfeb',
		  'man_technologist':'\ud83d\udc68&zwj;\ud83d\udcbb',
		  'man_with_gua_pi_mao':'\ud83d\udc72',
		  'man_with_turban':'\ud83d\udc73',
		  'tangerine':'\ud83c\udf4a',
		  'mans_shoe':'\ud83d\udc5e',
		  'mantelpiece_clock':'\ud83d\udd70',
		  'maple_leaf':'\ud83c\udf41',
		  'martial_arts_uniform':'\ud83e\udd4b',
		  'mask':'\ud83d\ude37',
		  'massage_woman':'\ud83d\udc86',
		  'massage_man':'\ud83d\udc86&zwj;\u2642\ufe0f',
		  'meat_on_bone':'\ud83c\udf56',
		  'medal_military':'\ud83c\udf96',
		  'medal_sports':'\ud83c\udfc5',
		  'mega':'\ud83d\udce3',
		  'melon':'\ud83c\udf48',
		  'memo':'\ud83d\udcdd',
		  'men_wrestling':'\ud83e\udd3c&zwj;\u2642\ufe0f',
		  'menorah':'\ud83d\udd4e',
		  'mens':'\ud83d\udeb9',
		  'metal':'\ud83e\udd18',
		  'metro':'\ud83d\ude87',
		  'microphone':'\ud83c\udfa4',
		  'microscope':'\ud83d\udd2c',
		  'milk_glass':'\ud83e\udd5b',
		  'milky_way':'\ud83c\udf0c',
		  'minibus':'\ud83d\ude90',
		  'minidisc':'\ud83d\udcbd',
		  'mobile_phone_off':'\ud83d\udcf4',
		  'money_mouth_face':'\ud83e\udd11',
		  'money_with_wings':'\ud83d\udcb8',
		  'moneybag':'\ud83d\udcb0',
		  'monkey':'\ud83d\udc12',
		  'monkey_face':'\ud83d\udc35',
		  'monorail':'\ud83d\ude9d',
		  'moon':'\ud83c\udf14',
		  'mortar_board':'\ud83c\udf93',
		  'mosque':'\ud83d\udd4c',
		  'motor_boat':'\ud83d\udee5',
		  'motor_scooter':'\ud83d\udef5',
		  'motorcycle':'\ud83c\udfcd',
		  'motorway':'\ud83d\udee3',
		  'mount_fuji':'\ud83d\uddfb',
		  'mountain':'\u26f0',
		  'mountain_biking_man':'\ud83d\udeb5',
		  'mountain_biking_woman':'\ud83d\udeb5&zwj;\u2640\ufe0f',
		  'mountain_cableway':'\ud83d\udea0',
		  'mountain_railway':'\ud83d\ude9e',
		  'mountain_snow':'\ud83c\udfd4',
		  'mouse':'\ud83d\udc2d',
		  'mouse2':'\ud83d\udc01',
		  'movie_camera':'\ud83c\udfa5',
		  'moyai':'\ud83d\uddff',
		  'mrs_claus':'\ud83e\udd36',
		  'muscle':'\ud83d\udcaa',
		  'mushroom':'\ud83c\udf44',
		  'musical_keyboard':'\ud83c\udfb9',
		  'musical_note':'\ud83c\udfb5',
		  'musical_score':'\ud83c\udfbc',
		  'mute':'\ud83d\udd07',
		  'nail_care':'\ud83d\udc85',
		  'name_badge':'\ud83d\udcdb',
		  'national_park':'\ud83c\udfde',
		  'nauseated_face':'\ud83e\udd22',
		  'necktie':'\ud83d\udc54',
		  'negative_squared_cross_mark':'\u274e',
		  'nerd_face':'\ud83e\udd13',
		  'neutral_face':'\ud83d\ude10',
		  'new':'\ud83c\udd95',
		  'new_moon':'\ud83c\udf11',
		  'new_moon_with_face':'\ud83c\udf1a',
		  'newspaper':'\ud83d\udcf0',
		  'newspaper_roll':'\ud83d\uddde',
		  'next_track_button':'\u23ed',
		  'ng':'\ud83c\udd96',
		  'no_good_man':'\ud83d\ude45&zwj;\u2642\ufe0f',
		  'no_good_woman':'\ud83d\ude45',
		  'night_with_stars':'\ud83c\udf03',
		  'no_bell':'\ud83d\udd15',
		  'no_bicycles':'\ud83d\udeb3',
		  'no_entry':'\u26d4\ufe0f',
		  'no_entry_sign':'\ud83d\udeab',
		  'no_mobile_phones':'\ud83d\udcf5',
		  'no_mouth':'\ud83d\ude36',
		  'no_pedestrians':'\ud83d\udeb7',
		  'no_smoking':'\ud83d\udead',
		  'non-potable_water':'\ud83d\udeb1',
		  'nose':'\ud83d\udc43',
		  'notebook':'\ud83d\udcd3',
		  'notebook_with_decorative_cover':'\ud83d\udcd4',
		  'notes':'\ud83c\udfb6',
		  'nut_and_bolt':'\ud83d\udd29',
		  'o':'\u2b55\ufe0f',
		  'o2':'\ud83c\udd7e\ufe0f',
		  'ocean':'\ud83c\udf0a',
		  'octopus':'\ud83d\udc19',
		  'oden':'\ud83c\udf62',
		  'office':'\ud83c\udfe2',
		  'oil_drum':'\ud83d\udee2',
		  'ok':'\ud83c\udd97',
		  'ok_hand':'\ud83d\udc4c',
		  'ok_man':'\ud83d\ude46&zwj;\u2642\ufe0f',
		  'ok_woman':'\ud83d\ude46',
		  'old_key':'\ud83d\udddd',
		  'older_man':'\ud83d\udc74',
		  'older_woman':'\ud83d\udc75',
		  'om':'\ud83d\udd49',
		  'on':'\ud83d\udd1b',
		  'oncoming_automobile':'\ud83d\ude98',
		  'oncoming_bus':'\ud83d\ude8d',
		  'oncoming_police_car':'\ud83d\ude94',
		  'oncoming_taxi':'\ud83d\ude96',
		  'open_file_folder':'\ud83d\udcc2',
		  'open_hands':'\ud83d\udc50',
		  'open_mouth':'\ud83d\ude2e',
		  'open_umbrella':'\u2602\ufe0f',
		  'ophiuchus':'\u26ce',
		  'orange_book':'\ud83d\udcd9',
		  'orthodox_cross':'\u2626\ufe0f',
		  'outbox_tray':'\ud83d\udce4',
		  'owl':'\ud83e\udd89',
		  'ox':'\ud83d\udc02',
		  'package':'\ud83d\udce6',
		  'page_facing_up':'\ud83d\udcc4',
		  'page_with_curl':'\ud83d\udcc3',
		  'pager':'\ud83d\udcdf',
		  'paintbrush':'\ud83d\udd8c',
		  'palm_tree':'\ud83c\udf34',
		  'pancakes':'\ud83e\udd5e',
		  'panda_face':'\ud83d\udc3c',
		  'paperclip':'\ud83d\udcce',
		  'paperclips':'\ud83d\udd87',
		  'parasol_on_ground':'\u26f1',
		  'parking':'\ud83c\udd7f\ufe0f',
		  'part_alternation_mark':'\u303d\ufe0f',
		  'partly_sunny':'\u26c5\ufe0f',
		  'passenger_ship':'\ud83d\udef3',
		  'passport_control':'\ud83d\udec2',
		  'pause_button':'\u23f8',
		  'peace_symbol':'\u262e\ufe0f',
		  'peach':'\ud83c\udf51',
		  'peanuts':'\ud83e\udd5c',
		  'pear':'\ud83c\udf50',
		  'pen':'\ud83d\udd8a',
		  'pencil2':'\u270f\ufe0f',
		  'penguin':'\ud83d\udc27',
		  'pensive':'\ud83d\ude14',
		  'performing_arts':'\ud83c\udfad',
		  'persevere':'\ud83d\ude23',
		  'person_fencing':'\ud83e\udd3a',
		  'pouting_woman':'\ud83d\ude4e',
		  'phone':'\u260e\ufe0f',
		  'pick':'\u26cf',
		  'pig':'\ud83d\udc37',
		  'pig2':'\ud83d\udc16',
		  'pig_nose':'\ud83d\udc3d',
		  'pill':'\ud83d\udc8a',
		  'pineapple':'\ud83c\udf4d',
		  'ping_pong':'\ud83c\udfd3',
		  'pisces':'\u2653\ufe0f',
		  'pizza':'\ud83c\udf55',
		  'place_of_worship':'\ud83d\uded0',
		  'plate_with_cutlery':'\ud83c\udf7d',
		  'play_or_pause_button':'\u23ef',
		  'point_down':'\ud83d\udc47',
		  'point_left':'\ud83d\udc48',
		  'point_right':'\ud83d\udc49',
		  'point_up':'\u261d\ufe0f',
		  'point_up_2':'\ud83d\udc46',
		  'police_car':'\ud83d\ude93',
		  'policewoman':'\ud83d\udc6e&zwj;\u2640\ufe0f',
		  'poodle':'\ud83d\udc29',
		  'popcorn':'\ud83c\udf7f',
		  'post_office':'\ud83c\udfe3',
		  'postal_horn':'\ud83d\udcef',
		  'postbox':'\ud83d\udcee',
		  'potable_water':'\ud83d\udeb0',
		  'potato':'\ud83e\udd54',
		  'pouch':'\ud83d\udc5d',
		  'poultry_leg':'\ud83c\udf57',
		  'pound':'\ud83d\udcb7',
		  'rage':'\ud83d\ude21',
		  'pouting_cat':'\ud83d\ude3e',
		  'pouting_man':'\ud83d\ude4e&zwj;\u2642\ufe0f',
		  'pray':'\ud83d\ude4f',
		  'prayer_beads':'\ud83d\udcff',
		  'pregnant_woman':'\ud83e\udd30',
		  'previous_track_button':'\u23ee',
		  'prince':'\ud83e\udd34',
		  'princess':'\ud83d\udc78',
		  'printer':'\ud83d\udda8',
		  'purple_heart':'\ud83d\udc9c',
		  'purse':'\ud83d\udc5b',
		  'pushpin':'\ud83d\udccc',
		  'put_litter_in_its_place':'\ud83d\udeae',
		  'question':'\u2753',
		  'rabbit':'\ud83d\udc30',
		  'rabbit2':'\ud83d\udc07',
		  'racehorse':'\ud83d\udc0e',
		  'racing_car':'\ud83c\udfce',
		  'radio':'\ud83d\udcfb',
		  'radio_button':'\ud83d\udd18',
		  'radioactive':'\u2622\ufe0f',
		  'railway_car':'\ud83d\ude83',
		  'railway_track':'\ud83d\udee4',
		  'rainbow':'\ud83c\udf08',
		  'rainbow_flag':'\ud83c\udff3\ufe0f&zwj;\ud83c\udf08',
		  'raised_back_of_hand':'\ud83e\udd1a',
		  'raised_hand_with_fingers_splayed':'\ud83d\udd90',
		  'raised_hands':'\ud83d\ude4c',
		  'raising_hand_woman':'\ud83d\ude4b',
		  'raising_hand_man':'\ud83d\ude4b&zwj;\u2642\ufe0f',
		  'ram':'\ud83d\udc0f',
		  'ramen':'\ud83c\udf5c',
		  'rat':'\ud83d\udc00',
		  'record_button':'\u23fa',
		  'recycle':'\u267b\ufe0f',
		  'red_circle':'\ud83d\udd34',
		  'registered':'\u00ae\ufe0f',
		  'relaxed':'\u263a\ufe0f',
		  'relieved':'\ud83d\ude0c',
		  'reminder_ribbon':'\ud83c\udf97',
		  'repeat':'\ud83d\udd01',
		  'repeat_one':'\ud83d\udd02',
		  'rescue_worker_helmet':'\u26d1',
		  'restroom':'\ud83d\udebb',
		  'revolving_hearts':'\ud83d\udc9e',
		  'rewind':'\u23ea',
		  'rhinoceros':'\ud83e\udd8f',
		  'ribbon':'\ud83c\udf80',
		  'rice':'\ud83c\udf5a',
		  'rice_ball':'\ud83c\udf59',
		  'rice_cracker':'\ud83c\udf58',
		  'rice_scene':'\ud83c\udf91',
		  'right_anger_bubble':'\ud83d\uddef',
		  'ring':'\ud83d\udc8d',
		  'robot':'\ud83e\udd16',
		  'rocket':'\ud83d\ude80',
		  'rofl':'\ud83e\udd23',
		  'roll_eyes':'\ud83d\ude44',
		  'roller_coaster':'\ud83c\udfa2',
		  'rooster':'\ud83d\udc13',
		  'rose':'\ud83c\udf39',
		  'rosette':'\ud83c\udff5',
		  'rotating_light':'\ud83d\udea8',
		  'round_pushpin':'\ud83d\udccd',
		  'rowing_man':'\ud83d\udea3',
		  'rowing_woman':'\ud83d\udea3&zwj;\u2640\ufe0f',
		  'rugby_football':'\ud83c\udfc9',
		  'running_man':'\ud83c\udfc3',
		  'running_shirt_with_sash':'\ud83c\udfbd',
		  'running_woman':'\ud83c\udfc3&zwj;\u2640\ufe0f',
		  'sa':'\ud83c\ude02\ufe0f',
		  'sagittarius':'\u2650\ufe0f',
		  'sake':'\ud83c\udf76',
		  'sandal':'\ud83d\udc61',
		  'santa':'\ud83c\udf85',
		  'satellite':'\ud83d\udce1',
		  'saxophone':'\ud83c\udfb7',
		  'school':'\ud83c\udfeb',
		  'school_satchel':'\ud83c\udf92',
		  'scissors':'\u2702\ufe0f',
		  'scorpion':'\ud83e\udd82',
		  'scorpius':'\u264f\ufe0f',
		  'scream':'\ud83d\ude31',
		  'scream_cat':'\ud83d\ude40',
		  'scroll':'\ud83d\udcdc',
		  'seat':'\ud83d\udcba',
		  'secret':'\u3299\ufe0f',
		  'see_no_evil':'\ud83d\ude48',
		  'seedling':'\ud83c\udf31',
		  'selfie':'\ud83e\udd33',
		  'shallow_pan_of_food':'\ud83e\udd58',
		  'shamrock':'\u2618\ufe0f',
		  'shark':'\ud83e\udd88',
		  'shaved_ice':'\ud83c\udf67',
		  'sheep':'\ud83d\udc11',
		  'shell':'\ud83d\udc1a',
		  'shield':'\ud83d\udee1',
		  'shinto_shrine':'\u26e9',
		  'ship':'\ud83d\udea2',
		  'shirt':'\ud83d\udc55',
		  'shopping':'\ud83d\udecd',
		  'shopping_cart':'\ud83d\uded2',
		  'shower':'\ud83d\udebf',
		  'shrimp':'\ud83e\udd90',
		  'signal_strength':'\ud83d\udcf6',
		  'six_pointed_star':'\ud83d\udd2f',
		  'ski':'\ud83c\udfbf',
		  'skier':'\u26f7',
		  'skull':'\ud83d\udc80',
		  'skull_and_crossbones':'\u2620\ufe0f',
		  'sleeping':'\ud83d\ude34',
		  'sleeping_bed':'\ud83d\udecc',
		  'sleepy':'\ud83d\ude2a',
		  'slightly_frowning_face':'\ud83d\ude41',
		  'slightly_smiling_face':'\ud83d\ude42',
		  'slot_machine':'\ud83c\udfb0',
		  'small_airplane':'\ud83d\udee9',
		  'small_blue_diamond':'\ud83d\udd39',
		  'small_orange_diamond':'\ud83d\udd38',
		  'small_red_triangle':'\ud83d\udd3a',
		  'small_red_triangle_down':'\ud83d\udd3b',
		  'smile':'\ud83d\ude04',
		  'smile_cat':'\ud83d\ude38',
		  'smiley':'\ud83d\ude03',
		  'smiley_cat':'\ud83d\ude3a',
		  'smiling_imp':'\ud83d\ude08',
		  'smirk':'\ud83d\ude0f',
		  'smirk_cat':'\ud83d\ude3c',
		  'smoking':'\ud83d\udeac',
		  'snail':'\ud83d\udc0c',
		  'snake':'\ud83d\udc0d',
		  'sneezing_face':'\ud83e\udd27',
		  'snowboarder':'\ud83c\udfc2',
		  'snowflake':'\u2744\ufe0f',
		  'snowman':'\u26c4\ufe0f',
		  'snowman_with_snow':'\u2603\ufe0f',
		  'sob':'\ud83d\ude2d',
		  'soccer':'\u26bd\ufe0f',
		  'soon':'\ud83d\udd1c',
		  'sos':'\ud83c\udd98',
		  'sound':'\ud83d\udd09',
		  'space_invader':'\ud83d\udc7e',
		  'spades':'\u2660\ufe0f',
		  'spaghetti':'\ud83c\udf5d',
		  'sparkle':'\u2747\ufe0f',
		  'sparkler':'\ud83c\udf87',
		  'sparkles':'\u2728',
		  'sparkling_heart':'\ud83d\udc96',
		  'speak_no_evil':'\ud83d\ude4a',
		  'speaker':'\ud83d\udd08',
		  'speaking_head':'\ud83d\udde3',
		  'speech_balloon':'\ud83d\udcac',
		  'speedboat':'\ud83d\udea4',
		  'spider':'\ud83d\udd77',
		  'spider_web':'\ud83d\udd78',
		  'spiral_calendar':'\ud83d\uddd3',
		  'spiral_notepad':'\ud83d\uddd2',
		  'spoon':'\ud83e\udd44',
		  'squid':'\ud83e\udd91',
		  'stadium':'\ud83c\udfdf',
		  'star':'\u2b50\ufe0f',
		  'star2':'\ud83c\udf1f',
		  'star_and_crescent':'\u262a\ufe0f',
		  'star_of_david':'\u2721\ufe0f',
		  'stars':'\ud83c\udf20',
		  'station':'\ud83d\ude89',
		  'statue_of_liberty':'\ud83d\uddfd',
		  'steam_locomotive':'\ud83d\ude82',
		  'stew':'\ud83c\udf72',
		  'stop_button':'\u23f9',
		  'stop_sign':'\ud83d\uded1',
		  'stopwatch':'\u23f1',
		  'straight_ruler':'\ud83d\udccf',
		  'strawberry':'\ud83c\udf53',
		  'stuck_out_tongue':'\ud83d\ude1b',
		  'stuck_out_tongue_closed_eyes':'\ud83d\ude1d',
		  'stuck_out_tongue_winking_eye':'\ud83d\ude1c',
		  'studio_microphone':'\ud83c\udf99',
		  'stuffed_flatbread':'\ud83e\udd59',
		  'sun_behind_large_cloud':'\ud83c\udf25',
		  'sun_behind_rain_cloud':'\ud83c\udf26',
		  'sun_behind_small_cloud':'\ud83c\udf24',
		  'sun_with_face':'\ud83c\udf1e',
		  'sunflower':'\ud83c\udf3b',
		  'sunglasses':'\ud83d\ude0e',
		  'sunny':'\u2600\ufe0f',
		  'sunrise':'\ud83c\udf05',
		  'sunrise_over_mountains':'\ud83c\udf04',
		  'surfing_man':'\ud83c\udfc4',
		  'surfing_woman':'\ud83c\udfc4&zwj;\u2640\ufe0f',
		  'sushi':'\ud83c\udf63',
		  'suspension_railway':'\ud83d\ude9f',
		  'sweat':'\ud83d\ude13',
		  'sweat_drops':'\ud83d\udca6',
		  'sweat_smile':'\ud83d\ude05',
		  'sweet_potato':'\ud83c\udf60',
		  'swimming_man':'\ud83c\udfca',
		  'swimming_woman':'\ud83c\udfca&zwj;\u2640\ufe0f',
		  'symbols':'\ud83d\udd23',
		  'synagogue':'\ud83d\udd4d',
		  'syringe':'\ud83d\udc89',
		  'taco':'\ud83c\udf2e',
		  'tada':'\ud83c\udf89',
		  'tanabata_tree':'\ud83c\udf8b',
		  'taurus':'\u2649\ufe0f',
		  'taxi':'\ud83d\ude95',
		  'tea':'\ud83c\udf75',
		  'telephone_receiver':'\ud83d\udcde',
		  'telescope':'\ud83d\udd2d',
		  'tennis':'\ud83c\udfbe',
		  'tent':'\u26fa\ufe0f',
		  'thermometer':'\ud83c\udf21',
		  'thinking':'\ud83e\udd14',
		  'thought_balloon':'\ud83d\udcad',
		  'ticket':'\ud83c\udfab',
		  'tickets':'\ud83c\udf9f',
		  'tiger':'\ud83d\udc2f',
		  'tiger2':'\ud83d\udc05',
		  'timer_clock':'\u23f2',
		  'tipping_hand_man':'\ud83d\udc81&zwj;\u2642\ufe0f',
		  'tired_face':'\ud83d\ude2b',
		  'tm':'\u2122\ufe0f',
		  'toilet':'\ud83d\udebd',
		  'tokyo_tower':'\ud83d\uddfc',
		  'tomato':'\ud83c\udf45',
		  'tongue':'\ud83d\udc45',
		  'top':'\ud83d\udd1d',
		  'tophat':'\ud83c\udfa9',
		  'tornado':'\ud83c\udf2a',
		  'trackball':'\ud83d\uddb2',
		  'tractor':'\ud83d\ude9c',
		  'traffic_light':'\ud83d\udea5',
		  'train':'\ud83d\ude8b',
		  'train2':'\ud83d\ude86',
		  'tram':'\ud83d\ude8a',
		  'triangular_flag_on_post':'\ud83d\udea9',
		  'triangular_ruler':'\ud83d\udcd0',
		  'trident':'\ud83d\udd31',
		  'triumph':'\ud83d\ude24',
		  'trolleybus':'\ud83d\ude8e',
		  'trophy':'\ud83c\udfc6',
		  'tropical_drink':'\ud83c\udf79',
		  'tropical_fish':'\ud83d\udc20',
		  'truck':'\ud83d\ude9a',
		  'trumpet':'\ud83c\udfba',
		  'tulip':'\ud83c\udf37',
		  'tumbler_glass':'\ud83e\udd43',
		  'turkey':'\ud83e\udd83',
		  'turtle':'\ud83d\udc22',
		  'tv':'\ud83d\udcfa',
		  'twisted_rightwards_arrows':'\ud83d\udd00',
		  'two_hearts':'\ud83d\udc95',
		  'two_men_holding_hands':'\ud83d\udc6c',
		  'two_women_holding_hands':'\ud83d\udc6d',
		  'u5272':'\ud83c\ude39',
		  'u5408':'\ud83c\ude34',
		  'u55b6':'\ud83c\ude3a',
		  'u6307':'\ud83c\ude2f\ufe0f',
		  'u6708':'\ud83c\ude37\ufe0f',
		  'u6709':'\ud83c\ude36',
		  'u6e80':'\ud83c\ude35',
		  'u7121':'\ud83c\ude1a\ufe0f',
		  'u7533':'\ud83c\ude38',
		  'u7981':'\ud83c\ude32',
		  'u7a7a':'\ud83c\ude33',
		  'umbrella':'\u2614\ufe0f',
		  'unamused':'\ud83d\ude12',
		  'underage':'\ud83d\udd1e',
		  'unicorn':'\ud83e\udd84',
		  'unlock':'\ud83d\udd13',
		  'up':'\ud83c\udd99',
		  'upside_down_face':'\ud83d\ude43',
		  'v':'\u270c\ufe0f',
		  'vertical_traffic_light':'\ud83d\udea6',
		  'vhs':'\ud83d\udcfc',
		  'vibration_mode':'\ud83d\udcf3',
		  'video_camera':'\ud83d\udcf9',
		  'video_game':'\ud83c\udfae',
		  'violin':'\ud83c\udfbb',
		  'virgo':'\u264d\ufe0f',
		  'volcano':'\ud83c\udf0b',
		  'volleyball':'\ud83c\udfd0',
		  'vs':'\ud83c\udd9a',
		  'vulcan_salute':'\ud83d\udd96',
		  'walking_man':'\ud83d\udeb6',
		  'walking_woman':'\ud83d\udeb6&zwj;\u2640\ufe0f',
		  'waning_crescent_moon':'\ud83c\udf18',
		  'waning_gibbous_moon':'\ud83c\udf16',
		  'warning':'\u26a0\ufe0f',
		  'wastebasket':'\ud83d\uddd1',
		  'watch':'\u231a\ufe0f',
		  'water_buffalo':'\ud83d\udc03',
		  'watermelon':'\ud83c\udf49',
		  'wave':'\ud83d\udc4b',
		  'wavy_dash':'\u3030\ufe0f',
		  'waxing_crescent_moon':'\ud83c\udf12',
		  'wc':'\ud83d\udebe',
		  'weary':'\ud83d\ude29',
		  'wedding':'\ud83d\udc92',
		  'weight_lifting_man':'\ud83c\udfcb\ufe0f',
		  'weight_lifting_woman':'\ud83c\udfcb\ufe0f&zwj;\u2640\ufe0f',
		  'whale':'\ud83d\udc33',
		  'whale2':'\ud83d\udc0b',
		  'wheel_of_dharma':'\u2638\ufe0f',
		  'wheelchair':'\u267f\ufe0f',
		  'white_check_mark':'\u2705',
		  'white_circle':'\u26aa\ufe0f',
		  'white_flag':'\ud83c\udff3\ufe0f',
		  'white_flower':'\ud83d\udcae',
		  'white_large_square':'\u2b1c\ufe0f',
		  'white_medium_small_square':'\u25fd\ufe0f',
		  'white_medium_square':'\u25fb\ufe0f',
		  'white_small_square':'\u25ab\ufe0f',
		  'white_square_button':'\ud83d\udd33',
		  'wilted_flower':'\ud83e\udd40',
		  'wind_chime':'\ud83c\udf90',
		  'wind_face':'\ud83c\udf2c',
		  'wine_glass':'\ud83c\udf77',
		  'wink':'\ud83d\ude09',
		  'wolf':'\ud83d\udc3a',
		  'woman':'\ud83d\udc69',
		  'woman_artist':'\ud83d\udc69&zwj;\ud83c\udfa8',
		  'woman_astronaut':'\ud83d\udc69&zwj;\ud83d\ude80',
		  'woman_cartwheeling':'\ud83e\udd38&zwj;\u2640\ufe0f',
		  'woman_cook':'\ud83d\udc69&zwj;\ud83c\udf73',
		  'woman_facepalming':'\ud83e\udd26&zwj;\u2640\ufe0f',
		  'woman_factory_worker':'\ud83d\udc69&zwj;\ud83c\udfed',
		  'woman_farmer':'\ud83d\udc69&zwj;\ud83c\udf3e',
		  'woman_firefighter':'\ud83d\udc69&zwj;\ud83d\ude92',
		  'woman_health_worker':'\ud83d\udc69&zwj;\u2695\ufe0f',
		  'woman_judge':'\ud83d\udc69&zwj;\u2696\ufe0f',
		  'woman_juggling':'\ud83e\udd39&zwj;\u2640\ufe0f',
		  'woman_mechanic':'\ud83d\udc69&zwj;\ud83d\udd27',
		  'woman_office_worker':'\ud83d\udc69&zwj;\ud83d\udcbc',
		  'woman_pilot':'\ud83d\udc69&zwj;\u2708\ufe0f',
		  'woman_playing_handball':'\ud83e\udd3e&zwj;\u2640\ufe0f',
		  'woman_playing_water_polo':'\ud83e\udd3d&zwj;\u2640\ufe0f',
		  'woman_scientist':'\ud83d\udc69&zwj;\ud83d\udd2c',
		  'woman_shrugging':'\ud83e\udd37&zwj;\u2640\ufe0f',
		  'woman_singer':'\ud83d\udc69&zwj;\ud83c\udfa4',
		  'woman_student':'\ud83d\udc69&zwj;\ud83c\udf93',
		  'woman_teacher':'\ud83d\udc69&zwj;\ud83c\udfeb',
		  'woman_technologist':'\ud83d\udc69&zwj;\ud83d\udcbb',
		  'woman_with_turban':'\ud83d\udc73&zwj;\u2640\ufe0f',
		  'womans_clothes':'\ud83d\udc5a',
		  'womans_hat':'\ud83d\udc52',
		  'women_wrestling':'\ud83e\udd3c&zwj;\u2640\ufe0f',
		  'womens':'\ud83d\udeba',
		  'world_map':'\ud83d\uddfa',
		  'worried':'\ud83d\ude1f',
		  'wrench':'\ud83d\udd27',
		  'writing_hand':'\u270d\ufe0f',
		  'x':'\u274c',
		  'yellow_heart':'\ud83d\udc9b',
		  'yen':'\ud83d\udcb4',
		  'yin_yang':'\u262f\ufe0f',
		  'yum':'\ud83d\ude0b',
		  'zap':'\u26a1\ufe0f',
		  'zipper_mouth_face':'\ud83e\udd10',
		  'zzz':'\ud83d\udca4',

		  /* special emojis :P */
		  'octocat':  '<img alt=":octocat:" height="20" width="20" align="absmiddle" src="https://assets-cdn.github.com/images/icons/emoji/octocat.png">',
		  'showdown': '<span style="font-family: \'Anonymous Pro\', monospace; text-decoration: underline; text-decoration-style: dashed; text-decoration-color: #3e8b8a;text-underline-position: under;">S</span>'
		};

		/**
		 * Created by Estevao on 31-05-2015.
		 */

		/**
		 * Showdown Converter class
		 * @class
		 * @param {object} [converterOptions]
		 * @returns {Converter}
		 */
		showdown.Converter = function (converterOptions) {

		  var
		      /**
		       * Options used by this converter
		       * @private
		       * @type {{}}
		       */
		      options = {},

		      /**
		       * Language extensions used by this converter
		       * @private
		       * @type {Array}
		       */
		      langExtensions = [],

		      /**
		       * Output modifiers extensions used by this converter
		       * @private
		       * @type {Array}
		       */
		      outputModifiers = [],

		      /**
		       * Event listeners
		       * @private
		       * @type {{}}
		       */
		      listeners = {},

		      /**
		       * The flavor set in this converter
		       */
		      setConvFlavor = setFlavor,

		      /**
		       * Metadata of the document
		       * @type {{parsed: {}, raw: string, format: string}}
		       */
		      metadata = {
		        parsed: {},
		        raw: '',
		        format: ''
		      };

		  _constructor();

		  /**
		   * Converter constructor
		   * @private
		   */
		  function _constructor () {
		    converterOptions = converterOptions || {};

		    for (var gOpt in globalOptions) {
		      if (globalOptions.hasOwnProperty(gOpt)) {
		        options[gOpt] = globalOptions[gOpt];
		      }
		    }

		    // Merge options
		    if (typeof converterOptions === 'object') {
		      for (var opt in converterOptions) {
		        if (converterOptions.hasOwnProperty(opt)) {
		          options[opt] = converterOptions[opt];
		        }
		      }
		    } else {
		      throw Error('Converter expects the passed parameter to be an object, but ' + typeof converterOptions +
		      ' was passed instead.');
		    }

		    if (options.extensions) {
		      showdown.helper.forEach(options.extensions, _parseExtension);
		    }
		  }

		  /**
		   * Parse extension
		   * @param {*} ext
		   * @param {string} [name='']
		   * @private
		   */
		  function _parseExtension (ext, name) {

		    name = name || null;
		    // If it's a string, the extension was previously loaded
		    if (showdown.helper.isString(ext)) {
		      ext = showdown.helper.stdExtName(ext);
		      name = ext;

		      // LEGACY_SUPPORT CODE
		      if (showdown.extensions[ext]) {
		        console.warn('DEPRECATION WARNING: ' + ext + ' is an old extension that uses a deprecated loading method.' +
		          'Please inform the developer that the extension should be updated!');
		        legacyExtensionLoading(showdown.extensions[ext], ext);
		        return;
		        // END LEGACY SUPPORT CODE

		      } else if (!showdown.helper.isUndefined(extensions[ext])) {
		        ext = extensions[ext];

		      } else {
		        throw Error('Extension "' + ext + '" could not be loaded. It was either not found or is not a valid extension.');
		      }
		    }

		    if (typeof ext === 'function') {
		      ext = ext();
		    }

		    if (!showdown.helper.isArray(ext)) {
		      ext = [ext];
		    }

		    var validExt = validate(ext, name);
		    if (!validExt.valid) {
		      throw Error(validExt.error);
		    }

		    for (var i = 0; i < ext.length; ++i) {
		      switch (ext[i].type) {

		        case 'lang':
		          langExtensions.push(ext[i]);
		          break;

		        case 'output':
		          outputModifiers.push(ext[i]);
		          break;
		      }
		      if (ext[i].hasOwnProperty('listeners')) {
		        for (var ln in ext[i].listeners) {
		          if (ext[i].listeners.hasOwnProperty(ln)) {
		            listen(ln, ext[i].listeners[ln]);
		          }
		        }
		      }
		    }

		  }

		  /**
		   * LEGACY_SUPPORT
		   * @param {*} ext
		   * @param {string} name
		   */
		  function legacyExtensionLoading (ext, name) {
		    if (typeof ext === 'function') {
		      ext = ext(new showdown.Converter());
		    }
		    if (!showdown.helper.isArray(ext)) {
		      ext = [ext];
		    }
		    var valid = validate(ext, name);

		    if (!valid.valid) {
		      throw Error(valid.error);
		    }

		    for (var i = 0; i < ext.length; ++i) {
		      switch (ext[i].type) {
		        case 'lang':
		          langExtensions.push(ext[i]);
		          break;
		        case 'output':
		          outputModifiers.push(ext[i]);
		          break;
		        default:// should never reach here
		          throw Error('Extension loader error: Type unrecognized!!!');
		      }
		    }
		  }

		  /**
		   * Listen to an event
		   * @param {string} name
		   * @param {function} callback
		   */
		  function listen (name, callback) {
		    if (!showdown.helper.isString(name)) {
		      throw Error('Invalid argument in converter.listen() method: name must be a string, but ' + typeof name + ' given');
		    }

		    if (typeof callback !== 'function') {
		      throw Error('Invalid argument in converter.listen() method: callback must be a function, but ' + typeof callback + ' given');
		    }

		    if (!listeners.hasOwnProperty(name)) {
		      listeners[name] = [];
		    }
		    listeners[name].push(callback);
		  }

		  function rTrimInputText (text) {
		    var rsp = text.match(/^\s*/)[0].length,
		        rgx = new RegExp('^\\s{0,' + rsp + '}', 'gm');
		    return text.replace(rgx, '');
		  }

		  /**
		   * Dispatch an event
		   * @private
		   * @param {string} evtName Event name
		   * @param {string} text Text
		   * @param {{}} options Converter Options
		   * @param {{}} globals
		   * @returns {string}
		   */
		  this._dispatch = function dispatch (evtName, text, options, globals) {
		    if (listeners.hasOwnProperty(evtName)) {
		      for (var ei = 0; ei < listeners[evtName].length; ++ei) {
		        var nText = listeners[evtName][ei](evtName, text, this, options, globals);
		        if (nText && typeof nText !== 'undefined') {
		          text = nText;
		        }
		      }
		    }
		    return text;
		  };

		  /**
		   * Listen to an event
		   * @param {string} name
		   * @param {function} callback
		   * @returns {showdown.Converter}
		   */
		  this.listen = function (name, callback) {
		    listen(name, callback);
		    return this;
		  };

		  /**
		   * Converts a markdown string into HTML
		   * @param {string} text
		   * @returns {*}
		   */
		  this.makeHtml = function (text) {
		    //check if text is not falsy
		    if (!text) {
		      return text;
		    }

		    var globals = {
		      gHtmlBlocks:     [],
		      gHtmlMdBlocks:   [],
		      gHtmlSpans:      [],
		      gUrls:           {},
		      gTitles:         {},
		      gDimensions:     {},
		      gListLevel:      0,
		      hashLinkCounts:  {},
		      langExtensions:  langExtensions,
		      outputModifiers: outputModifiers,
		      converter:       this,
		      ghCodeBlocks:    [],
		      metadata: {
		        parsed: {},
		        raw: '',
		        format: ''
		      }
		    };

		    // This lets us use ¨ trema as an escape char to avoid md5 hashes
		    // The choice of character is arbitrary; anything that isn't
		    // magic in Markdown will work.
		    text = text.replace(/¨/g, '¨T');

		    // Replace $ with ¨D
		    // RegExp interprets $ as a special character
		    // when it's in a replacement string
		    text = text.replace(/\$/g, '¨D');

		    // Standardize line endings
		    text = text.replace(/\r\n/g, '\n'); // DOS to Unix
		    text = text.replace(/\r/g, '\n'); // Mac to Unix

		    // Stardardize line spaces
		    text = text.replace(/\u00A0/g, '&nbsp;');

		    if (options.smartIndentationFix) {
		      text = rTrimInputText(text);
		    }

		    // Make sure text begins and ends with a couple of newlines:
		    text = '\n\n' + text + '\n\n';

		    // detab
		    text = showdown.subParser('detab')(text, options, globals);

		    /**
		     * Strip any lines consisting only of spaces and tabs.
		     * This makes subsequent regexs easier to write, because we can
		     * match consecutive blank lines with /\n+/ instead of something
		     * contorted like /[ \t]*\n+/
		     */
		    text = text.replace(/^[ \t]+$/mg, '');

		    //run languageExtensions
		    showdown.helper.forEach(langExtensions, function (ext) {
		      text = showdown.subParser('runExtension')(ext, text, options, globals);
		    });

		    // run the sub parsers
		    text = showdown.subParser('metadata')(text, options, globals);
		    text = showdown.subParser('hashPreCodeTags')(text, options, globals);
		    text = showdown.subParser('githubCodeBlocks')(text, options, globals);
		    text = showdown.subParser('hashHTMLBlocks')(text, options, globals);
		    text = showdown.subParser('hashCodeTags')(text, options, globals);
		    text = showdown.subParser('stripLinkDefinitions')(text, options, globals);
		    text = showdown.subParser('blockGamut')(text, options, globals);
		    text = showdown.subParser('unhashHTMLSpans')(text, options, globals);
		    text = showdown.subParser('unescapeSpecialChars')(text, options, globals);

		    // attacklab: Restore dollar signs
		    text = text.replace(/¨D/g, '$$');

		    // attacklab: Restore tremas
		    text = text.replace(/¨T/g, '¨');

		    // render a complete html document instead of a partial if the option is enabled
		    text = showdown.subParser('completeHTMLDocument')(text, options, globals);

		    // Run output modifiers
		    showdown.helper.forEach(outputModifiers, function (ext) {
		      text = showdown.subParser('runExtension')(ext, text, options, globals);
		    });

		    // update metadata
		    metadata = globals.metadata;
		    return text;
		  };

		  /**
		   * Converts an HTML string into a markdown string
		   * @param src
		   * @param [HTMLParser] A WHATWG DOM and HTML parser, such as JSDOM. If none is supplied, window.document will be used.
		   * @returns {string}
		   */
		  this.makeMarkdown = this.makeMd = function (src, HTMLParser) {

		    // replace \r\n with \n
		    src = src.replace(/\r\n/g, '\n');
		    src = src.replace(/\r/g, '\n'); // old macs

		    // due to an edge case, we need to find this: > <
		    // to prevent removing of non silent white spaces
		    // ex: <em>this is</em> <strong>sparta</strong>
		    src = src.replace(/>[ \t]+</, '>¨NBSP;<');

		    if (!HTMLParser) {
		      if (window && window.document) {
		        HTMLParser = window.document;
		      } else {
		        throw new Error('HTMLParser is undefined. If in a webworker or nodejs environment, you need to provide a WHATWG DOM and HTML such as JSDOM');
		      }
		    }

		    var doc = HTMLParser.createElement('div');
		    doc.innerHTML = src;

		    var globals = {
		      preList: substitutePreCodeTags(doc)
		    };

		    // remove all newlines and collapse spaces
		    clean(doc);

		    // some stuff, like accidental reference links must now be escaped
		    // TODO
		    // doc.innerHTML = doc.innerHTML.replace(/\[[\S\t ]]/);

		    var nodes = doc.childNodes,
		        mdDoc = '';

		    for (var i = 0; i < nodes.length; i++) {
		      mdDoc += showdown.subParser('makeMarkdown.node')(nodes[i], globals);
		    }

		    function clean (node) {
		      for (var n = 0; n < node.childNodes.length; ++n) {
		        var child = node.childNodes[n];
		        if (child.nodeType === 3) {
		          if (!/\S/.test(child.nodeValue) && !/^[ ]+$/.test(child.nodeValue)) {
		            node.removeChild(child);
		            --n;
		          } else {
		            child.nodeValue = child.nodeValue.split('\n').join(' ');
		            child.nodeValue = child.nodeValue.replace(/(\s)+/g, '$1');
		          }
		        } else if (child.nodeType === 1) {
		          clean(child);
		        }
		      }
		    }

		    // find all pre tags and replace contents with placeholder
		    // we need this so that we can remove all indentation from html
		    // to ease up parsing
		    function substitutePreCodeTags (doc) {

		      var pres = doc.querySelectorAll('pre'),
		          presPH = [];

		      for (var i = 0; i < pres.length; ++i) {

		        if (pres[i].childElementCount === 1 && pres[i].firstChild.tagName.toLowerCase() === 'code') {
		          var content = pres[i].firstChild.innerHTML.trim(),
		              language = pres[i].firstChild.getAttribute('data-language') || '';

		          // if data-language attribute is not defined, then we look for class language-*
		          if (language === '') {
		            var classes = pres[i].firstChild.className.split(' ');
		            for (var c = 0; c < classes.length; ++c) {
		              var matches = classes[c].match(/^language-(.+)$/);
		              if (matches !== null) {
		                language = matches[1];
		                break;
		              }
		            }
		          }

		          // unescape html entities in content
		          content = showdown.helper.unescapeHTMLEntities(content);

		          presPH.push(content);
		          pres[i].outerHTML = '<precode language="' + language + '" precodenum="' + i.toString() + '"></precode>';
		        } else {
		          presPH.push(pres[i].innerHTML);
		          pres[i].innerHTML = '';
		          pres[i].setAttribute('prenum', i.toString());
		        }
		      }
		      return presPH;
		    }

		    return mdDoc;
		  };

		  /**
		   * Set an option of this Converter instance
		   * @param {string} key
		   * @param {*} value
		   */
		  this.setOption = function (key, value) {
		    options[key] = value;
		  };

		  /**
		   * Get the option of this Converter instance
		   * @param {string} key
		   * @returns {*}
		   */
		  this.getOption = function (key) {
		    return options[key];
		  };

		  /**
		   * Get the options of this Converter instance
		   * @returns {{}}
		   */
		  this.getOptions = function () {
		    return options;
		  };

		  /**
		   * Add extension to THIS converter
		   * @param {{}} extension
		   * @param {string} [name=null]
		   */
		  this.addExtension = function (extension, name) {
		    name = name || null;
		    _parseExtension(extension, name);
		  };

		  /**
		   * Use a global registered extension with THIS converter
		   * @param {string} extensionName Name of the previously registered extension
		   */
		  this.useExtension = function (extensionName) {
		    _parseExtension(extensionName);
		  };

		  /**
		   * Set the flavor THIS converter should use
		   * @param {string} name
		   */
		  this.setFlavor = function (name) {
		    if (!flavor.hasOwnProperty(name)) {
		      throw Error(name + ' flavor was not found');
		    }
		    var preset = flavor[name];
		    setConvFlavor = name;
		    for (var option in preset) {
		      if (preset.hasOwnProperty(option)) {
		        options[option] = preset[option];
		      }
		    }
		  };

		  /**
		   * Get the currently set flavor of this converter
		   * @returns {string}
		   */
		  this.getFlavor = function () {
		    return setConvFlavor;
		  };

		  /**
		   * Remove an extension from THIS converter.
		   * Note: This is a costly operation. It's better to initialize a new converter
		   * and specify the extensions you wish to use
		   * @param {Array} extension
		   */
		  this.removeExtension = function (extension) {
		    if (!showdown.helper.isArray(extension)) {
		      extension = [extension];
		    }
		    for (var a = 0; a < extension.length; ++a) {
		      var ext = extension[a];
		      for (var i = 0; i < langExtensions.length; ++i) {
		        if (langExtensions[i] === ext) {
		          langExtensions.splice(i, 1);
		        }
		      }
		      for (var ii = 0; ii < outputModifiers.length; ++ii) {
		        if (outputModifiers[ii] === ext) {
		          outputModifiers.splice(ii, 1);
		        }
		      }
		    }
		  };

		  /**
		   * Get all extension of THIS converter
		   * @returns {{language: Array, output: Array}}
		   */
		  this.getAllExtensions = function () {
		    return {
		      language: langExtensions,
		      output: outputModifiers
		    };
		  };

		  /**
		   * Get the metadata of the previously parsed document
		   * @param raw
		   * @returns {string|{}}
		   */
		  this.getMetadata = function (raw) {
		    if (raw) {
		      return metadata.raw;
		    } else {
		      return metadata.parsed;
		    }
		  };

		  /**
		   * Get the metadata format of the previously parsed document
		   * @returns {string}
		   */
		  this.getMetadataFormat = function () {
		    return metadata.format;
		  };

		  /**
		   * Private: set a single key, value metadata pair
		   * @param {string} key
		   * @param {string} value
		   */
		  this._setMetadataPair = function (key, value) {
		    metadata.parsed[key] = value;
		  };

		  /**
		   * Private: set metadata format
		   * @param {string} format
		   */
		  this._setMetadataFormat = function (format) {
		    metadata.format = format;
		  };

		  /**
		   * Private: set metadata raw text
		   * @param {string} raw
		   */
		  this._setMetadataRaw = function (raw) {
		    metadata.raw = raw;
		  };
		};

		/**
		 * Turn Markdown link shortcuts into XHTML <a> tags.
		 */
		showdown.subParser('anchors', function (text, options, globals) {

		  text = globals.converter._dispatch('anchors.before', text, options, globals);

		  var writeAnchorTag = function (wholeMatch, linkText, linkId, url, m5, m6, title) {
		    if (showdown.helper.isUndefined(title)) {
		      title = '';
		    }
		    linkId = linkId.toLowerCase();

		    // Special case for explicit empty url
		    if (wholeMatch.search(/\(<?\s*>? ?(['"].*['"])?\)$/m) > -1) {
		      url = '';
		    } else if (!url) {
		      if (!linkId) {
		        // lower-case and turn embedded newlines into spaces
		        linkId = linkText.toLowerCase().replace(/ ?\n/g, ' ');
		      }
		      url = '#' + linkId;

		      if (!showdown.helper.isUndefined(globals.gUrls[linkId])) {
		        url = globals.gUrls[linkId];
		        if (!showdown.helper.isUndefined(globals.gTitles[linkId])) {
		          title = globals.gTitles[linkId];
		        }
		      } else {
		        return wholeMatch;
		      }
		    }

		    //url = showdown.helper.escapeCharacters(url, '*_', false); // replaced line to improve performance
		    url = url.replace(showdown.helper.regexes.asteriskDashAndColon, showdown.helper.escapeCharactersCallback);

		    var result = '<a href="' + url + '"';

		    if (title !== '' && title !== null) {
		      title = title.replace(/"/g, '&quot;');
		      //title = showdown.helper.escapeCharacters(title, '*_', false); // replaced line to improve performance
		      title = title.replace(showdown.helper.regexes.asteriskDashAndColon, showdown.helper.escapeCharactersCallback);
		      result += ' title="' + title + '"';
		    }

		    // optionLinksInNewWindow only applies
		    // to external links. Hash links (#) open in same page
		    if (options.openLinksInNewWindow && !/^#/.test(url)) {
		      // escaped _
		      result += ' rel="noopener noreferrer" target="¨E95Eblank"';
		    }

		    result += '>' + linkText + '</a>';

		    return result;
		  };

		  // First, handle reference-style links: [link text] [id]
		  text = text.replace(/\[((?:\[[^\]]*]|[^\[\]])*)] ?(?:\n *)?\[(.*?)]()()()()/g, writeAnchorTag);

		  // Next, inline-style links: [link text](url "optional title")
		  // cases with crazy urls like ./image/cat1).png
		  text = text.replace(/\[((?:\[[^\]]*]|[^\[\]])*)]()[ \t]*\([ \t]?<([^>]*)>(?:[ \t]*((["'])([^"]*?)\5))?[ \t]?\)/g,
		    writeAnchorTag);

		  // normal cases
		  text = text.replace(/\[((?:\[[^\]]*]|[^\[\]])*)]()[ \t]*\([ \t]?<?([\S]+?(?:\([\S]*?\)[\S]*?)?)>?(?:[ \t]*((["'])([^"]*?)\5))?[ \t]?\)/g,
		    writeAnchorTag);

		  // handle reference-style shortcuts: [link text]
		  // These must come last in case you've also got [link test][1]
		  // or [link test](/foo)
		  text = text.replace(/\[([^\[\]]+)]()()()()()/g, writeAnchorTag);

		  // Lastly handle GithubMentions if option is enabled
		  if (options.ghMentions) {
		    text = text.replace(/(^|\s)(\\)?(@([a-z\d]+(?:[a-z\d.-]+?[a-z\d]+)*))/gmi, function (wm, st, escape, mentions, username) {
		      if (escape === '\\') {
		        return st + mentions;
		      }

		      //check if options.ghMentionsLink is a string
		      if (!showdown.helper.isString(options.ghMentionsLink)) {
		        throw new Error('ghMentionsLink option must be a string');
		      }
		      var lnk = options.ghMentionsLink.replace(/\{u}/g, username),
		          target = '';
		      if (options.openLinksInNewWindow) {
		        target = ' rel="noopener noreferrer" target="¨E95Eblank"';
		      }
		      return st + '<a href="' + lnk + '"' + target + '>' + mentions + '</a>';
		    });
		  }

		  text = globals.converter._dispatch('anchors.after', text, options, globals);
		  return text;
		});

		// url allowed chars [a-z\d_.~:/?#[]@!$&'()*+,;=-]

		var simpleURLRegex  = /([*~_]+|\b)(((https?|ftp|dict):\/\/|www\.)[^'">\s]+?\.[^'">\s]+?)()(\1)?(?=\s|$)(?!["<>])/gi,
		    simpleURLRegex2 = /([*~_]+|\b)(((https?|ftp|dict):\/\/|www\.)[^'">\s]+\.[^'">\s]+?)([.!?,()\[\]])?(\1)?(?=\s|$)(?!["<>])/gi,
		    delimUrlRegex   = /()<(((https?|ftp|dict):\/\/|www\.)[^'">\s]+)()>()/gi,
		    simpleMailRegex = /(^|\s)(?:mailto:)?([A-Za-z0-9!#$%&'*+-/=?^_`{|}~.]+@[-a-z0-9]+(\.[-a-z0-9]+)*\.[a-z]+)(?=$|\s)/gmi,
		    delimMailRegex  = /<()(?:mailto:)?([-.\w]+@[-a-z0-9]+(\.[-a-z0-9]+)*\.[a-z]+)>/gi,

		    replaceLink = function (options) {
		      return function (wm, leadingMagicChars, link, m2, m3, trailingPunctuation, trailingMagicChars) {
		        link = link.replace(showdown.helper.regexes.asteriskDashAndColon, showdown.helper.escapeCharactersCallback);
		        var lnkTxt = link,
		            append = '',
		            target = '',
		            lmc    = leadingMagicChars || '',
		            tmc    = trailingMagicChars || '';
		        if (/^www\./i.test(link)) {
		          link = link.replace(/^www\./i, 'http://www.');
		        }
		        if (options.excludeTrailingPunctuationFromURLs && trailingPunctuation) {
		          append = trailingPunctuation;
		        }
		        if (options.openLinksInNewWindow) {
		          target = ' rel="noopener noreferrer" target="¨E95Eblank"';
		        }
		        return lmc + '<a href="' + link + '"' + target + '>' + lnkTxt + '</a>' + append + tmc;
		      };
		    },

		    replaceMail = function (options, globals) {
		      return function (wholeMatch, b, mail) {
		        var href = 'mailto:';
		        b = b || '';
		        mail = showdown.subParser('unescapeSpecialChars')(mail, options, globals);
		        if (options.encodeEmails) {
		          href = showdown.helper.encodeEmailAddress(href + mail);
		          mail = showdown.helper.encodeEmailAddress(mail);
		        } else {
		          href = href + mail;
		        }
		        return b + '<a href="' + href + '">' + mail + '</a>';
		      };
		    };

		showdown.subParser('autoLinks', function (text, options, globals) {

		  text = globals.converter._dispatch('autoLinks.before', text, options, globals);

		  text = text.replace(delimUrlRegex, replaceLink(options));
		  text = text.replace(delimMailRegex, replaceMail(options, globals));

		  text = globals.converter._dispatch('autoLinks.after', text, options, globals);

		  return text;
		});

		showdown.subParser('simplifiedAutoLinks', function (text, options, globals) {

		  if (!options.simplifiedAutoLink) {
		    return text;
		  }

		  text = globals.converter._dispatch('simplifiedAutoLinks.before', text, options, globals);

		  if (options.excludeTrailingPunctuationFromURLs) {
		    text = text.replace(simpleURLRegex2, replaceLink(options));
		  } else {
		    text = text.replace(simpleURLRegex, replaceLink(options));
		  }
		  text = text.replace(simpleMailRegex, replaceMail(options, globals));

		  text = globals.converter._dispatch('simplifiedAutoLinks.after', text, options, globals);

		  return text;
		});

		/**
		 * These are all the transformations that form block-level
		 * tags like paragraphs, headers, and list items.
		 */
		showdown.subParser('blockGamut', function (text, options, globals) {

		  text = globals.converter._dispatch('blockGamut.before', text, options, globals);

		  // we parse blockquotes first so that we can have headings and hrs
		  // inside blockquotes
		  text = showdown.subParser('blockQuotes')(text, options, globals);
		  text = showdown.subParser('headers')(text, options, globals);

		  // Do Horizontal Rules:
		  text = showdown.subParser('horizontalRule')(text, options, globals);

		  text = showdown.subParser('lists')(text, options, globals);
		  text = showdown.subParser('codeBlocks')(text, options, globals);
		  text = showdown.subParser('tables')(text, options, globals);

		  // We already ran _HashHTMLBlocks() before, in Markdown(), but that
		  // was to escape raw HTML in the original Markdown source. This time,
		  // we're escaping the markup we've just created, so that we don't wrap
		  // <p> tags around block-level tags.
		  text = showdown.subParser('hashHTMLBlocks')(text, options, globals);
		  text = showdown.subParser('paragraphs')(text, options, globals);

		  text = globals.converter._dispatch('blockGamut.after', text, options, globals);

		  return text;
		});

		showdown.subParser('blockQuotes', function (text, options, globals) {

		  text = globals.converter._dispatch('blockQuotes.before', text, options, globals);

		  // add a couple extra lines after the text and endtext mark
		  text = text + '\n\n';

		  var rgx = /(^ {0,3}>[ \t]?.+\n(.+\n)*\n*)+/gm;

		  if (options.splitAdjacentBlockquotes) {
		    rgx = /^ {0,3}>[\s\S]*?(?:\n\n)/gm;
		  }

		  text = text.replace(rgx, function (bq) {
		    // attacklab: hack around Konqueror 3.5.4 bug:
		    // "----------bug".replace(/^-/g,"") == "bug"
		    bq = bq.replace(/^[ \t]*>[ \t]?/gm, ''); // trim one level of quoting

		    // attacklab: clean up hack
		    bq = bq.replace(/¨0/g, '');

		    bq = bq.replace(/^[ \t]+$/gm, ''); // trim whitespace-only lines
		    bq = showdown.subParser('githubCodeBlocks')(bq, options, globals);
		    bq = showdown.subParser('blockGamut')(bq, options, globals); // recurse

		    bq = bq.replace(/(^|\n)/g, '$1  ');
		    // These leading spaces screw with <pre> content, so we need to fix that:
		    bq = bq.replace(/(\s*<pre>[^\r]+?<\/pre>)/gm, function (wholeMatch, m1) {
		      var pre = m1;
		      // attacklab: hack around Konqueror 3.5.4 bug:
		      pre = pre.replace(/^  /mg, '¨0');
		      pre = pre.replace(/¨0/g, '');
		      return pre;
		    });

		    return showdown.subParser('hashBlock')('<blockquote>\n' + bq + '\n</blockquote>', options, globals);
		  });

		  text = globals.converter._dispatch('blockQuotes.after', text, options, globals);
		  return text;
		});

		/**
		 * Process Markdown `<pre><code>` blocks.
		 */
		showdown.subParser('codeBlocks', function (text, options, globals) {

		  text = globals.converter._dispatch('codeBlocks.before', text, options, globals);

		  // sentinel workarounds for lack of \A and \Z, safari\khtml bug
		  text += '¨0';

		  var pattern = /(?:\n\n|^)((?:(?:[ ]{4}|\t).*\n+)+)(\n*[ ]{0,3}[^ \t\n]|(?=¨0))/g;
		  text = text.replace(pattern, function (wholeMatch, m1, m2) {
		    var codeblock = m1,
		        nextChar = m2,
		        end = '\n';

		    codeblock = showdown.subParser('outdent')(codeblock, options, globals);
		    codeblock = showdown.subParser('encodeCode')(codeblock, options, globals);
		    codeblock = showdown.subParser('detab')(codeblock, options, globals);
		    codeblock = codeblock.replace(/^\n+/g, ''); // trim leading newlines
		    codeblock = codeblock.replace(/\n+$/g, ''); // trim trailing newlines

		    if (options.omitExtraWLInCodeBlocks) {
		      end = '';
		    }

		    codeblock = '<pre><code>' + codeblock + end + '</code></pre>';

		    return showdown.subParser('hashBlock')(codeblock, options, globals) + nextChar;
		  });

		  // strip sentinel
		  text = text.replace(/¨0/, '');

		  text = globals.converter._dispatch('codeBlocks.after', text, options, globals);
		  return text;
		});

		/**
		 *
		 *   *  Backtick quotes are used for <code></code> spans.
		 *
		 *   *  You can use multiple backticks as the delimiters if you want to
		 *     include literal backticks in the code span. So, this input:
		 *
		 *         Just type ``foo `bar` baz`` at the prompt.
		 *
		 *       Will translate to:
		 *
		 *         <p>Just type <code>foo `bar` baz</code> at the prompt.</p>
		 *
		 *    There's no arbitrary limit to the number of backticks you
		 *    can use as delimters. If you need three consecutive backticks
		 *    in your code, use four for delimiters, etc.
		 *
		 *  *  You can use spaces to get literal backticks at the edges:
		 *
		 *         ... type `` `bar` `` ...
		 *
		 *       Turns to:
		 *
		 *         ... type <code>`bar`</code> ...
		 */
		showdown.subParser('codeSpans', function (text, options, globals) {

		  text = globals.converter._dispatch('codeSpans.before', text, options, globals);

		  if (typeof (text) === 'undefined') {
		    text = '';
		  }
		  text = text.replace(/(^|[^\\])(`+)([^\r]*?[^`])\2(?!`)/gm,
		    function (wholeMatch, m1, m2, m3) {
		      var c = m3;
		      c = c.replace(/^([ \t]*)/g, '');	// leading whitespace
		      c = c.replace(/[ \t]*$/g, '');	// trailing whitespace
		      c = showdown.subParser('encodeCode')(c, options, globals);
		      c = m1 + '<code>' + c + '</code>';
		      c = showdown.subParser('hashHTMLSpans')(c, options, globals);
		      return c;
		    }
		  );

		  text = globals.converter._dispatch('codeSpans.after', text, options, globals);
		  return text;
		});

		/**
		 * Create a full HTML document from the processed markdown
		 */
		showdown.subParser('completeHTMLDocument', function (text, options, globals) {

		  if (!options.completeHTMLDocument) {
		    return text;
		  }

		  text = globals.converter._dispatch('completeHTMLDocument.before', text, options, globals);

		  var doctype = 'html',
		      doctypeParsed = '<!DOCTYPE HTML>\n',
		      title = '',
		      charset = '<meta charset="utf-8">\n',
		      lang = '',
		      metadata = '';

		  if (typeof globals.metadata.parsed.doctype !== 'undefined') {
		    doctypeParsed = '<!DOCTYPE ' +  globals.metadata.parsed.doctype + '>\n';
		    doctype = globals.metadata.parsed.doctype.toString().toLowerCase();
		    if (doctype === 'html' || doctype === 'html5') {
		      charset = '<meta charset="utf-8">';
		    }
		  }

		  for (var meta in globals.metadata.parsed) {
		    if (globals.metadata.parsed.hasOwnProperty(meta)) {
		      switch (meta.toLowerCase()) {
		        case 'doctype':
		          break;

		        case 'title':
		          title = '<title>' +  globals.metadata.parsed.title + '</title>\n';
		          break;

		        case 'charset':
		          if (doctype === 'html' || doctype === 'html5') {
		            charset = '<meta charset="' + globals.metadata.parsed.charset + '">\n';
		          } else {
		            charset = '<meta name="charset" content="' + globals.metadata.parsed.charset + '">\n';
		          }
		          break;

		        case 'language':
		        case 'lang':
		          lang = ' lang="' + globals.metadata.parsed[meta] + '"';
		          metadata += '<meta name="' + meta + '" content="' + globals.metadata.parsed[meta] + '">\n';
		          break;

		        default:
		          metadata += '<meta name="' + meta + '" content="' + globals.metadata.parsed[meta] + '">\n';
		      }
		    }
		  }

		  text = doctypeParsed + '<html' + lang + '>\n<head>\n' + title + charset + metadata + '</head>\n<body>\n' + text.trim() + '\n</body>\n</html>';

		  text = globals.converter._dispatch('completeHTMLDocument.after', text, options, globals);
		  return text;
		});

		/**
		 * Convert all tabs to spaces
		 */
		showdown.subParser('detab', function (text, options, globals) {
		  text = globals.converter._dispatch('detab.before', text, options, globals);

		  // expand first n-1 tabs
		  text = text.replace(/\t(?=\t)/g, '    '); // g_tab_width

		  // replace the nth with two sentinels
		  text = text.replace(/\t/g, '¨A¨B');

		  // use the sentinel to anchor our regex so it doesn't explode
		  text = text.replace(/¨B(.+?)¨A/g, function (wholeMatch, m1) {
		    var leadingText = m1,
		        numSpaces = 4 - leadingText.length % 4;  // g_tab_width

		    // there *must* be a better way to do this:
		    for (var i = 0; i < numSpaces; i++) {
		      leadingText += ' ';
		    }

		    return leadingText;
		  });

		  // clean up sentinels
		  text = text.replace(/¨A/g, '    ');  // g_tab_width
		  text = text.replace(/¨B/g, '');

		  text = globals.converter._dispatch('detab.after', text, options, globals);
		  return text;
		});

		showdown.subParser('ellipsis', function (text, options, globals) {

		  if (!options.ellipsis) {
		    return text;
		  }

		  text = globals.converter._dispatch('ellipsis.before', text, options, globals);

		  text = text.replace(/\.\.\./g, '…');

		  text = globals.converter._dispatch('ellipsis.after', text, options, globals);

		  return text;
		});

		/**
		 * Turn emoji codes into emojis
		 *
		 * List of supported emojis: https://github.com/showdownjs/showdown/wiki/Emojis
		 */
		showdown.subParser('emoji', function (text, options, globals) {

		  if (!options.emoji) {
		    return text;
		  }

		  text = globals.converter._dispatch('emoji.before', text, options, globals);

		  var emojiRgx = /:([\S]+?):/g;

		  text = text.replace(emojiRgx, function (wm, emojiCode) {
		    if (showdown.helper.emojis.hasOwnProperty(emojiCode)) {
		      return showdown.helper.emojis[emojiCode];
		    }
		    return wm;
		  });

		  text = globals.converter._dispatch('emoji.after', text, options, globals);

		  return text;
		});

		/**
		 * Smart processing for ampersands and angle brackets that need to be encoded.
		 */
		showdown.subParser('encodeAmpsAndAngles', function (text, options, globals) {
		  text = globals.converter._dispatch('encodeAmpsAndAngles.before', text, options, globals);

		  // Ampersand-encoding based entirely on Nat Irons's Amputator MT plugin:
		  // http://bumppo.net/projects/amputator/
		  text = text.replace(/&(?!#?[xX]?(?:[0-9a-fA-F]+|\w+);)/g, '&amp;');

		  // Encode naked <'s
		  text = text.replace(/<(?![a-z\/?$!])/gi, '&lt;');

		  // Encode <
		  text = text.replace(/</g, '&lt;');

		  // Encode >
		  text = text.replace(/>/g, '&gt;');

		  text = globals.converter._dispatch('encodeAmpsAndAngles.after', text, options, globals);
		  return text;
		});

		/**
		 * Returns the string, with after processing the following backslash escape sequences.
		 *
		 * attacklab: The polite way to do this is with the new escapeCharacters() function:
		 *
		 *    text = escapeCharacters(text,"\\",true);
		 *    text = escapeCharacters(text,"`*_{}[]()>#+-.!",true);
		 *
		 * ...but we're sidestepping its use of the (slow) RegExp constructor
		 * as an optimization for Firefox.  This function gets called a LOT.
		 */
		showdown.subParser('encodeBackslashEscapes', function (text, options, globals) {
		  text = globals.converter._dispatch('encodeBackslashEscapes.before', text, options, globals);

		  text = text.replace(/\\(\\)/g, showdown.helper.escapeCharactersCallback);
		  text = text.replace(/\\([`*_{}\[\]()>#+.!~=|:-])/g, showdown.helper.escapeCharactersCallback);

		  text = globals.converter._dispatch('encodeBackslashEscapes.after', text, options, globals);
		  return text;
		});

		/**
		 * Encode/escape certain characters inside Markdown code runs.
		 * The point is that in code, these characters are literals,
		 * and lose their special Markdown meanings.
		 */
		showdown.subParser('encodeCode', function (text, options, globals) {

		  text = globals.converter._dispatch('encodeCode.before', text, options, globals);

		  // Encode all ampersands; HTML entities are not
		  // entities within a Markdown code span.
		  text = text
		    .replace(/&/g, '&amp;')
		  // Do the angle bracket song and dance:
		    .replace(/</g, '&lt;')
		    .replace(/>/g, '&gt;')
		  // Now, escape characters that are magic in Markdown:
		    .replace(/([*_{}\[\]\\=~-])/g, showdown.helper.escapeCharactersCallback);

		  text = globals.converter._dispatch('encodeCode.after', text, options, globals);
		  return text;
		});

		/**
		 * Within tags -- meaning between < and > -- encode [\ ` * _ ~ =] so they
		 * don't conflict with their use in Markdown for code, italics and strong.
		 */
		showdown.subParser('escapeSpecialCharsWithinTagAttributes', function (text, options, globals) {
		  text = globals.converter._dispatch('escapeSpecialCharsWithinTagAttributes.before', text, options, globals);

		  // Build a regex to find HTML tags.
		  var tags     = /<\/?[a-z\d_:-]+(?:[\s]+[\s\S]+?)?>/gi,
		      comments = /<!(--(?:(?:[^>-]|-[^>])(?:[^-]|-[^-])*)--)>/gi;

		  text = text.replace(tags, function (wholeMatch) {
		    return wholeMatch
		      .replace(/(.)<\/?code>(?=.)/g, '$1`')
		      .replace(/([\\`*_~=|])/g, showdown.helper.escapeCharactersCallback);
		  });

		  text = text.replace(comments, function (wholeMatch) {
		    return wholeMatch
		      .replace(/([\\`*_~=|])/g, showdown.helper.escapeCharactersCallback);
		  });

		  text = globals.converter._dispatch('escapeSpecialCharsWithinTagAttributes.after', text, options, globals);
		  return text;
		});

		/**
		 * Handle github codeblocks prior to running HashHTML so that
		 * HTML contained within the codeblock gets escaped properly
		 * Example:
		 * ```ruby
		 *     def hello_world(x)
		 *       puts "Hello, #{x}"
		 *     end
		 * ```
		 */
		showdown.subParser('githubCodeBlocks', function (text, options, globals) {

		  // early exit if option is not enabled
		  if (!options.ghCodeBlocks) {
		    return text;
		  }

		  text = globals.converter._dispatch('githubCodeBlocks.before', text, options, globals);

		  text += '¨0';

		  text = text.replace(/(?:^|\n)(?: {0,3})(```+|~~~+)(?: *)([^\s`~]*)\n([\s\S]*?)\n(?: {0,3})\1/g, function (wholeMatch, delim, language, codeblock) {
		    var end = (options.omitExtraWLInCodeBlocks) ? '' : '\n';

		    // First parse the github code block
		    codeblock = showdown.subParser('encodeCode')(codeblock, options, globals);
		    codeblock = showdown.subParser('detab')(codeblock, options, globals);
		    codeblock = codeblock.replace(/^\n+/g, ''); // trim leading newlines
		    codeblock = codeblock.replace(/\n+$/g, ''); // trim trailing whitespace

		    codeblock = '<pre><code' + (language ? ' class="' + language + ' language-' + language + '"' : '') + '>' + codeblock + end + '</code></pre>';

		    codeblock = showdown.subParser('hashBlock')(codeblock, options, globals);

		    // Since GHCodeblocks can be false positives, we need to
		    // store the primitive text and the parsed text in a global var,
		    // and then return a token
		    return '\n\n¨G' + (globals.ghCodeBlocks.push({text: wholeMatch, codeblock: codeblock}) - 1) + 'G\n\n';
		  });

		  // attacklab: strip sentinel
		  text = text.replace(/¨0/, '');

		  return globals.converter._dispatch('githubCodeBlocks.after', text, options, globals);
		});

		showdown.subParser('hashBlock', function (text, options, globals) {
		  text = globals.converter._dispatch('hashBlock.before', text, options, globals);
		  text = text.replace(/(^\n+|\n+$)/g, '');
		  text = '\n\n¨K' + (globals.gHtmlBlocks.push(text) - 1) + 'K\n\n';
		  text = globals.converter._dispatch('hashBlock.after', text, options, globals);
		  return text;
		});

		/**
		 * Hash and escape <code> elements that should not be parsed as markdown
		 */
		showdown.subParser('hashCodeTags', function (text, options, globals) {
		  text = globals.converter._dispatch('hashCodeTags.before', text, options, globals);

		  var repFunc = function (wholeMatch, match, left, right) {
		    var codeblock = left + showdown.subParser('encodeCode')(match, options, globals) + right;
		    return '¨C' + (globals.gHtmlSpans.push(codeblock) - 1) + 'C';
		  };

		  // Hash naked <code>
		  text = showdown.helper.replaceRecursiveRegExp(text, repFunc, '<code\\b[^>]*>', '</code>', 'gim');

		  text = globals.converter._dispatch('hashCodeTags.after', text, options, globals);
		  return text;
		});

		showdown.subParser('hashElement', function (text, options, globals) {

		  return function (wholeMatch, m1) {
		    var blockText = m1;

		    // Undo double lines
		    blockText = blockText.replace(/\n\n/g, '\n');
		    blockText = blockText.replace(/^\n/, '');

		    // strip trailing blank lines
		    blockText = blockText.replace(/\n+$/g, '');

		    // Replace the element text with a marker ("¨KxK" where x is its key)
		    blockText = '\n\n¨K' + (globals.gHtmlBlocks.push(blockText) - 1) + 'K\n\n';

		    return blockText;
		  };
		});

		showdown.subParser('hashHTMLBlocks', function (text, options, globals) {
		  text = globals.converter._dispatch('hashHTMLBlocks.before', text, options, globals);

		  var blockTags = [
		        'pre',
		        'div',
		        'h1',
		        'h2',
		        'h3',
		        'h4',
		        'h5',
		        'h6',
		        'blockquote',
		        'table',
		        'dl',
		        'ol',
		        'ul',
		        'script',
		        'noscript',
		        'form',
		        'fieldset',
		        'iframe',
		        'math',
		        'style',
		        'section',
		        'header',
		        'footer',
		        'nav',
		        'article',
		        'aside',
		        'address',
		        'audio',
		        'canvas',
		        'figure',
		        'hgroup',
		        'output',
		        'video',
		        'p'
		      ],
		      repFunc = function (wholeMatch, match, left, right) {
		        var txt = wholeMatch;
		        // check if this html element is marked as markdown
		        // if so, it's contents should be parsed as markdown
		        if (left.search(/\bmarkdown\b/) !== -1) {
		          txt = left + globals.converter.makeHtml(match) + right;
		        }
		        return '\n\n¨K' + (globals.gHtmlBlocks.push(txt) - 1) + 'K\n\n';
		      };

		  if (options.backslashEscapesHTMLTags) {
		    // encode backslash escaped HTML tags
		    text = text.replace(/\\<(\/?[^>]+?)>/g, function (wm, inside) {
		      return '&lt;' + inside + '&gt;';
		    });
		  }

		  // hash HTML Blocks
		  for (var i = 0; i < blockTags.length; ++i) {

		    var opTagPos,
		        rgx1     = new RegExp('^ {0,3}(<' + blockTags[i] + '\\b[^>]*>)', 'im'),
		        patLeft  = '<' + blockTags[i] + '\\b[^>]*>',
		        patRight = '</' + blockTags[i] + '>';
		    // 1. Look for the first position of the first opening HTML tag in the text
		    while ((opTagPos = showdown.helper.regexIndexOf(text, rgx1)) !== -1) {

		      // if the HTML tag is \ escaped, we need to escape it and break


		      //2. Split the text in that position
		      var subTexts = showdown.helper.splitAtIndex(text, opTagPos),
		          //3. Match recursively
		          newSubText1 = showdown.helper.replaceRecursiveRegExp(subTexts[1], repFunc, patLeft, patRight, 'im');

		      // prevent an infinite loop
		      if (newSubText1 === subTexts[1]) {
		        break;
		      }
		      text = subTexts[0].concat(newSubText1);
		    }
		  }
		  // HR SPECIAL CASE
		  text = text.replace(/(\n {0,3}(<(hr)\b([^<>])*?\/?>)[ \t]*(?=\n{2,}))/g,
		    showdown.subParser('hashElement')(text, options, globals));

		  // Special case for standalone HTML comments
		  text = showdown.helper.replaceRecursiveRegExp(text, function (txt) {
		    return '\n\n¨K' + (globals.gHtmlBlocks.push(txt) - 1) + 'K\n\n';
		  }, '^ {0,3}<!--', '-->', 'gm');

		  // PHP and ASP-style processor instructions (<?...?> and <%...%>)
		  text = text.replace(/(?:\n\n)( {0,3}(?:<([?%])[^\r]*?\2>)[ \t]*(?=\n{2,}))/g,
		    showdown.subParser('hashElement')(text, options, globals));

		  text = globals.converter._dispatch('hashHTMLBlocks.after', text, options, globals);
		  return text;
		});

		/**
		 * Hash span elements that should not be parsed as markdown
		 */
		showdown.subParser('hashHTMLSpans', function (text, options, globals) {
		  text = globals.converter._dispatch('hashHTMLSpans.before', text, options, globals);

		  function hashHTMLSpan (html) {
		    return '¨C' + (globals.gHtmlSpans.push(html) - 1) + 'C';
		  }

		  // Hash Self Closing tags
		  text = text.replace(/<[^>]+?\/>/gi, function (wm) {
		    return hashHTMLSpan(wm);
		  });

		  // Hash tags without properties
		  text = text.replace(/<([^>]+?)>[\s\S]*?<\/\1>/g, function (wm) {
		    return hashHTMLSpan(wm);
		  });

		  // Hash tags with properties
		  text = text.replace(/<([^>]+?)\s[^>]+?>[\s\S]*?<\/\1>/g, function (wm) {
		    return hashHTMLSpan(wm);
		  });

		  // Hash self closing tags without />
		  text = text.replace(/<[^>]+?>/gi, function (wm) {
		    return hashHTMLSpan(wm);
		  });

		  /*showdown.helper.matchRecursiveRegExp(text, '<code\\b[^>]*>', '</code>', 'gi');*/

		  text = globals.converter._dispatch('hashHTMLSpans.after', text, options, globals);
		  return text;
		});

		/**
		 * Unhash HTML spans
		 */
		showdown.subParser('unhashHTMLSpans', function (text, options, globals) {
		  text = globals.converter._dispatch('unhashHTMLSpans.before', text, options, globals);

		  for (var i = 0; i < globals.gHtmlSpans.length; ++i) {
		    var repText = globals.gHtmlSpans[i],
		        // limiter to prevent infinite loop (assume 10 as limit for recurse)
		        limit = 0;

		    while (/¨C(\d+)C/.test(repText)) {
		      var num = RegExp.$1;
		      repText = repText.replace('¨C' + num + 'C', globals.gHtmlSpans[num]);
		      if (limit === 10) {
		        console.error('maximum nesting of 10 spans reached!!!');
		        break;
		      }
		      ++limit;
		    }
		    text = text.replace('¨C' + i + 'C', repText);
		  }

		  text = globals.converter._dispatch('unhashHTMLSpans.after', text, options, globals);
		  return text;
		});

		/**
		 * Hash and escape <pre><code> elements that should not be parsed as markdown
		 */
		showdown.subParser('hashPreCodeTags', function (text, options, globals) {
		  text = globals.converter._dispatch('hashPreCodeTags.before', text, options, globals);

		  var repFunc = function (wholeMatch, match, left, right) {
		    // encode html entities
		    var codeblock = left + showdown.subParser('encodeCode')(match, options, globals) + right;
		    return '\n\n¨G' + (globals.ghCodeBlocks.push({text: wholeMatch, codeblock: codeblock}) - 1) + 'G\n\n';
		  };

		  // Hash <pre><code>
		  text = showdown.helper.replaceRecursiveRegExp(text, repFunc, '^ {0,3}<pre\\b[^>]*>\\s*<code\\b[^>]*>', '^ {0,3}</code>\\s*</pre>', 'gim');

		  text = globals.converter._dispatch('hashPreCodeTags.after', text, options, globals);
		  return text;
		});

		showdown.subParser('headers', function (text, options, globals) {

		  text = globals.converter._dispatch('headers.before', text, options, globals);

		  var headerLevelStart = (isNaN(parseInt(options.headerLevelStart))) ? 1 : parseInt(options.headerLevelStart),

		      // Set text-style headers:
		      //	Header 1
		      //	========
		      //
		      //	Header 2
		      //	--------
		      //
		      setextRegexH1 = (options.smoothLivePreview) ? /^(.+)[ \t]*\n={2,}[ \t]*\n+/gm : /^(.+)[ \t]*\n=+[ \t]*\n+/gm,
		      setextRegexH2 = (options.smoothLivePreview) ? /^(.+)[ \t]*\n-{2,}[ \t]*\n+/gm : /^(.+)[ \t]*\n-+[ \t]*\n+/gm;

		  text = text.replace(setextRegexH1, function (wholeMatch, m1) {

		    var spanGamut = showdown.subParser('spanGamut')(m1, options, globals),
		        hID = (options.noHeaderId) ? '' : ' id="' + headerId(m1) + '"',
		        hLevel = headerLevelStart,
		        hashBlock = '<h' + hLevel + hID + '>' + spanGamut + '</h' + hLevel + '>';
		    return showdown.subParser('hashBlock')(hashBlock, options, globals);
		  });

		  text = text.replace(setextRegexH2, function (matchFound, m1) {
		    var spanGamut = showdown.subParser('spanGamut')(m1, options, globals),
		        hID = (options.noHeaderId) ? '' : ' id="' + headerId(m1) + '"',
		        hLevel = headerLevelStart + 1,
		        hashBlock = '<h' + hLevel + hID + '>' + spanGamut + '</h' + hLevel + '>';
		    return showdown.subParser('hashBlock')(hashBlock, options, globals);
		  });

		  // atx-style headers:
		  //  # Header 1
		  //  ## Header 2
		  //  ## Header 2 with closing hashes ##
		  //  ...
		  //  ###### Header 6
		  //
		  var atxStyle = (options.requireSpaceBeforeHeadingText) ? /^(#{1,6})[ \t]+(.+?)[ \t]*#*\n+/gm : /^(#{1,6})[ \t]*(.+?)[ \t]*#*\n+/gm;

		  text = text.replace(atxStyle, function (wholeMatch, m1, m2) {
		    var hText = m2;
		    if (options.customizedHeaderId) {
		      hText = m2.replace(/\s?\{([^{]+?)}\s*$/, '');
		    }

		    var span = showdown.subParser('spanGamut')(hText, options, globals),
		        hID = (options.noHeaderId) ? '' : ' id="' + headerId(m2) + '"',
		        hLevel = headerLevelStart - 1 + m1.length,
		        header = '<h' + hLevel + hID + '>' + span + '</h' + hLevel + '>';

		    return showdown.subParser('hashBlock')(header, options, globals);
		  });

		  function headerId (m) {
		    var title,
		        prefix;

		    // It is separate from other options to allow combining prefix and customized
		    if (options.customizedHeaderId) {
		      var match = m.match(/\{([^{]+?)}\s*$/);
		      if (match && match[1]) {
		        m = match[1];
		      }
		    }

		    title = m;

		    // Prefix id to prevent causing inadvertent pre-existing style matches.
		    if (showdown.helper.isString(options.prefixHeaderId)) {
		      prefix = options.prefixHeaderId;
		    } else if (options.prefixHeaderId === true) {
		      prefix = 'section-';
		    } else {
		      prefix = '';
		    }

		    if (!options.rawPrefixHeaderId) {
		      title = prefix + title;
		    }

		    if (options.ghCompatibleHeaderId) {
		      title = title
		        .replace(/ /g, '-')
		        // replace previously escaped chars (&, ¨ and $)
		        .replace(/&amp;/g, '')
		        .replace(/¨T/g, '')
		        .replace(/¨D/g, '')
		        // replace rest of the chars (&~$ are repeated as they might have been escaped)
		        // borrowed from github's redcarpet (some they should produce similar results)
		        .replace(/[&+$,\/:;=?@"#{}|^¨~\[\]`\\*)(%.!'<>]/g, '')
		        .toLowerCase();
		    } else if (options.rawHeaderId) {
		      title = title
		        .replace(/ /g, '-')
		        // replace previously escaped chars (&, ¨ and $)
		        .replace(/&amp;/g, '&')
		        .replace(/¨T/g, '¨')
		        .replace(/¨D/g, '$')
		        // replace " and '
		        .replace(/["']/g, '-')
		        .toLowerCase();
		    } else {
		      title = title
		        .replace(/[^\w]/g, '')
		        .toLowerCase();
		    }

		    if (options.rawPrefixHeaderId) {
		      title = prefix + title;
		    }

		    if (globals.hashLinkCounts[title]) {
		      title = title + '-' + (globals.hashLinkCounts[title]++);
		    } else {
		      globals.hashLinkCounts[title] = 1;
		    }
		    return title;
		  }

		  text = globals.converter._dispatch('headers.after', text, options, globals);
		  return text;
		});

		/**
		 * Turn Markdown link shortcuts into XHTML <a> tags.
		 */
		showdown.subParser('horizontalRule', function (text, options, globals) {
		  text = globals.converter._dispatch('horizontalRule.before', text, options, globals);

		  var key = showdown.subParser('hashBlock')('<hr />', options, globals);
		  text = text.replace(/^ {0,2}( ?-){3,}[ \t]*$/gm, key);
		  text = text.replace(/^ {0,2}( ?\*){3,}[ \t]*$/gm, key);
		  text = text.replace(/^ {0,2}( ?_){3,}[ \t]*$/gm, key);

		  text = globals.converter._dispatch('horizontalRule.after', text, options, globals);
		  return text;
		});

		/**
		 * Turn Markdown image shortcuts into <img> tags.
		 */
		showdown.subParser('images', function (text, options, globals) {

		  text = globals.converter._dispatch('images.before', text, options, globals);

		  var inlineRegExp      = /!\[([^\]]*?)][ \t]*()\([ \t]?<?([\S]+?(?:\([\S]*?\)[\S]*?)?)>?(?: =([*\d]+[A-Za-z%]{0,4})x([*\d]+[A-Za-z%]{0,4}))?[ \t]*(?:(["'])([^"]*?)\6)?[ \t]?\)/g,
		      crazyRegExp       = /!\[([^\]]*?)][ \t]*()\([ \t]?<([^>]*)>(?: =([*\d]+[A-Za-z%]{0,4})x([*\d]+[A-Za-z%]{0,4}))?[ \t]*(?:(?:(["'])([^"]*?)\6))?[ \t]?\)/g,
		      base64RegExp      = /!\[([^\]]*?)][ \t]*()\([ \t]?<?(data:.+?\/.+?;base64,[A-Za-z0-9+/=\n]+?)>?(?: =([*\d]+[A-Za-z%]{0,4})x([*\d]+[A-Za-z%]{0,4}))?[ \t]*(?:(["'])([^"]*?)\6)?[ \t]?\)/g,
		      referenceRegExp   = /!\[([^\]]*?)] ?(?:\n *)?\[([\s\S]*?)]()()()()()/g,
		      refShortcutRegExp = /!\[([^\[\]]+)]()()()()()/g;

		  function writeImageTagBase64 (wholeMatch, altText, linkId, url, width, height, m5, title) {
		    url = url.replace(/\s/g, '');
		    return writeImageTag (wholeMatch, altText, linkId, url, width, height, m5, title);
		  }

		  function writeImageTag (wholeMatch, altText, linkId, url, width, height, m5, title) {

		    var gUrls   = globals.gUrls,
		        gTitles = globals.gTitles,
		        gDims   = globals.gDimensions;

		    linkId = linkId.toLowerCase();

		    if (!title) {
		      title = '';
		    }
		    // Special case for explicit empty url
		    if (wholeMatch.search(/\(<?\s*>? ?(['"].*['"])?\)$/m) > -1) {
		      url = '';

		    } else if (url === '' || url === null) {
		      if (linkId === '' || linkId === null) {
		        // lower-case and turn embedded newlines into spaces
		        linkId = altText.toLowerCase().replace(/ ?\n/g, ' ');
		      }
		      url = '#' + linkId;

		      if (!showdown.helper.isUndefined(gUrls[linkId])) {
		        url = gUrls[linkId];
		        if (!showdown.helper.isUndefined(gTitles[linkId])) {
		          title = gTitles[linkId];
		        }
		        if (!showdown.helper.isUndefined(gDims[linkId])) {
		          width = gDims[linkId].width;
		          height = gDims[linkId].height;
		        }
		      } else {
		        return wholeMatch;
		      }
		    }

		    altText = altText
		      .replace(/"/g, '&quot;')
		    //altText = showdown.helper.escapeCharacters(altText, '*_', false);
		      .replace(showdown.helper.regexes.asteriskDashAndColon, showdown.helper.escapeCharactersCallback);
		    //url = showdown.helper.escapeCharacters(url, '*_', false);
		    url = url.replace(showdown.helper.regexes.asteriskDashAndColon, showdown.helper.escapeCharactersCallback);
		    var result = '<img src="' + url + '" alt="' + altText + '"';

		    if (title && showdown.helper.isString(title)) {
		      title = title
		        .replace(/"/g, '&quot;')
		      //title = showdown.helper.escapeCharacters(title, '*_', false);
		        .replace(showdown.helper.regexes.asteriskDashAndColon, showdown.helper.escapeCharactersCallback);
		      result += ' title="' + title + '"';
		    }

		    if (width && height) {
		      width  = (width === '*') ? 'auto' : width;
		      height = (height === '*') ? 'auto' : height;

		      result += ' width="' + width + '"';
		      result += ' height="' + height + '"';
		    }

		    result += ' />';

		    return result;
		  }

		  // First, handle reference-style labeled images: ![alt text][id]
		  text = text.replace(referenceRegExp, writeImageTag);

		  // Next, handle inline images:  ![alt text](url =<width>x<height> "optional title")

		  // base64 encoded images
		  text = text.replace(base64RegExp, writeImageTagBase64);

		  // cases with crazy urls like ./image/cat1).png
		  text = text.replace(crazyRegExp, writeImageTag);

		  // normal cases
		  text = text.replace(inlineRegExp, writeImageTag);

		  // handle reference-style shortcuts: ![img text]
		  text = text.replace(refShortcutRegExp, writeImageTag);

		  text = globals.converter._dispatch('images.after', text, options, globals);
		  return text;
		});

		showdown.subParser('italicsAndBold', function (text, options, globals) {

		  text = globals.converter._dispatch('italicsAndBold.before', text, options, globals);

		  // it's faster to have 3 separate regexes for each case than have just one
		  // because of backtracing, in some cases, it could lead to an exponential effect
		  // called "catastrophic backtrace". Ominous!

		  function parseInside (txt, left, right) {
		    /*
		    if (options.simplifiedAutoLink) {
		      txt = showdown.subParser('simplifiedAutoLinks')(txt, options, globals);
		    }
		    */
		    return left + txt + right;
		  }

		  // Parse underscores
		  if (options.literalMidWordUnderscores) {
		    text = text.replace(/\b___(\S[\s\S]*?)___\b/g, function (wm, txt) {
		      return parseInside (txt, '<strong><em>', '</em></strong>');
		    });
		    text = text.replace(/\b__(\S[\s\S]*?)__\b/g, function (wm, txt) {
		      return parseInside (txt, '<strong>', '</strong>');
		    });
		    text = text.replace(/\b_(\S[\s\S]*?)_\b/g, function (wm, txt) {
		      return parseInside (txt, '<em>', '</em>');
		    });
		  } else {
		    text = text.replace(/___(\S[\s\S]*?)___/g, function (wm, m) {
		      return (/\S$/.test(m)) ? parseInside (m, '<strong><em>', '</em></strong>') : wm;
		    });
		    text = text.replace(/__(\S[\s\S]*?)__/g, function (wm, m) {
		      return (/\S$/.test(m)) ? parseInside (m, '<strong>', '</strong>') : wm;
		    });
		    text = text.replace(/_([^\s_][\s\S]*?)_/g, function (wm, m) {
		      // !/^_[^_]/.test(m) - test if it doesn't start with __ (since it seems redundant, we removed it)
		      return (/\S$/.test(m)) ? parseInside (m, '<em>', '</em>') : wm;
		    });
		  }

		  // Now parse asterisks
		  if (options.literalMidWordAsterisks) {
		    text = text.replace(/([^*]|^)\B\*\*\*(\S[\s\S]*?)\*\*\*\B(?!\*)/g, function (wm, lead, txt) {
		      return parseInside (txt, lead + '<strong><em>', '</em></strong>');
		    });
		    text = text.replace(/([^*]|^)\B\*\*(\S[\s\S]*?)\*\*\B(?!\*)/g, function (wm, lead, txt) {
		      return parseInside (txt, lead + '<strong>', '</strong>');
		    });
		    text = text.replace(/([^*]|^)\B\*(\S[\s\S]*?)\*\B(?!\*)/g, function (wm, lead, txt) {
		      return parseInside (txt, lead + '<em>', '</em>');
		    });
		  } else {
		    text = text.replace(/\*\*\*(\S[\s\S]*?)\*\*\*/g, function (wm, m) {
		      return (/\S$/.test(m)) ? parseInside (m, '<strong><em>', '</em></strong>') : wm;
		    });
		    text = text.replace(/\*\*(\S[\s\S]*?)\*\*/g, function (wm, m) {
		      return (/\S$/.test(m)) ? parseInside (m, '<strong>', '</strong>') : wm;
		    });
		    text = text.replace(/\*([^\s*][\s\S]*?)\*/g, function (wm, m) {
		      // !/^\*[^*]/.test(m) - test if it doesn't start with ** (since it seems redundant, we removed it)
		      return (/\S$/.test(m)) ? parseInside (m, '<em>', '</em>') : wm;
		    });
		  }


		  text = globals.converter._dispatch('italicsAndBold.after', text, options, globals);
		  return text;
		});

		/**
		 * Form HTML ordered (numbered) and unordered (bulleted) lists.
		 */
		showdown.subParser('lists', function (text, options, globals) {

		  /**
		   * Process the contents of a single ordered or unordered list, splitting it
		   * into individual list items.
		   * @param {string} listStr
		   * @param {boolean} trimTrailing
		   * @returns {string}
		   */
		  function processListItems (listStr, trimTrailing) {
		    // The $g_list_level global keeps track of when we're inside a list.
		    // Each time we enter a list, we increment it; when we leave a list,
		    // we decrement. If it's zero, we're not in a list anymore.
		    //
		    // We do this because when we're not inside a list, we want to treat
		    // something like this:
		    //
		    //    I recommend upgrading to version
		    //    8. Oops, now this line is treated
		    //    as a sub-list.
		    //
		    // As a single paragraph, despite the fact that the second line starts
		    // with a digit-period-space sequence.
		    //
		    // Whereas when we're inside a list (or sub-list), that line will be
		    // treated as the start of a sub-list. What a kludge, huh? This is
		    // an aspect of Markdown's syntax that's hard to parse perfectly
		    // without resorting to mind-reading. Perhaps the solution is to
		    // change the syntax rules such that sub-lists must start with a
		    // starting cardinal number; e.g. "1." or "a.".
		    globals.gListLevel++;

		    // trim trailing blank lines:
		    listStr = listStr.replace(/\n{2,}$/, '\n');

		    // attacklab: add sentinel to emulate \z
		    listStr += '¨0';

		    var rgx = /(\n)?(^ {0,3})([*+-]|\d+[.])[ \t]+((\[(x|X| )?])?[ \t]*[^\r]+?(\n{1,2}))(?=\n*(¨0| {0,3}([*+-]|\d+[.])[ \t]+))/gm,
		        isParagraphed = (/\n[ \t]*\n(?!¨0)/.test(listStr));

		    // Since version 1.5, nesting sublists requires 4 spaces (or 1 tab) indentation,
		    // which is a syntax breaking change
		    // activating this option reverts to old behavior
		    if (options.disableForced4SpacesIndentedSublists) {
		      rgx = /(\n)?(^ {0,3})([*+-]|\d+[.])[ \t]+((\[(x|X| )?])?[ \t]*[^\r]+?(\n{1,2}))(?=\n*(¨0|\2([*+-]|\d+[.])[ \t]+))/gm;
		    }

		    listStr = listStr.replace(rgx, function (wholeMatch, m1, m2, m3, m4, taskbtn, checked) {
		      checked = (checked && checked.trim() !== '');

		      var item = showdown.subParser('outdent')(m4, options, globals),
		          bulletStyle = '';

		      // Support for github tasklists
		      if (taskbtn && options.tasklists) {
		        bulletStyle = ' class="task-list-item" style="list-style-type: none;"';
		        item = item.replace(/^[ \t]*\[(x|X| )?]/m, function () {
		          var otp = '<input type="checkbox" disabled style="margin: 0px 0.35em 0.25em -1.6em; vertical-align: middle;"';
		          if (checked) {
		            otp += ' checked';
		          }
		          otp += '>';
		          return otp;
		        });
		      }

		      // ISSUE #312
		      // This input: - - - a
		      // causes trouble to the parser, since it interprets it as:
		      // <ul><li><li><li>a</li></li></li></ul>
		      // instead of:
		      // <ul><li>- - a</li></ul>
		      // So, to prevent it, we will put a marker (¨A)in the beginning of the line
		      // Kind of hackish/monkey patching, but seems more effective than overcomplicating the list parser
		      item = item.replace(/^([-*+]|\d\.)[ \t]+[\S\n ]*/g, function (wm2) {
		        return '¨A' + wm2;
		      });

		      // m1 - Leading line or
		      // Has a double return (multi paragraph) or
		      // Has sublist
		      if (m1 || (item.search(/\n{2,}/) > -1)) {
		        item = showdown.subParser('githubCodeBlocks')(item, options, globals);
		        item = showdown.subParser('blockGamut')(item, options, globals);
		      } else {
		        // Recursion for sub-lists:
		        item = showdown.subParser('lists')(item, options, globals);
		        item = item.replace(/\n$/, ''); // chomp(item)
		        item = showdown.subParser('hashHTMLBlocks')(item, options, globals);

		        // Colapse double linebreaks
		        item = item.replace(/\n\n+/g, '\n\n');
		        if (isParagraphed) {
		          item = showdown.subParser('paragraphs')(item, options, globals);
		        } else {
		          item = showdown.subParser('spanGamut')(item, options, globals);
		        }
		      }

		      // now we need to remove the marker (¨A)
		      item = item.replace('¨A', '');
		      // we can finally wrap the line in list item tags
		      item =  '<li' + bulletStyle + '>' + item + '</li>\n';

		      return item;
		    });

		    // attacklab: strip sentinel
		    listStr = listStr.replace(/¨0/g, '');

		    globals.gListLevel--;

		    if (trimTrailing) {
		      listStr = listStr.replace(/\s+$/, '');
		    }

		    return listStr;
		  }

		  function styleStartNumber (list, listType) {
		    // check if ol and starts by a number different than 1
		    if (listType === 'ol') {
		      var res = list.match(/^ *(\d+)\./);
		      if (res && res[1] !== '1') {
		        return ' start="' + res[1] + '"';
		      }
		    }
		    return '';
		  }

		  /**
		   * Check and parse consecutive lists (better fix for issue #142)
		   * @param {string} list
		   * @param {string} listType
		   * @param {boolean} trimTrailing
		   * @returns {string}
		   */
		  function parseConsecutiveLists (list, listType, trimTrailing) {
		    // check if we caught 2 or more consecutive lists by mistake
		    // we use the counterRgx, meaning if listType is UL we look for OL and vice versa
		    var olRgx = (options.disableForced4SpacesIndentedSublists) ? /^ ?\d+\.[ \t]/gm : /^ {0,3}\d+\.[ \t]/gm,
		        ulRgx = (options.disableForced4SpacesIndentedSublists) ? /^ ?[*+-][ \t]/gm : /^ {0,3}[*+-][ \t]/gm,
		        counterRxg = (listType === 'ul') ? olRgx : ulRgx,
		        result = '';

		    if (list.search(counterRxg) !== -1) {
		      (function parseCL (txt) {
		        var pos = txt.search(counterRxg),
		            style = styleStartNumber(list, listType);
		        if (pos !== -1) {
		          // slice
		          result += '\n\n<' + listType + style + '>\n' + processListItems(txt.slice(0, pos), !!trimTrailing) + '</' + listType + '>\n';

		          // invert counterType and listType
		          listType = (listType === 'ul') ? 'ol' : 'ul';
		          counterRxg = (listType === 'ul') ? olRgx : ulRgx;

		          //recurse
		          parseCL(txt.slice(pos));
		        } else {
		          result += '\n\n<' + listType + style + '>\n' + processListItems(txt, !!trimTrailing) + '</' + listType + '>\n';
		        }
		      })(list);
		    } else {
		      var style = styleStartNumber(list, listType);
		      result = '\n\n<' + listType + style + '>\n' + processListItems(list, !!trimTrailing) + '</' + listType + '>\n';
		    }

		    return result;
		  }

		  /** Start of list parsing **/
		  text = globals.converter._dispatch('lists.before', text, options, globals);
		  // add sentinel to hack around khtml/safari bug:
		  // http://bugs.webkit.org/show_bug.cgi?id=11231
		  text += '¨0';

		  if (globals.gListLevel) {
		    text = text.replace(/^(( {0,3}([*+-]|\d+[.])[ \t]+)[^\r]+?(¨0|\n{2,}(?=\S)(?![ \t]*(?:[*+-]|\d+[.])[ \t]+)))/gm,
		      function (wholeMatch, list, m2) {
		        var listType = (m2.search(/[*+-]/g) > -1) ? 'ul' : 'ol';
		        return parseConsecutiveLists(list, listType, true);
		      }
		    );
		  } else {
		    text = text.replace(/(\n\n|^\n?)(( {0,3}([*+-]|\d+[.])[ \t]+)[^\r]+?(¨0|\n{2,}(?=\S)(?![ \t]*(?:[*+-]|\d+[.])[ \t]+)))/gm,
		      function (wholeMatch, m1, list, m3) {
		        var listType = (m3.search(/[*+-]/g) > -1) ? 'ul' : 'ol';
		        return parseConsecutiveLists(list, listType, false);
		      }
		    );
		  }

		  // strip sentinel
		  text = text.replace(/¨0/, '');
		  text = globals.converter._dispatch('lists.after', text, options, globals);
		  return text;
		});

		/**
		 * Parse metadata at the top of the document
		 */
		showdown.subParser('metadata', function (text, options, globals) {

		  if (!options.metadata) {
		    return text;
		  }

		  text = globals.converter._dispatch('metadata.before', text, options, globals);

		  function parseMetadataContents (content) {
		    // raw is raw so it's not changed in any way
		    globals.metadata.raw = content;

		    // escape chars forbidden in html attributes
		    // double quotes
		    content = content
		      // ampersand first
		      .replace(/&/g, '&amp;')
		      // double quotes
		      .replace(/"/g, '&quot;');

		    content = content.replace(/\n {4}/g, ' ');
		    content.replace(/^([\S ]+): +([\s\S]+?)$/gm, function (wm, key, value) {
		      globals.metadata.parsed[key] = value;
		      return '';
		    });
		  }

		  text = text.replace(/^\s*«««+(\S*?)\n([\s\S]+?)\n»»»+\n/, function (wholematch, format, content) {
		    parseMetadataContents(content);
		    return '¨M';
		  });

		  text = text.replace(/^\s*---+(\S*?)\n([\s\S]+?)\n---+\n/, function (wholematch, format, content) {
		    if (format) {
		      globals.metadata.format = format;
		    }
		    parseMetadataContents(content);
		    return '¨M';
		  });

		  text = text.replace(/¨M/g, '');

		  text = globals.converter._dispatch('metadata.after', text, options, globals);
		  return text;
		});

		/**
		 * Remove one level of line-leading tabs or spaces
		 */
		showdown.subParser('outdent', function (text, options, globals) {
		  text = globals.converter._dispatch('outdent.before', text, options, globals);

		  // attacklab: hack around Konqueror 3.5.4 bug:
		  // "----------bug".replace(/^-/g,"") == "bug"
		  text = text.replace(/^(\t|[ ]{1,4})/gm, '¨0'); // attacklab: g_tab_width

		  // attacklab: clean up hack
		  text = text.replace(/¨0/g, '');

		  text = globals.converter._dispatch('outdent.after', text, options, globals);
		  return text;
		});

		/**
		 *
		 */
		showdown.subParser('paragraphs', function (text, options, globals) {

		  text = globals.converter._dispatch('paragraphs.before', text, options, globals);
		  // Strip leading and trailing lines:
		  text = text.replace(/^\n+/g, '');
		  text = text.replace(/\n+$/g, '');

		  var grafs = text.split(/\n{2,}/g),
		      grafsOut = [],
		      end = grafs.length; // Wrap <p> tags

		  for (var i = 0; i < end; i++) {
		    var str = grafs[i];
		    // if this is an HTML marker, copy it
		    if (str.search(/¨(K|G)(\d+)\1/g) >= 0) {
		      grafsOut.push(str);

		    // test for presence of characters to prevent empty lines being parsed
		    // as paragraphs (resulting in undesired extra empty paragraphs)
		    } else if (str.search(/\S/) >= 0) {
		      str = showdown.subParser('spanGamut')(str, options, globals);
		      str = str.replace(/^([ \t]*)/g, '<p>');
		      str += '</p>';
		      grafsOut.push(str);
		    }
		  }

		  /** Unhashify HTML blocks */
		  end = grafsOut.length;
		  for (i = 0; i < end; i++) {
		    var blockText = '',
		        grafsOutIt = grafsOut[i],
		        codeFlag = false;
		    // if this is a marker for an html block...
		    // use RegExp.test instead of string.search because of QML bug
		    while (/¨(K|G)(\d+)\1/.test(grafsOutIt)) {
		      var delim = RegExp.$1,
		          num   = RegExp.$2;

		      if (delim === 'K') {
		        blockText = globals.gHtmlBlocks[num];
		      } else {
		        // we need to check if ghBlock is a false positive
		        if (codeFlag) {
		          // use encoded version of all text
		          blockText = showdown.subParser('encodeCode')(globals.ghCodeBlocks[num].text, options, globals);
		        } else {
		          blockText = globals.ghCodeBlocks[num].codeblock;
		        }
		      }
		      blockText = blockText.replace(/\$/g, '$$$$'); // Escape any dollar signs

		      grafsOutIt = grafsOutIt.replace(/(\n\n)?¨(K|G)\d+\2(\n\n)?/, blockText);
		      // Check if grafsOutIt is a pre->code
		      if (/^<pre\b[^>]*>\s*<code\b[^>]*>/.test(grafsOutIt)) {
		        codeFlag = true;
		      }
		    }
		    grafsOut[i] = grafsOutIt;
		  }
		  text = grafsOut.join('\n');
		  // Strip leading and trailing lines:
		  text = text.replace(/^\n+/g, '');
		  text = text.replace(/\n+$/g, '');
		  return globals.converter._dispatch('paragraphs.after', text, options, globals);
		});

		/**
		 * Run extension
		 */
		showdown.subParser('runExtension', function (ext, text, options, globals) {

		  if (ext.filter) {
		    text = ext.filter(text, globals.converter, options);

		  } else if (ext.regex) {
		    // TODO remove this when old extension loading mechanism is deprecated
		    var re = ext.regex;
		    if (!(re instanceof RegExp)) {
		      re = new RegExp(re, 'g');
		    }
		    text = text.replace(re, ext.replace);
		  }

		  return text;
		});

		/**
		 * These are all the transformations that occur *within* block-level
		 * tags like paragraphs, headers, and list items.
		 */
		showdown.subParser('spanGamut', function (text, options, globals) {

		  text = globals.converter._dispatch('spanGamut.before', text, options, globals);
		  text = showdown.subParser('codeSpans')(text, options, globals);
		  text = showdown.subParser('escapeSpecialCharsWithinTagAttributes')(text, options, globals);
		  text = showdown.subParser('encodeBackslashEscapes')(text, options, globals);

		  // Process anchor and image tags. Images must come first,
		  // because ![foo][f] looks like an anchor.
		  text = showdown.subParser('images')(text, options, globals);
		  text = showdown.subParser('anchors')(text, options, globals);

		  // Make links out of things like `<http://example.com/>`
		  // Must come after anchors, because you can use < and >
		  // delimiters in inline links like [this](<url>).
		  text = showdown.subParser('autoLinks')(text, options, globals);
		  text = showdown.subParser('simplifiedAutoLinks')(text, options, globals);
		  text = showdown.subParser('emoji')(text, options, globals);
		  text = showdown.subParser('underline')(text, options, globals);
		  text = showdown.subParser('italicsAndBold')(text, options, globals);
		  text = showdown.subParser('strikethrough')(text, options, globals);
		  text = showdown.subParser('ellipsis')(text, options, globals);

		  // we need to hash HTML tags inside spans
		  text = showdown.subParser('hashHTMLSpans')(text, options, globals);

		  // now we encode amps and angles
		  text = showdown.subParser('encodeAmpsAndAngles')(text, options, globals);

		  // Do hard breaks
		  if (options.simpleLineBreaks) {
		    // GFM style hard breaks
		    // only add line breaks if the text does not contain a block (special case for lists)
		    if (!/\n\n¨K/.test(text)) {
		      text = text.replace(/\n+/g, '<br />\n');
		    }
		  } else {
		    // Vanilla hard breaks
		    text = text.replace(/  +\n/g, '<br />\n');
		  }

		  text = globals.converter._dispatch('spanGamut.after', text, options, globals);
		  return text;
		});

		showdown.subParser('strikethrough', function (text, options, globals) {

		  function parseInside (txt) {
		    if (options.simplifiedAutoLink) {
		      txt = showdown.subParser('simplifiedAutoLinks')(txt, options, globals);
		    }
		    return '<del>' + txt + '</del>';
		  }

		  if (options.strikethrough) {
		    text = globals.converter._dispatch('strikethrough.before', text, options, globals);
		    text = text.replace(/(?:~){2}([\s\S]+?)(?:~){2}/g, function (wm, txt) { return parseInside(txt); });
		    text = globals.converter._dispatch('strikethrough.after', text, options, globals);
		  }

		  return text;
		});

		/**
		 * Strips link definitions from text, stores the URLs and titles in
		 * hash references.
		 * Link defs are in the form: ^[id]: url "optional title"
		 */
		showdown.subParser('stripLinkDefinitions', function (text, options, globals) {

		  var regex       = /^ {0,3}\[([^\]]+)]:[ \t]*\n?[ \t]*<?([^>\s]+)>?(?: =([*\d]+[A-Za-z%]{0,4})x([*\d]+[A-Za-z%]{0,4}))?[ \t]*\n?[ \t]*(?:(\n*)["|'(](.+?)["|')][ \t]*)?(?:\n+|(?=¨0))/gm,
		      base64Regex = /^ {0,3}\[([^\]]+)]:[ \t]*\n?[ \t]*<?(data:.+?\/.+?;base64,[A-Za-z0-9+/=\n]+?)>?(?: =([*\d]+[A-Za-z%]{0,4})x([*\d]+[A-Za-z%]{0,4}))?[ \t]*\n?[ \t]*(?:(\n*)["|'(](.+?)["|')][ \t]*)?(?:\n\n|(?=¨0)|(?=\n\[))/gm;

		  // attacklab: sentinel workarounds for lack of \A and \Z, safari\khtml bug
		  text += '¨0';

		  var replaceFunc = function (wholeMatch, linkId, url, width, height, blankLines, title) {

		    // if there aren't two instances of linkId it must not be a reference link so back out
		    linkId = linkId.toLowerCase();
		    if (text.toLowerCase().split(linkId).length - 1 < 2) {
		      return wholeMatch;
		    }
		    if (url.match(/^data:.+?\/.+?;base64,/)) {
		      // remove newlines
		      globals.gUrls[linkId] = url.replace(/\s/g, '');
		    } else {
		      globals.gUrls[linkId] = showdown.subParser('encodeAmpsAndAngles')(url, options, globals);  // Link IDs are case-insensitive
		    }

		    if (blankLines) {
		      // Oops, found blank lines, so it's not a title.
		      // Put back the parenthetical statement we stole.
		      return blankLines + title;

		    } else {
		      if (title) {
		        globals.gTitles[linkId] = title.replace(/"|'/g, '&quot;');
		      }
		      if (options.parseImgDimensions && width && height) {
		        globals.gDimensions[linkId] = {
		          width:  width,
		          height: height
		        };
		      }
		    }
		    // Completely remove the definition from the text
		    return '';
		  };

		  // first we try to find base64 link references
		  text = text.replace(base64Regex, replaceFunc);

		  text = text.replace(regex, replaceFunc);

		  // attacklab: strip sentinel
		  text = text.replace(/¨0/, '');

		  return text;
		});

		showdown.subParser('tables', function (text, options, globals) {

		  if (!options.tables) {
		    return text;
		  }

		  var tableRgx       = /^ {0,3}\|?.+\|.+\n {0,3}\|?[ \t]*:?[ \t]*(?:[-=]){2,}[ \t]*:?[ \t]*\|[ \t]*:?[ \t]*(?:[-=]){2,}[\s\S]+?(?:\n\n|¨0)/gm,
		      //singeColTblRgx = /^ {0,3}\|.+\|\n {0,3}\|[ \t]*:?[ \t]*(?:[-=]){2,}[ \t]*:?[ \t]*\|[ \t]*\n(?: {0,3}\|.+\|\n)+(?:\n\n|¨0)/gm;
		      singeColTblRgx = /^ {0,3}\|.+\|[ \t]*\n {0,3}\|[ \t]*:?[ \t]*(?:[-=]){2,}[ \t]*:?[ \t]*\|[ \t]*\n( {0,3}\|.+\|[ \t]*\n)*(?:\n|¨0)/gm;

		  function parseStyles (sLine) {
		    if (/^:[ \t]*--*$/.test(sLine)) {
		      return ' style="text-align:left;"';
		    } else if (/^--*[ \t]*:[ \t]*$/.test(sLine)) {
		      return ' style="text-align:right;"';
		    } else if (/^:[ \t]*--*[ \t]*:$/.test(sLine)) {
		      return ' style="text-align:center;"';
		    } else {
		      return '';
		    }
		  }

		  function parseHeaders (header, style) {
		    var id = '';
		    header = header.trim();
		    // support both tablesHeaderId and tableHeaderId due to error in documentation so we don't break backwards compatibility
		    if (options.tablesHeaderId || options.tableHeaderId) {
		      id = ' id="' + header.replace(/ /g, '_').toLowerCase() + '"';
		    }
		    header = showdown.subParser('spanGamut')(header, options, globals);

		    return '<th' + id + style + '>' + header + '</th>\n';
		  }

		  function parseCells (cell, style) {
		    var subText = showdown.subParser('spanGamut')(cell, options, globals);
		    return '<td' + style + '>' + subText + '</td>\n';
		  }

		  function buildTable (headers, cells) {
		    var tb = '<table>\n<thead>\n<tr>\n',
		        tblLgn = headers.length;

		    for (var i = 0; i < tblLgn; ++i) {
		      tb += headers[i];
		    }
		    tb += '</tr>\n</thead>\n<tbody>\n';

		    for (i = 0; i < cells.length; ++i) {
		      tb += '<tr>\n';
		      for (var ii = 0; ii < tblLgn; ++ii) {
		        tb += cells[i][ii];
		      }
		      tb += '</tr>\n';
		    }
		    tb += '</tbody>\n</table>\n';
		    return tb;
		  }

		  function parseTable (rawTable) {
		    var i, tableLines = rawTable.split('\n');

		    for (i = 0; i < tableLines.length; ++i) {
		      // strip wrong first and last column if wrapped tables are used
		      if (/^ {0,3}\|/.test(tableLines[i])) {
		        tableLines[i] = tableLines[i].replace(/^ {0,3}\|/, '');
		      }
		      if (/\|[ \t]*$/.test(tableLines[i])) {
		        tableLines[i] = tableLines[i].replace(/\|[ \t]*$/, '');
		      }
		      // parse code spans first, but we only support one line code spans
		      tableLines[i] = showdown.subParser('codeSpans')(tableLines[i], options, globals);
		    }

		    var rawHeaders = tableLines[0].split('|').map(function (s) { return s.trim();}),
		        rawStyles = tableLines[1].split('|').map(function (s) { return s.trim();}),
		        rawCells = [],
		        headers = [],
		        styles = [],
		        cells = [];

		    tableLines.shift();
		    tableLines.shift();

		    for (i = 0; i < tableLines.length; ++i) {
		      if (tableLines[i].trim() === '') {
		        continue;
		      }
		      rawCells.push(
		        tableLines[i]
		          .split('|')
		          .map(function (s) {
		            return s.trim();
		          })
		      );
		    }

		    if (rawHeaders.length < rawStyles.length) {
		      return rawTable;
		    }

		    for (i = 0; i < rawStyles.length; ++i) {
		      styles.push(parseStyles(rawStyles[i]));
		    }

		    for (i = 0; i < rawHeaders.length; ++i) {
		      if (showdown.helper.isUndefined(styles[i])) {
		        styles[i] = '';
		      }
		      headers.push(parseHeaders(rawHeaders[i], styles[i]));
		    }

		    for (i = 0; i < rawCells.length; ++i) {
		      var row = [];
		      for (var ii = 0; ii < headers.length; ++ii) {
		        if (showdown.helper.isUndefined(rawCells[i][ii])) ;
		        row.push(parseCells(rawCells[i][ii], styles[ii]));
		      }
		      cells.push(row);
		    }

		    return buildTable(headers, cells);
		  }

		  text = globals.converter._dispatch('tables.before', text, options, globals);

		  // find escaped pipe characters
		  text = text.replace(/\\(\|)/g, showdown.helper.escapeCharactersCallback);

		  // parse multi column tables
		  text = text.replace(tableRgx, parseTable);

		  // parse one column tables
		  text = text.replace(singeColTblRgx, parseTable);

		  text = globals.converter._dispatch('tables.after', text, options, globals);

		  return text;
		});

		showdown.subParser('underline', function (text, options, globals) {

		  if (!options.underline) {
		    return text;
		  }

		  text = globals.converter._dispatch('underline.before', text, options, globals);

		  if (options.literalMidWordUnderscores) {
		    text = text.replace(/\b___(\S[\s\S]*?)___\b/g, function (wm, txt) {
		      return '<u>' + txt + '</u>';
		    });
		    text = text.replace(/\b__(\S[\s\S]*?)__\b/g, function (wm, txt) {
		      return '<u>' + txt + '</u>';
		    });
		  } else {
		    text = text.replace(/___(\S[\s\S]*?)___/g, function (wm, m) {
		      return (/\S$/.test(m)) ? '<u>' + m + '</u>' : wm;
		    });
		    text = text.replace(/__(\S[\s\S]*?)__/g, function (wm, m) {
		      return (/\S$/.test(m)) ? '<u>' + m + '</u>' : wm;
		    });
		  }

		  // escape remaining underscores to prevent them being parsed by italic and bold
		  text = text.replace(/(_)/g, showdown.helper.escapeCharactersCallback);

		  text = globals.converter._dispatch('underline.after', text, options, globals);

		  return text;
		});

		/**
		 * Swap back in all the special characters we've hidden.
		 */
		showdown.subParser('unescapeSpecialChars', function (text, options, globals) {
		  text = globals.converter._dispatch('unescapeSpecialChars.before', text, options, globals);

		  text = text.replace(/¨E(\d+)E/g, function (wholeMatch, m1) {
		    var charCodeToReplace = parseInt(m1);
		    return String.fromCharCode(charCodeToReplace);
		  });

		  text = globals.converter._dispatch('unescapeSpecialChars.after', text, options, globals);
		  return text;
		});

		showdown.subParser('makeMarkdown.blockquote', function (node, globals) {

		  var txt = '';
		  if (node.hasChildNodes()) {
		    var children = node.childNodes,
		        childrenLength = children.length;

		    for (var i = 0; i < childrenLength; ++i) {
		      var innerTxt = showdown.subParser('makeMarkdown.node')(children[i], globals);

		      if (innerTxt === '') {
		        continue;
		      }
		      txt += innerTxt;
		    }
		  }
		  // cleanup
		  txt = txt.trim();
		  txt = '> ' + txt.split('\n').join('\n> ');
		  return txt;
		});

		showdown.subParser('makeMarkdown.codeBlock', function (node, globals) {

		  var lang = node.getAttribute('language'),
		      num  = node.getAttribute('precodenum');
		  return '```' + lang + '\n' + globals.preList[num] + '\n```';
		});

		showdown.subParser('makeMarkdown.codeSpan', function (node) {

		  return '`' + node.innerHTML + '`';
		});

		showdown.subParser('makeMarkdown.emphasis', function (node, globals) {

		  var txt = '';
		  if (node.hasChildNodes()) {
		    txt += '*';
		    var children = node.childNodes,
		        childrenLength = children.length;
		    for (var i = 0; i < childrenLength; ++i) {
		      txt += showdown.subParser('makeMarkdown.node')(children[i], globals);
		    }
		    txt += '*';
		  }
		  return txt;
		});

		showdown.subParser('makeMarkdown.header', function (node, globals, headerLevel) {

		  var headerMark = new Array(headerLevel + 1).join('#'),
		      txt = '';

		  if (node.hasChildNodes()) {
		    txt = headerMark + ' ';
		    var children = node.childNodes,
		        childrenLength = children.length;

		    for (var i = 0; i < childrenLength; ++i) {
		      txt += showdown.subParser('makeMarkdown.node')(children[i], globals);
		    }
		  }
		  return txt;
		});

		showdown.subParser('makeMarkdown.hr', function () {

		  return '---';
		});

		showdown.subParser('makeMarkdown.image', function (node) {

		  var txt = '';
		  if (node.hasAttribute('src')) {
		    txt += '![' + node.getAttribute('alt') + '](';
		    txt += '<' + node.getAttribute('src') + '>';
		    if (node.hasAttribute('width') && node.hasAttribute('height')) {
		      txt += ' =' + node.getAttribute('width') + 'x' + node.getAttribute('height');
		    }

		    if (node.hasAttribute('title')) {
		      txt += ' "' + node.getAttribute('title') + '"';
		    }
		    txt += ')';
		  }
		  return txt;
		});

		showdown.subParser('makeMarkdown.links', function (node, globals) {

		  var txt = '';
		  if (node.hasChildNodes() && node.hasAttribute('href')) {
		    var children = node.childNodes,
		        childrenLength = children.length;
		    txt = '[';
		    for (var i = 0; i < childrenLength; ++i) {
		      txt += showdown.subParser('makeMarkdown.node')(children[i], globals);
		    }
		    txt += '](';
		    txt += '<' + node.getAttribute('href') + '>';
		    if (node.hasAttribute('title')) {
		      txt += ' "' + node.getAttribute('title') + '"';
		    }
		    txt += ')';
		  }
		  return txt;
		});

		showdown.subParser('makeMarkdown.list', function (node, globals, type) {

		  var txt = '';
		  if (!node.hasChildNodes()) {
		    return '';
		  }
		  var listItems       = node.childNodes,
		      listItemsLenght = listItems.length,
		      listNum = node.getAttribute('start') || 1;

		  for (var i = 0; i < listItemsLenght; ++i) {
		    if (typeof listItems[i].tagName === 'undefined' || listItems[i].tagName.toLowerCase() !== 'li') {
		      continue;
		    }

		    // define the bullet to use in list
		    var bullet = '';
		    if (type === 'ol') {
		      bullet = listNum.toString() + '. ';
		    } else {
		      bullet = '- ';
		    }

		    // parse list item
		    txt += bullet + showdown.subParser('makeMarkdown.listItem')(listItems[i], globals);
		    ++listNum;
		  }

		  // add comment at the end to prevent consecutive lists to be parsed as one
		  txt += '\n<!-- -->\n';
		  return txt.trim();
		});

		showdown.subParser('makeMarkdown.listItem', function (node, globals) {

		  var listItemTxt = '';

		  var children = node.childNodes,
		      childrenLenght = children.length;

		  for (var i = 0; i < childrenLenght; ++i) {
		    listItemTxt += showdown.subParser('makeMarkdown.node')(children[i], globals);
		  }
		  // if it's only one liner, we need to add a newline at the end
		  if (!/\n$/.test(listItemTxt)) {
		    listItemTxt += '\n';
		  } else {
		    // it's multiparagraph, so we need to indent
		    listItemTxt = listItemTxt
		      .split('\n')
		      .join('\n    ')
		      .replace(/^ {4}$/gm, '')
		      .replace(/\n\n+/g, '\n\n');
		  }

		  return listItemTxt;
		});



		showdown.subParser('makeMarkdown.node', function (node, globals, spansOnly) {

		  spansOnly = spansOnly || false;

		  var txt = '';

		  // edge case of text without wrapper paragraph
		  if (node.nodeType === 3) {
		    return showdown.subParser('makeMarkdown.txt')(node, globals);
		  }

		  // HTML comment
		  if (node.nodeType === 8) {
		    return '<!--' + node.data + '-->\n\n';
		  }

		  // process only node elements
		  if (node.nodeType !== 1) {
		    return '';
		  }

		  var tagName = node.tagName.toLowerCase();

		  switch (tagName) {

		    //
		    // BLOCKS
		    //
		    case 'h1':
		      if (!spansOnly) { txt = showdown.subParser('makeMarkdown.header')(node, globals, 1) + '\n\n'; }
		      break;
		    case 'h2':
		      if (!spansOnly) { txt = showdown.subParser('makeMarkdown.header')(node, globals, 2) + '\n\n'; }
		      break;
		    case 'h3':
		      if (!spansOnly) { txt = showdown.subParser('makeMarkdown.header')(node, globals, 3) + '\n\n'; }
		      break;
		    case 'h4':
		      if (!spansOnly) { txt = showdown.subParser('makeMarkdown.header')(node, globals, 4) + '\n\n'; }
		      break;
		    case 'h5':
		      if (!spansOnly) { txt = showdown.subParser('makeMarkdown.header')(node, globals, 5) + '\n\n'; }
		      break;
		    case 'h6':
		      if (!spansOnly) { txt = showdown.subParser('makeMarkdown.header')(node, globals, 6) + '\n\n'; }
		      break;

		    case 'p':
		      if (!spansOnly) { txt = showdown.subParser('makeMarkdown.paragraph')(node, globals) + '\n\n'; }
		      break;

		    case 'blockquote':
		      if (!spansOnly) { txt = showdown.subParser('makeMarkdown.blockquote')(node, globals) + '\n\n'; }
		      break;

		    case 'hr':
		      if (!spansOnly) { txt = showdown.subParser('makeMarkdown.hr')(node, globals) + '\n\n'; }
		      break;

		    case 'ol':
		      if (!spansOnly) { txt = showdown.subParser('makeMarkdown.list')(node, globals, 'ol') + '\n\n'; }
		      break;

		    case 'ul':
		      if (!spansOnly) { txt = showdown.subParser('makeMarkdown.list')(node, globals, 'ul') + '\n\n'; }
		      break;

		    case 'precode':
		      if (!spansOnly) { txt = showdown.subParser('makeMarkdown.codeBlock')(node, globals) + '\n\n'; }
		      break;

		    case 'pre':
		      if (!spansOnly) { txt = showdown.subParser('makeMarkdown.pre')(node, globals) + '\n\n'; }
		      break;

		    case 'table':
		      if (!spansOnly) { txt = showdown.subParser('makeMarkdown.table')(node, globals) + '\n\n'; }
		      break;

		    //
		    // SPANS
		    //
		    case 'code':
		      txt = showdown.subParser('makeMarkdown.codeSpan')(node, globals);
		      break;

		    case 'em':
		    case 'i':
		      txt = showdown.subParser('makeMarkdown.emphasis')(node, globals);
		      break;

		    case 'strong':
		    case 'b':
		      txt = showdown.subParser('makeMarkdown.strong')(node, globals);
		      break;

		    case 'del':
		      txt = showdown.subParser('makeMarkdown.strikethrough')(node, globals);
		      break;

		    case 'a':
		      txt = showdown.subParser('makeMarkdown.links')(node, globals);
		      break;

		    case 'img':
		      txt = showdown.subParser('makeMarkdown.image')(node, globals);
		      break;

		    default:
		      txt = node.outerHTML + '\n\n';
		  }

		  // common normalization
		  // TODO eventually

		  return txt;
		});

		showdown.subParser('makeMarkdown.paragraph', function (node, globals) {

		  var txt = '';
		  if (node.hasChildNodes()) {
		    var children = node.childNodes,
		        childrenLength = children.length;
		    for (var i = 0; i < childrenLength; ++i) {
		      txt += showdown.subParser('makeMarkdown.node')(children[i], globals);
		    }
		  }

		  // some text normalization
		  txt = txt.trim();

		  return txt;
		});

		showdown.subParser('makeMarkdown.pre', function (node, globals) {

		  var num  = node.getAttribute('prenum');
		  return '<pre>' + globals.preList[num] + '</pre>';
		});

		showdown.subParser('makeMarkdown.strikethrough', function (node, globals) {

		  var txt = '';
		  if (node.hasChildNodes()) {
		    txt += '~~';
		    var children = node.childNodes,
		        childrenLength = children.length;
		    for (var i = 0; i < childrenLength; ++i) {
		      txt += showdown.subParser('makeMarkdown.node')(children[i], globals);
		    }
		    txt += '~~';
		  }
		  return txt;
		});

		showdown.subParser('makeMarkdown.strong', function (node, globals) {

		  var txt = '';
		  if (node.hasChildNodes()) {
		    txt += '**';
		    var children = node.childNodes,
		        childrenLength = children.length;
		    for (var i = 0; i < childrenLength; ++i) {
		      txt += showdown.subParser('makeMarkdown.node')(children[i], globals);
		    }
		    txt += '**';
		  }
		  return txt;
		});

		showdown.subParser('makeMarkdown.table', function (node, globals) {

		  var txt = '',
		      tableArray = [[], []],
		      headings   = node.querySelectorAll('thead>tr>th'),
		      rows       = node.querySelectorAll('tbody>tr'),
		      i, ii;
		  for (i = 0; i < headings.length; ++i) {
		    var headContent = showdown.subParser('makeMarkdown.tableCell')(headings[i], globals),
		        allign = '---';

		    if (headings[i].hasAttribute('style')) {
		      var style = headings[i].getAttribute('style').toLowerCase().replace(/\s/g, '');
		      switch (style) {
		        case 'text-align:left;':
		          allign = ':---';
		          break;
		        case 'text-align:right;':
		          allign = '---:';
		          break;
		        case 'text-align:center;':
		          allign = ':---:';
		          break;
		      }
		    }
		    tableArray[0][i] = headContent.trim();
		    tableArray[1][i] = allign;
		  }

		  for (i = 0; i < rows.length; ++i) {
		    var r = tableArray.push([]) - 1,
		        cols = rows[i].getElementsByTagName('td');

		    for (ii = 0; ii < headings.length; ++ii) {
		      var cellContent = ' ';
		      if (typeof cols[ii] !== 'undefined') {
		        cellContent = showdown.subParser('makeMarkdown.tableCell')(cols[ii], globals);
		      }
		      tableArray[r].push(cellContent);
		    }
		  }

		  var cellSpacesCount = 3;
		  for (i = 0; i < tableArray.length; ++i) {
		    for (ii = 0; ii < tableArray[i].length; ++ii) {
		      var strLen = tableArray[i][ii].length;
		      if (strLen > cellSpacesCount) {
		        cellSpacesCount = strLen;
		      }
		    }
		  }

		  for (i = 0; i < tableArray.length; ++i) {
		    for (ii = 0; ii < tableArray[i].length; ++ii) {
		      if (i === 1) {
		        if (tableArray[i][ii].slice(-1) === ':') {
		          tableArray[i][ii] = showdown.helper.padEnd(tableArray[i][ii].slice(-1), cellSpacesCount - 1, '-') + ':';
		        } else {
		          tableArray[i][ii] = showdown.helper.padEnd(tableArray[i][ii], cellSpacesCount, '-');
		        }
		      } else {
		        tableArray[i][ii] = showdown.helper.padEnd(tableArray[i][ii], cellSpacesCount);
		      }
		    }
		    txt += '| ' + tableArray[i].join(' | ') + ' |\n';
		  }

		  return txt.trim();
		});

		showdown.subParser('makeMarkdown.tableCell', function (node, globals) {

		  var txt = '';
		  if (!node.hasChildNodes()) {
		    return '';
		  }
		  var children = node.childNodes,
		      childrenLength = children.length;

		  for (var i = 0; i < childrenLength; ++i) {
		    txt += showdown.subParser('makeMarkdown.node')(children[i], globals, true);
		  }
		  return txt.trim();
		});

		showdown.subParser('makeMarkdown.txt', function (node) {

		  var txt = node.nodeValue;

		  // multiple spaces are collapsed
		  txt = txt.replace(/ +/g, ' ');

		  // replace the custom ¨NBSP; with a space
		  txt = txt.replace(/¨NBSP;/g, ' ');

		  // ", <, > and & should replace escaped html entities
		  txt = showdown.helper.unescapeHTMLEntities(txt);

		  // escape markdown magic characters
		  // emphasis, strong and strikethrough - can appear everywhere
		  // we also escape pipe (|) because of tables
		  // and escape ` because of code blocks and spans
		  txt = txt.replace(/([*_~|`])/g, '\\$1');

		  // escape > because of blockquotes
		  txt = txt.replace(/^(\s*)>/g, '\\$1>');

		  // hash character, only troublesome at the beginning of a line because of headers
		  txt = txt.replace(/^#/gm, '\\#');

		  // horizontal rules
		  txt = txt.replace(/^(\s*)([-=]{3,})(\s*)$/, '$1\\$2$3');

		  // dot, because of ordered lists, only troublesome at the beginning of a line when preceded by an integer
		  txt = txt.replace(/^( {0,3}\d+)\./gm, '$1\\.');

		  // +, * and -, at the beginning of a line becomes a list, so we need to escape them also (asterisk was already escaped)
		  txt = txt.replace(/^( {0,3})([+-])/gm, '$1\\$2');

		  // images and links, ] followed by ( is problematic, so we escape it
		  txt = txt.replace(/]([\s]*)\(/g, '\\]$1\\(');

		  // reference URIs must also be escaped
		  txt = txt.replace(/^ {0,3}\[([\S \t]*?)]:/gm, '\\[$1]:');

		  return txt;
		});

		var root = this;

		// AMD Loader
		if (module.exports) {
		  module.exports = showdown;

		// Regular Browser loader
		} else {
		  root.showdown = showdown;
		}
		}).call(showdown);

		
	} (showdown$1));
	return showdown$1.exports;
}

var slugify = {};

var escapeStringRegexp = {};

var hasRequiredEscapeStringRegexp;

function requireEscapeStringRegexp () {
	if (hasRequiredEscapeStringRegexp) return escapeStringRegexp;
	hasRequiredEscapeStringRegexp = 1;
	Object.defineProperty(escapeStringRegexp, "__esModule", { value: true });
	escapeStringRegexp.default = escapeStringRegexp$1;
	/**
	 * escape string for regexp
	 * @link https://github.com/sindresorhus/escape-string-regexp
	 * @param str string to escape
	 * @returns
	 */
	function escapeStringRegexp$1(str) {
	    if (typeof str !== 'string') {
	        throw new TypeError('Expected a string');
	    }
	    // Escape characters with special meaning either inside or outside character sets.
	    // Use a simple backslash escape when it’s always valid, and a `\xnn` escape when the simpler form would be disallowed by Unicode patterns’ stricter grammar.
	    return str.replace(/[|\\{}()[\]^$+*?.]/g, '\\$&').replace(/-/g, '\\x2d');
	}
	return escapeStringRegexp;
}

var transliterate = {};

/**
 * lodash (Custom Build) <https://lodash.com/>
 * Build: `lodash modularize exports="npm" -o ./`
 * Copyright jQuery Foundation and other contributors <https://jquery.org/>
 * Released under MIT license <https://lodash.com/license>
 * Based on Underscore.js 1.8.3 <http://underscorejs.org/LICENSE>
 * Copyright Jeremy Ashkenas, DocumentCloud and Investigative Reporters & Editors
 */

var lodash_deburr;
var hasRequiredLodash_deburr;

function requireLodash_deburr () {
	if (hasRequiredLodash_deburr) return lodash_deburr;
	hasRequiredLodash_deburr = 1;
	/** Used as references for various `Number` constants. */
	var INFINITY = 1 / 0;

	/** `Object#toString` result references. */
	var symbolTag = '[object Symbol]';

	/** Used to match Latin Unicode letters (excluding mathematical operators). */
	var reLatin = /[\xc0-\xd6\xd8-\xf6\xf8-\xff\u0100-\u017f]/g;

	/** Used to compose unicode character classes. */
	var rsComboMarksRange = '\\u0300-\\u036f\\ufe20-\\ufe23',
	    rsComboSymbolsRange = '\\u20d0-\\u20f0';

	/** Used to compose unicode capture groups. */
	var rsCombo = '[' + rsComboMarksRange + rsComboSymbolsRange + ']';

	/**
	 * Used to match [combining diacritical marks](https://en.wikipedia.org/wiki/Combining_Diacritical_Marks) and
	 * [combining diacritical marks for symbols](https://en.wikipedia.org/wiki/Combining_Diacritical_Marks_for_Symbols).
	 */
	var reComboMark = RegExp(rsCombo, 'g');

	/** Used to map Latin Unicode letters to basic Latin letters. */
	var deburredLetters = {
	  // Latin-1 Supplement block.
	  '\xc0': 'A',  '\xc1': 'A', '\xc2': 'A', '\xc3': 'A', '\xc4': 'A', '\xc5': 'A',
	  '\xe0': 'a',  '\xe1': 'a', '\xe2': 'a', '\xe3': 'a', '\xe4': 'a', '\xe5': 'a',
	  '\xc7': 'C',  '\xe7': 'c',
	  '\xd0': 'D',  '\xf0': 'd',
	  '\xc8': 'E',  '\xc9': 'E', '\xca': 'E', '\xcb': 'E',
	  '\xe8': 'e',  '\xe9': 'e', '\xea': 'e', '\xeb': 'e',
	  '\xcc': 'I',  '\xcd': 'I', '\xce': 'I', '\xcf': 'I',
	  '\xec': 'i',  '\xed': 'i', '\xee': 'i', '\xef': 'i',
	  '\xd1': 'N',  '\xf1': 'n',
	  '\xd2': 'O',  '\xd3': 'O', '\xd4': 'O', '\xd5': 'O', '\xd6': 'O', '\xd8': 'O',
	  '\xf2': 'o',  '\xf3': 'o', '\xf4': 'o', '\xf5': 'o', '\xf6': 'o', '\xf8': 'o',
	  '\xd9': 'U',  '\xda': 'U', '\xdb': 'U', '\xdc': 'U',
	  '\xf9': 'u',  '\xfa': 'u', '\xfb': 'u', '\xfc': 'u',
	  '\xdd': 'Y',  '\xfd': 'y', '\xff': 'y',
	  '\xc6': 'Ae', '\xe6': 'ae',
	  '\xde': 'Th', '\xfe': 'th',
	  '\xdf': 'ss',
	  // Latin Extended-A block.
	  '\u0100': 'A',  '\u0102': 'A', '\u0104': 'A',
	  '\u0101': 'a',  '\u0103': 'a', '\u0105': 'a',
	  '\u0106': 'C',  '\u0108': 'C', '\u010a': 'C', '\u010c': 'C',
	  '\u0107': 'c',  '\u0109': 'c', '\u010b': 'c', '\u010d': 'c',
	  '\u010e': 'D',  '\u0110': 'D', '\u010f': 'd', '\u0111': 'd',
	  '\u0112': 'E',  '\u0114': 'E', '\u0116': 'E', '\u0118': 'E', '\u011a': 'E',
	  '\u0113': 'e',  '\u0115': 'e', '\u0117': 'e', '\u0119': 'e', '\u011b': 'e',
	  '\u011c': 'G',  '\u011e': 'G', '\u0120': 'G', '\u0122': 'G',
	  '\u011d': 'g',  '\u011f': 'g', '\u0121': 'g', '\u0123': 'g',
	  '\u0124': 'H',  '\u0126': 'H', '\u0125': 'h', '\u0127': 'h',
	  '\u0128': 'I',  '\u012a': 'I', '\u012c': 'I', '\u012e': 'I', '\u0130': 'I',
	  '\u0129': 'i',  '\u012b': 'i', '\u012d': 'i', '\u012f': 'i', '\u0131': 'i',
	  '\u0134': 'J',  '\u0135': 'j',
	  '\u0136': 'K',  '\u0137': 'k', '\u0138': 'k',
	  '\u0139': 'L',  '\u013b': 'L', '\u013d': 'L', '\u013f': 'L', '\u0141': 'L',
	  '\u013a': 'l',  '\u013c': 'l', '\u013e': 'l', '\u0140': 'l', '\u0142': 'l',
	  '\u0143': 'N',  '\u0145': 'N', '\u0147': 'N', '\u014a': 'N',
	  '\u0144': 'n',  '\u0146': 'n', '\u0148': 'n', '\u014b': 'n',
	  '\u014c': 'O',  '\u014e': 'O', '\u0150': 'O',
	  '\u014d': 'o',  '\u014f': 'o', '\u0151': 'o',
	  '\u0154': 'R',  '\u0156': 'R', '\u0158': 'R',
	  '\u0155': 'r',  '\u0157': 'r', '\u0159': 'r',
	  '\u015a': 'S',  '\u015c': 'S', '\u015e': 'S', '\u0160': 'S',
	  '\u015b': 's',  '\u015d': 's', '\u015f': 's', '\u0161': 's',
	  '\u0162': 'T',  '\u0164': 'T', '\u0166': 'T',
	  '\u0163': 't',  '\u0165': 't', '\u0167': 't',
	  '\u0168': 'U',  '\u016a': 'U', '\u016c': 'U', '\u016e': 'U', '\u0170': 'U', '\u0172': 'U',
	  '\u0169': 'u',  '\u016b': 'u', '\u016d': 'u', '\u016f': 'u', '\u0171': 'u', '\u0173': 'u',
	  '\u0174': 'W',  '\u0175': 'w',
	  '\u0176': 'Y',  '\u0177': 'y', '\u0178': 'Y',
	  '\u0179': 'Z',  '\u017b': 'Z', '\u017d': 'Z',
	  '\u017a': 'z',  '\u017c': 'z', '\u017e': 'z',
	  '\u0132': 'IJ', '\u0133': 'ij',
	  '\u0152': 'Oe', '\u0153': 'oe',
	  '\u0149': "'n", '\u017f': 'ss'
	};

	/** Detect free variable `global` from Node.js. */
	var freeGlobal = typeof commonjsGlobal == 'object' && commonjsGlobal && commonjsGlobal.Object === Object && commonjsGlobal;

	/** Detect free variable `self`. */
	var freeSelf = typeof self == 'object' && self && self.Object === Object && self;

	/** Used as a reference to the global object. */
	var root = freeGlobal || freeSelf || Function('return this')();

	/**
	 * The base implementation of `_.propertyOf` without support for deep paths.
	 *
	 * @private
	 * @param {Object} object The object to query.
	 * @returns {Function} Returns the new accessor function.
	 */
	function basePropertyOf(object) {
	  return function(key) {
	    return object == null ? undefined : object[key];
	  };
	}

	/**
	 * Used by `_.deburr` to convert Latin-1 Supplement and Latin Extended-A
	 * letters to basic Latin letters.
	 *
	 * @private
	 * @param {string} letter The matched letter to deburr.
	 * @returns {string} Returns the deburred letter.
	 */
	var deburrLetter = basePropertyOf(deburredLetters);

	/** Used for built-in method references. */
	var objectProto = Object.prototype;

	/**
	 * Used to resolve the
	 * [`toStringTag`](http://ecma-international.org/ecma-262/7.0/#sec-object.prototype.tostring)
	 * of values.
	 */
	var objectToString = objectProto.toString;

	/** Built-in value references. */
	var Symbol = root.Symbol;

	/** Used to convert symbols to primitives and strings. */
	var symbolProto = Symbol ? Symbol.prototype : undefined,
	    symbolToString = symbolProto ? symbolProto.toString : undefined;

	/**
	 * The base implementation of `_.toString` which doesn't convert nullish
	 * values to empty strings.
	 *
	 * @private
	 * @param {*} value The value to process.
	 * @returns {string} Returns the string.
	 */
	function baseToString(value) {
	  // Exit early for strings to avoid a performance hit in some environments.
	  if (typeof value == 'string') {
	    return value;
	  }
	  if (isSymbol(value)) {
	    return symbolToString ? symbolToString.call(value) : '';
	  }
	  var result = (value + '');
	  return (result == '0' && (1 / value) == -INFINITY) ? '-0' : result;
	}

	/**
	 * Checks if `value` is object-like. A value is object-like if it's not `null`
	 * and has a `typeof` result of "object".
	 *
	 * @static
	 * @memberOf _
	 * @since 4.0.0
	 * @category Lang
	 * @param {*} value The value to check.
	 * @returns {boolean} Returns `true` if `value` is object-like, else `false`.
	 * @example
	 *
	 * _.isObjectLike({});
	 * // => true
	 *
	 * _.isObjectLike([1, 2, 3]);
	 * // => true
	 *
	 * _.isObjectLike(_.noop);
	 * // => false
	 *
	 * _.isObjectLike(null);
	 * // => false
	 */
	function isObjectLike(value) {
	  return !!value && typeof value == 'object';
	}

	/**
	 * Checks if `value` is classified as a `Symbol` primitive or object.
	 *
	 * @static
	 * @memberOf _
	 * @since 4.0.0
	 * @category Lang
	 * @param {*} value The value to check.
	 * @returns {boolean} Returns `true` if `value` is a symbol, else `false`.
	 * @example
	 *
	 * _.isSymbol(Symbol.iterator);
	 * // => true
	 *
	 * _.isSymbol('abc');
	 * // => false
	 */
	function isSymbol(value) {
	  return typeof value == 'symbol' ||
	    (isObjectLike(value) && objectToString.call(value) == symbolTag);
	}

	/**
	 * Converts `value` to a string. An empty string is returned for `null`
	 * and `undefined` values. The sign of `-0` is preserved.
	 *
	 * @static
	 * @memberOf _
	 * @since 4.0.0
	 * @category Lang
	 * @param {*} value The value to process.
	 * @returns {string} Returns the string.
	 * @example
	 *
	 * _.toString(null);
	 * // => ''
	 *
	 * _.toString(-0);
	 * // => '-0'
	 *
	 * _.toString([1, 2, 3]);
	 * // => '1,2,3'
	 */
	function toString(value) {
	  return value == null ? '' : baseToString(value);
	}

	/**
	 * Deburrs `string` by converting
	 * [Latin-1 Supplement](https://en.wikipedia.org/wiki/Latin-1_Supplement_(Unicode_block)#Character_table)
	 * and [Latin Extended-A](https://en.wikipedia.org/wiki/Latin_Extended-A)
	 * letters to basic Latin letters and removing
	 * [combining diacritical marks](https://en.wikipedia.org/wiki/Combining_Diacritical_Marks).
	 *
	 * @static
	 * @memberOf _
	 * @since 3.0.0
	 * @category String
	 * @param {string} [string=''] The string to deburr.
	 * @returns {string} Returns the deburred string.
	 * @example
	 *
	 * _.deburr('déjà vu');
	 * // => 'deja vu'
	 */
	function deburr(string) {
	  string = toString(string);
	  return string && string.replace(reLatin, deburrLetter).replace(reComboMark, '');
	}

	lodash_deburr = deburr;
	return lodash_deburr;
}

var replacements$1 = {};

var hasRequiredReplacements$1;

function requireReplacements$1 () {
	if (hasRequiredReplacements$1) return replacements$1;
	hasRequiredReplacements$1 = 1;
	Object.defineProperty(replacements$1, "__esModule", { value: true });
	const replacements = [
	    // German umlauts
	    ['ß', 'ss'],
	    ['ẞ', 'Ss'],
	    ['ä', 'ae'],
	    ['Ä', 'Ae'],
	    ['ö', 'oe'],
	    ['Ö', 'Oe'],
	    ['ü', 'ue'],
	    ['Ü', 'Ue'],
	    // Latin
	    ['À', 'A'],
	    ['Á', 'A'],
	    ['Â', 'A'],
	    ['Ã', 'A'],
	    ['Ä', 'Ae'],
	    ['Å', 'A'],
	    ['Æ', 'AE'],
	    ['Ç', 'C'],
	    ['È', 'E'],
	    ['É', 'E'],
	    ['Ê', 'E'],
	    ['Ë', 'E'],
	    ['Ì', 'I'],
	    ['Í', 'I'],
	    ['Î', 'I'],
	    ['Ï', 'I'],
	    ['Ð', 'D'],
	    ['Ñ', 'N'],
	    ['Ò', 'O'],
	    ['Ó', 'O'],
	    ['Ô', 'O'],
	    ['Õ', 'O'],
	    ['Ö', 'Oe'],
	    ['Ő', 'O'],
	    ['Ø', 'O'],
	    ['Ù', 'U'],
	    ['Ú', 'U'],
	    ['Û', 'U'],
	    ['Ü', 'Ue'],
	    ['Ű', 'U'],
	    ['Ý', 'Y'],
	    ['Þ', 'TH'],
	    ['ß', 'ss'],
	    ['à', 'a'],
	    ['á', 'a'],
	    ['â', 'a'],
	    ['ã', 'a'],
	    ['ä', 'ae'],
	    ['å', 'a'],
	    ['æ', 'ae'],
	    ['ç', 'c'],
	    ['è', 'e'],
	    ['é', 'e'],
	    ['ê', 'e'],
	    ['ë', 'e'],
	    ['ì', 'i'],
	    ['í', 'i'],
	    ['î', 'i'],
	    ['ï', 'i'],
	    ['ð', 'd'],
	    ['ñ', 'n'],
	    ['ò', 'o'],
	    ['ó', 'o'],
	    ['ô', 'o'],
	    ['õ', 'o'],
	    ['ö', 'oe'],
	    ['ő', 'o'],
	    ['ø', 'o'],
	    ['ù', 'u'],
	    ['ú', 'u'],
	    ['û', 'u'],
	    ['ü', 'ue'],
	    ['ű', 'u'],
	    ['ý', 'y'],
	    ['þ', 'th'],
	    ['ÿ', 'y'],
	    ['ẞ', 'SS'],
	    // Vietnamese
	    ['à', 'a'],
	    ['À', 'A'],
	    ['á', 'a'],
	    ['Á', 'A'],
	    ['â', 'a'],
	    ['Â', 'A'],
	    ['ã', 'a'],
	    ['Ã', 'A'],
	    ['è', 'e'],
	    ['È', 'E'],
	    ['é', 'e'],
	    ['É', 'E'],
	    ['ê', 'e'],
	    ['Ê', 'E'],
	    ['ì', 'i'],
	    ['Ì', 'I'],
	    ['í', 'i'],
	    ['Í', 'I'],
	    ['ò', 'o'],
	    ['Ò', 'O'],
	    ['ó', 'o'],
	    ['Ó', 'O'],
	    ['ô', 'o'],
	    ['Ô', 'O'],
	    ['õ', 'o'],
	    ['Õ', 'O'],
	    ['ù', 'u'],
	    ['Ù', 'U'],
	    ['ú', 'u'],
	    ['Ú', 'U'],
	    ['ý', 'y'],
	    ['Ý', 'Y'],
	    ['ă', 'a'],
	    ['Ă', 'A'],
	    ['Đ', 'D'],
	    ['đ', 'd'],
	    ['ĩ', 'i'],
	    ['Ĩ', 'I'],
	    ['ũ', 'u'],
	    ['Ũ', 'U'],
	    ['ơ', 'o'],
	    ['Ơ', 'O'],
	    ['ư', 'u'],
	    ['Ư', 'U'],
	    ['ạ', 'a'],
	    ['Ạ', 'A'],
	    ['ả', 'a'],
	    ['Ả', 'A'],
	    ['ấ', 'a'],
	    ['Ấ', 'A'],
	    ['ầ', 'a'],
	    ['Ầ', 'A'],
	    ['ẩ', 'a'],
	    ['Ẩ', 'A'],
	    ['ẫ', 'a'],
	    ['Ẫ', 'A'],
	    ['ậ', 'a'],
	    ['Ậ', 'A'],
	    ['ắ', 'a'],
	    ['Ắ', 'A'],
	    ['ằ', 'a'],
	    ['Ằ', 'A'],
	    ['ẳ', 'a'],
	    ['Ẳ', 'A'],
	    ['ẵ', 'a'],
	    ['Ẵ', 'A'],
	    ['ặ', 'a'],
	    ['Ặ', 'A'],
	    ['ẹ', 'e'],
	    ['Ẹ', 'E'],
	    ['ẻ', 'e'],
	    ['Ẻ', 'E'],
	    ['ẽ', 'e'],
	    ['Ẽ', 'E'],
	    ['ế', 'e'],
	    ['Ế', 'E'],
	    ['ề', 'e'],
	    ['Ề', 'E'],
	    ['ể', 'e'],
	    ['Ể', 'E'],
	    ['ễ', 'e'],
	    ['Ễ', 'E'],
	    ['ệ', 'e'],
	    ['Ệ', 'E'],
	    ['ỉ', 'i'],
	    ['Ỉ', 'I'],
	    ['ị', 'i'],
	    ['Ị', 'I'],
	    ['ọ', 'o'],
	    ['Ọ', 'O'],
	    ['ỏ', 'o'],
	    ['Ỏ', 'O'],
	    ['ố', 'o'],
	    ['Ố', 'O'],
	    ['ồ', 'o'],
	    ['Ồ', 'O'],
	    ['ổ', 'o'],
	    ['Ổ', 'O'],
	    ['ỗ', 'o'],
	    ['Ỗ', 'O'],
	    ['ộ', 'o'],
	    ['Ộ', 'O'],
	    ['ớ', 'o'],
	    ['Ớ', 'O'],
	    ['ờ', 'o'],
	    ['Ờ', 'O'],
	    ['ở', 'o'],
	    ['Ở', 'O'],
	    ['ỡ', 'o'],
	    ['Ỡ', 'O'],
	    ['ợ', 'o'],
	    ['Ợ', 'O'],
	    ['ụ', 'u'],
	    ['Ụ', 'U'],
	    ['ủ', 'u'],
	    ['Ủ', 'U'],
	    ['ứ', 'u'],
	    ['Ứ', 'U'],
	    ['ừ', 'u'],
	    ['Ừ', 'U'],
	    ['ử', 'u'],
	    ['Ử', 'U'],
	    ['ữ', 'u'],
	    ['Ữ', 'U'],
	    ['ự', 'u'],
	    ['Ự', 'U'],
	    ['ỳ', 'y'],
	    ['Ỳ', 'Y'],
	    ['ỵ', 'y'],
	    ['Ỵ', 'Y'],
	    ['ỷ', 'y'],
	    ['Ỷ', 'Y'],
	    ['ỹ', 'y'],
	    ['Ỹ', 'Y'],
	    // Arabic
	    ['ء', 'e'],
	    ['آ', 'a'],
	    ['أ', 'a'],
	    ['ؤ', 'w'],
	    ['إ', 'i'],
	    ['ئ', 'y'],
	    ['ا', 'a'],
	    ['ب', 'b'],
	    ['ة', 't'],
	    ['ت', 't'],
	    ['ث', 'th'],
	    ['ج', 'j'],
	    ['ح', 'h'],
	    ['خ', 'kh'],
	    ['د', 'd'],
	    ['ذ', 'dh'],
	    ['ر', 'r'],
	    ['ز', 'z'],
	    ['س', 's'],
	    ['ش', 'sh'],
	    ['ص', 's'],
	    ['ض', 'd'],
	    ['ط', 't'],
	    ['ظ', 'z'],
	    ['ع', 'e'],
	    ['غ', 'gh'],
	    ['ـ', '_'],
	    ['ف', 'f'],
	    ['ق', 'q'],
	    ['ك', 'k'],
	    ['ل', 'l'],
	    ['م', 'm'],
	    ['ن', 'n'],
	    ['ه', 'h'],
	    ['و', 'w'],
	    ['ى', 'a'],
	    ['ي', 'y'],
	    ['َ‎', 'a'],
	    ['ُ', 'u'],
	    ['ِ‎', 'i'],
	    ['٠', '0'],
	    ['١', '1'],
	    ['٢', '2'],
	    ['٣', '3'],
	    ['٤', '4'],
	    ['٥', '5'],
	    ['٦', '6'],
	    ['٧', '7'],
	    ['٨', '8'],
	    ['٩', '9'],
	    // Persian / Farsi
	    ['چ', 'ch'],
	    ['ک', 'k'],
	    ['گ', 'g'],
	    ['پ', 'p'],
	    ['ژ', 'zh'],
	    ['ی', 'y'],
	    ['۰', '0'],
	    ['۱', '1'],
	    ['۲', '2'],
	    ['۳', '3'],
	    ['۴', '4'],
	    ['۵', '5'],
	    ['۶', '6'],
	    ['۷', '7'],
	    ['۸', '8'],
	    ['۹', '9'],
	    // Pashto
	    ['ټ', 'p'],
	    ['ځ', 'z'],
	    ['څ', 'c'],
	    ['ډ', 'd'],
	    ['ﺫ', 'd'],
	    ['ﺭ', 'r'],
	    ['ړ', 'r'],
	    ['ﺯ', 'z'],
	    ['ږ', 'g'],
	    ['ښ', 'x'],
	    ['ګ', 'g'],
	    ['ڼ', 'n'],
	    ['ۀ', 'e'],
	    ['ې', 'e'],
	    ['ۍ', 'ai'],
	    // Urdu
	    ['ٹ', 't'],
	    ['ڈ', 'd'],
	    ['ڑ', 'r'],
	    ['ں', 'n'],
	    ['ہ', 'h'],
	    ['ھ', 'h'],
	    ['ے', 'e'],
	    // Russian
	    ['А', 'A'],
	    ['а', 'a'],
	    ['Б', 'B'],
	    ['б', 'b'],
	    ['В', 'V'],
	    ['в', 'v'],
	    ['Г', 'G'],
	    ['г', 'g'],
	    ['Д', 'D'],
	    ['д', 'd'],
	    ['ъе', 'ye'],
	    ['Ъе', 'Ye'],
	    ['ъЕ', 'yE'],
	    ['ЪЕ', 'YE'],
	    ['Е', 'E'],
	    ['е', 'e'],
	    ['Ё', 'Yo'],
	    ['ё', 'yo'],
	    ['Ж', 'Zh'],
	    ['ж', 'zh'],
	    ['З', 'Z'],
	    ['з', 'z'],
	    ['И', 'I'],
	    ['и', 'i'],
	    ['ый', 'iy'],
	    ['Ый', 'Iy'],
	    ['ЫЙ', 'IY'],
	    ['ыЙ', 'iY'],
	    ['Й', 'Y'],
	    ['й', 'y'],
	    ['К', 'K'],
	    ['к', 'k'],
	    ['Л', 'L'],
	    ['л', 'l'],
	    ['М', 'M'],
	    ['м', 'm'],
	    ['Н', 'N'],
	    ['н', 'n'],
	    ['О', 'O'],
	    ['о', 'o'],
	    ['П', 'P'],
	    ['п', 'p'],
	    ['Р', 'R'],
	    ['р', 'r'],
	    ['С', 'S'],
	    ['с', 's'],
	    ['Т', 'T'],
	    ['т', 't'],
	    ['У', 'U'],
	    ['у', 'u'],
	    ['Ф', 'F'],
	    ['ф', 'f'],
	    ['Х', 'Kh'],
	    ['х', 'kh'],
	    ['Ц', 'Ts'],
	    ['ц', 'ts'],
	    ['Ч', 'Ch'],
	    ['ч', 'ch'],
	    ['Ш', 'Sh'],
	    ['ш', 'sh'],
	    ['Щ', 'Sch'],
	    ['щ', 'sch'],
	    ['Ъ', ''],
	    ['ъ', ''],
	    ['Ы', 'Y'],
	    ['ы', 'y'],
	    ['Ь', ''],
	    ['ь', ''],
	    ['Э', 'E'],
	    ['э', 'e'],
	    ['Ю', 'Yu'],
	    ['ю', 'yu'],
	    ['Я', 'Ya'],
	    ['я', 'ya'],
	    // Romanian
	    ['ă', 'a'],
	    ['Ă', 'A'],
	    ['ș', 's'],
	    ['Ș', 'S'],
	    ['ț', 't'],
	    ['Ț', 'T'],
	    ['ţ', 't'],
	    ['Ţ', 'T'],
	    // Turkish
	    ['ş', 's'],
	    ['Ş', 'S'],
	    ['ç', 'c'],
	    ['Ç', 'C'],
	    ['ğ', 'g'],
	    ['Ğ', 'G'],
	    ['ı', 'i'],
	    ['İ', 'I'],
	    // Armenian
	    ['ա', 'a'],
	    ['Ա', 'A'],
	    ['բ', 'b'],
	    ['Բ', 'B'],
	    ['գ', 'g'],
	    ['Գ', 'G'],
	    ['դ', 'd'],
	    ['Դ', 'D'],
	    ['ե', 'ye'],
	    ['Ե', 'Ye'],
	    ['զ', 'z'],
	    ['Զ', 'Z'],
	    ['է', 'e'],
	    ['Է', 'E'],
	    ['ը', 'y'],
	    ['Ը', 'Y'],
	    ['թ', 't'],
	    ['Թ', 'T'],
	    ['ժ', 'zh'],
	    ['Ժ', 'Zh'],
	    ['ի', 'i'],
	    ['Ի', 'I'],
	    ['լ', 'l'],
	    ['Լ', 'L'],
	    ['խ', 'kh'],
	    ['Խ', 'Kh'],
	    ['ծ', 'ts'],
	    ['Ծ', 'Ts'],
	    ['կ', 'k'],
	    ['Կ', 'K'],
	    ['հ', 'h'],
	    ['Հ', 'H'],
	    ['ձ', 'dz'],
	    ['Ձ', 'Dz'],
	    ['ղ', 'gh'],
	    ['Ղ', 'Gh'],
	    ['ճ', 'tch'],
	    ['Ճ', 'Tch'],
	    ['մ', 'm'],
	    ['Մ', 'M'],
	    ['յ', 'y'],
	    ['Յ', 'Y'],
	    ['ն', 'n'],
	    ['Ն', 'N'],
	    ['շ', 'sh'],
	    ['Շ', 'Sh'],
	    ['ո', 'vo'],
	    ['Ո', 'Vo'],
	    ['չ', 'ch'],
	    ['Չ', 'Ch'],
	    ['պ', 'p'],
	    ['Պ', 'P'],
	    ['ջ', 'j'],
	    ['Ջ', 'J'],
	    ['ռ', 'r'],
	    ['Ռ', 'R'],
	    ['ս', 's'],
	    ['Ս', 'S'],
	    ['վ', 'v'],
	    ['Վ', 'V'],
	    ['տ', 't'],
	    ['Տ', 'T'],
	    ['ր', 'r'],
	    ['Ր', 'R'],
	    ['ց', 'c'],
	    ['Ց', 'C'],
	    ['ու', 'u'],
	    ['ՈՒ', 'U'],
	    ['Ու', 'U'],
	    ['փ', 'p'],
	    ['Փ', 'P'],
	    ['ք', 'q'],
	    ['Ք', 'Q'],
	    ['օ', 'o'],
	    ['Օ', 'O'],
	    ['ֆ', 'f'],
	    ['Ֆ', 'F'],
	    ['և', 'yev'],
	    // Georgian
	    ['ა', 'a'],
	    ['ბ', 'b'],
	    ['გ', 'g'],
	    ['დ', 'd'],
	    ['ე', 'e'],
	    ['ვ', 'v'],
	    ['ზ', 'z'],
	    ['თ', 't'],
	    ['ი', 'i'],
	    ['კ', 'k'],
	    ['ლ', 'l'],
	    ['მ', 'm'],
	    ['ნ', 'n'],
	    ['ო', 'o'],
	    ['პ', 'p'],
	    ['ჟ', 'zh'],
	    ['რ', 'r'],
	    ['ს', 's'],
	    ['ტ', 't'],
	    ['უ', 'u'],
	    ['ფ', 'ph'],
	    ['ქ', 'q'],
	    ['ღ', 'gh'],
	    ['ყ', 'k'],
	    ['შ', 'sh'],
	    ['ჩ', 'ch'],
	    ['ც', 'ts'],
	    ['ძ', 'dz'],
	    ['წ', 'ts'],
	    ['ჭ', 'tch'],
	    ['ხ', 'kh'],
	    ['ჯ', 'j'],
	    ['ჰ', 'h'],
	    // Czech
	    ['č', 'c'],
	    ['ď', 'd'],
	    ['ě', 'e'],
	    ['ň', 'n'],
	    ['ř', 'r'],
	    ['š', 's'],
	    ['ť', 't'],
	    ['ů', 'u'],
	    ['ž', 'z'],
	    ['Č', 'C'],
	    ['Ď', 'D'],
	    ['Ě', 'E'],
	    ['Ň', 'N'],
	    ['Ř', 'R'],
	    ['Š', 'S'],
	    ['Ť', 'T'],
	    ['Ů', 'U'],
	    ['Ž', 'Z'],
	    // Dhivehi
	    ['ހ', 'h'],
	    ['ށ', 'sh'],
	    ['ނ', 'n'],
	    ['ރ', 'r'],
	    ['ބ', 'b'],
	    ['ޅ', 'lh'],
	    ['ކ', 'k'],
	    ['އ', 'a'],
	    ['ވ', 'v'],
	    ['މ', 'm'],
	    ['ފ', 'f'],
	    ['ދ', 'dh'],
	    ['ތ', 'th'],
	    ['ލ', 'l'],
	    ['ގ', 'g'],
	    ['ޏ', 'gn'],
	    ['ސ', 's'],
	    ['ޑ', 'd'],
	    ['ޒ', 'z'],
	    ['ޓ', 't'],
	    ['ޔ', 'y'],
	    ['ޕ', 'p'],
	    ['ޖ', 'j'],
	    ['ޗ', 'ch'],
	    ['ޘ', 'tt'],
	    ['ޙ', 'hh'],
	    ['ޚ', 'kh'],
	    ['ޛ', 'th'],
	    ['ޜ', 'z'],
	    ['ޝ', 'sh'],
	    ['ޞ', 's'],
	    ['ޟ', 'd'],
	    ['ޠ', 't'],
	    ['ޡ', 'z'],
	    ['ޢ', 'a'],
	    ['ޣ', 'gh'],
	    ['ޤ', 'q'],
	    ['ޥ', 'w'],
	    ['ަ', 'a'],
	    ['ާ', 'aa'],
	    ['ި', 'i'],
	    ['ީ', 'ee'],
	    ['ު', 'u'],
	    ['ޫ', 'oo'],
	    ['ެ', 'e'],
	    ['ޭ', 'ey'],
	    ['ޮ', 'o'],
	    ['ޯ', 'oa'],
	    ['ް', ''],
	    // Greek
	    ['α', 'a'],
	    ['β', 'v'],
	    ['γ', 'g'],
	    ['δ', 'd'],
	    ['ε', 'e'],
	    ['ζ', 'z'],
	    ['η', 'i'],
	    ['θ', 'th'],
	    ['ι', 'i'],
	    ['κ', 'k'],
	    ['λ', 'l'],
	    ['μ', 'm'],
	    ['ν', 'n'],
	    ['ξ', 'ks'],
	    ['ο', 'o'],
	    ['π', 'p'],
	    ['ρ', 'r'],
	    ['σ', 's'],
	    ['τ', 't'],
	    ['υ', 'y'],
	    ['φ', 'f'],
	    ['χ', 'x'],
	    ['ψ', 'ps'],
	    ['ω', 'o'],
	    ['ά', 'a'],
	    ['έ', 'e'],
	    ['ί', 'i'],
	    ['ό', 'o'],
	    ['ύ', 'y'],
	    ['ή', 'i'],
	    ['ώ', 'o'],
	    ['ς', 's'],
	    ['ϊ', 'i'],
	    ['ΰ', 'y'],
	    ['ϋ', 'y'],
	    ['ΐ', 'i'],
	    ['Α', 'A'],
	    ['Β', 'B'],
	    ['Γ', 'G'],
	    ['Δ', 'D'],
	    ['Ε', 'E'],
	    ['Ζ', 'Z'],
	    ['Η', 'I'],
	    ['Θ', 'TH'],
	    ['Ι', 'I'],
	    ['Κ', 'K'],
	    ['Λ', 'L'],
	    ['Μ', 'M'],
	    ['Ν', 'N'],
	    ['Ξ', 'KS'],
	    ['Ο', 'O'],
	    ['Π', 'P'],
	    ['Ρ', 'R'],
	    ['Σ', 'S'],
	    ['Τ', 'T'],
	    ['Υ', 'Y'],
	    ['Φ', 'F'],
	    ['Χ', 'X'],
	    ['Ψ', 'PS'],
	    ['Ω', 'O'],
	    ['Ά', 'A'],
	    ['Έ', 'E'],
	    ['Ί', 'I'],
	    ['Ό', 'O'],
	    ['Ύ', 'Y'],
	    ['Ή', 'I'],
	    ['Ώ', 'O'],
	    ['Ϊ', 'I'],
	    ['Ϋ', 'Y'],
	    // Disabled as it conflicts with German and Latin.
	    // Hungarian
	    // ['ä', 'a'],
	    // ['Ä', 'A'],
	    // ['ö', 'o'],
	    // ['Ö', 'O'],
	    // ['ü', 'u'],
	    // ['Ü', 'U'],
	    // ['ű', 'u'],
	    // ['Ű', 'U'],
	    // Latvian
	    ['ā', 'a'],
	    ['ē', 'e'],
	    ['ģ', 'g'],
	    ['ī', 'i'],
	    ['ķ', 'k'],
	    ['ļ', 'l'],
	    ['ņ', 'n'],
	    ['ū', 'u'],
	    ['Ā', 'A'],
	    ['Ē', 'E'],
	    ['Ģ', 'G'],
	    ['Ī', 'I'],
	    ['Ķ', 'K'],
	    ['Ļ', 'L'],
	    ['Ņ', 'N'],
	    ['Ū', 'U'],
	    ['č', 'c'],
	    ['š', 's'],
	    ['ž', 'z'],
	    ['Č', 'C'],
	    ['Š', 'S'],
	    ['Ž', 'Z'],
	    // Lithuanian
	    ['ą', 'a'],
	    ['č', 'c'],
	    ['ę', 'e'],
	    ['ė', 'e'],
	    ['į', 'i'],
	    ['š', 's'],
	    ['ų', 'u'],
	    ['ū', 'u'],
	    ['ž', 'z'],
	    ['Ą', 'A'],
	    ['Č', 'C'],
	    ['Ę', 'E'],
	    ['Ė', 'E'],
	    ['Į', 'I'],
	    ['Š', 'S'],
	    ['Ų', 'U'],
	    ['Ū', 'U'],
	    // Macedonian
	    ['Ќ', 'Kj'],
	    ['ќ', 'kj'],
	    ['Љ', 'Lj'],
	    ['љ', 'lj'],
	    ['Њ', 'Nj'],
	    ['њ', 'nj'],
	    ['Тс', 'Ts'],
	    ['тс', 'ts'],
	    // Polish
	    ['ą', 'a'],
	    ['ć', 'c'],
	    ['ę', 'e'],
	    ['ł', 'l'],
	    ['ń', 'n'],
	    ['ś', 's'],
	    ['ź', 'z'],
	    ['ż', 'z'],
	    ['Ą', 'A'],
	    ['Ć', 'C'],
	    ['Ę', 'E'],
	    ['Ł', 'L'],
	    ['Ń', 'N'],
	    ['Ś', 'S'],
	    ['Ź', 'Z'],
	    ['Ż', 'Z'],
	    // Disabled as it conflicts with Vietnamese.
	    // Serbian
	    // ['љ', 'lj'],
	    // ['њ', 'nj'],
	    // ['Љ', 'Lj'],
	    // ['Њ', 'Nj'],
	    // ['đ', 'dj'],
	    // ['Đ', 'Dj'],
	    // ['ђ', 'dj'],
	    // ['ј', 'j'],
	    // ['ћ', 'c'],
	    // ['џ', 'dz'],
	    // ['Ђ', 'Dj'],
	    // ['Ј', 'j'],
	    // ['Ћ', 'C'],
	    // ['Џ', 'Dz'],
	    // Disabled as it conflicts with German and Latin.
	    // Slovak
	    // ['ä', 'a'],
	    // ['Ä', 'A'],
	    // ['ľ', 'l'],
	    // ['ĺ', 'l'],
	    // ['ŕ', 'r'],
	    // ['Ľ', 'L'],
	    // ['Ĺ', 'L'],
	    // ['Ŕ', 'R'],
	    // Disabled as it conflicts with German and Latin.
	    // Swedish
	    // ['å', 'o'],
	    // ['Å', 'o'],
	    // ['ä', 'a'],
	    // ['Ä', 'A'],
	    // ['ë', 'e'],
	    // ['Ë', 'E'],
	    // ['ö', 'o'],
	    // ['Ö', 'O'],
	    // Ukrainian
	    ['Є', 'Ye'],
	    ['І', 'I'],
	    ['Ї', 'Yi'],
	    ['Ґ', 'G'],
	    ['є', 'ye'],
	    ['і', 'i'],
	    ['ї', 'yi'],
	    ['ґ', 'g'],
	    // Dutch
	    ['Ĳ', 'IJ'],
	    ['ĳ', 'ij'],
	    // Danish
	    // ['Æ', 'Ae'],
	    // ['Ø', 'Oe'],
	    // ['Å', 'Aa'],
	    // ['æ', 'ae'],
	    // ['ø', 'oe'],
	    // ['å', 'aa']
	    // Currencies
	    ['¢', 'c'],
	    ['¥', 'Y'],
	    ['߿', 'b'],
	    ['৳', 't'],
	    ['૱', 'Bo'],
	    ['฿', 'B'],
	    ['₠', 'CE'],
	    ['₡', 'C'],
	    ['₢', 'Cr'],
	    ['₣', 'F'],
	    ['₥', 'm'],
	    ['₦', 'N'],
	    ['₧', 'Pt'],
	    ['₨', 'Rs'],
	    ['₩', 'W'],
	    ['₫', 's'],
	    ['€', 'E'],
	    ['₭', 'K'],
	    ['₮', 'T'],
	    ['₯', 'Dp'],
	    ['₰', 'S'],
	    ['₱', 'P'],
	    ['₲', 'G'],
	    ['₳', 'A'],
	    ['₴', 'S'],
	    ['₵', 'C'],
	    ['₶', 'tt'],
	    ['₷', 'S'],
	    ['₸', 'T'],
	    ['₹', 'R'],
	    ['₺', 'L'],
	    ['₽', 'P'],
	    ['₿', 'B'],
	    ['﹩', '$'],
	    ['￠', 'c'],
	    ['￥', 'Y'],
	    ['￦', 'W'],
	    // Latin
	    ['𝐀', 'A'],
	    ['𝐁', 'B'],
	    ['𝐂', 'C'],
	    ['𝐃', 'D'],
	    ['𝐄', 'E'],
	    ['𝐅', 'F'],
	    ['𝐆', 'G'],
	    ['𝐇', 'H'],
	    ['𝐈', 'I'],
	    ['𝐉', 'J'],
	    ['𝐊', 'K'],
	    ['𝐋', 'L'],
	    ['𝐌', 'M'],
	    ['𝐍', 'N'],
	    ['𝐎', 'O'],
	    ['𝐏', 'P'],
	    ['𝐐', 'Q'],
	    ['𝐑', 'R'],
	    ['𝐒', 'S'],
	    ['𝐓', 'T'],
	    ['𝐔', 'U'],
	    ['𝐕', 'V'],
	    ['𝐖', 'W'],
	    ['𝐗', 'X'],
	    ['𝐘', 'Y'],
	    ['𝐙', 'Z'],
	    ['𝐚', 'a'],
	    ['𝐛', 'b'],
	    ['𝐜', 'c'],
	    ['𝐝', 'd'],
	    ['𝐞', 'e'],
	    ['𝐟', 'f'],
	    ['𝐠', 'g'],
	    ['𝐡', 'h'],
	    ['𝐢', 'i'],
	    ['𝐣', 'j'],
	    ['𝐤', 'k'],
	    ['𝐥', 'l'],
	    ['𝐦', 'm'],
	    ['𝐧', 'n'],
	    ['𝐨', 'o'],
	    ['𝐩', 'p'],
	    ['𝐪', 'q'],
	    ['𝐫', 'r'],
	    ['𝐬', 's'],
	    ['𝐭', 't'],
	    ['𝐮', 'u'],
	    ['𝐯', 'v'],
	    ['𝐰', 'w'],
	    ['𝐱', 'x'],
	    ['𝐲', 'y'],
	    ['𝐳', 'z'],
	    ['𝐴', 'A'],
	    ['𝐵', 'B'],
	    ['𝐶', 'C'],
	    ['𝐷', 'D'],
	    ['𝐸', 'E'],
	    ['𝐹', 'F'],
	    ['𝐺', 'G'],
	    ['𝐻', 'H'],
	    ['𝐼', 'I'],
	    ['𝐽', 'J'],
	    ['𝐾', 'K'],
	    ['𝐿', 'L'],
	    ['𝑀', 'M'],
	    ['𝑁', 'N'],
	    ['𝑂', 'O'],
	    ['𝑃', 'P'],
	    ['𝑄', 'Q'],
	    ['𝑅', 'R'],
	    ['𝑆', 'S'],
	    ['𝑇', 'T'],
	    ['𝑈', 'U'],
	    ['𝑉', 'V'],
	    ['𝑊', 'W'],
	    ['𝑋', 'X'],
	    ['𝑌', 'Y'],
	    ['𝑍', 'Z'],
	    ['𝑎', 'a'],
	    ['𝑏', 'b'],
	    ['𝑐', 'c'],
	    ['𝑑', 'd'],
	    ['𝑒', 'e'],
	    ['𝑓', 'f'],
	    ['𝑔', 'g'],
	    ['𝑖', 'i'],
	    ['𝑗', 'j'],
	    ['𝑘', 'k'],
	    ['𝑙', 'l'],
	    ['𝑚', 'm'],
	    ['𝑛', 'n'],
	    ['𝑜', 'o'],
	    ['𝑝', 'p'],
	    ['𝑞', 'q'],
	    ['𝑟', 'r'],
	    ['𝑠', 's'],
	    ['𝑡', 't'],
	    ['𝑢', 'u'],
	    ['𝑣', 'v'],
	    ['𝑤', 'w'],
	    ['𝑥', 'x'],
	    ['𝑦', 'y'],
	    ['𝑧', 'z'],
	    ['𝑨', 'A'],
	    ['𝑩', 'B'],
	    ['𝑪', 'C'],
	    ['𝑫', 'D'],
	    ['𝑬', 'E'],
	    ['𝑭', 'F'],
	    ['𝑮', 'G'],
	    ['𝑯', 'H'],
	    ['𝑰', 'I'],
	    ['𝑱', 'J'],
	    ['𝑲', 'K'],
	    ['𝑳', 'L'],
	    ['𝑴', 'M'],
	    ['𝑵', 'N'],
	    ['𝑶', 'O'],
	    ['𝑷', 'P'],
	    ['𝑸', 'Q'],
	    ['𝑹', 'R'],
	    ['𝑺', 'S'],
	    ['𝑻', 'T'],
	    ['𝑼', 'U'],
	    ['𝑽', 'V'],
	    ['𝑾', 'W'],
	    ['𝑿', 'X'],
	    ['𝒀', 'Y'],
	    ['𝒁', 'Z'],
	    ['𝒂', 'a'],
	    ['𝒃', 'b'],
	    ['𝒄', 'c'],
	    ['𝒅', 'd'],
	    ['𝒆', 'e'],
	    ['𝒇', 'f'],
	    ['𝒈', 'g'],
	    ['𝒉', 'h'],
	    ['𝒊', 'i'],
	    ['𝒋', 'j'],
	    ['𝒌', 'k'],
	    ['𝒍', 'l'],
	    ['𝒎', 'm'],
	    ['𝒏', 'n'],
	    ['𝒐', 'o'],
	    ['𝒑', 'p'],
	    ['𝒒', 'q'],
	    ['𝒓', 'r'],
	    ['𝒔', 's'],
	    ['𝒕', 't'],
	    ['𝒖', 'u'],
	    ['𝒗', 'v'],
	    ['𝒘', 'w'],
	    ['𝒙', 'x'],
	    ['𝒚', 'y'],
	    ['𝒛', 'z'],
	    ['𝒜', 'A'],
	    ['𝒞', 'C'],
	    ['𝒟', 'D'],
	    ['𝒢', 'g'],
	    ['𝒥', 'J'],
	    ['𝒦', 'K'],
	    ['𝒩', 'N'],
	    ['𝒪', 'O'],
	    ['𝒫', 'P'],
	    ['𝒬', 'Q'],
	    ['𝒮', 'S'],
	    ['𝒯', 'T'],
	    ['𝒰', 'U'],
	    ['𝒱', 'V'],
	    ['𝒲', 'W'],
	    ['𝒳', 'X'],
	    ['𝒴', 'Y'],
	    ['𝒵', 'Z'],
	    ['𝒶', 'a'],
	    ['𝒷', 'b'],
	    ['𝒸', 'c'],
	    ['𝒹', 'd'],
	    ['𝒻', 'f'],
	    ['𝒽', 'h'],
	    ['𝒾', 'i'],
	    ['𝒿', 'j'],
	    ['𝓀', 'h'],
	    ['𝓁', 'l'],
	    ['𝓂', 'm'],
	    ['𝓃', 'n'],
	    ['𝓅', 'p'],
	    ['𝓆', 'q'],
	    ['𝓇', 'r'],
	    ['𝓈', 's'],
	    ['𝓉', 't'],
	    ['𝓊', 'u'],
	    ['𝓋', 'v'],
	    ['𝓌', 'w'],
	    ['𝓍', 'x'],
	    ['𝓎', 'y'],
	    ['𝓏', 'z'],
	    ['𝓐', 'A'],
	    ['𝓑', 'B'],
	    ['𝓒', 'C'],
	    ['𝓓', 'D'],
	    ['𝓔', 'E'],
	    ['𝓕', 'F'],
	    ['𝓖', 'G'],
	    ['𝓗', 'H'],
	    ['𝓘', 'I'],
	    ['𝓙', 'J'],
	    ['𝓚', 'K'],
	    ['𝓛', 'L'],
	    ['𝓜', 'M'],
	    ['𝓝', 'N'],
	    ['𝓞', 'O'],
	    ['𝓟', 'P'],
	    ['𝓠', 'Q'],
	    ['𝓡', 'R'],
	    ['𝓢', 'S'],
	    ['𝓣', 'T'],
	    ['𝓤', 'U'],
	    ['𝓥', 'V'],
	    ['𝓦', 'W'],
	    ['𝓧', 'X'],
	    ['𝓨', 'Y'],
	    ['𝓩', 'Z'],
	    ['𝓪', 'a'],
	    ['𝓫', 'b'],
	    ['𝓬', 'c'],
	    ['𝓭', 'd'],
	    ['𝓮', 'e'],
	    ['𝓯', 'f'],
	    ['𝓰', 'g'],
	    ['𝓱', 'h'],
	    ['𝓲', 'i'],
	    ['𝓳', 'j'],
	    ['𝓴', 'k'],
	    ['𝓵', 'l'],
	    ['𝓶', 'm'],
	    ['𝓷', 'n'],
	    ['𝓸', 'o'],
	    ['𝓹', 'p'],
	    ['𝓺', 'q'],
	    ['𝓻', 'r'],
	    ['𝓼', 's'],
	    ['𝓽', 't'],
	    ['𝓾', 'u'],
	    ['𝓿', 'v'],
	    ['𝔀', 'w'],
	    ['𝔁', 'x'],
	    ['𝔂', 'y'],
	    ['𝔃', 'z'],
	    ['𝔄', 'A'],
	    ['𝔅', 'B'],
	    ['𝔇', 'D'],
	    ['𝔈', 'E'],
	    ['𝔉', 'F'],
	    ['𝔊', 'G'],
	    ['𝔍', 'J'],
	    ['𝔎', 'K'],
	    ['𝔏', 'L'],
	    ['𝔐', 'M'],
	    ['𝔑', 'N'],
	    ['𝔒', 'O'],
	    ['𝔓', 'P'],
	    ['𝔔', 'Q'],
	    ['𝔖', 'S'],
	    ['𝔗', 'T'],
	    ['𝔘', 'U'],
	    ['𝔙', 'V'],
	    ['𝔚', 'W'],
	    ['𝔛', 'X'],
	    ['𝔜', 'Y'],
	    ['𝔞', 'a'],
	    ['𝔟', 'b'],
	    ['𝔠', 'c'],
	    ['𝔡', 'd'],
	    ['𝔢', 'e'],
	    ['𝔣', 'f'],
	    ['𝔤', 'g'],
	    ['𝔥', 'h'],
	    ['𝔦', 'i'],
	    ['𝔧', 'j'],
	    ['𝔨', 'k'],
	    ['𝔩', 'l'],
	    ['𝔪', 'm'],
	    ['𝔫', 'n'],
	    ['𝔬', 'o'],
	    ['𝔭', 'p'],
	    ['𝔮', 'q'],
	    ['𝔯', 'r'],
	    ['𝔰', 's'],
	    ['𝔱', 't'],
	    ['𝔲', 'u'],
	    ['𝔳', 'v'],
	    ['𝔴', 'w'],
	    ['𝔵', 'x'],
	    ['𝔶', 'y'],
	    ['𝔷', 'z'],
	    ['𝔸', 'A'],
	    ['𝔹', 'B'],
	    ['𝔻', 'D'],
	    ['𝔼', 'E'],
	    ['𝔽', 'F'],
	    ['𝔾', 'G'],
	    ['𝕀', 'I'],
	    ['𝕁', 'J'],
	    ['𝕂', 'K'],
	    ['𝕃', 'L'],
	    ['𝕄', 'M'],
	    ['𝕆', 'N'],
	    ['𝕊', 'S'],
	    ['𝕋', 'T'],
	    ['𝕌', 'U'],
	    ['𝕍', 'V'],
	    ['𝕎', 'W'],
	    ['𝕏', 'X'],
	    ['𝕐', 'Y'],
	    ['𝕒', 'a'],
	    ['𝕓', 'b'],
	    ['𝕔', 'c'],
	    ['𝕕', 'd'],
	    ['𝕖', 'e'],
	    ['𝕗', 'f'],
	    ['𝕘', 'g'],
	    ['𝕙', 'h'],
	    ['𝕚', 'i'],
	    ['𝕛', 'j'],
	    ['𝕜', 'k'],
	    ['𝕝', 'l'],
	    ['𝕞', 'm'],
	    ['𝕟', 'n'],
	    ['𝕠', 'o'],
	    ['𝕡', 'p'],
	    ['𝕢', 'q'],
	    ['𝕣', 'r'],
	    ['𝕤', 's'],
	    ['𝕥', 't'],
	    ['𝕦', 'u'],
	    ['𝕧', 'v'],
	    ['𝕨', 'w'],
	    ['𝕩', 'x'],
	    ['𝕪', 'y'],
	    ['𝕫', 'z'],
	    ['𝕬', 'A'],
	    ['𝕭', 'B'],
	    ['𝕮', 'C'],
	    ['𝕯', 'D'],
	    ['𝕰', 'E'],
	    ['𝕱', 'F'],
	    ['𝕲', 'G'],
	    ['𝕳', 'H'],
	    ['𝕴', 'I'],
	    ['𝕵', 'J'],
	    ['𝕶', 'K'],
	    ['𝕷', 'L'],
	    ['𝕸', 'M'],
	    ['𝕹', 'N'],
	    ['𝕺', 'O'],
	    ['𝕻', 'P'],
	    ['𝕼', 'Q'],
	    ['𝕽', 'R'],
	    ['𝕾', 'S'],
	    ['𝕿', 'T'],
	    ['𝖀', 'U'],
	    ['𝖁', 'V'],
	    ['𝖂', 'W'],
	    ['𝖃', 'X'],
	    ['𝖄', 'Y'],
	    ['𝖅', 'Z'],
	    ['𝖆', 'a'],
	    ['𝖇', 'b'],
	    ['𝖈', 'c'],
	    ['𝖉', 'd'],
	    ['𝖊', 'e'],
	    ['𝖋', 'f'],
	    ['𝖌', 'g'],
	    ['𝖍', 'h'],
	    ['𝖎', 'i'],
	    ['𝖏', 'j'],
	    ['𝖐', 'k'],
	    ['𝖑', 'l'],
	    ['𝖒', 'm'],
	    ['𝖓', 'n'],
	    ['𝖔', 'o'],
	    ['𝖕', 'p'],
	    ['𝖖', 'q'],
	    ['𝖗', 'r'],
	    ['𝖘', 's'],
	    ['𝖙', 't'],
	    ['𝖚', 'u'],
	    ['𝖛', 'v'],
	    ['𝖜', 'w'],
	    ['𝖝', 'x'],
	    ['𝖞', 'y'],
	    ['𝖟', 'z'],
	    ['𝖠', 'A'],
	    ['𝖡', 'B'],
	    ['𝖢', 'C'],
	    ['𝖣', 'D'],
	    ['𝖤', 'E'],
	    ['𝖥', 'F'],
	    ['𝖦', 'G'],
	    ['𝖧', 'H'],
	    ['𝖨', 'I'],
	    ['𝖩', 'J'],
	    ['𝖪', 'K'],
	    ['𝖫', 'L'],
	    ['𝖬', 'M'],
	    ['𝖭', 'N'],
	    ['𝖮', 'O'],
	    ['𝖯', 'P'],
	    ['𝖰', 'Q'],
	    ['𝖱', 'R'],
	    ['𝖲', 'S'],
	    ['𝖳', 'T'],
	    ['𝖴', 'U'],
	    ['𝖵', 'V'],
	    ['𝖶', 'W'],
	    ['𝖷', 'X'],
	    ['𝖸', 'Y'],
	    ['𝖹', 'Z'],
	    ['𝖺', 'a'],
	    ['𝖻', 'b'],
	    ['𝖼', 'c'],
	    ['𝖽', 'd'],
	    ['𝖾', 'e'],
	    ['𝖿', 'f'],
	    ['𝗀', 'g'],
	    ['𝗁', 'h'],
	    ['𝗂', 'i'],
	    ['𝗃', 'j'],
	    ['𝗄', 'k'],
	    ['𝗅', 'l'],
	    ['𝗆', 'm'],
	    ['𝗇', 'n'],
	    ['𝗈', 'o'],
	    ['𝗉', 'p'],
	    ['𝗊', 'q'],
	    ['𝗋', 'r'],
	    ['𝗌', 's'],
	    ['𝗍', 't'],
	    ['𝗎', 'u'],
	    ['𝗏', 'v'],
	    ['𝗐', 'w'],
	    ['𝗑', 'x'],
	    ['𝗒', 'y'],
	    ['𝗓', 'z'],
	    ['𝗔', 'A'],
	    ['𝗕', 'B'],
	    ['𝗖', 'C'],
	    ['𝗗', 'D'],
	    ['𝗘', 'E'],
	    ['𝗙', 'F'],
	    ['𝗚', 'G'],
	    ['𝗛', 'H'],
	    ['𝗜', 'I'],
	    ['𝗝', 'J'],
	    ['𝗞', 'K'],
	    ['𝗟', 'L'],
	    ['𝗠', 'M'],
	    ['𝗡', 'N'],
	    ['𝗢', 'O'],
	    ['𝗣', 'P'],
	    ['𝗤', 'Q'],
	    ['𝗥', 'R'],
	    ['𝗦', 'S'],
	    ['𝗧', 'T'],
	    ['𝗨', 'U'],
	    ['𝗩', 'V'],
	    ['𝗪', 'W'],
	    ['𝗫', 'X'],
	    ['𝗬', 'Y'],
	    ['𝗭', 'Z'],
	    ['𝗮', 'a'],
	    ['𝗯', 'b'],
	    ['𝗰', 'c'],
	    ['𝗱', 'd'],
	    ['𝗲', 'e'],
	    ['𝗳', 'f'],
	    ['𝗴', 'g'],
	    ['𝗵', 'h'],
	    ['𝗶', 'i'],
	    ['𝗷', 'j'],
	    ['𝗸', 'k'],
	    ['𝗹', 'l'],
	    ['𝗺', 'm'],
	    ['𝗻', 'n'],
	    ['𝗼', 'o'],
	    ['𝗽', 'p'],
	    ['𝗾', 'q'],
	    ['𝗿', 'r'],
	    ['𝘀', 's'],
	    ['𝘁', 't'],
	    ['𝘂', 'u'],
	    ['𝘃', 'v'],
	    ['𝘄', 'w'],
	    ['𝘅', 'x'],
	    ['𝘆', 'y'],
	    ['𝘇', 'z'],
	    ['𝘈', 'A'],
	    ['𝘉', 'B'],
	    ['𝘊', 'C'],
	    ['𝘋', 'D'],
	    ['𝘌', 'E'],
	    ['𝘍', 'F'],
	    ['𝘎', 'G'],
	    ['𝘏', 'H'],
	    ['𝘐', 'I'],
	    ['𝘑', 'J'],
	    ['𝘒', 'K'],
	    ['𝘓', 'L'],
	    ['𝘔', 'M'],
	    ['𝘕', 'N'],
	    ['𝘖', 'O'],
	    ['𝘗', 'P'],
	    ['𝘘', 'Q'],
	    ['𝘙', 'R'],
	    ['𝘚', 'S'],
	    ['𝘛', 'T'],
	    ['𝘜', 'U'],
	    ['𝘝', 'V'],
	    ['𝘞', 'W'],
	    ['𝘟', 'X'],
	    ['𝘠', 'Y'],
	    ['𝘡', 'Z'],
	    ['𝘢', 'a'],
	    ['𝘣', 'b'],
	    ['𝘤', 'c'],
	    ['𝘥', 'd'],
	    ['𝘦', 'e'],
	    ['𝘧', 'f'],
	    ['𝘨', 'g'],
	    ['𝘩', 'h'],
	    ['𝘪', 'i'],
	    ['𝘫', 'j'],
	    ['𝘬', 'k'],
	    ['𝘭', 'l'],
	    ['𝘮', 'm'],
	    ['𝘯', 'n'],
	    ['𝘰', 'o'],
	    ['𝘱', 'p'],
	    ['𝘲', 'q'],
	    ['𝘳', 'r'],
	    ['𝘴', 's'],
	    ['𝘵', 't'],
	    ['𝘶', 'u'],
	    ['𝘷', 'v'],
	    ['𝘸', 'w'],
	    ['𝘹', 'x'],
	    ['𝘺', 'y'],
	    ['𝘻', 'z'],
	    ['𝘼', 'A'],
	    ['𝘽', 'B'],
	    ['𝘾', 'C'],
	    ['𝘿', 'D'],
	    ['𝙀', 'E'],
	    ['𝙁', 'F'],
	    ['𝙂', 'G'],
	    ['𝙃', 'H'],
	    ['𝙄', 'I'],
	    ['𝙅', 'J'],
	    ['𝙆', 'K'],
	    ['𝙇', 'L'],
	    ['𝙈', 'M'],
	    ['𝙉', 'N'],
	    ['𝙊', 'O'],
	    ['𝙋', 'P'],
	    ['𝙌', 'Q'],
	    ['𝙍', 'R'],
	    ['𝙎', 'S'],
	    ['𝙏', 'T'],
	    ['𝙐', 'U'],
	    ['𝙑', 'V'],
	    ['𝙒', 'W'],
	    ['𝙓', 'X'],
	    ['𝙔', 'Y'],
	    ['𝙕', 'Z'],
	    ['𝙖', 'a'],
	    ['𝙗', 'b'],
	    ['𝙘', 'c'],
	    ['𝙙', 'd'],
	    ['𝙚', 'e'],
	    ['𝙛', 'f'],
	    ['𝙜', 'g'],
	    ['𝙝', 'h'],
	    ['𝙞', 'i'],
	    ['𝙟', 'j'],
	    ['𝙠', 'k'],
	    ['𝙡', 'l'],
	    ['𝙢', 'm'],
	    ['𝙣', 'n'],
	    ['𝙤', 'o'],
	    ['𝙥', 'p'],
	    ['𝙦', 'q'],
	    ['𝙧', 'r'],
	    ['𝙨', 's'],
	    ['𝙩', 't'],
	    ['𝙪', 'u'],
	    ['𝙫', 'v'],
	    ['𝙬', 'w'],
	    ['𝙭', 'x'],
	    ['𝙮', 'y'],
	    ['𝙯', 'z'],
	    ['𝙰', 'A'],
	    ['𝙱', 'B'],
	    ['𝙲', 'C'],
	    ['𝙳', 'D'],
	    ['𝙴', 'E'],
	    ['𝙵', 'F'],
	    ['𝙶', 'G'],
	    ['𝙷', 'H'],
	    ['𝙸', 'I'],
	    ['𝙹', 'J'],
	    ['𝙺', 'K'],
	    ['𝙻', 'L'],
	    ['𝙼', 'M'],
	    ['𝙽', 'N'],
	    ['𝙾', 'O'],
	    ['𝙿', 'P'],
	    ['𝚀', 'Q'],
	    ['𝚁', 'R'],
	    ['𝚂', 'S'],
	    ['𝚃', 'T'],
	    ['𝚄', 'U'],
	    ['𝚅', 'V'],
	    ['𝚆', 'W'],
	    ['𝚇', 'X'],
	    ['𝚈', 'Y'],
	    ['𝚉', 'Z'],
	    ['𝚊', 'a'],
	    ['𝚋', 'b'],
	    ['𝚌', 'c'],
	    ['𝚍', 'd'],
	    ['𝚎', 'e'],
	    ['𝚏', 'f'],
	    ['𝚐', 'g'],
	    ['𝚑', 'h'],
	    ['𝚒', 'i'],
	    ['𝚓', 'j'],
	    ['𝚔', 'k'],
	    ['𝚕', 'l'],
	    ['𝚖', 'm'],
	    ['𝚗', 'n'],
	    ['𝚘', 'o'],
	    ['𝚙', 'p'],
	    ['𝚚', 'q'],
	    ['𝚛', 'r'],
	    ['𝚜', 's'],
	    ['𝚝', 't'],
	    ['𝚞', 'u'],
	    ['𝚟', 'v'],
	    ['𝚠', 'w'],
	    ['𝚡', 'x'],
	    ['𝚢', 'y'],
	    ['𝚣', 'z'],
	    // Dotless letters
	    ['𝚤', 'l'],
	    ['𝚥', 'j'],
	    // Greek
	    ['𝛢', 'A'],
	    ['𝛣', 'B'],
	    ['𝛤', 'G'],
	    ['𝛥', 'D'],
	    ['𝛦', 'E'],
	    ['𝛧', 'Z'],
	    ['𝛨', 'I'],
	    ['𝛩', 'TH'],
	    ['𝛪', 'I'],
	    ['𝛫', 'K'],
	    ['𝛬', 'L'],
	    ['𝛭', 'M'],
	    ['𝛮', 'N'],
	    ['𝛯', 'KS'],
	    ['𝛰', 'O'],
	    ['𝛱', 'P'],
	    ['𝛲', 'R'],
	    ['𝛳', 'TH'],
	    ['𝛴', 'S'],
	    ['𝛵', 'T'],
	    ['𝛶', 'Y'],
	    ['𝛷', 'F'],
	    ['𝛸', 'x'],
	    ['𝛹', 'PS'],
	    ['𝛺', 'O'],
	    ['𝛻', 'D'],
	    ['𝛼', 'a'],
	    ['𝛽', 'b'],
	    ['𝛾', 'g'],
	    ['𝛿', 'd'],
	    ['𝜀', 'e'],
	    ['𝜁', 'z'],
	    ['𝜂', 'i'],
	    ['𝜃', 'th'],
	    ['𝜄', 'i'],
	    ['𝜅', 'k'],
	    ['𝜆', 'l'],
	    ['𝜇', 'm'],
	    ['𝜈', 'n'],
	    ['𝜉', 'ks'],
	    ['𝜊', 'o'],
	    ['𝜋', 'p'],
	    ['𝜌', 'r'],
	    ['𝜍', 's'],
	    ['𝜎', 's'],
	    ['𝜏', 't'],
	    ['𝜐', 'y'],
	    ['𝜑', 'f'],
	    ['𝜒', 'x'],
	    ['𝜓', 'ps'],
	    ['𝜔', 'o'],
	    ['𝜕', 'd'],
	    ['𝜖', 'E'],
	    ['𝜗', 'TH'],
	    ['𝜘', 'K'],
	    ['𝜙', 'f'],
	    ['𝜚', 'r'],
	    ['𝜛', 'p'],
	    ['𝜜', 'A'],
	    ['𝜝', 'V'],
	    ['𝜞', 'G'],
	    ['𝜟', 'D'],
	    ['𝜠', 'E'],
	    ['𝜡', 'Z'],
	    ['𝜢', 'I'],
	    ['𝜣', 'TH'],
	    ['𝜤', 'I'],
	    ['𝜥', 'K'],
	    ['𝜦', 'L'],
	    ['𝜧', 'M'],
	    ['𝜨', 'N'],
	    ['𝜩', 'KS'],
	    ['𝜪', 'O'],
	    ['𝜫', 'P'],
	    ['𝜬', 'S'],
	    ['𝜭', 'TH'],
	    ['𝜮', 'S'],
	    ['𝜯', 'T'],
	    ['𝜰', 'Y'],
	    ['𝜱', 'F'],
	    ['𝜲', 'X'],
	    ['𝜳', 'PS'],
	    ['𝜴', 'O'],
	    ['𝜵', 'D'],
	    ['𝜶', 'a'],
	    ['𝜷', 'v'],
	    ['𝜸', 'g'],
	    ['𝜹', 'd'],
	    ['𝜺', 'e'],
	    ['𝜻', 'z'],
	    ['𝜼', 'i'],
	    ['𝜽', 'th'],
	    ['𝜾', 'i'],
	    ['𝜿', 'k'],
	    ['𝝀', 'l'],
	    ['𝝁', 'm'],
	    ['𝝂', 'n'],
	    ['𝝃', 'ks'],
	    ['𝝄', 'o'],
	    ['𝝅', 'p'],
	    ['𝝆', 'r'],
	    ['𝝇', 's'],
	    ['𝝈', 's'],
	    ['𝝉', 't'],
	    ['𝝊', 'y'],
	    ['𝝋', 'f'],
	    ['𝝌', 'x'],
	    ['𝝍', 'ps'],
	    ['𝝎', 'o'],
	    ['𝝏', 'a'],
	    ['𝝐', 'e'],
	    ['𝝑', 'i'],
	    ['𝝒', 'k'],
	    ['𝝓', 'f'],
	    ['𝝔', 'r'],
	    ['𝝕', 'p'],
	    ['𝝖', 'A'],
	    ['𝝗', 'B'],
	    ['𝝘', 'G'],
	    ['𝝙', 'D'],
	    ['𝝚', 'E'],
	    ['𝝛', 'Z'],
	    ['𝝜', 'I'],
	    ['𝝝', 'TH'],
	    ['𝝞', 'I'],
	    ['𝝟', 'K'],
	    ['𝝠', 'L'],
	    ['𝝡', 'M'],
	    ['𝝢', 'N'],
	    ['𝝣', 'KS'],
	    ['𝝤', 'O'],
	    ['𝝥', 'P'],
	    ['𝝦', 'R'],
	    ['𝝧', 'TH'],
	    ['𝝨', 'S'],
	    ['𝝩', 'T'],
	    ['𝝪', 'Y'],
	    ['𝝫', 'F'],
	    ['𝝬', 'X'],
	    ['𝝭', 'PS'],
	    ['𝝮', 'O'],
	    ['𝝯', 'D'],
	    ['𝝰', 'a'],
	    ['𝝱', 'v'],
	    ['𝝲', 'g'],
	    ['𝝳', 'd'],
	    ['𝝴', 'e'],
	    ['𝝵', 'z'],
	    ['𝝶', 'i'],
	    ['𝝷', 'th'],
	    ['𝝸', 'i'],
	    ['𝝹', 'k'],
	    ['𝝺', 'l'],
	    ['𝝻', 'm'],
	    ['𝝼', 'n'],
	    ['𝝽', 'ks'],
	    ['𝝾', 'o'],
	    ['𝝿', 'p'],
	    ['𝞀', 'r'],
	    ['𝞁', 's'],
	    ['𝞂', 's'],
	    ['𝞃', 't'],
	    ['𝞄', 'y'],
	    ['𝞅', 'f'],
	    ['𝞆', 'x'],
	    ['𝞇', 'ps'],
	    ['𝞈', 'o'],
	    ['𝞉', 'a'],
	    ['𝞊', 'e'],
	    ['𝞋', 'i'],
	    ['𝞌', 'k'],
	    ['𝞍', 'f'],
	    ['𝞎', 'r'],
	    ['𝞏', 'p'],
	    ['𝞐', 'A'],
	    ['𝞑', 'V'],
	    ['𝞒', 'G'],
	    ['𝞓', 'D'],
	    ['𝞔', 'E'],
	    ['𝞕', 'Z'],
	    ['𝞖', 'I'],
	    ['𝞗', 'TH'],
	    ['𝞘', 'I'],
	    ['𝞙', 'K'],
	    ['𝞚', 'L'],
	    ['𝞛', 'M'],
	    ['𝞜', 'N'],
	    ['𝞝', 'KS'],
	    ['𝞞', 'O'],
	    ['𝞟', 'P'],
	    ['𝞠', 'S'],
	    ['𝞡', 'TH'],
	    ['𝞢', 'S'],
	    ['𝞣', 'T'],
	    ['𝞤', 'Y'],
	    ['𝞥', 'F'],
	    ['𝞦', 'X'],
	    ['𝞧', 'PS'],
	    ['𝞨', 'O'],
	    ['𝞩', 'D'],
	    ['𝞪', 'av'],
	    ['𝞫', 'g'],
	    ['𝞬', 'd'],
	    ['𝞭', 'e'],
	    ['𝞮', 'z'],
	    ['𝞯', 'i'],
	    ['𝞰', 'i'],
	    ['𝞱', 'th'],
	    ['𝞲', 'i'],
	    ['𝞳', 'k'],
	    ['𝞴', 'l'],
	    ['𝞵', 'm'],
	    ['𝞶', 'n'],
	    ['𝞷', 'ks'],
	    ['𝞸', 'o'],
	    ['𝞹', 'p'],
	    ['𝞺', 'r'],
	    ['𝞻', 's'],
	    ['𝞼', 's'],
	    ['𝞽', 't'],
	    ['𝞾', 'y'],
	    ['𝞿', 'f'],
	    ['𝟀', 'x'],
	    ['𝟁', 'ps'],
	    ['𝟂', 'o'],
	    ['𝟃', 'a'],
	    ['𝟄', 'e'],
	    ['𝟅', 'i'],
	    ['𝟆', 'k'],
	    ['𝟇', 'f'],
	    ['𝟈', 'r'],
	    ['𝟉', 'p'],
	    ['𝟊', 'F'],
	    ['𝟋', 'f'],
	    ['⒜', '(a)'],
	    ['⒝', '(b)'],
	    ['⒞', '(c)'],
	    ['⒟', '(d)'],
	    ['⒠', '(e)'],
	    ['⒡', '(f)'],
	    ['⒢', '(g)'],
	    ['⒣', '(h)'],
	    ['⒤', '(i)'],
	    ['⒥', '(j)'],
	    ['⒦', '(k)'],
	    ['⒧', '(l)'],
	    ['⒨', '(m)'],
	    ['⒩', '(n)'],
	    ['⒪', '(o)'],
	    ['⒫', '(p)'],
	    ['⒬', '(q)'],
	    ['⒭', '(r)'],
	    ['⒮', '(s)'],
	    ['⒯', '(t)'],
	    ['⒰', '(u)'],
	    ['⒱', '(v)'],
	    ['⒲', '(w)'],
	    ['⒳', '(x)'],
	    ['⒴', '(y)'],
	    ['⒵', '(z)'],
	    ['Ⓐ', '(A)'],
	    ['Ⓑ', '(B)'],
	    ['Ⓒ', '(C)'],
	    ['Ⓓ', '(D)'],
	    ['Ⓔ', '(E)'],
	    ['Ⓕ', '(F)'],
	    ['Ⓖ', '(G)'],
	    ['Ⓗ', '(H)'],
	    ['Ⓘ', '(I)'],
	    ['Ⓙ', '(J)'],
	    ['Ⓚ', '(K)'],
	    ['Ⓛ', '(L)'],
	    ['Ⓝ', '(N)'],
	    ['Ⓞ', '(O)'],
	    ['Ⓟ', '(P)'],
	    ['Ⓠ', '(Q)'],
	    ['Ⓡ', '(R)'],
	    ['Ⓢ', '(S)'],
	    ['Ⓣ', '(T)'],
	    ['Ⓤ', '(U)'],
	    ['Ⓥ', '(V)'],
	    ['Ⓦ', '(W)'],
	    ['Ⓧ', '(X)'],
	    ['Ⓨ', '(Y)'],
	    ['Ⓩ', '(Z)'],
	    ['ⓐ', '(a)'],
	    ['ⓑ', '(b)'],
	    ['ⓒ', '(b)'],
	    ['ⓓ', '(c)'],
	    ['ⓔ', '(e)'],
	    ['ⓕ', '(f)'],
	    ['ⓖ', '(g)'],
	    ['ⓗ', '(h)'],
	    ['ⓘ', '(i)'],
	    ['ⓙ', '(j)'],
	    ['ⓚ', '(k)'],
	    ['ⓛ', '(l)'],
	    ['ⓜ', '(m)'],
	    ['ⓝ', '(n)'],
	    ['ⓞ', '(o)'],
	    ['ⓟ', '(p)'],
	    ['ⓠ', '(q)'],
	    ['ⓡ', '(r)'],
	    ['ⓢ', '(s)'],
	    ['ⓣ', '(t)'],
	    ['ⓤ', '(u)'],
	    ['ⓥ', '(v)'],
	    ['ⓦ', '(w)'],
	    ['ⓧ', '(x)'],
	    ['ⓨ', '(y)'],
	    ['ⓩ', '(z)'],
	    // Maltese
	    ['Ċ', 'C'],
	    ['ċ', 'c'],
	    ['Ġ', 'G'],
	    ['ġ', 'g'],
	    ['Ħ', 'H'],
	    ['ħ', 'h'],
	    ['Ż', 'Z'],
	    ['ż', 'z'],
	    // Numbers
	    ['𝟎', '0'],
	    ['𝟏', '1'],
	    ['𝟐', '2'],
	    ['𝟑', '3'],
	    ['𝟒', '4'],
	    ['𝟓', '5'],
	    ['𝟔', '6'],
	    ['𝟕', '7'],
	    ['𝟖', '8'],
	    ['𝟗', '9'],
	    ['𝟘', '0'],
	    ['𝟙', '1'],
	    ['𝟚', '2'],
	    ['𝟛', '3'],
	    ['𝟜', '4'],
	    ['𝟝', '5'],
	    ['𝟞', '6'],
	    ['𝟟', '7'],
	    ['𝟠', '8'],
	    ['𝟡', '9'],
	    ['𝟢', '0'],
	    ['𝟣', '1'],
	    ['𝟤', '2'],
	    ['𝟥', '3'],
	    ['𝟦', '4'],
	    ['𝟧', '5'],
	    ['𝟨', '6'],
	    ['𝟩', '7'],
	    ['𝟪', '8'],
	    ['𝟫', '9'],
	    ['𝟬', '0'],
	    ['𝟭', '1'],
	    ['𝟮', '2'],
	    ['𝟯', '3'],
	    ['𝟰', '4'],
	    ['𝟱', '5'],
	    ['𝟲', '6'],
	    ['𝟳', '7'],
	    ['𝟴', '8'],
	    ['𝟵', '9'],
	    ['𝟶', '0'],
	    ['𝟷', '1'],
	    ['𝟸', '2'],
	    ['𝟹', '3'],
	    ['𝟺', '4'],
	    ['𝟻', '5'],
	    ['𝟼', '6'],
	    ['𝟽', '7'],
	    ['𝟾', '8'],
	    ['𝟿', '9'],
	    ['①', '1'],
	    ['②', '2'],
	    ['③', '3'],
	    ['④', '4'],
	    ['⑤', '5'],
	    ['⑥', '6'],
	    ['⑦', '7'],
	    ['⑧', '8'],
	    ['⑨', '9'],
	    ['⑩', '10'],
	    ['⑪', '11'],
	    ['⑫', '12'],
	    ['⑬', '13'],
	    ['⑭', '14'],
	    ['⑮', '15'],
	    ['⑯', '16'],
	    ['⑰', '17'],
	    ['⑱', '18'],
	    ['⑲', '19'],
	    ['⑳', '20'],
	    ['⑴', '1'],
	    ['⑵', '2'],
	    ['⑶', '3'],
	    ['⑷', '4'],
	    ['⑸', '5'],
	    ['⑹', '6'],
	    ['⑺', '7'],
	    ['⑻', '8'],
	    ['⑼', '9'],
	    ['⑽', '10'],
	    ['⑾', '11'],
	    ['⑿', '12'],
	    ['⒀', '13'],
	    ['⒁', '14'],
	    ['⒂', '15'],
	    ['⒃', '16'],
	    ['⒄', '17'],
	    ['⒅', '18'],
	    ['⒆', '19'],
	    ['⒇', '20'],
	    ['⒈', '1.'],
	    ['⒉', '2.'],
	    ['⒊', '3.'],
	    ['⒋', '4.'],
	    ['⒌', '5.'],
	    ['⒍', '6.'],
	    ['⒎', '7.'],
	    ['⒏', '8.'],
	    ['⒐', '9.'],
	    ['⒑', '10.'],
	    ['⒒', '11.'],
	    ['⒓', '12.'],
	    ['⒔', '13.'],
	    ['⒕', '14.'],
	    ['⒖', '15.'],
	    ['⒗', '16.'],
	    ['⒘', '17.'],
	    ['⒙', '18.'],
	    ['⒚', '19.'],
	    ['⒛', '20.'],
	    ['⓪', '0'],
	    ['⓫', '11'],
	    ['⓬', '12'],
	    ['⓭', '13'],
	    ['⓮', '14'],
	    ['⓯', '15'],
	    ['⓰', '16'],
	    ['⓱', '17'],
	    ['⓲', '18'],
	    ['⓳', '19'],
	    ['⓴', '20'],
	    ['⓵', '1'],
	    ['⓶', '2'],
	    ['⓷', '3'],
	    ['⓸', '4'],
	    ['⓹', '5'],
	    ['⓺', '6'],
	    ['⓻', '7'],
	    ['⓼', '8'],
	    ['⓽', '9'],
	    ['⓾', '10'],
	    ['⓿', '0'],
	    // Punctuation
	    ['🙰', '&'],
	    ['🙱', '&'],
	    ['🙲', '&'],
	    ['🙳', '&'],
	    ['🙴', '&'],
	    ['🙵', '&'],
	    ['🙶', '"'],
	    ['🙷', '"'],
	    ['🙸', '"'],
	    ['‽', '?!'],
	    ['🙹', '?!'],
	    ['🙺', '?!'],
	    ['🙻', '?!'],
	    ['🙼', '/'],
	    ['🙽', '\\'],
	    // Alchemy
	    ['🜇', 'AR'],
	    ['🜈', 'V'],
	    ['🜉', 'V'],
	    ['🜆', 'VR'],
	    ['🜅', 'VF'],
	    ['🜩', '2'],
	    ['🜪', '5'],
	    ['🝡', 'f'],
	    ['🝢', 'W'],
	    ['🝣', 'U'],
	    ['🝧', 'V'],
	    ['🝨', 'T'],
	    ['🝪', 'V'],
	    ['🝫', 'MB'],
	    ['🝬', 'VB'],
	    ['🝲', '3B'],
	    ['🝳', '3B'],
	    // Emojis
	    ['💯', '100'],
	    ['🔙', 'BACK'],
	    ['🔚', 'END'],
	    ['🔛', 'ON!'],
	    ['🔜', 'SOON'],
	    ['🔝', 'TOP'],
	    ['🔞', '18'],
	    ['🔤', 'abc'],
	    ['🔠', 'ABCD'],
	    ['🔡', 'abcd'],
	    ['🔢', '1234'],
	    ['🔣', 'T&@%'],
	    ['#️⃣', '#'],
	    ['*️⃣', '*'],
	    ['0️⃣', '0'],
	    ['1️⃣', '1'],
	    ['2️⃣', '2'],
	    ['3️⃣', '3'],
	    ['4️⃣', '4'],
	    ['5️⃣', '5'],
	    ['6️⃣', '6'],
	    ['7️⃣', '7'],
	    ['8️⃣', '8'],
	    ['9️⃣', '9'],
	    ['🔟', '10'],
	    ['🅰️', 'A'],
	    ['🅱️', 'B'],
	    ['🆎', 'AB'],
	    ['🆑', 'CL'],
	    ['🅾️', 'O'],
	    ['🅿', 'P'],
	    ['🆘', 'SOS'],
	    ['🅲', 'C'],
	    ['🅳', 'D'],
	    ['🅴', 'E'],
	    ['🅵', 'F'],
	    ['🅶', 'G'],
	    ['🅷', 'H'],
	    ['🅸', 'I'],
	    ['🅹', 'J'],
	    ['🅺', 'K'],
	    ['🅻', 'L'],
	    ['🅼', 'M'],
	    ['🅽', 'N'],
	    ['🆀', 'Q'],
	    ['🆁', 'R'],
	    ['🆂', 'S'],
	    ['🆃', 'T'],
	    ['🆄', 'U'],
	    ['🆅', 'V'],
	    ['🆆', 'W'],
	    ['🆇', 'X'],
	    ['🆈', 'Y'],
	    ['🆉', 'Z']
	];
	replacements$1.default = replacements;
	return replacements$1;
}

var hasRequiredTransliterate;

function requireTransliterate () {
	if (hasRequiredTransliterate) return transliterate;
	hasRequiredTransliterate = 1;
	var __importDefault = (transliterate && transliterate.__importDefault) || function (mod) {
	    return (mod && mod.__esModule) ? mod : { "default": mod };
	};
	Object.defineProperty(transliterate, "__esModule", { value: true });
	transliterate.default = transliterate$1;
	// https://github.com/sindresorhus/transliterate
	const lodash_deburr_1 = __importDefault(requireLodash_deburr());
	const escape_string_regexp_1 = __importDefault(requireEscapeStringRegexp());
	const replacements_1 = __importDefault(requireReplacements$1());
	const doCustomReplacements = (string, replacements) => {
	    for (const [key, value] of replacements) {
	        // TODO: Use `String#replaceAll()` when targeting Node.js 16.
	        string = string.replace(new RegExp((0, escape_string_regexp_1.default)(key), 'g'), value);
	    }
	    return string;
	};
	function transliterate$1(string, options) {
	    if (typeof string !== 'string') {
	        throw new TypeError(`Expected a string, got \`${typeof string}\``);
	    }
	    options = Object.assign({ customReplacements: [] }, options);
	    const customReplacements = new Map([
	        ...replacements_1.default,
	        ...options.customReplacements
	    ]);
	    string = string.normalize();
	    string = doCustomReplacements(string, customReplacements);
	    string = (0, lodash_deburr_1.default)(string);
	    return string;
	}
	return transliterate;
}

var replacements = {};

var hasRequiredReplacements;

function requireReplacements () {
	if (hasRequiredReplacements) return replacements;
	hasRequiredReplacements = 1;
	Object.defineProperty(replacements, "__esModule", { value: true });
	const overridableReplacements = [
	    ['&', ' and '],
	    ['🦄', ' unicorn '],
	    ['♥', ' love ']
	];
	replacements.default = overridableReplacements;
	return replacements;
}

var hasRequiredSlugify;

function requireSlugify () {
	if (hasRequiredSlugify) return slugify;
	hasRequiredSlugify = 1;
	var __importDefault = (slugify && slugify.__importDefault) || function (mod) {
	    return (mod && mod.__esModule) ? mod : { "default": mod };
	};
	Object.defineProperty(slugify, "__esModule", { value: true });
	slugify.default = slugify$1;
	slugify.slugifyWithCounter = slugifyWithCounter;
	// https://github.com/sindresorhus/slugify
	const escape_string_regexp_1 = __importDefault(requireEscapeStringRegexp());
	const index_1 = __importDefault(requireTransliterate());
	const replacements_1 = __importDefault(requireReplacements());
	const decamelize = (str) => {
	    return (str
	        // Separate capitalized words.
	        .replace(/([A-Z]{2,})(\d+)/g, '$1 $2')
	        .replace(/([a-z\d]+)([A-Z]{2,})/g, '$1 $2')
	        .replace(/([a-z\d])([A-Z])/g, '$1 $2')
	        .replace(/([A-Z]+)([A-Z][a-z\d]+)/g, '$1 $2'));
	};
	const removeMootSeparators = (str, separator) => {
	    const escapedSeparator = (0, escape_string_regexp_1.default)(separator);
	    return str
	        .replace(new RegExp(`${escapedSeparator}{2,}`, 'g'), separator)
	        .replace(new RegExp(`^${escapedSeparator}|${escapedSeparator}$`, 'g'), '');
	};
	const defOpt = {
	    separator: '-',
	    lowercase: true,
	    decamelize: true,
	    customReplacements: [],
	    preserveLeadingUnderscore: false,
	    preserveTrailingDash: false
	};
	function slugify$1(string, options = {}) {
	    if (typeof string !== 'string') {
	        throw new TypeError(`Expected a string, got \`${typeof string}\``);
	    }
	    options = Object.assign(defOpt, options);
	    const shouldPrependUnderscore = options.preserveLeadingUnderscore && string.startsWith('_');
	    const shouldAppendDash = options.preserveTrailingDash && string.endsWith('-');
	    const customReplacements = new Map([
	        ...replacements_1.default,
	        ...options.customReplacements
	    ]);
	    string = (0, index_1.default)(string, { customReplacements });
	    if (options.decamelize) {
	        string = decamelize(string);
	    }
	    let patternSlug = /[^a-zA-Z\d]+/g;
	    if (options.lowercase) {
	        string = string.toLowerCase();
	        patternSlug = /[^a-z\d]+/g;
	    }
	    string = string.replace(patternSlug, options.separator);
	    string = string.replace(/\\/g, '');
	    if (options.separator) {
	        string = removeMootSeparators(string, options.separator);
	    }
	    if (shouldPrependUnderscore) {
	        string = `_${string}`;
	    }
	    if (shouldAppendDash) {
	        string = `${string}-`;
	    }
	    return string;
	}
	function slugifyWithCounter() {
	    const occurrences = new Map();
	    const countable = (str, options) => {
	        str = slugify$1(str, options);
	        if (!str) {
	            return '';
	        }
	        const stringLower = str.toLowerCase();
	        const numberless = occurrences.get(stringLower.replace(/(?:-\d+?)+?$/, '')) || 0;
	        const counter = occurrences.get(stringLower);
	        occurrences.set(stringLower, typeof counter === 'number' ? counter + 1 : 1);
	        const newCounter = occurrences.get(stringLower) || 2;
	        if (newCounter >= 2 || numberless > 2) {
	            str = `${str}-${newCounter}`;
	        }
	        return str;
	    };
	    countable.reset = () => {
	        occurrences.clear();
	    };
	    return countable;
	}
	return slugify;
}

var hasRequiredToHtml;

function requireToHtml () {
	if (hasRequiredToHtml) return toHtml;
	hasRequiredToHtml = 1;
	(function (exports) {
		var __importDefault = (toHtml && toHtml.__importDefault) || function (mod) {
		    return (mod && mod.__esModule) ? mod : { "default": mod };
		};
		Object.defineProperty(exports, "__esModule", { value: true });
		exports.converterOpt = void 0;
		exports.default = renderShowdown;
		exports.renderMarkdownIt = renderMarkdownIt;
		const markdown_it_1 = __importDefault(requireIndex_cjs$5());
		const markdown_it_abbr_1 = __importDefault(requireIndex_cjs$4());
		const markdown_it_anchor_1 = __importDefault(require$$2);
		const markdown_it_attrs_1 = __importDefault(requireMarkdownItAttrs());
		const markdown_it_footnote_1 = __importDefault(requireIndex_cjs$3());
		const markdown_it_mark_1 = __importDefault(requireIndex_cjs$2());
		const markdown_it_sub_1 = __importDefault(requireIndex_cjs$1());
		const markdown_it_sup_1 = __importDefault(requireIndex_cjs());
		const showdown_1 = __importDefault(requireShowdown());
		const index_1 = __importDefault(requireSlugify());
		exports.converterOpt = {
		    strikethrough: true,
		    tables: true,
		    tablesHeaderId: true
		};
		/**
		 * Transform markdown string to html string
		 * @package showdown
		 * @param str
		 */
		function renderShowdown(str) {
		    const converter = new showdown_1.default.Converter(exports.converterOpt);
		    return converter.makeHtml(str);
		}
		const md = new markdown_it_1.default({
		    html: true,
		    // Autoconvert URL-like text to links
		    linkify: false,
		    // Enable some language-neutral replacement + quotes beautification
		    // For the full list of replacements, see https://github.com/markdown-it/markdown-it/blob/master/lib/rules_core/replacements.js
		    typographer: true,
		    breaks: false,
		    langPrefix: 'language-' // CSS language prefix for fenced blocks. Can be useful for external highlighters.
		});
		//md.linkify.set({ fuzzyEmail: false }); // disables converting email to link
		md.use(markdown_it_sup_1.default)
		    .use(markdown_it_sub_1.default)
		    .use(markdown_it_mark_1.default)
		    .use(markdown_it_abbr_1.default)
		    .use(markdown_it_footnote_1.default)
		    .use(markdown_it_attrs_1.default, {
		    allowedAttributes: ['id', 'class', /^regex.*$/]
		})
		    .use(markdown_it_anchor_1.default, {
		    permalink: markdown_it_anchor_1.default.permalink.headerLink(),
		    slugify: (s) => (0, index_1.default)(s)
		});
		md.renderer.rules.footnote_block_open = () => '<h4 class="mt-3">Footnotes</h4>\n' +
		    '<section class="footnotes">\n' +
		    '<ol class="footnotes-list">\n';
		/**
		 * Render markdown to html using `markdown-it`, `markdown-it-attrs`, `markdown-it-anchors`, `markdown-it-sup`, `markdown-it-sub`, `markdown-it-mark`, `markdown-it-footnote`, `markdown-it-abbr`
		 * * {@link https://www.npmjs.com/package/markdown-it-attrs}
		 * * {@link https://www.npmjs.com/package/markdown-it-attrs}
		 * * {@link https://www.npmjs.com/package/markdown-it-anchors}
		 * * {@link https://www.npmjs.com/package/markdown-it-sup}
		 * * {@link https://www.npmjs.com/package/markdown-it-sub}
		 * * {@link https://www.npmjs.com/package/markdown-it-mark}
		 * * {@link https://www.npmjs.com/package/markdown-it-footnote}
		 * * {@link https://www.npmjs.com/package/markdown-it-abbr}
		 * @param str
		 * @returns
		 */
		function renderMarkdownIt(str) {
		    return md.render(str);
		} 
	} (toHtml));
	return toHtml;
}

var toHtmlExports = requireToHtml();

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

hexoPostParser.setConfig(hexo.config);
// Queue to hold the pages to be processed
var pageQueue = [];
var isProcessing = false;
function getCachePath(page) {
    var hash = "empty-hash";
    if (page && "full_source" in page && page.full_source)
        sbgUtility.md5FileSync(page.full_source);
    if (hash === "empty-hash") {
        if (page.content) {
            hash = sbgUtility.md5(page.content);
        }
        else if (page._content) {
            hash = sbgUtility.md5(page._content);
        }
    }
    var result = path.join(process.cwd(), "tmp/hexo-themes/caches/post-" + sanitize((page.title || new String(page._id)).substring(0, 100) + "-" + hash));
    sbgUtility.fs.ensureDirSync(path.dirname(result));
    return result;
}
/**
 * Preprocess a page and save its parsed result to a cache file
 *
 * @param page - The page object to be processed.
 * @param callback - The callback that handles the result or error.
 */
function metadataProcess(page, callback) {
    if (!page.full_source) {
        hexo.log.warn("fail parse metadata from", page.title || page.subtitle || page.permalink);
        return;
    }
    var cachePath = getCachePath(page);
    if (sbgUtility.fs.existsSync(cachePath) && getHexoArgs() === "generate") {
        // skip already parsed metadata
        return;
    }
    hexoPostParser
        .parsePost(page.full_source, { fix: true })
        .then(function (result) {
        if (!result.metadata)
            return;
        // Remove keys with undefined or null values
        var keys = Object.keys(result.metadata);
        for (var i = 0; i < keys.length; i++) {
            var key = keys[i];
            if (result.metadata[key] === undefined || result.metadata[key] === null) {
                delete result.metadata[key];
            }
        }
        if (!result.metadata.permalink && page.permalink) {
            result.metadata.permalink = require$$2$1.url_for.bind(hexo)(page.path);
        }
        try {
            sbgUtility.fs.writeFileSync(cachePath, sbgUtility.jsonStringifyWithCircularRefs(result));
            callback(null, { result: result, cachePath: cachePath }); // Pass cachePath in the callback
        }
        catch (error) {
            hexo.log.error("fail save post info", error.message);
            if (sbgUtility.fs.existsSync(cachePath))
                sbgUtility.fs.rm(cachePath, { force: true, recursive: true });
            callback(error, null); // Invoke callback on error
        }
    })
        .catch(function (_err) {
        try {
            if (page.full_source) {
                var parse = hexoPostParser.parsePostFM(page.full_source);
                if (parse.attributes) {
                    var html = toHtmlExports.renderMarkdownIt(parse.body);
                    var $_1 = require$$0.load(html);
                    if (!parse.attributes.description)
                        parse.attributes.description = $_1.text().slice(0, 150);
                    if (!parse.attributes.thumbnail) {
                        parse.attributes.thumbnail =
                            "https://rawcdn.githack.com/dimaslanjaka/public-source/6a0117ddb2ea327c80dbcc7327cceca1e1b7794e/images/no-image-svgrepo-com.svg";
                        var imgTags = $_1("img").filter(function (i, el) {
                            var src = $_1(el).attr("src");
                            return typeof src === "string" && src.trim() !== "";
                        });
                        // Get a random img tag
                        if (imgTags.length > 0) {
                            var randomIndex = Math.floor(Math.random() * imgTags.length);
                            var randomImgSrc = $_1(imgTags[randomIndex]).attr("src");
                            parse.attributes.thumbnail = randomImgSrc;
                        }
                        else {
                            parse.attributes.thumbnail =
                                "https://rawcdn.githack.com/dimaslanjaka/public-source/6a0117ddb2ea327c80dbcc7327cceca1e1b7794e/images/no-image-svgrepo-com.svg";
                        }
                    }
                    if (!parse.attributes.permalink) {
                        if (page.permalink) {
                            parse.attributes.permalink = page.permalink;
                        }
                        else {
                            // const parsePermalink = hexoPostParser.parsePermalink(page.full_source as string, hexo.config as any);
                            // if (parsePermalink && parsePermalink.length > 0) parse.attributes.permalink = parsePermalink;
                        }
                    }
                    var result = { metadata: parse.attributes, rawbody: parse.body };
                    // Remove keys with undefined or null values
                    var keys = Object.keys(result.metadata);
                    for (var i = 0; i < keys.length; i++) {
                        var key = keys[i];
                        if (result.metadata[key] === undefined || result.metadata[key] === null) {
                            delete result.metadata[key];
                        }
                    }
                    try {
                        sbgUtility.fs.writeFileSync(cachePath, sbgUtility.jsonStringifyWithCircularRefs(result));
                        callback(null, { result: result, cachePath: cachePath }); // Pass cachePath in the callback
                    }
                    catch (error) {
                        hexo.log.error("fail save post info", error.message);
                        if (sbgUtility.fs.existsSync(cachePath))
                            sbgUtility.fs.rm(cachePath, { force: true, recursive: true });
                        callback(error, null); // Invoke callback on error
                    }
                }
            }
        }
        catch (err) {
            callback(new Error("fallback metadata failed: " + err.message), null); // Catch parsePost errors
        }
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
        path.join(hexo.base_dir, "tmp/hexo-post-parser"),
        path.join(hexo.base_dir, "tmp/hexo-renderers"),
        path.join(hexo.base_dir, "tmp/hexo-themes"),
        path.join(hexo.base_dir, "tmp/hexo-shortcodes")
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

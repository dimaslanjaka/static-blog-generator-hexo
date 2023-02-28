const { parse } = require('url');
const _toArray = require('lodash.toarray');
const yaml = require('yaml');
const fs = require('fs');
const path = require('path');
/**
 * @type {import('hexo').Config}
 */
const config = yaml.parse(
  fs.readFileSync(path.join(process.cwd(), '_config.yml')).toString()
);
const THEME_LOCATION = path.join(process.cwd(), 'themes', config.theme);
const THEME_SCRIPTS = path.join(THEME_LOCATION, 'scripts');

// loadScripts(THEME_SCRIPTS);

/**
 * load all scripts
 * @param {string} base
 */
function loadScripts(base) {
  if (fs.existsSync(base)) {
    fs.readdirSync(base).forEach((p) => {
      const full = path.join(base, p);
      if (fs.statSync(full).isFile()) {
        require(full);
      } else if (fs.statSync(full).isDirectory()) {
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
  } else if (Array.isArray(value)) {
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
    const hexo = this;
    const { config, theme, url_for, __ } = hexo;
    const theme_config = {
      hostname: parse(config.url).hostname || config.url,
      root: config.root
    };
    const hexo_config = {
      homepage: url_for('/')
    };
    return {
      theme: Object.assign(theme, theme_config),
      project: Object.assign(config, hexo_config)
    };
  });

  hexo.extend.helper.register('json_data', function (name, ...data) {
    const json = data.length === 1 ? data[0] : Object.assign({}, ...data);
    return `<script class="json-config" data-name="${name}" type="application/json">${JSON.stringify(json).replace(/</g, '\\u003c')}</script>`;
  });

  hexo.extend.helper.register(
    'getPosts',
    /**
     * @returns
     */
    function () {
      /** @type {import('hexo')} */
      const hexo = this;
      const { page } = hexo;
      return page.posts;
    }
  );

  hexo.extend.helper.register('getAuthor', function (author, fallback) {
    if (typeof author === 'string') return author;
    if (!author) return fallback;
    if (author.name) return author.name;
    if (author.nick) return author.nick;
    if (author.nickname) return author.nickname;
  });

  hexo.extend.helper.register(
    'getPostByLabel',
    /**
     * hexo get post by key with name
     * @param {'tags'|'categories'} by
     * @param {string[]} filternames
     * @returns {Record<string, string>[]}
     */
    function (by, filternames) {
      /** @type {import('hexo')} */
      const hexo = this;
      /**
       * @type {any[]}
       */
      const data = hexo.site[by].data;
      if (Array.isArray(data)) {
        const map = filternames
          .map((filtername) => {
            const filter = data.filter(
              ({ name }) =>
                String(name).toLowerCase() == filtername.toLowerCase()
            );
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
      return [];
    }
  );
}

module.exports = { toArray, isObject, registerCustomHelper };

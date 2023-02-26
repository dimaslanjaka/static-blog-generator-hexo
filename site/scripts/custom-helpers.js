/* global hexo */
'use strict';

const { parse } = require('url');

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
    return [];
  }
);

'use strict';

const ejs = require('ejs');
const { toArray } = require('./custom-helpers');

/**
 * hexo-renderer-ejs
 * @param {import('hexo')} hexo
 */
function rendererEjs(hexo) {
  if (ejs.filters) ejs.filters.toArray = toArray;
  function ejsRenderer(data, locals) {
    return ejs.render(
      data.text,
      Object.assign({ filename: data.path }, locals)
    );
  }

  ejsRenderer.compile = function (data) {
    return ejs.compile(data.text, {
      filename: data.path
    });
  };

  hexo.extend.renderer.register('ejs', 'html', ejsRenderer, true);
}

module.exports = { rendererEjs };

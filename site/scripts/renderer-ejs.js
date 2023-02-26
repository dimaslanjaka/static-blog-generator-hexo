'use strict';

const ejs = require('ejs');

/**
 * hexo-renderer-ejs
 * @param {import('hexo')} hexo
 */
function rendererEjs(hexo) {
  function ejsRenderer(data, locals) {
    return ejs.render(data.text, Object.assign({ filename: data.path }, locals));
  }

  ejsRenderer.compile = function (data) {
    return ejs.compile(data.text, {
      filename: data.path
    });
  };

  hexo.extend.renderer.register('ejs', 'html', ejsRenderer, true);
}

module.exports = { rendererEjs };

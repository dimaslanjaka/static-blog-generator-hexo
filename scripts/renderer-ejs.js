// hexo-renderer-ejs
/* global hexo */
'use strict';

const ejs = require('ejs');

function ejsRenderer(data, locals) {
  return ejs.render(data.text, Object.assign({ filename: data.path }, locals));
}

ejsRenderer.compile = function (data) {
  return ejs.compile(data.text, {
    filename: data.path
  });
};

hexo.extend.renderer.register('ejs', 'html', ejsRenderer, true);

/* global hexo */

const { rendererNunjucks } = require('./renderer-nunjucks');
const { rendererEjs } = require('./renderer-ejs');
const { rendererPug } = require('./renderer-pug');
const { rendererStylus } = require('./renderer-stylus');
const ansiColors = require('ansi-colors');
const { registerCustomHelper } = require('./custom-helpers');
if (typeof hexo === 'undefined') {
  global.hexo = {};
}

const logname = ansiColors.magenta('hexo-renderers');

if (typeof hexo !== 'undefined') {
  const config = hexo.config;
  const renderers = config['renderers'];
  // register custom helper
  registerCustomHelper(hexo);
  if (Array.isArray(renderers)) {
    for (let i = 0; i < renderers.length; i++) {
      const renderer = renderers[i];
      switch (renderer) {
        case 'ejs':
          rendererEjs(hexo);
          break;
        case 'pug':
          rendererPug(hexo);
          break;
        case 'stylus':
          rendererStylus(hexo);
          break;
        case 'nunjucks':
        case 'njk':
          rendererNunjucks(hexo);
          break;
      }
    }
  } else {
    rendererNunjucks(hexo);
    rendererEjs(hexo);
    rendererPug(hexo);
    rendererStylus(hexo);
  }
} else {
  console.error(logname, 'not hexo instance');
}

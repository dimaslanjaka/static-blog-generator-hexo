const { rendererNunjucks } = require('./renderer-nunjucks');
const { rendererEjs } = require('./renderer-ejs');
const { rendererPug } = require('./renderer-pug');
const { rendererStylus } = require('./renderer-stylus');
const ansiColors = require('ansi-colors');
const { registerCustomHelper } = require('./custom-helpers');
const { rendererDartSass } = require('./renderer-dartsass');
const { rendererSass } = require('./renderer-sass');

const logname = ansiColors.magenta('hexo-renderers');

if (typeof hexo !== 'undefined') {
  global.hexo = hexo;
  const config = hexo.config;
  const renderers = config['renderers'];
  // register custom helper
  registerCustomHelper(hexo);

  // activate specific engine
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
        case 'dartsass':
          rendererDartSass(hexo);
          break;
        case 'sass':
          rendererSass(hexo);
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
    // activate all available engines
    rendererNunjucks(hexo);
    rendererEjs(hexo);
    rendererPug(hexo);
    rendererStylus(hexo);
    // rendererDartSass(hexo);
    rendererSass(hexo);
  }
} else {
  console.error(logname, 'not hexo instance');
}

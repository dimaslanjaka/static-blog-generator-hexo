/* global hexo */
'use strict';

const { rendererNunjucks } = require('./renderer-nunjucks');
const { rendererEjs } = require('./renderer-ejs');
const { rendererPug } = require('./renderer-pug');
const { rendererStylus } = require('./renderer-stylus');
if (typeof hexo === 'undefined') {
  global.hexo = {};
}

if (typeof hexo !== 'undefined') {
  // const { config } = hexo;
  // const { renderers } = config;
  /*
  const themeDir = path.join(__dirname, '../themes', hexo.config.theme);
const layoutDir = path.join(themeDir, 'layout');
  if (fs.existsSync(path.join(layoutDir, '_layout.njk'))) {
    rendererNunjucks(hexo);
  } else if (fs.existsSync(path.join(layoutDir, '_layout.ejs'))) {
    rendererEjs(hexo);
  } else if (fs.existsSync(path.join(layoutDir, '_layout.pug'))) {
    rendererPug(hexo);
  }
  */
  rendererNunjucks(hexo);
  rendererEjs(hexo);
  rendererPug(hexo);
  rendererStylus(hexo);
}

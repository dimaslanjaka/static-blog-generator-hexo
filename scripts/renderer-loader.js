/* global hexo */
'use strict';
const path = require('path');
const fs = require('fs');
const { rendererNunjucks } = require('./renderer-nunjucks');
const { rendererEjs } = require('./renderer-ejs');
const { rendererPug } = require('./renderer-pug');
if (typeof hexo === 'undefined') {
  global.hexo = {};
}

const themeDir = path.join(__dirname, '../themes', hexo.config.theme);
const layoutDir = path.join(themeDir, 'layout');

if (typeof hexo !== 'undefined') {
  if (fs.existsSync(path.join(layoutDir, '_layout.njk'))) {
    rendererNunjucks(hexo);
  } else if (fs.existsSync(path.join(layoutDir, '_layout.ejs'))) {
    rendererEjs(hexo);
  } else if (fs.existsSync(path.join(layoutDir, '_layout.pug'))) {
    rendererPug(hexo);
  }
}

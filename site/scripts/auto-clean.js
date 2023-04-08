/* global hexo */

'use strict';

/**
 * clean auto generated files inside .deploy_git
 */

const path = require('path');
const fs = require('fs-extra');

function isNumeric(str) {
  // Check if input is string
  if (typeof str != 'string') return false;

  // Use type coercion to parse the _entirety_ of the string
  // (`parseFloat` alone does not do this).
  // Also ensure that the strings whitespaces fail
  return !isNaN(str) && !isNaN(parseFloat(str));
}

hexo.extend.filter.register('after_generate', function () {
  const base = path.join(hexo.base_dir, '.deploy_git');
  const files = [
    'css',
    'style',
    'archives',
    'fonts',
    'lib',
    'hexo-seo-js',
    'js',
    'hexo-shortcodes-lib',
    'tags',
    'categories',
    'assets'
  ]
    .map((str) => path.join(base, str))
    .filter(fs.existsSync);
  files.forEach((p) => {
    // console.log('deleting', p);
    if (fs.existsSync(p)) fs.rmSync(p, { force: true, recursive: true });
  });

  // clean auto generated page
  const base_page = path.join(base, 'page');
  fs.readdirSync(base_page).forEach((file) => {
    const fullpath = path.join(base_page, file);
    if (isNumeric(file)) fs.rmSync(fullpath, { force: true, recursive: true });
  });
});

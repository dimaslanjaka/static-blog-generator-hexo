/**
 * clean auto generated files inside .deploy_git
 */

const path = require('path');
const fs = require('fs-extra');

hexo.extend.filter.register('after_generate', function () {
  const base = path.join(this.base_dir, '.deploy_git');
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
    console.log('deleting', p);
    fs.rmSync(p, { force: true, recursive: true });
  });
});

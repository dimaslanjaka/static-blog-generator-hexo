/* global hexo */

'use strict';

/**
 * clean auto generated files inside .deploy_git
 */

const path = require('path');
const fs = require('fs-extra');

hexo.extend.filter.register('after_generate', function () {
  // copy github-actions validator
  const base = path.join(hexo.base_dir, '.deploy_git');
  const source = path.join(base, 'github-actions');
  const dest = path.join(base, 'chimeraland', 'github-actions');
  fs.copySync(source, dest, { overwrite: true });
});

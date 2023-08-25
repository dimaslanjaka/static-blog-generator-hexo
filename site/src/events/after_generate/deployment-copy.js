const { path, fs } = require('sbg-utility');
const { hexoDir } = require('../../../config');

hexo.extend.filter.register('after_generate', function () {
  // copy public directory into .deploy_git
  const deploymentDir = path.join(hexoDir, '.deploy_git');
  const publicDir = path.join(hexoDir, 'public');
  fs.copy(publicDir, deploymentDir, {
    overwrite: true,
    dereference: true
  });
});

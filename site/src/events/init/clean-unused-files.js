const { path, fs } = require('sbg-utility');
const { hexoDir } = require('../../../config');
const Promise = require('bluebird');

// clean unused files in source/_posts

function cleanUnusedFilesInSourcePosts() {
  const files = ['.frontmatter', '.github', '.vscode', 'tmp', 'node_modules'].map((p) =>
    path.join(hexoDir, 'source/_posts', p)
  );

  return Promise.all(files).each((p) => {
    if (fs.existsSync(p)) {
      hexo.log.i('delete unused files', p);
      fs.rmSync(p, { recursive: true, force: true });
    }
  });
}

if (typeof hexo !== 'undefined') {
  hexo.extend.filter.register('after_init', cleanUnusedFilesInSourcePosts);
}

module.exports = { cleanUnusedFilesInSourcePosts };

const { path, fs } = require('sbg-utility');
const { hexoDir } = require('../../config');

// clean unused files in source/_posts

hexo.extend.filter.register('after_init', function () {
  const files = ['.frontmatter', '.github', '.vscode'].map((p) => path.join(hexoDir, 'source/_posts', p));

  files.forEach((p) => {
    if (fs.existsSync(p)) {
      hexo.log.i('delete unused files', p);
      fs.rmSync(p, { recursive: true, force: true });
    }
  });
});

const Hexo = require('hexo');
const { path } = require('sbg-utility');
const { hexoDir } = require('../config');

const hexo = new Hexo(hexoDir);
hexo.init().then(() => {
  hexo.load().then(() => {
    const relativePath = 'source/_posts/GitHub/actions-matrix-sequentally.md';
    hexo.post.render(path.join(hexo.base_dir, relativePath));
  });
});

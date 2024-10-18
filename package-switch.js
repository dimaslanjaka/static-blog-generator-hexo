const fs = require('fs');
const pkg = require('./package.json');
const path = require('path');
//D:\Repositories\static-blog-generator\packages\sbg-cli\test\post-copy.runner.ts
const local = {
  'sbg-api': 'file:../sbg-api/packages/sbg-api/release/sbg-api.tgz',
  'sbg-utility': 'file:../sbg-utility/packages/sbg-utility/release/sbg-utility.tgz'
};

const production = {
  'binary-collections': 'https://github.com/dimaslanjaka/bin/raw/fcd1121/releases/bin.tgz',
  '@types/hexo': 'https://github.com/dimaslanjaka/hexo/raw/fc1f9b7/releases/hexo.tgz',
  hexo: 'https://github.com/dimaslanjaka/hexo/raw/fc1f9b7/releases/hexo.tgz',
  'hexo-asset-link': 'https://github.com/dimaslanjaka/hexo/raw/fc1f9b7/releases/hexo-asset-link.tgz',
  'hexo-cli': 'https://github.com/dimaslanjaka/hexo/raw/fc1f9b7/releases/hexo-cli.tgz',
  'hexo-front-matter': 'https://github.com/dimaslanjaka/hexo/raw/fc1f9b7/releases/hexo-front-matter.tgz',
  'hexo-log': 'https://github.com/dimaslanjaka/hexo/raw/fc1f9b7/releases/hexo-log.tgz',
  'hexo-util': 'https://github.com/dimaslanjaka/hexo/raw/fc1f9b7/releases/hexo-util.tgz',
  warehouse: 'https://github.com/dimaslanjaka/hexo/raw/fc1f9b7/releases/warehouse.tgz',
  'hexo-seo': 'https://github.com/dimaslanjaka/hexo-seo/raw/8c814eb/release/hexo-seo.tgz',
  'markdown-it': 'https://github.com/dimaslanjaka/markdown-it/raw/95599a5/release/markdown-it.tgz',
  'hexo-renderers': 'https://github.com/dimaslanjaka/hexo-renderers/raw/3f727de/release/hexo-renderers.tgz',
  'hexo-shortcodes': 'https://github.com/dimaslanjaka/hexo-shortcodes/raw/f70a1c0/release/hexo-shortcodes.tgz',
  'static-blog-generator':
    'https://github.com/dimaslanjaka/static-blog-generator/raw/253a8b5033ffc0611d68d9f247595af077a86c1b/packages/static-blog-generator/release/static-blog-generator.tgz',
  'instant-indexing':
    'https://github.com/dimaslanjaka/static-blog-generator/raw/253a8b5033ffc0611d68d9f247595af077a86c1b/packages/instant-indexing/release/instant-indexing.tgz',
  'sbg-utility':
    'https://github.com/dimaslanjaka/static-blog-generator/raw/253a8b5033ffc0611d68d9f247595af077a86c1b/packages/sbg-utility/release/sbg-utility.tgz',
  'sbg-api':
    'https://github.com/dimaslanjaka/static-blog-generator/raw/253a8b5033ffc0611d68d9f247595af077a86c1b/packages/sbg-api/release/sbg-api.tgz',
  'sbg-cli':
    'https://github.com/dimaslanjaka/static-blog-generator/raw/253a8b5033ffc0611d68d9f247595af077a86c1b/packages/sbg-cli/release/sbg-cli.tgz',
  'sbg-server':
    'https://github.com/dimaslanjaka/static-blog-generator/raw/253a8b5033ffc0611d68d9f247595af077a86c1b/packages/sbg-server/release/sbg-server.tgz',
  'nodejs-package-types':
    'https://github.com/dimaslanjaka/nodejs-package-types/raw/a2e797bc27975cba20ef4c87547841e6341bfcf4/release/nodejs-package-types.tgz',
  'hexo-post-parser': 'https://github.com/dimaslanjaka/hexo-post-parser/raw/5b752e3/release/hexo-post-parser.tgz',
  'cross-spawn': 'https://github.com/dimaslanjaka/node-cross-spawn/raw/80999ac/release/cross-spawn.tgz',
  'git-command-helper': 'https://github.com/dimaslanjaka/git-command-helper/raw/8849c22/release/git-command-helper.tgz',
  '@types/git-command-helper':
    'https://github.com/dimaslanjaka/git-command-helper/raw/8849c22/release/git-command-helper.tgz',
  'hexo-generator-redirect':
    'https://github.com/dimaslanjaka/hexo-generator-redirect/raw/0885394/release/hexo-generator-redirect.tgz'
};

// node package-switch.js [local|production]
const args = process.argv.slice(2);

if (args.includes('local')) {
  pkg.resolutions = Object.assign(production, local);
} else {
  pkg.resolutions = production;
}

fs.writeFileSync(path.join(__dirname, 'package.json'), JSON.stringify(pkg, null, 2) + '\n');

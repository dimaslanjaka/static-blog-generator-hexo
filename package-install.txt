const path = require('path');
const fs = require('fs');
const ws_dev = {
  dependencies: {
    'hexo-renderers': 'workspace:^',
    'hexo-seo': '../../hexo-seo',
    'hexo-shortcodes': '../../hexo-shortcodes',
    'hexo-generator-redirect': 'workspace:^'
  },
  workspaces: [
    //'packages/hexo-shortcodes',
    //'packages/hexo-shortcodes/test',
    'packages/hexo-generator-redirect',
    'packages/hexo-renderers',
    //path.resolve(__dirname, '../nodejs-packages-types'),
    //path.resolve(__dirname, '../nodejs-packages-types/hexo'),
    //path.resolve(__dirname, '../nodejs-packages-types/through2'),
    'site',
    'site/multisite/chimeraland',
    'site/src-posts'
  ]
};
const ws_prod = {
  dependencies: {
    'hexo-renderers': 'https://github.com/dimaslanjaka/hexo-renderers/tarball/master',
    'hexo-shortcodes': 'https://github.com/dimaslanjaka/hexo-shortcodes/raw/master/package/release/hexo-shortcodes.tgz',
    'hexo-generator-redirect': 'https://github.com/dimaslanjaka/hexo-generator-redirect/raw/master/release/hexo-generator-redirect.tgz',
    'hexo-seo': 'https://github.com/dimaslanjaka/hexo-seo/tarball/master'
  },
  workspaces: ['site', 'site/multisite/chimeraland', 'site/src-posts']
};

const rootpkg = path.resolve(__dirname, 'package.json');
const webpkg = path.resolve(__dirname, 'site/package.json');
const argv = process.argv.slice(2);

replace_pkg(argv.includes('--dev') ? 'dev' : 'prod');

function replace_pkg(mode) {
  const wspkg = read_pkg(rootpkg);
  let ws = mode == 'prod' ? ws_prod : ws_dev;
  wspkg.workspaces = ws.workspaces;
  fs.writeFileSync(rootpkg, JSON.stringify(wspkg, null, 2));
  const sitepkg = read_pkg(webpkg);
  for (const pkgname in ws.dependencies) {
    const version = ws.dependencies[pkgname];
    sitepkg.dependencies[pkgname] = version;
  }
  fs.writeFileSync(webpkg, JSON.stringify(sitepkg, null, 2));
}

function read_pkg(f) {
  return JSON.parse(fs.readFileSync(f));
}

const path = require('upath');
const minimist = require('minimist');
const fs = require('fs');
const ws_dev = {
  dependencies: {
    'hexo-renderers': 'workspace:^',
    'hexo-seo': 'workspace:^',
    'hexo-shortcodes': 'workspace:^',
    'hexo-generator-redirect': 'workspace:^'
  },
  workspaces: [
    'packages/hexo-shortcodes',
    'packages/hexo-shortcodes/test',
    'packages/hexo-generator-redirect',
    path.resolve(__dirname, '../hexo-seo'),
    'packages/hexo-renderers',
    path.resolve(__dirname, '../nodejs-packages-types'),
    path.resolve(__dirname, '../nodejs-packages-types/hexo'),
    path.resolve(__dirname, '../nodejs-packages-types/through2'),
    'site',
    'site/multisite/chimeraland',
    'site/src-posts'
  ]
};
const ws_prod = {
  dependencies: {
    'hexo-renderers': path.resolve(__dirname, './packages/hexo-renderers'),
    'hexo-shortcodes': path.resolve(__dirname, './packages/hexo-shortcodes'),
    'hexo-generator-redirect': path.resolve(__dirname, './packages/hexo-generator-redirect'),
    'hexo-seo': 'https://github.com/dimaslanjaka/hexo-seo/tarball/master'
  },
  workspaces: [
    'packages/hexo-shortcodes',
    'packages/hexo-shortcodes/test',
    'packages/hexo-generator-redirect',
    'packages/hexo-renderers',
    'site',
    'site/multisite/chimeraland',
    'site/src-posts'
  ]
};

const rootpkg = path.resolve(__dirname, 'package.json');
const webpkg = path.resolve(__dirname, 'site/package.json');

replace_pkg('prod');

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

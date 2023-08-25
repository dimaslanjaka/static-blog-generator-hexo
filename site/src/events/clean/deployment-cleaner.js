const { path, fs, jsonStringifyWithCircularRefs, jsonParseWithCircularRefs } = require('sbg-utility');
const { hexoDir } = require('../../../config');

/** database json file */
const dbfile = path.join(hexoDir, 'tmp/clean-list.json');
// auto create database file
if (!fs.existsSync(dbfile)) {
  fs.writeFileSync(dbfile, jsonStringifyWithCircularRefs([]));
}

/**
 * files to clean
 * @type {string[]}
 */
const files = jsonParseWithCircularRefs(fs.readFileSync(dbfile, 'utf-8'));

hexo.extend.filter.register('after_clean', function () {
  // remove list files
  const absolutes = files.map((p) => path.join(hexoDir, '.deploy_git', p));
  absolutes.forEach((p) => {
    if (fs.existsSync(p)) {
      hexo.log.i('delete', p);
      fs.rmSync(p, { recursive: true, force: true });
    }
  });
  // clean tmp folder
  // fs.rmSync(path.join(hexoDir, 'tmp'), { recursive: true, force: true });
});

hexo.extend.filter.register('after_post_render', function (data) {
  // hexo.log.i('after post render', data.full_source);
  return data;
});

hexo.extend.filter.register('before_post_render', function (data) {
  // data.title = data.title.toLowerCase();
  // const relativePath = path.toUnix(data.full_source).replace(hexoDir, '');
  const perm = new URL(data.permalink);
  const ext = path.extname(perm.pathname);
  if (ext.length > 0 && !files.includes(perm.pathname)) {
    // push file
    files.push(perm.pathname);
    // push asset folder
    files.push(perm.pathname.replace(new RegExp(path.extname(perm.pathname) + '$'), ''));
  }
  if (ext.length < 3) {
    hexo.log.i('invalid permalink', ext, perm.pathname);
  } else {
    // save list into database
    fs.writeFileSync(dbfile, jsonStringifyWithCircularRefs(files));
  }
  return data;
});

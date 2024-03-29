const glob = require('glob');
const path = require('upath');
const Promise = require('bluebird');
const { fs, writefile } = require('sbg-utility');
const parser = require('hexo-post-parser');

// copy only some post into source/_posts

const dest = path.join(__dirname, 'source/_posts');
// begin copy
const base = path.join(__dirname, 'src-posts');
Promise.all(
  glob.glob(['**/*.*'], {
    ignore: ['**/.*', '**/node_modules/**'],
    cwd: base,
    posix: true
  })
)
  .filter((file) => {
    if (/^.git\//gim.test(file)) return false;
    if (/(license|changelog|readme).md$/gim.test(file)) return false;
    if (file.trim().length === 0) return false;
    // only allow these patterns
    if (/^[0-9]{1,4}\//.test(file)) return true;
    //if (/^2017\//.test(file)) return true;
    //if (/^hexo-theme-unit-test\//.test(file)) return true;
    // skip by default
    return false;
  })
  .map(async (str) => {
    const o = {
      origin: str,
      src: path.join(base, str),
      dest: path.join(dest, str).replace('hexo-theme-unit-test/', '')
    };
    // create dirname of post dest
    const dir = path.dirname(o.dest);
    if (!(await fs.exists(dir))) {
      await fs.mkdir(dir, { recursive: true });
    }
    return o;
  })
  .then(async (files) => {
    // create base dest directory
    if (!(await fs.exists(dest))) await fs.mkdir(dest, { recursive: true });
    // empty source/_posts
    await fs.emptyDir(dest);

    return files;
  })
  .each(async (o) => {
    if (o.origin.endsWith('.md')) {
      try {
        const parse = await parser.parsePost(o.src, {
          sourceFile: o.src,
          cache: false,
          fix: true,
          shortcodes: true
        });
        const build = parser.buildPost(parse);
        writefile(o.dest, build);
      } catch {
        console.log('fail parse', o.origin);
      }
    } else {
      await fs.copy(o.src, o.dest, { overwrite: true, dereference: true });
    }
  });

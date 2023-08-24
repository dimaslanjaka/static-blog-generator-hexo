const glob = require('glob');
const path = require('path');
const Promise = require('bluebird');
const { fs } = require('sbg-utility');

// copy only some post into source/_posts

const dest = path.join(__dirname, 'source/_posts');
// begin copy
const base = path.join(__dirname, 'src-posts');
Promise.all(glob.glob(['**/*.*'], { ignore: ['**/.*', '**/node_modules/**'], cwd: base, posix: true }))
  .filter((result) => {
    if (/^.git\//gim.test(result)) return false;
    if (/(license|changelog|readme).md$/gim.test(result)) return false;
    // only allow YYYY/MM/files
    if (/^[0-9]{1,4}\//.test(result)) return true;
    return false;
  })
  .map((str) => {
    return {
      src: path.join(base, str),
      dest: path.join(dest, str)
    };
  })
  .then(async (o) => {
    // empty source/_posts
    await fs.emptyDir(dest);
    return o;
  })
  .each(async (o) => {
    return fs.copy(o.src, o.dest);
  });

const glob = require('glob');
const path = require('path');
const Promise = require('bluebird');
const parse = require('hexo-post-parser');
//const moment = require('moment-timezone');
const { writefile } = require('sbg-utility');

const base = path.join(__dirname, 'src-posts');
Promise.all(glob.glob(['**/*.md'], { ignore: ['**/.*', '**/node_modules/**'], cwd: base, posix: true }))
  .filter((result) => {
    if (/^.git\//gim.test(result)) return false;
    if (/(license|changelog|readme).md$/gim.test(result)) return false;
    return true;
  })
  .map((str) => path.join(base, str))
  .each(async (file) => {
    try {
      // const date = moment(new Date()).format();
      const post = await parse.parsePost(file);
      if (post.metadata.id) delete post.metadata.id;
      if (post.metadata.uuid) delete post.metadata.uuid;
      const build = parse.buildPost(post);
      writefile(file, build);
    } catch {
      console.log('cannot parse', file);
    }
  });

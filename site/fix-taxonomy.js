const Bluebird = require('bluebird');
const glob = require('glob');
const parse = require('hexo-post-parser');
const yaml = require('yaml');
const { path, fs } = require('sbg-utility');
const moment = require('moment-timezone');

const scrape = glob.glob('src-posts/**/*.md', {
  absolute: true,
  ignore: ['**/node_modules/**', '**/License*', '**/readme*']
});

Bluebird.all(scrape).each(async (file) => {
  try {
    const post = await parse.parsePost(fs.readFileSync(file, 'utf-8'), {
      sourceFile: file,
      fix: true,
      config: yaml.parse(fs.readFileSync(path.join(__dirname, '_config.yml'), 'utf-8'))
    });

    // lowercase taxonomy
    if (post.metadata) {
      let save;
      if ('category' in post.metadata) {
        post.metadata.category = lowercaseTaxonomy(post.metadata.category);
        save = true;
      }
      if ('categories' in post.metadata) {
        post.metadata.categories = lowercaseTaxonomy(post.metadata.categories);
        save = true;
      }
      if ('tags' in post.metadata) {
        post.metadata.tags = lowercaseTaxonomy(post.metadata.tags);
        save = true;
      }
      if (Object.keys(post.metadata).length === 0) {
        console.log('meta empty', file);
      }

      if (save) {
        post.metadata.updated = moment(new Date()).tz('Asia/Jakarta').format();
        const build = parse.buildPost(post);
        fs.writeFileSync(file, build);
      }
    }
  } catch (e) {
    console.log('fail parse', file);
  }
});

/**
 *
 * @param {string[]} arr
 */
function lowercaseTaxonomy(arr) {
  return arr.map((str) => str.toLowerCase());
}

const tagName = 'gist';
const { default: axios } = require('axios');

async function fetch_raw_code(gist_id) {
  const url = `https://gist.githubusercontent.com/${gist_id}/raw`;
  const res = await axios.get(url);
  return res.data;
}

hexo.extend.tag.register(tagName, (args) => {
  /**
   * @type {import('hexo')}
   */
  const self = this;
  return new Promise((resolve, reject) => {
    console.log(args);
    console.log(self.config);

    resolve('');
  });
});

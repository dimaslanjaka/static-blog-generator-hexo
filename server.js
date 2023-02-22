process.cwd = () => __dirname;
const Hexo = require('hexo');
const hexo = new Hexo(__dirname);
const axios = require('axios').default;

hexo.init().then(() => {
  hexo.load().then(() => {
    hexo.call('server', ['-p', '4000']).then(() => {
      axios.get('http://localhost:4000');
    });
  });
});

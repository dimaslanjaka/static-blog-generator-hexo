process.cwd = () => __dirname;
const Hexo = require('hexo');
const hexo = new Hexo(__dirname);
const axios = require('axios').default;
const { spawn } = require('child_process');

hexo.init().then(() => {
  hexo.load().then(() => {
    const child = spawn('hexo', ['server', '-p', '4000'], { stdio: 'inherit', shell: true });
    child.on('message', function (msg) {
      if (msg.includes('localhost:4000')) {
        setTimeout(() => {
          axios.get('http://localhost:4000');
        }, 3000);
      }
    });
  });
});

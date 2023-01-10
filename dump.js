const promiseSpawn = require('hexo-util/dist/spawn');
const path = require('path');

(async () => {
  const sbgPath = path.join(__dirname, 'packages/static-blog-generator');
  // await fs.rm(path.join(sbgPath, 'dist'), { recursive: true, force: true });
  await promiseSpawn('npm', ['run', 'build:nopack'], { cwd: sbgPath });
  const sbg = require('./packages/static-blog-generator');
  const api = new sbg.Application(__dirname);
  console.log(api.config.permalink, api.config.cwd);
})();

const glob = require('glob');
const path = require('path');
const Promise = require('bluebird');

const base = path.join(__dirname, '.deploy_git/page');
Promise.all(glob.glob(['**/*.*'], { ignore: ['**/.git*'], cwd: base, posix: true }))
  .filter((result) => {
    if (/^[0-9]{1,4}\//.test(result)) return false;
    if (/^node_modules\//.test(result)) return false;
    if (/^.git\//.test(result)) return false;
    return true;
  })
  .then((result) => {
    console.log(result);
  });

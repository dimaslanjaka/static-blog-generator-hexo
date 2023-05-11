const fs = require('fs');
const path = require('upath');
const spawn = require('cross-spawn');

const deployDir = path.join(__dirname, '.deploy_git');
const remote = 'https://github.com/dimaslanjaka/dimaslanjaka.github.io.git';

(async () => {
  if (!fs.existsSync(deployDir)) {
    console.log('cloning .deploy_git');
    await spawn.async('git', ['clone', remote, '.deploy_git'], {
      cwd: __dirname
    });
  }
})();

const fs = require('fs');
const path = require('upath');
const spawn = require('cross-spawn');

const tokenBase = `https://${process.env.ACCESS_TOKEN}@github.com`

const cfg = [
  {
    dest: path.join(__dirname, '.deploy_git'),
    branch: 'master',
    remote: `${tokenBase}/dimaslanjaka/dimaslanjaka.github.io.git`
  },
  {
    dest: path.join(__dirname, '.deploy_git/docs'),
    branch: 'master',
    remote: `${tokenBase}/dimaslanjaka/docs.git`
  }
];

(async () => {
  for (let i = 0; i < cfg.length; i++) {
    const { dest, remote, branch } = cfg[i];
    if (!fs.existsSync(dest)) {
      const destArg = dest.replace(path.toUnix(__dirname), '');
      console.log('cloning', remote, destArg);
      await spawn.async('git', ['clone', remote, destArg], {
        cwd: __dirname
      });
    }
  }
})();

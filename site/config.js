const { default: extractSubmodule } = require('git-command-helper/dist/utils/extract-submodule');
const { path, fs } = require('sbg-utility');

const hexoDir = __dirname;
const tokenBase = new URL(`https://${process.env.ACCESS_TOKEN}@github.com`);
const deployConfig = [
  {
    dest: path.join(hexoDir, '.deploy_git'),
    branch: 'master',
    remote: `${tokenBase}/dimaslanjaka/dimaslanjaka.github.io`,
    folderName: '.deploy_git',
    callback: async function (github) {
      console.log('cwd', path.toUnix(github.cwd).replace(path.toUnix(hexoDir), ''));
      console.log('remote', github.remote);
      console.log('branch', github.branch);
      // update submodule
      // await spawn.async('git', ['submodule', 'update', '-i', '-r'], github.spawnOpt({ cwd: github.cwd }));
      if (!fs.existsSync(path.join(github.cwd, '.gitmodules'))) {
        const totalFiles = fs.readdirSync(path.join(github.cwd)).length;
        if (totalFiles < 10) {
          console.log('re-init');
          await github.spawn('git', ['init']);
          if ((await github.getremote()).push.url !== github.remote && github.remote) {
            await github.setremote(github.remote);
          }
          await github.fetch(['origin', github.branch]);
          await github.setbranch(github.branch);
        }
      }
      // pull
      await github.pull(['--recurse-submodule']);
      if (fs.existsSync(path.join(github.cwd, '.gitmodules'))) {
        const submodules = extractSubmodule(path.join(github.cwd, '.gitmodules'));
        for (let i = 0; i < submodules.length; i++) {
          const submodule = submodules[i];
          console.log(submodule.cwd, submodule.branch, submodule.github?.branch);
        }
      }
    }
  },
  {
    dest: path.join(hexoDir, '.deploy_git/docs'),
    folderName: 'docs',
    branch: 'master',
    remote: `${tokenBase}/dimaslanjaka/docs`,
    callback: async function (github) {
      console.log('cwd', path.toUnix(github.cwd).replace(path.toUnix(hexoDir), ''));
      console.log('remote', github.remote);
      console.log('branch', github.branch);
    }
  },
  {
    dest: path.join(hexoDir, '.deploy_git/chimeraland'),
    branch: 'gh-pages',
    folderName: 'chimeraland',
    remote: `${tokenBase}/dimaslanjaka/chimeraland`,
    callback: async function (github) {
      console.log('cwd', path.toUnix(github.cwd).replace(path.toUnix(hexoDir), ''));
      console.log('remote', github.remote);
      console.log('branch', github.branch);
    }
  },
  {
    dest: path.join(hexoDir, '.deploy_git/page'),
    branch: 'gh-pages',
    folderName: 'page',
    remote: `${tokenBase}/dimaslanjaka/page`,
    callback: async function (github) {
      console.log('cwd', path.toUnix(github.cwd).replace(path.toUnix(hexoDir), ''));
      console.log('remote', github.remote);
      console.log('branch', github.branch);
    }
  },
  {
    dest: path.join(hexoDir, '.deploy_git/Web-Manajemen'),
    branch: 'gh-pages',
    folderName: 'Web-Manajemen',
    remote: `${tokenBase}/dimaslanjaka/Web-Manajemen`,
    callback: async function (github) {
      console.log('cwd', path.toUnix(github.cwd).replace(path.toUnix(hexoDir), ''));
      console.log('remote', github.remote);
      console.log('branch', github.branch);
    }
  }
];

module.exports = { hexoDir, deployConfig };

const { spawn } = require('cross-spawn');
const { path } = require('sbg-utility');

const hexoDir = __dirname;
const tokenBase = new URL(`https://${process.env.ACCESS_TOKEN}@github.com`);
const deployConfig = [
  {
    dest: path.join(hexo.base_dir, '.deploy_git'),
    branch: 'master',
    remote: `${tokenBase}/dimaslanjaka/dimaslanjaka.github.io`,
    folderName: '.deploy_git',
    callback: async function (github) {
      console.log('cwd', path.toUnix(github.cwd).replace(path.toUnix(hexo.base_dir), ''));
      console.log('remote', github.remote);
      console.log('branch', github.branch);
      // update submodule
      await spawn.async('git', ['submodule', 'update', '-i', '-r'], github.spawnOpt({ cwd: github.cwd }));
    }
  },
  {
    dest: path.join(hexo.base_dir, '.deploy_git/docs'),
    folderName: 'docs',
    branch: 'master',
    remote: `${tokenBase}/dimaslanjaka/docs`,
    callback: async function (github) {
      console.log('cwd', path.toUnix(github.cwd).replace(path.toUnix(hexo.base_dir), ''));
      console.log('remote', github.remote);
      console.log('branch', github.branch);
    }
  },
  {
    dest: path.join(hexo.base_dir, '.deploy_git/chimeraland'),
    branch: 'gh-pages',
    folderName: 'chimeraland',
    remote: `${tokenBase}/dimaslanjaka/chimeraland`,
    callback: async function (github) {
      console.log('cwd', path.toUnix(github.cwd).replace(path.toUnix(hexo.base_dir), ''));
      console.log('remote', github.remote);
      console.log('branch', github.branch);
    }
  },
  {
    dest: path.join(hexo.base_dir, '.deploy_git/page'),
    branch: 'gh-pages',
    folderName: 'page',
    remote: `${tokenBase}/dimaslanjaka/page`,
    callback: async function (github) {
      console.log('cwd', path.toUnix(github.cwd).replace(path.toUnix(hexo.base_dir), ''));
      console.log('remote', github.remote);
      console.log('branch', github.branch);
    }
  },
  {
    dest: path.join(hexo.base_dir, '.deploy_git/Web-Manajemen'),
    branch: 'gh-pages',
    folderName: 'Web-Manajemen',
    remote: `${tokenBase}/dimaslanjaka/Web-Manajemen`,
    callback: async function (github) {
      console.log('cwd', path.toUnix(github.cwd).replace(path.toUnix(hexo.base_dir), ''));
      console.log('remote', github.remote);
      console.log('branch', github.branch);
    }
  }
];

module.exports = { hexoDir, deployConfig };

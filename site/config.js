const spawn = require('cross-spawn');
const { path } = require('sbg-utility');
const dotenv = require('dotenv');

dotenv.config({ quiet: true, override: true });

const hexoDir = path.toUnix(__dirname);
const tokenBase = new URL(
  `https://${process.env.ACCESS_TOKEN || process.env.GITHUB_TOKEN}@github.com`
);
const deployConfig = [
  {
    dest: path.join(hexoDir, '.deploy_git'),
    branch: 'master',
    remote: `${tokenBase}/dimaslanjaka/dimaslanjaka.github.io`,
    folderName: '.deploy_git',
    /** @param {import('git-command-helper').default} [github] */
    callback: async function (github) {
      if (!github) return;
      const _relative_cwd = path
        .toUnix(github.cwd)
        .replace(path.toUnix(hexoDir), '');
      // update submodules
      // try {
      //   console.log('Updating submodules...');
      //   await spawn.async(
      //     'npx',
      //     [
      //       '-y',
      //       'binary-collections@https://raw.githubusercontent.com/dimaslanjaka/bin/master/releases/bin.tgz',
      //       'submodule-install'
      //     ],
      //     { cwd: github.cwd, shell: true, stdio: 'inherit', env: process.env }
      //   );
      //   console.log('Submodules updated successfully.');
      // } catch (error) {
      //   console.error('Failed to update submodules:', error);
      // }
      /*if (!fs.existsSync(path.join(github.cwd, '.gitmodules'))) {
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
      }*/
      // pull
      // await github.pull(['--recurse-submodule']);
      /*if (fs.existsSync(path.join(github.cwd, '.gitmodules'))) {
        const submodules = extractSubmodule(path.join(github.cwd, '.gitmodules'));
        for (let i = 0; i < submodules.length; i++) {
          const submodule = submodules[i];
          console.log(submodule.cwd, submodule.branch, submodule.github?.branch);
        }
      }*/
    }
  },
  {
    dest: path.join(hexoDir, '.deploy_git/docs'),
    folderName: 'docs',
    branch: 'master',
    remote: `${tokenBase}/dimaslanjaka/docs`,
    /** @param {import('git-command-helper').default} [github] */
    callback: async function (github) {
      if (!github) return;
      const _relative_cwd = path
        .toUnix(github.cwd)
        .replace(path.toUnix(hexoDir), '');
    }
  },
  {
    dest: path.join(hexoDir, '.deploy_git/chimeraland'),
    branch: 'gh-pages',
    folderName: 'chimeraland',
    remote: `${tokenBase}/dimaslanjaka/chimeraland`,
    /** @param {import('git-command-helper').default} [github] */
    callback: async function (github) {
      if (!github) return;
      const _relative_cwd = path
        .toUnix(github.cwd)
        .replace(path.toUnix(hexoDir), '');
    }
  },
  {
    dest: path.join(hexoDir, '.deploy_git/page'),
    branch: 'gh-pages',
    folderName: 'page',
    remote: `${tokenBase}/dimaslanjaka/page`,
    /** @param {import('git-command-helper').default} [github] */
    callback: async function (github) {
      if (!github) return;
      const _relative_cwd = path
        .toUnix(github.cwd)
        .replace(path.toUnix(hexoDir), '');
    }
  },
  {
    dest: path.join(hexoDir, '.deploy_git/Web-Manajemen'),
    branch: 'gh-pages',
    folderName: 'Web-Manajemen',
    remote: `${tokenBase}/dimaslanjaka/Web-Manajemen`,
    /** @param {import('git-command-helper').default} [github] */
    callback: async function (github) {
      if (!github) return;
      const _relative_cwd = path
        .toUnix(github.cwd)
        .replace(path.toUnix(hexoDir), '');
    }
  },
  {
    dest: path.join(hexoDir, '.deploy_git/tags'),
    branch: 'gh-pages',
    folderName: 'tags',
    remote: `${tokenBase}/dimaslanjaka/tags`,
    /** @param {import('git-command-helper').default} [github] */
    callback: async function (github) {
      if (!github) return;
      const _relative_cwd = path
        .toUnix(github.cwd)
        .replace(path.toUnix(hexoDir), '');
      // delete all files in the repository using git command
      // try {
      //   console.log('Deleting old files in tags repository:', _relative_cwd);
      //   await github.spawn('git', ['rm', '-rf', '.']);
      //   console.log('Old files deleted successfully for', _relative_cwd);
      // } catch (error) {
      //   console.error('Failed to delete old files for', _relative_cwd, error);
      // }
    }
  },
  {
    dest: path.join(hexoDir, '.deploy_git/categories'),
    branch: 'gh-pages',
    folderName: 'categories',
    remote: `${tokenBase}/dimaslanjaka/categories`
  },
  {
    dest: path.join(hexoDir, '.deploy_git/archives'),
    branch: 'gh-pages',
    folderName: 'archives',
    remote: `${tokenBase}/dimaslanjaka/archives`
  },
  {
    dest: path.join(hexoDir, '.deploy_git/assets'),
    branch: 'master',
    folderName: 'assets',
    remote: `${tokenBase}/dimaslanjaka/assets`
  }
];

module.exports = { hexoDir, deployConfig };

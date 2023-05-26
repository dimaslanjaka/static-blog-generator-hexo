import spawn from 'cross-spawn';
import fs from 'fs-extra';
import git, { SpawnOptions } from 'git-command-helper';
import Hexo from 'hexo';
import path from 'upath';

/**
 * prepare all sources
 */

const hexo = new Hexo(__dirname, { silent: true });

const isGithubCI =
  typeof process.env['GITHUB_WORKFLOW'] === 'string' && typeof process.env['GITHUB_WORKFLOW_SHA'] === 'string';
async function setUserEmail(options: SpawnOptions) {
  if (isGithubCI) {
    // set username and email on github workflow
    await spawn.spawnAsync('git', ['config', '--global', 'user.name', "'dimaslanjaka'"], options);
    await spawn.spawnAsync('git', ['config', '--global', 'user.email', "'dimaslanjaka@gmail.com'"], options);
  }
}

(async () => {
  // init hexo
  await hexo.init();

  await setUserEmail({ cwd: __dirname });

  // copy views into theme directory
  try {
    fs.copySync(path.join(__dirname, 'views'), hexo.theme_dir, {
      overwrite: true,
      /** useful for symlink by yarn workspace */
      dereference: true
    });
  } catch (e) {
    console.log(e.message);
  }

  // clone deployment directory

  const tokenBase = `https://${process.env.ACCESS_TOKEN}@github.com`;

  const cfg = [
    {
      dest: path.join(hexo.base_dir, '.deploy_git'),
      branch: 'master',
      remote: `${tokenBase}/dimaslanjaka/dimaslanjaka.github.io.git`,
      callback: async function (github: git) {
        // reset
        await github.reset(github.branch);
        // update submodule
        await spawn.async(
          'git',
          ['submodule', 'update', '-i', '-r'],
          github.spawnOpt({ cwd: github.cwd, stdio: 'inherit' })
        );
      }
    },
    {
      dest: path.join(hexo.base_dir, '.deploy_git/docs'),
      branch: 'master',
      remote: `${tokenBase}/dimaslanjaka/docs.git`,
      callback: async function (github: git) {
        // reset
        await github.reset(github.branch);
      }
    },
    {
      dest: path.join(hexo.base_dir, '.deploy_git/chimeraland'),
      branch: 'gh-pages',
      remote: `${tokenBase}/dimaslanjaka/chimeraland.git`,
      callback: async function (github: git) {
        // reset
        await github.reset(github.branch);
      }
    },
    {
      dest: path.join(hexo.base_dir, '.deploy_git/page'),
      branch: 'gh-pages',
      remote: `${tokenBase}/dimaslanjaka/page.git`,
      callback: async function (github: git) {
        // reset
        await github.reset(github.branch);
      }
    }
  ];
  for (let i = 0; i < cfg.length; i++) {
    const { dest, remote, branch, callback } = cfg[i];
    if (!fs.existsSync(dest)) {
      const destArg = dest.replace(path.toUnix(hexo.base_dir), '');
      console.log('cloning', destArg);
      await spawn.async('git', ['clone', '-b', branch, remote, destArg], {
        cwd: hexo.base_dir
      });
    }
    if (fs.existsSync(dest)) {
      const github = new git(dest);
      await setUserEmail({ cwd: dest });
      await spawn.async('git', ['checkout', '-f', 'origin/' + branch], { cwd: dest });
      if (typeof callback === 'function') {
        await callback(github);
      }
    }
  }
})();

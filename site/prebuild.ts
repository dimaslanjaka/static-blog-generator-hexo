import spawn from 'cross-spawn';
import * as dotenv from 'dotenv';
import fs from 'fs-extra';
import git, { SpawnOptions } from 'git-command-helper';
import Hexo from 'hexo';
import path from 'upath';
dotenv.config({ path: __dirname });

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
    const info = cfg[i];
    if (!fs.existsSync(info.dest)) {
      const destArg = info.dest.replace(path.toUnix(hexo.base_dir), '');
      console.log('cloning', destArg);
      await spawn.async('git', ['clone', '-b', info.branch, info.remote, destArg], {
        cwd: hexo.base_dir
      });
    }
    if (fs.existsSync(info.dest)) {
      const github = new git(info.dest);
      await setUserEmail({ cwd: info.dest });
      await github.setbranch(info.branch);
      await spawn.async('git', ['checkout', '-f', 'origin/' + info.branch], { cwd: info.dest });
      if (typeof info.callback === 'function') {
        await info.callback(github);
      }
    }
  }

  // copy github-actions validator
  const base = path.join(hexo.base_dir, '.deploy_git');
  const source = path.join(base, 'github-actions');
  const dest = path.join(base, 'chimeraland', 'github-actions');
  fs.copySync(source, dest, { overwrite: true });

  /**
   * clean auto generated files inside .deploy_git
   */
  const files = [
    'css',
    'style',
    'archives',
    'fonts',
    'lib',
    'hexo-seo-js',
    'js',
    'hexo-shortcodes-lib',
    'tags',
    'categories',
    'assets'
  ]
    .map((str) => path.join(base, str))
    .filter(fs.existsSync);
  files.forEach((p) => {
    // console.log('deleting', p);
    if (fs.existsSync(p)) fs.rmSync(p, { force: true, recursive: true });
  });

  // clean auto generated page
  const base_page = path.join(base, 'page');
  fs.readdirSync(base_page).forEach((file) => {
    const fullpath = path.join(base_page, file);
    if (isNumeric(file)) fs.rmSync(fullpath, { force: true, recursive: true });
  });
})();

function isNumeric(str: string | number) {
  const int = typeof str === 'number' ? str : parseInt(str);
  const float = typeof str === 'number' ? str : parseFloat(str);

  // Use type coercion to parse the _entirety_ of the string
  // (`parseFloat` alone does not do this).
  // Also ensure that the strings whitespaces fail
  return !isNaN(int) && !isNaN(float);
}

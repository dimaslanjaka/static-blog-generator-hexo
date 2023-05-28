import spawn from 'cross-spawn';
import * as dotenv from 'dotenv';
import fs from 'fs-extra';
import git, { SpawnOptions } from 'git-command-helper';
import Hexo from 'hexo';
import path from 'upath';
dotenv.config({ path: path.join(__dirname, '.env'), override: true });

/**
 * prepare all sources
 */

const hexo = new Hexo(__dirname, { silent: true });

const isGithubCI =
  typeof process.env['GITHUB_WORKFLOW'] === 'string' && typeof process.env['GITHUB_WORKFLOW_SHA'] === 'string';
/**
 * fix git config
 * @param options
 */
async function fixGitConfig(options: SpawnOptions) {
  if (isGithubCI) {
    // set username and email on github workflow
    await spawn.spawnAsync('git', ['config', '--global', 'user.name', "'dimaslanjaka'"], options);
    await spawn.spawnAsync('git', ['config', '--global', 'user.email', "'dimaslanjaka@gmail.com'"], options);
    // set local user email
    await spawn.spawnAsync('git', ['config', 'user.name', "'dimaslanjaka'"], options);
    await spawn.spawnAsync('git', ['config', 'user.email', "'dimaslanjaka@gmail.com'"], options);
  }
  // set EOL LF
  await spawn.spawnAsync('git', ['config', 'core.eol', 'lf'], options);
  await spawn.spawnAsync('git', ['config', 'core.autocrlf', 'input'], options);
  await spawn.spawnAsync('git', ['config', 'checkout-index', '--force', '--all'], options);
}

function killProcess(name: string) {
  const isWin = process.platform === 'win32';
  if (isWin) {
    spawn.sync('taskkill', ['/f', '/im', name]);
  } else {
    spawn.sync('killall', [name]);
  }
}

const tokenBase = `https://${process.env.ACCESS_TOKEN}@github.com`;

const cfg = [
  {
    dest: path.join(hexo.base_dir, '.deploy_git'),
    branch: 'master',
    remote: `${tokenBase}/dimaslanjaka/dimaslanjaka.github.io.git`,
    callback: async function (github: git) {
      // reset
      //await github.reset(github.branch);
      // update submodule
      await spawn.async('git', ['submodule', 'update', '-i', '-r'], github.spawnOpt({ cwd: github.cwd }));
    }
  },
  {
    dest: path.join(hexo.base_dir, '.deploy_git/docs'),
    branch: 'master',
    remote: `${tokenBase}/dimaslanjaka/docs.git`,
    callback: async function (github: git) {
      // reset
      //await github.reset(github.branch);
    }
  },
  {
    dest: path.join(hexo.base_dir, '.deploy_git/chimeraland'),
    branch: 'gh-pages',
    remote: `${tokenBase}/dimaslanjaka/chimeraland.git`,
    callback: async function (github: git) {
      // reset
      //await github.reset(github.branch);
    }
  },
  {
    dest: path.join(hexo.base_dir, '.deploy_git/page'),
    branch: 'gh-pages',
    remote: `${tokenBase}/dimaslanjaka/page.git`,
    callback: async function (github: git) {
      // reset
      //await github.reset(github.branch);
    }
  },
  {
    dest: path.join(hexo.base_dir, '.deploy_git/Web-Manajemen'),
    branch: 'gh-pages',
    remote: `${tokenBase}/dimaslanjaka/Web-Manajemen.git`,
    callback: async function (github: git) {
      // reset
      //await github.reset(github.branch);
    }
  }
];

(async () => {
  // init hexo
  await hexo.init();

  await fixGitConfig({ cwd: __dirname });

  // copy views into theme directory
  fs.copySync(path.join(__dirname, 'views'), hexo.theme_dir, {
    overwrite: true,
    /** useful for symlink by yarn workspace */
    dereference: true
  });

  // clone deployment directory

  for (let i = 0; i < cfg.length; i++) {
    const info = cfg[i];
    if (!fs.existsSync(info.dest)) {
      // clone
      const destArg = info.dest.replace(path.toUnix(hexo.base_dir), '');
      console.log('cloning', {
        arg: destArg,
        dest: info.dest
      });
      await spawn.async('git', ['clone', '-b', info.branch, info.remote, destArg], {
        cwd: hexo.base_dir
      });
    }

    console.log(info.dest, fs.existsSync(info.dest));
    if (fs.existsSync(info.dest)) {
      const indexLock = path.join(info.dest, '.git/index.lock');
      if (fs.existsSync(indexLock)) {
        killProcess('git');
        fs.rmSync(indexLock);
      }
      const github = new git(info.dest);
      await fixGitConfig({ cwd: info.dest });

      const hasRemote = (await spawn.async('git', ['config', 'remote.origin.url'], { cwd: info.dest })).output;
      // await spawn.async('git', ['remote', 'remove', 'origin'], { cwd: info.dest,  });
      if (hasRemote.trim() !== info.remote) {
        console.log('update remote');
        await spawn.async('git', ['remote', 'add', 'origin', info.remote], { cwd: info.dest });
      }
      console.log('fetching...');
      await spawn.async('git', ['fetch'], { cwd: info.dest });
      await spawn.async('git', ['fetch', '--all', '--prune'], { cwd: info.dest });
      console.log('checkout', info.branch);
      await spawn.async('git', ['checkout', '-f', info.branch], { cwd: info.dest });
      console.log('resetting...');
      await spawn.async('git', ['reset', '--hard', 'origin/' + info.branch], { cwd: info.dest });
      if (typeof info.callback === 'function') {
        console.log('running callback...');
        await info.callback(github);
      }
    }
  }

  // copy github-actions validator
  const deployDir = path.join(hexo.base_dir, '.deploy_git');
  const source = path.join(deployDir, 'github-actions');
  const dest = path.join(deployDir, 'chimeraland', 'github-actions');
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
    .map((str) => path.join(deployDir, str))
    .filter(fs.existsSync);
  files.forEach((p) => {
    // console.log('deleting', p);
    if (fs.existsSync(p)) fs.rmSync(p, { force: true, recursive: true });
  });

  // clean auto generated page
  const base_page = path.join(deployDir, 'page');
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

import spawn from 'cross-spawn';
import * as dotenv from 'dotenv';
import fs from 'fs-extra';
import git, { SpawnOptions } from 'git-command-helper';
import extractSubmodule from 'git-command-helper/dist/utils/extract-submodule';
import Hexo from 'hexo';
import path from 'upath';

const envPath = path.join(__dirname, '.env');
if (fs.existsSync(envPath)) {
  dotenv.config({ path: envPath, override: true });
}

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

const tokenBase = new URL(`https://${process.env.ACCESS_TOKEN}@github.com`);

const cfg = [
  {
    dest: path.join(hexo.base_dir, '.deploy_git'),
    branch: 'master',
    remote: `${tokenBase}/dimaslanjaka/dimaslanjaka.github.io.git`,
    callback: async function (github: git) {
      console.log('running callback');
      console.log('remote', github.remote);
      console.log('branch', github.branch);
      // update submodule
      await spawn.async('git', ['submodule', 'update', '-i', '-r'], github.spawnOpt({ cwd: github.cwd }));
    }
  },
  {
    dest: path.join(hexo.base_dir, '.deploy_git/docs'),
    branch: 'master',
    remote: `${tokenBase}/dimaslanjaka/docs.git`,
    callback: async function (github: git) {
      console.log('running callback');
      console.log('remote', github.remote);
      console.log('branch', github.branch);
    }
  },
  {
    dest: path.join(hexo.base_dir, '.deploy_git/chimeraland'),
    branch: 'gh-pages',
    remote: `${tokenBase}/dimaslanjaka/chimeraland.git`,
    callback: async function (github: git) {
      console.log('running callback');
      console.log('remote', github.remote);
      console.log('branch', github.branch);
    }
  },
  {
    dest: path.join(hexo.base_dir, '.deploy_git/page'),
    branch: 'gh-pages',
    remote: `${tokenBase}/dimaslanjaka/page.git`,
    callback: async function (github: git) {
      console.log('running callback');
      console.log('remote', github.remote);
      console.log('branch', github.branch);
    }
  },
  {
    dest: path.join(hexo.base_dir, '.deploy_git/Web-Manajemen'),
    branch: 'gh-pages',
    remote: `${tokenBase}/dimaslanjaka/Web-Manajemen.git`,
    callback: async function (github: git) {
      console.log('running callback');
      console.log('remote', github.remote);
      console.log('branch', github.branch);
    }
  }
];

(async function () {
  // init hexo
  await hexo.init();
  // run pre-build script
  await prebuild(hexo);

  const github = new git({
    cwd: path.join(hexo.base_dir, '.deploy_git'),
    branch: 'master',
    remote: `https://${process.env.ACCESS_TOKEN}@github.com/dimaslanjaka/dimaslanjaka.github.io.git`,
    user: 'dimaslanjaka',
    email: 'dimaslanjaka@gmail.com'
  });
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
})();

export async function prebuild(hexo: Hexo) {
  await fixGitConfig({ cwd: __dirname });

  // copy views into theme directory
  copyViewsAsset(hexo);

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

    console.log(info.dest.replace(path.toUnix(__dirname) + '/', ''), fs.existsSync(info.dest));
    if (fs.existsSync(info.dest)) {
      const indexLock = path.join(info.dest, '.git/index.lock');
      if (fs.existsSync(indexLock)) {
        killProcess('git');
        fs.rmSync(indexLock);
      }
      const github = new git(info.dest);
      await fixGitConfig({ cwd: info.dest });

      const hasRemote = (
        await spawn.async('git', ['config', 'remote.origin.url'], {
          cwd: info.dest
        })
      ).output;
      // await spawn.async('git', ['remote', 'remove', 'origin'], { cwd: info.dest,  });
      if (hasRemote.trim() !== info.remote) {
        console.log('update remote');
        await spawn.async('git', ['remote', 'add', 'origin', info.remote], {
          cwd: info.dest
        });
      }
      console.log('fetching...');
      await spawn.async('git', ['fetch'], { cwd: info.dest });
      await spawn.async('git', ['fetch', '--all', '--prune'], {
        cwd: info.dest
      });
      console.log('checkout', info.branch);
      await spawn.async('git', ['checkout', '-f', info.branch], {
        cwd: info.dest
      });
      console.log('resetting...');
      await spawn.async('git', ['reset', '--hard', 'origin/' + info.branch], {
        cwd: info.dest
      });
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
  fs.copySync(source, dest, { overwrite: true, dereference: true });
}

export function cleanAutoGenFiles(hexo: Hexo) {
  const deployDir = path.join(hexo.base_dir, '.deploy_git');

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

  // clean auto generated page/{n}
  const base_page = path.join(deployDir, 'page');
  fs.readdirSync(base_page).forEach((file) => {
    const fullpath = path.join(base_page, file);
    if (isNumeric(file)) fs.rmSync(fullpath, { force: true, recursive: true });
  });
}

function isNumeric(str: string | number) {
  const int = typeof str === 'number' ? str : parseInt(str);
  const float = typeof str === 'number' ? str : parseFloat(str);

  // Use type coercion to parse the _entirety_ of the string
  // (`parseFloat` alone does not do this).
  // Also ensure that the strings whitespaces fail
  return !isNaN(int) && !isNaN(float);
}

function copyViewsAsset(hexo: Hexo) {
  const src = path.join(__dirname, 'views');
  const dest = hexo.theme_dir;
  console.log('copyViewsAsset', src, '=>', dest);
  fs.copySync(src, dest, {
    overwrite: true,
    /** useful for symlink by yarn workspace */
    dereference: true
  });
}

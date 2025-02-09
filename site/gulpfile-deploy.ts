import { spawnAsync } from 'cross-spawn';
import fs from 'fs-extra';
import Hexo from 'hexo';
import path from 'upath';

const hexo = new Hexo(__dirname, { silent: true });

interface deployInfo {
  name: string;
  dest: string;
  url: string;
  ref: string;
  callback?: ((this: Record<string, any>) => Promise<any>) | undefined;
}
const deployInfo = [
  {
    name: 'root',
    dest: path.join(__dirname, '.deploy_git'),
    url: 'https://github.com/dimaslanjaka/dimaslanjaka.github.io',
    ref: 'master',
    callback: async function (this: deployInfo) {
      if (fs.existsSync(path.join(this.dest, '.git/index.lock'))) {
        // removing lock file
        fs.rmSync(path.join(this.dest, '.git/index.lock'));
      }

      await spawnAsync('git', ['reset', '--hard', 'origin/' + this.ref], { cwd: this.dest });
      await spawnAsync('git', ['clean', '-fxd'], { cwd: this.dest });
      await spawnAsync('git', ['submodule', 'init'], { cwd: this.dest });
      await spawnAsync('git', ['submodule', 'update', '-i', '-r'], { cwd: this.dest });
      await spawnAsync('git', ['submodule', 'sync'], { cwd: this.dest });
      await spawnAsync('git', ['fetch', '--all', '--prune', '--tags'], { cwd: this.dest });
    }
  },
  {
    name: 'docs',
    dest: path.join(__dirname, '.deploy_git/docs'),
    url: 'https://github.com/dimaslanjaka/docs',
    ref: 'master',
    callback: async function (this: deployInfo) {
      if (fs.existsSync(path.join(this.dest, '.git/index.lock'))) {
        // removing lock file
        fs.rmSync(path.join(this.dest, '.git/index.lock'));
      }

      await spawnAsync('git', ['reset', '--hard', 'origin/' + this.ref], { cwd: this.dest });
      await spawnAsync('git', ['clean', '-fxd'], { cwd: this.dest });
      await spawnAsync('git', ['fetch', '--all', '--prune', '--tags'], { cwd: this.dest });
    }
  },
  {
    name: 'chimeraland',
    dest: path.join(__dirname, '.deploy_git/chimeraland'),
    url: 'https://github.com/dimaslanjaka/chimeraland',
    ref: 'gh-pages',
    callback: async function (this: deployInfo) {
      if (fs.existsSync(path.join(this.dest, '.git/index.lock'))) {
        // removing lock file
        fs.rmSync(path.join(this.dest, '.git/index.lock'));
      }

      await spawnAsync('git', ['reset', '--hard', 'origin/' + this.ref], { cwd: this.dest });
      await spawnAsync('git', ['clean', '-fxd'], { cwd: this.dest });
      await spawnAsync('git', ['fetch', '--all', '--prune', '--tags'], { cwd: this.dest });
      await spawnAsync('git', ['restore', '--staged', '--worktree', '--', '.github'], { cwd: this.dest });
      await spawnAsync('git', ['restore', '--staged', '--worktree', '--', '.vscode'], { cwd: this.dest });
      await spawnAsync('git', ['restore', '--staged', '--worktree', '--', 'bin'], { cwd: this.dest });
      await spawnAsync('git', ['restore', '--staged', '--worktree', '--', 'github-actions'], { cwd: this.dest });
      await spawnAsync('git', ['restore', '--staged', '--worktree', '--', 'github-actions-validator.config.yml'], {
        cwd: this.dest
      });
    }
  },
  {
    name: 'page',
    dest: path.join(__dirname, '.deploy_git/page'),
    url: 'https://github.com/dimaslanjaka/page',
    ref: 'gh-pages',
    callback: async function (this: deployInfo) {
      if (fs.existsSync(path.join(this.dest, '.git/index.lock'))) {
        // removing lock file
        fs.rmSync(path.join(this.dest, '.git/index.lock'));
      }

      await spawnAsync('git', ['reset', '--hard', 'origin/' + this.ref], { cwd: this.dest });
      await spawnAsync('git', ['clean', '-fxd'], { cwd: this.dest });
      await spawnAsync('git', ['fetch', '--all', '--prune', '--tags'], { cwd: this.dest });
    }
  }
];

/** copy generated site to deployment directory */
const _copy = () =>
  fs.copy(hexo.public_dir, path.join(__dirname, '.deploy_git'), {
    overwrite: true
  });

const cloneInfo = deployInfo;
(async function main() {
  const info = cloneInfo.shift();
  if (typeof info === 'object') {
    let exists = fs.existsSync(info.dest);
    if (!exists) {
      // remove dest on empty directory
      if (fs.existsSync(info.dest)) fs.rmSync(info.dest, { recursive: true, force: true });
      // recreate dest
      fs.mkdirSync(path.join(info.dest, '.git'), { recursive: true });
      // init git
      await spawnAsync('git', ['init'], { cwd: info.dest, stdio: 'inherit' });
      await spawnAsync('git', ['remote', 'set', 'origin', info.url], { cwd: info.dest });
      await spawnAsync('git', ['fetch', 'origin', info.ref], { cwd: info.dest, stdio: 'inherit' });
      await spawnAsync('git', ['pull', 'origin', info.ref], { cwd: info.dest, stdio: 'inherit' });
      exists = fs.existsSync(info.dest);
    }

    if (exists) {
      console.log('calling callback', info.name);
      if (typeof info.callback === 'function') {
        try {
          const gitCommandHelper = (await import('git-command-helper')).default;
          const github = new gitCommandHelper(info.dest);
          await github.setremote(info.url, 'origin');
          console.log(await github.getremote());
          await spawnAsync('git', ['fetch', 'origin', info.ref], { cwd: info.dest, stdio: 'inherit' });
          await info.callback.bind(info)();
        } catch (e) {
          console.error(e);
        }
      }
    }
  }

  if (cloneInfo.length > 0) return main();
})();

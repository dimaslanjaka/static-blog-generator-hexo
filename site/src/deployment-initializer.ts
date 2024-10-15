import * as spawn from 'cross-spawn';
import dotenv from 'dotenv';
import fs from 'fs-extra';
import git, { SpawnOptions, spawnAsync } from 'git-command-helper';
import Hexo from 'hexo';
import path from 'path';
import { deployConfig, hexoDir } from '../config';

const hexo = new Hexo(hexoDir);

export async function deploymentInitialize(config: (typeof deployConfig)[number]) {
  await hexo.init();
  // load .env file
  const envFile = path.join(hexo.base_dir, '.env');
  if (fs.existsSync(envFile)) dotenv.config({ path: envFile, override: true });
  const clone = !fs.existsSync(config.dest) || !fs.existsSync(path.join(config.dest, '.git'));
  if (clone) {
    // create parent folder
    if (!fs.existsSync(path.dirname(config.dest))) fs.mkdirSync(path.dirname(config.dest), { recursive: true });
    // remove existing folder
    if (fs.existsSync(config.dest)) fs.rmSync(config.dest, { force: true, recursive: true });
    // clone start
    await spawnAsync('git', ['clone', '-b', config.branch, config.remote, config.folderName], {
      // cwd spawn clone
      cwd: config.folderName !== '.deploy_git' ? path.join(hexo.base_dir, '.deploy_git') : hexo.base_dir,
      shell: true,
      stdio: 'inherit'
    });
  }
  /** spawn option */
  const spawnOpt: spawnAsync.SpawnOptions = {
    cwd: config.dest,
    shell: true,
    stdio: 'inherit'
  };
  // fetch
  await spawnAsync('git', ['fetch', '--all'], spawnOpt);
  // checkout branch
  await spawnAsync('git', ['checkout', 'origin/' + config.branch], { ...spawnOpt, stdio: 'ignore' });
  await spawnAsync('git', ['checkout', config.branch], spawnOpt);
  // pull
  await spawnAsync('git', ['pull', 'origin', config.branch], spawnOpt);
  await spawnAsync('git', ['pull', '--all', '--prune'], spawnOpt);
  // dump branches
  await spawnAsync('git', ['branch'], spawnOpt);
  // run callback
  const github = new git({
    cwd: config.dest,
    remote: config.remote,
    user: 'dimaslanjaka',
    email: 'dimaslanjaka@gmail.com',
    branch: config.branch
  });
  await fixGitConfig({ cwd: github.cwd });
  const indexLock = path.join(config.dest, '.git/index.lock');
  if (fs.existsSync(indexLock)) {
    killProcess('git');
    fs.rmSync(indexLock);
  }
  await config.callback(github);
}

/**
 * Executes a list of promises sequentially.
 *
 * Accepts a list of promise factories.
 *
 * @example
 * ```
 * const promiseCreator = (i: number, time: number, text: string) => {
 *   return new Promise(resolve => setTimeout(
 *     () => resolve(console.log(`${i} ${text}`)),
 *     time)
 *   );
 * };
 *
 * const promiseFactories = [
 *   () => promiseCreator(1, 1000, "sequential"),
 *   () => promiseCreator(2, 1000, "sequential"),
 *   () => promiseCreator(3, 1000, "sequential"),
 *   () => promiseCreator(4, 1000, "sequential"),
 *   () => promiseCreator(5, 1000, "sequential"),
 * ];
 *
 * sequentialPromises(promiseFactories);
 * ```
 *
 * @template T
 * @param {(() => Promise<T>)[]} promiseFactories
 * @return {Promise<T[]>}
 */
export const sequentialPromises = <T>(promiseFactories: (() => Promise<T>)[]): Promise<T[]> | undefined => {
  let promiseChain: Promise<T> | undefined;
  const results: T[] = [];
  promiseFactories.forEach((promiseFactory) => {
    promiseChain = (!promiseChain ? promiseFactory() : promiseChain.then(promiseFactory)).then((result) => {
      results.push(result);
      return result;
    });
  });

  return promiseChain?.then(() => results);
};

// init(deployConfig[0]);

/**
 * fix git config
 * @param options
 */
async function fixGitConfig(options: SpawnOptions) {
  const isGithubCI =
    typeof process.env['GITHUB_WORKFLOW'] === 'string' && typeof process.env['GITHUB_WORKFLOW_SHA'] === 'string';

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

/**
 * process killer by name
 * @param name process name
 */
function killProcess(name: string) {
  const isWin = process.platform === 'win32';
  if (isWin) {
    spawn.sync('taskkill', ['/f', '/im', name]);
  } else {
    spawn.sync('killall', [name]);
  }
}

import * as spawn from 'cross-spawn';
import dotenv from 'dotenv';
import fs from 'fs-extra';
import git, { SpawnOptions, spawnAsync } from 'git-command-helper';
import Hexo from 'hexo';
import path from 'path';
import { deployConfig, hexoDir } from '../config';
import { fixGitConfig, killProcess } from './deployment/utils';

const hexo = new Hexo(hexoDir);

export async function deploymentInitialize(
  config: (typeof deployConfig)[number]
) {
  await hexo.init();
  // load .env file
  const envFile = path.join(hexo.base_dir, '.env');
  if (fs.existsSync(envFile)) dotenv.config({ path: envFile, override: true });
  const clone =
    !fs.existsSync(config.dest) ||
    !fs.existsSync(path.join(config.dest, '.git'));
  if (clone) {
    // create parent folder
    if (!fs.existsSync(path.dirname(config.dest)))
      fs.mkdirSync(path.dirname(config.dest), { recursive: true });
    // remove existing folder
    if (fs.existsSync(config.dest))
      fs.rmSync(config.dest, { force: true, recursive: true });
    // clone start
    await spawnAsync(
      'git',
      ['clone', '-b', config.branch, config.remote, config.folderName],
      {
        // cwd spawn clone
        cwd:
          config.folderName !== '.deploy_git'
            ? path.join(hexo.base_dir, '.deploy_git')
            : hexo.base_dir,
        shell: true,
        stdio: 'inherit'
      }
    );
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
  await spawnAsync('git', ['checkout', 'origin/' + config.branch], {
    ...spawnOpt,
    stdio: 'ignore'
  });
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

// init(deployConfig[0]);

/**
 * fix git config
 * @param options
 */

/**
 * process killer by name
 * @param name process name
 */
// `fixGitConfig` and `killProcess` moved to ./deployment/utils.ts

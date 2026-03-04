import * as spawn from 'cross-spawn';
import { SpawnOptions, Submodule } from 'git-command-helper';
import path from 'upath';
import { execSync } from 'child_process';

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
export const sequentialPromises = <T>(
  promiseFactories: (() => Promise<T>)[]
): Promise<T[]> | undefined => {
  let promiseChain: Promise<T> | undefined;
  const results: T[] = [];
  promiseFactories.forEach((promiseFactory) => {
    promiseChain = (
      !promiseChain ? promiseFactory() : promiseChain.then(promiseFactory)
    ).then((result) => {
      results.push(result);
      return result;
    });
  });

  return promiseChain?.then(() => results);
};

/**
 * fix git config
 * @param options
 */
export async function fixGitConfig(options: SpawnOptions) {
  const isGithubCI =
    typeof process.env['GITHUB_WORKFLOW'] === 'string' &&
    typeof process.env['GITHUB_WORKFLOW_SHA'] === 'string';

  if (isGithubCI) {
    // set username and email on github workflow
    await spawn.spawnAsync(
      'git',
      ['config', '--global', 'user.name', "'dimaslanjaka'"],
      options
    );
    await spawn.spawnAsync(
      'git',
      ['config', '--global', 'user.email', "'dimaslanjaka@gmail.com'"],
      options
    );
    // set local user email
    await spawn.spawnAsync(
      'git',
      ['config', 'user.name', "'dimaslanjaka'"],
      options
    );
    await spawn.spawnAsync(
      'git',
      ['config', 'user.email', "'dimaslanjaka@gmail.com'"],
      options
    );
  }
  // set EOL LF
  await spawn.spawnAsync('git', ['config', 'core.eol', 'lf'], options);
  await spawn.spawnAsync('git', ['config', 'core.autocrlf', 'input'], options);
  await spawn.spawnAsync(
    'git',
    ['config', 'checkout-index', '--force', '--all'],
    options
  );
}

/**
 * process killer by name
 * @param name process name
 */
export function killProcess(name: string) {
  const isWin = process.platform === 'win32';
  if (isWin) {
    spawn.sync('taskkill', ['/f', '/im', name]);
  } else {
    spawn.sync('killall', [name]);
  }
}

export function resetSubmodule(submodule: Submodule) {
  const submodulePath = path.join(__dirname, submodule.path);
  console.log(`Resetting submodule:`);
  console.log(`- Path: ${submodulePath}`);
  console.log(`- URL: ${submodule.url}`);
  console.log(`- Branch: ${submodule.branch}`);
  execSync(`git fetch --all`, {
    stdio: 'inherit',
    cwd: submodulePath
  });
  // show remotes and branches
  execSync(`git remote -v`, {
    stdio: 'inherit',
    cwd: submodulePath
  });
  execSync(`git branch -a`, {
    stdio: 'inherit',
    cwd: submodulePath
  });
  // ensure a local branch is checked out before resetting
  try {
    execSync(`git checkout ${submodule.branch}`, {
      stdio: 'inherit',
      cwd: submodulePath
    });
    execSync(`git reset --hard origin/${submodule.branch}`, {
      stdio: 'inherit',
      cwd: submodulePath
    });
  } catch (error) {
    console.warn(
      `Local branch ${submodule.branch} not found or checkout failed for ${submodule.path}, fetching and creating it...`
    );
    try {
      // fetch into the remote-tracking ref so `origin/<branch>` exists
      execSync(
        `git fetch origin ${submodule.branch}:refs/remotes/origin/${submodule.branch}`,
        {
          stdio: 'inherit',
          cwd: submodulePath
        }
      );
      // create/update local branch to track origin/<branch> and check it out
      execSync(
        `git checkout -B ${submodule.branch} origin/${submodule.branch}`,
        {
          stdio: 'inherit',
          cwd: submodulePath
        }
      );
      execSync(`git reset --hard ${submodule.branch}`, {
        stdio: 'inherit',
        cwd: submodulePath
      });
    } catch (err) {
      console.warn(
        `Failed to create/checkout ${submodule.branch}, attempting reset to FETCH_HEAD...`
      );
      try {
        execSync(`git reset --hard FETCH_HEAD`, {
          stdio: 'inherit',
          cwd: submodulePath
        });
      } catch (err2) {
        console.error(`Failed to reset submodule ${submodule.path}:`, err2);
        process.exit(1); // exit with error if all attempts fail
      }
    }
  }
  console.log('=='.repeat(40));
}

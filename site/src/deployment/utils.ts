import * as spawn from 'cross-spawn';
import { SpawnOptions } from 'git-command-helper';

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

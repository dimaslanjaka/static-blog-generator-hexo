import { spawnAsync } from 'cross-spawn';
import fs from 'fs-extra';
import git from 'git-command-helper';
import Hexo from 'hexo';
import path from 'upath';

const currentDirname = path.toUnix(__dirname);
const hexo = new Hexo(__dirname, { silent: true });

const deployInfo = [
  {
    name: 'root',
    dest: path.join(__dirname, '.deploy_git'),
    url: 'https://github.com/dimaslanjaka/dimaslanjaka.github.io',
    ref: 'master'
  },
  {
    name: 'docs',
    dest: path.join(__dirname, '.deploy_git/docs'),
    url: 'https://github.com/dimaslanjaka/docs',
    ref: 'master'
  },
  {
    name: 'chimeraland',
    dest: path.join(__dirname, '.deploy_git/chimeraland'),
    url: 'https://github.com/dimaslanjaka/chimeraland',
    ref: 'gh-pages'
  },
  {
    name: 'page',
    dest: path.join(__dirname, '.deploy_git/page'),
    url: 'https://github.com/dimaslanjaka/page',
    ref: 'gh-pages'
  }
];

/** copy generated site to deployment directory */
const _copy = () =>
  fs.copy(hexo.public_dir, path.join(__dirname, '.deploy_git'), {
    overwrite: true
  });

/**
 * A callback based function that allows to iterate over a collection
 * and perform asynchronous actions on every element. The processing is
 * done is series, so an element is started only when the previous one
 * has been completed. In case of error the whole processing is interrupted
 * early and the error is propagated to the finalCallback to let the caller
 * decide how to handle it.
 *
 *
 * @param collection - The generic array of elements to iterate over
 * @param iteratorCallback - The callback based function that will
 *        be used to process the current element.
 *        It receives the current element as first paramenter and a callback
 *        as second parameter. The callback needs to be invoked to indicate
 *        the end of the asynchronous processing. It can be called passing an
 *        error as first parameter to propagate an error)
 * @param finalCallback - A function that is called when all the
 *        items have been processed or when an error occurred. If an error
 *        occurred the function will be invoked with a single argument
 *        representing the error.
 */
const iterateSeries = <T extends any[]>(
  collection: T,
  iteratorCallback:
    | ((currentElement: T[number], done: (...args: any[]) => any) => any)
    | ((currentElement: T[number], done: (...args: any[]) => any) => Promise<any>),
  finalCallback: (err?: Error) => any | Promise<any>
) => {
  const stoppingPoint = collection.length;

  function iterate(index: number) {
    // console.log('it', index);
    if (index === stoppingPoint) {
      // console.log('final');
      return finalCallback();
    } else {
      const current = collection[index];
      let called = false;
      const done = function (err?: Error | undefined) {
        called = true;
        if (err) {
          return finalCallback(err);
        }

        return iterate(index + 1);
      };
      if (iteratorCallback instanceof Promise) {
        return iteratorCallback(current, done).then(done);
      } else {
        iteratorCallback(current, done);
      }
      if (!called) done();
    }
  }

  iterate(0);
};

iterateSeries(
  deployInfo,
  async function (info) {
    console.log('writing', info.dest.replace(currentDirname, ''));
    if (!fs.existsSync(info.dest)) {
      let reClone = 0;
      const clone = async (): Promise<any> => {
        reClone++;
        if (reClone > 3) throw new Error('cannot retry clone more than 3 times');

        try {
          const o = await spawnAsync('git', ['clone', info.url, info.dest.replace(currentDirname, '')], {
            cwd: __dirname
          });
          const stderr = o.stderr.trim();
          if (stderr.length > 0) {
            throw new Error(stderr);
          }
          return o;
        } catch {
          return await clone();
        }
      };

      await clone();
    }
    const github = new git(info.dest, info.ref);
    const spawnOpt = { cwd: info.dest };
    const spawnOpt1: Parameters<typeof spawnAsync>[2] = { ...spawnOpt, stdio: 'inherit' };
    await github.setremote(info.url, 'origin', spawnOpt);
    // fetch changes
    await spawnAsync('git', ['fetch', '--all', '--prune', '--tags'], spawnOpt);
    // reset to latest changes
    await spawnAsync('git', ['reset', '--hard', 'origin/' + info.ref], spawnOpt1);
    // verify database
    // await spawnAsync('git', ['fsck'], spawnOpt);
    /*
  if (info.name !== 'root') {
    // remove all files
    await spawnAsync('git', ['rm', '-rf', '.'], spawnOpt1);
    // restore validator
    await spawnAsync('git', ['restore', '--staged', '--worktree', '--', '.github'], spawnOpt1);
    await spawnAsync('git', ['restore', '--staged', '--worktree', '--', '.vscode'], spawnOpt1);
    await spawnAsync('git', ['restore', '--staged', '--worktree', '--', 'bin'], spawnOpt1);
    await spawnAsync('git', ['restore', '--staged', '--worktree', '--', 'github-actions'], spawnOpt1);
    await spawnAsync(
      'git',
      ['restore', '--staged', '--worktree', '--', 'github-actions-validator.config.yml'],
      spawnOpt1
    );
  }
  */
  },
  function (err) {
    if (err) {
      console.error(err);
      process.exit(1);
    }
  }
);

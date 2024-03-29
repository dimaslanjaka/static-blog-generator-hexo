///
import './gulpfile-github-actions';
///

import { spawnAsync } from 'cross-spawn';
import fs from 'fs-extra';
import gch from 'git-command-helper';
import gulp from 'gulp';
import Hexo from 'hexo';
import path from 'path';
import { noop } from 'sbg-utility';
import { Application } from 'static-blog-generator';

const api = new Application(__dirname);

/**
 * git clone
 * @param destFolder
 */
async function clone(destFolder: string, options?: import('child_process').SpawnOptions) {
  const spawnOpt = Object.assign({ cwd: __dirname }, options);
  if (!fs.existsSync(destFolder)) {
    // clone from deployment dir
    await spawnAsync('git', ['clone', api.getConfig().deploy.repo, destFolder], spawnOpt);
    // update submodule from deployment dir
    if (fs.existsSync(path.join(destFolder, '.gitmodules'))) {
      await spawnAsync('git', ['submodule', 'update', '-i', '-r'], Object.assign(spawnOpt, { cwd: destFolder }));
    }
  }
}

gulp.task('deploy:copy', function () {
  return fs.copy(path.join(__dirname, 'public'), path.join(__dirname, '.deploy_git'), { overwrite: true });
});

/**
 * git pull on deploy dir
 */
async function pull(done: gulp.TaskFunctionCallback) {
  // register graceful shutdown
  gracefulShutdown(pull.name, done);

  const config = api.getConfig();
  const cwd = config.deploy.deployDir;
  const gh = new gch(cwd);

  const doPull = async (cwd: string) => {
    try {
      await spawnAsync('git', ['config', 'pull.rebase', 'false'], {
        cwd
      });
    } catch (e) {
      // console.log(e.message, sub.cwd);
    }

    try {
      console.log('pulling', cwd);
      await gh.spawn('git', ['pull', '-X', 'theirs'], {
        cwd,
        stdio: 'pipe'
      });
    } catch (e) {
      console.log('cannot pull', cwd);
    }
  };

  try {
    await clone('.deploy_git', { cwd: __dirname });
    await doPull(cwd);
    if (gh) {
      const submodules = gh.submodule?.get() || [];
      for (let i = 0; i < submodules.length; i++) {
        const sub = submodules[i];

        await doPull(sub.cwd);
      }
    }
  } catch (e: any) {
    console.log(e.message);
  }
  if (typeof done === 'function') done();
}

async function push(done?: (...args: any[]) => any) {
  // register graceful shutdown
  gracefulShutdown(push.name, done);

  const config = api.getConfig();
  const cwd = config.deploy.deployDir;
  const gh = new gch(cwd);

  const doPush = async (cwd: string, origin: string, branch: string) => {
    console.log('push', cleanCwd(cwd), origin + '/' + branch);
    await spawnAsync('git', ['push', origin, branch], {
      cwd
    }).catch(() => console.log('cannot push', cleanCwd(cwd)));
  };

  if (gh) {
    const submodules = gh.submodule?.get() || [];
    for (let i = 0; i < submodules.length; i++) {
      const sub = submodules[i];
      await doPush(sub.cwd, 'origin', sub.branch).catch(() => console.log('cannot push', cleanCwd(cwd)));
    }

    await doPush(cwd, 'origin', 'master');
  }

  if (typeof done === 'function') done();
}

gulp.task('push', push);

function cleanCwd(cwd: string) {
  return cwd.replace(__dirname, '');
}

/**
 * get current commit url
 * @returns
 */
async function getCurrentCommit() {
  const git = new gch(__dirname);
  const commit = await git.latestCommit();
  const remote = await git.getremote();
  return remote.fetch.url.replace(/(.git|\/)$/, '') + '/commit/' + commit;
}

/**
 * do commit including submodules
 */
async function commit(done: (...args: any[]) => any) {
  // register graceful shutdown
  gracefulShutdown(commit.name, done);

  const config = api.getConfig();
  const cwd = config.deploy.deployDir;
  const gh = new gch(cwd);
  const doCommit = async (cwd: string) => {
    console.log('commiting', cwd);
    await spawnAsync('git', ['add', '.'], { cwd }).catch(() => console.log('cannot add', cwd));
    await spawnAsync('git', ['commit', '-m', 'Update site from ' + (await getCurrentCommit())], { cwd }).catch(() =>
      console.log('cannot commit', cwd)
    );
  };

  // runners
  try {
    // commit submodules first
    const submodules = (<any>gh.submodule).get();
    for (let i = 0; i < submodules.length; i++) {
      const sub = submodules[i];
      const cwd = sub.cwd;
      await doCommit(cwd);
    }

    // commit repo directory
    await doCommit(cwd);
  } catch (e: any) {
    console.log(e.message);
  }

  if (typeof done === 'function') done();
}

/**
 * hexo generate
 * @param done
 */
async function generate(done: gulp.TaskFunctionCallback) {
  const hexo = new Hexo(__dirname);
  await hexo.init().catch(noop);
  await hexo.call('generate', {}, noop).catch(noop);
  if (typeof done === 'function') done();
}

gulp.task('commit', commit);
gulp.task('pull', pull);
gulp.task('generate', generate);

/*
gulp.task(
  'build',
  gulp.series('pull', 'generate', 'deploy:copy', 'seo', 'safelink', 'feed', 'sitemap', 'commit', 'push')
);
*/

gulp.task('env', function (done) {
  const envs = process.env;
  console.log(envs);
  done();
});

const callbacks: Record<string, (...args: any[]) => any> = {};
function gracefulShutdown(key: string, callback?: (...args: any[]) => any) {
  if (typeof callback === 'function') callbacks[key] = callback;
  process.on('SIGTERM', () => {
    console.info('SIGTERM signal received, closing existing process');
    for (const fkey in callbacks) {
      const func = callbacks[fkey];
      if (typeof func === 'function') func.apply(null);
    }
    process.exit(0);
  });
}

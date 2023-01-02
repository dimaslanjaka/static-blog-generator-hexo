import { copy, existsSync, mkdirp, rm } from 'fs-extra';
import gch from 'git-command-helper';
import { default as noop } from 'git-command-helper/dist/noop';
import { spawnAsync } from 'git-command-helper/dist/spawn';
import Hexo from 'hexo';
import { join } from 'path';
import { deployConfig, getConfig, gulp } from 'static-blog-generator';

/**
 * git clone
 * @param cwd
 */
async function clone(cwd: string) {
  if (!existsSync(cwd)) {
    // clone from blog root
    await spawnAsync('git', [...'clone -b master --single-branch'.split(' '), getConfig().deploy.repo, '.deploy_git'], {
      cwd: __dirname
    });
    // update submodule from blog deployment dir
    if (existsSync(join(deployConfig().deployDir, '.gitmodules'))) {
      await spawnAsync('git', ['submodule', 'update', '-i', '-r'], { cwd });
    }
  }
}

/**
 * git pull on deploy dir
 */
async function pull(done: gulp.TaskFunctionCallback) {
  const config = getConfig();
  const cwd = config.deploy.deployDir;
  const gh = config.deploy.github;

  const doPull = async (cwd: string) => {
    try {
      await spawnAsync('git', ['config', 'pull.rebase', 'false'], {
        cwd
      });
    } catch (e) {
      // console.log(e.message, sub.root);
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
    await clone(cwd);
    await doPull(cwd);
    if (gh) {
      const submodules = gh.submodule.get();
      for (let i = 0; i < submodules.length; i++) {
        const sub = submodules[i];

        await doPull(sub.root);
      }
    }
  } catch (e) {
    console.log(e.message);
  }
  if (typeof done === 'function') done();
}

async function push(done?: gulp.TaskFunctionCallback) {
  const config = getConfig();
  const cwd = config.deploy.deployDir;
  const gh = config.deploy.github;

  const doPush = async (cwd: string, origin: string, branch: string) => {
    await spawnAsync('git', ['push', origin, branch], {
      cwd
    });
  };

  if (gh) {
    try {
      const submodules = gh.submodule.get();
      for (let i = 0; i < submodules.length; i++) {
        const sub = submodules[i];
        console.log('push', sub.root);
        doPush(sub.root, 'origin', sub.branch);
      }
    } catch (error) {
      fcatch(error);
    }

    await doPush(cwd, 'origin', 'master');
  }

  if (typeof done === 'function') done();
}

gulp.task('push', push);

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
async function commit() {
  const config = getConfig();
  const cwd = config.deploy.deployDir;
  const gh = config.deploy.github || new gch(cwd);
  const doCommit = async (cwd: string) => {
    await spawnAsync('git', ['add', '.'], { cwd }).catch(fcatch);
    await spawnAsync('git', ['commit', '-m', 'Update site from ' + (await getCurrentCommit())], { cwd }).catch(fcatch);
  };

  // runners
  try {
    await doCommit(cwd);
    const submodules = gh.submodule.get();
    for (let i = 0; i < submodules.length; i++) {
      const sub = submodules[i];
      const cwd = sub.root;
      console.log('commiting', sub.root);
      await doCommit(cwd);
    }
  } catch (e) {
    console.log(e.message);
  }
}

function fcatch(e: any) {
  if (e instanceof Error) return console.log(e.message);
  console.log(e);
}

/**
 * hexo generate
 * @param done
 */
async function generate(done: gulp.TaskFunctionCallback) {
  const hexo = new Hexo(__dirname);
  await hexo.init().catch(noop);
  await hexo.call('generate').catch(noop);
  if (typeof done === 'function') done();
}

gulp.task('commit', commit);
gulp.task('pull', pull);
gulp.task('generate', generate);
gulp.task(
  'build',
  gulp.series('pull', 'generate', 'deploy:copy', 'seo', 'safelink', 'feed', 'sitemap', 'commit', 'push')
);

gulp.task('env', function (done) {
  const envs = process.env;
  console.log(envs);
  done();
});

gulp.task('hooks', async function () {
  const dest = join(__dirname, '.git/hooks');
  const src = join(__dirname, 'git-hooks');
  if (existsSync(dest)) {
    await rm(dest, { recursive: true, force: true });
    await mkdirp(dest);
  }

  await copy(src, dest, {
    recursive: true,
    overwrite: true
  });
});

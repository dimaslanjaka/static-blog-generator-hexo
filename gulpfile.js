const gulp = require('gulp');
const sbg = require('static-blog-generator');
const gch = require('git-command-helper');
const Hexo = require('hexo');
const { default: noop } = require('git-command-helper/dist/noop');
//const sbg = require('./packages/static-blog-generator');

const config = sbg.getConfig();

/**
 * git pull on deploy dir
 */
async function pull(done) {
  const cwd = config.deploy.deployDir;
  const gh = config.deploy.github;
  const doPull = async (cwd) => {
    try {
      await gh.spawn('git', ['config', 'pull.rebase', 'false'], {
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
  doPull(cwd);
  const submodules = await gh.submodule.get();
  for (let i = 0; i < submodules.length; i++) {
    const sub = submodules[i];

    doPull(sub.root);
  }
  done();
}

/**
 * get current commit url
 * @returns
 */
async function getCurrentCommit() {
  const git = new gch.default(__dirname);
  const commit = await git.latestCommit();
  const remote = await git.getremote();
  return remote.fetch.url.replace(/(.git|\/)$/) + '/commit/' + commit;
}

/**
 * do commit including submodules
 */
async function commit() {
  const cwd = config.deploy.deployDir;
  const gh = config.deploy.github;
  const doCommit = async (cwd) => {
    await gh.spawn('git', ['add', '.'], { cwd });
    await gh.spawn('git', [
      'commit',
      '-m',
      'Update site from ' + (await getCurrentCommit())
    ]);
  };

  // runners
  await doCommit(cwd);
  const submodules = await gh.submodule.get();
  for (let i = 0; i < submodules.length; i++) {
    const sub = submodules[i];
    const cwd = sub.root;
    await doCommit(cwd);
  }
}

/**
 * hexo generate
 * @param {gulp.TaskFunctionCallback} done
 */
async function generate(done) {
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
  gulp.series(
    'pull',
    'generate',
    'deploy:copy',
    'seo',
    'safelink',
    'feed',
    'sitemap',
    'commit'
  )
);

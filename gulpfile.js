const gulp = require('gulp');
const sbg = require('static-blog-generator');
//const sbg = require('./packages/gulp-sbg');

const config = sbg.getConfig();

/**
 * git pull on deploy dir
 */
async function pull(done) {
  const cwd = config.deploy.deployDir;
  const gh = config.deploy.github;
  await gh.spawn('git', ['config', 'pull.rebase', 'false'], {
    cwd
  });
  await gh.spawn('git', ['pull', '-X', 'theirs'], { cwd, stdio: 'inherit' });
  const submodules = await gh.submodule.get();
  for (let i = 0; i < submodules.length; i++) {
    const sub = submodules[i];

    try {
      await gh.spawn('git', ['config', 'pull.rebase', 'false'], {
        cwd: sub.root
      });
    } catch (e) {
      // console.log(e.message, sub.root);
    }

    try {
      console.log('pulling', sub.root);
      await gh.spawn('git', ['pull', '-X', 'theirs'], {
        cwd: sub.root,
        stdio: 'inherit'
      });
    } catch (e) {
      console.log('cannot pull', sub.root);
    }
  }
  done();
}

async function commit() {
  const cwd = config.deploy.deployDir;
  const gh = config.deploy.github;
  await gh.spawn('git', ['add', '.'], { cwd });
}

gulp.task('commit', commit);
gulp.task('pull', pull);

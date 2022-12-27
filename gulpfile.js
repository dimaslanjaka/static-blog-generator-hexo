const gulp = require('gulp');
const sbg = require('static-blog-generator');
//const sbg = require('./packages/gulp-sbg');

/**
 * git pull on deploy dir
 */
async function pull() {
  const config = sbg.getConfig();
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
      await gh.spawn('git', ['pull', '-X', 'theirs'], {
        cwd: sub.root,
        stdio: 'inherit'
      });
    } catch (e) {
      console.log('cannot pull', sub.root);
    }
  }
}

exports.sbg = sbg;
exports.pull = pull;
exports = gulp;

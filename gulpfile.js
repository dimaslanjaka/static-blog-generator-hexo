const gulp = require('gulp');
const sbg = require('static-blog-generator');
const gch = require('git-command-helper');
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

async function commit() {
  const cwd = config.deploy.deployDir;
  const gh = config.deploy.github;
  const doCommit = async (cwd) => {
    await gh.spawn('git', ['add', '.'], { cwd });
    const remote = await gch.ext.getGithubRemote('origin', { cwd });
    const branch = await gch.ext.getGithubCurrentBranch({ cwd });
    console.log(remote, branch);
  };
  doCommit(cwd);
  const submodules = await gh.submodule.get();
  for (let i = 0; i < submodules.length; i++) {
    const sub = submodules[i];
    const cwd = sub.root;
    doCommit(cwd);
  }
}

gulp.task('commit', commit);
gulp.task('pull', pull);

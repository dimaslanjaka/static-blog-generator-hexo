process.cwd = () => __dirname;
process.env.DEBUG = 'post:label,post:error';

const { spawnAsync } = require('git-command-helper/dist/spawn');
const gulp = require('gulp');
const { Application, noop } = require('./packages/static-blog-generator/dist');

async function pCopy(done) {
  await spawnAsync('npm', ['run', 'build:nopack'], { cwd: __dirname + '/packages/static-blog-generator' }).then((r) =>
    console.log(r.output.join('\n'))
  );
  const api = new Application(__dirname);
  await api
    .clean()
    .then(() => {
      console.log('project clean done occurs');
    })
    .then(() => api.copy())
    .then(() => {
      console.log('post copy done occurs');
    })
    .catch(() => {
      console.log('post copy error occurs');
    })
    .finally(() => {
      console.log('post copy finally occurs');
      if (typeof done == 'function') done();
    });
}

gulp.task('start-copy', gulp.series(pCopy));

if (require.main === module) {
  //console.log('called directly');
  pCopy(noop);
} else {
  //console.log('required as a module');
  module.exports = { copy: pCopy };
}

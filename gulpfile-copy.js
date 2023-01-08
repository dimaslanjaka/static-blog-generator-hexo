process.cwd = () => __dirname;
process.env.DEBUG = 'post:label,post:error';

const { spawnAsync } = require('git-command-helper/dist/spawn');
const gulp = require('gulp');
const { Application, noop } = require('./packages/static-blog-generator/dist');

async function pCopy(done) {
  await spawnAsync('npm', ['run', 'build:nopack'], { cwd: __dirname + '/packages/static-blog-generator' }).then((_) => {
    // console.log(_.output.join('\n'));
    console.log('static-blog-generator builded successful');
  });
  const api = new Application(__dirname, {
    permalink: ':title.html'
  });

  console.log('clean-start');
  await api.clean();
  console.log('clean-ends');
  console.log('standalone-start');
  await api.standalone();
  console.log('standalone-ends');
  console.log('copy-start');
  await api.copy().catch((e) => {
    console.log('post copy error occurs');
    console.log(e);
  });
  console.log('copy-ends');

  if (typeof done == 'function') done();
}

gulp.task('start-copy', () => gulp.series(pCopy));

if (require.main === module) {
  //console.log('called directly');
  pCopy(noop);
} else {
  //console.log('required as a module');
  module.exports = { pCopy };
}

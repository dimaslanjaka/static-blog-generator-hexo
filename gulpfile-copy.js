process.cwd = () => __dirname;

const gulp = require('gulp');
const { Application, noop, copyAllPosts } = require('./packages/static-blog-generator/dist');

function pCopy(done) {
  const api = new Application(__dirname, {
    exclude: ['**/.*']
  });
  copyAllPosts(done);
  /*
  api
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
    });*/
}

gulp.task('start-copy', gulp.series(pCopy));

if (require.main === module) {
  //console.log('called directly');
  pCopy(noop);
} else {
  //console.log('required as a module');
  module.exports = { copy: pCopy };
}

const gulp = require('gulp');
const { Application } = require('./packages/static-blog-generator/dist');

async function copy(done) {
  const api = new Application(__dirname);
  console.log('starting post copy');
  await api
    .copy()
    .then(() => {
      console.log('post copy done occurs');
      done();
    })
    .catch(() => {
      console.log('post copy error occurs');
      done();
    })
    .finally(() => {
      console.log('post copy finally occurs');
      done();
    });
}

gulp.task('start-copy', gulp.series(copy));

if (require.main === module) {
  //console.log('called directly');
  copy();
} else {
  //console.log('required as a module');
}

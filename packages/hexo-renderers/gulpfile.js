const gulp = require('gulp');
const path = require('path');

gulp.task('default', function () {
  return gulp
    .src(['**/*.*'], { cwd: path.join(__dirname, 'src'), ignore: ['**/*.js', '**/*.ts'] })
    .pipe(gulp.dest(path.join(__dirname, 'dist')));
});

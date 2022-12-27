const gulp = require('gulp');
const sbg = require('static-blog-generator');
//const sbg = require('./packages/gulp-sbg');

async function pull() {
  const config = sbg.getConfig();
  const deployDir = config.deploy.deployDir;
}

exports.sbg = sbg;
exports.pull = pull;
exports = gulp;

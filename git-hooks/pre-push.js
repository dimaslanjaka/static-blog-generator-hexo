const path = require('path');

process.cwd = () => path.resolve(__dirname + '/..');
const glob = require('glob');

const packages = path.resolve(process.cwd() + '/packages');

const files = glob('**/*.{js,ts}', {
  cwd: packages,
  ignore: ['**/node_modules', '**/tmp', '**/dist', '**/build', '**/test'],
  sync: true
});

console.log(files);

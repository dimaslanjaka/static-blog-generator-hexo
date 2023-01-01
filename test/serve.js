// test serve
// manual run

const { spawn } = require('child_process');
const path = require('path');

const child = spawn('npm', ['run', 'server'], { cwd: path.join(__dirname, '..') });
if (child.stdout && 'on' in child.stdout) {
  child.stdout.setEncoding('utf8');
  child.stdout.on('data', (data) => {
    console.log(data);
  });
}

if (child.stderr && 'on' in child.stdout) {
  child.stderr.setEncoding('utf8');
  child.stderr.on('data', (data) => {
    console.log(data);
  });
}

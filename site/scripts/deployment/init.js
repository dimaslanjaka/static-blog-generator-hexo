const spawn = require('cross-spawn');
const { fs, path } = require('sbg-utility');

hexo.extend.filter.register('after_init', async function () {
  // clone root deployment
  if (
    !fs.existsSync(path.join(hexo.base_dir, '.deploy_git')) ||
    !fs.existsSync(path.join(hexo.base_dir, '.deploy_git/.git'))
  ) {
    await spawn.spawnAsync(
      'git',
      ['clone', '-b', 'master', 'https://github.com/dimaslanjaka/dimaslanjaka.github.io.git', '.deploy_git'],
      {
        cwd: hexo.base_dir,
        shell: true,
        stdio: 'inherit'
      }
    );
  }
});

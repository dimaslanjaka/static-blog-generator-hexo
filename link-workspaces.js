const spawn = require('cross-spawn');
const path = require('path');
const isWin32 = require('os').platform() === 'win32';
const fs = require('fs-extra');
const yaml = require('yaml');

const yarnrc = yaml.parse(fs.readFileSync(path.join(__dirname, '.yarnrc.yml'), 'utf-8'));

(async function main() {
  if (yarnrc.nmHoistingLimits !== 'none') {
    return console.log('yarn workspace hoisting isn\'t none, linker only work within hoisting workspaces or dependencies');
  }
  const config = [
    {
      src: path.join(__dirname, 'packages/hexo-theme-claudia'),
      dest: path.join(__dirname, 'site/themes/claudia')
    }
  ];
  config.forEach(({ src, dest }) => {
    if (fs.existsSync(dest)) {
      fs.rmSync(dest, { recursive: true, force: true });
    }
    if (!fs.existsSync(path.dirname(dest))) {
      fs.mkdirSync(path.dirname(dest), { recursive: true });
    }
    console.log('linking', src.replace(__dirname, ''), '->', dest.replace(__dirname, ''));
    fs.copySync(src, dest, { overwrite: true });
  });
})();

/**
 *
 * @param {string} siteNMDir
 * @param {string} sourceNMDir
 * @param {string} pkgName
 */
async function _symlinkAdmin(siteNMDir, sourceNMDir, pkgName) {
  const src = path.resolve(sourceNMDir, pkgName);
  const dest = path.join(siteNMDir, pkgName);
  if (fs.existsSync(dest)) {
    fs.rmSync(dest, { recursive: true, force: true });
  }
  /**
   * @type {Awaited<ReturnType<typeof spawn.async>>}
   */
  let result;
  if (isWin32) {
    result = await spawn.async('cmd', ['/s', '/c', 'mklink', '/D', dest, src]);
  } else {
    result = await spawn.async('ln', ['-sf', src, dest]);
  }

  if (result.stderr) {
    fs.symlinkSync(src, dest);
  }
}

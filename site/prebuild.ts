import spawn from 'cross-spawn';
import fs from 'fs-extra';
import Hexo from 'hexo';
import path from 'upath';

/**
 * prepare all sources
 */

const hexo = new Hexo(__dirname, { silent: true });

(async () => {
  // init hexo
  await hexo.init();

  // copy views into theme directory
  try {
    fs.copySync(path.join(__dirname, 'views'), hexo.theme_dir, {
      overwrite: true,
      /** useful for symlink by yarn workspace */
      dereference: true
    });
  } catch (e) {
    console.log(e.message);
  }

  // clone deployment directory

  const tokenBase = `https://${process.env.ACCESS_TOKEN}@github.com`;

  const cfg = [
    {
      dest: path.join(__dirname, '.deploy_git'),
      branch: 'master',
      remote: `${tokenBase}/dimaslanjaka/dimaslanjaka.github.io.git`
    },
    {
      dest: path.join(__dirname, '.deploy_git/docs'),
      branch: 'master',
      remote: `${tokenBase}/dimaslanjaka/docs.git`
    },
    {
      dest: path.join(__dirname, '.deploy_git/chimeraland'),
      branch: 'gh-pages',
      remote: `${tokenBase}/dimaslanjaka/chimeraland.git`
    },
    {
      dest: path.join(__dirname, '.deploy_git/page'),
      branch: 'gh-pages',
      remote: `${tokenBase}/dimaslanjaka/page.git`
    }
  ];
  for (let i = 0; i < cfg.length; i++) {
    const { dest, remote, branch } = cfg[i];
    if (!fs.existsSync(dest)) {
      const destArg = dest.replace(path.toUnix(__dirname), '');
      console.log('cloning', destArg);
      await spawn.async('git', ['clone', '-b', branch, remote, destArg], {
        cwd: __dirname
      });
    }
  }
})();

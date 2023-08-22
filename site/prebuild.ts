import Promise from 'bluebird';
import * as dotenv from 'dotenv';
import fs from 'fs-extra';
import glob from 'glob';
import Hexo from 'hexo';
import path from 'upath';
import { deployConfig } from './config';
import { deploymentInitialize, sequentialPromises } from './src/deployment-initializer';

const envPath = path.join(__dirname, '.env');
if (fs.existsSync(envPath)) {
  dotenv.config({ path: envPath, override: true });
}

/**
 * prepare all sources
 */

const hexo = new Hexo(__dirname, { silent: true });

(async function () {
  // init hexo
  await hexo.init();
  // run pre-build script
  await prebuild(hexo);
})();

export async function prebuild(hexo: Hexo) {
  // copy views into theme directory
  copyViewsAsset(hexo);

  // initialize deployment
  sequentialPromises(deployConfig.map((c) => () => deploymentInitialize(c)));

  // copy github-actions validator
  const deployDir = path.join(hexo.base_dir, '.deploy_git');
  const source = path.join(deployDir, 'github-actions');
  const dest = path.join(deployDir, 'chimeraland', 'github-actions');
  fs.copySync(source, dest, { overwrite: true, dereference: true });
}

export async function cleanAutoGenFiles(hexo: Hexo) {
  const deployDir = path.join(hexo.base_dir, '.deploy_git');

  /**
   * clean auto generated files inside .deploy_git
   */
  await Promise.all(
    ['css', 'style', 'fonts', 'lib', 'hexo-seo-js', 'js', 'hexo-shortcodes-lib', 'assets'].map((str) =>
      path.join(deployDir, str)
    )
  )
    .filter((file) => fs.existsSync(file))
    .each((file) => {
      // console.log('deleting', p);
      fs.rmSync(file, { force: true, recursive: true });
    });

  // empty taxonomies folder without .git files
  await Promise.all(['archives', 'categories', 'tags'].map((str) => path.join(deployDir, str))).each((base) => {
    return Promise.all(glob.glob(['**/*.*'], { ignore: ['**/.git*'], cwd: base, posix: true }))
      .filter((result) => {
        if (/^[0-9]{1,4}\//.test(result)) return false;
        if (/^node_modules\//.test(result)) return false;
        if (/^.git\//.test(result)) return false;
        return true;
      })
      .each((file) => {
        fs.rmSync(file, { recursive: true, force: true });
      });
  });

  // clean auto generated page/{n}
  const base_page = path.join(deployDir, 'page');
  await Promise.all(fs.readdirSync(base_page)).each((file) => {
    const fullpath = path.join(base_page, file);
    if (isNumeric(file)) fs.rmSync(fullpath, { force: true, recursive: true });
  });
}

/**
 * is string numeric
 * @param str
 * @returns
 */
function isNumeric(str: any) {
  const int = typeof str === 'number' ? str : parseInt(str);
  const float = typeof str === 'number' ? str : parseFloat(str);

  // Use type coercion to parse the _entirety_ of the string
  // (`parseFloat` alone does not do this).
  // Also ensure that the strings whitespaces fail
  return !isNaN(int) && !isNaN(float);
}

function copyViewsAsset(hexo: Hexo) {
  const src = path.join(__dirname, 'views');
  const dest = hexo.theme_dir;
  console.log('copyViewsAsset', src, '=>', dest);
  fs.copySync(src, dest, {
    overwrite: true,
    /** useful for symlink by yarn workspace */
    dereference: true
  });
}

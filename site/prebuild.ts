import * as dotenv from 'dotenv';
import fs from 'fs-extra';
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

export function cleanAutoGenFiles(hexo: Hexo) {
  const deployDir = path.join(hexo.base_dir, '.deploy_git');

  /**
   * clean auto generated files inside .deploy_git
   */
  const files = [
    'css',
    'style',
    'archives',
    'fonts',
    'lib',
    'hexo-seo-js',
    'js',
    'hexo-shortcodes-lib',
    'tags',
    'categories',
    'assets'
  ]
    .map((str) => path.join(deployDir, str))
    .filter(fs.existsSync);
  files.forEach((p) => {
    // console.log('deleting', p);
    if (fs.existsSync(p)) fs.rmSync(p, { force: true, recursive: true });
  });

  // clean auto generated page/{n}
  const base_page = path.join(deployDir, 'page');
  fs.readdirSync(base_page).forEach((file) => {
    const fullpath = path.join(base_page, file);
    if (isNumeric(file)) fs.rmSync(fullpath, { force: true, recursive: true });
  });
}

function isNumeric(str: string | number) {
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

'use strict';

const nunjucks = require('nunjucks');
const fs = require('fs-extra');
const path = require('upath');
const { toArray } = require('./custom-helpers');
const ansiColors = require('ansi-colors');
const { writefile } = require('sbg-utility');
const logname = ansiColors.magentaBright('hexo-renderer-nunjucks');
const tmpdir = path.join(__dirname, '../tmp');
const logfile = path.join(tmpdir, 'nunjucks-log.json');

/**
 * hexo-renderer-nunjucks
 * @param {import('hexo')} hexo
 */
function rendererNunjucks(hexo) {
  const themeDir = path.join(__dirname, '../themes', hexo.config.theme);
  const env = nunjucks.configure([themeDir, path.join(themeDir, 'layout')], {
    noCache: true,
    autoescape: false,
    throwOnUndefined: false,
    trimBlocks: false,
    lstripBlocks: false
  });

  env.addFilter('toArray', toArray);

  const logs = {
    render: [],
    compile: []
  };

  /**
   * render
   * @param {import('hexo').PageData} data
   * @param {import('hexo').Locals} locals
   * @returns
   */
  function render(data, locals) {
    if ('text' in data) {
      return nunjucks.renderString(data.text, locals);
    }

    // hexo.log.info(logname, 'render', data.path);
    logs.render.push(data.path);
    writefile(logfile, JSON.stringify(logs, null, 2));

    return nunjucks.render(data.path, locals);
  }

  /**
   * compile
   * @param {import('hexo').PageData} data
   * @returns
   */
  function compile(data) {
    // hexo.log.info(logname, 'compile', data.path);
    logs.compile.push(data.path);
    writefile(logfile, JSON.stringify(logs, null, 2));

    // hexo.log.info(logname, 'text' in data ? data.text : data.path);
    const compiled = nunjucks.compile('text' in data ? data.text : fs.readFileSync(data.path), env);

    return compiled.render.bind(compiled);
  }

  // hexo Renderer API implicitly requires 'compile' to be a value of the rendering function
  render.compile = compile;

  // hexo.extend.renderer.register('swig', 'html', render, true);
  hexo.extend.renderer.register('njk', 'html', render, false);
  hexo.extend.renderer.register('j2', 'html', render, false);
}

module.exports = { rendererNunjucks };

'use strict';

const nunjucks = require('nunjucks');
const fs = require('fs');
const path = require('path');
const { toArray } = require('./custom-helpers');

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

  // const Environment = nunjucks.Environment;

  function render(data, locals) {
    if ('text' in data) {
      return nunjucks.renderString(data.text, locals);
    }

    console.log(data.path);

    return nunjucks.render(data.path, locals);
  }

  function compile(data) {
    // console.log('layout loaded', data.path);
    // console.log('text' in data ? data.text : data.path);
    const compiled = nunjucks.compile(
      'text' in data ? data.text : fs.readFileSync(data.path)
    );

    return compiled.render.bind(compiled);
  }

  // hexo Renderer API implicitly requires 'compile' to be a value of the rendering function
  render.compile = compile;

  // hexo.extend.renderer.register('swig', 'html', render, true);
  hexo.extend.renderer.register('njk', 'html', render, true);
  hexo.extend.renderer.register('j2', 'html', render, true);
}

module.exports = { rendererNunjucks };

// hexo-renderer-nunjucks
/* global hexo */
'use strict';

const _toArray = require('lodash.toarray');
const nunjucks = require('nunjucks');
const fs = require('fs');
const path = require('path');

function isObject(value) {
  return typeof value === 'object' && value !== null && value !== undefined;
}

function toArray(value) {
  if (isObject(value) && typeof value.toArray === 'function') {
    return value.toArray();
  } else if (Array.isArray(value)) {
    return value;
  }

  return _toArray(value);
}

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
  const compiled = nunjucks.compile('text' in data ? data.text : fs.readFileSync(data.path));

  return compiled.render.bind(compiled);
}

// hexo Renderer API implicitly requires 'compile' to be a value of the rendering function
render.compile = compile;

if (typeof hexo !== 'undefined') {
  // hexo.extend.renderer.register('swig', 'html', render, true);
  hexo.extend.renderer.register('njk', 'html', render, true);
  hexo.extend.renderer.register('j2', 'html', render, true);
}

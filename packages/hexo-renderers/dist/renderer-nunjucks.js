'use strict';
var nunjucks = require('nunjucks');
var fs = require('fs-extra');
var path = require('upath');
var toArray = require('./custom-helpers').toArray;
var ansiColors = require('ansi-colors');
var writefile = require('sbg-utility').writefile;
var logname = ansiColors.magentaBright('hexo-renderer-nunjucks');
var tmpdir = path.join(__dirname, '../tmp');
var logfile = path.join(tmpdir, 'nunjucks-log.json');
/**
 * hexo-renderer-nunjucks
 * @param {import('hexo')} hexo
 */
function rendererNunjucks(hexo) {
    var themeDir = path.join(__dirname, '../themes', hexo.config.theme);
    var env = nunjucks.configure([themeDir, path.join(themeDir, 'layout')], {
        noCache: true,
        autoescape: false,
        throwOnUndefined: false,
        trimBlocks: false,
        lstripBlocks: false
    });
    env.addFilter('toArray', toArray);
    var logs = {
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
        var compiled = nunjucks.compile('text' in data ? data.text : fs.readFileSync(data.path), env);
        return compiled.render.bind(compiled);
    }
    // hexo Renderer API implicitly requires 'compile' to be a value of the rendering function
    render.compile = compile;
    // hexo.extend.renderer.register('swig', 'html', render, true);
    hexo.extend.renderer.register('njk', 'html', render, false);
    hexo.extend.renderer.register('j2', 'html', render, false);
}
module.exports = { rendererNunjucks: rendererNunjucks };

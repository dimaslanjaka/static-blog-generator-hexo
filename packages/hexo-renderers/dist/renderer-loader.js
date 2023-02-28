var rendererNunjucks = require('./renderer-nunjucks').rendererNunjucks;
var rendererEjs = require('./renderer-ejs').rendererEjs;
var rendererPug = require('./renderer-pug').rendererPug;
var rendererStylus = require('./renderer-stylus').rendererStylus;
var ansiColors = require('ansi-colors');
var registerCustomHelper = require('./custom-helpers').registerCustomHelper;
var rendererDartSass = require('./renderer-dartsass').rendererDartSass;
if (typeof hexo === 'undefined') {
    global.hexo = {};
}
var logname = ansiColors.magenta('hexo-renderers');
if (typeof hexo !== 'undefined') {
    var config = hexo.config;
    var renderers = config['renderers'];
    // register custom helper
    registerCustomHelper(hexo);
    // activate specific engine
    if (Array.isArray(renderers)) {
        for (var i = 0; i < renderers.length; i++) {
            var renderer = renderers[i];
            switch (renderer) {
                case 'ejs':
                    rendererEjs(hexo);
                    break;
                case 'pug':
                    rendererPug(hexo);
                    break;
                case 'dartsass':
                    rendererDartSass(hexo);
                    break;
                case 'stylus':
                    rendererStylus(hexo);
                    break;
                case 'nunjucks':
                case 'njk':
                    rendererNunjucks(hexo);
                    break;
            }
        }
    }
    else {
        // activate all available engines
        rendererNunjucks(hexo);
        rendererEjs(hexo);
        rendererPug(hexo);
        rendererStylus(hexo);
        rendererDartSass(hexo);
    }
}
else {
    console.error(logname, 'not hexo instance');
}

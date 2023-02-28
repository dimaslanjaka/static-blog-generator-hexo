var stylus = require('stylus');
/**
 * hexo-renderer-stylus
 * @param {import('hexo')} hexo
 */
function rendererStylus(hexo) {
    function getProperty(obj, name) {
        name = name.replace(/\[(\w+)\]/g, '.$1').replace(/^\./, '');
        var split = name.split('.');
        var key = split.shift();
        if (!Object.prototype.hasOwnProperty.call(obj, key))
            return '';
        var result = obj[key];
        var len = split.length;
        if (!len)
            return result || '';
        if (typeof result !== 'object')
            return '';
        for (var i = 0; i < len; i++) {
            key = split[i];
            if (!Object.prototype.hasOwnProperty.call(result, key))
                return '';
            result = result[split[i]];
            if (typeof result !== 'object')
                return result;
        }
        return result;
    }
    function applyPlugins(stylusConfig, plugins) {
        plugins.forEach(function (plugin) {
            var factoryFn = require(plugin.trim());
            stylusConfig.use(factoryFn());
        });
    }
    function stylusFn(data, options, callback) {
        var _this = this;
        var config = this.config.stylus || {};
        var self = this;
        var plugins = ['nib'].concat(config.plugins || []);
        function defineConfig(style) {
            style.define('hexo-config', function (data) {
                return getProperty(self.theme.config, data.val);
            });
        }
        var stylusConfig = stylus(data.text);
        applyPlugins(stylusConfig, plugins);
        stylusConfig
            .use(defineConfig)
            .use(function (style) {
            return _this.execFilterSync('stylus:renderer', style, { context: _this });
        })
            .set('filename', data.path)
            .set('sourcemap', config.sourcemaps)
            .set('compress', config.compress)
            .set('include css', true)
            .render(callback);
    }
    stylusFn.disableNunjucks = true;
    hexo.extend.renderer.register('styl', 'css', stylusFn);
    hexo.extend.renderer.register('stylus', 'css', stylusFn);
}
module.exports = { rendererStylus: rendererStylus };

var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
var path = require('path');
var pug = require('pug');
/**
 * hexo-renderer-pug
 * @param {import('hexo')} hexo
 */
function rendererPug(hexo) {
    var configPath = path.join(process.cwd(), 'pug.config');
    var defaultConfig = { compile: {} }; // avoids key errors
    var hasConfig = true;
    try {
        require.resolve(configPath);
    }
    catch (_a) {
        hasConfig = false;
    }
    var config = hasConfig ? require(configPath) : defaultConfig;
    // Validate non-standard keys -- e.g. 'compile'.
    var hasProp = function (obj, prop) { return Object.prototype.hasOwnProperty.call(obj, prop); };
    var invalidKeys = Object.keys(config).filter(function (k) { return !hasProp(defaultConfig, k); });
    if (invalidKeys.length > 0) {
        throw Error("Unsupported PUG config keys: ".concat(invalidKeys.join(', ')));
    }
    function pugCompile(data) {
        var opts = __assign(__assign({}, config.compile), { filename: data.path // always used
         });
        return pug.compile(data.text, opts);
    }
    function pugRenderer(data, locals) {
        return pugCompile(data)(locals);
    }
    pugRenderer.compile = pugCompile;
    hexo.extend.renderer.register('pug', 'html', pugRenderer, true);
}
module.exports = { rendererPug: rendererPug };

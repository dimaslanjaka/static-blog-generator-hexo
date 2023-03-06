"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.partialWithLayout = void 0;
var upath_1 = require("upath");
// original https://github.com/hexojs/hexo/blob/cb19b2938d1f7882a4cb41a98974a3d673a63b45/lib/plugins/helper/partial.js#L5
function partialWithLayout(ctx) {
    return function partialWithLayout(name, locals, options) {
        if (options === void 0) { options = {}; }
        if (typeof name !== 'string')
            throw new TypeError('name must be a string!');
        var cache = options.cache;
        var viewDir = this.view_dir;
        var currentView = this.filename.substring(viewDir.length);
        var path = (0, upath_1.join)((0, upath_1.dirname)(currentView), name);
        var view = ctx.theme.getView(path) || ctx.theme.getView(name);
        var viewLocals = { layout: false };
        if (!view) {
            throw new Error("Partial ".concat(name, " does not exist. (in ").concat(currentView, ")"));
        }
        if (options.only) {
            Object.assign(viewLocals, locals);
        }
        else {
            Object.assign(viewLocals, this, locals);
        }
        // Partial don't need layout
        // viewLocals.layout = false;
        if (cache) {
            var cacheId = typeof cache === 'string' ? cache : view.path;
            return this.fragment_cache(cacheId, function () { return view.renderSync(viewLocals); });
        }
        return view.renderSync(viewLocals);
    };
}
exports.partialWithLayout = partialWithLayout;

import Hexo from 'hexo';
import { dirname, join } from 'upath';

// original https://github.com/hexojs/hexo/blob/cb19b2938d1f7882a4cb41a98974a3d673a63b45/lib/plugins/helper/partial.js#L5

export function partialWithLayout(ctx: Hexo) {
  return function partialWithLayout(name: string, locals: Hexo.Locals, options: Record<string, any> = {}) {
    if (typeof name !== 'string') throw new TypeError('name must be a string!');

    const { cache } = options;
    const viewDir = this.view_dir;
    const currentView = this.filename.substring(viewDir.length);
    const path = join(dirname(currentView), name);
    const view = ctx.theme.getView(path) || ctx.theme.getView(name);
    const viewLocals = { layout: false };

    if (!view) {
      throw new Error(`Partial ${name} does not exist. (in ${currentView})`);
    }

    if (options.only) {
      Object.assign(viewLocals, locals);
    } else {
      Object.assign(viewLocals, this, locals);
    }

    // Partial don't need layout
    // viewLocals.layout = false;

    if (cache) {
      const cacheId = typeof cache === 'string' ? cache : view.path;

      return this.fragment_cache(cacheId, () => view.renderSync(viewLocals));
    }

    return view.renderSync(viewLocals);
  };
}

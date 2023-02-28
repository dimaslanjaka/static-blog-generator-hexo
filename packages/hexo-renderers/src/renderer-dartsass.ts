import Hexo = require('hexo');
import sass = require('sass');

/**
 * hexo-renderer-dartsass
 * @param hexo
 */
export function rendererDartSass(hexo: Hexo) {
  const make = function (this: Hexo, data: Hexo.extend.RendererData, _options: { [key: string]: any }) {
    const config = Object.assign(this.theme.config.sass || {}, this.config.sass || {}, { file: data.path });

    return new Promise<string>((resolve, reject) => {
      sass.render(config, (err, result) => {
        if (err) {
          reject(err);
          return;
        }
        resolve(result.css.toString());
      });
    });
  };
  hexo.extend.renderer.register('scss', 'css', make);
  hexo.extend.renderer.register('sass', 'css', make);
}

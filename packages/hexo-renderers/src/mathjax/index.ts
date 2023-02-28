import path from 'path';
import ejs from 'ejs';
import fs from 'fs';

const layout = 'layout.ejs';
const bodyTag = '</body>';
const mathjaxScript = fs.readFileSync(path.join(__dirname, 'mathjax.html'));

/**
 * hexo-renderer-mathjax
 * @param hexo
 */
export function rendererMathjax(hexo: import('hexo')) {
  hexo.extend.renderer.register('ejs', 'html', function (data, options) {
    const path = (options.filename = data.path);
    let content = data.text;
    if (layout === path.substring(path.length - layout.length)) {
      content = content.replace(bodyTag, mathjaxScript + '\n' + bodyTag);
    }
    return ejs.render(content, options, { async: true });
  });
}

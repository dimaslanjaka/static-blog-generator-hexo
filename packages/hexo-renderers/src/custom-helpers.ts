import fs from 'fs';
import Hexo from 'hexo';
import _toArray from 'lodash.toarray';
import path from 'path';
import { parse } from 'url';
import yaml from 'yaml';
import { partialWithLayout } from './helper/partial';

const config: Hexo.Config = yaml.parse(fs.readFileSync(path.join(process.cwd(), '_config.yml')).toString());
const THEME_LOCATION = path.join(process.cwd(), 'themes', config.theme || 'landscape');
const _THEME_SCRIPTS = path.join(THEME_LOCATION, 'scripts');

// loadScripts(THEME_SCRIPTS);

/**
 * load all scripts
 * @param base
 */
function _loadScripts(base: string) {
  if (fs.existsSync(base)) {
    fs.readdirSync(base).forEach((p) => {
      const full = path.join(base, p);
      if (fs.statSync(full).isFile()) {
        require(full);
      } else if (fs.statSync(full).isDirectory()) {
        _loadScripts(full);
      }
    });
  }
}

function isObject(value: any) {
  return typeof value === 'object' && value !== null && value !== undefined;
}

function toArray(value: any) {
  if (isObject(value) && typeof value.toArray === 'function') {
    return value.toArray();
  } else if (Array.isArray(value)) {
    return value;
  }

  return _toArray(value);
}

export function getTheAuthor(authorObj: Record<string, any> | string) {
  if (typeof authorObj === 'string') return authorObj;
  if (typeof authorObj.name === 'string') return authorObj.name;
  if (typeof authorObj.nick === 'string') return authorObj.nick;
  if (typeof authorObj.nickname === 'string') return authorObj.nickname;
}

/**
 * register custom helpers
 * @param hexo
 */
export function registerCustomHelper(hexo: Hexo) {
  hexo.extend.helper.register('toArray', toArray);
  hexo.extend.helper.register('isObject', isObject);

  /**
   * Export theme config
   */
  hexo.extend.helper.register('json_config', function (this: Hexo & Record<string, any>) {
    const hexo = this;
    const { config, theme, url_for, __ } = hexo;
    const theme_config = {
      hostname: parse(config.url).hostname || config.url,
      root: config.root
    };
    const hexo_config = {
      homepage: url_for('/')
    };
    return {
      theme: Object.assign(theme, theme_config),
      project: Object.assign(config, hexo_config)
    };
  });

  // json_data('main', json_config())
  hexo.extend.helper.register('json_data', function (name, ...data) {
    const json = data.length === 1 ? data[0] : Object.assign({}, ...data);
    return `<script class="json-config" data-name="${name}" type="application/json">${JSON.stringify(json).replace(/</g, '\\u003c')}</script>`;
  });

  hexo.extend.helper.register(
    'getPosts',
    /**
     * @returns
     */
    function (this: Hexo) {
      const page = this['page'];
      return page.posts;
    }
  );

  hexo.extend.helper.register('getAuthor', function (author, fallback) {
    if (!author) return fallback;
    const test1 = getTheAuthor(author);
    if (typeof test1 === 'string') return test1;
    const test2 = getTheAuthor(this.config.author);
    if (typeof test2 === 'string') return test2;
    return 'default user';
  });

  hexo.extend.helper.register(
    'getPostByLabel',
    /**
     * hexo get post by key with name
     * @param by
     * @param filternames
     * @returns
     */
    function (
      this: Hexo & Record<string, any>,
      by: 'tags' | 'categories',
      filternames: string[]
    ): Record<string, string>[] {
      const hexo = this;
      const data: any[] = hexo.site[by].data;
      if (Array.isArray(data)) {
        console.log(typeof data.filter);
        const map = filternames
          .map((filtername) => {
            const filter = data.filter(({ name }) => String(name).toLowerCase() == filtername.toLowerCase());
            return filter.map((group) => {
              return group.posts.map(function ({
                title,
                permalink,
                thumbnail,
                photos
              }: Hexo.Post.Data & Record<string, any>) {
                // get title and permalink
                // for more keys, you can look at https://github.com/dimaslanjaka/nodejs-package-types/blob/ec9b509d81eefdfada79f1658ac02118936a1e5a/index.d.ts#L757-L762
                return { title, permalink, thumbnail, photos };
              });
            });
          })
          // flattern all multidimensional arrays
          // to get array of hexo post object
          .flat(2);
        // dump
        // console.log(map);
        // return an JSON string
        // return JSON.stringify(map, null, 2);
        // return an Array
        return map;
      }
      return [];
    }
  );

  hexo.extend.helper.register('partialWithLayout', partialWithLayout);
}

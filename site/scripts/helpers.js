/* global hexo */

'use strict';

hexo.extend.helper.register('canonical_url', function (lang) {
  let path = this.page.path;
  if (lang && lang !== 'en') path = lang + '/' + path;

  return full_url_for(path);
});

hexo.extend.helper.register('url_for_lang', function (path) {
  const lang = this.page.lang;
  let url = this.url_for(path);

  if (lang !== 'en' && url[0] === '/') url = '/' + lang + url;

  return url;
});

hexo.extend.helper.register('lang_name', function (lang) {
  const data = this.site.data.languages[lang];
  return data.name || data;
});

hexo.extend.filter.register('template_locals', function (locals) {
  const { page } = locals;
  if (page.archive) page.title = 'Archive';
});

/* global hexo */

hexo.extend.helper.register('getPosts', function () {
  const { page } = this;
  return page.posts;
});

hexo.extend.helper.register('getAuthor', function (author, fallback) {
  if (typeof author === 'string') return author;
  if (!author) return fallback;
  if (author.name) return author.name;
  if (author.nick) return author.nick;
  if (author.nickname) return author.nickname;
});

hexo.extend.helper.register(
  'getPost',
  /**
   * get post by key with name
   * @param {'tags'|'categories'} by
   * @param {string} filtername
   */
  function (by, filtername) {
    const hexo = this;
    /**
     * @type {any[]}
     */
    const data = hexo.site[by].data;
    const filter = data.filter(({ name }) => String(name).toLowerCase() == filtername.toLowerCase());
    const map = filter.map((group) => {
      return group.posts.map(
        /**
         * @param {import('hexo').Post.Data} post
         */
        function ({ title, permalink }) {
          // do what you have to do with each post
          return { title, permalink };
        }
      );
    });
    // return JSON.stringify(map, null, 2);
    return map;
  }
);

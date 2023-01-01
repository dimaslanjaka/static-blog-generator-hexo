/* global hexo */
/// <reference types="hexo" />
/// <reference types="node" />

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
   * @param {'tags'} by
   * @param {string} filtername
   */
  function (by, filtername) {
    const hexo = this;
    /**
     * @type {any[]}
     */
    const data = hexo.site[by].data.filter(({ name }) => name == filtername);
    data.forEach((tag) => {
      tag.posts.forEach(function (post) {
        // do what you have to do with each post
        console.log(post.title);
      });
    });
  }
);

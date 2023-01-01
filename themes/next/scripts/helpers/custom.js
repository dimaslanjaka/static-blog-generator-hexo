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

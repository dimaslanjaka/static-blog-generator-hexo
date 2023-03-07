# hexo-renderers
All in one hexo renderers. Load all hexo renderer engines at once.

## Specify renderers
You can specify some renderers by `_config.yml`
```yaml
renderers: ['ejs', 'stylus', 'nunjucks', 'dartsass', 'pug', 'sass']
```

> - dartsass improved from `hexo-renderer-dartsass`
> - sass improved from `hexo-renderer-sass`
> when `renderers` is not configured, `hexo-renderer-sass` are being used by default.

## Config each renderer
set config for your desired renderer engine.
- [hexo-renderer-dartsass](https://github.com/KentarouTakeda/hexo-renderer-dartsass/blob/master/README.md)
- [hexo-renderer-sass](https://github.com/knksmith57/hexo-renderer-sass#_configyml)

## Changelog

### 1.0.5
- improved `dartsass`
- add and improved `hexo-renderer-sass`
- optimize docs
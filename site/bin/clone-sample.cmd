@echo off

call sbg clean posts
call rimraf source/_posts/example
call git clone https://github.com/hexojs/hexo-theme-unit-test.git source/_posts/example
call cd source/_posts/example && git rm -rf . && git checkout origin/master source/_posts
call cd ../../..
call mv source/_posts/example/source/_posts/* source/_posts
call hexo clean
call rimraf source/_posts/example
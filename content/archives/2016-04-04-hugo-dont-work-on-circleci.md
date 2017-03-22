---
title: CircleCIでHugoが動かなくなった
author: kongou_ae
date: 2016-04-04
url: /archives/2016-04-04-hugo-dont-work-on-circleci
categories:
  - etc
---

　このブログは、Markdownでエントリーを書いてGithubにPushすると、CircleCIが検知してHugoでビルドし、Github Pagesに公開するという仕組みになっています。

　約2か月ぶりにブログを公開すべくGithubにPushしたところ、CircleCIによるビルドが失敗するようになっていました。CircleCI上でのエラーメッセージは以下の通りです。

```
hugo -t angels-ladder-fork
Started building site
ERROR: 2016/04/03 22:46:28 content.go:480: exit status 1
0 draft content
0 future content
157 pages created
245 non-page files copied
0 paginator pages created
0 tags created
19 categories created

hugo -t angels-ladder-fork returned exit code 255
```

　ヒントがなさすぎです。CircleCIのインスタンスにSSHでログインし、hugoをオプション付きで実行してみます。

```
ubuntu@box1910:~/blog$ hugo -t angels-ladder-fork -v
INFO: 2016/04/03 23:45:15 hugo.go:454: Using config file: /home/ubuntu/blog/config.toml
INFO: 2016/04/03 23:45:15 hugo.go:566: using a UnionFS for static directory comprised of:
INFO: 2016/04/03 23:45:15 hugo.go:567: Base: /home/ubuntu/blog/themes/angels-ladder-fork/static
INFO: 2016/04/03 23:45:15 hugo.go:568: Overlay: /home/ubuntu/blog/static/
INFO: 2016/04/03 23:45:15 hugo.go:600: syncing static files to /home/ubuntu/blog/public/
Started building site
INFO: 2016/04/03 23:45:15 content.go:474: Rendering with /usr/bin/asciidoc ...
ERROR: 2016/04/03 23:45:16 content.go:480: exit status 1
```

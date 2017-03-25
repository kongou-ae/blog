---
title: LambdaとGoogle Compute Engineで、川柳BOTと作った
author: kongou_ae
date: 2016-04-03
url: /archives/2016-04-03-senryu-bot-on-gce
categories:
  - aws
---

## 事の発端

<blockquote class="twitter-tweet" data-lang="ja"><p lang="ja" dir="ltr">タイムラインを自然言語処理して、5.7.5だったら「ナイス川柳！」と茶化すBOTを作りたい</p>&mdash; こんごー@頑張らないために頑張る (@kongou_ae) <a href="https://twitter.com/kongou_ae/status/708466918445821952">2016年3月12日</a></blockquote>
<script async src="//platform.twitter.com/widgets.js" charset="utf-8"></script>

## 成果
[@twit_senryu](https://twitter.com/twit_senryu)

## 実装

{{<img src="http://aimless.jp/blog/images/2016-04-03-001.png">}}]

## 設計

### 575の抽出方法

IBM Insights for Twitterを使ってツイートを取得し、その結果をkuromoji.jsで形態素解析しています。

IBM Insights for Twitterは月500万件まで

kuromoji.jsの辞書は、精度を上げるために[neologd/mecab-ipadic-neologd](https://github.com/neologd/mecab-ipadic-neologd)を使っています。

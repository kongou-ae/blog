---
title: 常用漢字をチェックするtextlintのルールを作った
author: kongou_ae
layout: post
date: 2016-12-15
url: /blog/archives/2016-12-15-make-the-rule-of-textlint
categories:
  - textlint
---

## 背景



文章校正ツールとして、Asciidocへの対応状況と形態素解析を標準サポートすることからRedPenを選んだものの、Javascript拡張の作り方と配布方法に苦労
していました。

そんな中、textlintに、`create-textlint-rule`という便利そうなツールが増えたので試してみました。

<blockquote class="twitter-tweet" data-lang="ja"><p lang="ja" dir="ltr">textlintのルールを一瞬で作成開始できるコマンド作った create-react-appみたいなやつ &quot;textlint/create-textlint-rule: Create textlint rule projec…&quot; <a href="https://t.co/NCqRPTxGj8">https://t.co/NCqRPTxGj8</a></p>&mdash; azu (@azu_re) <a href="https://twitter.com/azu_re/status/808675156495253505">2016年12月13日</a></blockquote>
<script async src="//platform.twitter.com/widgets.js" charset="utf-8"></script>

## 成果

[https://github.com/kongou-ae/textlint-rule-joyo-kanji](https://github.com/kongou-ae/textlint-rule-joyo-kanji)

![](https://aimless.jp/blog/images/2016-12-15-001.png)

以前書いたRedPenのJavaScript拡張（[use-joyo-Kanji.js](https://github.com/kongou-ae/redpen-validator/blob/master/use-joyo-Kanji.js)）を移植しました。

## 感想

RedPen用に書いた財産があるとはいえ、1時間くらいでtextlintの拡張を作ることができました。レールが用意されているツールは素晴らしい。RedPenにひかれた理由である形態素解析も、kuromoji.jsを使えば対応できるので、textlintをもっと使ってみます。

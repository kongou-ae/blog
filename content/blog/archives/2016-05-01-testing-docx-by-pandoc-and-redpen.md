---
title: Pandocの力を借りて、RedPenでWordファイルをテストする
author: kongou_ae
layout: post
date: 2016-05-01
url: /blog/archives/2016-05-01-testing-docx-by-pandoc-and-redpen
categories:
  - redpen
---

## 経緯

textlintとRedPenのどちらを使うかを悩み、「会社で使うWindowsのPCにインストールしやすいから」という理由でRedPenを選んでから、数か月がたちました。そんな中、昨日、自分の頭の中に神が降りてきました。

<blockquote class="twitter-tweet" data-lang="ja"><p lang="ja" dir="ltr">RedPenがWordに対応していなくて困ったが、PandocをかませてWordをmarkdownにすればいいだけだった。</p>&mdash; こんごー@頑張らないために頑張る (@kongou_ae) <a href="https://twitter.com/kongou_ae/status/725997053277409281">2016年4月29日</a></blockquote>
<script async src="//platform.twitter.com/widgets.js" charset="utf-8"></script>

RedPenはWordファイルに対応していません。ですが、Pandocを使ってWordファイルをMarkdownに変換すれば、RedPenでWordファイルの内容をテストできます。なぜ今まで思いつかなかった。

## 実践

Pandocはインストーラを使ってインストールします。RedPenはGitHubで配布されている圧縮ファイルをCドライブ直下に展開します。

PandocとRedPenをそれぞれコマンドラインで実行するのは大変なので、一連の処理をバッチにまとめます。バッチに渡したファイルの拡張子が`.docx`であったら、Pandocを使って中間ファイル`tmp.md`に変換したうえでRedPenによる検査を実施します。

```
@echo off
set PANDOCROOT=C:\Users\xxxxxx\AppData\Local\Pandoc
set REDPENROOT=C:\redpen-distribution-1.5.2
set PROJECTROOT=%~dp0
set FILENAME=%1
set FILETYPE=%~x1

IF "%1" EQU "" (
  echo ファイルを指定してください
  exit 1
)

IF %FILETYPE% EQU .docx (
  rem convert word to markdown
  cd %PROJECTROOT%
  %PANDOCROOT%\pandoc.exe -f docx -t markdown %FILENAME% -o tmp\tmp.md

  rem test by redpen
  %REDPENROOT%\bin\redpen -c %REDPENROOT%\conf\redpen-conf-ja-new.xml %PROJECTROOT%\tmp\tmp.md
  del tmp\tmp.md
  exit 0
) ELSE IF %FILETYPE% EQU .md (
  rem test by redpen
  %REDPENROOT%\bin\redpen -c %REDPENROOT%\conf\redpen-conf-ja-new.xml %PROJECTROOT%\%FILENAME%
  exit 0
) ELSE (
  echo .docxか.mdのファイルを引数に指定してください。
  exit 1
)
```

バッチファイルを使ってWordファイルをテストしてみます。RedPenによる検査が実施され、エラーを検出しています。

```
PS C:\pandoc-redpen> .\test.bat .\test.docx
[2016-05-01 20:13:33.382][INFO ] cc.redpen.Main - Configuration file: C:\redpen-distribution-1.5.2\conf\redpen-conf-ja-new.xml
[2016-05-01 20:13:33.417][INFO ] cc.redpen.config.ConfigurationLoader - Loading config from specified config file: "C:\redpen-distribution-1.5.2\conf\redpen-conf-ja-new.xml"
[2016-05-01 20:13:33.466][INFO ] cc.redpen.config.ConfigurationLoader - Succeeded to load configuration file
[2016-05-01 20:13:33.468][INFO ] cc.redpen.config.ConfigurationLoader - Language is set to "ja"
[2016-05-01 20:13:33.472][WARN ] cc.redpen.config.ConfigurationLoader - No variant configuration...
[2016-05-01 20:13:33.480][INFO ] cc.redpen.config.ConfigurationLoader - No "symbols" block found in the configuration
[2016-05-01 20:13:33.503][INFO ] cc.redpen.config.SymbolTable - "ja" is specified.
[2016-05-01 20:13:33.507][INFO ] cc.redpen.config.SymbolTable - "zenkaku" variant is specified
[2016-05-01 20:13:35.883][INFO ] cc.redpen.parser.SentenceExtractor - "[。, ？, ！]" are added as a end of sentence characters
[2016-05-01 20:13:35.886][INFO ] cc.redpen.parser.SentenceExtractor - "[’, ”]" are added as a right quotation characters
[2016-05-01 20:13:36.165][INFO ] cc.redpen.validator.JavaScriptValidator - JavaScript validators directory: js
tmp.md:0: ValidationError[ParagraphNumber], セクション内のパラグラフ数が最大の"46"を超えています at line:
tmp.md:1: ValidationError[JavaScript], [termsValidator0.js] 文書規約違反(MyCompany)です。「事」を修正してください。（正：こと　誤：事） at line: ごはんの事である。
tmp.md:1: ValidationError[JavaScript], [jtfStyleGuideValidator.js] 文書規約違反(JTF-2.2.1)です。「何時」を修正してください。（正：いつ　誤：何時） at line: 何時かご飯を食べて下さい。
（中略）
[2016-05-01 20:13:41.233][ERROR] cc.redpen.Main - The number of errors "45" is larger than specified (limit is "1").
PS C:\pandoc-redpen>
```

## 所感

Pandocを利用することで、RedPenが対応していないフォーマットのドキュメントを検査することができました。

最近対応したプロジェクトでは、「Excelに定義されている文書規約に沿って提案書を書き、レビューではその文書規約どおりであることを手作業で確認する」という地獄を体験しました。この無意味な地獄をPandocとRedPenの合わせ技で乗り切れるように仕込みをしようと思います。

---
title: asciidoctor-pdfで複数行のフッタを作る
author: kongou_ae
date: 2016-02-07
url: /archives/2016-02-07-build-multiple-line-footer-by-asciidoctor-pdf
categories:
  - asciidoc
---

会社のWordテンプレのフッターが複数行なので、asciidoctor-pdfで複数行のフッタを出力する方法を調べました。

## テーマファイルの書き方

今回は、PDFのフッタにページ番号とコピーライトをつけます。その場合、テーマファイルを以下のように記載します。参考：[Running header & footer](https://github.com/asciidoctor/asciidoctor-pdf/blob/master/docs/theming-guide.adoc#running-header--footer)

```
footer:
  font_size: $base_font_size_small
  font_color: $base_font_color
  border_color: dddddd
  border_width: 0.25
  height: 25mm
  padding: [3mm,0,0,0]
  vertical_align: top
  recto_content:
    center: |
        {page-number} / {page-count} +
        Copyright &#169; hogehoge company CO.,LTD. All right reserved.
  verso_content: |
        {page-number} / {page-count} +
        Copyright &#169; hogehoge company CO.,LTD. All right reserved.
```

## PDF出力

asciidoctor-pdfでビルドする際に上記のテーマファイルを利用すると、以下のPDFが生成されます。やりたいことができました。

{{<img src="http://aimless.jp/blog/images/2016-02-07-001.png">}}

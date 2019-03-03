---
title: asciidoctor-pdfでそれっぽい表紙を作る
author: kongou_ae
date: 2016-02-16
url: /archives/2016-02-16-titlepage-of-pdffile-created-by-asciidoctorpdf
categories:
  - asciidoc
---

## デフォルトの表紙

asciidoctor-pdfでは、H1と以下2行をもとに表紙が生成されます。

```
= ウルトラスペシャル ハイパーギガンティックサービス サービス仕様書: ミラクルマジカル編
ほげほげ株式会社 <doc.writer@example.jp>
v1.0, 2014-01-01
```

テーマをカスタマイズせずにPDFを生成すると、以下のような形になります。

{{<img src="https://aimless.jp/blog/images/2016-02-16-001.png">}}

## テーマファイルを使って表紙をカスタマイズする

[テーマファイルのコンフィグ例](https://github.com/asciidoctor/asciidoctor-pdf/blob/master/docs/theming-guide.adoc#title-page)をもとに、表紙をカスタマイズしてみます。

```
title_page:
  align: center
  title_top: 40%
  title_font_size: $heading_h1_font_size
  title_font_color: 000000
  title_line_height: 0.9
  subtitle_font_size: $heading_h3_font_size
  subtitle_line_height: 3
  authors_margin_top: $base_font_size * 3
  authors_font_size: $base_font_size_large
  authors_font_color: 181818
  revision_margin_top: $base_font_size * 3
  logo_image: image:889.png[scaledwidth=25%]
  logo_top: 75%
 ```

かっこよくなりました。

 {{<img src="https://aimless.jp/blog/images/2016-02-16-002.png">}}

## タイトルの改行位置を調整する

 タイトルが変な位置で改行されてしまっているので修正します。H1の文字列を` `で区切ることで、PDFのタイトルを任意の位置で改行することができます。

```
 = ウルトラスペシャル ハイパーギガンティック エターナルフォースサービス サービス仕様書: ミラクルマジカル編
ほげほげ株式会社 <doc.writer@example.jp>
v1.0, 2014-01-01
```

 {{<img src="https://aimless.jp/blog/images/2016-02-16-003.png">}}

狙った位置でタイトルが改行されました。可読性を向上させることができました。

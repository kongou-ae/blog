---
title: asciidocのimage記法
author: kongou_ae
date: 2016-12-03
url: /archives/2016-12-03-image-macro-attributes-of-asciidoc
categories:
  - asciidoc
---

## 背景

asciidoctor-pdfで画像入りのPDFを作り始めたものの、センタリングやサイジングなどMarkdownには存在しない記法が覚えられません。asciidocは高機能ですが、使いこなせなければ意味がない。

というわけで、[公式のユーザガイド](http://www.methods.co.nz/asciidoc/userguide.html)から使いそうなものをまとめました。

## 実践

### 画像の種類

インラインとブロックがあります。違いはコロンの数です。

|区分   |記法|
|-------|----|
|インライン |`image:<target>[<attributes>]` |
|ブロック |`image::<target>[<attributes>]` |

インラインとブロックの見た目は以下のとおりです。

{{<img src="https://aimless.jp/blog/images/2016-12-03-001.png">}}

ブロックのみ有効になる属性がありますので、意識して使い分ける必要があります。たとえば、あとで説明する`align`はブロックでのみ使えます。

### サイズ

表示サイズを指定できます。

|区分   |記法|
|-------|----|
|絶対 |`image:<target>[width=""]` |
|相対 |`image::<target>[scaledwidth=""]` |

絶対指定は`width`です。単位はピクセルです。

相対指定は`scaledwidth`です。ただし、`scaledwidth`が有効になるのは、出力先がPDFの時だけです。出力先がHTMLの場合、`scaledwidth`は効きません。

サイズを指定しないと以下のとおりです。

{{<img src="https://aimless.jp/blog/images/2016-12-03-002.png">}}

`width="75"`をつけると画像が縮みます。

{{<img src="https://aimless.jp/blog/images/2016-12-03-003.png">}}

`scaledwidth="50%"`をつけると、横幅がPDFの印刷領域の半分になります。

{{<img src="https://aimless.jp/blog/images/2016-12-03-004.png">}}

## 整列

センタリングと右寄せ、左寄せができます。

|区分   |記法|
|-------|----|
|センタリング |`image:<target>[align="center"]` |
|左寄せ |`image::<target>[align="left"]` |
|右寄せ |`image::<target>[align="right"]` |

何もしないと、左寄せになります。`align="center"`や`align="right"`をつけた結果は以下のとおりです。

```
image::17_11_vmd5c.jpg[scaledwidth="50%",align="right"]

image::17_11_vmd5c.jpg[scaledwidth="50%",align="center"]
```

{{<img src="https://aimless.jp/blog/images/2016-12-03-005.png">}}

## 感想

Asciidocの表現力の高さを、改めて実感しました。

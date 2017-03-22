---
title: Netlifyを使ってブログをHTTPS化する
author: kongou_ae
date: 2016-09-07
url: /archives/2016-11-18-enable-https-by-netlify
categories:
  - etc
---

## 背景

時代はHTTPSだということで、GitHub Pagesで公開している本ブログをHTTPS化しました。

## 実践

### ホスティング先の選定

GitHub Pages＋CloudFlareではなく、[Netlify](https://app.netlify.com/)を使うことにしました。


- [高機能ホスティングサービスNetlifyについて調べて使ってみた](http://qiita.com/TakahiRoyte/items/b7c4d1581df1a17a93fb)
- [Netlifyは最強の静的ウェブサイトホスティングサービスかもしれない](http://yoshidashingo.hatenablog.com/entry/2016/08/22/193821)

### デプロイプロセスの整備

このブログは、CircleCIを中心としたデプロイプロセスで運営されています。Netlifyには、GitHubと連携しHogoを自動ビルトする機能があります。ですが、この機能を使うと、RedPenによる文書チェックが行われません。

![](https://aimless.jp/blog/images/2016-04-25-001.png)

そこで今回は、CircleCIのリリース先をGitHub PagesからNetlifyに切り替えることにしました。Netlifyには`netlify-cli`というCLIツールが用意されています。`circle.yml`のデプロイ処理に、`netlify-cli`のインストールと`netlify-cli`を使ったサイトのデプロイを追加します。

```
deployment:
  master:
    branch: master
    commands:
      - gem install asciidoctor
      - npm install netlify-cli
      - hugo -t angels-ladder-fork
      - rm -rf public/blog/categories
      - mv public/categories public/blog
      - node_modules/.bin/netlify deploy -t "$netlify_token"
```

`netlify deploy`コマンドは、デプロイ先とデプロイするフォルダを`.netlify`ファイルから取得しますので、以下のフォーマットで記載します。site_idは管理画面のSite Infoに記載されています。

```json:.netlify
{"site_id":"xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx","path":"public"}
```

`.netlify`にはAPIをたたくTokenを含めることもできます。しかし、`.netlify`ファイルをリポジトリにふくめたいので、TokneをCircleCIの環境変数に設定したうえで、`netlify-cli`に-tオプションで渡します。

### 独自ドメインの利用

Netlifyでは独自ドメインを利用できます。管理画面で独自ドメインを入力し、DNSサーバのCNAMEまたはAレコードをNetlifyに向けるだけです。シンプル。

参考：[Using a custom domain](https://www.netlify.com/docs/custom-domains/)

### HTTPS化

ボタンぽちーでLet's EncryptによるHTTPSが有効になります。NetlifyはHTTP/2による配信をサポートしていますので、HTTPS化によってHTTP/2の恩恵を得られます。

![](https://aimless.jp/blog/images/2016-11-18-001.png)

### 通知

Netlifyは以下の通知をサポートしています。今回は、デプロイの成功と失敗を自分のSlackチャンネルに流します。

![](https://aimless.jp/blog/images/2016-11-18-002.png)

このような通知が流れます。

![](https://aimless.jp/blog/images/2016-11-18-003.png)

### Hugoのテンプレート変更

HTTP前提で作られているHugoのテンプレートを修正します。

- Amazonアソシエイトが表示されなくなったので、`&internal=1`を追加
- はてぶのブックマーク数表示をHTTPSに変更。
- Hugoの`baseurl`をhttpsにする勇気がなかったので、ブログのH1にHTTPSのURLを埋め込み、リンクの生成を`.Permalink`から`.RelPermalink`に変更

はてぶのブックマーク数は、まだhttpのURLを見に行っています。そのうち変えたい。


## 感想

ブログを静的サイトにしておいて本当によかったです。おかげで、Netlifyという高機能なホスティング先を切り替えることができました。

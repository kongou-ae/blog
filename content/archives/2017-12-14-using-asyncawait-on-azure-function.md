---
title: Azure Functionでasync/awaitを使う
author: kongou_ae

date: 2017-12-14
url: /archives/2017-12-14-using-asyncawait-on-azure-function
categories:
  - Azure

---

## はじめに

デフォルトのAzure Funtionではasync/awaitが使えません。Node.jsのバージョンがv6.5.0だからです。ですが、設定変更すればAzure Funtionでasync/awaitを使えます。Callback地獄から解放されます。

ただし、今回の手順は12月15日時点でプレビューの機能を使います。ご注意ください。

## 手順

async/awaitを使うためには次の設定変更が必要です。

1. Runtime versionをBetaに変更
1. 環境変数「WEBSITE_NODE_DEFAULT_VERSION」を8.5.0に変更

{{<img src="./../../images/2017-12-14-002.png">}}

{{<img src="./../../images/2017-12-14-004.png">}}

## 動作確認

v6.5.0だとasyncの箇所がエラーになります。

{{<img src="./../../images/2017-12-14-006.png">}}

v8.5.0に切り替えるとasync/awaitを解釈します。asyncの部分がエラーになりません。sleepにawaitをつけていないと、10秒待たずに次の処理に進みます。

{{<img src="./../../images/2017-12-14-007.png">}}

参考：[ES2017 async/await で sleep 処理を書く](https://qiita.com/asa-taka/items/888bc5a1d7f30ee7eda2)

sleepにawaitをつけると、10秒待ってから次の処理に進みます。async/awaitしてますね。すばらしい！！

{{<img src="./../../images/2017-12-14-005.png">}}
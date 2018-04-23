---
title: global subscription filteringを試す
author: kongou_ae

date: 2018-04-24
url: /archives/2018-04-24-global-subscription-filtering
categories:
  - azure
---

先日アナウンスされた[global subscription filtering](https://azure.microsoft.com/en-us/updates/updates-to-subscription-filtering/)がPreview版ポータルで利用できるようになっていたので試しました。

## 既定のディレクトリの設定

現在のAzure Portalは、ポータルを表示する際に最後にアクセスしたAADのディレクトリを利用をする動作になっています。新しいフィルタリングでは「最後にアクセスしたAADを利用するする動作」だけでなく「任意のAADを利用するする動作」を選択できるようになります。よく利用するAADを選択しておくと、一時的に別ディレクトリで作業したとしても、改めてポータルを表示するとよく利用するAADにログインした状態になります。ディレクトリをスイッチする手間が減りますので、地味だけど便利そう。

## ディレクトリの切り替え先として表示されるディレクトリのフィルタリング

現在のAzure Portalは、ディレクトリの切り替え先として「ログインしたアカウントに紐づく全てのAADテナントを表示する動作」になっているはずです。新しいフィルだリングでは「お気に入り機能」が追加されます。よく利用するAADテナントをお気に入りに登録できるようになります。AADテナントが多くなると切り替えたいディレクトを一覧から探すのが大変なので、お気に入り機能の追加は地味だけど便利な修正です。

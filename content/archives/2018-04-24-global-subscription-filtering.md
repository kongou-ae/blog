---
title: global subscription filteringを試す
author: kongou_ae

date: 2018-04-24
url: /archives/2018-04-24-global-subscription-filtering
categories:
  - azure
---

先日アナウンスされた[global subscription filtering](https://azure.microsoft.com/en-us/updates/updates-to-subscription-filtering/)がPreview版ポータルで利用できるようになっていたので試しました。

{{<img src="./../../images/2018-04-24-001.png">}}

## 既定のディレクトリの設定

現在のAzure Portalは、ポータルを表示する際に最後にアクセスしたAADのディレクトリを利用をする動作になっています。新しいフィルタリングでは「最後にアクセスしたAADを利用するする動作」だけでなく「任意のAADを利用するする動作」を選択できるようになります。

{{<img src="./../../images/2018-04-24-002.png">}}

よく利用するAADを選択しておくと、一時的に別ディレクトリで作業したとしても、改めてポータルを表示するとよく利用するAADにログインした状態になります。ディレクトリをスイッチする手間が減りますので、地味に便利そう。


## 切り替え先ディレクトリのお気に入り登録

現在のAzure Portalは、ディレクトリの切り替え先として「ログインしたアカウントに紐づく全てのAADディレクトリを表示する動作」になっているはずです。新しいフィルタリングでは「お気に入り機能」が追加されます。任意のAADディレクトリをお気に入りとして登録できるようになります。

{{<img src="./../../images/2018-04-24-003.png">}}

AADテナントが多くなると切り替えたいディレクトを一覧から探すのが大変です。これも地味に便利そう。

{{<img src="./../../images/2018-04-24-004.png">}}

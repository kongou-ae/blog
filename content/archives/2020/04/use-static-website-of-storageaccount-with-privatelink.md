---
title: Private Link 経由で Azure Storage の Static website を使う
author: kongou_ae
date: 2020-04-08
url: /archives/2020/04/use-static-website-of-storageaccount-with-privatelink
categories:
  - azure
---

## はじめに

Azure の Storage Account が Private Link をサポートしたので、「Static website も Private Link 経由で動くのか」という疑問を評価してみました。

## Web 向けの Private Link を作る

Storage Account 向けの Private Link を作る際には、ターゲットとなる Sub Resource を選択する必要があります。Static website 向けの Private Link を作る場合は、Sub Resource に Web を選択します。

{{< figure src="/images/2020/2020-0408-001.jpg" title="Sub Resource に Web を指定する画面" >}}

さらに、Static website にアクセスする端末が Static website の FQDN を Private Link のプライベート IP アドレスに名前解決できるように、DNS の設定を変更する必要があります。今回の検証では、Private Link が存在する Virtual Network 内にデプロイした動作確認用 Windows Server の Hosts ファイルに次の設定を追加します。

{{< figure src="/images/2020/2020-0408-009.jpg" title="Hosts ファイルに追加した Static website 用の設定" >}}

## 動作確認

Hosts ファイルを変更した Windows Server から Static website の FQDN にアクセスすると、index.html が表示されます。一方で、インターネットから Static website の FQDN にアクセスすると 404 のエラーが返ってきます。想定通りの動作です。

{{< figure src="/images/2020/2020-0408-002.jpg" title="Private Link 経由で Static website にアクセスした際の画面" >}}

{{< figure src="/images/2020/2020-0408-003.jpg" title="インターネット経由で Static website にアクセスした際の画面" >}}

ただし、この設定だけでは Static website のコンテンツを更新できません。ポータルや Storage Exploer から Blob の $web コンテナにアクセスしようとすると次のようにエラーになるためです。

{{< figure src="/images/2020/2020-0408-004.jpg" title="インターネット経由で $web を閲覧しようとした際の表示" >}}

## Blob 向けの Private Link を作る

$web コンテナにコンテンツをアップロードするために、Sub Resource が Blob な Private Link を追加します。

{{< figure src="/images/2020/2020-0408-005.jpg" title="Sub Resource に blob を指定する画面" >}}

さらに、Static website と同様、Private Link が存在する Virtual Network 内の Windows Server の Hosts ファイルに次の設定を追加します。

{{< figure src="/images/2020/2020-0408-008.jpg" title="Hosts ファイルに追加した blob 用の設定" >}}


## 動作確認

Hosts ファイルを変更した Windows Server から Azure Portal 経由で blob 内の $web コンテナを閲覧できるようになりました。

{{< figure src="/images/2020/2020-0408-006.jpg" title="Private Link 経由で $web を閲覧した際の画面" >}}

これで Private Link 経由で Static Website のコンテンツを更新できます。

{{< figure src="/images/2020/2020-0408-007.jpg" title="Private Link 経由で更新したコンテンツ" >}}

---
title: Azure Stack 1808 Update の所感
author: kongou_ae
date: 2018-09-08
url: /archives/2018-09-08-azurestack-1808-update
categories:
  - azurestack
---

## はじめに

Azure Stack 1808 Updateがリリースされました。ぐっときたポイントをまとめます。

[Azure Stack 1808 update](https://docs.microsoft.com/en-us/azure/azure-stack/azure-stack-update-1808)

## Managed Diskのサポート

Managed Diskがサポートされました。Snapshotも取れます。Azure StackがManaged Diskをサポートしていない状況は、Azureとの一貫性を大きく損ねていました。1808 UpdateによってAzureとの一貫性は持ち直しました。

<blockquote class="twitter-tweet" data-lang="ja"><p lang="en" dir="ltr">Managed Disk on Azure Stack !!! <a href="https://t.co/TYSKCeVMTp">pic.twitter.com/TYSKCeVMTp</a></p>&mdash; こんごー (@kongou_ae) <a href="https://twitter.com/kongou_ae/status/1038225239350468608?ref_src=twsrc%5Etfw">2018年9月8日</a></blockquote>
<script async src="https://platform.twitter.com/widgets.js" charset="utf-8"></script>

## ポータルの見た目変更

Azure Stackの管理者ポータルとユーザポータルが、一世代前のAzureポータルのようになりました。目立つ変更点は、Grobal Subscription filterや左上のAll Services、Virtual Machine作成時のサイズを選ぶ画面などです。ただし、1808 Updateの数日前にAzureポータルの見た目が新しくなってしまったので、AzureポータルとAzure Stackポータルの見た目が揃うことはありませんでした。残念。

<blockquote class="twitter-tweet" data-lang="ja"><p lang="ja" dir="ltr">Azure Stackのポータルが一世代前のAzureっぽくなった。1808 Update配信のちょっと前にAzureのポータルが新しくなっちゃったので、両方が同じ感じにはならず・・・ <a href="https://t.co/GtBHEvkOCF">pic.twitter.com/GtBHEvkOCF</a></p>&mdash; こんごー (@kongou_ae) <a href="https://twitter.com/kongou_ae/status/1038379761846824960?ref_src=twsrc%5Etfw">2018年9月8日</a></blockquote>
<script async src="https://platform.twitter.com/widgets.js" charset="utf-8"></script>

## Extension Host

現在のAzure Stackは、管理者ポータルとユーザポータルを利用する際に様々なポートを利用します。プロトコルとしてはHTTPSなのですが、443番以外のポートも利用します。

[Azure Stack datacenter integration - Publish endpoints](https://docs.microsoft.com/en-us/azure/azure-stack/azure-stack-integrate-endpoints#ports-and-protocols-inbound)

これをTCP/443のみにしてくれる機能がExtension Hostです。クライアントとAzure Stack上のAzureサービスの間で動作するProxyサーバみたいなものです。この機能が実装されると、クライアントはAzure Stackのポータルに対してTCP/443のみで通信するようになります。通信制御をシンプルにできます。

1808 UpdateではExtension Host用のドメインが追加されました。次回以降のアップデートで実際にExtension Hostを使うようになりそうです。

<blockquote class="twitter-tweet" data-lang="ja"><p lang="ja" dir="ltr">extension hostのサブドメインが入ってる。 <a href="https://t.co/CVMoE2lgZv">pic.twitter.com/CVMoE2lgZv</a></p>&mdash; こんごー (@kongou_ae) <a href="https://twitter.com/kongou_ae/status/1038248327698034690?ref_src=twsrc%5Etfw">2018年9月8日</a></blockquote>
<script async src="https://platform.twitter.com/widgets.js" charset="utf-8"></script>

## Updateの自動ダウンロード

Azure Stack自身がUpdateのパッケージを自動でダウンロードするようになりました。1807 Updateで実装された機能が1808 Updateのリリースによって明らかになった形です。1807 Updateのリリースノートに明記されていなかったので、1808 Updateのリリース直後には、この機能の実装を喜ぶAzure Stack Operatorの姿がTwitter上に溢れました。

これまでUpdateを適用するためには次の手順が必要でした。手順3以降のUpdateが完全に自動化されているので、手順１と手順２が凄く面倒です。

1. パッケージをダウンロードするツールを起動して、数Gバイトのパッケージをダウンロードする
1. 数GバイトのパッケージをAzure Stack上のストレージアカウントにアップロードする
1. 管理者ポータル上でUpdateを実行する

本機能の実装によって、Azure Stack Operatorは手順1と手順2の作業から解放されます。Updateの適用手順は、MicrosoftからUpdateのアナウンスがあったら管理者ポータルで"Update now"のボタンを押すだけになりました。簡単。

## おわりに

Azure Stack 1808 Updateでぐっときたポイントをまとめました。利用者としてはManaged Diskの実装がうれしいです。AzureではManaged Diskを使っているのに、Azure StackではUnmanaged Diskを使わなければならないという状況は苦痛でした。Azure Stack OperatorとしてはUpdateの自動ダウンロードが素晴らしい。毎月のUpdate適用が本当にボタンを一つ押すだけになりました。

ただし、月末に開催されるIgniteの直前リリースと考えると、少々物足りないです。Igniteの会場で刺激的な発表があることを期待します。

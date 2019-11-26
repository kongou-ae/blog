---
title: Azure Stack Hub 1910 Update の変更点（ネットワーク編）
author: kongou_ae
date: 2019-11-26
url: /archives/2019/10/change-about-network-in-azurestack-1910-update
categories:
  - azurestack
---

## はじめに

Azure Stack Hub 1910 Update が配信されました。1910 Update ではデプロイ時に指定するネットワークが変わりました。本エントリではその変更点をまとめます。なお、ネットワーク編としたものの、他の編を書くかどうかは未定です。。。

<blockquote class="twitter-tweet"><p lang="ja" dir="ltr">1910 以降で追加で決めなければならないパラメータ2つ <a href="https://twitter.com/hashtag/AzureStackHub?src=hash&amp;ref_src=twsrc%5Etfw">#AzureStackHub</a> <a href="https://t.co/d6N2UbXoSG">https://t.co/d6N2UbXoSG</a> <a href="https://t.co/45N5eBSiNp">pic.twitter.com/45N5eBSiNp</a></p>&mdash; こんごー (@kongou_ae) <a href="https://twitter.com/kongou_ae/status/1199279716282142720?ref_src=twsrc%5Etfw">November 26, 2019</a></blockquote> <script async src="https://platform.twitter.com/widgets.js" charset="utf-8"></script>

## サマリ

- Private Network のサイズが/24から/20になりました
- BMC Network と通信したいサブネットを Deployment Worksheet で指示できるようになりました

## Private Network

1910 Update より先のアップデートで Azure Stack Hub のインフラサービスがコンテナ化されるため、コンテナ内部で利用するアドレスが新規で必要になります。このコンテナ内部で利用するサブネットが Private Network に追加されました。

- Storage network(/25)：Private Network にもとからあった
- Internal virtual IP network(/25)：Private Network にもとからあった
- Container network(/23)：1910 Update で追加

参考：[Network integration planning for Azure Stack](https://docs.microsoft.com/en-us/azure-stack/operator/azure-stack-network?WT.mc_id=AZ-MVP-5003408&view=azs-1910#private-network)

この Private Network は/20を要求します。なかなかのサイズ感です。しかも、次の通り重複不可です。

> While the network is private to Azure Stack, it must not overlap with a network in your datacenter.

引用：[Azure Stack updates: release notes](https://docs.microsoft.com/en-us/azure-stack/operator/release-notes?view=azs-1910?WT.mc_id=AZ-MVP-5003408#changes)

## Permitted networks

Azure Stack Hub は BMC ネットワークとの通信をスイッチの ACL で制御しています。利用者はこの ACL をカスタマイズできます。これまでは OEM 独自の方法で ACL の設定をやりとりしていました。このやり取りが Deployment Worksheet に統一されました。そして、ACL に追加するネットワークのことを Permitted networks と呼ぶようになりました。

参考：[Permitted networks](https://docs.microsoft.com/en-us/azure-stack/operator/azure-stack-network?WT.mc_id=AZ-MVP-5003408&view=azs-1910#permitted-networks)

## おわりに

1910 Update におけるネットワークの変更点をさらっとまとめました。インフラサービスがコンテナ化されると何がどう変わるのか、とても楽しみです。

---
title: Azure Stack Integrated system のアナウンス@Ignite 2019
author: kongou_ae
date: 2019-11-04
url: /archives/2019/11/update-of-azurestackhub-in-ignite2019
categories:
  - azurestack
---

Microsoft Ignite 2019 で発表になった Azure Stack Integrated system 関連のアナウンスをまとめるためのページです。随時更新。

## ソース
- https://news.microsoft.com/wp-content/uploads/prod/sites/563/2019/11/Ignite-2019-Book-of-News.pdf
- https://techcommunity.microsoft.com/t5/Azure-Stack-Blog/Azure-Stack-Hub-extends-capabilities-on-the-Edge/ba-p/984483
- https://community.emc.com/mobile/mobile-access.jspa#jive-document?content=%2Fapi%2Fcore%2Fv2%2Fposts%2F15240

## サマリ

## 名称変更

これまで Azure Stack という名称で語られていた Azure Stack Integrated system が、Azure Stack Hub という名前になりました。そして、Azure Stack という単語は、「Azure StaCk HCI」と「Azure Stack Edge（元 Data Box Edge）」「Azure Stack Hub」という3つのソリューションを包括するものに変わりました。Ignite では、「Azure Stack Family」や「 Azure Stack Portfolio」という表現で使われています。

<blockquote class="twitter-tweet"><p lang="en" dir="ltr"><a href="https://twitter.com/hashtag/AzureStack?src=hash&amp;ref_src=twsrc%5Etfw">#AzureStack</a> is now a family:<a href="https://twitter.com/hashtag/AzureStackHub?src=hash&amp;ref_src=twsrc%5Etfw">#AzureStackHub</a> (<a href="https://twitter.com/hashtag/AzureStack?src=hash&amp;ref_src=twsrc%5Etfw">#AzureStack</a>)<a href="https://twitter.com/hashtag/AzureStackEdge?src=hash&amp;ref_src=twsrc%5Etfw">#AzureStackEdge</a> (<a href="https://twitter.com/hashtag/DataBoxEdge?src=hash&amp;ref_src=twsrc%5Etfw">#DataBoxEdge</a>)<a href="https://twitter.com/hashtag/AzureStackHCI?src=hash&amp;ref_src=twsrc%5Etfw">#AzureStackHCI</a> <a href="https://t.co/xjqKpcdMSp">pic.twitter.com/xjqKpcdMSp</a></p>&mdash; David Armour (@Darmour_MSFT) <a href="https://twitter.com/Darmour_MSFT/status/1191355165116420096?ref_src=twsrc%5Etfw">November 4, 2019</a></blockquote> <script async src="https://platform.twitter.com/widgets.js" charset="utf-8"></script>

名前の変更に伴い、Twitter のハッシュタグも変更になりました。これからは #AzureStackHub です。

## Availability of BC/DR foundational pattern for Azure Stack Hub to Azure Stack Hub

2020年上半期に、2つの Azure Stack Hub 間での Virtual Machine をフェイルオーバ/フェイルバックする手法を発表するようです。[BRK3116のセッション](https://myignite.techcommunity.microsoft.com/sessions/81962?source=sessions)では、サードパーティーの製品を使ってデータをレプリケーションする手法を案内していましたが、これとは違う何かがでるのでしょうか・・

## Event Hubs on Azure Stack Hub (Public Preview)

Azure Stack Hub 上の Event Hub が2020年にパブリックプレビューになります。

## Azure data services (Arc) on Azure Stack Hub (Private preview)

Azure Stack 上の Azure Data service (Arc)がプライベートプレビューが始まりました。次の URL を見る限りだと、Azure Data service on K8s cluster on Azure Stack Hub ってことでしょうかね・・・そもそも Azure Data service (Arc) 自体が発表されたばかりなのでさっぱり分からん・・・

https://azure.microsoft.com/en-us/services/azure-arc/hybrid-data-services/

> Azure SQL Database and Azure Database for PostgreSQL Hyperscale are now available on Azure Arc for private preview. Over time, we will bring other Azure data services to Azure Arc.

## Azure Stream Analytics support on Azure Stack Hub (Public Preview)

Azure Stack Hub 上の Stream Analytics がパブリックプレビューになりました。1910 でインストールできるようになるのでしょうか・・・

## Kubernetes on Azure Stack Hub(GA)

Azure Stack Hub 上の AKS Engine ベースの K8s が GA しました。

## Windows Virtual Desktop on Azure Stack Hub (Private Preview)

Azure Stack Hub 上の Windows Virtual Desktop がプライベートプレビューになりました。WVD のコントロールプレーンは Azure のままで、リソースプールとなる Virtual Machine を Azure Stack Hub 上で稼働できるようです。

プレビューの申し込み先：aka.ms/azswvd

## GPU サポート（開発中）

Azure Stack が NVIDIA V100 NC Series と NVIDAI T4、AMD MI25 NV Series をサポートすることを発表しました。GPU のサポートにともない Azure Stack 上で N シリーズを利用できるようになります。

GPU のサポートは2020年1月からパブリックプレビューの予定です。プレビューの申し込み先：aka.ms/azurestackgpupreview

## マルチスケールユニット（開発中）

2020年末までに Azure Stack に2つ目のスケールユニットを追加できるようになることが発表されました。ただし、初期段階のリリースではキャパシティーが拡張するだけです。Azure Stack のコントロールプレーンである Infrastructure Role Instances は1本目のみに存在するため、可用性は向上しません。

## インフラのコンテナ化

Azure Stack のコントロールプレーン部分をコンテナ化していることが明言しました。コンテナ化に伴いコンテナ内部で利用するネットワークアドレスが追加で必要になるようです。

## アップデートの改善

1910 Update で Express なアップデート中のダウンタウンがなくなります。CY20H1を目標にFull Update 中のダウンタウンもなくなる予定です。

## Aka.ms/azsasfslides

Azure Stack の基本を説明する動画集「Azure Stack Foundation - Core」（全16個）が発表されました。

## Instance Metadata

コンピュートの担当であるが169.254.169.254 にアクセスすると自分の情報を取得できるInstance Metadataを開発中であることを発表しました。

## CloudInit

コンピュートの担当であるがCloudInitを開発中であることを発表しました。

## Storage Attach

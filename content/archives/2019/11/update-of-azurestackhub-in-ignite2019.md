---
title: Azure Stack Integrated system のアナウンス@Ignite 2019
author: kongou_ae
date: 2019-11-04
url: /archives/2019/11/update-of-azurestackhub-in-ignite2019
categories:
  - azurestack
---

Microsoft Ignite 2019 で発表になった Azure Stack Integrated system 関連のアナウンスをまとめました。

## ソース
- [Book of News - Ignite 2019 - Microsoft News](https://news.microsoft.com/wp-content/uploads/prod/sites/563/2019/11/Ignite-2019-Book-of-News.pdf)
- [Azure Stack Hub extends capabilities on the Edge](https://techcommunity.microsoft.com/t5/Azure-Stack-Blog/Azure-Stack-Hub-extends-capabilities-on-the-Edge/ba-p/984483)
- [Now is the time to modernize your datacenter and migrate your applications to Microsoft Azure Stack](https://myignite.techcommunity.microsoft.com/sessions/81962?source=sessions)
- [Building high-value integrated data center solutions for Microsoft Azure Stack](https://myignite.techcommunity.microsoft.com/sessions/82908?source=sessions)
- [Dell EMC Tech Previews: Microsoft Ignite 2019](https://community.emc.com/mobile/mobile-access.jspa#jive-document?content=%2Fapi%2Fcore%2Fv2%2Fposts%2F15240)

## サマリ

- Azure Stack Hub への名称変更
- Availability of BC/DR foundational pattern for Azure Stack Hub to Azure Stack Hub
- Event Hubs on Azure Stack Hub (Public Preview)
- Azure data services (Arc) on Azure Stack Hub (Private preview)
- Kubernetes on Azure Stack Hub (GA)
- Windows Virtual Desktop on Azure Stack Hub (Private Preview)
- GPU サポート（Public preview）
- マルチスケールユニット（開発中）
- インフラのコンテナ化（開発中）
- アップデートの改善（開発中）
- Azure Stack Foundation - Core
- Instance Metadata（開発中）
- cloud-init（開発中）

## 名称変更

これまで Azure Stack という名称で語られていた Azure Stack Integrated system が、Azure Stack Hub という名前になりました。そして、Azure Stack という単語は、「Azure StaCk HCI」と「Azure Stack Edge（元 Data Box Edge）」「Azure Stack Hub」という3つのソリューションを包括するものに変わりました。Ignite では「Azure Stack Family」や「 Azure Stack Portfolio」という表現が多く使われました。

<blockquote class="twitter-tweet"><p lang="en" dir="ltr"><a href="https://twitter.com/hashtag/AzureStack?src=hash&amp;ref_src=twsrc%5Etfw">#AzureStack</a> is now a family:<a href="https://twitter.com/hashtag/AzureStackHub?src=hash&amp;ref_src=twsrc%5Etfw">#AzureStackHub</a> (<a href="https://twitter.com/hashtag/AzureStack?src=hash&amp;ref_src=twsrc%5Etfw">#AzureStack</a>)<a href="https://twitter.com/hashtag/AzureStackEdge?src=hash&amp;ref_src=twsrc%5Etfw">#AzureStackEdge</a> (<a href="https://twitter.com/hashtag/DataBoxEdge?src=hash&amp;ref_src=twsrc%5Etfw">#DataBoxEdge</a>)<a href="https://twitter.com/hashtag/AzureStackHCI?src=hash&amp;ref_src=twsrc%5Etfw">#AzureStackHCI</a> <a href="https://t.co/xjqKpcdMSp">pic.twitter.com/xjqKpcdMSp</a></p>&mdash; David Armour (@Darmour_MSFT) <a href="https://twitter.com/Darmour_MSFT/status/1191355165116420096?ref_src=twsrc%5Etfw">November 4, 2019</a></blockquote> <script async src="https://platform.twitter.com/widgets.js" charset="utf-8"></script>

名前の変更に伴い、Twitter のハッシュタグも変更になりました。これからは #AzureStackHub です。

## Availability of BC/DR foundational pattern for Azure Stack Hub to Azure Stack Hub

Azure Stack Hub の BC/DR に関する手法が発表されました。具体的には、ARM 上のリソースを [subscription replicator
](https://github.com/Azure-Samples/azure-intelligent-edge-patterns/tree/master/subscription%20replicator) で複製したうえで、次の 3rd パーディを使ってデータをコピーするというパターンです。

- Migration and DR Tools
  - Veeam
  - VERITAS
  - COHECITY
  - CARBONITE
  - COMMVAULT
  - cloudbase(CORIOLIS)
  - Corent
  - Dell EMC
- HA/FT
  - ZERODOWN
  - SIOS

## Event Hubs on Azure Stack Hub (Public Preview)

Azure Stack Hub 上の Event Hub が2020年にパブリックプレビューになります。

## Azure data services (Arc) on Azure Stack Hub (Private preview)

Azure Stack 上の Azure Data service (Arc)がプライベートプレビューになりました。次の URL を見る限りだと、Azure Stack 上の k8S cluster で Azure SQL Database と Azure Database for PostgreSQL Hyperscale を動かせるってことだと思います。

https://azure.microsoft.com/en-us/services/azure-arc/hybrid-data-services/

> Azure SQL Database and Azure Database for PostgreSQL Hyperscale are now available on Azure Arc for private preview. Over time, we will bring other Azure data services to Azure Arc.

## Azure Stream Analytics support on Azure Stack Hub (Public Preview)

Azure Stack Hub 上の Stream Analytics がパブリックプレビューになりました。1910 でインストールできるようになるのでしょうか・・・

## Kubernetes on Azure Stack Hub(GA)

Azure Stack Hub 上の AKS Engine ベースの K8s が GA しました。

## Windows Virtual Desktop on Azure Stack Hub (Private Preview)

Azure Stack Hub 上の Windows Virtual Desktop がプライベートプレビューになりました。WVD のコントロールプレーンは Azure のままで、リソースプールとなる Virtual Machine を Azure Stack Hub 上で稼働できるようです。

プレビューの申し込み先：http://aka.ms/azswvd

## GPU サポート（Public preview）

Azure Stack Hub が GPU をサポートすることが発表されました。2020年1月からパブリックプレビューの予定です。Azure Stack Hub でサポートされる GPU とインスタンスタイプは次の通りです。

| GPU | インスタンスタイプ |
|----|--------------------|
|NVIDIA V100|NCv3|
|AMD Mi25|NVv4|
|NVIDIA T4| 検討中 |

プレビューの申し込み先：http://aka.ms/azurestackgpupreview

## マルチスケールユニット（開発中）

2020年末までに Azure Stack Hub に2つ目のスケールユニットを追加できるようになることが発表されました。ただし、初期段階のリリースではキャパシティーが拡張するだけです。Azure Stack のコントロールプレーンである Infrastructure Role Instances は1本目のみに存在するため、可用性は向上しません。

{{< figure src="/images/2019-1106-001.png" title="初期段階のマルチスケールユニットのイメージ" >}}

## インフラのコンテナ化（開発中）

Azure Stack Hub のコントロールプレーン部分をコンテナ化していることが公式に発表されました。ニュースになっていたやつですね。コンテナ化に伴い、コンテナ内部で利用するネットワークアドレスが追加で必要になるようです。

ニュース：https://www.zdnet.com/article/microsoft-plans-to-rearchitect-azure-stack-by-making-it-container-based/

## アップデートの改善（開発中）

アップデートの改善に関する様々な取り組みが発表されました。

- 1910 Update で Express Update 中のダウンタウンをなくす
- 2020年上半期を目標に Full Update 中のダウンタウンをなくす
- Full Update の時間を短縮する（目標は15時間以内）

{{< figure src="/images/2019-1106-002.png" title="Patch and Update の改善一覧" >}}

そもそも、ライブマイグレーションやストレージレプリケーションの支援によって、アップデート中のダウンタイムは発生しない理解です。Vijay も「多くの顧客ではアップデート中にダウンタイムは発生してない」と付け加えていたので、ダウンタイムという表現が何を示しているのか別途調べます。

## Azure Stack Foundation - Core

Azure Stack Hub の基本を説明する動画集「Azure Stack Foundation - Core」（全16個）が発表されました。Azure Stack Hub をさらっと学習するのに持って来いのネタのように見えます。

参考：http://aka.ms/azsasfvideos

## cloud-init（開発中）

cloud-init を開発中であることが発表されました。

## Instance Metadata（開発中）

169.254.169.254 にアクセスすると自分の情報を取得できる Instance Metadata を開発中であることが発表されました。ただし、開発中なのは Compute だけであり /instance/network は未対応です。開発者が「スーパースーパープレビュー」といっていたので、リリースは先になりそうです。。


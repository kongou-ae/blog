---
title: Azure Stack Hub の新しい PaaS の仕組み
author: kongou_ae
date: 2020-04-19
url: /archives/2020/04/the-structure-of-the-new-paas-for-Azurestackhub
categories:
  - azure
---

Event Hub on Azure Stack Hub が Public Preview になりました。

[The preview version of Event Hubs on Azure Stack Hub is now available](https://azure.microsoft.com/en-us/updates/introducing-preview-version-of-event-hubs-on-azure-stack-hub/)

2018年9月の Ignite 2018 でアナウンスされてから約1年半越しでのリリースです。EventHub on Azure Stack Hub は、Azure Stack Hub 本体に追加された Deployment Resource Provider というリソースプロバイダをデプロイする機能によって、従来の PaaS on Azure Stack Hub とは異なる仕組みになっています。本エントリでは、新しい PaaS の特徴を従来の PaaS on Azure Stack Hub の代表である App Service と比較する形でまとめます。

## インストール

App Service Resource Provider のインストールには専用のインストーラを利用します。Azure Stack Hub にアクセスできる端末上でこのインストーラを実行したうえで、インストーラが要求する様々な情報を入力する必要があります。具体的な手順は次の通りです。

- [Azure Stack Hub に App Service をデプロイする](https://docs.microsoft.com/ja-jp/azure-stack/operator/azure-stack-app-service-deploy?view=azs-2002)
- [App Service on Azure Stack（ Resource Provider 編）](https://aimless.jp/blog/archives/2019-03-05-install-appservice-resource-provider-to-azurestack/)

新しい PaaS を提供するリソースプロバイダのインストールには Azure Stack Hub の管理ポータルを使います。独自のインストーラは不要です。管理ポータルのマーケットプレイスの画面でリソースプロバイダのダウンロードとインストールを一気に実行できるので、手順が次のようにとてもシンプルです。素晴らしい。

1. 管理ポータルのマーケットプレイスで Event Hub をダウンロードして、インストールを開始する
1. 管理ポータルのインストール画面で前提条件をチェックするボタンを押す
1. 管理ポータルのインストール画面で Event Hub 用の証明書をアップロードする
1. 管理ポータルのインストール画面で Event Hub をインストールするボタンを押す

参考：[Azure Stack Hub に Event Hubs をインストールする方法](https://docs.microsoft.com/ja-jp/azure-stack/operator/event-hubs-rp-install?view=azs-2002#installation)

オランダの MVP の Mark Scholman さんが具体的な手順を Youtube に公開していますので、気になる方は次の動画をご確認ください。とてもシンプルなインストール方法になっていることをご理解いただけるはずです。

<iframe width="613" height="439" src="https://www.youtube.com/embed/X2xSw0GMwqw?list=PLCABiA1cIxgIPt7A6YuFTjFlcwMHKSzIS" frameborder="0" allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>

## アップデート

App Service Resource Provider は、アップデートにも専用のインストーラを利用します。

参考：[Azure App Service on Azure Stack Hub を更新する](https://docs.microsoft.com/ja-jp/azure-stack/operator/azure-stack-app-service-update?view=azs-2002)

新しい PaaS のリソースプロバイダのアップデートには Azure Stack Hub の管理ポータルを利用します。独自のインストーラは不要です。管理ポータルの Update の画面で、Azure Stack Hub 本体のアップデートと同じように、PaaS の更新に利用するパッケージのダウンロードと適用を一気に実行できます。素晴らしい。

[Azure Stack Hub リソース プロバイダーを更新する方法](https://docs.microsoft.com/ja-jp/azure-stack/operator/resource-provider-apply-updates?view=azs-2002)

## 監視

App Service Resource Provider のアラートは Azure Stack Hub のアラート画面に表示されません。そのため、App Service Resource Provider を構成する Virtual Machine Scale Set を監視する方法を自前で用意する必要があります。

新しい PaaS のリソースプロバイダは、自分で自分を監視したうえで異常を検知した場合に Azure Stack Hub のアラート画面にアラートを出します。そのため、SCOM の Management Pack にような Azure Stack Hub 本体のアラートを監視する仕組みがあれば、その仕組みを利用して新しい PaaS のリソースプロバイダを監視できます。実際にアラート画面に出てくるアラートの一覧は次に記載されています。

[Azure Stack Hub で Event Hubs を管理する方法](https://docs.microsoft.com/ja-jp/azure-stack/operator/event-hubs-rp-manage?view=azs-2002#alerts)

## ログの取得

Azure Stack Hub 本体の仕組みでは App Service Resource Provider のログを取得できません。次のサンプルスクリプトのように、管理者が App Service Resource Provider の API を直接叩いてログを集める必要があります。

[Collect the logs of App Service Resource Provider with Azure Stack REST API](https://aimless.jp/blog/archives/2019/08/collect-appservice-rp-log-with-restapi/)

新しい PaaS のリソースプロバイダでは、Azure Stack Hub 本体のログ取得機能を使ってログを取得できます。管理ポータルからログを簡単に Microsoft のサポート担当に送れます。App Service のように独自の仕組みを自前で組む必要はありません。

また、次の URL の通り、Privileged Endpoint の Send-AzureStackDiagnosticLog コマンドを利用すれば EventHub のログだけを Microsoft のサポート担当に送ることもできます。

[特権エンドポイント (PEP) を使用して Azure Stack Hub 診断ログを Azure に送信する](https://docs.microsoft.com/ja-jp/azure-stack/operator/azure-stack-configure-on-demand-diagnostic-log-collection-powershell-tzl?view=azs-2002#parameter-considerations)

## まとめ

Azure Stack Hub の新しい PaaS の仕組みをまとめました。これまでの PaaS とは異なり、新しい PaaS は Azure Stack Hub 本体の機能と密に連動するようになったので、運用しやすくなったように見えます。App Service Resource Provider もこの仕組みになってほしいなぁ・・・。

---
title: Azure Stack 2008 Update
author: kongou_ae
date: 2020-11-15
url: /archives/2020/11/azurestack-2008-update
categories:
  - azurestack
---

Azure Stack 2008 update がリリースされました。まだ触れていないのでドキュメントを前提として情報をまとめます。

[Azure Stack Hub release notes](https://docs.microsoft.com/en-us/azure-stack/operator/release-notes?WT.mc_id=AZ-MVP-5003408&view=azs-2008)

## VNet peering 

Azure Stack Hub にも VNet peering が実装されました。Azure Stack Hub 上でも Azure と同じようにハブアンドスポーク構成を実現できます。Azure Stack Hub 上の peering も、Azure と同じように別サブスクリプション上の VNet 同士の接続や別 AAD 上の VNet 同士の接続もサポートしています。

- [Can I peer my virtual network with a virtual network in a different subscription?](https://docs.microsoft.com/en-us/azure-stack/user/virtual-network-peering?WT.mc_id=AZ-MVP-5003408&view=azs-2008#can-i-peer-my-virtual-network-with-a-virtual-network-in-a-different-subscription)
- [Can I enable peering if my virtual networks belong to subscriptions within different Azure Active Directory tenants?](https://docs.microsoft.com/en-us/azure-stack/user/virtual-network-peering?WT.mc_id=AZ-MVP-5003408&view=azs-2008#can-i-peer-my-virtual-network-with-a-virtual-network-in-a-different-subscription)

VNet peering が [Azure Stack Hub のフィードバックサイト](https://feedback.azure.com/forums/344565-azure-stack-hub/)で一番要望が上がっている機能であったこともあり、3年越しの実装に Azure Stack Hub 界隈が歓喜しました。

ポータル上での操作性も Azure と同じです。素晴らしい。

{{< figure src="/images/2020/2020-1116-003.png" title="VNet Peering の設定画面" >}}

{{< figure src="/images/2020/2020-1116-004.png" title="VNet Peering の確認画面" >}}


## immutable blob

データを変更・削除できない immutable blob が実装されました。変更や削除ができない Blob は Azure Stack Hub が想定している金融業界や医療業界と親和性が高そうです。なお、現時点ではポータルからは immutable blob を設定できません。SDK や API を使う必要があります。

## Exclusive Operations banners

実行中のオペレーションを表示するためのバナーが実装されました、

Azure Stack Hub における特定のオペレーションは時間がかかるため、裏で実行されつづけることとが多いです。アップデートやパッチ適用はその最たる例です。特定のオペレーションが実行されている状態で他のオペレーションを実行しようとすると、新規で実行したオペレーションがエラーになることがあります。

これを避けるために、以前のアップデートで通知マークが実装されました。

{{< figure src="/images/2020/2020-1116-002.png" title="通知マーク" >}}

ですがこのマークがわかりにくい。。わかりにくさを解消するために Exclusive Operations banners が実装されたのでしょう。これだけ大きく表示されていれば裏で実行されているオペレーションがわかりやすくなりますね。

{{< figure src="/images/2020/2020-1116-001.png" title="通知バナー" >}}

## レーティングツール

Azure ポータルでおなじみのレーティングツールが Azure Stack Hub ポータルにも実装されました。・・・必要？

{{< figure src="/images/2020/2020-1116-005.png" title="レーティングツール" >}}

## Azure Kubernetes Service and Azure Container Registry

2008 Update から AKS と ACR のプライベートプレビューに参加できるようになりました。プライベートプレビューに招待されている方は2008 Update に更新しましょう。プライベートプレビューとの関係性は不明ですが、2008 update では AKS Engine で複数の機能が新たに利用できるようになりました。

> - This release includes a public preview of Azure CNI and Windows Containers using AKS Engine v0.55.4. For an example of how to use them in your API model, see this example on GitHub.
> - There is now support for Istio 1.3 deployment on clusters deployed by AKS Engine v0.55.4. For more information, see the instructions here.
> - There is now support for deployment of private clusters using AKS Engine v0.55.4.
> - This release includes support for sourcing Kubernetes configuration secrets from Azure and Azure Stack Hub Key Vault instances.

## QoS 設定の追加

フェイルオーバークラスタの管理通信に対して QoS をかけるようになりました。Host Node と ToR スイッチの両方で QoS の設定が有効になっていなければならないので、Microsoft の 2008 Update を適用するだけでなく、OEM ベンダのアップデートも適用する必要があります。

## まとめ

Azure Stack Hub 2008 Update の気になる更新をまとめました。2008 Update の華はやはり 3年越しの VNet peering でしょう。私自身はすぐに使うことはないのですが、ユーザの要望を（すごい時間がかかっても）実現していく姿勢の現れという意味で華があると思います。フィードバックのし甲斐があります。フィードバックサイトの上位に存在している VNet peering と N シリーズ VM が実装された今、次は何がリリースされるのでしょうか。楽しみです。

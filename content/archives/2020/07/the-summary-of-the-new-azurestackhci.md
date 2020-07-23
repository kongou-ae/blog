---
title: 新しい Azure Stack HCI のざっくりまとめ
author: kongou_ae
date: 2020-07-23
url: /archives/2020/07/the-summary-of-the-new-azurestackhci
categories:
  - azure
---

Inspire 2019 で新しい Azure Stack HCI が発表されました。セッション動画や公式ドキュメントをもとに何が変わったのかを振り返ります。

なお、本エントリ内のキャプチャは次のセッション動画からの引用です。

[Modernize datacenters with Azure Stack HCI](https://myinspire.microsoft.com/sessions/4a50e354-b3a8-4d54-9d2a-9dc723ac1030?source=sessions)

## ざっくりまとめ

従来の Azure Stack HCI は認定されたハードウェア上と推奨構成の Windows Server 2019を使って HCI を実現したものです。Azure Stack という冠が付いてはいたものの Windows Server の延長でした。ホスト OS のライセンス体系は従来の Windows Server のライセンスモデルですし、ホスト OS が Azure と連携することもありませんでした。Windows Admin Cetner を利用して Azure のサービスと簡単に接続できる点のみをもって Azure Stack ファミリーに仲間入りしたのは少々無理がありました。

新しい Azure Stack HCI は Azure のサービスとして生まれ変わりました。ホスト OS は 普通の Windows Server 2019 ではなく、Azure Stack HCI のホスト OS 用にカスタマイズされた Azure Stack HCI OS になりました。Azure Stack HCI OS のライセンスはコアベースの月額課金となり、その料金は Azure サブスクリプションの利用料金として請求されます。さらに、HCI クラスタを Azure に登録することが必須となり、Azure ポータルでクラスタを確認できます。Azure のサービスなので サポートも Azure の枠組みに従います。新しい Azure Stack HCI は Azure Stack Edge や Azure Stack Hub と比較しても遜色ないくらい Azure な世界に参加しました。

## Azure Stack HCI OS とは

{{< figure src="/images/2020/2020-0723-001.png" title="Azure Stack HCI OS" >}}

Azure Stack HCI OS は、仮想化ホストとしての機能に最適化された OS です。仮想化ホストとして動かすことを前提としているため、ゲスト OS としては利用できません。また、Hyper-V と S2D、SDN の役割だけを有しているため、Windows Server のように何から何まで役割や権限をインストールできません

参考：[When to use Azure Stack HCI](https://docs.microsoft.com/en-us/azure-stack/hci/overview#when-to-use-windows-server)

## 課金体系

Azure Stack HCI OS の利用料金は、Azure Stack HCI OS が動作しているサーバの物理コア数応じたの月額課金です。その料金は Azure サブスクリプションの利用料金として請求されます。買い切りの永久ライセンスはありません。1コア当たりの月額料金は$10のようです。

{{< figure src="/images/2020/2020-0723-003.jpg" title="コア数に応じたライセンス料金" >}}

この利用料金の中に ゲストOS で Windows Server を実行する権利が含まれているのかは明記されていません。公式ドキュメントの次の記載だけでは白黒を理解できず・・・

> No traditional on-premises software license is required, although guest virtual machines (VMs) may require individual operating system licensing

[Azure Stack HCI billing and payment](https://docs.microsoft.com/en-us/azure-stack/hci/concepts/billing)

## Azure への登録

新しい Azure Stack HCI は課金のためにクラスタを Azure に登録する必要があります。そして課金に必要なコア数を Azure にアップロードするために、最低でも30日に一回、クラスタを構成する各ノードがインターネット上の特定の FQDN にアクセスする必要があります。したがって、新しい Azure Stack HCI は Disconnected なシナリオでは利用できません。

> An internet connection for each server in the cluster that can connect via HTTPS outbound traffic to the following endpoint at least every 30 days: *-azurestackhci-usage.azurewebsites.net

[What you need for Azure Stack HCI](https://docs.microsoft.com/en-us/azure-stack/hci/overview#what-you-need-for-azure-stack-hci)

クラスタを Azure に登録すると、クラスタは Azure Stack HCI リソースプロバイダの管理化におかれて、ARM な ID が付与されます。私が作った クラスタには 次のような ID が付与されました。

```
/subscriptions/xxxxxxxxx-xxxx-xxxx-xxxx-c5bd3103e127/resourceGroups/azshci-registration/providers/Microsoft.AzureStackHCI/clusters/azshciclus
```

## Azure でできること

登録したクラスタの状態を Azure ポータルから確認できるようになります。残念なことに、私がアクセスしている Azure ポータルにはこの機能がまだ展開されていませんでした・・・

{{< figure src="/images/2020/2020-0723-005.jpg" title="Azure Portal で クラスタを見る画面" >}}

さらに 他の Azure リソースと同じように Azure ポータルからサポートリクエストを作成できます。月額29ドルの Developer サポートから問い合わせを上げられるのは中小企業にとってメリットがあると思います。

今後は次のような機能の拡張が予定されています。

1. メトリクスの閲覧と通知
2. Azure Stack HCI リソースプロバイダの対応リージョンの拡張
3. Azure ポータルを使って Azure Stack HCI 上に仮想マシンを作る機能

3に超期待です。この機能を利用すれば、利用者にホスト OS へのアクセス権を渡さなくても、利用者自身が仮想マシンを作れるようになります。とても簡単にセルフサービスを実現できます。しかも Azure のコマンドラインツールにも対応するようなので自動化も簡単です。

{{< figure src="/images/2020/2020-0723-007.jpg" title="セルフサービスで仮想マシンを作る" >}}

## 拡張セキュリティ更新プログラム

Azure Stack HCI 上で動く Windows Server 2008/R2 は追加の費用なしで 拡張セキュリティ更新プログラム を受けられます。Azure Stack Hub と同じですね。これも Windows Server ではなく Azure のサービスになった結果でしょう。

> Are extended security updates (ESUs) available if I move my Windows Server 2008/R2 to this new HCI solution?
> 
> Yes, you’ll get ESUs at no cost when you migrate your Windows Server 2008/R2 workloads to Azure Stack HCI.

[Frequently asked questions about Azure Stack HCI](https://azure.microsoft.com/en-us/products/azure-stack/hci/#customer-stories)

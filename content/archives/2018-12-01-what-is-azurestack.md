---
title: Azure Stack とは
author: kongou_ae
date: 2018-12-01
url: /archives/2018-12-01-what-is-azurestack
categories:
  - azurestack
---

## はじめに

自分の頭の中の整理もかねて、Azure Stack の Advent Calender に挑戦します。25個のエントリーを通して、次のことを網羅的にまとめます。

- そもそも Azure Stack って何？どういう時に使うの？
- どうやって導入するの？
- どうやって運用するの？

## 中の人の属性

- SIer 勤務
- Azure Stack 歴１年半くらい
- Azure Stack Integrated system( IaaS のみ)を運用中
- Azure Stack Development Kit をお借りして評価中
- 提案から設計、運用まで幅広く

## Azure Stack とは

Microsoft 公式の言葉を借りると、Azure Stack とは「オンプレミスで常にハイブリッドアプリケーションを実行できるようにする Azure の拡張機能」です。2015年5月にアナウンスされて、2017年7月に一般公開されました。できたてホヤホヤというレベルではないですが、まだまだこれからのソリューションです。

- ソリューションの概要
  - [Azure Stack とは](https://azure.microsoft.com/ja-jp/overview/azure-stack/)
  - [コンピューティングの未来: インテリジェント クラウドとインテリジェント エッジ](https://azure.microsoft.com/ja-jp/overview/future-of-cloud/)
  - [Azure Stack とは](https://docs.microsoft.com/ja-jp/azure/azure-stack/azure-stack-poc?WT.mc_id=AZ-MVP-5003408)
- 一般公開時のアナウンス
  - [Microsoft Azure Stack is ready to order now](https://azure.microsoft.com/ja-jp/blog/microsoft-azure-stack-is-ready-to-order-now/)

正直申し上げると、「オンプレミスで常にハイブリッドアプリケーションを実行できるようにする Azure の拡張機能」という言い回しは分かりにくいです。自分の言葉に置き換えると、Azure Stack とは「Azure のサービスを好きな場所で利用できるアプライアンス」です。この言葉に含まれる3つの特徴について順に説明します。

## 特徴1　Azure のサービスを利用できる

1つ目の特徴は「Azure のサービスを利用できる」です。

Azure Stack が提供するサービスは、Azure と一貫性を持つように設計されています。そのため、Azure Stack では Azure のサービスを利用できます。この特徴こそ、Microsoft が Azure Stack を「Azure の拡張機能」と呼ぶ理由です。

Azure Stack のポータルから確認した「現在利用できるサービス」は次の通りです。

- COMPUTE
  - Virtual machines
  - Virtual machine scale sets
  - Availability sets
  - Disks
  - Snapshots
- DATA + STORAGE
  - Storage accounts
- NETWORKING
  - Virtual networks
  - Network security groups
  - Load balancers
  - Network interfaces
  - Public IP addresses
  - Connections
  - Virtual network gateways
  - Local network gateways
  - Route tables
- MANAGEMENT + SECURITY
  - Activity log
  - Monitor
  - Metrics
- SECURITY + IDENTITY
  - Key vaults 

Azure 上の IaaS を使ったことのある方にとっては見慣れたサービスばかりだと思います。各サービスの使い勝手も Azure と同じです。利用者向けポータルの見た目は Azure と同じですし、Azure PowerShell や Azure CLI といったツールも利用できます。Azure 上の IaaS を使ったことのある人であれば、Azure Stack 上の IaaS もすぐに同じように使い始められます。

ただし、Azure Stack 上で利用できるサービスや機能は Azure と比較して古いです。これはパブリックな Azure で実装されたサービスや機能を Azure Stack に持ってくるという開発プロセスになっているためです。例えば、Managed Disk が Azure Stack で利用できるようになったのはつい最近の2018年9月ですし、VNet Peering や Cloud Shell といった機能はまだ実装されていません。

さらに、各サービスには、Azure との差異があります。具体的な差異は次のURLに記載されています。Azure と100%同じサービスではないことに注意が必要です。

- [Azure Stack Storage: 違いと考慮事項](https://docs.microsoft.com/ja-jp/azure/azure-stack/user/azure-stack-acs-differences?WT.mc_id=AZ-MVP-5003408)
- [Azure Stack で仮想マシンを操作する際の考慮事項](https://docs.microsoft.com/ja-jp/azure/azure-stack/user/azure-stack-vm-considerations?WT.mc_id=AZ-MVP-5003408)
- [Azure Stack のマネージド ディスク: 相違点と考慮事項](https://docs.microsoft.com/ja-jp/azure/azure-stack/user/azure-stack-managed-disk-considerations?WT.mc_id=AZ-MVP-5003408)
- [Azure Stack ネットワークに関する考慮事項](https://docs.microsoft.com/ja-jp/azure/azure-stack/user/azure-stack-network-differences?WT.mc_id=AZ-MVP-5003408)

なお、Azure と一貫性のある Azure Stack では、Azure がサポートしていない機能を利用できません。Azure に存在しない機能を追加すると、Azure との一貫性が損なわれるためです。この最たる例がレイヤ2接続です。オンプレミスの仮想基盤であれば当たり前のようにサポートされるレイヤ2での接続は、Azure Stack ではサポートされていません。なぜならば、レイヤ2での接続が Azure でサポートされていないからです。

## 特徴2　好きな場所で利用できる

2つ目の特徴は「好きな場所で利用できる」です。

Azure のサービスは、提供場所が決まっています。好きな場所では利用できません。Azure が提供するサービスは、原則として Microsoft のデータセンタで提供されます。サービスを構成するリソースはMicrosoft のデータセンタで動作します。データは Microsoft のデータセンタに保存されます。

Azure Stack が提供する Azure のサービスは、提供場所が決まっていません。Azure Stack を構成するハードウェアを設置した場所が、サービスの提供場所になります。自分の好きな場所に Azure Stack を設置することで、利用者は自分の好きな場所で Azure Stack が提供する Azure のサービスを利用できます。過去に発表された事例やコンセプトには、一般的なデータセンタでなく、飛行機や船舶、車両に Azure Stack を設置するシナリオが紹介されました。

参考：[The power of Azure Stack's ruggedized system](https://www.youtube.com/watch?v=nTXdJN0IW5Y)

## 特徴3　アプライアンス

3つ目の特徴は「アプライアンス」です。

Azure Stack は、汎用的なサーバとネットワーク機器で構成されています。ただし、汎用的なサーバとネットワーク機器を使って構成される従来の仮想基盤と比較すると、Azure Stack にはアプライアンス製品と同様の次のような制限があります。

### ハードウェアとソフトウェアをセットで購入する

従来の仮装基盤では、ソフトウェアがサポートする範囲において利用者が自由にハードウェアを選択できます。利用者は、サポートされる範囲においてお好みのハードウェアベンダのお好みのパーツを組み合わせて自由に仮装基盤を構築できます。

Azure Stack は、選択の自由度が低いです。Azure Stack はハードウェアとソフトウェアの組み合わせが決まっており、Microsoft が認める OEM ベンダによって販売されます。OEMベンダ以外のハードウェアでは Azure Stack を動かせません。さらに、OEM ベンダによっては、ハードウェアの構成がパターン化されています。例えば、Dell EMC の Azure Stack は、S サイズ・M サイズ・L サイズの3択です。

参考：[DELL EMC CLOUD FOR MICROSOFT AZURE STACK](https://japan.emc.com/collateral/solution-overview/h16047-dell-emc-cloud-for-microsoft-azure-stack-so.pdf)

### 検証済みのパラメータで構築される

従来の仮装基盤であれば、ハードウェアとソフトウェアの全てのパラメータを利用者が自由に指定できます。ただし。指定したパラメータ通りの機能が提供できることを利用者自身で確認しなければなりません。

一方で、Azure Stack を構成するハードウェアとソフトウェアには、Microsoft と OEM ベンダによって検証済みのおすすめ設定が投入されます。Azure Stack が Azure Stack として動作することは、Microsoft と OEM ベンダによって事前に検証済みです。ほとんどのパラメータが規定のため、利用者が指定できる項目は次の項目だけです。

- 認証方式（AAD or ADFS）
- リージョン名
- 外部ドメイン名
- 内部ドメイン名
- サーバのホスト名の Prefix
- NTP サーバ
- DNS フォワーダ
- Syslog サーバ
- AS 番号
- Azure Stack が利用するサブネット5つ

## おわりに

本エントリでは、Azure Stack を「Azure のサービスを好きな場所で利用できるアプライアンス」と捉えて、Azure Stackの3つの特徴を説明しました。これらの特徴を踏まえて、次のエントリでは、Azure Stack のメリットとユースケースを説明します。

---
title: Azure Firewallをためした
author: kongou_ae
date: 2018-07-14
url: /archives/2018-07-14-JIT-azurefirewal
categories:
  - azure
---

Azure FirewallがPublic Previewになりました。VNetからインターネットへのOutboundを集中管理できるマネージドFirewallです。クラウドネットワーク野郎にとってワクワクするサービスです。早速試しました。

[Announcing public preview of Azure Virtual WAN and Azure Firewall](https://azure.microsoft.com/en-us/blog/announcing-public-preview-of-azure-virtual-wan-and-azure-firewall/)

## サインアップ

Public Previewのサービスを利用するにはサインアップが必要です。PowerShellで次のコマンドを実施します。サインアップが完了するまで約30分ほどかかります。

```Powershell
Register-AzureRmProviderFeature -FeatureName AllowRegionalGatewayManagerForSecureGateway -ProviderNamespace Microsoft.Network
Register-AzureRmProviderFeature -FeatureName AllowAzureFirewall -ProviderNamespace Microsoft.Network
```

## サブネットを用意する

Azure FirewallをVNet内に設置するためには、VNet内に"AzureFirewalSubnet"という名前の/25以上のサブネットが必要です。

{{<img src="./../../images/2018-0714-001.png">}}

"AzureFirewalSubnet"が/25未満だと、デプロイに失敗します。ご注意ください。

{{<img src="./../../images/2018-0714-002.png">}}

## Azure Firewallをデプロイする

VNetのブレードにAzure Firewallが追加されているので、設定画面に進みます。

{{<img src="./../../images/2018-0714-003.png">}}

設定するパラメータは下図のとおりです。簡単ですね。

{{<img src="./../../images/2018-0714-004.png">}}

Azure Firewallを配置するリソースグループは、VNetが配置されているリソースグループと同じものにします。Azure Firewalと"AzureFirewalSubnet"が別のリソースグループの場合、デプロイに失敗します。謎の仕様です。

{{<img src="./../../images/2018-0714-005.png">}}

しばらく待つとAzure Firewalがデプロイされます。デプロイされると、Azure Firewalに"AzureFirewallSubnet"内のIPアドレスが割り当てられます。このプライベートIPアドレスをユーザ定義ルートのネクストホップで利用しますので、控えておくと良いです。

{{<img src="./../../images/2018-0714-006.png">}}

## ポリシーを設定する

Azure Firewallには2つのポリシーがあります。Network rulesとApplication rulesです。

|種類|できること|
|---------|----------|
|Network rules|プロトコルとIPアドレスとポート番号を組み合わせて通信を制御する|
|Application rules|ドメイン名を利用してHTTP/HTTPSを制御する|

### Network rule

Network ruleはNSGと同じ考え方です。プロトコルとIPアドレスとポート番号を組み合わせてルールを作成します。NSGでは利用できないICMPがプロトコルで選択できます。Network rulesではAzure Firewallの特徴であるFQDNを利用できません。

{{<img src="./../../images/2018-0714-007.png">}}

また、Rule collectionという複数のルールをグルーピングする機能が導入されています。NSGでは大量のルールが並列に並ぶため「このルール、何の用途？」となる場合があります。Rule collectionを利用してルールを意味のあるグループにまとめると、効果的にルールを運用できそうです。

{{<img src="./../../images/2018-0714-008.png">}}

### Application rule

Application ruleはNSGと異なるものです。宛先として利用できるものはFQDNのみです。IPアドレスは利用できません。利用できるプロトコルはHTTPとHTTPSのみです。NSGのようにプトロコルとポート番号を利用して自由にサービスを定義することはできません。

{{<img src="./../../images/2018-0714-012.png">}}

## ログの保存先を設定する

Azure Firewallは診断ログとして通信ログを吐き出します。診断ログとして吐き出すので、他のサービスの診断ログと同様、Storage AccountやLog Analyticsに自動的にログを保存できます。すばらしい。

> "msg": "HTTPS request from 10.1.0.5:55640 to mydestination.com:443. Action: Allow. Rule Collection: collection1000. Rule: rule1002"
> "msg": "TCP request from 111.35.136.173:12518 to 13.78.143.217:2323. Action: Deny"

[Tutorial: Monitor Azure Firewall logs](https://docs.microsoft.com/ja-jp/azure/firewall/tutorial-diagnostics#diagnostic-logs)

{{<img src="./../../images/2018-0714-010.png">}}

## サーバからの通信をAzure Firewallに向ける

Azure Firewallを用意しても、サーバからの通信はAzure Firewallに向かいません。User Defined Route(UDR)を利用して、Virtual Machineからインターネットへの通信をAzure Firewall経由にします。User Defined Routeに定義する0.0.0.0/0のネクストホップをAzure FirewallのプライベートIPアドレスにするのがポイントです。作成したUDRをサブネットに適用するのを忘れずに。

{{<img src="./../../images/2018-0714-011.png">}}

## 動作確認

やっと準備が終わりました。動作確認します。

### 通信制御

Application ruleで許可されていない"http://www.google.com"にアクセスすると、Azure Firewallの警告画面がでます。

{{<img src="./../../images/2018-0714-013.png">}}

警告画面がでるのはhttpだけです。HTTPSは警告画面がでません。

{{<img src="./../../images/2018-0714-014.png">}}

通信が暗号化されているHTTPSの検査方法は不明です。MITMで復号化・再暗号化してるとは思えないので、FortiGateのSSL certicicate inspectionと同じようにサーバ証明書の中身を見ているのかもしれません。Common NameだけでなくSubject Alternate Namesも見ているのかを確認するために、sake.biccamera.comを許可する設定で動作確認したところアクセスできました。実装は不明ですがいい感じに動作しています。

{{<img src="./../../images/2018-0714-015.png">}}

当然、インターネットから見たときのサーバのIPアドレスは、Azure FirewallのPublic IP Addressになります。

{{<img src="./../../images/2018-0714-016.png">}}

### ログ

通信してからちょっと待つと、Log Analyticsに診断ログが取り込まれます。Kustoを使えば、Network ruleだけのログを抽出したり、特定ドメインへのアクセスを抽出したりと、自由自在にログを調査できます。

{{<img src="./../../images/2018-0714-017.png">}}

{{<img src="./../../images/2018-0714-018.png">}}

## 感想

これはいいものだ。Azure FIrewallの登場によって、VNetからインターネットへのアクセスを集中管理するための選択肢が増えました。一長一短なので要件に合わせて適切なものを選んでいきましょう。

- 強制トンネリング
- Network Virtual Appliance
- Azure Firewal New!!

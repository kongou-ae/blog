---
title: Virtual Network の Service tag には UDR の宛先サブネットが含まれる
author: kongou_ae
date: 2019-05-30
url: /archives/2019/05/service-tag-of-virtual-network-contains-udr
categories:
  - azurestack
---

単なるメモなのでさらっと。

## サマリ

- Network Security Group の Virtual Network という Service tag には、UDR で設定したアドレスプレフィックスが自動的に追加される
- UDR と NSG の設定によっては、意図しない通信が許可される可能性があるので注意
- NSG は1つのルールに複数のアドレスを追加できるようになったので、Virtual Network に頼らずサブネットで明示的に許可した方がよさそう
- ファイアウォール製品のように、自分で独自の Service tag を作れる機能が待ち遠しい
  - [Add Custom Tags to NSG Rules](https://feedback.azure.com/forums/217313-networking/suggestions/17531176-add-custom-tags-to-nsg-rules)
  - 予定済みになってから二年経っているが、実装されるのだろうか・・・

## ドキュメントの更新箇所

該当のコミットは[こちら](https://github.com/MicrosoftDocs/azure-docs.ja-jp/commit/6d2ed078240506dfd7c11ca51dcc5f8adb6868ef#diff-76197bb9a656355ed89a664f47a5d60dL60)

### これまでの記載

> VirtualNetwork (Resource Manager) (クラシックの場合は VIRTUAL_NETWORK):このタグには、仮想ネットワーク アドレス空間 (仮想ネットワークに対して定義されているすべての CIDR 範囲)、すべての接続されたオンプレミスのアドレス空間、ピアリングされた仮想ネットワークまたは仮想ネットワーク ゲートウェイに接続された仮想ネットワークが含まれます。

### 変更後の記載

分かりやすいように変更箇所を強調します。

> VirtualNetwork (Resource Manager) (クラシックの場合は VIRTUAL_NETWORK):このタグには、仮想ネットワーク アドレス空間 (仮想ネットワークに対して定義されているすべての CIDR 範囲)、すべての接続されたオンプレミスのアドレス空間、ピアリングされた仮想ネットワークまたは仮想ネットワーク ゲートウェイに接続された仮想ネットワーク、**ユーザーが定義したルートに使用されるアドレス プレフィックスが含まれます。**

## 動作確認

### UDR にオンプレのアドレスだけを書いた場合

#### ルーティングの状態

{{< figure src="/images/2019-05-30-001.png" title="UDR の状態（特定 Prefix のみ）" >}}

#### NSG の Virtual Network の状態

{{< figure src="/images/2019-05-30-002.png" title="Virtual Network の状態（特定 Prefix のみ）" >}}

### UDR にデフォルトルートを書いた場合

#### ルーティングの状態

{{< figure src="/images/2019-05-30-003.png" title="UDR の状態（デフォルトルート）" >}}

#### NSG の Virtual Network の状態

{{< figure src="/images/2019-05-30-004.png" title="Virtual Network の状態（デフォルトルート）" >}}

---
title: AzureでBGPルートの伝搬を無効化する
author: kongou_ae

date: 2018-03-27
url: /archives/2018-03-27-disable-bgp-route-propagation-for-vnet-route
categories:
  - azure
---

AzureがBGPルートの伝搬を無効化する機能を実装しました。BGPに関連するとなれば、ネットワークエンジニアとしては押さえておきたい機能です。さくっと動作確認しました。

参考：[General availability: Disable BGP route propagation for virtual network routes](https://azure.microsoft.com/ja-jp/updates/disable-route-propagation-ga-udr/)）

なお、AzureではBGPルートの伝搬がデフォルトで有効です。そのため、BGPルートの伝搬を無効化する機能がリリースされたわけです。ちなみにAWSではBGPルートの伝搬がデフォルトで無効です。そのため、BGPルートの伝搬を有効化する機能があります。

## VPN Gatewayに直接つながっているVnetの場合

Vnetのアドレス空間が「192.168.1.0/24」です。Virtual Network Gatewayの接続先であるLocal Network Gatewayに「10.1.1.0/24、10.1.3.0/24、10.1.4.0/24、10.1.6.0/24」が登録されています。そのため有効なルートは次のようになります。

{{<img src="./../../images/20180327-001.png">}}

BGPルートの伝搬を無効化する機能を有効化します。「無効」を「有効」にするという初見殺しの設定画面です。

{{<img src="./../../images/20180327-002.png">}}

「無効」を「有効」にするわけですから、Virtual Network Gatewayからルーティングテーブルに対するBGPルートの伝搬が止まります。その結果、有効なルートからソースがVirtual Network Gatewayのルーティングが消えます。

{{<img src="./../../images/20180327-003.png">}}

## Gateway TransitしているVnetの場合（VPN Gatewayに直接つながっていないVnetの場合）

上記の「192.168.1.0/24」のVnetと「10.0.0.0/24」のVnetをVnet Peeringで接続します。「192.168.1.0/24」のVnet側のVnet Peeringには「Allow gateway transit」の設定を有効にします。「10.0.0.0/24」のVnet側のVnet Peeringには「Use remote gateway」の設定を有効します。

すると「10.0.0.0/24」側のサブネットの有効なルートは次のようになります。「Use remote gateway」の設定を有効すると、Vnet Peering先のVPN Gatewayが学習している経路がルーティングテーブルに伝搬するようです。

{{<img src="./../../images/20180327-004.png">}}

「10.0.0.0/24」側のサブネットでBGPルートの伝搬を無効化する機能を有効にします。すると、有効なルートからソースがVirtual Network Gatewayのルーティングが消えます。ネクストホップがVPN Gatewayのルーティングがなくなったので、Vnet Peering先のVPN Gatewayを経由してオンプレミスにアクセスできなくなります。

{{<img src="./../../images/20180327-005.png">}}

## まとめ

BGPルートの伝搬を無効化する機能を試しました。無効化を(有効化|無効化)するという分かりにくい設定ですが、動作は素直です。
---
title: Azure Stack を設置する（ネットワーク）
author: kongou_ae
date: 2018-12-09
url: /archives/2018-12-09-network-of-azurestack
categories:
  - azurestack
---

## はじめに

本エントリーは[Microsoft Azure Stack Advent Calendar 2018](https://qiita.com/advent-calendar/2018/azure-stack)の9日目です。

本日のエントリーでは、Azure Stack のネットワーク周りを説明します。どんなネットワークをもった環境が来るのかを理解しないと、受け入れる側のネットワークを設計できません。

## 物理ネットワーク

物理ネットワークは非常にシンプルです。基本的な構成は公式ドキュメントの次の図の通りです。

{{<img src="./../../images/2018-12-09-001.png">}}

引用：[物理ネットワークの設計](https://docs.microsoft.com/ja-jp/azure/azure-stack/azure-stack-network#physical-network-design)

1台の ToR Switch あたり2本のアップリンクがあります。ToR Switch は2台ありますので、合計4本のアップリンクがあります。OEM ベンダによって アップリンクのメディアが選べるようです。Azure Stack の ToR Switch を収容する予定の Switch のポートに合わせて、ToR Switch 側のメディアを指定する必要があります。

## 論理ネットワーク

### ToR Switch との接続方法

ToR Switch のアップリンクには /30 のアドレスがふられます。したがって、既存ネットワークから Azure Stack に対して L2 で VLAN を流すことはできません。ToR Switch は スタティックルート と BGP をサポートします。Micorosoft は、BGP の利用を推奨していますので、まずは BGP を選択するのが良いでしょう。既存のネットワーク機器で/30の BGP 接続を4本収容できない場合は、Azure Stack 収容 L3SW を新規導入する必要があります。Azure Stack の仕様を変えることはできません。

参考：[境界接続](https://docs.microsoft.com/ja-jp/azure/azure-stack/azure-stack-border-connectivity)

### アドレス体系

ToR Switch のルーティングテーブルに存在するサブネットは次の通りです。

- External Network ( Public VIP )
- BMC Network
- Storage Network
- Infrastructure Network
- Switch Infrastructure Network

全体的な概要は、公式ドキュメントの次の図の通りです。

{{<img src="./../../images/2018-12-09-002.png">}}

引用：[ネットワーク インフラストラクチャ](https://docs.microsoft.com/ja-jp/azure/azure-stack/azure-stack-network#network-infrastructure)

#### External Network ( Public VIP )

Azure でいうところの Microsoft のグローバルIPアドレスが使われるネットワークです。各種ポータルや ARM のエンドポイント、Virtual Machine の Public IP Address や PaaS のエンドポイントのIPアドレスはこのサブネットから払い出されます。

つまり、External Network にインターネットに直接ルーティングできるグローバルIPアドレスを割り当てると、Azure と同じような感覚で Azure Stack 上の Azure を動作させられます。どこからでもアクセスできる Azure Stack の完成です。Microsoft は、この方式を Internet deploy と呼んでいます。Service Provider がマルチテナントな Azure Stack を導入する場合は、このケースになると思います。

当然、External Network に Private IP Address を割り当てることもできます。Microsoft は、この方式を Intranet deploy と呼んでいます。社内LAN内に Azure Stack を配置する場合は、こちらのケースが多いかと思います。

参考：[ハイブリッド接続のオプション](https://docs.microsoft.com/ja-jp/azure/azure-stack/azure-stack-datacenter-integration#hybrid-connectivity-options)

External Network は最小が/26で最大が/22です。サイジングの注意点は、External Network を Azure Stack の管理側も利用するということです。Azure Stack の管理側は31個のアドレスを利用します。したがって、/26 のアドレスを用意しても、前半の /27 は管理側に取られてしまい、利用者が利用できる範囲は/27になってしまいます。/27を管理側にとられる前提で必要な個数を計算してサブネッティングしましょう。

Azure Stack 上の Azure サービスを利用するために、Azure Stack の管理者と利用者は、External Network にアクセスする必要があります。また、Connected deployment の場合、External Network はインターネットと通信する必要があります。これらの通信要件を満たすために、既存ネットワーク側のルーティングを整えましょう。ToR Switch と BGP 接続していれば、このサブネットは勝手に聞こえてきます。

#### BMC Network

運用管理LAN なネットワークです。各サーバの Baseboard Management Controller と、OEM ベンダの運用管理ソフトウェアが動作する HLH が接続しています。

運用管理ソフトウェアを利用するために、Azure Stack の管理者は、BMC Network にアクセスする必要があります。Connected deployment の場合、このサブネットはインターネットと通信する必要があります。これらの通信要件を満たすために、既存ネットワーク側のルーティングを整えましょう。ToR Switch と BGP 接続していれば、このサブネットは勝手に聞こえてきます。

#### Storage Network

Azure Stack が動作するためには必須のサブネットですが、管理者と利用者が普段気にすることはありません。したがって、Azure Stack の管理者と利用者は、Storage Network にアクセスできなくてOKです。

参考：[プライベート ネットワーク](https://docs.microsoft.com/ja-jp/azure/azure-stack/azure-stack-network#private-network)

#### Infrastructure Network

Azure Stack の内部コンポーネント同士が通信するためのサブネットです。利用者はそれほど気にしなくてよいです。ただし、このサブネット内の/27の範囲はすごく大事です。この/27の範囲に Emergency Recovery Console (ERCS) という非常時のコンソールが存在しているからです。

ERCS にアクセスするために、Azure Stack の管理者は、この/27の範囲にアクセスする必要があります。また、Connected deployment の場合、この/27の範囲はインターネットと通信できる必要があります。これらの通信要件を満たすために、既存ネットワーク側のルーティングを整えましょう。ToR Switch と BGP 接続していれば、このサブネットは勝手に聞こえてきます。

#### Switch Infrastructure Network

ToR Switch と BMC Switch で利用するサブネットです。スイッチとスイッチを接続するセグメントや、Loopbackアドレスなどで利用されます。

スイッチにアクセスするために、Azure Stack の管理者は、この/27の範囲にアクセスできなければなりません。これらの通信要件を満たすために、既存ネットワーク側のルーティングを整えましょう。ToR Switch と BGP 接続していれば、このサブネットは勝手に聞こえてきます。

### VNet との接続方法

ToR Switch のルーティングテーブルには、Azure Stack 上の Azure に作成された VNet のサブネットが存在しません。なぜなら、VNetのサブネットと通信するためには、Site-to-Site IPsec VPN が必要だからです。

Azure Stack で動作する Azure の VNet 内のリソースとプライベートIPアドレスで直接通信する場合は、Site-to-Site IPsec VPN が必須です。Azure Stack は、Azureと同様に、標準の VPN Gateway と Network Virtual Appliance の2つをサポートしています。トンネリングなしのL3ルーティング（ Azure でいうところの Express Route ）は現時点でサポートされていません。

したがって、既存ネットワーク側には、IPSec VPN を終端するネットワーク機器が必要になります。既存ネットワーク側では、VNetのサブネットの Nexthop は VPNを終端するネットワーク機器になります。ToR Switch ではありません。VPN 接続を終端する装置については、ToR Swtich を収容する L3SW に VPN 接続を終端するネットワーク機器をツーアームでぶら下げたり、ToR Switch の収容と VPN 接続の終端を1台の機器で兼ねたり、いろいろなデザインがあり得ます。ネットワークエンジニアの腕の見せ所です。

## おわりに

本日のエントリーでは、Azure Stack のネットワーク周りについてお話しました。あなたがネットワークエンジニアである場合は腕の見せ所です。もしネットワークに詳しくない場合は、導入する環境のネットワーク管理者としっかり認識合わせしたうえで、ネットワークを設定しましょう。

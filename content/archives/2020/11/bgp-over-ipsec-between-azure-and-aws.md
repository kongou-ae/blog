---
title: Azure と AWS 間で BGP な Site-to-Site VPN を実装する
author: kongou_ae
date: 2020-11-26
url: /archives/2020/11/bgp-over-ipsec-between-azure-and-aws
categories:
  - azure
---

## はじめに

次のアナウンスのとおり、Azure の VPN Gateway で BGP over IPsec VPN する際に 169.254.x.x のアドレスを利用できるようになりました。

[Multiple new features for Azure VPN Gateway are now generally available](https://azure.microsoft.com/en-us/updates/multiple-new-features-for-azure-vpn-gateway-are-now-generally-available/?WT.mc_id=AZ-MVP-5003408)

このアップデートによって、Azure VPN Gateway は、BGP over IPsec VPN で 169.254.0.0/16 のアドレスを使わなければならない AWS とも BGP over IPsec VPN できるようになったはずです。というわけで試しました。

## ポンチ絵

AWS と Azure の IPsec VPN の仕様を踏まえて、次のような構成を実現します。黒矢印が確立する VPN トンネル、灰色矢印が設定するものの確立しない VPN トンネルです。

{{< figure src="/images/2020/2020-1126-003.jpg" title="構成のポンチ絵" >}}

「AWS はトンネルごとに BGP 用アドレスを持つのに対して、Azure は VPN Gateway ごとに BGP 用アドレスを持つ」という大きな違いを吸収するために、このようなとても汚い構成になりました。捨て VPN トンネルが大量に生まれます。もう少しスマートな実装が思いつけばよかったのですがこれが限界でした。

なお、この実装の場合、Azure と VPN している AWS 側の VPN 用グローバル IP アドレスが異なる VPN Connection に収容されているため、AWS が2つのトンネルを冗長構成として認識しない懸念があります。冗長構成として認識されない場合、2つのグローバル IP アドレスがハードウェア障害で同時に停止したり、2つのグローバル IP アドレスが同時にメンテナンスされてしまったりといったリスクが想定されます。。。

### 参考：仕様の違い

- AWS の仕様
  - 対向のグローバル IP アドレスごとに、VPN 用のグローバル IP アドレスが2つ用意される（VPN connection）
  - 対向のグローバル IP アドレスごとに、VPN トンネルが2つ設定される
  - VPN トンネルの内側のアドレスで BGP を確立する。つまり、トンネルの数だけ BGP 用のアドレスが存在する
  - トンネルの内側では 169.254.0.0/16 のアドレスを利用できる
- Azure の仕様
  - VPN Gateway を Active/Active にした場合、対向のグローバル IP アドレスの数に関係なく、VPN 用のグローバル IP アドレスが2つ用意される（VPN Gateway）
  - VPN Gateway を Active/Active にした場合、対向のグローバル IP アドレスごとに VPN トンネルが2つ設定される
  - VPN Gateway の LAN 側 IP アドレスで BGP を確立する。VPN トンネルが何個あっても BGP 用のアドレスは２つになる
  - LAN 側 では Gateway Subnet のプライベート IP アドレス、または169.254.21.0/24 と 169.254.22.0/24 のアドレスを利用できる

## 設定手順

### Azure VPN Gateway の作成

まずは Azure の VPN Gateway を作成します。必ず Azure 側から作業します。AWS の VPN connection を作成するためには対向のグローバル IP アドレスが必要ですが、Azure の VPN Gateway は対向のグローバル IP アドレスが無くても作成できるからです。作成時には Active/Active と BGP の有効化を忘れずに。

{{< figure src="/images/2020/2020-1126-004.png" title="Active/Active と BGP の有効化" >}}

また、BGP の動作確認で診断ログを利用するので、診断ログを有効化します。

### AWS VPN connection の作成

30分ほど待つと、Azure VPN Gateway のグローバル IP アドレスが決定します。

{{< figure src="/images/2020/2020-1126-008.png" title="Active/Active な VPN Gateway のグローバル IP アドレス" >}}

このグローバル IP アドレスを Customer Gateway とする形で VPN connection を作成します。VPN connection を作成する際の Inside IPv4 CIDR for Tunnel に、Azure で利用できる 169.254.21.0/24 または 169.254.22.0/24 を細切れにしたサブネットを明示的に指定します。

{{< figure src="/images/2020/2020-1126-007.png" title="Inside IPv4 CIDR for Tunnel の設定画面" >}}

対向のグローバル IP アドレスごとに VPN トンネルが2つ設定されますので、合計で4つのトンネルが出来上がります。現在の状態は下図の通りです。黒矢印が本手順で作成した VPN トンネルです。現時点でこれらのトンネルはダウンしたままです。

{{< figure src="/images/2020/2020-1126-002.jpg" title="AWS 側の VPN 設定が終わった状態" >}}

## Azure Local network Gateway の作成

AWS 側にできた2つの VPN Connection から1つずつトンネルを選びます。本当は AWS 側が用意してくれた 4つのトンネルをすべて利用したいのですが、Azure 側には BGP 用の 169.254 なアドレスが2つしかありません。したがって4つすべてを利用することは困難です。

そして選んだトンネルのグローバル IP アドレスを、Azure 上に Local network Gateway として登録します。登録する際には、Local network Gateway の BGP peer IP address として、AWS の グローバル IP アドレスに関連する 169.254.xxx.xxx のアドレスを指定します。グローバル IP アドレスと 169.254.x.x のアドレスの紐づけを間違えないようにしましょう。

{{< figure src="/images/2020/2020-1126-009.png" title="Local network Gateway の設定画面" >}}

Local network Gateway を作り終えたら、VPN Gateway に Connection を作ります。BGP を有効化するのを忘れずに。現在の状態は下図の通りです。黒矢印が本手順で作成した VPN トンネルです。現時点でこれらのトンネルもダウンしたままです。

{{< figure src="/images/2020/2020-1126-001.jpg" title="Azure 側の設定が終わった状態" >}}

## AWS Route table

BGP over IPsec で学習した経路を VPC の Route table に反映させるためには、ルート伝搬の設定が必要です。Azure と通信したい VM が接続しているサブネットの Route table を確認したうえで、ルート伝搬が有効でない場合は有効化します。

[ルート伝達を有効および無効にする](https://docs.aws.amazon.com/ja_jp/vpc/latest/userguide/WorkWithRouteTables.html#EnableDisableRouteProp)

## Azure VPN Gateway の修正

このままでは Azure VPN Gateway がデフォルトの Gateway subnet のプライベート IP アドレスで BGP を確立しようとしてしまうため、Azure VPN Gateway が AWS の期待する 169.254. なアドレスで BGP を確立するように修正します。AWS と同様、グローバル IP アドレスと 169.254.x.x の紐づけを間違えないようにしましょう。

{{< figure src="/images/2020/2020-1126-010.png" title="BGP で利用するアドレスの設定箇所" >}}

## 動作確認

### Azure VPN Gateway の状態

AWS 向けの Connection は Connected になっていることを確認します。Connected であれば IPsec は確立しています。2本中1本の VPN トンネルが落ちているはずなのですが ステータスが Connected になるのは少々気持ち悪いです。

{{< figure src="/images/2020/2020-1126-011.png" title="Azure 側 Connection の状態" >}}

そして、Log Analytics に吐き出されている診断ログで、BGP peer が上がったことと経路を学習していることを確認します。

{{< figure src="/images/2020/2020-1126-012.png" title="BGP 関連の出力" >}}

### Azure VPN connection の状態

Azure 向けの VPN Connection が available になっていること、そして2本中1つのトンネルが UP していることを確認します。

{{< figure src="/images/2020/2020-1126-005.png" title="VPN connection 1つ目の状態" >}}
{{< figure src="/images/2020/2020-1126-006.png" title="VPN connection 2つ目の状態" >}}

### 経路の確認

Azure 側が経路を受信しているかどうかを確認するためには、NIC の Effective routes を見ます。AWS の VPC で利用している 172.24.0.0/24 と 172.24.1.0/24 がルートテーブルに乗ってきていることが分かります。

{{< figure src="/images/2020/2020-1126-013.png" title="Effective routes の表示" >}}

AWS 側が経路を受信しているかどうかを確認するためには、Route table を見ます。VNet で利用している 10.2.0.0/24 と 10.3.0.0/24 が有効な経路として乗ってきていることが分かります。

{{< figure src="/images/2020/2020-1126-015.png" title="Route table の表示" >}}

### 疎通確認

Azure の VNet と AWS の VPC に仮想マシンを起動して、クラウドまたぎで Ping を実施します。Azure NSG と AWS SG の設定で許可されている通信であれば、問題なく到達します。

{{< rawhtml >}}<blockquote class="twitter-tweet" data-dnt="true" data-theme="light"><p lang="ja" dir="ltr">Azure の VM から AWS の VM に BGP over IPsec な経路で Ping が飛んだ。やりましたね。 <a href="https://t.co/WIUA9Xs8kY">pic.twitter.com/WIUA9Xs8kY</a></p>&mdash; こんごー (@kongou_ae) <a href="https://twitter.com/kongou_ae/status/1331600426655903745?ref_src=twsrc%5Etfw">November 25, 2020</a></blockquote> <script async src="https://platform.twitter.com/widgets.js" charset="utf-8"></script>{{< /rawhtml >}}

### 経路の更新

AWS VPC 側に CIDR を足すと、足した CIDR が Azure 側 のNIC の Effective routes に表示されます。同様に、VNet 側に CIDR を足すと、足した CIDR が AWS 側の Route table に表示されます。BGP on IPsec VPN が正常に動作していそうです。

ただし、Azure の VNet 側に CIDR を足すと BGP が一度切断されました。謎挙動・・・

{{< figure src="/images/2020/2020-1126-014.png" title="CIDR 追加後の診断ログ" >}}

## まとめ

Azure 側の仕様変更を受けて、Azure と AWS 間で BGP over IPsec VPN を試しました。マネージドサービスだけで繋がりますし通信もできます。ですが無理して実現した感が半端ないですし、Azure VNet 側の CIDR を更新すると BGP が切れるみたいなので、積極的に使うものではないかなと思いました。。

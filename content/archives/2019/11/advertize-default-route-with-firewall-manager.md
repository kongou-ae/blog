---
title: Azure Firewall Manager を使ってデフォルトルートをオンプレミスに広報する
author: kongou_ae
date: 2019-11-21
url: /archives/2019/10/advertize-default-route-with-firewall-manager
categories:
  - azure
---

# サマリ

Azure Firewall Manager を使ったら、Azure から BGP でデフォルトルートが聞こえてきた。

<blockquote class="twitter-tweet"><p lang="ja" dir="ltr">デフォルトルートが Azure からきこえてきたああああああああ。オンプレからAzure経由でインターネットに行けるのでは。 <a href="https://t.co/7jjIW7NCP0">pic.twitter.com/7jjIW7NCP0</a></p>&mdash; こんごー (@kongou_ae) <a href="https://twitter.com/kongou_ae/status/1197125399563526145?ref_src=twsrc%5Etfw">November 20, 2019</a></blockquote> <script async src="https://platform.twitter.com/widgets.js" charset="utf-8"></script>

Virtual Hub 上のルートテーブルに設定されている「Next Hop が Azure Firewall のデフォルトルート」が広報されているようです。

{{< figure src="/images/2019-11-21-001.png" title="Virtual Hub 上に存在するデフォルトルート" >}}

そのため、このデフォルトルートに乗れば、オンプレミスの端末は Azure Firewall の Public IP Address でインターネットにアクセスできます。Proxyではなくルーティングで、クラウドを経由してインターネットにアクセスできます。すごい。

<blockquote class="twitter-tweet"><p lang="ja" dir="ltr">オンプレミスの端末が Proxy なしで<br> Azure から外に出て行っているの図 <a href="https://t.co/KpbrNKgV6U">pic.twitter.com/KpbrNKgV6U</a></p>&mdash; こんごー (@kongou_ae) <a href="https://twitter.com/kongou_ae/status/1197172039120908289?ref_src=twsrc%5Etfw">November 20, 2019</a></blockquote> <script async src="https://platform.twitter.com/widgets.js" charset="utf-8"></script>

# 初期設定

Azure Firewall Manager を利用して Standard で Firewall を持った Secured Virtual Hub を作ります。

{{< figure src="/images/2019-11-21-002.png" title="Firewall Manager の設定画面その１" >}}

{{< figure src="/images/2019-11-21-003.png" title="Firewall Manager の設定画面その２" >}}

Virtual Hub に S2S VPN Gateway をデプロイして、普通の Virtual WAN と同じようにオンプレミスのネットワーク機器と S2S VPN を確立します。そして、オンプレミス側にルーティングが聞こえてきたほうが面白いので、Virtual Hub に2つの VNet を接続します。

{{< figure src="/images/2019-11-21-004.png" title="Virtual Hub に接続している VNet" >}}

ここまでのアドレス体系は次の通りです。

- 192.168.100.0/24 Secured Virtual Hub
  - 192.168.100.12 VPN Gateway #1 
  - 192.168.100.13 VPN Gateway #1 
  - 192.168.100.68 Azure Firewall 
- 192.168.111.0/24 On-premises
- 192.168.120.0/24 VNet その1
- 192.168.212.0/24 VNet その2

# ルーティングの制御

## 1. 初期状態

Secured Virtual Hub の設定画面で、Secured Virtual Hub 上のルーティングを制御できます。

{{< figure src="/images/2019-11-21-005.png" title="Secured Virtual Hub のルーティング設定" >}}

制御できる通信は次の3つです。

1. VNet からインターネットへのトラフィック
2. オンプレミスからインターネットへのトラフィック
3. VNet から VNet へのトラフィック

### オンプレミスのルーティング

初期状態の場合、オンプレミス側に聞こえてくるルーティングは次の3つです。デフォルトルートが聞こえてこないので、オンプレミスから Azure 経由でインターネットにはアクセスできません。

- 192.168.100.0/24 Secured Virtual Hub
- 192.168.120.0/24 VNet その1
- 192.168.212.0/24 VNet その2

{{< figure src="/images/2019-11-21-006.png" title="オンプレミスのルーティング" >}}

### Secured Virtual Hub のルーティング

Secured Virtual Hub 上のルーティングは次の通りです。デフォルトルートが存在しません。また、VNet 向けのルーティングの Nexthop が Virtual Network Connection になっているので、VNet への通信は Azure Firewall を経由しません。

{{< figure src="/images/2019-11-21-007.png" title="Secured Virtual Hub のルーティング" >}}

### VNet のルーティング

Peering している VNet のルーティングは次の通りです。Nexthop が Virtual Network Gateway になっているので、他の VNet とオンプレミスへの通信は Azure Firewall を経由しません。また、デフォルトルートは既定のルートが選択されています。

{{< figure src="/images/2019-11-21-008.png" title="作業前のVNet のルーティング" >}}

## 2. VNet からインターネットへの通信を制御

「Traffic from Virtual Network」のみを "Send via Azure Firewall" に変更します。

### オンプレミスのルーティング

オンプレミスのルーティングは変更なしです。

### Secured Virtual Hub のルーティング

Secured Virtual Hub のルーティングも変更なしです。Azure Firewall を Nexthop とするデフォルトルートが乗ってくると思いましたが乗ってこず。

### VNet のルーティング

VNet のルーティングは変化します。具体的には Azure Firewall を Nexthop とする 0.0.0.0/0 のルーティングが注入されます。その結果、この VNet からインターネットへの通信は Azure Firewall を経由します。

{{< figure src="/images/2019-11-21-009.png" title="変更後の VNet のルーティング" >}}

### 動作確認

VNet 内の Virtual Machine からインターネットにアクセスすると、送信元 IP が Azure Firewall のグローバル IP アドレスになります。

```
aimless@vm01:~$  curl httpbin.org/ip
{
  "origin": "52.155.118.96, 52.155.118.96"
}
aimless@vm01:~$
```

ただし、オンプレミスから VNet 内の VM への接続が、不可解な事象になりました。謎です。トラブルシュートしても解決できず・・・

- Ping は飛ぶ
- tnc で TCP/22 に接続できる
- SSH がタイムアウトになり接続できない

## 3. オンプレミスからインターネットへの通信を制御

S2S VPN のコネクションを Internet security の対象にしたうえで、「Traffic from Virtual Branches」も "Send via Azure Firewall" に変更します。

{{< figure src="/images/2019-11-21-010.png" title="Internet security の設定画面" >}}

### オンプレミスのルーティング

オンプレミスのルーティングにデフォルトルートが追加されます。

{{< figure src="/images/2019-11-21-011.png" title="オンプレミスにデフォルトルートが追加された図" >}}

### Secured Virtual Hub のルーティング

Secured Virtual Hub にもデフォルトルートが追加されます。このルーティングを BGP でオンプレミスに広報しているように見えます。

{{< figure src="/images/2019-11-21-012.png" title="Secured Virtual Hub にデフォルトルートが追加された図" >}}

### VNet のルーティング

VNet のルーティングは変化しません。

### 動作確認

冒頭に張り付けた Twitter のように、オンプレの端末からインターネットにアクセスすると、送信元 IP が Azure Firewall のグローバル IP アドレスになります。

<blockquote class="twitter-tweet"><p lang="ja" dir="ltr">オンプレミスの端末が Proxy なしで<br> Azure から外に出て行っているの図 <a href="https://t.co/KpbrNKgV6U">pic.twitter.com/KpbrNKgV6U</a></p>&mdash; こんごー (@kongou_ae) <a href="https://twitter.com/kongou_ae/status/1197172039120908289?ref_src=twsrc%5Etfw">November 20, 2019</a></blockquote> <script async src="https://platform.twitter.com/widgets.js" charset="utf-8"></script>

## 4. プライベートネットワーク 間の通信を制御

Azure Private traffic の Traffic to Virtual Networks を "Send via Azure Firewall" に変更します。

{{< figure src="/images/2019-11-21-013.png" title="Azure Private traffic の設定画面" >}}

### オンプレミスのルーティング

オンプレミスのルーティングは変更なしです。

### Secured Virtual Hub のルーティング

Secured Virtual Hub のルーティングも変更なしです。Nexthop を Azure Firewall とする VNet 宛てのルーティングを注入しないと、オンプレから VNet への通信の行きが Azure Firewall を経由しないと思うんだけどなぁ・・・

### VNet のルーティング

VNet のルーティングは変化します。具体的には Azure Firewall を Nexthop とする他の VNet とオンプレミスあてのルーティングが注入されます。その結果、この VNet から他のVNet およびオンプレミスへの通信は Azure Firewall を経由します。

{{< figure src="/images/2019-11-21-015.png" title="ルーティングが追加された図" >}}

### 動作確認

Azure Firewall には全許可のポリシーを設定しました。

{{< figure src="/images/2019-11-21-016.png" title="Firewall Manager で配布したポリシー中の全許可ルール" >}}

異なる VNet 内のサーバ同士は Ping が飛びます。一方で、オンプレから VNet への通信が Ping すら飛ばなくなりました。謎・・

オンプレと VNet 側のサーバの両方でキャプチャをとると、VNet 側のサーバがオンプレからのパケットに対して応答を返していることが見えます。ただし、その応答がオンプレ側にまで届いていません。なぜ・・・

試しに、Azure Firewall を経由させるサブネットからオンプレミスのサブネットを除外すると、Ping が飛ぶ状態に戻りました。非対称ルーティングになっていて戻りの通信が Azure Firewall で破棄されているのかも。

{{< figure src="/images/2019-11-21-017.png" title="オンプレのサブネットを除外したときの設定" >}}

{{< figure src="/images/2019-11-21-018.png" title="オンプレのサブネットを除外したときの Effective routes" >}}

## 振り返り

オンプレに対してデフォルトルートを広報できたものの、オンプレと VNet の通信がうまくいきませんでした。プレビューになりたてのサービスなので、半年後くらい後に改めて挑戦しようと思います。

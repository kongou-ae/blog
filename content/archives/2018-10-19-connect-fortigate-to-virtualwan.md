---
title: FortiGate を Azure Virtual WAN に接続する
author: kongou_ae
date: 2018-10-19
url: /archives/2018-10-19-connect-fortigate-to-virtualwan
categories:
  - azure
---

## はじめに

Azure Virtual Wan が GA しました。Ignite のセッションを見ているだけだと期待値が高くなりすぎてサービスの価値を正しく判断できないので、実際に試しました。ただし、我が家には自動プロビジョニングをサポートするデバイスがありません。そこで、どこのご家庭にもある FortiGate を Azure Virtual WAN に手動で接続しました。目指す構成は次の通りです。

{{<img src="./../../images/2018-10-19-011.png">}}

## Virtual WAN の構成要素

まずは Virtual WAN の構成要素を作ります。Virtual WAN の構成要素は次の3点です。

- Virtual WAN
- VPN Site
- Hub
- Virtual network connection

新しく用語ですが、これまでの実装と考え方はほとんど同じです。VPN Site を Local Network Gateway 、Hub を VPN Gateway 、Virtual network connection を VNet Peering と理解すれば、Virtual WAN 全体を理解しやすくなります。

Hub は 二台の VPN Gateway で構成されています。これも Virtual WAN 固有の要素ではありません。従来から、Site to Site VPN には Active/Avtive mode がありました。ただし、Hubは、従来の VPN Gateway と比較して性能が大幅に向上しています。詳細は公式サイトをご確認ください。

参考：[Virtual WAN と既存の Azure Virtual Network Gateway は、どんな点が違いますか。](https://docs.microsoft.com/ja-jp/azure/virtual-wan/virtual-wan-about#how-is-virtual-wan-different-from-the-existing-azure-virtual-network-gateway)

## Virtual WAN の準備

まずは Virtual WAN 自体を作ります。Virtual WAN の設定として、VPN Site 間の通信の許可するかどうかを選択できます。今回は許可にします。

{{<img src="./../../images/2018-10-19-001.png">}}

そして Hub を作ります。利用用途に合わせて帯域を選びましょう。裏で VPN Gateway が作成されるため、デプロイに時間がかかります。

{{<img src="./../../images/2018-10-19-002.png">}}

Virtual WAN はハブアンドスポーク型のVPNなので全ての通信がこの Hub を経由します。帯域の選定は慎重に。またスケールユニットが課金単位ですので、帯域を確保すればするほどお金がかかります。

参考：[Virtual WAN の価格](https://azure.microsoft.com/ja-jp/pricing/details/virtual-wan/)

次に VPN Site を登録します。FortiGate は VWAN の自動登録をサポートしていません。必要なパラメータを手で入力します。FortiGate 側の設定が完了していないので、現時点のステータスは Connecting です。

{{<img src="./../../images/2018-10-19-003.png">}}

VPN Site ができたら、作成した VPN Site を Hub と関連付けます。

{{<img src="./../../images/2018-10-19-005.png">}}

さらに、Hub と VNet を関連付けます。これで Azure 側の準備は完了です。

{{<img src="./../../images/2018-10-19-006.png">}}

この時点だと、まだ IPsec は確立していません。そのためポータル上の VPN Site のステータスは Connecting です。

{{<img src="./../../images/2018-10-19-008.png">}}

## FortiGate の準備

FortiGate は、Virtual WAN の特長である自動デプロイをサポートしていません。そのため、自分で設定します。接続先である Hub のパラメータは、Azure Portal からダウンロードできます。

{{<img src="./../../images/2018-10-19-009.png">}}

参考：[ダウンロードしたコンフィグファイル](https://gist.github.com/kongou-ae/8118a7bbacad5a5d0e06a1974a4f395e)

Virtual WAN 固有の設定は存在しませんので、[@syuheiuda](https://twitter.com/syuheiuda) のブログを参考にしつつ Active/Active な S2S VPN を設定すればOKです。

参考：[Juniper SRX650 / Cisco C841M で VPN を張って、BGP で経路交換してみた](https://www.syuheiuda.com/?p=4304)

## 動作確認

### Virtual WAN の状態

IPsec トンネルが一本でも確立すると、ポータルのステータスは になります。確立しているトンネルが1本なのか2本なのかを確認する術はありません。

{{<img src="./../../images/2018-10-19-011.png">}}

また、現時点では Azure Monitor を利用した メトリクス のアラートを作れませんでした。トンネルの可用性やレイテンシなどをAzure Monitor で監視できるようになってほしいところです。

### FortiGate の状態

BGPで学習した経路は次の通りです。想定した経路が聞こえてきています。他の拠点がいるとそのPrefixも聞こえてくのでしょう。

- Hub のprefix
  - 192.168.0.0/24
- hub と接続しているVNETのprefix
  - 10.0.3.0/24
  - 10.0.4.0/24

```
# get router info bgp network
BGP table version is 8, local router ID is 192.168.2.1
Status codes: s suppressed, d damped, h history, * valid, > best, i - internal,
              S Stale
Origin codes: i - IGP, e - EGP, ? - incomplete
 
   Network          Next Hop            Metric LocPrf Weight Path
*  10.0.3.0/24      192.168.0.5              0             0 65515 i
*>                  192.168.0.4              0             0 65515 i
*  10.0.4.0/24      192.168.0.5              0             0 65515 i
*>                  192.168.0.4              0             0 65515 i
*  192.168.0.0      192.168.0.5              0             0 65515 i
*>                  192.168.0.4              0             0 65515 i
*  192.168.2.1/32   192.168.0.5              0             0 65515 i
*>                  192.168.0.4              0             0 65515 i
*> 192.168.111.0    0.0.0.0                       100  32768 i
 
Total number of prefixes 5
```

### vnet の状態

Hub と接続している VNet で稼働している Virtual Machine のルーティングテーブルには VPN Site が広報した経路（192.168.111.0/24）が載っています。当然、私の自宅から VIrtual Machine にアクセスできます。

{{<img src="./../../images/2018-10-19-010.png">}}

## まとめ

自動プロビジョニングをサポートしないデバイスであっても、VPN Gateway に接続するのと同じ流れで、Virtual WAN と接続できました。

ただし、自動プロビジョニングのメリットを全く得られないので、すごく微妙でした。ベンダが検証したであろうコンフィグが自動で設定されることこそが、 VIrtual WAN の最大のメリットです。Ignite の Expo 会場で Fortinet のエンジニアにFortiGate の Virtual WAN 対応について質問したところ、現在絶賛開発中とのことでした。リリースが楽しみです。

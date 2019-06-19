---
title: VPN Gateway がアドレスを広報する VNet の範囲
author: kongou_ae
date: 2019-06-17
url: /archives/2019/06/scope-of-vnet-which-vgw-advertize-address-in
categories:
  - azure
---

VNet Peering で Hub&Spoke 構成を組んだ場合に、VPG Gateway がどこまで先のアドレスを広報してくれるかを実際に試したのでメモ

## サマリ

- VNet Peering を利用した Hub&Spoke 構成の場合、VPN Gateway がアドレスを広報する VNet は次の２つだけ
  - VPN Gateway が存在する VNet
  - VPN Gateway が存在する VNet と直接つながっている VNet
- VPN Gateway は、VPN Gateway が存在する VNet から 2hop 以上先の VNet のアドレスを広報しない

## 確認

動作確認で利用した構成は次の通り。10.0.0.0/16側の VNet peering では "Allow gateway transit "を有効化、10.1.0.0/16と10.2.0.0/16側の VNet peering では "Use remote gateway" を有効化しました。

{{< figure src="/images/2019-06-17-001.png" title="構成図" >}}

VPN Gateway が広報している経路と FortiGate が受信した経路の一覧は次の通りです。VPN Gateway が存在する VNet と 1hop 先の VNet のアドレスは表示されていますが、2hop 先の10.3.0.0/16のアドレスは表示されていません。

```
PS Azure:\> $peers = Get-AzVirtualNetworkGatewayBGPPeerStatus -ResourceGroupName bgp-adv -VirtualNetworkGatewayName vpnbgp
PS Azure:\> Get-AzVirtualNetworkGatewayAdvertisedRoute -VirtualNetworkGatewayName vpnbgp -ResourceGroupName bgp-adv -Peer $peers[0].Neighbor | ft *

LocalAddress Network       NextHop    SourcePeer Origin AsPath Weight
------------ -------       -------    ---------- ------ ------ ------
10.0.1.254   10.0.0.0/16   10.0.1.254            Igp    65515       0
10.0.1.254   172.21.0.1/32 10.0.1.254            Igp    65515       0
10.0.1.254   10.1.0.0/16   10.0.1.254            Igp    65515       0
10.0.1.254   10.2.0.0/16   10.0.1.254            Igp    65515       0
```

```
# get router info bgp neighbors 10.0.1.254 routes
BGP table version is 2, local router ID is 192.168.111.254
Status codes: s suppressed, d damped, h history, * valid, > best, i - internal,
              S Stale
Origin codes: i - IGP, e - EGP, ? - incomplete
 
   Network          Next Hop            Metric LocPrf Weight Path
*> 10.0.0.0/16      10.0.1.254               0             0 65515 i
*> 10.1.0.0/16      10.0.1.254               0             0 65515 i
*> 10.2.0.0/16      10.0.1.254               0             0 65515 i
*> 172.21.0.1/32    10.0.1.254               0             0 65515 i
 
Total number of prefixes 4
```

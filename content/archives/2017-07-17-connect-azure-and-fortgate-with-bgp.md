---
title: FortiGateとAzureのVPN GatewayをBGPで接続する
author: kongou_ae

date: 2017-07-17
url: /archives/2017-07-17-connect-azure-and-fortgate-with-bgp
categories:
  - Azure
  - Fortigate
---

[BGP対応のAzure VPN GatewayをPowerShellでデプロイする](https://aimless.jp/blog/archives/2017-07-16-install-vngw-with-bgp/)で作成したBGP対応のVPN GatewayをFortiGateと接続します。FortigateとAWSをIPSecで接続したことがあれば、同じイメージで対応できます。動作確認で利用したFortiGateはFortiGate 50B（v4.0 MR3 Patch 14）です。古いモデルで申し訳ない。

FortiGateを設定する上で注意点が3つあります。具体的には次のとおりです。

- IPsecのパラメータをそろえる
- VPN GatewayのプライベートIPアドレスに対するルーティングを追加する
- eBGP Multihopを有効にする

## IPsecのパラメータをそろえる

IPsecは機器間のパラメータが異なるとつながりません。FortinetはFortiGateとAzureをIPsec接続するためのドキュメント（[IPsec VPN to Microsoft Azure](http://cookbook.fortinet.com/ipsec-vpn-microsoft-azure-54)）を公開しています。このドキュメントに記載されているパラメータで設定します。

## VPN GatewayのプライベートIPアドレスに対するルーティングを追加する

FortiGateは、VPN Gatewayに対するBGPパケットをAzureとのIPsecVPNに向けて送信しなければなりません。この条件を達成するためには、FortiGateにVPN GatewayがBGPで利用するIPアドレスのルーティングを追加する必要があります。ルーティングを追加しないと、FortiGateはBGPパケットを明後日の方向に飛ばします。

VPN GatewayがBGPで利用するIPアドレスはプライベートIPアドレスです。デフォルトだと、VPN GatewayのプライベートIPアドレスはGateway Subnetの最後から2つ目になります。実際のIPアドレスはGet-AzureRmVirtualNetworkGatewayやGet-AzureRmVirtualNetworkGatewayBGPPeerStatusで確認できます。

```
> Get-AzureRmVirtualNetworkGatewayBGPPeerStatus -VirtualNetworkGatewayName $VgwName -ResourceGroupName $RGName


Asn               : 65001
ConnectedDuration : 00:41:22.6773460
LocalAddress      : 10.1.2.254
MessagesReceived  : 48
MessagesSent      : 50
Neighbor          : 192.168.1.1
RoutesReceived    : 0
State             : Connected
```

FortiGateにVPN Gateway用のルーティングを足す方法は次の2つです。

- /32でスタティックルートを書く
- IPsecインタフェースのremote-ipに指定する

```
    edit "azure"
        set vdom "root"
        set ip 192.168.1.1 255.255.255.255
        set type tunnel
        set remote-ip 10.1.2.254
        set interface "wan2"
    next
```

## eBGP Multihopを有効にする

eBGPは直接つながっているルータ間でのみ利用できます。eBGPではBGPパケットのTTLが1だからです。しかし、FortiGateとVPN GatewayはBGPで直接つながることができません。FortiGateとVPN Gatewayを直接つないでいるIPsecトンネルインタフェースにおいて、VPN Gateway側にIPアドレスが設定されていないためです。先ほど確認したVPN GatewayのプライベートIPアドレスはVNet側のIPアドレスです。トンネルインタフェース側ではありません。

直接つながっていないルータ間でeBGPをするために、eBGP Multihopを有効します。

```
config router bgp
    set as 65001
        config neighbor
            edit "10.1.2.254"
                set ebgp-enforce-multihop enable
                set next-hop-self enable
                set soft-reconfiguration enable
                set remote-as 65147
                set update-source "azure"
            next
        end
```

## 動作確認

FortiGateはVPN GatewayをBGP neighborとして認識しています。4経路を受信しています。

```
# get router info bgp summary 
BGP router identifier 192.168.1.1, local AS number 65001
BGP table version is 2
2 BGP AS-PATH entries
0 BGP community entries

Neighbor        V         AS MsgRcvd MsgSent   TblVer  InQ OutQ Up/Down  State/PfxRcd
10.1.2.254      4      65147     234     252        1    0    0 02:39:11        4

Total number of neighbors 1
```

4経路の内訳は、Vnetに登録した3つのセグメントと、BGP接続したFortiGateIPアドレスでした。いい感じです。

```
# get router info bgp network
BGP table version is 2, local router ID is 192.168.1.1
Status codes: s suppressed, d damped, h history, * valid, > best, i - internal,
              S Stale
Origin codes: i - IGP, e - EGP, ? - incomplete

   Network          Next Hop            Metric LocPrf Weight Path
*> 10.1.0.0/16      10.1.2.254               0             0 65147 i
*> 172.16.0.0       10.1.2.254               0             0 65147 i
*> 172.17.0.0       10.1.2.254               0             0 65147 i
*> 192.168.1.1/32   10.1.2.254               0             0 65147 i
*> 192.168.111.0    0.0.0.0                       100  32768 i

Total number of prefixes 5
```

## まとめ

「AWSと同じだろ」とドキュメントを読まずにトライした結果、eBGP MultiHopにはまりました。AzureのドキュメントにはeBGP Multihopが必要なことがちゃんと書かれています（[PowerShell を使用して Azure VPN Gateway で BGP を構成する方法](https://docs.microsoft.com/ja-jp/azure/vpn-gateway/vpn-gateway-bgp-resource-manager-ps)）。ちゃんとドキュメントに目を通すの大事。
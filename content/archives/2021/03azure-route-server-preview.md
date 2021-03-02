---
title: Azure Route Server を利用して仮想アプライアンスと VNet 間で経路交換する
author: kongou_ae
date: 2021-03-03
url: /archives/2021/03/azure-route-server-preview
categories:
  - azure
  - network
---

[Azure Route Server](https://docs.microsoft.com/ja-jp/azure/route-server/) がパブリックプレビューになりました。Azure Route Server とは BGP を利用して VNet と経路交換できるサービスです。Azure 上で NVA を利用したことがある人であれば「VNet と BGP で経路交換できたらいいのに・・・」と思ったことがあるはずです。その要望を実現するサービスがリリースされました。

本エントリでは、Route Server を利用してさくっと経路交換してみた結果をまとめます。

## 前提条件

- Route Server を VNet 上に展開するためには、RouteServerSubnet という名前の/27のサブネットが必要です
- 経路交換で利用できるプロトコルは BGP のみです
- BGP では 2-byte AS のみをサポートします
- Router Server と NVA が別サブネットに展開されるので、NVA では ebgp multihop が必要です

## Route Server の構築

3/3 現在、Router Server をポータルから作ることはできなさそうなので、PowerShell で作ります。なお3/3現在、Azure CLI も Route Server をサポートしています。

```powershell
$subnetId = "/subscriptions/9c171efd-eab4-xxxx-xxxx-xxxxxxxxxxxx/resourceGroups/routeserver/providers/Microsoft.Network/virtualNetworks/routeserver-vnet/subnets/RouteServerSubnet"
New-AzRouteServer -Name routeserver -ResourceGroupName routeserver -Location "Westus2” -HostedSubnet $subnetId
```

作り終わると、Router Server の AS 番号と IP アドレスが分かります。

```powershell
RouteServerAsn             : 65515
RouteServerIps             : {10.1.2.4, 10.1.2.5}
ProvisioningState          : Succeeded
HostedSubnet               : /subscriptions/9c171efd-eab4-xxxx-xxxx-xxxxxxxxxxxx/resourceGroups/routeserver/providers/M
                             icrosoft.Network/virtualNetworks/routeserver-vnet/subnets/RouteServerSubnet
Peerings                   : {}
AllowBranchToBranchTraffic : False
PeeringsText               : []
ResourceGroupName          : routeserver
Location                   : westus2
ResourceGuid               :
Type                       : Microsoft.Network/virtualHubs
Tag                        :
TagsTable                  :
Name                       : routeserver
Etag                       :
Id                         : /subscriptions/9c171efd-eab4-xxxx-xxxx-xxxxxxxxxxxx/resourceGroups/routeserver/providers/M
                             icrosoft.Network/virtualHubs/routeserver
```

Router Server に Peer の設定を入れていきます。今回は AS 65147 で 10.1.0.4 と 10.1.0.5 の BGP ルータを Quagga で起動しているので、次のような PowerShell を実行します。

```powershell
Add-AzRouteServerPeer -ResourceGroupName routeserver -RouteServerName "routeserver" -PeerName quagga -PeerIp "10.1.0.4" -PeerAsn 65147
Add-AzRouteServerPeer -ResourceGroupName routeserver -RouteServerName "routeserver" -PeerName quagga -PeerIp "10.1.0.5" -PeerAsn 65147
```

すると、Router Server 内に Peer の情報が追加されます。あとは NVA 側に BGP の設定を追加すれば OK です。今回は192.168.255.0/24を広報します。

```powershell
Peerings                   : {quagga, quagga2}
AllowBranchToBranchTraffic : False
PeeringsText               : [
                               {
                                 "PeerAsn": 65147,
                                 "PeerIp": "10.1.0.4",
                                 "ProvisioningState": "Succeeded",
                                 "Name": "quagga"
                               },
                               {
                                 "PeerAsn": 65147,
                                 "PeerIp": "10.1.0.5",
                                 "ProvisioningState": "Succeeded",
                                 "Name": "quagga2"
                               }
                             ]
```

## 動作確認

2台の Quagga から同一の AS Path で Route Server に経路を広報すると VNet 内のルーティングは ECMP になります。

{{< figure src="/images/2021/2021-0303-001.png" title="ECMP なルートテーブル" >}}

10.1.0.5 側が広報する経路に AS-Path を積むと、Route Server はより近い経路のみを VNet 内のルーティングに反映します。

{{< figure src="/images/2021/2021-0303-001.png" title="片方に寄ったなルートテーブル" >}}

Route Server が学習した経路や広報した経路を確認する方法も用意されています。PowerShell では次のコマンドです。

- Get-AzRouteServerPeerAdvertisedRoute
- Get-AzRouteServerPeerLearnedRoute

ただし、手元の Az.Network 4.6.0 ではこれらのコマンドが存在しません。これらのコマンドに置き換わる前の次のコマンドを使えば、Route Server の状態を確認できます。

- Get-AzVirtualRouterAdvertisedRoute
- Get-AzVirtualRouterPeerLearnedRoute

```powershell
PS > Get-AzVirtualRouterPeerLearnedRoute -ResourceGroupName routeserver -PeerName quagga -VirtualRouterName routeserver

LocalAddress : 10.1.2.4
Network      : 192.168.255.0/24
NextHop      : 10.1.0.4
SourcePeer   : 10.1.0.4
Origin       : EBgp
AsPath       : 65147
Weight       : 32768

LocalAddress : 10.1.2.5
Network      : 192.168.255.0/24
NextHop      : 10.1.0.4
SourcePeer   : 10.1.0.4
Origin       : EBgp
AsPath       : 65147
Weight       : 32768

PS > Get-AzVirtualRouterPeerLearnedRoute -ResourceGroupName routeserver -PeerName quagga2 

LocalAddress : 10.1.2.4
Network      : 192.168.255.0/24
NextHop      : 10.1.0.5
SourcePeer   : 10.1.0.5
Origin       : EBgp
AsPath       : 65147-65147-65147 # AS Path が増えている
Weight       : 32768

LocalAddress : 10.1.2.5
Network      : 192.168.255.0/24
NextHop      : 10.1.0.5
SourcePeer   : 10.1.0.5
Origin       : EBgp
AsPath       : 65147-65147-65147 # AS Path が増えている
Weight       : 32768

PS > Get-AzVirtualRouterPeerAdvertisedRoute -ResourceGroupName routeserver -PeerName quagga2 -VirtualRouterName routeserver

LocalAddress : 10.1.2.4
Network      : 10.1.0.0/16
NextHop      : 10.1.2.4
SourcePeer   :
Origin       : Igp
AsPath       : 65515
Weight       : 0

LocalAddress : 10.1.2.5
Network      : 10.1.0.0/16
NextHop      : 10.1.2.5
SourcePeer   :
Origin       : Igp
AsPath       : 65515
Weight       : 0
```

## まとめ

プレビューになった Route Server を利用して、VNet と BGP で経路交換してみました。BGP で VNet のルーティングを操作できますので、NVA を利用する際に UDR を利用する必要がなくなります。NVA の先に存在するアドレス空間が増えるたびに UDR を更新する必要がなくなりますし、NVA を冗長構成で導入している際の切り替わり時に API を叩いて UDR のネクストホップを書き換える必要もなくなります。すばらしい。早く GA になーれ。

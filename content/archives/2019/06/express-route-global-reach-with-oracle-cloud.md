---
title: Express Route Global Reach を試した
author: kongou_ae
date: 2019-06-30
url: /archives/2019/06/express-route-global-reach-with-oracle-cloud
categories:
  - azure
---

# サマリ

- Oracle Cloud を使えば、Express Route Private Peering を安価に試せる
  - 安価な仮想オンプレとして Oracle Cloud を利用できる
- Oracle Cloud を利用して複数の Express Route Private Peering を用意すれば、Express Route Global Reach を試せる
  - Oracle Cloud 側から見ると、Azure とつなげられるのは us-ashburn-1 のみ
  - Azure 側は eastus だけの認識だったが、どのリージョンであっても Oracle Cloud をサービスプロバイダとして利用できた。そのため、異なるリージョンの Express Route Circuit を安価に用意できる
- Oracle Cloud を使うと、Express Route Global Reach を利用した疎通確認ができない
  - Oracle Cloud 内の ルート表やセキュリティリストを整えても通信できなかった
  - Azure の Express Route とつなぐ場合、Oracle FastConnect 側の AS 番号が 31898 で固定になってしまう
  - Oracle Cloud 側が Global Reach 経由で AS-PATH に自分の AS 番号の含まれる経路を受信するため、Oracle Cloud が対向の Oracle Cloud の広報した経路を学習しない（はず。Oracle Cloud 側で確認する術がない）

# 謝辞

Interact 2019の帰り道に「Oracle Cloud を使って Express Route を評価する」というアイディアを共有してくれた [@Masayuki_Ozawa](https://twitter.com/Masayuki_Ozawa) に感謝。

# メモ

## 1. Express Circuit を用意する

Azure ポータルから Oracle FastConnect をサービスプロバイダにした Express Circuit を作成します。2019年6月30日現在、Oracle Cloud との接続点はワシントンのDCにあるようです。

{{< figure src="/images/2019-0630-001.png" title="Oracle Cloud を設定箇所" >}}

## 2. Oracle FastConnect を用意する

Oracle Cloud 側で 仮想クラウド・ネットワークと動的ルーティング・ゲートウェイを作ったうえで、FastConnectを作ります。

プロバイダから Express Route を選択します。

{{< figure src="/images/2019-0630-002.png" title="FastConnect の設定画面 その1" >}}

Express Route お馴染みの情報を入力していきます。ただし、AS番号を指定できませんので Azure から見た Oracle Cloud は AS 31898 になります。API 直叩きすれば AS 番号を変更できるのかもしれませんが、今回の本質ではないので諦めました。

{{< figure src="/images/2019-0630-003.png" title="FastConnect の設定画面 その2" >}}

設定が正しく終われば、Express Route Circuit に Private Peering が現れます。

{{< figure src="/images/2019-0630-004.png" title="有効になった Private Peering" >}}

今回は、japaneast の Express Route Circuit の先に10.0.0.0/16の仮想クラウド・ネットワークを接続しました。また、westus2 の Express Route Circuit の先に192.168.0.0/16の仮想クラウド・ネットワークを接続しました。

## 3. Global Reach を有効化する

リージョンの異なる Express Route Circuit を用意したうえで、Global Reach を有効にします。その結果、片方の Peering の中に Connections というパラメータが入ります。

```powershell
> $ckt_1 = Get-AzExpressRouteCircuit -Name je-ora-washinton1 -ResourceGroupName ergr
> $ckt_1.Location
japaneast

> $ckt_2 = Get-AzExpressRouteCircuit -Name je-ora-washinton2 -ResourceGroupName ergr2
> $ckt_2.Location
westus2

> Add-AzExpressRouteCircuitConnectionConfig -Name 'globalreach' -ExpressRouteCircuit $ckt_1 -PeerExpressRouteCircuitPeering $ckt_2.Peerings[0].Id -AddressPrefix '172.17.0.0/29'
Set-AzExpressRouteCircuit -ExpressRouteCircuit $ckt_1

Name                             : je-ora-washinton1
ResourceGroupName                : ergr
Location                         : japaneast
Id                               : /subscriptions/xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx/resourceGroups/ergr/providers/Microsoft.Network/expressRouteCircuits/je-ora-washinton1
Etag                             : W/"14535d7e-f9a2-4343-8b19-2ff6f376979f"
ProvisioningState                : Succeeded
Sku                              : {
                                     "Name": "Premium_MeteredData",
                                     "Tier": "Premium",
                                     "Family": "MeteredData"
                                   }
CircuitProvisioningState         : Enabled
ServiceProviderProvisioningState : Provisioned
ServiceProviderNotes             :
ServiceProviderProperties        : {
                                     "ServiceProviderName": "Oracle Cloud FastConnect",
                                     "PeeringLocation": "Washington DC",
                                     "BandwidthInMbps": 50
                                   }
ExpressRoutePort                 : null
BandwidthInGbps                  :
Stag                             : 6
ServiceKey                       : 0985c12b-072a-435d-a7bf-88b6edaff2b8
Peerings                         : [
                                     {
                                       "Name": "AzurePrivatePeering",
                                       "Etag": "W/\"14535d7e-f9a2-4343-8b19-2ff6f376979f\"",
                                       "Id": "/subscriptions/xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx/resourceGroups/ergr/providers/Microsoft.Network/expressRouteCircuits/je-ora-
                                   washinton1/peerings/AzurePrivatePeering",
                                       "PeeringType": "AzurePrivatePeering",
                                       "State": "Enabled",
                                       "AzureASN": 12076,
                                       "PeerASN": 31898,
                                       "PrimaryPeerAddressPrefix": "10.0.0.20/30",
                                       "SecondaryPeerAddressPrefix": "10.0.0.24/30",
                                       "PrimaryAzurePort": "",
                                       "SecondaryAzurePort": "",
                                       "VlanId": 101,
                                       "ProvisioningState": "Succeeded",
                                       "GatewayManagerEtag": "",
                                       "LastModifiedBy": "Customer",
                                       "Connections": [
                                         {
                                           "Name": "globalreach",
                                           "Etag": "W/\"14535d7e-f9a2-4343-8b19-2ff6f376979f\"",
                                           "Id": "/subscriptions/xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx/resourceGroups/ergr/providers/Microsoft.Network/expressRouteCircuits/je-
                                   ora-washinton1/peerings/AzurePrivatePeering/connections/globalreach",
                                           "AddressPrefix": "172.17.0.0/29",
                                           "CircuitConnectionStatus": "Connected",
                                           "ProvisioningState": "Succeeded",
                                           "ExpressRouteCircuitPeering": {
                                             "Id": "/subscriptions/xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx/resourceGroups/ergr/providers/Microsoft.Network/expressRouteCircuits/j
                                   e-ora-washinton1/peerings/AzurePrivatePeering"
                                           },
                                           "PeerExpressRouteCircuitPeering": {
                                             "Id": "/subscriptions/xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx/resourceGroups/ergr2/providers/Microsoft.Network/expressRouteCircuits/
                                   je-ora-washinton2/peerings/AzurePrivatePeering"
                                           }
                                         }
                                       ],
                                       "PeeredConnections": []
                                     }
                                   ]
Authorizations                   : []
AllowClassicOperations           : False
GatewayManagerEtag               :
```

ただし、2つの Circuit のうち片方にだけ Connections のパラメータが入りました。ちょっと気持ち悪いですね。

```powershell
> $ckt_1.Peerings.Connections

Name                           : globalreach
Id                             : /subscriptions/xxxxxxxx-xxxx-xxxx-xxxxxxxxxxxx/resourceGroups/ergr/providers/Microsoft.Network/expressRouteCircuits/je-ora-washinton1/pe
                                 erings/AzurePrivatePeering/connections/globalreach
Etag                           : W/"0ea3e8b7-5e3c-4aac-a6a4-ab84f20c0746"
AddresPrefix                   : 
AuthorizationKey               : 
CircuitConnectionStatus        : Connected
ProvisioningState              : Succeeded
PeerExpressRouteCircuitPeering : Microsoft.Azure.Commands.Network.Models.PSResourceId

> $ckt_2.Peerings.Connections

> 
```

## 4. 動作確認

AS 番号の重複によって経路を学習しない都合で Oracle Cloud 同士の疎通確認ができないので、Express Route Circuit が学習したルーティングを確認します。Global Reach していない場合、Private Peering の先に存在している Oracle Cloud の仮想クラウド・ネットワークのサブネットを学習しています。

```powershell
# japaneast の Peering 1本目
> Get-AzExpressRouteCircuitRouteTable -ResourceGroupName ergr -ExpressRouteCircuitName je-ora-washinton1 -PeeringType AzurePrivatePeering -DevicePath Primary | ft * -AutoSize

Network     NextHop   LocPrf Weight Path 
-------     -------   ------ ------ ---- 
10.0.0.0/24 10.0.0.21             0 31898
10.0.1.0/24 10.0.0.21             0 31898
10.0.2.0/24 10.0.0.21             0 31898

# japaneast の Peering 2本目
> Get-AzExpressRouteCircuitRouteTable -ResourceGroupName ergr -ExpressRouteCircuitName je-ora-washinton1 -PeeringType AzurePrivatePeering -DevicePath Secondary | ft * -AutoSize

Network     NextHop   LocPrf Weight Path 
-------     -------   ------ ------ ---- 
10.0.0.0/24 10.0.0.25             0 31898
10.0.1.0/24 10.0.0.25             0 31898
10.0.2.0/24 10.0.0.25             0 31898

# westus2 の Peering 1本目
> Get-AzExpressRouteCircuitRouteTable -ResourceGroupName ergr2 -ExpressRouteCircuitName je-ora-washinton2 -PeeringType AzurePrivatePeering -DevicePath Primary | ft * -AutoSize

Network     NextHop     LocPrf Weight Path 
-------     -------     ------ ------ ---- 
192.168.0.0 172.16.1.21             0 31898
192.168.1.0 172.16.1.21             0 31898

# westus2 の Peering 2本目
> Get-AzExpressRouteCircuitRouteTable -ResourceGroupName ergr2 -ExpressRouteCircuitName je-ora-washinton2 -PeeringType AzurePrivatePeering -DevicePath Secondary | ft * -AutoSize

Network     NextHop     LocPrf Weight Path 
-------     -------     ------ ------ ---- 
192.168.0.0 172.16.1.25             0 31898
192.168.1.0 172.16.1.25             0 31898
```

Express Route Circuit が学習したルーティングを見る限りだと、Oracle Cloud の FastConnect は、仮想クラウド・ネットワーク全体の Prefix ではなく 実在するサブネットを細かく広報する仕様のようです。

Global Reach を有効にすると、Global Reach した Private Peering の先にいる経路も学習します。この状態であれば、異なるオンプレミス拠点同士が Express Route Circuit 経由で通信できそうです。

```powershell
# japaneast の Peering 1本目
> Get-AzExpressRouteCircuitRouteTable -ResourceGroupName ergr -ExpressRouteCircuitName je-ora-washinton1 -PeeringType AzurePrivatePeering -DevicePath Primary | ft * -AutoSize

Network     NextHop    LocPrf Weight Path
-------     -------    ------ ------ ----
10.0.0.0/24 10.0.0.21              0 31898
10.0.1.0/24 10.0.0.21              0 31898
10.0.2.0/24 10.0.0.21              0 31898
192.168.0.0 172.17.0.3 10          0 31898
192.168.1.0 172.17.0.3 10          0 31898

# japaneast の Peering 2本目
> Get-AzExpressRouteCircuitRouteTable -ResourceGroupName ergr -ExpressRouteCircuitName je-ora-washinton1 -PeeringType AzurePrivatePeering -DevicePath Secondary | ft * -AutoSize

Network     NextHop    LocPrf Weight Path
-------     -------    ------ ------ ----
10.0.0.0/24 10.0.0.25              0 31898
10.0.1.0/24 10.0.0.25              0 31898
10.0.2.0/24 10.0.0.25              0 31898
192.168.0.0 172.17.0.4 10          0 31898
192.168.1.0 172.17.0.4 10          0 31898

# westus2 の Peering 1本目
> Get-AzExpressRouteCircuitRouteTable -ResourceGroupName ergr2 -ExpressRouteCircuitName je-ora-washinton2 -PeeringType AzurePrivatePeering -DevicePath Primary | ft * -AutoSize

Network     NextHop     LocPrf Weight Path
-------     -------     ------ ------ ----
10.0.0.0/24 172.17.0.1  10          0 31898
10.0.1.0/24 172.17.0.1  10          0 31898
10.0.2.0/24 172.17.0.1  10          0 31898
192.168.0.0 172.16.1.21             0 31898
192.168.1.0 172.16.1.21             0 31898

# westus2 の Peering 2本目
> Get-AzExpressRouteCircuitRouteTable -ResourceGroupName ergr2 -ExpressRouteCircuitName je-ora-washinton2 -PeeringType AzurePrivatePeering -DevicePath Secondary | ft * -AutoSize

Network     NextHop     LocPrf Weight Path
-------     -------     ------ ------ ----
10.0.0.0/24 172.17.0.2  10          0 31898
10.0.1.0/24 172.17.0.2  10          0 31898
10.0.2.0/24 172.17.0.2  10          0 31898
192.168.0.0 172.16.1.25             0 31898
192.168.1.0 172.16.1.25             0 31898
```

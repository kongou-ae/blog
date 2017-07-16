---
title: BGP対応のAzure VPN GatewayをPowerShellでデプロイする
author: kongou_ae

date: 2017-07-16
url: /archives/2017-07-16-install-vngw-with-bgp
categories:
  - Azure
---

AzureのVNetとオンプレミスをIPsecVPNでつなぐ場合、VPN Gatewayが必要です。VPN GatewayはStatic RouteとBGPをサポートしています。Azure PortalではStatic RouteをサポートするVPN Gatewayのみ作成できます。BGPをサポートするVPN GatewayはPowerShellを使って作ります。

## サンプルスクリプト

BGPをサポートするVPN Gatewayを作る時の基本的な注意点は次の3点です。

- SKUをBasic以外にする（BasicはBGPをサポートしない）
- New-AzureRmVirtualNetworkGatewayに-EnableBgp $TRUEをつける
- VPN Gatewayを作る時のように、Local Network Gatewayを作る時にもBGP用のパラメータをつける

サンプルのスクリプトは次のとおりです。New-AzureRmVirtualNetworkGatewayの処理に時間がかかります。

```
# 既存リソースのパラメータ
$RGName = "azurelab"
$VnetName = "azurelab-vnet"

# 今回作成するリソースのパラメータ
## VirtualNetworkGateway
$GWIPName = "gwip"
$GWIPconfName = "gwipconf"
$VNetASN = "65147"
$VgwName = "bgp-gw"
$GatewaySku = "VpnGw1"

## LocalNetworkGateway
$LgwName = "localnetworkgateway1"
$LgwIpAddress = "xxx.xxx.xxx.xxx"
$LgwBgpPeeringAddress = "xxx.xxx.xxx.xxx"
$LgwAsn = "65001"

## Connection
$ConnectionName = "bgpcon"
$SharedKey = "hogehoge"

# リソースを作成するリージョンを指定
$location = (Get-AzureRmVirtualNetwork -Name $VNetName -ResourceGroupName $RGName).Location

# VirtualNetworkGatewayに割り当てるPIPを作成
$gwpip = New-AzureRmPublicIpAddress -Name $GWIPName -ResourceGroupName $RGName -Location $location -AllocationMethod Dynamic

# VirtualNetworkGatewayをデプロイするGatewaySubnetを取得
$vnet = Get-AzureRmVirtualNetwork -Name $VNetName -ResourceGroupName $RGName
$gwsubnet = Get-AzureRmVirtualNetworkSubnetConfig -Name "GatewaySubnet" -VirtualNetwork $vnet

# VirtualNetworkGatewayのIP設定を作成
$gwipconf = New-AzureRmVirtualNetworkGatewayIpConfig -Name $GWIPconfName -Subnet $gwsubnet -PublicIpAddress $gwpip

# VirtualNetworkGatewayを作成。BGPサポートにするため-EnableBgp $TRUEにする
New-AzureRmVirtualNetworkGateway -Name $VgwName -ResourceGroupName $RGName -Location $location -IpConfigurations $gwipconf -GatewayType Vpn -VpnType RouteBased -GatewaySku $GatewaySku -Asn $VNetASN -EnableBgp $TRUE

# VNGとLNGを接続するコネクションを作る
$vnetgw = Get-AzureRmVirtualNetworkGateway -Name $VgwName -ResourceGroupName $RGName
$lnggw = New-AzureRmLocalNetworkGateway -Name $LgwName -ResourceGroupName $RGName -Location $location -Asn $LgwAsn -BgpPeeringAddress $LgwBgpPeeringAddress -GatewayIpAddress $LgwIpAddress
New-AzureRmVirtualNetworkGatewayConnection -Name $ConnectionName -ResourceGroupName $RGName -VirtualNetworkGateway1 $vnetgw -LocalNetworkGateway2 $lnggw -Location $location -ConnectionType IPsec -SharedKey $SharedKey -EnableBgp $True
```

## ステータスを確認するコマンド

BGPのステータスを確認するPowerShellコマンドレットが用意されてます。

### BGP Peerのステータスを確認する

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

### 学習したルートを確認する

オンプレミスから192.168.111.0/24の経路を学習していることがわかります。

```
> Get-AzureRmVirtualNetworkGatewayLearnedRoute -VirtualNetworkGatewayName $VgwName -ResourceGroupName $RGName


AsPath       :
LocalAddress : 10.1.2.254
Network      : 10.1.0.0/16
NextHop      :
Origin       : Network
SourcePeer   : 10.1.2.254
Weight       : 32768

AsPath       :
LocalAddress : 10.1.2.254
Network      : 172.16.0.0/16
NextHop      :
Origin       : Network
SourcePeer   : 10.1.2.254
Weight       : 32768

AsPath       :
LocalAddress : 10.1.2.254
Network      : 172.17.0.0/16
NextHop      :
Origin       : Network
SourcePeer   : 10.1.2.254
Weight       : 32768

AsPath       :
LocalAddress : 10.1.2.254
Network      : 192.168.1.1/32
NextHop      :
Origin       : Network
SourcePeer   : 10.1.2.254
Weight       : 32768

AsPath       : 65001
LocalAddress : 10.1.2.254
Network      : 192.168.111.0/24
NextHop      : 192.168.1.1
Origin       : EBgp
SourcePeer   : 192.168.1.1
Weight       : 32768
```

### 広報したルートを確認する

```
> Get-AzureRmVirtualNetworkGatewayAdvertisedRoute -VirtualNetworkGatewayName $VgwName -ResourceGroupName $RGName -Peer 192.168.1.1


AsPath       : 65147
LocalAddress : 10.1.2.254
Network      : 10.1.0.0/16
NextHop      : 10.1.2.254
Origin       : Igp
SourcePeer   :
Weight       : 0

AsPath       : 65147
LocalAddress : 10.1.2.254
Network      : 172.16.0.0/16
NextHop      : 10.1.2.254
Origin       : Igp
SourcePeer   :
Weight       : 0

AsPath       : 65147
LocalAddress : 10.1.2.254
Network      : 172.17.0.0/16
NextHop      : 10.1.2.254
Origin       : Igp
SourcePeer   :
Weight       : 0

AsPath       : 65147
LocalAddress : 10.1.2.254
Network      : 192.168.1.1/32
NextHop      : 10.1.2.254
Origin       : Igp
SourcePeer   :
Weight       : 0
```

## まとめ

BGPの状況を確認できるコマンドが用意されていることに驚きました。クラウドを利用する上で、トラブったときに自己調査できる手段が用意されていることは大事です。解決に至るまでのスピード感が違います。

次のエントリでは、BGP対応のVPN GatewayとFortiGateを接続します。
---
title: Azure Private Link Service を利用して別テナントにシステムを公開する
author: kongou_ae
date: 2019-09-19
url: /archives/2019/09/public-own-service-to-different-tenant-with-private-link-service
categories:
  - azure
---

## はじめに

Azure Private Link が Public Preview になりました。

[https://azure.microsoft.com/ja-jp/updates/private-link-now-available-in-preview/](https://azure.microsoft.com/ja-jp/updates/private-link-now-available-in-preview/)

Private Link は Private Endpoint と Private Link Service の2つで構成されています。本エントリでは、Private Link Service を利用して別テナントにシステムを公開する方法に触れます。想定しているユースケースは、「Azure 上でサービスを運用しているサービスプロバイダが Azure の利用者に対して Private EndPoint 経由でサービスを公開する」です。

## 事前準備

### サービスプロバイダ側

Private Link Service と紐づけられる Azure リソースは Standard LoadBalancer だけです。したがって、Private Link Service 経由でのサービス提供する場合、クライアントが Standard LoadBalancer にアクセスするようなアーキテクチャにしなければなりません。

本エントリでは、Virtual Machine 上の IIS で動作する Web サービスを Private Endpoint 経由で公開します。まずは、Standard LoadBalancer と Virtual Machine を用意して、Standard LoadBalancer の Frontend に TCP/80 でアクセスすると Virtual Machine の IIS の画面が表示されるようにします。

準備ができたら、Private Link Service を作ります。

```powershell
$rg = New-AzResourceGroup -Name pls -Location westus
$vnet = Get-AzVirtualNetwork -ResourceGroupName pl -Name pl
$plsSubnet = $vnet.Subnets | Where-Object { $_.Name -eq "pls"}

$plsIpConfigName = "PLS-ipconfig" 
$plsName = "pls"

# Private Link Service の IP アドレスを10.0.1.100に設定
$IPConfig = New-AzPrivateLinkServiceIpConfig `
-Name $plsIpConfigName `
-Subnet $plsSubnet `
-PrivateIpAddress 10.0.1.100

# Private Link Service 経由で公開したい Standard LoadBalancer の フロントエンド設定を取得
$fe = Get-AzLoadBalancer -Name pl -ResourceGroupName pl | Get-AzLoadBalancerFrontendIpConfig 

# 作成した IPアドレス設定と取得したフロントエンド設定を利用して Private Link Service を作成
$privateLinkService = New-AzPrivateLinkService `
    -ServiceName $plsName `
    -ResourceGroupName $rg.ResourceGroupName `
    -Location $rg.Location `
    -LoadBalancerFrontendIpConfiguration $fe `
    -IpConfiguration $IPConfig 
```

作成した Private Link Service の設定はポータル上でも確認できます。作成した Private Link Service が先ほど指定したプライベート IP アドレスを利用していることが分かります。

{{< figure src="/images/2019-09-19-001.png" title="Private Link Service の概要" >}}

異なるテナントの利用者がこの Private Link Service に利用するためには、Private Link Service の ID が必要です。メモしたうえで利用者に伝えます。

```powershell
> $privateLinkService.Id
/subscriptions/xxxxxxx-xxxx-xxxx-xxxx-c5bd3103e127/resourceGroups/pls/providers/Microsoft.Network/privateLinkServices/pls
```

### 利用者側

サービスプロバイダから入手した Private Link Service の ID を利用して、Private Endpoint を作ります。

```powershell
$plsConnection = New-AzPrivateLinkServiceConnection `
    -Name otherTenantPlsConnection `
    -PrivateLinkServiceId /subscriptions/xxxxxxx-xxxx-xxxx-xxxx-c5bd3103e127/resourceGroups/pls/providers/Microsoft.Network/privateLinkServices/pls

$otherTenantrg = Get-azResourceGroup -Name azurelab
$otherVnet = Get-azVirtualNetwork -Name azurelabvnet648 -ResourceGroupName azurelab

$privateEndpoint = New-AzPrivateEndpoint -ResourceGroupName $otherTenantrg.ResourceGroupName `
    -Name otherTenantPe -Location westus -Subnet $otherVnet.subnets[0] `
    -PrivateLinkServiceConnection $plsConnection -ByManualRequest
```

Private Link Center を見ると、otherTenantPe　という Private Endpoint が Pending になっています。

{{< figure src="/images/2019-09-19-002.png" title="Private Endpoint の状態" >}}

利用者が作成した Privaete Endpoint がサービスプロバイダによってすぐに承認されるかどうかは Private Link Service 側の設定によります。パラメータを指定せずに作成した Private Link Service の場合、Private Endpoint からの接続要求をサービスプロバイダが手動で承認する必要があります。

{{< figure src="/images/2019-09-19-003.png" title="サービスプロバイダが接続要求を承認する" >}}

[https://docs.microsoft.com/ja-jp/azure/private-link/private-link-service-overview#control-service-access](https://docs.microsoft.com/ja-jp/azure/private-link/private-link-service-overview#control-service-access)

誰でも勝手につないで良い Private Link Service にしたい場合は、自動承認を有効化します。

```bash
# 特定のサブスクリプションを指定して自動承認を有効化
az network private-link-service update -g pls -n pls --auto-approval "xxxxxxxx-xxxx-xxxx-xxxx-1558cc49f261" --visibility "xxxxxxxx-xxxx-xxxx-xxxx-1558cc49f261"
# すべてのサブスクリプションに対して自動承認を有効化
az network private-link-service update -g pls -n pls --auto-approval "*" --visibility "*"
```

## 動作確認

作成した Private Endpoint の IP アドレスを確認したうえで、Private EndPoint が存在する VNet に仮想マシンを立てて RDP で接続します。

```powershell
$pe = Get-AzPrivateEndpoint -Name otherTenantPeApAll -ResourceGroupName azurelab
$peNic = Get-AzNetworkInterface -ResourceId $pe.NetworkInterfaces.Id
$peNic.IpConfigurations[0].PrivateIpAddress
10.2.0.9
```

ブラウザで 10.2.0.9 にアクセスすると、IIS のデフォルト画面が表示されます。

{{< figure src="/images/2019-09-19-005.png" title="Private Endpoint の先の VM の IIS の画面" >}}

IIS のログを見ると、Private Link Service の IP アドレスである 10.0.1.100 からアクセスされているのが分かります。

```text
2019-09-19 13:16:38 10.0.0.5 GET / - 80 - 184.82.231.34 Mozilla/5.0+(Windows+NT+6.1;+WOW64)+AppleWebKit/537.36+(KHTML,+like+Gecko)+Chrome/51.0.2704.103+Safari/537.36 - 200 0 0 303
2019-09-19 13:17:20 10.0.0.5 GET / - 80 - 10.0.1.100 Mozilla/5.0+(Windows+NT+10.0;+WOW64;+Trident/7.0;+Touch;+rv:11.0)+like+Gecko - 200 0 0 21
2019-09-19 13:17:20 10.0.0.5 GET /iisstart.png - 80 - 10.0.1.100 Mozilla/5.0+(Windows+NT+10.0;+WOW64;+Trident/7.0;+Touch;+rv:11.0)+like+Gecko http://10.2.0.9/ 200 0 0 9
2019-09-19 13:17:20 10.0.0.5 GET /favicon.ico - 80 - 10.0.1.100 Mozilla/5.0+(Windows+NT+10.0;+WOW64;+Trident/7.0;+Touch;+rv:11.0)+like+Gecko - 404 0 2 1
```

通信ログのとおり、Private Link Service 経由の通信は Private Link Service の IP アドレスで送信元 NAT されます。アプリケーション側で IP アドレスを利用したい場合は、レイヤ7レベルで送信元 IP アドレスを保持する実装にしましょう。

## まとめ

Private Link Service を利用して異なるテナントにシステムを公開する方法をまとめました。Private Link Service を利用すると Standard LoadBalancer を利用しているシステムを異なるテナントに対して簡単に公開できます。今回は Virtual Machine を使いましたが、VMSS や AKS などの Standard LoadBalancer をサポートするリソースを使ったシステムも公開できそうです。夢が広がりますね。

Private Link の登場によって、Azure 上の異なるテナント間の通信を実現する方法は次の3つになりました。要件にあったものを選択しましょう。

- Public IPAddress
- VNet Peering
- Private Link

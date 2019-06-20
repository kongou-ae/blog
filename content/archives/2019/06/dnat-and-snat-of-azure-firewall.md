---
title: Azure Firewall の Inbound DNAT は SNAT もする
author: kongou_ae
date: 2019-06-20
url: /archives/2019/06/dnat-and-snat-of-azure-firewall
categories:
  - azure
---

## サマリ

- Azure Firewall の Inbound DNAT は 同時に SNAT もする
  - Active/Active な Azure Firewall で非対称ルーティングを避けるためには仕方ない
  - Active/Active であり続ける限り、回避策はない
  - Inbound の SNAT が嫌な場合は、Active/Passive な NVA を利用する

## 本文

Azure Firewall の 複数の Public IP Address 対応がプレビューになったので DNAT を試しました。

参考：[Multiple public IPs (public preview)](https://docs.microsoft.com/en-us/azure/firewall/overview#multiple-public-ips-public-preview)

### 手順

現時点で Azure Firewall に Public IP Address を追加するためには、Powershell を利用しなければなりません。

```
$newpip = Get-AzPublicIpAddress -ResourceGroupName peering-test -Name azfw3
$azFw = Get-AzFirewall -Name azfw -ResourceGroupName peering-test 
$azFw.AddPublicIpAddress($newpip)
$azFw | Set-AzFirewall
```

### 結果

Azure Firewall の IPConfigurations に AzureFirewallIpConfigurationx が増えていきます。

```powershell
Name                       : azfw
ResourceGroupName          : peering-test
Location                   : centralus
Id                         : /subscriptions/xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx/resourceGroups/peering-test/providers/Microsoft.Network/azureFirewalls/azfw
Etag                       : W/"487e92d5-ac8d-43e9-92ff-a44ed1dd100e"
ResourceGuid               : 
ProvisioningState          : Succeeded
Tags                       : 
IpConfigurations           : [
    {
        "Name": "IpConf",
        "Etag": "W/\"487e92d5-ac8d-43e9-92ff-a44ed1dd100e\"",
        "Id": "/subscriptions/xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx/resourceGroups/peering-test/providers/Microsoft.Network/azureFirewalls/azfw/azureFirewallIpConfigurations/IpConf",
        "PrivateIPAddress": "10.1.1.4",
        "Subnet": {
            "Id": "/subscriptions/xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx/resourceGroups/peering-test/providers/Microsoft.Network/virtualNetworks/huba/subnets/AzureFirewallSubnet"
        },
        "PublicIpAddress": {
            "Id": "/subscriptions/xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx/resourceGroups/peering-test/providers/Microsoft.Network/publicIPAddresses/azureFirewalls-ip"
        }
    },
    {
        "Name": "AzureFirewallIpConfiguration1",
        "Etag": "W/\"487e92d5-ac8d-43e9-92ff-a44ed1dd100e\"",
        "Id": "/subscriptions/xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx/resourceGroups/peering-test/providers/Microsoft.Network/azureFirewalls/azfw/azureFirewallIpConfigurations/AzureFirewallIpConfiguration1",
        "PublicIpAddress": {
            "Id": "/subscriptions/xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx/resourceGroups/peering-test/providers/Microsoft.Network/publicIPAddresses/azfw02"
        }
    },
    {
        "Name": "AzureFirewallIpConfiguration2",
        "Etag": "W/\"487e92d5-ac8d-43e9-92ff-a44ed1dd100e\"",
        "Id": "/subscriptions/xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx/resourceGroups/peering-test/providers/Microsoft.Network/azureFirewalls/azfw/azureFirewallIpConfigurations/AzureFirewallIpConfiguration2",
        "PublicIpAddress": {
            "Id": "/subscriptions/xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx/resourceGroups/peering-test/providers/Microsoft.Network/publicIPAddresses/azfw3"
        }
    }
]
```

### 動作確認

DNAT のルールを追加するとその通信は Azure Firewall で自動的に許可されます。本日の本題はここから。VNet 内の Ubuntu の TCP/22 を Azure Firewall で公開したうえで Azure Firewall の Public IP Address に SSH すると、次のように送信元 IP アドレスが Azure Firewall のインスタンスのプライベート IP アドレスになります。

<blockquote class="twitter-tweet" data-lang="ja"><p lang="ja" dir="ltr">Azure Firewall の DNAT ってSNATされちゃうのか？DNAT経由でSSHしたら送信元IPがAzureFirewallSubnetのアドレスになった <a href="https://t.co/4IZw1jLPpx">pic.twitter.com/4IZw1jLPpx</a></p>&mdash; こんごー (@kongou_ae) <a href="https://twitter.com/kongou_ae/status/1141480653948477440?ref_src=twsrc%5Etfw">2019年6月19日</a></blockquote>
<script async src="https://platform.twitter.com/widgets.js" charset="utf-8"></script>

Active/Active な 構成で SNAT しないと非対称ルーティングになってしまうので仕方ないですね。SNAT が NG なシステムでは次のいずれかの方式を採用しましょう。

- Virtual Machine に Public IP Address を割り当てて、Inbound を直接受信する
- Active/Passive な NVA を利用する 

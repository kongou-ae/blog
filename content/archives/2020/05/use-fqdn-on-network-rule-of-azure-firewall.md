---
title: Azure Firewall の Network rule で FQDN を使う
author: kongou_ae
date: 2020-05-01
url: /archives/2020/05/use-fqdn-on-network-rule-of-azure-firewall
categories:
  - azure
---

## はじめに

Azure Firewall に Network rule で FQDN を使う機能が実装されました。おそらく 2019年 10月くらいに。

```
{
  "name": "L4-traffic-with-FQDN",
  "description": "Block traffic based on source IPs and ports to amazon",
  "sourceAddresses": [
    "10.2.4.12-10.2.4.255"
  ],
  "destinationPorts": [
    "443-444",
    "8443"
  ],
  "destinationFqdns": [
    "www.amazon.com"
  ],
  "protocols": [
    "TCP"
  ]
}
```

引用：[AzureFirewallPut.json](https://gist-it.appspot.com/https://github.com/Azure/azure-rest-api-specs/blob/144e1e790c0cab6f06bafae195879075e376341d/specification/network/resource-manager/Microsoft.Network/stable/2019-09-01/examples/AzureFirewallPut.json#L470-L486)

「HTTP/HTTPS 以外の通信に対して FQDN で通信を制御する」という機能は、Network Virtual Appliance にはあるが Azure Firewall にはないものでした。Azure Firewall が Network Virtual Appliance に一歩追いついた記念すべきアップデートなので試そうと思っていたのですが、いつまでたってもポータルが FQDN をサポートしないので放置していました。ですが、ポータルが FQDN をサポートする気配が全くないので、PowerShell で試してみました。

## 設定

`DestinationAddress` のかわりに `DestinationFqdn` を利用します。

```powershell
$azfw = Get-AzFirewall -Name azfw01 -ResourceGroupName fgnew
$Rule = New-AzFirewallNetworkRule -Name 001 -Description "ssh by FQDN" -SourceAddress 10.0.0.0/16  -DestinationFqdn "sslgw.aimless.jp" -DestinationPort 22 -Protocol TCP
$RuleCollection = New-AzFirewallNetworkRuleCollection -Name 001 -Priority 100 -Rule $Rule -ActionType "Allow"
$azfw.NetworkRuleCollections = $RuleCollection
Set-AzFirewall -AzureFirewall $Azfw
```

残念なことに、ポータルでは設定を確認できません。 `DestinationFqdn` を表示する欄がないためです。下図のように `DestinationAddress` が空欄のルールが爆誕します。。。


{{< figure src="/images/2020/2020-0502-001.jpg" title="Azure ポータル上での表示" >}}

## 動作確認

ルールを設定していない Azure Firewall 経由で sslgw.aimless.jp に SSH で接続したところ、通信がタイムアウトしました。該当の通信を Azure Firewall がドロップしたからです。

```
aimless@test01:~$ ssh -l admin sslgw.aimless.jp

ssh: connect to host sslgw.aimless.jp port 22: Connection timed out
```

上記の設定のように sslgw.aimless.jp 宛ての SSH を許可する Network rule を追加したところ、Azure Firewall 経由で sslgw.aimless.jp に SSH 接続できるようになりました。

```
aimless@test01:~$ ssh -l admin sslgw.aimless.jp
admin@sslgw.aimless.jp's password:
```

また、sslgw.aimless.jp の A レコードに登録されている IP アドレス 宛ての SSH も許可されました。

```
aimless@test01:~$ ssh -l admin 36.xxx.xxx.xxx
admin@36.xxx.xxx.xxx's password:
```

ただし、Network rule の FQDN の仕様が公式ドキュメントに書かれていないので、どのような仕組みで動いているのかが不明です。FortiGate のように、Network rule に登録されている FQDN を名前解決して、返ってきた IP アドレスを使って通信を制御する方式でしょうか。知りたい。

Log Analytics に転送されてきたログの出力は IP アドレスで許可したときと同じです。ログ上では FQDN ではなく IP アドレスが記録されるにも関わらず、どのルールで処理されたかが記録されていないので、通信がどの FQDN に該当して処理されたのかを後追いできません。がっかり実装。

|Property| Value |
|---------------|-----------------|
|TenantId | xxxxxxxx-xxxx-xxxx-xxxx-8092c65a78c1|
|SourceSystem|Azure|
|TimeGenerated [UTC]|2020-05-02T12:49:09.237Z|
|msg_s|TCP request from 10.0.5.4:32794 to 36.xxx.xxx.xxx:22. Action: Allow|
|ResourceId|/SUBSCRIPTIONS/xxxxxxxx-xxxx-xxxx-xxxx-8092c65a78c1/RESOURCEGROUPS/FGNEW/PROVIDERS/MICROSOFT.NETWORK/AZUREFIREWALLS/AZFW01|
|Category|AzureFirewallNetworkRule|
|OperationName|AzureFirewallNetworkRuleLog|
|SubscriptionId|xxxxxxxx-xxxx-xxxx-xxxx-8092c65a78c1|
|ResourceGroup|FGNEW|
|ResourceProvider|MICROSOFT.NETWORK|
|Resource|AZFW01|
|ResourceType|AZUREFIREWALLS|
|Type|AzureDiagnostics|

## まとめ

Network rule に FQDN を使う方法をまとめました。具体的な挙動が不明ではありますが、Azure Firewall と Network Virtual Appliance との差が縮まったのは良いことです。ポータルが Network rule の FQDN をサポートしてくれることを待っています。



---
title: Azure NAT Gateway を触ってみた
author: kongou_ae
date: 2020-02-19
url: /archives/2020/02/the-first-impression-of-nat-gateway
categories:
  - azure
---

送信元 NAT のマネージドサービスである Nat Gateway が Public Preview になったので早速試してみました。

- [Azure Virtual Network—Network address translation is now in preview](https://azure.microsoft.com/ja-jp/updates/natpreview/)
- [What is Virtual Network NAT (Public Preview)?](https://docs.microsoft.com/en-us/azure/virtual-network/nat-overview)

## 気になった点

### デプロイ方法

Nat Gateway は、Azure Firewall のような専用のサブネットを使いません。Service Endpoint のように NAT Gateway を利用したいサブネットを NAT Gateway と関連付けるだけで OK です。

{{< figure src="/images/2020/2020-0219-001.png" title="NAT Gateway とサブネットを関連付ける画面" >}}

Nat Gateway は、Azure Firewall のように裏で VMSS がデプロイされてる方式ではなく、Azure の SDN そのものの機能として実現されているようです。そのため、UDR を利用して 0.0.0.0/0 を NAT Gatway に向ける必要はありません。

> All outbound traffic for the subnet is processed by NAT automatically without any customer configuration. User-defined routes aren't necessary. NAT takes precedence over other outbound scenarios and replaces the default Internet destination of a subnet.

参考：[Static IP addresses for outbound-only](https://docs.microsoft.com/en-us/azure/virtual-network/nat-overview#static-ip-addresses-for-outbound-only)

### 利用できる IP アドレス

Public IP Address だけでなく、Public IP Prefix にも対応しています。20.46.184.180/30 の Public IP Prefix を利用した場合、次のようにすべての Public IP Address を利用して送信元 NAT してくれました。

```
$ while true;do  curl ifconfig.me;echo;done
20.46.184.183
20.46.184.181
20.46.184.182
20.46.184.180
20.46.184.180
20.46.184.180
20.46.184.183
20.46.184.182
20.46.184.183
20.46.184.181
20.46.184.183
20.46.184.180
20.46.184.182
20.46.184.183
20.46.184.182
20.46.184.183
```

### Inbound NAT との併用

NAT Gateway を利用するサブネットに存在する Virtual Machine に Public IP Address を関連付けられます。さらにその Public IP Address を利用して Inbound の通信ができます。これが不思議でした。UDR 方式の場合、VM に関連付けた Public IP Address に対して Inbound でアクセスしても、戻りの通信が UDR 側に戻る非対称ルーティングになってしまい通信できません。ですが、NAT Gateway の場合は、非対称ルーティングにならず Inbound 通信が成立します。通信の方向を理解してうえで、Outbound の通信のみを処理するとは賢い子です。

### NSG FLowLogs が未サポート？

ドキュメントには["NSG flow logging isn't supported when using NAT."](https://docs.microsoft.com/ja-jp/azure/virtual-network/nat-overview#limitations)と記載されているのですが、実際に NSG FlowLogs を有効にしてみたところ Outbound の通信が記録されていました。謎。

{{< figure src="/images/2020/2020-0219-002.jpg" title="NSG FlowLogs の結果" >}}


### NSG が効かない？

ドキュメントには["NSG on subnet or NIC isn't honored for outbound flows to public endpoints using NAT."](https://docs.microsoft.com/ja-jp/azure/virtual-network/nat-overview#limitations)と記載されているのですが、実際に NSG に Outbound 全拒否のルールを書いてみたところ通信できなくなりました。Outbound の通信は NSG でしっかり評価されていそうです。謎。

## 感想

NAT Gateway の登場によって、「Azure からインターネットへの送信元 IP アドレスを固定したい」という要件を実現する方法が1つ増えました。

- VM に Public IP を関連付ける
- NVA を導入して UDR する
- Azure Firewall を導入して UDR する
- NAT Gateway を利用する　← New!!!

VM に Public IP Address を関連付けると外部から攻撃される可能性が増えますし、NVA や Azure Firewall は 送信元 IP アドレスを固定したいという要件だけを実現するには重装備でした。NAT Gateway というちょうどよい塩梅の方法が登場したので、積極的に使っていこうと思います。

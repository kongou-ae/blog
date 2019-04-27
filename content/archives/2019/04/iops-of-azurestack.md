---
title: Azure Stack の Virtual Machine の IOPS
author: kongou_ae
date: 2019-04-27
url: /archives/2019/04/iops-of-azurestack
categories:
  - azurestack
  - azure
---

## はじめに

Azure Stack 上で利用できる Azure のサービスは、Azure と一貫性がありますが違いもあります。主要な違いと考慮事項は次の URL にまとまっています。ただし、あくまでも主要な部分であってすべての注意点が記載されているわけではありませんのでご留意ください。

- [Considerations for using virtual machines in Azure Stack](https://docs.microsoft.com/en-us/azure-stack/user/azure-stack-vm-considerations)
- [Azure Stack managed disks: differences and considerations](https://docs.microsoft.com/en-us/azure-stack/user/azure-stack-managed-disk-considerations)
- [SQL server best practices to optimize performance in Azure Stack](https://docs.microsoft.com/en-us/azure-stack/user/azure-stack-sql-server-vm-considerations)
- [Azure Stack storage: Differences and considerations](https://docs.microsoft.com/en-us/azure-stack/user/azure-stack-acs-differences)
- [Considerations for Azure Stack networking](https://docs.microsoft.com/en-us/azure-stack/user/azure-stack-network-differences)

これらの違いの中から、今回は Virtual Machine の IOPS の違いをまとめます。話をシンプルにするために Managed Disk のみをスコープにします。

## Azure 上の Virtual Machine の IOPS

Azure の場合、IOPS を決める要素は次の3点です。

- Disk の種別
  - Standard SSD/HDD Managed Disk の IOPS は、4TBのサイズを超えない限り500です
  - 高い IOPS を必要とする場合は、Premium SSD Managed Disk を選択する必要があります
- Disk のサイズ
  - Premium SSD Managed Disk は、サイズを増やせば増やすほど IOPS が増えていきます
- VM のサイズ
  - VM のサイズによって、インスタンス全体の最大 IOPS が決まっています
  - インスタンスのサイズを大きくすればするほど最大 IOPS も増えていきます

したがって、Azure 上で Standard DS2 v2 + Premium Managed SSD Disk 1023TB の構成で IOPS を計測すると、Virtual Machine 側の上限である6400 IOPS と Disk 側の上限である5000 IOPS の低い方である 5000 IOPS がでます。

{{< figure src="/images/2019-04-27-001.png" title="Azure 上でのテスト結果" >}}

また、Azure では Premium Disk の場合、IOPS が保証されます。

## Azure Stack 上の Virtual Machine の IOPS

Azure と一貫性をもった Azure Stack ですが、IOPS のロジックは独自です。Azure とは一貫性がありません。Azure Stack 上で IOPS を決める要素は VM のサイズのみです。Disk の種別や Disk のサイズは IOPS と無関係です。

- VM のサイズ
  - Premium Disk を利用できるSつきタイプの場合、ディスク1本あたり2300 IOPS。サイズを大きくしても2300 IOPS のまま
  - Premium Disk を利用できないSなしタイプの場合、ディスク1本あたり500 IOPS

したがって、Azure Stack 上で Standard DS2 v2 + Premium Managed SSD Disk 1023TB の構成で IOPS を計測しても、Azure と同様の 5000 IOPS はでません。Sつきインスタンスなのでディスク1本あたりの上限である2300 IOPS がでます。

{{< figure src="/images/2019-04-27-002.png" title="Azure Stack 上での単一ディスクに対するテスト結果" >}}

2300 IOPS 以上の IOPS が必要な場合は、Sつきタイプの Virtual Machine に複数の Disk をマウントしたうえでストライプします。30G の Disk を3本ストライプしたボリュームの IOPS を計測すると 6900 IOPS(2300*3) がでます。

{{< figure src="/images/2019-04-27-002.png" title="Azure Stack 上での複数ディスクを束ねたボリュームに対するテスト結果" >}}

また、Azure Stack の IOPS は制限であって保証ではありません。

## おわりに

Azure Stack 上の Virtual Machine の IOPS の考え方は Azure と全く異なります。Azure に慣れた人であればあるほどハマりやすいポイントだと思いますのでお気を付けください。

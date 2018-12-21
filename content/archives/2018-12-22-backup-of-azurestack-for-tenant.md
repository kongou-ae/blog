---
title: Azure Stack をバックアップする（利用者向け）
author: kongou_ae
date: 2018-12-22
url: /archives/2018-12-22-backup-of-azurestack-for-tenant
categories:
  - azurestack
---

本エントリーは[Microsoft Azure Stack Advent Calendar 2018](https://qiita.com/advent-calendar/2018/azure-stack)の22日目です。

昨日に続いて本日のエントリでも Azure Stack のバックアップをまとめます。本日のエントリの主題は、利用者が取得すべきバックアップです。なお、PaaS のバックアップは本エントリの対象外です。私が PaaS のバックアップを説明できるほど PaaS を使いこなしていないからです。

## Azure と違うこと

Azure の場合、多くの利用者は Virtual Machine のデータをバックアップするために Azure IaaS VM Backup を利用していると思います。Azure IaaS VM Backup は、定期的に Virtual Machine の Disk のスナップショットを取得して世代管理してくれる素晴らしいサービスです。

残念なことに、1809 Update 時点の Azure Stack には Recovery Service Vault がありません。そのため、Azure Stack では Azure IaaS VM Backup が利用できません。Azure IaaS VM Backup が存在しない状況は、Azure Stack と Azure との一貫性を大きく損なっています。早く実装されてほしいです・・

## データのバックアップ

Azure IaaS VM Backup が存在しない Azure Stack で Virtual Machine のデータをバックアップするためには、エージェント型バックアップを利用する必要があります。例えば、Acronis や Arcserve、Comvault などのサードパーティソリューションを使うもよし、Azure Backup Server や　Azure Backup Agent などの Microsoft ソリューションを使うもよし、使い慣れたものを利用するとよいでしょう。

バックアップデータの保存先には注意が必要です。バックアップデータを Azure Stack 上に保存してしまうと、Azure Stack が全損した際にバックアップデータも消失します。エージェント型バックアップを構築する際は、バックアップデータが Azure Stack の外に保存されるようなアーキテクチャにするとよいでしょう。

## 構成情報のバックアップ

昨日のエントリで説明したとおり、Azure Stack の管理者が取得するバックアップには、利用者が作成したリソースの構成情報が含まれていません。リソースの構成情報をバックアップは、利用者の責任範囲に含まれます。

「万が一に備えて構成情報を控えておきたい。リソースの再作成は手で構わない」というスタンスであれば、[](https://www.syuheiuda.com/?p=4381) の方式で一括取得する方法が気軽です。「再デプロイ可能な状態で構成情報を保存したい」というスタンスであれば、Infrastructure as code なツールを利用して構成をコード化しておくとよいでしょう。

## BC/DR

本日の主題から離れてしまいますが、バックアップと関連のあるBC/DR についても触れます。

Azure の場合、BC/DR を考慮すると複数リージョンを利用してシステムを構成するのが一般的です。残念ながらことに、1811 update 時点の Azure Stack にはマルチリージョンやペアリージョンの機能が実装されていません。そのため、OS 以上の機能で Azure Stack 上のデータを別の場所に複製する必要があります。

### Azure Stack と Azure

複製先の候補の１つが Azure です。Azure Site Recovery は Azure Stack をサポートしています。ただし、サポートされている方式は、構成サーバを利用した実装です。Azure の Azure to Azure のような実装ではありません。Azure Stack が Recovery Service Vault をサポートしていない以上、Azure to Azure と同じ実装ができるわけがありません。Recovery Service Vault のリリースが待ち遠しいです。

### Azure Stack と Azure Stack

マルチリージョン と Recovery Service Vault が存在しない 1811 update 時点の Azure Stack には、Azure Stack 同士でデータを複製する機能がありません。

ただし、データを複製できないわけではありません。Azure Stack に機能がないなら、バックアップと同様、OS 以上の仕組みでデータを複製すればいいわけです。Ignite 2018 では、BC/DR 担当の Hector 氏によって、現時点の Azure Stack における BC/DR の実装に関するセッションが行われました。セッションの後半で。Azure Stack 同士でデータを複製する際のアーキテクチャが取り上げられています。これが 1811 update における現状です。正直しんどい。マルチリージョンのサポートを皮切りに、BC/DR の部分についても Azure との一貫性が保たれることを願います。

参考:[BRK3335 - Understanding architectural patterns and practices for business continuity andisaster recovery on Microsoft Azure Stack](https://azure.microsoft.com/en-us/resources/videos/ignite-2018-understanding-architectural-patterns-and-practices-for-business-continuity-and-disaster-recovery-on-microsoft-azure-stack/)

##　まとめ

本日のエントリでは、利用者向けのバックアップをまとめました。利用者向けパックアップの部分は、Azure と一貫性がありません。残念です。早く Azure IaaS VM Backup が来てほしいです。
d

---
title: Nework Security GroupでAzure Backupを制御する
author: kongou_ae
date: 2018-10-09
url: /archives/2018-10-09-control-azure-backup-by-nsg
categories:
  - azure
---

自分用のメモ。結論から言うと、Network Security Group 単体では Azure Backup をいい感じに制御できません。制御できる/できないの組み合わせは次の通りです。必要最低限に通信を絞りたい場合は、Proxy サーバに判断をゆだねるか、FQDN ベースで制御できるソリューションを組み合わせましょう。何事も多層防御。

|やりたいこと|NSGでいい感じに制御できるか|
|-----------|----------------|
|Azure IaaS VM Backup | できる |
|Azure IaaS VM Backup から VM または Disk をリストア| NSG 無関係 |
|Azure IaaS VM Backup からファイルをリストア | できない |
|Azure File and Folder Backup | できない |

## Azure IaaS VM Backup

### バックアップの取得

Azure IaaS VM Backup のネットワーク要件は [Establish network connectivity](https://docs.microsoft.com/en-us/azure/backup/backup-azure-arm-vms-prepare#establish-network-connectivity) に記載されています。

Azure IaaS VM Backup の 場合、Virtual Machine にインストールされているエージェントが Azure Storage に対してスナップショットの取得を指示します。バックアップのデータは、Azure インフラストラクチャ側で転送されます。Virtual Machine のNICを利用しません。この通信をNSGで制御する方法は次の2つです。

1. Recovery Service Vault がデプロイされているリージョンのサービスタグ「Storage.[geo-name]」宛てのTCP/443を許可する
1. 通信を Proxy 経由にして、プロキシサーバ宛てのTCP/443を許可する

次のように、送信がサービスタグ「Storage」のみ許可されている状態でも、Azure IaaS VM Backup は成功します。

{{<img src="./../../images/2018-1009-001.png">}}

ただし、サービスタグ「Storage」は自分が利用している Azure Storage だけでなく他人が利用している Azure Storage のIPアドレスも許可されます。この条件が許容できない場合は、Proxy 経由にしたうえ Proxy に判断を任せましょう。

### バックアップからのリストア

Azure IaaS VM Backup から Virtual Machine または Disk をリストアする通信はAzure インフラストラクチャ内で完結します。Backup を取得している Virtual Machine に適用されている NSG は無関係です。

ただし、Azure IaaS VM Backup からファイルを復元する方法（[Recover files from Azure virtual machine backup](https://docs.microsoft.com/ja-jp/azure/backup/backup-azure-restore-files-from-vm)）はVirtual Machine の NSG が関係します。サービスタグ「Storage.[geo-name]」宛てのTCP/443だけだと、ファイルの復元を利用できません。要注意です。

ファイルを復元するために必要な通信要件は次の2つです。これらが両方ともNSGでいい感じに制御できません。NSGで許可しようとすると、不要な通信も許可されてしまいます。

- download.microsoft.com へのTCP/443
    - download.microsoft.com は Akamai から配信されているため、IPアドレスベースのNSGで制御することが困難
    - NSGで許可するならばサービスタグ「Internet」（グローバルIPアドレス全部）を使わざるを得ない。リストアのためだけにサービスタグ「Internet」を許可するのはやりすぎ
- pod01-rec2.[geo-name].backup.windowsazure.com へのTCP/3260
    - サービスタグ「Storage.[geo-name]」に含まれていない
    - サービスタグ「AzureCloud.[geo-name]」に対してポートを絞るのが限界

必要な通信要件を満たせない状態で Azure IaaS VM Backup からファイルを取り出したければ、Backup から Disk 単位でリストアした後に Virtual Machine に Disk をマウントしたうえでファイルを取り出しましょう。

## Azure File and Folder Backup

Azure File and Folder Backup のネットワーク要件は [Network and Connectivity Requirements](https://docs.microsoft.com/ja-jp/azure/backup/backup-configure-vault#network-and-connectivity-requirements) に記載されています。具体的には Virtual Machine が次の5つの FQDN にアクセスできる必要があります。

- www.msftncsi.com
- *.Microsoft.com
- *.WindowsAzure.com
- *.microsoftonline.com
- *.windows.net

Azure File and Folder Backup の場合、Virtual Machine にインストールする Microsoft Azure Recovery Service (MARS) agent がバックアップのデータを Azure Storage に送信します。NSGでの制御に挑戦した結果、以下のルールが必要でした。3つ目のルールが不要な通信を許可しすぎな気がします。

- Recovery Service Vault がデプロイされているリージョンのサービスタグ「Storage.[geo-name]」宛てのTCP/443
- サービスタグ「AzureActiveDirectory」へのTCP/443
- Recovery Service Vault がデプロイされているリージョンのサービスタグ「AzureCloud.[geo-name]」宛てのTCP/443

そもそも、Microsoftのドキュメントにはサービスタグを利用した通信制御が記載されていません。そのためAzure File and Folder Backup については、NSG で制御するのではなく、Proxy や Azure Firewall などのFQDNベースのソリューションで制御するのがよいでしょう。

## まとめ

Azure Backup の通信を NSG で制御する手法をまとめました。サービスとして提供されているバックアップ手法を使っているにも関わらず、綺麗に許可できないのが不思議です。Microsoft が NSG のサービスタグに「Backup.[geo-name]」を追加してくれることを願っています。

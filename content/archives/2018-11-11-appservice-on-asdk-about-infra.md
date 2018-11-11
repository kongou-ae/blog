---
title: App Service on Azure Stack （ファイルサーバとSQLサーバの用意編）
author: kongou_ae
date: 2018-11-11
url: /archives/2018-11-11-appservice-on-asdk-about-infra
categories:
  - azurestack
---

## はじめに

前回のエントリでは、App Service Resource Provider をインストールするための前提条件であるサーバ証明書とサービスプリンシパルを作成しました。

参考：[App Service on Azure Stack（サーバ証明書編）](https://aimless.jp/blog/archives/2018-11-05-appservice-on-asdk-about-cert/)

今回のエントリでは、もう1つの前提条件であるファイルサーバと SQL サーバを用意します

## 環境

Azure Stack Development Kit 1.1809.0.90 in [物理コンテナDC](https://thinkit.co.jp/article/13243)

## ファイルサーバと SQL サーバを作る

App Service Resource Provider が動作するためにはファイルサーバと SQL サーバが必要です。これらのサーバを手作業で構築する方法もありますが、今回は公式の ARM テンプレート（[appservice-fileserver-sqlserver-ha](https://github.com/Azure/AzureStack-QuickStart-Templates/tree/master/appservice-fileserver-sqlserver-ha)）を利用します。このテンプレートを使うと、次のインフラを簡単に構築できます。ありがたい。

* 仮想ネットワーク
  * 次の Domain Controller が DNS として設定されているため、各 Virtual Machine はホスト名で名前を解決できます
* Domain Controller
* S2Dとフェイルオーバークラスタで冗長化されたファイルサーバ
* Always on Avaivalility Group で冗長化された SQL サーバ
  * Always on Avaivalility Group に必要となる LoadBalancer も同時に作成されます

### テンプレートを使う

ファイルサーバと SQL サーバは App Service Resource Provider の前提条件です。そのため、Azure Stack Operator が 管理者用のリソースとしてデプロイする必要があります。具体的にはAdmin portal上で各種作業を行います。

Azure Stack 上でテンプレートを使う場合は、Azure と同じように Template deployment を利用します。Azure Stack 上の Template deployment は、GitHub 上の [AzureStack-QuickStart-Templates](https://github.com/Azure/AzureStack-QuickStart-Templates) に保存されているテンプレートを参照しています。今回は、App Service 用のファイルサーバと SQL サーバを冗長構成で作るためのテンプレートである、appservice-fileserver-sqlserver-ha のテンプレートを利用します。

{{<img src="./../../images/2018-1111-001.png">}}

必要なパラメータを入力してデプロイします。初期状態で入力が必須なパラメータは Virtual Machine や SQL サーバなどのパスワードです。

{{<img src="./../../images/2018-1111-002.png">}}

今回の環境だと、約1時間ほどでデプロイが終わりました。Template deployment の Output には、App Service Resource Provider のインストールに利用するパラメータが表示されます。メモしておきましょう。

{{<img src="./../../images/2018-1111-003.png">}}

### Domain Controller の構成

テンプレートを使うと、２台の Domain Controller が構築されます。OS は Windows Server 2016 Datacenter Server Core です。GUI は使えません。
　
```Powershell
Domain                     : appsvc.local
Forest                     : appsvc.local
HostName                   : aps-ad-0.appsvc.local
IPv4Address                : 10.0.0.100
Name                       : APS-AD-0

Domain                     : appsvc.local
Forest                     : appsvc.local
HostName                   : aps-ad-1.appsvc.local
IPv4Address                : 10.0.0.101
Name                       : APS-AD-1
```

この Domain Controller は、テンプレートでデプロイされる VNet の DNS サーバに設定されます。そのうえで、ファイルサーバ用の VM とSQL サーバ用の VM がこのドメインに参加します。

```Powershell
DNSHostName       : aps-ad-0.appsvc.local
Name              : APS-AD-0
ObjectClass       : computer

DNSHostName       : aps-ad-1.appsvc.local
Name              : APS-AD-1
ObjectClass       : computer

DNSHostName       : aps-s2d-1.appsvc.local
Name              : APS-S2D-1
ObjectClass       : computer

DNSHostName       : aps-s2d-0.appsvc.local
Name              : APS-S2D-0
ObjectClass       : computer

DNSHostName       : aps-s2d-c.appsvc.local
Name              : aps-s2d-c
ObjectClass       : computer

DNSHostName       : fs01.appsvc.local
Name              : fs01
ObjectClass       : computer

DNSHostName       : aps-sql-0.appsvc.local
Name              : APS-SQL-0
ObjectClass       : computer

DNSHostName       : aps-sql-1.appsvc.local
Name              : APS-SQL-1
ObjectClass       : computer

DNSHostName       : aodns-fc.appsvc.local
Name              : aodns-fc
ObjectClass       : computer

DNSHostName       : aon-listener-lensqlhademo.appsvc.local
Name              : aon-listener-le
ObjectClass       : computer
```

### ファイルサーバ

テンプレートを使うと、aps-s2d-0 と aps-s2d-1 の2台が、Failover Cluster と S2D を使って冗長化されます。OS は、Windows Server 2016 Datacenter Server Core です。

```powershell
[APS-S2D-0]: PS C:\Users\appsvcadmin\Documents> Get-StorageNode

Name                   Manufacturer          Model           SerialNumber                     OperationalStatus
----                   ------------          -----           ------------                     -----------------
aps-s2d-0.appsvc.local Microsoft Corporation Virtual Machine 8412-1516-8385-7782-5356-3610-85 Up
aps-s2d-0.appsvc.local Microsoft Corporation Virtual Machine 8412-1516-8385-7782-5356-3610-85 Up
aps-s2d-1.appsvc.local Microsoft Corporation Virtual Machine 5132-3330-0161-5870-4199-9090-66 Up

[APS-S2D-0]: PS C:\Users\appsvcadmin\Documents> Get-ClusterSharedVolume | fl *

Id               : 7275ed00-70a7-46d4-a038-78383d63110a
Name             : Cluster Virtual Disk (VDisk01)
OwnerNode        : aps-s2d-1
SharedVolumeInfo : {C:\ClusterStorage\Volume1}
State            : Online

[APS-S2D-0]: PS C:\Users\appsvcadmin\Documents> get-volume

DriveLetter FileSystemLabel   FileSystem DriveType HealthStatus OperationalStatus SizeRemaining    Size
----------- ---------------   ---------- --------- ------------ ----------------- -------------    ----
E                                        CD-ROM    Healthy      Unknown                     0 B     0 B
A                                        Removable Healthy      Unknown                     0 B     0 B
D           Temporary Storage NTFS       Fixed     Healthy      OK                      12.2 GB   14 GB
C                             NTFS       Fixed     Healthy      OK                    113.51 GB  127 GB
            VDisk01           CSVFS      Fixed     Healthy      OK                      1.98 TB 1.99 TB

[APS-S2D-0]: PS C:\Users\appsvcadmin\Documents> get-virtualdisk

FriendlyName ResiliencySettingName OperationalStatus HealthStatus IsManualAttach    Size
------------ --------------------- ----------------- ------------ --------------    ----
VDisk01      Mirror                OK                Healthy      True           1.99 TB

[APS-S2D-0]: PS C:\Users\appsvcadmin\Documents> Get-StoragePool -FriendlyName "S2D on aps-s2d-c" | Get-PhysicalDisk

FriendlyName      SerialNumber CanPool OperationalStatus HealthStatus Usage          Size
------------      ------------ ------- ----------------- ------------ -----          ----
Msft Virtual Disk              False   OK                Healthy      Auto-Select 1023 GB
Msft Virtual Disk              False   OK                Healthy      Auto-Select 1023 GB
Msft Virtual Disk              False   OK                Healthy      Auto-Select 1023 GB
Msft Virtual Disk              False   OK                Healthy      Auto-Select 1023 GB

[APS-S2D-0]: PS C:\Users\appsvcadmin\Documents> Get-Cluster

Name
----
aps-s2d-c

[APS-S2D-0]: PS C:\Users\appsvcadmin\Documents> Get-ClusterNode

Name                 ID    State
----                 --    -----
aps-s2d-0            1     Up
aps-s2d-1            2     Up
```

### SQL サーバ

テンプレートを使うと、aps-sql-0 と aps-sql-1 の2台が、Always On Availability Groups を使って冗長化されます。

```powershell
[APS-sql-1]: PS C:\Users\appsvcadmin\Documents> Get-ClusterNode

Name                 ID    State
----                 --    -----
aps-sql-0            2     Up
aps-sql-1            1     Up

[APS-sql-1]: PS C:\Users\appsvcadmin\Documents> Get-Cluster

Name
----
aodns-fc

[APS-sql-1]: PS C:\Users\appsvcadmin\Documents> Get-ClusterResource

Name                      State  OwnerGroup    ResourceType
----                      -----  ----------    ------------
alwayson-ag               Online alwayson-ag   SQL Server Availability Group
aon-listener-lensqlhademo Online alwayson-ag   Network Name
Cloud Witness             Online Cluster Group Cloud Witness
Cluster IP Address        Online Cluster Group IP Address
Cluster Name              Online Cluster Group Network Name
IP Address 10.0.1.100     Online alwayson-ag   IP Address

PS C:\Users\appsvcadmin> Get-ChildItem SQLSERVER:\SQL\APS-SQL-0\DEFAULT\AvailabilityGroups

Name                 PrimaryReplicaServerName
----                 ------------------------
alwayson-ag          APS-SQL-0

PS SQLSERVER:\SQL\APS-SQL-0\DEFAULT\> get-item . | select ishadrenabled

IsHadrEnabled
-------------
         True

PS C:\Users\appsvcadmin> invoke-Sqlcmd -Query "select name, state_desc, port FROM sys.tcp_endpoints" -ServerInstance APS-sql-1

name                       state_desc port
----                       ---------- ----
Dedicated Admin Connection STARTED       0
TSQL Default TCP           STARTED       0
aodns-hadr                 STARTED    5022

PS C:\Users\appsvcadmin> invoke-Sqlcmd -Query "SELECT type_desc, port FROM sys.TCP_endpoints"

type_desc          port
---------          ----
TSQL                  0
TSQL                  0
DATABASE_MIRRORING 5022
```

## まとめ

本エントリーでは、App Service on Azure Stack の前提条件であるファイルサーバと SQL サーバを構築しました。Microsoft が ARM テンプレートを用意してくれているおかげで、ファイルサーバと SQL サーバのデプロイは簡単でした。ただし、Azure Stack Operator はこれらのサーバ群を運用管理しなければなりません。Azure Stack の IaaS は Windows Server 部分を高度に隠蔽しています。しかし、PaaS になったとたんに Windows Server が前面で登場します。運用管理が正直しんどいですね。

前回のエントリと本エントリで前提条件の準備が整いました。App Service on Azure Stack のキモである App Service Resourece Provider のインストールに進みます。

---
title: Azure Stack のディスクの状態を PowerShell で取得する
author: kongou_ae
date: 2019-01-14
url: /archives/2019-01-14-Get-the-disk-status-of-azurestack-by-powershell
categories:
  - azurestack
---


## はじめに

本エントリーでは、PowerShell for AzureStack 1.6.0 で実装された、Azure Stack のストレージの状態を取得するコマンドをまとめます。

- Get-AzsVolume
- Get-AzsDrive

## 1811 Update よりも古い Azure Stack の場合

1811 Update 未満の Azure Stack は、API を利用して物理ディスクと仮想ディスクの状態を取得できません。物理ディスクの状態を取得するためには OEM ベンダの管理ツールを利用する必要があります。また、S2D によって構成された Storage Pool に配置される仮想ディスクの状態を取得するためには Privileged Endpoint を利用する必要があます。

この仕組みにはイマイチな点があります。それは、ディスクの交換という一般的なオペレーションを行うために、Priviledge Endpoint を利用しなければならないということです。Privileged Endpoint には以下の特徴があります。そのため、限られた人が限られた作業で Privileged Endpoint を使う運用が理想的です。

- ローカル認証のため、作業員の分のアカウントを用意しなければならない
- ロールベースのアクセスコントロールができないため、すべてのユーザがAzure Stack を起動・停止できる

にも関わらず、仮想ディスクの状態を確認する術が Privileged Endpoint にのみ実装されているため、ディスクの交換という一般的なオペレーションのために Privileged Endpoint を利用しなければなりません。イマイチ。

## 1811 Update 以降 の Azure Stack の場合

1811 Update からサポートされる PowerShell for AzureStack 1.6.0 では、次のコマンドが増えました。これらのコマンドを利用することで、これまでは取得できなかったディスクの状態を PowerShell で取得できます。

- Get-AzsVolume
- Get-AzsDrive

### Get-AzsVolume 

"Get-AzsVolume"は仮想ディスクの状態を取得する cmdlet です。Privileged Endpoint で仮想ディスクの状態を取得する"get-virtualdisk -cimsession s-cluster"と同様の情報を取得できます。

```powershell
$sss = Get-AzsStorageSubSystem -ScaleUnit s-cluster -Location local
$volume = Get-AzsVolume -StorageSubSystem $sss.Name -ScaleUnit s-cluster
$volume

TotalCapacityGB     : 10085
RemainingCapacityGB : 8950
HealthStatus        : Healthy
OperationalStatus   : OK
RepairStatus        : 
Description         : 
Action              : 
VolumeLabel         : SU1_Volume
Id                  : /subscriptions/2bfed73a-c447-42a4-aa2f-3368072bdc03/resourceGroups/System.local/providers/Microsoft.Fabric.Admi
                      n/fabricLocations/local/scaleUnits/s-cluster/storageSubSystems/s-cluster.azurestack.local/volumes/343096BFD0F23
                      5409FEE875E1B7478CE
Name                : local/s-cluster/s-cluster.azurestack.local/343096BFD0F235409FEE875E1B7478CE
Type                : Microsoft.Fabric.Admin/fabricLocations/scaleUnits/storageSubSystems/volumes
Location            : local
Tags                : {}
```

```powershell
[azs-ercs01]: PS> get-virtualdisk -cimsession s-cluster

FriendlyName ResiliencySettingName OperationalStatus HealthStatus IsManualAttach    Size PSComputerName
------------ --------------------- ----------------- ------------ --------------    ---- --------------
SU1_Volume   Simple                OK                Healthy      True           9.85 TB s-cluster     
```

"RepairStatus"というプロパティがあるので、ディスク交換後に仮想ディスクの修復が終わったかどうかも確認できそうです（未確認）。このコマンドを利用すれば、ディスクの交換のために Privileged Endpoint を利用しなくてもよさそうです。

### Get-AzsDrive

S2D によって仮想化された Storage Pool に属する物理ディスクの状態を取得する cmdlet です。取得できた値から見るに、"Get-PhysicalDisk"のラッパーのように見えます。

```powershell
$drives = Get-azsDrive -StorageSubSystem $sss.Name -ScaleUnit s-cluster
$drives | Select-Object StorageNode,SerialNumber,HealthStatus,OperationalStatus,PhysicalLocation,MediaType,CapacityGB | ft -AutoSize
$drives[0]

StorageNode           SerialNumber                   HealthStatus OperationalStatus PhysicalLocation                MediaType Capacit
                                                                                                                                  yGB
-----------           ------------                   ------------ ----------------- ----------------                --------- -------
local/WIN-HVCJPA2TVH4 WD-WCC4xxxxxxxx                Healthy      OK                Integrated : Adapter 0 : Port 2 HDD          3726
local/WIN-HVCJPA2TVH4 WD-WCC4xxxxxxxx                Healthy      OK                Integrated : Adapter 1 : Port 0 HDD          3726
local/WIN-HVCJPA2TVH4 WD-WCC4xxxxxxxx                Healthy      OK                Integrated : Adapter 0 : Port 3 HDD          3726
local/WIN-HVCJPA2TVH4 CVFT420400xxxxxxxx  _00000001. Healthy      OK                PCI Slot 7 : Adapter 2          SSD           745


StorageNode       : local/WIN-HVCJPA2TVH4
SerialNumber      : WD-WCC4xxxxxxxx
HealthStatus      : Healthy
OperationalStatus : OK
Usage             : Auto-Select
CanPool           : False
CannotPoolReason  : In a Pool
PhysicalLocation  : Integrated : Adapter 0 : Port 2
Model             : WDC WDxxxxxx-xxxxxxx
MediaType         : HDD
CapacityGB        : 3726
Description       : 
Action            : 
Id                : /subscriptions/2bfed73a-c447-42a4-aa2f-3368072bdc03/resourceGroups/System.local/providers/Microsoft.Fabric.Admin/
                    fabricLocations/local/scaleUnits/s-cluster/storageSubSystems/s-cluster.azurestack.local/drives/15dfce89-0731-3906
                    -7b53-9804540dad76
Name              : local/s-cluster/s-cluster.azurestack.local/15dfce89-0731-3906-7b53-9804540dad76
Type              : Microsoft.Fabric.Admin/fabricLocations/scaleUnits/storageSubSystems/drives
Location          : local
Tags              : {}
```

## おわりに

Get-AzsVolume と Get-AzsDrive の登場によって、Priviledge Endpoint を利用する機会が減りそうです。このまま、Azure Stack の運用に関する一般的な作業が API 経由で実現できるようになってくれると嬉しいです。私は Azure Stack に関する一般的な操作はAPIで実現されるべきだと考えています。なぜならば、APIによる操作は、RBACによる権限制御やActivity Logによる監査、自動化などを通じて、Azure Stack Operator に利便性を提供してくれるからです。作業に応じて APIとPriviledge Endpoint、OEMベンダの管理ツールを使い分けるのはちょっとしんどいです。残す大物はログ取得です。早くAPI経由でログがとれるようになって！

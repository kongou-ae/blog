---
title: Collecting the status of Azure Stack's storage by PowerShell
author: kongou_ae
date: 2019-01-16
url: /archives/2019-01-16-collecting-the-disk-status-of-azurestack-by-powershell-en
categories:
  - azurestack
---

## Introduction

This article explains the following commands. 

- Get-AzsVolume
- Get-AzsDrive

These commands was impremented on PowerShell for AzureStack 1.6.0 and can collect the status of Azure stack's storage.

## The case of Azure Stack before 1811 Update

Azure Stack before 1811 don’t have the capability to collect the status of own physical disk and virtual disk by API. Azure Stack Operator have to use OEM’s management tool to collect the status of own physical disk. And Azure Stack Operator have to use Privileged Endpoint to collect the status of own virtual disk which is on storage pool created by S2D.

I think that these implements is not good for operation and security. Because it is nessesary to use Privileged Endpoint for general operation such as replacing failed disk. Privileged Endpoint is weak point of Azure Stack by the following points.

- Azure Stack Operator have to create accounts for their operators which will replace failed disk. Because Privileged Endpoint use local authentication.
- Every person who have the account of Privileged Endpoint can stop and start Azure Stack. Because privilleged endpoint don’t have RBAC.

So it is ideal that limited user should be able to use privileged endpoint. But Azure Stack before 1811 requires to use Privileged Endpoint for replacing failed disk. This is not good.

## The case of Azure Stack after 1811

PowerShell for AzureStack 1.6.0 has the following commands. These commands can collect the status of Azure Stack's storage.

- Get-AzsVolume
- Get-AzsDrive

### Get-AzsVolume 

"Get-AzsVolume" is the cmdlet to collect the status of virtual disks. This command can collect the same information which "get-virtualdisk -cimsession s-cluster" on Priviledged Endpoint can collect.

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

The result of this cmdlet has the property as "RepairStatus". So I guess that Azure Stack Operator can collect the progress of repairing a virtual disk. If this cmdlet returns the progress of repairing a virutal disk, the operator who replaces failed disk don't use Privileged Endpoint. This is good.

### Get-AzsDrive

"Get-AzsDrive" is the cmdlet to collect the status of physical disks which is on a storage pool virtualized by S2D. I think this cmdlet is a wrapper of "Get-physicalDisk".

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

## Closing thoughts

I believe that "Get-AzureVolume" and "Get-AzsDrive" will make the oppotunity to use Privilaged Endpoint more rare. I hope that  Azure Stack Operator can operate every general tasks by API not Privileged Endpoint. 

I believe that Azure Stack should obtain a capability to perform every general operation by API. Because operation by API provides Azure Stack Operator with the following convenience.

- Access control with RBAC
- Audit with Activity log
- Automation by Infrastructure as code

One of the general operation which Azure Stack Operator cannot perform by API is collecting Get-AzureStackLog. I hope that Azure Stack will the capability to collect Get-AzureStackLog by API.

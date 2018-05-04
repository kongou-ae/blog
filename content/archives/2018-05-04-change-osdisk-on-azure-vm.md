---
title: Azure Virtual MachineのOS Diskを変更する
author: kongou_ae

date: 2018-05-04
url: /archives/2018-05-04-change-osdisk-on-azure-vm
categories:
  - azure
---

Managed DiskなVirtual MachineのOS Diskを変更できるようになったので試しました。[OS Disk Swap for Managed Virtual Machines now available](https://azure.microsoft.com/ja-jp/blog/os-disk-swap-managed-disks/)

## 環境

Windows 2016 DatacenterのVirtual Machineを2台用意します。Virtual MachineのOS DiskにはManaged Diskを利用します。

{{<img src="./../../images/2018-05-04-009.png">}}

OS Diskを入れ替えたことが分かりやすくなるように、2台のVirtual Machineの"C:\vmname.txt"にVM名を記入しておきます。

{{<img src="./../../images/2018-05-04-001.png">}}

{{<img src="./../../images/2018-05-04-002.png">}}

## 入れ替える

vm01のOS Diskを変更してみます。ポータルでは変更できないのでPowerShellで変更します。

変更後のOS Diskには、Virtual Machineに接続されていないManaged Diskのみ利用できます。vm01のOS Diskをvm02に接続されてるManaged Disk（vm02_OsDisk_1_7fe4c53366f84edf95409a26c3ce1221）に変更しようとすると、409 Conflictでエラーになります。

{{<img src="./../../images/2018-05-04-004.png">}}

そこで、Snapshotを利用してvm02のOS Diskから未使用のManaged Disk(vm02-osdisk-from-snapshot)を作成します。次のPowerShellのように、変更後のOS Diskに未使用のManaged Diskを指定すると、処理が正常に終了します。

```
$vm = Get-AzureRmVM -ResourceGroupName 0504 -Name vm01
$disk = Get-AzureRmDisk -ResourceGroupName 0504 -Name vm02-osdisk-from-snapshot
Set-AzureRmVMOSDisk -VM $vm -ManagedDiskId $disk.Id -Name $disk.Name 
Update-AzureRmVM -ResourceGroupName 0504 -VM $vm
```

Portal上でも、vm01のOS Diskを"vm02-osdisk-from-snapshot"に変更できたことを確認できます。

{{<img src="./../../images/2018-05-04-007.png">}}

## 動作確認

vm01のOS Diskをvm02のOS Disk由来の"vm02-osdisk-from-snapshot"に変更できました。OS Diskが変更されたので、vm01の"C:\vmname.txt"に記入されているVM名はvm02になっています。大成功。

{{<img src="./../../images/2018-05-04-008.png">}}

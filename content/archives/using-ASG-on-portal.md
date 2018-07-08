---
title: Azure PortalでApplication Security Groupを使う
author: kongou_ae
date: 2018-07-08
url: /archives/using-ASG-on-portal
categories:
  - azure
---

Ignite 2017で発表になるもPortalで使えなかったApplication Security Groupが、Portalで使えるようになっていました。軽く触ったのでメモ。

## Application Security Groupを定義する

All ServicesからApplication Security Groupを選択します。

{{<img src="./../../images/2018-0708-001.png">}}

名前とリソースグループ、ロケーションを選択してから"Review + Create"をクリックします。

{{<img src="./../../images/2018-0708-002.png">}}

Reviewの結果がOKであれば"Create"をクリックします。ちょっとめんどくさいUIです。

{{<img src="./../../images/2018-0708-003.png">}}

## Application Security Groupを関連付ける

Application Security Groupの設定画面では、Application Security GroupとVirtual Machinを関連付けできません。Virtual MachinのNetworking画面で関連付けを行います。

{{<img src="./../../images/2018-0708-004.png">}}

Virtual Machinには複数のApplication Security Groupを関連付けできます。

{{<img src="./../../images/2018-0708-005.png">}}

## Application Security Groupを利用する

Network Security Groupの設定でApplication Security Groupを利用できます。IP AddressやService TagのかわりにApplication Security Groupを選択する形です。

{{<img src="./../../images/2018-0708-006.png">}}

Network Security Groupのルールでは、Application Security GroupがApplication Security Groupのアイコン付きで表示されます。分かりやすい。

{{<img src="./../../images/2018-0708-007.png">}}

ただし、Effectiec Security Ruleを見ても、Application Security GroupはApplication Security Groupのままです。Network Security GroupがApplication Security GroupをどのIP Addressとして解釈しているのかを知る術はありません。

{{<img src="./../../images/2018-0708-008.png">}}

## Application Security GroupとVirtual Machinの関連付けを可視化する

上記のように、Application Security GroupをPortalで設定できるようになりました。ありがたい。

ただし、現時点で、Application Security GroupとVirtual Machinの関連付けをPortalで可視化する術がありません。Application Security Groupの設定画面では、Application Security GroupがどのVirtual Machinに関連付けられているかを確認できません。Network Security GroupのEffectiec Security RuleでもApplication Security GroupがどのIP Addressとして解釈されているのかを確認できません。不便です。

PowerShellでスクリプトを書けばApplication Security GroupとVirtual Machinの関連付けを可視化できます。Application Security Groupの設定画面でVirtual Machineとの関連付けを確認できるようになることを願っています。

```powershell
$AppSGs = Get-AzureRmApplicationSecurityGroup 
$Nics = Get-AzureRmNetworkInterface

$AppSGs | foreach {
    $AppSG = $_
    
    Write-Output ""
    Write-Output "-------------------------------------------------------------"
    Write-Output ($AppSG.Id -replace ".*\/applicationSecurityGroups\/","")
    Write-Output "-------------------------------------------------------------"

    $Nics | foreach {
        $Nic = $_

        $Nic.IpConfigurations | foreach {
            $Ipconfig = $_
            $Ipconfig.ApplicationSecurityGroups | foreach {
                $AttachedAppSg = $_
                if ( $AppSG.Id -eq $AttachedAppSg.Id ){
                    $Nic.VirtualMachine.Id -replace ".*\/virtualMachines\/",""
                }
            }
        }
    }
}

PS > .\app.ps1

-------------------------------------------------------------
develop
-------------------------------------------------------------
Sample

-------------------------------------------------------------
production
-------------------------------------------------------------
appsg01
Sample

-------------------------------------------------------------
webserver
-------------------------------------------------------------
Sample
```

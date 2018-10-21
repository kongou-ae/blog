---
title: Network Virtual Appliance on AzureStack
author: kongou_ae
date: 2018-10-21
url: /archives/2018-10-21-nva-on-azurestack
categories:
  - azurestack
---

## Azure Stack と Network Virtual Appliance

Azure Stack の Marketplace に、Network Virtual Appliance（NVA） が充実してきました。2018年10月現在、Azure Stack 上で製品を展開しているベンダと製品は次の通りです。

```powershell
PublisherDisplayName     DisplayName                                        Version        
--------------------     -----------                                        -------        
Arista Networks          Arista vEOS Router 4.21.0F (BYOL)                  4.21.0         
Barracuda Networks, Inc. Barracuda App Security Control Center - BYOL       2.1.100803     
Barracuda Networks, Inc. Barracuda CloudGen Firewall Control Center (BYOL)  7.2.205701     
Barracuda Networks, Inc. Barracuda CloudGen Firewall for Azure (BYOL)       7.2.205701     
Barracuda Networks, Inc. Barracuda Email Security Gateway - BYOL            7.1.100405     
Barracuda Networks, Inc. Barracuda Web Application Firewall (WAF) - BYOL    9.1.001502     
Check Point              Check Point vSEC R80.10 BYOL (IMAGE)               8010.90013.0226
Check Point              Check Point vSEC Security Management               1.0.0          
F5 Networks              F5 BIG-IP VE – ALL   (BYOL, 1 Boot Location)       13.1.100000    
F5 Networks              F5 BIG-IP VE – ALL   (BYOL, 1 Boot Location)       14.0.001000    
F5 Networks              F5 BIG-IP VE – ALL   (BYOL, 2 Boot Locations)      13.1.100000    
F5 Networks              F5 BIG-IP VE – ALL   (BYOL, 2 Boot Locations)      14.0.001000    
F5 Networks              F5 BIG-IP VE – LTM/DNS   (BYOL, 1 Boot Location)   13.1.100000    
F5 Networks              F5 BIG-IP VE – LTM/DNS   (BYOL, 1 Boot Location)   14.0.001000    
F5 Networks              F5 BIG-IP VE – LTM/DNS   (BYOL, 2 Boot Locations)  14.0.001000    
F5 Networks              F5 BIG-IP VE – LTM/DNS   (BYOL, 2 Boot Locations)  13.1.100000    
F5 Networks              F5 BIG-IP Virtual Edition - BEST - BYOL            13.1.100000    
F5 Networks              F5 BIG-IP Virtual Edition - BEST - BYOL            14.0.001000    
F5 Networks              F5 BIG-IP Virtual Edition - BETTER - BYOL          13.1.100000    
F5 Networks              F5 BIG-IP Virtual Edition - BETTER - BYOL          14.0.001000    
F5 Networks              F5 BIG-IP Virtual Edition - GOOD - BYOL            13.1.100000    
F5 Networks              F5 BIG-IP Virtual Edition - GOOD - BYOL            14.0.001000    
Fortinet                 Fortinet FortiGate-VM for Azure BYOL               6.0.2          
KEMP Technologies Inc    BYOL Load Balancer, ADC & WAF - Trial & Perpetual  7.2.430016425  
Palo Alto Networks, Inc. VM-Series Next-Generation Firewall (BYOL)          8.1.0          
Tata Communications      NetFoundry Azure Application Connection Gateway    2.4.1          
```

これらの NVA をデプロイするためには、Azure Stack Operator が Azure からこれらのアイテムをダウンロードして Azure Stack の Marketplace に登録する必要があります。

参考：[Download marketplace items from Azure to Azure Stack](https://docs.microsoft.com/en-us/azure/azure-stack/azure-stack-download-azure-marketplace-item)

ただし、実際にデプロイを試みた結果、自動的に登録されるアイテムに次の違いがあることがわかりました。

1. ダウンロードしたアイテムが Marketplace に表示される。つまりポータルから NVA をデプロイできる。
1. ダウンロードしたアイテムが Marketplace に表示されない。つまりポータルから NVA をデプロイできない

2018年10月現在、Fortinet と Palo Alto は ダウンロードしたアイテムが Marketplace に表示されません。これらの NVA をポータルからデプロイできるようにするには、以下の手順に従って、Azure Stack Operator がこれらのアイテムを Marketplace に登録しなければならないようです。知らなかった。ダウンロードした全てのアイテムがポータルからデプロイできるものとばかり、、、

参考：[Create and publish a Marketplace item](https://docs.microsoft.com/en-us/azure/azure-stack/azure-stack-create-and-publish-marketplace-item)

## PowerShell で Marketplace のアイテムをデプロイする

上記の手順はいつか試すとして、今回は Marketplace に登録されている FortiGateを PowerShell でデプロイしてみます。Azure Stack の ARM に接続した後であれば、Azure Stack 固有の特別な手順ははありません。Azure と同じようにスクリプトを書けばOKです。

```powershell
New-AzureRmResourceGroup -Name fgtest -Location local

$vnet = Get-AzureRmVirtualNetwork -Name fg -ResourceGroupName fgtest

$pip = New-AzureRmPublicIpAddress -ResourceGroupName fgtest -Location local `
  -Name "pip-fg" -AllocationMethod Static -IdleTimeoutInMinutes 4

$nic = New-AzureRmNetworkInterface -Name myNic -ResourceGroupName fgtest -Location local `
  -SubnetId $vnet.Subnets[0].Id -PublicIpAddressId $pip.Id

$securePassword = ConvertTo-SecureString 'YOURPASSWORD' -AsPlainText -Force
$cred = New-Object System.Management.Automation.PSCredential ("azureuser", $securePassword)

$vm = New-AzureRmVMConfig -VMName fortigate -VMSize Standard_D2_v2
Set-AzureRmVMOperatingSystem -VM $vm -Linux -ComputerName fortigate1019 -Credential $cred
Set-AzureRmVMSourceImage -VM $vm -PublisherName fortinet `
  -Offer fortinet_fortigate-vm_v5 -Skus fortinet_fg-vm -Version 6.0.2
Add-AzureRmVMNetworkInterface -VM $vm -Id $nic.Id

New-AzureRmVM -ResourceGroupName fgtest -Location local -VM $vm
```
Virtual Machine の Network Interface にアタッチされた Public IP Address にアクセスすると FortiGate の GUI が表示されました。デプロイは成功したようです。ただし、BYOL 版なのでライセンスの入力画面になってしまい、その先には進めません。

{{<img src="./../../images/2018-10-21-001.png">}}

## まとめ

NVA の対応状況と、PowerShell を使った NVA のデプロイをまとめました。色々な NVA が Azure Stack に対応してくれるのは良いことです。

ただし、現時点での NVA のライセンスは、BYOL のみをサポートしています。ライセンス料金が従量課金になる PAYG がありません。したがって、実際に Azure Stack 上で NVA を使うためには、代理店からライセンスを調達しなければなりません。気軽に試せる、早く利用できるというクラウド目線だと、Azure Stack にも Azure と同じように ライセンスが PAYG な NVA が来てほしいです。


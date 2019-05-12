---
title: Azure Stack に Windows Server 2019 のイメージを追加する
author: kongou_ae
date: 2019-05-12
url: /archives/2019/05/add-win-2019-image-to-azurestack
categories:
  - azurestack
---

## はじめに

以前のエントリでは、Azure Image Builder を利用して Azure Marketplace に登録されている Windows Server 2019 のイメージを VHD ファイルに変換しました。

参考：[Azure Image Builder を利用して、マーケットプレイスのイメージを VHD に変換する](https://aimless.jp/blog/archives/2019/05/convert-marketplace-image-to-vhd/)

このエントリーでは、作成した Windows Server 2019 の VHD ファイルを Azure Stack に登録することで、利用者が Azure Stack 上で Windows Server 2019 を利用できるようにします。

## 環境

ASDK 1904 @[物理コンテナ](https://thinkit.co.jp/article/13243)

## VHD ファイルの配置

Azure Stack に VHD をイメージとして登録するためには、VHD ファイルを Azure Stack が認証なしでアクセスできる Blob ストレージに配置する必要があります。Azure Stack からアクセス可能であれば、Blob ストレージは Azure と Azure Stack のどちらでも構いません。

Azure の Storage Account と Azure Stack の Storage Account 間でのファイルの転送には、Storage Explorer が便利です。Storage Explorer は Azure Stack をサポートしていまｓので、Azure と Azure Stack 間で GUI でファイルをコピペできます。

参考：[Connect storage explorer to an Azure Stack subscription or a storage account](https://docs.microsoft.com/en-us/azure-stack/user/azure-stack-storage-connect-se)

VHD ファイルを Storage Account のコンテナに保存したら、コンテナのアクセスポリシーを第三者からの読み取りを許可する "Blob" に変更します。

## イメージの追加

Blob Storage に VHD ファイルを配置したら、Azure Stack を操作して VHD ファイルをイメージとして追加します。Admin Portal の Compute > VM Image > Add を選択して登録画面に移動します。

{{< figure src="/images/2019-05-12-001.png" title="イメージの登録画面" >}}

入力が必須な値は次の通りです。

- Publisher
- Offer
- OS type
- SKU
- Version
- OS disk blob URI

必要事項を入力して "Create" を押すとイメージの作成が始まります。"Status" が "Succeeded" になれば OK です。Azure Stack が VHD ファイルにアクセスできない場合は、イメージの作成に失敗して "Status" が "Failed" になります。 

{{< figure src="/images/2019-05-12-002.png" title="イメージのステータス" >}}

なお、必須項目には任意の値を入れられますので、例えば "aimless" という適当な Publisher を設定しても Get-AzureVMImage で選択できるようになります。

```powershell
PS > Get-AzureRmVMImage -PublisherName aimless -Offer 2019 -Skus 2019-small-0512 -Location uda

Version FilterExpression Skus            Offer PublisherName Location Id                                                             
------- ---------------- ----            ----- ------------- -------- --                                                             
1.0.0                    2019-small-0512 2019  aimless       uda      /Subscriptions/2ca9cea2-0832-4865-a4d4-c98caef5ad20/Provider...
```

## 実際に VM を作る

### 手順

上記の手順でイメージを登録しても、登録したイメージはマーケットプレイスには表示されません。マーケットプレイスに表示されるには、マーケットプレイスのアイテムとして登録する手順が別途必要です。

ただし、イメージ自体は Azure Stack に登録されているので、PowerShell を利用すれば Virtual Machine を作成できます。サンプルコードは次の通りです。Azure と全く同じです。Get-AzureRmVMImage の引数に、イメージを登録した際に入力した値を利用するところがポイントです。

```powershell
$rg = New-AzureRmResourceGroup -Name 2019 -Location uda
$images = Get-AzureRmVMImage -Location uda -PublisherName MicrosoftWindowsServer `
    -Offer WindowsServer -Skus 2019-Datacenter-smalldisk -Version 2019.0.20190410

$net = New-AzureRmVirtualNetwork -Name 2019 -ResourceGroupName 2019 -Location uda -AddressPrefix 192.168.1.0/24

Add-AzureRmVirtualNetworkSubnetConfig -Name vm -AddressPrefix 192.168.1.0/26 -VirtualNetwork $net
Set-AzureRmVirtualNetworkSubnetConfig -Name vm -AddressPrefix 192.168.1.0/26 -VirtualNetwork $net
$net = Set-AzureRmVirtualNetwork -VirtualNetwork $net

$nic = New-AzureRmNetworkInterface -Name 2019 -ResourceGroupName $rg.ResourceGroupName -Location uda `
    -SubnetId $net.Subnets[0].Id

$cred = Get-Credential -UserName aimless -Message password
$Vm = New-AzureRmVMConfig -VMName 2019 -VMSize Standard_A1
$vm | Set-AzureRmVMSourceImage -PublisherName $images.PublisherName -Offer $images.Offer -Skus $images.Skus -Version $images.Version
Add-AzureRmVMNetworkInterface -VM $VM -Id $nic.Id
Set-AzureRmVMOperatingSystem -VM $vm -Windows -ComputerName win2019 -Credential $cred

New-azurermvm -VM $vm -ResourceGroupName $rg.ResourceGroupName -Location uda
```

### ライセンス認証

ただし、構築できた Virtual Machine はライセンス認証に失敗します。これは、Azure 上の Windows Server が Azure 上の KMS でライセンス認証を行うためです。Azure Stack は KMS ではなく AVMA によってライセンス認証を行います。そのため、次のリンク先に記載されている通りライセンスの認証方式を KMS から AVMA に切り替える必要があります。

参考：[My VM is not set up to use AVMA, how can I fix it?](https://docs.microsoft.com/en-us/azure-stack/operator/azure-stack-windows-server-faq#my-vm-is-not-set-up-to-use-avma-how-can-i-fix-it)

ただし、Windows Server 2019 の場合は、ライセンスの認証を AVMA に切り替えてもライセンスの認証に失敗します。ASDK のホスト OS 自体のライセンス認証が失敗しているためです。そして、おそらく統合システムでもライセンス認証は失敗します。なぜならば、Windows Server 2019 の仮想マシンを AVMA でライセンス認証するためには、ホスト OS のバージョンも Windows Server 2019 でなければならないからです。2019年5月現在、Azure Stack のホストOS は Windows Server 2016 のはずです。

したがって、現時点で Windows Server 2019 のライセンス認証を突破するには、自分の所有するライセンスキーを利用するしかなさそうです。自分のライセンスキーを利用する場合、Virtual Machine を BYOL に切り替えるのを忘れないようにしましょう。切り替えないと、対象の仮想マシンが PAYG な Windows Server と判断されて Windows のライセンス込みの料金を請求されてしまいます。

- [What if I have an older image and my user forgot to check the "I have a license" box, or we use our own images and we do have Enterprise Agreement entitlement?](https://docs.microsoft.com/en-us/azure-stack/operator/azure-stack-windows-server-faq#what-if-i-have-an-older-image-and-my-user-forgot-to-check-the-i-have-a-license-box-or-we-use-our-own-images-and-we-do-have-enterprise-agreement-entitlement)
- [Convert an existing VM using Azure Hybrid Benefit for Windows Server
](https://docs.microsoft.com/en-us/azure/virtual-machines/windows/hybrid-use-benefit-licensing#convert-an-existing-vm-using-azure-hybrid-benefit-for-windows-server)

## 終わりに

2回のエントリを通じて、Azure 上のイメージを Azure Stack で利用できるようにする方法を説明しました。私のように VHD ファイルを作るための Hyper-V 環境がない人にとってはお手軽な手順だと思います。

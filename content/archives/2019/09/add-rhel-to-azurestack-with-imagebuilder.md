---
title: Azure Image Builder を使って Azure Stack に Red Hat Enterprise Linux を追加する
author: kongou_ae
date: 2019-09-08
url: /archives/2019/09/add-rhel-to-azurestack-with-imagebuilder
categories:
  - azurestack
---

## はじめに

Microsoft と Redhat は Red Hat Enterprise Linux 7.1 以降を Azure Stack 上で動作させることをサポートしています。

- https://access.redhat.com/articles/3413531
- https://docs.microsoft.com/ja-jp/azure-stack/operator/azure-stack-supported-os#linux

ただし、2019年9月現在の Azure Stack Marketplace には Red Hat Enterprise Linux のイメージが存在しません。Azure Stack Operator が自分でイメージを作成して Azure Stack に登録する必要があります。

- https://docs.microsoft.com/ja-jp/azure-stack/operator/azure-stack-redhat-create-upload-vhd

上記の手順は、Redhat のサイトから ISO をダウンロードして仮想マシンを起動して、Azure Stack に適した設定に変更した VHD ファイルを用意するものです。正直めんどくさい。

そこで本エントリでは、Azure に登録されている Red Hat Enterprise Linux のイメージを Azure Image Builder で VHD としてエクスポートしたうえで Azure Stack に登録します。なぜならば、自分で作ったイメージよりも、Azure 上で動いているイメージの方が信頼できるからです。

## 環境

ASDK 1906 @[物理コンテナ](https://thinkit.co.jp/article/13243)

## Azure Image Builder 側の作業

Image Builder の手順は次の通りです。

https://docs.microsoft.com/ja-jp/azure/virtual-machines/linux/image-builder

テンプレートは次を利用します。

```json
{
    "type": "Microsoft.VirtualMachineImages/imageTemplates",
    "apiVersion": "2019-05-01-preview",
    "location": "WestUS2",
    "dependsOn": [],
    "tags": {
    },
    "properties": {
        "buildTimeoutInMinutes" : 80,
        "source": {
            "type": "PlatformImage",
                "publisher": "redhat",
                "offer": "RHEL",
                "sku": "8",
                "version": "8.0.20190620"
        },
        "customize": [
        ],
        "distribute":[
            { 
                "type": "VHD",
                "runOutputName": "rhel-byos-lvm8-20190620",
                "tags": {}
            }
        ]
    }
}
```

BYOL 版のイメージを利用すると次のようなエラーが発生するため、PYAG 版のイメージを利用しました。

```
Deployment failed. Correlation ID: 7f91b6c7-0eaa-45bb-af79-fe147844c3ae. Build (Azure PIR Image) step failed: VM Image (Location: westus2, Publisher: RedHat, Offer: rhel-byos, Sku: rhel-raw76, Version: 7.6.20190307) has a Purchase Plan in place
```

## Azure Stack 側の作業

### VDH をストレージアカウントに配置する

Azure Image Builder が作成した VHD ファイルをストレージアカウントに配置します。作成した VHD ファイルを Azure Stack がダウンロードするため、コンテナのアクセスレベルを「Blob」に、ファイルタイプを「Page blob」するのを忘れないようにしましょう。

### VHD をイメージとして取り込む

Dashboard > Compute - VM images > Add a VM image から、ストレージアカウントに保存した VHD を Azure Stack のイメージとして取り込みます。

{{< figure src="/images/2019-09-08-001.png" title="イメージの登録画面" >}}

登録が完了すると、登録した内容が Get-AzureRmVMImage に表示されるようになります。

```
PS C:\Users\AzureStackAdmin> Get-AzureRmVMImage -Location local -PublisherName aimless `
    -Offer rhel8 -Skus rhel8 -Version 1.0.0


Id               : /Subscriptions/96b718e6-ab2f-418a-a34a-ea4b52f7366a/Providers/Microsoft.Compute/Locations/local/Publishers/aimless/ArtifactTypes/VMImage/Offe
                   rs/rhel8/Skus/rhel8/Versions/1.0.0
Location         : local
PublisherName    : aimless
Offer            : rhel8
Skus             : rhel8
Version          : 1.0.0
FilterExpression : 
Name             : 1.0.0
OSDiskImage      : {
                     "operatingSystem": "Linux"
                   }
PurchasePlan     : null
DataDiskImages   : []
```

### イメージを使って仮想マシンを作る

Azure 上のイメージを Azure Stack に登録できました。ただし、あくまでもイメージとして登録しただけマーケットプレイスのアイテムとしては登録していないので、テナントのポータルには Red Hat Enterprise Linux が表示されません。

登録したイメージを利用する場合は、PowerShell や テンプレートを利用して仮想マシンを作成する必要があります。イメージを利用するPowerShell のサンプルコードは次の通りです。

```powershell
$images = Get-AzureRmVMImage -Location local -PublisherName aimless `
    -Offer rhel8 -Skus rhel8 -Version 1.0.0 
$Vm = New-AzureRmVMConfig -VMName rhel8 -VMSize Standard_A1
$vm | Set-AzureRmVMSourceImage -PublisherName $images.PublisherName -Offer $images.Offer -Skus $images.Skus -Version $images.Version
```

## OS 側の作業

起動した仮想マシンは、サブスクリプションがアタッチされておらず yum ができない Red Hat Enterprise Linux です。Azure Stack 上で動作するためにはOS側でも作業が必要です。

### サブスクリプションの有効化

有効なサブスクリプションを用意した状態で、次の作業を実施します。

https://access.redhat.com/documentation/ja-jp/red_hat_enterprise_linux/6/html/deployment_guide/registering-machine-ui

サブスクリプションを有効化できた仮想マシンは Red hat のカスタマーポータルに「仮想システム - Microsoft Azure」として登録されました。

### Azure 用 Red Hat Update Infrastructure の削除

Azure 上の Red Hat Enterprise Linux は Azure 上に存在する Red Hat Update Infrastructure(RHUI) からパッケージをダウンロードするように設定されています。

https://docs.microsoft.com/ja-jp/azure/virtual-machines/linux/update-infrastructure-redhat

Azure 上の RHUI には Azure 上のグローバル IP アドレスからのみアクセスできます。オンプレミスの Azure Stack で動作する仮想マシンは Azure 上の RHUI ににアクセスできません。

```
[rhui-rhel-8-for-x86_64-baseos-rhui-rpms]
name=Red Hat Enterprise Linux 8 for x86_64 - BaseOS from RHUI (RPMs)
baseurl=https://rhui-1.microsoft.com/pulp/repos/content/dist/rhel8/rhui/$releasever/x86_64/baseos/os
        https://rhui-2.microsoft.com/pulp/repos/content/dist/rhel8/rhui/$releasever/x86_64/baseos/os
        https://rhui-3.microsoft.com/pulp/repos/content/dist/rhel8/rhui/$releasever/x86_64/baseos/os
enabled=1
gpgcheck=1
gpgkey=file:///etc/pki/rpm-gpg/RPM-GPG-KEY-redhat-release
sslverify=1
sslclientcert=/etc/pki/rhui/product/content.crt
sslclientkey=/etc/pki/rhui/private/key.pem
```

そこで、/etc/yum.repos.d/rh-cloud.repo の enabled=1 をすべて0に書き換えて、Azure 上の RHUI を参照しないようにします。

### Azure Linux エージェント のアップデート

Azure 上のイメージに含まれている Azure Linux エージェントのバージョンは2.2.32.2です。

```
[root@rhel8-2 aimless]# waagent -version
WALinuxAgent-2.2.32.2 running on redhat 8.0
Python: 3.6.8
Goal state agent: 2.2.38
```

残念なことに、Azure Stack はこのバージョンのエージェントをサポートしていません。Azure Stack がサポートするバージョンは2.2.35 以降です。

https://docs.microsoft.com/ja-jp/azure-stack/operator/azure-stack-linux#azure-linux-agent

リポジトリには Azure Stack がサポートするバージョンが存在しないので、手動でアップデートします。次の手順によって新しいバージョンで動きましたが、正しいのか自信がありません。python36をインストールしていない状態で動いていた Agent を起動するのに、ユーザ側に Python36 が必要になっているので何かが間違っているような気がします。本番環境で利用する場合は Microsoft と Redhat に SR します。

https://docs.microsoft.com/ja-jp/azure/virtual-machines/extensions/update-linux-agent#update-the-linux-agent-when-no-agent-package-exists-for-distribution

## おわりに

Azure Image Builder を利用してエクスポートした RHEL8 のイメージを Azure Stack 上で動作させました。サブスクリプションを有効化して yum を利用できるようになったので、無事に動かせたと思います。ただし OS 上の設定が不安です。本番で試す際は Microsoft と Redhat にサポートしてもらいながら対応します。

---
title: Azure Image Builder を利用して、マーケットプレイスのイメージを VHD に変換する
author: kongou_ae
date: 2019-05-08
url: /archives/2019/05/convert-marketplace-image-to-vhd
categories:
  - azure
---

# はじめに

Private Preview であった Azure Image Builder が Public Preview になりました。いわゆる「ゴールデンイメージ」の運用が簡単になるサービスです。Azure のサービスと連携する Packer のマネージドサービスとも言えます。

- [Announcing the public preview of Azure Image Builder
](https://cloudblogs.microsoft.com/opensource/2019/05/07/announcing-the-public-preview-of-azure-image-builder/)
- [BACK TO SESSIONS
Customizing Images made easy – Azure Image Builder Service](https://mybuild.techcommunity.microsoft.com/sessions/77331?source=sessions#top-anchor)
- [danielsollondon/azvmimagebuilder](https://github.com/danielsollondon/azvmimagebuilder)

Image Builder は、ビルドしたイメージを Managed Image と Shared Image Gallary、ストレージアカウントアカウント内の VHD ファイルとして保存します。

普通の使い方であれば イメージと Managed Image や Shared Image Gallary として保存するのでしょうが、Azure Stack の検証のために Windows Server 2019 の VHD ファイルが必要だったので、Azure 上のマーケットプレイスに登録されている Windows Server 2019 を Image Builder を利用して VHD ファイルとして保存してみます。Hyper-V 不要、ISO インストール不要で Azure ベースな VHD ファイルが手に入るのですから、Image Builder は Azure Stack で使う VHD を用意するのに最適なサービスかもしれません。

## 用意

Image Builder は Public Preview のサービスなので、個別に有効化しなければなりません。

```shell
az feature register --namespace Microsoft.VirtualMachineImages --name VirtualMachineTemplatePreview
az provider register -n Microsoft.VirtualMachineImages
```

Microsoft.VirtualMachineImages 以外にも、Microsoft.Storage と Microsoft.Compute、Microsoft.Network、Microsoft.Keyvault が必要です。レアなケースだと思いますが、もしもこれらの Resource Provider が有効化されていなければ有効化します。

## Image Builder への権限付与

Image Builder は、イメージを作成するために、利用者のサブスクリプション上に Virtual Machine を作成します。Virtual Machine を作成するには権限が必要なので、Image Builder に対して RBAC で権限を付与します。

```shell
az role assignment create \
    --assignee cf32a0cc-373c-47c9-9156-0db11f6a6dfc \
    --role Contributor \
    --scope /subscriptions/$subscriptionID/resourceGroups/$imageResourceGroup
```

## テンプレートの作成

Image Builder が利用するテンプレートを作ります。文法は [Preview: Create an Azure Image Builder template](https://docs.microsoft.com/en-us/azure/virtual-machines/linux/image-builder-json?toc=%2fazure%2fvirtual-machines%2fwindows%2ftoc.json) にまとまっています。

Azure のマーケットプレイスに登録されている Windows Server 2019 Datacenter Small Disk を カスタマイズなしで VHD ファイルとして保存するテンプレートは次の通りです。

```
{
    "type": "Microsoft.VirtualMachineImages/imageTemplates",
    "apiVersion": "2019-05-01-preview",
    "location": "WestUS2",
    "dependsOn": [],
    "tags": {
        "imagebuilderTemplate": "2019-Datacenter-smalldisk-2019.0.20190410"
    },
    "properties": {
        "buildTimeoutInMinutes" : 80,
        "source": {
            "type": "PlatformImage",
                "publisher": "MicrosoftWindowsServer",
                "offer": "WindowsServer",
                "sku": "2019-Datacenter-smalldisk",
                "version": "2019.0.20190410"
        },
        "customize": [
        ],
        "distribute":[
            { 
                "type": "VHD",
                "runOutputName": "2019-Datacenter-smalldisk-2019.0.20190410",
                "tags": {}
            }
        ]
    }
}
```

### source

"source" の箇所ではイメージの元を指定します。今回は Azure のマーケットプレイスに登録されている Windows Server 2019 Datacenter (Small Disk)を利用します。現時点では、"version" を明示的に指定する必要があります。Latest は利用できません。

### customize

"source" で指定したイメージに対して実行するカスタマイズの処理を記載します。カスタマイズには再起動とPowerShell、ファイルのダウンローとの３つが用意されています。PowerShell は インラインとスクリプト実行をサポートしています。

- [Windows restart customizer](https://docs.microsoft.com/en-us/azure/virtual-machines/linux/image-builder-json?toc=%2Fazure%2Fvirtual-machines%2Fwindows%2Ftoc.json#windows-restart-customizer)
- [PowerShell customizer](https://docs.microsoft.com/en-us/azure/virtual-machines/linux/image-builder-json?toc=%2Fazure%2Fvirtual-machines%2Fwindows%2Ftoc.json#powershell-customizer)
- [File customizer](https://docs.microsoft.com/en-us/azure/virtual-machines/linux/image-builder-json?toc=%2Fazure%2Fvirtual-machines%2Fwindows%2Ftoc.json#file-customizer)

### distribute

カスタマイズしたイメージの保存先を指定します。保存先は次の３つをサポートしています。

- Storage Account(VHD)
- Managed Image
- Shared Image Gallary

## テンプレートの登録

作成したテンプレートを Azure 上のリソースとして登録します。

```shell
az resource create \
    --resource-group $imageResourceGroup \
    --properties @2019.json \
    --is-full-object \
    --resource-type Microsoft.VirtualMachineImages/imageTemplates \
    -n win2019
```

登録が完了すると、指定したリソースグループに hidden type なリソースとして登録されます。

{{< figure src="/images/2019-05-08-001.png" title="登録されたテンプレート" >}}

同時に、Image Builder がイメージ化する Virtual Machine を起動するリソースグループが作成されます。

{{< figure src="/images/2019-05-08-002.png" title="作業用リソースグループ" >}}

## イメージの作成

登録したテンプレートを利用してイメージを作成します。

```shell
az resource invoke-action \
     --resource-group $imageResourceGroup \
     --resource-type  Microsoft.VirtualMachineImages/imageTemplates \
     -n win2019 \
     --action Run
```

コマンドを実行すると、作業用のリソースグループに、独立した VNet に接続する Virtual Machine が作成されます。この Virtual Machine を利用して Image Builder が イメージを作成します。作業完了後には、Virtual Machine と Virtual Machine に関連するリシースが自動的に削除されます。

{{< figure src="/images/2019-05-08-003.png" title="作業用リソースグループ" >}}

イメージを作成する際に実行された Packer のログは、ストレージアカウント内の packerlogs コンテナに保存されています。Image Builder が意図しない振る舞いをした場合は、このログファイルを見てデバッグすることになりそうです。

{{< figure src="/images/2019-05-08-004.png" title="Packer のログ" >}}

Image Builder が作成したイメージは、ストレージアカウント内の vhds コンテナに保存されます。Small Disk なイメージをもとにしたので、作成された VHD のサイズも30GB になっていますね。

{{< figure src="/images/2019-05-08-005.png" title="保存された VHD" >}}

## おわりに

Public Preview になった Azure Image Builder を利用して、マーケットプレイスに登録されている Windows Server 2019 Datacenter を VHD に変換しました。次回は、変換した VHD を Azure Stack のマーケットプレイス に登録します。できればいいのですが・・・

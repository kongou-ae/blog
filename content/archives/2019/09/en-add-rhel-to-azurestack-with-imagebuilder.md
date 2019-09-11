---
title: Add Red Hat Enterprise Linux to Azure Stack with Azure Image Builder
author: kongou_ae
date: 2019-09-11
url: /archives/2019/09/en-add-rhel-to-azurestack-with-imagebuilder
categories:
  - azurestack
---

## Introduction

Microsoft and Red Hat support that Red Hat Enterprise Linux 7.1 (and later) runs on Azure Stack.

- https://access.redhat.com/articles/3413531
- https://docs.microsoft.com/ja-jp/azure-stack/operator/azure-stack-supported-os#linux

But there is not the image of Red Hat Enterprise Linux in Azure Staack Marketplace at this moment. So Azure Stack Operator needs to create the custom image of Red Hat Enterprise Linux and need to add this image to Azure Stack Marketplace.

Microsoft publishes the following document to add the custom image of Red Hat Enterprise Linux. But this procedure is so hard because this procedure requires us many manual operations. 

- https://docs.microsoft.com/ja-jp/azure-stack/operator/azure-stack-redhat-create-upload-vhd

So we tested another approach. It's the way to use Azure Image Builder. This entry explains how to add Red Hat Enterprise Linux to Azure Stack with Azure Image Builder. I think that to use Azure Image Builder is better than manual operation. Because I trust the image which is running on Azure better than the image which I created manually.

## Environment

ASDK 1908 in [@syuheiuda](https://twitter.com/syuheiuda)'s [physical container](https://thinkit.co.jp/article/13243) 

## The tasks for Azure Image Builder

Microsoft published the document about Azure Image Builder. You can use Azure Image Builder with this document.

https://docs.microsoft.com/ja-jp/azure/virtual-machines/linux/image-builder

Sample template to export the image of Red Hat Enterprise Linux is as follows. You need to specify the version which you want to add to Azure Stack.

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

I used a PAYG image. Because when I used a BYOL image, the following error raised. 

```
Deployment failed. Correlation ID: 7f91b6c7-0eaa-45bb-af79-fe147844c3ae. Build (Azure PIR Image) step failed: VM Image (Location: westus2, Publisher: RedHat, Offer: rhel-byos, Sku: rhel-raw76, Version: 7.6.20190307) has a Purchase Plan in place
```

## The tasks for Azure Stack

### Put VHD file in the storage account of Azure Stack

At first, put the VHD file which was created by Azure Image Builder into the Storage Account of Azure Stack. You need to configure the access level of the container which you input VHD file to as "Blob" and VHD file as "Page blob".

### Import VHD file as an image

Second, in "Dashboard > Compute - VM images > Add a VM image" on Admin Portal, import VHD file in the storage account as the image of Azure Stack.

{{< figure src="/images/2019-09-08-001.png" title="イメージの登録画面" >}}

When the import completes, you can confirm the information of this image with "Get-AzureRmVMImage".

```powershell
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

### Create Virtual Machine with the image

The image which you imported to Azure Stack Marketplace is just an image, not ARM template. So tenant user can't see Red Hat Enterprise Linux on Azure Stack Portal.

To use this image, a tenant user needs to create Virtual Machine with ARM template or PowerShell. The sample code to use this image is as follows.


```powershell
$images = Get-AzureRmVMImage -Location local -PublisherName aimless `
    -Offer rhel8 -Skus rhel8 -Version 1.0.0 
$Vm = New-AzureRmVMConfig -VMName rhel8 -VMSize Standard_A1
$vm | Set-AzureRmVMSourceImage -PublisherName $images.PublisherName -Offer $images.Offer -Skus $images.Skus -Version $images.Version
```

## The tasks for OS

The Virtual Machine which you created is Red Hat Enterprise Linux. But you can't execute yum because the valid subscription doesn't attach with this Red Hat Enterprise Linux. You need to change the configuration of Red Hat Enterprise Linux to run yum correctly on Azure Stack.

### サブスクリプションの有効化

You need to prepare a valid subscription for this Red Hat Enterprise Linux and attach this subscription to this Red Hat Enterprise Linux. The detailed information is as follows.

https://access.redhat.com/documentation/ja-jp/red_hat_enterprise_linux/6/html/deployment_guide/registering-machine-ui

Red Hat Enterprise Linux which a valid subscription attached to is shown as "Virtual System - Microsoft Azure" in Red Hat's customer portal.

### Azure 用 Red Hat Update Infrastructure の削除

Red Hat Enterprise Linux which is running on Azure is configured to access Red Hat Update Infrastructure(RHUI) on Azure for downloading packages.

https://docs.microsoft.com/ja-jp/azure/virtual-machines/linux/update-infrastructure-redhat

```bash
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

Red Hat Enterprise Linux on Azure Stack can't access to this RHUI because only the public IP Address on Azure can access to this RHUI. So you need to change the settings about yum to not access to RHUI. For example, Removing `/etc/yum.repos.d/rh-cloud.repo` or converting `enabled=1` to `enabled=0` in `/etc/yum.repos.d/rh-cloud.repo`.

### Update Azure Linux Agent

The version of Azure Linux Agent in this image is 2.2.32.2.

```bash
[root@rhel8-2 aimless]# waagent -version
WALinuxAgent-2.2.32.2 running on redhat 8.0
Python: 3.6.8
Goal state agent: 2.2.38
```

Unfortunately, Azure Stack doesn't support this version. Azure Stack supports 2.2.35 (or later).

https://docs.microsoft.com/ja-jp/azure-stack/operator/azure-stack-linux#azure-linux-agent

In Red Hat's repository, there is no package which Azure Stack supports. So you need to update Azure Linux Agent manually with the following document.

https://docs.microsoft.com/ja-jp/azure/virtual-machines/extensions/update-linux-agent#update-the-linux-agent-when-no-agent-package-exists-for-distribution

I tried this procedure. The following command looked fine. The agent became v 2.2.43, but I'm not sure if this procedure is correct.

```bash
yum install python36
alternatives --set python /usr/bin/python3
wget https://github.com/Azure/WALinuxAgent/archive/v2.2.42.zip
unzip v2.2.42.zip 
cd WALinuxAgent-2.2.42/
sudo python setup.py install
service waagent restart
waagent -version
```

After having updated the agent, the new agent needs the python which is running on the user side although old agent doesn't need the python which is running. I think that my operation was wrong. So I will open SR to Microsoft when I try this operation in production.

## Final thought

The way to add Red Hat Enterprise Linux to Azure Stack with Azure Image Builder may is better than creating an image from ISO. Because the tasks are more little. But I worry about the configuration for an operating system. I'm happy if Microsoft officially publishes the way to add Red Hat Enterprise Linux to Azure Stack with Azure Image Builder.

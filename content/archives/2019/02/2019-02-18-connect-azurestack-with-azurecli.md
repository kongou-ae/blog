---
title: Azure CLI で Azure Stack に接続する
author: kongou_ae
date: 2019-02-18
url: /archives/2019-02-18-connect-azurestack-with-azurecli
categories:
  - azurestack
---

## はじめに

Ansible で Azure Stack を操作する デモ をやるために、Azure CLI による認証を試したのでメモ。

参考：[Use API version profiles with Azure CLI in Azure Stack](https://docs.microsoft.com/en-us/azure/azure-stack/user/azure-stack-version-profiles-azurecli2)

## 環境

- ASDK 1901 @[物理コンテナ](https://thinkit.co.jp/article/13243)

## 手順

### 証明書をインポートする

今回の環境は自己証明書を利用した ASDK なので、事故証明書のエラーを回避するために Python に自己証明書をインポートします。公的な証明書を利用している Integrated Systems の場合、本手順は不要です。なお、ドキュメントの通りに自己証明書を `/etc/ssl/certs/ca-certificates.crt` にインポートしても証明書のエラーが出てしまいました。

```bash
curl -L https://aka.ms/InstallAzureCli | bash
python -c "import certifi; print(certifi.where())"
/etc/ssl/certs/ca-certificates.crt
# ドキュメントの手順
sudo cat /var/lib/waagent/Certificates.pem >> /etc/ssl/certs/ca-certificates.crt
# 実際に上手くいった手順
sudo cat /var/lib/waagent/Certificates.pem >> ~/lib/azure-cli/lib/python3.6/site-packages/certifi/cacert.pem
```

### Azure Stack を登録する

デフォルトの Azure CLI には、Azure Stack が登録されていません。

```bash
az cloud list -o table
IsActive    Name               Profile
----------  -----------------  -----------------
False       AzureCloud         latest
False       AzureChinaCloud    latest
False       AzureUSGovernment  latest
False       AzureGermanCloud   latest
```

`az cloud register` を利用して、接続する Azure Stack を登録します。`endpoint-active-directory-resource-id` には、Azure Stack 利用開始時に Azure Active Directory に登録された Azure Stack という名前のアプリの Application ID URI を入力します。

```bash
az cloud register \
   -n AzureStackUser \
   --endpoint-resource-manager "https://management.local.azurestack.external" \
   --suffix-storage-endpoint "local.azurestack.external" \
   --suffix-keyvault-dns ".vault.local.azurestack.external" \
   --endpoint-active-directory-resource-id=https://management.aimless2.onmicrosoft.com/030cc6be-c4ec-4715-8dfc-767f169d5945

az cloud list -o table
IsActive    Name               Profile
----------  -----------------  ---------
True        AzureCloud         latest
False       AzureChinaCloud    latest
False       AzureUSGovernment  latest
False       AzureGermanCloud   latest
False       AzureStackUser     latest
```

### Azure Stack に接続する

登録した Azure Stack を Azure CLI にセットして、API のバージョンを指定します。そして、ログインします。最後に、利用するサブスクリプションを指定します。

```bash
az cloud set -n AzureStackUser
az cloud update --profile 2018-03-01-hybrid
az login --tenant aimless2.onmicrosoft.com
az account set -s 81373782-f242-4e53-9a9e-ee9168ecc0f3
```

上手くいくと、Azure CLI のコマンドで Azure Stack 上のリソースを確認できます。

```bash
az resource list -o table
Name                                            ResourceGroup    Location    Type                                     Status
----------------------------------------------  ---------------  ----------  ---------------------------------------  --------
asdk_OsDisk_1_cefa55428bc9496a84cbc5777fd327cb  ASDK             local       Microsoft.Compute/disks
asdk                                            asdk             local       Microsoft.Compute/virtualMachines
asdk40                                          asdk             local       Microsoft.Network/networkInterfaces
asdk-nsg                                        asdk             local       Microsoft.Network/networkSecurityGroups
asdk-ip                                         asdk             local       Microsoft.Network/publicIpAddresses
asdk-vnet                                       asdk             local       Microsoft.Network/virtualNetworks
asdkdiag499                                     asdk             local       Microsoft.Storage/storageaccounts
```

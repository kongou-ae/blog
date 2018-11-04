---
title: App Service on Azure Stack（サーバ証明書編）
author: kongou_ae
date: 2018-11-05
url: /archives/2018-11-05-appservice-on-asdk-about-cert
categories:
  - azurestack
---

## はじめに

Azure Stack は PaaS をサポートしています。現在サポートされている PaaS は App Service と SQL Server 、MySQL Server の３つです。いずれの PaaS も、利用にあたっては Azure Stack Operator が Azure Stack に対して PaaS の仕組みをインストールする必要があります。

たとえば App Service のインストール手順は次の通りです。

1. サーバ証明書を用意する
2. Azure Active Directory に サービスプリンシパル を作成する
3. ファイルサーバを用意する
4. SQL サーバを用意する
5. App Service on Azure Stack をインストールする

本記事では、手順1と2をやってみた結果をまとめます。

## やってみた

### 環境

Azure Stack Development Kit 1.1809.0.90

### 手順

次の手順通りに実行すればOKです。

[Get certificates](https://docs.microsoft.com/en-us/azure/azure-stack/azure-stack-app-service-before-you-get-started#get-certificates)

ただし、PowerShell スクリプトの引数を1つずつ対話式で入力するのは面倒で再現性がないので、スクリプトで一気に実行します。

```powershell
cd c:\Users\AzureStackAdmin\Downloads\AppServiceHelperScripts

# サーバ証明書を署名するためのルート証明書を取得する
$azsCred = Get-Credential -UserName azurestack\azurestackadmin -Message "Please input pep credential"
.\Get-AzureStackRootCert.ps1 -PrivilegedEndpoint azs-ercs01 `
    -CloudAdminCredential $azsCred

# サーバ証明書を作成する
$certPass = ConvertTo-SecureString -String "YOURCERTPASS" -AsPlainText -Force
.\Create-AppServiceCerts.ps1 -DomainName local.azurestack.external `
    -PfxPassword $certPass

# Azure Active Directory に サービスプリンシパルを作成する
$aadCred = Get-Credential -UserName yourid@youraadname.onmicrosoft.com -Message "Please input aad credential"
$certPass = ConvertTo-SecureString -String "YOURCERTPASS" -AsPlainText -Force
.\Create-AADIdentityApp.ps1 -DirectoryTenantName youraadname.onmicrosoft.com `
    -AdminArmEndpoint adminmanagement.local.azurestack.external `
    -TenantArmEndpoint management.local.azurestack.external `
    -CertificateFilePath C:\Users\AzureStackAdmin\Downloads\AppServiceHelperScripts\sso.appservice.local.azurestack.external.pfx `
    -AzureStackAdminCredential $aadCred -Environment AzureCloud `
    -CertificatePassword $certPass
```

最後に、Create-AADIdentityApp.ps1 が最後に出力した次のメッセージのとおり、サービスプリンシパルにアクセス許可を付与します。

```
Please note Application Id: xxxxxxxx-xxxx-xxxx-xxxx-c854009a87be
Sign in to the Azure portal as Azure Active Directory Service Admin -> Search for Application Id and grant permissions.
```

## 終わりに

App Service on Azure Stack Development Kit をインストールするために、サーバ証明書を作成しました。統合システムの場合は、正規の認証局が発行したサーバ証明書を利用するので、証明書を作る部分の手順が不要になるはずです。次のエントリーでは手順3と手順4をやってみます。

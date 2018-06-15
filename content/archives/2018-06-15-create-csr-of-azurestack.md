---
title: Azure Stack用サーバ証明書のCSRを作る
author: kongou_ae
date: 2018-06-15
url: /archives/2018-06-15-create-csr-of-azurestack
categories:
  - azurestack
---

Azureの各種エンドポイントはHTTPSで保護されています。一例は以下の通りです。これらのエンドポイントは、Microsoftが用意したサーバ証明書を利用してHTTPS化されています。

|エンドポイント|URL|
|-------------|----------------------------|
|利用者向けポータル|https://portal.azure.com|
|ARM|https://management.azure.com|
|blobストレージ|https://[name].blob.core.windows.net|
|fileストレージ|https://[name].file.core.windows.net|
|Key Valut|https://[name].vault.azure.net|
|Web App|https://[name].azurewebsites.net|

Azureと一貫性を持つAzure Stackにも同様のエンドポイントが存在しています。これらのエンドポイントは、誰が用意したサーバ証明書を利用してHTTPS化されるのでしょうか。Microsoftは用意してくれません。Azure Stackを導入する人が用意するのです。

## サーバ証明書が必要になるFQDN

IaaS部分をデプロイする際にサーバ証明書が必要となるFQDNは次のURLに記載されています。デプロイを成功されるためには、もれなくサーバ証明書が必要です。

[Mandatory certificates](https://docs.microsoft.com/en-us/azure/azure-stack/azure-stack-pki-certs#mandatory-certificates)

デプロイ後に追加するPaaSでサーバ証明書が必要なるFQDNは次のURLに記載されています。PaaSを正常に追加するためには、もれなくサーバ証明書が必要です。

[Optional PaaS certificates](https://docs.microsoft.com/en-us/azure/azure-stack/azure-stack-pki-certs#optional-paas-certificates)

## サーバ証明書の買い方

サーバ証明書の買い方は「1枚にまとめる」と「FQDNごとにサーバ証明書を買う」のどちらもサポートされています。お好きな方をどうぞ。サーバ証明書の発行先は内部認証局と外部認証局がサポートされています。オレオレはサポートされていません。

## CSRの作り方

さて、本題です。認証局にサーバ証明書を発行してもらうためにはCSRを作る必要があります。以前はCertreqと自作のiniファイルでCSRを作りました。超しんどかった。ですが、現在は[AzsReadinessChecker](https://www.powershellgallery.com/packages/Microsoft.AzureStack.ReadinessChecker)という便利コマンドがリリースされています。

まずは"AzsReadinessChecker"をインストール＆インポートします。

```powershell
Install-Module Microsoft.AzureStack.ReadinessChecker -Scope CurrentUser
Import-Module Microsoft.AzureStack.ReadinessChecker -Scope Local
```

CSRを生成する"Start-AzsReadinessChecker"に渡す変数を作っていきます。作りたい証明書にあわせて変数の中身を変えてください。下記のようにした場合、Azure Stackの利用者向けポータルは"https://portal.japaneast.azs.aimless.jp"になります。

```powershell
$subjectHash = [ordered]@{"OU"="azuresktack";"O"="aimless";"L"="Saitama";"ST"="Saitama";"C"="JP"}
$outputDirectory = "$ENV:USERPROFILE\Documents\AzureStackCSR"
$IdentitySystem = "AAD"
$regionName = 'japaneast'
$externalFQDN = 'azs.aimless.jp'
```

作成した変数を利用して"Start-AzsReadinessChecker"を実行します。PaaSのFQDNを含むCSRを作成したい場合は"-IncludePaaS"をつけます。

```powershell
PS C:\Windows\system32> Start-AzsReadinessChecker -RegionName $regionName `
    -FQDN $externalFQDN -subject $subjectHash -RequestType SingleCSR `
    -OutputRequestPath $OutputDirectory -IdentitySystem $IdentitySystem -IncludePaaS
 
Output path C:\Users\AZURES~1\AppData\Local\Temp\AzsReadinessChecker already exists, continuing.
AzsReadinessChecker v1.1806.607.1 started
Starting Certificate Request Generation

CSR generating for following SAN(s): dns=portal.japaneast.azs.aimless.jp&dns=adminportal.japaneast.azs.aimless.jp&dns=management.japan
east.azs.aimless.jp&dns=adminmanagement.japaneast.azs.aimless.jp&dns=*.blob.japaneast.azs.aimless.jp&dns=*.queue.japaneast.azs.aimless
.jp&dns=*.table.japaneast.azs.aimless.jp&dns=*.vault.japaneast.azs.aimless.jp&dns=*.adminvault.japaneast.azs.aimless.jp&dns=*.dbadapte
r.japaneast.azs.aimless.jp&dns=*.appservice.japaneast.azs.aimless.jp&dns=*.scm.appservice.japaneast.azs.aimless.jp&dns=api.appservice.
japaneast.azs.aimless.jp&dns=ftp.appservice.japaneast.azs.aimless.jp&dns=sso.appservice.japaneast.azs.aimless.jp&dns=*.sso.appservice.
japaneast.azs.aimless.jp
Present this CSR to your Certificate Authority for Certificate Generation: C:\Users\AzureStackAdmin\Documents\AzureStackCSR\portal_jap
aneast_azs_aimless_jp_CertRequest_20180614132819.req
Certreq.exe output: CertReq: Request Created

Finished Certificate Request Generation

AzsReadinessChecker Log location: C:\Users\AZURES~1\AppData\Local\Temp\AzsReadinessChecker\AzsReadinessChecker.log
AzsReadinessChecker Completed
```

$outputDirectory で指定したフォルダにCSRとInfファイルが作られます。

```powershell
PS C:\Users\AzureStackAdmin> dir .\Documents\AzureStackCSR\

    Directory: C:\Users\AzureStackAdmin\Documents\AzureStackCSR

Mode                LastWriteTime         Length Name
----                -------------         ------ ----
d-----        6/15/2018  12:15 PM                Inf
-a----        6/14/2018   1:28 PM           2396 portal_japaneast_azs_aimless_jp_CertRequest_20180614132819.req

PS C:\Users\AzureStackAdmin> dir .\Documents\AzureStackCSR\Inf\

    Directory: C:\Users\AzureStackAdmin\Documents\AzureStackCSR\Inf

Mode                LastWriteTime         Length Name
----                -------------         ------ ----
-a----        6/14/2018   1:28 PM           3688 portal_japaneast_azs_aimless_jp_CertRequest_20180614132819_ClearTextDoNotUse.inf
```

OpenSSLを利用して

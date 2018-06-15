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

Azureと一貫性を持つAzure Stackにも同様のエンドポイントが存在しています。これらのエンドポイントは、誰が用意したサーバ証明書を利用してHTTPS化されるのでしょうか。Microsoftは用意してくれません。Azure Stackを導入する人が用意します。

## サーバ証明書が必要になるFQDN

IaaS部分をデプロイする際にサーバ証明書が必要となるFQDNは次のURLに記載されています。デプロイを成功されるためには、サーバ証明書がもれなく必要です。

[Mandatory certificates](https://docs.microsoft.com/en-us/azure/azure-stack/azure-stack-pki-certs#mandatory-certificates)

デプロイ後に追加するPaaSでサーバ証明書が必要なるFQDNは次のURLに記載されています。PaaSを正常に追加するためには、サーバ証明書がもれなく必要です。

[Optional PaaS certificates](https://docs.microsoft.com/en-us/azure/azure-stack/azure-stack-pki-certs#optional-paas-certificates)

## サーバ証明書の買い方

「1枚にまとめるで買う」と「FQDNごとにサーバ証明書を買う」のどちらもサポートされています。お好きな方をどうぞ。1枚にまとめる場合、マルチドメインかつワイルドカードな証明書が必要です。付き合いのある認証局が発行してくれるかを確認しましょう。サーバ証明書の発行先は内部認証局と外部認証局がサポートされています。オレオレはサポートされていません。

## CSRの作り方

さて、本題です。認証局にサーバ証明書を発行してもらうためにはCSRを作る必要があります。以前はCertreqとinfファイルでCSRを作りました。超しんどかった。ですが、現在は[AzsReadinessChecker](https://www.powershellgallery.com/packages/Microsoft.AzureStack.ReadinessChecker)という便利コマンドがリリースされています。

まずは"AzsReadinessChecker"をインストール＆インポートします。

```powershell
Install-Module Microsoft.AzureStack.ReadinessChecker -Scope CurrentUser
Import-Module Microsoft.AzureStack.ReadinessChecker -Scope Local
```

"Start-AzsReadinessChecker"でCSRを生成する際に利用する変数を作っていきます。作りたい証明書にあわせて変数の中身を変えてください。下記のようにした場合、Azure Stackの利用者向けポータルは"https://portal.japaneast.azs.aimless.jp"になります。

```powershell
$subjectHash = [ordered]@{"OU"="azuresktack";"O"="aimless";"L"="Saitama";"ST"="Saitama";"C"="JP"}
$outputDirectory = "$ENV:USERPROFILE\Documents\AzureStackCSR"
$IdentitySystem = "AAD"
$regionName = 'japaneast'
$externalFQDN = 'azs.aimless.jp'
```

作成した変数を利用して"Start-AzsReadinessChecker"を実行します。"-RequestType"で、証明書を1枚にするのか複数枚にするのかを選択します。PaaSのFQDNを含むCSRを作成する場合は"-IncludePaaS"をつけます。

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

上手くいくと、$outputDirectory で指定したフォルダにCSRとInfファイルが作られます。

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

OpenSSLを利用してCSRの中身を見てみます。CNが"portal.japaneast.azs.aimless.jp"で、SANが大量のFQDNの証明書ができあがりますね。

```
kongou_ae:~/workspace $ openssl req -text -noout -in azs.req 
Certificate Request:
    Data:
        Version: 0 (0x0)
        Subject: C=JP, ST=Saitama, L=Saitama, O=aimless, OU=azuresktack, CN=portal.japaneast.azs.aimless.jp
        Subject Public Key Info:
            Public Key Algorithm: rsaEncryption
                Public-Key: (2048 bit)
                Modulus:
                    00:aa:da:62:eb:da:c2:de:68:12:44:db:d8:19:17:
                    20:df:02:42:0f:4d:4c:e9:1d:8e:ef:cb:5a:98:50:
                    2c:10:5c:0a:3f:9b:24:30:d4:1e:47:c3:e4:a0:42:
                    85:9c:84:f5:7b:84:f0:fb:6c:fb:75:b0:f0:52:c0:
                    76:df:07:7b:f8:e4:89:1d:8d:6b:56:1a:48:bd:78:
                    27:5f:0c:62:08:2a:36:28:9c:cb:93:6d:a9:f3:be:
                    75:d0:ec:e5:dd:ba:f6:97:d8:85:34:7d:16:25:23:
                    69:23:b3:b9:9c:1e:2a:51:fa:d7:06:28:2d:ee:0c:
                    6a:b8:41:a5:77:76:89:37:c4:08:2c:3c:3f:99:37:
                    64:ee:6e:44:82:56:e8:78:98:92:37:e3:7b:53:55:
                    10:88:97:15:f8:a2:13:09:59:c7:86:07:3b:a1:3a:
                    8f:b8:22:30:e5:a0:32:d7:d5:02:3f:d7:65:6d:9c:
                    49:65:6d:70:09:a7:8e:dc:22:0f:01:a1:f5:91:61:
                    8d:3f:d1:7a:7a:4d:af:45:6f:e9:5c:77:04:a2:e7:
                    da:b8:2a:fc:cd:ec:1b:ea:ca:e3:3f:98:d2:c2:d5:
                    fe:37:8c:f7:ca:32:07:7c:78:15:12:10:11:92:39:
                    f6:f7:10:e1:89:e6:66:7b:54:06:f2:f1:54:d6:93:
                    83:51
                Exponent: 65537 (0x10001)
        Attributes:
            1.3.6.1.4.1.311.13.2.3   :10.0.14393.2
            1.3.6.1.4.1.311.21.20    :unable to print attribute
            1.3.6.1.4.1.311.13.2.2   :unable to print attribute
        Requested Extensions:
            X509v3 Key Usage: critical
                Digital Signature, Key Encipherment
            X509v3 Subject Alternative Name: 
                DNS:portal.japaneast.azs.aimless.jp, DNS:adminportal.japaneast.azs.aimless.jp, DNS:management.japaneast.azs.aimless.jp, DNS:adminmanagement.japaneast.azs.aimless.jp, DNS:*.blob.japaneast.azs.aimless.jp, DNS:*.queue.japaneast.azs.aimless.jp, DNS:*.table.japaneast.azs.aimless.jp, DNS:*.vault.japaneast.azs.aimless.jp, DNS:*.adminvault.japaneast.azs.aimless.jp, DNS:*.dbadapter.japaneast.azs.aimless.jp, DNS:*.appservice.japaneast.azs.aimless.jp, DNS:*.scm.appservice.japaneast.azs.aimless.jp, DNS:api.appservice.japaneast.azs.aimless.jp, DNS:ftp.appservice.japaneast.azs.aimless.jp, DNS:sso.appservice.japaneast.azs.aimless.jp, DNS:*.sso.appservice.japaneast.azs.aimless.jp
            X509v3 Extended Key Usage: 
                TLS Web Server Authentication, TLS Web Client Authentication
            X509v3 Subject Key Identifier: 
                C1:54:E9:58:57:FC:6C:E8:CF:B6:9D:FC:69:83:76:1B:71:C2:31:DF
    Signature Algorithm: sha256WithRSAEncryption
         1e:8a:95:89:66:d6:a3:af:87:4b:43:da:66:68:6d:fc:6e:2a:
         a0:59:aa:c9:a3:9b:f8:34:6a:e5:15:6c:12:fc:0c:10:26:36:
         79:88:c9:b6:f4:c1:7d:83:87:ae:ff:92:54:90:76:d5:af:20:
         8c:f0:d8:4e:d1:15:6e:37:45:e9:84:d6:5e:1e:65:52:84:9b:
         44:3c:5b:63:a5:9c:e0:a9:da:06:55:eb:f5:2a:1a:f5:42:f4:
         94:55:cf:08:58:63:00:c6:11:1c:fd:f2:06:07:2b:00:9b:5c:
         ae:1b:61:58:99:26:3c:7f:b1:8b:d1:b8:21:0f:a2:c5:35:00:
         e3:41:25:6f:f7:b9:69:b9:68:1f:3b:fd:20:60:68:9b:78:cd:
         62:6c:bb:a7:05:3f:85:db:5e:1c:f4:d4:90:6e:e9:96:22:81:
         20:2b:0e:06:bc:33:3b:3d:d2:f0:0e:b1:2a:60:62:4c:46:f6:
         01:56:e1:70:ea:1d:12:41:b5:bb:b3:d7:9a:a1:d4:4c:77:58:
         13:10:e2:28:18:69:5b:e6:9b:b1:08:b2:cb:8b:bb:54:a8:8c:
         7d:2f:e7:40:8c:7a:74:a6:8d:90:35:1f:61:b6:a5:70:df:78:
         2b:48:f6:be:bf:a4:8d:78:59:de:1b:6b:54:1d:c7:37:41:bb:
         b5:25:9c:6c
```

---
title: Azure Stack Hub の CSR の作り方が変わった(ReadinessChecker ver.1912)
author: kongou_ae
date: 2020-01-03
url: /archives/2020-01-03-change-of-creating-csr-for-azurestack
categories:
  - azurestack
---

ReadinessChecker を利用して Azure Stack Hub の CSR を作る方法が変わったのでメモ。

## これまで

ReadinessChecker を利用して PaaS 用の CSR を作る際には `-IncludePaaS` というスイッチを利用する必要がありました。

```
$subjectHash = [ordered]@{"OU"="AzureStack";"O"="Microsoft";"L"="Redmond";"ST"="Washington";"C"="US"}
$outputDirectory = "$ENV:USERPROFILE\Documents\AzureStackCSR"
$IdentitySystem = "AAD"
$regionName = 'east'
$externalFQDN = 'azurestack.contoso.com'
New-AzsCertificateSigningRequest -IncludePaaS -RegionName $regionName -FQDN $externalFQDN -subject $subjectHash -OutputRequestPath $OutputDirectory -IdentitySystem $IdentitySystem
```

## 1912以降

1912以降の ReadinessChecker では `-IncludePaaS` というスイッチが廃止になりました。そのかわりに、作りたい CSR を `-certificateType` というオプションで指定する方式になりました。1912で指定できる値は次の6つです。

1. EventHubs
1. IoTHub
1. DBAdapter
1. AppServices
1. Deployment
1. DataboxEdge

```
$subject = "C=US,ST=Washington,L=Redmond,O=Microsoft,OU=Azure Stack"
$outputDirectory = "C:\azurestackCSR0606"
$IdentitySystem = "AAD"
$regionName = 'east'
$externalFQDN = 'azurestack.contoso.com'
New-AzsCertificateSigningRequest -requestType SingleCSR -certificateType Deployment,AppServices,DBadapter,IoTHub,EventHubs,Databoxedge -RegionName $regionName -FQDN $externalFQDN -subject $subject -OutputRequestPath $OutputDirectory -IdentitySystem $IdentitySystem 
```

また、`-requestType SingleCSR` とした時の挙動も変わっています。1912よりも前のバージョンで `-requestType SingleCSR` と `-IncludePaaS` を併用した場合、IaaS と AppService、DB Adapter に関連するすべての SANs を含む1つの CSR が生成されました。当然、この CSR から作成される証明書は1枚のマルチドメインワイルドカード証明書でした。

1912では `-requestType SingleCSR` と `-certificateType` を併用した場合、サービスごとに CSR が生成されました。具体的には、`-certificateType Deployment,AppServices,DBadapter,IoTHub,EventHubs,Databoxedge` とした場合、次のように6つの CSR が生成されました。

{{< figure src="/images/2020/01-03-001.png" title="生成された CSR の一覧" >}}

これらの CSR から生成される証明書は、4枚のワイルドカード証明書と2枚のマルチドメインワイルドカード証明書です。つまり、1912よりも前に生成した証明書を1912の ReadinessChecker を利用して更新する場合、証明書の構成と枚数が変わります。証明書の金額が変わるかもしれませんので、1912が生成する CSR を前提に証明書の金額を予算に入れておきましょう。
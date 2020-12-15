---
title: Create the certificate for Azure Stack Hub PaaS automatically with PowerShell
author: kongou_ae
date: 2020-12-15
url: /archives/2020/12/create-certificate-for-additional-rp-with-PowerShell
categories:
  - azurestack
---

## Introduction

This blog talks about the way to create the Let's encrypt's certificate for Azure Stack PaaS automatically with PowerShell. Because this way may be needed to join the preview of the new Azure Stack PaaS.

Azure Stack Hub supports some Azure PaaS. At the this time, Azure Stack Hub supports the following PaaS.

- App Service(GA)
- Event Hub(GA)
- IoT Hub(Public preview)
- Azure Kuvernetes service(Private preview)
- Azure container registry(Private preview)

Some PaaS requires a certificate to install it. The best certificate for PaaS is a public certificate because every user and every device can access PaaS without any additional action. But you may not want to use a paid certificate to join the preview of some PaaS. Based on this situation, it is good way to use Let's encrypt for prepering the public certificate for the private preview of PaaS, because it is free.

But you need to create the certificate every three months due to the limitation of let's encrypt. So you need to use an automatic way to use Let's encrypt. This blog explains how to create the certificate for Azure Stack Hub PaaS automatically with PowerShell.

## Procedure and tools

When you create the certificate which Azure Stack Hub requires, you need to follow three steps.

1. Create a CSR
2. Issue this CSR by CA
3. Import the certificate and export this and a private key as PFX file.

Microsoft provides "Azure Stack Hub Readiness Checker" to run #1 and #2. For example:

```powershell
# 1. Create a CSR
Install-Module Microsoft.AzureStack.ReadinessChecker
$subject = "C=US,ST=Washington,L=Redmond,O=Microsoft,OU=Azure Stack Hub"
$regionName = 'tky001'
$externalFQDN = 'aimless.jp'
$outputDirectory = "$ENV:USERPROFILE\Documents\AzureStackCSR"
New-AzsHubEventHubsCertificateSigningRequest -RegionName $regionName -FQDN $externalFQDN -subject $subject -OutputRequestPath $OutputDirectory

# 3. Import the certificate and export this as PFX file.
Install-Module Microsoft.AzureStack.ReadinessChecker -Force -AllowPrerelease
$securePfxpass = ConvertTo-SecureString -String $pfxpass -Force -AsPlainText
$Path = "$env:USERPROFILE\Documents\AzureStack"
$ExportPath = "$env:USERPROFILE\Documents\AzureStack"
ConvertTo-AzsPFX -Path $certPath -pfxPassword $securePfxpass -ExportPath $outputDirectory
```
So you can automate every step with PowerShell if you can run step2 with PowerShell. The last piece is "[rmbolger/Posh-ACME](https://github.com/rmbolger/Posh-ACME)". This product allows you to control Let's encrypt with PowerShell and you can automate every process if you use the DNS server which you can control by PowerShell like Azure DNS to host the FQDN of Azure Stack Hub.

## How to use [rmbolger/Posh-ACME](https://github.com/rmbolger/Posh-ACME)

In the scenario for Azure Stack PaaS, you need to issue your CSR which Azure Stack Hub Readiness Checker generated. The example to issue the CSR for EventHubs is as follows.

```Powershell
Set-PAServer LE_STAGE
$subscriptionId = "Your subscription Id which contains Azure DNS"
Get-AzSubscription -subscriptionId $subscriptionId | Select-AzSubscription
$token = (Get-AzAccessToken).Token
$reqs = Get-ChildItem "C:\Users\me\azscsr" | Where-Object { $_.Name -like "*.req"}
$csr = ($reqs | Where-Object { $_.name -like "wildcard_eventhub_*"} | Sort-Object -Property LastWriteTime -Descending)[0]
$result = New-PACertificate `
    -CSRPath $csr.FullName `
    -Contact $email `
    -AcceptTOS `
    -DnsPlugin Azure `
    -PluginArgs @{`
        AZSubscriptionId=$subscriptionId;`
        AZAccessToken=$token;`
    } `
    -DNSSleep 5 `
    -Verbose -force
```

The FQDN of this CSR is `*.eventhubs.tky001.aimless.jp`. So [rmbolger/Posh-ACME](https://github.com/rmbolger/Posh-ACME) executes the following steps. This total automation is so good.

1. Order the new certificate to Let's encrypt
2. Add the `_acme-challenge` records to Azure DNS with a token
3. Request DNS validation to Let's encrypt
4. Delete the `_acme-challenge` records from Azure DNS

My confusing point is `-CSRPath` of `New-PACertificate`. `-CSRPath` is the path of the directory which contains CSR file, not the path of a CSR itselft. 

## Sample Script

My sample script based on this blog is [kongou-ae/AzureStackOperatorScripts/New-AzsPaaSCertificate.ps1](https://github.com/kongou-ae/AzureStackOperatorScripts/blob/master/New-AzsPaaSCertificate.ps1). This script allows you to create the certificate for EevntHubs with one command.

```
PS C:\Users\me> .\New-AzsCertificate.ps1 -rp EventHubs -subject "C=US,ST=Washington,L=Redmond,O=Microsoft,OU=Azure Stack Hub" -regionName tky002 -externalFQDN aimless.jp -email YOUR-EMAIL-ADDRESS -pfxpass YOUR-PASSWORD -subscriptionId 76cd33dc-xxxx-xxxx-xxxx-xxxxxxx9f261
C:\Users\me\azscsr already exist.
[2020-12-14 23:58:11] Create the CSR for EventHubs
New-AzsCertificate.ps1 v0.0 started.
Starting Certificate Request Process for EventHubs
CSR generating for following SAN(s): *.eventhub.tky002.aimless.jp
Present this CSR to your Certificate Authority for Certificate Generation: C:\Users\[*redacted*]\azscsr\wildcard_eventhub_tky002_aimless_jp_CertRequest_20201214235812.req
Certreq.exe output: CertReq: 要求が作成されました

Log location (contains PII): C:\Users\me~1\AppData\Local\Temp\AzsReadinessChecker\AzsReadinessChecker.log
New-AzsCertificate.ps1 Completed
[2020-12-14 23:58:14] Get the access token to call Azure DNS

Name                                     Account             SubscriptionName    Environment         TenantId
----                                     -------             ----------------    -----------         --------
payg (76cd33dc-xxxx-xxxx-xxxx-xxxxxxx... me                  payg                AzureCloud          50f9de73-a175-4...
[2020-12-14 23:58:31] Sign the certificate for  by Let's encrypt
詳細: Using directory https://acme-staging-v02.api.letsencrypt.org/directory
詳細: POST https://acme-staging-v02.api.letsencrypt.org/acme/acct/17091685 with -1-byte payload
詳細: received 310-byte response of content type application/json
詳細: Using account 17091685
詳細: Creating a new order for *.eventhub.tky002.aimless.jp
詳細: POST https://acme-staging-v02.api.letsencrypt.org/acme/new-order with -1-byte payload
詳細: received 372-byte response of content type application/json
詳細: POST https://acme-staging-v02.api.letsencrypt.org/acme/authz-v3/172491247 with -1-byte payload
詳細: received 405-byte response of content type application/json
詳細: POST https://acme-staging-v02.api.letsencrypt.org/acme/authz-v3/172491247 with -1-byte payload
詳細: received 405-byte response of content type application/json
詳細: Publishing DNS challenge for *.eventhub.tky002.aimless.jp
詳細: Attempting to find hosted zone for _acme-challenge.eventhub.tky002.aimless.jp
詳細: GET
https://management.azure.com/subscriptions/76cd33dc-xxxx-xxxx-xxxx-xxxxxxx9f261/providers/Microsoft.Network/dnszones?ap
i-version=2018-03-01-preview with 0-byte payload
詳細: received 1088-byte response of content type application/json; charset=utf-8
詳細: 2 zone(s) found
詳細: Checking _acme-challenge.eventhub.tky002.aimless.jp
詳細: Checking eventhub.tky002.aimless.jp
詳細: Checking tky002.aimless.jp
詳細: Checking aimless.jp
詳細: Querying _acme-challenge.eventhub.tky002.aimless.jp
詳細: GET
https://management.azure.com/subscriptions/76cd33dc-xxxx-xxxx-xxxx-xxxxxxx9f261/resourceGroups/aimless-infra/providers/
Microsoft.Network/dnszones/aimless.jp/TXT/_acme-challenge.eventhub.tky002?api-version=2018-03-01-preview with 0-byte
payload
詳細: Sending updated _acme-challenge.eventhub.tky002
詳細: PUT
https://management.azure.com/subscriptions/76cd33dc-xxxx-xxxx-xxxx-xxxxxxx9f261/resourceGroups/aimless-infra/providers/
Microsoft.Network/dnszones/aimless.jp/TXT/_acme-challenge.eventhub.tky002?api-version=2018-03-01-preview with -1-byte
payload
詳細: received 462-byte response of content type application/json; charset=utf-8
詳細: Saving changes for Azure plugin
詳細: Sleeping for 5 seconds while DNS change(s) propagate
詳細: Requesting challenge validations
詳細: POST https://acme-staging-v02.api.letsencrypt.org/acme/chall-v3/172491247/pJgD-w with -1-byte payload
詳細: received 191-byte response of content type application/json
詳細: Attempting to find hosted zone for _acme-challenge.eventhub.tky002.aimless.jp
詳細: Querying _acme-challenge.eventhub.tky002.aimless.jp
詳細: GET
https://management.azure.com/subscriptions/76cd33dc-xxxx-xxxx-xxxx-xxxxxxx9f261/resourceGroups/aimless-infra/providers/
Microsoft.Network/dnszones/aimless.jp/TXT/_acme-challenge.eventhub.tky002?api-version=2018-03-01-preview with 0-byte
payload
詳細: received 462-byte response of content type application/json; charset=utf-8
詳細: Deleting _acme-challenge.eventhub.tky002. No values left.
詳細: DELETE
https://management.azure.com/subscriptions/76cd33dc-xxxx-xxxx-xxxx-xxxxxxx9f261/resourceGroups/aimless-infra/providers/
Microsoft.Network/dnszones/aimless.jp/TXT/_acme-challenge.eventhub.tky002?api-version=2018-03-01-preview with 0-byte
payload
詳細: received 0-byte response of content type
詳細: Saving changes for Azure plugin
詳細: POST https://acme-staging-v02.api.letsencrypt.org/acme/order/17091685/201741906 with -1-byte payload
詳細: received 360-byte response of content type application/json
詳細: Finalizing the order.
詳細: Using the provided certificate request.
詳細: POST https://acme-staging-v02.api.letsencrypt.org/acme/finalize/17091685/201741906 with -1-byte payload
詳細: received 472-byte response of content type application/json
詳細: POST https://acme-staging-v02.api.letsencrypt.org/acme/order/17091685/201741906 with -1-byte payload
詳細: received 472-byte response of content type application/json
詳細: POST https://acme-staging-v02.api.letsencrypt.org/acme/order/17091685/201741906 with -1-byte payload
詳細: received 472-byte response of content type application/json
詳細: POST https://acme-staging-v02.api.letsencrypt.org/acme/cert/fa8243a0f5d669b959a3e1d187fa613b7209 with -1-byte
payload
詳細: received 3583-byte response of content type application/pem-certificate-chain
詳細: POST https://acme-staging-v02.api.letsencrypt.org/acme/cert/fa8243a0f5d669b959a3e1d187fa613b7209/1 with -1-byte
payload
詳細: received 3238-byte response of content type application/pem-certificate-chain
詳細: No private key available. Skipping Pfx creation.
詳細: Updating cert expiration and renewal window
詳細: Successfully created certificate.
[2020-12-14 23:58:48] Export the certificate as a pfx fileSign
New-AzsCertificate.ps1 v1.2100.1396.426 started.

Stage 1: Scanning Certificates
        Path: C:\Users\[*redacted*]\AppData\Local\Posh-ACME\acme-staging-v02.api.letsencrypt.org\17091685\!.eventhub.tky002.aimless.jp Filter: CER Certificate count: 1
        fullchain.cer

Detected ExternalFQDN: tky002.aimless.jp

Stage 2: Exporting Certificates
        tky002.aimless.jp\EventHubs\EventHubs.pfx

Stage 3: Validating Certificates

Validating tky002.aimless.jp-EventHubs certificates in C:\Users\[*redacted*]\azscsr\tky002.aimless.jp\EventHubs
Testing: EventHubs\EventHubs.pfx
Thumbprint: 3D4340****************************1A9812
        PFX Encryption: OK
        Expiry Date: OK
        Signature Algorithm: OK
        DNS Names: OK
        Key Usage: OK
        Key Length: OK
        HTTP CRL: Skipped
        Parse PFX: OK
        Private Key: OK
        Cert Chain: OK
        Chain Order: OK
        Other Certificates: OK

Log location (contains PII): C:\Users\me\AppData\Local\Temp\AzsReadinessChecker\AzsReadinessChecker.log
New-AzsCertificate.ps1 Completed
```

## Conclusion

This blog explains about how to automate the task to create the certificate for Azure Stack PaaS with Let's encrypt and PowerShell. To use Azure PaaS is the one of the benefit of Azure Stack Hub. If the main blocker to try Azure Stack Hub PaaS is to prepare a public certificate, you can use the certificate of Let's encrypt with PowerShell. This way can reduce your manual action.

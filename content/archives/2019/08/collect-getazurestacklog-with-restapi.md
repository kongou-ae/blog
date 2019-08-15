---
title: Collect Get-AzureStackLog with Rest API
author: kongou_ae
date: 2019-08-15
url: /archives/2019/08/collect-getazurestacklog-with-restapi
categories:
  - azurestack
---

Microsoft released on-demand diagnostic log collection in 1907 update. So we can collect Get-AzureStackLog in the admin portal. This feature is so useful because we don't need to use PEP to collect Get-AzureStackLog.

[On-demand diagnostic log collection](https://docs.microsoft.com/en-us/azure-stack/operator/azure-stack-diagnostic-log-collection-overview#on-demand-diagnostic-log-collection)

When we use on-demand diagnostic log collection, the admin portal accesses to Rest API. We can also use this API. This blog explans the following operations.

- Run on-demand diagnostic log collection
- Check the history of on-demand diagnostic log collection

## Run on-demand diagnostic log collection

The url to run on-demand diagnostic log collection is as follows. And some parameters are needed when you access this endpoint.

```
POST https://adminmanagement.<region>.<external fqdn>/subscriptions/$subscriptionId/resourcegroups/system.$region/providers/Microsoft.SupportBridge.Admin/regions/$region/collectLogs?api-version=2018-12-01"
```

Sample:

```powershell
$azContext = Get-AzureRMContext
$azProfile = [Microsoft.Azure.Commands.Common.Authentication.Abstractions.AzureRmProfileProvider]::Instance.Profile
$profileClient = New-Object Microsoft.Azure.Commands.ResourceManager.Common.RMProfileClient($azProfile)
$token = $profileClient.AcquireAccessToken($azContext.Tenant.TenantId)

$authHeader = "Bearer " + $token.AccessToken
$requestHeader = @{
    "Authorization" = $authHeader
    "Accept" = "application/json"
}

$SasUri = "https://yourstoraceaccount.blob.core.windows.net/azs?sp=rwl&st=2019-08-15T13:22:44Z&se=2020-08-16T14:16:00Z&sv=2018-03-28&sig=n4GADBGhI4%2Bo6qRUc%2BBdMxv82OK4TNlpJx1r6Sm0Tjk%3D&sr=c"
$fromDate = "2019-08-13T12:00:00Z"
$ToDate = "2019-08-13T13:00:00Z"

$subId = (Get-AzureRmSubscription).Id
$region = (Get-AzsRegionHealth).Name
$adminManagementUrl = (Get-AzureRmEnvironment -Name AzureStackAdmin).ResourceManagerUrl

$param = @{
    "blobServiceSasUri" = $SasUri
    "logCollectionCustomParameters" = @{
        "timeRange" = @{
            "fromDateTime" = $fromDate 
            "toDateTime" = $ToDate
         }
   }
} | ConvertTo-Json

$url = "/subscriptions/$subId/resourcegroups/system.$region/providers/Microsoft.SupportBridge.Admin/regions/$region/collectLogs?api-version=2018-12-01"

Invoke-RestMethod -Method POST -Uri "$adminManagementUrl$url" -Headers $requestHeader -ContentType "application/json;charset=utf-8" -Body $param
```

## Check the history of on-demand diagnostic log collection

The url to the history of on-demand diagnostic log collection is as follows.

```
GET https://adminmanagement.<region>.<external fqdn>/subscriptions/$subscriptionId/resourcegroups/system.$region/providers/Microsoft.SupportBridge.Admin/regions/$region/tky001/logCollectionHistory?api-version=2018-12-01"
```

## Final thoughts
I'm so excited about this feature. On-demand diagnostic log collection made the operation of Azure Stack more simply!

---
title: Invoke-AzRest を使って Azure の API を直接叩く
author: kongou_ae
date: 2020-07-25
url: /archives/2020/07/access-azure-api-by-invoke-azrest
categories:
  - azure
---

## はじめに

Az モジュールに Azure の API を直接叩くための Invoke-AzRest コマンドが実装されました。

公式アナウンス：[How to manage Azure resources with the new PowerShell Invoke-AzRestMethod cmdlet](https://techcommunity.microsoft.com/t5/azure-tools/how-to-manage-azure-resources-with-the-new-powershell-invoke/ba-p/1540306)

Azure CLI が以前からサポートしてた az rest と同等の機能を持つコマンドです。このコマンド を利用すれば、PowerShell で API を直接叩く際に Get-AzContex 内のトークンを抽出するような前処理が不要になります。

## 試してみた

Invoke-AzRest コマンド は v4.4.0 で実装されました。Cloud Shell で Invoke-AzRest コマンドを利用できたので、 Azure Stack HCI のクラスタの情報を GET してみました。Invoke-AzRest に Path パラメータで API バージョン付きの URL を渡すだけです。超シンプル。

```powershell
> Invoke-AzRest -Path "/subscriptions/xxxxxxxx-xxxx-xxxx-xxxx-c5bd3103e127/resourceGroups/azshci-registration/providers/Microsoft.AzureStackHCI/clusters/azshciclus?api-version=2020-03-01-preview" -Method GET

Headers    : {[Cache-Control, System.String[]], [Pragma, System.String[]], [x-ms-ratelimit-remaining-subscription-reads, System.String[]], [x-ms-request-id,
             System.String[]]…}
Version    : 1.1
StatusCode : 200
Method     : GET
Content    : {"id":"/subscriptions/9c171efd-eab4-4f0b-91d7-c5bd3103e127/resourceGroups/azshci-registration/providers/Microsoft.AzureStackHCI/clusters/azshciclus","name":"azshciclus","type":"Microsoft.AzureStackHCI/clusters","location":"eastus","tags":{},"properties":{"provisioningState":"Succeeded","status":"Disconnected","cloudId":"2a3746fe-9ba4-4aaf-b4b4-524c347f2450","aadClientId":"5babd374-6cab-4660-9b41-fb5ffca293be","aadTenantId":"95b57fbb-b9c6-443f-91e0-d69fad0f2565","reportedProperties":{"clusterName":"AZSHCICLUS","clusterId":"70244155-6423-4b03-bc01-0bfa88df252c","clusterVersion":"10.0.17784","nodes":[{"name":"AZSHCINODE01","id":1,"manufacturer":"Microsoft Corporation","model":"Virtual Machine","osName":"Azure Stack HCI","osVersion":"10.0.17784.1068","serialNumber":"1844-8425-4411-3410-9623-0336-66","coreCount":2,"memoryInGiB":4},{"name":"AZSHCINODE02","id":2,"manufacturer":"Microsoft Corporation","model":"VirtualMachine","osName":"Azure Stack HCI","osVersion":"10.0.17784.1068","serialNumber":"4452-2741-5854-6413-1790-0626-37","coreCount":2,"memoryInGiB":4}],"lastUpdated":"2020-07-23T04:00:00.3896307Z"},"trialDaysRemaining":28,"billingModel":"Trial"}}
```

API を直接たたいているので JSON の文字列が返ってきます。返ってきた文字列を ConvertFrom-Json してあげれば PowerShell で扱える形式になります。

```powershell
> $res = Invoke-AzRest -Path "/subscriptions/xxxxxxxx-xxxx-xxxx-xxxx-c5bd3103e127/resourceGroups/azshci-registration/providers/Microsoft.AzureStackHCI/clusters/azshciclus?api-version=2020-03-01-preview" -Method GET
> $res.Content | ConvertFrom-Json -Depth 100

id         : /subscriptions/9c171efd-eab4-4f0b-91d7-c5bd3103e127/resourceGroups/azshci-registration/providers/Microsoft.AzureStackHCI/clusters/azshciclus
name       : azshciclus
type       : Microsoft.AzureStackHCI/clusters
location   : eastus
tags       :
properties : @{provisioningState=Succeeded; status=Disconnected; cloudId=xxxxxxxx-xxxx-xxxx-xxxx-524c347f2450; aadClientId=xxxxxxxx-xxxx-xxxx-xxxx-fb5ffca293be;aadTenantId=xxxxxxxx-xxxx-xxxx-xxxx-d69fad0f2565; reportedProperties=; trialDaysRemaining=28; billingModel=Trial}
```

GET ではなく PUT や POST を実行する場合は、更新したい内容を記載した JSON 文字列を payload パラメータで投げます。

参考：[How to manage Azure resources with the new PowerShell Invoke-AzRestMethod cmdlet](https://techcommunity.microsoft.com/t5/azure-tools/how-to-manage-azure-resources-with-the-new-powershell-invoke/ba-p/1540306)

## 振り返り

Az モジュールの v4.4.0 で実装された Invoke-AzRest を試しました。PowerShell で API を直接たたく方法がよりシンプルになりました。ありがたい。

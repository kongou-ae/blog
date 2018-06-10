---
title: PowerShellを使って、AzureからAzure StackにMarketPlaceのアイテムをダウンロードする
author: kongou_ae

date: 2018-06-10
url: /archives/2018-06-10-download-item-from-azure-to-azurestack-by-powershell
categories:
  - azure
  - azurestack
---

Azure Stackの特徴の一つに「AzureのMarket Place上のアイテムをAzure StackのMarket Placeでも使える」という機能があります。この機能を利用するためには、AzureのMarket Placeからアイテムをダウンロードする必要があります。

次のURLに記載されているとおりAdmin Portalでポチポチするだけでダウンロードできるのですが、GUIでポチポチする手順はスケールしません。「スケールが必要になるくらいのAzure Stackを運用する日が来るのか？」という疑問は忘れたうえで、PowerShellでやってみました。

[Download marketplace items from Azure to Azure Stack](https://docs.microsoft.com/ja-jp/azure/azure-stack/azure-stack-download-azure-marketplace-item#connected-scenario)

## 環境

- 環境：ASDK 1.0.180513.1
- PowerShell: Azure Stack Admin 1.3.0

## やってみた

[Azs.Azurebridge.Admin](https://docs.microsoft.com/ja-jp/powershell/module/azs.azurebridge.admin/?view=azurestackps-1.3.0)モジュールを利用します。

`targetItemDisplayName`変数にAdmin Portal上に表示されているアイテムの名前を入れると、そのアイテムがダウンロードされます。Start-jobでバックグラウンド化すれば、複数アイテムの平行ダウンロードや複数Azure Stackでの並行ダウンロードといった実践的なスクリプトが作れそう。

```
$regionName = 'local'
$resourceGroupName = 'azurestack-activation'
$targetItemDisplayName = 'Service Fabric Cluster'

$activation = Get-AzsAzureBridgeActivation -ResourceGroupName $resourceGroupName

$list = Get-AzsAzureBridgeProduct -ActivationName $activation.Name -ResourceGroupName $resourceGroupName
$list | ForEach-Object {
    if ($_.DisplayName -eq $targetItemDisplayName ){
        Write-Output "The following item will be downloaded."
        Write-Output "-----------------------------------------"
        $_.DisplayName
        $_.Id
        $targetItemId =   $_.Id
    }
}

Invoke-AzsAzureBridgeProductDownload -ResourceId $targetItemId -Force
```

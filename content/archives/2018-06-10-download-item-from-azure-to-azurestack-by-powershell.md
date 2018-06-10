---
title: PowerShellを使って、AzureからAzure StackにMarketPlaceのアイテムをダウンロードする
author: kongou_ae

date: 2018-06-10
url: /archives/2018-06-10-download-item-from-azure-to-azurestack-by-powershell
categories:
  - azure
  - azurestack
---

Azure Stackの特徴の一つに「AzureのMarket Place上のアイテムをAzure StackのMarket Placeでも使える」という機能があります。この機能を利用するためには、AzureのMarket Placeからアイテムをダウンロードする必要があります。次のURLに記載されているとおり管理者ポータルでポチポチするだけでダウンロードできるのですが、GUIでポチポチする手順はスケールしません。PowerShellでやってみました。

[Download marketplace items from Azure to Azure Stack](https://docs.microsoft.com/ja-jp/azure/azure-stack/azure-stack-download-azure-marketplace-item#connected-scenario)


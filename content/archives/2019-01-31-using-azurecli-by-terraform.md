---
title: Terraform から Azure CLI を実行する
author: kongou_ae
date: 2019-01-31
url: /archives/2019-01-31-using-azurecli-by-terraform
categories:
  - azure
---

## はじめに

Azure 上のリソースに作った人の名前をタグ付けする仕組み（[azure-auto-tagging](https://github.com/kongou-ae/azure-auto-tagging)）を作っています。仕組みに必要な PaaS を Terraform で一発構築する際に困ったことと解決策をまとめます。

## Terraform はすべてをサポートしない

[azure-auto-tagging](https://github.com/kongou-ae/azure-auto-tagging) は、Log Analytics に飛んでくる Activity Log をチェックしてリソースをタグをつけます。Terraform の Azure Provider は Log Analytics の作成をサポートします。

```
resource "azurerm_log_analytics_workspace" "autotagging" {
  name                = "autotagging-${random_integer.random.result}"
  location            = "${azurerm_resource_group.autotagging.location}"
  resource_group_name = "${azurerm_resource_group.autotagging.name}"
  sku                 = "standalone"
  #sku                 = "PerGB2018"
  retention_in_days   = 30
}
```

Log Analytics に Activity Log を飛ばすためには、Data Source として Activity Log を設定する必要があります。

{{< figure src="./../../images/2019-01-31-001.jpg" title="Log Analytics と Activity logの接続画面" >}}

ただし、Terraform の Azure Provider は Log Analytics の Data Source をサポートしていません。せっかくTerraform で Log Analytics を作ったにも関わらず、その流れで Data Source を設定できません。残念。。。

## Azure CLI でカバーする

Terraform の Azure Provider が Data Source をサポートしないのであれば、Azure CLI で頑張るしかありません。ただし、Azure CLI も Log Analytics の Data Source をサポートしていないため、`az resource create` で頑張る必要があります。

```
az resource create -g YOUR-RESOURCE-GROUP -n YOUR-DATASOURCE=NAME --resource-type dataSources --namespace microsoft.operationalinsights/workspaces --is-full-object --parent YOUR-LOGANALYTICS-NAME -p '{\"properties\":{\"LinkedResourceId\":\"/subscriptions/YOUR-SUBSCRIPTION-ID/providers/microsoft.insights/eventtypes/management\"},\"kind\":\"AzureActivityLog\",\"location\":\"${azurerm_resource_group.autotagging.location}\"}' --api-version 2015-11-01-preview"
```

Terraform で Log Analytics を作成した後に上記の Azure CLI を実行すれば、やりたいことは達成できます。ただし、コマンドを2回にわけて実行するのはめんどくさいです。そこで Terraform に Azure CLI を実行してもらいます。具体的には、null_rerouce Provider に対して local-exec Provisioner を実行します。

```
resource "null_resource" "connectLaAndActivityLog" {
  provisioner "local-exec" {
    command = "az resource create -g ${azurerm_resource_group.autotagging.name} -n autotagging-${random_integer.random.result} --resource-type dataSources --namespace microsoft.operationalinsights/workspaces --is-full-object --parent autotagging-${random_integer.random.result} -p '{\"properties\":{\"LinkedResourceId\":\"${data.azurerm_subscription.current.id}/providers/microsoft.insights/eventtypes/management\"},\"kind\":\"AzureActivityLog\",\"location\":\"${azurerm_resource_group.autotagging.location}\"}' --api-version 2015-11-01-preview"
  }
}
```

かなり強引ですが、上記のように書くことでやりたいことを達成できました。Terraform apply するだけで、Log Analytics の構築と Data Source の設定を一気に実行できます。素晴らしい。また、Terraform から Azure CLI を実行するようにすると、Terraform 内の変数をAzure CLI のコマンド内で利用できるという効果もあります。

## まとめ

Terraform から Azure CLI を実行することで、Terraform で構築できないリソースを構築してみました。null_rerouce Provider に対して local-exec Provisioner を実行するという強引な手法なため、冪等性は保証されません。それでも、1回きりの初期デプロイにおいては重宝する手法だと思いました。

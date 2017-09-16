---
title: TerraformをAzure CLI認証で使う
author: kongou_ae

date: 2017-09-16
url: /archives/2017-09-16-use-terraform-without-serviceprincipal
categories:
  - Azure

---

## はじめに

TerraformのMicrosoft Azure ProviderがAzure CLI認証に対応しました。サービスプリンシパルを作らなくてもTerraformが動きます。

- [AzureRM delegated user access?](https://github.com/terraform-providers/terraform-provider-azurerm/issues/42)
- [Authenticating to Azure Resource Manager using the Azure CLI](https://www.terraform.io/docs/providers/azurerm/authenticating_via_azure_cli.html)

AWS Providerの$HOME/.aws/credentials認証と似た機能です。Microsoft Azure Providerは$HOME/.azure/配下に保存されている情報を利用します。

## 動作確認

Azure Cloud Shellで試しました。Azure Cloud Shellは、起動した時点でAzure CLIの認証が完了しています。しかもAzure Cloud ShellのコンテナはデフォルトでTerraformがインストールされています。現時点で、Azure Cloud Shellはもっとも気軽にTerraformを実行できる環境です。

```
$ ls /usr/local/terraform/
terraform
```

.tfファイルは次のとおりです。provider "azurerm" {}の中は空でOKです。

```
# Configure the Microsoft Azure Provider
provider "azurerm" {}

resource "azurerm_resource_group" "jazug7" {
  name     = "jazug7"
  location = "Japan East"
}

resource "azurerm_public_ip" "test" {
  name                         = "acceptanceTestPublicIp1"
  location                     = "Japan East"
  resource_group_name          = "${azurerm_resource_group.jazug7.name}"
  public_ip_address_allocation = "static"
}


resource "azurerm_availability_set" "test-ha" {
  name                = "acceptanceTestAvailabilitySet1"
  location            = "Japan East"
  resource_group_name = "${azurerm_resource_group.jazug7.name}"
}
```

planします。`provider "azurerm" {}`の中が空にもかかわらず正常に動きます。

```
$ terraform plan
Refreshing Terraform state in-memory prior to plan...
The refreshed state will be used to calculate this plan, but will not be
persisted to local or remote state storage.

The Terraform execution plan has been generated and is shown below.
Resources are shown in alphabetical order for quick scanning. Green resources
will be created (or destroyed and then created if an existing resource
exists), yellow resources are being changed in-place, and red resources
will be destroyed. Cyan entries are data sources to be read.

Note: You didn't specify an "-out" parameter to save this plan, so when
"apply" is called, Terraform can't guarantee this is what will execute.

  + azurerm_availability_set.test-ha
      location:                     "japaneast"
      managed:                      "false"
      name:                         "acceptanceTestAvailabilitySet1"
      platform_fault_domain_count:  "3"
      platform_update_domain_count: "5"
      resource_group_name:          "jazug7"
      tags.%:                       "<computed>"

  + azurerm_public_ip.test
      fqdn:                         "<computed>"
      ip_address:                   "<computed>"
      location:                     "japaneast"
      name:                         "acceptanceTestPublicIp1"
      public_ip_address_allocation: "static"
      resource_group_name:          "jazug7"
      tags.%:                       "<computed>"

  + azurerm_resource_group.jazug7
      location: "japaneast"
      name:     "jazug7"
      tags.%:   "<computed>"


Plan: 3 to add, 0 to change, 0 to destroy.
```

applyします。

```
$ terraform apply
azurerm_resource_group.jazug7: Creating...
  location: "" => "japaneast"
  name:     "" => "jazug7"
  tags.%:   "" => "<computed>"
azurerm_resource_group.jazug7: Creation complete (ID: /subscriptions/MY_SUBSCRIPTION_ID/resourceGroups/jazug7)
azurerm_availability_set.test-ha: Creating...
  location:                     "" => "japaneast"
  managed:                      "" => "false"
  name:                         "" => "acceptanceTestAvailabilitySet1"
  platform_fault_domain_count:  "" => "3"
  platform_update_domain_count: "" => "5"
  resource_group_name:          "" => "jazug7"
  tags.%:                       "" => "<computed>"
azurerm_public_ip.test: Creating...
  fqdn:                         "" => "<computed>"
  ip_address:                   "" => "<computed>"
  location:                     "" => "japaneast"
  name:                         "" => "acceptanceTestPublicIp1"
  public_ip_address_allocation: "" => "static"
  resource_group_name:          "" => "jazug7"
  tags.%:                       "" => "<computed>"
azurerm_availability_set.test-ha: Creation complete (ID: /subscriptions/MY_SUBSCRIPTION_ID-...itySets/acceptanceTestAvailabilitySet1)
azurerm_public_ip.test: Creation complete (ID: /subscriptions/MY_SUBSCRIPTION_ID-...licIPAddresses/acceptanceTestPublicIp1)

Apply complete! Resources: 3 added, 0 changed, 0 destroyed.
matsumotoyusuke@Azure:~/20170916$
```

リソースができました。

{{<img src="./../../images/2017-09-16-001.png">}}

## 感想

気軽。実に気軽。TerraformをAzureで使うための敷居が非常に低くなりました。
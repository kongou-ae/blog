---
title: Terraform on Azure Stack
author: kongou_ae
date: 2018-06-21
url: /archives/2018-06-21-terraform-on-azurestack
categories:
  - azurestack
---

TerraformがAzure Stack Providerをリリースしたので試しました。

<blockquote class="twitter-tweet" data-cards="hidden" data-lang="ja"><p lang="en" dir="ltr">We&#39;ve just released a new <a href="https://twitter.com/HashiCorp?ref_src=twsrc%5Etfw">@HashICorp</a> <a href="https://twitter.com/hashtag/Terraform?src=hash&amp;ref_src=twsrc%5Etfw">#Terraform</a> Provider for <a href="https://twitter.com/Azure?ref_src=twsrc%5Etfw">@Azure</a> Stack: <a href="https://t.co/twYuFQcBra">https://t.co/twYuFQcBra</a> <a href="https://twitter.com/hashtag/Azure?src=hash&amp;ref_src=twsrc%5Etfw">#Azure</a></p>&mdash; Tom Harvey 🇩🇪 (@tombuildsstuff) <a href="https://twitter.com/tombuildsstuff/status/1009331538494918657?ref_src=twsrc%5Etfw">2018年6月20日</a></blockquote>
<script async src="https://platform.twitter.com/widgets.js" charset="utf-8"></script>

[Azure Stack Provider](https://www.terraform.io/docs/providers/azurestack/index.html)

なお、TerraformのAzure Stack対応はAzureと異なるProviderとして実装されました。そのため、Azureで利用しているtfファイルをそのまま利用できません。tfファイルの内容を置換する必要があります。AnsibleのようなAzureで利用しているコードをそのまま利用できる実装方式にしてほしかった。AnsibleのAzure Stack対応は、Azureモジュールを使う際の環境変数AZURE_CLOUD_ENVIRONMENTにAzure StackのAPIエンドポイントを格納する形です。

## 環境
- Azure Stack：ASDK 1.0.180513.1
- PowerShell: Azure Stack Admin 1.3.0
- Terraform: Terraform v0.11.7 + provider.azurestack v0.1.0

## やってみた

まずはTerraformが利用するサービスプリンシパルを作ります。Cloud Shellを利用して、Azure Stackにログインするときに利用するAzure Active Directoryに、サービスプリンシパルを作成します。

```powershell
matsumotoyusuke@Azure:~$ az ad sp create-for-rbac --name AzsTerraform --password PASSWORD
Retrying role assignment creation: 1/36
Retrying role assignment creation: 2/36
{
  "appId": "appId",
  "displayName": "AzsTerraform",
  "name": "http://AzsTerraform",
  "password": "PASSWORD",
  "tenant": "tenant"
}
```

作成したサービスプリンシパルをAzure StackのサブスクリプションにOwner権限で追加します。Contributor権限だとTerraformがエラーになりました。なぜだろう。

```powershell
PS C:\Users\AzureStackAdmin\Documents> Get-AzureRmRoleAssignment


RoleAssignmentId   : /subscriptions/1cbd8150-0f4f-4815-89e8-fb34b865a628/providers/Microsoft.Authorization/roleAssignme
                     nts/a25a046c-dab9-4951-9a00-9434aac9baab
Scope              : /subscriptions/1cbd8150-0f4f-4815-89e8-fb34b865a628
DisplayName        : AzsTerraform
SignInName         :
RoleDefinitionName : Owner
RoleDefinitionId   : 8e3af657-a8ff-443c-a75c-2fe8c4bcb635
ObjectId           : f6a96431-8336-4539-9fd9-7f1879019e08
ObjectType         : ServicePrincipal
```

Azure Stackのテナント領域にPowerShellで接続して、リソースグループを作ります。

```powershell
PS C:\Users\AzureStackAdmin\Documents> $ArmEndpoint = "https://management.local.azurestack.external"
PS C:\Users\AzureStackAdmin\Documents> Add-AzureRMEnvironment -Name "AzureStackUser" -ArmEndpoint $ArmEndpoint
PS C:\Users\AzureStackAdmin\Documents> Login-AzureRmAccount -EnvironmentName "AzureStackUser" `
PS C:\Users\AzureStackAdmin\Documents> New-AzureRmResourceGroup -Name azsterraform -Location local
```

tfファイルを作ります。providerの部分には、RBACに登録したサービスプリンシパルの情報を追記します。ご利用のAzure Stackにあわせてarm_endpointを変更してください。

```
provider "azurestack" {
  arm_endpoint = "https://management.local.azurestack.external"
  subscription_id = "subscription_id"
  client_id = "client_id"
  client_secret = "client_secret"
  tenant_id = "tenant_id"
}
```

tfファイルにリソースを追記します。基本的な記法はAzureと同じです。"azure_"ではなく"azurestack_"になったのが本当に惜しい。

```
resource "azurestack_resource_group" "test" {
  name     = "azsterraform"
  location = "local"
}

resource "azurestack_virtual_network" "test" {
  name                = "acctvn"
  address_space       = ["10.0.0.0/16"]
  location            = "${azurestack_resource_group.test.location}"
  resource_group_name = "${azurestack_resource_group.test.name}"
}

resource "azurestack_subnet" "test" {
  name                 = "acctsub"
  resource_group_name  = "${azurestack_resource_group.test.name}"
  virtual_network_name = "${azurestack_virtual_network.test.name}"
  address_prefix       = "10.0.2.0/24"
}

resource "azurestack_network_interface" "test" {
  name                = "acctni"
  location            = "${azurestack_resource_group.test.location}"
  resource_group_name = "${azurestack_resource_group.test.name}"

  ip_configuration {
    name                          = "testconfiguration1"
    subnet_id                     = "${azurestack_subnet.test.id}"
    private_ip_address_allocation = "dynamic"
  }
}

resource "azurestack_storage_account" "test" {
  name                     = "accsa"
  resource_group_name      = "${azurestack_resource_group.test.name}"
  location                 = "${azurestack_resource_group.test.location}"
  account_tier             = "Standard"
  account_replication_type = "LRS"

  tags {
    environment = "staging"
  }
}

resource "azurestack_storage_container" "test" {
  name                  = "vhds"
  resource_group_name   = "${azurestack_resource_group.test.name}"
  storage_account_name  = "${azurestack_storage_account.test.name}"
  container_access_type = "private"
}

resource "azurestack_virtual_machine" "test" {
  name                  = "acctvm"
  location              = "${azurestack_resource_group.test.location}"
  resource_group_name   = "${azurestack_resource_group.test.name}"
  network_interface_ids = ["${azurestack_network_interface.test.id}"]
  vm_size               = "Standard_F2"

  storage_image_reference {
    publisher = "MicrosoftWindowsServer"
    offer     = "WindowsServer"
    sku       = "2016-Datacenter"
    version   = "latest"
  }

  storage_os_disk {
    name          = "myosdisk1"
    vhd_uri       = "${azurestack_storage_account.test.primary_blob_endpoint}${azurestack_storage_container.test.name}/myosdisk1.vhd"
    caching       = "ReadWrite"
    create_option = "FromImage"
  }

  # Optional data disks
  storage_data_disk {
    name          = "datadisk0"
    vhd_uri       = "${azurestack_storage_account.test.primary_blob_endpoint}${azurestack_storage_container.test.name}/datadisk0.vhd"
    disk_size_gb  = "1023"
    create_option = "Empty"
    lun           = 0
  }

  os_profile {
    computer_name  = "hostname"
    admin_username = "testadmin"
    admin_password = "Password1234!"
  }

  os_profile_windows_config {
    provision_vm_agent = true
  }

  tags {
    environment = "staging"
  }
}
```

"terraform init"してAzure Stack Providerをインストールします。

```powershell
PS C:\Users\AzureStackAdmin\Documents> .\terraform.exe init
```

"terraform plan"でDry-runしたうえで、"terraform apply"します

```powershell
PS C:\Users\AzureStackAdmin\Documents> .\terraform.exe plan
（中略）
PS C:\Users\AzureStackAdmin\Documents> .\terraform.exe apply
（中略）

Apply complete! Resources: 7 added, 0 changed, 0 destroyed.
```

Virtual Machineができました。tfファイルの書き方がほんの少し違いますが、Azure Providerを同じ使い勝手でVirtual Machineを作れました。

```powershell
PS C:\Users\AzureStackAdmin\Documents> Get-AzureRmVM | ft

ResourceGroupName   Name Location      VmSize  OsType    NIC ProvisioningState
-----------------   ---- --------      ------  ------    --- -----------------
AZSTERRAFORM      acctvm    local Standard_F2 Windows acctni         Succeeded
```

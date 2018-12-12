---
title: Azure Stack にアクセスする
author: kongou_ae
date: 2018-12-13
url: /archives/2018-12-13-how-to-access-azurestack
categories:
  - azurestack
---

## はじめに

本エントリーは[Microsoft Azure Stack Advent Calendar 2018](https://qiita.com/advent-calendar/2018/azure-stack)の11日目です。

先日のエントリでは、Azure Stack の認証と認可をまとめました。本日のエントリでは、実際に Azure Stack にアクセスしてみます。なお、私は、ADFS で認証する Azure Stack を触ったことがありません。そのため、本エントリでは、AAD を利用したアクセス方法のみを対象とします。

## 管理者と利用者の違い

Azure Stack にアクセスする人は、管理者と利用者に分けられます。管理者とは Azure Stack のインフラを運用管理する人です。利用者とは、Azure Stack が提供する Azure のサービスを利用する人です。

管理者と利用者の大きな違いの１つがアクセス先です。次のとおり、Azure Stack では、管理者と利用者のアクセス先が異なります。

| アクセス先 | 管理者 | 利用者 |
|------------|------------|----------------|
|ポータル |adminportal.region.fqdn|portal.region.fqdn|
|ARM のエンドポイント|adminmanagement.region.fqdn|management.region.fqdn|

## 管理者のアクセス方法

Azure Stack に管理者としてアクセスする代表的な方法であるプラウザと PowerShell を例に、管理者のアクセス方法を説明します。

### プラウザ

プラウザによるアクセス方法はシンプルです。プラウザを利用して、管理者向けポータルの URL にアクセスするだけです。認証に AAD を利用している場合は、AAD の認証画面にリダイレクトされます。AAD による認証を通過すると、管理者向け管理画面が表示されます。AAD による認証の場合、アクセスする URL が違うだけで、基本的な流れは Azure と同じです。

Development Kit でのアクセス先は adminportal.local.azurestack.external です。アクセスすると次のように管理者向けポータルが表示されます。

{{<img src="./../../images/2018-12-12-001.png">}}

### PowerShell

PowerShell によるアクセスは少々複雑です。複雑になってしまう理由は次の3つです。

* API のバージョンが Azure と異なる
* 専用の PowerShell モジュールとツールがある
* API のエンドポイントが独自である

Azure Stack がサポートする API バージョンは、Azure と比較して古いです。そのため、古い PowerShell モジュールを利用しなけれなりません。ここをうまいことやってくれるのが AzureRM.Bootstrapper モジュールです。

```powershell
# インストールされているかもしれない新しい Azure モジュールと Azure Stack 関連モジュールを一度全部アンインストール
Uninstall-Module -Name AzureRM.AzureStackAdmin -Force 
Uninstall-Module -Name AzureRM.AzureStackStorage -Force 
Uninstall-Module -Name AzureStack -Force -Verbose
Uninstall-Module -Name AzureRM -Force -Verbose
Uninstall-Module -Name Azure.Storage -Force -Verbose
Get-Module -Name Azs.* -ListAvailable | Uninstall-Module -Force -Verbose
Get-Module -Name AzureRM.* -ListAvailable | Uninstall-Module -Force -Verbose

# Azure Stack がサポートする API バージョンへの切り替えをサポートするモジュールを追加
Install-Module -Name AzureRm.BootStrapper

# Azure Stack がサポートする API バージョンにあった Azure モジュールをインストール
Use-AzureRmProfile -Profile 2018-03-01-hybrid -Force

# Azure Stack 専用のモジュールをインストール
Install-Module -Name AzureStack -RequiredVersion 1.5.0
```

Azure Stack がサポートする API バージョンにあった PowerShell モジュールがインストールできました。次に専用のツールである　[Azure/AzureStack-Tools](https://github.com/Azure/AzureStack-Tools) をダウンロードします。

```powershell
cd $HOME

[Net.ServicePointManager]::SecurityProtocol = [Net.SecurityProtocolType]::Tls12 
invoke-webrequest `
  https://github.com/Azure/AzureStack-Tools/archive/master.zip `
  -OutFile master.zip

expand-archive master.zip `
  -DestinationPath . `
  -Force
```

そして、接続先を変更してログインします。初期状態だと、Azure の PowerShell は Azure に接続するように設定されています。ですので、PowerShell で Azure Stack に接続する場合は、Azure Stack の接続情報を明示的に指定しなければなりません。

```powershell
Import-Module $HOME\AzureStack-Tools-master\Connect\AzureStack.Connect.psm1

$ArmEndpoint = "https://adminmanagement.local.azurestack.external"
$AADTenantName = "<YOURNAME>.onmicrosoft.com" 

# Azure Stack の 管理者向け ARM エンドポイントを、AzureStackAdmin という名前で追加
Add-AzureRMEnvironment `
  -Name "AzureStackAdmin" `
  -ArmEndpoint $ArmEndpoint

$TenantID = Get-AzsDirectoryTenantId `
  -AADTenantName $AADTenantName `
  -EnvironmentName AzureStackAdmin

# 追加した名前を指定してログイン
Login-AzureRmAccount `
  -Environment AzureStackAdmin `
  -TenantId $TenantID
```

## 利用者のアクセス方法

Azure Stack に利用者としてアクセスする方法についても、管理者と同様にブラウザと PowerShell を例にして説明します。また、サードパーティーのツールである Terraform で Azure Stack に接続する方法にも触れます。

### プラウザ

AAD による認証の場合、ブラウザによるアクセスは、アクセスする URL が違うだけで、基本的な流れが管理者と同じです。Development Kit でのアクセス先は portal.local.azurestack.external です。アクセスすると次のように管理者向けポータルが表示されます。

{{<img src="./../../images/2018-12-12-002.png">}}

### PowerShell

PowerShell でのアクセスは、管理者と同様、利用者についても同じ苦しみがあります。そのため、手順もほとんど変わりません。違いは API のエンドポイントです。管理者のエンドポイントは adminmanagement.region.fqdn ですが、利用者のエンドポイントは management.region.fqdn です。

```powershell
# インストールされているかもしれない、新しい Azure と Azure Stack 関連モジュールを全部アンインストール
Uninstall-Module -Name AzureRM.AzureStackAdmin -Force 
Uninstall-Module -Name AzureRM.AzureStackStorage -Force 
Uninstall-Module -Name AzureStack -Force -Verbose
Uninstall-Module -Name AzureRM -Force -Verbose
Uninstall-Module -Name Azure.Storage -Force -Verbose
Get-Module -Name Azs.* -ListAvailable | Uninstall-Module -Force -Verbose
Get-Module -Name AzureRM.* -ListAvailable | Uninstall-Module -Force -Verbose

# Azure Stack がサポートする API バージョンへの切り替えをサポートするモジュールを追加
Install-Module -Name AzureRm.BootStrapper

# Azure Stack がサポートする API バージョンにあった Azure モジュールをインストール
Use-AzureRmProfile -Profile 2018-03-01-hybrid -Force

# Azure Stack 専用のモジュールをインストール
Install-Module -Name AzureStack -RequiredVersion 1.5.0

# AzureStack-Toolsをダウンロード
cd $HOME

[Net.ServicePointManager]::SecurityProtocol = [Net.SecurityProtocolType]::Tls12 
invoke-webrequest `
  https://github.com/Azure/AzureStack-Tools/archive/master.zip `
  -OutFile master.zip

expand-archive master.zip `
  -DestinationPath . `
  -Force

# ツールをインポートする
Import-Module $HOME\AzureStack-Tools-master\Connect\AzureStack.Connect.psm1

$ArmEndpoint = "https://management.local.azurestack.external"
$AADTenantName = "<YOURNAME>.onmicrosoft.com" 

# Azure Stack の 利用者向け ARM エンドポイントを、AzureStackUser という名前で追加
Add-AzureRMEnvironment `
  -Name "AzureStackUser" `
  -ArmEndpoint $ArmEndpoint

$TenantID = Get-AzsDirectoryTenantId `
  -AADTenantName $AADTenantName `
  -EnvironmentName AzureStackUser

# 追加した名前を指定してログイン
Login-AzureRmAccount `
  -Environment AzureStackUser `
  -TenantId $TenantID
```

### Infrastrucute as code ツール

Azure をサポートする Infrastrucute as code のツールが、 Azure Stack に対応しています。代表的なものは Ansible と Terraforn です。

- [Ansible](https://docs.ansible.com/ansible/2.5/scenario_guides/guide_azure.html#other-cloud-environments)
- [Terraform](https://www.terraform.io/docs/providers/azurestack/index.html)

これらのツールを使うときも、PowerShell と同じように接続先を明示しなければなりません。過去のエントリに[Terraformのサンプル](https://aimless.jp/blog/archives/2018-06-21-terraform-on-azurestack/)がありますので、気になる方はご確認ください。

## おわりに

本日のエントリでは、管理者と利用者が Azure Stack にアクセスする方法をまとめました。古い PowerShell モジュールを使う必要があること、API のエンドポイントが違うため接続先を切り替える必要があること、の2つがポイントです。正直ちょっとめんどくさいです。今後改善されることを願います。

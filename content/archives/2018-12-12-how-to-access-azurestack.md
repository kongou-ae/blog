---
title: Azure Stack にアクセスする
author: kongou_ae
date: 2018-12-12
url: /archives/2018-12-12-how-to-access-azurestack
categories:
  - azurestack
---

## はじめに

本エントリーは[Microsoft Azure Stack Advent Calendar 2018](https://qiita.com/advent-calendar/2018/azure-stack)の11日目です。

先日までのエントリで、「Azure Stack とは何か」と「設置するために何を考える必要があるか」を説明してきました。本日以降のエントリーでは、Azure Stack の使い方を説明していきます。使い方第一回は、Azure Stack へのアクセス方法です。

なお、私は、ADFS で認証する Azure Stack を触ったことがありません。そのため、本エントリでは、AAD を利用したアクセス方法のみを対象とします。

## 管理者と利用者

Azure Stack にアクセスする人は、管理者と利用者に分けられます。管理者とは Azure Stack のインフラを運用管理する人です。利用者とは、Azure Stack が提供する Azure のサービスを利用する人です。

## 管理者と利用者のアクセス先

管理者と利用者の大きな違いの１つがアクセス先です。次のとおり、Azure Stack では、管理者と利用者のアクセス先が異なります。

| アクセス先 | 管理者 | 利用者 |
|------------|------------|----------------|
|ポータル |adminportal.region.fqdn|portal.region.fqdn|
|API のエンドポイント|adminmanagement.region.fqdn|management.region.fqdn|

## 管理者のアクセス方法

Azure Stack に管理者としてアクセスする代表的な方法であるプラウザと PowerShell を例に、管理者のアクセス方法を説明します。

### プラウザ

プラウザによるアクセス方法はシンプルです。プラウザを利用して、管理者向けポータルの URL にアクセスするだけです。認証に AAD を利用している場合は、AAD の認証画面にリダイレクトされます。AAD による認証を通過すると、管理者向け管理画面が表示されます。AAD による認証の場合、アクセスする URL が違うだけで、基本的な流れは Azure と同じです。

Development Kit でのアクセス先は adminportal.local.azurestack.external です。アクセスすると次のように管理者向けポータルが表示されます。

{{<img src="./../../images/2018-12-12-001.png">}}

### PowerShell

PowerShell によるアクセスは少々複雑です。複雑になってしまう理由は次の3つです。

* API のバージョンが Azure と異なる
* 専用の PowerShell モジュールがある
* API のエンドポイントが独自である

Azure Stack がサポートする API バージョンは、Azure と比較して古いです。そのため、古い PowerShell モジュールを利用しなけれなりません。ここをうまいことやってくれるのが AzureRM.Bootstrapper モジュールです。

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
```

Azure Stack がサポートする API バージョンにあった PowerShell モジュールがインストールできました。次は接続先の変更です。Azure の PowerShell は Azure に接続するように設定されています。ですので、PowerShell で Azure Stack に接続する場合は、Azure Stack の接続情報を明示的に指定します。最後に明示的に指定した接続情報を引数にしてログインしまs。

```powershell
$ArmEndpoint = "https://adminmanagement.local.azurestack.external"
Add-AzureRMEnvironment `
  -Name "AzureStackAdmin" `
  -ArmEndpoint $ArmEndpoint
Login-AzureRmAccount -Environment AzureStackAdmin
```

## 利用者のアクセス方法

Azure Stack に利用者としてアクセスする方法についても、管理者と同様にブラウザを PowerShell を例にして説明しまs。また、サードパーティーのツールである Terraform で Azure Stack に接続する方法にも触れます。

### プラウザ

プラウザによるアクセス方法はシンプルです。プラウザを利用して、利用者向けポータルの URL にアクセスするだけです。認証に AAD を利用している場合は、AAD の認証画面にリダイレクトされます。AAD による認証を通過すると、管理者向け管理画面が表示されます。AAD による認証の場合、アクセスする URL が違うだけで、基本的な流れは Azure と同じです。

Development Kit でのアクセス先は portal.local.azurestack.external です。アクセスすると次のように管理者向けポータルが表示されます。

{{<img src="./../../images/2018-12-12-002.png">}}


### PowerShell

管理者と同様、利用者についても同じ苦しみがあります。そのため、手順もほとんど変わりません。違いは API のエンドポイントです。管理者のエンドポイントは adminportal.region.fqdn ですが、利用者のエンドポイントは portal.region.fqdn です。

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

$ArmEndpoint = "https://management.local.azurestack.external"

# ユーザ用のAPI エンドポイントを登録。登録したエンドポイントにログイン
Add-AzureRMEnvironment `
  -Name "AzureStackUser" `
  -ArmEndpoint $ArmEndpoint

# Sign in to your environment
Login-AzureRmAccount `
  -EnvironmentName "AzureStackUser"
```

### Infrastrucute as code 関係

Azure をサポートする Infrastrucute as code のツールが Azure Stack に対応しています。

- [Ansible](https://docs.ansible.com/ansible/2.5/scenario_guides/guide_azure.html#other-cloud-environments)
- [Terraform](https://www.terraform.io/docs/providers/azurestack/index.html)

これらのツールを使うときも、PowerShell と同じように接続先を明示しなければなりません。過去のエントリに[Terraformのサンプル](https://aimless.jp/blog/archives/2018-06-21-terraform-on-azurestack/)がありますので、気になる方はご確認ください。

## おわりに

本日のエントリでは、管理者と利用者が Azure Stack にアクセスする方法をまとめました。古い PowerShell モジュールを使う必要があること、API のエンドポイントが違うため接続先を切り替える必要があること、の2つがポイントです。

---
title: App Service on Azure Stack（ Resource Provider 編）
author: kongou_ae
date: 2019-03-05
url: /archives/2019-03-05-install-appservice-resource-provider-to-azurestack
categories:
  - azurestack
---

## はじめに

本エントリは、App Service on Azure Stack の3本目です。

1. [App Service on Azure Stack（サーバ証明書編）](https://aimless.jp/blog/archives/2018-11-05-appservice-on-asdk-about-cert/)
1. [App Service on Azure Stack（ファイルサーバとSQLサーバの用意編）](https://aimless.jp/blog/archives/2018-11-11-appservice-on-asdk-about-infra/)
1. [App Service on Azure Stack（ Resource Provider 編）](https://aimless.jp/blog//archives/2019-03-05-install-appservice-resource-provider-to-azurestack/)

前回のエントリーでは、App Service Resource Provider の前提となる ファイルサーバと SQL サーバをインストールしました。本エントリでは、Azure Stack 上の App Service をつかさどる App Service Resource Provider をインストールします。

## 前回の結果

[App Service on Azure Stack （ファイルサーバとSQLサーバの用意編）](https://aimless.jp/blog/archives/2018-11-11-appservice-on-asdk-about-infra/)では、公式が用意している [ARM テンプレート](https://github.com/Azure/AzureStack-QuickStart-Templates/tree/master/appservice-fileserver-sqlserver-ha)を利用してファイルサーバと SQL サーバを用意しました。その結果、Azure Stack の管理者側には次のような環境が出来上がっています。

{{< figure src="./../../images/2019-03-05-001.png" title="テンプレートで作成された環境" >}}

## App Service resource provider のインストール

App Service resource provider のインストールは、公式ドキュメントのとおりインストーラを起動してパラメータを入力していけばOKです。

参考：[Add an App Service resource provider to Azure Stack](https://docs.microsoft.com/en-us/azure/azure-stack/azure-stack-app-service-deploy)

公式が用意している ARM テンプレートで作成したファイルサーバと SQL Server を利用する場合の注意点は次の通りです。

### インストーラに入力するパラメータ

インストーラに入力するパラメータは次の通りです。

- Virtual Network の名前とサブネット
- ファイル共有のパス
- ファイル共有のオーナアカウントとパスワード
- ファイル共有のユーザアカウントとパスワード
- SQL サーバのIPアドレス
- SQL サーバの sysadmin アカウントとパスワード

Virtual Network の名前とサブネットは、テンプレートがデプロイした VNet の値を確認しましょう。それ以外の項目はテンプレートのアウトプットに表示されています。便利。

{{< figure src="./../../images/2019-03-05-002.png" title="テンプレートのアウトプット" >}}

### インストーラの実行場所

VNetの中に存在する SQL サーバ（ sql-0 または sql-1 ）でインストーラを実行したほうが良いです。インストーラはファイルサーバと SQL サーバのIPアドレスと接続情報が正しいかどうかを実際に接続して確認してくれます。VNet 外部のサーバ上でインストーラを実行すると、VNet 内部に存在する ファイルサーバと SQL サーバに接続できないため、インストーラによる確認機能を利用できません。

テンプレートからデプロイした直後の SQL サーバには、VNet 外部からアクセスできません。SQL サーバに一時的に Public IP Address を割り当てたうえで、NSG でリモートアクセスを許可しましょう。

```powershell
# PIP for SQL0
$sqlpip = New-AzureRmPublicIpAddress -Name sql0 -ResourceGroupName apps-infra -Location local -AllocationMethod Static
$sqlnic = Get-AzureRmNetworkInterface -ResourceGroupName apps-infra -Name aps-sql-0-nic
$sqlnic.IpConfigurations[0].PublicIpAddress = $sqlpip
Set-AzureRmNetworkInterface -NetworkInterface $sqlnic

# NSG for SQL0
$sqlNsg = Get-AzureRmNetworkSecurityGroup -ResourceGroupName apps-infra -Name aps-sql-Nsg
Add-AzureRmNetworkSecurityRuleConfig `
-Name "RDP" `
-NetworkSecurityGroup $sqlNsg `
-Description "RDP" `
-Protocol "TCP" `
-SourcePortRange "*" `
-DestinationPortRange "3389" `
-SourceAddressPrefix "*" `
-DestinationAddressPrefix "VirtualNetwork" `
-Access "Allow" `
-Priority "100" `
-Direction "Inbound"
Set-AzureRmNetworkSecurityGroup -NetworkSecurityGroup $sqlNsg
```

### WorkerSubnet 用 NSG の更新

1時間ほど待つと App Service Resource Provider のデプロイが終わります。デプロイが終わった後に必要な作業が2つあります。一つ目は WorkerSubnet の NSG に対するルールの追加です。WorkerSubnet には利用者のアプリケーションが動作する VMSS が稼働します。これらの VMSS はファイルサーバにアクセスする必要があります。にも関わらず、テンプレートがデプロイする NSG には SMB の通信が許可されていません。このままだと VMSS の構築に失敗します。

```powershell
$workerNsg = Get-AzureRmNetworkSecurityGroup -ResourceGroupName apps-infra -Name WorkersNsg
Add-AzureRmNetworkSecurityRuleConfig `
-Name "SMB" `
-NetworkSecurityGroup $workerNsg `
-Description "SMB" `
-Protocol "TCP" `
-SourcePortRange "*" `
-DestinationPortRange "445" `
-SourceAddressPrefix "*" `
-DestinationAddressPrefix "VirtualNetwork" `
-Access "Allow" `
-Priority "700" `
-Direction "Outbound"
Set-AzureRmNetworkSecurityGroup -NetworkSecurityGroup $workerNsg
```

### Availability Group への データベース追加

２つ目が、Availability Group への データベース追加です。App Service Resource Provider をデプロイすると、SQL サーバ上に「appservice_hosting」と「appservice_metering」というデータベースができます。ただし、これらのデータベースは Availability Group に追加されていません。このままでは正系の SQL サーバが停止した際に、アクセスできるデータベースがなくなってしまいます。手動で Availability Group にデータベースを追加して、正系と副系の両系が「appservice_hosting」と「appservice_metering」というデータベースを持つようにしましょう。

{{< figure src="./../../images/2019-03-05-003.png" title=" Availability Group へのデータベース追加" >}}

### SKU を増やす

デプロイ直後の App Service Resource Provider は利用者に対して、F1 Free と D1 Shared の SKU のみを提供します。Standard な SKU を提供したい場合は、SKU に対応した VMSS をスケールアウトしましょう。スケールアウトしたインスタンスが実際に使えるようになるまでには数十分かかります。じっくり待ちましょう。

{{< figure src="./../../images/2019-03-05-004.png" title="App Service Resource Provider の設定画面" >}}

{{< figure src="./../../images/2019-03-05-005.png" title="VMSS の設定画面" >}}

## デプロイの結果

App Service Resource Provider をデプロイすると、テンプレートでデプロイした VNet を利用して次のリソースが作成されます。なかなか壮大な仕組みです。当然、これらのリソースは Host Node のリソースを消費して動作します。また、Azure Stack Operator はこれらのリソースを維持管理しなければなりません。

{{< figure src="./../../images/2019-03-05-006.png" title="App Service Resource Provider の全体図" >}}

## まとめ

3回にわたって、Azure Stack 上に App Service をインストールする方法をまとめました。前提条件となる SQL サーバとファイルサーバを構築する ARM テンプレートが公開されているので、App Service Resource Provider 自体のインストールは大変簡単です。オンプレミスで App Service が動くという不思議な体験をぜひお楽しみください。

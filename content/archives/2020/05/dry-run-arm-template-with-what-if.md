---
title: what-if を利用して ARM テンプレートを Dry run する
author: kongou_ae
date: 2020-05-04
url: /archives/2020/05/dry-run-arm-template-with-what-if
categories:
  - azure
---

## はじめに

Infrastructure as code(IaC) を実現するツールの中には Dry run の機能を有するものがあります。有名どころだと Terraform の terraform plan でしょうか。Dry run の機能があればツールがどのような変更を実施するかを事前に確認できますので、ツールを用いた変更作業のリスクを軽減できます。

Azure で IaC を実現する仕組みの一つである ARM テンプレートには、Dry run の機能がありませんでした。ですが Ignite 2019 で Dry run を実現する機能である What if が Private Preview として発表されました。

[What’s new with Azure Resource Manager (ARM) templates for your deployments](https://myignite.techcommunity.microsoft.com/sessions/84121?source=SessionDeck)

この What if が 4月上旬に Public Preview になっていました。

[ARM template deployment what-if operation (Preview)](https://docs.microsoft.com/en-us/azure/azure-resource-manager/templates/template-deploy-what-if?tabs=azure-powershell)

https://github.com/MicrosoftDocs/azure-docs/commit/83df3c1fc32b9e5d76a0536fb0381320748e1dda#diff-4f133ff96df7212e2c8a7848e7cdb177

待ちに待った機能なので試してみました。

## 準備

What if は PowerShell 5.x では動きません。PowerShell Core の6.x か 7.x が必要です。今回は PowerShell Core の 6.4 をインストールしました。

```powershell
> $PSVersionTable

Name                           Value
----                           -----
PSVersion                      6.2.4
PSEdition                      Core
GitCommitId                    6.2.4
OS                             Microsoft Windows 10.0.18363
Platform                       Win32NT
PSCompatibleVersions           {1.0, 2.0, 3.0, 4.0…}
PSRemotingProtocolVersion      2.3
SerializationVersion           1.1.0.1
WSManStackVersion              3.0
```

そのうえで、プレビュー版の Az.Resources モジュールをインストールします。

```powershell
Install-Module Az.Resources -RequiredVersion 1.12.1-preview -AllowPrerelease
```

## 動作確認

What if の動作確認のために、前提となるシンプルな VNet をデプロイしました。

```
{
    "$schema": "https://schema.management.azure.com/schemas/2019-04-01/deploymentTemplate.json#",
    "contentVersion": "1.0.0.0",
    "parameters": {},
    "resources": [
        {
            "type": "Microsoft.Network/virtualNetworks",
            "name": "Vnet0503",
            "apiVersion": "2017-06-01",
            "location": "japaneast",
            "properties": {
                "addressSpace": {
                    "addressPrefixes": [
                        "10.0.0.0/16"
                    ]
                },
                "subnets": [
                    {
                        "name": "subnet01",
                        "properties": {
                            "addressPrefix": "10.0.0.0/24",
                            
                        }
                    }
                ]
            }
        }
    ]
}
```

Dry run のみ実行する場合、`Get-AzResourceGroupDeploymentWhatIfResult` を利用します。`Get-AzResourceGroupDeploymentWhatIfResult` を利用して、この VNet に対して新規サブネットの追加と DNS サーバの追加を実施する次のテンプレートをデプロイしました。

```
{
    "$schema": "https://schema.management.azure.com/schemas/2019-04-01/deploymentTemplate.json#",
    "contentVersion": "1.0.0.0",
    "parameters": {},
    "resources": [
        {
            "type": "Microsoft.Network/virtualNetworks",
            "name": "Vnet0503",
            "apiVersion": "2017-06-01",
            "location": "japaneast",
            "properties": {
                "addressSpace": {
                    "addressPrefixes": [
                        "10.0.0.0/16"
                    ]
                },
                "subnets": [
                    {
                        "name": "subnet01",
                        "properties": {
                            "addressPrefix": "10.0.0.0/24",
                            
                        }
                    },
                    {
                        "name": "subnet02",
                        "properties": {
                            "addressPrefix": "10.0.1.0/24"
                        }
                    }
                ],
                "dhcpOptions": {
                    "dnsServers": [
                        "8.8.8.8"
                    ]
                }
            }
        }
    ]
}
```

すると次のように、新規サブネットの追加と DNS サーバの追加の2つが期待される変更として表示されました。この時点でもう最高です。

```powershell
> Get-AzResourceGroupDeploymentWhatIfResult -Name whatif -ResourceGroupName whatif -TemplateFile .\vnet.json

Note: As What-If is currently in preview, the result may contain false positive predictions (noise).     
  + Create
  ~ Modify

The deployment will update the following scope:

Scope: /subscriptions/9c171efd-eab4-4f0b-91d7-c5bd3103e127/resourceGroups/whatif

  ~ Microsoft.Network/virtualNetworks/Vnet0503 [2017-06-01]
    + properties.dhcpOptions:

        dnsServers: [
          0: "8.8.8.8"
        ]

    ~ properties.subnets: [
      + 1:

          name:                     "subnet02"
          properties.addressPrefix: "10.0.1.0/24"

      ]

Resource changes: 1 to modify.
```

しかも、分かりやすい色付きで変更が出力されました。

<blockquote class="twitter-tweet" data-theme="light"><p lang="ja" dir="ltr">ARM Template でこれができるの最高じゃないっすか。。。 <a href="https://t.co/rbj943EqBs">pic.twitter.com/rbj943EqBs</a></p>&mdash; こんごー (@kongou_ae) <a href="https://twitter.com/kongou_ae/status/1256925882402271232?ref_src=twsrc%5Etfw">May 3, 2020</a></blockquote> <script async src="https://platform.twitter.com/widgets.js" charset="utf-8"></script>

デプロイ時に確認を挟みたい場合は、`New-AzResourceGroupDeployment` を `-Confirm` つきで実行します。`-Confirm` をつけて上記のテンプレートをデプロイしたら、`Get-AzResourceGroupDeploymentWhatIfResult` と同じメッセージが出力されたあとに、デプロイするかどうかを確認するメッセージがでました。

```
Are you sure you want to execute the deployment?
[Y] Yes  [A] Yes to All  [N] No  [L] No to All  [S] Suspend  [?] Help (default is "Y"):
```

今後は削除してみます。`-Confirm` 付きの `New-AzResourceGroupDeployment` を利用して subnet02 を削除した次のテンプレートをデプロイしました。

```
{
    "$schema": "https://schema.management.azure.com/schemas/2019-04-01/deploymentTemplate.json#",
    "contentVersion": "1.0.0.0",
    "parameters": {},
    "resources": [
        {
            "type": "Microsoft.Network/virtualNetworks",
            "name": "Vnet0503",
            "apiVersion": "2017-06-01",
            "location": "japaneast",
            "properties": {
                "addressSpace": {
                    "addressPrefixes": [
                        "10.0.0.0/16"
                    ]
                },
                "subnets": [
                    {
                        "name": "subnet01",
                        "properties": {
                            "addressPrefix": "10.0.0.0/24"
                        }
                    }
                ],
                "dhcpOptions": {
                    "dnsServers": [
                        "8.8.8.8"
                    ]
                }
            }
        }
    ]
}
```

デプロイする前に期待される変更が表示されます。今回は subnet02 が削除されることが表示されていました。

```
> New-AzResourceGroupDeployment -TemplateFile .\vnet.json -Confirm -Name whatif -ResourceGroupName whatif 

Note: As What-If is currently in preview, the result may contain false positive predictions (noise).
You can help us improve the accuracy of the result by opening an issue here: https://aka.ms/WhatIfIssues.

Resource and property changes are indicated with these symbols:
  - Delete
  ~ Modify

The deployment will update the following scope:

Scope: /subscriptions/9c171efd-eab4-4f0b-91d7-c5bd3103e127/resourceGroups/whatif

  ~ Microsoft.Network/virtualNetworks/Vnet0503 [2017-06-01]
    ~ properties.subnets: [
      - 1:

          name:                     "subnet02"
          properties.addressPrefix: "10.0.1.0/24"

      ]

Resource changes: 1 to modify.

Are you sure you want to execute the deployment?
[Y] Yes  [A] Yes to All  [N] No  [L] No to All
```

追加と同じように、削除もわかりやすく色付きで表示されました。

<blockquote class="twitter-tweet"><p lang="ja" dir="ltr">削除は赤く表示されます。 <a href="https://t.co/HNakInhjcp">pic.twitter.com/HNakInhjcp</a></p>&mdash; こんごー (@kongou_ae) <a href="https://twitter.com/kongou_ae/status/1256931672622116865?ref_src=twsrc%5Etfw">May 3, 2020</a></blockquote> <script async src="https://platform.twitter.com/widgets.js" charset="utf-8"></script>

## まとめ
What if を利用した ARM テンプレートの Dry run をまとめました。最高です。

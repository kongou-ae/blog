---
title: Test-AzureStackでAzure Stackの状態をチェックする
author: kongou_ae
date: 2018-06-21
url: /archives/2018-06-21-test-azurestack
categories:
  - azurestack
---

Azure Stackには、Azure Stackが自分の状態を自己診断するためのコマンドがあります。その名も"Test-AzureStack"です。

(Run a validation test for Azure Stack)[https://docs.microsoft.com/en-us/azure/azure-stack/azure-stack-diagnostic-test]

## 環境
- Azure Stack：ASDK 1.1805.1.47
- PowerShell: Azure Stack Admin 1.3.0

## 実戦

まずはPowerShellでPrivileged EndPointに接続します。

```powershell
PS C:\Users\AzureStackAdmin> $pssession = New-PSSession -ComputerName azs-ercs01 -ConfigurationName PrivilegedEndpoint
PS C:\Users\AzureStackAdmin> Import-PSSession $pssession
```

"Test-AzureStack"を実行してしばし待つと、自己診断の結果を次のように分かりやすく結果を表示してくれます。何もオプションをつけずに実行すると、基盤としての機能が正常かどうかを自己診断します。

{{<img src="./../../images/2018-06-21-001.png">}}

ただし、システム全体でみると、基盤としての正常性だけでなくリソースを作成できるかも自己診断する必要があります。そのためのオプションが"ServiceAdminCredentials"です。オプションには管理者のサブスクリプションに対して権限を有するAADアカウントを渡します。

```powershell
PS C:\Users\AzureStackAdmin> Test-AzureStack -ServiceAdminCredentials admin@xxxxxxx.onmicrosoft.com
```

すると、"Test-AzureStack"は、リソースを作成できるかを自己診断するために実際にリソースを作成します。

{{<img src="./../../images/2018-06-21-004.png">}}

そのうえで、結果を次のように分かりやすく表示してくれます。

{{<img src="./../../images/2018-06-21-002.png">}}

異常が見つかった項目は赤く表示されます。"Test-AzureStack"が失敗したときの絶望感は半端ないです。

{{<img src="./../../images/2018-06-21-003.png">}}

Microsoftのエンジニアが自分のAzure Stackを初期診断してくれるような気分になるコマンドです。分かりやすさゆえに、Microsoftのサポートエンジニアとのコミュニケーションツールになっています。「アラートが出たからとりあえずTest-AzureStackを実行する=>助けてCSS、うちのAzure StackがFAILしてるの（Test-AzureStackのキャプチャを添付）・・・」や「CSSに障害対応してもらう=>うちのAzure Stack、オールグリーンだよありがとう（Test-AzureStackのキャプチャを添付）」といったやりとりで利用しています。

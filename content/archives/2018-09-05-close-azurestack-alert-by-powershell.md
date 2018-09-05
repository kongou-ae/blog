---
title: Azure StackのアラートをPowerShellで操作する
author: kongou_ae
date: 2018-09-05
url: /archives/2018-09-05-close-azurestack-alert-by-powershell
categories:
  - azurestack
---

## はじめに

Azure Stackは、異常を検知するとアラートを生成します。Azure Stack OperatorはこのアラートをAdmin Portalで簡単に確認できます。

{{<img src="./../../images/2018-0905-001.png">}}

アラートのトリガーとなった事象が解決されると、これらのアラートは自動的にクローズされます。ただし、まれに自動的にクローズされない場合があります。その時はアラートを手動でクローズする必要があります。

{{<img src="./../../images/2018-0905-002.png">}}

にもかかわらず、直近でデプロイしたAzure Stack Development Kit 1807では、Admin Portalでアラートを手動クローズできません。困りました。そこで、PowerShellでアラートを操作してみました。

## 環境

- Azure Stack：ASDK 1.1807.0.76
- PowerShell: Azure Stack Admin 1.4.0

## アラートを表示する

"Get-AzsAlert"を利用します。

```PowerShell
Get-AzsAlert | Sort-Object { $_.CreatedTimestamp } -Descending
```

{{<img src="./../../images/2018-0905-003.png">}}

## アラートを抽出する

"-Filter"オプションを使うと特定条件のアラートを抽出できます。私は、分かりやすい"Where-Object"が好きです。

```PowerShell
Get-AzsAlert -Filter "Properties/State eq 'Active'" | Sort-Object { $_.CreatedTimestamp } -Descending
Get-AzsAlert | Where-Object { $_.State -eq "Active"} | Sort-Object { $_.CreatedTimestamp } -Descending
```

{{<img src="./../../images/2018-0905-004 .png">}}

## アラートをクローズする

"Close-AzsAlert"を利用します。"-Name"オプションにアラートのIDを渡します。

```PowerShell
Close-AzsAlert -name ec7cbbb7-1581-41ad-bb75-37349abd4434 -Force -Verbose
```

{{<img src="./../../images/2018-0905-005.png">}}

クローズしたいアラートを抽出したうえでforeachでループさせれば、対象のアラートを一括でクローズするできます。


```Powershell
$alerts = Get-AzsAlert | Where-Object { $_.State -eq "Active"} 
$alerts | ForEach-Object {
    Close-AzsAlert -Name $_.AlertId -Force -Verbose
}
```

## 終わりに

Azure StackのアラートをPowerShellで操作する方法をまとめました。複数のアラートをまとめてクローズしなければならないシーンや、アラートをトリガーとした自動化で活躍すると思います。

---
title: PowerShell を使って Azure のサポートリクエストを送信する
author: kongou_ae
date: 2020-04-21
url: /archives/2020/04/open-azure-support-request-by-powershell
categories:
  - azure
---

API を利用して Azure のサポートリクエストを送信できるようになりました。Public Preview を経由せずにいきなり GA したような気がします。

[Azure サポート API の一般提供が開始されました](https://azure.microsoft.com/ja-jp/updates/azure-support-api-is-generally-available/)

「よーし、API を直接叩いて SR を送るかー」と思って調べた結果、PowerShell のモジュールがリリースされていることを発見しました。

[Az.Support](https://docs.microsoft.com/en-us/powershell/module/az.support/?view=azps-3.7.0)

本エントリでは、PowerShell を使って Azure のサポートリクエストを送信する方法をまとめます。

## サービスを識別する ID を取得する

API 経由でサポートリクエストを送信する場合、ProblemClassificationId という問題を識別するユニークな ID を指定する必要があります。この ID を取得するためには問題が発生しているサービスを識別する ID が必要になります。Get-AzSupportService を利用して、サポートリクエストを送信したいサービスの ID を取得します。

```powershell
$supportServiceName = Get-AzSupportService | Where-Object { $_.DisplayName -eq "Azure Stack Hub"}       
$supportServiceName | fl *

Id            : /providers/Microsoft.Support/services/32d322a8-acae-202d-e9a9-7371dccf381b
Name          : 32d322a8-acae-202d-e9a9-7371dccf381b
Type          : Microsoft.Support/services
DisplayName   : Azure Stack Hub
ResourceTypes : {Microsoft.AzureStack/registrations}
```

## 問題を識別する ID を取得する

サービスを識別する ID を利用して、ProblemClassificationId を取得します。利用するコマンドは Get-AzSupportProblemClassification です。

```
$problemClassificationId = Get-AzSupportProblemClassification -serviceid $supportServiceName.Id | where-object {$_.DisplayName -eq "ASDK - Azure Stack Development Kit / Azure Stack Development Kit"}

PS C:\Users\MatsumotoYusuke> $problemClassificationId | fl *



Id          : /providers/Microsoft.Support/services/32d322a8-acae-202d-e9a9-7371dccf381b/problemClassifications/9dded50f-68e9-19d9-812f-c867b98c3771
Name        : 9dded50f-68e9-19d9-812f-c867b98c3771
Type        : Microsoft.Support/problemClassifications
DisplayName : ASDK - Azure Stack Development Kit / Azure Stack Development Kit
```

## サポートリクエストを送信する

取得した ProblemClassificationId を利用して、サポートリクエストを送信します。利用するコマンドは New-AzSupportTicket です。

```
New-AzSupportTicket -Name $Name.Guid `
    -Title "The test for support API" `
    -Description "Sorry. This is for test of Support API. I will close this SR. You can ignore this SR." `
    -ProblemClassificationId $problemClassificationId.Id  `
    -Severity "minimal" `
    -CustomerFirstName "Taro" `
    -CustomerLastName "Yamada" `
    -PreferredContactMethod "email" `
    -CustomerPrimaryEmailAddress "yamada-taro@aimless.jp" `
    -CustomerPreferredTimeZone "Tokyo Standard Time" `
    -CustomerCountry "JPN" `
    -CustomerPreferredSupportLanguage "ja-jp"
```

利用可能なオプションは次の URL に記載されています。

[Parameters](https://docs.microsoft.com/en-us/powershell/module/az.support/new-azsupportticket?view=azps-3.7.0#parameters)

24時間365日の対応を要請する Require24X7Response や、関連するリソースを明記する TechnicalTicketResourceId など、ポータルからサポートリクエストを送信する際にお馴染みのオプションが見当たります。

## オチ

私の検証用サブスクリプションで上記のコマンドを実行した結果、次のエラーが発生してサポートリクエストを送信できませんでした。

```
New-AzSupportTicket : Long running operation failed with status 'Failed'. Additional Info:'Your support plan type is Developer. To create and update support tickets,
    and add communication operations, you need access to our high tier-support plans. Learn more at https://aka.ms/supportapi'
   発生場所 行:1 文字:1
   + New-AzSupportTicket -Name $Name.Guid `
   + ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
       + CategoryInfo          : CloseError: (:) [New-AzSupportTicket]、CloudException
       + FullyQualifiedErrorId : Microsoft.Azure.Commands.Support.SupportTickets.NewAzSupportTicket
```

API のリファレンスをちゃんと読んだところ、この API を利用できるサポートプランが明記されていました。私のサブスクリプションは Developer プランなので、そもそも この API を利用できませんでした・・・下調べせずに検証するのよくない。

> A Professional Direct, Premier, or Unified technical support plan. For more information, see Compare support plans.

引用：[Prerequisites](https://docs.microsoft.com/en-us/rest/api/support/#prerequisites)

## まとめ
PowerShell を使って Azure のサポートリクエストを送信する方法をまとめました。サポートプランの関係でリクエストを受け入れてもらえませんでしたが、手順としてはあっているはずです・・・業務で定型的なサポートリクエストを定期的に送信している場合は検討の余地がありそうです。ポータルぽちぽちから解放されます。

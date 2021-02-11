---
title: Azure リザーブドインスタンスの使用率を PowerShell で確認する
author: kongou_ae
date: 2021-02-11
url: /archives/2021/02/check-utilization-of-ri-by-cli
categories:
  - azure
---

## はじめに

リザーブドインスタンスを使い始めると気になるのが「リザーブドインスタンスが従量課金のインスタンスにもれなく適用されているか」という点です。リザーブドインスタンスとは「リザーブドインスタンスの対象となるサイズのインスタンスが起動している場合、そのインスタンスの従量課金の費用がゼロになる」という仕組みです。そのため、何かしらの理由で従量課金のインスタンスのサイズを変更したり、従量課金のインスタンスを削除してしまうと、従量課金の費用が発生してしまい一括支払いで購入したリザーブドインスタンスが無駄になってしまいます。

この問題を早期に検出するためには、リザーブドインスタンスの使用率を定期的に確認する必要があります。AWS の場合は [AWS Budgets を利用して使用率を監視できる](https://aws.amazon.com/jp/about-aws/whats-new/2018/05/reserved-instance-coverage-alerts-via-aws-budgets/)ようなのですが、2021年2月現在の Azure にはこのような機能がありません。もちろんポータルでは使用率を確認できますので、ポータルを使えば「人間がたまに見る運用」が可能です。ですが、使用率を定期的に自動で監視したい場合、自前の仕組みを構築する必要があります。

## PowerShell による確認

自前の仕組みを作るためには、CLI や API でリザーブドインスタンスの使用率を取得する必要があります。PowerShell で取得できれば Azure Function を使って自前の仕組みを簡単に作れます。

リザーブドインスタンス用の Az.Reservation モジュールに含まれる [Get-AzReservation](https://docs.microsoft.com/en-us/powershell/module/az.reservations/get-azreservation?view=azps-5.5.0) では使用率を取得できません。

```powershell
PS > Get-AzReservation -ReservationOrderId f8bede6a-14fe-xxxx-xxxx-xxxxxxxxxxxx | fl *


Sku                  : Standard_B1ls
Location             : japaneast
Etag                 : 9
Id                   : /providers/microsoft.capacity/reservationOrders/f8bede6a-14fe-xxxx-xxxx-xxxxxxxxxxxx/reservations/1f200f6e-3ff6-xxxx-xxxx-xxxxxxxxxxxx
Name                 : f8bede6a-14fe-xxxx-xxxx-xxxxxxxxxxxx/1f200f6e-3ff6-xxxx-xxxx-xxxxxxxxxxxx
Type                 : Microsoft.Capacity/reservationOrders/reservations
ReservedResourceType : VirtualMachines
InstanceFlexibility  : On
DisplayName          : VM_RI_02-10-2021_19-09
AppliedScopes        :
AppliedScopeType     : Shared
Quantity             : 1
ProvisioningState    : Succeeded
EffectiveDateTime    : 2021/02/10 10:13:06
LastUpdatedDateTime  : 2021/02/10 10:13:06
ExpiryDate           : 2022/02/10 0:00:00
SkuDescription       : 予約 VM インスタンス、Standard_B1ls、東日本、1 年
ExtendedStatusInfo   :
SplitProperties      :
MergeProperties      :
```

リザーブドインスタンスの使用率を取得するためには Get-AzConsumptionReservationSummary を利用します。次のサンプルは2月9日から2月10日までの使用率を取得したものです。maxUtilizationPercentage が100％になっています。MaxUtilizationPercentage が100%かどうかを監視すれば、リザーブドインスタンスが無駄になっているかを確認できます。

[Reservations Summaries - List By Reservation Order](https://docs.microsoft.com/en-us/rest/api/consumption/reservationssummaries/listbyreservationorder)

```powershell
PS > Get-AzConsumptionReservationSummary -Grain daily -ReservationOrderId f8bede6a-14fe-xxxx-xxxx-xxxxxxxxxxxx -ReservationId 1f200f6e-3ff6-xxxx-xxxx-xxxxxxxxxxxx -StartDate 2021-02-09 -EndDate 2021-02-10


AveUtilizationPercentage : 100
Id                       : providers/Microsoft.Capacity/reservationOrders/f8bede6a-14fe-xxxx-xxxx-xxxxxxxxxxxx/reservations/1f200f6e-3ff6-xxxx-xxxx-xxxxxxxxxxxx/providers/Microsoft.Consumption/reservationSummaries/20210210
MaxUtilizationPercentage : 100
MinUtilizationPercentage : 0
Name                     : f8bede6a-14fe-xxxx-xxxx-xxxxxxxxxxxx_1f200f6e-3ff6-xxxx-xxxx-xxxxxxxxxxxx_20210210
ReservationId            : 1f200f6e-3ff6-xxxx-xxxx-xxxxxxxxxxxx
ReservationOrderId       : f8bede6a-14fe-xxxx-xxxx-xxxxxxxxxxxx
ReservedHour             : 14
SkuName                  : Standard_B1ls
Tag                      :
Type                     : Microsoft.Consumption/reservationSummaries
UsageDate                : 2021/02/10 0:00:00
UsedHour                 : 14
```

## 使用率を確認する際の注意点

使用率を監視する仕組みを自前で作る際の注意点が権限です。Azure リザーブドインスタンスは権限の仕組みが他のリソースと異なります。リザーブドインスタンスを購入した直後は、購入したアカウントとサブスクリプションのアカウント管理者のみがリザーブドインスタンスへのアクセス権を持っています。そのため、サブスクリプションの所有者や共同作成者であったとしてもリザーブドインスタンスを閲覧すらできません。Azure Function や Logic Apps などで確認を自動化する場合、リザーブドインスタンスを作成するたびに、認証で利用するサービスプリンシパルや Managed Identity にリザーブドインスタンスの閲覧権限を付与する必要があります。

## まとめ

本エントリでは CLI を利用してリザーブドインスタンスの使用率を確認する方法をまとめました。PowerShell を使えばリザーブドインスタンスの使用率を CLI で取得できますので、自前で使用率を監視する仕組みを作れます。とはいえ自前の仕組みを作らない方が楽なので、リザーブドインスタンスの使用率を監視できるネイティブな仕組みのリリースに期待です。

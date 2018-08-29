---
title: Azure Stackのユーザサブスクリプションを無効にする
author: kongou_ae
date: 2018-08-29
url: /archives/2018-08-29-disable-azurestack-usersubscription
categories:
  - azurestack
---

## はじめに

Azureのクレジット型サブスクリプションでクレジットを使い果たすと、サブスクリプションが"Disabled"になります。Virtual Machineが停止して、新規リソースが作れなくなります。

{{<img src="./../../images/2018-0829-001.png">}}

Azure Stackでも同じことができます。お金を払わないユーザが利用するサブスクリプションを無効にして、限られたリソースを有効活用しましょう。

## 環境

- Azure Stack：ASDK 1.1807.0.76
- PowerShell: Azure Stack Admin 1.4.0

## ユーザサブスクリプションを無効化する

ユーザサブスクリプションの無効化はAzure Stack Operatorの作業です。具体的には、"Set-AzsUserSubscription"を利用してユーザサブスクリプションの"State"を"Disabled"にします。

{{<img src="./../../images/2018-0829-005.png">}}

```Powershell
Set-AzsUserSubscription -SubscriptionId 5264c1c3-e6eb-4301-bee4-245aaea17832 -State Disabled
```

すると、adminportal上のユーザサブスクリプションの表示が"Disabled"に変わります。

{{<img src="./../../images/2018-0829-006.png">}}

## ユーザサブスクリプションが無効化されると？

Azure Stack Operatorがユーザサブスクリプションを"Disabled"にした場合、Azureど同様、サブスクリプションが読み取り専用になります。

Azureと同様、サブスクリプションの表示は"Disabled"になります。

{{<img src="./../../images/2018-0829-009.png">}}

Virtual Machineのステータスが"Failed"になり、アクセスできなくなります。

{{<img src="./../../images/2018-0829-010.png">}}

Hyper-Vで該当のVirtual Machineの状況を確認すると、Stateが"OFF"になっています。

{{<img src="./../../images/2018-0829-008.png">}}

Disabledなサブスクリプションを利用してリソースを作ろうとすると、エラーになります。

{{<img src="./../../images/2018-0829-011.png">}}

## ユーザサブスクリプションを有効化化する

ユーザがお金を払ってくれるようになったら、無効化を解除する必要があります。"Set-AzsUserSubscription"を利用してユーザサブスクリプションの"State"を"Enabled"にします。

```Powershell
Set-AzsUserSubscription -SubscriptionId 5264c1c3-e6eb-4301-bee4-245aaea17832 -State Enabled
```

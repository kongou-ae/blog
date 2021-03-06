---
title: Azure Lighthouse を試した
author: kongou_ae
date: 2019-07-13
url: /archives/2019/07/first-impression-of-lighthouse
categories:
  - azure
---

## はじめに

Azure Lighthouse が発表されました。自分のリソースの管理を他の AAD に委任できるサービスです。リリースのアナウンスでは MSP がサービス提供するシナリオが強調されていますが、MSP でなくても利用できるサービスです。シンプルな設定で動作を確認した結果をメモします。

[Introducing Azure Lighthouse](https://azure.microsoft.com/en-us/blog/introducing-azure-lighthouse/)

## 委任される側の作業

まずは、委任される側のサブスクリプションで委任先を作ります。ドキュメントを読む限りだと次の3つが委任先の対象のようです。

1. Azure AD のグループ
2. Service Principle
3. Managed Identity

今回は Azure AD のグループを利用します。Azure AD のグループを作って、権限を委任されるユーザをグループに追加します。また、後続作業で必要になるので、グループのオブジェクト ID を控えておきます。

## 委任する側の作業

管理を委任する側で必要な作業は次の2つです。

1. ManagedServices リソースプロバイダの登録
2. 委任先の登録

### 1. Managed Services リソースプロバイダの登録

まずは Managed Services リソースプロバイダを追加します。今回はポータルからぽちっとしました。

{{< figure src="/images/2019-0713-001.png" title="Managed Services リソースプロバイダ" >}}

### 2. 委任先の登録

次に、委任先を登録します。委任の単位はサブスクリプションとリソースグループです。今回はサブスクリプション単位で権限を委任します。委任の単位によって利用する ARM テンプレートが違うので注意が必要です。

[Create an Azure Resource Manager template](https://docs.microsoft.com/ja-jp/azure/lighthouse/how-to/onboard-customer#create-an-azure-resource-manager-template)

委任する権限を RBAC で指定する必要があります。今回は Contributor(b24988ac-6180-42a0-ab88-20f7382dd24c)の権限を委任します。

パラメータを指定する json で入力するする項目と意味は次の通りです。

| 項目 | 意味 |
|------|-------|
|mspName|委任先の組織を識別する名称|
|mspOfferDescription|委任先となる組織の説明|
|managedByTenantId| 委任先の AAD のディレクトリ ID|
|principalId|権限の委任先となる対象の ID |
|principalIdDisplayName|権限の委任先の名称|
|principalIdDisplayName|委任する RBAC の ID|

今回は次のようなパラメータを利用しました。

```json
{
    "$schema": "https://schema.management.azure.com/schemas/2018-05-01/subscriptionDeploymentParameters.json#",
    "contentVersion": "1.0.0.0",
    "parameters": {
        "mspName": {
            "value": "aimless-msp" 
        },
        "mspOfferDescription": {
            "value": "aimless-msp by mvp subscription"
        },
        "managedByTenantId": {
            "value": "xxxxxxxx-xxxx-443f-91e0-xxxxxxxxxxxx"
        },
        "authorizations": {
            "value": [
                {
                    "principalId": "cf083731-74bb-41cb-a9fb-70a4414bf9e2",
                    "principalIdDisplayName": "Tier 1 Support",
                    "roleDefinitionId": "b24988ac-6180-42a0-ab88-20f7382dd24c"
                }                
            ]
        }
    }
}
```

## 動作確認

### 委任元

委任する側の作業が完了すると、委任する側のサブスクリプションの Service Providers > Service providers offers に、登録した委任先が表示されます。AAD のテナント ID から自動的に取得したテナント名が表示されるようなので、委任元に見られても恥ずかしくないテナント名にしましょう。

{{< figure src="/images/2019-0713-002.png" title="Service providers offers の表示" >}}

そして、Service Providers > Delegations にどのリソースがどの権限を委任しているかが表示されます。

{{< figure src="/images/2019-0713-003.png" title="Delegations の表示その1" >}}

{{< figure src="/images/2019-0713-004.png" title="Delegations の表示その2" >}}

### 委任先

委任する側の作業が完了すると、委任先のサブスクリプションの My customers > Customers に委任された顧客が表示されます。

{{< figure src="/images/2019-0713-005.png" title="Customers の表示" >}}

そして、My customers > Delegations にどの顧客のリソースをだれがどの権限で委任されているかが表示されます。

{{< figure src="/images/2019-0713-006.png" title="Delegations の表示その2" >}}

{{< figure src="/images/2019-0713-007.png" title="Delegations の表示その2" >}}

委任された側の Azure ポータルでは、自分のリソースと同じように委任されたリソースが表示されます。MVP のサブスクリプションに紐づく Function App が自分のリソース、PAYG に紐づく Function App が委任されたリソースです。

{{< figure src="/images/2019-0713-009.png" title="自分のリソースと委任されたリソース" >}}

今回は Contributor 権限を委任されていますので、委任された Function App の設定を自分のポータル上で操作できます。

{{< figure src="/images/2019-0713-010.png" title="委任されたリソースの設定を変更できる" >}}

表示されない場合は、Global subscription filter で対象を絞っている可能性があります。委任されたリソースの AAD も表示するようにしましょう。

{{< figure src="/images/2019-0713-008.png" title="Global subscription filter の表示" >}}

## まとめ

Azure Lighthouse を動かしました。夢が広がるサービスですね。大量の別 AAD テナントに対して同一のサービスを提供するシナリオにおいては神のようなサービスだと思います。Microsoft が MSP での利用を猛プッシュしているのは納得できます。

また、何かしらの理由で一つの組織が大量の AAD を利用しているケースで、Azure のリソースの集中管理を目指すシナリオでも利用できそうだなと思いました。Azure リソースのガバナンスを実現する仕組みを1つの AAD のみに用意して、Lighthouse による委任を利用して他の AAD の Azure リソースに適用していけば、管理しやすくスケールする実装になりそうです。

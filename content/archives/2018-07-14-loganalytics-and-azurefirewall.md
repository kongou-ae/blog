---
title: Azure Firewallの通信ログをLog Analyticsでいい感じにする
author: kongou_ae
date: 2018-07-14
url: /archives/2018-07-14-loganalytics-and-azurefirewall
categories:
  - azure
---

[Azure Firewallをためした](https://aimless.jp/blog/archives/2018-07-14-jit-azurefirewall/)の続きです。

上記のエントリーはで、Azure Firewallの通信ログをLog Analyticsに投入しました。本エントリーでは、Log Analyticsに投入されたログをいい感じにします。

## 初期状態

Log Analyticsに投入された通信ログは次のフォーマットになっています。

| プロパティ | サンプル | 
| ----------- | -------------------- |
|TenantId | da2efae5-32b4-xxxx-xxxx-xxxxxxxxxxx|
|SourceSystem|Azure|
|TimeGenerated [UTC]|2018-07-13T16:15:13.703Z|
|msg_s|HTTPS request from 10.0.3.4:55584 to da2efae5-32b4-44e1-815d-b5923d52325c.ods.opinsights.azure.com:443. Action: Deny. No rule matched. Proceeding with default action|
|ResourceId|/SUBSCRIPTIONS/51B26C53-7AE2-xxxx-xxxx-xxxxxxxxxxx/RESOURCEGROUPS/SAMPLE/PROVIDERS/MICROSOFT.NETWORK/AZUREFIREWALLS/SAMPLEFW|
|OperationName|AzureFirewallApplicationRuleLog|
|Category|AzureFirewallApplicationRule|
|SubscriptionId|51b26c53-7ae2-xxxx-xxxx-xxxxxxxxxxx|
|ResourceGroup|SAMPLE|
|ResourceProvider|MICROSOFT.NETWORK|
|Resource|SAMPLEFW|
|ResourceType|AZUREFIREWALLS|
|Type|AzureDiagnostics|

ですので、AzureDiagnosticsを選択してから、ResourceTypeをAZUREFIREWALLSでフィルタしたうえでmsg_sを出力すると、Azure Firewallの通信ログだけを確認できます。

{{<img src="./../../images/2018-0714-020.png">}}

## 検索しやすくする

msg_sの中にすべての情報が入っていると検索しにくいです。下図のFortiGateのようにログの情報が整理されてほしいところです。

{{<img src="./../../images/2018-0714-021.png">}}

Log Analyticsはクエリを与えることで自由にログを整形できます。parseを使って基本的な部分を抽出したうえで、足りない部分を個別に正規表現で抽出します。

```
AzureDiagnostics
| where ResourceType == "AZUREFIREWALLS"
| parse kind = regex msg_s with Proto "request from " From ":.*?to " To ":" Dport ". Action: " Result
| extend Result = extract("(Allow|Deny)",1,Result)
| extend Collection = iif(msg_s contains "Rule Collection:" , extract("Rule Collection: (.*?). Rule", 1 , msg_s ) , "")
| extend Rule = iif(msg_s contains "Rule:" , extract("Rule: (.*?)$", 1 , msg_s ) , "")
| project TimeGenerated , From , To , Proto , Dport , Result , Collection , Rule , msg_s 
// Iuput your query to the following space.
```

すると、ログの表示が下図のようになります。

{{<img src="./../../images/2018-0714-022.png">}}

項目ごとに整理されているので、直感的に検索できます。送信元が10.0.3.4でsakeというApplication ruleにマッチした通信を検索すると下図のような出力されます。いい感じですね。

{{<img src="./../../images/2018-0714-023.png">}}

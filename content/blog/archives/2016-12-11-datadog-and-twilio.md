---
title: Twilioを使って、Datadogから電話をかける
author: kongou_ae
layout: post
date: 2016-12-11
url: /blog/archives/2016-12-11-datadog-and-twilio
categories:
  - datadog
  - twilio
---

## 背景

自社のデータセンタは、コスト削減と品質安定化のために、運用の自動化を進めています。最終的に自動化できていない領域が、ハードウェアの目視監視と電話による障害連絡です。この2つの領域がオペレータの稼働コストの多くを占めています。

電話連絡が自動化できたらハッピーです。そこで、Datadogで障害を検知した際に自動的に電話をかける実装を試しました。

## 実践

### 電話のかけかた

今回はとりあえず電話がかけられればいいのでTwilioを利用します。

ただし、指定した順番で電話するなどの小難しい処理はできません。小難しい処理を行うためには以下の対応が必要です。

- FaaSとTwilioを組み合わせて自前の処理を作る
- PagerDutyやVictorOps、OpsGenieといった通知系SaaSを使う必要があります。

### Outbound Webhookを設定する

Twilioは電話をかけるためのAPIが用意されています（[REST API: 通話を開始する](https://jp.twilio.com/docs/api/rest/making-calls)）。このAPIを、DatadogのWebhook Integrationを利用してたたきます。

Webhookから叩くときのAPIエンドポイントは以下のフォーマットです（[参考：Datadog-Webhooks Integration](http://docs.datadoghq.com/ja/integrations/webhooks/)）。

```
https://{Your-Account-id}:{Your-Auth-Token}@api.twilio.com/2010-04-01/Accounts/{Your-Account-id}/Calls.json
```

APIエンドポイントにPOSTしなければならない要素は以下の3つです。

 - From
 - To
 - Url

自分の携帯電話に対して、テストメッセージを流します。`To`と`From`に入力する電話番号は国番号付きのフォーマットにする必要があります。

 ```
 {
"Url":"http://demo.twilio.com/docs/voice.xml",
"To":"+8190xxxxxxxx",
"From":"+1347xxxxxxx "
}
 ```

 上記のAPIエンドポイントとjsonを使って、Webhook Integrationを設定します。

 ![](https://aimless.jp/blog/images/2016-12-11-001.png)

### Monitor設定でWebhookを利用する

作成したWebhook IntegrationをMonitor設定で利用します。

![](https://aimless.jp/blog/images/2016-12-11-003.png)

ただし、上記画像のようにWebhookを利用すると、障害発生だけでなく障害復旧の際にもTwilioによる電話がかかってきます。電話連絡は目覚まし時計のようなものですので、復旧時の連絡が不要なケースもあります。

電話連絡を障害発生時だけにする場合は、条件変数（[message-template-variables](http://docs.datadoghq.com/monitoring/#message-template-variables)）を使ってアラート発生時のみWebhookが使われるようにします。近騎亜は障害発生時のみですので、電話をかけるWebhoolを`{{#is_alert}}{{/is_alert}}`で囲みます。

![](https://aimless.jp/blog/images/2016-12-11-004.png)

### 電話をかける

障害が発生すると電話がかかってきます。アメリカの電話番号から電話を掛けると非通知でした。

## 感想

DatadogのWebhook IntegrationとTwilioを利用することで、障害発生時に電話をかけることができました。実用化に向けては以下の課題がありますので、引き続き試行錯誤します。

 - 電話の会話内容を、テスト用のものからそれっぽいものに変更する
 - 電話番号を通知する
 - 電話が掛けられなかった時のエラーを監視する
 - 電話の実績を集計する

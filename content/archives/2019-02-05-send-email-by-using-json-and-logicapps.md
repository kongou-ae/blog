---
title: Logic Apps を利用して JSON でメールを送る
author: kongou_ae
date: 2019-02-05
url: /archives/2019-02-05-send-email-by-using-json-and-logicapps
categories:
  - azure
---

## はじめに

運用で利用するスクリプトに確認結果をメール通知する処理を書いている際に、「JSON を投げつけたらメールが飛んでくれる何かがあったら超便利なのになぁ」と閃きました。メールを送るためのライブラリを探したり、メールを送る処理の書き方を Google に聞いたりするのがめんどくさかったが故の閃きです。

いろいろ考えた結果、Loggic Apps を使って実装できることが分かったので作ってみました。

## 全体像

小難しいことはしません。WebHook トリガで JSON を受け取って、受け取った内容を SNMP アクションでメールサーバに渡します。

{{< figure src="./../../images/2019-02-05-001.png" title="Logic app designerの画面" >}}

## WebHook トリガの実装

件名と本文、送信元アドレス、宛先アドレスを含む JSON を受け取れるようにします。

{{< figure src="./../../images/2019-02-05-005.png" title="WebHook トリガの画面" >}}

`HTTP POST URL` に記載されている URL が、JSON を投げつける先です。`Request Body JSON Schema` は次のようになります。

```json
{
    "properties": {
        "from": {
            "type": "string"
        },
        "msg": {
            "type": "string"
        },
        "subject": {
            "type": "string"
        },
        "to": {
            "type": "string"
        }
    },
    "type": "object"
}
```

## SNMP アクションの実装

まずは利用するメールサーバを SNMP アクションに追加します。今回は SendGrid の SMTP サーバを利用します。

{{< figure src="./../../images/2019-02-05-002.png" title="メールサーバの画面" >}}

そして、SNMP アクションの各項目に、WebHook トリガが受け取った内容を当てはめていきます。

{{< figure src="./../../images/2019-02-05-003.png" title="SNMP コネクタの画面" >}}

## 動作確認

WebHook トリガ の FQDN に対して、`Request Body JSON Schema` のJSON を投げつけます。次の PowerShell を実行すると、JSON の to に入っているメールアドレスにメールが届きます。簡単。

```powershell
$food = "ごはん"
$msg = @"
ご担当者様

$food を食べませんか。

以上
"@

$body = ConvertTo-Json(@{
    msg = $msg
    subject = "sub"
    to = "kongou_ae@aimless.jp;kongou_ae2@aimless.jp"
    from = "logicapps@aimless.jp"
})

$url = "https://prod-07.japaneast.logic.azure.com:443/workflows/xxxxxxxxxxxxxxxxxxxxxxxxxxxxxx/triggers/manual/paths/invoke?api-version=2016-10-01&sp=%2Ftriggers%2Fmanual%2Frun&sv=1.0&sig=xxxxxxxxxxxxxxxxxxxxxxx"
Invoke-RestMethod -Method POST -Uri $url -Body $body -ContentType "application/json;charset=utf-8"
```

{{< figure src="./../../images/2019-02-05-004.png" title="Gmail の受信画面" >}}

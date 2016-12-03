---
title: terraformを使ってDatadogのモニタを設定する
author: kongou_ae
layout: post
date: 2016-12-03
url: /blog/archives/2016-12-03-configurate-of-datadog-by-terraform
categories:
  - terraform
  - datadog
---

## 背景

「[SaaS サブスクリプションが AWS Marketplace から利用可能に](https://aws.amazon.com/jp/about-aws/whats-new/2016/11/saas-subscriptions-now-available-from-aws-marketplace/)」によって、Datadogの料金をAWS利用料で支払えるようになりました。

このアップデートによって、わたしは、クレジットカードを使ってSaaSを契約するための社内手続きが不要になりました。事前に許可取得済みのAWS利用料の中に収まる範囲であればSaaSを使いたい放題です。神アップデートです。

Datadogを本格的に使うとなると、GUIをポチポチするのが辛そうです。この課題を解決するために、Terrformを使ってDatadogのモニタを設定します。

## 実践

### 認証情報の取得

DatadogのAPIを叩くためにはAPI KeyとApp Keyが必要です。GUIで作ります。

![](https://aimless.jp/blog/images/2016-12-03-006.png)

### コードを書く

[DATADOG_MONITOR](https://www.terraform.io/docs/providers/datadog/r/monitor.html)をもとに、ロードアベレージが1になったらslackに通知するモニタを書きます。

なお、Slackに通知するためにはSlack Integrationを有効にする必要があります。これは事前にGUIでポチポチ設定しておきます。

```
# Configure the Datadog provider
provider "datadog" {
    api_key = "xxxxxx"
    app_key = "xxxxxx"
}

# Create a new Datadog monitor
resource "datadog_monitor" "loadAvarage" {
  name = "loadAvarage"
  type = "metric alert"
  message = "loadAvarage is over 1. @slack-general"

  query = "max(last_5m):max:system.load.1{*} by {host} > 1"

  thresholds {
    ok = 0
    critical = 1
  }

  notify_no_data = true
  no_data_timeframe = 2
  notify_audit = true
}
```
### Terrformする

plan & applyします。

```
PS C:\Users\xxxx\Documents\terraform\datadog> terraform plan
Refreshing Terraform state in-memory prior to plan...

+ datadog_monitor.loadAvarage
    message:             "loadAvarage is over 1. @slack-general"
    name:                "loadAvarage"
    no_data_timeframe:   "2"
    notify_audit:        "true"
    notify_no_data:      "true"
    query:               "max(last_5m):max:system.load.1{*} by {host} > 1"
    thresholds.%:        "2"
    thresholds.critical: "1"
    thresholds.ok:       "0"
    type:                "metric alert"


Plan: 1 to add, 0 to change, 0 to destroy.

PS C:\Users\xxxx\Documents\terraform\datadog> terraform apply
datadog_monitor.loadAvarage: Creating...
  message:             "" => "loadAvarage is over 1. @slack-general"
  name:                "" => "loadAvarage"
  no_data_timeframe:   "" => "2"
  notify_audit:        "" => "true"
  notify_no_data:      "" => "true"
  query:               "" => "max(last_5m):max:system.load.1{*} by {host} > 1"
  thresholds.%:        "0" => "2"
  thresholds.critical: "" => "1"
  thresholds.ok:       "" => "0"
  type:                "" => "metric alert"
datadog_monitor.loadAvarage: Creation complete

Apply complete! Resources: 1 added, 0 changed, 0 destroyed.
```

無事addedされました。GUI上にも表示されています。

![](https://aimless.jp/blog/images/2016-12-03-007.png)

## 感想

Terraformを使うことで、Datadogの監視設定をコードにできました。TerraformとDatadogを使うと、監視設定でもInfrastructure as codeのメリットを享受できますね。

なお、Terraformはダッシュボードもコードにできます（[DATADOG_TIMEBOARD](https://www.terraform.io/docs/providers/datadog/r/timeboard.html)）。これもいつか試します。

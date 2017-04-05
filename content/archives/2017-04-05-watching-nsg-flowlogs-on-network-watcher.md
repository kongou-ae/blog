---
title: Network Watcherを使ってNetwork Security Groupのログを見る
author: kongou_ae

date: 2017-04-05
url: /archives/2017-04-05-watching-nsg-flowlogs-on-network-watcher
categories:
  - azure
---

## 背景

Azureのファイアウォール機能であるNetwork Security Group（NSG）は、トラフィックログが見られませんでした。ですが、[Network Watcher](https://azure.microsoft.com/en-us/services/network-watcher/)のリリースによってトラフィックログが見られるようになりました。パブリックプレビューのリリースを見たときはVPC Flow Logsがリリースされたときと同じくらい感動しました。

先日、パブリックプレビューであったNetwork Watcherが[GA](https://azure.microsoft.com/en-in/updates/general-availability-network-watcher/)になりました。現時点ではUS West CentralとUS North Central、US West regionsのみで利用可能ですが、そのうち東日本と西日本でも利用できるようになるはずです。利用できるようになる前に予習しておきます。

## 実践

まずはNetwork Watcherを有効にします。リージョン単位で有効にします。

{{<img src="./../../images/2017-04-05-001.png">}}

{{<img src="./../../images/2017-04-05-002.png">}}

次にFlow Logsを有効にします。こちらはNSG単位で有効にします。

{{<img src="./../../images/2017-04-05-003.png">}}

ログを保存するストレージアカウントとログの保存期間を指定します。

{{<img src="./../../images/2017-04-05-004.png">}}

指定したストレージアカウントにPT1H.jsonというログファイルができます。

{{<img src="./../../images/2017-04-05-005.png">}}

ログファイルの保存パスや詳細は[Introduction to flow logging for Network Security Groups](https://docs.microsoft.com/en-us/azure/network-watcher/network-watcher-nsg-flow-logging-overview)に記載されています。NSGのルールごとに次のようなトラフィックログがPT1H.jsonに追記されていきます。

```
"1491143966,10.2.0.4,23.99.34.232,37560,443,T,O,A",
"1491143966,10.2.0.4,23.99.34.232,37562,443,T,O,A",
"1491143966,10.2.0.4,23.99.34.232,37564,443,T,O,A",
```

自分の環境で取得したPT1H.jsonを[gist](https://gist.github.com/kongou-ae/7c39302c0ec7511662df7dbc39ca0d16)にあげておきました。ご参考までに。

## 感想

AWSに続いてAzureもトラフィックログを調査しやすくなりました。いざというときのためにトラフィックログが見られると心強いです。早く東日本と西日本に来てほしい。

また、VPC Flow Logsと同様、NSG Flow Logsも様々なSaaSが対応しはじめています。手作業でjsonのログを分析するのは苦痛ですので、SaaSが対応してくれるのはありがたいです。

- [sumologic](https://www.sumologic.com/application/azure-network-watcher/)
- [observable networks](https://observable.net/blog/a-technical-preview-of-microsoft-azures-network-watcher/)
- [Splunk](https://www.splunk.com/blog/2017/02/20/splunking-microsoft-azure-network-watcher-data/)
- [Azure Log Analytics(OMS)](https://blogs.msdn.microsoft.com/cloud_solution_architect/2017/04/03/uploading-azure-nsg-flow-logs-to-oms/)

NSG Flow Logsのパーサーを自分で作成すれば、ご利用されているログ管理システムにNSG Flow Logsを投入することもできます。私も、いつかNSG Flow Logsを分析することがあるだろうということで、[nsg-flowlogs-conveter](https://github.com/kongou-ae/nsg-flowlogs-conveter)を作ってみました。
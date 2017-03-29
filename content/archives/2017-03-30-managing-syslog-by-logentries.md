---
title: Logentriesを使ってネットワーク機器のsyslogを管理する
author: kongou_ae

date: 2017-03-30
url: /archives/2017-03-30-managing-syslog-by-logentries
categories:
  - etc
---

## 背景

ネットワーク機器のトラフィックログをログ管理SaaSで集計・分析・可視化したい。この課題に対するこれまでのアプローチは次のとおりでした。

1. syslogサーバを構築する
1. NW機器にsyslogの設定を追加する
1. syslogサーバにログ管理SaaSのエージェントをインストールする
1. ログ管理SaaSでログを集計・分析・可視化する


しかし、私はトラフィックログを集計・分析・可視化したいのであってsyslogサーバの運用やエージェントのインストールをやりたいわけではありません。この課題を解決するために、ネットワーク機器のsyslogを直接受信できるログ管理SaaSに探しました。そして見つかったSaaSが[Logentries](https://logentries.com/)です。

## 実践

LogentriesにはFreeプランがあります。プランの種類と機能の違いは[こちら](https://logentries.com/pricing/)をご確認ください。Freeプランでは基本中の基本な機能が利用できます。今回は30日間のフル機能体験版で動作を確認しました。

Logentriesには[Plain TCP/UDP](https://docs.logentries.com/docs/input-plaintcpudp)というログ受信の仕組みがあります。


> TCP and UDP input types are suitable for simple input implementations which use TCP connections, as well as for standard Syslog daemons.

Plain TCP/UDPを選択して簡単なパラメータを決めます。そうすると、管理画面上にエンドポイントのURLとポート番号が表示されます。

{{<img src="./../../images/20170330-001.png">}}

{{<img src="./../../images/20170330-002.png">}}

エンドポイントの値をネットワーク機器にsyslogサーバとして設定します。今回は自宅のFortiGateのログを送ってみます。

{{<img src="./../../images/20170330-005.png">}}

設定した直後からLogentriesにFortiGateのsyslogが表示されます。簡単です。

{{<img src="./../../images/20170330-004.png">}}

Logentriesでは、[Logentries Query Langauge](https://docs.logentries.com/docs/search#section-leql)をいう文法を用いて保存されているログを集計・分析・可視化します。

## 感想

syslogを直接受信してくれるSaaSの存在は大変ありがたいです。ネットワーク機器とログ管理SaaSの間の中間サーバが不要になるからです。

ただし、今回のFortiGateの場合、トラフィックログをUDP平文でLogentriesに送るのでセキュリティ面のリスクがあります。LogentriesのPlain TCP/UDPはSSLをサポートしています。もし実戦に投入する場合はsyslogをSSLで送信できるネットワーク機器を対象にしたほうがよさそうです。
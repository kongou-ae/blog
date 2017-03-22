---
title: Gmailを使ってZabbix3.0のアラートメールを送る
author: kongou_ae
date: 2016-04-18
url: /archives/2016-04-18-sending-zabbix-alert-mail-by-gmail
categories:
  - zabbix
---

Zabbix3.0からメールの暗号化方式にSTARTTLSとSSL/TLSが選択できるようになったようです。（[参考：1 E-mail](https://www.zabbix.com/documentation/3.0/manual/config/notifications/media/email)）

というわけで、GmailのSMTPサーバを使ってアラートメールを送信してみました。SMTP heloは適当です。

### 設定

管理＞メディアタイプから以下の通り設定します。

![](http://aimless.jp/blog/images/2016-04-18-001.png)

### 動作確認

無事メールが届きました。

![](http://aimless.jp/blog/images/2016-04-18-002.png)

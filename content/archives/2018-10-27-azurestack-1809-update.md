---
title: Azure Stack 1809 update
author: kongou_ae
date: 2018-10-27
url: /archives/2018-10-27-azurestack-1809-update
categories:
  - azurestack
---

## はじめに

Azure Stack 1809 update がリリースされました。本エントリーでは 1809 update で実装された主要な機能をまとめます。

参考：[Azure Stack 1809 update](https://docs.microsoft.com/en-us/azure/azure-stack/azure-stack-update-1809)

## 16台構成のサポート

Microsoft Ignite 2018 でアナウンスされた16台構成が正式にサポートされました。今後は１つの Scale unit を最大16台まで拡張できるようになります。16台構成のサポートを最も早く名言したのは、Azure Stack PM である Vijay Tewari の Twitter でした。ドキュメントよりも先に Twitter で情報が公開されました。実に今っぽい。

<blockquote class="twitter-tweet" data-cards="hidden" data-lang="ja"><p lang="en" dir="ltr"><a href="https://twitter.com/hashtag/AzureStack?src=hash&amp;ref_src=twsrc%5Etfw">#AzureStack</a> 1809 is out and it includes support for 16 nodes in a scale unit. This came in earlier than expected, so docs are still catching up😊. <a href="https://t.co/5SfibAhWQd">https://t.co/5SfibAhWQd</a></p>&mdash; Vijay Tewari (@vtango) <a href="https://twitter.com/vtango/status/1055739634313977856?ref_src=twsrc%5Etfw">2018年10月26日</a></blockquote>
<script async src="https://platform.twitter.com/widgets.js" charset="utf-8"></script>

参考：[Updated for 16 nodes · MicrosoftDocs/azure-docs@c455a84](https://github.com/MicrosoftDocs/azure-docs/commit/c455a84caa28e7a0c1e514d09bc30449b3183780#diff-ce941007d1f55d8c0925059670d08310)

## Syslog client

1807 update でプレビューになった Syslog Client が GA しました。Azure Stack のインフラ部分で取得されている監査とアラート、セキュリティに関するログを Syslog サーバに送信できるようになりました。主なユースケースは、ログの外部保管とSIEM連携です。

参考：[Azure Stack datacenter integration - syslog forwarding](https://docs.microsoft.com/en-us/azure/azure-stack/azure-stack-integrate-security)

Syslog の送信方法は次の4種類です。

1. TCP を用いて Syslog を送信。通信内容を TLS 1.2 で暗号化。クライアントとサーバがともに相手を証明書で検証
2. TCP を用いて Syslog を送信。通信内容を TLS 1.2 で暗号化。クライアントがサーバを証明書で検証
3. TCP を用いて Syslog を送信。通信内容を TLS 1.2 で暗号化
4. UDP を用いて Syslog を送信
 
ASDK 1809 を利用して「3. TCP を用いて Syslog を送信。通信内容を TLS 1.2 で暗号化」を試したのですが、正しくSyslogが飛んでいない様に見えました。PowerShell のコードそのものが Syslog server に届く状態は、正しくないと信じたい。

{{<img src="./../../images/2018-10-27-001.png">}}

## おわりに

1809 update で実装された2つの主要機能をまとめました。16台構成が GA したので、1つの Scale unit を拡張する流れは一区切りだと思います。今後は、Azure Stack の1リージョンを複数のラックで構成する Multi scale unit や Azure Stack を複数リージョンで構成する Multi region が待っています。リリースを気長に待ちます。

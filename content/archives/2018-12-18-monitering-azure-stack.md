---
title: Azure Stack を監視する
author: kongou_ae
date: 2018-12-18
url: /archives/2018-12-18-monitering-azure-stack
categories:
  - azurestack
---

## はじめに

本エントリーは[Microsoft Azure Stack Advent Calendar 2018](https://qiita.com/advent-calendar/2018/azure-stack)の18日目です。

本日のエントリでは、Azure Stack の監視についてまとめます。

## Azure Stack の監視手法

### ソフトウェアの監視手法

[Azure Stack のセキュリティ](https://aimless.jp/blog/archives/2018-12-11-security-of-azurestack/)でまとめた通り、Integrated systems は、管理者の Host Node に対する権限を絞っています。そのため、従来のサーバの様に、監視用のエージェントを入れてメトリクスやイベントを自分で監視することができません。

では誰が Azure Stack を監視するのか。Azure Stack では、Health Resource Provider と呼ばれる Azure Stack 内部の仕組みが、Azure Stack の各種コンポーネントの正常性を監視しています。自分で自分を監視している形です。

そして、この Health Resource Provider は、異常を検知した場合、アラートを API で公開します。管理者が用意すべきものは、このアラートを拾う仕組みです。なお、Azure Stack はメールや Webhook での通知をサポートしていません。API にアクセスしてアラートを拾う仕組みが必須です。

アラートを拾う仕組みの一つが、Microsoft がリリースしている [System Center Management Pack for Microsoft Azure Stack](https://www.microsoft.com/en-us/download/details.aspx?id=55184) です。この Management Pack は、Azure Stack の API にアクセスして Health Resource Provider のアラートをチェックします。そして、もしアラートがあった場合、SCOM としてアラートを上げます。Management Pack が検知したアラートをどのように通知するかの部分は、管理者が SCOM の仕組みを利用して設定します。

参考：[System Center Management Pack for Microsoft Azure Stack](https://docs.microsoft.com/ja-jp/azure/azure-stack/azure-stack-integrate-monitor)

また、SCOM の Management Pack と同じように、API にアクセスする仕組みを作りこめる監視ツールであれば、Azure Stack を監視できます。SCOM の Management Pack 以外にも次のような実装例が公開されています。

- Nagios Plugin ( [Monitoring AzureStack Alerts](https://exchange.nagios.org/directory/Plugins/Cloud/Monitoring-AzureStack-Alerts/details) )
- Log Analytics にデータを送るスクリプト ( [Azure-Samples/AzureStack-AdminPowerShell-OMSIntegration](https://github.com/Azure-Samples/AzureStack-AdminPowerShell-OMSIntegration) )

### ハードウェアの監視手法

ただし、Health Resource Provider が監視する部分は、Azure Stack のソフトウェアの部分だけです。Health Resource Provider は、OS から認識できる Disk や Network Interface などのハードウェアのステータスを監視できますが、OS からは見えないファンや電源ユニットなどの部分や、ネットワークスイッチを監視できません。

ハードウェアとネットワークスイッチの監視は、HLH 上で動作する OEM ベンダの運用管理ソフトウェアの役割です。OEM ベンダ製のハードウェアを OEM ベンダ製のツールで監視するという従来通りの監視手法です。

ただし、HLH はシングル構成です。そのためサーバが故障した場合、OEM 製ソフトウェアによるハードウェアの監視が停止します。このリスクを許容できない場合は、従来の監視方法でハードウェアとネットワークスイッチを監視しましょう。

## まとめ

本日のエントリでは、Azure Stack の監視をまとめました。Azure Stack のソフトウェアの部分は、Microsoft お勧めの監視設計がなされています。管理者の責任は、お勧めの監視設計が通知したアラートをハンドリングすることだけです。既存で SCOM をお使いの方は、そのまま SCOM で Azure Stack を監視するといいでしょう。SCOM をお持ちでない方は、監視の仕組みを新しく作る必要があります。それなりの費用と設備がかかりますので、事前準備を忘れずに。

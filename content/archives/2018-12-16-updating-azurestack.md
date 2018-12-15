---
title: Azure Stack をアップデートする
author: kongou_ae
date: 2018-12-16
url: /archives/2018-12-16-updating-azurestack
categories:
  - azurestack
---

## はじめに

本エントリーは[Microsoft Azure Stack Advent Calendar 2018](https://qiita.com/advent-calendar/2018/azure-stack)の16日目です。

本日のエントリは、Azure Stack のアップデートをまとめます。

## アップデートの種類と範囲

Azure Stack には２つのアップデートがあります。１つ目は Microsoft がリリースするアップデートです。もう１つは OEM ベンダがリリースするアップデートです。それぞれの特徴は次の通りです。

### Microsoft のアップデート

Microsoft は、原則として月に1回アップデートをリリースします。原則ですので、アップデートがリリースされない月もあります。このアップデートでは、新機能の追加とバグの修正、Windows Update が行われます。したがって、Azure Stack の新機能追加は最短でも1か月周期です。Azure のように毎日毎日新機能がでることはありません。また、月に1回の定期アップデート以外に、臨時で Hotfix がリリースされます。Hotfix では緊急度の高い不具合の修正が行われます。

Microsoft のアップデートの適用範囲は、Host Node 上で動作する Azure Stack というソフトウェアの部分のみです。Host Node のハードウェア部分や HLH、HLH の上で動作する OEM ベンダの運用管理ソフトウェアは、MIcrosoft の アップデーtには含まれていません。

### OEM ベンダのアップデート

OEM ベンダがリリースするアップデートのリリーススケジュールは OEM ベンダごとに異なります。OEM ベンダがリリースするアップデートの適用範囲は、ハードウェア部分のドライバとファームウェア、HLH 上で動作する運用管理ツールです。

## アップデートの適用方法

### Microsoft のアップデート

Microsoft がリリースするアップデートと Hotfix の適用方法は、ボタン数クリックです。Connected deployment の場合、Azure Stack は定期的にアップデートが配信されたかを確認して、自分が適用すべきアップデートを自動的にダウンローとします。管理者が行うことは、適用するアップデートを選択して「Update now」を押すだけです。あとは Azure Stack が全自動で自分をアップデートします。

{{< figure src="./../../images/2018-12-16-001.png" title="アップデート画面と Update now ボタン" >}}

Azure Stack は、特徴的なアップデート方法を採用しています。Azure Stack のアップデートは、既存の環境のパッチを充てるのではなく、既存の環境を捨てて新しい環境を新規構築します。アップデートの間に、Host Node と Infrastructure Role Instance は、アップデート前まで使っていたイメージを捨てて、アップデートが適用された新しいイメージでブートします。

{{< figure src="./../../images/2018-12-16-003.png" title="アップデートパッケージを使って新しいイメージを作る" >}}

{{< figure src="./../../images/2018-12-16-004.png" title="新しいイメージを Host Node に配備" >}}

{{< figure src="./../../images/2018-12-16-005.png" title="Host Node を新しいイメージから起動" >}}

引用：[The guide to becoming a Microsoft Azure Stack operator - BRK3334](https://www.youtube.com/watch?v=CXH_KvMZpDo)

おそらく、継続的にアップデートを続けていくというポリシーを実現するために、アップデートのたびに環境を新規構築するという手法をとることにしたのでしょう。既存の環境にパッチを当て続けていく方式だと、パッチを当て続けてきた Azure Stack と新しくインストールした Azure Stack が同じであることを保証することが困難です。環境によって Azure Stack の状態が異なることは、継続的なアップデートの妨げになります。

### OEM ベンダのアップデート

OEM ベンダがリリースするアップデートのリリーススケジュールは OEM ベンダごとに異なります。OEM ベンダがリリースするアップデートの適用範囲は、Host Node のハードウェア部分と HLH、HLH の上で動作する OEM ベンダの運用管理ソフトウェアです。OEM ベンダによって利用しているハードウェアとソフトウェアが異なるので、アップデート方法も OEM ベンダによって異なります。

## サポートポリシー

Microsoft は最新バージョンと２つ前までのバージョンの Azure Stack のみをサポートします。2018年12月現在においては、最新が1809 updates ですので、サポートされるバージョンは、1809と1808、1807のみです。1807よりも古いバージョンの Azure Stack はサポート対象外です。

参考：[システムがサポートされる状態を維持する](https://docs.microsoft.com/ja-jp/azure/azure-stack/azure-stack-servicing-policy#keep-your-system-under-support)

したがって、Azure Stack を利用し始めたら 利用を終えるまでアップデートし続ける必要があります。Azure Stack に「導入したら塩漬けてアップデートしない」という選択肢はありません。このような運用を行いたい方は、Azure Stack に向いていません。

## まとめ

本日のエントリでは、Azure Stack のアップデートについてまとめました。Immutable Infrastructure の考え方でクラウド基盤全体をアップデートする Azure Stack の仕組みに素直に関心します。技術的にできることは理解できるのですが、それを実装して商用リリースしているAzure Stack 開発チームは凄い。

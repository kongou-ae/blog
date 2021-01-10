---
title: Azure Stack Hub をアップデートする
author: kongou_ae
date: 2018-12-16
url: /archives/2018-12-16-updating-azurestack
categories:
  - azurestack
---

- 初版：2018年12月
- 第二版：2019年12月

## はじめに

本エントリーは[Microsoft Azure Stack Advent Calendar 2018](https://qiita.com/advent-calendar/2018/azure-stack)の16日目です。

本日のエントリは、Azure Stack Hub のアップデートをまとめます。

## アップデートの種類と範囲

Azure Stack には２つのアップデートがあります。Microsoft がリリースするアップデートと OEM ベンダがリリースするアップデートです。それぞれの特徴は次の通りです。

### Microsoft のアップデート

Microsoft は、原則として月に1回アップデートをリリースします。原則ですので、アップデートがリリースされない月もあります。このアップデートを通じて Azure Stack Hub の新機能が配信されるので、Azure Stack Hub の新機能追加は最短でも1か月周期になります。

Microsoft のアップデートには Full と Express という2つの種類があります。2つのアップデートの違いは次の通りです。

| 種類 | 対象 | 所要時間 |
|------|-------|--------|
| Full | Azure Stack というソフトウェアの新機能追加、不具合改修、Host Node の Windows Update | 24時間以上 |
| Express | Azure Stack というソフトウェアの新機能追加、不具合改修 | 約10時間 | 

また、Microsoft は月に1回の定期アップデート以外に 臨時で Hotfix をリリースします。Hotfix では緊急度の高い不具合が修正されます。

### OEM ベンダのアップデート

Microsoft のアップデートには次の要素が含まれていません。これらの更新は OEM ベンダのアップデートの範囲です。

- Host Node のドライバ
- Host Node のファームウェア
- HLH のドライバ
- HLH のファームウェア
- HLH 上で動作する Windows Servecr の Windows Update
- HLH 上で動作する OEM ベンダの運用管理ソフトウェア

OEM ベンダがリリースするアップデートのリリーススケジュールは OEM ベンダごとに異なります。例えば、Dell EMC は Microsoft がアップデートを出すたびに OEM アップデートを配信しています。

## アップデートの適用方法

### Microsoft のアップデート

Microsoft がリリースするアップデートと Hotfix の適用方法は、ボタン数クリックです。Connected deployment の場合、Azure Stack は定期的にアップデートが配信されたかを確認して、自分が適用すべきアップデートをポータルに表示します。Disconnected deployment の場合は、管理者が　Microsoft が公開しているアップデートパッケージを手動で Azure Stack にアップロードすると、適用すべきアップデートがポータルに表示されます。

参考：[Azure Stack で更新を適用する](https://docs.microsoft.com/ja-jp/azure/azure-stack/azure-stack-apply-updates)

アップデートパッケージがポータルに表示された後に管理者が行うことは、適用するアップデートを選択して「Update now」を押すことだけです。あとは Azure Stack Hub が全自動で自分をアップデートします。Connected deployment の場合は、このタイミングで Azure Stack Hub 自身がパッケージをダウンロードします。

{{< figure src="/images/2018-12-16-001.png" title="アップデート画面と Update now ボタン" >}}

Azure Stack Hub は、特徴的なアップデート方法を採用しています。Azure Stack Hub のアップデートは、既存の環境にパッチをあてるのではなく、既存の環境を捨てて新しい環境を新規構築します。アップデートの間に、Host Node と Infrastructure Role Instance は、アップデート前まで使っていたイメージを捨てて、アップデートが適用された新しいイメージでブートします。

{{< figure src="/images/2018-12-16-003.png" title="アップデートパッケージを使って新しいイメージを作る" >}}

{{< figure src="/images/2018-12-16-004.png" title="新しいイメージを Host Node に配備" >}}

{{< figure src="/images/2018-12-16-005.png" title="Host Node を新しいイメージから起動" >}}

引用：[The guide to becoming a Microsoft Azure Stack operator - BRK3334](https://www.youtube.com/watch?v=CXH_KvMZpDo)

おそらく、継続的にアップデートを続けていくというポリシーを実現するために、アップデートのたびに環境を新規構築するという手法をとることにしたのでしょう。既存の環境にパッチを当て続けていく方式だと、パッチを当て続けてきた Azure Stack Hub と新しくインストールした Azure Stack Hub が同じであることを保証することが困難です。環境によって Azure Stack Hub の状態が異なることは、継続的なアップデートの妨げになります。

万が一失敗した場合、ロールバックという選択肢はありません。失敗した場合は、Microsoft のサポートと連携して失敗した要因を取り除いたうえで、アップデートを失敗した個所から再開します。

### OEM ベンダのアップデート

OEM ベンダがリリースするアップデートの適用方法は、OEM ベンダによって異なります。OEM ベンダによって利用しているハードウェアとソフトウェアが異なるためです。

## サポートポリシー

Microsoft は最新バージョンと２つ前までのバージョンの Azure Stack Hub のみをサポートします。2019年12月現在においては、最新が1810 updates ですので、サポートされるバージョンは、1910と1908、1807のみです。1907よりも古いバージョンの Azure Stack Hub はサポート対象外です。

参考：[システムがサポートされる状態を維持する](https://docs.microsoft.com/ja-jp/azure/azure-stack/azure-stack-servicing-policy#keep-your-system-under-support)

したがって、Azure Stack Hub を利用し始めたら 利用を終えるまでアップデートし続ける必要があります。Azure Stack Hub に「導入したら塩漬けてアップデートしない」という選択肢はありません。このような運用を行いたい方は、Azure Stack Hub に向いていません。

## まとめ

本日のエントリでは、Azure Stack Hub のアップデートについてまとめました。Immutable Infrastructure の考え方でクラウド基盤全体をアップデートする Azure Stack Hub の仕組みに素直に関心します。技術的に実現できることは理解できるのですが、それを実装して商用リリースしている Azure Stack Hub 開発チームは凄い。

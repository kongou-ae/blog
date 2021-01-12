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
- 第三版：2021年1月

## はじめに

本エントリーは[Microsoft Azure Stack Advent Calendar 2018](https://qiita.com/advent-calendar/2018/azure-stack)の16日目です。

本日のエントリは、Azure Stack Hub のアップデートをまとめます。

## アップデートの種類

Azure Stack Hub には3つのアップデートがあります。それぞれの役割や対象とする範囲などを説明していきます。

1. Microsoft がリリースするアップデート
2. Microsoft がリリースする Hotfix
3. OEM ベンダがリリースするアップデート

### Microsoft がリリースするアップデート

Microsoft は、原則として年に複数回アップデートをリリースします。Azure Stack Hub がリリースされた当初は原則として毎月アップデートをリリースするポリシーでしたが、2020年12月にポリシーが変更になりました。（[参考 URL](https://github.com/MicrosoftDocs/azure-stack-docs/commit/2dc842b6ae2f7240df247704c811c3df23a1279d#diff-63b278346f0c49a6e87df4803ed981e5b597bccb2e07797d2a3b35e12911bb67)）

Microsoft のアップデートには Full と Express という2つの種類があります。2つのアップデートの違いは次の通りです。

| 種類 | 対象 | 所要時間 |
|------|-------|--------|
| Full | Azure Stack Hub というソフトウェアの新機能追加、不具合改修、Host Node の Windows Update | 数十時間 |
| Express | Azure Stack Hub というソフトウェアの新機能追加、不具合改修 | 数時間 | 

注意すべき事項は Full アップデートの所要時間です。Azure Stack Hub を構成するノードの台数や Azure Stack Hub 上で動作するワークロードによりますが、アップデートの適用には20時間から40時間ほどかかります。アップデートのリリースノートに想定所要時間が記載されていますので、作業時間を見積もる際の参考にしましょう。たとえは 2008 Update のリリースノートに記載されている想定所要時間は次の通りです。

> The 2008 update has had the following expected runtimes in our internal testing- 4 nodes: 13-20 hours, 8 nodes: 16-26 hours, 12 nodes: 19-32 hours, 16 nodes: 22-38 hours

アップデートは累積ではありません。リリースされたアップデートの順番で適用していく必要があります。例えば 1910 Update の Azure Stack Hub を 2008 Update にする場合は、2002 → 2005 → 2008 と順番にアップデートを適用する必要があります。1910 Update に 2008 Update を直接適用することはできません。

### Microsoft がリリースする Hotfix

Microsoft は必要に応じて Hotfix をリリースします。Hotfix では不具合が修正されます。Hotfix は必要に応じてリリースされますので、Hotfix が一度もリリースされないアップデートもあれば、複数回リリースされるアップデートも存在します。Hotfix は累積です。最新の Hotfix には古い Hotfix の内容が含まれています。

また、Hotfix がリリースされた場合、その Hotfix は同一バージョンのアップデートにも反映されます。例えば 1.2008.0.59 アップデートがリリースされたあとに 1.2008.20.102 Hotfix がリリースされている状況の場合、2005 Update に適用する 2008 Update には 1.2008.20.102 Hotfix が含まれています。そのため、アップデート先のバージョンに Hotfix がリリースされていたとしても、1回の適用作業でアップデートと Hotfix をまとめて適用できます。

### OEM ベンダのアップデート

Microsoft のアップデートには次の要素が含まれていません。これらの更新は OEM ベンダのアップデートの範囲です。

- Host Node のドライバ
- Host Node のファームウェア
- HLH のドライバ
- HLH のファームウェア
- スイッチのファームウェア
- HLH 上で動作する Windows Servecr の Windows Update
- HLH 上で動作する OEM ベンダの運用管理ソフトウェア

OEM ベンダがリリースするアップデートのリリーススケジュールは OEM ベンダごとに異なります。例えば、Dell EMC は Microsoft がアップデートを出すたびに OEM アップデートを配信しています。

## アップデートの適用方法

### Microsoft のアップデート

アップデートを適用するためには、アップデートがリリースされたことを知る必要があります。現時点で Azure Stack Hub のアップデートのリリースを知る方法は次の通りです。残念なことに、Azure Stack Hub には管理者に対してアップデートのリリースを通知する機能がありません。

- docs.microsoft.com のリリースノートを定期的にチェックする
  - https://docs.microsoft.com/en-us/azure-stack/operator/release-notes
- GitHub のリリースノートを定期的にチェックする
  - https://github.com/MicrosoftDocs/azure-stack-docs/blob/master/azure-stack/operator/release-notes.md
- Twitter の #AzureStackHub を定期的にチェックする
- Azure Stack Hub の管理ポータルを定期的にチェックする
- 適用できるアップデートが記載された XML ファイルを定期的にチェックする
  - http://aka.ms/azurestackautomaticupdate 

Microsoft がリリースするアップデートと Hotfix の適用方法は、ボタン数クリックです。Connected deployment の場合、Azure Stack Hub は定期的にアップデートが配信されたかを確認して、自分が適用すべきアップデートをポータルに表示します。Disconnected deployment の場合は、管理者が　Microsoft が公開しているアップデートパッケージを手動で Azure Stack にアップロードすると、適用すべきアップデートがポータルに表示されます。

参考：[Azure Stack で更新を適用する](https://docs.microsoft.com/ja-jp/azure/azure-stack/azure-stack-apply-updates)

アップデートがポータルに表示された後に管理者が行うことは、適用するアップデートを選択して「Update now」を押すことだけです。あとは Azure Stack Hub が全自動で自分をアップデートします。Connected deployment の場合、「Update now」を押したタイミングで Azure Stack Hub 自身がインターネットからパッケージをダウンロードします。

{{< figure src="/images/2018-12-16-001.png" title="アップデート画面と Update now ボタン" >}}

Azure Stack Hub は、特徴的なアップデート方法を採用しています。Azure Stack Hub のアップデートは、既存の環境にパッチをあてるのではなく、既存の環境を捨てて新しい環境を新規構築します。アップデートの間に、Host Node と Infrastructure Role Instance は、アップデート前まで使っていたイメージを捨てて、アップデートが適用された新しいイメージでブートします。

{{< figure src="/images/2018-12-16-003.png" title="アップデートパッケージを使って新しいイメージを作る" >}}

{{< figure src="/images/2018-12-16-004.png" title="新しいイメージを Host Node に配備" >}}

{{< figure src="/images/2018-12-16-005.png" title="Host Node を新しいイメージから起動" >}}

引用：[The guide to becoming a Microsoft Azure Stack operator - BRK3334](https://www.youtube.com/watch?v=CXH_KvMZpDo)

おそらく、継続的にアップデートを続けていくというポリシーを実現するために、アップデートのたびに環境を新規構築するという手法をとることにしたのでしょう。既存の環境にパッチを当て続けていく方式だと、パッチを当て続けてきた Azure Stack Hub と新しくインストールした Azure Stack Hub が同じであることを保証することが困難です。環境によって Azure Stack Hub の状態が異なることは、継続的なアップデートの妨げになります。

アップデートや Hotfix の適用に万が一失敗した場合、ロールバックという選択肢はありません。失敗した場合は、Microsoft のサポートと連携して失敗した要因を取り除いたうえで、アップデートを失敗した個所から再開します。片道切符になっています。

### OEM ベンダのアップデート

OEM ベンダがリリースするアップデートの適用方法は、OEM ベンダによって異なります。OEM ベンダによって利用しているハードウェアとソフトウェアが異なるためです。

例えば Dell EMC 製の Azure Stack Hub の場合、Host Node に関連するアップデートを Microsoft のアップデートと同じようにポータルから適用できます。また、それ以外の HLH やスイッチといったアップデートを Dell EMC 独自のアップデート自動化ツールを利用して適用します。

## サポートポリシー

Microsoft は最新バージョンと２つ前までのバージョンの Azure Stack Hub のみをサポートします。2021年1月現在においては、最新が2008 updates ですので、サポートされるバージョンは、2008と2005、2002のみです。2002 よりも古いバージョンの Azure Stack Hub はサポート対象外です。

参考：[システムがサポートされる状態を維持する](https://docs.microsoft.com/ja-jp/azure/azure-stack/azure-stack-servicing-policy#keep-your-system-under-support)

したがって、Azure Stack Hub を利用し始めたら 利用を終えるまでアップデートし続ける必要があります。Azure Stack Hub に「導入したら塩漬けてアップデートしない」という選択肢はありません。このような運用を行いたい方は、Azure Stack Hub に向いていません。

## まとめ

本日のエントリでは、Azure Stack Hub のアップデートについてまとめました。Immutable Infrastructure の考え方でクラウド基盤全体をアップデートする Azure Stack Hub の仕組みに素直に関心します。技術的に実現できることは理解できるのですが、それを実装して商用リリースしている Azure Stack Hub 開発チームは凄い。

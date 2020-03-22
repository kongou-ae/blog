---
title: Azure Stack Hub 2002 Update
author: kongou_ae
date: 2020-03-19
url: /archives/2020/03/azure-stack-hub-2002-update
categories:
  - azurestack
---

Azure Stack Hub 2002 Update がリリースされました。本エントリでは、2002 Update の気になった点をまとめます。ただし、2002 Update の環境を触れていないので、本エントリはドキュメントの内容を踏まえた推測になります。2002 Update を触れたら、必要に応じて本エントリをアップデートします。

[Azure Stack Hub release notes](https://docs.microsoft.com/en-us/azure-stack/operator/release-notes?view=azs-2002#hotfixes)

なお、同じタイミングで 2002 Hotfix (Hotfix 1.2002.10.55)も配信されています。ただし、ドキュメントがまだ出ていません。。。Update と同じタイミングで Hotfix を配信するなら、Hotfix の内容を Update に含めてほしい。。。

## サポートポリシーの一時的な緩和

> As a result, the newly released 2002 update and any one of the three previous update versions (e.g. 1910, 1908, and 1907) will be supported.

「COVID-19 の影響で普段通りに運用できない場合もあるでしょう」ということで、2002 Update では N+2 のサポートポリシーが一時的に N+3になりました。本来であれば 2002 Update のリリースに伴い1907 Update はサポート対象外になるはずでした。ですがこの緩和策により、1907 Update は引き続きサポート対象です。

## 完全アップデートの安定性向上

Ignite 2019 で Vijay が発表した「2020年上半期を目標に Full Update 中のダウンタウンをなくす」という機能の下準備が実施されたようです。次の完全アップデート（3か月後くらい？）でこの機能が有効になるようです。安定性の向上は良いことです。

参考：[Azure Stack Integrated system のアナウンス@Ignite 2019](https://aimless.jp/blog/archives/2019/11/update-of-azurestackhub-in-ignite2019/)

## ログ取得機能の破壊的変更

> Improvements to diagnostic log collection. The new experience streamlines and simplifies diagnostic log collection by removing the need to configure a blob storage account in advance. The storage environment is preconfigured so that you can send logs before opening a support case, and spend less time on a support call.

ポータルからログを取得する機能が大幅に変更されました。

- 変更前：ログをアップロードするストレージアカウントを利用者が指定する
- 変更後：ストレージアカウントを指定しなくていい。つまりシステム側に埋め込まれている

参考：
- [Send Azure Stack Hub diagnostic logs now](https://docs.microsoft.com/en-us/azure-stack/operator/azure-stack-configure-on-demand-diagnostic-log-collection-portal-tzl?view=azs-2002)
- [Send Azure Stack Hub diagnostic logs proactively](https://docs.microsoft.com/en-us/azure-stack/operator/azure-stack-configure-automatic-diagnostic-log-collection-tzl?view=azs-2002)

この破壊的な変更に伴い、ポータルからログを取得する際に任意の SAS Token つき URL を指定できなくなりました。ポータルのログ取得機能を使って自分たちのストレージアカウントにログを保存している人は、ポータルによるログ取得から　Privileged Endpoint の Get-AzureStackLog コマンドを使った方法に切り替える必要があります。

{{< figure src="/images/2020-0322-002.jpg" title="2002 Update の自動ログ取得の設定画面" >}}

{{< figure src="/images/2020-0322-003.png" title="2002 Update の手動ログ取得の設定画面" >}}


ただし、この破壊的な変更に伴い、障害時に Microsoft のサポートに対してログを送る段取りが簡素化されました。とてもありがたい。2002 Update 前後の変更点は次の通りです。

### 2002 Update 未満の段取り

2002 Update 未満、例えば1910 Update において Microsoft のサポートにログを送るための段取りは次の通りです。

1. 何かしら異常を検知する
2. Azure ポータルから SR をあげる
3. Microsoft のサポート担当から返信が来る。この時に、Microsoft のサポートが使っているストレージアカウントの SAS Token つき URL をもらえる
4. もらった SAS Token つき URL を使って、Azure Stack Hub のポータルからログを集めて送る

この段取りではログを送るまでに一定の時間がかかります。なぜなら、Microsoft のサポート担当から SAS Token つき URL をもらわないとログを送れないからです。不要な待ち時間が発生してしまいます。

### 2002 移行の段取り

2002 Update の改善により、今後は次のような段取りでログを送れるようになります。

1. 何かしら異常を検知する
2. Azure Stack Hub のポータルからログを集めて送る
3. Azure ポータルから SR をあげる

Microsoft のサポート担当からの返信を待たずにログを送れるようになるので、調査に入るまでの時間を大幅に短縮できます。とてもよい。

## ログを取得する時間の短縮

> Time taken for both Proactive Log Collection and the on-demand log collection has been reduced by 80%. 

ポータルからログを取得する際の所要時間が 80％ 減りました。圧倒的削減。Azure Stack Hub のログ取得はとても簡単なのですが、すぐには終わらず待ち時間が多いです。この待ち時間が80%減なのであれば、地味だけど嬉しい改善です。

## アップデートのパッケージをダウンロードする進捗の表示

> The download progress of an Azure Stack Hub update package is now visible in the update blade after an update is initiated.

Connected な Azure Stack Hub は、アップデートで利用するパッケージをインターネットからダウンロードします。このダウンロードの進捗をポータルで確認できるようになりました。今まではダウンロードがどれだけ進んでいるのかを知る術がなく、ただただ待つ必要がありました。。。地味だけど嬉しい改善です。

## 裏で動いているタスクの表示

> The administrator portal now indicates if an operation is in progress, with an icon next to the Azure Stack region. 

裏で動いているタスクをポータルから確認できるようになりました。裏でタスクが動いている場合、リージョン名の隣に青い丸が付きます。カーソルを合わせるとどのようなタスクが裏で動いているのか分かります。

{{< figure src="/images/2020-0322-001.png" title="Azure に登録中の表示" >}}

タスクが裏で動いている際に新規のタスクを走らせると、新規のタスクが失敗するケースがありました。例えば過去には、バックアップ中にアップデート走らせた結果アップデートが失敗しました。

新規のタスクを走らせる前にタスクが裏で動いていないことを確認したいのですが、「裏で動いているタスクを確認するためにはマイクロソフトのサポート担当の協力が必要」というちょっといけてない実装でした。この改善により裏で動いているタスクを自分で確認できるようになったので、タスクの競合による失敗を避けられるようになります。地味だけど嬉しい改善です。

## マーケットプレイスのアイテムをダウンロードできなくする設定

> Added a new feature to marketplace management that provides the ability to block administrators from downloading marketplace products that are incompatible with their Azure Stack, due to various attributes such as the Azure Stack version or billing model.

特定のマーケットプレイスのアイテムを管理者がダウンロードできなくする機能が追加されました。Azure Stack Hub のマーケットプレイスには、管理者がダウンロードしてはならないアイテムがあります。最たる例が、課金モデルの異なる Windows Server のイメージです。

> Microsoft は、2 つのバージョンの Windows Server イメージを Azure Stack Hub Marketplace で提供しています。 Azure Stack Hub 環境で使用できるのは、このイメージの 1 バージョンのみです。

参考：[Azure Stack Hub Marketplace 内の Windows Server に関する FAQ](https://docs.microsoft.com/ja-jp/azure-stack/operator/azure-stack-windows-server-faq#what-are-the-licensing-options-for-windows-server-marketplace-images-on-azure-stack-hub)

2002 Update で実装された機能により、誤ったイメージをダウンロードしてしまったというミスを防げるようになりそうです。ありがたい。

## 所感

2002 Update で気になった機能をまとめました。運用面では、SAS Token つき URL なしで Microsoft のサポート担当にログを送れるようになった点が最大のアップデートでしょう。事象の発生から障害の調査に入るまでの時間を大幅に削減できるようになりました。

なお、2002 Update のアナウンスにあわせてドキュメントの更新履歴を確認していたところ、稼働中の VM にマウントされた Managed Disk のスナップショットがサポートされそうになった雰囲気がありました。

参考：[Remove Live Snapshot part](https://github.com/MicrosoftDocs/azure-stack-docs/commit/67c00c40070ab6ab1d112b2761c418e5c6b21e8b#diff-c7ea6a72e58e81ae479f47057b03bd14)

ですが、残念なことにこの文言がリリース直前にドキュメントから削除されてしまいました。。。不具合が見つかったのでしょうか。。。稼働中の VM が使っている Managed Disk のスナップショットがサポートされていない現状は、Azure との一貫性における大きなギャップです。早くサポートされてほしい。。。

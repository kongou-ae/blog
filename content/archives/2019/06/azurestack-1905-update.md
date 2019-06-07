---
title: Azure Stack 1905 Update
author: kongou_ae
date: 2019-06-07
url: /archives/2019/06/azurestack-1905-update
categories:
  - azurestack
---

## はじめに

Azure Stack 1905 Update がリリースされました。本エントリーでは Azure Stack 1905 Update で気になった点をまとめます。ただし、実際に統合システムで確認できていない部分もあるので、一部推測を含みます。

[Azure Stack 1905 update](https://docs.microsoft.com/en-us/azure-stack/operator/azure-stack-release-notes-1905)

## アップデートの種類

1905 Update は Full なアップデートです。Host Node の OS に対する Windows Update が含まれるので、アップデートにかかる時間は20時間から30時間になります。

[Azure Stack 1905 update](https://docs.microsoft.com/en-us/azure-stack/operator/azure-stack-release-notes-security-updates-1905#1905-update)

## Azure Stack の Update engine によるファームウェアの更新

1905 Update では、Azure Stack の update engine で Host Node のファームウェアを更新できる機能が実装されました。これまで Azure Stack の アップデートでは、アップデートの対象によって提供元と実施方法が異なっていました。

- Azure Stack のソフトウェア部分
  - 提供元：Microsoft
  - 実施方法：Azure Stack Update engine
- Host Node のドライバ
  - 提供元：OEM ベンダ
  - 実施方法：Azure Stack Update engine
- Host Node のファームウェア
  - 提供元：OEM ベンダ
  - 実施方法：OEM ベンダ独自の手法

そのため、3つのアップデート対象が同月にリリースされた場合、メンテナンスタイムを3回設けて Host Node を3回再起動しなければなりません。これはつらい。

今回の機能の実装により、技術的には Azure Stack の Update engine だけで Azure Stack のソフトウェアとドライバ、ファームウェアをアップデートできるようになるはずです。したがって、提供元と実施方法が次のように変わり、メンテナンスタイムが2回に減ります。すばらしい。

- Azure Stack のソフトウェア部分
  - 提供元：Microsoft
  - 実施方法：Azure Stack Update engine
- Host Node のドライバ、ファームウェア
  - 提供元：OEM ベンダ
  - 実施方法：Azure Stack Update engine

ただし、OEM ベンダがこの実装に追随しなければなりません。Azure Stack は構成が似ているため OEM ベンダごとの差異が出にくいですが、このような仕様変更への追随速度でベンダを選ぶと幸せになれるかもしれません。

## Windows Server 2019 のサポート

これまでの Azure Stacak は 「Windows Server 2019 は動作するがサポート対象外。マーケットプレイスからダウンロードできない。ライセンスがアクティベートされない」という状況でした。1905 Update 以降、WIndows Server 2019 がサポート対象となり、マーケットプレイスからダウンロードできるようになります。ライセンスもアクティベートされます。

が、ASDK 1905 のマーケットプレイスでは Windows Server 2019 を確認できません。なぜでしょう・・・

<blockquote class="twitter-tweet" data-lang="ja"><p lang="en" dir="ltr">Where is Windows Server 2019?  <a href="https://twitter.com/hashtag/azurestack?src=hash&amp;ref_src=twsrc%5Etfw">#azurestack</a> <a href="https://twitter.com/hashtag/asdk?src=hash&amp;ref_src=twsrc%5Etfw">#asdk</a> <a href="https://t.co/b42f3PBxl1">pic.twitter.com/b42f3PBxl1</a></p>&mdash; こんごー (@kongou_ae) <a href="https://twitter.com/kongou_ae/status/1136913416457601024?ref_src=twsrc%5Etfw">2019年6月7日</a></blockquote>
<script async src="https://platform.twitter.com/widgets.js" charset="utf-8"></script>

## Support 画面の実装

管理者ポータル側に "Help + support" が追加されました。

<blockquote class="twitter-tweet" data-lang="ja"><p lang="ja" dir="ltr">おお！！General のカテゴリに &quot;Help + Support&quot;が増えてる！！ <a href="https://twitter.com/hashtag/azurestack?src=hash&amp;ref_src=twsrc%5Etfw">#azurestack</a> <a href="https://t.co/FIgpnr5yF0">pic.twitter.com/FIgpnr5yF0</a></p>&mdash; こんごー (@kongou_ae) <a href="https://twitter.com/kongou_ae/status/1136904547954089984?ref_src=twsrc%5Etfw">2019年6月7日</a></blockquote>
<script async src="https://platform.twitter.com/widgets.js" charset="utf-8"></script>

ASDK の場合は各種ドキュメントへのリンクが表示されます。Integrated systems の場合は、Microsoft へサポートリクエストを上げられるページが表示されるようです。

<blockquote class="twitter-tweet" data-lang="ja"><p lang="ja" dir="ltr">ASDK 1905 できたー。Azure Stackポータル上でサポートページっぽいのが開いた・・・これ統合システムだとどうなるんだろう？夢が広がる。<a href="https://twitter.com/hashtag/azureStack?src=hash&amp;ref_src=twsrc%5Etfw">#azureStack</a> <a href="https://t.co/l0AEkUP0QP">pic.twitter.com/l0AEkUP0QP</a></p>&mdash; こんごー (@kongou_ae) <a href="https://twitter.com/kongou_ae/status/1136903924550590464?ref_src=twsrc%5Etfw">2019年6月7日</a></blockquote>
<script async src="https://platform.twitter.com/widgets.js" charset="utf-8"></script>

Azure Stack について Microsoft にサポートリクエストを上げる場合、Azure ポータルを利用します。その場合、各種情報を手で入力しなければなりません。

{{< figure src="/images/2019-06-07-002.png" title="Azure Portal での入力画面" >}}

新しく実装された Azure Stack 上のサポート画面から Microsoft にサポートリクエストをあげると、利用している Azure Stack の各種情報が自動的に入力されるようです。素晴らしい。

## 3台目のドメインコントローラ

Azure Stack 内部で動作しているドメインコントローラが2台から3台になるようです。Azure Stack 内部のドメインコントローラは Host Node の OS ドライブに VHD ファイルが配置されおりクラスタリングされていません。そのため ドメインコントローラが2台だと、ドメインコントローラが動作している Host Node をアップデートしている際にもう1台のドメインコントローラが動作している Host Node が停止するような事態が起きると、ドメイン環境のすべてのドメコンが停止するという絶望的な状況に陥ります。

1905 Update によってドメインコントローラが3台になれば絶望的な状況に陥る可能性が大幅に減りますので、メンテナンス中の信頼性と可用性が向上します。毎月アップデートしていかなければならない Azure Stack にとってはメンテナンス中の信頼性と可用性は重要です。素晴らしい改善です。

## 新しい Infrastructure Role Instance の追加

ASDK に "Azs-SRNG01" という新しい Infrastructure Role Instance が追加されました。ADSK に追加されたということは Integrated systems にも登録されているのでしょう。リリースノートには全く記載されていません。。。

"Azs-SRNG01" にログインして調べたところ、ServiceFabric 上に SupportBridgeController というアプリケーションの LogCollectorService というサービスが動作していました。名前からすると、管理者ポータルの "Help + Support" を支える Infrastructure Role Instance でしょうか。

```
[azs-srng01]: PS C:\Users\AzureStackAdmin\Documents> Get-ServiceFabricApplication | Get-ServiceFabricService | ft ServiceName, ServiceStatus, HealthState -AutoSize 

ServiceName                                         ServiceStatus HealthState
-----------                                         ------------- -----------
fabric:/SupportBridgeController/LogCollectorService        Active          Ok
```

Log Collector Service というくらいなので、管理ポータルの "Help + support" から Azure Stack のログを取得・サポートに送付できるようになったりしないかな・・・

## おわりに

1905 Updete のリリースノートを読んで気になった点をまとめました。[Azure Stack 1904 Update](https://aimless.jp/blog/archives/2019/05/azure-stack-1904-update/)と同じように、今後につながる意欲的なアップデートだと思います。ありがとう Microsoft!!

---
title: Azure Stack 1904 Update
author: kongou_ae
date: 2019-05-03
url: /archives/2019/05/azure-stack-1904-update
categories:
  - azurestack
---

## はじめに

Azure Stack 1904 Update がリリースされました。

<blockquote class="twitter-tweet" data-cards="hidden" data-lang="ja"><p lang="en" dir="ltr">Bunch of awesome improvements with <a href="https://twitter.com/hashtag/AzureStack?src=hash&amp;ref_src=twsrc%5Etfw">#AzureStack</a> 1904 update <a href="https://t.co/ShXYdh7pog">https://t.co/ShXYdh7pog</a></p>&mdash; Vijay Tewari (@vtango) <a href="https://twitter.com/vtango/status/1123643106375528450?ref_src=twsrc%5Etfw">2019年5月1日</a></blockquote>
<script async src="https://platform.twitter.com/widgets.js" charset="utf-8"></script>

1903 Update は Integrated system のみでしたが、1904 Update は Integrated system と Development kit の両方がリリースされました。@vtango が「Bunch of awesome improvements」と言っているように、大量の改善が行われて known issue が大幅に減ったことがリリースノートから読み取れます。

ASDK 1904 をざっと触ってみた印象をもとに、気になった箇所をまとめていきます。

## ユーザ向けポータルの更新

ユーザ向けポータルが最近の Azure ポータルと同じ雰囲気になりました。ここ数か月のユーザ向けポータルの見た目は Azure ポータルの進化のスピードに追随できていませんでした。ですが、1904 Update によって「Azure との一貫性」という Azure Stack のコンセプト象徴である見た目が Azure に追いつきました。

{{< figure src="/images/2019-05-03-004.png" title="Update 画面" >}}

## Syslog のフィルタ

Azure Stack のインフラ部分のログを syslog で送信する機能に Severity によるフィルタが追加されました。過去のバージョンで Syslog を設定した際には大量のログが飛んできて困ったのですが、Set-SyslogClient の -OutputSeverity を Default にすれば、warning と critical、error のログだけを syslog で送信するようです。どんなログが飛んでくるのかそのうち試します。

## インフラ側が利用するメモリの増加

Azure Stack のインフラ側が、追加で「12 GB + ( 4GB * Host Node)」分のメモリを消費するようになります。Host Node 4台構成の場合、28GB のメモリが利用者側で利用できなくなります。

1902 Update でも Azure Stack のインフラ側が追加で12GB のメモリを消費するようになりました。Azure Stack は機能追加・性能改善のためにインフラ側が利用するメモリの量を増やしてくる傾向にありますので、余裕を持ったキャパシティ計画がお勧めです。

## ログを Blob に直接吐き出す機能

Azure Stack のログを集めるコマンドである Get-AzureStackLog が ログを Blob に直接吐き出す機能をサポートしました。Get-AzureStackLog の -OutputSASUri にログを吐き出したい Blob の SAS Token つき URL を設定すると、ログファイルが Blob に書き出されます。

```
$pep = New-PSSession Azs-ercs01 -ConfigurationName privilegedendpoint
$token = "https://aimless.blob.core.windows.net/sr00000000?sv=2018-03-28&ss=b&srt=co&sp=rwdlac&se=2019-05-02T21:02:55Z&st=2019-04-30T13:02:55Z&spr=https&sig=xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
Invoke-Command -Session $pep -ScriptBlock {
    Get-AzureStackLog -OutputSasUri $using:token
}
```

{{< figure src="/images/2019-05-03-001.png" title="Blob に吐き出された Get-AzureStackLog" >}}

一見すると地味な機能ですが、Connected な Integrated system の場合、Integrated system 上のログファイルを Microsoft のサポートが利用する Blob に直接アップロードできるようになったということです。ありがたい。

## Resource Provider の ダウンロード 画面

マーケットプレイス連携の画面に Resource Provider が増えました。

{{< figure src="/images/2019-05-03-001.png" title="マーケットプレイス連携に追加された Resource Provider" >}}

Azure Stack Operator は、現在リリースされている App Service や MySQL、MsSQL などの追加の Resource Provider を、Admin Portal とは全く別の仕組みでインストールしなければなりません。これがつらい。@Darmour_MSFTが「今後 Azure Stack 上でリリースが予定されている IoT Hub と Event Hub はマーケットプレイスからぽちっとダウンロードする形でインストールできる」旨をTweetしていたので、その実装が着実に進んでいるということでしょう。

<blockquote class="twitter-tweet" data-lang="ja"><p lang="en" dir="ltr">When <a href="https://twitter.com/hashtag/AzureIoTHub?src=hash&amp;ref_src=twsrc%5Etfw">#AzureIoTHub</a> &amp; <a href="https://twitter.com/hashtag/AzureEventHubs?src=hash&amp;ref_src=twsrc%5Etfw">#AzureEventHubs</a> on <a href="https://twitter.com/hashtag/AzureStack?src=hash&amp;ref_src=twsrc%5Etfw">#AzureStack</a> private preview customers install the ResourceProvider they go through a 3 step process - Prereqs, Secrets, RP install. Others will see this in the public preview. Thx <a href="https://twitter.com/shriramnat?ref_src=twsrc%5Etfw">@shriramnat</a> <a href="https://t.co/S9g2NyKUis">pic.twitter.com/S9g2NyKUis</a></p>&mdash; David Armour (@Darmour_MSFT) <a href="https://twitter.com/Darmour_MSFT/status/1096390166673944576?ref_src=twsrc%5Etfw">2019年2月15日</a></blockquote>
<script async src="https://platform.twitter.com/widgets.js" charset="utf-8"></script>

## Resource Provider の Update 画面

Update の画面にも Resource Provider が増えました。

{{< figure src="/images/2019-05-03-003.png" title="Update 画面" >}}

Azure Stack Operator は、現在リリースされている App Service や MySQL、MsSQL などの追加の Resource Provider を、Admin Portal とは全く別の仕組みでアップデートしなければなりません。これがつらい。Azure Stack 自体の完全に自動化されたアップデートと同じように追加の Resource Provider もアップデートできるようになるのだとしたら素晴らしい。

## リリースノートと Known issue の分離

1903 Update までは、リリースノートと Known issue が一つのページに記載されていました。1904 Update ではリリースノートと Known issue のページが分かれました。

- [Azure Stack 1904 update](https://docs.microsoft.com/ja-jp/azure-stack/operator/azure-stack-release-notes-1904)
- [Azure Stack 1904 known issues](https://docs.microsoft.com/ja-jp/azure-stack/operator/azure-stack-release-notes-known-issues-1904)

また、Known issue が、Applicable, Cause, Remediation, Occurrence の4項目で整理されるようになりました。Known issue を正しく理解しなければならない運用担当にとってはありがたい改善です。

{{< figure src="/images/2019-05-03-00５.png" title="Known issue" >}}

---
title: Azure Stack 1901 Update
author: kongou_ae
date: 2019-02-09
url: /archives/2019-02-09-azurestack-1901-update
categories:
  - azurestack
---

## はじめに

Azure Stack 1901 Update がリリースされました。気になった箇所をまとめます。1901 Updateからは、新機能満載というよりも堅実な不具合修正という印象を受けました。

[Azure Stack 1901 update](https://docs.microsoft.com/en-us/azure/azure-stack/azure-stack-update-1901)

<blockquote class="twitter-tweet" data-lang="ja"><p lang="en" dir="ltr">AzS Update - 1.1901.0.95 was released. <a href="https://twitter.com/hashtag/AzureStackJP?src=hash&amp;ref_src=twsrc%5Etfw">#AzureStackJP</a></p>&mdash; こんごー (@kongou_ae) <a href="https://twitter.com/kongou_ae/status/1093947753019760640?ref_src=twsrc%5Etfw">2019年2月8日</a></blockquote>
<script async src="https://platform.twitter.com/widgets.js" charset="utf-8"></script>

## ASDK

### BGPNAT 廃止

これまでの ASDK には、BGP と NAT を担当する BGPNAT とよばれる Virtual Machine が存在していました。1901 Update では、この Virtual Machine が廃止されました。BGPNAT の Virtual Machine が担っていた機能は、ホストサーバに引き継がれています。

{{< figure src="./../../images/2019-02-09-001.png" title="左：1811の VM 一覧、右：1901 の VM 一覧" >}}

<blockquote class="twitter-tweet" data-lang="ja"><p lang="ja" dir="ltr">確かにホストサーバ上にNATとBGPがありそう <a href="https://t.co/i8h7tsJcFf">pic.twitter.com/i8h7tsJcFf</a></p>&mdash; こんごー (@kongou_ae) <a href="https://twitter.com/kongou_ae/status/1094205782944403459?ref_src=twsrc%5Etfw">2019年2月9日</a></blockquote>
<script async src="https://platform.twitter.com/widgets.js" charset="utf-8"></script>

これにより、BGPNAT が利用する IP アドレスが不要となり、ASDK をインストールする際に必要な IP アドレスが1つになりました。シンプルになるのは良いことです。

### Cloud Recovery モードでのデプロイ

Integrated Systems がサポートしているバックアップからのリストアが ASDK でもサポートされました。ASDK のインストーラに "Recover" が増えています。

[Use the ASDK to validate an Azure Stack backup](https://docs.microsoft.com/en-us/azure/azure-stack/asdk/asdk-validate-backup)

<blockquote class="twitter-tweet" data-lang="ja"><p lang="ja" dir="ltr">おお、Recoverモードが増えてる <a href="https://t.co/ONIC9IM9p6">pic.twitter.com/ONIC9IM9p6</a></p>&mdash; こんごー (@kongou_ae) <a href="https://twitter.com/kongou_ae/status/1094080780165238784?ref_src=twsrc%5Etfw">2019年2月9日</a></blockquote>
<script async src="https://platform.twitter.com/widgets.js" charset="utf-8"></script>

## Integrated Systems

### 新機能：Managed Images

既存の VM を一般化してイメージを作れる機能が Azure Stack でもサポートされました。Azure との一貫性が向上するのは良いことです。Managed Images のリリースに伴い、1901 Update では次のボタンが増えたはずです。ただし、手元に 1811 Update 以前の環境がないため、比較したうえでの確認はできていません。

{{< figure src="./../../images/2019-02-09-002.png" title="キャプチャボタン" >}}

### 変更点：バックアップの暗号化方式

バックアップファイルを暗号化する方法が文字列から証明書に変更になりました。文字列による暗号化を利用している人は切り替え必須です。

<blockquote class="twitter-tweet" data-lang="ja"><p lang="ja" dir="ltr">Azure Stack のバックアップが証明書で暗号化する方式にかわってる。この証明書をなくすとリストアできないやつや・・どこで発行するか。 <a href="https://t.co/OJ3d5lRHXN">pic.twitter.com/OJ3d5lRHXN</a></p>&mdash; こんごー (@kongou_ae) <a href="https://twitter.com/kongou_ae/status/1094217690821013504?ref_src=twsrc%5Etfw">2019年2月9日</a></blockquote>
<script async src="https://platform.twitter.com/widgets.js" charset="utf-8"></script>

### 変更点：キャパシティ計画時の考慮事項

Azure Stack のサイジングをする際の考慮事項に、次の2つが追加されました。

- 1台のホストノードあたり最大60 VM
- 1つの Azure Stack ( 1つの Scale Unit かな？ ) で、最大700 VM

### 不具合修正：Infrastructure role unhealthy

1712 Update ？から発生した「 影響がないにも関わらず Infrastructure role unhealthy のアラートがでてしまう不具合」が修正されました。長かった・・・。この修正によって、監視システムからの不要なアラートがぐっと減るはずです。

### 不具合修正：Test-AzureStack からの Get-AzureStackLog すると失敗する

1811 Update で「同じ ERCS で Test-AzureStack からの Get-AzureStackLog すると、Get-AzureStackLog が失敗する」という不便な不具合が発生しました。ERCS_AzureStackLogs.ps1 で Test-AzureStack と Get-AzureStackLog を一気に実行している私にとっては、本当に不便な不具合でした。修正されて良かったです。

### 不具合修正：Microsoft Update の自動ダウンロードが動かなくなる

OEM がリリースする Azure Stack の Update を適用すると、Microsoft がリリースする Update の配信を検知してくれなくなるという不具合が発生していました。そのため、Update パッケージを手動でダウンロードするという不便を強いられていたのですが、この不便な不具合が修正されました。

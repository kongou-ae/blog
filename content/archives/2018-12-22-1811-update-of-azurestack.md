---
title: Azure Stack 1811 update の所感
author: kongou_ae
date: 2018-12-22
url: /archives/2018-12-22-1811-update-of-azurestack
categories:
  - azurestack
---

## はじめに

Azure Stack 1811 update がリリースされました。

<blockquote class="twitter-tweet" data-cards="hidden" data-lang="ja"><p lang="en" dir="ltr"><a href="https://twitter.com/hashtag/azurestack?src=hash&amp;ref_src=twsrc%5Etfw">#azurestack</a> 1811 update is out. <a href="https://t.co/g5p1bVOG3W">https://t.co/g5p1bVOG3W</a>. Lots of goodness, extension host, updated storage API version, addl phys node ops, PEP cmd to update BMC creds, device auth with ADFS, improved mktplce exp, lots of fixes &amp; more. Do read the rel notes:)</p>&mdash; Vijay Tewari (@vtango) <a href="https://twitter.com/vtango/status/1075827770481995776?ref_src=twsrc%5Etfw">2018年12月20日</a></blockquote>
<script async src="https://platform.twitter.com/widgets.js" charset="utf-8"></script>

本日のエントリーでは、1811 update の中で気になった新機能・変更点をまとめます。ただし、ADFS な Azure Stack を持っていないので、ADFS 周りのリリースには触れません。あらかじめご了承ください。

## Extension host

1811 update の目玉は extension host です。従来の Azure Stack は、管理画面を操作するために TCP/443以外の通信を通信が必要でした。そのため、利用者と Azure Stack の間にファイアウォールや Proxy が存在する場合、特殊なポートを利用する通信が破棄されてしまい画面がうまく表示されませんでいた。

{{< figure src="./../../images/2018-12-22-001.png" title="TCP/13010 の通信" >}}

この問題を解消するためにリリースされた機能が、extension hostです。extension host は Azure Stack 内部でリバースプロキシとして動作します。利用者は extension host と TCP/443 だけで通信するようになり、extension host が TCP/443 以外の特殊なポートを利用するコンポーネントと通信します。つまり、利用者と Azure Stack の間で許可すべきポートが TCP/443 だけになったわけです。素晴らしい。ネットワーク管理者の歓喜の声が聞こえます。

{{< figure src="./../../images/2018-12-22-002.jpg" title="Extension Host を利用している例" >}}

## Host Node の操作性向上

1809 以前の Azure Stack では、Host Node のステータスを確認するために、Host Node を1つずつクリックする必要がありした。地味に面倒です。

{{< figure src="./../../images/2018-12-22-003.png" title="1809 以前の Host Node 画面" >}}

1811では、Host Node の操作性が著しく向上しています。複数ノードが一覧で表示されて、一覧で表示されている画面で Host Node を操作できるようになりました。素晴らしい

{{< figure src="./../../images/2018-12-22-004.jpg" title="1811 以降の Host Node 画面" >}}

## アラート画面からのリペア機能

[Azure Stack を診断する](https://aimless.jp/blog/archives/2018-12-19-diagnose-azure-stack/)に記載した通り、Azure Stack のアラートには Remediation という形で対応方法が記載されています。1811 update では、対応方法の中に Repair ボタンが実装されました。Repair ボタンを押すとアラートに即した復旧作業を Azure Stack が自動的に実施してくれるようです。

参考：[Repair alerts](https://docs.microsoft.com/en-us/azure/azure-stack/azure-stack-monitor-health#repair-alerts)

## バックアップ量の増加

Azure Stack の管理者側バックアップの容量が約10GBから約20GBに増えました。バックアップ先のファイルサーバの容量がギリギリな方は、容量を増やすか保存期間・取得頻度を減らしましょう。

## 細かな操作性の向上

上記以外にも、「痒いところに手が届く」系の修正が行われています。

### サブスクリプションの無効化

管理者ポータル上で、利用者向けサブスクリプションを無効化できるようになりました。これまでは PowerShellでのみ無効化できました。

{{< figure src="./../../images/2018-12-22-005.jpg" title="Disable ボタン" >}}

### Plan から Quota を参照

Plan から Quota を直接参照・編集できるようになりました。1811 以前では、Plan から Quota を直接確認できませんでした。確認するためには、リソースプロバイダの画面に戻ってから Quota を探す必要がありました。これがまー面倒。

{{< figure src="./../../images/2018-12-22-006.png" title="Quota の名前だけが表示されるだけ" >}}

1811 では Plan から Quota に直接アクセスできるようになりました。Plan のメンテナンスがかなり楽になります。

{{< figure src="./../../images/2018-12-22-007.png" title="Quota の名前が、Quota へのリンクに変更" >}}

## まとめ

本日のエントリでは、1811 update の中で気になった新機能と変更点をまとめました。やはり、1811 Update の目玉は extension host です。extension host の登場によって、社内 LAN からインターネット上にデプロイされた Azure Stack へのアクセスが容易になりました。インターネット経由で Azure Stack を利用者に提供するサービスプロバイダにとって、extension host は福音でしょう。

また、運用者目線では、細かな操作性の向上がありがたいです。Azure Stack の管理画面も Azure の管理画面と同じように継続的に進化することがわかりました。今後もどんどん使いやすくなってくれると嬉しいです。

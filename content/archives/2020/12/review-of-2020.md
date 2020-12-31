---
title: 2020年の振り返り
author: kongou_ae
date: 2020-12-31
url: /archives/2020/12/review-of-2020
categories:
  - etc
---

2020年の振り返りエントリです。1年ぶり4度目のようです。

- [2019年の振り返り](https://blog.aimless.jp/archives/2019-12-31-review-of-2019)
- [2018年の振り返り](https://blog.aimless.jp/archives/2019-01-01-review-of-2018)
- [2017年の振り返り](https://blog.aimless.jp/archives/2018-01-02-the-review-of-2017)

## ブログ

ブログを26本書きました。Azure Stack Hub のアップデートのリリース頻度が毎月から年数回に変わったこともあり、昨年と比べるとアウトプットの量は減りました。英語の勉強もかねて、「このネタが気になる日本人いるか・・？」という感じの Azure Stack Hub のディープなネタを英語で公開することにも挑戦しました。

- [Create the certificate for Azure Stack Hub PaaS automatically with PowerShell](https://blog.aimless.jp/archives/2020/12/create-certificate-for-additional-rp-with-PowerShell)
- [Tips for AKS Engine on Azure Stack Hub](https://blog.aimless.jp/archives/2020/02/tips-for-aksengine-on-azurestackhub/)
- [How to check the progress of Azure Stack Hub Update more efficiently](https://blog.aimless.jp/archives/2020/08/how-to-check-the-progress-of-azurestackhub-update-more-efficiently)
- [Monitoring the expiration of App Service RP's secret on Azure Stack Hub](https://blog.aimless.jp/archives/2020/02/monitoring-the-expiration-of-appservicerps-secret-on-azurestackhub/)

Azure 関連では、昨年と同様、ハイブリッドクラウドやネットワーク、運用といったネタを投稿しました。また、ブログとしてアウトプットするには量が多いネタを単独のスライドとして公開することにも挑戦してみました。（参考：[仮想アプライアンス担当者向け Azure ネットワーク](https://speakerdeck.com/kongou_ae/azure-network-that-focus-on-network-virtual-appliance)）

ただし「評価・検証したものの Twitter でつぶやいて終了」なネタがちらほら見受けられました。Twitter で何となくつぶやいて満足してしまうと未来の自分が改めて調べるときに困るので、来年はしっかりとブログに残します。

## 登壇

イベントに3回登壇しました。メインセッションが1回、LTが2回です。来年も機会があれば登壇します。登壇は最大の勉強です。

- [【オンライン開催】AzureStackHCI & WindowsAdminCenter](https://hybridcloud.connpass.com/event/177887/)
- [★祝★Japan Azure User Group 10周年](https://jazug.connpass.com/event/186235/)
- [第30回 Tokyo Jazug Night (Online)](https://jazug.connpass.com/event/197139/)

## Microsoft プロダクトへの貢献

昨年と同様、Azure Stack Hub にフィードバックを送りました。日本市場での Azure Stack Hub は爆発的に売れるものではないものの、いざ売れたときにサービスがイマイチだと困るので、引き続きフィードバックを出していきます。

それ以外では、公式ドキュメントにプルリクエストを送りました。タイポやサンプルコードの修正が主です。サンプルコードが間違っていると自分を含む誰かがいつか困りそうなので、見つけ次第プルリクを出すようにしました。Azure/azure-powershell へのプルリクがマージされた結果、リリースノートに名前が乗ったのがちょっとうれしかったです。

- [Azure/azure-powershell へのプルリク](https://github.com/Azure/azure-powershell/pulls?q=is%3Apr+kongou-ae+)
- [MicrosoftDocs/azure-stack-doc へのプルリク](https://github.com/MicrosoftDocs/azure-stack-docs/pulls?q=is%3Apr+kongou-ae)
- [MicrosoftDocs/azure-docs へのプルリク](https://github.com/MicrosoftDocs/azure-docs/pulls?q=is%3Apr+kongou-ae)

これらの活動を評価いただいたのか、Microsoft MVP for Microsoft Azure を再受賞できました。今年も再受賞できたらうれしいです。

## 趣味のプログラミング

2017年から始めた趣味のプログラムでは「こんなことできたら便利じゃね？」という思い付きを動くプログラムにすることを続けました。成果物は次の通りです。

- [kongou-ae/Show-AzNsgFlowLogs](https://github.com/kongou-ae/Show-AzNsgFlowLogs)
  - NSG Flow Logs を PowerShell の Get-GridView で可視化するスクリプト
- [kongou-ae/Get-AzAvailabilityZones](https://github.com/kongou-ae/Get-AzAvailabilityZones)
  - 可用性ゾーンの対応リージョンを調べるスクリプト
- [kongou-ae/ConvertTo-AzHtml](https://github.com/kongou-ae/ConvertTo-AzHtml)
  - Azure のリソースを HTML に書き出すスクリプト
- [kongou-ae/Set-AzConnectedMachineMetadata](https://github.com/kongou-ae/Set-AzConnectedMachineMetadata)
  - Azure Arc enabled servers のタグにサーバの構成情報を書き込むスクリプト
- [Change history of Azure docs](https://azdochistory.aimless.jp/)
  - Azure と Azure Stack のドキュメントの日次の変更差分をまとめるサイト

ただし、作ったら終わりな物ばかりなので、2021年は継続的にメンテナンスするような何かを作れればなぁと思います。あと PowerShell の次の一手として C# を始めたい。

## 転職活動

現業に目立った不満がないこともあって、目立った活動をしませんでした。反省。

## COVID-19関連

COVID-19 を踏まえて、原則として在宅勤務に切り替えました。自分の部屋が存在しないので子供部屋の一角を仕事場所にしました。高価なものを買う予算はないのでぼちぼちのものを買った結果、それなりの出費がかかりました。辛い。いずれ仕事部屋が欲しい・・・

**主要なお買い物**

- [デスク(プロモ 1040 MBR)](https://www.nitori-net.jp/ec/product/6200803/)
- [ワークチェア(クエト BK)](https://www.nitori-net.jp/ec/product/6620524s/)
- [デロンギ(DeLonghi) オイルヒーター [8~10畳用] ゼロ風暖房 ホワイト HJ0812](https://www.amazon.co.jp/gp/product/B01508CMQ6/)
- [マイクロソフト キーボード マウスセット ワイヤレス/セキュリティ(暗号化機能搭載) Sculpt Ergonomic Desktop AES L5V-00030](https://www.amazon.co.jp/gp/product/B017V8MUB0/)
- [ALINCO(アルインコ) エクササイズフロアマット EXP150 床面保護 衝撃吸収 滑り止め](https://www.amazon.co.jp/gp/product/B0007TT7I0/)
- [エルゴトロン LX デスクマウント モニターアーム アルミニウム 45-241-026](https://www.amazon.co.jp/gp/product/B00358RIRC/)
- [Acer ゲーミングモニター SigmaLine 24.5インチ KG251QGbmiix 0.7ms(GTG) 75Hz TN FPS向き フルHD FreeSync フレームレス HDMIx2 スピーカー内蔵 ブルーライト軽減](https://www.amazon.co.jp/gp/product/B07JMLWK6D/)
- [Jabra Evolve2 85](https://www.jabra.jp/business/office-headsets/jabra-evolve/jabra-evolve2-85)

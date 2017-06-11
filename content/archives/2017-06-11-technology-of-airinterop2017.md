---
title: AirInterop.jpを支える技術2017
author: kongou_ae

date: 2017-06-11
url: /archives/2017-06-11-technology-of-airinterop2017
categories:
  - etc
---

## What

- AirInterop2017の非公式ホームページで使ったAI「ろっぷん」の説明
  - Azure Bot Serviceの説明
  - Azure Custom Vision APIの利用例

## Why

趣味でAirInterop.jpの非公式ホームページを作っています。非公式ホームページは、そのときの自分が興味を持っていることに挑戦する場です。

2016年は、[airinterop.jpを支える技術](https://aimless.jp/blog/archives/2016-06-11-the-technology-to-support-airinterop/)で書いたとおり、現地で参加したRe:Invent 2015の影響を受けて、LambdaやAPI Gatewayを使ったサーバレスな実装に挑みました。具体的な技術要素は次のとおりです。

  - S3の静的ウェブホスティング
  - サーバレスアーキテクチャの参加者カウンタ
  - Twitter APIを使ったツイート分析

今年は、直前に参加したDe:code 2017のセッションに影響を受けて、AIに挑戦しました。その結果として完成したものがネットワーク機器の画像からメーカーを推測するAI「ろっぷん」です。

## How

ろっぷんは2つの要素で構成されています。

1. チャット経由でユーザとやりとりするBOT機能
1. ユーザが入力した画像からメーカーを判定する機能

ユーザとやり取りする部分にはAzure Bot Serviceを使いました。メーカーを判定する部分にはAzure Cognitive ServiceのCustom Vision APIを使いました。

### Azure Bot Service

Azure Bot Serviceは4つの機能を提供します。BOTに必要な機能をまとめて提供してくれるので開発が楽でした。Bot Serviceのおかげでろっぷんが作れたと言っても過言ではありません。

{{<img src="./../../images/2017-06-11-001.png">}}

#### 1. BOTのコード（Azure Function）を開発する環境
Webベースのコードエディタが提供されます。外部リポジトリを利用した継続的インテグレーションもサポートしています。[Azure App Service への継続的なデプロイ](https://docs.microsoft.com/ja-jp/azure/app-service-web/app-service-continuous-deployment)に記載されているとおり複数サービスでホストされているリポジトリをサポートしているので、使い慣れたツールやワークフローで開発できます。

ろっぷんでは、CI機能を使ってGitHubのコードをBot Serviceにデプロイしました。

#### 2. BOTとのコミュニケーション方法

さまざまなコミュニケーション方法がデフォルトで用意されています。具体的にはAPIやWeb サイト、Slack、Facebook Messenger、Skype、Teams、メール、GroupMe、Kik、Telegram、Twilio などです。

ろっぷんではWebサイトを通じたコミュニケーションを利用しました。

#### 3. 利用状況の分析

Application Insightsを使って、ユーザ数やメッセージ数が自動的に集計されます。また、集計結果をBOTの管理画面から確認できます。

{{<img src="./../../images/2017-06-11-002.png">}}

この機能を使って、AirInteropの会期中にろっぷんの稼働状況をポストしてみました。

<blockquote class="twitter-tweet" data-lang="ja"><p lang="ja" dir="ltr">ろっぷん、これまでに493人（延べ）とお話ししています。学習モデルの精度がイマイチなのでおとぼけなところがあるかもしれません。ご容赦ください。 <a href="https://twitter.com/hashtag/airinterop?src=hash">#airinterop</a></p>&mdash; こんごー@頑張らないために頑張る (@kongou_ae) <a href="https://twitter.com/kongou_ae/status/872478210927214592">2017年6月7日</a></blockquote>
<script async src="//platform.twitter.com/widgets.js" charset="utf-8"></script>


#### 4. テスト

ブラウザ上でチャットを使ったテストができます。

### Custom Vision API

画像からメーカーを判定する部分にはCustom Vision APIを使いました。Custom Vision APIは画像をアップロードすることで機械学習のモデルを作れるサービスです。合計366枚のネットワーク機器の画像をアップロードして22のタグで分類しました。

初めは1メーカ1タグだったのですが、同じメーカーなのに見た目が全く違うネットワーク機器を1つのタグに入れてしまったせいか、予測の精度がいまいちでした。そこで、次の表のように、同じメーカーなのに見た目が違うネットワーク機器を別のタグに分割したうえで、BOT側で1つのメーカーとして処理する実装にしました。

|写真|APIのタグ|BOTの判定|
|---|---------|----------|
|Cisco ISRシリーズ|cisco-rt|シスコ|
|Cisco ASRシリーズ|cisco-rt-asr|シスコ|
|ヤマハのFW|yamaha-fw|ヤマハ|
|ヤマハのルータ|yamaha-router|ヤマハ|
|ヤマハのスイッチ|yamaha-sw|ヤマハ|

最終的な予測精度は適合率45.1％、再現率43.9％です。精度が低すぎます。いろいろ頑張ってみたのですが精度55％を超えられませんでした。機械学習でネットワーク機器を見分けることができないのか教師のデータが悪いのか、分析が必要です。

{{<img src="./../../images/2017-06-11-003.png">}}

タグごとの適合率と再現率は次のとおりです。

|Tag|Precision|Recall|
|---|---------|------|
|f5	|29.4%	|36.5%
|juniper-sw	|0.0%	|0.0%
|a10	|13.3%	|16.7%
|dlink	|50.0%	|52.8%
|extream	|33.3%	|17.8%
|alliedtelesis	|44.4%	|55.6%
|yamaha-router	|52.1%	|62.6%
|nec	|33.3%	|11.1%
|arista	|27.8%	|22.2%
|cisco-rt-asr	|29.4%	|38.9%
|dell	|8.3%	|6.7%
|checkpoint	|42.9%	|14.3%
|fortigate-white	|63.9%	|75.0%
|juniper-fw-new	|22.2%	|22.2%
|fortigate-black	|66.7%	|33.3%
|cisco-sw	|44.2%	|70.5%
|alaxala	|3.0%	|6.7%
|cisco-rt	|77.8%	|36.7%
|palo	|78.0%	|61.9%
|juniper-fw	|13.3%	|16.7%
|yamaha-fw	|100.0%	|100.0%
|yamaha-sw	|75.6%	|61.1%

## 来年に向けて

来年は何をしましょうか。VRが流行っているので「みんなで作るAirInterop会場」みたいのをやってみたいですね。ただし、現時点で実装方法はノープランです。
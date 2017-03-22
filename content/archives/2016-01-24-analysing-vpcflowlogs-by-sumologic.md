---
title: sumologicを使ってVPC Flow Logsを可視化する
author: kongou_ae
date: 2016-01-24
url: /archives/2016-01-24-analysing-vpcflowlogs-by-sumologic
categories:
  - aws
---

## VPC FLow Logsを可視化したい

検証環境のVPC Flow Logsを収集、調査、分析するためにElasticSearch Serviceを利用していましたが、利用料をケチるためにt2.microで動かしていたため動作が遅く困っていました。オンプレミスで十分なリソースを積んだElasticSearchを立ててもよかったのですが、目的はログを分析することであって、ElasticSearchを運用することではありません。

そこで、VPC FLow Logsに対応しており、無料プランのあるログ分析SaaSを調べたところ、[sumologic](https://www.sumologic.com/)が見つかりました。Re:Invent2015の会場で相撲を取っていたあのsumologicです。

参考：[Sumo wrestling, presented by SumoLogic @ AWS re:Invent2015 Game 3](https://www.youtube.com/watch?v=WLuH-Rht3nw)

トライアル期間を利用して、さらっと触ってみた結果をメモしておきます。

なお、現時点でのプランが30日トライアルのため、sumologicの全機能が利用できる状況です。30日後にフリープランになった場合、このエントリーに記載したことの何ができなくなるのか少々不安です。30日後に確認します。（参考：[Pricing](https://www.sumologic.com/pricing/)）

## SumoLogicにログを転送する仕組み

sumologicにログを転送する方法は2つあります。

|方法|詳細|
|---|---|
|installed Collector|自前のサーバ上にインストールするコレクター。サーバにエージェントが常駐する|
|Hosted Collector|sumologic上にホストされているコレクター。サーバにエージェントをインストールする必要なし|

詳細は[What's the difference between Collector types?](https://service.sumologic.com/help/Default.htm#Difference_between_Collectors.htm%3FTocPath%3DSending%2520Data%7CCollectors%7C_____1)を参照ください。

Hosted CollectorはデフォルトでAWSの以下サービスに対応しています。残念なことに、現時点でVPC Flow Logsには未対応です。（VPC Flow LogsをS3に吐き出せば、そのログを取得できるかもしれません）

- S3
- ELB
- CloudFront
- CloudTrail
- Config
- S3 Audit

![](http://aimless.jp/blog/images/2016-01-24-001.png)

## sumologicにVPC Flow Logsを送る方法

公式のヘルプ([Collecting Amazon VPC Flow Logs](https://service.sumologic.com/help/Default.htm#Collecting_Amazon_VPC_Flow_Logs.htm%3FTocPath%3DApps%7CSumo%2520Logic%2520App%2520for%2520Amazon%2520VPC%2520Flow%2520Logs%7C_____1))に従い、installed Collectorを利用したログ転送を試したのですが、以下のエラーが出てしまい上手く行きませんでした。

```
2016-01-22 17:39:29,994 10946 [pool-2-thread-4] INFO com.amazonaws.internal.DefaultServiceEndpointBuilder  - {logs, ap-southeast-1} was not found in region metadata, trying to construct an endpoint using the standard pattern for this region: 'logs.ap-southeast-1.amazonaws.com'.
```

そこで今回は、sumologicのgithubリポジトリで公開されているLambdaファンクション（[SumoLogic/sumologic-aws-lambda](https://github.com/SumoLogic/sumologic-aws-lambda/tree/master/cloudwatchlogs)）を利用することにしました。このLambdaファンクションは、VPC Flow Logsに特化したものではなく、sumologicのAPIを利用してCloudWatch Logsをsumologicに送るものです。そのため、VPC Flow Logs以外でも利用可能です。

なお、sumologicのAPI（Collector Management API）は、PROFESSIONALプラン以上で利用可能です。そのため、FREEプランでは利用できません。。。

## sumologicにログを送る

Hosted Collectorを作成します。

![](http://aimless.jp/blog/images/2016-01-24-002.png)

![](http://aimless.jp/blog/images/2016-01-24-003.png)

作成したHosted Collectorに、HTTPSでデータを投入できるAPIエンドポイントを追加します。

![](http://aimless.jp/blog/images/2016-01-24-008.png)

![](http://aimless.jp/blog/images/2016-01-24-009.png)

![](http://aimless.jp/blog/images/2016-01-24-007.png)

![](http://aimless.jp/blog/images/2016-01-24-004.png)


作成したエンドポイントの情報を元に[SumoLogic/sumologic-aws-lambda](https://github.com/SumoLogic/sumologic-aws-lambda/tree/master/cloudwatchlogs)の内容を修正して、Lambdaファンクションを作ります。

![](http://aimless.jp/blog/images/2016-01-24-005.png)

最後に、作成したLambdaファンクションをVPC Flow LogsのSubscriptionに追加します。

![](http://aimless.jp/blog/images/2016-01-24-006.png)

## ログを可視化する

sumologicには標準でVPC Flow Logsを可視化するAppsが用意されています。とりあえずこれを利用します。FREEプランになっても使えるかは要確認です。

![](http://aimless.jp/blog/images/2016-01-24-010.png)

Appには複数のダッシュボードとクエリが定義されています。とりあえずActivityなるダッシュボードを見てみます。

![](http://aimless.jp/blog/images/2016-01-24-011.png)

![](http://aimless.jp/blog/images/2016-01-24-012.png)

超カッコいい。

![](http://aimless.jp/blog/images/2016-01-24-013.png)


## ログを検索する

独自のクエリ言語を利用して、ログを検索することができます。

取り込んだVPC Flow Logsを送信元IPアドレスで限定して、送信元IPアドレスと宛先IPアドレスで分類して転送バイトを合計、さらに合計値でソートしてみます。アウト方向の転送量が多い通信を特定するクエリをイメージしています。

```
_sourceCategory=xxxx_vpcflowlogs message
| json "message","logStream","logGroup"
| parse field=message "* * * * * * * * * * * * * *" as version,accountID,interfaceID,src_ip,dest_ip,src_port,dest_port,Protocol,Packets,bytes,StartSample,EndSample,Action,status
| where src_ip = "172.20.0.10"
| sum(bytes) group by src_ip,dest_ip
| sort by _sum
```

クエリの結果が、下の方に表示されています。

![](http://aimless.jp/blog/images/2016-01-24-014.png)

結果をCSVでダウンロードすることもできます。

![](http://aimless.jp/blog/images/2016-01-24-015.png)

結果をグラフにすることもできます。

![](http://aimless.jp/blog/images/2016-01-24-016.png)

さらに結果をダッシュボードに追加することもできます。

![](http://aimless.jp/blog/images/2016-01-24-017.png)

![](http://aimless.jp/blog/images/2016-01-24-018.png)

## 雑な所感

有料のSaaSだけあってかなり使いやすいです。また、Hosted Collectorを利用することで、サーバレスでAWSの各種ログを収集・分析することができます。今後、AWSのログを保存・分析するための基盤のお仕事があった場合、検討候補にしたいと思います。

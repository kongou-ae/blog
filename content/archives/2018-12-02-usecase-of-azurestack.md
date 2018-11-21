---
title: Azure Stack のユースケース
author: kongou_ae
date: 2018-12-02
url: /archives/2018-12-02-usecase-of-azurestack
categories:
  - azurestack
---

## はじめに

本エントリーは[Microsoft Azure Stack Advent Calendar 2018](https://qiita.com/advent-calendar/2018/azure-stack)の2日目です。

先日のエントリでは、Azure Stack とは何なのかについてお話ししました。本エントリでは、Azure Stack のユースケースについてお話しします。

## Microsoft の想定するユースケース

2018年9月に開催された Microsoft Ignite 2018 において、Azure Stack 開発チームのジェネラルマネージャーである Natalia Mackevicius 氏は、次の3つのユースケースを語りました。これら3つのユースケースについて1つずつ説明していきます。

1. Edge & Disconnected
2. Reguatory & Data Sovereignty
3. Application Modernization

{{<img src="./../../images/2018-12-02-001.png">}}

引用：[Azure Stack Overview and Roadmap - BRK2367](https://www.youtube.com/watch?v=IIgyt80dfgY)

## ユースケース1　Edge & Disconnected

1つ目のユースケースが Edge & Disconnected です。このユースケースの課題と解決策のサマリは次の通りです。

***Edge***
- 課題
  - 大量のデータを Microsoft のデータセンタに送るのが大変
- 解決策
  - データが生成される場所に Azure Stack を置く
  
***Disconnected***
- 課題
  - Microsoft のデータセンタと通信するためのネットワークを確保できない
- 解決策
  - Azure Stack を Disaconected Deployment で導入する

2つの要素が混ざっているので１つづつ説明します。

1つ目は Edge です。IoT やビックデータの世界において、大量のデータは Azure のデータセンタではない場所、つまり Edge で生成されます。生成された大量のデータを Azure のサービスで分析するためには、大量のデータを Microsoft のデータセンタに転送しなければなりません。しかし、回線帯域や距離、遅延の問題から、大量のデータの転送に時間がかかるという問題が生じる可能性があります。データから気づきを得るために時間がかかることは、ビジネス上の損失に繋がります。

Azure のサービスを好きな場所で利用できるという Azure Stack の特徴を利用すれば、この問題を解決できます。大量のデータが生成される場所に Azure Stack を設置すれは、大量のデータとAzure のサービスの距離が近づくのでデータの転送時間を短縮できます。結果として、大量のデータから気づきを得る時間が早くなり、ビジネス上の機会損失を減らせます。

2つ目は Disconnected です。Azure のサービスを利用するためには利用者と Microsoft のデータセンタがネットワークで繋がっている必要があります。そのため、Microsoft のデータセンタとのネットワーク接続を用意できない環境、またはネットワーク接続が安定しない環境では Azure を利用できません。

好きな場所で利用できるという Azure Stack の特徴を利用すれば、この問題を解決するできます。Azure Stack には Disconnected deployment という導入方式が存在します。この方式の Azure Stack はインターネットと通信できない環境でも動作します。つまり、Azure とのネットワーク接続を用意できない切断された環境でも、Azure のサービスを利用できるようになります。

## ユースケース2　Reguatory & Data Sovereignty

2つ目のユースケースが Reguatory & Data Sovereignty です。このユースケースの課題と解決策は次の通りです。

***Reguatory***
- 課題
  - ルールによって Microsoft のデータセンタにデータを預けられない
- 解決策
  - ルールを満たせる場所に Azure Stack を置く

***Data Sovereignty***
- 課題
  - 自分たちの管理できる場所にデータを置きたい
- 解決策
  - 自分たちが管理できる場所に Azure Stack を置く

今日の情報システムは、セキュリティやガバナンスの観点から次の制約を受ける場合があります。これらの制約を受けた場合、Azure の サービスにデータを保存できなくなります。データの保存だけでなく、Azure のサービスそのものを利用できないケースもあるでしょう。

- 社会の法律や業界のルールによって、データを Microsoft のデータセンタではない場所に保存しなければならない
- 自分たちの管理下にデータを置かなければならない

好きな場所で利用できるという Azure Stack の特徴を利用すれば、これらの制約を受けることなく Azure のサービスを利用して情報システムを構築できます。法律やルールによって指定された場所、自分たちの管理下にある場所に Azure Stack を設置すれば、ルールとガバナンスに準拠しつつ Azure のサービスのメリットを享受できます。
 
##  ユースケース3　Application Modernization

3つ目のユースケースが Application Modernization です。このユースケースの課題と解決策は次の通りです。

- 課題
  - オンプレミスの世界でもパブリッククラウドと同じ文化でアプリケーションを開発したい
- 解決策
  - パブリッククラウドの Azure と同じサービスを提供する Azure Stack を導入する

パブリッククラウドだけでなくオンプレミスも利用するという経営判断を下した場合、パブリッククラウドに慣れていればいるほど、オンプレミスでもパブリッククラウドと同じようにインフラを運用管理してアプリケーションをデリバリしたくなるでしょう。

Azure のサービスを利用できる という特徴を利用すれば、この問題を解決できます。Azure Stack は Azure のサービスを提供してくれます。したがって、インフラの運用管理であれば、オンプレミスにもかかわらず 、Azure と同じように ARM Template や Ansible、Terraform などのツールを使って infrastructure as code を実践できます。アプリケーションのデリバリであれば、オンプレミスにもかかわらず、Azure と同じように Visual studio からアプリケーションをデプロイできます。Azure Stack を利用することで、オンプレミスにパブリッククラウドの文化を持ち込み、Azure と同じようにインフラを構築してアプリケーションをデプロイできるようになります。

## まとめ

本日のエントリでは、Microsoft が想定している Azure Stack のユースケースを説明しました。あくまでも Microsoft のユースケースなので、これら以外の使い方をしている人もいるかもしれません。まだまだこれからのソリューションなので、興味関心を持つ人が増えれば増えるほど面白いユースケースが増えていくでしょう。楽しみです。

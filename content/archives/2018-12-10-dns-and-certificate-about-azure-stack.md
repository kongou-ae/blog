---
title: Azure Stack を設置する（DNS・サーバ証明書）
author: kongou_ae
date: 2018-12-10
url: /archives/2018-12-10-dns-and-certificate-about-azure-stack
categories:
  - azurestack
---

## はじめに

本エントリーは[Microsoft Azure Stack Advent Calendar 2018](https://qiita.com/advent-calendar/2018/azure-stack)の10日目です。

本日のエントリーでは、Azure Stack を設置するうえで考慮しなければならない DNS やサーバ証明書などの名前関連について説明します。具体的には、Deployment Worksheet の次の項目に触れます。

- リージョン名
- 外部ドメイン名
- 内部ドメイン名
- サーバのホスト名の Prefix
- DNS フォワーダ

{{<img src="./../../images/2018-12-10-001.png">}}

## リージョン名

Azure Stack には、Azure と同じようにリージョンという考え方があります。あなたのリージョンですので、あなたが名前を付ける必要があります。付けた名前がポータルで表示されます。リージョン名が local で固定になっている Development Kitの場合、ポータル上の Location が次のように表示されます。

{{<img src="./../../images/2018-12-10-002.png">}}

適当に決めて後悔してリージョン名を変更したくなったとしても、リージョン名を変更するためには再構築が必要です。名づけは慎重に。

## 外部ドメイン名

Azure で言うところの azure.com に相当する名前を決めなければなりません。azure.com に相当する名前ですので、Azure Stack をつかっていると様々な場面で目にします。納得感のある名前にしましょう。適当に決めて後悔したとして外部ドメイン名を変更したくなったとしても、外部ドメインを変更するためには再構築が必要です。名づけは慎重に。

## 外部 FQDN

Azure Stack は、Azure のサービスを提供するために様々な FQDN を利用します。現時点における具体的な FQDN は次の通りです。"region" の部分がリージョン名、"fqdn" の部分が外部ドメイン名に相当します。

- 必須
  - portal.region.fqdn
  - adminportal.region.fqdn
  - management.region.fqdn	
  - adminmanagement.region.fqdn
  - *.blob.region.fqdn
  - *.table.region.fqdn
  - *.queue.region.fqdn
  - *.vault.region.fqdn
  - *.adminvault.region.fqdn
  - *.adminhosting.region.fqdn
  - *.hosting.region.fqdn
- ADFS 認証の場合
  - adfs.region.fqdn
  - graph.region.fqdn
- PaaS をインストールする場合
  - *.dbadapter.region.fqdn
  - *.appservice.region.fqdn
  - *.scm.appservice.region.fqdn
  - *.sso.appservice.region.fqdn
  - api.appservice.region.fqdn
  - ftp.appservice.region.fqdn
  - sso.appservice.region.fqdn

参考：[Azure Stack 公開キー インフラストラクチャ証明書の要件](https://docs.microsoft.com/ja-jp/azure/azure-stack/azure-stack-pki-certs)

例えば、[ハイブリッドクラウド研究会](http://www.hccjp.org/) が所有している Azure Stack Integrated systems は、利用者向けのポータルの URL が、https://portal.iijhuawei.hccjp.org です。これは、Deployment Worksheetで、外部ドメイン名に hccjp.org を、リージョン名に iijhuawei を指定したと考えられます。

参考:[Hccjp PoC Introduction](https://www.slideshare.net/YusukeImanaka/hccjp-poc-introduction/11)

## 権威 DNS

上記の外部 FQDN の権威 DNS が、Azure Stack の External Network に起動します。利用者が Azure Stack にアクセスできるようにするためには、上位ドメインの権威 DNS からこの権威 DNS に対して委任の設定を追加する必要があります。

インターネット上に公開されている[ハイブリッドクラウド研究会](http://www.hccjp.org/) のAzure Stack Integrated systemsの場合、hccjp.org の権威 DNS に対して、次のような設定がされています。hcc.jp の 権威DNS が iijhuawei.hccjp.org の管理を azs-ns0x.iijhuawei.hccjp.org に委任しているのが分かります。

- iijhuawei.hccjp.org.	3600	IN	NS	azs-ns02.iijhuawei.hccjp.org.
- iijhuawei.hccjp.org.	3600	IN	NS	azs-ns01.iijhuawei.hccjp.org.
- azs-ns01.iijhuawei.hccjp.org. 3600 IN	A	202.32.71.207
- azs-ns02.iijhuawei.hccjp.org. 3600 IN	A	202.32.71.208

Azure Stack を企業ネットワーク内で利用しているドメイン名でデプロイした場合は、企業内ドメインの権威 DNS サーバを担っている AD サーバに条件付きフォワーダを設定する形になると思います。

## サーバ証明書

上記の外部公開ドメインでは HTTPS の通信が利用されます。そのため サーバ証明書が必要です。公的な認証局とエンタープライズCAをサポートしています。自己証明書はサポートされていません。その他の具体的な要件は次の URL を参照してください。

参考：[Azure Stack 公開キー インフラストラクチャ証明書の要件](https://docs.microsoft.com/ja-jp/azure/azure-stack/azure-stack-pki-certs)

1つの FQDN ごとにサーバ証明書を用意してもよいですし、すべての FQDN をカバーするマルチドメインワイルドカード証明書を1枚用意してもよいです。ただし、次の通り、Microsoft は、本番環境の場合においては1つの FQDN ごとにサーバ証明書を用意することを推奨しています。※運用環境となっている部分は、原文だと”production environments"です。

> 運用環境では、各証明書がエンドポイントごとに生成され、対応するディレクトリにコピーされることをお勧めします。

参考：[Azure Stack 公開キー インフラストラクチャ証明書の要件](https://docs.microsoft.com/ja-jp/azure/azure-stack/azure-stack-pki-certs#mandatory-certificates)

サーバ証明書を発行するうえで必要になるのが CSR の作成です。Azure Stack では、CSR の作成と発行したサーバ証明書が要件を満たすかの確認を実施できる Azure Stack Readiness Checker という PowerShell を用意しています。このスクリプトを利用すれば CSR の作成と サーバ証明書の正しさの確認を簡単に実施できます。

- [Azure Stack 証明書署名要求の生成](https://docs.microsoft.com/ja-jp/azure/azure-stack/azure-stack-get-pki-certs)
- [Azure Stack PKI 証明書の検証](https://docs.microsoft.com/ja-jp/azure/azure-stack/azure-stack-validate-pki-certs)

[Azure Stack用サーバ証明書のCSRを作る](https://aimless.jp/blog/archives/2018-06-15-create-csr-of-azurestack/)という過去のエントリで、実際にCSRを作成しています。ご確認ください。

## 内部ドメイン名

Azure Stack を構成する Host Node や Infrastructure Role Instance の Virtual Machine は1つのドメインに参加します。このドメイン名を決める必要があります。既存ドメインは使えませんし、既存ドメインとの信頼関係を設定することもできません。Azure Stack 内部にぽつんと存在するドメインの名前を決める必要があります。

原則として、普段 Azure Stack を利用している場面において内部ドメイン名を目にすることはありません。緊急時にEmergency Recovery Console に接続するときくらいです。ただし、適当に決めて後悔して内部ドメインを変更したくなったとしても、内部ドメインを変更するためには再構築が必要です。名づけは慎重に。

## サーバのホスト名の Prefix

Azure Stack を構成する Host Node や Infrastructure Role Instance の Virtual Machine 、各種 Switch のホスト名に含まれる接頭語を決める必要があります。

内部ドメイン名とサーバのホスト名の prefix を決めると、Azure Stack を構成するサーバの名前が自動的に決まります。例えば、内部ドメインを local.aimless.jp 、サーバのホスト名の Prefix を azs とした場合、Host Node 1台目の名前は azs-Node01.local.aimless.jp という名前になります。個々のサーバのホスト名に悩む必要はありません。Microsoft が勝手に名付けてくれます。

## DNS フォワーダ

Azure Stack を構成する Host Node と Infrastructure Role Instances はドメイン参加しています。したがって、外部の FQDN の名前を解決する際には、内部ドメインのドメインコントローラに問い合わせます。問い合わせを受けたドメインコントローラは自分自身で非再起問い合わせを行わずに、Deployment Worksheet で指定した DNS フォワーダに名前解決を転送します。

## 終わりに

本日のエントリーでは、Deployment Worksheet で指定する必要のある名前関連の要素を説明しました。管理者と利用者の目につく項目であり、かつ変更するためには再デプロイしなければならない項目ばかりですので、しっかりと考えてから Deployment Worksheet を記入しましょう。

また、オレオレではないサーバ証明書が必要になることも一つの特徴です。公的な認証局で約20個の FQDN に対してサーバ証明書を発行するすると、それなりのお金がかかります。手配の費用と更新の費用を予算に入れるのをお忘れなく。

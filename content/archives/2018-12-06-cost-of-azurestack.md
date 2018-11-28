---
title: Azure Stack の料金
author: kongou_ae
date: 2018-12-06
url: /archives/2018-12-06-cost-of-azurestack
categories:
  - azurestack
---

## はじめに

本エントリーは[Microsoft Azure Stack Advent Calendar 2018](https://qiita.com/advent-calendar/2018/azure-stack)の6日目です。ただし、過去に作成した[Azure Stackの費用](https://aimless.jp/blog/archives/2018-07-02-price-of-azure-stack/)の更新版です。

本日のエントリでは、Azure Stack にかかる費用を説明します。参考とした公式ドキュメントは次の通りです。なお、Azure Stack の購入を検討される際は、OEM ベンダと Microsoft のライセンス担当から最新の情報を入手したうえでご判断ください。

- [Azure Stack – 購入方法](https://azure.microsoft.com/ja-jp/overview/azure-stack/how-to-buy/)
- [Microsoft Azure Stack packaging and pricing](https://azure.microsoft.com/mediahandler/files/resourcefiles/5bc3f30c-cd57-4513-989e-056325eb95e1/Azure-Stack-packaging-and-pricing-datasheet.pdf)
- [Microsoft Azure Stack Licensing Guide (end customers)](https://go.microsoft.com/fwlink/?LinkId=851536&clcid=0x411)

3番目のドキュメントはエンドユーザ向けです。サービスプロバイダとして1つのAzure Stackを複数のエンドユーザに提供する場合は、次のライセンスガイドを熟読するのをお勧めします。

- [Microsoft Azure Stack Licensing Guide(Hosters and service providers)](https://www.microsoftpartnerserverandcloud.com/_layouts/download.aspx?SourceUrl=Hosted%20Documents/Azure%20Stack%20Licensing%20Guide%20-%20Hosters.pdf)

## 料金の構造

Azure Stackを利用する上で考慮すべき費用は次の4つです。

1. ハードウェア費用
1. Azure利用料
1. OSのライセンス費用
1. サポート費用

## 1. ハードウェア費用

Azure Stack は OEM ベンダによって販売されます。Azure Stack の購入にあたって OEM ベンダに支払う費用がハードウェア費用です。複数の OEM ベンダが Azure Stack を販売しているので、OEM ベンダごとに費用が異なります。OEM ベンダによっては、従来のサーバような「ハードウェアの初期費用＋保守5年で買い切る」方式だけでなく、ハードウェアを従量課金で利用することもできます。

参考：[ハイブリッドクラウド環境を実現するMicrosoft Azure Stack 対応新製品と関連サービスを発表](https://www.hpe.com/jp/ja/japan/newsroom/press-release/2018/062801.html)

なお、便宜上ハードウェア費用と名付けましたが、ハードウェア費用の中には保守費用や運用管理ソフトウェアのライセンスも含まれます。

## 2. Azure利用料

Azure Stack 上で動作する Azure は有料です。「Azure Stack というソフトウェアにかかる費用」とご理解ください。課金モデルは「従量課金」と「キャパシティ課金」の2つです。従量課金では使ったリソースに応じた金額が請求されます。キャパシティ課金では Azure Stack を構成する物理サーバのコア数に応じた金額が請求されます。

いずれの請求も Azure サブスクリプションにマージされます。支払いに利用できる Azure サブスクリプションは、「CSPサブスクリプション」と「EAサブスクリプション」です。「PAYGサブスクリプション」は利用できません。

課金モデルと支払い方法の関係性は次の通りです。キャパシティ課金はEAサブスクリプションでのみ利用できます。

|                |CSPサブスクリプション|EAサブスクリプション|
|----------------|-------------------|-------------------|
|従量課金         |OK                 |OK                 |
|キャパシティ課金  |NG                 |OK                 |

### Azure利用料　従量課金

リソースの使用量に応じて課金される形式です。Azure Stack がインターネットと通信できる場合に従量課金を選択できます。Azure Stack がインターネットと通信できない場合、従量課金を利用できません。これは従量課金の計算が Azure 側で行われるためです。Azure Stack はリソースの使用量を Azure に報告するだけです。使用量に応じた費用の集計や請求処理は Azure 側で実施されます。

Azure Stack の Virtual Machine と App Service は、vCPU の数に応じて料金が決まります。どの SKU を選んでも vCPU の数によって料金が決まります。SKU ごとに費用が決まっている Azure とは異なります。ストレージは、データ量におうじて料金が決まります。ストレージのトラントランザクション費用とデータ転送量が無料であることが Azure と異なる点です。

|サービス                        | 種類                         |料金               |
|-------------------------------|------------------------------|------------------|
|Azure Virtual Machines         |ベース仮想マシン	              |¥0.90/vCPU/時間 (¥655 vCPU/月) |
|Azure Storage                  |Blob Storage	                 |¥0.68/GB/月 (トランザクション料金なし) |
|Azure Storage                  |テーブルとキューのストレージ     |¥2.02/GB/月 (トランザクション料金なし) |
|Azure Storage                  |Standard 非管理対象ディスク	    |¥1.24/GB/月 (トランザクション料金なし) |
|Azure App Service              |Web Apps、API Apps、Functions	|¥6.28/vCPU/時間 (¥4,579 vCPU/月)|

### Azure利用料　キャパシティ課金

Host Node のコア数に応じて課金される形式です。Azure Stack がインターネットと通信できない場合、Azure 側で従量課金の計算ができないので、キャパシティ課金のみを利用できます。従量課金は利用できません。1コアあたりの価格は次のとおりです。App Service を使うかどうかで値段が変わります。

|区分               | 料金            |
|-------------------|----------------|
|App Service Package | $400/core/year |
|IaaS Package        | $144/core/year |

## 3. OSのライセンス費用

Azure Stack で動作する仮想マシンの OS にかかる費用は、Windows Server と Windows Server 以外によって課金体系が異なります

### Windows サーバ　従量課金

Azure 利用料を従量課金とした場合、Windows Server のライセンス費用も従量課金にできます。Windows Server のライセンス費用も従量課金にした場合の仮想マシンの費用は次のとおりです。ベース仮想マシンの¥0.90/vCPU/時間が、¥5.16/vCPU/時間に置き換わる形です。

|サービス                        | 種類                         |料金               |
|-------------------------------|------------------------------|------------------|
|Azure Virtual Machines         |Windows Server 仮想マシン    	 |¥5.16/vCPU/時間 (¥3,761 vCPU/月) |

従量課金の場合、CALは不要です。Azureと同じです。

### Windowsサーバ　コア課金

ライセンスの観点だと Azure Stack はオンプレミスのシステムとして扱われます。そのため、従来の Hyper-V 仮想基盤で採用される「物理コア分の Windows Server ライセンスを買うことで、ゲストの Windows Server のライセンスにあてる」作戦に対応しています。コア課金とする場合、リージョンを構成する物理サーバのコア数をカバーするライセンスを調達する必要があります。コア課金の場合は CAL も必要です。

Azure 利用料が従量課金とキャパシティ課金のどちらであっても、Windows Server のコア課金を利用できます。ただし、Azure 利用料をキャパシティ課金とした場合、Windows Server のライセンスはコア課金一択です。Windows Server をコア課金にすると、Windows Server の仮想マシンであっても「ベース仮想マシン」として扱われるので、従量課金の費用が少なくなります。

なお、Azure Stackはオンプレミスのシステムとして扱われるため「Azure Hybrid Use Benefit」には対応していません。

### Windows Server以外

Azure Stack には従量課金な SQL Server が存在しません。Azure とは異なるのでご注意ください。Azure Stack でSQL Server を利用する場合、ライセンスを持ち込む必要があります。ライセンスの買い方は「リージョンを構成する物理サーバのコア数」と「仮想マシンの仮想コア数」の両方をサポートします。

また、マーケットプレイス連携によって、Azure で利用できるサードパーティ製品の一部は Azure Stack でも利用できます。ただし、サードパーティ製品を利用する際は、ライセンスを別途調達して持ち込む必要があります。いわゆる BYOL です。Azure では従量課金に対応している Red Hat Enterprise Linux であっても、2018年12月現在、Azure Stack では BYOL のみを利用できます。同様に、Azure では従量課金に対応している Network Virtual Appliance も、2018年12月現在、Azure Stack では BYOL のみを利用できます。

## 4. サポート費用

ハードウェアのサポートはハードウェア費用に含まれます。困ったときの問い合わせ先は OEM ベンダです。

Azure Stack というソフトウェアのサポートは、Azure のサポートに準じます。利用するサブスクリプションに応じてサポートの契約先が異なります。EA サブスクリプションの場合は、Microsoft と直接サポート契約を結びます。困ったときの問い合わせ先は Microsoft です。Azureのサポートとプレミアムサポートが利用できますので、Azure Stack の重要度を踏まえて適切な費用を払いましょう。

CSP サブスクリプションの場合、Cloud Solution Provider とサポート契約を結びます。困ったときの問い合わせ先はCloud Solution Providerです。サポート費用はCloud Solution Providerによって異なります。

## おわりに

本エントリでは、Azure Stack にかかる費用をまとめました。Azure Stack を使うためには、OEM ベンダに支払う必要以外にも費用が発生します。購入前にしっかりと各費用を見積もりましょう。

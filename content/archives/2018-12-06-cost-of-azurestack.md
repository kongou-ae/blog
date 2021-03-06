---
title: Azure Stack Hub の料金
author: kongou_ae
date: 2018-12-06
url: /archives/2018-12-06-cost-of-azurestack
categories:
  - azurestack
---

- 初版：2018年12月
- 第二版：2019年12月

## はじめに

本エントリーは[Microsoft Azure Stack Advent Calendar 2018](https://qiita.com/advent-calendar/2018/azure-stack)の6日目です。ただし、過去に作成した[Azure Stackの費用](https://aimless.jp/blog/archives/2018-07-02-price-of-azure-stack/)の更新版です。

本日のエントリでは、Azure Stack Hub にかかる費用を説明します。参考とした公式ドキュメントは次の通りです。なお、Azure Stack Hub の購入を検討される際は、OEM ベンダと Microsoft のライセンス担当から最新の情報を入手したうえでご判断ください。

- [Azure Stack – 購入方法](https://azure.microsoft.com/ja-jp/overview/azure-stack/how-to-buy/)
- [Microsoft Azure Stack packaging and pricing](https://azure.microsoft.com/mediahandler/files/resourcefiles/5bc3f30c-cd57-4513-989e-056325eb95e1/Azure-Stack-packaging-and-pricing-datasheet.pdf)
- [Microsoft Azure Stack Licensing Guide (end customers)](http://download.microsoft.com/download/0/3/3/0335BD20-D718-4548-B730-AF703D78927E/Microsoft_Azure_Stack_Licensing_Guide_End_Customers_EN_US.pdf)

本エントリでは、エンドユーザが Azure Stack Hub を所有して、エンドユーザが利用すケースを前提とします。サービスプロバイダとして1つの Azure Stack Hub を複数のエンドユーザに提供する場合は、次のライセンスガイドを熟読するのをお勧めします。

- [Microsoft Azure Stack Licensing Guide(Hosters and service providers)](https://www.licensingschool.co.uk/wp-content/uploads/2018/02/Microsoft_Azure_Stack_Licensing_Guide_Hosters_EN_US-August-2017.pdf)

## 料金の構造

Azure Stack Hub を利用する上で考慮すべき費用は次の4つです。

1. ハードウェア費用
1. Azure 利用料
1. OS のライセンス費用
1. サポート費用

## 1. ハードウェア費用

Azure Stack Hub は OEM ベンダによって販売されます。Azure Stack Hub の購入にあたって OEM ベンダに支払う費用がハードウェア費用です。複数の OEM ベンダが Azure Stack を販売しているので、OEM ベンダごとに費用が異なります。OEM ベンダによっては、従来のサーバのような「ハードウェアの初期費用＋保守5年で買い切る」方式だけでなく、ハードウェアを従量課金で利用できます

参考：[ハイブリッドクラウド環境を実現するMicrosoft Azure Stack 対応新製品と関連サービスを発表](https://www.hpe.com/jp/ja/japan/newsroom/press-release/2018/062801.html)

なお、便宜上ハードウェア費用と名付けましたが、ハードウェア費用の中には保守費用や運用管理ソフトウェアのライセンスも含まれます。

## 2. Azure 利用料

Azure Stack Hub 上で動作する Azure は有料です。ハードウェア上で動作している「Azure Stack Hub というソフトウェア」に対して費用が発生します。課金モデルは「従量課金」と「容量課金」の2つです。従量課金では使ったリソースに応じた金額が請求されます。キャパシティ課金では Azure Stack Hub を構成する物理サーバのコア数に応じた金額が請求されます。

いずれの請求も Azure サブスクリプションに対する請求に合算されます。支払いに利用できる Azure サブスクリプションは、「CSP サブスクリプション」と「EA サブスクリプション」です。「PAYG サブスクリプション」は利用できません。

課金モデルと支払い方法の関係性は次の通りです。キャパシティ課金は EA サブスクリプションでのみ利用できます。

|                |CSPサブスクリプション|EAサブスクリプション|
|----------------|-------------------|-------------------|
|従量課金         |OK                 |OK                 |
|容量課金         |NG                 |OK                 |

### Azure 利用料 従量課金

「従量課金」とは、リソースの使用量に応じて課金される形式です。Azure Stack Hub がインターネットと通信できる場合に従量課金を選択できます。Azure Stack Hub がインターネットと通信できない場合、従量課金を利用できません。これは従量課金の計算が Azure 側で行われるためです。Azure Stack Hub はリソースの使用量を Azure に報告するだけです。使用量に応じた費用の集計や請求処理は Azure 側で実施されます。

Azure Stack Hub の Virtual Machine と App Service は、vCPU の数に応じて料金が決まります。どの SKU を選んでも vCPU の数によって料金が決まります。SKU ごとに費用が決まっている Azure とは異なります。ストレージは、データ量に応じて料金が決まります。ストレージのトラントランザクション費用とデータ転送量が無料であることが Azure と異なる点です。

請求の対象となるリソースと価格は次の URL に記載されています。

[Azure Stack の購入](https://azure.microsoft.com/ja-jp/overview/azure-stack/how-to-buy/)


### Azure利用料 容量課金

「容量課金」とは、Host Node のコア数に応じて課金される形式です。Azure Stack がインターネットと通信できない場合、Azure 側で従量課金の計算ができないので、キャパシティ課金のみを利用できます。従量課金は利用できません。1コアあたりの価格は次のとおりです。App Service を使うかどうかで値段が変わります。

|区分               | 料金            |
|-------------------|----------------|
|App Service Package | $400/core/year |
|IaaS Package        | $144/core/year |

## 3. OSのライセンス費用

Azure Stack Hub で動作する仮想マシンの OS にかかる費用は、Windows Server と Windows Server 以外によって課金体系が異なります。本エントリでは、エンドユーザが Azure Stack Hub を所有して利用するケースを前提とします。

### Windows Server 従量課金

Azure 利用料を従量課金とした場合、Windows Server のライセンス費用も従量課金にできます。Windows Server のライセンス費用も従量課金にした場合の仮想マシンの費用は次のとおりです。Windows Server を起動した場合の料金が、ベース仮想マシンの¥0.90/vCPU/時間からライセンス費用こみの ¥5.16/vCPU/時間に置き換わる形です。

|サービス                        | 種類                         |料金               |
|-------------------------------|------------------------------|------------------|
|Azure Virtual Machines         |ベース仮想マシン	              |¥0.90/vCPU/時間 (¥655 vCPU/月) |
|Azure Virtual Machines         |Windows Server 仮想マシン    	 |¥5.16/vCPU/時間 (¥3,761 vCPU/月) |

なお、従量課金の場合 CALは不要です。Azureと同じです。

### Windows Server コア課金

ライセンスの観点だと Azure Stack Hub はオンプレミスのシステムとして扱われます。そのため、従来の Hyper-V 仮想基盤で採用される「物理コア分の Windows Server ライセンスを買うことで、ゲストの Windows Server のライセンスにあてる」作戦に対応しています。コア課金とする場合、リージョンを構成する物理サーバのコア数をカバーするライセンスを調達する必要があります。コア課金の場合は CAL も必要です。

Azure 利用料を容量課金とした場合、Windows Server のライセンスはコア課金一択です。Azure 利用料が従量課金の場合、Windows Server 従量課金だけでなく Windows Server のコア課金も利用できます。Windows Server をコア課金にすると、Windows Server の仮想マシンを起動しても「ベース仮想マシン」として扱われるので、従量課金の費用が少なくなります。

なお、Azure Stack Hub はオンプレミスのシステムとして扱われるため「Azure Hybrid Use Benefit」には対応していません。

### Windows Server 以外

Azure Stack Hub には従量課金な SQL Server が存在しません。Azure とは異なるのでご注意ください。Azure Stack Hub でSQL Server を利用する場合、ライセンスを持ち込む必要があります。ライセンスの買い方は「リージョンを構成する物理サーバのコア数」と「仮想マシンの仮想コア数」の両方をサポートします。

また、Azure Stack Hub のマーケットプレイスでは、Azure で利用できるサードパーティ製品の一部を利用できます。ただし、サードパーティ製品を利用する際は、ライセンスを別途調達して持ち込む必要があります。いわゆる BYOL です。Azure では従量課金に対応している Red Hat Enterprise Linux であっても、2018年12月現在、Azure Stack Hub では BYOL のみを利用できます。同様に、Azure では従量課金に対応している Network Virtual Appliance も、2018年12月現在、Azure Stack Hub では BYOL のみを利用できます。

## 4. サポート費用

Azure Stack Hub というソフトウェアのサポートは、Azure のサポートに準じます。[Azure Stack Integrated systems とは](https://aimless.jp/blog/archives/2018-12-03-what-is-asis/)で説明したとおりです。利用するサブスクリプションに応じてサポートの契約先が異なります。EA サブスクリプションの場合は、Microsoft と直接サポート契約を結びます。困ったときの問い合わせ先は Microsoft です。Azureのサポートとプレミアムサポートが利用できますので、Azure Stack Hub の重要度を踏まえて適切な費用を払いましょう。

CSP サブスクリプションの場合、Cloud Solution Provider とサポート契約を結びます。困ったときの問い合わせ先は Cloud Solution Provider です。サポート費用は Cloud Solution Provider によって異なります。Azure Stack Hub の用途に応じたサポートを提供してくれる Cloud Solution Provider と契約を結びましょう。

## おわりに

本エントリでは、Azure Stack Hub にかかる費用をまとめました。Azure Stack Hub を使うためには、OEM ベンダに支払う必要以外にも費用が発生します。購入前にしっかりと各費用を見積もりましょう。

---
title: Azure Stackのお値段
author: kongou_ae
date: 2018-07-02
url: /archives/2018-07-02-price-of-azure-stack.md
categories:
  - azurestack
---

Azure Stackの費用について何度か質問を受けたのでまとめます。参考となる公式ドキュメントは次の通りです。なお、Azure Stackの購入を検討される際は、OEMベンダとMicrosoftのライセンス担当から最新の情報を入手したうえでご判断ください。

- [Azure Stack – 購入方法](https://azure.microsoft.com/ja-jp/overview/azure-stack/how-to-buy/)
- [Microsoft Azure Stack packaging and pricing](https://go.microsoft.com/fwlink/?LinkId=851535&clcid=0x411)
- [Microsoft Azure Stack Licensing Guide (end customers)](https://www.microsoftpartnerserverandcloud.com/_layouts/download.aspx?SourceUrl=/Hosted%20Documents/Azure%20Stack%20Licensing%20Guide%20-%20End%20Customer.pdf)

3番目のドキュメントはエンドユーザ向けです。サービスプロバイダとして1つのAzure Stackを複数のエンドユーザに提供する場合は、次のライセンスガイドを熟読するのをお勧めします。

- [Microsoft Azure Stack Licensing Guide(Hosters and service providers)](https://www.microsoftpartnerserverandcloud.com/_layouts/download.aspx?SourceUrl=Hosted%20Documents/Azure%20Stack%20Licensing%20Guide%20-%20Hosters.pdf)

## 費用の構造

Azure Stackを利用する上で考慮すべき費用は次の4つです。

1. ハードウェア費用
1. Azure利用料
1. OSのライセンス費用
1. サポート費用

## ハードウェア費用

Azure StackはOEMベンダによって販売されます。Azure Stackの購入にあたってOEMベンダに支払うお金がハードウェア費用です。Azure StackのOEMベンダは複数いますので、OEMベンダごとに費用が異なります。従来のサーバように「ハードウェアの初期費用＋保守5年」で買い切るだけでなく、ハードウェアを従量課金で利用することもできます。

従量課金の例：[ハイブリッドクラウド環境を実現するMicrosoft Azure Stack 対応新製品と関連サービスを発表](https://www.hpe.com/jp/ja/japan/newsroom/press-release/2018/062801.html)

なお、便宜上ハードウェア費用と名付けましたが、ハードウェア費用の中には保守費用や運用管理ソフトウェアのライセンスも含まれます。

## Azure利用料

Azure Stack上で動作するAzureは有料です。課金モデルは「従量課金」と「キャパシティ課金」の二つです。従量課金では使ったリソースに応じた金額が請求されます。キャパシティ課金ではAzure Stackを構成する物理サーバのコア数に応じた金額が請求されます。

支払い方法は「CSPサブスクリプション」と「EAサブスクリプション」のいずれかです。「PAYGサブスクリプション」は利用できません。

課金モデルと支払い方法の関係性は次の通りです。キャパシティ課金はEAサブスクリプションでのみ利用できます。

|                |CSPサブスクリプション|EAサブスクリプション|
|----------------|-------------------|-------------------|
|従量課金         |OK                 |OK                 |
|キャパシティ課金  |NG                 |OK                 |

### Azure利用料　従量課金

リソースの使用量に応じて課金される形式です。Azure Stackがインターネットと通信できる場合に従量課金を選択できます。Azure Stackがインターネットと通信できない場合、従量課金を利用できません。これは従量課金の計算がAzure側で行われるためです。Azure Stackはリソースの使用量をAzureに報告するだけです。使用量に応じた費用を計算や請求処理はAzure側で実施されます。

Azure StackのVirtual MachineとApp Serviceは、vCPUの数に応じて料金が決まります。SKUごとに費用が決まっているAzureとは異なります。また、ストレージのトラントランザクション費用とデータ転送量が無料であることもAzureと異なる点です。

|サービス                        | 種類                         |料金               |
|-------------------------------|------------------------------|------------------|
|Azure Virtual Machines         |ベース仮想マシン	              |¥0.90/vCPU/時間 (¥655 vCPU/月) |
|Azure Storage                  |Blob Storage	                 |¥0.68/GB/月 (トランザクション料金なし) |
|Azure Storage                  |テーブルとキューのストレージ     |¥2.02/GB/月 (トランザクション料金なし) |
|Azure Storage                  |Standard 非管理対象ディスク	    |¥1.24/GB/月 (トランザクション料金なし) |
|Azure App Service              |Web Apps、API Apps、Functions	|¥6.28/vCPU/時間 (¥4,579 vCPU/月)|

### Azure利用料　キャパシティ課金

Host Nodeのコア数に応じて課金される形式です。Azure Stackがインターネットと通信できない場合、Azure側で従量課金の計算ができません。そのため、インターネットと通信できないAzure Stackでは、キャパシティ課金のみを利用できます。従量課金は利用できません。

コアあたりの価格は次のとおりです。App Serviceを使うかどうかで値段が変わります。

|区分               | 料金            |
|-------------------|----------------|
|App Service Package | $400/core/year |
|IaaS Package        | $144/core/year |

## OSのライセンス費用

Azure Stackで動作する仮想マシンのOSにかかる費用です。Windows Serverと他のOSによって課金が異なります

### Windowsサーバ

#### Windowsサーバ　従量課金

Azure利用料を従量課金とした場合、Windows Serverのライセンス費用も従量課金にできます。従量課金の単価は次のとおりです。

|サービス                        | 種類                         |料金               |
|-------------------------------|------------------------------|------------------|
|Azure Virtual Machines         |Windows Server 仮想マシン    	 |¥5.16/vCPU/時間 (¥3,761 vCPU/月) |

従量課金の場合、CALは不要です。Azureと同じです。

#### Windowsサーバ　コア課金

ライセンスの観点だとAzure Stackはオンプレミスのシステムとして扱われます。そのため、従来のHyper-V仮想基盤で採用される「物理コア分のwindows serverライセンスを買うことで、ゲストのWindows Serverのライセンスにあてる」作戦に対応しています。Windows Serverをコア課金とした場合、Windows Serverの仮想マシンは「ベース仮想マシン」として扱われるので、従量課金の費用が少なくなります。なお、コア課金の場合はCALが必要です。ご注意ください。

一方で、Azure Stackはオンプレミスのシステムとして扱われるため「Azure Hybrid Use Benefit」には対応していません。

### SQL Server

Azure StackにはSQLサーバのライセンスも従量課金なWindows Serverが存在しません。Azureとは異なるのでご注意ください。Azure StackでSQL Serverを利用する場合、ライセンスを持ち込む必要があります。ライセンスの買い方は物理コアと仮想コアの両方をサポートします。

### Windows Server以外のOS

マーケットプレイス連携によって、Azureで利用できるサードパーティ製品の一部はAzure Stackでも利用できます。ただし、Windows Server以外のOSを利用する際は、ライセンスを別途調達して持ち込む必要があります。いわゆるBYOLです。Azureでは従量課金に対応しているRedhat enterprise linuxであっても、2018年6月現在、Azure StackではBYOLのみです。

## サポート費用

ハードウェアのサポートはハードウェア費用に含まれます。Azure StackというアプリケーションのサポートにはAzureのサポートとプレミアムサポートを利用できます。Azure Stackの利用用途をふまえてMicrosoftと適切なサポート契約を締結しましょう。

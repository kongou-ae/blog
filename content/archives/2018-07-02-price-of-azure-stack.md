---
title: Azure Stackのお値段
author: kongou_ae
date: 2018-07-02
url: /archives/2018-07-02-price-of-azure-stack.md
categories:
  - azurestack
---

Azure Stackの費用について何度か質問を受けたのでまとめます。参考となる公式ドキュメントは次の通りです。なお、Azure Stackを購入される際は、OEMベンダとMicrosoftのライセンス担当の話を信じてください。

- [Azure Stack – 購入方法](https://azure.microsoft.com/ja-jp/overview/azure-stack/how-to-buy/)
- [Microsoft Azure Stack packaging and pricing](https://go.microsoft.com/fwlink/?LinkId=851535&clcid=0x411)
- [Microsoft Azure Stack Licensing Guide(Hosters and service providers)](https://www.microsoftpartnerserverandcloud.com/_layouts/download.aspx?SourceUrl=Hosted%20Documents/Azure%20Stack%20Licensing%20Guide%20-%20Hosters.pdf)
- [Microsoft Azure Stack Licensing Guide (end customers)](https://www.microsoftpartnerserverandcloud.com/_layouts/download.aspx?SourceUrl=/Hosted%20Documents/Azure%20Stack%20Licensing%20Guide%20-%20End%20Customer.pdf)

## 費用の構造

Azure Stackにかかる費用は次の3つに分類されます。

1. ハードウェア
1. Azure利用料
1. OSのライセンス

## ハードウェア

Azure StackはOEMベンダによって販売されています。Azure Stackの購入に際してOEMベンダに支払うお金がハードウェア費用です。Azure StackのOEMベンダは複数いますので、OEMベンダごとに費用が異なります。従来のサーバように「ハードウェアの初期費用＋保守5年」で買い切るだけでなく、HPEのようにハードウェアを従量課金で利用することもできます。

[ハイブリッドクラウド環境を実現するMicrosoft Azure Stack 対応新製品と関連サービスを発表](https://www.hpe.com/jp/ja/japan/newsroom/press-release/2018/062801.html)

## Azure利用料

Azure Stack上で動作するAzureは有料です。課金モデルは「従量課金」と「キャパシティ課金」のいずれです。従量課金は使ったリソースに応じた金額が請求されます。キャパシティ課金は物理サーバのコア数に応じた金額が請求されます。

支払い方法は「CSPサブスクリプション」と「EAサブスクリプション」のいずれかです。「PAYGサブスクリプション」は利用できません。

請求方法と支払い方法の関係性は次の通りです。キャパシティ課金はEAでのみ利用できます。

|                |CSPサブスクリプション|EAサブスクリプション|
|----------------|-------------------|-------------------|
|従量課金         |OK                 |OK                 |
|キャパシティ課金  |NG                 |OK                 |

### 従量課金

リソースの使用量に応じて課金される形式です。Azure Stackがインターネットと通信できる場合、従量課金を選択できます。Azure StackのVirtual MachineとApp Serviceは、vCPUの数に応じて料金が決まります。SKUごとに費用が決まっているAzureとは異なります。

|サービス                        | 種類                         |料金               |
|-------------------------------|------------------------------|------------------|
|Azure Virtual Machines         |ベース仮想マシン	              |¥0.90/vCPU/時間 (¥655 vCPU/月) |
|Azure Virtual Machines         |Windows Server 仮想マシン    	 |¥5.16/vCPU/時間 (¥3,761 vCPU/月) |
|Azure Storage                  |Blob Storage	                 |¥0.68/GB/月 (トランザクション料金なし) |
|Azure Storage                  |テーブルとキューのストレージ     |¥2.02/GB/月 (トランザクション料金なし) |
|Azure Storage                  |Standard 非管理対象ディスク	    |¥1.24/GB/月 (トランザクション料金なし) |
|Azure App Service              |Web Apps、API Apps、Functions	|¥6.28/vCPU/時間 (¥4,579 vCPU/月)|

### キャパシティ課金

Host Nodeのコア数に応じて課金される形式です。Azure Stackがインターネットと通信できない場合、キャパシティ課金一択です。

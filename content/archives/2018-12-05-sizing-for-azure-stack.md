---
title: Azure Stack Hub をサイジングする
author: kongou_ae
date: 2018-12-05
url: /archives/2018-12-05-sizing-for-azure-stack
categories:
  - azurestack
---

- 初版：2018年12月
- 第二版：2019年12月

## はじめに

本エントリーは[Microsoft Azure Stack Advent Calendar 2018](https://qiita.com/advent-calendar/2018/azure-stack)の5日目です。

本日のエントリでは、Azure Stack Hub のサイジング方法について説明します。

## 仕組みが使うリソース

Azure Stack Hub の利用者は、Azure Stack Hub を構成する Host Node のリソースの全てを利用できません。Host Node 上に、Azure Stack という仕組みを成立させるための Virtual Machine が動作するためです。

これらの Virtual Machine を Infrastructure Role Instance と呼びます。Infrastructure Role Instance の一覧は次の通りです。

|名前 | 役割 |
|-----|------|
| Azs-ACS01、Azs-ACS02、Azs-ACS03 | Azure Stack ストレージサービス |
| Azs-ADFS01、Azs-ADFS02 | Active Directory Federation Services |
| Azs-CA01 | 内部で利用される認証機関 |
| Azs-DC01、Azs-DC02、Azs-DC03 | 内部で利用される Active Directory、NTP、DHCP |
| Azs-ERCS01、Azs-ERCS02、Azs-ERCS03 | Emergency Recovery Console |
| Azs-NC01、Azs-NC02、Azs-NC03 | ネットワークコントローラ |
| Azs-Gwy01、Azs-Gwy02、Azs-Gwy03 | テナントで利用される VPN サービス |
| Azs-PXE01 | Host Node のための PXE サーバ
| Azs-SLB01、Azs-SLB02 | SLB MUX |
| Azs-Sql01、Azs-Sql02 | 内部のデータストア |
| Azs-WAS01、Azs-WAS02 | ポータルと ARM（管理者向け） |
| Azs-WASP01、Azs-WASP02 | ポータルと ARM（利用者向け） |
| Azs-Xrp01、Azs-Xrp02、Azs-Xrp03 | 各種リソースプロバイダ |
| IR01-0x（ホストの台数分） | 各種リソースプロバイダ（今後使われる予定） |
| Azs-SRNG01 | ログコレクションサービス |

 参考：[仮想マシンのロール](https://docs.microsoft.com/ja-jp/azure/azure-stack/asdk/asdk-architecture#virtual-machine-roles)

Host Node が 4台の場合、これらの Infrastructure Role Instance は、合計で162 vCPU、258 GB のリソースを利用します。また、PaaS をインストールすると、PaaS の仕組みを動作させるための Virtual Machine が動作します。これらの Virtual Machine も Host Node のリソースを利用します。その分だけ、利用者の使えるリソースが減ります。

## 計算ツール

上記以外にも、Host Node としての機能を動作させるためのリソースや、可用性のための余剰を考慮する必要があります。考慮すべき事項は次の URL に記載されています。

参考：

- [Azure Stack のキャパシティ プランニング](https://docs.microsoft.com/ja-jp/azure/azure-stack/capacity-planning)
- [Azure Stack コンピューティング能力の計画](https://docs.microsoft.com/ja-jp/azure/azure-stack/capacity-planning-compute)
- [Azure Stack ストレージ容量の計画](https://docs.microsoft.com/ja-jp/azure/azure-stack/capacity-planning-storage)
- [Virtual machine memory allocation and placement on Azure Stack](https://azure.microsoft.com/ja-jp/blog/virtual-machine-memory-allocation-and-placement-on-azure-stack/)

特筆すべき事項は、Virtual Machine の上限です。2019年12月現在、Azure Stack Hub には次の制限が存在します。

- 1台の Host Node 上で動作できる Virtual Machine は60台
- 1つのリージョン上で動作できる Virtual Machine は700台

参考：[VM の合計数に関する考慮事項](https://docs.microsoft.com/ja-jp/azure-stack/operator/azure-stack-capacity-planning-compute?WT.mc_id=AZ-MVP-5003408&view=azs-1910#consideration-for-total-number-of-vms)

すべての考慮事項を踏まえたうえで、利用者として必要なリソースが動く Azure Stack Hub を選定するのはしんどいです。「そんなこともあろうかと」ということで、Microsoft は、[Azure Stack Capacity Planner](https://docs.microsoft.com/ja-jp/azure/azure-stack/capacity-planning-spreadsheet) という 便利 Excel をリリースしています。この便利 Excel に次の情報を入力すると、Excel が考慮事項を考慮したうえでお勧めスペックを表示してくれます。ただしあくまでも参考です。

- 購入予定の Integrated systems のスペック
- 動かしたい Virtual Machine の種類と台数

{{<img src="./../../images/2018-12-05-001.png">}}

なお、この Excel では vCPU と物理コアの比率が 4：1に置かれています。ゆとりをもった収容率にしたい方は、2：1にするとよいでしょう。

{{<img src="./../../images/2018-12-05-002.png">}}

## まとめ

本エントリでは、Azure Stack Hub をサイジングする方法をお話ししました。実際に購入する際は、Azure Stack Capacity Planner を参考にしつつ、OEM ベンダ様に相談しながらベストな構成を選びましょう。

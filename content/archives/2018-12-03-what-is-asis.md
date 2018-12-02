---
title: Azure Stack Integrated systems とは
author: kongou_ae
date: 2018-12-03
url: /archives/2018-12-03-what-is-asis
categories:
  - azurestack
---

## はじめに

本エントリーは[Microsoft Azure Stack Advent Calendar 2018](https://qiita.com/advent-calendar/2018/azure-stack)の3日目です。

先日のエントリでは、Azure Stack のユースケースについてお話しました。本エントリー以降では、Azure Stack そのものについてお話します。

## 2種類の Azure Stack

Microsoft は、2種類の Azure Stack をリリースしています。Integrated systems と Development Kit です。2つの大きな違いは、用途と対応するハードウェアです。

- Azure Stack Integrated systems
  - 製品版の Azure Stack 
  - OEM ベンダから購入する
- Azure Stack Development Kit
  - 評価版の Azure Stack
  - Microsoft がソフトウェアのみを公開している
  - Integrated System 上で動作しているソフトウェアとほぼ一緒。ただし、違う個所もある
  - 前提条件を満たすハードウェアであれば、どのベンダのサーバにもインストールできる

## Integrated System の特徴

本エントリでは、Azure Stack Integrated systems の特徴をざっくりと説明します。Development Kit には無い Integrated systems 固有の特徴は次の3点です。

1. OEM ベンダが決まっている
1. ハードウェア構成が本番を想定している
1. メーカのサポートを受けられる

### 1. OEM ベンダが決まっている

Azure Stack Integrated systems は、Integrated systems を販売できるOEM ベンダが決まっています。現時点で Microsoft の公式サイトにパートナして載っている OEM ベンダは次の通りです。これらの OEM ベンダからのみ Azure Stack Integrated systems を購入できます。

| OEM ベンダ | 参考リンク |
|-----------------------|---------------------------|
| avanade               | |
| Cisco Systems | [URL](https://www.cisco.com/c/ja_jp/solutions/collateral/data-center/integrated-system-microsoft-azure-stack/datasheet-c78-739813.html) | 
| DELL EMC | [URL](https://japan.emc.com/collateral/solution-overview/h16047-dell-emc-cloud-for-microsoft-azure-stack-so.pdf) |
| Hewlett Packard Enterprise | [URL](https://psnow.ext.hpe.com/doc/PSN1009954522USEN.pdf)
| HUAWEI | [URL](https://e.huawei.com/en/material/onLineView?MaterialID=c99bc3101e5448339cca43690c5e3965)|
| Lenovo | [URL](https://lenovopress.com/datasheet/ja/ds0013-lenovo-thinkagile-sx-for-microsoft-azure-stack)|
| WORTMANN AG | [URL](https://azure.microsoft.com/mediahandler/files/resourcefiles/terra-for-microsoft-azure-factsheet/AzuerStack_06062018.pdf) |

上記の OEM ベンダ以外に、富士通が Azure Stack Integrated systems の取り扱いをアナウンスしています。

参考：[クラウドをより簡単に導入できる「PRIMEFLEX for Microsoft Azure Stack」を発表](http://pr.fujitsu.com/jp/news/2018/11/9.html)

ハードウェア上で動作する「Azureのサービスを提供するソフトウェア」は Microsoft によって開発されているため、すべての OEM ベンダの Azure Stack で共通です。OEM ベンダによって差異が出る部分は「サーバの構成」と「運用管理の仕組み」です。CPU の種類やメモリ量などのハードウェア構成を自由に選べる OEM ベンダと、事前に構成されたパターンから選択する OEM ベンダが存在しています。また、ハードウェアの運用管理には OEM ベンダ独自のツールを利用するので、OEM ベンダごとに特色が出ます。これらの差異を理解したうえで、自分にあった OEM ベンダから Azure Stack を買いましょう。

### 2. ハードウェア構成が本番を想定している

製品版である Integrated systems は、本番での利用を想定したハードウェア構成になっています。Integrated System を構成するハードウェアは原則として次の通りです。

- Host Node
  - Azure のサービスが動作するサーバ
  - 現時点で4台から16台までをサポート
- Hardware Lifecycle Host
  - OEM ベンダの運用管理用ソフトウェアが動作するサーバ
  - 1台
- Top-of-rack Switch
  - Host Node と顧客ネットワーク機器を収容するスイッチ
  - 2台
- BMC Switch
  - HLH と各サーバの Baseboard Management Controller を収容するスイッチ
  - 1台

{{<img src="./../../images/2018-12-03-001.png">}}

引用：[Azure Stack 受け入れ準備_20180630](https://www.slideshare.net/HiroshiMatsumoto1/azure-stack-20180630)

ただし、UCS を利用している Cisco Systems の Azure Stack の場合、他の OEM ベンダの Azure Stack と違う点があります。Cisco systems の Azure Stack には Hardware Lifecycle Host が存在しません。そのかわりに Fablic Interconnect が利用されています。また BMC Switch が2台に冗長化されています。

### 3. メーカのサポートを受けられる

製品版である Integrated systems は、Microsoft と OEM ベンダによるサポートを受けられます。Micorosoft のサポート範囲は Azure のサービスを提供するためのソフトウェアです。OEM ベンダのサポートは、ハードウェアと運用管理用のソフトウェアです。

OEM ベンダのサポートは、従来のハードウェア・ソフトウェアサポートと同じです。特筆すべきは、Microsoft のサポートです。従来のオンプレミス製品で Microsoft のサポートを受けるためには、プレミアムサポートが必要でした。ですが、Azure Stackでは、Azure との一貫性を考慮したのか、Standard 以上 の Azure サポートを利用できます。Azure サポートは月額定額・チケット無制限ですのでかなりお買い得です。Azure Stack の重要度を鑑みて、Azure サポートとプレミアムサポートを併用するのが良いでしょう。

参考：[Azure のサポート プラン](https://azure.microsoft.com/ja-jp/support/plans/)

## おわりに

本日のエントリーでは、 Integrated systems と Development Kit という2つの Azure Stack に触れたうえで、Integrated systems の基本的な特徴を説明しました。明日のエントリーでは、もう1つの Azure Stack である Development Kit について説明します。

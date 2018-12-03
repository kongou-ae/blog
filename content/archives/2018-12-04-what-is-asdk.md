---
title: Azure Stack Development Kit とは
author: kongou_ae
date: 2018-12-04
url: /archives/2018-12-04-what-is-asdk
categories:
  - azurestack
---

## はじめに

本エントリーは[Microsoft Azure Stack Advent Calendar 2018](https://qiita.com/advent-calendar/2018/azure-stack)の4日目です。

先日のエントリでは、2つの Azure Stack の1つである Integrated systems について説明しました。本日のエントリでは、もう1つの Azure Stack である Development Kit について説明します。

## Development Kit の特徴

Development Kit は、その名のとおり評価用の Azure Stack です。高価な Integrated systems を買う前に、Azure Stack という仕組みが自分たちの組織に合うかどうかを評価するためのソリューションです。

Developmet Kit の特徴をざっくりと説明します。

## 1. ベンダを選ばない

1つ目の特徴は「ベンダを選ばない」です。Developmet Kit は、Microsoft からソフトウェアのみで提供されます。無料で誰でもダウンロードできます。そして、次の前提条件を満たすハードウェアであれば、どのベンダのハードウェアにもインストールできます。

|     | 最小 | 推奨 |
|-----|------|------|
|CPU  | 12コア | 16コア |
|メモリ | 96GB | 128GB |
|OS Disk| 200GB | 200GB|
|データ Disk | 140GB×4本 | 250GB×4本 |
| OS | Windows Server 2016 | Windows Server 2016 |

その他の条件については、次のドキュメントをご確認ください。特に、データ Disk については、複数の Disk を Storage Spaces Direct で1つのプールにする都合上、細かな条件が定められています、

参考：[Azure Stack のデプロイ計画に関する考慮事項](https://docs.microsoft.com/ja-jp/azure/azure-stack/asdk/asdk-deploy-considerations#hardware)

要件さえ満たせば、仮想マシンにもインストールできます。Azure の Virtual Machine であれば、E16v3 や E32v3 あたりが良い具合です。Azure の Virtual Machine 上に Development Kit をデプロイする ARM テンプレートを公開している方もいます。

参考：
- [Inception: Running Microsoft Azure Stack on Azure - THR2212](https://www.youtube.com/watch?v=BwMLL2-awtc)
- [ned1313/AzureStack-VM-PoC](https://github.com/ned1313/AzureStack-VM-PoC)

## 2. 評価前提の構成

2つ目の特徴は「評価前提の構成」です。Development Kit は評価版です。そのため、Integrated systems と比較すると次のような制限があります。

### 可用性が低い

ASDK は1台のサーバ上で動作します。Integrated systems のように複数のサーバを利用して可用性を高められません。そのサーバが死んだらおしまいです。また、S2D の設定が Simple（ミラーしない）になっているため、データ Disk が1本死んだだけでデータが消失して Azure Stack のサービスが起動しなくなります。

### 外部からアクセスできない

Azure のサービスを提供するネットワークが、サーバ内部のSDNに閉じています。そのため、サーバ外部のネットワークから Azure Stack 上の Azure のサービスを利用できません。

これらの制限から、Development Kit で Azure Stack を評価する際は、原則として、Development Kit をインストールしたサーバに RDP または VPN で接続する必要があります。

### オレオレドメイン名

Development Kit 上の Azure のサービスは、loacl.azurestack.external というドメイン名で提供されます。Integrated systems のように自由にドメイン名を指定できません。

## 3. Microsoft のサポートがない

3つ目の特徴が「Microsoft のサポートがない」です。Microsoft は、評価用である Develpment Kit に対してサポートを提供しません。利用者は、Development Kit に関する不具合を自己解決しなければなりません。Microsoft が提供してくれるものは、公式ドキュメントとフォーラムのみです。

参考：[Azure Stack forum - MSDN - Microsoft](https://social.msdn.microsoft.com/Forums/azure/en-US/home?forum=azurestack)

最近の私は、不具合を自己解決することを無駄と考えて、不具合が起きたらデプロイしなおしています。

## まとめ

本日のエントリーでは、評価版の Azure Stack である Development Kit について説明しました。Azure Stack に興味のある方は、いきなり Integrated systems を買うのではなく、Development Kit を利用してみることをお勧めします。Azure Stack が何を提供してくれるのかということを身をもって体験できます。

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

Development kit は、その名のとおり評価用の Azure Stack です。高価な Integrated systems を買う前に、Azure Stack という仕組みが自分たちの組織に合うかどうかを評価するためのソリューションです。

Developmet kit の特徴をざっくりと説明します。

## ベンダを選ばない

Developmet kit は、Microsoft からソフトウェアのみで提供されます。無料で誰でもダウンロードできます。そして、次の前提条件を満たすハードウェアであれば、どのベンダのハードウェアにもインストールできます。

- CPU
  - 最小12コア
  - 推奨16コア
- メモリ
  - 最小96GB
  - 推奨128GB
- Disk 
  - 最小5本（OSディスク200GB、データディスク140GB×4）
  - 推奨5本（OSディスク200GB、データディスク250GB×4）

参考：[Azure Stack のデプロイ計画に関する考慮事項](https://docs.microsoft.com/ja-jp/azure/azure-stack/asdk/asdk-deploy-considerations#hardware)

要件さえ満たせば、仮想マシンにもインストールできます。Azure の Virtual Machine であれば、E16v3 や E32v3 あたりが良い具合です。Azure の Virtual Machine 上に Development Kit をデプロイする ARM テンプレートを公開している方もいます。

参考：
- [Inception: Running Microsoft Azure Stack on Azure - THR2212](https://www.youtube.com/watch?v=BwMLL2-awtc)
- [ned1313/AzureStack-VM-PoC](https://github.com/ned1313/AzureStack-VM-PoC)

## 評価前提の構成

Development kit は評価版です。そのため、Integrated systems と比較すると次のような制限があります。

- 可用性
  - 1台のサーバにインストールする
  - Integrated systems のように複数のサーバを利用して可用性を高められない
- 外部との接続
  - Azure のサービスを提供するネットワークが、サーバ内部のSDNに閉じている
  - 外部のネットワークから Azure Stack 上の Azure のサービスを利用できない
- ドメイン名
  - Azure Stack 上の Azure のサービスが、loacl.azurestack.external というドメイン名で提供される
  - Integrated systems のように自由にドメイン名を指定できない

これらの制限から、Development kit で Azure Stack を評価する際は、原則として、Development kit をインストールしたサーバに RDP でログインした上で、そのサーバ上で評価を行う必要があります。

## Microsoft のサポートがない

Microsoft は、評価用である Develpment kit に対してサポートを提供しません。利用者は、Development kit に関する不具合を自己解決しなければなりません。Microsoft が提供してくれるものは、公式ドキュメントとフォーラムのみです。

参考：[Azure Stack forum - MSDN - Microsoft](https://social.msdn.microsoft.com/Forums/azure/en-US/home?forum=azurestack)

ちなみに最近の私は、不具合を自己解決することを無駄と考えて、不具合が起きたらデプロイしなおしています。

## まとめ

本日のエントリーでは、評価版の Azure Stack である Development kit について説明しました。Azure Stack に興味のある方は、いきなり Integrated systems を買うのではなく、Development kit を利用してみることをお勧めします。Azure Stack が何を提供してくれるのかということを身をもって体験できます。

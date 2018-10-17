---
title: Azure Stack の監視を理解する
author: kongou_ae
date: 2018-10-18
url: /archives/2018-10-18-understand-the-monitoring-of-azurestack
categories:
  - azurestack
---


## Azure Stack の監視項目は不明

Azure Stack は自身を構成する要素を監視しています。ですが、公式ドキュメントには、何をどこまで監視しているのかが具体的に記載されていません。ブラックボックスである Azure Stack を信じるにしても、情報が不足しています。


## アラートのテンプレートから監視項目を推測する

そんな時には、Azure Stack 自身に格納されているアラートのテンプレートが役に立ちます。

admin portal側に存在しているストレージアカウントに、アラートのテンプレートが保存しています。これを見れば、Azure Stack がどんなアラートをあげるつもりなのを把握できます。

## テンプレートの内容

スクリプトを書いてテンプレートの中身をパースした結果を次の通りです。大量にあるので別リンクです。

[The alerts of Azure Stack 1808 update](https://gist.github.com/kongou-ae/5a16e31965ce71761ca2dda0a7565b25)

テンプレートの中身を見る限りだと、OSから確認できる範囲の項目を一通り監視しているように見えます。これだけの項目を監視していれば、ブラックボックスでも安心できますね。

これらのアラートはAPIにて公開されます。そのため、Azure Stack Operator は、System CenterのManagement PackやNagiosなど、APIからアラートを収集してアラートをあげる仕組みを用意する必要があります。詳細は、次の URL を参照。

[Integrate external monitoring solution with Azure Stack](https://docs.microsoft.com/en-us/azure/azure-stack/azure-stack-integrate-monitor)

## Azure Stack が監視しないこと

一方で、Azure Stack が動作している OS からは確認できない範囲のアラートはテンプレートに含まれていません。例えば次の項目です。これらを監視するのはOEMベンダが個別に導入するツールの役割です。

- 各サーバに搭載されているファンや電源モジュールなどの部品
- 各サーバの消費電力や温度
- ToRとBMC Swtch
- HLH
- OEMベンダのツールが動作する仮想マシン
- 仮想マシン上で動作するOEMベンダのツール

これらの項目の中にOEMベンダのツールが監視していない項目がある場合、Azure Stack Operatorが別の監視ツールを導入して監視する必要があります。監視し忘れがあると、万が一の場合に障害を見落とす可能性があります。Azure Stack Operator が何を用意して何を監視しなければならないのかを事前に調査して、本番導入時に監視の漏れがないようにしましょう。

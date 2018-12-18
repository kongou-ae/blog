---
title: Azure Stack を診断する
author: kongou_ae
date: 2018-12-19
url: /archives/2018-12-19-diagnose-azure-stack
categories:
  - azurestack
---
##  はじめに

本エントリーは[Microsoft Azure Stack Advent Calendar 2018](https://qiita.com/advent-calendar/2018/azure-stack)の19日目です。

先日の[Azure Stackを監視する](https://aimless.jp/blog/archives/2018-12-18-monitering-azure-stack)では、監視の仕組みをまとめました。本日のエントリでは、監視からのアラートを受け取った後のトラブルシュートについてまとめます。

## アラートを切り分ける

[Azure Stack のセキュリティ](https://aimless.jp/blog/archives/2018-12-11-security-of-azurestack/)でまとめたとおり、Microsoft は Azure Stack に対する管理者の権限を限定しています。そのため、Azure Stack には、管理者の権限で対処できるトラブルと、管理者だけでは対処できないトラブルが存在します。アラートが発生した場合には、自分たちだけで対処できる問題なのか Microsoft または OEM ベンダに協力を要請すべき問題なのかを切り分けることが重要です。

## アラートに従う

切り分けのために役に立つのが、アラートの Remediation という項目です。Azure Stack のアラートには Remediation という情報が付与されており、アラートの中にアラートの対処方法が記載されています。アラートのテンプレートから持ってきた２つのアラートの Remediation は次の通りです。

- A physical disk has failed
  - Replace the physical disk as soon as possible to ensure full resiliency. To monitor the progress of virtual disk storage repair, see https://aka.ms/virtualdiskhealth.

- Scale unit node is offline
  - 1.Navigate to the NodeName and try to cycle the node using the Power off/Power on actions on the node blade. (A physical node restart might take up to 10 minutes.)
  - 2.If this didn't solve the problem, please contact Support. Before you do, start the log file collection process using the guidance from https://aka.ms/azurestacklogfiles. If hardware replacement is required, there are important pre- and post-replacement steps. See https://aka.ms/azurestackreplacenode.

アラートの中には、具体的な対処方法が書かれているものがあります。これらの対処方法は管理者の権限で対処できます。「A physical disk has failed」のRemediation に記載されているディスクの交換や、「Scale unit node is offline」の Remediation に記載されている再起動などです。管理者による対処で状況が解消しない場合は、「Scale unit node is offline」の Remediation に記載されているとおりサポートに障害を申告して対処してもらいましょう。

## 自己診断する

アラートをトリガとするとトラブルシュートは受動的な対応です。Azure Stack には、管理者が能動的に自分の好きなタイミングで Azure Stack の健全性を確認する手段があります。それが Test-AzureStack です。

Test-AzureStack は、Azure Stack の現状と Microsoft が定めた Azure Stack のあるべき姿との差異をチェックしてくれるツールです。このツールはさまざまな内容を網羅的に確認した上で、管理者にわかりやすい形で結果を出力してくれます。

{{< figure src="./../../images/2018-12-19-001.png" title="Test-AzureStack の出力" >}}

ただし、Test-AzureStack は、結果のサマリだけを管理者に出力します。WARN や FAIL になった理由までは出力してくれません。理由を知るためには、Azure Stack Validation Summary を利用します。このファイルは、Test-AzureStack の具体的な確認項目と結果がまとめられている HTML ファイルです。このファイルを見れば、Test-AzureStack が何を確認して何を異常と見なしたのかを管理者が確認できます。

{{< figure src="./../../images/2018-12-19-002.png" title="Azure Stack Validation Summary" >}}

{{< figure src="./../../images/2018-12-19-003.png" title="Azure Stack Infrastructure Capacityの詳細" >}}

{{< figure src="./../../images/2018-12-19-004.png" title="Test Connection to Resource Providers Summary の詳細" >}}

## まとめ

本日のエントリでは、Azure Stack のトラブルシュート方法をまとめました。Remediation と Test-AzureStack を駆使することで、権限を制限されている Azure Stack であっても Microsoft の力を借りずに簡単なトラブルシュートが可能です。Microsoft のサポートとのやり取りは時間がかかるので、Remediation や Test-AzureStack を利用して自己解決できるものは自己解決していきましょう。

明日のエントリでは、切り分けの次に行う保守対応についてまとめます。

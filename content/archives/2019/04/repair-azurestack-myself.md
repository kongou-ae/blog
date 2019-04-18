---
title: Azure Stack Integrated system を自分で直す
author: kongou_ae
date: 2019-04-18
url: /archives/2019/04/repair-azurestack-myself
categories:
  - azurestack
---

## はじめに

[Azure Stack を修理する](https://aimless.jp/blog/archives/2018-12-20-repair-azure-stack/) に記載したとおり、Azure Stack Integrated system を直すためには、原則として Microsoft のサポートが必要です。ただし、Microsoft のサポートがなくても一部の障害を修理できます。

## アラート経由で直す

Azure Stack のアラートには "Remediation" と呼ばれる項目があります。この項目には、該当の障害に対する対処方法が記載されています。そして、特定の障害には "Repair" ボタンが用意されています。

Azs-Gwy01 という Infrastructure Role Instance を停止して、管理者向けポータルにアラートを表示させます。

{{< figure src="/images/2019-04-18-003.png" title="Azs-Gwy01 のアラート" >}}

アラートの詳細を見ると、"Remediation" の項目に "Repair" ボタンが表示されています。

{{< figure src="/images/2019-04-18-004.png" title="Repair ボタン" >}}

これをクリックすると修復が始まります。

{{< figure src="/images/2019-04-18-005.png" title="Repair 中" >}}

{{< figure src="/images/2019-04-18-006.png" title="Repair 完了" >}}

無事に修復が完了すると、アラートはクローズになります。

{{< figure src="/images/2019-04-18-008.png" title="クローズされたアラート" >}}

## Test-AzureStack で直す

問題の有無を診断するコマンドである Test-AzureStack は、問題を検出した際に "-Repair" オプションによるセルフ修復を示すことがあります。

Azs-WASP01 という Infrastructure Role Instance を停止した上で Test-AzureStack を実施すると、次のようなセルフ修復を指示されます。

{{< figure src="/images/2019-04-18-001.png" title="-Repiarオプション" >}}

いわれるがままに "-Repair" つきの Test-AzureStack を実行すると、Azure Stack Integrated system 自身が、停止していた Azs-WASP01 を起動してくれます。Azure Stack Operator が実施することは Test-AzureStack のみですので、Microsoft のサポートは不要です。

{{< figure src="/images/2019-04-18-002.png" title="-Repiarオプショの結果" >}}

## おわり

Azure Stack Integrated system の障害を自分で直す方法を紹介しました。Microsoft のサポートを受けて一緒に修復作業を実施するとなると、どうしても障害の復旧に時間がかかってしまいます。セルフ修復が利用できる障害であれば、Azure Stack の指示に従って自分で直してしまいましょう。

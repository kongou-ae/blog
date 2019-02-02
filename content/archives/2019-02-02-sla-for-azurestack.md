---
title: Azure Stack の SLA
author: kongou_ae
date: 2019-02-02
url: /archives/2019-02-02-sla-for-azurestack
categories:
  - azurestack
---

Azure では、各サービスごとに 稼働率の SLA が定められています。例えば仮想マシンの場合、マイクロソフトは、99.9%以上の時間においてプレミアムストレージを利用する単一インスタンスへアクセスできることを保証しています。マイクロソフトのエンジニアは、この基準を達成するようにシステムを構築・運用しているはずです。

参考：[Virtual Machines の SLA](https://azure.microsoft.com/ja-jp/support/legal/sla/virtual-machines/v1_8/)

残念なことに、2019年2月現在、Azure と一貫性のあるサービスを提供する Azure Stack には 稼働率に対する SLA がありません。おそらく、お客様サイトで動作してお客様が運用する Azure Stack に対して Microsoft が SLA を定めることが困難だからでしょう。気持ちは理解できます。

しかし、システム全体の稼働率の SLA を定める立場の方々は困ってしまいます。Azure Stack は性悪説で設計されているため、利用者は稼働率の指標となるインフラの構成の全てを確認できません（参考：[Azure Stack のセキュリティ](https://aimless.jp/blog/archives/2018-12-11-security-of-azurestack/)）。そのため、ハードウェア構成や利用されている機能などの一般公開されている限られた情報を頼りに、根拠の少ない稼働率の SLA を定めなければならないからです。

自信をもってシステム全体の稼働率の SLA を定めるためには、Microsoft からの情報提供が必要不可欠です。この困りごとは、feedback.azure.com に登録されています。Azure Stack を使ったシステム全体の SLA を決めるために、Azure Stack の SLA を計算するための情報を提供してほしいというフィードバックです。ステータスは「レビュー中」です。私も投票しました。

[Methodology or suggestion for Azure Stack SLA calculation](https://feedback.azure.com/forums/344565-azure-stack/suggestions/34030585-methodology-or-suggestion-for-azure-stack-sla-calc)

Azure Stack に対して SLA を定めることは、かなりのチャレンジだと思います。ですが、Azure との一貫性というビジョンのもと、Microsoft が Azure と同じようにAzure Stack にも 稼働率の SLA を定めてくれることを期待しています。

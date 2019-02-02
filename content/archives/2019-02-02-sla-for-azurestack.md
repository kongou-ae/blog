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

残念なことに、Azure と一貫性のあるサービスを提供する Azure Stack には 稼働率に対する SLA がありません。おそらく、お客様サイトで動作してお客様が運用する Azure Stack に対して Microsoft が SLA を定めることが困難だからでしょう。気持ちは理解できます。

しかし、システム全体の稼働率の SLA を定める立場の方々は困ってしまいます。自由に設計できるインフラの場合、管理者はインフラの構成や設定値を全て確認できるので、根拠を持って稼働率のSLAを定められます。一方、Azure Stack の場合、利用者は稼働率の指標となるインフラの構成を全て確認できません（参考：[Azure Stack のセキュリティ](https://aimless.jp/blog/archives/2018-12-11-security-of-azurestack/)）。そのため、ハードウェア構成や利用されている機能などの一般公開されている限られた情報を頼りに、根拠ので薄い稼働率の SLA を定めざるを得ません。

この困りごとは、feedback.azure.com に登録されています。Azure Stack を使ったシステム全体の SLA を決めるために、Azure Stack の SLA を計算するための情報を提供してほしいというフィードバックです。ステータスは「レビュー中」です。私も投票しました。

[Methodology or suggestion for Azure Stack SLA calculation](https://feedback.azure.com/forums/344565-azure-stack/suggestions/34030585-methodology-or-suggestion-for-azure-stack-sla-calc)

かなりのチャレンジだと思いますが、Microsoft が Azure Stack にも Azure と同じように 稼働率の SLA を定めてくれることを期待しています。

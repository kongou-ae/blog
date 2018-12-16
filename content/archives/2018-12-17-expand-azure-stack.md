---
title: Azure Stack を拡張する
author: kongou_ae
date: 2018-12-17
url: /archives/2018-12-17-expand-azure-stack
categories:
  - azurestack
---

## はじめに

本エントリーは[Microsoft Azure Stack Advent Calendar 2018](https://qiita.com/advent-calendar/2018/azure-stack)の17日目です。

本日のエントリでは、Azure Stack の拡張についてまとめます。以前のエントリ（[Azure Stack をサイジングする](https://aimless.jp/blog/archives/2018-12-05-sizing-for-azure-stack/)）では、Azure Stack を導入する際のサイジングをまとめました。導入後には、キャパシティを確認する必要があります。そして、キャパシティが不足しそうな場合は、サーバを増強しなければなりません。

## キャパシティの確認

[Azure Stack のセキュリティ](https://aimless.jp/blog/archives/2018-12-11-security-of-azurestack/)でまとめた通り、Integrated systems は、管理者の Host Node に対する権限を絞っています。そのため、従来のサーバの様に、監視用のエージェントを入れる、CLI でメトリクスを収集するといった確認手法を利用できません。

Azure Stack のキャパシティを確認する手法は次の通りです。

1. Azure Stack がアラートを上げるのを待つ
2. キャパシティに関するメトリクスを自分でチェックする

Azure Stack は、自分自身のキャパシティを監視して、キャパシティが減ってくるとアラートを上げるようです。（実際に見たことはないです）アラート定義の中には、キャパシティに関するものが存在しています。

- Low core capacity
- Low memory capacity
- The scale unit does not have the minimum recommended storage reserve capacity
- Public IP address utilization at xx% across all pools.

まだ、Azure Stack に任せるのではなく、自分でメトリクスを確認することもできます。具体的な手法は次の通りです。

|項目 | 手法 |
|-----|------|
| CPU | BMC |
|メモリ |管理者向け ARM （ポータル、PowerShell など）|
|ディスク |管理者向け ARM （ポータル、PowerShell など）|
|Public IP Address |管理者向け ARM （ポータル、PowerShell など）|

管理者向け ARM では CPU を確認できません。BMC を利用して、CPU の理由状況を確認します。CPU 以外の項目は管理者向け ARM で確認できます。GUI であれば管理者向けポータル、CLI であれば PowerShell を使うことになります。お好みのツールから API を直接叩いてもいいでしょう。

{{< figure src="./../../images/2018-12-17-001.png" title="管理者向けポータル画面" >}}

```powershell
PS > $health = Get-AzsRegionHealth
PS > $health.UsageMetrics

Name                           Capacity Metrics                                  
----                           ----------------                                  
Physical memory                Used=165.12GB Available=346.78GB                  
Physical storage               Used=0.78TB Available=9.07TB                      
Public IP address pools        Used=38.00 Available=217.00                   
```

また、これらの手法を利用して定期的に情報を取得し続ければ、現在のキャパシティだけでなく、キャパシティの推移も確認できるでしょう。

## キャパシティの増強

確認した結果キャパシティが不足していることが判明した場合、ハードウェアを増強する必要があります。Azure Stack のインフラ部分はハイパーコンバージドインフラの構成です。そのため、サーバ単位でリソースを増やしてキャパシティを増加させます。具体的な手順は公式サイトをご確認ください。

参考:[Azure Stack のスケール ユニット ノードを追加する](https://docs.microsoft.com/ja-jp/azure/azure-stack/azure-stack-add-scale-node)
   
ただし、無限にサーバを増やせるわけではありません。1809 Update 時点の Azure Stack における拡張の仕様は次の通りです。

- 1つのラックに最大16台のサーバを導入できる
- 1つのラック内では、サーバの構成が同一でなければならない
- 複数のラックにまたがって１つの Azure Stack を構成する機能（ Multi Scaleunit ）はリリースされていない。開発中のアナウンスが出ている状況

つまり、現時点においては、必要なキャパシティが1つのラックに収まらなくなった場合、別のラックに新しい Azure Stack を新規で作らなければなりません。2つの Azure Stack は全く別の Azure Stack として動作しますので、運用管理の手間が2倍になります。避けるべきシナリオです。

また、「最大台数は16台まで、サーバの構成は同一」という仕様ですので、スペックの低いサーバ 4台で Azure Stack を始めると、スペックの低い同一サーバを増強しなければなりません。スペックの低いサーバ4台で始めた Azure Stack は、スペックの高いサーバ4台で始めた Azure Stack と比較するとラックあたりの収容効率が低いので、新しい別の Azure Stack が必要になるタイミングが早く来てしまいます。これも避けるべきシナリオです。

[Azure Stack をサイジングする](https://aimless.jp/blog/archives/2018-12-05-sizing-for-azure-stack/)で触れておくべきテーマですが、現時点においては、拡張限界を迎えてしまうことを避けるためには初回導入時点で次の点を考慮しておくとよいでしょう。

* ある程度余裕をもったスペックの Host Node を選択することで、キャパシティ不足による Host Node の追加が発生しにくいようにする
* ギリギリのスペックの Host Node を選択する場合は、ファシリティとして設置できる最大数の構成でのキャパシティを確認して、組織の需要を大幅に上回るキャパシティになることを確認する

## まとめ

本日のエントリでは、キャパシティの管理というテーマで、キャパシティの確認方法とキャパシティの拡張の考え方の2点をまとめました。Multi Scaleunit がサポートされると、キャパシティの増強の前提が大きく変わって拡張限界が大幅に向上します。リリースが待ち遠しいです。

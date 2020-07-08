---
title: Azure Virtual WAN の P2S VPN には2つの接続方法がある
author: kongou_ae
date: 2020-07-08
url: /archives/2020/07/two-way-to-connect-p2svpn-of-virtualwan
categories:
  - azure
---

## はじめに

Virtual WAN のドキュメントに[ユーザー VPN クライアント用にグローバルまたはハブベースのプロファイルをダウンロードする](https://docs.microsoft.com/ja-jp/azure/virtual-wan/global-hub-profile)という記事を見つけました。このドキュメントによると Virtual WAN の P2S VPN には「すべての Hub に存在する P2S Gateway に接続できるプロファイル」と「特定の Hub に存在する P2S Gateway にのみ接続できるプロファイル」があるとのことです。「知らんかった・・・」ということで動作確認しました。

なお、今回の動作確認では Japan East の Hub と East US の Hub をもつ Virtual WAN を利用しました。

{{< figure src="/images/2020/2020-0708-002.jpg" title="検証で利用した Virtual WAN の構成" >}}

## ハブベースプロファイル

特定の Hub に存在する P2S Gateway にのみ接続できるプロファイルをハブベースプロファイルと呼びます。ハブプロファイルは Virtual Wan > Connectivity > Hubs > 接続したい Hub > Connectivity > User VPN (Point to Site) からダウンロードできます。

{{< figure src="/images/2020/2020-0708-003.jpg" title="ハブベースプロファイルのダウンロード場所" >}}

今回ダウンロードしたプロファイルに記載されている接続先は次の通りです。

- Japan East: hub0.q6ldgvdd6hwhux2qizybdc6fc.vpn.azure.com
- East US: hub1.q6ldgvdd6hwhux2qizybdc6fc.vpn.azure.com

これら接続先を [Global DNS Lookingglass](https://isc.sans.edu/tools/dnslookup.html) で調べた結果が次の通りです。どこから接続しても必ず特定の Hub に存在する P2S Gateway に接続するわけですから、名前解決する場所に関係なく同じ IP アドレスが返ってきます。

|Country|Result of Hub0|Result of Hub1|
|---|---|---|
|Germany|20.46.187.24|52.150.38.112|
|France|20.46.187.24|52.150.38.112|
|GLOBAL|20.46.187.24|52.150.38.112|
|Korea|20.46.187.24|52.150.38.112|
|Netherlands|20.46.187.24|52.150.38.112|
|Saudi Arabia|20.46.187.24|52.150.38.112|

## グローバルプロファイル

すべての Hub に存在する P2S Gateway に接続できるプロファイルをグローバルプロファイルと呼びます。グローバルプロファイルは Virtual WAN > Connectivity > User VPN configuration からダウンロードできます。

{{< figure src="/images/2020/2020-0708-001.jpg" title="グローバルプロファイルのダウンロード場所" >}}

ダウンロードしたプロファイルに記載されている接続先は wan.q6ldgvdd6hwhux2qizybdc6fc.vpn.azure.com です。これら接続先を [Global DNS Lookingglass](https://isc.sans.edu/tools/dnslookup.html) で調べた結果が次の通りです。

|Country|Result|
|---|---|
|Germany|52.150.38.112|
|France|52.150.38.112|
|GLOBAL|52.150.38.112|
|Korea|20.46.187.24|
|Netherlands|52.150.38.112|
|Saudi Arabia|20.46.187.24|

名前解決する場所によって返ってくる IP アドレスが違います。東日本に近い韓国やサウジアラビアからの名前解決には Japan East の Hub に存在する P2S Gateway の 20.46.187.24 が返ってきます。一方で、East US に近いドイツやフランス、オランダからの名前解決には East US の Hub に存在する P2S Gateway の 52.150.38.112 が返ってきます。グローバルプロファイルの接続先である wan.q6ldgvdd6hwhux2qizybdc6fc.vpn.azure.com は CNAME が Traffic Manager を向いているので、トTraffic Manager の地理的ルーティングを使ってユーザに最も近い Hub の P2S Gateway の IP アドレスを返していると推測できます。

```
;; QUESTION SECTION:
;hub0.q6ldgvdd6hwhux2qizybdc6fc.vpn.azure.com. IN A

;; ANSWER SECTION:
hub0.q6ldgvdd6hwhux2qizybdc6fc.vpn.azure.com. 900 IN CNAME hubtm-c622d2f2-0fb1-4b0f-8cb1-bfbe1b79960d.trafficmanager.net.
hubtm-c622d2f2-0fb1-4b0f-8cb1-bfbe1b79960d.trafficmanager.net. 60 IN A 20.46.187.24
```

Virtual WAN のグローバルプロファイルを利用すれば、地理的に分散されたリモートアクセス VPN を簡単に構築できます。CNAME に設定されている Traffic Manager が生きている P2S Gateway に振ってくれるので、クライアントに設定されている VPN プロファイルは常に1つです。特定のリージョンの P2S Gateway で障害が発生した際に ユーザが VPN の接続先を切り替える必要はありません。素敵！

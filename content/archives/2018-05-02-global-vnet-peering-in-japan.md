---
title: Global VNet Peeringを試す
author: kongou_ae

date: 2018-05-02
url: /archives/2018-05-02-global-vnet-peering-in-japan
categories:
  - azure
---

東日本リージョンと西日本リージョンでGlobal VNet Peering（リージョン間でのVNet Peering）がGAしたので試しました。[Region expansion: Global VNet Peering](https://azure.microsoft.com/ja-jp/updates/general-availability-global-vnet-peering/)

# 設定

JapanEastとJapanWest、EastUs2にVNetを用意します。

{{<img src="./../../images/2018-05-02-001.png">}}

"Peering"から設定画面に進むと、他のリージョンのVNetが選択できるようになっています。JapanWestのVNetの"Peering"では、EastUs2のVNetが選択できます。

{{<img src="./../../images/2018-05-02-003.png">}}

JapanWestのVNetをJapanEastのVNetとEastUs2のVNetと接続してみました。ポータル上でポチポチするだけで異なる地域に存在するプライベートなネットワークがつながるとは、すごい時代になりました。

{{<img src="./../../images/2018-05-02-006.png">}}

JapanWestのルーティングは次の通りです。Global VNet PeeringしているVNetのセグメントはネクストホップは"VNet Global Peering"になります。

# 疎通確認

疎通確認のために、JapanWestとEastUs2にubuntuのVirtual Machineを起動します。別リージョンのVirtual MachineのプライベートIPアドレスに対してPingを打つと普通に通ります。JapanWestのVirtual MachineからEastUs2のVirtual MachineへのPingのRTTは156msでした。

{{<img src="./../../images/2018-05-02-007.png">}}

比較のために、Looking Glassを利用して、大阪に設置されているISPのルータからEastUs2のVirtual MachineのPublic IP Addressに対してPingを打ってみました。利用したLooking Glassは[TATA](http://lg.as6453.net/lg/)と[ANEXIA](https://lg.anexia-it.com/lg/#node/select)です。どちらもRTTは165msでした。Global VNet Peeringの方が早い。すごいぞMicrosoft Backbone。


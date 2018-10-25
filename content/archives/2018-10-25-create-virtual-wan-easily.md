---
title: Azure Virtual WAN を使って IPSec VPN を簡単に構築する
author: kongou_ae
date: 2018-10-25
url: /archives/2018-10-25-create-virtual-wan-easily
categories:
  - azure
---

## はじめに

本エントリでは Virtual WAN の目玉機能である自動接続に対応したアプライアンスを利用して、ハブアンドスポーク型の IPsec VPN を構築します。

## 対応アプライアンス

Virtual WAN への自動接続に対応しているアプライアンスは次の通りです。

{{<img src="./../../images/2018-10-25-001.png">}}

引用：[Building branch connectivity to the cloud using Azure Virtual WAN - BRK2425](https://www.youtube.com/watch?v=I9U8f64xmJQ)

本エントリでは Barracuda を利用します。ただし我が家には Barracuda がないので、Azure 上の Barracuda CloudGen Firewall for Azure を利用します。

## Virtual WAN の準備

Virtual WAN そのものと接続先となる Hub を作ります。自動接続に対応していない FortiGate の場合、 [FortiGate を Azure Virtual WAN に接続する](https://aimless.jp/blog/archives/2018-10-19-connect-fortigate-to-virtualwan/)のとおり、FortiGate を VPN Site として手動で登録しました。自動接続に対応するデバイスの場合、VPN Site を手動で登録する必要はありません。デバイスが自分で自分自身をVPN Site として登録するためです。また、デバイスが自分自身を VPN Site として登録するために必要となるサービスプリンシパルを用意します。

## Barracuda の設定

Hub と サービスプリンシパルの用意が完了したら、Barracuda を設定します。

参考：[How to Configure Automatic Connectivity to Azure Virtual WAN](https://campus.barracuda.com/product/cloudgenfirewall/doc/78808340/how-to-configure-automatic-connectivity-to-azure-virtual-wan)

Virtual WAN への自動接続は、CloudGen Firewall 7.2.2 hotfix-886 以降でサポートされています。Marketplace からデプロイした Bararacuda の場合は、 Hotfix を適用する必要があります。

{{<img src="./../../images/2018-10-25-002.png">}}

Virtual WAN をサポートするバージョンであれば、GUI に Virtual WANの設定項目があります。必要なパラメータは次の通りです。

{{<img src="./../../images/2018-10-25-003.png">}}

- サービスプリンシパルを利用するための認証情報一式
- Barracuda をt登録したい Virtual WAN の名前

{{<img src="./../../images/2018-10-25-004.png">}}

入力を終えると、Barracuda は自分自身を VPN Site として Virtual WAN に登録します。そして、自分が Hub と紐づけられるのを待ちます。

```
2018-10-18 11:49:54,891 - Starting Process of creating site: 'Bara_1119222' on VWAN: '1017'
2018-10-18 11:50:00,789 - Site creation complete for Bara_1119222. Please now associate the site with your chosen region on Azure.
2018-10-18 11:50:01,004 - Polling for site configuration data (available once site is associated with hub).
2018-10-18 11:50:01,004 - VWAN: '1017', Site name: 'Bara_1119222'
2018-10-18 11:50:01,149 - No available Blob Storage, creating one.
```

Azure Portal 上では、自動登録された Barracuda が VPN Site として表示されます。

{{<img src="./../../images/2018-10-25-005.png">}}

登録された VPN Site を手動で Barracuda と Hub と関連付けします。手動で関連付けしなきゃいけないの残念ポイントです。VPN Site としての登録だけでなく、Hub との関連付けまで自動でやってほしい。

VPN Site と Hub との関連付けが終わると、Barracuda は自分が関連付けられた Hub を特定して、コンフィグファイルをダウンロードします。そして、ダウンロードした情報を利用して、自身に Azure Virtuwal WAN の設定をインストールします。

```
2018-10-18 11:54:29,430 - VWAN: '1017', Site name: 'Bara_1119222'
2018-10-18 11:54:29,538 - Using Blob Storage account 'vwanconfig20181018115001' for site configuration download.
2018-10-18 11:54:42,346 - Site configuration data not yet available, retry in 30 seconds
2018-10-18 11:55:12,377 - Polling for site configuration data (available once site is associated with hub).
2018-10-18 11:55:12,377 - VWAN: '1017', Site name: 'Bara_1119222'
2018-10-18 11:55:12,453 - Using Blob Storage account 'vwanconfig20181018115001' for site configuration download.
2018-10-18 11:55:25,323 - Site configuration data successfully collected. Configuring firewall
2018-10-18 11:55:31,223 - Firewall Azure VWAN Configuration complete.
```

### 動作確認

Barracuda 自身による設定のインストールが完了すると、Hub とのVPN トンネルが２本張られて、他拠点の経路を BGP で受信します。いい感じですね。

{{<img src="./../../images/2018-10-25-006.png">}}

### 終わりに

Barracuda を利用して、Azure Virtual WAN への自動接続を試しました。数クリックで Active/Active な IPsec VPN と BGP の設定が完了しました。実に気軽です。

Virtual WAN への自動接続機能は、ベンダによって実装が違います。今回試した Barracuda だと VPN Site の登録は自動ですが、Hub との関連付けが手動です。[How to Configure Automatic Connectivity to Azure Virtual WAN](https://campus.barracuda.com/product/cloudgenfirewall/doc/78808340/how-to-configure-automatic-connectivity-to-azure-virtual-wan)のデモ動画によると、Check Point は、装置自身が Hub との関連付けまで自動的に実施するようです。この方式であれば現地で装置を操作している作業員だけで IPsec VPN の構築が完了します。Palo Altoは、[Palo Alto Networks Azure Virtual WAN Toolkit](https://github.com/PaloAltoNetworks/microsoft_azure_virtual_wan)と呼ばれる Python スクリプトを利用して、管理者が外部から設定を投入する方式のようです。各社で違いがあることがわかると、Azure Virtual WAN への自動接続をサポートするベンダの機器をそろえて、各社の実装の違いを比較しつつマルチベンダな IPsec VPN を構築したくなりますね。

---
title: Azure Firewall Premium のカテゴリベースフィルタを試した
author: kongou_ae
date: 2021-02-17
url: /archives/2021/02/webfilter-of-azurefirewall
categories:
  - azure
---

## はじめに

UTM 機能が搭載された Azure Firewall premium がプレビューになりました。このリリースによって Azure Firewall と NVA との機能差がまた一つ減りました。良いことです。

参考：[Azure Firewall Premium Preview features](https://docs.microsoft.com/en-us/azure/firewall/premium-features)

Premium SKU はプレミアムだけあって Standard SKU よりも高額です。Azure Premium の料金は東日本リージョンの場合 ¥196/時間です。Standard SKU の ¥140/時間よりも高額です。さらに Premium SKU はポリシーの設定に Firewall policy を利用します。そのため、Firewall Policy の利用料金 ¥11,200/ポリシーが追加で発生します。

今回のエントリでは、プレビューのアナウンスを受けてカテゴリベースのフィルタを試した結果をまとめます。

## 構築

ポータルを利用して Premium SKU を構築できます。Azure Firewall を構築する際に Premium を選択すれば OK です。また、Premium SKU は Firewall policy の利用が必須ですので、構築時に新規または既存の Firewall policy を選択する必要があります。

{{< figure src="/images/2021/2021-0217-001.png" title="Premium SKU の設定画面" >}}

## ルールの設定

Firewall policy から Application rule を設定します。宛先の設定値に Web categories と URL が追加されていますので、web categories と使用したいカテゴリを選びます。今回は Gambling と Goverment をブロックするポリシーを設定します。

{{< figure src="/images/2021/2021-0217-002.png" title="ルールの設定画面" >}}

{{< figure src="/images/2021/2021-0217-003.png" title="設定したルール" >}}

設定できるカテゴリの一覧は[こちら](https://gist.github.com/kongou-ae/bc27ad9a3b21a71978172499ae3e2c61)。

## 動作確認

ギャンブル代表である https://www.jra.go.jp/ と政府代表である http://www.mod.go.jp/ に HTTP でアクセスすると Azure Firewall のメッセージが表示されました。ブロックされたアクセスがどのカテゴリに該当したのかをメッセージから確認できました。

{{< figure src="/images/2021/2021-0217-005.png" title="HTTP のブロック画面" >}}

同様のサイトに HTTPS でアクセスするとブラウザのエラー画面になりました。

{{< figure src="/images/2021/2021-0217-004.png" title="HTTPS のブロック画面" >}}


ブラウザからでは HTTPS の通信が Azure Firewall にブロックされたかどうかを明確に判断できませんが、診断ログとして Log Analytics に記録されたログを確認すると、HTTPS 通信がカテゴリベースのポリシーでブロックされたことを示すログが記録されていました。カテゴリベースのフィルタリングはちゃんと機能していそうです。

{{< figure src="/images/2021/2021-0217-006.png" title="Log Analytics に記録された HTTPS 通信" >}}

## 終わりに

今回のエントリでは Azure Firewall Premium に実装されたカテゴリベースのフィルタを試しました。カテゴリベースのフィルタリングはアクセスする URL や IPアドレスが不明であっても通信を拒否できるので、Windows Virtual Desktop からインターネットへの通信に対してベースラインとなるセキュリティポリシーを適用する際に活用できそうです。Premium SKU は月額15万ほどかかりますが、1st パーティな選択肢が増えたのはよいことです。

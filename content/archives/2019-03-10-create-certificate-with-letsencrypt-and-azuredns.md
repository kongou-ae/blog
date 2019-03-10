---
title: Let's Encrypt と Azure DNS を使ってサーバ証明書を作成する
author: kongou_ae
date: 2019-03-10
url: /archives/2019-03-10-create-certificate-with-letsencrypt-and-azuredns
categories:
  - azurestack
  - azure
---

## はじめに

Azure Stack Development Kit を独自ドメインでデプロイするために公的なサーバ証明書が必要だったので、Let's Encrypt と Azure DNS を使って作りました。Azure Stack の都合上、サーバ証明書を利用するサーバ自身が Let's Encrypt を利用して自分のサーバ証明書を発行する方式ではなく、一般的な認証局のサーバ証明書を使うときと同じように CSRを作成したうえで認証局に署名してもらう手法を試しました。


## acme.sh をインストールする

Let's Encrypt のクライアントとして、Azure DNS との連携をサポートしている [acme.sh](https://github.com/Neilpang/acme.sh) を利用します。インストール方法は次の通りです。今回は Azure Cloud Shell 上にインストールしました。

```bash
curl https://get.acme.sh | sh
. ~/.acme.sh/acme.sh.env
```

## CSR を作成する

Let's Encrypt に署名してもらうための CSR を作ります。Azure Stack Development Kit で利用するサーバ証明書を作りたかったので、次の URL の方法に沿って CSR を作りました。

- [Azure Stack用サーバ証明書のCSRを作る](https://aimless.jp/blog/archives/2018-06-15-create-csr-of-azurestack/)

なお、acme.sh は、CSR のフォーマットが `-----BEGIN CERTIFICATE REQUEST-----` で始まり `-----END CERTIFICATE REQUEST-----` で終わることを期待するようです。`AzsReadinessChecker` が作成してくれる CSR は `-----BEGIN NEW CERTIFICATE REQUEST-----` で始まり `-----END NEW CERTIFICATE REQUEST-----` で終わっているため、CSR に対する署名がエラーになりました。


### Service Principle を作る

acme.sh は、様々な DNS サービスと連携して Let's Encrypt の DNS 認証を自動化してくれます。

参考：[DNS API mode](https://github.com/Neilpang/acme.sh/tree/master/dnsapi)

acme.sh が Azure DNS を操作できるように、DNS ゾーンに対して acme.sh 用の Service Principle を作成します。

```bash
az ad sp create-for-rbac --name  "AcmeDnsValidator" --role "DNS Zone Contributor" --scope /subscriptions/xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx/resourceGroups/aimless-infra/providers/Microsoft.Network/dnszones/aimless.jp
```

そして、acme.sh が Service Principle の情報を使えるように、環境変数に Service Principle の情報を入力します。

```
export AZUREDNS_SUBSCRIPTIONID="xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
export AZUREDNS_TENANTID="xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
export AZUREDNS_APPID="xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
export AZUREDNS_CLIENTSECRET="xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
```

## 署名する

acme.sh の準備ができたら、acme.sh を利用して、作成した CSR を Let's Encrypt に署名してもらいます。

```bash
$ acme.sh --signcsr --dns dns_azure --csr adminportal_test_asdk_aimless_jp_CertRequest_20190310132106.req
[Sun Mar 10 13:39:39 UTC 2019] Copy csr to: $HOME/.acme.sh/adminportal.test.asdk.aimless.jp/adminportal.test.asdk.aimless.jp.csr
[Sun Mar 10 13:39:40 UTC 2019] Signing from existing CSR.
[Sun Mar 10 13:39:40 UTC 2019] Getting domain auth token for each domain
[Sun Mar 10 13:39:40 UTC 2019] Getting webroot for domain='adminportal.test.asdk.aimless.jp'
[Sun Mar 10 13:39:40 UTC 2019] Getting new-authz for domain='adminportal.test.asdk.aimless.jp'
[Sun Mar 10 13:39:41 UTC 2019] The new-authz request is ok.
[Sun Mar 10 13:39:41 UTC 2019] Found domain api file: $HOME/.acme.sh/dnsapi/dns_azure.sh
[Sun Mar 10 13:39:43 UTC 2019] validation value added
[Sun Mar 10 13:39:43 UTC 2019] Let's check each dns records now. Sleep 20 seconds first.
[Sun Mar 10 13:40:04 UTC 2019] Checking adminportal.test.asdk.aimless.jp for _acme-challenge.adminportal.test.asdk.aimless.jp
[Sun Mar 10 13:40:04 UTC 2019] Domain adminportal.test.asdk.aimless.jp '_acme-challenge.adminportal.test.asdk.aimless.jp' success.
[Sun Mar 10 13:40:04 UTC 2019] All success, let's return
[Sun Mar 10 13:40:04 UTC 2019] Verifying: adminportal.test.asdk.aimless.jp
[Sun Mar 10 13:40:07 UTC 2019] Success
[Sun Mar 10 13:40:07 UTC 2019] Removing DNS records.
[Sun Mar 10 13:40:09 UTC 2019] validation record removed
[Sun Mar 10 13:40:09 UTC 2019] Verify finished, start to sign.
[Sun Mar 10 13:40:12 UTC 2019] Cert success.
-----BEGIN CERTIFICATE-----
中略
-----END CERTIFICATE-----
[Sun Mar 10 13:40:12 UTC 2019] Your cert is in $HOME/.acme.sh/adminportal.test.asdk.aimless.jp/adminportal.test.asdk.aimless.jp.cer
[Sun Mar 10 13:40:12 UTC 2019] The intermediate CA cert is in $HOME/.acme.sh/adminportal.test.asdk.aimless.jp/ca.cer
[Sun Mar 10 13:40:12 UTC 2019] And the full chain certs is there: $HOME/.acme.sh/adminportal.test.asdk.aimless.jp/fullchain.cer
```

無事に署名が完了すると、Let's Encrypt に署名されたサーバ証明書が `$HOME/.acme.sh/` 配下に配置されます。簡単。DNS Zone の Activity Log を見ると、acme.sh が Service Principle を利用して TXTレコードを追加・削除しているのを確認できます。

{{< figure src="./../../images/2019-03-10-001.PNG" title="実際にできたサーバ証明書" >}}

なお、Let's Encrypt でマルチドメインワイルドカード証明書を発行する場合、すべての SANs がユニークでなければならないようです。Azure Stack の証明書を1枚のマルチドメインワイルド証明書で発行しようと試みたら、`*.appservice.<region>.<fqdn>` の SANs が `	api.appservice.<region>.<fqdn>` や `ftp.appservice.<region>.<fqdn>` 、 ` sso.appservice.<region>.<fqdn>` と重複するため、署名要求が次のとおりエラーになりました。

```bash
~$ acme.sh --signcsr --dns dns_azure --csr  portal_test_asdk_aimless_jp_CertRequest_20190310141004.req
[Sun Mar 10 14:12:13 UTC 2019] Copy csr to: $HOME/.acme.sh/portal.test.asdk.aimless.jp/portal.test.asdk.aimless.jp.csr
[Sun Mar 10 14:12:15 UTC 2019] Domains have changed.
[Sun Mar 10 14:12:15 UTC 2019] Signing from existing CSR.
[Sun Mar 10 14:12:15 UTC 2019] Getting domain auth token for each domain
[Sun Mar 10 14:12:16 UTC 2019] Create new order error. Le_OrderFinalize not found. {
  "type": "urn:ietf:params:acme:error:malformed",
  "detail": "Error creating new order :: Domain name \"ftp.appservice.test.asdk.aimless.jp\" is redundant with a wildcard domain in the same request. Remove one or theother from the certificate request.",
  "status": 400
}
[Sun Mar 10 14:12:16 UTC 2019] Please add '--debug' or '--log' to check more details.
[Sun Mar 10 14:12:16 UTC 2019] See: https://github.com/Neilpang/acme.sh/wiki/How-to-debug-acme.sh
```

## おわりに

Let's Encrypt と Azure DNS を利用して、正規のサーバ証明書を作成しました。気軽に無償で公的なサーバ証明書を入手できるのは大変ありがたいです。なお、Let's Encrypt が発行するサーバ証明書の有効期限は3か月なので、3か月に1回更新手続きをしなければなりません。忘れそう・・・

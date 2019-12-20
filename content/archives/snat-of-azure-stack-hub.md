---
title: Azure Stack Hub の SNAT(Virtual Machine 編)
author: kongou_ae
date: 2019-12-20
url: /archives/2019/10/snat-of-azure-stack-hub
categories:
  - azurestac
---

Azure を使う際に知っておくべきことの一つが SNAT です。

- https://docs.microsoft.com/ja-jp/azure/load-balancer/load-balancer-outbound-connections#defaultsnat
- https://www.syuheiuda.com/?p=5074

Azure と一貫性のある Azure Stack Hub にも SNAT が実装されています。そのため、Azure Stack Hub の仮想マシンは、Public IP Address を NIC に関連づけなくても Azure Stack Hub の外のネットワークにアクセスできます。

本エントリでは、Virtual Machine の SNAT に利用される Public IP  address を解説します。

## いつ確保されるか

Azure Stack Hub は、VNet に一台目の Virtual Machine を作成した時点で、SNAT に利用する Public IP address を確保するようです。VNet だけを作っても Public IP Address の残量は変わりませんでしたが、仮想マシンを作成した途端に残量が１つ減りました。

{{< figure src="/images/2019-12-20-001.png" title="VNet を作った直後の残量" >}}

{{< figure src="/images/2019-12-20-001.png" title="1台目の Virtual Machine を作った直後の残量" >}}

VNet ごとに SNAT 用のアドレスを確保しますので、Public IP Address が10個の状態で「VNet １つ、Public IP Address つきの Virtual Machine １つの環境」を10個作ろうとすると、１つの環境あたり Public IP Address を２つ使うため、５つのデプロイが「ネットワークリソースプロバイダがリソースを割り当てられなかった」という旨のエラーによって失敗します。

## どのアドレスが使われているのか

残念なことに、管理者は SNAT 用に確保された IP アドレスを管理者ポータルから確認できません。また、Get-AzsPublicIPAddress のコマンドでも確認できません。ただし、キャパシティに表示されているPublic IP Addeess の個数にはSNAT用に確保されたアドレスが反映されます。

この仕様は次のドキュメントに明記されています。

https://docs.microsoft.com/ja-jp/azure-stack/operator/azure-stack-viewing-public-ip-address-consumption?view=azs-1910#view-the-public-ip-address-information-summary-table

## いつ解放されるか

Azure Stack Hub は、VNet が削除されたタイミングで SNAT 用のアドレスを解放するようです。VNet から仮想マシンを削除しても Public IP Address の残量は変わりませんでしたが、VNet を削除したら Public UP Arress の残りが１つ増えました。

## まとめ

Azure Stack Hub の SNAT の挙動をまとめました。Public VIP Network に割り当てるサブネットを決める際には、SNAT 用に確保される Public IP Address を考慮したうえで必要なアドレスの総量を数えましょう。


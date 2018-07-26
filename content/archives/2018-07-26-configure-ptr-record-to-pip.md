---
title: AzureのPublic IP AddressにカスタムドメインのPTRレコードを設定する
author: kongou_ae
date: 2018-07-26
url: /archives/2018-07-26-configure-ptr-record-to-pip
categories:
  - azure
---

## 背景

何となく読んだ[Configure reverse DNS for services hosted in Azure](https://docs.microsoft.com/ja-jp/azure/dns/dns-reverse-dns-for-azure-services)に、「Public IP AddressにカスタムドメインのPTRレコードを設定できる」旨が書いてありました。「まじで？」と思ったので実際にやってみました。

## 実践

PortalではカスタムドメインのPTRレコードを設定できません。PowerShellを利用して"ReverseFqdn"というプロパティに値を設定する必要があります。

PTRレコードには人様のFQDNを設定できません。"test.azure.com"で試してみたところ、エラーがでました。

```powershell
PS Azure:\> $pip = Get-AzureRmPublicIpAddress -Name "appsg01-ip" -ResourceGroupName "Sample"
PS Azure:\> $pip.DnsSettings = New-Object -TypeName "Microsoft.Azure.Commands.Network.Models.PSPublicIpAddressDnsSettings"
PS Azure:\> $pip.DnsSettings.DomainNameLabel = "aaa"
PS Azure:\> $pip.DnsSettings.ReverseFqdn = "test.azure.com."
PS Azure:\> Set-AzureRmPublicIpAddress -PublicIpAddress $pip
Set-AzureRmPublicIpAddress : ReverseFqdn azure2.aimless.jp. that PublicIPAddress appsg01-ip is trying to use does not belong to subscription xxxxxxxx-xxxx-xxxx-xxxx-cff37c36abf8. One of the following conditions need to be met to establish ownership: 1) ReverseFqdn matches fqdn of any public ip resource under the subscription; 2) ReverseFqdn resolves to the fqdn (through CName records chain) of any public ip resource under the subcription; 3) It resolves to the ip address (through CName and A records chain) of a static public ip resource under the subscription.
```

いわゆる所有権の確認が行われるため、Public IP AddressにカスタムドメインのPTRレコードを追加するためには、次の条件を満たす必要があります。

1. PTRレコードの値であるFQDNが名前解決できること
1. 名前解決の結果が、PTRレコードを追加するPublic IP Addressと一致すること

> Azure only allows the creation of a reverse DNS record where domain name specified in the reverse DNS record is the same as, or resolves to, the DNS name or IP address of a PublicIpAddress or Cloud Service in the same Azure subscription.

[Validation of reverse DNS records](https://docs.microsoft.com/en-us/azure/dns/dns-reverse-dns-for-azure-services#validation-of-reverse-dns-records)

上記の条件を満たすFQDNを"ReverseFqdn"に設定した場合、PowerShellが正常に終了しました。

```
PS Azure:\> $pip = Get-AzureRmPublicIpAddress -Name "aaa" -ResourceGroupName "aaa"
PS Azure:\> $pip.DnsSettings = New-Object -TypeName "Microsoft.Azure.Commands.Network.Models.PSPublicIpAddressDnsSettings"
PS Azure:\> $pip.DnsSettings.DomainNameLabel = "aaa"
PS Azure:\> $pip.DnsSettings.ReverseFqdn = "azure.aimless.jp."
PS Azure:\> Set-AzureRmPublicIpAddress -PublicIpAddress $pip
```

実際に逆引きしたところ、Azureの逆引きDNSサーバがカスタムドメインのPTRレコードを返していることを確認できました。

```
Azure:~$ dig -x 13.78.9.59

; <<>> DiG 9.10.3-P4-Ubuntu <<>> -x 13.78.9.59
;; global options: +cmd
;; Got answer:
;; ->>HEADER<<- opcode: QUERY, status: NOERROR, id: 22762
;; flags: qr rd ra; QUERY: 1, ANSWER: 1, AUTHORITY: 0, ADDITIONAL: 1

;; OPT PSEUDOSECTION:
; EDNS: version: 0, flags:; udp: 1280
;; QUESTION SECTION:
;59.9.78.13.in-addr.arpa.       IN      PTR

;; ANSWER SECTION:
59.9.78.13.in-addr.arpa. 10     IN      PTR     azure.aimless.jp.

;; Query time: 2 msec
;; SERVER: 168.63.129.16#53(168.63.129.16)
;; WHEN: Wed Jul 25 16:10:00 UTC 2018
;; MSG SIZE  rcvd: 82
```

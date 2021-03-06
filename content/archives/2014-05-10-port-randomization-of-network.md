---
title: ネットワーク機器におけるソースポートランダマイゼーションの実装状況
author: kongou_ae
date: 2014-05-10
url: /archives/1923
categories:
  - network
---
　[キャッシュポイズニングに関するJPRSのアナウンス][1]を踏まえて、ネットワーク機器のNAT機能の実装を調べました。

> ファイアーウォールやルーターなど、ネットワーク機器におけるネットワークアドレス変換（NAT）機能の不適切な実装により、キャッシュDNSサーバーで実施したソースポートランダマイゼーションが無効にされてしまう場合があることが判明しています。
> 
> 引用元：<cite><a href="http://jprs.jp/tech/security/2014-04-15-portrandomization.html">（緊急）キャッシュポイズニング攻撃の危険性増加に伴うDNSサーバーの設定再確認について（2014年4月15日公開）</a></cite>

　なお、一個人が調べただけですので、業務でご利用されている方々につきましては、必要に応じて保守ベンダにお問い合わせいただくのがよろしいかと思います。

## 確認項目

　一言で「ネットワークアドレス変換（NAT）機能」といっても、一般的なネットワーク機器では「NAT」と「NAPT」の二つが実装されています。NATは送信元ポート番号を変換しませんので、キャッシュDNSサーバ側でソースポートランダマイゼーションを行っていれば問題ありません。確認すべきは、ネットワーク機器が送信元ポートを変換するNAPTの仕様です。

　なお、本エントリーを書いている最中に、ネットワーク機器自身のキャッシュDNSサーバ機能はソースポートランダマイゼーションが有効になっているのか気になりました。。。別途調べようと思います。

## Check Point

　デフォルトの動作は[Hide NAT cancels DNS source port randomization][2]に記載されています。

> Hide NAT cancels the DNS source port randomization by translating source ports to non-random ports. This is a standard behavior of Hide NAT.
> 
> 引用元：[Hide NAT cancels DNS source port randomization][2]

　Hide NATとは、Check Point用語におけるNAPTです。Hide NATは送信元ポート番号をシーケンシャルに変換します。したがって、キャッシュDNSサーバのDNSクエリを経路上のCheck Point機器がNAPTしている構成の場合、キャッシュDNSサーバのソースポートランダマイゼーションをCheck Point機器が無効にしてしまいます。

　Hide NAT後の送信元ポートをランダムにするためには、IPS機能の一つであるScramblingを利用する必要があります。

　参考：[セキュリティを強化するための推奨設定： DNS キャッシュ・ポイズニング攻撃に対する先制防御][3]

　本機能を利用すると、Check PointがHide NATする際に、DNSクエリのTXIDと送信元ポートをランダムに変換します。このIPSシグネチャはリリース時期が古いので、IPSライセンスがないまたは有効期限が切れていても利用可能です。

> Protections will be limited to only those protections that were available as of March 2009 (the same protection set that existed when R70 was released). All protections produced after March 2009 will be disabled.
> 
> 引用元：[IPS Software Blade contracts in R71 and higher][4]

　ただし、注意点が二つあります。

  1. UTM製品でUTM機能を使うと、多かれ少なかれ機器の負荷が上がります。設定は計画的に。
  2. DNSパケットに対してIPS処理が行われますので、RFCに準拠しない等の誤ったDNSパケットはCheckpointが破棄する可能性があります。設定は計画的に。

## Juniper（ScreenOS）

　以下のKBが参考になります。

  * [A number of NAT/PAT devices effectively defeat the DNS source port randomization feature that was implemented to address DNS Cache Poisoning (CERT/CC VU#800113, CVE-2008-1447).][5]
  * [[ScreenOS] Protecting DNS Server behind a firewall performing NAT from DNS Cache Poison Vulnerability VU#800113][6]

> While deploying this modified code, it was discovered that Network Address Translation (NAT) counteracted the random selection of source ports. This results from NAT implementations that map the source port to a statically-defined port, sequentially-assigned port, or some other easily-predicted NAT port.
> 
> 引用元：[A number of NAT/PAT devices effectively defeat the DNS source port randomization feature that was implemented to address DNS Cache Poisoning (CERT/CC VU#800113, CVE-2008-1447).][5]

　ScreenOS: 5.4r12; 6.0r8; 6.1r4; 6.2r1 以上で、NAPT（ScreenOS用語だとDIP）の動作が改修されています。改修内容は以下の通りです。

  * インターフェースベースのDIPは、デフォルトの動作がランダム化に変更された
  * ポリシーベースのDIPは、ランダム化のためのオプションコマンドが追加された

　比較的最近導入した機器、または適切にバージョンアップを行っている機器であれば、改修済みのOSで稼働していると思います。改修前のOSでDIPを利用している場合は、改修済みのOSにバージョンアップしましょう。また、改修済みのOSでポリシーベースのDIPを利用している場合は、random-portオプションを利用しましょう。

## FortiGate

　KBを調べたのですが、それらしものを見つけられませんでした。

　手元にあるFortiOS4.0系の通信ログを見ると、インターフェースベースのNAPTとIP Poolを利用したNAPTともに、変換後の送信元ポートはランダムであるように見受けられました。おそらく、機器デフォルトの動作がランダム化だと思われます。

## Yamaha

　デフォルトの動作は[NATディスクリプタ機能 概要][7]に記載されています。

> 動的IPマスカレードでは、バインドに使うポート番号を動的に割り当てます。デフォルトの設定では、60000番から順に、新しいコネクションが発生するたびに、60001番、60002番というように、1つずつ大きい値のポート番号を割り当てていきます。
> 
> 引用元：[NATディスクリプタ機能 概要][7]

　Yamahaは、変換後の送信元ポートを60000番からシーケンシャルに選択するようです。攻撃者からすると、攻撃の試行回数を減らすことができるので大変ありがたい実装だと思います。

　対応方法はランダム化ではなく、元々のポート番号を変換しないように設定する方法になります。

> さらに、ポート番号を割り当てるポリシーとして、なるべくポート番号を変えずに済ませるというポリシーを選択できます。このためには、nat descriptor masquerade unconvertible portコマンドを使用します。このコマンドを使用すると、特定のパケットについて、ポート番号をなるべく変換しないようにすることができます。
> 
> 引用元：[NATディスクリプタ機能 概要][7]

　RTXのMLでファームの改修要望が出ていましたので、現時点でNAPTの動作そのものがランダム化に変更されたファームはないようです。

## Cisco

　以下が参考になります。

  * [Multiple Cisco Products Vulnerable to DNS Cache Poisoning Attacks][8]

> Several Cisco products are affected by this issue, and if DNS servers are deployed behind one of these affected products operating in PAT mode then the DNS infrastructure may still be at risk even if source port randomization updates have been applied to the DNS servers.
> 
> 引用元：[Multiple Cisco Products Vulnerable to DNS Cache Poisoning Attacks][8]

　上記引用元に記載のある通り、このNAPTの動作については、ASAがCSCsr28008、IOSがCSCsr29691としてバグ登録されています。

  * [PAT src port allocation policy negates effect of host port alloc. policy][9]（要CCOアカウント）
  * [PAT src port allocation policy negates effect of host port alloc. policy][10]（要CCOアカウント）

　比較的最近導入した機器、または適切にバージョンアップを行っている機器であればバグFIX済みのOSで稼働していると思います。バグに該当するバージョンで稼働している場合は、バグがFIXされたOSにバージョンアップしましょう。

 [1]: http://jprs.jp/tech/security/2014-04-15-portrandomization.html
 [2]: https://supportcenter.checkpoint.com/supportcenter/portal?js_peid=P-114a7ba5fd7-10001&eventSubmit_doGoviewsolutiondetails&solutionid=sk35623
 [3]: https://www.checkpoint.com/defense/advisories/public/2007/sbp-16-Aug.html
 [4]: https://supportcenter.checkpoint.com/supportcenter/portal?eventSubmit_doGoviewsolutiondetails=&solutionid=sk44175
 [5]: http://kb.juniper.net/InfoCenter/index?page=content&id=JSA10403
 [6]: http://kb.juniper.net/InfoCenter/index?page=content&id=KB12064
 [7]: http://www.rtpro.yamaha.co.jp/RT/docs/nat-descriptor/nat-abstruct.html
 [8]: http://www.cisco.com/c/en/us/support/docs/csa/cisco-sa-20080708-dns.html
 [9]: https://tools.cisco.com/bugsearch/bug/CSCsr28008
 [10]: https://tools.cisco.com/bugsearch/bug/CSCsr29691
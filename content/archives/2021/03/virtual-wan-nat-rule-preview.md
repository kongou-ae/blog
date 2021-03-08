---
title: Virtual WAN の NAT Rules を 利用して、オンプレミスと Azure 間で送信元アドレス変換を実現する
author: kongou_ae
date: 2021-03-08
url: /archives/2021/03/virtual-wan-nat-rule-preview
categories:
  - azure
  - network
---

## はじめに

Azure のドキュメントの差分を確認していたところ、[Configure NAT Rules for your Virtual WAN VPN gateway - Preview](https://docs.microsoft.com/en-us/azure/virtual-wan/nat-rules-vpn-gateway) というドキュメントを見つけました。「Virtual WAN が NAT をサポートした」というリリースは更新情報に流れていないはずです。アナウンスを探してみたところ、Ignite に合わせて Video Hub に公開された次の動画の中で発表されていました。Route Server と同じくらい凄い機能なのだから、更新情報に流してくれたらいいのに・・・

- [Simplify networking & remote user connectivity with Azure Virtual WAN](https://youtu.be/nP5XntjA7OQ?t=810)
- [Hybrid Connectivity](https://youtu.be/B_liVbePmAw?t=195)

マネージドな NAT といえば、ネットワーク屋さんにとって Router server と同じくらい欲しい機能です。というわけで早速試しました。

## 環境

今回の環境は次の通りです。

- Azure
  - VNet のアドレス空間：10.0.0.0/16
    - VNet 内のテストサーバの IP：10.0.0.4/24
  - SNAT 後の VNet のアドレス空間：10.3.0.0/24
  - Virtual WAN のアドレス空間：10.1.0.0/24
    - VPN Gateway#1 の BGP IP：10.1.0.12
    - VPN Gateway#2 の BGP IP：10.1.0.13
- オンプレミス
  - アドレス空間：192.168.0.0/24
  - SNAT 後のアドレス空間：10.2.0.0/24
  - FW & BGP ルータ（FortiGate）のループバックアドレス：191.168.1.10/32
  - AS 番号：65147

## Firewall の設定

次の設定で FortiGate を Virtual WAN に接続します。Virtual WAN は標準で VPN Gateway が Active/Active なので、非対称ルーティングにならないように #2 側の VPN Gateway に対して AS-PATH を多めに積んで経路を広報します。こうすることで、受信送信ともに #1 側の VPN Gateway が利用されます。本当は受信する経路に対しても Local preference を利用して明示的に重みづけをすべきですが、ルータID が小さい #1 側 VPN Gateway から受信した経路がベストパスになるので今回は明示的に設定しません。

```
# BGP 用のループバック
config system interface
    edit "loopback"
        set vdom "root"
        set ip 192.168.1.10 255.255.255.255
        set allowaccess ping
        set type loopback
    next
end

# VPN Gateway の BGP IP 向けのスタティックルートと経路を広報するためのブラックホールルート
config router static
    edit 1
        set dst 10.1.0.12 255.255.255.255
        set device "azure1"
    next
    edit 2
        set dst 10.1.0.13 255.255.255.255
        set device "azure2"
    next
    edit 3
        set dst 10.2.0.0 255.255.255.0
        set blackhole enable
    next
    edit 5
        set dst 192.168.0.0 255.255.255.0
        set blackhole enable
    next
end

# 余計な経路を広報しないためのフィルタで使うリスト
config router prefix-list
    edit "onpremise"
        config rule
            edit 1
                set prefix 192.168.0.0 255.255.255.0
                unset ge
                unset le
            next
            edit 2
                set prefix 10.2.0.0 255.255.255.0
                unset ge
                unset le
            next
        end
    next
end

# AS-PATH を積むためのルートマップ
config router route-map
    edit "out-active"
        config rule
            edit 1
                set set-aspath "65147"
            next
        end
    next
    edit "out-standby"
        config rule
            edit 1
                set set-aspath "65147 65147"
            next
        end
    next
end

# BGP の設定
config router bgp
    set as 65147
    set router-id 192.168.1.10
    config neighbor
        edit "10.1.0.12"
            set ebgp-enforce-multihop enable
            set soft-reconfiguration enable
            set prefix-list-out "onpremise"
            set remote-as 65515
            set route-map-out "out-active"
            set update-source "loopback"
        next
        edit "10.1.0.13"
            set ebgp-enforce-multihop enable
            set prefix-list-out "onpremise"
            set remote-as 65515
            set route-map-out "out-standby"
            set update-source "loopback"
        next
    end
    config network
        edit 1
            set prefix 192.168.0.0 255.255.255.0
        next
    end
end

```

## Ingress SNAT の設定

まずは Ingress SNAT を試します。Ingress SNAT とは、オンプレミスから Azure に入ってくる通信に対する送信元 NAT です。設定は次の通りです。192.168.0.0/24 を 10.2.0.0/24 に変換します。Azure 側から見るとオンプレミスが 10.2.0.0/24に見えます。上記の動画では１対多（Dynamic）の NAT もサポートするような記載があるのですが、3/8現在設定できるのは 1対1（Static）な NAT のみでした。

{{< figure src="/images/2021/2021-0308-001.png" title="Ingress な SNAT の設定" >}}

ただし、この設定だけでは通信できません。戻りの通信で必要となる 10.2.0.0/24 のルーティングが Azure 側のルートテーブルに存在しないためです。

{{< figure src="/images/2021/2021-0308-002.png" title="Ingress な SNAT を設定した直後のルーティング" >}}

そこでオンプレミス側の Firewall が BGP で広報するアドレスを NAT 後のアドレス（10.2.0.0/24）に変更します。

```bash
vwanfg # get router info bgp neighbors 10.1.0.12 advertised-route

   Network          Next Hop            Metric LocPrf Weight RouteTag Path
*> 10.2.0.0/24      192.168.1.10                  100  32768        0 65147 i <-/->

Total number of prefixes 1

vwanfg # get router info bgp neighbors 10.1.0.13 advertised-route

   Network          Next Hop            Metric LocPrf Weight RouteTag Path
*> 10.2.0.0/24      192.168.1.10                  100  32768        0 65147 65147 i <-/->

Total number of prefixes 1
```

当然、Hub と VNet のルートテーブルを見ると、VPN Gateway の先にいるアドレスが 10.2.0.0/24 に変わります。

{{< figure src="/images/2021/2021-0308-003.png" title="広報するアドレスを変えた後の Hub ルートテーブル" >}}

{{< figure src="/images/2021/2021-0308-004.png" title="広報するアドレスを変えた後の VNet ルートテーブル" >}}

## Ingress SNAT の動作確認

では、オンプレミス側の Firewall の LAN 側アドレス（192.168.0.4）から Azure 内のテストサーバ（10.0.0.4）に SSH で接続してみます。オンプレミス側のアドレスを送信元 NAT しただけですので、テストサーバの実アドレスである 10.0.0.4 でアクセスできます。

```bash
vwanfg # execute ssh user01@10.0.0.4
Warning: Permanently added '10.0.0.4' (ED25519) to the list of known hosts.
user01@10.0.0.4's password: 
Welcome to Ubuntu 18.04.5 LTS (GNU/Linux 5.4.0-1039-azure x86_64)
```

ただし、オンプレミス側のアドレスが途中の VPN Gateway で送信元 NAT されていますので、テストサーバから見ると送信元 NAT 後の 10.2.0.4 が接続しているように見えます。

```bash
aimless@test01:~$ who
aimless  pts/0        2021-03-08 12:32 (10.2.0.4)
```



## Egress SNAT の設定

次に Egress SNAT を試します。Egress SNAT は Azure からオンプレミスに向かう通信に対する送信元 NAT です。設定は次の通りです。10.0.0.0/24 を 10.3.0.0/24 に送信元 NAT します。オンプレミスから見ると Azure が 10.3.0.0/24 に見えます。

{{< figure src="/images/2021/2021-0308-005.png" title="Egress な SNAT の設定" >}}

ただしこの設定だけでは通信できません。Egress SNAT の設定をしても、VPN Gateway が NAT 後の 10.3.0.0/24 のアドレスをオンプレミス側の Firewall に広報してくれないためです。次の通り、戻りの通信に必要となるルーティングがオンプレミス側の Firewall に存在しません。

```bash
vwanfg # get router info bgp neighbors 10.1.0.12 routes

   Network          Next Hop            Metric LocPrf Weight RouteTag Path
*> 10.0.0.0/16      10.1.0.12                0             0        0 65515 i <-/1>
*> 10.1.0.0/24      10.1.0.12                0             0        0 65515 i <-/1>

Total number of prefixes 2

vwanfg # get router info bgp neighbors 10.1.0.13 routes

   Network          Next Hop            Metric LocPrf Weight RouteTag Path
*  10.0.0.0/16      10.1.0.13                0             0        0 65515 i <-/->
*  10.1.0.0/24      10.1.0.13                0             0        0 65515 i <-/->

Total number of prefixes 2
```

そこで、Hub のルートテーブルに手動で 10.3.0.0/24 のルーティングを追加して、VPN Gateway がオンプレミス側の Firewall に対して 10.3.0.0/24 を広報してくれるようにします。

{{< figure src="/images/2021/2021-0308-006.png" title="追加後の Hub のルートテーブルの状態" >}}

すると、オンプレミス側の Firewall に戻りの通信に必要な 10.3.0.0/24が注入されます。なお、Egress SNAT を設定しても、つぎのとおり VPN Gateway は NAT 前のアドレスの広報をやめないようです。本当はオンプレ側の Firewall で受信する経路をフィルタすべきですが、今回は割愛します

```bash
vwanfg # get router info bgp neighbors 10.1.0.13 routes

   Network          Next Hop            Metric LocPrf Weight RouteTag Path
*  10.0.0.0/16      10.1.0.13                0             0        0 65515 i <-/->
*  10.1.0.0/24      10.1.0.13                0             0        0 65515 i <-/->
*  10.3.0.0/24      10.1.0.13                0             0        0 65515 i <-/->

Total number of prefixes 3

vwanfg # get router info bgp neighbors 10.1.0.12 routes

   Network          Next Hop            Metric LocPrf Weight RouteTag Path
*> 10.0.0.0/16      10.1.0.12                0             0        0 65515 i <-/1>
*> 10.1.0.0/24      10.1.0.12                0             0        0 65515 i <-/1>
*> 10.3.0.0/24      10.1.0.12                0             0        0 65515 i <-/1>

Total number of prefixes 3
```

## Egress SNAT の動作確認

では、Azure 側のテストサーバ（10.0.0.4）からオンプレミス側の Firewall の LAN 側アドレス（192.168.0.4）に SSH で接続してみます。NAT されるのは送信元 IP アドレスですので、宛先は実 IP である 192.168.0.4 で OK です。オンプレミス側の Firewall で SSH のセッションを見てみると、次のとおり SSH 接続の送信元 IP アドレスが 実 IP アドレス（10.0.0.4）ではなく NAT 後の 10.3.0.4 になっています。

```bash
vwanfg # get system session list 
PROTO   EXPIRE SOURCE           SOURCE-NAT       DESTINATION      DESTINATION-NAT 
tcp     3600   10.3.0.4:56712   -                192.168.0.4:22   -               
```

## 注意事項

NAT ルールの設定に約10分ほどかかります。どうして Virtual WAN 関係はデプロイに時間がかかるのか・・・

NAT ルールを設定した際に IPsec トンネルが2本ともダウンしました。仕様かどうかは不明です。

NAT ルールを紐づけられる VPN Site は、VpnSiteLinks が設定されているものだけです。例えば、私が ARM テンプレートから作った VPN Site には次の通り VpnSiteLinks が設定されていなかったため、NAT ルールを有効化できませんでした。

```powershell
# ARM テンプレートで作成した VPN Site
ResourceGroupName : wan0307
Name              : demoOnpre01
Id                : /subscriptions/9c171efd-eab4-xxxx-xxxx-xxxxxxxxxxxx/resourceGroups/wan0307/providers/Microsoft.Network/vpnSites/demoOnpre01
Location          : japaneast
IpAddress         : 20.48.64.145
VirtualWan        : /subscriptions/9c171efd-eab4-xxxx-xxxx-xxxxxxxxxxxx/resourceGroups/wan0307/providers/Microsoft.Network/virtualWans/vwan
AddressSpace      : 192.168.0.0/24
BgpSettings       : Microsoft.Azure.Commands.Network.Models.PSBgpSettings
Type              : Microsoft.Network/vpnSites
ProvisioningState : Succeeded
VpnSiteLinks      : {} # VpnSIteLinks が空。NAT ルールを適用できない

# ポータルから作成した VPN Site
ResourceGroupName : wan0307
Name              : onpreRouter01
Id                : /subscriptions/9c171efd-eab4-xxxx-xxxx-xxxxxxxxxxxx/resourceGroups/wan0307/providers/Microsoft.Network/vpnSites/onpreRouter01
Location          : japaneast
IpAddress         :
VirtualWan        : /subscriptions/9c171efd-eab4-xxxx-xxxx-xxxxxxxxxxxx/resourceGroups/wan0307/providers/Microsoft.Network/virtualWans/vwan
AddressSpace      : 192.168.1.10/32
BgpSettings       :
Type              : Microsoft.Network/vpnSites
ProvisioningState : Succeeded
VpnSiteLinks      : {link01} # VpnSIteLinks が空ではない。NAT ルールを適用できる
```

Ingress SNAT を設定すると Egress DNAT が自動的に有効になります。上記の Ingress SNAT が有効な場合、Azure からオンプレミスに接続する際にも実 IP アドレスの 192.168.0.4 ではなく NAT で利用する 10.2.0.4 にアクセスする必要があります。

また、Egress SNAT を設定すると Ingress DNAT が自動的に有効になります。上記の Egress SNAT が有効な場合、オンプレミスから Azure に接続する際にも実 IP アドレスの 10.0.0.4 ではなく NAT で利用する 10.3.0.4 にアクセスする必要があります。

## 終わりに

ひっそりとプレビューが始まった NAT ルールを試しました。これまでどうしても Azure とオンプレミス間の通信を NAT しなければならない場合には NAT 箱として小さめの Linux サーバやネットワーク仮想アプライアンスをデプロイしてきました。ただしこれらのアプローチは運用対象が増える、さらに冗長化しにくいといった課題がありました。マネージドな VPN Gateway が NAT をサポートしてくれれば、オンプレミスと Azure 間におけるアドレス重複の課題をマネージドな仕組みだけで解決できるようになります。素晴らしい。早く GA になーれ。また、普通の VPN Gateway にも NAT ルールが来てくれるともっと素晴らしい。

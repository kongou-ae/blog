---
title: PaloAlto on Azure を Active/Passive 構成で導入する
author: kongou_ae
date: 2019-03-27
url: /archives/2019/03/deploy-paloalto-on-azure-as-active-passive
categories:
  - azure
  - network
---

## はじめに

PaloAlto が 9.0 で Azure での Active/Passive 方式の冗長化をサポートしました。実装は[仮想マシンのIPアドレスを付け替える方式](https://aimless.jp/blog/archives/2019-03-21-public-cloud-and-nva/#3-ip%E3%82%A2%E3%83%89%E3%83%AC%E3%82%B9%E3%82%92%E4%BB%98%E3%81%91%E6%9B%BF%E3%81%88%E3%82%8B)です。

[Set up Active/Passive HA on Azure](https://docs.paloaltonetworks.com/vm-series/9-0/vm-series-deployment/set-up-the-vm-series-firewall-on-azure/configure-activepassive-ha-for-vm-series-firewall-on-azure.html)

Active/Passive 方式で冗長化された NVA は、オンプレミスのネットワークエンジニアのとって慣れ親しんだ構成です。これまで IP アドレス付け替え方式の冗長構成を組んだことがなかったので、実際に試してみました

## 1. サービスプリンシパルを作る

PaloAlto の IP アドレス付け替えは、PaloAlto 自身の HA 機能によって実現されます。そのため、PaloAlto 自体に Azure を操作するための資格情報である Service Principle を登録する必要があります。

Azure CLI で次のようなコマンドを実行して、Service Principle をサクッと作ります。

```bash
~$ az ad sp create-for-rbac --name palo
```

## 2. 1台目の PaloAlto をデプロイする

まずは1台の PaloAlto をデプロイします。マーケットプレイスからデプロイするのが簡単です。NIC を4本接続しなければならないので、ある程度大きめのインスタンスが必要です。

デプロイ後の仮想マシンは、3本の NIC を持っています。PaloAlto からみると、1本目が管理用の NICに、2本目と3本目がサーバの通信を制御する NIC になります。

デプロイ直後の下図の通りです。このタイミングで^_^動作確認用の Virtual Machine も作っておきました。

{{< figure src="/images/2019-03-24-005.png" title="デプロイ直後の構成" >}}

## 3. NIC に仮想 IP アドレスとなる Secondary IP を付与する

デプロイ直後の NIC には、Azure が DHCP で割り当てた IP アドレスのみが割り当てられています。1号機の NIC に2台で共有する仮想 IP アドレス を Secondary IP として割り当てます。Secondary IP を割り当てるのは、サーバの通信を制御する2本目と3本目の NIC 今回は第4オクテットが100の IP アドレスを仮想 IP アドレスとして利用します。

{{< figure src="/images/2019-03-24-002.png" title="Secondary IP の設定画面" >}}

## 4. HA ポート用の NIC を足す

マーケットプレイスからデプロイする PaloAlto はシングル構成で導入されることを想定しているため、1台目の仮想マシンには HA 用の NIC が搭載されません。VNet に HA 用のサブネットを新設したうえで、そのサブネットに接続する NIC を追加します。

## 5. UDR を設定する

デフォルトの ルートテーブル のままだと、サーバが発信した通信とサーバに戻る通信が PaloAlto を経由しません。通信を PaloAlto 経由にするために、PaloAlto で通信を制御したいサブネットに UDR を適用します。そして UDR に対して、PaloAlto 経由で通信したいサブネットのルーティングを追加します。設定するルーティングのネクストホップは、NIC に割り当てた Secondary IP です。

Azure 上の設定はこれで完了です。ここまでの設定によって、Azure 上には次にような環境が出来上がっています。

{{< figure src="/images/2019-03-24-007.png" title="Secondary IP ＋ NIC ＋ UDR後の構成" >}}

## 6. PaloAlto を設定する

Azure 側の設定が済んだの、PaloAlto を設定していきます。

### 1. NIC を設定する

**通信制御用の NIC**

デプロイ直後の通信制御用 NIC には OS 側で IP アドレスが振られていませんので、OS 側でも NIC に IP アドレスを振ります。ポイントは、Azure 側の NIC で仮想 IP として割り当てた Secondary IP のみを、サブネットと一致するサブネットマスクで設定する箇所です。Azure 側の NIC で Primary IP として割り当てられた IP アドレスは /32 の IP アドレスで設定します。OS に対して、Secondary IP こそが 自分の使うべき IPアドレスだと認識させるわけですね。

{{< figure src="/images/2019-03-24-003.png" title="NIC の設定画面" >}}

**HA 用の NIC**

HA ポートして使うために増設した NIC に該当する Eth1/3 を、OS 上で HA ポートに設定します。

### 2. ルーティングとポリシーを書く

UDR で制御できるのは、Virtual Machine が発信したパケットをどこにとどけるかです。UDR によって受信したパケットを、複数 の NIC を持つ NVA がどの NIC から発信するかは、Azure 上の設定ではなく OS 上のルーティングテーブルで制御します。

10.4.3.0/24 のサブネットに「10.4.4.0/24 宛てのパケットを 10.4.1.4 に転送しろ」という UDR を適用したので、PaloAlto は 10.4.3.0/24 からのパケットを 10.4.1.4 の NIC で受信します。PaloAlto はステートフルファイアウォールとして動作するため、10.4.1.4 で受信したパケットの戻りを 10.4.1.4 から出す必要があります。そのために、OS 上のルーティングテーブルには、「10.4.3.0/24 宛てのパケットは Eth1/1 の先にいる 10.4.1.1（サブネットのデフォルトゲートウェイ）に転送しろ」というスタティックルートを設定します。同様の理由から、「10.4.4.0/24 は Ethe1/2 の先にいる 10.4.2.1 に転送しろ」というスタティックルートが必要です。

最後に、Virtual Machine 同士の通信を PaloAlto が許可するように、PaloAlto にポリシーを設定します。

## 7. 疎通確認

UDR と OS 上のルーティング、ポリシーのすべてが整うと、2台の Virtual Machine が PaloAlto を経由して通信できるようになります。例えば、10.4.3.4 の Virtual Machine が 10.4.4.4 のVirtual Machine に通信すると、次のような段取りでパケットがルーティングされます。

**行きの通信**

1. 10.4.3.4 の Virtual Machine が 10.4.4.4 宛てのパケットを発信する
2. Azure は、10.4.3.0/24 のサブネットに適用されている UDR に従って、10.4.4.4 宛てのパケットを 10.4.1.100(NVA) に転送する
3. NVA は 10.4.3.3 からのパケットを Eth1/1 で受信する。NVA には 「10.4.3.0/24 宛てのパケットは Eth1/1 の先にいる 10.4.1.1 に転送しろ」というスタティックルートが書いてあるため、正しい NIC からパケットを受信したと判断して次の処理に進む
4. NVA は、「10.4.4.0/24 宛てのパケットを Eth1/2 の先にいる 10.4.2.1 に転送しろ」というスタティックルートに従って、10.4.4.4 宛てのパケットを Eth1/2 の先にいる 10.4.2.1 に転送する
5. Azure は、10.4.2.0/24 のサブネットに適用されているシステムルートに従って、NVA が転送した 10.4.4.4 宛てのパケットを 10.4.4.4 の Virtual Machine に転送する
6. 10.4.4.4 の Virtual Machine が 10.4.4.4 宛てのパケットを受信する

**戻りの通信**

1. 10.4.4.4 の Virtual Machine が 10.4.3.4 宛てのパケットを発信する
2. Azure は、10.4.4.0/24 のサブネットに適用されている UDR に従って 10.4.3.4 宛てのパケットを 10.4.2.100(NVA) に転送する
3. NVA は 10.4.4.4 からのパケットを Eth1/2 で受信する。NVA には 「10.4.4.0/24 宛てのパケットは Ethe1/2 の先にいる 10.4.2.1 に転送しろ」というスタティックルートが書いてあるため、正しい NIC からパケットを受信したと判断して次の処理に進む
4. NVA は、「10.4.3.0/24 宛てのパケットを Eth1/1 の先にいる 10.4.1.1 に転送しろ」というスタティックルートに従って、10.4.3.4 宛てのパケットを Eth1/1 の先にいる 10.4.1.1 に転送する
5. Azure は、10.4.1.0/24 のサブネットに適用されているシステムルートに従って、NVA が転送した 10.4.3.4 宛てのパケットを 10.4.3.4 の Virtual Machine に転送する
6. 10.4.3.4 の Virtual Machine が 10.4.3.4 宛てのパケットを受信する

## 8. 冗長化の設定を追加する

２号機をデプロイする前に、１号機に冗長化の設定を入れておきます。2019年3月現在、マーケットプレイスで公開されている PaloAlto のバージョンは 8.x 系のみです。冗長化の設定を追加するために、Active/Passive の機能をサポートする9.0系にアップデートします。8.1系をデプロイすれば、直接9.0にアップデートできます。

```powershell
PS Azure:\> Get-AzureRmVMImage -Location japaneast -PublisherName paloaltonetworks -Offer vmseries1 -skus bundle1 | select-object Version,Skus,Offer,Publishername

Version Skus    Offer     PublisherName
------- ----    -----     -------------
7.1.1   bundle1 vmseries1 paloaltonetworks
8.0.0   bundle1 vmseries1 paloaltonetworks
8.1.0   bundle1 vmseries1 paloaltonetworks
```

{{< figure src="/images/2019-03-24-001.png" title="アップデートの画面" >}}

そして、障害時の切り替えで PaloAlto 自身が Azure を操作するための資格情報であるサービスプリンシパルを設定します。設定画面にサービスプリンシパルを利用して Azure にアクセスできるかをテストするボタンが用意されている親切設計です。

{{< figure src="/images/2019-03-24-009.png" title="サービスプリンシパルの設定画面" >}}

最後に、HA の設定を追加します。左上の HA のピアには、相手の mgmt ポートのIPアドレスを設定します。右下のセッション同期で利用するデータリンクには、増設した 自分の HA ポートの情報を設定します。

{{< figure src="/images/2019-03-24-010.png" title="HA の設定画面" >}}

## 9. 2台目の PaloAlto をデプロイする

シングル構成が整ったので2台目を用意します。まずは、2台目の PaloAlto を公式が用意している [ARM Template](https://github.com/PaloAltoNetworks/Azure-HA-Deployment) でデプロイします。2台目を ARM Template でデプロイする理由は、Marketplace からだと既存の Virtual Network に 2台目をデプロイできないからです。

なお、2台目用のテンプレートは BYOL のイメージを使って PaloAlto を起動します。PAYG なイメージを使いたい場合は、テンプレート内の `imageSku` を `bundle1` または `bundle2` に変更する必要があります。

```json
  "variables": {
    "imagePublisher": "paloaltonetworks",
    "imageSku" : "byol",
    "imageOffer" : "vmseries1",
```

```powershell
PS Azure:\> Get-AzureRmVMImagesku -Location japaneast -PublisherName paloaltonetworks -Offer vmseries1 | Select-Object Skus,Offer,publishername,Location

Skus    Offer     PublisherName    Location
----    -----     -------------    --------
bundle1 vmseries1 paloaltonetworks japaneast
bundle2 vmseries1 paloaltonetworks japaneast
byol    vmseries1 paloaltonetworks japaneast
```

デプロイが済んだら、1号機と同じように次の作業を行います。

- HA 用の NIC を増設する
- NIC を設定する
- 冗長化の設定を追加する

作業後は次のような構成になります。

{{< figure src="/images/2019-03-24-011.png" title="最終構成" >}}

## 10. 動作確認

1号機と2号機の設定が正しければ、冗長化のステータス画面がActiveとPassiveになります。左側が1号機、右側が2号機です。

{{< figure src="/images/2019-03-24-012.png" title="HA の状態" >}}

セッション同期を有効にすると、1号機を通過したセッションの情報が2号機にも同期されます。左側が1号機、右側が2号機です。10.4.3.4 の Virtual Machine から 10.4.4.4 の Virtual Machine に SSH した状態で1号機を停止して系を切り替えても、SSH が切断されることはありませんでした。セッション同期はうまく動いているようです。

{{< figure src="/images/2019-03-24-012.png" title="セッション維持" >}}

最後に、仮想マシンの再起動によって系が切り替わったときの通信断時間を計測しました。測定方法は、10.4.3.4 の Virtual Machine から 10.4.4.4 の Virtual Machine に Ping を打ち続けた状態で系を切り替えた際に何発の Ping が欠けたかです。結果は次の通りです。オンプレの通信断時間と比較すると断時間が長く、また揺らぎました。

- 1回目：134秒
- 2回目：112秒
- 3回目：80秒
- 4回目：172秒

謎です。系を切り替える際には、相方の障害を検知する → API をたたいて仮想アドレスを削除 → APIをたたいて仮想アドレス という作業を裏でやっているので、ある程度の時間がかかるのは想定内です。ただし、数分もかかることが正しいのかが判断できません。もし、本番環境に導入することがあったら、なぜこの時間がかかるのかを改めて調べようと思います。

## おわりに

PaloAlto on Azure が 9.0 系でサポートした Active/Passive 方式の HA を実際に試してみました。今回は PaloAlto が通信を制御するサブネットを最小限にしたため、すんなりと PaloAlto を Active/Passive 構成で導入して通信を制御できました。切り替わり時の通信断時間がオンプレミスと比較すると長いように感じますが、API をたたいて切り替える方式である以上、オンプレミスのように Ping 数発かけるだけという切り替えは不可能だと思います。

ステートフルな NVA を Azure 上に導入するうえで、 Active/Passive 形式の冗長化方式は必要不可欠です。また一つ Azure Native な Active/Passive 形式の冗長化をサポートする NVA が増えたことを嬉しく思います。

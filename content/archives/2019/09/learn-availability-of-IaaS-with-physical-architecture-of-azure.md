---
title: Azure の物理構成と IaaS の可用性
author: kongou_ae
date: 2019-09-07
url: /archives/2019/09/learn-availability-of-IaaS-and-physical-architecture-of-azure
categories:
  - azure
---

## はじめに

自分の頭の整理をかねて、Azure の物理構成と IaaS の可用性を向上するための仕組みをまとめます。本エントリでは次の内容に触れます。

- ジオ
- リージョン
- ゾーン
- スケールユニット・クラスタ
- 障害ドメイン
- 更新ドメイン
- 可用性セット
- 可用性ゾーン
- ローカル冗長ストレージ (LRS)
- ゾーン冗長ストレージ (ZRS)
- ジオ冗長ストレージ (GRS)
- ジオゾーン冗長ストレージ (GZRS) 

なお、自分のリファレンスを兼ねているので、日本語公式ドキュメントからの引用が多めです。

## 物理構成

### ジオ

ジオとは、Azure のサービスを利用できる地域の総称です。Azure は複数のジオで構成されています。

{{< figure src="/images/2019-09-07-002.png" title="ジオのイメージ" >}}

次の URL でジオの一覧を確認できます。

[https://docs.microsoft.com/ja-jp/azure/best-practices-availability-paired-regions](https://docs.microsoft.com/ja-jp/azure/best-practices-availability-paired-regions?WT.mc_id=AZ-MVP-5003408)

### リージョン

1つのジオには、1つ以上のデータセンタが存在しています。データセンタの存在する地域のことをリージョンと呼びます。

[https://docs.microsoft.com/ja-jp/azure/virtual-machines/windows/regions#what-are-azure-regions](https://docs.microsoft.com/ja-jp/azure/virtual-machines/windows/regions#what-are-azure-regions?WT.mc_id=AZ-MVP-5003408)

{{< figure src="/images/2019-09-07-003.png" title="リージョンのイメージ" >}}

1つのジオの中に複数のリージョンが存在する場合、それらのリージョンはペアリージョンとして構成されます。例えば日本というジオでは、東日本リージョンと西日本リージョンがペアリージョンとして構成されています。

ペアリージョンは同時にメンテナンスされません。また、ペアリージョンが同時に障害の影響を受けた場合、いずれかのリージョンが優先的に復旧されます。

> リージョンのペアの間で、Azure はプラットフォームの更新をシリアル化し (計画メンテナンス)、一度に 1 つのペアになったリージョンだけが更新されるようにします。 障害のイベントが複数のリージョンに影響を与える場合、各ペアの少なくとも 1 つのリージョンが優先的に復旧されます。

[https://docs.microsoft.com/ja-jp/azure/best-practices-availability-paired-regions#what-are-paired-regions](https://docs.microsoft.com/ja-jp/azure/best-practices-availability-paired-regions#what-are-paired-regions?WT.mc_id=AZ-MVP-5003408)

### ゾーン

１つのリージョンは１つ以上のデータセンタで構成されています。複数のデータセンタが存在するリージョンには、ゾーンが存在する場合があります。

{{< figure src="/images/2019-09-07-004.png" title="ゾーンのイメージ" >}}

ゾーンの特徴は次の通りです。

> それぞれのゾーンは、独立した電源、冷却手段、ネットワークを備えた 1 つまたは複数のデータセンターで構成されています。 回復性を確保するため、有効になっているリージョンにはいずれも最低 3 つのゾーンが別個に存在しています。 

[https://docs.microsoft.com/ja-jp/azure/availability-zones/az-overview](https://docs.microsoft.com/ja-jp/azure/availability-zones/az-overview?WT.mc_id=AZ-MVP-5003408)

『１つまたは複数のデータセンタ』と書かれていますので、ゾーンを構成するデータセンタが１つの場合もあるのでしょう。

1つのゾーンは最低1つのデータセンタで構成され、ゾーンの個数は最低3つ必要ですので、リージョンがゾーンをサポートするためには最低３個のデータセンタが必要です。そのため、現時点でゾーンが存在するリージョンは限られています。たとえば東日本リージョンはゾーンがありますが、西日本リージョンにはありません。

ゾーンは設備だけでなくメンテナンスのタイミングでも独立しています。1つのリージョン内の複数のゾーンが同じタイミングでメンテナンスされることはありません。

> Azure プラットフォームは更新ドメインへのこの分散を認識し、異なるゾーン内の VM が同時に更新されないようにします。

[https://docs.microsoft.com/ja-jp/azure/availability-zones/az-overview](https://docs.microsoft.com/ja-jp/azure/availability-zones/az-overview?WT.mc_id=AZ-MVP-5003408)

> Azure では、リージョン内で 1 度に 1 つのゾーンで重要なメンテナンスが実行されます。これは、何らかの障害が発生した場合でも、リージョン内の可用性ゾーン全体にデプロイされたお客様のリソースに影響が及ばないようにするためです。

[https://docs.microsoft.com/ja-jp/azure/availability-zones/az-overview](https://docs.microsoft.com/ja-jp/azure/availability-zones/az-overview?WT.mc_id=AZ-MVP-5003408)

### スケールユニットまたはクラスタ

データセンタの中には、リソースを提供するシステムの塊が存在します。この塊をスケールユニットまたはクラスタと呼びます。仮想マシンが動作するスケールユニットとストレージが動作するスケールユニットは分かれています。

{{< figure src="/images/2019-09-07-005.png" title="スケールユニットのイメージ" >}}

### 障害ドメイン

スケールユニット内の設備は、電源とネットワークを共有する塊に分かれています。この塊を障害ドメイン（Fault Domain）といいます。

{{< figure src="/images/2019-09-07-006.png" title="障害ドメイン" >}}

> 障害ドメインは電源とネットワーク スイッチを共有する仮想マシンのグループを定義します。

[https://docs.microsoft.com/ja-jp/azure/virtual-machines/windows/manage-availability#configure-multiple-virtual-machines-in-an-availability-set-for-redundancy](https://docs.microsoft.com/ja-jp/azure/virtual-machines/windows/manage-availability#configure-multiple-virtual-machines-in-an-availability-set-for-redundancy?WT.mc_id=AZ-MVP-5003408)

スケールユニットを構成する個々のラックを障害ドメインと理解するとわかりやすいです。ただし、障害ドメインとラックは完全に一致しません。

> サーバーラックが障害ドメインと言えるでしょう。しかし、実際には障害ドメインとサーバーラックが完全に一対一対応しているわけではありません。

https://blogs.msdn.microsoft.com/dsazurejp/2011/06/29/windows-azure-12/

１つの障害ドメイン上で動作するすべての仮想マシンは、電源とネットワークスイッチを共有します。そのため、これらの仮想マシンは物理的な障害によって一斉に停止する可能性があります。

> 障害ドメインは電源とネットワーク スイッチを共有する仮想マシンのグループを定義します。 既定では、可用性セット内に構成された仮想マシンは、Resource Manager のデプロイ用に最大 3 つの障害ドメインに分けられます (クラシックの場合は 2 つの障害ドメイン)。

[https://docs.microsoft.com/ja-jp/azure/virtual-machines/windows/manage-availability#configure-multiple-virtual-machines-in-an-availability-set-for-redundancy](https://docs.microsoft.com/ja-jp/azure/virtual-machines/windows/manage-availability#configure-multiple-virtual-machines-in-an-availability-set-for-redundancy?WT.mc_id=AZ-MVP-5003408)

### 更新ドメイン

スケールユニット内の仮想マシンは、メンテナンス時に順次再起動されます。同時に再起動される仮想マシンのグループが更新ドメイン（Update Domain）です。スケールユニットを構成する物理サーバを更新ドメインと理解するとわかりやすいです。

{{< figure src="/images/2019-09-07-001.png" title="更新ドメインのイメージ" >}}

> 所定の可用性セットに対して、同時に再起動される仮想マシンのグループと物理ハードウェアを示す、ユーザーが構成できない 5 つの更新ドメインが既定で割り当てられます

[https://docs.microsoft.com/ja-jp/azure/virtual-machines/windows/manage-availability#configure-multiple-virtual-machines-in-an-availability-set-for-redundancy](https://docs.microsoft.com/ja-jp/azure/virtual-machines/windows/manage-availability#configure-multiple-virtual-machines-in-an-availability-set-for-redundancy?WT.mc_id=AZ-MVP-5003408)

冗長化している2台の仮想マシンが同一の更新ドメイン上で動作している場合、2台の仮想マシンはメンテナンスで一緒に再起動する可能性があります。

## 仮想マシンの可用性

Azure 上でシステムを構築する際は、この物理構成を理解したうえで仮想サーバを配置しなければなりません。Azure には、仮想マシンの配置先を決める複数のオプションが存在します。

### 基本的な考え方

障害や再起動を伴うメンテナンスなどによって、仮想マシンは利用できなくなります。仮想マシンが利用できなくなる影響を回避するためには、仮想マシンを複数台用意してシステム全体で冗長化する必要があります。

ただし、何も考えずに複数台の仮想マシンを用意すると、仮想マシンが物理的に同じ場所に配置されてしまい、障害やメンテナンスなどで同時に停止してしまう可能性があります。障害やメンテナンスですべての仮想マシンが停止することを避けるためには、仮想マシンを物理的に異なる場所に配置する必要があります。

### 可用性セット

仮想マシンを物理的に異なる場所に配置する1つの方法が可用性セットです。1つの可用性セットに複数の仮想マシンを入れると、これらの仮想マシンは1つのスケールユニットの中の異なる障害ドメインと更新ドメインに配置されます。

{{< figure src="/images/2019-09-07-007.png" title="可用性セットで構成された仮想マシンのイメージ" >}}

仮想マシンの障害ドメインが異なるので、これらの仮想マシンは異なるラックに配置されます。ラック単位の障害が発生してもすべての仮想マシンが止まることはありません。また仮想マシンの更新ドメインが異なるので、これらの仮想マシンは別のタイミングでメンテナンスが実施されます。メンテナンスが発生してもすべての仮想マシンが止まることはありません。

### 可用性ゾーン

可用性セットは、1つのスケールユニットの中で仮想マシンの物理的な配置を分散する方法です。そのため、1つのスケールユニットが停止してしまうと複数の仮想マシンはすべて停止します。スケールユニット単位の障害に備えるためには、複数の仮想マシンを異なるスケールユニットに配置しなければなりません。

仮想マシンを物理的に異なる場所に配置する2つ目の方法が可用性ゾーンです。可用性ゾーンを利用すると、利用者が仮想マシンの動作する動作するゾーンを指定できます。

{{< figure src="/images/2019-09-07-008.png" title="可用性ゾーンで構成された仮想マシンのイメージ" >}}

複数の仮想マシンが動作するゾーンを分散すれば、1つのスケールユニットが停止したとしても他のゾーンのスケールユニットで動作する仮想マシンは動き続けます。また、1つのデータセンタが全停止したとしても、他のゾーンのスケールユニットで動作する仮想マシンは影響を受けることなく動き続けます。

### 別リージョン

可用性ゾーンは、1つのリージョンの中で仮想マシンの物理的な配置を分散する方法です。そのため、1つのリージョンが停止してしまうと複数の仮想マシンはすべて停止します。リージョン単位の障害に備えるためには、複数の仮想マシンを異なるリージョンに配置しなければなりません。

利用者は仮想マシンを作成する際にリージョンを明示的に指定する必要があります。複数の仮想マシンの動作するリージョンを分散すれば、1つのリージョンが停止したとしても他のリージョンで動作する仮想マシンは影響を受けることなく動き続けます。

{{< figure src="/images/2019-09-07-009.png" title="リージョンを分けた仮想マシンのイメージ" >}}

## データの可用性

仮想マシンだけだなく、ストレージに保存するデータについても、この物理構成を理解したうえで保存方法を決める必要があります。Azure にはデータの保存先を決める複数のオプションが存在します。

### ローカル冗長ストレージ (LRS)

ローカル冗長ストレージ （LRS）は、1つのストレージスケールユニットの中の3箇所にデータを複製します。したがって、可用性セットと同じようにラック単位の障害や Microsoft のメンテナンスによる影響を回避できます。

{{< figure src="/images/2019-09-07-010.png" title="LRS のイメージ" >}}

> LRS では、データをストレージ スケール ユニットにレプリケートすることで、ストレージこのオブジェクトの持続性が提供されます。 ストレージ アカウントを作成したリージョンのデータセンターでは、ストレージ スケール ユニットがホストされています。 LRS ストレージ アカウントへの書き込み要求は、データがすべてのレプリカに書き込まれた後にのみ、正常に返されます。 レプリカはそれぞれ、ストレージ スケール ユニット内の異なる障害ドメインとアップグレード ドメインに存在します。

[https://docs.microsoft.com/ja-jp/azure/storage/common/storage-redundancy-lrs](https://docs.microsoft.com/ja-jp/azure/storage/common/storage-redundancy-lrs?WT.mc_id=AZ-MVP-5003408)

一方で、スケールユニットが全停止したり、スケールユニットが配置されているデータセンタが停止した場合、LRSのストレージに保存されているデータが消失する可能性があります。

> LRS は、コストが最も安いレプリケーションのオプションであり、他のオプションと比較して最低の持続性が提供されます。 データセンターレベルの障害 (火災、洪水など) が発生した場合は、レプリカすべてが失われたり、回復不能になる可能性があります。

[https://docs.microsoft.com/ja-jp/azure/storage/common/storage-redundancy-lrs](https://docs.microsoft.com/ja-jp/azure/storage/common/storage-redundancy-lrs?WT.mc_id=AZ-MVP-5003408)

### ゾーン冗長ストレージ (ZRS)

LRSのリスクを回避する手段の１つがゾーン冗長ストレージ （ZRS）です。ZRS は3つのゾーンに存在するストレージスケールユニットにデータを複製します。各ゾーン内のストレージスケールユニットに複製が１つあるので、複製の合計は LRS と同様３つです。

{{< figure src="/images/2019-09-07-011.png" title="ZRS のイメージ" >}}

> ゾーン冗長ストレージ (ZRS) は、1 つのリージョン内の 3 つのストレージ クラスターにデータを同期してレプリケートします。

[https://docs.microsoft.com/ja-jp/azure/storage/common/storage-redundancy-zrs](https://docs.microsoft.com/ja-jp/azure/storage/common/storage-redundancy-zrs?WT.mc_id=AZ-MVP-5003408)

ゾーンにまたがってデータが複製されているので、可用性ゾーンと同じようにデータセンタ単位の障害を回避できます。一方で、リージョン全体が影響を受けるような障害や災害が発生した場合、ZRS のストレージに保存されているデータが消失する可能性があります。

### ジオ冗長ストレージ (GRS)

ZRS のリスクを回避する手段の１つがジオ冗長ストレージ （GRS）です。GRS は LRS のデータを非同期でペアリージョンのストレージスケールユニットに複製します。ペアリージョン側も LRS です。したがって複製の合計は6つです。

{{< figure src="/images/2019-09-07-013.png" title="GRS のイメージ" >}}

> GRS または RA-GRS が有効なストレージ アカウントでは、すべてのデータが最初にローカル冗長ストレージ (LRS) でレプリケートされます。 更新は、まずプライマリの場所にコミットされ、LRS を使用してレプリケートされます。 更新は、GRS を使用してセカンダリ リージョンに非同期にレプリケートされます。 データがセカンダリの場所に書き込まれると、LRS を使用してその場所内にレプリケートされます。

[https://docs.microsoft.com/ja-jp/azure/storage/common/storage-redundancy-grs#paired-regions](https://docs.microsoft.com/ja-jp/azure/storage/common/storage-redundancy-grs#paired-regions?WT.mc_id=AZ-MVP-5003408)

複数のリージョンにデータが複製されているので、リージョン単位の障害を回避できます。複数のリージョンが同時に停止するような事象が発生しない限り安心です。

そんな安心のGRSにも次の注意点があります。詳細は本エントリの趣旨から外れるため割愛です。

- リージョン間の複製が非同期であり、同期できていないデータが切り替え時に消失する可能性がある
- リージョン間の複製間隔にSLAが存在しない
- リージョンの切り替えが、Microsoft の判断によって行われる。
  - 利用者がリージョンを切り替える機能が実装予定だが、現時点では特定リージョンでプレビュー中

参考となる URL は次の通りです。

- https://azure.microsoft.com/ja-jp/support/legal/sla/storage/v1_5/
- https://blogs.msdn.microsoft.com/windowsazurej/2013/12/19/windows-azure-5/
- [https://docs.microsoft.com/ja-jp/azure/storage/common/storage-redundancy-grs#paired-regions](https://docs.microsoft.com/ja-jp/azure/storage/common/storage-redundancy-grs#paired-regions?WT.mc_id=AZ-MVP-5003408)
- [https://docs.microsoft.com/ja-jp/azure/storage/common/storage-initiate-account-failover](https://docs.microsoft.com/ja-jp/azure/storage/common/storage-initiate-account-failover?WT.mc_id=AZ-MVP-5003408)

### ジオゾーン冗長ストレージ (GZRS) 

GRS には弱点があります。それはメインリージョン側の可用性が LRS であるという点です。もし、１つのスケールユニットが停止した場合、メインリージョン側に保存されているデータにアクセスできなくなります。スケールユニット内のデータが消失した場合、上述のとおり Microsoft がリージョンの切り替えを判断するまでペアリージョンのデータを読み書きできません。

この弱点を解消するものが GZRS です。GZRS ではメインリージョン側が ZRS になっています。そのため、単一のストレージスケールユニットやデータセンターで障害が起きてもデータにアクセスし続けられますので、Microsoft によるリージョンの切り替えを待つ状況が発生しにくくなっています。

{{< figure src="/images/2019-09-07-014.png" title="GZRS のイメージ" >}}

## まとめ

Azure の物理構成と可用性を向上するための仕組みを理解したうえで、システムの要件にあわせて適切な構成を組みましょう。

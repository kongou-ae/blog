---
title: Azure Arc の Custom location を利用して疑似的なリージョンを作る
author: kongou_ae
date: 2021-04-30
url: /archives/2021/04/azure-arc-custom-location
categories:
  - azure
  - arc
---

## はじめに

特にアナウンスもなく、Azure Arc のポータルに Custom location なるものが増えていました。

{{< figure src="/images/2021/2021-0430-001.png" title="追加された Custom location" >}}

Custom location を利用すると「Azure と同じように、エンドユーザは自社のプライベートコンピュートに対してリソースをデプロイできる」とのこと。あまりにも謎なので実際に試してみました。

> Similar to Azure locations, end users within the tenant with access to Custom Locations can deploy resources there using their company's private compute.

引用：[Custom locations on top of Azure Arc enabled Kubernetes](https://docs.microsoft.com/en-us/azure/azure-arc/kubernetes/conceptual-custom-locations)

## 事前準備

2021年4月現在、Custom location の設定には Azure CLI が必要です。そして3つの拡張機能を読み込む必要があります。

```
az extension add --name connectedk8s
az extension add --name k8s-extension
az extension add --name customlocation
```

さらに Microsoft.ExtendedLocation のリソースプロバイダが必要です。

```
az provider register --namespace Microsoft.ExtendedLocation
```

最後に、Kubernetes cluster を Azure Arc に接続して、Custom location の機能を有効化します。

```
az connectedk8s connect --name aks0427Arc --resource-group arcevaleastus
az connectedk8s enable-features -n aks0427Arc -g arcevaleastus --features cluster-connect custom-locations
```

この時点で kubernetes cluster には azure-arc の namespace に複数の Pod が起動します。

{{< figure src="/images/2021/2021-0430-002.png" title="enabled kubernetes のために起動した Pod" >}}

## Custom location の作成

Custom location を利用したい Azure のサービスを kubernetes cluster に拡張機能としてインストールします。今回は Azure Arc enabled data service の拡張機能をインストールします。

```
az k8s-extension create --name arcdataservices --extension-type microsoft.arcdataservices --version "1.0.015564" --cluster-type connectedClusters -c aks0427Arc -g arcevaleastus --scope cluster --release-namespace arc --config Microsoft.CustomLocation.ServiceAccount=sa-bootstrapper
```

この時点で kubernetes cluster には arc の namespace に Pod が起動します。

{{< figure src="/images/2021/2021-0430-003.png" title="拡張機能のために起動した Pod" >}}

そして、Azure Arc enabled kubernetes のクラスタとインストールした拡張機能を指定する形で Custom location を作成します。

```
az customlocation create -n "Japan-DC01" -g arcevaleastus  --namespace arc --host-resource-id "/subscriptions/9c171efd-xxxx-xxxx-xxxx-xxxxxxxxxxx/resourceGroups/arcevaleastus/providers/Microsoft.Kubernetes/connectedClusters/aks0427Arc" --cluster-extension-ids "/subscriptions/9c171efd-xxxx-xxxx-xxxx-xxxxxxxxxxx/resourceGroups/arcevaleastus/providers/Microsoft.Kubernetes/connectedClusters/aks0427Arc/providers/Microsoft.KubernetesConfiguration/extensions/arcdataservices"
```

この作業によって、Azure Arc のポータルに Custom location が表示されます。kubernetes クラスタ上で動作する Azure Arc enabled data service を Azure 上から利用するために、kubernetes 上の namespace が疑似的なリージョンとして Azure に登録された形です。

{{< figure src="/images/2021/2021-0430-004.png" title="追加された Custom location" >}}

## Custom location を利用してリソースを作る

Data service を指定して Custom location を作成したので、Data service を作る際に Custom location を利用できるはずです。実際に試してみると、ポータルから Azure Arc enabled data service のコントローラをデプロイする際に、Custom location を選択できました。利用者から見ると、Azure のリソースをデプロイする際にリージョンを選択するのと同じ感覚で、Azure 外で動いている Kubernetes クラスタを選択できます。

{{< figure src="/images/2021/2021-0430-005.png" title="コントローラのデプロイ先" >}}

Azure ポータルでデータコントローラを作る際に Custom location を選択したので、Custom location を作る際に指定した Kubernetes クラスタの arc という namespace に Azure Arc enabled data service のコントローラがデプロイされました。

{{< figure src="/images/2021/2021-0430-006.png" title="実際にデプロイされた Pod" >}}

同様に、Azure Arc enabled SQL Managed Instance を作る際にも Custom location を選択できました。

{{< figure src="/images/2021/2021-0430-006.png" title="SQL Managed Instance のデプロイ先" >}}

データコントローラと同様、Custom location を作る際に指定した Kubernetes クラスタの arc という namespace に Azure Arc enabled SQL Managed Instance がデプロイされました。本当はクラスタの外部から SQL Managed Instance にアクセスできるようにするために サービスに External IP が割り当たらなければならないのですが、現時点では割り当たらないようです。多分不具合でしょう。

## まとめ

Custom location を試しました。Azure Arc に接続している環境に対して Azure 上の名前を付けることで、この環境を他の Azure サービスに対してリージョンのように見せる機能のようです。Azure ポータルから Custom location を指定してリソースを選択するだけで、Kubernetes クラスタにリソースができあがったのが印象的でした。「Azure の管理とサービスをすべての場所に展開する」という Azure Arc のビジョンに適した仕組みだとおもいます。

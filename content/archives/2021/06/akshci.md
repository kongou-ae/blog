---
title: AKS on Azure Stack HCI を試した
author: kongou_ae
date: 2021-06-05
url: /archives/2021/06/akshci
categories:
  - azurestackhci
---

## はじめに

Build 2021で Azure Arc enabled application services が発表されました。本サービスを利用すると Arc enabled k8s 上で Azure のアプリケーションサービスを動かせます。本サービスの対象の一つが App Service です。Arc enabled App Service のチュートリアルでは AKS on Azure を利用します。

- [Azure Arc 対応の Kubernetes クラスターを設定して、App Service、Functions、Logic Apps を実行します (プレビュー)](https://docs.microsoft.com/ja-jp/azure/app-service/manage-create-arc-environment)
- [Azure Arc で App Service アプリを作成する (プレビュー)](https://docs.microsoft.com/ja-jp/azure/app-service/quickstart-arc)

ですが、現実世界において AKS on Azure 上で Arc enabled k8s を使うことはほぼないと思います。普通の App Service をそのまま使えばいいので。「ありえないシナリオで評価しても学びが少ないなぁ・・」ということで、ありそうなシナリオであるオンプレ K8s を用意するために AKS on Azure Stack HCI(以降、AKS on HCI)を試しました。

## 環境

- Nested な Azure Stack HCI 環境(https://github.com/Azure/AzureStackHCI-EvalGuide)
  - Feature update to Microsoft server operating system, version 21H2 適用済み
  - [Azure Stack HCI のプレビューチャンネルに参加する](https://blog.aimless.jp/archives/2021/05/update-azurestackhci-to-21h2)
- Windows Admin Center 
  - Version 2103.2. Build 1.3.2105.24004

## AKS on HCI の概要

次のドキュメントで AKS on HCI の大まかな構成を確認できます。

[クラスターのコンポーネント](https://docs.microsoft.com/ja-jp/azure-stack/aks-hci/kubernetes-concepts#cluster-components)

ドキュメント内の画像の通り、AKS on HCI は AKS 自体を管理する管理クラスタとアプリケーション用のコンテナを動作させるワークロードクラスタの2つで構成されています。

## 管理クラスタの構築

まずは HCI 上の AKS 自体を管理する管理クラスタを構築します。このクラスタを構築する際に、ワークロードクラスタが利用するアドレス帯を設定します。管理クラスタを構築した後にアドレス帯を変えられないので、設計は慎重に。

参考：[Azure Stack HCI において Azure Kubernetes Service (AKS) ノードをデプロイするためのネットワークの概念](https://docs.microsoft.com/ja-jp/azure-stack/aks-hci/concepts-node-networking)

決めるべきアドレスと今回の設定値は次の通りです。

- Cloudagent IP:192.168.0.50
- Subnet prefix:192.168.0.0/24
- Gateway:192.168.0.1
- DNS servers:192.168.0.2
- Load balancer IP pool start:192.168.0.100
- Load balancer IP pool end:192.168.0.150
- Kubernetes node IP pool start:192.168.0.10
- Kubernetes node IP pool end:192.168.0.20

デプロイが成功すると、HCI 上に3つのクラスタリソースができあがります。Cloudagent IP で設定したアドレスが利用されているのが分かります。

{{< figure src="/images/2021/2021-0605-001.png" title="管理クラスタ用のリソースその1" >}}

{{< figure src="/images/2021/2021-0430-002.png" title="管理クラスタ用のリソースその2" >}}

また、起動した管理クラスタ用の仮想マシンが、先ほど設定した「Kubernetes node IP pool start」と「Load balancer IP pool start」の1つ目を利用していることが見えます。

{{< figure src="/images/2021/2021-0430-003.png" title="管理クラスタ用の IP アドレス" >}}

なお、作成された管理クラスタは自動的に Azure Arc enabled kubernetes として Azure にも登録されます。

## ワークロードクラスタの構築

管理クラスタ用ができあがると、Windows Admin Center 上からワークロードクラスタを構築できるようになります。主な設定項目は k8s のマスターノードのサイズと台数、ワーカノードのサイズと台数です。今回はマスターノード1台、ワーカノード3台の構成にします。

{{< figure src="/images/2021/2021-0430-004.png" title="ワークロードクラスタ用のサイズと台数その1" >}}

{{< figure src="/images/2021/2021-0430-005.png" title="ワークロードクラスタ用のサイズと台数その2" >}}

構築が完了すると、HCI 上に仮想マシンが出来上がります。各ノードが「Kubernetes node IP pool start」を順番に利用しているのが見て取れます。また、ワークロードクラスタ用のロードバランサ VM（my-workload-cluster-load-balancer-g0ei1-246c202a）が「Load balancer IP pool start」を順番に利用しているもの見て取れます。

```
PS C:\Users\labadmin> $cluster = Get-ClusterNode -Cluster azshciclus.azshci.local
PS C:\Users\labadmin> Get-vm -ComputerName $cluster | Select-Object -ExpandProperty NetworkAdapters | Select-Object VMName,IPAddresses | ft -auto

VMName                                                       IPAddresses
------                                                       -----------
my-workload-cluster-default-linux-nodepool-md-fvzc9-a2bb3111 {192.168.0.13, fe80::ec:ff:fe05:3}
my-workload-cluster-default-linux-nodepool-md-fxjl5-3a5e17bd {192.168.0.14, fe80::ec:ff:fe05:4}
my-workload-cluster-default-linux-nodepool-md-nbdvb-060b25a8 {192.168.0.15, fe80::ec:ff:fe05:5}
my-workload-cluster-load-balancer-g0ei1-246c202a             {192.168.0.11, 192.168.0.101, fe80::ec:ff:fe05:1}
aks-management-cluster-1-control-plane-0-3d6cfe76            {192.168.0.10, 192.168.0.100, fe80::ec:ff:fe05:0}
my-workload-cluster-control-plane-t8gl5-9a3a4780             {192.168.0.12, fe80::ec:ff:fe05:2}
```

なお、作成されたワークロードクラスタの自動的に Azure Arc enabled kubernetes として Azure にも登録されます。

## ワークロードクラスタへの接続

ワークロードクラスタの構築が完了すると、Windows Admin Center から kubeconfig をダウンロードできるようになります。拡張子が XML にも関わらず中身は YAML というおもしろ kubeconfig をダウンロードできます

{{< figure src="/images/2021/2021-0430-007.png" title="kubeconfig のダウンロード" >}}

ダウンロードした kubeconfig を見ると、ワークロードクラスタ用ロードバランサの IP アドレスが API になっています。

```
apiVersion: v1
clusters:
- cluster:
    certificate-authority-data: 
    server: https://192.168.0.101:6443
  name: my-workload-cluster
```

ダウンロードした kubeconfig をワークロードクラスタ用ロードバランサにアクセスできる端末に配置して kubectl で読み込むと、 kubectl で AKS on HCI を操作できるようになります。Windows Admin Center で指定した通り、マスターノード1台、ワーカノード3台のクラスタになっています。

```
PS C:\Users\labadmin> .\kubectl.exe get node
NAME              STATUS   ROLES                  AGE   VERSION
moc-lk0rlxypusb   Ready    <none>                 19h   v1.20.5
moc-lnsgg7oli7a   Ready    <none>                 19h   v1.20.5
moc-lnwss4jfizu   Ready    control-plane,master   19h   v1.20.5
moc-lv01ixhjvl9   Ready    <none>                 19h   v1.20.5
PS C:\Users\labadmin>
```

## アプリの実行

最後に AKS on HCI 上でお馴染みの投票アプリ（[zure-Samples/azure-voting-app-redis](https://github.com/Azure-Samples/azure-voting-app-redis)）を実行してみます。

ワークロードクラスタ用ロードバランサに新しい IP アドレス（192.168.0.103）が割り当てられて、k8s のサービスの外部 IP として利用されていることが分かります。

```
PS C:\Users\labadmin\Downloads\azure-voting-app-redis-master\azure-voting-app-redis-master> Get-vm -ComputerName $cluster | Select-Object -ExpandProperty NetworkAdapters | Select-Object VMName,IPAddresses | ft -auto

VMName                                                       IPAddresses
------                                                       -----------
my-workload-cluster-default-linux-nodepool-md-fvzc9-a2bb3111 {192.168.0.13, fe80::ec:ff:fe05:3}
my-workload-cluster-default-linux-nodepool-md-fxjl5-3a5e17bd {192.168.0.14, fe80::ec:ff:fe05:4}
my-workload-cluster-default-linux-nodepool-md-nbdvb-060b25a8 {192.168.0.15, fe80::ec:ff:fe05:5}
my-workload-cluster-load-balancer-g0ei1-246c202a             {192.168.0.11, 192.168.0.101, 192.168.0.102, 192.168.0.103...}
aks-management-cluster-1-control-plane-0-3d6cfe76            {192.168.0.10, 192.168.0.100, fe80::ec:ff:fe05:0}
my-workload-cluster-control-plane-t8gl5-9a3a4780             {192.168.0.12, fe80::ec:ff:fe05:2}
```

{{< figure src="/images/2021/2021-0430-008.png" title="投票アプリの状況" >}}


## おわりに

AKS on HCI を試しました。Windows Admin Center からポチポチするだけで Hyper-V や Failover cluster と連携して k8s クラスタができあがり 、さらに k8s クラスタが Azure Arc に登録されるという良くできた仕組みでした。もしオンプレミスに Hyper-V な仮想基盤があるならば、リプレースの時点で Azure Stack HCI OS ベースの仮想基盤にしておくと k8s への挑戦が容易になりますね。

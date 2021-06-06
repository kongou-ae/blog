---
title: App Service を AKS on Azure Stack HCI で動かす
author: kongou_ae
date: 2021-06-06
url: /archives/2021/06/appservice-on-akshci
categories:
  - azurestackhci
  - arc
---

## はじめに

本エントリは [AKS on Azure Stack HCI を試した](https://blog.aimless.jp/archives/2021/06/akshci)の続きです。前回のエントリの通り AKS on Azure Stack HCI（AKS on HCI）が完成したので、本エントリでは ASK on HCI 上で Arc enabled App Service を動かした結果をまとめます

## Application services extension のインストール

Arc enabled App Service を利用するためには、Arc enabled k8s に対して拡張機能をインストールする必要があります。ポータルから拡張機能をインストールしようとすると必要なスクリプトを生成してくれますので、これを利用するのが楽です。

{{< figure src="/images/2021/2021-0606-001.png" title="Application services extension のインストール画面その1" >}}

{{< figure src="/images/2021/2021-0606-002.png" title="Application services extension のインストール画面その2" >}}

Static IP には k8s のロードバランサが利用できる IP アドレスを入力します。今回のAKS on HCI のロードバランサは 192.168.0.100 から連番で IP アドレスを使っていきますので、未使用の 192.168.0.102 を入力します。

{{< figure src="/images/2021/2021-0606-003.png" title="Application services extension のインストール画面その3" >}}

一通りパラメータを入力すると、スクリプトが表示されますのでコピペしておきます。

{{< figure src="/images/2021/2021-0606-004.png" title="Application services extension のインストール画面その4" >}}

そしてコピペしたスクリプトを AKS on HCI にアクセスできる端末上で実行します。だたし、このスクリプトをそのまま実行したら Custom location を作成するコマンドで次のエラーがでました。今回の AKS on HCI では Azure から k8s クラスタの API サーバへの Inbound 通信ができないため、このエラーが出たと思われます。

```
PS C:\Users\labadmin> $CustomLocationId = az customlocation create -g "akshci-eu" -n "akshci-apps" --host-resource-id "/subscriptions/9c171efd-eab4-xxxx-xxxx-xxxxxxxxxxxx/resourceGroups/akshci-eu/providers/Microsoft.Kubernetes/connectedClusters/my-workload-cluster" --namespace "akshci-apps" -c $ExtensionId -l "eastus" --query id -o tsv
WARNING: Command group 'customlocation' is in preview and under development. Reference and support levels: https://aka.ms/CLI_refstatus
ERROR: Deployment failed. Correlation ID: c3e91437-76d0-4d45-8d94-3b49235ad51f. The operation to Create a Namespace: "akshci-apps", failed with the following error: "an error on the server (\"404 There are no listeners connected for the endpoint. TrackingId:bf9b2fba-df27-4652-81c1-945589f00f1c_G11, SystemTracker:sb://azgnrelay-eastus-l1.servicebus.windows.net/microsoft.kubernetes/connectedclusters/fe8772ece3e543163aefac77806e95109ae77d6f5eb70191dc9cc78afcd77ab1/1622873289932732416, Timestamp:2021-06-05T06:08:21. websocket: bad handshake\") has prevented the request from succeeding (post namespaces)"
```

これを回避するために、Custom location を作る前に Arc enabled k8s の cluster-connect を有効化します。

```
az connectedk8s enable-features --features cluster-connect -n my-workload-cluster -g akshci-eu
```

cluster-connect を有効化すると、Inbound の通信が k8s クラスタから Azure への Outbound 通信に切り替わるので、前述のエラーがでなくなります。


> クラスター接続を使用すると、ファイアウォールでインバウンド ポートを有効にしなくても、Azure Arc 対応 Kubernetes クラスターに安全に接続できます。 

引用：[クラスター接続を使用して Azure Arc 対応 Kubernetes クラスターに接続する](https://docs.microsoft.com/ja-jp/azure/azure-arc/kubernetes/cluster-connect)

なお、私の AKS on HCI の場合、cluster-connect の機能を有効化しても Custom Locations RP という Azure AD アプリケーションが k8s を操作する権限がないというエラーがでて Custom location を作れませんでした。

```
PS C:\Users\labadmin> $CustomLocationId = az customlocation create -g "akshci-eu" -n "akshci-apps" --host-resource-id "/subscriptions/9c171efd-eab4-xxxx-xxxx-xxxxxxxxxxxx/resourceGroups/akshci-eu/providers/Microsoft.Kubernetes/connectedClusters/my-workload-cluster" --namespace "akshci-apps" -c $ExtensionId -l "eastus" --query id -o tsv
WARNING: Command group 'customlocation' is in preview and under development. Reference and support levels: https://aka.ms/CLI_refstatus
ERROR: Deployment failed. Correlation ID: e177d756-7d67-4c76-8f43-521bfbfbba35. The operation to Create a Namespace: "akshci-apps", failed with the following error: "namespaces is forbidden: User \"ab13e349-f4ee-4429-beb0-458a6def8878\" cannot create resource \"namespaces\" in API group \"\" at the cluster scope"
```

これを回避するために、次のコマンドを実行して Custom Location RP に対して k8s クラスタの権限を付与しました。

```
.\kubectl.exe create clusterrolebinding admin-user-binding --clusterrole cluster-admin --user=ab13e349-f4ee-4429-beb0-458a6def8878
```

すべてのスクリプトをエラー無く実行し追えると、Arc enabled k8s 上に Pod や Service が起動されます。Static IP に設定した 192.168.0.102 が Service を外部公開するために利用されていることもわかります。

```
PS C:\Users\labadmin> .\kubectl.exe get pod -n akshci-apps
NAMESPACE     NAME                                                          READY   STATUS      RESTARTS   AGE
akshci-apps   appservice-ext-k8se-activator-b76496fdd-gpllx                 1/1     Running     0          4h27m
akshci-apps   appservice-ext-k8se-app-controller-748f5bcdf6-tmrv7           1/1     Running     0          4h27m
akshci-apps   appservice-ext-k8se-build-service-76fc77dc64-fjf22            1/1     Running     0          4h42m
akshci-apps   appservice-ext-k8se-envoy-747759d775-9zpnn                    1/1     Running     0          4h36m
akshci-apps   appservice-ext-k8se-envoy-747759d775-b4tpz                    1/1     Running     0          4h37m
akshci-apps   appservice-ext-k8se-envoy-747759d775-lh2nn                    1/1     Running     0          4h36m
akshci-apps   appservice-ext-k8se-http-scaler-7cc7bdd45c-gvfsr              1/1     Running     0          4h37m
akshci-apps   appservice-ext-k8se-img-cacher-9fd7m                          1/1     Running     0          4h42m
akshci-apps   appservice-ext-k8se-img-cacher-l2m9q                          1/1     Running     0          4h42m
akshci-apps   appservice-ext-k8se-img-cacher-n8227                          1/1     Running     0          4h42m
akshci-apps   appservice-ext-k8se-keda-metrics-apiserver-6649456bbd-pm74s   1/1     Running     0          4h42m
akshci-apps   appservice-ext-k8se-keda-operator-848b8fdf67-455b6            1/1     Running     0          4h42m
akshci-apps   appservice-ext-k8se-log-processor-4hc74                       1/1     Running     3          4h42m
akshci-apps   appservice-ext-k8se-log-processor-btwzl                       1/1     Running     12         4h42m
akshci-apps   appservice-ext-k8se-log-processor-t82zs                       1/1     Running     8          4h42m
akshci-apps   appservice-ext-k8se-log-processor-w9hqj                       1/1     Running     1          4h42m

PS C:\Users\labadmin> .\kubectl.exe get svc -A
NAMESPACE     NAME                                         TYPE           CLUSTER-IP       EXTERNAL-IP     PORT(S)                                     AGE
akshci-apps   appservice-ext-k8se-activator                ClusterIP      10.108.234.199   <none>          4045/TCP,4050/TCP,4046/TCP                  4h43m
akshci-apps   appservice-ext-k8se-app-controller           ClusterIP      10.107.222.150   <none>          9090/TCP                                    4h43m
akshci-apps   appservice-ext-k8se-build-service            ClusterIP      10.109.11.243    <none>          8181/TCP                                    4h43m
akshci-apps   appservice-ext-k8se-envoy                    LoadBalancer   10.104.252.210   192.168.0.102   80:32313/TCP,443:32240/TCP,8081:30593/TCP   4h43m
akshci-apps   appservice-ext-k8se-http-scaler              ClusterIP      10.98.137.29     <none>          4055/TCP,4050/TCP                           4h43m
akshci-apps   appservice-ext-k8se-keda-metrics-apiserver   ClusterIP      10.98.185.186    <none>          443/TCP,80/TCP                              4h43m
```

Azure 上には App Servive Kubernetes environment というリソースが出来上がります。Azure 上で実行される専用の App Service を提供する機能が App Service Environment であることを踏まえて、Kubernetes 上で実行される占有の App Service を提供する機能だから App Servive Kubernetes environment ということでしょう。きっと。

{{< figure src="/images/2021/2021-0606-005.png" title="App Service Kubernetes environment" >}}

## Apps Service の展開

App Servive Kubernetes environment ができたので、この上に Apps Service を展開します。Azure 上に Apps Service を展開する際には Location を指定しますが、Arc enabled k8s 上に Apps Service を展開する際には前述のスクリプトで作成した Custom location を指定します。

```
az webapp create --resource-group "akshci-eu" --name k8swebapp2 --custom-location $customLocationId  --runtime "NODE|12-lts"
```

そうすると Custom location として設定した Arc enabled k8s クラスタ上に Pod が起動します。

```
PS C:\Users\labadmin> .\kubectl.exe get pod -n akshci-apps
（中略）
NAMESPACE     NAME                                                          READY   STATUS      RESTARTS   AGE
akshci-apps   k8swebapp2-66b465bfbf-m7f4s                                   1/1     Running     0          4h16m
```

## App Service へのアクセス

ポータル上に作成された App Service を見ると、<App Service の名前>.<App Servive Kubernetes environment のドメイン名>の URL がついています。このドメイン名を名前解決すると Static IP で指定した 192.168.0.102 が返ってくるので、ワークロードクラスタにアクセスできる環境でこのドメイン名にアクセスすると Arc enabled k8s 上に展開された App Service の初期画面が表示されます。

```
>nslookup k8swebapp2.scm.askeonhci-wpdc4uztw7ogvz.eastus.k4apps.io

権限のない回答:
名前:    k8swebapp2.scm.askeonhci-wpdc4uztw7ogvz.eastus.k4apps.io
Address:  192.168.0.102
```

{{< figure src="/images/2021/2021-0606-006.jpg" title="プレイベート IP アドレスな Web Apps" >}}

## カスタマイズ

デプロイできたついでに、Arc enabled App Servive で利用できそうな機能（＝Azure ポータル上にメニューがある）を試してみました。

ポータルから App Service をスケールアウトしたら、AKS on HCI 上の Pod が増えました。

```
PS C:\Users\labadmin> .\kubectl.exe get pod -n akshci-apps
NAMESPACE     NAME                                                          READY   STATUS      RESTARTS   AGE
（中略）
akshci-apps   k8swebapp2-66b465bfbf-m7f4s                                   1/1     Running     0          4h16m
akshci-apps   k8swebapp2-66b465bfbf-z5x8g                                   1/1     Running     0          4h5m
```

ポータルからカスタムドメインを追加したらエラーになりましたが、Azure CLI を使えばカスタムドメインを追加できました。

```
az webapp config hostname add --hostname "webapps.akshci.aimless.jp" --webapp-name "k8swebapp2" --resource-group "akshci-eu"
```

{{< figure src="/images/2021/2021-0606-007.jpg" title="カスタムドメインな Web Apps" >}}

追加できたカスタムドメインを HTTPS 化することはできませんでした。証明書の登録はできるのですが、ドメインと証明書を紐づけしようとしたらエラーになりました。回避策をまだ見つけられていません。

{{< figure src="/images/2021/2021-0606-008.png" title="登録できた証明書" >}}

```
The resource 'k8swebapp2' already exists in extended location 'CustomLocation': '/subscriptions/9c171efd-eab4-xxxx-xxxx-xxxxxxxxxxxx/resourcegroups/akshci-eu/providers/microsoft.extendedlocation/customlocations/akshci-apps' of location 'eastus'. A resource with the same name cannot be created in location 'East US'. Please select a new resource name.
```

## おわりに

前回のエントリで作成した AKS on HCI を利用して、オンプレミスな環境で Arc enabled App Servive を実行してみました。利用できる機能は Azure と比較してまだまだ少ないですが、App Service 自体の操作は Azure 上の App Service と一貫性がありますし、インターネットへの Outbound 通信のみで動作するので、非常に使いやすい仕組みでした。

仕組みとしてはよさげな一方で、「Azure 外に k8s クラスタがある ＆ Azure な PaaS を Azure 外でも使いたい」という前提条件を満たす人がどの程度いるのか？という点が気になります。需要がある、または需要が見込めるので Microsoft は開発を続けているのでしょうが、こと国内に限るとどの程度の需要があるのか不安になります。

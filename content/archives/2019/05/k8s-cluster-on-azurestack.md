---
title: Azure Stack に Kubernetes Cluster をデプロイする
author: kongou_ae
date: 2019-05-19
url: /archives/2019/05/k8s-cluster-on-azurestack
categories:
  - azurestack
---

## はじめに

Azure Stack の Merketplace には Kubernetes Cluster が登録されています。実際にデプロイしてみました。

{{< figure src="/images/2019-05-19-001.png" title="Marketplace での紹介画面" >}}

参考：[Deploy Kubernetes to use containers with Azure Stack](https://docs.microsoft.com/en-us/azure-stack/user/azure-stack-solution-template-kubernetes-deploy)

## 留意事項

### リリース状況

2019年5月現在、Azure Stack 上の k8s Cluster は Public Preview です。ご利用は計画的に。

### Azure Kubernetes Service との違い

1904 Update 時点での Azure Stack には Azure kubernetes service(AKS) が存在しません。したがって、Azure Stack 上の k8s Cluster は、AKS ではありません。AKS on Azure Stack は絶賛開発中です。

参考：[開発中: Azure Stack 上の Azure Kubernetes Service (AKS)](https://azure.microsoft.com/ja-jp/updates/azure-container-service-aks-on-azure-stack/)

{{< figure src="/images/2019-05-19-002.png" title="Compute のサービス一覧" >}}

Azure Stack 上で提供される k8s Cluster とは、利用者の IaaS 上に [AKS engine](https://github.com/Azure/aks-engine) を利用して Kubernetes Cluster を作ってくれる仕組みです。実際にデプロイしてみると、利用者が管理する Virtual Machine として Master Node と  Pool がデプロイされます。利用者は、これらの Virtual Machine を自分で運用管理しなければなりません。

仕組みは違いますが、k8s Cluster を利用すると 自分で一から構築するよりも簡単に Kubernetes 環境を用意できます。実際にやってみます。

## 事前準備

k8s cluster を利用するためには、Service Principle と SSH 鍵が必要です。Azure CLI でサクッと作ります。

```bash
az ad sp create-for-rbac --name k8s1905 --years 100
ssh-keygen -t rsa -b 2048
```

また、作成した Service Principle が Azure Stack にアクセスできるようにするために、作成した SPN を K8s Cluster をデプロイするサブスクリプションのContributor に追加します。

## リソース構築

Azure Stack ポータルを利用して、K8s Cluster をデプロイします。ポータルの案内に従って次の情報を入力します。

{{< figure src="/images/2019-05-19-003.png" title="ポータルでの入力項目" >}}

- linuxAdminUsername
  - デプロイされる Ubuntu Virtual Machine のユーザ名
- sshPublicKey
  - Ubuntu Virtual Machine にログインする際に利用する秘密鍵の対になる公開鍵
- masterProfileDnsPrefix
  - k8s にアクセスする URL に付与される prefix
- agentPoolProfileCount
  - Pool となる Virtual Machine の台数
- agentPoolProfileVMSize
  - Pool となる Virtual Machine のサイズ
- masterPoolProfileCount
  - Master Node となる Virtual Machine の台数
- masterPoolProfileVMSize
  - Master Node となる Virtual Machine の台数
- identitySystem
  - Azure Stack の認証方式
- servicePrincipalClientId
  - SPN の ID
- servicePrincipalClientSecret
  - SPN のパスワード

構築には数十分かかりますのでしばらく放置します。デプロイに成功するとデプロイ先に指定したリソースグループに大量のリソースが出来上がっています。

{{< figure src="/images/2019-05-19-004.png" title="出来上がったリソースの一部" >}}

master の prefix が付いている Virtual Machine に SSH でアクセスして kubectl すると、デプロイ時に指定した Master と Pool の台数から成る k8s 環境ができあがっているのが分かります。

```
azureuser@k8s-master-18292203-0:~$ kubectl  get node
NAME                       STATUS    ROLES     AGE       VERSION
k8s-linuxpool-18292203-0   Ready     agent     8h        v1.11.9
k8s-linuxpool-18292203-1   Ready     agent     8h        v1.11.9
k8s-linuxpool-18292203-2   Ready     agent     8h        v1.11.9
k8s-master-18292203-0      Ready     master    8h        v1.11.9
k8s-master-18292203-1      Ready     master    8h        v1.11.9
k8s-master-18292203-2      Ready     master    8h        v1.11.9
```

## ダッシュボードに接続する準備

デプロイされた k8s Cluster には、ダッシュボードもインストールされています。構築された Master Node に SSH で接続して、 ダッシュボードの接続先を確認します。今回の環境の場合、ダッシュボードの接続先は`kubernetes-dashboard is running at https://azurestack-k8s.uda.cloudapp.asdk.aimless.jp/api/v1/namespaces/kube-system/services/https:kubernetes-dashboard:/proxy`のようです

```bash
azureuser@k8s-master-18292203-0:~$ kubectl cluster-info 
Kubernetes master is running at https://azurestack-k8s.uda.cloudapp.asdk.aimless.jp
Heapster is running at https://azurestack-k8s.uda.cloudapp.asdk.aimless.jp/api/v1/namespaces/kube-system/services/heapster/proxy
KubeDNS is running at https://azurestack-k8s.uda.cloudapp.asdk.aimless.jp/api/v1/namespaces/kube-system/services/kube-dns:dns/proxy
kubernetes-dashboard is running at https://azurestack-k8s.uda.cloudapp.asdk.aimless.jp/api/v1/namespaces/kube-system/services/https:kubernetes-dashboard:/proxy
Metrics-server is running at https://azurestack-k8s.uda.cloudapp.asdk.aimless.jp/api/v1/namespaces/kube-system/services/https:metrics-server:/proxy
tiller-deploy is running at https://azurestack-k8s.uda.cloudapp.asdk.aimless.jp/api/v1/namespaces/kube-system/services/tiller-deploy:tiller/proxy

To further debug and diagnose cluster problems, use 'kubectl cluster-info dump'.
```

ポータルの認証を突破するためには、証明書と Token を取得します。Master Node で自己証明書をエクスポートします。

```bash
sudo su 
openssl pkcs12 -export -out /etc/kubernetes/certs/client.pfx -inkey /etc/kubernetes/certs/client.key  -in /etc/kubernetes/certs/client.crt -certfile /etc/kubernetes/certs/ca.crt 
```

エクスポートした証明書を、ダッシュボードに接続するクライアントにインポートします。

```powershell
Import-Certificate -Filepath "ca.crt" -CertStoreLocation cert:\LocalMachine\Root 
Import-PfxCertificate -Filepath "client.pfx" -CertStoreLocation cert:\CurrentUser\My
```

ダッシュボードに接続する際に利用する Token を取得します。

```bash
azureuser@k8s-master-18292203-0:~$ kubectl -n kube-system get secrets | grep dashboard-token
kubernetes-dashboard-token-5sdf7                 kubernetes.io/service-account-token   3         9h
azureuser@k8s-master-18292203-0:~$ kubectl -n kube-system describe secret kubernetes-dashboard-token-5sdf7| awk '$1=="token:"{print $2}'
eyJhbGciOiJSUzI1NiIsImtpZCI6IiJ9.eyJpc3MiOiJrdWJlcm5ldGVzL3NlcnZpY2VhY2NvdW50Iiwia3ViZXJuZXRlcy5pby9zZXJ2aWNlYWNjb3VudC9uYW1lc3BhY2UiOiJrdWJlLXN5c3RlbSIsImt1YmVybmV0ZXMuaW8vc2VydmljZWFjY291bnQvc2VjcmV0Lm5hbWUiOiJrdWJlcm5ldGVzLWRhc2hib2FyZC10b2tlbi01c2RmNyIsImt1YmVybmV0ZXMuaW8vc2VydmljZWFjY291bnQvc2VydmljZS1hY2NvdW50Lm5hbWUiOiJrdWJlcm5ldGVzLWRhc2hib2FyZCIsImt1YmVybmV0ZXMuaW8vc2VydmljZWFjY291bnQvc2VydmljZS1hY2NvdW50LnVpZCI6IjA4MmJmNDQ3LTc5ODMtMTFlOS05NDQyLTAwMWRkOGI3MWMwYiIsInN1YiI6InN5c3RlbTpzZXJ2aWNlYWNjb3VudDprdWJlLXN5c3RlbTprdWJlcm5ldGVzLWRhc2hib2FyZCJ9.UH3rjaDoFOQXC2qDt--ucdCxqAfONO_co5I4SlLwMp2QyE6-a9yLbXdMdfBoPgrLA9QTWTmko5T55b01j7zLjKZ6kjJMxau95JtUZLIeqSHmXprUUS7L3KsC6PP5jqUgSQyjRl0ov4kmTqsDvNURit_sZuGtXb3lvBRtqVcYySVXnpYulh_cy7WYQzyAgVn0LuwDsPhtZ_IXhNItT1I0aczhU_47AMyfp8LoVZDfDJnoGEoAvOm8flpL5pMTTfEu5SC45zMyC-DCb9jVPnpjipxFpOSbxw2BxdB_XnhBeafCZi7hXfaHjHWehGa2LdnBQbnL4_11XKtYjhUYXptstLEc3_EE_AP5sr3k4QjJ765h7uFwj7KIUOIlkZXjbtxxRdY2Doi3aBbagIq_7RHe0iklbKE2Nc_wo23z5AKUMz0iSm9via3IKpBHUqjdcdmhLjVE3fg2YOOMCOMMq2bKXEkk5ASx1pRdqwG8cS58NvtuorZM5877dItwGIhQEe6jc8ikE35SdXEBsKGNxl9zL1NUP92yJ1Y_oTbgHH-N-BzBiOax904Q5E_b7nZsUhDC3dgGa9uz8a1h_LnNnH5Ke-x71qjOEvz-4rTL-taVfmvB4TaRzk9zP9tmwXuny5Cy_1xxCChtHw4Ebjn-I7cK3uGeQ-AXy38avaDijhw2oAc
azureuser@k8s-master-18292203-0:~$ 
```

{{< figure src="/images/2019-05-19-004.png" title="出来上がったリソースの一部" >}}

## ダッシュボードへの接続

証明書をインポートした端末でダッシュボードに接続します。先ほど確認したダッシュボードのURLにアクセスすると、クライアント証明書を求められます。インポートした証明書を選択します。

{{< figure src="/images/2019-05-19-005.png" title="クライアント証明書の要求画面" >}}

ダッシュボードに対して Token を入力します。

{{< figure src="/images/2019-05-19-006.png" title="トークンの要求画面" >}}

ログインすると権限不足のアラートが出ていますので、ダッシュボードに対して権限を付与します。

{{< figure src="/images/2019-05-19-007.png" title="ダッシュボードのアラート" >}}

```bash
azureuser@k8s-master-18292203-0:~$ kubectl create clusterrolebinding kubernetes-dashboard --clusterrole=cluster-admin --serviceaccount=kube-system:kubernetes-dashboard
clusterrolebinding.rbac.authorization.k8s.io/kubernetes-dashboard created
```

先ほどでていたアラートが消えて、ダッシュボードでクラスタの情報を見られるようになりました。

{{< figure src="/images/2019-05-19-008.png" title="ダッシュボードの画面" >}}

## 終わりに

Azure Stack の k8s Cluster における留意事項と手順をまとめました。手順のとおり、簡単に k8s 環境を構築できました。簡単すぎて怖いくらいです・・今回は単純にクラスタをデプロイしただけですので、引き続き以下の項目に挑戦しようと思います。

- 監視
- スケールイン/アウト
- アプリのデプロイ

---
title: Azure Stack で PaaS を利用する
author: kongou_ae
date: 2018-12-23
url: /archives/2018-12-23-paas-of-azurestack
categories:
  - azurestack
---

本エントリーは[Microsoft Azure Stack Advent Calendar 2018](https://qiita.com/advent-calendar/2018/azure-stack)の23日目です。

本日のエントリでは Azure Stack の PaaSについてまとめます。ただし、PaaS をちゃんと触れていないのでさらっとです。

## Azure Stack と PaaS

Azure Stack は Azure の拡張であり、Azure と一貫性をもって設計されています。そのため、管理者は利用者に対して IaaS だけでなく PaaS も提供できます。1811 update 時点の Azure Stack で利用できる PaaS は次の通りです。

- App Service
  - Web Apps
  - API App
  - Function App
- SQL Server
- MySQL Server
- Pivotal Cloud Foundry 
- Service Fabric clusters
- Kubernetes Cluster
- Service Fabric
- OpenShift

今後、Azure で提供されている次の PaaS が、Azure Stack 上でリリースされる予定です。

- IoT Hub
- Event Hub
- Azure Kubernetes Service (AKS)

## 利用者目線での PaaS

ただし、1811 時点の Azure Stack で提供される PaaS には注意点があります。それは、特定の PaaS が、PaaS を名乗る IaaS であるということです。次の5つの PaaS をテンプレートで展開すると、利用者のサブスクリプションに Virtual Machine が出来上がります。したがって、展開したあとは利用者自身が Virtual Machine のお守りをしなければなりません。

- Pivotal Cloud Foundry 
- Service Fabric clusters
- Kubernetes Cluster
- Service Fabric
- OpenShift

一方で、App Service と SQL Server、MySQL Server は、なんちゃって PaaS ではなく PaaS としてリリースされています。たとえば、App Service を利用する際に利用者のサブスクリプションに構築されるものは、App Service というリソースです。Virutal Machine ではありません。

{{< figure src="./../../images/2018-12-23-001.png" title="利用者ポータル上の App Service" >}}

## 管理者目線での PaaS

Azure Stack 上で利用者に対して App Service と SQL Server、MySQL Server を提供するかどうかを決めるのは、Azure Stack の管理者です。したがって、PaaS を Azure Stack にインストールするのは管理者の仕事です。公式ドキュメントには PaaS のインストール方法が記載されています。

- 参考：[App Service リソース プロバイダーを Azure Stack に追加する](https://docs.microsoft.com/ja-jp/azure/azure-stack/azure-stack-app-service-deploy)
- 参考：[SQL Server リソース プロバイダーを Azure Stack にデプロイする](https://docs.microsoft.com/ja-jp/azure/azure-stack/azure-stack-sql-resource-provider)
- 参考：[Azure Stack への MySQL リソース プロバイダーのデプロイ](https://docs.microsoft.com/ja-jp/azure/azure-stack/azure-stack-mysql-resource-provider-deploy)

手順に従って App Service をインストールすると、管理者側に沢山の Virtual Machine と VM Scaleset がデプロイされます。これらの IaaS が連携することで、App Service という PaaS を利用者に提供しています。

{{< figure src="./../../images/2018-12-23-002.jpg" title="App Service を構成する主要なリソース" >}}

Azure Stack の PaaS は利用者にとっての PaaS であって、管理者にとっては IaaS です。そのため、これらのリソースを運用するのは Azure Stack の管理者の仕事です。ただし、これらのリソースの運用管理方法は、Azure Stack 本体のようにドキュメントが充実していません。本体のように高度に抽象化された仕組みだとよいのですが・・・

## まとめ

本日のエントリでは、Azure Stack 上の PaaS についてまとめました。Azure Stack の PaaS はまだまだこれからの領域です。利用を検討する際には次のことを考慮する必要があります。本番利用の前に、PoC をやることで、管理者と利用者がそれぞれ何をすべきなのかを明確にしましょう。

- PaaS の皮をかぶった Iaas なのか、PaaS なのか
- PaaS を提供するリソースを管理者がどのように運用管理するか



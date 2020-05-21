---
title: Azure Stack Hub のアナウンス（Microsoft Build 2020）
author: kongou_ae
date: 2020-05-20
url: /archives/2020/05/announcement-of-azurestackhub-in-build2020
categories:
  - azurestack
---

イベントの発表をまとめておくと未来の自分が助かることが分かってきたので、Microsoft Build 2020 で発表された Azure Stack Hub の情報をまとめます。

サマリは以下の通りです。3rd パーティ製品に関する情報は省略します。面白そうな新機能はどれも「プライベートプレビューを開始する」というアナウンスですので、残念なことにすぐにどうこうなる話ではありません。12月ごろに開催される Ignite 2020 でパブリックプレビューになってほしいところですね。

- [Azure Stack Hub fleet management preview](https://azure.microsoft.com/en-gb/updates/azure-stack-hub-fleet-management-preview/)
- [Azure Kubernetes Service (AKS) resource provider on Azure Stack preview](https://azure.microsoft.com/en-us/updates/azure-kubernetes-service-aks-resource-provider-on-azure-stack-preview/)
- [Support for Windows containers Azure Container Networking Interface on Azure Stack Hub coming soon in private preview](https://azure.microsoft.com/en-us/updates/support-for-windows-containers-azure-container-networking-interface-on-azure-stack-hub-coming-soon-in-private-preview/)
- [Azure Stack Hub now supports cross-platform compatibility on PowerShell](https://azure.microsoft.com/en-us/updates/azure-stack-hub-now-supports-crossplatform-compatibility-on-powershell/)
- [Azure Container Registry on Azure Stack Hub private preview](https://azure.microsoft.com/en-us/updates/azure-container-registry-on-azure-stack-hub-private-preview/)
- [FHIR Server on Azure Stack Hub](https://azure.microsoft.com/en-us/updates/fhir-server-on-azure-stack-hub/)
- [Azure Stack Hub updates will simplify fleet and resource management and enable graphics-heavy scenarios](https://news.microsoft.com/build-2020-book-of-news/#1121-azure-stack-hub-updates-will-simplify-fleet-and-resource-management-and-enable-graphics-heavy-scenarios) 

なお、公式のサマリは次をご確認ください。

[Azure Stack Announcements at Build 2020](https://techcommunity.microsoft.com/t5/azure-stack-blog/azure-stack-announcements-at-build-2020/ba-p/1406969)


## Azure Stakc Hub fleet management

複数の Azure Stack Hub を Azure から運用管理できる機能のプレビューが夏から始まります。limited or public となっていますので、もしかするといきなり Public Preview になるかもしれません。具体的に何ができるのかは不明ですが、SCOM MP 相当のことができるようになれば超便利そうです。

## AKS Resoruce Provider

Azure Kubernetes Service の Resource Provider がプライベートプレビューになります。現在サポートされている AKS engine ベースの Kubernetes クラスタではなく、Azure と同じように利用者から Master が見えない Kubernetes クラスタを利用できるようになりそうです。

## AKS engine on Azure Stack Hub の機能強化

AKS engine on Azure Stack Hub 上での Windows Container と Azure Container Networking Interface plug-in がプライベートプレビューになります。「Azure ではできるが Azure Stack Hub ではできない」という差異が減っていくのは良いことです。

## Az モジュール

Azure Stack Hub が Az モジュールをサポートするようになりました。つぎのとおり Az モジュールのサポートはプレビュー中でしたので、本アナウンスをもって GA するのでしょう。ついに AzureRM モジュールを捨てる時が来ました。

[Install PowerShell Az preview module for Azure Stack Hub](https://docs.microsoft.com/en-us/azure-stack/operator/powershell-install-az-module?view=azs-2002)

## Azure Container Registory

Azure Container Registry(ACR) がプライベートプレビューになります。Azure 上で AKS を使うのと同じように地上でも AKS engine を使っているのであれば、地上にも ACR と同じ仕組みのコンテナレジストリが欲しくなります。「Azure ではできるが Azure Stack Hub ではできない」という差異が減っていくのは良いことです。

## FHIR Server on Azure Stack Hub

医療に関するデータをやり取りするための FHIR 仕様を実現するオープンソースのサーバが Azure Stack Hub をサポートするようになりました。Azure Stack Hub 上で FHIR Server が動作するようになったことで、FHIR Server の Disconnected なシナリオを実現できるようになりました。

## AMD の GPU 搭載 VM

AMD の GPU サポートが Private Preview になりました。Ignite 2019 のアナウンスで NVIDIA と AMD の両方がプライベートプレビューになったと理解していたのですが、なぜ改めて AMD のみアナウンスが・・・

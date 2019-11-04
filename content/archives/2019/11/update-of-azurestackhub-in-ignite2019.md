---
title: Azure Stack Integrated system のアナウンス@Ignite 2019
author: kongou_ae
date: 2019-11-04
url: /archives/2019/11/update-of-azurestackhub-in-ignite2019
categories:
  - azure
  - network
---

Microsoft Ignite 2019 で発表になった Azure Stack Integrated system 関連のアナウンスをまとめるためのページです。随時更新。

## ソース
- https://news.microsoft.com/wp-content/uploads/prod/sites/563/2019/11/Ignite-2019-Book-of-News.pdf

## サマリ

- 名称変更(Azure Stack Integrated system から Azure Stack Hub に)
- Availability of BC/DR foundational pattern for Azure Stack Hub to Azure Stack Hub
- Event Hubs on Azure Stack Hub (Public Preview)
- Azure data services (Arc) on Azure Stack Hub 
- Public Preview of Azure Stream Analytics support on Azure Stack Hub
- General Availability of Kubernetes on Azure Stack Hub
- Preview of Windows Virtual Desktop on Azure Stack Hub 

## 名称変更

これまで Azure Stack という名称で語られていた Azure Stack Integrated system が、 Azure Stack Hub という名前になりました。そして、Azure Stack という単語は、「Azure StaCk HCI」と「Azure Stack Edge（元 Data Box Edge）」「Azure Stack Hub」という3つのソリューションを包括するものに変わりました。Ignite では、「Azure Stack Family」や「 Azure Stack Portfolio」という表現で使われています

## Availability of BC/DR foundational pattern for Azure Stack Hub to Azure Stack Hub

2020年上半期に、2つの Azure Stack Hub 間での Virtual Machine をフェイルオーバ/フェイルバックする手法を発表するようです。

## Event Hubs on Azure Stack Hub (Public Preview)

Azure Stack Hub 上の Event Hub がパブリックプレビューになりました。1910 でインストールできるようになるのでしょうか・・・

## Azure data services (Arc) on Azure Stack Hub 

Azure Data service (Arc) を Azure Stack Hub 上で動作できるようになりました。次の URL を見る限りだと、Azure Data service on K8s cluster on Azure Stack Hub ってことでしょうかね・・・そもそも Azure Data service (Arc) 自体が発表されたばかりなのでさっぱり分からん・・・

https://azure.microsoft.com/en-us/services/azure-arc/hybrid-data-services/

> Azure SQL Database and Azure Database for PostgreSQL Hyperscale are now available on Azure Arc for private preview. Over time, we will bring other Azure data services to Azure Arc.

## Public Preview of Azure Stream Analytics support on Azure Stack Hub

Azure Stack Hub 上の Stream Analytics がパブリックプレビューになりました。1910 でインストールできるようになるのでしょうか・・・

## General Availability of Kubernetes on Azure Stack Hub

Azure Stack Hub 上の AKS Engine ベースの K8s が GA しました。

## Preview of Windows Virtual Desktop on Azure Stack Hub 

Azure Stack Hub 上の Windows Virtual Desktop がプレビューになりました。WVD のコントロールプレーンは Azure のままで、リソースプールとなる Virtual Machine を Azure Stack Hub 上で稼働できるようです。プレビューの申し込み方が分からん・・・エキスポで聞こう・・・

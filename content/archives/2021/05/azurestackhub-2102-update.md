---
title: Azure Stack Hub 2102 update
author: kongou_ae
date: 2021-05-19
url: /archives/2021/05/azurestackhub-2102-update
categories:
  - azurestack
---

Azure Stack Hub 2102 update がリリースされました。前回の2008 Update のリリースが2020年11月でしたので半年ぶりのリリースです。まだ触れていないので、ドキュメントを前提として気になるポイントをまとめます。

参考：[Azure Stack Hub release notes](https://docs.microsoft.com/en-us/azure-stack/operator/release-notes?view=azs-2102)

## サポートされる VM サイズの増加

vCPU あたりのメモリ量が多い次の VM サイズを利用できるようになりました。

- Dv3-series
- DSn_v2-series
- Ev3-series

「沢山のメモリが必要だが沢山の vCPU は不要」という仮想マシンの場合、今回サポートされた VM サイズを利用すると、従来よりも仮想マシンの費用を削減できる可能性があります。従来の VM サイズで「沢山のメモリが必要だが沢山の vCPU は不要」という仮想マシンを実現しようとすると、必要なメモリを確保するためにサイズの大きなインスタンスを選択する必要がありました。その結果として ｖCPU 数が無駄に多くなり、vCPU 数に比例して増えていく仮想マシンの費用も高くなっていました。

## Nested VM のサポート
Dv3 および Ev3 がサポートされた結果として、Nested VM がサポートされました。

参考：[azure-stack-vm-considerations.md ](https://github.com/MicrosoftDocs/azure-stack-docs/compare/219639c..5aea61f#diff-b71ecefa5e5e103c3de2e40e0a5236fb6fe3a1fc4376143531647d0817220e07)

## GPU のサポートが GA（多分）
2020年9月に「2010 Update で GPU が GA に」というアナウンスがでました。2010 Update のリリースが遅れた結果の 2102 Update ですので、このアップデートで GPU が GA になったはずです。

参考：[Azure Stack Hub with GPU's now generally available](https://azure.microsoft.com/ja-jp/updates/azure-stack-hub-with-gpus-now-generally-available/)

GA 後も、GPU を搭載するインスタンスはホストレベルの可能性が提供されないので注意が必要です。

参考：[Consideration for GPU VMs](https://docs.microsoft.com/en-us/azure-stack/operator/azure-stack-capacity-planning-compute?view=azs-2102#consideration-for-gpu-vms)

GA に伴い、GPU に関する複数の機能が追加されました。

- 管理者ポータルでの GPU 管理機能の強化
- GPU のパーティション分割のサイズ変更（参考：[Change GPU partition size](https://docs.microsoft.com/en-us/azure-stack/operator/manage-gpu-capacity?view=azs-2102#change-gpu-partition-size)）
- 既存の Azure Stack Hub に対する GPU の追加（要全停止）

## マルチテナント設定の GUI 化
Azure Stack Hub はマルチテナントをサポートしており、1台の Azure Stack Hub に対して複数の Azure AD テナントのアカウントでログインできます。2102 Update 以降、マルチテナントを有効化する作業が GUI で完結するようになります。これまでのマルチテナントを有効化する
手順では PowerShell が必要でした。さらに、Azure Stack Hub の管理者だけでなく、Azure Stack Hub にログインしたいテナントの管理者も PowerShell で作業を実施する必要がありました。

参考：[Configure multi-tenancy in Azure Stack Hub](https://docs.microsoft.com/en-us/azure-stack/operator/enable-multitenancy?view=azs-2102&pivots=management-tool-portal)

## AzureRm モジュールの更新終了
ドキュメント上で、今後の Azure Stack Hub では AzureRm モジュールを更新しないことが明記されました。引き続きサポートはされますが、2002 Update 以降をお使いの方は Az モジュールに移行しましょう。

参考：[azure-stack/operator/azure-stack-powershell-install.md](https://github.com/MicrosoftDocs/azure-stack-docs/compare/5aea61f..eb1676e#diff-e17f0e5be091f38798d1d7fc36d5e4fcf0cf696c815b15f6176becd28a87bbfb)


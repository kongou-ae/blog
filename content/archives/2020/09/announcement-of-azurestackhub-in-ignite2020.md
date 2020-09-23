---
title: Azure Stack Hub のアナウンスまとめ（Ignite 2020）
author: kongou_ae
date: 2020-09-23
url: /archives/2020/09/announcement-of-azurestackhub-in-ignite2020
categories:
  - azurestack
---

Ignite 2020 で発表になった Azure Stack Hub 関連のアナウンスをまとめます。なお、Ignite 2020 における Azure Stack Hub のアナウンスは控えめでした。おそらく、Build 2020 で新機能や今後のロードマップを発表してしまったせいだと思います。

参考：[Azure Stack Hub のアナウンス（Microsoft Build 2020）](https://blog.aimless.jp/archives/2020/05/announcement-of-azurestackhub-in-build2020)

元ネタはこちらです。

- [Azure Stack Hub Updates at Ignite 2020](https://techcommunity.microsoft.com/t5/azure-stack-blog/azure-stack-hub-updates-at-ignite-2020/ba-p/1684581?WT.mc_id=AZ-MVP-5003408)
- [Azure Stack Hub Platform Improvements for Ignite 2020](https://techcommunity.microsoft.com/t5/azure-stack-blog/azure-stack-hub-platform-improvements-for-ignite-2020/ba-p/1686217?WT.mc_id=AZ-MVP-5003408)
- [Azure Stack Hub developer announcements - September 2020](https://techcommunity.microsoft.com/t5/azure-stack-blog/azure-stack-hub-developer-announcements-september-2020/ba-p/1694726?WT.mc_id=AZ-MVP-5003408)

### GPU VM

Azure Stack Hub 2005 Update で GPU を利用する次の VM がサポートされました。

- NCv3 (NVIDIA V100 Tensor Core GPU)
- NCasT4_v3 (NVIDIA T4 Tensor Core GPU)
- NVv4 (AMD Mi25)

### Azure Arc enabled data services on AKS engine on Azure Stack Hub

Ignite 2020 でプレビューが始まった Azure Arc enabled data services は Azure Stack Hub 上で動作する AKS engine をサポートしています。AKS engine on Azure Stack Hub という KUbernetes  Cluster と クラウドプラットフォームの両方を自前で運用しなければならない辛い方式が前提となりますが、構成自体はサポートはされます。

### AKS Resource Provider

Build 2020 でアナウンスされた AKS Resource Provider のプライベートプレビューが開始されました。

### Azure Container Registory on Azure Stack Hub

Build 2020 でアナウンスされた Azure Container Registory on Azure Stack Hub  のプライベートプレビューが開始されました。

### VNet Peering

feedback.azure.com で最も票を集めている VNet Peering が一般公開になりました。今回の Ignite で Azure Stack Hub 界隈が喜んでいるのがこのアップデートです。次のアップデートで振ってくると思われます。これで Azure Stack Hub 上でも気軽に Hub-and-spoke モデルを実現できるようになります。VNet Peering のために NVA を導入しなくて済みます。

参考：[VNET Peering in Azure Stack](https://feedback.azure.com/forums/344565-azure-stack-hub/suggestions/19001737-vnet-peering-in-azure-stack)

### ASR フェイルバック

ASR のフェイルバックを簡易にするスクリプトが公開されます。現時点での Azure Stack Hub は構成サーバを利用する方式の ASR をサポートしています。（[Azure Stack VM を Azure にレプリケートする](https://docs.microsoft.com/ja-jp/azure/site-recovery/azure-stack-site-recovery#fail-over-and-fail-back?WT.mc_id=AZ-MVP-5003408)）ただし、この方式のフェイルオーバーは、フェイルオーバーした後のフェイルバックが課題でした。具体的には、[Azure Stack にフェールバックする](https://docs.microsoft.com/ja-jp/azure/site-recovery/azure-stack-site-recovery#fail-back-to-azure-stack?WT.mc_id=AZ-MVP-5003408)に記載されている通り、「手でやればフェイルバックできないことはない」という次元の方法でフェイルバックしなければならないのです。この手作業を自動化するスクリプトが提供されるようです。正直微妙・・・

### マネージドディスクの増分スナップショット

年末をめどにマネージドディスクの増分スナップショットがサポートされます。

### Stream Analytics on Azure Stack Hub

Azure Stack Hub 上で IoT Edge モジュールとして Stream Analytics を動作させることがパブリックプレビューになりました。ネイティブな Stream Analytics が動くわけではなく IoT Edge モジュールとして動作させる点に注意です。リソースプロバイダとしての Stream Analytics が来るわけではないので、コントロールプレーンは Azure のままです。

Stream Analytics を Azure Stack Hub 上で動作させることで、Event Hub on Azure Stack Hub や IoT Hub on Azure Stack Hub で集めたデータを Stream Analytics で処理できるようになります。

参考：[Run Azure Stream Analytics on Azure Stack (Preview)](https://docs.microsoft.com/en-us/azure/stream-analytics/on-azure-stack?WT.mc_id=AZ-MVP-5003408)

### GitHub Action

GitHub Action が Azure Stack をサポートする機能がベータプレビューになりました。具体的には、GitHub Action で Azure に接続するためのモジュールで次のように Azure Stack Hub を指定できるようになりました。

```
- name: Login via Az module
  uses: azure/login@AzureStackSupport-Beta
  with:
    creds: ${{secrets.AZURE_CREDENTIALS}}
    enable-AzPSSession: true 
    environment: 'AzureStack'
```

### 新しい API プロファイル

10月に 2020-09-01-hybrid がリリースされる予定です。Azure Stack Hub の API がまた一歩 Azure の API に近づきます。その結果「Azure で動いたスクリプトやテンプレートが Azure Stack Hub でそのまま動かない」というリスクが軽減されます。ありがたい。

### Az モジュール

プレビュー中の Az モジュールが一般公開になりました。Azure 上には Az モジュール、Azure Stack Hub には AzureRM モジュールという苦痛から解放されることになります。ありがたい。

### Azure Account 拡張

VS code の Azure Account 拡張が Azure Stack Hub をサポートします。VSCode から Azure 上の Function や IoT Hub をデプロイするのと同じように、VSCode から Azure Stack Hub 上の Function や IoT Hub をデプロイできるようになります。ありがたい。

参考：[Connect to Azure Stack Hub using Azure Account Extension in Visual Studio Code](https://docs.microsoft.com/en-us/azure-stack/user/azure-stack-dev-start-vscode-azure?view=azs-2005&WT.mc_id=AZ-MVP-5003408)

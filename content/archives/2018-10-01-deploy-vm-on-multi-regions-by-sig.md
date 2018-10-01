---
title: Shared Image Gallery を利用して、1つのイメージから複数リージョンに Virtual Machine をデプロイする
author: kongou_ae
date: 2018-10-01
url: /archives/2018-10-01-deploy-vm-on-multi-regions-by-sig
categories:
  - azure
---

## はじめに

Microsoft Ignite 2018 で [Shared Image Gallery](https://azure.microsoft.com/en-us/blog/announcing-the-public-preview-of-shared-image-gallery/) というサービスが Public Preview になりました。1つのイメージを複数のリージョンで利用できるようにするサービスです。従来の Image がリージョン限定で困っている人にとっては福音です。早速試しました。

なお、ベストプラクティス的なものが見当たらなかったので、思うがままに作りました。実用される際は、実際の運用を検討してから作成した方がいいです。

## プレビュー有効化

Shared Image Gallery は Public Preview 中です。個別に有効化する必要があります。

```bash
az feature register --namespace Microsoft.Compute --name GalleryPreview
az provider register -n Microsoft.Compute
```

## Shared Image Galleryの作成

まずは Shared Image Gallery そのものを作ります。 [Announcing the public preview of Shared Image Gallery](https://azure.microsoft.com/en-us/blog/announcing-the-public-preview-of-shared-image-gallery/) に記載のとおり、Shared Image Gallery そのものを作れるリージョンには限りがあります。今回は East US2 を利用します。

```bash
az group create -g sig -l eastus2
az sig create -g sig --gallery-name aimlesssig
```

## Image の作成

Shared Image Gallery と同じリージョンに、Shared Image Gallery に格納する Image を作成します。今回は以下の流れで Image を作りました。

- MarketPlace から Ubuntu を作成する
- Serial Console で /opt/sig.txt を作成する
- Serial Console で waagent -deprovision+user を実行する
- Azure Portal から Virtual Machine をキャプチャしてイメージ化する

{{<img src="./../../images/2018-1001-001.png">}}

## Image Definition の作成

Shared Image Gallery に格納する Image を定義します。

```bash
az sig image-definition create \
   -g sig \
   --gallery-name aimlesssig \
   --gallery-image-definition ubuntu-16.04.4-custom \
   --publisher aimless.jp \
   --offer ubuntu-16.04.4-custom \
   --sku 1.0.0 \
   --os-type Linux 
```

## Image Definition にイメージを格納する

作成した Image Definition に 実際の Image を格納します。上記で作成した Image のリソースIDを `--managed-image` オプションに渡します。

Shared Image Gallery にはレプリカという考え方があります。Shared Image Gallery 上の Image は Storage Blob 上に保持されます。同時にたくさんの Virtual Machineをデプロイしようとすると、Storage Blob の性能がボトルネックになる可能性があります。Shared Image Gallery 上の Image にレプリカを持たせておくことと、同時にたくさんのVirtual Machine をデプロイしようとした場合、Virtual Machine 作成時に読み取られる Shared Image Gallery 上の Image がレプリカに分散します。

`--replica-count` オプションはデフォルトのレプリカ数を定義します。`--target-regions` オプションでは、 Image を配りたいリージョンと、リージョン個別のレプリカ数を定義します。今回は East US2 と Southeast Asia 、 Japan East 、 Japan West に対してレプリカ数１で Image を配ります。

```bash
az sig image-version create -g sig \
   --gallery-name aimlesssig --gallery-image-definition ubuntu-16.04.4-custom \
   --gallery-image-version 3.0.0 --target-regions "East US 2" "southeast asia=1" "japan east=1" "japan west=1" \
   --replica-count 1 \
   --managed-image /subscriptions/51b26c53-xxxx-xxxx-xxxx-xxxxxxxxxxxx/resourceGroups/sig-from-eu2/providers/Microsoft.Compute/images/sigfrom-image-20181001094819
```

## ポータルで確認する

ここまでで、Azure CLIを利用して次のリソースを作ってきました。

- Shared Image Gallery 
- Image Definition
- Image Version

ポータル上では次のように表示されます。Image Definition と Image Version は見えないリソースです。表示する場合は Show hidden types にチェックが必要です。

{{<img src="./../../images/2018-1001-003.png">}}

## Shared Image Gallery を使って Virtual Machine をデプロイする

では、実際に Shared Image Gallery を使って、Virtual Machine を作ってみます。Shared Image Gallery を配った Southeast Asia でVMを作ります。

```bash
az group create -n sig-dst -l southeastasia
az storage account create -n sigboot -g sig-dst --sku Standard_LRS --kind Storage
az vm create -g sig-dst -n sigdst \
  --admin-password YOUR-PASSWORD --admin-username aimless \
  --image /subscriptions/51b26c53-xxxx-xxxx-xxxx-xxxxxxxxxxxx/resourceGroups/sig/providers/Microsoft.Compute/galleries/aimlesssig/images/ubuntu-16.04.4-custom/versions/3.0.0 \
  --boot-diagnostics-storage https://sigboot.blob.core.windows.net/ \
  --size Standard_B2s
```

作成した Virtual Machine の Serial Console を使うと、`/opt/sig.txt` を確認できます。一般化した Virtual Machine の特徴を引き継いだ Virtual Machine を別リージョンに作成できました。

{{<img src="./../../images/2018-1001-002.png">}}

## おわりに

Shared Image Gallery の登場によって、いわゆるゴールデンイメージ運用が簡単になりそうです。アナウンスによると、同一AADテナント内であればサブスクリプションをまたいで Shared Image Gallery を利用できるようです。今回は環境がなくて検証できませんでした。

ゴールデンイメージを運用している人にとっては夢が広がりますね。GAが待ち遠しいです。

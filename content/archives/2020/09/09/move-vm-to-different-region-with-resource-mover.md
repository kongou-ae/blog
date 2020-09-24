---
title: Azure Resource Mover で Virtual Machine を別リージョンに移動する
author: kongou_ae
date: 2020-09-24
url: /archives/2020/09/move-vm-to-different-region-with-resource-mover
categories:
  - azure
---

Ignite 2020 で発表になった Azure Resource Mover を利用して、東日本リージョンの仮想マシンを米国西部2リージョンに移動してみました。

**参考:**

- [Azure Resource Mover is now in public preview](https://azure.microsoft.com/ja-jp/updates/azure-resource-mover-is-now-in-public-preview/)
- [Azure Resource Mover documentation](https://docs.microsoft.com/en-us/azure/resource-mover/)


## 前提

東日本リージョン内のリソースグループに存在する VNet に仮想マシンを用意します。

{{< figure src="/images/2020/2020-0924-009.png" title="東日本リージョンの状態" >}}

この仮想マシンを米国西部2リージョン内のリソースグループに存在する VNet に移動します。東日本リージョンのリソースグループと VNet はそのまま残しておきます。他の VM が残っている体で。

{{< figure src="/images/2020/2020-0924-010.png" title="米国西部2リージョンの状態" >}}

## 依存性のチェック

移動したいリソースを Resource Mover に登録すると、依存関係がチェックされます。

{{< figure src="/images/2020/2020-0924-001.png" title="依存関係がチェックされた結果" >}}

怒られました。デフォルトの設定では、リソースが関連しているリソースグループや VNet も一緒に移動しようとするようです。にもかかわらず、移動したいリソースの一覧にリソースグループと VNet が含まれていないので怒られたようです。Validate dependencies を選択すると、リソースグループと VNet を移動の対象に追加するように促されます。

{{< figure src="/images/2020/2020-0924-004.png" title="Vaidate dependencies の結果" >}}

ですが、リソースグループや VNet は他の仮想マシンが残っている体なので移動できません。要件を満たすべく、移動先の設定をカスタマイズします。各リソースの Destination configuration を開いて、米国西部2リージョンに存在している リソースグループと VNet を選択します。

{{< figure src="/images/2020/2020-0924-002.jpg" title="Destination configuration の設定画面１" >}}

{{< figure src="/images/2020/2020-0924-003.jpg" title="Destination configuration の設定画面２" >}}

## 準備

もれなく変更が終われば、依存関係のチェックが成功して準備に進めます。

{{< figure src="/images/2020/2020-0924-005.jpg" title="準備の実行１" >}}

{{< figure src="/images/2020/2020-0924-006.jpg" title="準備の実行２" >}}

準備を開始します。VM だけ準備に時間がかかります。裏で何をしているかというと 対象の仮想マシンに Azure Site Recovery を有効化して、初回のレプリケーションを実行しています。そりゃ時間かかるわ・・・

{{< figure src="/images/2020/2020-0924-007.png" title="準備中" >}}

{{< figure src="/images/2020/2020-0924-008.png" title="移動対象 VM の ASR 画面" >}}

## 移動

準備が終わると各リソースの状態が Intiate move pending になりますので、リソースを選択して Initiate move を実行します。

{{< figure src="/images/2020/2020-0924-011.jpg" title="Initate move その１" >}}

{{< figure src="/images/2020/2020-0924-012.jpg" title="Initiate move その２" >}}

移動が終わると ステータスは Commit move pending になります。移動が終わったリソースは 米国西部2リージョンに新しいリソースが作成されます。

{{< figure src="/images/2020/2020-0924-013.jpg" title="Resource Mover の表示" >}}

{{< figure src="/images/2020/2020-0924-014.jpg" title="米国西部2リージョンに作成されたリソース" >}}

仮想マシンの移動には時間がかかります。何をしているかというと、ASR のテストフェールオーバーが実行されています。

{{< figure src="/images/2020/2020-0924-015.jpg" title="移動対象 VM の ASR 画面" >}}

テストフェールオーバが完了すると、仮想マシンのステータスも Commit move pending になります。テストフェールオーバしたので、米国西部2リージョンに仮想マシンが起動して東日本リージョンの仮想マシンは停止した状態になっています。

{{< figure src="/images/2020/2020-0924-018.jpg" title="移動した後の状態の VM" >}}

## コミット

すべてのリソースが Commit move pending になったら、最後にコミットします。

{{< figure src="/images/2020/2020-0924-017.jpg" title="Commit その１" >}}

{{< figure src="/images/2020/2020-0924-019.jpg" title="Commit その２" >}}

コミットが完了するとリソースのステータスが Delete source pending に変わります。仮想マシンも ASR が解除されて初期設定の画面が表示されるようになります。

{{< figure src="/images/2020/2020-0924-020.jpg" title="コミットした後の状態" >}}

{{< figure src="/images/2020/2020-0924-021.jpg" title="移行対象 VM の ASR の画面" >}}

## お片付け

移行された仮想マシンには ASR に必要な Mobility Service がインストールされています。このサービスは自動で削除されませんので手作業で削除する必要があります。

参考：[Configure settings after the move](https://docs.microsoft.com/en-us/azure/resource-mover/tutorial-move-region-virtual-machines#configure-settings-after-the-move)

裏で動いていた ASR で使われていた Recovery Service Vault と Storage Account も残ったままです。これらのリソースも自動で削除されませんので手作業で削除します。

{{< figure src="/images/2020/2020-0924-022.jpg" title="残ったままの ASR 関連リソース" >}}

参考：[Delete additional resources created for move](https://docs.microsoft.com/en-us/azure/resource-mover/tutorial-move-region-virtual-machines#delete-additional-resources-created-for-move)

Resource Mover に登録したリソースたちも自動的には削除されません。普段通りの方法で移行元のリソースを削除する必要があります。

{{< figure src="/images/2020/2020-0924-023.jpg" title="残ったままの移行元リソース" >}}

移行元リソース自体を削除しても Resource Mover 上での登録が削除されないようなので、Resource Mover 的にも移行元リソースを削除します。

{{< figure src="/images/2020/2020-0924-024.jpg" title="移行が済んだリソースを Resource Mover から削除する" >}}

## 振り返り

Azure Resource Mover で仮想マシンを別リージョンに移動してみました。仮想マシンの場合、Resource Mover は Azure Site Recovery のラッパとして動作するようです。「素の ASR を使えばいいのでは？」と思いましたが、Resouce Mover を利用すると「シンプルな操作性」や「一つの画面で全部済む」といったメリットを得られます。お掃除まで全自動でやってくれれば完璧なのですが・・・

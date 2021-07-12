---
title: Azure Express Route とOracle FastConnect を切断するときの注意点
author: kongou_ae
date: 2021-07-12
url: /archives/2021/07/warning-for-disconnecting-expressroute-and-fastconnect
categories:
  - azure
---

## はじめに

Oracle FastConnect を利用して ExpressRoute 周りの検証し終えてリソースを削除しようとしたところ、Oracle FastConnect のステータスが Failed になり削除できなくなってしまいました。

{{< figure src="/images/2021/2021-0712-001.png" title="FastConnect のステータス" >}}

本エントリでは Oracle FastConnect のステータスを Failed にせずに削除するための手順をまとめます。

## 結論

Oracle FastConnect を削除する前に、ExpressRoute に紐づいている Connection を全部削除しましょう。クラシック仮想ネットワークとの Connection も対象となります。ExpressRoute に紐づく Connection が残っている状態で FastConnect を削除しようとすると、FastConnect の削除処理が失敗して FastConnect のステータスが Failed になってしまいます。

## 対処方法

もし Connection が残っている状態で FastConnect を削除してしまいステータスが Failed になってしまったときの対処は次の通りです。

1. ExpressRoute を更新して、Express Route のステータスを正常に戻す
2. ExpressRoute からすべての Connection を削除する
3. FastConnect を削除する

なお、Failed になってしまった FastConnect を削除するためには CLI を利用する必要があります。ポータルから FastConnect の ID を確認したうえで、Cloud Shell から次のコマンドを実行します

{{< figure src="/images/2021/2021-0712-002.png" title="ID の記載場所" >}}

```
$ oci network virtual-circuit delete --virtual-circuit-id <Your-FastConnect-resource-id>
```

## まとめ

誤った手順で Azure ExpressRoute と Oracle FastConnect を削除してしまった結果、FastConnect が Failed になってしまった時の対処方法をまとめました。すべては公式ドキュメントを見ずに勢いで削除作業に挑戦した私が悪いです。すべての Connection を削除してから FastConnect を削除しなければならないことは次のドキュメントに記載されています。

[相互接続リンクを削除する](https://docs.microsoft.com/ja-jp/azure/virtual-machines/workloads/oracle/configure-azure-oci-networking#delete-the-interconnect-link)

---
title: Azure Stack のアップデート時間を比較する（Full vs Express）
author: kongou_ae
date: 2019-05-29
url: /archives/2019/05/full-vs-express-about-update
categories:
  - azurestack
---

## はじめに

[Azure Stack のアップデートがちょっと変わった](https://aimless.jp/blog/archives/2019/05/full-and-express-for-update-of-azure-stack/)で説明した通り、Microsoft のリリースする Azure Stack のアップデートが "Full" と "Express" という2種類になりました。前回のエントリでは方式による具体的な時間の差を取り上げられませんでしたが、[ハイブリッドクラウド研究会(hccjp)](http://www.hccjp.org/)の検証環境を借りられましたので実際の比較します。

## 環境

- [ハイブリッドクラウド研究会(hccjp)](http://www.hccjp.org/)が所有する Azure Stack Integrated systems
  - Huawei
  - 4 Node
  - MS 1.1903.2.39

[ハイブリッドクラウド研究会のページ](http://www.hccjp.org/poc/)からハイブリッドクラウド研究会が保有している Azure Stack Integrated system での検証を申し込めます。Azure Stack Integrated system を触ってみたい方はぜひ申請しましょう。ハイブリッドクラウド研究会の検証環境は、利用者だけでなく管理者の参照権限も付与してもらえる太っ腹環境です。

## アップデート時間

hccjp の Azure Stack Integrated system に適用されている Microsoft 版アップデートの一覧は次の通りです。

{{< figure src="/images/2019-05-29-001.png" title="これまでのアップデート時間" >}}

"VERSION" が 1.1902.0 までのアップデートが従来の "Full" アップデートです。20時間から30時間ほどかかっているのが分かります。一方で1.1903.0 は新たに導入された "Express" アップデートです。このアップデートは12時間で終わっています。"Full" と比較してほぼ半分になっています。

## まとめ

[ハイブリッドクラウド研究会(hccjp)](http://www.hccjp.org/)の検証環境を利用して、"Full" と "Express" のアップデートにかかる具体的な時間をご紹介しました。"Express" パッケージによる時間の短縮具合をご理解いただけたと思います。

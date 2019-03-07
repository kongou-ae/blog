---
title: Azure Stack 1902 Update
author: kongou_ae
date: 2019-03-07
url: /archives/2019-03-07-azurestack-update-1902
categories:
  - azurestack
---

## はじめに

Azure Stack 1902 Update が公開されました。気になった個所をまとめます。

<blockquote class="twitter-tweet" data-lang="ja"><p lang="en" dir="ltr">AzS Update - 1.1902.0.69 was released. <a href="https://twitter.com/hashtag/AzureStackJP?src=hash&amp;ref_src=twsrc%5Etfw">#AzureStackJP</a></p>&mdash; こんごー (@kongou_ae) <a href="https://twitter.com/kongou_ae/status/1103369834379632640?ref_src=twsrc%5Etfw">2019年3月6日</a></blockquote>
<script async src="https://platform.twitter.com/widgets.js" charset="utf-8"></script>

参考：[Azure Stack 1902 update](https://docs.microsoft.com/en-us/azure/azure-stack/azure-stack-update-1902)

## 新機能

1902 Update では新機能がリリースされませんでした。そもそも、リリースノートに New features の章が存在しません。残念。

## 不具合修正

1902 Update のリリースノートには、Fixed issues の章も存在しません。1901 Update で主要な不具合を改修しつくしたのでしょうか。known issueはまだまだたくさんあるのですが・・・

参考：[Known issues (post-installation)](https://docs.microsoft.com/en-us/azure/azure-stack/azure-stack-update-1902#known-issues-post-installation)

## 変更点

Offer や Plan 、Quota の設定画面が変わりました。2019 年 3月時点の Azure Stack ポータルのように、設定項目がタブで表示されるようになりました。

ERCS VM の必要メモリが、8G から 12G に増加しました。ERCS VM は 3台構成なので、3台合計で 12G のメモリが Azure Stack の基盤に持っていかれます。ERCS VM のメモリ不足によるトラブルが起きたこともあるので、抜本的な対策を打ったと思われます。

## まとめ

ブログのネタになりそうな新機能がまったくリリースされませんでした。残念です。1か月間ブログのネタがないことが短期的な悩みです。1903 Upadte に期待します。

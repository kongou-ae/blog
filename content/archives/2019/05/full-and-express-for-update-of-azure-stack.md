---
title: Azure Stack のアップデートがちょっと変わった
author: kongou_ae
date: 2019-05-26
url: /archives/2019/05/full-and-express-for-update-of-azure-stack
categories:
  - azurestack
---

## はじめに

本エントリーでは、Microsoft が Azure Stack 1903 Update から始めた新しいアップデートの方針を説明します。

参考：[Update azure-stack-updates.md #125](https://github.com/MicrosoftDocs/azure-stack-docs/pull/125/files)

## Full vs Express

1902 Update 以前の Azure Stack のアップデートは、Host Node の OS イメージを毎回作り直していました。そのため、アップデートのたびに Host Node の再起動が必要となり、「アップデートの適用に約20時間から30時間ほどかかる」という課題がありました。

参考：[Azure Stack をアップデートする](https://aimless.jp/blog/archives/2018-12-16-updating-azurestack/)

1903 Update からは、"Express" とよばれる アップデートがリリースされるようになりました。"Express" とは Host Node の OS に対するアップデートを含まないアップデートです。Host Node の OS に対するアップデートが含まれていないので、アップデートの適用時に Host Node の再起動が不要となり、アップデートの適用にかかる時間が短縮されます。直近の1903 Update と1904 Update はともに "Express" なアップデートでした。その結果、アップデートの想定時間が20時間を下回るようになりました。

## おわりに

1903 Update から導入された "Express" なアップデートについて説明しました。Azure Stack を運用するうえで、毎月実施が必要なアップデートの所要時間が長いことは課題の一つです。この課題を解消する施策を Microsoft が始めてくれたことに感謝です。

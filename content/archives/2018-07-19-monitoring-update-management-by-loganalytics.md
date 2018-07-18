---
title: Update Managementの結果をメールで通知する
author: kongou_ae
date: 2018-07-19
url: /archives/2018-07-19-monitoring-update-management-by-loganalytics
categories:
  - azure
---

Azureの[Update Management](https://docs.microsoft.com/ja-jp/azure/automation/automation-update-management)を使うと、Windows ServerとLinux Serverのパッチ適用を自動化できます。

Update Managementを評価するために、Update Managementで毎日20時30分にパッチを適用しているWindows Serverがあります。たまーーーにパッチの適用に失敗します。


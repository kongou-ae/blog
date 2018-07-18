---
title: Update Managementの結果をメールで通知する
author: kongou_ae
date: 2018-07-19
url: /archives/2018-07-19-monitoring-update-management-by-loganalytics
categories:
  - azure
---

## 背景

Azureの[Update Management](https://docs.microsoft.com/ja-jp/azure/automation/automation-update-management)を使うと、Windows ServerとLinux Serverのパッチ適用を自動化できます。WSUSやSCCMが存在せず、手作業でパッチを適用している環境にお勧めソリューションです。

Update Managementを評価するために、Update Managementで毎日20時30分にパッチを適用しているWindows Serverがあります。

{{<img src="./../../images/2018-07-19-002.png">}}

このサーバにログインした際に、パッチの適用が失敗していることに気が付きました。ログインした際に失敗に気が付くのは最悪です。失敗した時点で気が付いて手動でリカバリすべきです。そのためには失敗したことを速やかに管理者に通知する必要があります。Update Managementには通知の機能がなさそうなので、Log Analyticsでやってみました。

## やってみた

Update ManagementはAutomationのHybrid Runbook WorkerとLog Analyticsの組み合わせで実現されています。そのため、パッチ適用の結果がパッチ単位でLog Analyticsに転送されます。転送されたログはUpdateRunProgressのTypeで記録されています。

{{<img src="./../../images/2018-07-19-003.png">}}

適用前はInstallationStatusがNotStarted、適用に成功するとInstallationStatusはSucceededに、適用に失敗するとInstallationStatusがInstall Failedになるようです。

ということは、InstallationStatusがSucceededなログの有無を条件としてアラートを設定することで、Update Managementがパッチ適用に成功したことをメールで通知できます。

{{<img src="./../../images/2018-07-19-004.png">}}

{{<img src="./../../images/2018-07-19-005.png">}}

Log Analyticsの通知メールには条件に引っかかったログが記載されます。届いたメールを見れば、どのサーバにどのパッチが当たったのかが分かります。

{{<img src="./../../images/2018-07-19-006.png">}}

同様に、InstallationStatusがNotStartedでもSucceededでもないログの有無を条件としてアラートを設定することで、Update Managementがパッチ適用に失敗したことをメールで通知できます。これで、パッチ適用に失敗した直後にパッチ適用の失敗に気が付けます。

{{<img src="./../../images/2018-07-19-007.png">}}








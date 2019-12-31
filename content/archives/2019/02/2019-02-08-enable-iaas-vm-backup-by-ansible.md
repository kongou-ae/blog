---
title: Ansible で Azure IaaS VM backup を有効化する
author: kongou_ae
date: 2019-02-08
url: /archives/2019-02-08-enable-iaas-vm-backup-by-ansible
categories:
  - azure
  - ansible
---

## はじめに

Ansible で Azure の Virtual Machine に対して IaaS VM Backup を有効化するのに苦戦したのでメモ。

## モジュールが対応していない？

Azure IaaS VM backup は、Recovery Service Vault によって提供されます。しかし、Azure モジュールには、Recovery Serivce Vault が存在しません。Azure preview モジュールにも Recovery Serivce Vault が存在しません。困りました。

## azure_rm_deployment を使う

Azure モジュールは、azure_rm_deployment で ARM テンプレートによるデプロイをサポートしています。Azure モジュールが Recovery Serivce Vault を抽象化してくれないので、ARM テンプレートを使って IaaS VM Backup を有効化します。

Playbook のサンプルは次の通りです。対象の Virtual Machine に対して、夜8時にバックアップを取得して三世代保管するバックアップポリシーを適用します。

```
  - name: Create Recovery servive vault and policy
    azure_rm_deployment:
      state: present
      resource_group: myResourceGroup
      location: eastus
      template_link: 'https://gist.githubusercontent.com/kongou-ae/c72aa929242c98d1016fa42c1ab0e608/raw/5d74c950cc2265738dee258c8108de09c548977c/createvault.json'
      parameters:
        vaultName:
          value: vaulttest
        policyName:
          value: daily-0300
        scheduleRunTimes:
          value: 
            - "2019-02-08T20:00:00+00:00"
        timeZone:
          value: "Tokyo Standard Time"
        dailyRetentionDurationCount:
          value: 3
  - name: Enable VM Backup
    azure_rm_deployment:
      state: present
      resource_group: myResourceGroup
      location: eastus
      template_link: 'https://gist.githubusercontent.com/kongou-ae/447e0f82bfaf31720f48d35c9ecfdb8b/raw/c792b34b306e6fba2b335d6e19c5c01991c6ce19/enablevmbackup.json'
      parameters:
        existingVirtualMachinesResourceGroup:
          value: myResourceGroup
        existingVirtualMachines:
          value: 
            - myVM
        existingRecoveryServicesVault:
          value: vaulttest
        existingBackupPolicy:
          value: daily-0300
```

azure_rm_deployment では、サーバ上のテンプレートを参照できません。上記のように `template_link` を利用して Web サーバ上のテンプレートを参照するか、 `template` を利用して Playbook の中に ARM テンプレートの内容を直接記載する必要があります。直接記載するサンプルは、 Ansible の公式ドキュメントに記載されています。

参考：[azure_rm_deployment - Create or destroy Azure Resource Manager template deployments](https://docs.ansible.com/ansible/latest/modules/azure_rm_deployment_module.html)

## 気になったこと

### 時刻を UTC で指定したほうがよい

`scheduleRunTimes` で指定するバックアップの開始時間は、UTC タイムゾーン付きの表記が良いようです。気を利かせて +09:00 にすると、UTC に変換された時間が設定されてしまいます。

20:00:00+09:00 のタイムゾーン表記を設定した場合、バックアップのポリシーに設定される時間は9時間引かれた11時になります。

```
scheduleRunTimes:
  value: 
    - "2019-02-08T20:00:00+09:00"
```

{{< figure src="./../../images/2019-02-08-001.png" title="JST タイムゾーンで設定した場合のポリシー" >}}

20:00:00+00:00 のタイムゾーン表記を設定した場合、バックアップのポリシーに設定される時間は20時になります。

```
scheduleRunTimes:
  value: 
    - "2019-02-08T20:00:00+00:00"
```

{{< figure src="./../../images/2019-02-08-002.png" title="UTC タイムゾーンで設定した場合のポリシー" >}}


### 毎回 Change になってしまう

同じ Playbook を複数回実行すると、azure_rm_deployment の部分が必ず Change になります。実際にログを見ると、Virtual Machine のバックアップ設定が毎回実施されています。「 ARM テンプレートは、存在しており設定が変更されないリソースに対して何の操作もしない」という認識なのですが、何故だろう。

{{< figure src="./../../images/2019-02-08-003.png" title="Ansible の出力" >}}

{{< figure src="./../../images/2019-02-08-004.png" title="バックアップジョブの表示" >}}

## まとめ

Ansible で IaaS VM backup を有効化する方法をまとめました。毎回 change になるという不思議な動きをしますが、初期構築では十分に使える方法だと思います。




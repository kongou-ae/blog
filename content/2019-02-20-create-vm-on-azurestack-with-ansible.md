---
title: Ansible で Azure Stack に Virtual Machine を作る
author: kongou_ae
date: 2019-02-20
url: /archives/2019-02-20-create-vm-on-azurestack-with-ansible
categories:
  - azurestack
---

## はじめに

「Azure と一貫性をのある API を持つ Azure Stack なら、Ansible を使って Virtual Machine を作れるはずだ」ということで、ASDK を利用して実際に試してみました。結論から言うと、Ansible 2.4 でサービスプリンシパルを使うと、Ansible で Azure Stack 上に Virtual Machine を作れました。

## 環境

- ASDK 1901 @[物理コンテナ](https://thinkit.co.jp/article/13243)
- Ubuntu 18.04 on ASDK 1901

## Ansible 2.7.7

`pip install ansible[azure]` でインストールした Ansible 2.7.7 だと、Virtual Network の作成がエラーになります。

```bash
    "msg": "Error creating or updating virtual network myVnet - Azure Error: NoRegisteredProviderFound\nMessage: No registered resource provider found for location 'local' and API version '2017-11-01' for type 'virtualNetworks'. The supported api-versions are '2014-12-01-preview, 2015-05-01-preview, 2015-06-15, 2016-03-30, 2016-06-01, 2016-07-01, 2016-08-01, 2016-09-01, 2016-10-01, 2016-11-01, 2016-12-01, 2017-03-01, 2017-04-01, 2017-06-01, 2017-08-01, 2017-09-01, 2017-10-01'. The supported locations are 'local'."
```

エラーの原因は、Azure Stack が Ansible の利用している 2017-11-01 の ネットワークの API をサポートしていないことです。1901 Update の Azure Stack がサポートするネットワークの API は 2017-10-01 です。わずか一か月。惜しい。

## Ansible 2.4.0

Ansible が利用する API のバージョンを下げるために、Ansible そのもののバージョンを下げます。マネージドディスクと可用性セットをサポートする 2.4 が最終防衛線だと考えるので、2.4 を入れなおします。

```bash
pip install ansible[azure]\==2.4
```

なお、Azure CLI で Azure Stack に接続している状態でも、Ansible の認証がエラーになりました。原因が得的出来なかったので、 `/etc/credentails` ファイルにサービスプリンシパルの情報を記載する方式で認証を突破します。Azure AD に作成したサービスプリンシパルを、 Azure Stack 上のサブスクリプションの IAM に追加するのを忘れずに。

```bash
[default]
subscription_id=81373782-f242-4e53-9a9e-ee9168ecc0f3
client_id=c6957708-cc0a-xxxx-xxxx-xxxxxxxxxxxx
secret=fd495ddd-e536-xxxx-xxxx-xxxxxxxxxxxx
tenant=50f9de73-a175-xxxx-xxxx-xxxxxxxxxxxx
cloud_environment=https://management.local.azurestack.external
```

普段の Ansible のように `/etc/credentails` を記入すると、Ansible は AzureCloud を操作しようとします。Azure Stack を操作する際は、`cloud_environment` に Azure Stack の ARM エンドポイントの FQDN を記入します。こうすることで、Ansible は `cloud_environment` に記載された Azure Stack にアクセスします。

Playbookを書く際の注意点はリージョン名です。利用する Azure Stack のリージョン名を明記しましょう。今回は ASDK を利用したので、Playbook 上のリージョン名は `local` です。

```yaml
- name: Create Azure VM
  hosts: localhost
  connection: local
  tasks:
  - name: Create resource group
    azure_rm_resourcegroup:
      name: myResourceGroup
      location: local
```

参考：[Azure Stack 上で動いた Playbook](https://gist.github.com/kongou-ae/a81bdeed056303cf3f54813d7ea47a3e)

## まとめ

Ansible を利用することで Azure と同じように Azure Stack 上にも Virtual Machine を作れることがわかりました。Ansible は、Terraform の様にAzure Stack が別のモジュールになっていません。そのため、Azure と Azure Stack で同じ Playbook を利用することも夢ではありません。

ただし、同じモジュールで異なる環境を操作することになるので、Azure Stack 特有の次の点に注意しましょう。

- Azure Stack の API バージョンに対応した Ansible を利用する
- Ansible に Azure Stack の ARM エンドポイントを設定する
- リージョン名を 利用される Azure Stack のリージョン名にする

---
title: Lighthouse を利用して Shared Image Gallary を他のテナントに公開する
author: kongou_ae
date: 2019-10-06
url: /archives/2019/10/share-sig-to-other-tenant-with-lighthouse
categories:
  - azure
---

## サマリ

- Lighthouse を使えば、Shared Image Gallary を簡単に異なるテナントに共有できる
- 2019年10月現在、Ansible で Shared Image Gallary を利用して VM を作る場合は Developブランチが必要

## Shared Image Gallary を異なるテナントに共有する

公式ドキュメントでは、Service Principle を利用して Shared Image Gallary を異なるテナントに共有する方法が公開されています。

[Azure テナント間でギャラリー VM イメージを共有する](https://docs.microsoft.com/ja-jp/azure/virtual-machines/windows/share-images-across-tenants?WT.mc_id=AZ-MVP-5003408)

ですが、イメージを共有するためだけに 共有する側と共有される側の両方に Azure Active Direcroty の Service Principle を作るのは手間がかかりすぎです。実際に運用で利用する場合、AWS の AMI を異なるアカウントに共有するときのように、共有するテナント側の作業だけで共有が完了する手法が望ましいです。

[[EC2] カスタムAMIの活用：共有とコピー](https://dev.classmethod.jp/cloud/aws/ec2-using-ami/)

そこで、Lighthouse を利用します。Shared Image Gallary だけを含むリソースグループを用意したうえで、そのリソースグループに対する参照権限を異なるテナントのユーザに委任します。イメージを共有したいユーザからユーザID と Azure AD のテナント ID をヒアリングしたうえで、Lighthouse を設定します。

参考：[Azure の委任されたリソース管理に顧客をオンボードする](https://docs.microsoft.com/ja-jp/azure/lighthouse/how-to/onboard-customer#create-an-azure-resource-manager-template?WT.mc_id=AZ-MVP-5003408)

設定が完了すると、イメージを共有する側のテナントのサービスプロバイダに、イメージを共有される側のテナントが表示されます。

{{< figure src="/images/2019-10-06-001.png" title="共有する側の Lighthouse の画面" >}}

イメージを共有される側のアカウントで Azure ポータルにログインすると、イメージを共有される側のテナントの Customer にイメージを共有する側のテナントが表示されます。準備万端です。

{{< figure src="/images/2019-10-06-002.png" title="共有される側の Lighthouse の画面" >}}

## Shared Image Gallary を利用して Ansible で Virtual Machine を作成する

サブスクリプションフィルターで Shared Image Gallary を共有したテナントとサブスクリプションを選択すれば、共有された側の Azure ポータルに Shared Image Gallary が表示されます。表示されてしまえば、あとは自分のテナントの Shared Image Gallary と同じように Virtual Machine を作れます。

{{< figure src="/images/2019-10-06-003.png" title="共有された Shared Image Gallary の画面" >}}

ポータルから Virtual Machine を作っても面白くないので、今回は Anbile を使って Virtual Machine を作ります。

Ansible 2.8 の azure_rm_virtualmachine は Shared Image Gallay に対応していません。Ansible で Shared Image Gallary を利用するためには、devel ブランチを利用する必要があります。

次のコマンドで CloudShell に devel な Ansible をインストールします。

```bash
~$ pip install git+https://github.com/ansible/ansible.git@devel --user
~$ pip install ansible[azure] --user
~$ ./.local/bin/ansible --version
ansible 2.10.0.dev0
  config file = None
  configured module search path = ['/home/vmoperator/.ansible/plugins/modules', '/usr/share/ansible/plugins/modules']
  ansible python module location = /home/vmoperator/.local/lib/python3.5/site-packages/ansible
  executable location = ./.local/bin/ansible
  python version = 3.5.2 (default, Jul 10 2019, 11:58:48) [GCC 5.4.0 20160609]
```

devel な Ansible は image の部分に id が指定できるようになっています。その id に Shared Image Gallary 上の イメージの ID を指定すれば OK です。

{{< figure src="/images/2019-10-06-004.png" title="イメージの ID" >}}

```yaml
image:
  id: /subscriptions/xxxxxxxx-xxxx-xxxx-xxxx-c5bd3103e127/resourceGroups/sharedimage/providers/Microsoft.Compute/galleries/customWindows/images/Windows/versions/1.0.0
```








---
title: Azure Cloud Shell で Ansible の devel ブランチを利用する
author: kongou_ae
date: 2019-10-17
url: /archives/2019/10/using-ansible-devel-in-cloudshell
categories:
  - azure
---

新しめの Azure サービスを Ansible で操作しようとすると、対応する Ansible のモジュールが devel ブランチのみに存在することがあります。Root 権限を持っている環境であれば、[devel ブランチの Ansible を pip でインストールする方法](https://tekunabe.hatenablog.jp/entry/2018/05/09/ansible_install_devel) のとおりにインストールすることで devel ブランチの Ansible を利用できますが、Cloud Shell の場合は権限が足りないため次のエラーが出てしまいます。

```bash
ERROR: Could not install packages due to an EnvironmentError: [Errno 13] Permission denied: '/usr/local/lib/python3.5/dist-packages/markupsafe'
Consider using the `--user` option or check the permissions.
```

Cloud Shell 上で devel ブランチの Ansible を使う場合は、Ansible をユーザディレクトリにインストールします。

```bash
pip install git+https://github.com/ansible/ansible.git@devel --user
pip install ansible[azure] --user
```

インストール先を指定しなければ devel ブランチの Ansible は `$HOME/.local/bin` 配下にインストールされます。インストールした Ansible を実行する際はフルパスを指定しましょう。

```bash
@Azure:~$ ls $HOME/.local/bin
ansible         ansible-connection  ansible-doc     ansible-inventory  ansible-pull  ansible-vault
ansible-config  ansible-console     ansible-galaxy  ansible-playbook   ansible-test
vmoperator@Azure:~$ ./.local/bin/ansible --version
ansible 2.10.0.dev0
  config file = None
  configured module search path = ['/home/vmoperator/.ansible/plugins/modules', '/usr/share/ansible/plugins/modules']
  ansible python module location = /home/vmoperator/.local/lib/python3.5/site-packages/ansible
  executable location = ./.local/bin/ansible
  python version = 3.5.2 (default, Jul 10 2019, 11:58:48) [GCC 5.4.0 20160609]
```




---
title: Test Kitchenを稼働中のサーバに使う
author: kongou_ae

date: 2017-04-27
url: /archives/2017-04-27-use-testkitchen-against-existing-server
categories:
  - ansible
  - serverspec
  - test-kitchen
---

## What

- すでに動いているサーバをTestKitchenの管理下に置く方法
- TestKitchenの力を借りて、AnsibleとServerspecを連携する方法

## Why

TestKitchenを使うとAnsibleとServerspecがシームレスに連携します。それぞれのツールのインベントリファイルを用意する必要はありません。各ツールが連携してくれることにより、kitchen create → kitchen converge → kitchen verify と打つだけで、テスト環境の構築と設定、テストが完了します。この気軽さになれてしまうとAnsibleやServerspecの生コマンドを打つのが面倒になります。

気軽なものになれてしまうと、TestKitchenを利用してテストしたAnsibleとServerspecのコードを、TestKitchenで本番環境にデプロイしたくなります。この思い付きをTestKitchenが用意しているProxyドライバを使うことで実現できそうだったので試しました。

## How

### TestKitchenの設定

.kitchen.ymlは次のとおりです。テスト対象サーバのdriverをProxyで設定するのがポイントです。

```
---
platforms:
  - name: windows2012R2
    os_type: windows
    driver:
      name: proxy
      host: ec2-54-238-188-116.ap-northeast-1.compute.amazonaws.com
      reset_command: "ping localhost"
      username: administrator
      password: $2V=bWYEiPr
      port: 5986
    transport: 
      name: winrm
      username: administrator
      password: $2V=bWYEiPr
      port: 5986
      winrm_transport: ssl
    provisioner:
      name: ansible_push
      chef_bootstrap_url: nil
      ansible_port: 5986
      verbose: v
      ansible_connection: winrm
      playbook: test/integration/default/site.yml
    verifier:
      name: shell
      command: 'cd test/integration/default/ && rake spec'

suites:
  - name: default
```

ディレクトリ構成は次のとおりです。

```
.
├── .kitchen.yml
├── chefignore
└── test
    └── integration
        └── default
            ├── Rakefile
            ├── roles
            │   └── test
            │       └── tasks
            │           └── main.yml
            ├── site.yml
            └── spec
                ├── localhost
                │   └── hostname_spec.rb
                └── spec_helper.rb
```

### 既存サーバをTestKitchenの管理下に置く

まずは対象サーバをTestKitchenで管理下するためにkitchen createします。kitchen createが成功すると、kitchen listにplatformsで定義したサーバが出てきます。

```
$ kitchen create
-----> Starting Kitchen (v1.16.0)
-----> Creating <default-windows2012R2>...
       Resetting instance state with command: ping localhost
       
       WIN-G9B17NT9AD7 [127.0.0.1]に ping を送信しています 32 バイトのデータ:
       127.0.0.1 からの応答: バイト数 =32 時間 <1ms TTL=128
       127.0.0.1 からの応答: バイト数 =32 時間 <1ms TTL=128
       127.0.0.1 からの応答: バイト数 =32 時間 <1ms TTL=128
       127.0.0.1 からの応答: バイト数 =32 時間 <1ms TTL=128
       
       127.0.0.1 の ping 統計:
           パケット数: 送信 = 4、受信 = 4、損失 = 0 (0% の損失)、
       ラウンド トリップの概算時間 (ミリ秒):
           最小 = 0ms、最大 = 0ms、平均 = 0ms
       Finished creating <default-windows2012R2> (0m3.82s).
-----> Kitchen is finished. (0m4.14s)
$ kitchen list
Instance               Driver  Provisioner  Verifier  Transport  Last Action  Last Error
default-windows2012R2  Proxy   AnsiblePush  Shell     Winrm      Created      <None>
```

.kitchenディレクトリの配下に、管理下に置かれているサーバの情報がymlで格納されます。

```
├── .kitchen
│   ├── default-windows2012R2.yml
│   └── logs
│       ├── default-windows2012R2.log
│       └── kitchen.log
```

## 既存サーバをAnsibleで構築する

次にansibleでサーバを構築するためにkitchen convergeします。今回利用するplaybookはwin_pingモジュールのみです。

```
 $ kitchen converge 
-----> Starting Kitchen (v1.16.0)
-----> Converging <default-windows2012R2>...
$$$$$$ Running legacy converge for 'Proxy' Driver
       Preparing files for transfer
       *************** AnsiblePush install_command ***************
       Ansible push config validated
       True
       Transferring files to <default-windows2012R2>
       True
       *************** AnsiblePush run ***************
No config file found; using defaults

PLAY [all] **********************************************************************************************************************************************

TASK [test : ping] **************************************************************************************************************************************
ok: [windows2012R2] => {"changed": false, "ping": "pong"}

PLAY RECAP **********************************************************************************************************************************************
windows2012R2              : ok=1    changed=0    unreachable=0    failed=0   

       *************** AnsiblePush end run *******************
       True
       Finished converging <default-windows2012R2> (0m4.70s).
-----> Kitchen is finished. (0m5.33s)
```

ansiblepushの内部では次のコマンドが実施されています。

```
ansible-playbook --inventory-file=`which kitchen-ansible-inventory` -v --limit=windows2012R2 test/integration/default/site.yml
```

Inventoryとして指定されているkitchen-ansible-inventoryがポイントです。kitchen-ansible-inventoryは、provisionerで指定されている値と.kitchenディレクトリ配下に保存されているサーバの情報を利用してansibleのインベントリを生成します。この機能のおかげで、ansibleのインベントリファイルを作らなくて済みます。

```
 $ cat .kitchen/default-windows2012R2.yml 
---
hostname: ec2-54-238-188-116.ap-northeast-1.compute.amazonaws.com
last_action: converge
last_error: 
 $  kitchen-ansible-inventory 
{
  "all": [
    "windows2012R2"
  ],
  "_meta": {
    "hostvars": {
      "windows2012R2": {
        "ansible_ssh_host": "ec2-54-238-188-116.ap-northeast-1.compute.amazonaws.com",
        "ansible_ssh_user": "administrator",
        "ansible_ssh_pass": "$2V=bWYEiPr",
        "ansible_ssh_port": 5986,
        "ansible_winrm_server_cert_validation": "ignore",
        "ansible_winrm_transport": "ssl",
        "ansible_connection": "winrm"
      }
    }
  }
}
```

## 既存サーバをServerspecでテストする

最後に、Serverspecでサーバを構築するためにkitchen verifyを実施します。今回のテスト項目はホスト名だけです。

```
 $  cat test/integration/default/spec/localhost/hostname_spec.rb 
require 'spec_helper'

describe command('hostname') do
  its(:stdout) { should match /WIN-G9B17NT9AD7/ }
end
 $ kitchen verify
-----> Starting Kitchen (v1.16.0)
-----> Setting up <default-windows2012R2>...
$$$$$$ Running legacy setup for 'Proxy' Driver
       Finished setting up <default-windows2012R2> (0m0.00s).
-----> Verifying <default-windows2012R2>...
       [Shell] Verify on instance=#<Kitchen::Instance:0x000000021beef8> with state={:username=>"administrator", :password=>"$2V=bWYEiPr", :port=>5986, :hostname=>"ec2-54-238-188-116.ap-northeast-1.compute.amazonaws.com", :last_action=>"setup", :last_error=>nil}
/usr/local/rvm/rubies/ruby-2.3.0/bin/ruby -I/usr/local/rvm/gems/ruby-2.3.0@global/gems/rspec-support-3.5.0/lib:/usr/local/rvm/gems/ruby-2.3.0@global/gems/rspec-core-3.5.4/lib /usr/local/rvm/gems/ruby-2.3.0@global/gems/rspec-core-3.5.4/exe/rspec --pattern spec/localhost/\*_spec.rb

Command "hostname"
  stdout
    should match /WIN-G9B17NT9AD7/

Finished in 0.93135 seconds (files took 1.12 seconds to load)
1 example, 0 failures

       Finished verifying <default-windows2012R2> (0m2.33s).
-----> Kitchen is finished. (0m2.79s)
```

テストが成功しました。Serverspecは、TestKitchenが設定した環境変数をインベントリに利用しています。このおかげでServerSpec用のインベントリを用意しなくて済みます。

```
 $  cat test/integration/default/spec/spec_helper.rb 
require 'serverspec'
require 'winrm'

set :backend, :winrm

opts = {
  user: ENV['KITCHEN_USERNAME'],
  password: ENV['KITCHEN_PASSWORD'],
  endpoint: 'https://' + ENV['KITCHEN_HOSTNAME'] + ':5986/wsman',
  operation_timeout: 300,
  no_ssl_peer_verification: true
} 

winrm = WinRM::Connection.new(opts)
Specinfra.configuration.winrm = winrm
```

## Summary

- 気軽。コマンドを悩まないので、作業のリズム感がよい。
- 間違ったTestKitchenの使い方な気がする。
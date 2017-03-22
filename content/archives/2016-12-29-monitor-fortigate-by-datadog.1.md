---
title: DatadogでFortiGateを監視する
author: kongou_ae
date: 2016-12-29
url: /archives/2016-12-29-monitor-fortigate-by-datadog
categories:
  - aws
---

## 背景

サーバの監視をDatadogに集約した場合、オンプレミスのネットワーク機器もDatadogで監視したくなります。DatadogにはSNMP Integrationがあるので、自宅のFortiGateで試してみました。

## 実践

### Datadogエージェントをインストールする

Datadogで監視するためには、Datadogのエージェントを使ってメトリクスを送信する必要があります。FortiGateにはDatadogのエージェントがインストールできないため、適当なサーバにDatadogのエージェントをインストールします。このサーバが、ネットワーク機器監視サーバの役割を担います。

### SNMP Intergartionを設定する

`/etc/dd-agent/conf.d`配下に`snmp.yaml`を用意します。今回は次の`snmp.yml`を使います。

```
init_config:
#    #You can specify an additional folder for your custom mib files (python format)
#    mibs_folder: /path/to/your/mibs/folder
#    ignore_nonincreasing_oid: False
instances:
- ip_address: xxx.xxx.xxx.xxx
  port: 161
  community_string: hogehoge
  snmp_version: 2
  timeout: 1
  retries: 5
  enforce_mib_constraints: true
  tags:
    - Fortigate50B
  metrics:
    - OID: 1.3.6.1.4.1.12356.101.4.1.3.0
      name: fgSysCpuUsage
    - OID: 1.3.6.1.2.1.2.2.1.10.3
      name: ifInOctets
      forced_type: counter
    - OID: 1.3.6.1.2.1.2.2.1.16.3
      name: ifOutOctets
      forced_type: counter
    - OID: 1.3.6.1.4.1.12356.101.4.1.4.0
      name: fgSysMemUsage
    - OID: 1.3.6.1.4.1.12356.101.4.1.8.0
      name: fgSysSesCount
```

`metrics`の箇所は、OIDを直接指定する方法を選択しました。MIBファイルを読み込ませた上でMIBシンボル名を指定する方法もあります。ただし、カスタムMIBは設定が大変そうです。

参考：[カスタムmibファイルのSMNP Integration用のpythonファイルへの変換し、yamlへ設定する](http://qiita.com/jhotta/items/bde47e870da8d2d52001)）。

また、`tags`をつけることで、Datadogのタグ機能を活用できます。ただし、`tags`をつけなくても、SNMP Integrationで取得した情報には`snmp_device:xxx.xxx.xxx.xxx`という識別子がつきますので、どの機器のメトリクスかを区別できます。

### 監視する

Datadogにメトリクスを送っていますので、サーバと同様にメトリクスの値を利用した監視ができます。また、メトリクスの値が取れていない際にエラーとみなす設定をつむことで、単純な死活監視もできます。

### ダッシュボードを作る

それっぽいダッシュボードができました。

![](https://aimless.jp/blog/images/2016-12-29-002.png)

ifInOctetsとifOutOctetsの値をそのままグラフにすると、単位がOctetsPerSecondになってしまいます。そこで、グラフに秒する値を8倍してBitPerSecondにします。

![](https://aimless.jp/blog/images/2016-12-29-003.png)

FortiGate50Bのダッシュボードにしたいので、タグでフィルタをかけます。`snmp.yaml`に設定した`tags`がここで活きてきます。`snmp_device:xxx.xxx.xxx.xxx`という識別子でフィルタをかけることもできます。

![](https://aimless.jp/blog/images/2016-12-29-004.png)

長期間のグラフを描画すると、データが丸まります（参考：[4) メトリクスの値のロールアップ(値を丸める)](http://docs.datadoghq.com/ja/graphing/#section-5)）。デフォルトは平均値で丸められます。最大値で丸めるためには、明示的に最大値でのrollupを設定します。

![](https://aimless.jp/blog/images/2016-12-29-005.png)

Datadogのダッシュボードは変数が使えます。タグでフィルタをかける部分を変数にすることで、1つのダッシュボードをつかって、複数のネットワーク機器のメトリクスを見られそうです。

![](https://aimless.jp/blog/images/2016-12-29-006.png)

![](https://aimless.jp/blog/images/2016-12-29-007.png)

![](https://aimless.jp/blog/images/2016-12-29-009.png)

## 感想

DatadogのSNMP Integrationをつかうことで、ネットワーク機器の監視や可視化でおなじみのMRTGやCactiと同じことができそうです。サーバの監視ツールとしてDatadogを利用している環境であれば、ネットワーク機器の監視をDatadogに集約するのはありだと思いました。

今回は技術的にできるのかを確認しました。そのため、費用に関する部分は未確認です。別途、SNMP Integrationの課金周り、特にSNMP Integrationがカスタムメトリクスに該当するのかを確認します。

参考：[課金に関するFAQ](http://docs.datadoghq.com/ja/guides/billing/)

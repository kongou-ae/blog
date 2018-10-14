---
title: Service Endpoint Policiesを試す
author: kongou_ae
date: 2018-10-14
url: /archives/2018-10-14-try-service-endpoint-policies
categories:
  - azure
---

## はじめに

Microsoft Ignite 2018 で Service Endpoint Policies という新機能がアナウンスされました。本エントリーでは、この Service Endpoint Policies を試した結果をまとめます。

## Service Endpoint Policies とは

Service Endpoint Policies とは Service Endpoint 経由でアクセスできる Azure サービスを制限する機能です。2018年10月現在、Service Endpoint Policies はプレビューであり、対象サービスもAzure Storage に限られています。

そもそも、Service Endpoint とは、VNet 内のサブネットに Azure サービスへの裏口を作る機能です。Service Endpoint を有効にすると、Azure サービスで利用されているグローバルIPアドレス宛てのルーティングがサブネットに注入されます。そのため、グローバルIPアドレスで提供されている Azure サービスあての通信が0.0.0.0/0にマッチしなくなり、裏口から抜けていくようになります。Service Endpoint で Storage を有効にすると、次のようなルーティングが注入されます。

{{<img src="./../../images/2018-1014-001.png">}}

ただし、Azure サービスはマルチテナントなので、複数のユーザが同じアドレスを利用しています。そのため、この裏口を経由して他人の所有する Azure リソースにもアクセスできてしまいます。これまでは、裏口経由でアクセスできる Azure リソースを制限できませんでした。これを制限できるようにするのが Service Endpoint Policies です。

{{<img src="./../../images/2018-1014-003.png">}}

参考：[BRK2311 - Planning network security for your mission-critical workloads with Virtual Networks (VNets)](https://myignite.techcommunity.microsoft.com/sessions/66297?source=sessions)

## 動作確認

### 事前準備

Service Endpoint 経由でストレージアカウントにだけアクセスできるサブネットを用意します。

Service Endpoint を Azure Storage に対して有効にします。Azure Storage を有効にした場合、VNet と同じリージョンとペアリージョンへの裏口ができます。さらに、0.0.0.0/0を存在しないIPアドレスに向けます。これでこのサブネット上の Virtual Machine は VNet 内と Azure Storage にのみアクセスできます。

{{<img src="./../../images/2018-1014-002.png">}}

### Service Endpoint Policies なしの動作

Blob Storage に誰でも読み取りできるファイルを置いたうえで、Virtual Machine から Invoke-WebRequest しました。結果は以下の通りです。VNetと同のサブスクリプション配下のストレージアカウントだけでなく、他のアブスクリプション配下のストレージアカウントにもアクセスできてしまいます。これは期待された動作です。

| 対象ストレージアカウント | サブスクリプション | 作成時期 | バージョン | 場所 |結果 | 
|------------------------|------------------|----------|-----------|------|----|
| その1 | VNetと同じ | 以前からあった | StorageV2 | VNetと同じ | アクセスできた | 
| その2 | VNetと同じ | 今回のために作った | StorageV1 | VNetと同じ | アクセスできた | 
| その3 | 別サブスクリプション | 以前からあった | StorageV1 | VNetと同じ | アクセスできた | 
| その4 | 別サブスクリプション | 今回のために作った | StorageV2 | VNetと同じ | アクセスできた | 
| その5 | 別サブスクリプション | 今回のために作った | StorageV1 | VNetと同じ | アクセスできた | 

### Service Endpoint Policies ありの動作

Service Endpoint Policies で設定できる許可の範囲は次の3択です。

1. 特定のストレージアカウント
1. 特定のリソースグループ内の全ストレージアカウント
1. 現在のサブスクリプション内の全ストレージアカウント

{{<img src="./../../images/2018-1014-006.png">}}

今回は、ストレージアカウントその1のみを許可する Service Endpoint Policies を上記の Virtual Machine が接続しているサブネットに適用します。

{{<img src="./../../images/2018-1014-004.png">}}

{{<img src="./../../images/2018-1014-005.png">}}

結果は次の通りです。なぜかストレージアカウントその3にアクセスできてしまう点を除けば、想定通りの動作です。Service Endpoint Policies で許可されていないストレージアカウントへのアクセスは「AuthorizationFailureThis request is not authorized to perform this operation.」でエラーになります。

| 対象ストレージアカウント | サブスクリプション | 作成時期 | バージョン | 場所 |結果 | 
|------------------------|------------------|----------|-----------|------|----|
| その1 | VNetと同じ | 以前からあった | StorageV2 | VNetと同じ | アクセスできた | 
| その2 | VNetと同じ | 今回のために作った | StorageV1 | VNetと同じ | アクセスできない | 
| その3 | 別サブスクリプション | 以前からあった | StorageV1 | VNetと同じ | アクセスできた | 
| その4 | 別サブスクリプション | 今回のために作った | StorageV2 | VNetと同じ | アクセスできない | 
| その5 | 別サブスクリプション | 今回のために作った | StorageV1 | VNetと同じ | アクセスできない | 

また、許可されたストレージアカウントにのみアクセスできるのであれば、Virtual Machine は Azure IaaS VM Backup 用の Azure Storageにアクセスできないはずです。ですが、Azure IaaS VM Backupは成功しました。これも想定外です・・・。

## まとめ

若干の想定外が発生しましたが、意図した Azure サービスのみを許可することができました。Service Endpoint Policies を利用することで、利便性とセキュリティを両立できるようになります。今回発生した想定外は仕様だと思うので、ドキュメントが更新されるのを待ちます。

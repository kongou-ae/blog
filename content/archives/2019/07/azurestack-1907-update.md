---
title: Azure Stack 1907 Update
author: kongou_ae
date: 2019-07-28
url: /archives/2019/07/azurestack-1907-update
categories:
  - azurestack
---

Azure stack 1907 Update がリリースされました。1907 Update で気になったものをまとめます。

- [Azure Stack 1907 update](https://docs.microsoft.com/en-us/azure-stack/operator/azure-stack-release-notes-1907)
- [Azure Stack 1907 known issues](https://docs.microsoft.com/en-us/azure-stack/operator/azure-stack-release-notes-known-issues-1907)

## ポータルからの診断ログ取得

参考：[On-demand diagnostic log collection](https://docs.microsoft.com/en-us/azure-stack/operator/azure-stack-diagnostic-log-collection-overview#on-demand-diagnostic-log-collection)

障害時の調査に利用する診断ログを Admin Portal から取得できるようになりました。1907 Update の目玉です。

ログの保存先は SAS トークンつきの Blob コンテナです。Azure の Blob だけでなく Azure Stack の Blob も利用できるので、Disconnected な環境でも利用できます。SAS トークンを利用することで他人のストレージアカウントにも診断ログを保存できます。

{{< figure src="/images/2019-07-28-003.png" title="ログを取得する画面" >}}

この機能のリリースによって、Microsoft のサポートに診断ログを提供する手順がさらに簡素化されました。

### リリース当初

リリース当初、Microsoft のサポートにログを提供する手順はかなりの手間がかかりました。具体的な手順は次の通りです。

1. PowerShell を利用して Privileged Endpoint に接続する
2. Privileged Endpoint 上の Get-AzureStackLog コマンドを利用して、診断ログを外部のファイル共有にを保存する
3. AzCopy ベースの PowerShell スクリプトを利用して、ファイル共有上の診断ログを Microsoft のサポートのストレージアカウントに転送する

手間を生み出す行為は次の2つです。

1. ファイル共有を経由した多段の転送である
1. Privileged Endpoint を使う

### 1904 Update 以降

1904 Update にて、Get-AzureStackLog コマンドに Blob コンテナに対してログを直接転送する機能が追加されました。この機能によって、手間の原因の一つである「ファイル共有による多段転送」が消滅しました。その結果、1904 Update 以降の手順は次の通りになりました。

1. PowerShell を利用して Privileged Endpoint に接続する
2. Privileged Endpoint 上の Get-AzureStackLog コマンドを利用して、 Microsoft のサポートのストレージアカウントに診断ログを直接転送する

しかし、依然として Priviledged Endpoint を使う必要があります。Privileged Endpoint のアカウントは Azure Stack 自体を停止できる権限をもっているので、ログを取得するという頻度の高い作業で使いたくないのが運用者の本音です。

### 1907 Update 以降

1997 Update によって、Admin Portal 上の操作で 診断ログを Blob コンテナに直接転送できるようになりました。その結果、1907 Update 以降の手順は次のように変わります。

1. ブラウザで Admin Portal に接続する
2. "On-demand diagnostic log collection" を利用して、Microsoft のサポートのストレージアカウントに診断ログを直接転送する

ポータルから診断ログを取得する機能が生きている限り、診断ログを取得するために Privileged Endpoint を使うことはありません。手間の原因がすべて消滅しました。

## ログの自動アップロード

参考：[Automatic diagnostic log collection](https://docs.microsoft.com/en-us/azure-stack/operator/azure-stack-diagnostic-log-collection-overview#on-demand-diagnostic-log-collection)

任意の SAS トークン付き Blob コンテナに手動で診断ログを保存する機能だけでなく、SAS トークン付き Blob コンテナに自動的に診断ログをアップロードする機能も追加されました。

{{< figure src="/images/2019-07-28-004.png" title="自動ログアップデートを設定する画面" >}}

ドキュメントによると、自動ログアップロードが発動するタイミングは「Critical なアラートが発生して、さらにこのアラートが30分間 Open し続けていた場合」のようです。トリガを見る限りだと、ガチなトラブルのログを確実に保全するための機能という印象を受けます。

## バックアップ容量の削減

参考：
- [Changes](https://docs.microsoft.com/ja-jp/azure-stack/operator/azure-stack-release-notes-1907#changes)
- [Backup Controller requirements](https://docs.microsoft.com/en-us/azure-stack/operator/azure-stack-backup-reference#backup-controller-requirements)

> Infrastructure backups no longer include a backup of domain services data. This only applies to systems using Azure Active Directory as their identity provider.

Azure Active Direcorty を認証で利用している場合、バックアップの容量が大幅に減ります。具体的には約 20GB から約 1GB になります。バックアップの容量が減ることは、バックアップにかかる時間が大幅に減るだけでなく、バックアップのトラフィックが利用者のトラフィックに影響を与える可能性を減らします。いいこと尽くしです。

## テナント向けサブスクリプション削除時の動作

参考：[Fixes](https://docs.microsoft.com/ja-jp/azure-stack/operator/azure-stack-release-notes-1907#fixes)

> Fixed the issue in which deleting user subscriptions resulted in orphaned resources.

ずーーーーっと known issue になっていた、「テナントのリソースが存在する状態で管理者がテナント向けのサブスクリプションを消すと、テナントのリソースが残り続ける」という不具合が解消されました。

実際に、ASDK 1907 を利用して、テナント側に Virtual Machine が存在する状態で管理者側からテナント向けのサブスクリプションを削除してみました。その結果、Virtual Machine が自動的に削除されました。不具合はちゃんと改修されていそうです。

{{< figure src="/images/2019-07-28-001.png" title="テナント上の Virtual Machine の ID" >}}

{{< figure src="/images/2019-07-28-002.png" title="Virtual Machine Hyper-Vのイベントログ" >}}

## 所感

ポータルから診断ログを転送できるようになったのが目玉ですね。慣れ親しんだ Get-AzureStackLog コマンドを使わなくなると思うと、少々寂しいです。

このまま、日常の運用で Privileged Endpoint を使わない世界になってほしいです。日常的な運用が Admin Portal だけで済むようになれば、ローカル認証にもかかわらず強い権限を有する Privileged Endpoint のアカウントを知る人を最小限に減らせるからです。

日常的に Privileged Endpoint を使うのは、Get-AzureStackLog するときと Test-AzureStack するときです。1907 Update によって、 Get-AzureStackLog のために Privileged Endpoint を使う機会が大幅に減りました。次は Admin Portal 上で Test-AzureStack できるようになってほしいです。そうすれば 普段の運用で Privileged Endpoint を使う機会が激減します。

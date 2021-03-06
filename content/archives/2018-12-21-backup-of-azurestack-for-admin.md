---
title: Azure Stack をバックアップする（管理者向け）
author: kongou_ae
date: 2018-12-21
url: /archives/2018-12-21-backup-of-azurestack-for-admin
categories:
  - azurestack
---

- 初版：2018年12月
- 第二版：2019年12月

## はじめに

本エントリーは[Microsoft Azure Stack Advent Calendar 2018](https://qiita.com/advent-calendar/2018/azure-stack)の21日目です。

本日のエントリでは Azure Stack Hub のバックアップをまとめます。本日のエントリの主題は、管理者が取得すべきバックアップです。利用者が取得すべきバックアップは、明日のエントリの題材です。

なお、PaaS のバックアップは本エントリの対象外です。私が PaaS のバックアップを説明できるほど PaaS を使いこなしていないからです。

## バックアップされるもの、されないもの

Asure Stack Hub には、管理者向けにバックアップの機能が提供されています。管理者向けバックアップの目的は、「Azure Stack Hub を、利用者がログインしてリソースを作れる状態に戻す」です。そのため、次のようなリソースがバックアップされます。

- RBAC
- Plan
- Offer
- Quota
- User Subscription

参考：[管理ポータルで Azure Stack のバックアップを有効にする](https://docs.microsoft.com/ja-jp/azure/azure-stack/azure-stack-backup-enable-backup-console)

管理者向けのバックアップは、管理者が基盤を再構築するためのバックアップです。したがって、利用者が作成したものはバックアップされません。

## バックアップの保存先

Azure Stack Hub は、バックアップファイルを SMB のファイル共有に保存します。Azure AD を利用している Azure Stack Hub の場合、一回あたりのバックアップファイルのサイズは約1 GBです。Microsoft は、1日2回バックアップを取得して7日間保存することを推奨していますので、約14 GB の容量を持ったファイル共有が必要です。バックアップの取得頻度または保存期間を短くすれば、ファイル共有の容量も減らせます。

参考：[バックアップ コントローラーの要件](https://docs.microsoft.com/ja-jp/azure/azure-stack/azure-stack-backup-reference#backup-controller-requirements)

## 管理者がすべきこと

管理者は、万が一の全損にそなえて、管理者向けバックアップを定期的に取得しなければなりません。そして、バックアップの取得と同じくらい大事なことが、利用者に対して利用者がバックアップすべき範囲を説明することです。

前述したとおり、管理者向けのバックアップには、利用者が保存したデータはもちろんのこと テナントが作成したリソースの構成情報（VM のサイズや Disk本数、NIC のIP アドレスなど、Get-AzureRMResource で取得できる情報）も含まれていません。Azure Stack Hub をご利用いただく前に、利用者に対してデータのバックアップとリソースの構成情報の両方を定期的に保存する必要があることを説明しましょう。

## バックアップのとりかた

Azure Stack Hub では、GUI と PowerShell のどちらでもバックアップを設定できます。GUI によるバックアップの方法は [管理者ポータルで Azure Stack のバックアップを有効にする](https://docs.microsoft.com/ja-jp/azure-stack/operator/azure-stack-backup-enable-backup-console?view=azs-1910) の通りです。設定にあたっては次の情報が必要です。

- SMV のファイル共有のパス
- SMB のファイル共有にアクセスするための認証情報
- バックアップファイルの暗号化で利用する証明書

## リストアのしかた

[Restore-AzsBackup](https://docs.microsoft.com/en-us/powershell/module/azs.backup.admin/restore-azsbackup) という cmdlet でリストアするようです。「ようです」と書いた理由は、実際にリストアしたことがないからです。バックアップには利用者の構成情報やデータが含まれていないので、リストアすると利用者が作ったものは綺麗さっぱり消えます。にも関わらず、Restore-AzsBackup を実施しなければならない状況とは、いったいどのようなことが起きているのでしょうか。。。

## まとめ

本日のエントリでは、管理者向けの Azure Stack Hub のバックアップについてまとめました。管理者としてバックアップを取ることはもちろん大事ですが、利用者が作ったリソースと利用者が保存したデータの保護責任が利用者にあることを説明することも重要です。管理者と利用者の責任分界点を明確にすることで、システム全体の完全性を向上させましょう。

明日のエントリでは、利用者向けのバックアップについてまとめます。

---
title: Azure Stack の Infrastructure Backup を Azure Files に保存する
author: kongou_ae
date: 2019-01-16
url: /archives/2019-01-16-save-infrabackup-of-azurestack-in-azure-files
categories:
  - azurestack
---

## はじめに

[Azure Stack をバックアップする（管理者向け）](https://aimless.jp/blog/archives/2018-12-21-backup-of-azurestack-for-admin/)でまとめたとおり、Azure Stack の管理者向けバックアップは SMB のファイルサーバにバックアップファイルを保存します。ドキュメント上では、保存先としてサポートされているファイルサーバはオンプレミスのものだけであって、Azure Files はサポートされていません。

参考：[Infrastructure Backup Service reference](https://docs.microsoft.com/ja-jp/azure/azure-stack/azure-stack-backup-reference#supported-storage-locations)

バックアップのためだけにファイルサーバを運用しなければならないのは苦痛です。前々から「Azure Files を早くサポートしてくれないかな」という要望をもっていました。そんな中、Twitter 上で「 Azure Files にバックアップファイルを保存した」というつぶやきがありました。

<blockquote class="twitter-tweet" data-lang="ja"><p lang="en" dir="ltr">Works like a charm. Azure File Share as SMB share for the infrabackup of on of our <a href="https://twitter.com/hashtag/azurestacks?src=hash&amp;ref_src=twsrc%5Etfw">#azurestacks</a> <a href="https://twitter.com/hashtag/azurestack?src=hash&amp;ref_src=twsrc%5Etfw">#azurestack</a> <a href="https://twitter.com/hashtag/azure?src=hash&amp;ref_src=twsrc%5Etfw">#azure</a> This saves me a fileshare to manage. :) <a href="https://t.co/4c3vQY4zOA">pic.twitter.com/4c3vQY4zOA</a></p>&mdash; Bas Wassenaar (@BasWas) <a href="https://twitter.com/BasWas/status/1082585475716706304?ref_src=twsrc%5Etfw">2019年1月8日</a></blockquote>
<script async src="https://platform.twitter.com/widgets.js" charset="utf-8"></script>

「まじか。サポートはしてないけど、技術的にはできるってこと！？」ということで実際にやってみました。

## Azure Files を作る

Azure ポータルで Azure Files をポチポチ作ります。

{{< figure src="./../../images/2019-01-16-001.png" title="Azure Files の設定個所" >}}

作成した File 共有で Connect をクリックして、Azure Files にアクセスするためのパスとユーザ名、パスワードを入手します。

{{< figure src="./../../images/2019-01-16-002.png" title="接続情報の記載個所" >}}

## Infrastructure Backup を有効化する

上記の手順で入手したパスとユーザ名、パスワードを利用して、Infrastructure Backup を有効化します。

```powershell
$username = "Azure\aimlessazsinfrabackup"
$sharepath = "\\aimlessazsinfrabackup.file.core.windows.net\infrabackup"
$password = ConvertTo-SecureString "XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX==" -AsPlainText -Force
$Encryptionkey = New-AzsEncryptionKeyBase64
$key = ConvertTo-SecureString -String ($Encryptionkey) -AsPlainText -Force
$key
Set-AzsBackupShare -BackupShare $sharepath -Username $username -Password $password -EncryptionKey $key
```

設定が成功すると、管理ポータル上に表示されるバックアップ先が Azure Files になります。

{{< figure src="./../../images/2019-01-16-003.png" title="管理ポータル上の表示" >}}

バックアップを手動実行すると、Azure Files 上にバックアップファイルが保管されます。素晴らしい。

{{< figure src="./../../images/2019-01-16-004.png" title="保存されたファイル" >}}

## まとめ

サポートされていない手法ではありますが、Azure Stack の Infrastructure Backup を Azure Files に保存できました。Infrastructure Backup を保存するためだけにファイルサーバを用意・運用するのはつらいです。マネージドサービスである Azure Files へのバックアップが正式にサポートされれば、Azure Stack Operator が運用しなければならないものが一つ減ります。正式サポートが早く始まることを期待します。

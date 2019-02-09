---
title: Azure Stack infrastructure backup with self-certificate of Key Vault
author: kongou_ae
date: 2019-02-09
url: /archives/2019-02-09-azurestack-backup-with-selfcert-of-keyvault
categories:
  - azurestack
---

Azure Stack 1901 Update で、Azure Stack Infrascture backup を設定する際に CER フォーマットの証明書（＝公開鍵のみ）が必要になりました。New-AzsEncryptionKeyBase64 で生成されるランダムな文字列の代わりに、証明書に含まれる文字列を使うことにしたのでしょう。Azure Stack Operator としても、任意の文字列を保存するよりも、証明書を保存する方が楽です。

現時点において、公式ドキュメントはランダムな文字列を利用したバックアップの設定方法が記載されたままです。どのような証明書を使うべきかのガイダンスは存在しません。そこで、試しに、Key Vault で生成した自己証明書を利用して Infrascture backup を設定してみました。Key Vault に証明書を預けておけば、証明書をなくすこともないでしょう。

Key Vault で生成した証明書は CER 方式でエクスポートできます。

<blockquote class="twitter-tweet" data-lang="ja"><p lang="ja" dir="ltr">Key Vault で作った自己証明書を CER 方式でダウンロード中 <a href="https://t.co/ykh2jsdHhY">pic.twitter.com/ykh2jsdHhY</a></p>&mdash; こんごー (@kongou_ae) <a href="https://twitter.com/kongou_ae/status/1094256440179548160?ref_src=twsrc%5Etfw">2019年2月9日</a></blockquote>
<script async src="https://platform.twitter.com/widgets.js" charset="utf-8"></script>

Power Shell でバックアップを設定する場合、Azure Stack モジュールの 1.7.0 以降が必要です。`-EncryptionCertPath`を利用して、Key Vault からダウンロードした自己証明書を指定します。

```powershell
Install-Module -Name AzureStack -MinimumVersion 1.7.0 
$username = "Azure\xxxxxxxxxxxxxxxx"
$sharepath = "\\xxxxxxxxxxxxxxxx.file.core.windows.net\xxxxxxxxxxxxxxxx"
$password = ConvertTo-SecureString "xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx" -AsPlainText -Force
$certPath = "C:\Users\AzureStackAdmin\Desktop\azsbackup_9967df3af44d4f86995a748f7dfbb1fc.cer"
Set-AzsBackupConfiguration -Path $sharepath `
    -Username $username -Password $password -EncryptionCertPath $certPath `
    -IsBackupSchedulerEnabled $True -BackupFrequencyInHours 12 -BackupRetentionPeriodInDays 2
```

Infrascture backup の設定画面上では、証明書の Thumbprint を確認できます。万が一どの証明書を使ったか忘れたとしても、心当たりのある証明書の Thumbprint を総当たりすれば、設定する際に利用した証明書が見つかる可能性があります。忘れたら終わりのランダム文字列よりも安心できますね。

<blockquote class="twitter-tweet" data-lang="ja"><p lang="ja" dir="ltr">なるほど。設定で使った証明書のThumbprintが表示されるのか。どの証明書を使ったか、後追いできる <a href="https://t.co/pauuIyGP1N">pic.twitter.com/pauuIyGP1N</a></p>&mdash; こんごー (@kongou_ae) <a href="https://twitter.com/kongou_ae/status/1094257492169637888?ref_src=twsrc%5Etfw">2019年2月9日</a></blockquote>
<script async src="https://platform.twitter.com/widgets.js" charset="utf-8"></script>


---
title: Azure Stack 1807 Update バックアップ編
author: kongou_ae
date: 2018-08-12
url: /archives/2018-08-12-azurestack-1807-backup
categories:
  - azurestack
---

# はじめに

[Azure Stack 1807 update](https://docs.microsoft.com/en-us/azure/azure-stack/azure-stack-update-1807)がリリースされました。本エントリーでは、目玉の一つであるinfrastructure backupのアップデートをまとめます。

<blockquote class="twitter-tweet" data-lang="ja"><p lang="en" dir="ltr"><a href="https://twitter.com/hashtag/AzureStack?src=hash&amp;ref_src=twsrc%5Etfw">#AzureStack</a> 1807 update is available <a href="https://t.co/jvctvF6dCD">https://t.co/jvctvF6dCD</a>, add nodes, schedule infra backups, newer NRP API, multiple NICS per VM, notification for update availability and more. A lot more than one can put in a tweet:)</p>&mdash; Vijay Tewari (@vtango) <a href="https://twitter.com/vtango/status/1027979684477251584?ref_src=twsrc%5Etfw">2018年8月10日</a></blockquote>
<script async src="https://platform.twitter.com/widgets.js" charset="utf-8"></script>


参考：[What’s new in Azure Stack Update 1807 - Automatic infrastructure backups](https://www.youtube.com/watch?v=DV1CHDPcKmQ)


## Encryption Keyを生成するコマンドレットの追加

1807 update用のAzure Stack PowerShell Module 1.4.0に"New-AzSEncryptionKeyBase64"が追加されました。このコマンドによって、Azure Stackのバックアップを設定する際に必要となる"Encryption Key"の生成が簡単になりました。

### 1807 updateまで

```powershell
$BackupEncryptionKeyBase64 = ""
$tempEncryptionKeyString = ""
foreach($i in 1..64) { $tempEncryptionKeyString += -join ((65..90) + (97..122) | Get-Random | % {[char]$_}) }
$tempEncryptionKeyBytes = [System.Text.Encoding]::UTF8.GetBytes($tempEncryptionKeyString)
$BackupEncryptionKeyBase64 = [System.Convert]::ToBase64String($tempEncryptionKeyBytes)
$BackupEncryptionKeyBase64
```

### 1807 update以降

```powershell
$Encryptionkey = New-AzSEncryptionKeyBase64
$Encryptionkey
```

## スケジュールバックアップ

Azure Stack自身が決められた頻度でバックアップを取得するようになりました。これまでは、スケジュールバックアップしたい場合、APIを叩く自動化を自前で実装しなければなりませんでした。大進歩です。

設定項目は"頻度"と"1日当たりの保持期間"です

| 設定項目       | パラメータ                  | デフォルト値 | 設定値  |
|------------|------------------------|--------|------|
| 頻度         | $frequencyInHours      | 12     | 4~12 |
| 1日当たりの保持期間 | $retentionPeriodInDays | 7      | 2~14 |

PowerShellでスケジュールバックアップを設定する場合、次のようなスクリプトを使います。

```powershell
$username = "azurestack\azurestackadmin"
$sharepath = "\\192.168.200.65\AzSBackupStore"
$password = Read-Host -Prompt ("Password for: " + $username) -AsSecureString
$Encryptionkey = New-AzSEncryptionKeyBase64
$key = ConvertTo-SecureString -String ($Encryptionkey) -AsPlainText -Force
$Encryptionkey = New-AzSEncryptionKeyBase64
$Encryptionkey 
$key = ConvertTo-SecureString -String ($Encryptionkey) -AsPlainText -Force
Set-AzSBackupShare -BackupShare $sharepath -Username $username -Password $password `
    -EncryptionKey $key -IsBackupSchedulerEnabled $True `
    -BackupFrequencyInHours 12 -BackupRetentionPeriodInDays 2


Path                        : \\192.168.200.65\AzSBackupStore
UserName                    : azurestack\azurestackadmin
Password                    : 
EncryptionKeyBase64         : 
BackupFrequencyInHours      : 12
AvailableCapacity           : 67.1 GB
IsBackupSchedulerEnabled    : True
NextBackupTime              : 8/11/2018 11:52:54 PM
LastBackupTime              : 
BackupRetentionPeriodInDays : 2
Id                          : /subscriptions/a50b0d02-6ce6-4b62-9ba3-941932921d6e/resourceGroups/system.local/provide
                              rs/Microsoft.Backup.Admin/backupLocations/local
Name                        : local
Type                        : Microsoft.Backup.Admin/backupLocations
Location                    : local
Tags                        : {}
```

ASDKで設定したところ、NextBackupTimeが過去の時間になってしまいました。

{{<img src="./../../images/2018-0812-001.png">}}

手動でバックアップを1回実施したところ、バックアップを取得したタイミングからBackupFrequencyInHours後の時間がNextBackupTimeにスケジューリングされました。初回設定時は手動で1回バックアップした方がいいかもしれません。

{{<img src="./../../images/2018-0812-002.png">}}

## GUIでのバックアップ実行

Admin Portal上でバックアップを実行できるようになりました。これまではPowerShellのみでした。大進歩です。

{{<img src="./../../images/2018-0812-003.png">}}

## 嘘表示の改善

Admin Portalに表示されるバックアップ先の空き容量が実際の値になりました。これまでは10Gがベタ書きされていました。なぜベタ書きでリリースしたのか。謎のままです。

{{<img src="./../../images/2018-0812-004.png">}}

## まとめ

最低限の機能としてリリースされていたInfrastructure Backupが、運用管理面で使い勝手の良いものになりました。[Hector](https://twitter.com/hectoralinares) and team, Great work!!!

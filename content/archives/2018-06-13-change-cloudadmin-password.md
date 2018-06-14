---
title: Privileged Endpoint上のユーザのパスワードを変更する
author: kongou_ae
date: 2018-06-13
url: /archives/2018-06-13-change-cloudadmin-password
categories:
  - azurestack
---


[Azure StackのPrivileged Endpointにユーザを追加する](https://aimless.jp/blog/archives/2018-06-11-add-user-to-pep/)の続きです。前回は、Azure StackのPrivileged Endpointに個人のユーザを作成しました。今回は作成した個人ユーザのパスワードを変更します。

## 環境

- Azure Stack：ASDK 1.0.180513.1
- PowerShell: Azure Stack Admin 1.3.0

## やってみた

kongou-aeのパスワードを変更してみます。現在のパスワード"P@ssw0rd1"を利用してPrivileged Endpointに接続します。

```powershell
PS C:\tools> $password = ConvertTo-SecureString 'P@ssw0rd1' -AsPlainText -Force
PS C:\tools> $cred = New-Object System.Management.Automation.PSCredential 'azurestack.local\kongou-ae',$password
PS C:\tools> $pepSession = New-PSSession -ComputerName azs-ercs01 -Credential $cred -ConfigurationName PrivilegedEndpoint 
```

接続できたpssessionに対して、"Set-CloudAdminUserPassword"を発行します。引数としてユーザ名と現在のパスワード、新しいパスワードが必要です。今回は"P@ssw0rd1"から"P@ssw0rd2"に変更します。

```powershell
PS C:\tools> $password = ConvertTo-SecureString "P@ssw0rd1" -AsPlainText -Force
PS C:\tools> $newPassword = ConvertTo-SecureString "P@ssw0rd2" -AsPlainText -Force
PS C:\tools> Invoke-Command -Session $pepSession -ScriptBlock { Set-CloudAdminUserPassword -UserName kongou-ae -CurrentPassword $using:password -NewPassword $using:newPassword }
```

パスワードを変更できたか確認してみます。古いパスワードである"P@ssw0rd1"でPrivileged Endpointに接続しようとするとエラーになります。パスワードが変わったようです。

```powershell
PS C:\tools> $password = ConvertTo-SecureString 'P@ssw0rd1' -AsPlainText -Force
PS C:\tools> $cred = New-Object System.Management.Automation.PSCredential 'azurestack.local\kongou-ae',$password
PS C:\tools> $pepSession = New-PSSession -ComputerName azs-ercs01 -Credential $cred -ConfigurationName PrivilegedEndpoint 
New-PSSession : [azs-ercs01] Connecting to remote server azs-ercs01 failed with the following error message : Access is denied. For more information, see the about_Remote_Troubleshooting Help topic.
```

正しいパスワードに変更できたかを確認するために、新しいパスワードである"P@ssw0rd2"を利用してPrivileged Endpointに接続してみます。

```powershell
PS C:\tools> $password = ConvertTo-SecureString 'P@ssw0rd2' -AsPlainText -Force
PS C:\tools> $cred = New-Object System.Management.Automation.PSCredential 'azurestack.local\kongou-ae',$password
PS C:\tools> $pepSession = New-PSSession -ComputerName azs-ercs01 -Credential $cred -ConfigurationName PrivilegedEndpoint 
PS C:\tools> Get-PSSession

 Id Name            ComputerName    ComputerType    State         ConfigurationName     Availability
 -- ----            ------------    ------------    -----         -----------------     ------------
  6 Session6        azs-ercs01      RemoteMachine   Opened        PrivilegedEndpoint       Available
```

Get-PSSessionを使うと、確立済みのPSSessionを確認できます。ERCSとのPSSessionがOpenedになっていますね。パスワードが変更できたようです。

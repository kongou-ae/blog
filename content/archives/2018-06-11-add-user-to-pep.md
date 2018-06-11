---
title: Azure StackのPrivileged Endpointにユーザを追加する
author: kongou_ae
date: 2018-06-11
url: /archives/2018-06-11-add-user-to-pep
categories:
  - azurestack
---

Azure Stackには、GUIやAPIが死んだときの最後の砦として、Emergency Recovery Console(ERCS)上にPrivileged Endpoint(PEP)を呼ばれる入り口があります。

[Using the privileged endpoint in Azure Stack](https://docs.microsoft.com/en-us/azure/azure-stack/azure-stack-privileged-endpoint)

Azure Stackのデプロイにおいて、PEPにログインできる"CloudAdmin"ユーザが自動的に作成されます。ただし、運用において共有アカウントを使いまわすのはご法度です。個人を特定できるアカウントをつかうべきです。というわけで、PEP上にユーザを追加してみます。

## 環境

- 環境：ASDK 1.0.180513.1
- PowerShell: Azure Stack Admin 1.3.0

## やってみた

まずは初期ユーザの"CloudAdmin"でPEPにログインします。

```PowerShell
PS C:\Users\AzureStackAdmin> $pep = New-PSSession -ComputerName azs-ercs01 -ConfigurationName priviledgeendpoint -Credential azurestack.local\CloudAdmin
PS C:\Users\AzureStackAdmin> Import-Session $pep
```

"kongou-ae"という新しいユーザを作ります。

```PowerShell
PS C:\Users\AzureStackAdmin> Get-CloudAdminUserList
CloudAdmin
AzureStackAdmin
PS C:\Users\AzureStackAdmin> $password = ConvertTo-SecureString 'P@ssw0rd' -AsPlainText -Force
PS C:\Users\AzureStackAdmin> New-CloudAdminUser -UserName kongou-ae -Password $password
PS C:\Users\AzureStackAdmin> Get-CloudAdminUserList
kongou-ae
CloudAdmin
AzureStackAdmin
```

作成したユーザでPEPにログインできることを確認します。

```PowerShell
PS C:\Users\AzureStackAdmin> Enter-PSSession -ComputerName azs-ercs01 -ConfigurationName PrivilegedEndpoint  -Credential azurestack.local\kongou-ae
[azs-ercs01]: PS>
```

無事ログインできました。

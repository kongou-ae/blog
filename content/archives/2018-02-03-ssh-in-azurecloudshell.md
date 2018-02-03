---
title: PowerShell in Azure Cloud ShellでSSH 
author: kongou_ae
date: 2018-02-03
url: /archives/ssh-in-azurecloudshell
categories:
  - azure
---

Azure Cloud ShellのPowershellでSSHが使えるようになりました。試しにCloud Shellから自宅のFortiGateにつないでみました。

[OpenSSH now available in PowerShell in Cloud Shell](https://azure.microsoft.com/ja-jp/updates/openssh-now-available-in-powershell-in-cloud-shell/)

{{<img src="./../../images/2018-02-03-001.png">}}

改めて考えると、Azure Cloud Shellは次の特徴を持つSSH踏み台サーバなんですね。Azureの仕事以外でも使えそう。

- ブラウザで利用できる
- クライアントと踏み台サーバ間でファイルのやり取りができる
- Azure Active Directory認証
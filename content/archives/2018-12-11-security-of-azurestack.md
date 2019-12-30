---
title: Azure Stack Hub のセキュリティ
author: kongou_ae
date: 2018-12-11
url: /archives/2018-12-11-security-of-azurestack
categories:
  - azurestack
---

## はじめに

本エントリーは[Microsoft Azure Stack Advent Calendar 2018](https://qiita.com/advent-calendar/2018/azure-stack)の11日目です。

本日のエントリーでは、Azure Stack Hub のセキュリティについてまとめます。主な参照先は公式ドキュメントと Microsoft Ingnite 2018 における Filippo Seracini 氏のセッションです。

参考：[Discovering the Importance of Security Design Principles and Key Use cases for Azure - BRK2305](https://www.youtube.com/watch?v=c2JYZZjwaRs)

## ビジョン

Microsoft が描く Azure Stack Hub のセキュリティに対するビジョンは次の通りです。Microsoft は、「Microsoft の管理下ではない環境で動くAzure Stack Hub であっても、Azure と同レベルのセキュリティと保護をお客様に提供する」という凄いことをやろうとしています。

{{<img src="./../../images/2018-12-11-001.png">}}

## Internals are internal

このビジョンを実現するための基本的な考え方が「Internals are internal」です。Azure Stack Hub は、Windows Server 2019 の機能を利用しています。ただし、Windows Server の部分を管理者にオープンにしてしまうと、次のようなリスクが生まれます。

- 管理者が勝手にセキュリティに関する設定を変更してしまう
- 悪意ある第三者に乗っ取られた管理者によって、セキュリティインシデントを起こされてしまう

つまり、高度なセキュリティの設定を組み込んで出荷したとしても、意味がなくなってしまうわけです。そこで、Microsoft は、「Azure Stack Hub の管理者に内部を自由に操作させない」という方針をとりました。Microsoft はセキュリティを確保するために、性悪説にもとづいてシステムを設計しているわけです。

そのため、自分のお金で買ったハードウェア上で動いている Windows Server ベースの製品にも関わらず、Azure Stack Hub の Infrastructure Role Instance にはリモートデスクトップで接続できませんし、必要に応じて自分の好きな設定を追加することもできません。すべてはビジョンを実現するためです。

## 制限付き管理者

Internals are internal の実装の1つが制限付き管理者です。

性悪説にのっとっているのですから、管理者になんでもできる特権管理者（Domain Admin）を与えるわけにはいきません。しかし、権限を全く与えないと、Azure Stack Hub の運用に支障をきたします。必要最低限の権限だけを管理者に付与する必要があります。

原則として、管理者は Azure Stack Hub を API 経由で操作します。管理者向けポータルや PowerShell などのツールは裏で API を呼んでいます。この時点で、管理者が実施できる作業は、API に実装されている操作のみです。管理者はハードウェアや OS を自由に操作できません。

API で Azure Stack Hub を操作できない時のため用意されている Emergency Recovery Console についても、権限の制限が徹底しています。Microsoft は Emergency Recovery Console 上に [Privileged Endpoint（PEP）](https://docs.microsoft.com/ja-jp/azure/azure-stack/azure-stack-privileged-endpoint) という仕組みを導入しています。PEP とは、PowerShell の [Just Enough Administrator ](https://docs.microsoft.com/ja-jp/powershell/jea/overview) によって保護された PowerShell です。JEA を使うことで、Microsoft は「特権管理者の権限を有しているが、Microsoft が運用上使うである考えた数十個のコマンドのみを実行できる PowerShell 環境」を実現しています。

JEA を利用していない PowerShell では約4100個のコマンドを実行できます。つまり、管理者は、PowerShell でハードウェアや OS を自由に操作できます。

```powershell
PS D:\Users\kongou-ae\Documents> $normalCommand = Get-Command
PS D:\Users\kongou-ae\Documents> $normalCommand.Length
4072
```

一方で、JEA で保護された PEP では約50個のコマンドだけを実行できます。利用できるコマンドの多くは、Azure Stack 用に作られたものばかりです。したがって、管理者は PowerShell でハードウェアや OS を自由に操作できません。

```powershell
PS D:\Users\kongou-ae\Documents> $pep = New-PSSession -ComputerName azs-ercs01 -ConfigurationName privilegedendpoint
PS D:\Users\kongou-ae\Documents> $commands = Invoke-Command -Session $pep { get-command }
PS D:\Users\kongou-ae\Documents> $commands.Length
49
```

API と PowerShell のどちらであっても ハードウェアと OS を自由に操作できない管理者は、もはや管理者ではありません。Microsoft は、Azure Stack Hub を運用管理する人を "Azure Stack Hub Operator" と呼んでいます。"Azure Stack Hub Administrator" ではありません。

## ハードウェア周りの実装

Azure Stack Hub を構成するサーバでも、セキュリティを向上するためのハードウェア機能が利用されています。使える機能をしっかりと使っているという形ですね。詳しくないのでさらっと！

- Secure Boot 
- UEFI 
- TPM 2.0

## 攻撃を受ける場所を減らす

攻撃を受けるリスクを減らす方法の一つが、攻撃を受ける場所を減らすことです。脆弱な場所があるから攻撃を受けるわけです。Azure Stack Hub では次のような実装がデフォルトでなされています。自分でやろうとすると地味に大変ですよね。

- アメリカ国防情報システム局の Hardened security OS baseline に基づいた OS のベースライン設定
- 不要なコンポーネントの削除
- Windows Server のセキュリティ機能
  - Device Guard
  - Windows Defender
- TOR Switch のアクセスリスト、SDNのアクセスリスト、Windows Firewall による通信制御
- SMBv1 や SSLなどの古いプロトコルの無効化

## 認証情報のローテーション

攻撃を受ける場所を減らしたとしても、正規の入り口からの侵入を防ぐことはできません。正規の入り口で利用する認証情報をいかに強固にするか。Azure Stack Hub のアプローチが認証情報の自動ローテーションです。Azure Stack Hub は、内部で利用しているアカウントやキーのほとんどを自動でローテーションします。

- Automated secrets rotation
  - Certificates
  - Internal accounts
  - gMSA accounts
  - Storage account keys

ただし、管理者が利用する Azure Active Directory のアカウントと PEP のアカウントは自動ローテーションの対象外です。これらのアカウントを守ることは管理者の仕事です。

## 暗号化

Azure Stack Hub 上のデータは BitLocker によって暗号化されます。コンポーネント間の通信は TLS 1.2によって暗号化されます。基本にして大事。

## まとめ

本日のエントリでは、Azure Stack Hub のセキュリティ機能についてまとめました。Windows Server の機能を活用して、高セキュリティな基盤を実現しているのがわかります。

自分たちで考えてセキュリティ対策を実装するのと、Microsoft が考えたセキュリティ対策が実装された Azure Stack Hub を使うの、どちらが安全でしょうか。私はAzure Stack を使うほうが安全だと思います。難しいことは専門家に任せて、ソリューションをお金で買いましょう。

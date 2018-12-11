---
title: Azure Stack の認証認可
author: kongou_ae
date: 2018-12-13
url: /archives/2018-12-12-anthn-anthz-for-azurestack
categories:
  - azurestack
---

## はじめに

本エントリーは[Microsoft Azure Stack Advent Calendar 2018](https://qiita.com/advent-calendar/2018/azure-stack)の12日目です。

先日までのエントリでは、Dploymemt Worksheet をもとにして、Azure Stack を設置するために必要な準備をまとめました。

本日以降のエントリでは、OEM ベンダが導入した Azure Stack を運用していくために必要なことをまとめていきます。


まずはじめに、本日エントリでは、Azure Stack における認証認可をまとめます。運用するためにはログインしなければなりません。

なお、私は、ADFS で認証する Azure Stack を触ったことがありません。そのため、本エントリでは、AAD を利用した Azure Stack のみを対象とします。

## ３つの接続先

Azure Stack には次の通り大きく３つの接続先があり、接続先に応じて認証認可の仕組みが異なります。

1. 管理者向け Azure Resource Manager(ARM)
1. 利用者向け Azure Resource Manager(ARM)
1. Emergency Recovery Console 上の Privileged Endpoint(PEP)

## 1. 管理者向けARMの認証認可

### 認証

管理者向けARMの認証基盤は、Deployment Worksheet で指定した Azure Active Directory のテナントです。したがって、管理者向けポータルや管理者向け PowerShell などの管理者向け ARM を利用する機能にアクセスする際は、Deployment worksheetに指定したテナントに存在するユーザーでログインします。

{{<img src="./../../images/2018-12-12-009.png">}}

なお、具体的なログイン方法については、明日のエントリーでフォローします。

### 認可

認証を通過して Azure Stack の管理側にログインできたとしても、リソースにはアクセスできません。リソースにアクセスするためには、認可の設定が必要です。認可のないユーザでログインしても、次の画像のとおりリソースが全く表示されません。

{{<img src="./../../images/2018-12-12-003.png">}}

認可の設定は、Azure の RBAC と 同じです。Azure Stack の管理者用リソースに対して権限を有するユーザだけが、Azure Stack 上の管理者用リソースにアクセスできます。デプロイ時に指定したユーザがサブスクリプションの Owner の権限を持っているので、そのユーザでログインした上で、つぎのように RBAC の設定画面からテナント上のユーザに対して権限を付与しましょう。

{{<img src="./../../images/2018-12-12-004.png">}}

## 2. 利用者向けARMの認証認可

### 認証

利用者向け ARM の認証基盤は、利用者のサブスクリプションに紐付いているAADテナントです。サブスクリプションと Azure Active Directory の紐づけは、管理者が利用者向けのサブスクリプションを作成する際に行われます。

{{<img src="./../../images/2018-12-12-005.png">}}

利用者向けポータルや利用者向け Powershell などの利用者向け ARM を利用する機能にアクセスする際は、サブスクリプションに紐付いているテナントに存在するユーザを利用します。

なお、具体的なログイン方法については、明日のエントリーでフォローします。

### 認可

管理者と同様、利用者についてもリソースに対する認可の設定が必要です。管理者が利用者向けサブスクリプションを作成するときに指定したメールアドレスが、利用者向けサブスクリプションのオーナーになります。このユーザでログインした上で、次のようにテナント上のユーザに対して権限を付与しましょう。

{{<img src="./../../images/2018-12-12-005.png">}}

リソースに対して権限を有するユーザーだけが Azure Stack 上のリソースにアクセスできます。Azure と同じです。ただし、現在の Azure Stack は組み込みのカスタムロールが少ないです。次の画像のように、Owner と Reader 、 Contributer の3つのみです。

{{<img src="./../../images/2018-12-12-006.png">}}

## 3. PEP の認証認可

### 認証

PEP の認証基盤は Azure Stack 内部の Active Directory です。この Active Directory が Deployment worksheet で指定した内部ドメイン名を管理しています。

デプロイ直後には「内部ドメイン名¥CloudAdmin」という初期ユーザーだけが存在します。共有アカウントは好ましくないので、このユーザを利用して PEP に接続できる個人アカウントを増やしましょう。具体的な手順については[Azure StackのPrivileged Endpointにユーザを追加する](https://aimless.jp/blog/archives/2018-06-11-add-user-to-pep/)を確認ください。

### 認可

[Azure Stack のセキュリティ](https://aimless.jp/blog/archives/2018-12-11-security-of-azurestack)で説明したとおり、PEP 上のユーザは、JEA によって実行できるコマンドが制限されています。Microsoft が定めた認可を管理者が変更することはできません。

ただし、一部の障害対応においては、コマンドが制限されている PEP の権限だけでは復旧作業ができません。その場合、Microsoft のサポート担当の許可によって、PEP 上の権限を一時的に特権に切り替えることかできます。次の画像のとおり、Get-SupportSessionToken でトークンを生成してサポート担当に送付すると、サポート担当が制限を解除するためのトークンをくれます。そのトークンを Unlock-SupportSession の引数に渡すと、PEP を一時的に特権に切り替えられます。

{{<img src="./../../images/2018-12-12-008.png">}}

## まとめ

本日のエントリーでは Azure Stack の接続先ごとに認証と認可をまとめました。Azure Stack の管理者向け ARM と利用者向け ARM の認証と認可は、Azure と同じ Azure Active Directory ＋ RBAC　の仕組みです。Azure の仕組みに慣れている人であればすぐに理解できると思います。

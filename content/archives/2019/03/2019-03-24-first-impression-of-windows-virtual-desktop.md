---
title: Windows Virtual Desktop を作ってみた
author: kongou_ae
publishDate: 2019-03-24
url: /archives/2019-03-24-first-impression-of-windows-virtual-desktop
categories:
  - azure
---

## はじめに

Windows Virtual Desktop が Public Preview になったので、構成を理解するために作ってみました。個人で Microsoft 365 E3 を契約しているので、ライセンス違反にはならないはず。

## 構成要素

ドキュメントを写経した結果、次のような構成が出来上がりました。写経で作れたので、具体的な手順には触れません。

{{< figure src="./../../images/2019-03-23-001.png" title="WVS の構成要素" >}}

主な構成要素は次の通りです。実際に作ってみて気になった点をまとめていきます。

1. Windows Virtual Desktop（ RDS を管理する部分の PaaS ）
1. Azure Active Direcotry
1. Active Directory
1. Host Pool ( ユーザを収容する Virtual Machine のあつまり )

## 1. Windows Virtual Desktop (PaaS)

### 前提条件

何も考えずにポータルからポチポチ作れるサービスではありません。次の前提条件を満たしてから挑戦しましょう。

[Windows Virtual Desktop とは](https://docs.microsoft.com/ja-jp/azure/virtual-desktop/overview#requirements?WT.mc_id=AZ-MVP-5003408)

### WVD の構造

WVD で登場する新しい用語の基本的な考え方は次の URL に記載されています。WVD(PaaS) を設定する前に一読すると、設定に対する理解が進みます。写経する前にこのページの存在を知りたかったです。

[Windows Virtual Desktop の環境](https://docs.microsoft.com/ja-jp/azure/virtual-desktop/environment-setup?WT.mc_id=AZ-MVP-5003408)

### 設定方法

2019年3月現在、WVD(PaaS) を設定する方法は PowerShell のみです。Azure Portal からは設定できません。

[Windows Virtual Desktop Powershel](https://docs.microsoft.com/en-us/powershell/module/windowsvirtualdesktop/?WT.mc_id=AZ-MVP-5003408&view=windows-virtual-desktop-1.0.0-preview)

ただし、次の動画では Azure Portal を使ったデモが行われています。一時期、プレビュー版の Azure Portal に WVD の開発中の画面が表示されていたので、いずれ Azure Portal で WVD(PaaS)を設定できるようになるでしょう。

[What is Windows Virtual Desktop?](https://youtu.be/30dOLcZ4_9U?t=611)

## 2. Azure Active Direcotry

WVD(PaaS) とクライアントアプリが Azure Active Directory にアクセスする必要があるため、Azure Active Direcotry 上にアプリケーションを登録します。したがって、WVD(PaaS)  を設定する際は、Azure サブスクリプションに対する権限だけでなく Azure Active Direcotry に対する権限も必要です。AAD にアプリを登録するための専用ページ（[Windows Virtual Desktop consent page](https://rdweb.wvd.microsoft.com/)）が用意されているので、登録作業自体は簡単です。

{{< figure src="./../../images/2019-03-23-002.png" title="登録されたアプリ" >}}

アプリを登録したら、WVD(PaaS) を操作したいアカウントをアプリケーションに追加する必要があります。初期状態では、専用ページでの登録作業時に利用したアカウントだけが権限を有しています。

{{< figure src="./../../images/2019-03-23-003.png" title="アプリケーションのユーザ登録画面" >}}

## 3. Active Directory

Host Pool を作成する際に Virtual Machine が `JsonADDomainExtension` を使ってドメイン参加しますので、Host Pool を配置する Virtual Network から Active Directory にアクセスできる必要があります。

また、AD 上で `User must change password at next logon` にチェックが入っているユーザは、Host Pool への接続がエラーになります。Azure Active Direcotry Domain Service を利用した構成の場合、同期直後のユーザは AAD DS 側で `User must change password at next logon` にチェックが入るようです。AAD 側でパスワードを変更すれば、その変更が AAD DS に同期されて `User must change password at next logon` のチェックが外れます。AAD とAAD DS の構成で WVD を評価する際には、利用するユーザのパスワード変更を忘れずに。

## 4. Host Pool ( ユーザを収容する Virtual Machine のあつまり )

### Virtual Machine の扱い

手順に従って Host Pool を作成すると、Host Pool を構成する Virtual Machine は 他の Virtual Machine と同じように一覧で表示されます。Host Pool を作成する際にVirtual Machine の Prefix を指定できるので、他の Virtual Machine と混同しない Prefix を指定しましょう。

{{< figure src="./../../images/2019-03-23-005.png" title="Virtual Machine の Prefix" >}}

上記の Prefix の場合、実際に構築される Virtual Machine の名前は、台数に応じて wvdpoolvm-0、wvdpoolvm-1 になります。

### 通信経路

Host Pool の Virtual Machine には Public IP Address が割り当てられません。にもかかわらず、WVS の利用者は、PaaS サービスである WVD 経由で Virtual Machine を操作できます。不思議です。

ドキュメントにはトラフィックフローの記載が見当たりません。現時点では、Ignite 2018 のセッション動画にて、WDV を利用する際のトラフィックフローが説明されています。この資料によると、WVD(PaaS) と Virtual Machine とのトラフィックは常に Virtual Machine から WVD(PaaS) への TCP/443のアウトバウンドのみのようです。この実装であれば Virtual Machine に Public IP Address が不要なことが理解できます。

{{< figure src="./../../images/2019-03-23-006.png" title="トラフィックフロー" >}}

引用：[Windows Virtual Desktop deep dive - BRK3312](https://youtu.be/VQSsgEYamBs?t=688)

Virtual Machine からの Outbound が必要ということは、VNet の環境に応じて Outbound の通信を許可しなければなりません。しかし、具体的な通信要件がドキュメントに見当たりません。通信制御の実装を検討するには、接続先の IP または　FQDN と、TCP/443 を Web Proxy 経由にできるかの情報が必要です。ドキュメントが公開されることを期待します。参考までに、Virtual Machine に Service Map をインストールして WVD の Agent の通信先を調べてみたところ、次の箇所と通信していました。

- rddiagnostics.wvd.microsoft.com
- rdbroker.wvd.microsoft.com

## おわりに

Windows Virtual Desktop の基本的な部分を試してみて気になった部分をまとめました。実際に作ってみると仕組みを理解できますね。もし、本格的に取り組むことがあれば、VDI として必要不可欠な次の要素も確認しようと思います。

- FSLogix profile containers
  - [Set up a user profile share for a host pool](https://docs.microsoft.com/ja-jp/azure/virtual-desktop/create-host-pools-user-profile?WT.mc_id=AZ-MVP-5003408)
- カスタムイメージの利用
  - [Prepare and customize a master VHD image](https://docs.microsoft.com/ja-jp/azure/virtual-desktop/set-up-customize-master-image?WT.mc_id=AZ-MVP-5003408)
- Host Pool のスケールアウト
  - そもそも、一度作った Host Pool の Virtual Machine を増やせるのかが不明。ポータルから作ると、別のリソースグループに Virtual Machine が配置されてしまう気がする。
  - スケールアウトは PowerShell や ARM テンプレートでやるのかな？
    - [Create a host pool with PowerShell (Preview)](https://docs.microsoft.com/ja-jp/azure/virtual-desktop/create-host-pools-powershell?WT.mc_id=AZ-MVP-5003408)
    - [Create a host pool with an Azure Resource Manager template (Preview)](https://docs.microsoft.com/ja-jp/azure/virtual-desktop/create-host-pools-arm-template?WT.mc_id=AZ-MVP-5003408)
- 時間に応じた Host Pool の停止・起動
  - 専用のスクリプトが公開されている
    - [Automatically scale session hosts](https://docs.microsoft.com/ja-jp/azure/virtual-desktop/set-up-scaling-script?WT.mc_id=AZ-MVP-5003408)
    - [Azure/RDS-Templates](https://github.com/Azure/RDS-Templates/tree/master/wvd-sh/WVD%20scaling%20script)

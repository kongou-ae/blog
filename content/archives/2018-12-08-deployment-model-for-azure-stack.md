---
title: Azure Stack を設置する（接続モデル）
author: kongou_ae
date: 2018-12-08
url: /archives/2018-12-08-connection-model-for-azure-stack
categories:
  - azurestack
---

## はじめに

本エントリーは[Microsoft Azure Stack Advent Calendar 2018](https://qiita.com/advent-calendar/2018/azure-stack)の8日目です。

本日のエントリーでは、Azure Stack Hub を設置するうえで重要となる「接続モデル」についてまとめます。

## 2つの接続モデル

Azure Stack Hub には2つの接続モデルが存在します。それが Connected deployment と Disconnected deployment です。

参考：[Azure Stack 統合システムの接続モデル](https://docs.microsoft.com/ja-jp/azure/azure-stack/azure-stack-connection-models)

### 1. Connected deployment

Connected deployment とは、インターネットに接続できる環境に Azure Stack Hub をデプロイすることを指します。次の通り、Microsoft は Connected deployment をデフォルトとしています。

>  接続されたデプロイは、特に Azure と Azure Stack の両方を含むハイブリッド クラウドのシナリオの場合、顧客が Azure Stack を最大限に活用できるため、既定のオプションになります。

引用：[Azure Stack 統合システムの Azure に接続されたデプロイ計画の決定](https://docs.microsoft.com/ja-jp/azure-stack/operator/azure-stack-connected-deployment?view=azs-1910)

Connected deployment と対になる Disconnected deployment には、様々の制限があります。ですので、「弊社はインターネット接続が厳しいので、とりあえず Disconnected にしよう」というスタンスではなく、「是が非でも Connected にするんだ」というスタンスで検討することをお勧めします。

Connected deployment な Azure Stack のアクセス先は次のURLの通りです。現時点での Azure Stack Hub は透過型 Proxy のみをサポートしているので、Proxy を経由させるのが大変です。

参考：[ポートと URL (送信)](https://docs.microsoft.com/ja-jp/azure/azure-stack/azure-stack-integrate-endpoints#ports-and-urls-outbound)

### 2. Disconnected deployment

Disconnected deployment とは、Azure Stack Hub をインターネットおよび Azure に接続できない環境にデプロイすることを指します。

参考：[Azure Stack 統合システムの Azure から切断されたデプロイ計画の決定](https://docs.microsoft.com/ja-jp/azure/azure-stack/azure-stack-disconnected-deployment)

Disconnected deployment による機能的な制限は次の URL に記載されています。

参考：[切断されたデプロイで損なわれるか、または使用できない機能](https://docs.microsoft.com/ja-jp/azure/azure-stack/azure-stack-disconnected-deployment#features-that-are-impaired-or-unavailable-in-disconnected-deployments)

上記以外にも、次のよう機能が不便になりそうな気がします。ただし、Disconnected deployment な Azure Stack Hub に触れたことがないので、想像を含みます。これら以外にも、ドキュメントに記載されておらず私が想像もしなかった制約があるかもしれません。覚悟した上で Disconnected deployment を選択しましょう。

- Windows Defender の定義ファイル更新
  - 随時更新から定期アップデートによる更新に頻度が下がる
  - 定期アップデートによる更新を待てない場合は、Windows Defender だけを任意のタイミングで手動更新できる
  - [Azure Stack 上で Windows Defender ウイルス対策を更新する](https://docs.microsoft.com/en-us/azure/azure-stack/azure-stack-security-av#disconnected-scenario)
- 定期アップデート用パッケージの自動ダウンロード
  - Azure Stack Hub 自身による自動ダウンロードから、手動で端末にダウンロードして、手動で Azure Stack Hub にアップロードする方式に変更

## 接続モデルと認証方式

Azure Stack Hub は、Azure Active Directory による認証と ADFS による認証の２つをサポートしています。Connected deployment は両方の方式をサポートしますが、Disconnected deployment は ADFS のみをサポートします。

| | Connected | Disconnected |
|---|--------------|-------------|
|AAD認証| OK | NG |
|ADFS認証| OK | OK |

どちらの認証方式にするか決めたら、Deployment Worksheet に記入しましょう。認証方式は、Deployment Worksheet における最初の項目です。

{{<img src="./../../images/2018-12-08-001.png">}}

なお、OEM ベンダによりデプロイが始まってしまうと、認証方式を変えられません。したがって、Disconnected deployment で ADFS 認証を選択した場合、後からインターネット環境を整備できたとしても、認証は ADFS のままです。どうしても AAD 認証に切り替えたければ、Azure Stack Hub を OEM ベンダに再デプロイしてもらう必要があります。

## 接続モデルと課金方式

[Azure Stack の料金](https://aimless.jp/blog/archives/2018-12-06-cost-of-azurestack)て、お話したとおり、Azure Stack Hub 上で動作する Azure の利用料は、従量課金と年間定額のキャパシティ課金の2種類があります。Connected deployment の場合は、どちらもサポートしますが、Disconnected deployment の場合は、キャパシティ課金のみをサポートします。

| | Connected | Disconnected |
|---|--------------|-------------|
|従量課金| OK | NG |
|キャパシティ課金| OK | OK |

ただし、課金方式は、認証方式と違って後から変更できるようです。

参考：[登録を更新または変更する](https://docs.microsoft.com/ja-jp/azure/azure-stack/azure-stack-registration#renew-or-change-registration)

## まとめ

本日のエントリでは、Azure Stack Hub を設置する際に最初に検討することになる接続モデルを説明しました。接続モデルに依存する認証方式は「後戻りするには再デプロイ」という重要な項目です。なんとなーく Disconnected deployment を選択するのではなく、Azure Stack Hub に期待することやAzure Stack Hub で実現したい世界を踏まえて接続モデルを選びましょう。

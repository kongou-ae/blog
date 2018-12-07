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

本日のエントリーでは、Azure Staack を設置するうえで重要となる「接続モデル」について説明します

## 2つの接続モデル

Azure Stack には2つの接続モデルが存在します。それが Connected deployment と Disconnected deployment です。

参考：[Azure Stack 統合システムの接続モデル](https://docs.microsoft.com/ja-jp/azure/azure-stack/azure-stack-connection-models)

### 1. Connected deployment

Connected deployment とは、インターネットに接続できる環境に Azure Stack をデプロイすることを指します。次の通り、Microsoft は Connected deployment を推奨しています。


> Azure Stack と Azure 間のハイブリッド シナリオを含めて、Azure Stack から最大のメリットを得るには、Azure に接続した状態でのデプロイをお勧めします。

引用：[Azure Stack デプロイの接続モデルを選択する](https://docs.microsoft.com/ja-jp/azure/azure-stack/azure-stack-connection-models)

Connected deployment と対になる Disconnected deployment には、沢山の制限があります。ですので、「弊社はインターネット接続が厳しいのでとりあえず Disconnected」というスタンスではなく、「是が非でも Connected にするんだ」というスタンスをお勧めします。

Connected deployment における Azure Stack の具体的なアクセス先は次のURLの通りです。現時点での Azure Stack は透過型 Proxy のみをサポートしているので、Proxy 経由にしにくいです。ただし、今後 Forward Proxy のサポートが計画されていますので、今よりも Connected deployment にしやすくなるでしょう。

参考：[ポートと URL (送信)](https://docs.microsoft.com/ja-jp/azure/azure-stack/azure-stack-integrate-endpoints#ports-and-urls-outbound)

### 2. Disconnected deployment

Disconnected deployment とは、Azure Stack がインターネットおよび Azure に接続できない環境にデプロイすることを指します。

参考：[Azure Stack 統合システムの Azure から切断されたデプロイ計画の決定](https://docs.microsoft.com/ja-jp/azure/azure-stack/azure-stack-disconnected-deployment)

Disconnected deployment による機能的な制限は次の URL に記載されています。

参考：[切断されたデプロイで損なわれるか、または使用できない機能](https://docs.microsoft.com/ja-jp/azure/azure-stack/azure-stack-disconnected-deployment#features-that-are-impaired-or-unavailable-in-disconnected-deployments)

上記以外にも、次のよう機能が不便になりまりそうな気がします。ただし、Disconnected deployment な Azure Stack に触れたことがないので、想像を含みます。これら以外にも、ドキュメントに記載されておらず私が想像もしなかった制約があるかもしれません。覚悟した上で Disconnected deployment を選択しましょう。

- Windows Defender の定義ファイル更新
  - 随時更新から定期アップデートによる更新に頻度が下がる
  - [Azure Stack 上で Windows Defender ウイルス対策を更新する](https://docs.microsoft.com/en-us/azure/azure-stack/azure-stack-security-av#disconnected-scenario)
- 定期アップデート用パッケージの自動ダウンロード
  - Azure Stack 自身による自動ダウンロードから、手動で端末にダウンロードして、手動で Azure Stack にアップロードする方式に変更
- Github 上のテンプレートを使ったデプロイ
  - ポータル上で GitHub のテンプレートからリソースをデプロイする方式から、GitHub からテンプレートを手動でダウンロードしたうえでデプロイする方式に変更

## 接続モデルと認証方式

Azure Stack は、Azure Active Directory による認証と ADFS による認証の２つをサポートしています。Connected deployment は両方の方式をサポートしますが、Disconnected deployment はADFSのみをサポートします。

| | Connected | Disconnected |
|---|--------------|-------------|
|AAD認証| OK | NG |
|ADFS認証| OK | OK |

どちらの認証方式にするか決めたら、Deployment Worksheet に記入しましょう。認証方式は、Deployment Worksheet における最初の項目です。

{{<img src="./../../images/2018-12-12-001.png">}}

なお、OEM ベンダによりデプロイが始まってしまうと、認証方式を変えられません。したがって、Disconnected deployment で ADFS 認証を選択した場合、後からインターネット環境を整備できたとしても、認証は ADFS のままです。どうしても AAD 認証に切り替えたければ、Azure Stack を OEM ベンダに再デプロイしてもらう必要があります。

## 接続モデルと課金方式

[Azure Stack の料金](https://aimless.jp/blog/archives/2018-12-06-cost-of-azurestack)て、お話したとおり、Azure Stack 上で動作する Azure の利用料は、従量課金と年間定額のキャパシティ課金の2種類があります。Connected deployment の場合は、どちらもサポートしますが、Disconnected deployment の場合は、キャパシティ課金のみをサポートします。

| | Connected | Disconnected |
|---|--------------|-------------|
|従量課金| OK | NG |
|キャパシティ課金| OK | OK |

ただし、課金方式は、認証方式と違って後から変更できるようです。

参考：[登録を更新または変更する](https://docs.microsoft.com/ja-jp/azure/azure-stack/azure-stack-registration#renew-or-change-registration)

## まとめ

本日のエントリでは、Azure Stack を設置する際に最初に検討することになる接続モデルを説明しました。なんとなーく Disconnected deployment を選択するのではなく、Azure Stack に期待することやAzure Stack で実現したい世界を踏まえて、適切な接続モデルを選びましょう。

---
title: Bicep を試した
author: kongou_ae
date: 2021-02-07
url: /archives/2021/02/1st-impression-of-bicep
categories:
  - azure
---

## はじめに

組み込みの Azure Policy をまとめてデプロイできる ARM テンプレートがあったら便利じゃないか？という思い付きで ARM テンプレートを書くことにしました。そうはいっても JSON な ARM テンプレートを一から書くのは少々しんどいので、前々から気になっていた [Bicep](https://github.com/Azure/bicep) を試してみました。

## Bicep とは

Bicep とは次世代の ARM テンプレートとして開発されている DSL です。Bicep は JSON フォーマットではなく独自のフォーマットで実装されています。Windows サーバを作成する ARM テンプレートと Bicep を比較すると、Bicep の方が可読性が高くなっていることが分かります。特に、パラメータや変数の参照が段違いです。コメントも書けます。

- [Bicep 版](https://github.com/Azure/bicep/blob/main/docs/examples/101/vm-simple-windows/main.bicep)
- [ARM テンプレート 版](https://github.com/Azure/azure-quickstart-templates/blob/master/101-vm-simple-windows/azuredeploy.json)

「Terraform と同じじゃね？」に対する公式の回答は[こちら](https://github.com/Azure/bicep#faq)

## 使ってみる

現時点では Bicep をそのままデプロイすることはできません。Bicep なファイルを bicep コマンドで ARM テンプレートに変換する必要があります。Windows の場合、インストーラを利用して bicep コマンドをインストールします。

参考：[Windwos へのインストール方法](https://github.com/Azure/bicep/blob/main/docs/installing.md#windows)

また、Bicep をサポートする VS Code の拡張機能が用意されています。これをインストールすると、Bicep なファイルが ARM テンプレートと同じようにハイライトされてわかりやすくなります。

{{< figure src="/images/2021/2021-0207-001.png" title="拡張機能のインストール後の見た目" >}}

参考：[Bicep 拡張機能](https://marketplace.visualstudio.com/items?itemName=ms-azuretools.vscode-bicep)

## 書いてみる

Bicep なファイルを書く場合、公式リポジトリに存在するサンプルを利用すると便利です。様々なリソースをデプロイするための Bicep なファイルが用意されていますので、とても参考になります。

参考：[サンプル](https://github.com/Azure/bicep/tree/main/docs/examples)

例えば[2つのサブネットを持つ VNet をデプロイする Bicep ファイル](https://github.com/Azure/bicep/blob/main/docs/examples/101/vnet-two-subnets/main.bicep)は次の通りです。

```
param suffix string = '001'
param owner string = 'alex'
param costCenter string = '12345'
param addressPrefix string = '10.0.0.0/15'

var vnetName = 'vnet-${suffix}'

resource vnet 'Microsoft.Network/virtualNetworks@2020-06-01' = {
  name: vnetName
  location: resourceGroup().location
  tags: {
    Owner: owner
    CostCenter: costCenter
  }
  properties: {
    addressSpace: {
      addressPrefixes: [
        addressPrefix
      ]
    }
    enableVmProtection: false
    enableDdosProtection: false
    subnets: [
      {
        name: 'subnet001'
        properties: {
          addressPrefix: '10.0.0.0/24'
        }
      }
      {
        name: 'subnet002'
        properties: {
          addressPrefix: '10.0.1.0/24'
        }
      }
    ]
  }
}
```


Bicep なファイルを書き終わったら、Bicep コマンドを使って Bicep なファイルを ARM テンプレートに変換します。

```
bicep build ./main.bicep
```

変換すると .bicep と同じ場所に同名の json ファイルができます。あとは ARM テンプレートと同じ要領でデプロイすればOKです。

## GitHub Action と連携させる

テンプレートを書く人からすると Bicep はとても楽です。一方で誰かが書いたテンプレートを使う側からすると、Bicep で書かれたテンプレートを使うためには Bicep コマンドをインストールしなければならず面倒です。とはいえ、テンプレートを書く側からすると、Bicep ファイルを書いた後に毎回 bicep コマンドでビルドして Bicep ファイルと ARM テンプレートの両方をリポジトリにプッシュするのは少々手間です。もしリポジトリにプッシュした Bicep ファイルが ARM テンプレートに自動的に変換されたら、テンプレートを書く人と使う人の両方が幸せになれます。

この課題を GitHub Action で解決してみます。GitHub Action には、Bicep ファイルをビルドする非公式のアクション（[aliencube
/
bicep-build-actions](https://github.com/aliencube/bicep-build-actions)）が存在します。これを利用して次のような GitHub Action を設定すると、特定の Bicep ファイルをコミットした場合に、Bicep ファイルがARM テンプレートに自動的に変換されてリポジトリにプッシュされますので、書く人と使う人の両方が幸せになれます。

```
name: CI

# Controls when the action will run. 
on:
  push:
    branches: [ main ]
    paths: baseline.bicep
  pull_request:
    branches: [ main ]
    paths: baseline.bicep

  workflow_dispatch:

jobs:
  Publish-new-ArmTemplate:
    runs-on: ubuntu-latest

    steps:
      - uses: actions/checkout@v2
      - name: Bicep Build
        uses: aliencube/bicep-build-actions@v0.1
        with:
          files: baseline.bicep

      - name: git setting
        run: |
          git config --local user.email "xxx"
          git config --local user.name "xxx"
          
      - name: Commit files
        run: |
          git add .
          git commit -m "Build json from .bicep" -a
          git push origin main
```

## おわりに

今回は Bicep を試してみました。Bicep ではARM テンプレートの辛い点が改善されています。一般公開されたら ARM テンプレートから乗り換えようと思います。

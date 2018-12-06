---
title: Azure Stack を設置する（Deployment Worksheet）
author: kongou_ae
date: 2018-12-07
url: /archives/2018-12-07-deployment-worksheet-for-azurestack
categories:
  - azurestack
---

## はじめに


本エントリーは[Microsoft Azure Stack Advent Calendar 2018](https://qiita.com/advent-calendar/2018/azure-stack)の7日目です。

本日のエントリーでは、Azure Staack を設置するために必要なことを説明します。

## 利用者が実施すべきこと

Azure Stack を設置するために管理者が実施することは、次の3つです。

1. 設置場所を確保する
1. Deployment Worksheet を埋める
1. Deployment Worksheet に記載した内容に即したものを用意する

これだけのことを終えてしまえば、後の作業は 原則として OEM ベンダの責任範囲です。OEM ベンダが設置場所に Azure Stack を搬入して、提出した Deplowment Worksheet の情報に沿って OEM ベンダが Azure Stack をデプロイします。利用者は 構築が終わった Azure Stack が納品されるのを待つだけです。

利用者が実施すべき3つの作業について概要を説明します。

## 1. 設置場所を確保する

Azure Stack は物理です。従来のサーバと同じように、設置場所を決める必要があります。OEM ベンダから機器の諸元を入手したうえで、ラックと電源を確保しましょう。OEM ベンダによっては、独自ラックでの納品と既存ラックへの設置の2パターンの設置方式をサポートしています。設置場所にあった設置方式で OEM ベンダに発注したうえで、設置場所を確保しましょう。

## 2. Deployment Worksheet を埋める

[Azure Stack とは](https://aimless.jp/blob/archives/2018-12-01-what-is-azurestack)に記載した通り、利用者が指定できる Azure Stack のパラメータは限られています。具体的なパラメータは次の通りです。なお、OEM ベンダによっては、OEM ベンダの運用管理ソフトウェアを構築するために、追加のパラメータを求めてくるかもしれません。

- 認証方式（AAD or ADFS）
- リージョン名
- 外部ドメイン名
- 内部ドメイン名
- サーバのホスト名の Prefix
- NTP サーバ
- DNS フォワーダ
- Syslog サーバ
- AS 番号
- Azure Stack が利用するサブネット5つ

自由度が低いことを良いと思うか悪いと思うかは人それぞれです。私は決めることが少ないほうが好きです。なぜなら、私は、パラメータを決めたいのではなく、ソリューションを利用してビジネス上の課題を解決したいからです。決めることが少なければ少ないほど、早くソリューションを使い始めて課題を早く解決できます。

これらのパラメータを指定するために利用するものが Deployment Worksheet です。Microsoft はサンプルの Deployment Worksheet を公開しています。OEM ベンダや設置場所の管理者と調整しつつ、Deployment Worksheetを埋めましょう。パラメータの詳細は後日のエントリーで触れます。

参考：[Sample Azure Stack Deployment Worksheet](https://gallery.technet.microsoft.com/Sample-Azure-Stack-b898beb1)

## 3. Deployment Worksheet に記載した内容に即したものを用意する

Azure Stack は、Deployment Worksheet に記載した通りにデプロイされます。デプロイが始まる前までに、Deployment Worksheet に記載したものを用意しましょう。用意に漏れや不備があると、Azure Stack のデプロイができませんので、必ず用意しましょう。

## おわりに

本日のエントリーでは、Azure Stack を設置するための前提条件となる Deployment Worksheet について説明しました。明日以降のエントリーでは、Deployment Worksheet に記載すべき個々のパラメータに触れていきます。

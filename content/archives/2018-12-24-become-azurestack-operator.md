---
title: Azure Stack Operator
author: kongou_ae
date: 2018-12-24
url: /archives/2018-12-24-become-azurestack-operator
categories:
  - azurestack
---

## はじめに

本エントリーは[Microsoft Azure Stack Advent Calendar 2018](https://qiita.com/advent-calendar/2018/azure-stack)の24日目です。

本日のエントリでは Azure Stack の登場によって生まれた Azure Stack Operator という役割をまとめます。

## 新しい何か

1日目から23日目のエントリで説明してきたとおり、Azure Stack はオンプレミス向けに販売されている仮想化製品とは全く異なるソリューションです。主要な違いは次の通りです。

|観点    |従来の仮想化製品 |Azure Stack |
|---------------|---------------------|------------------------|
| 設計 | 管理者がすべてを設計する | Microsfot と OEM ベンダ がほぼ設計済み |
| 構築 | 管理者が構築する | 出来上がったものが納品される |
| アップデート | 管理者の任意のタイミングで実施する | 原則として毎月アップデートする |
| 権限 | 特権を有する | 特権を持たない |
| 提供するサービス | IaaS | Azure と一貫性をもった各種サービス |
| 保守 | 自分でトラブルシュート | Microsoft と一緒にトラブルシュート |

Azure というパブリッククラウドに慣れた人であれば、Azure Stack の不自由さにもすぐになれるでしょう。ですが、今までの仮想化製品に慣れ親しんだ人が、今までの仮想化製品と同じ感覚で Azure Stack を使いこなすことは不可能です。

## 新しい役割

Azure Stack の違いを正しく伝えるために、Microsoft は、Azure Stack のリリースにあわせて2つのエントリを公開しました。

- [Why your team needs an Azure Stack Operator](https://azure.microsoft.com/en-us/blog/why-your-team-needs-an-azure-stack-operator/)
- [Operating Azure Stack](https://azure.microsoft.com/en-us/blog/operating-azure-stack/)

このエントリの中で掲げられた新しい役割が「Azure Stack Operator」です。Azure Stack Operator とは単なる仮想化基盤の運用担当ではありません。Azure を運用する Microsoft のエンジニアと同じように、Azure Stack を通じて Azure と一貫性を持ったクラウドサービスを利用者に対して提供することに責任を負います。この Advent Calendar では、Azure Stack Operator に必要となる知識を網羅的に説明してきました。今日からあなたも Azure Stack Operator の一員です。

## まとめ

本日のエントリでは Azure Stack Operator という新しい役割をまとめました。新しい何かを正しく利用するためには新しい役割が必要です。従来の仮想基盤は「頑張って導入する。入れたら粛々と運用」というソリューションです。ですが、Azure Stack は「導入してからが本番」なソリューションです。Azure Stack Operator を育成して、Azure Stack の効果的に利用しましょう。
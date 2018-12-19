---
title: Azure Stack を修理する
author: kongou_ae
date: 2018-12-20
url: /archives/2018-12-20-repair-azure-stack
categories:
  - azurestack
---
##  はじめに

本エントリーは[Microsoft Azure Stack Advent Calendar 2018](https://qiita.com/advent-calendar/2018/azure-stack)の20日目です。

先日のエントリでは、Azure Stack を診断する方法をまとめました。本日のエントリでは、異常と判断した後の直し方をまとめます。ただし、OEM ベンダの責任範囲の部分は OEM ベンダによって修理の方法が異なる可能性があるため本エントリでは割愛します。

## 問い合わせる

Azure Stack を異常と判断して自己解決が不可能な場合、サポートに対応してもらわなければなりません。Azure Stack は、壊れた場所によって問い合わせ先が異なります。Azure Stack というソフトウェアの部分は、Azure のサポートに問い合わせます。EA サブスクリプションであれば問い合わせ先は Microsoft です。CSP サブスクリプションであれば、問い合わせ先は CSP ベンダのサポート窓口です。ハードウェアの部分は、Azure Stack を購入した OEM ベンダに問い合わせます。

## ログを集める

Azure サポートに問い合わせると、ログの提出を求められる場合があります。Azure Stack にはログを収集するためのコマンドが存在します。それが Get-AzureStackLog です。Get-AzureStackLog コマンドは、Azure Stack 内部に散らばっている各種ログを収集してくれる便利コマンドです。

参考：[Azure Stack の診断ツール](https://docs.microsoft.com/ja-jp/azure/azure-stack/azure-stack-diagnostics)

ただし、このコマンドは引数の設定がめんどくさいです。そんなあなたにおすすめのものが、GUI でログを取得できる  [ERCS_AzureStackLogs.ps1](http://aka.ms/ERCS) です。Get-AzureStackLog のラッパーであるこのスクリプトを利用すると、GUI をポチポチしてログを取得できます。また、このスクリプトには、ログファイルの圧縮や Microsoft へのログ送付などサポートに問い合わせる際に必要なタスクが盛り込まれています。

フィルタをかけずにログファイルを取得した場合、ログファイルのサイズは数Gバイトになります。取得するのにも時間がかかりますし、サポートに送るのにも時間がかかります。ログを取得するマシンのディスクの空き容量やインターネット回線の帯域に注意しましょう。

## 一緒にトラブルシュートする

Microsoft のサポート担当者は、申告を受けたアラートの内容や受領したログファイルの内容から対応方法を決定します。ただし、Azure Stack は管理者の権限が制限されているため、対応方法によっては、管理者だけで対応できない可能性があります。管理者に代わってMicrosoft のサポート担当が対応方法を実行しようにも、Azure Stack は Azure と違ってお客様のデータセンタに設置されているため、Microsoft のサポート担当者がアクセスできません。

障害対応で特権が必要な場合は、Azure Stack にアクセスできる管理者と Microsoft のサポート担当者が連携してトラブルシュートします。具体的には、Skype や LogMeIn などのリモートサポートツールを使って、遠方にいる Microsoft 担当者に Azure Stack を調査・修理してもらいます。Microsoft のサポート担当と一緒に [Azure Stack の認証認可](https://aimless.jp/blog/archives/2018-12-12-anthn-anthz-for-azurestack/)で解説した方法で PEP を特権に切り替えたうえで、PowerShell を利用して問題を修正します。

## ハードウェア交換時の注意点

ハードウェアのトラブルでは、従来のサーバと同じように部品を交換します。ただし、部品に応じて Azure Stack 特有の操作が発生します。

### ディスク

Azure Stack を構成する Host Node の Disk は、Host Node の OS が動作しているディスクを除いて Storage Spaces Direct で冗長化されています。そのため、ディスクを交換した後に、Storage Spaces Direct のステータスが正常であることを確認する必要があります。RAIDの再構築が終わるのを待つのと同じイメージです。

参考：[Azure Stack の物理ディスクを交換する](https://docs.microsoft.com/ja-jp/azure/azure-stack/azure-stack-replace-disk)

### 活性交換できない部品

活性交換できない部品を交換した場合、その Host Node を一から作り直します。「障害の結果どのような状態になったか分からない Host Node をそのまま使い続けるよりも、あるべき姿の Host Node に作りなおすほうが安全だ」という考え方だと思います。作り直す作業は Repair と呼ばれ、ボタンワンクリックで自動で Host Node が作り直されます。

{{< figure src="./../../images/2018-12-20-001.png" title="Repair ボタン" >}}

## まとめ

本日のエントリーでは、Azure Stack の直し方をまとめました。決められたコマンドでログを集めて、Microsoft のサポートエンジニアに開設してもらい、Microsoft のサポートエンジニアに直してもらう。パブリッククラウドのようなもの「ハードウェアも含めてインフラの運用を任せられる」というレベルではありませんが、Azure Stack を使うことで Microsoft のサポートエンジニアに仮想化レイヤのトラブルシュートをアウトソースできます。差別化要素にならない部分をお金で解決すれば、差別化要素に注力できますね。

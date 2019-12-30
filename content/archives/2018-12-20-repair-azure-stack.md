---
title: Azure Stack Hub を修理する
author: kongou_ae
date: 2018-12-20
url: /archives/2018-12-20-repair-azure-stack
categories:
  - azurestack
---

- 初版：2018年12月
- 第二版：2019年12月

## はじめに

本エントリーは[Microsoft Azure Stack Advent Calendar 2018](https://qiita.com/advent-calendar/2018/azure-stack)の20日目です。

先日のエントリでは、Azure Stack Hub を診断する方法をまとめました。本日のエントリでは、異常と判断した後の直し方をまとめます。ただし、OEM ベンダによって修理の方法が異なる可能性があるため、OEM ベンダの責任範囲の部分を割愛します。

## 問い合わせる

Azure Stack Hub を異常と判断したものの自己解決が不可能な場合、サポートに対応してもらわなければなりません。Azure Stack Hub は、壊れた場所によって問い合わせ先が異なります。Azure Stack Hub というソフトウェアの部分に関する障害であれば、Azure のサポートに問い合わせます。EA サブスクリプションであれば問い合わせ先は Microsoft です。CSP サブスクリプションであれば、問い合わせ先は CSP ベンダのサポート窓口です。ハードウェアの部分に関する障害であれば、Azure Stack Hub を購入した OEM ベンダに問い合わせます。

## ログを集める

Azure サポートに問い合わせると、ログの提出を求められる場合があります。Azure Stack Hub にはログを収集するためのコマンドが存在します。それが Get-AzureStackLog です。Get-AzureStackLog コマンドは、Azure Stack 内部に散らばっている各種ログを収集してくれる便利コマンドです。

参考：[Azure Stack の診断ツール](https://docs.microsoft.com/ja-jp/azure/azure-stack/azure-stack-diagnostics)

ただし、このコマンドは引数の設定がめんどくさいです。そんなあなたにおすすめのものが、GUI でログを取得できる  [ERCS_AzureStackLogs.ps1](http://aka.ms/ERCS) です。Get-AzureStackLog のラッパーであるこのスクリプトを利用すると、GUI をポチポチしてログを取得できます。また、このスクリプトには、ログファイルの圧縮や Microsoft へのログ送付などサポートに問い合わせる際に必要なタスクが盛り込まれています。

フィルタをかけずにログファイルを取得した場合、ログファイルのサイズは数Gバイトになります。取得するのにも時間がかかりますし、サポートに送るのにも時間がかかります。ログを取得するマシンのディスクの空き容量やインターネット回線の帯域に注意しましょう。

また、1907 以降の Azure Stack Hub には、管理者ポータルでログを取得する機能が追加されました。Microsoft のサポート担当からもらった SAS トークンつきの blob の URLと時間帯を入力するだけで、Azure Stack Hub 自身がログを集めて blob にアップロードしてくれます。とても楽なので、普段の運用ではこの機能を使うとよいでしょう。

{{< figure src="./../../images/2019-07-28-003.png" title="ログを取得する画面" >}}

## 一緒にトラブルシュートする

Microsoft のサポート担当者は、申告を受けたアラートの内容や受領したログファイルの内容から対応方法を決定します。ただし、対応方法を管理者だけで実施できない可能性があります。なぜなら、Azure Stack Hub が管理者の権限が制限しているためです。管理者に代わってMicrosoft のサポート担当が対応方法を実行しようにも、お客様のデータセンタに設置されている Azure Stack Hub に Microsoft のサポート担当者はアクセスできません。

そこで、障害対応で特権が必要な場合は、Azure Stack Hub にアクセスできる管理者と Microsoft のサポート担当者が連携してトラブルシュートします。具体的には、Teams や LogMeIn などのリモートサポートツールを使って、遠方にいる Microsoft 担当者に Azure Stack Hub を調査・修理してもらいます。具体的には、Microsoft のサポート担当と一緒に [Azure Stack の認証認可](https://aimless.jp/blog/archives/2018-12-12-anthn-anthz-for-azurestack/)で解説した方法で PEP を特権に切り替えたうえで、PowerShell を利用して問題を修正します。

## ハードウェア交換時の注意点

ハードウェアのトラブルでは、従来のサーバと同じように部品を交換します。ただし、部品に応じて Azure Stack Hub 特有の操作が発生します。

### ディスク

Azure Stack Hub を構成する Host Node の Disk は、Host Node の OS が動作しているディスクを除いて Storage Spaces Direct で冗長化されています。そのため、ディスクを交換した後に、Storage Spaces Direct のステータスが正常であることを確認する必要があります。RAIDの再構築が終わるのを待つのと同じイメージです。

参考：[Azure Stack の物理ディスクを交換する](https://docs.microsoft.com/ja-jp/azure/azure-stack/azure-stack-replace-disk)

### 活性交換できない部品

活性交換できない部品を交換した場合、その Host Node を一から作り直します。「障害の結果どのような状態になったか分からない Host Node をそのまま使い続けるよりも、あるべき姿の Host Node に作りなおすほうが安全だ」という考え方だと思います。作り直す作業は Repair と呼ばれ、ボタンワンクリックで自動で Host Node が作り直されます。

{{< figure src="./../../images/2018-12-20-001.png" title="Repair ボタン" >}}

## まとめ

本日のエントリーでは、Azure Stack の直し方をまとめました。ソフトウェアの部分の修理は「決められたコマンドでログを集めて、Microsoft のサポートエンジニアに解析してもらい、Microsoft のサポートエンジニアに直してもらう」というパターンになるが多いです。パブリッククラウドにおける「インフラの運用を全部任せられる」というレベルではありませんが、Azure Stack Hub を使えば、Microsoft のサポートエンジニアに仮想化レイヤのトラブルシュートをアウトソースできます。差別化要素になりにくい部分をお金で解決すれば、差別化要素に注力できますね。

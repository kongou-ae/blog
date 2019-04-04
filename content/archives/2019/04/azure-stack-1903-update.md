
---
title: Azure Stack 1903 Update
author: kongou_ae
date: 2019-04-04
url: /archives/2019/04/azure-stack-1903-update
categories:
  - azurestack
---

## はじめに

Azure Stack 1903 Update がリリースされました。



## ASDK

1903版のASDK はリリースされませんでした。今まではIntegrated systems のリリースに追随して ASDK もでていたと思います。リリースされなかった理由は目立った新機能や改善がなかったからだと思いますが、事情がになります。

## Integrated systems

### アップデートにかかる時間

1903 Update 以降、Microsoft はアップデートの適用
にかかる見込み時間を教えてくれるようになるようです。

> Future updates will provide similar guidance on the expected time the update takes to complete, depending on the payload included.

これは本当にありがたいです。Azure Stack のアップデートは自動で行われます。そのため所要時間が全く読めません。仕方がないので「過去の実績からすると、20時間から30時間、30時間を超えることもある」というデタラメな予想をもとに対応せざるを得ませんでした。

今後は、Microsoftが見込みではあるものの所要時間を教えてくれるようになるので、アップデートの適用スケジュールを多少組みやすくなります。

### Public IP Address の idle timeout

Public IP address の Idle timeout が設定値に関わらず4分で動作するという不具合が改修されました。不具合が改修されたのは良いことですが、このような不具合を過去のリリースノートで見た記憶がありません。中身を自分で設定できない Azure Stack Integrated Systems は、利用者と Microsoft との信頼関係で成り立ってると思いますので、不具合のサイレント修正はやめてほしいです。。

## おわりに

1902に続いて1903も目立った新機能がない Update でした。ブログのネタがありませんので、Azure の Virtual Machine と Azure Stack の Virtual Machine を Azure の運用管理サービスでまとめて運用するHybrid Cloud Management な領域に踏み込んでいこうと思います、

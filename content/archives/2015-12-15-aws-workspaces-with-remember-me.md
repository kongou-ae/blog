---
title: Amazon WorkSpacesのRemember Me機能を使う
author: kongou_ae
date: 2015-12-15
url: /archives/2015-12-15-aws-workspaces-with-remember-me
categories:
  - AWS
---

Amazon WorkSpacesへの憧れが止まりません。BYOD＋WorkSpacesで仕事がしたい。とはいえ、古きSIerである弊社において、いきなりBYODはレベルが高すぎます。そこで、自宅からのリモートアクセス用途として会社に対してWorkSpacesを提案することにしました。そのために色々と調べたのでメモしておきます。

## MFAの罠

AD ConnectorとRADIUSサーバによる多要素認証を使ってみて気が付いたのですが、WorkSpacesクライアントは多要素認証を使っていても認証情報を記憶します。多要素認証でログインした後に一旦切断しても、以下の画面になりボタン一つで簡単に再接続ができます。

![https://media.amazonwebservices.com/blog/2015/ws_client_reconnect_2.png](https://media.amazonwebservices.com/blog/2015/ws_client_reconnect_2.png)

　認証情報を保存する機能は便利なのですが、社外に配置するPCで利用するWorkSpacesクライアントには認証情報を保存したくありません。誰が触るかわかりませんので。

## Remember Meの無効化

ドキュメントを調べたところ、ぴったりな機能がありました。Remember Meの無効化です。


[Amazon WorkSpaces クライアントのヘルプ](http://docs.aws.amazon.com/ja_jp/workspaces/latest/adminguide/osx_client_help.htm)


> Amazon WorkSpaces 管理者が [Remember Me] 機能を無効にしていない場合、それ以降 WorkSpace に簡単に接続できるように、自分の認証情報を安全に保存しておくかどうかを確認するメッセージが表示されます。認証情報は、ユーザーの Kerberos チケットの最大有効期間が終了するまで安全にキャッシュに保存されます。

現時点で、Remember Meの無効化はサポートにお願いする必要があります。マネジメントコンソールでは無効にできません。

## Remember Me無効後の動作

WorkSpacesクライアントを切断します。

![http://aimless.jp/blog/images/2015-12-15-002.png](http://aimless.jp/blog/images/2015-12-15-002.png)

切断後の画面がRecconectになりません。IDとパスワード、ワンタイムパスワードを入力する画面に戻りました。

![http://aimless.jp/blog/images/2015-12-15-003.png](http://aimless.jp/blog/images/2015-12-15-003.png)

WorkSpacesクライアントのオプション設定でもRemember Meを有効にすることができなくなります。

![http://aimless.jp/blog/images/2015-12-15-004.png](http://aimless.jp/blog/images/2015-12-15-004.png)

## 所感

WorkSpacesはどこでもどんな端末でも使えるのが最大のメリットだと思います。ですが、どこでも使える端末に社内ネットワークにアクセスするための認証情報を保存するのはリスクがあります。Remember Meの無効化は、利便性とセキュリティを両立させる良いオプションだと思います。

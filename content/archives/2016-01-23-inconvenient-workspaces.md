---
title: Amazon WorkSpacesを不便にする
author: kongou_ae
date: 2016-01-23
url: /archives/2016-01-23-inconvenient-workspaces
categories:
  - aws
---

WorkSpacesは大変気軽です。ですが、リモートアクセス用途での導入を検討した場合、あまりにも気軽に社内LANにアクセスできてしまうことが問題となります。標準の設定のまま利用者に使わせると、社内LANに新たなリスクを生み出すことになります。

もう少し不便にすることでセキュリティを高められないか、と考え、WorkSpacesのセキュリティや監査に関する機能を調査したのでメモします。
なお多要素認証については当たり前なので触れません。

## 認証情報の記憶を無効化する

WorkSpacesクライアントは、認証情報を記憶する機能（Remember Me）があります。これを利用することで、次回以降のログインにおいてIDとパスワードの入力が不要となります。多要素認証を使っている場合、多要素認証のパスワードも記憶します。

この機能は大変便利ですが、社外からのリモートアクセス用途の場合、第三者による不正利用のリスクが生まれます。この機能は利用しているDirectory Service単位で無効にすることができます。詳細は[Amazon WorkSpacesのRemember Me機能を使う](https://aimless.jp/blog/archives/2015-12-15-aws-workspaces-with-remember-me/)を参照ください。

## 利用状況を記録する

リモートアクセス用途の場合、有事の際に備えて、いつ誰が使っていたかをロギングできることが望ましいでしょう。

AWSでロギングといえばCloudTrailですが、WorkSpacesの利用状況はCloudTrailでロギングされません。WorkSpacesクライアントがWorkSpacesに接続する際にAPI Callが行われないからです。そのかわり、CloudWatchの以下メトリックに利用状況に関するデータが保存されています。

- ConnectionFailure
- ConnectionSuccess
- InSessionLatency
- SessionDisconnect
- SessionLaunchTime

CloudWatchにはWorkSpaces単位でメトリックが保存されます。原則、WorkSpacesは1ユーザ1端末ですので、いつ誰がWorkSpacesを利用したかが記録されていると言ってもいいでしょう。ただし、CloudWatchのデータは2週間しか保存されませんので、長期間の保存（例えば13か月分）が必要な場合は、APIを利用して外部のサーバにデータを記録しなけばなりません。

なお、現時点で、どこから（送信元IPアドレス）と、どの端末（WorkSpacesクライアントがインストールされている環境）からを調べることはできません。実装されるとうれしいです。

## 情報漏えいを防ぐ

デフォルトのAmazon WorkSpacesは、クリップボードのリダイレクトが有効になっています。WorkSpacesでコピーしたものを、WorkSpacesクライアントが動作するPCにペーストすることができます。リモートアクセス用途でWorkSpacesを利用している場合、技術的には、悪意あるユーザが情報を漏洩させることができます。

Amazon WorkSpacesがAD ConnectorによってActive Directoryの管理下にある場合、グループポリシを利用して以下の機能を制限することができます。これにより、WorkSpaces内のデータを外部に持ち出されるリスクを極小化することができます。

- クリップボードによるコピペ[(Clipboard Redirection)](http://docs.aws.amazon.com/workspaces/latest/adminguide/group_policy.html#gp_clipboard)
- ローカルプリンタを利用した印刷[(Local Printer Support)](http://docs.aws.amazon.com/workspaces/latest/adminguide/group_policy.html#gp_local_printers)

## 不要なセッションを積極的に切断する

WorkSpacesクライアントは、ネットワークが切れない限りセッションを維持します。所謂アイドルタイムアウトがないようです。リモートアクセス用途の場合、使っていないのに社内LANへのアクセス口が有効になっていることはリスクです。

現時点で、アイドルタイムアウトの設定は、WorkSpacesのサービス単体では実装できません。ただし、WorkSpacesがAD ConnectorによってActive Directoryの管理下にある場合、グループポリシによってアイドルタイムアウトの設定を行うことが可能です。具体的な設定は以下URLを参照ください。

[切断されたセッション、アクティブなセッション、およびアイドル状態のセッションに対するタイムアウト値を設定する](https://technet.microsoft.com/ja-jp/library/cc758177%28v=ws.10%29.aspx)

## まとめ

これまでの設定を実施すると、以下のようなWorkSpacesが完成します。かなり不便になりました。ですが、WorkSpacesをリモートアクセス用途で使う場合のリスクを大幅に軽減することができました。満足。

- 利用するたびに、多要素認証でログインする必要がある
- いつ使ったか、モニタリングできる
- 画面転送しかできない
- 使っていないと、接続が切れる

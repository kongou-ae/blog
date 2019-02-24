---
title: Azure Stack Uptime Monitor で Azure Stack の稼働率を計測する
author: kongou_ae
date: 2019-02-24
url: /archives/2019-02-24-monitor-availability-of-azurestack-with-azure-stack-uptime-monitor
categories:
  - azurestack
---

## はじめに

Azure CAT の [@_marcvaneijk] (http://twitter.com/_marcvaneijk) がリリースした [Azure/azurestack-uptime-monitor](https://github.com/Azure/azurestack-uptime-monitor) を試しました。

## Azure Stack Uptime Monitor とは

Azure Stack Uptime Monitor とは、Azure Stack の API エンドポイント の可用性を計測、可視化するソリューションです。ubuntu サーバ上で動作して、次の３つの機能を担います。

- API のエンドポイントとポータルにアクセスできるかどうかを定期に確認する
  - `az resource list` が成功するかによって API のエンドポイントの生死を確認する
  - TCP/443で雪像できるかどうかによってポータルに生死を確認する
- 確認結果を influx DB に保存する
- 保存されたデータをGrafana で可視化する

Grafana のダッシュボード はかなり良い雰囲気です。

{{< figure src="./../../images/2019-02-24-004.png" title="ダッシュボード" >}}

Ubuntu の 仮想マシンを Azure Stack 上で動作させるための費用はかかりますが、OSS をベースにしたソリューションのためソフトウェアの利用料はかかりません。当然、Microsoft の公式サポートはありません。

## インストール方法

インターネットにアクセスできる Azure Stack 上であれば、テンプレートを利用してデプロイできます。Azure Stack のメリットを活用したデプロイ方法です。デプロイにあたっては、次の6つの情報が必要です。

- Activation key
- 管理者アカウント名
- 管理者アカウントの SSH 公開鍵
- 管理者用サブスクリプションに対して読み取り権限のあるサービスプリンシパル
- 利用者サブスクリプションに対して書き込み権限のあるサービスプリンシパル
- Grafana のダッシュボードのパスワード

{{< figure src="./../../images/2019-02-24-005.png" title="テンプレートの Input " >}}

管理者アカウント名とSSH 公開鍵、Grafana のパスワードはただ決めるだけですね。Activation key と管理者用サービスプリンシパル、利用者用サービスプリンシパルの3つを決めるためには、少しの作業が必要です。

### Activation key

GitHub のリポジトリに Issue を立てると、メールでアクティベーションキーが送られてくる仕組みです。

参考：[Azure/azurestack-uptime-monitor/issues](https://github.com/Azure/azurestack-uptime-monitor/issues?q=is%3Aissue+is%3Aclosed)

なお、すべてのコードが GitHub に公開されているため、アクティベートの仕組みを解読すればアクティベーションキーを自作できます。私が試した時点では ASDK に対してアクティベーションキーを発行してくれるかが不明瞭だったので、リポジトリを fork して自作したアクティベーションキーで動くようにしました。現在はコードに　ASDK　用の分岐処理が入っているので、ASDK で動かしたい旨を Issue に書けばアクティベーションキーを発行してくれると思います。

参考：[ASDK 用の分岐処理が入ったコミット](https://github.com/Azure/azurestack-uptime-monitor/commit/d3e0d81bfae8134af890a2431b95ab2ebc8d2006)

## サービスプリンシパル

テンプレートに渡せるサービスプリンシパルが1つなので、１つのサービスプリンシパルで管理者向けサブスクリプションに対する読み取りと利用者向けサブスクリプションの読み書きを実現する必要があります。Azure Stack の管理者用 Azure Active Directory にサービスプリンシパルを作成した上で、管理者向けサブスクリプションと利用者向けサブスクリプションに権限を付与しましょう。

{{< figure src="./../../images/2019-02-24-001.png" title="管理者と利用者の両方に サービスプリンシパル を追加した図" >}}

もし、管理者用 Azure Active Directory のユーザで利用できる利用者向けサブスクリプションが存在しない場合は、はじめに管理者ポータル上で User Subscription を用意する必要があります。

## ログイン

テンプレート の出力に、Grafana の URL が含まれていますので、ブラウザでアクセスします。ID と パスワードはテンプレートで指定したものです。

{{< figure src="./../../images/2019-02-24-002.png" title="テンプレートの出力" >}}

ログインして "Azure Stack availability" というダッシュボードを選択すると、かっこいいグラフが表示されます。

{{< figure src="./../../images/2019-02-24-004.png" title="ダッシュボード" >}}

## おわりに

Azure CAT がリリースした Azure Stack Uptime Monitor を試しました。クラウドを提供するうえで、ポータルと API のエンドポイントが生きているかどうかは重要です。計測する仕組みを自前で作るのは大変なので、CAT チームがソリューションをリリースしてくれたことに感謝です。

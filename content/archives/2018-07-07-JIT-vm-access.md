---
title: Just in time VM accessでVirtual Machineにアクセスする
author: kongou_ae
date: 2018-07-07
url: /archives/2018-07-07-JIT-vm-access
categories:
  - azure
---

前々から気になっていたAzure Security CenterのJust in time VM accessを試しました。

## Security CenterのPlanをStandardにする

Just in time VM accessはSecurity Centerの機能です。利用するためには、SecurityCenterをStandardに変更する必要があります。Standardの費用はVM1台当たり$15です。

{{<img src="./../../images/2018-0707-001.png">}}

## Just in time VM accessを有効にする

Security CenterをStandardにするとJust in time VM accessの中にSecurity Centerに登録されたVMが表示されます。 Just in time VM accessを有効にたいVMをクリックして設定画面に移動します。

{{<img src="./../../images/2018-0707-002.png">}}

Just in time VM accessによって許可したい通信を設定します。時間限定で許可したい通信となると、RDPやSSHといったリモートアクセスやFTPやCIFSといったファイル転送あたりがユースケースになりそうです。

{{<img src="./../../images/2018-0707-003.png">}}

Just in time VM accessを有効にすると、対象のVirtual MachineのNetwork Security Groupに、Just in time VM accessで許可したいサービスが送信元:ANYのAction:Denyで登録されます。今回は自宅のグローバルIPアドレスからのRDPと100.100.100.0/24からのSSHを有効にしました。

{{<img src="./../../images/2018-0707-004.png">}}

## 動作確認

ではJust in time VM accessでアクセスしてみましょう。Security CenterのJust in time VM accessの画面で、アクセスしたいVirtual Machineを選択してRequest Accessをクリックします。

{{<img src="./../../images/2018-0707-005.png">}}

リクエストしたい通信のTOGGLEをONにします。ALLOWED SOURCE IPとIP RANGEに入力する値は、Just in time VM accessに設定されているIP RANGEに含まれていなければなりません。TIME RANGEに入力できる値は、Just in time VM accessに設定されている最大時間以下になります。

{{<img src="./../../images/2018-0707-006.png">}}

設定されているIP RANGEに含まれていないアドレスでリクエストをあげると、エラーになります。今回の場合、TCP22の設定では100.100.100.0/24の送信元IPアドレスが許可されています。にもかかわらず、100.100.100.0/24ではないMY IPを選択してアクセスをリクエストしたのでエラーになりました。

{{<img src="./../../images/2018-0707-007.png">}}

今回はTCP22のTOGGLEをOFFにすることでリクエストが設定に含まれるようにします。設定に含まれるリクエストをあげると、リクエストが受け付けられて、対象のVirtual MachineのNetwork Security GroupにJust in time VM accessで設定した通信が追加されます。あとは実際に通信するだけです。

{{<img src="./../../images/2018-0707-008.png">}}

## 感想

「標的型攻撃で踏み台にされてサーバに不正アクセスされた」というケースを考えると、Network Security Groupで運用管理系の通信が送信元IPアドレス限定で常時許可されている状態はリスクがあります。Just in time VM accessを使うと、限られた時間だけ運用管理系の通信を許可するということを簡単に実現できます。Network Security Groupを都度手で変更する手間を考えると、1VMあたり$15払った方がお得な気がします。

Just in time VM accessをリクエストできるだけの権限があると便利だなと思いました。VMにアクセスしたい人がセルフサービスでJust in time VM accessをリクエストできるべき。別途調べます。

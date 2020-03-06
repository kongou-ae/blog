---
title: Lighthouse を利用して 別テナントの Shared Image Gallary を利用する
author: kongou_ae
date: 2020-03-06
url: /archives/2020/03/use-shared-image-gallary-on-another-tenant-by-using-lighthouse
categories:
  - azure
---

## はじめに

Shared Image Gallary は別テナントにイメージを共有する機能を持っています。ですが、公式ドキュメントに記載されている共有の方法が気軽ではありません。Azure AD にアプリを登録して権限を付与したうえで PowerShell を使って Virtual Machine を作る手順は難易度が高すぎます。

参考：[Azure テナント間でギャラリー VM イメージを共有する](https://docs.microsoft.com/ja-jp/azure/virtual-machines/windows/share-images-across-tenants)

やはり、別テナントが用意した Shared Image Gallary を使って、ポータルで仮想マシンを作りたい。この要望を Lighthouse で実現します。

## 事前の状態

本エントリのシナリオは、「テナント B に所属するユーザが、テナント A に配置されている Shared Image Gallary を使って、テナント B に紐付くサブスクリプションに Virtual Machine を立てる」です。

テナント A にテナント B のユーザをゲストとして招待すると、このゲストユーザはテナント A の Shared Image Gallary を使ってテナント A に紐付くサブスクリプションに対して Virtual Machine を建てられます。いたって普通の話です。

しかし、ゲスト招待方式では、テナント B に接続している状態の Azure ポータルにはテナント A の Shared Image Gallary が表示されません。当然、Virtual Machine の作成時にもテナント A の Shared Image Gallary は表示されません。

{{< figure src="/images/2020/2020-0306-001.png" title="Lighthouse で権限を委任する前の状態" >}}

## 対応の方針

裏を返すと、テナント B に接続している状態の Azure ポータルにテナント A の Shared Image Gallary が表示されれば、テナント B で Virtual Machine を作成する際にテナント A の Shared Image Gallary を使えるということです。この要件を Lighthouse で実装します。

## 実装

テナント A 側に Shared Image Gallary だけを配置したリソースグループを用意します。そして、Lighthouse を利用して、このリソースグループに対する読み取り権限をテナント B の利用者に委任します。このリソースグループには Shared Image Gallary に関するものだけを配置します。ほかのリソースを配置してしまうと、権限を委任したテナント B の利用者に閲覧されてしまうからです。

公式ドキュメントにリソースグループに限定して権限を委任する場合の ARM テンプレートが公開されています。パラメータファイルを実態にあわせて修正した上でこのテンプレートを使って Lighthouse を設定しましょう。

[Azure Resource Manager テンプレートの作成](https://docs.microsoft.com/ja-jp/azure/lighthouse/how-to/onboard-customer#create-an-azure-resource-manager-template)

{{< figure src="/images/2020/2020-0306-002.png" title="リソースグループに限定して権限を委任" >}}

Lighthouse のパラメータを検討する際の注意点が principalId です。principalId には権限を委任する先の ID を入れます。もし principalId にユーザの ID を指定してしまうと、テナント B 側で Shared Image Gallary を使いたい人が増えるたびに、テナント A 側で Lighthouse の設定を追加しなければなりません。面倒です。principalId には テナント B 側の Azure AD のグループの ID を指定したうえで、テナント B 側でグループにユーザを追加・削除してもらう方式が望ましいです。

## 動作

テナント B に接続した状態でポータルのサブスクリプションフィルタを修正して、テナント A のサブスクリプションとテナント B のサブスクリプションが表示されるようにします。

{{< figure src="/images/2020/2020-0306-003.png" title="サブスクリプションフィルタの状態" >}}

テナント B に紐づくサブスクリプションに対して Virtual Machine を作る際にイメージを選択すると、テナント A から権限を委任された Shared Image Gallary が選択できるようになります。

{{< figure src="/images/2020/2020-0306-004.png" title="Virtual Machine 作成画面の表示その1" >}}

{{< figure src="/images/2020/2020-0306-005.png" title="Virtual Machine 作成画面の表示その2" >}}

## 振り返り

Lighthouse を利用して 異なるテナントのユーザに Shared Image Gallary を共有する方法をまとめました。Shared Image Gallary は Service Provider と Customer という関係性でなくても利用できる便利なサービスです。「ゲスト招待せずに権限を委任したい」というシナリオで積極的に活用しましょう。

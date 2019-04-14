---
title: Azure Stack 上の Virtual Machine を Azure の運用管理サービスに接続する
author: kongou_ae
date: 2019-04-14
url: /archives/2019/04/operate-azure-stack-vm-by-azure-ops-service
categories:
  - azurestack
  - azure
---

## はじめに

Azure Stack 上の Virtual Machine を Azure の運用管理サービスで運用管理してみます。対象の運用管理サービスは次の通りです。

* Log Analytics
* Azure Monitor
* Azure Monitor for VMs
* Update Management
* Securiry Center

2019年4月現在の Azure Stack にはこれらの運用管理サービスが存在しません。正確に言うと Azure Monitor は存在します。ただし、サポートするメトリクスが少ない、アラート機能がないなど、その機能は Azure の Azure Monitor に遠く及びません。Azure が提供する運用管理サービスを利用するならば、Azure 一択です。

したがって、本エントリーは Azure Stack 固有の話よりも Azure の運用管理サービスの話が多めです。あらかじめご了承ください。また、これらの運用管理サービスはハイブリッドをうたっています。そのため、Azure Stack 以外の環境に存在する仮想マシン・物理マシンであっても利用可能です。

## Azure 側の用意

まずはじめに、運用管理に利用する Azure のサービスを用意します。プレビュー中の Azure Monitor for VMs が利用できるリージョンを利用すると良いでしょう。必要な作業は次の通りです。

1.　Log Analytics Workspace を作る
2.　Log Analytics Workspace でパフォーマンスカウンタの収集を有効にする
2.　Automation Account を作る
3.　Log Analytics と Automation Account をリンクする
4.　Update Management を有効化する

## 拡張機能のダウンロード

Azure Stack 上の Virtual Machine を Azure の運用管理サービスに接続するためには、Azure Stack 上の Marketplace で公開されている次の拡張機能が必要です。管理者側でマーケットプレイスにダウンロードします。

- Azure Monitor, Update and Configuration Management
- Azure Monitor Dependency Agent

{{< figure src="/images/2019-04-12-001.png" title="必要な拡張機能" >}}

## 拡張機能のインストール

Azure で運用管理したい Virtual Machine に次の拡張機能をインストールします。

- Azure Monitor, Update and Configuration Management
- Azure Monitor Dependency Agent

`Azure Monitor, Update and Configuration Management` をインストールする際に Workspace の ID と Key の入力を求められますので、最初に作成した Log Analytics Workspace の情報を入力します。

{{< figure src="/images/2019-04-12-002.png" title="設定画面" >}}

拡張機能のインストールが成功すると、Virtual Machine に Monitoring agent がインストールされます。OS にログインしなくても、エージェントのインストールと Log Analytics Workspace への接続が完了します。

{{< figure src="/images/2019-04-12-003.png" title="設定画面" >}}

## Log Analytics 

しばらく待つと、Log Analytics で Azure Stack 上の Virtual Machine が送信したパフォーマンスカウンタを確認できます。Kusto を駆使することで、メトリクスを検索・可視化できます

{{< figure src="/images/2019-04-12-004.png" title="CPU 使用率のグラフ" >}}

## Azure Monitor

また、Azure Monitor を利用すると、Log Analytics に対するログの検索結果をもとにアラートを設定できます。アラートを利用すれば、Azure Stack 上の Virtual Machine のメトリクスが閾値を超えたら管理者にメールを送るといったことが可能です。

## Azure Monitor for VMs

メトリクスを可視化するために Kusto を考えるのは少々大変です。もう少し気軽にメトリクスを可視化したい場合は、Azure Monitor for VMs を利用するとよいです。標準の機能で CPU 使用率とメモリ使用量、Disk 使用率、トラフィック量を可視化できます。

{{< figure src="/images/2019-04-12-005.png" title="Azure Monitor for VMs その1" >}}

{{< figure src="/images/2019-04-12-006.png" title="Azure Monitor for VMs その2" >}}

## Update Management

Update Management が有効化された Automation Account と Log Analytics が接続しているので、Log Analytics に接続した時点で Azure Stack 上の Virtual Machine は Update Management に認識されます。あとは、Automation Account で Azure Stack 上の Virtual Machine を 管理対象に追加すればよいです。

{{< figure src="/images/2019-04-12-007.png" title="Update Management に認識された VM" >}}

{{< figure src="/images/2019-04-12-008.png" title="管理対象になった VM" >}}

管理対象にしてしまえば、後続の操作は Azure の Virtual Machine と同じです。Deployment schedules を設定して、自動更新を有効にしましょう。

{{< figure src="/images/2019-04-12-009.png" title="Update Management に認識された VM" >}}

## Securiry Center

Log Analytics に接続した Virtual Machine は自動的に Security Group の対象になります。Secutiry Center は Azure ではないマシンを紫色のアイコンで表示します。しかし、Azure と一貫性のある Azure Stack 上の Virtual Machine は Azure の Virtual Machine と同じアイコンで表示されます。ちょっとした心遣いですね。

{{< figure src="/images/2019-04-12-010.png" title="Security Center 上の表示" >}}

今回の Virtual Machine は、"Remediate vulnerabilities in security configuration on your machines" という推奨事項に該当しました。これは、Microsoft の推奨する OS のセキュリティ設定との差異をチェックしてくれるものです。

## まとめ

Azure Stack 上の Virtual Machine を Azure の運用管理してみました。Azure Stack の利用者は、拡張機能を利用することで Virtual Machine を Azure 上の運用管理サービスに簡単に接続できます。これらの運用管理サービスを利用して、Azure と Azure Stack というハイブリッドクラウドに存在する Virtual Machine を一貫性のある仕組みで運用管理しましょう。


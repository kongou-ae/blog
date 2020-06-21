---
title: Azure Arc enabled servers が Azure の運用管理サービスとの連携を強化した
author: kongou_ae
date: 2020-06-22
url: /archives/2020/06/update-of-azure-arc-enabled-servers-about-management-service-of-azure
categories:
  - azure
---

6/17 に Azure Arc のドキュメントが更新されました。この時に追加されたドキュメントが [Virtual machine extension management with Azure Arc for servers (preview)](https://github.com/MicrosoftDocs/azure-docs/blob/master/articles/azure-arc/servers/manage-vm-extensions.md) です。ドキュメントによると、Azure ポータルから Arc の管理下にあるサーバに対して拡張機能が入れられるようです。早速試してみました。

## ポータルのアップデート

拡張機能の追加に合わせて、Azure ポータルの Azure Arc enabled servers の画面に次のサービスが増えました。もともとは Policy と Log だけでしたので、運用管理サービスが大幅に増えました。地味な機能改善のように見えますが「ハイブリッドクラウドな環境を運用する際の一貫性」という観点でとても大事なアップデートです。

- Extensions
- Update Management
- Inventory
- Change tracking
- Insight

{{< figure src="/images/2020/2020-0619-007.png" title="Arc enabled servers の画面" >}}

これまで、Azure Virtual Machine と Azure Arc enabled servers では Azure の運用管理サービスを利用する場合の操作性が異なっていました。Azure Virtual Machine の場合、Azure の運用管理サービスの情報を見る方法が2つあります。1つ目は運用管理サービスの画面から管理対象になっている複数の Virtual Machine の情報を網羅的に見る方法です。2つ目は個々の Virtual Machine の画面からその Virtual Machine の情報だけを見る方法です。一方の Azure Arc enabled servers は、個々のサーバの画面からそのサーバの情報だけを見ることができませんでした。

今回のアップデートでこの差分が埋まりました。下図のとおり、Azure の運用管理サービスの情報を Azure Virtual Machine と Azure Arc enabled servers で同じように閲覧できるようになりました。操作の一貫性はとても大事。

{{< figure src="/images/2020/2020-0619-008.jpg" title="今回のアップデートで改善された箇所" >}}

## 拡張機能のインストールをサポート

Azure Arc enabled servers に拡張機能をインストールできるようになりました。現時点でサポートされている拡張機能は次の4つです。

- CustomScriptExtension
- DSC
- Microsoft Monitoring agent
- Microsoft Dependency agent

試しに拡張機能で Microsoft Monitoring Agent をインストールしてみました。インストール時の操作性は Azure Virtual Machine と同じです。

{{< figure src="/images/2020/2020-0619-002.png" title="拡張機能のインストール画面その１" >}}

{{< figure src="/images/2020/2020-0619-003.png" title="拡張機能のインストール画面その２" >}}

拡張機能のデプロイが完了すると、拡張機能をインストールしたマシンに Microsoft Monitoring agent がインストールされました。インストール直後から Log Analytics の Workspace と接続済みです。とても楽。

{{< figure src="/images/2020/2020-0619-004.png" title="Microsoft Monitoring Agent の設定画面" >}}

また、ポータルから Azure Monitor for VMs を有効にすると、マシンに Microsoft Dependency agent がインストールされました。少し待てば Insight の画面に対象のマシンのメトリクスが表示されます。とても楽。

{{< figure src="/images/2020/2020-0619-005.png" title="for VMs の設定画面その１" >}}

つまり、マシンに Azure Connected Machine Agent さえインストールすれば、Azure の運用管理サービスの前提となるエージェントをマシンにログインせずにインストールできるようになったということです。便利

## まとめ
Azure Arc enabled servers のアップデートをまとめました。今回のアップデートは Azure Arc enabled servers と Azure Virtual Machine 間の一貫性を強化しました。ポータルに表示されているサービスが Policy と Log だけだったころの Azure Arc enabled servers と比べるとかなり進化したと思います。次は Managed Identity のサポートや Azure Virtual Machine と Azure Arc enabled servers を一覧で見られるポータルの実装あたりでしょうか。今後の進化が楽しみです。

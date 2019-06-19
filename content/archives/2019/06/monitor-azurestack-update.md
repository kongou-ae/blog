---
title: Azure Stack のアップデートを監視する
author: kongou_ae
date: 2019-06-19
url: /archives/2019/06/monitor-azurestack-update
categories:
  - azurestack
---

## サマリ

- Azure Stack にはアップデートの成功を通知する機能がない
- Azure Stack のアップデート結果を確認する方法は API と PEP の2つである
- 「便りがないのはいい便り」方式で放置するのではなく、Azure Stack のアップデートが成功したことを明示的に知りたければ、API または PEP を利用したスクリプトを自作する必要がある

## 環境

- ハイブリッドクラウド研究会の Azure Stack Integrated systems 1903
- ASDK 1905 @[物理コンテナ](https://thinkit.co.jp/article/13243)

[ハイブリッドクラウド研究会のページ](http://www.hccjp.org/poc/)からハイブリッドクラウド研究会が保有している Azure Stack Integrated system での検証を申し込めます。Azure Stack Integrated system を触ってみたい方はぜひ申請しましょう。ハイブリッドクラウド研究会の検証環境は、利用者だけでなく管理者の参照権限も付与してもらえる太っ腹環境です。

## 本文

### アラートの有無

アップデートの成功がアラートとして表示されれば、その成功を監視サーバで検知・通知できます。しかし、Azure Stack のアラートテンプレートに定義されている Update Resource Provider のアラートは失敗と注意だけであり、成功はありません。

```Powershell
    "UrpAlertTemplates": [
        {
            "Title": "Update failed.",
            "Severity": "Critical",
            "Description": "The most recent update failed. Microsoft recommends opening a service request as soon as possible. As part of the update process, Test-AzureStack is performed, and based on the output we generate the most appropriate alert. In this case, Test-AzureStack also failed.",
            "Remediations": "Click the \"Download full logs\" button from the Update run details blade to review details on the update issue. For more information, visit \u003clink type=\u0027Url\u0027 uri=\u0027http://aka.ms/azurestackupdate\u0027\u003ehttp://aka.ms/azurestackupdate\u003c/link\u003e"
        },
        {
            "Title": "Update needs attention.",
            "Severity": "Warning",
            "Description": "The most recent update needs attention. Microsoft recommends opening a service request during normal business hours. As part of the update process, Test-AzureStack is performed, and based on the output we generate the most appropriate alert. In this case, Test-AzureStack passed.",
            "Remediations": "Click the \"Download full logs\" button from the Update run details blade to review details on the update issue. For more information, visit \u003clink type=\u0027Url\u0027 uri=\u0027http://aka.ms/azurestackupdate\u0027\u003ehttp://aka.ms/azurestackupdate\u003c/link\u003e"
        }
    ],
```

### API での情報取得

Get-AzsUpdate を利用すると、アップデートの一覧を取得できます。

```
PS C:\> Get-AzsUpdate | ft  Name, State, InstalledDate

Name                             State     InstalledDate      
----                             -----     -------------      
iijhuawei/Microsoft1.1805.7.57   Installed 2018/08/19 15:38:07
iijhuawei/Microsoft1.1807.0.76   Installed 2018/08/24 5:43:07 
iijhuawei/Microsoft1.1807.3.82   Installed 2018/12/12 11:23:55
iijhuawei/Microsoft1.1808.0.97   Installed 2018/12/13 11:55:54
iijhuawei/Microsoft1.1808.9.117  Installed 2018/12/13 16:01:53
iijhuawei/Microsoft1.1809.0.90   Installed 2018/12/15 0:24:24 
iijhuawei/Microsoft1.1809.12.114 Installed 2018/12/15 10:46:56
iijhuawei/Microsoft1.1811.0.101  Installed 2019/03/20 5:19:59 
iijhuawei/Microsoft1.1901.0.99   Installed 2019/03/23 16:34:51
iijhuawei/Microsoft1.1901.5.109  Installed 2019/05/20 7:05:40 
iijhuawei/Microsoft1.1902.0.69   Installed 2019/05/23 9:52:11 
iijhuawei/Microsoft1.1902.3.75   Installed 2019/05/23 11:41:47
iijhuawei/Microsoft1.1903.0.35   Installed 2019/05/24 1:38:49 
iijhuawei/Microsoft1.1903.2.39   Installed 2019/05/24 11:25:16
iijhuawei/Microsoft1.1904.0.36   Ready                       
```

Get-AzsUpdate で取得した Name を利用して Get-AzsUpdateRun を実行すると、実際に走っているアップデートの状況を確認できます。このコマンドをループさせて結果の中の State をチェックし続けて State が Suceeded になったらメールやチャットに通知するスクリプトを自作すれば、アップデートが成功したことを通知できます。

```
PS C:\> Get-AzsUpdateRun -UpdateName iijhuawei/Microsoft1.1903.2.39 

Progress    : Hotfix - Success
TimeStarted : 2019/05/24 9:13:11
Duration    : PT2H12M5.4579456S
State       : Succeeded
Id          : /subscriptions/e8731a63-17bd-4e2a-be23-a20ac017c2eb/resourceGroups/System.iijhuawei/providers/Microsoft.Update.Admin/updateLocations/iijhuawei/upda
              tes/Microsoft1.1903.2.39/updateRuns/d2f2a769-d9f7-42e9-9f43-f4c15d0d71fa
Name        : iijhuawei/Microsoft1.1903.2.39/d2f2a769-d9f7-42e9-9f43-f4c15d0d71fa
Type        : Microsoft.Update.Admin/updateLocations/updates/updateRuns
Location    : iijhuawei
Tags        : {}
```

### PEP での情報取得

管理者向けの API が動作している Infrastructure role instance は冗長化されています。そのため、アップデート中も継続的に API にアクセスできます。ただし、アップデートが壮大に失敗して冗長化された Infrastructure role instance が停止した場合、API 経由でアップデートの状態を取得できません。API が死ぬと API 経由でアラートも取得できなくなるので、成功したのか失敗したのかわからなくなります。

次のような代替案によって何かが起きたことには気が付けます。ただし、アップデートの状態を明確に示すものではありません。

- API を利用する監視スクリプトに「複数回連続して API 経由で情報が取れなかったら異常とみなす」という処理を入れる
- 監視サーバに「Azure Stack から情報をとれなかったらアラートを出す」という処理を入れる

そんなときの最後の手段が PEP です。PEP 上の Get-AzureStackUpdateStatus をいうコマンドを利用すると、PEP 経由でアップデートの状態を取得できます。次の参考 URL に記載されているとおり $statusString.Value をチェックする処理をループするスクリプトを自作すれば、API に依存しない形でアップデートの状態を監視できます。

参考：[Monitor updates in Azure Stack using the privileged endpoint](https://docs.microsoft.com/ja-jp/azure-stack/operator/azure-stack-monitor-update)

なお、API とは異なり、PEP をホストする Infrastructure role instances である ERCS は Full なアップデート中に停止します。接続できる ERCS をチェックしてから PEP に接続するという処理を入れましょう。

---
title: OMS AgentをPowershellでインストールする
author: kongou_ae

date: 2017-10-09
url: /archives/2017-10-09-install-OMS-agent-by-powershell
categories:
  - Azure

---

## はじめに

Azure Security Centerのハイブリッド対応によって、今後Azure以外のサーバにOMS エージェントをインストールする機会が増えるかなと思いました。GUIによるインストールは作業がスケールしないので、Powershellでのインストール方法を調べました。いつかの自分のために手順をメモしておきます。

なお、Azure環境であれば、もっとも簡単にOMSエージェントをインストールする方法はVM拡張機能です。参考：[Log Analytics エージェントで Log Analytics に Azure 仮想マシンを接続する](https://docs.microsoft.com/ja-jp/azure/log-analytics/log-analytics-azure-vm-extension)

## 手順

OMSエージェントをダウンロードしたうえで、サイレントインストールします。

```
Invoke-WebRequest -Uri https://go.microsoft.com/fwlink/?LinkId=828603 -OutFile MMASetup-AMD64.exe
$WorkspaceID="YOUR-WORKSPACE-ID"
$WorkSpaceKey="YOUR-WORKSPACE-KEY"
MMASetup-AMD64.exe /Q:A /R:N /C:"setup.exe /qn ADD_OPINSIGHTS_WORKSPACE=1 OPINSIGHTS_WORKSPACE_ID=$WorkspaceID OPINSIGHTS_WORKSPACE_KEY=$WorkSpaceKey AcceptEndUserLicenseAgreement=1"
```

## 動作確認

インストールに成功すると、次のレジストリキーができます。「Connection Status」が0であればOMSエージェントはOMS ワークスペースと接続できています。OMSポータルでログが確認できるようになるまで待ちましょう。

```
PS C:\Users\YOUR-NAME\Documents> Get-ChildItem -Path "Registry::HKLM\SYSTEM\CurrentControlSet\Services\HealthServic
e\Parameters\Service Connector Services\"


    Hive: HKLM\SYSTEM\CurrentControlSet\Services\HealthService\Parameters\Service Connector Services


Name                           Property
----                           --------
Log Analytics - YOUR-WORKSPACE AccountSharedKey                      : {1, 0, 0, 0...}
-ID                            Topology Request Url                  :
                               https://YOUR-WORKSPACE-ID.oms.opinsights.azure.com/AgentServ
                                                                       ice.svc/AgentTopologyRequest
                               Azure Cloud Type                      : 0
                               Authentication Mode                   : 3
                               Is Cloud Workspace                    : 1
                               Authentication Certificate Thumbprint : fe8fc4a06b4cbe51c11b3178c83f040fea115092
                               Connection Status                     : 0
```


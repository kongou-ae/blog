---
title: Azure Arc enabled servers を利用して Azure PowerShell の認証を突破する
author: kongou_ae
date: 2020-11-18
url: /archives/2020/11/azure-powershell-with-azure-arc
categories:
  - azure
---

## はじめに

Azure Arc enabled servers を有効にすると、対象のマシン上で Azure Hybrid Instance Metadata Service が起動します。このサービスを利用することで、Azure 上の VM と同じようにメタデータや認証用のトークンを取得できます。

参考：

- [Connected Machine エージェントの技術概要](https://docs.microsoft.com/ja-jp/azure/azure-arc/servers/agent-overview#connected-machine-agent-technical-overview?WT.mc_id=AZ-MVP-5003408)
- [get-kvsecrets-from-arc-servers.ps1](https://github.com/Azure/azure-docs-powershell-samples/blob/master/azure-arc-for-servers/get-kvsecrets-from-arc-servers.ps1)
- [Using an Azure Arc Token to access Azure KeyVault](https://bcthomas.com/2020/10/using-an-azure-arc-token-to-access-azure-keyvault/)

トークンさえあれば API を直接叩きたい放題なわけですが、スクリプトを使って気軽に処理を自動化することを考えると Azure PowerShell を使えた方が便利です。というわけでこのエントリーでは、Azure Arc enabled servers の Azure Hybrid Instance Metadata Service を利用して Azure PowerShell の認証を突破する方法をまとめます。

## Azure PowerShell の認証方法

トークンを利用して Azure PowerShell の認証を突破するために必要なものは、アクセストークンとアカウント ID が必要です。ただし、検証した限りだとアカウント ID はなんでもいいようなので、何かしらの GUID を利用することにします。

```powershell
Connect-AzAccount -AccessToken $token -AccountId $AccountId
```

## トークンの取得方法

上記の参考ページに記載されている通り Azure Hybrid Instance Metadata Service のエンドポントである http://localhost:40342/metadata/identity/oauth2/token からトークンを取得します。今回は Get-AzArcToken という関数を作りました。

```powershell
function Get-AzArcToken {
    try {
        Invoke-WebRequest -UseBasicParsing -Uri "http://localhost:40342/metadata/identity/oauth2/token?api-version=2019-11-01&resource=https%3A%2F%2Fmanagement.azure.com%2F" -Headers @{ Metadata = "true" } -Verbose:0
    }
    catch {
        $response = $_.Exception.Response
    }

    $tokenpath = $response.Headers["WWW-Authenticate"].TrimStart("Basic realm=")
    $token = Get-Content $tokenpath

    $ArcToken = Invoke-RestMethod -UseBasicParsing -Uri "http://localhost:40342/metadata/identity/oauth2/token?api-version=2019-11-01&resource=https%3A%2F%2Fmanagement.azure.com%2F" -Headers @{ Metadata = "true"; Authorization = "Basic $token" } 
    return $ArcToken.access_token
}
```

スクリプトを実行した後には C:\ProgramData\AzureConnectedMachineAgent\Tokens 配下にベーシック認証用のトークンが記載されたファイルが格納されます。このフォルダのアクセス権は次の通りです。一般ユーザではログインできなさそうになってます。良い。

{{< figure src="/images/2020/2020-1118-001.png" title="Token 置き場の権限" >}}

## 何かしらの GUID の取得方法

[Guid]::NewGuid() で GUID を生成するのは面白くないので、今回は Azure Hybrid Instance Metadata Service から VM の GUID を取得します。今回は Get-AzHybridVMId という関数を作りました。

```
function Get-AzHybridVMId {
    $medatada = Invoke-WebRequest -Uri http://localhost:40342/metadata/instance?api-version=2019-11-01 -Headers @{Metadata="True"}
    $medatada = $medatada.content | ConvertFrom-Json
    return $medatada.compute.vmId
}
```

## サブスクリプションに対する権限の付与

サーバを Azure Arc enabled servers に登録すると、ホスト名と同じ名前のサービスプリンシパルが自動で生成されます。自動化するために必要な Azure サブスクリプションへの権限をこのサービスプリンシパルに対して付与します。

## Azure PowerShell の認証

用意した2つの関数を利用して必要な情報を取得します。そして Connect-AzAccount を実行します。無事にログインできました。

```powershell
$token = Get-AzArcToken
$vmId = Get-AzHybridVMId

Connect-AzAccount -AccessToken $token -AccountId $vmId

Account                              SubscriptionName TenantId                             Environment
-------                              ---------------- --------                             -----------
216373db-9c58-xxxx-xxxx-xxxxxxxxxxxx Microsoft Azure  40cfd58b-8c43-xxxx-xxxx-xxxxxxxxxxxx AzureCloud 
```

何かしらの操作を実行すると、Activity log 上にサービスプリンシパルからの操作という形でイベントが記録されます。Azure PowerShell 経由で Azure 上の VM を停止した際に記録されたログは次の通りです。

{{< figure src="/images/2020/2020-1118-002.png" title="Activity log に記録された名前" >}}


## まとめ

Azure Arc enabled servers の Azure Hybrid Instance Metadata Service を利用して PowerShell に接続してみました。テナント ID や アプリケーション ID、シークレットを何かしらの方法でサーバに保存しなければならないサービスプリンシパルと比べると、エージェント経由でトークンを取得できる Azure Arc enabled servers の方が便利な気がします。何よりも Azure 上の VM ではお馴染みの Managed Identity をオンプレミスや他のクラウド上のサーバでも利用できるのが素敵です。

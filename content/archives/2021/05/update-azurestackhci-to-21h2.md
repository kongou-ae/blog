---
title: Azure Stack HCI のプレビューチャンネルに参加する
author: kongou_ae
date: 2021-05-29
url: /archives/2021/05/update-azurestackhci-to-21h2
categories:
  - azurestack
  - azurestackhci
---

Build 2021 にて、Azure Stack HCI のクラスタを Azure Monitor で監視する機能がプレビューになりました。

- [What’s new for Azure Stack HCI at Build 2021](https://techcommunity.microsoft.com/t5/azure-stack-blog/what-s-new-for-azure-stack-hci-at-build-2021/ba-p/2384218)
- [Monitor Azure Stack HCI clusters from Azure portal](https://docs.microsoft.com/en-us/azure-stack/hci/manage/monitor-azure-portal)
- [Azure Stack HCI Insights (preview)](https://docs.microsoft.com/en-us/azure-stack/hci/manage/azure-stack-hci-insights)

とても良さそうに見えるこの機能を試すためには、プレビューチャンネルに参加する必要があります。早速参加したので手順をまとめます。

[Join the Azure Stack HCI preview channel](https://docs.microsoft.com/en-us/azure-stack/hci/manage/preview-channel)

# 最新の Windows Update を適用する

まずは Windows Admin Center を利用して、20H2 に対して最新の Windows Update を適用します。

{{< figure src="/images/2021/2021-0430-001.png" title="WAC でパッチ適用その1" >}}

{{< figure src="/images/2021/2021-0529-002.png" title="WAC でパッチ適用その2" >}}

# KB5003237 を適用する

プレビューチャンネルに参加するためには KB5003237 を適用する必要があります。私の環境では Windows Admin Center に KB5003237 が表示されなかったので、ノード上で KB5003237 を検索、適用しました。

{{< figure src="/images/2021/2021-0430-003.png" title="Azure Stack HCI OS のメニュー画面" >}}

{{< figure src="/images/2021/2021-0529-004.png" title="CLI でのパッチ適用" >}}

# プレビューチャンネルへの参加

KB5003237 を適用するとプレビューチャンネルの Get Started が押せるようになります。Get Started を押して言われるがままにプレビューチャンネルに参加します。

{{< figure src="/images/2021/2021-0430-005.png" title="プレビューチャンネルへの参加その1" >}}

{{< figure src="/images/2021/2021-0529-006.png" title="プレビューチャンネルへの参加その2" >}}

{{< figure src="/images/2021/2021-0529-007.png" title="プレビューチャンネルへの参加その3" >}}

# 21H2 の適用

プレビューチャンネルに参加した状態だと、21H2 が Windows Update の対象に出てきます。20H2 に最新の Windows Update を適用したのと同じ要領で 21H2 を適用します。

{{< figure src="/images/2021/2021-0529-008.png" title="プレビューチャンネルへの参加その8" >}}

これでクラスタが 21H2 になりました。Windows Admin Center を使うことで、すごく簡単に HCI クラスタに Windows Update を適用できました。これはいいものだ。

# その後

HCI クラスタを Azure Monitor で監視するために Azure Stack HCI クラスタを Azure Arc に登録しようとするとエラーになりました。この機能はまだ Azure 側に展開されていないのかもしれません。

```
> Register-AzStackHCI -EnableAzureArcServer:$true -SubscriptionId 9c171efd-xxxx-xxxx-xxxx-xxxxxxxxxxxx -Region eastus
WARNING: To sign in, use a web browser to open the page https://microsoft.com/devicelogin and enter the code HL5PCHR2N
to authenticate.
Register-AzStackHCI : NoRegisteredProviderFound : No registered resource provider found for location 'eastus' and API
version '2021-01-01-preview' for type 'clusters'. The supported api-versions are '2020-03-01-preview, 2020-10-01'. The
supported locations are 'eastus, westeurope, southeastasia'.
CorrelationId: 02440a25-9aab-4b1b-875a-66118722899f
At line:1 char:1
+ Register-AzStackHCI -EnableAzureArcServer:$true -SubscriptionId 9c171 ...
+ ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
+ CategoryInfo : OperationStopped: (:) [Write-Error], ErrorResponseMessageException
+ FullyQualifiedErrorId : Microsoft.Azure.Commands.ResourceManager.Cmdlets.Entities.ErrorResponses.ErrorResponseMe
ssageException,Register-AzStackHCI
```

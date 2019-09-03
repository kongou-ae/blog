---
title: How to check the new Azure Stack
author: kongou_ae
date: 2019-09-04
url: /archives/2019/08/how-to-check-new-azurestack
categories:
  - azurestack
---

## Introduction
Azure stack requires users to apply patch and update(P&U) continually. If your Azure Stack is not in the latest three versions, Microsoft doesn’t support your Azure Stack. So it is so important that Azure Stack Operator notice the release of new Azure Stack.

This blog explains how to check the new Azure Stack.

## The type of P&U

Microsoft and OEM vendor release new Azure stack. The new Azure Stack is three types as follows.

1. Monthly update from Microsoft
3. hotfix from Microsoft
2. A regular update from OEM vendor

## How to check monthly update from Microsoft

Unfortunately, there is not the best and the simplest way. You can choose your way in the following options.

1. Check Azure Stack PM’s twitter
2. Check #azurestack
3. Check Azure Stack integrated system(connected only）
4. Check the endpoint to inform the new azure stack

Azure Stack PMs have mentioned the new Azure Stack. Maybe, the best person is [Vijay Tewari
](https://twitter.com/vtango) who is Group Program Manager. He has mentioned new Azure Stack every time.

<blockquote class="twitter-tweet"><p lang="en" dir="ltr"><a href="https://twitter.com/hashtag/azurestack?src=hash&amp;ref_src=twsrc%5Etfw">#azurestack</a> 1908 is out. It updates the operating system that azure stack used to Windows Server 2019, bringing with it improvements across the board. <a href="https://twitter.com/hashtag/laboroflove?src=hash&amp;ref_src=twsrc%5Etfw">#laboroflove</a> <a href="https://t.co/6r0qgJowh0">https://t.co/6r0qgJowh0</a></p>&mdash; Vijay Tewari (@vtango) <a href="https://twitter.com/vtango/status/1167519705290039296?ref_src=twsrc%5Etfw">August 30, 2019</a></blockquote> <script async src="https://platform.twitter.com/widgets.js" charset="utf-8"></script>

But checking only [Vijay Tewari
](https://twitter.com/vtango) is SPOF. you should increase availability to check new Azure stack. [#azurestack](https://twitter.com/search?q=%23azurestack) is the better way. Many Azure Stack PM and MVP mentioned when new Azure Stack was released.

These items are an easy way to check. But 1 and 2 have many noises which the new Azure Stack doesn’t relate with. I believe that [#azurestack](https://twitter.com/search?q=%23azurestack) is so useful for Azure Stack operator, but If you want to know just new Azure Stack, you need to check Azure Stack integrated system or the endpoint.

Azure Stack integrated system which is connected mode downloads new Azure Stack when Microsoft releases new Azure Stack. If you check update information on Azure Stack in Azure Stack portal regularly, you can know the new Azure Stack timely. And Azure Stack has Rest API, so you can make this operation automatically.

If you don’t have Integrated system or can’t use Azure stack to check, you can use the endpoint([https://aka.ms/azurestackautomaticupdate](https://aka.ms/azurestackautomaticupdate)). This endpoint publishes the latest p&u information. If you check the change of this information regularly, you can know new Azure Stack. And this endpoint returns XML. So you can make this operation automatically.

{{< figure src="/images/2019-0904-001.png" title="XML" >}}

## How to check the hotfix from Microsoft

Just like monthly update from Microsoft, you can use the following way to check the new Azure Stack.

2. Check #azurestack
3. Check Azure Stack integrated system(connected only）
4. Checj the endpoint to inform the new Azure Stack

You can also use RSS feed. Microsoft updates this RSS feed when they release a new hotfix.

[https://support.microsoft.com/app/content/api/content/feeds/sap/en-us/32d322a8-acae-202d-e9a9-7371dccf381b/rss](https://support.microsoft.com/app/content/api/content/feeds/sap/en-us/32d322a8-acae-202d-e9a9-7371dccf381b/rss)

## How to check regular update from OEM vendor.

OEM vendor releases their regular update in their support page. So you need to check their support page. The way to check support page depends on OEM vendor. For example, Dell EMC’s support page supports a notification. If you configure a notification setting, Dell EMC sends e-mail to me.

## Final thought

Azure Stack Operator need to update their Azure Stack regularly. It is the first step for keeping the latest version to check the new Azure Stack timely. Choose your best way! 

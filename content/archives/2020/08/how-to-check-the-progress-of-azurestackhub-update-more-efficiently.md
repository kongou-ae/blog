---
title: How to check the progress of Azure Stack Hub Update more efficiently
author: kongou_ae
date: 2020-08-26
url: /archives/2020/08/how-to-check-the-progress-of-azurestackhub-update-more-efficiently
categories:
  - azurestack
---

## Introduction

We can check the recent status of Azure Stack Hub update at the "Update" view. And we can download the detailed progress as a super big JSON file. We can check this JSON file by using VScode because VScode can convert the JSON file more easily-to-read with "Format Document". 

But I believe this operation is not efficient because human is not good at reading a JSON file. Based on my guess, this entry explains how to check the detailed progress of Azure Stack Hub Update more efficiently.

## Get the detailed progress by Rest API

To check the detailed progress more efficiently, we need to download it without the admin portal. Fortunately, we can get it by using Azure Stack Hub Rest API. The URL is as follows.

```
{$adminManagementUrl}/subscriptions/{$subscriptionId}/resourceGroups/{system.$updateLocation}/providers/Microsoft.Update.Admin/updateLocations/{$updateLocation}/updates/{$updateName}/updateRuns/{$updateRunName}?api-version=2016-05-01"
```

And the sample URL for the 2005 update is as follows.

```
/subscriptions/{$subscriptionId}/resourceGroups/system.{$RegionName}/providers/Microsoft.Update.Admin/updateLocations/{$RegionName}/updates/Microsoft1.2005.6.53/updateRuns/f6c8b6fc-25f6-4f58-a9fe-09526999d18b?api-version=2016-05-01
```

## Sample Code

My idea to convert this response to a more readable format is to use Out-Gridview. The sample code is [https://github.com/kongou-ae/AzureStackOperatorScripts/blob/master/Get-AzsUpdateProgress.ps1](here). This script requires you to select the update and the updaterun. After selecting these, this script shows you the readable detailed progress.

{{< figure src="/images/2020/2020-0825-001.png" title="The result of this sample script" >}}

## Conclusion

You can find the detailed progress using the JSON file you can download at the admin portal. And you can also get the same information by using Azure Stack Hub Rest API. If it is difficult for you to confirm this JSON file manually, Let's try to create your way by using Rest API.

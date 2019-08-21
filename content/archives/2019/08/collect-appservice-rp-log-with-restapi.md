---
title: Collect the logs of App Service Resource Provider with Azure Stack REST API
author: kongou_ae
date: 2019-08-15
url: /archives/2019/08/collect-appservice-rp-log-with-restapi
categories:
  - azurestack
---

## Introduction

Azure Stack Operator needs to collect the log of App Service Resource Provider in trouble. But Admin Portal doesn't provide this capability. So Azure Stack Operator needs to log in the controller VMs such as CN01-VM.

I don't use RDP to collect these logs and want to manage the general operation with only the Admin portal and Admin API. To realize my dream, I searched the REST API of App Service Resource Provider.

Based on my research, this blog explains the following points.

- Get the information about the instances of App Service Resource Provider.
- Collect the log of App Service Resource Provider

## API operations which I found

### Get the information of all servers

```
GET https://adminmanagement.<FQDN>/subscriptions/<SUBSCRIPTIONID>/providers/Microsoft.Web.Admin/locations/<REGION>/servers?api-version=2018-02-01
```

The response has the following server's information

- Controller
- Management Server
- Front End
- Publisher
- Worker

But the response doesn't have the information about the servers which is prerequisite for App Service Resource Provider. For example, domain controller, file server, and SQL server. I guess that these servers are not under control of App Service Resource Provider.

### Get the information of worker tiers

```
GET https://adminmanagement.<FQDN>/subscriptions/<SUBSCRIPTIONID>/providers/Microsoft.Web.Admin/locations/<REGION>/workerTiers?api-version=2018-02-01
```

The response has the worker's information such as shared, small, medium, and large.


### Get the logs of the specific server

```
Get https://adminmanagement.<FQDN>/subscriptions/<SUBSCRIPTIONID>/providers/Microsoft.Web.Admin/locations/<REGION>/servers/<SERVERNAME>/log?api-version=2018-02-01
```

The response has the log which you see on the admin portal. The format of this log is JSON.

## Sample script

There is a sample script for this API in my repository.

https://github.com/kongou-ae/AzureStackOperatorScripts/blob/master/Get-AzsAppServiceRoleLogs.ps1

This script saves the following data about App Service Resource Provider to your laptop.

- The information of servers
- The information of worker tiers
- The logs of all servers

As the result of using this script, I was able to reduce the time for collecting the information and logs about App Service Resource Provider.

## Final thought

App Service Resource Provider supports REST API which can collect their information. Maybe this API is unofficial because I can't find the documentation about this topic. But Azure Stack Operator can make their operation more effective with This REST API.
  

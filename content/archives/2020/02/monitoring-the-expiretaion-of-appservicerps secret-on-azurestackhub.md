---
title: Monitoring the expiration of App Service RP's secret on Azure Stack Hub 
author: kongou_ae
date: 2020-02-22
url: /archives/2020/02/monitoring-the-expiration-of-appservicerps-secret-on-azurestackhub 
categories:
  - azurestack
---

App Service Resource Provider on Azure Stack Hub contains four secrets. Azure Stack Hub Operator needs to rotate these secrets.

1. Encryption Keys
2. Connection Strings
3. Certificates
4. System Credentials

The most important secret is Certificates. If you forget rotating these certificates, App Service RP and App Service on a tenant side don't run normally. But the admin portal doesn't alert the expiration of these certificates. Unfortunately, The admin portal can alert the only expiration of the deployment certificate. So Azure Stack Hub Operator needs to monitor the expiration of these certificates by themselves. 

App Service RP on the admin portal shows you the expiration of these secrets. Furthermore, Azure Stack Hub Operator can get the expiration of these secrets by using Rest API. The URL is as follows. 

```
GET https://adminmanagement.<region>.<FQDN>/subscriptions/<SubscriptionId> /providers/Microsoft.Web.Admin/locations/<Region>/secrets?api-version=2018-02-01"
```

It is good that Azure Stack Hub Operator can monitor the expiration with Rest API because the expiration should be monitored automatically. The sample script to monitor this expiration is as follows.

[AzureStackOperatorScripts/Test-AzsAppServiceSecretExpiration.ps1](https://github.com/kongou-ae/AzureStackOperatorScripts/blob/master/Test-AzsAppServiceSecretExpiration.ps1)

This script confirms the expiration of these secrets with Rest API and shows the result to Azure Stack Hub Operator like the following capture.

{{< figure src="/images/2020/2020-0222-001.jpg" title="The output of the sample script" >}}

If you use a service principal and notification methods like a webhook or E-mail, you can create an automatic notification system for the secret of App Service RP. 

So to summarize, you need to monitor the expiration of App Service RP's secrets and you can choose a manual way with the admin portal or automatic way with Rest API.

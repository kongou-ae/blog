---
title: Azure Stack に TLS 1.2 を強制する
author: kongou_ae
date: 2019-07-05
url: /archives/2019/07/force-tls12-to-azurestack
categories:
  - azurestack
---

## サマリ

- [Azure Stack 1906 Update](https://docs.microsoft.com/en-us/azure-stack/operator/azure-stack-release-notes-1906)で、Azure Stack のエンドポイントに TLS 1.2 を強制させられるようになりました。
  - [Configure Azure Stack security controls](https://docs.microsoft.com/en-us/azure-stack/operator/azure-stack-security-configuration)
  - "Microsoft recommends using TLS 1.2 only policy for Azure Stack production environments."という記載があります。本番環境をお持ちの方は影響を調査したうえで TLS 1.2 を強制しましょう。

## 環境

ASDK 1906 @[物理コンテナ](https://thinkit.co.jp/article/13243)

## ログ

### 初期状態

初期状態の Azure Stack はすべての TLS を受け入れる設定になっています。

```PowerShell
[azs-ercs01]: PS> get-tlspolicy
TLS_All
```

そのため、TLS 1.1 を設定した PowerShell で Azure Stack に HTTPS でアクセスできます。

```PowerShell
PS C:\Users\AzureStackAdmin>  [Net.ServicePointManager]::SecurityProtocol
Tls, Tls11

PS C:\Users\AzureStackAdmin> Invoke-WebRequest -Uri https://adminportal.uda.asdk.aimless.jp


StatusCode        : 200
StatusDescription : OK
（中略）
```

### TLS 1.2 強制

TLS 1.2 を強制するために、Privileged Endpoint で "Set-TLSPolicy -Version TLS_1.2" を実行します。

```PowerShell
[azs-ercs01]: PS> Set-TLSPolicy -Version TLS_1.2
VERBOSE: Successfully setting enforce TLS 1.2 to True
VERBOSE: Invoking action plan to update GPOs
VERBOSE: Create Client for execution of action plan
VERBOSE: Start action plan
VERBOSE: Action plan instance ID specified: de8a7ae5-59ec-4aa6-9be0-37728460df1a

VERBOSE: StartTime: 07/05/2019 04:27:23
VERBOSE: Timeout estimate: 07/05/2019 05:27:23 .
VERBOSE: 
Overall action status: 'Pending'
VERBOSE: 

VERBOSE: 


VERBOSE: 
Overall action status: 'Running'
VERBOSE: 

VERBOSE: Step 'Update Group Policy' status: 'InProgress'
VERBOSE: 

（中略）

VERBOSE: Step 'Update Group Policy' status: 'InProgress'
VERBOSE: 

VERBOSE: 
Overall action status: 'Running'
VERBOSE: 

VERBOSE: Step 'Update Group Policy' status: 'InProgress'
VERBOSE: 


VERBOSE: DONE
Guid                                
----                                
de8a7ae5-59ec-4aa6-9be0-37728460df1a

InstanceID                 : de8a7ae5-59ec-4aa6-9be0-37728460df1a
ActionPlanName             : 
ActionTypeName             : UpdateGroupPolicy
RolePath                   : Cloud
ProgressAsXml              : <Action Type="UpdateGroupPolicy" EceErrorAction="Stop" StartTimeUtc="2019-07-05T04:27:32.8792478Z" 
                             Status="Success" EndTimeUtc="2019-07-05T04:34:24.713572Z">
                               <Steps>
                                 <Step FullStepIndex="0" Index="0" Name="Update Group Policy" Description="Update Group Policy." 
                             StartTimeUtc="2019-07-05T04:27:32.8792478Z" Status="Success" 
                             EndTimeUtc="2019-07-05T04:34:24.713572Z">
                                   <Task RolePath="Cloud\Infrastructure\Domain" InterfaceType="UpdateGroupPolicy" 
                             StartTimeUtc="2019-07-05T04:27:32.8792478Z" Status="Success" RetryAttempts="0" 
                             EndTimeUtc="2019-07-05T04:34:24.713572Z" />
                                 </Step>
                               </Steps>
                             </Action>
Status                     : Completed
StartDateTime              : 7/5/2019 4:27:23 AM
EndDateTime                : 7/5/2019 4:34:24 AM
LastModifiedDateTime       : 7/5/2019 4:34:24 AM
StartIndex                 : 
EndIndex                   : 
Skip                       : {}
Retries                    : 
ParentActionPlanInstanceID : 00000000-0000-0000-0000-000000000000
LockType                   : NoLock
RuntimeParameters          : {}
RemediationInstance        : 
OnCompleteInstance         : 
InstanceType               : None
AdditionalInformation      : 
CorrelationRequestId       : 72caf9bc-1e68-4ef7-a762-bd8d618ed1db

VERBOSE: Verifying TLS policy
VERBOSE: Get GPO TLS protocols registry 'enabled' values
VERBOSE: GPO TLS applied with the following preferences:
VERBOSE:     TLS protocol SSL 2.0 enabled value: 0
VERBOSE:     TLS protocol SSL 3.0 enabled value: 0
VERBOSE:     TLS protocol TLS 1.0 enabled value: 0
VERBOSE:     TLS protocol TLS 1.1 enabled value: 0
VERBOSE:     TLS protocol TLS 1.2 enabled value: 1
VERBOSE: TLS 1.2 is enforced

[azs-ercs01]: PS> get-tlspolicy
TLS_1.2
```

TLS 1.2 を強制した状態で、TLS 1.1 を利用する PowerShell で Azure Stack に HTTPS でアクセスすると、エラーになります。ちゃんと TLS 1.2 のみで動作していそうです。

```PowerShell
PS C:\Users\AzureStackAdmin> [Net.ServicePointManager]::SecurityProtocol = [Net.SecurityProtocolType]::Tls11

PS C:\Users\AzureStackAdmin>  [Net.ServicePointManager]::SecurityProtocol
Tls11

PS C:\Users\AzureStackAdmin> Invoke-WebRequest -Uri https://adminportal.uda.asdk.aimless.jp
Invoke-WebRequest : The underlying connection was closed: An unexpected error occurred on a receive.
At line:1 char:1
+ Invoke-WebRequest -Uri https://adminportal.uda.asdk.aimless.jp
+ ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
    + CategoryInfo          : InvalidOperation: (System.Net.HttpWebRequest:HttpWebRequest) [Invoke-WebRequest], WebException
    + FullyQualifiedErrorId : WebCmdletWebResponseException,Microsoft.PowerShell.Commands.InvokeWebRequestCommand
```


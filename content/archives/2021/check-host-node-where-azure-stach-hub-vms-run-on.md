---
title: Check the host node where Azure Stack Hub VMs run on
author: kongou_ae
date: 2021-01-21
url: /archives/2021/01/check-host-node-where-azure-stach-hub-vms-run-on
categories:
  - azurestack
---


One of the gaps between Azure Stack Hub users' requirements and Azure Stack Hub's feature is Resource health. Azure Stack Hub doesn't support Resource Health, so users can't detect whether a hardware-related issue caused their downtime or not. 

In this situation, if the user can know a host node where the user's VM runs on, the user can detect Host Node's failure or the maintenance of Host Node Indirectly. Fortunately, Windows Server running on Hyper-V can confirm the hostname of Host Node by the following registry key:

Computer\HKEY_LOCAL_MACHINE\SOFTWARE\Microsoft\Virtual Machine\Guest\Parameters

Ref:[Find the Hostname of a Hyper-V VM](https://techcommunity.microsoft.com/t5/itops-talk-blog/find-the-hostname-of-a-hyper-v-vm/ba-p/2074171?WT.mc_id=modinfra-0000-thmaure)

So Azure Stack Hub users can use alternative Resource Health by checking this registry key continuously.

I think there are many ways to confirm registry keys centralizedly. To realize this, I created the sample project of alternative Resource Health by using Azure Automation inventory. Azure Automation Inventory can collect specific registry keys from many VMs in Azure.

One of the ways to enable Azure Automation Inventory to Azure Stack Hub VM is Azure Arc enabled servers. Due to the following steps, you can enable Azure Automation Inventory to Azure Stack Hub VM.

1. Enable Azure Arc enabled servers to Azure Stack Hub VM
2. Install Microsoft Monitoring Agent through Azure Arc extension
3. Enable Azure Automation Inventory to Azure Arc Machine

After having enabled Azure Automation Inventory, you need to add this registry key to a custom target. Some minutes later, you can search the HostNode where VMs on Azure Stack Hub run centralizedly with the following Kusto.

```
ConfigurationData
| where RegistryKey == "HKEY_LOCAL_MACHINE\\SOFTWARE\\Microsoft\\Virtual Machine\\Guest\\Parameters"
| where ValueName == "PhysicalHostName"
| summarize arg_max(TimeGenerated, *) by Computer
| project TimeGenerated, Computer, HostNode=ValueData
```

{{< figure src="/images/2021/2021-0121-001.jpg" title="Host Nodes of every VMs" >}}

Of course, you can also search the time series data about specific VM with the following Kusto. Based on this result, we can guess that the host node of azs-win004 encountered a hardware-related issue like a hardware failure or maintenance at about 6:00 on Jan 21th.

```
ConfigurationData
| where RegistryKey == "HKEY_LOCAL_MACHINE\\SOFTWARE\\Microsoft\\Virtual Machine\\Guest\\Parameters"
| where ValueName == "PhysicalHostName"
| where Computer ==	"azs-win004"
| project TimeGenerated, Computer, HostNodeValueData
| sort by TimeGenerated desc 
```

{{< figure src="/images/2021/2021-0121-002.jpg" title="Host Nodes of specific VMs" >}}

This approach can't inform you of the new host node quickly because Azure Automation Inventory checks the change of a registry key per about 50min.

I believe this way is not a good workaround to fix the gap, but it may help someone&s requirement until Microsoft installs Resource Health in Azure Stack Hub.

---
title: TIPs for AKS Engine on Azure Stack Hub
author: kongou_ae
date: 2020-02-08
url: /archives/2020/02/tips-for-aksengine-on-azurestackhub
categories:
  - azurestack
---

## TIPs for AKS Engine on Azure Stack Hub

We can use AKS Engine on Azure Stack Hub in production bacause this became GA at Ignite 2019. I created kubernetec cluster on Azure Stack Hub and learned some tips. I'm happy if this entry will help Azure Stack Hub Operator.

### 1. Keep enough quotas

You need to have an enough quota to deploy k8s engine because the deployment of AKS engine create many VMs and managed disks. If your subscription doesn't contain enough quotas, your deployment will fail.

### 2. Deploy your k8s cluster in your existing VNet

The sample json which azurestack-docs referes creates the new VNet and deploys your k8s cluster in this VNet.

https://github.com/Azure/aks-engine/blob/master/examples/azure-stack/kubernetes-azurestack.json

If you want to deploy your k8s cluster in your existing VNet, the following sumple will help you.

https://github.com/Azure/aks-engine/blob/master/examples/vnet/kubernetesvnet.json

### 3. Use a premium disk

The template for AKS engine doesn't contain the parameter to use a premium disk because AKS engine select the type of a disk automatically. If you want to use a premium disk for nodes, you need to choose the VM size which supports a premium disk.

https://github.com/Azure/AKS/issues/580#issuecomment-410971305


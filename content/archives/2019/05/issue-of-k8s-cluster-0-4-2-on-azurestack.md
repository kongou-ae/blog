---
title: The issue of Kubernetes template 0.4.2 for Azure Stack
author: kongou_ae
date: 2019-05-23
url: /archives/2019/05/issue-of-k8s-cluster-0-4-2-on-azurestack
categories:
  - azurestack
---

## Introduction

This entry is additional information about the following entry. I believe that this entry will help who deploy k8s cluster 0.4.2 on Azure Stack.

[Azure Stack に Kubernetes Cluster をデプロイする](https://aimless.jp/blog/archives/2019/05/k8s-cluster-on-azurestack/)

## Environment

ASDK 1904 @[physical container](https://thinkit.co.jp/article/13243)

## Issue

when you deploy k8s cluster on Azure Stack by using k8s template 0.4.2, you can set only 1 to the count of muster node.

{{< figure src="/images/2019-05-23-001.png" title="1" >}}

## Cause

The 1 is set in the template which defines the UI for a deploy. This file is located in the “systemgallery” storage account.

```
      {
        "name": "masterPoolProfileCount",
        "type": "Microsoft.Common.DropDown",
        "label": "Kubernetes master pool profile count",
        "defaultValue": "1",
        "toolTip": "The number of master nodes for the Kubernetes cluster. This value should be odd number.",
        "constraints": {
          "allowedValues": [{
              "label": "1",
              "value": "1"
            }
          ]
        },
        "visible": true
      },
```

## Workaround

If you are Azure Stack Operator, you need to update “createUiDefinition.json” in ”dev20161101-microsoft-windowsazure-gallery/Microsoft.AzureStackKubernetesCluster.0.4.2/DeploymentTemplates”. 

```
      {
        "name": "masterPoolProfileCount",
        "type": "Microsoft.Common.DropDown",
        "label": "Kubernetes master pool profile count",
        "defaultValue": "3",
        "toolTip": "The number of master nodes for the Kubernetes cluster. This value should be odd number.",
        "constraints": {
          "allowedValues": [{
              "label": "1",
              "value": "1"
            },
            {
              "label": "3",
              "value": "3"
            },
            {
              "label": "5",
              "value": "5"
            },
            {
              "label": "7",
              "value": "7"
            }
          ]
        },
        "visible": true
      },
```

If you are Azure Stack user, you need to call your Azure Stack Operator to fix this issue.

## Final thought

Why did the count of a master node be changed to only 1? I hope that this issue will be fixed at the next release.

During fixing this issue, I got more experience about Azure Stack Marketplace. This experience grew me.


---
title: Create virtual machine on Azure Stack with Ansible
author: kongou_ae
date: 2019-02-24
url: /archives/2019-02-24-create-vm-on-azurestack-with-ansible-en
categories:
  - azurestack
---

## Introduction

I tried creating a virtual machine with Ansible to Azure Stack. In conclusion, I was able to create a virtual machine with Ansible 2.4 and service principle.

## My environment

- ASDK 1901 @[physical container](https://thinkit.co.jp/article/13243)
- Ubuntu 18.04

## Ansible 2.7.7

At first, I used Ansible 2.7.7 which pip installed to my machine. Then, the following error about creating virtual network occurred.

```
    "msg": "Error creating or updating virtual network myVnet - Azure Error: NoRegisteredProviderFound\nMessage: No registered resource provider found for location 'local' and API version '2017-11-01' for type 'virtualNetworks'. The supported api-versions are '2014-12-01-preview, 2015-05-01-preview, 2015-06-15, 2016-03-30, 2016-06-01, 2016-07-01, 2016-08-01, 2016-09-01, 2016-10-01, 2016-11-01, 2016-12-01, 2017-03-01, 2017-04-01, 2017-06-01, 2017-08-01, 2017-09-01, 2017-10-01'. The supported locations are 'local'."
```

I think that the reason is the different API version between Azure and Azure Stack. Ansible 2.7.7 uses API version 2017-11-01 for type virtual network. Azure supports this version. However, Azure Stack don’t support this version.

## Ansible 2.4

The azure module of Ansible can't set custom API version in the playbook. Therefore we must re-install the old version of Ansible to use Ansible for Azure Stack. 

I believe that the version which Azure user can permit to use is Available 2.4. Because Ansible 2.4 supports Managed disk and availability set. Especially, Managed disk is necessary for the recent Azure user. I think that every Azure user doesn’t want to manage storage accounts for storing a disk of a virtual machine.

You can re-install old Ansible by using the following command.

```
pip install ansible[azure]\==2.4
```

### Authentication

I tried using the authentication with Azure CLI. However, ansible said, “Please input your credential.” I could not detect the reason why Ansible was not able to use the credential of Azure CLI.

On the other hand, the authentication with service principle ran successfully. So I wrote the information on the service principle in `/etc/credentials` as follows.

```
[default]
subscription_id=81373782-f242-4e53-9a9e-ee9168ecc0f3
client_id=c6957708-cc0a-xxxx-xxxx-xxxxxxxxxxxx
secret=fd495ddd-e536-xxxx-xxxx-xxxxxxxxxxxx
tenant=50f9de73-a175-xxxx-xxxx-xxxxxxxxxxxx
cloud_environment=https://management.local.azurestack.external
``

## Notice for writing a playbook

There are two critical points to write a playbook. One is `cloud_environment`. Another is the location name.

You must input your Azure Stack fqdn of ARM endpoint in `cloud_environment` of your playbook. If you don’t input this value, Ansible tries connecting to Azure, not Azure Stack. 


```
[default]
subscription_id=81373782-f242-4e53-9a9e-ee9168ecc0f3
client_id=c6957708-cc0a-xxxx-xxxx-xxxxxxxxxxxx
secret=fd495ddd-e536-xxxx-xxxx-xxxxxxxxxxxx
tenant=50f9de73-a175-xxxx-xxxx-xxxxxxxxxxxx
cloud_environment=https://management.local.azurestack.external
``

Also, you must use your region name of Azure Stack. Azure Stack uses a unique region name which is different from the region name of Azure. If you try Ansible with ASDK, location name must be local.


```
- name: Create Azure VM
  hosts: localhost
  connection: local
  tasks:
  - name: Create resource group
    azure_rm_resourcegroup:
      name: myResourceGroup
      location: local
```

The playbook which I was able to use with Azure Stack is as follows. 

(https://gist.github.com/kongou-ae/a81bdeed056303cf3f54813d7ea47a3e)

## Final consideration

You can create a virtual machine on Azure Stack with Ansible. The consistency to Azure makes the capability to use the same tools for Azure. Moreover, we can use the same Azure module and playbook between Azure and Azure Stack because Ansible doesn’t have an individual module for Azure Stack.

However, we are careful of the following points to enjoy Ansible with Azure Stack.

- Use old Ansible which uses old API version supported by Azure Stack
- Specify your ARM endpoint as cloud_environment
- Use the correct region name which your Azure stack uses

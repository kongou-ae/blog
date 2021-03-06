---
title: Update FortiGate policy by REST API
author: kongou_ae
date: 2018-11-26
url: /archives/2018-11-26-update-firewall-policy-by-rest
categories:
  - fortigate
---

## Introduction 

By e-mail, I recieved the question about how to update the FortiGate's policy by rest api. So I write this content.

If you don't know a token and a cookie to access FortiGate by rest api, Please confirm the following content (Japanese only).

[FortiGateをREST APIで管理する](https://aimless.jp/blog/archives/2017-04-01-manageing-fortigate-by-rest-api/)

Our environment is FortiGate 30D (v5.6.3).

## Get a policy

You can get all policy by the following command.

```
curl -H "Content-Type: application/json" https://your.fortigate.ip.address/api/v2/cmdb/firewall/policy/ --insecure -b cookie.txt
```

You can get a individual policy by the follwoing command. The following command shows the result of policy id 20.

```
curl -H "Content-Type: application/json" https://your.fortigate.ip.address/api/v2/cmdb/firewall/policy/20 --insecure -b cookie.txt
```

## Create a policy

You must use "POST" operation to create new policy. The body which you send to Fortigate must be same format as the responce which FortiGate send you. But I don't know which parametor is required and which parametor is optional.

```
curl -X POST -H "Content-Type: application/json" -H "X-CSRFTOKEN:YOURTOKEN" https://your.fortigate.ip.address/api/v2/cmdb/firewall/policy/ -d @policy.json --insecure -b cookie.txt
```

## Update a policy

You must use "PUT" operation to update a policy. When you use "PUT" operation, you must use the url which has policy number.

```
curl -X PUT -H "Content-Type: application/json" -H "X-CSRFTOKEN:YOURTOKEN" https://your.fortigate.ip.address/api/v2/cmdb/firewall/policy/20 -d @policy.json --insecure -b cookie.txt
```

 For example,

```
$ curl -H "Content-Type: application/json" https://your.fortigate.ip.address/api/v2/cmdb/firewall/policy/20 --insecure -b cookie.txt -sS | grep action
      "action":"accept",
$ 
$ cat policy.1.json 
{
      "action":"deny"
}
$ 
$ curl -X PUT -H "Content-Type: application/json" -H "X-CSRFTOKEN:YOURTOKEN" https://your.fortigate.ip.address/api/v2/cdb/firewall/policy/20 -d @policy.1.json --insecure -b cookie.txt
{
  "http_method":"PUT",
  "revision":"180.0.0.2906394636.1539432640",
  "mkey":"20",
  "status":"success",
  "http_status":200,
  "vdom":"root",
  "path":"firewall",
  "name":"policy",
  "serial":"FGT30Dxxxxxxxxxxxxx",
  "version":"v5.6.3",
  "build":1547
}

$ curl -H "Content-Type: application/json" https://your.fortigate.ip.address/api/v2/cmdb/firewall/policy/20 --insecure -b cookie.txt -sS | grep action
      "action":"deny",
```

## Conclusion

I'm happy if this entry help you.

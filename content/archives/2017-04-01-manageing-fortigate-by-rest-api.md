---
title: FortiGateをREST APIで管理する
author: kongou_ae

date: 2017-04-01
url: /archives/2017-04-01-manageing-fortigate-by-rest-api
categories:
  - fortigate
---

## 背景

FortiOSがREST APIに対応していることに気が付いたので試してみました。

参考：[FortiOS REST API](http://www.tuncaybas.com/FOS_JSON_REST_API_523.pdf)

ドキュメントやフォーラムを見る限りだと2年前くらいにリリースされたv5.2.3からREST APIに対応していたみたいです。2年前に知りたかった。公式サイトにドキュメントが見当たらないので、開発者専用の機能なのかもしれません。

## 実践

家のFortiGateはFortiOS v4.3.10なので、REST APIをサポートしていません。今回はAWS上にデプロイしたForti-VM（FortiOS v5.4.2）で試します。

### 認証

FortiGateのREST APIにアクセスするためには認証トークンが必要です。認証トークンを取得するためには、https://[FortiGate]/logincheckに対してユーザ名とパスワードをPOSTします。ccsrftokenに含まれる値が認証トークンです。今後のアクセスにそなえてcookieをファイルに保存しておきます。

```
curl https://54.250.201.237/logincheck --data "username=admin&secretkey=i-0b4833b0081bf07ed" --insecure --dump-header - -c cookie.txt
HTTP/1.1 200 OK
Date: Sat, 01 Apr 2017 12:57:41 GMT
Server: xxxxxxxx-xxxxx
Set-Cookie: APSCOOKIE_10593376298575695335="Era%3D1%26Payload%3DpWIphfvcprhZL8n9aZ9MmxXuYwAoGURXMxPb6kA4FaaOkY%2FdnqmGnIzFK9mRiL%2Fm%0AZ1ug81tQLlgtkYvEhW+F4btbdmV4hUaXjCks%2FvkaoGnTFOjZVG9lxvDp7P7l5v%2FP%0A6qRYRH4daXkWD62tRVRzOzwh8c402+kl+bth2S+9aOukVOK5vLHi5G2VlaSi%2F1aU%0A%26AuthHash%3DQc6xP9Zh1hYuXw6ZdLpuuSPpQfkA%0A"; path=/; HttpOnly
Set-Cookie: ccsrftoken_10593376298575695335="1FBF5FBBE218A66091248EFB8BEAC2"; path=/
Set-Cookie: ccsrftoken="1FBF5FBBE218A66091248EFB8BEAC2"; path=/
Set-cookie: rl=;expires=Thu, 01 Jan 1970 00:00:01 GMT;path=/
Transfer-Encoding: chunked
Content-Type: text/html; charset=utf-8
X-Frame-Options: SAMEORIGIN
Content-Security-Policy: frame-ancestors 'self'
X-UA-Compatible: IE=Edge

<script language="javascript">
document.location="/ng/prompt?viewOnly&redir=%2Fng%2F";
</script>
```
### 2つのAPI

FortiGateは2つのAPIをサポートします。cmdbはconfig xxx xxxの結果を、monitorはget xxx xxxの結果を返すイメージです。今回はcmdbを触ります。

1. /api/v2/cmdb
1. /api/v2/monitr

### 情報を取得する（GET）

次のポリシーが設定されているFortiGateからREST APIでポリシーを取得してみます。

{{ <img src="./../../images/2017-04-02-001.png"> }}

config xxx yyyが/cmdb/xxxx/yyy/に対応しているので、cmdb/firewall/policyにアクセスします。

```
root@ubuntu:~# curl https://54.250.201.237/api/v2/cmdb/firewall/policy -b cookie.txt --insecure
{
  "http_method":"GET",
  "results":[
    {
      "policyid":1,
      "q_origin_key":"1",
      "name":"test1",
      "uuid":"5e793628-1625-51e7-74cf-0eed2b242a2f",
      "srcintf":[
        {
          "name":"port1",
          "q_origin_key":"port1"
        }
      ],
      "dstintf":[
        {
          "name":"port1",
          "q_origin_key":"port1"
        }
      ],
      "srcaddr":[
        {
          "name":"google-play",
          "q_origin_key":"google-play"
        }
～～～中略～～～
    }
  ],
  "vdom":"root",
  "path":"firewall",
  "name":"policy",
  "status":"success",
  "http_status":200,
  "serial":"FGTAWS000B4833B0",
  "version":"v5.4.2",
  "build":9380
```

全結果を[こちら](https://gist.github.com/kongou-ae/0bcc3fc3dfbaab17c1ced85c4e991d18)に全結果を置いておきます。ファイアウォールポリシーがjsonになっています。すばらしい。

ルーティングやアドレスオブジェクト、サービスオブジェクトも取得できます。

- [ルーティングの取得結果](https://gist.github.com/kongou-ae/ef5614a3b1abe82be014409d927053b9)
- [アドレスオブジェクトの取得結果](https://gist.github.com/kongou-ae/86aca385a94e4be0dc49a3dd4f06f1dd)
- [サービスオブジェクトの取得結果](https://gist.github.com/kongou-ae/76941c8014dc7d21519c85ba21fb0414)

### 情報を追加する

GET以外を要求する際は、認証トークンをX-CSRFTOKENとしてヘッダに追加する必要があります。

オブジェクトとサービスの追加（POST）ができました。ファイアウォールポリシーの追加（POST）やオブジェクトとサービスの更新（PUT）も試したのですが、405エラー（405- Method Not Allowed ）が返ってきました。まだ、すべてのリソースに対するすべての操作ができないようです。

```
}root@ubuntu:~# more object.json
{
  "name": "POST test3",
  "subnet": "192.168.2.0 255.255.255.0"
}
root@ubuntu:~# curl -X POST -H "Content-Type: application/json" -H "X-CSRFTOKEN:81E38DF53AF14DCDC2
D607DAA5CF47F" https://54.250.201.237/api/v2/cmdb/firewall/address/ -d @object.json --insecure -b
cookie.txt
{
  "http_method":"POST",
  "results":{
    "mkey":"POST test3"
  },
  "vdom":"root",
  "path":"firewall",
  "name":"POST test3",
  "status":"success",
  "http_status":200,
  "serial":"FGTAWS000B4833B0",
  "version":"v5.4.2",
  "build":9380
}
```
{{ <img src="./../../images/2017-04-02-002.png"> }}


```
root@ubuntu:~# cat service.json
  {
    "name": "POST-test3",
    "q_origin_key": "POST-test3",
    "explicit-proxy": "disable",
    "category": "General",
    "protocol": "TCP/UDP/SCTP",
    "iprange": "0.0.0.0",
    "fqdn": "",
    "protocol-number": 6,
    "icmptype": "",
    "icmpcode": "",
    "tcp-portrange": "8081",
    "udp-portrange": "",
    "sctp-portrange": "",
    "tcp-halfclose-timer": 0,
    "tcp-halfopen-timer": 0,
    "tcp-timewait-timer": 0,
    "udp-idle-timer": 0,
    "session-ttl": 0,
    "check-reset-range": "default",
    "comment": "",
    "color": 0,
    "visibility": "enable"
  }
root@ubuntu:~# curl -X POST -H "Content-Type: application/json" -H "X-CSRFTOKEN:C3FD4F167DBA513711C157D951B9AF" https://54.250.201.237/api/v2/cmdb/firewall.service/custom/ -d @service.json --insecure -b cookie.txt
{
  "http_method":"POST",
  "results":{
    "mkey":"POST-test3"
  },
  "vdom":"root",
  "path":"firewall.service",
  "name":"POST-test3",
  "status":"success",
  "http_status":200,
  "serial":"FGTAWS000B4833B0",
  "version":"v5.4.2",
  "build":9380
}
```
{{ <img src="./../../images/2017-04-02-003.png"> }}

## 感想

ポリシーやアドレスなどの設定情報をjsonで取得できることに感動しました。jsonであればプログラミング言語でパースしやすいです。成果物作成の自動化がはかどりそうです。
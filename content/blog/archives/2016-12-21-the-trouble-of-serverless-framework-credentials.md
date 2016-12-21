---
title: Serverless Frameworkの認証周りでハマった
author: kongou_ae
layout: post
date: 2016-12-21
url: /blog/archives/2016-12-21-the-trouble-of-serverless-framework-credentials
categories:
  - aws
---

## 背景

新しいLambdaファンクションを書くことになったので、以前から気になっていたServerless Frameworkを使いました。`~/.aws/credentials`に複数のプロファイルが設定されている環境で、認証情報の取扱いに苦労したのでメモしておきます。

## ハマりどころ

### プロファイルを指定して認証情報を保存する

Serverless Frameworkは`~/.aws/credentials`の認証情報を利用します。`serverless config credentials`コマンドを使うと、認証情報を`~/.aws/credentials`に書き込むことができます。

ただし、オプションをつけないと、認証情報をdefalutプロファイルに保存しようとします。その結果、`~/.aws/credentials`にdefaultプロファイルが存在する場合、次のようにエラーになります。

```
$ ./node_modules/.bin/serverless config credentials --provider aws --key hoge --secret huga                                                                
Serverless: Setting up AWS...
Serverless: Saving your AWS profile in "~/.aws/credentials"...
Serverless: Failed! ~/.aws/credentials exists and already has a "default" profile.
```

複数のプロファイルを使い分けている環境の場合は、`--profile`オプションでプロファイル名を指定します。

```
$ ./node_modules/.bin/serverless config credentials --provider aws --key hoge --secret huga --profile test
Serverless: Setting up AWS...
Serverless: Saving your AWS profile in "~/.aws/credentials"...
Serverless: Success! Your AWS access keys were stored under the "test" profile.
$ cat ~/.aws/credentials
（中略）
[test]
aws_access_key_id=hoge
aws_secret_access_key=huga
```

### プロファイルを指定して認証情報を利用する

Serverless Frameworkは、`.serverless.yml`でプロファイルを明示しない場合、defaultプロファイルの認証情報を使います。defaultプロファイル以外の認証情報を利用する場合は、`.serverless.yml`にプロファイル名を明記します。次のように明記すると、Serverless Frameworkは、Lambdaというプロファイルで保存されている認証情報を使います。

```
provider:
  name: aws
  runtime: nodejs4.3
  region: ap-northeast-1
  profile: lambda # <---ココ
```

## 感想

初めてのServerless Frameworkで見事にハマったものの、公式ドキュメントを読んで解決できました。ドキュメントが整備されているツールは素晴らしい。

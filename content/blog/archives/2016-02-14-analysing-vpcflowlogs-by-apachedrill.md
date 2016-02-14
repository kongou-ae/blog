---
title: Apache Drill を使ってVPC Flow Logsを集計する
author: kongou_ae
layout: post
date: 2016-02-14
url: /blog/archives/2016-02-14-analysing-vpcflowlogs-by-Apache-drill
categories:
  - aws
---

## VPC FLow Logsを集計する

[flowlogs-readerを使って、VPC Flow Logsをコマンドラインで操作する](http://aimless.jp/blog/archives/2016-02-02-retrieving-aws-vpc-flow-logs-using-flowlogs-reader/)にて、flowlogs-readerの標準出力をawkで集計する方法を紹介しました。

ですが、この方法は、自分が意図するシェル芸を考えることが大変です。もう少しスマートなやり方はないものかと考えた結果、Apache Drillを使う方法を思いついたので試してみました。

## Apache Drillのインストール

とりあえず使うことを目的としますので、tar.gzをダウンロードして解凍するだけにします。

```
$ wget http://ftp.jaist.ac.jp/pub/Apache/drill/drill-1.4.0/Apache-drill-1.4.0.tar.gz
--2016-02-14 19:37:02--  http://ftp.jaist.ac.jp/pub/Apache/drill/drill-1.4.0/Apache-drill-1.4.0.tar.gz
Resolving ftp.jaist.ac.jp (ftp.jaist.ac.jp)... 2001:df0:2ed:feed::feed, 150.65.7.130
Connecting to ftp.jaist.ac.jp (ftp.jaist.ac.jp)|2001:df0:2ed:feed::feed|:80... connected.
HTTP request sent, awaiting response... 200 OK
Length: 202712816 (193M) [application/x-gzip]
Saving to: ‘Apache-drill-1.4.0.tar.gz’

Apache-drill-1.4.0.tar.gz                 1%[>                                                                              ]   3.25M  5.33MB/s             
Apache-drill-1.4.0.tar.gz               100%[==============================================================================>] 193.32M   743KB/s   in 1m 55s

2016-02-14 19:38:57 (1.68 MB/s) - ‘Apache-drill-1.4.0.tar.gz’ saved [202712816/202712816]

$
$ tar xzvf Apache-drill-1.4.0.tar.gz                                                                                                      
Apache-drill-1.4.0/KEYS
Apache-drill-1.4.0/LICENSE
Apache-drill-1.4.0/README.md
Apache-drill-1.4.0/NOTICE
（中略）
Apache-drill-1.4.0/sample-data/regionsMF/regionsMF_Typed.parquet
Apache-drill-1.4.0/sample-data/regionsSF/regionsSF.parquet
$ cd Apache-drill-1.4.0/
Apache-drill-1.4.0]$
Apache-drill-1.4.0]$ bin/drill-embedded
OpenJDK 64-Bit Server VM warning: ignoring option MaxPermSize=512M; support was removed in 8.0
Feb 14, 2016 7:40:57 PM org.glassfish.jersey.server.ApplicationHandler initialize
INFO: Initiating Jersey application, version Jersey: 2.8 2014-04-29 01:25:26...
Apache drill 1.4.0
"drill baby drill"
```

なお、初めはt2.microのEC2で試したのですが、メモリ不足？なのかApache Drillが起動しませんでした。メモリ2Gのconohaで試したところ、無事起動しました。

```
$ drill-embedded
OpenJDK 64-Bit Server VM warning: INFO: os::commit_memory(0x00000006e0000000, 1431633920, 0) failed; error='Cannot allocate memory' (errno=12)
#
# There is insufficient memory for the Java Runtime Environment to continue.
# Native memory allocation (malloc) failed to allocate 1431633920 bytes for committing reserved memory.
# An error report file with more information is saved as:
# /tmp/jvm-10501/hs_error.log
```

## 集計元データの作成

flowlogs-readerの標準出力をawkでCSV形式にします。

```
$ pyenv exec flowlogs_reader VPCFlowLogGroup --region ap-northeast-1 -s '2016-02-13 00:00:00' -e '2016-02-14 00:00:00' | awk -F" " '{print strftime("%F %T %Z",$11) "," $4 "," $5 "," $6 "," $7 "," $8 "," $10 "," $13}' > result.csv    
```

ただし、CSV形式のままApache Drillで利用すると、以下のような集計できない形になってしまいます。

```
0: jdbc:drill:zk=local> select * from dfs.`/home/xxxxxxxx/result.csv`;                
+------------------------------------------------------------------------------------------------+
|                                            columns                                             |
+------------------------------------------------------------------------------------------------+
| ["time","srcaddr","dstaddr","srcport","dstport","protocol","bytes","result"]                   |
| ["2016-02-13 18:33:24 JST","103.246.150.182","172.20.0.10","443","44626","6","895","ACCEPT"]   |
| ["2016-02-13 18:33:24 JST","172.20.0.10","103.246.150.182","44624","443","6","77","ACCEPT"]    |
| ["2016-02-13 18:33:24 JST","172.20.0.10","54.245.244.135","52457","443","6","56372","ACCEPT"]  |
| ["2016-02-13 18:33:24 JST","172.20.0.10","50.112.250.150","49776","443","6","3262","ACCEPT"]   |
| ["2016-02-13 18:33:24 JST","54.245.120.220","172.20.0.10","443","33586","6","201","ACCEPT"]    |
| ["2016-02-13 18:33:24 JST","54.245.244.135","172.20.0.10","443","52457","6","31877","ACCEPT"]  |
| ["2016-02-13 18:33:24 JST","172.20.0.10","150.67.32.141","22","39999","6","520","ACCEPT"]      |
| ["2016-02-13 18:33:24 JST","50.112.250.150","172.20.0.10","443","49776","6","5552","ACCEPT"]   |
| ["2016-02-13 18:33:24 JST","103.246.150.182","172.20.0.10","443","44629","6","935","ACCEPT"]   |
```

そこで、CSVファイルの1行目にヘッダを追加し、CSVH形式で保存します。

```
$ more /home/xxxxxxxx/result.csvh
time,srcaddr,dstaddr,srcport,dstport,protocol,bytes,result
2016002013 18:33:24 JST,103.246.150.182,172.20.0.10,443,44626,6,895,ACCEPT
2016002013 18:33:24 JST,172.20.0.10,103.246.150.182,44624,443,6,77,ACCEPT
2016002013 18:33:24 JST,172.20.0.10,54.245.244.135,52457,443,6,56372,ACCEPT
2016002013 18:33:24 JST,172.20.0.10,50.112.250.150,49776,443,6,3262,ACCEPT
```

また、ポート番号の欄に`-`が入っていると、ポート番号を数値として扱えなくなるため、sedで`-`を0に置換しておきます。

```
sed -i -e "s/-/0/g" /home/xxxxxxxx/result.csvh  
```

## 集計してみる

とりあえずselectしてみましょう。CSVH形式にすると追加したヘッダがカラムになります。これならば集計できますね。

```
0: jdbc:drill:zk=local> select * from dfs.`/home/xxxxxxxx/result.csvh` ;
+--------------------------+------------------+------------------+----------+----------+-----------+--------+---------+
|           time           |     srcaddr      |     dstaddr      | srcport  | dstport  | protocol  | bytes  | result  |
+--------------------------+------------------+------------------+----------+----------+-----------+--------+---------+
| 2016002013 18:33:24 JST  | 103.246.150.182  | 172.20.0.10      | 443      | 44626    | 6         | 895    | ACCEPT  |
| 2016002013 18:33:24 JST  | 172.20.0.10      | 103.246.150.182  | 44624    | 443      | 6         | 77     | ACCEPT  |
| 2016002013 18:33:24 JST  | 172.20.0.10      | 54.245.244.135   | 52457    | 443      | 6         | 56372  | ACCEPT  |
| 2016002013 18:33:24 JST  | 172.20.0.10      | 50.112.250.150   | 49776    | 443      | 6         | 3262   | ACCEPT  |
| 2016002013 18:33:24 JST  | 54.245.120.220   | 172.20.0.10      | 443      | 33586    | 6         | 201    | ACCEPT  |
```

送信元がVPC内部のアドレス、宛先がVPC外部のアドレス、送信元ポートがウェルノウンポートな通信のバイト数で集計します。VPC外部の端末がサーバの提供するサービスにアクセスしたことによって生じたアウトバウンド通信が対象になるはず。

上位2件に入った、protocolが41（IPv6）で192.88.99.255宛の通信はいったい何でしょうか。6to4？

```
0: jdbc:drill:zk=local> select srcaddr,dstaddr,protocol,srcport,SUM(cast(bytes as INTEGER)) as bytes
. . . . . . . . . . . > from dfs.`/home/xxxxxxxx/result.csvh`    
. . . . . . . . . . . > where srcaddr LIKE '172.20%' AND dstaddr NOT LIKE '172.20%'
. . . . . . . . . . . > AND srcport < 1024
. . . . . . . . . . . > GROUP BY srcaddr,dstaddr,protocol,srcport
. . . . . . . . . . . > ORDER BY bytes desc;
+--------------+-----------------+-----------+----------+--------+
|   srcaddr    |     dstaddr     | protocol  | srcport  | bytes  |
+--------------+-----------------+-----------+----------+--------+
| 172.20.1.52  | 192.88.99.255   | 41        | 0        | 49352  |
| 172.20.0.67  | 192.88.99.255   | 41        | 0        | 48608  |
| 172.20.0.10  | xxx.xxx.xxx.xxx  | 6         | 22       | 20748  |
| 172.20.0.10  | 157.7.236.66    | 17        | 123      | 10488  |
| 172.20.0.20  | 160.16.101.116  | 17        | 123      | 4408   |
| 172.20.0.10  | 129.250.35.250  | 17        | 123      | 1748   |
| 172.20.0.10  | 59.106.180.168  | 17        | 123      | 1748   |
| 172.20.0.10  | 157.7.154.29    | 17        | 123      | 1672   |
| 172.20.0.20  | 60.56.214.78    | 17        | 123      | 1672   |
| 172.20.0.20  | 160.16.201.66   | 17        | 123      | 1672   |
| 172.20.0.20  | 106.187.50.84   | 17        | 123      | 1672   |
| 172.20.0.10  | xxx.xxx.xxx.xxx    | 6         | 22       | 440    |
| 172.20.0.20  | 37.203.214.106  | 6         | 80       | 40     |
| 172.20.0.20  | 107.150.60.74   | 6         | 80       | 40     |
+--------------+-----------------+-----------+----------+--------+
14 rows selected (3.928 seconds)
```

送信元がVPC内部のアドレス、宛先がVPC外部のアドレス、宛先ポートがウェルノウンポートな通信のバイト数で集計します。サーバが、VPC外部のサーバにアクセスしたことによって生じたアウトバウンド通信が対象になるはず。

```
0: jdbc:drill:zk=local> select srcaddr,dstaddr,protocol,dstport,SUM(cast(bytes as INTEGER)) as bytes
. . . . . . . . . . . > from dfs.`/home/xxxxxxxx/result.csvh`
. . . . . . . . . . . > where srcaddr LIKE '172.20%' AND dstaddr NOT LIKE '172.20%'
. . . . . . . . . . . > AND dstport < 1024
. . . . . . . . . . . > GROUP BY srcaddr,dstaddr,protocol,dstport
. . . . . . . . . . . > ORDER BY bytes desc;
+--------------+------------------+-----------+----------+-----------+
|   srcaddr    |     dstaddr      | protocol  | dstport  |   bytes   |
+--------------+------------------+-----------+----------+-----------+
| 172.20.0.10  | 103.246.150.154  | 6         | 443      | 21089910  |
| 172.20.0.10  | 27.0.2.250       | 6         | 443      | 16760457  |
| 172.20.0.10  | 103.246.150.182  | 6         | 443      | 16511551  |
| 172.20.0.10  | 54.245.91.49     | 6         | 443      | 2868271   |
| 172.20.0.10  | 54.244.113.28    | 6         | 443      | 2711682   |
| 172.20.0.10  | 54.245.120.220   | 6         | 443      | 1238373   |
| 172.20.0.10  | 50.112.250.150   | 6         | 443      | 913540    |
| 172.20.0.10  | 54.214.50.176    | 6         | 443      | 627718    |
| 172.20.0.10  | 54.245.244.135   | 6         | 443      | 331731    |
| 172.20.1.52  | 192.88.99.255    | 41        | 0        | 49352     |
| 172.20.0.67  | 192.88.99.255    | 41        | 0        | 48608     |
| 172.20.0.10  | 54.239.25.168    | 6         | 443      | 31625     |
| 172.20.0.10  | 157.7.236.66     | 17        | 123      | 10488     |
| 172.20.0.10  | 72.21.214.87     | 6         | 443      | 4655      |
| 172.20.0.20  | 160.16.101.116   | 17        | 123      | 4408      |
| 172.20.0.10  | 59.106.180.168   | 17        | 123      | 1748      |
| 172.20.0.10  | 129.250.35.250   | 17        | 123      | 1748      |
| 172.20.0.20  | 60.56.214.78     | 17        | 123      | 1672      |
| 172.20.0.20  | 160.16.201.66    | 17        | 123      | 1672      |
| 172.20.0.20  | 106.187.50.84    | 17        | 123      | 1672      |
| 172.20.0.10  | 157.7.154.29     | 17        | 123      | 1672      |
| 172.20.0.10  | 108.168.243.150  | 6         | 443      | 1093      |
| 172.20.0.10  | 54.231.224.66    | 6         | 80       | 769       |
| 172.20.0.10  | 54.231.224.10    | 6         | 80       | 613       |
+--------------+------------------+-----------+----------+-----------+
24 rows selected (0.714 seconds)
```

## 所感

VPC Flow Logsを分析する手法として、Apache Drillを試しました。CSVファイルに対してmysqlライクなクエリを投げられるのが大変便利だなと思いました。Apache Drillを使っても自分がやりたいことをクエリにしなければなりませんが、シェル芸のワンライナーを考えるよりもmysqlライクなクエリを考える方が簡単です。

今回利用したVPC Flow Logsはたった3Mです。データ容量がもっと増えた場合にどのような挙動になるのかは別途確認したいと思います。

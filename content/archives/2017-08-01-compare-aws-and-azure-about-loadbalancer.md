---
title: AWSとAzureのL4ロードバランサを比較する
author: kongou_ae

date: 2017-08-01
url: /archives/2017-08-01-compare-aws-and-azure-about-loadbalancer
categories:
  - AWS
  - Azure
---

AzureのLoad Balancerへの理解を深めるために、AzureのLoad BalanecrとAWSのClassic Load Balancerをロードバランサの機能ごとに比較しました。本エントリの対象は次のサービスです。いわゆるL4ロードバランサのみを対象としています。

- AWS Classic Load Balancer（TCP/SSL）
- Azure Load Balancer

リバースプロキシである次のサービスにもさらーっと触れます。

- AWS Classic Load Balancer（HTTP/HTTPS）
- AWS Application Load Balancer
- Azure Application Gateway

同じロードバランサでもクラウドによって仕様が違いました。様々なサービスを理解するのは大変ですね。

## 対象プロトコル

ロードバランサを利用できるプロトコル。

| Cloud            | 実装          |
|------------------|-------------|
| AWS CLB(TCP/SSL) | TCP、SSL[^1] |
| Azure LB         | TCP、UDP[^2] |

リバースプロキシである次のサービスは、HTTPとHTTPSのみをサポートします。

- AWS Classic Load Balancer（HTTP/HTTPS）
- AWS Application Load Balancer
- Azure Application Gateway

[^1]: [http://docs.aws.amazon.com/ja_jp/elasticloadbalancing/latest/userguide/what-is-load-balancing.html](http://docs.aws.amazon.com/ja_jp/elasticloadbalancing/latest/userguide/what-is-load-balancing.html)
[^2]: [https://docs.microsoft.com/ja-jp/azure/load-balancer/load-balancer-overview](https://docs.microsoft.com/ja-jp/azure/load-balancer/load-balancer-overview)

## 負荷分散方式

クライアントからの通信を特定のロジックにしたがって負荷分散の対象となるサーバに転送する機能。

| Cloud            | 実装                             |
|------------------|--------------------------------|
| AWS CLB(TCP/SSL) | ラウンドロビン[^3]                    |
| Azure LB         | 5タプルハッシュ、2タプルハッシュ、3タプルハッシュ[^4] |

なお、AWS CLB(HTTP/HTTPS)の負荷分散方式はLeast Conn（最小の未処理のリクエスト）です。[^3]

[^3]: [http://docs.aws.amazon.com/ja_jp/elasticloadbalancing/latest/userguide/how-elastic-load-balancing-works.html](http://docs.aws.amazon.com/ja_jp/elasticloadbalancing/latest/userguide/how-elastic-load-balancing-works.html)
[^4]: [https://docs.microsoft.com/ja-jp/azure/load-balancer/load-balancer-distribution-mode#a-namehash-based-distribution-modeaハッシュベースの分散モード](https://docs.microsoft.com/ja-jp/azure/load-balancer/load-balancer-distribution-mode#a-namehash-based-distribution-modeaハッシュベースの分散モード)


## 宛先IPアドレス変換

ロードバランサに届いたパケットの宛先IPアドレスを、ロードバランサのIPアドレスから負荷分散の対象となるサーバのIPアドレスに変換する機能。ロードバランサは、どのサーバのIPアドレスに変換するかを負荷分散の方式に応じて自動的に決定します。

| Cloud            | 実装                  |
|------------------|---------------------|
| AWS CLB(TCP/SSL) | あり                  |
| Azure LB         | あり。管理者による明示的な指定も可能。 |

Azureでは管理者が宛先IPアドレス変換の動作をカスタマイズできます。「受信NAT規則」を使うと、ロードバランサは宛先IPアドレスを特定のサーバのIPアドレスに変換します。[^21]「Floating IP」を使うと、ロードバランサは宛先IPアドレスを変換せずにそのまま負荷分散の対象となるサーバに転送します。[^22] 

[^21]: [https://docs.microsoft.com/ja-jp/azure/load-balancer/load-balancer-get-started-internet-arm-ps](https://docs.microsoft.com/ja-jp/azure/load-balancer/load-balancer-get-started-internet-arm-ps)

[^22]: [https://blogs.msdn.microsoft.com/dataplatjp/2016/08/31/azure-%E4%B8%8A%E3%81%AB-alwayson-ag-%E6%A7%8B%E6%88%90%E3%82%92%E6%A7%8B%E7%AF%89%E3%81%99%E3%82%8B%E9%9A%9B%E3%81%AE%E3%83%AA%E3%82%B9%E3%83%8A%E3%83%BC%E3%81%AB%E3%81%A4%E3%81%84%E3%81%A6/](https://blogs.msdn.microsoft.com/dataplatjp/2016/08/31/azure-%E4%B8%8A%E3%81%AB-alwayson-ag-%E6%A7%8B%E6%88%90%E3%82%92%E6%A7%8B%E7%AF%89%E3%81%99%E3%82%8B%E9%9A%9B%E3%81%AE%E3%83%AA%E3%82%B9%E3%83%8A%E3%83%BC%E3%81%AB%E3%81%A4%E3%81%84%E3%81%A6/)

## 宛先ポート番号変換

ロードバランサに届いたパケットの宛先ポート番号を、負荷分散の対象となるサーバのポート番号に変換する機能。本機能があると、ロードバランサが使うポート番号とサーバが使うポート番号を別のものにできます。

| Cloud            | 実装  |
|------------------|-----|
| AWS CLB(TCP/SSL) | あり  |
| Azure LB         | あり  |

## 送信元IPアドレス変換

クライアントからの通信をサーバに分散する際に、クライアントのIPアドレスを別のIPアドレスに変換する機能。

| Cloud            | 実装                        |
|------------------|---------------------------|
| AWS CLB(TCP/SSL) | 着信したELBのNICのIPアドレスに変換[^5] |
| Azure LB         | 変換しない[^6]                 |

[^5]: 公式ドキュメント見当たらず
[^6]: 公式ドキュメント見当たらず

## セッション維持

クライアントからの通信を同じサーバに分散し続ける機能。

| Cloud            | 実装                           |
|------------------|------------------------------|
| AWS CLB(TCP/SSL) | なし                           |
| Azure LB         | あり。負荷分散方式を2タプルまたは3タプルにする[^7] |

なお、AWS CLB(HTTP/HTTPS)とAWS ALBは、Cookieを利用したセッション維持をサポートします。[^8]ただし、AWS ALB
はロードバランサが生成するCookieを利用したセッション維持のみをサポートします。アプリケーションが生成するCookieを利用したセッション維持はサポートされていません。[^23]

[^7]: [https://docs.microsoft.com/ja-jp/azure/load-balancer/load-balancer-distribution-mode#a-namesource-ip-affinity-modeaソース-ip-アフィニティ-モード](https://docs.microsoft.com/ja-jp/azure/load-balancer/load-balancer-distribution-mode#a-namesource-ip-affinity-modeaソース-ip-アフィニティ-モード)

[^8]: [http://docs.aws.amazon.com/ja_jp/elasticloadbalancing/latest/classic/elb-sticky-sessions.html#enable-sticky-sessions-duration](http://docs.aws.amazon.com/ja_jp/elasticloadbalancing/latest/classic/elb-sticky-sessions.html#enable-sticky-sessions-duration)

[^23]: [http://docs.aws.amazon.com/ja_jp/elasticloadbalancing/latest/application/load-balancer-target-groups.html#sticky-sessions](http://docs.aws.amazon.com/ja_jp/elasticloadbalancing/latest/application/load-balancer-target-groups.html#sticky-sessions)

## ヘルスチェック

動いているサーバに通信を分散するために、負荷分散の対象となるサーバが生きているかを監視する機能。

| Cloud            | 実装                                                     |
|------------------|--------------------------------------------------------|
| AWS CLB(TCP/SSL) | ELB自身のIPアドレスを使って、負荷分散の対象となるサーバの生き死にを確認する。[^9]          |
| Azure LB         | 168.63.129.16のIPアドレスを使って、負荷分散の対象となるサーバの生き死にを確認する。[^10] |

[^9]: 公式ドキュメント見当たらず
[^10]: [https://docs.microsoft.com/ja-jp/azure/load-balancer/load-balancer-custom-probe-overview](https://docs.microsoft.com/ja-jp/azure/load-balancer/load-balancer-custom-probe-overview) |

## クライアントのアクセス先

| Cloud            | 実装                                                                          |
|------------------|-----------------------------------------------------------------------------|
| AWS CLB(TCP/SSL) | FQDN。ELBのIPアドレスは変わる可能性がある。[^11]                                       |
| Azure LB         | IPアドレス。LBをインターネットに公開する場合は、LBに設定するPublic IP AddressのFQDNでもアクセス可能。[^12] |

[^11]: [https://www.slideshare.net/AmazonWebServicesJapan/aws-black-belt-online-seminar-2016-elastic-load-balancing](https://www.slideshare.net/AmazonWebServicesJapan/aws-black-belt-online-seminar-2016-elastic-load-balancing)
[^12]: [ロードバランサのアーキテクチャいろいろ - yunazuno.log](http://yunazuno.hatenablog.com/entry/2016/02/29/090001)

## Connection Draining
負荷分散の対象となるサーバがロードバランサから手動で切り離されたときに、クライアントと切り離されたサーバ間の既存セッションを指定された時間分維持し続ける（＝強制的に切断しない）機能。この機能があると、負荷分散の対象となるサーバをメンテナンスする際にユーザ影響を小さくできる。

| Cloud            | 実装            |
|------------------|---------------|
| AWS CLB(TCP/SSL) | サポートする[^13]   |
| Azure LB         | サポートしない？[^14] |

[^13]: [http://docs.aws.amazon.com/ja_jp/elasticloadbalancing/latest/classic/config-conn-drain.html)](http://docs.aws.amazon.com/ja_jp/elasticloadbalancing/latest/classic/config-conn-drain.html)                

[^14]: [https://feedback.azure.com/forums/217313-networking/suggestions/8156781-provide-explicit-drain-stop-capabilities-for-load](https://feedback.azure.com/forums/217313-networking/suggestions/8156781-provide-explicit-drain-stop-capabilities-for-load)

## SSL終端

クライアントとのHTTPS通信を、負荷分散の対象となるサーバではなくロードバランサで処理する機能。

| Cloud            | 実装                                            |
|------------------|-----------------------------------------------|
| AWS CLB(TCP/SSL) | サポートしない。AWS CLB(HTTP/HTTPS)とALBではサポートする。[^15] |
| Azure LB         | サポートしない。Application Gatewayでサポートする。[^16]      |

[^15]: [http://docs.aws.amazon.com/ja_jp/elasticloadbalancing/latest/classic/elb-ssl-security-policy.html](http://docs.aws.amazon.com/ja_jp/elasticloadbalancing/latest/classic/elb-ssl-security-policy.html) 

[^16]: [https://docs.microsoft.com/ja-jp/azure/application-gateway/application-gateway-ssl-portal](https://docs.microsoft.com/ja-jp/azure/application-gateway/application-gateway-ssl-portal)

## ログ記録

通信ログと性能ログを記録する機能

| Cloud            | 実装                               |
|------------------|----------------------------------|
| AWS CLB(TCP/SSL) | アクセスログ[^17]、監査ログ[^19]、メトリクス[^18] |
| Azure LB         | 監査ログ、アラートイベントログ、ヘルスチェックログ[^20]   |

[^17]: http://docs.aws.amazon.com/ja_jp/elasticloadbalancing/latest/classic/access-log-collection.html(http://docs.aws.amazon.com/ja_jp/elasticloadbalancing/latest/classic/access-log-collection.html)

[^18]: [http://docs.aws.amazon.com/ja_jp/elasticloadbalancing/latest/classic/elb-cloudwatch-metrics.html#loadbalancing-metrics-clb](http://docs.aws.amazon.com/ja_jp/elasticloadbalancing/latest/classic/elb-cloudwatch-metrics.html#loadbalancing-metrics-clb)

[^19]: [http://docs.aws.amazon.com/ja_jp/elasticloadbalancing/latest/classic/ELB-API-Logs.html](http://docs.aws.amazon.com/ja_jp/elasticloadbalancing/latest/classic/ELB-API-Logs.html)

[^20]: [https://docs.microsoft.com/ja-jp/azure/load-balancer/load-balancer-monitor-log](https://docs.microsoft.com/ja-jp/azure/load-balancer/load-balancer-monitor-log)

## クライアントアドレスの通知

負荷分散の対象となるサーバに対して、クライアントのIPアドレスを通知する機能

| Cloud            | 実装                    |
|------------------|-----------------------|
| AWS CLB(TCP/SSL) | ProxyProtocolをサポート    |
| Azure LB         | そもそも送信元NATしないので、本機能は不要 |

[^22]: [http://docs.aws.amazon.com/ja_jp/elasticloadbalancing/latest/classic/enable-proxy-protocol.html](http://docs.aws.amazon.com/ja_jp/elasticloadbalancing/latest/classic/enable-proxy-protocol.html)


---
title: Active/Passive な FortiGate を Azure 上にデプロイする
author: kongou_ae
date: 2019-09-15
url: /archives/2019/09/deploy-active-passive-fortigate-on-azure
categories:
  - azure
  - fortigate
---

## はじめに

このエントリでは、Active/Passive な FortiGate を Azure 上にデプロイする方法と、切り替えたときの挙動を説明します。

## 参考ドキュメント

- https://aimless.jp/blog/archives/2019-03-21-public-cloud-and-nva/
- https://docs.fortinet.com/vm/azure/fortigate/6.2/azure-cookbook/6.2.0/632940/single-fortigate-vm-deployment
- https://docs.fortinet.com/vm/azure/fortigate/6.2/azure-cookbook/6.2.0/227656/deploying-and-configuring-active-passive-ha-between-multiple-zones

## 構築方法

### Azure リソースの構築

上記の参考ドキュメントのとおり、FortiGate はシングルゾーン上での冗長化とゾーンをまたいだ冗長化の両方をサポートしています。今回は構築が簡単なシングルゾーン版を前提とします。

デプロイ方法は簡単です。次のテンプレートを使うだけです。

https://raw.githubusercontent.com/fortinetsolutions/Azure-Templates/master/FortiGate/Active-Passive%20HA/azuredeploy.json

このテンプレートは本当によくできています。Azure 側のリソースを構築するだけでなく、CustomData を利用して、FortiOS のインターフェース設定と HA 設定も実施してくれます。テンプレートのデプロイが終わると、Azure 上のリソースだけなく FortiOS としても冗長化された状態になっています。最高。

### API 連携（Fabric connector）の設定追加

Active/Passive な HA は、切り替わり時に Azure の API と連携して次の変更を実施します。

- インターネット側の NIC についている Public IP Address を古いマスターの NIC から外して新しいマスターの NIC に付け替える
- UDR のネクストホップを古いマスターの IP アドレスから新しいマスターの IP アドレスに切り替える

この変更のために必要な設定が Fabric connector です。Fabric connector には次の2つの内容を設定します。

1. API にアクセスするための認証情報
2. 自分がマスターに切り替わったときに変更したい Azure リソースと変更後の値

1号機側のサンプルは次の通りです。1号機がマスターになったときに Active/Passive を Azure 側含めて切り替えるためには Azure に対して次の変更が必要です。そのための設定が入っていることが分かります。

- 1号機の NIC(fg-A-NIC1) に Public IP アドレス(FGTAPClusterPublicIP) をつける
- UDR のネクストホップを 10.2.0.4(1号機のプライベートIPアドレス)に変更する

```
config system sdn-connector
  edit "AZConnector"
  set type azure
  set tenant-id "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
  set subscription-id "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
  set resource-group "fortigate"
  set client-id "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
  set client-secret i7I21/mabcgbYW/K1l0zABC/6M86lAdTc312345Tps1=
  config nic
    edit "fg-A-NIC1"
      config ip
        edit "ipconfig1"
        set public-ip "FGTAPClusterPublicIP"
      next
    end
    next
  end
  config route-table
    edit "FortiGateDefaultAPRouteTable"
    config route
    edit "toDefault"
      set next-hop "10.0.2.4"
    next
  end
  next
 end
end
```

当然、2号機側の設定は違います。具体的な違いは、PIP を関連付ける NIC の名前と、UDR のネクストホップの IP アドレスです。

```
config system sdn-connector
  edit "AZConnector"
  set type azure
  set tenant-id "50f9de73-a175-426d-a0bf-baa52c8ef9e8"
  set subscription-id "76cd33dc-2d53-4bf7-a356-1558cc49f261"
  set resource-group "fortigate"
  set client-id "61d43d9f-7270-41d8-bc8f-ab7291609622"
  set client-secret i7I21/mabcgbYW/K1l0zABC/6M86lAdTc312345Tps1=
  config nic
    edit "fg-B-NIC1"
      config ip
        edit "ipconfig1"
        set public-ip "FGTAPClusterPublicIP"
      next
    end
    next
  end
  config route-table
    edit "FortiGateDefaultAPRouteTable"
    config route
    edit "toDefault"
      set next-hop "10.0.2.5"
    next
  end
  next
 end
end
```

なお、設定した値が Azure 上の値と異なる場合、いざ切り替えが発生した場合にリソースが見つからず切り替えが失敗します。気を付けましょう。

## 切り替えテスト

実際に切り替えた際の挙動を確認します。今回は2号機がマスターな状態で2号機を`Stop-AzVM`しました。

切り替え中の挙動をデバックログで確認できます。

```
fg-A # diag debug application azd -1
fg-A # diag debug enable
```

スレーブである1号機がマスターである2号機の停止を検出すると、1号機は切り替えの処理を始めます。

まずは設定されているサービスプリンシパルを利用して API をたたくためのトークンを取得します。

```
fg-A # HA event
Become HA master mode 2
azd sdn connector  getting token
token size:1158
token expire on:1568438916
resourcegroup:fortigate, sub:76cd33dc-2d53-4bf7-a356-1558cc49f261
```

次に、付け替える Public IP Address の存在を確認したうえで、停止した2号機の NIC から Public IP Address を外すリクエストを投げます。そしてリクエストが完了するまで待ちます。

```

get pubip FGTAPClusterPublicIP
found pub ip FGTAPClusterPublicIP
id /subscriptions/76cd33dc-2d53-4bf7-a356-1558cc49f261/resourceGroups/fortigate/providers/Microsoft.Network/networkInterfaces/fg-B-NIC1/ipConfigurations/ipconfig1
remove public ip in nic fg-B-NIC1
result:200
remove public ip FGTAPClusterPublicIP in ipconfig ipconfig1
updating nic:fg-B-NIC1


fg-A # result:200
waiting for operation:https://management.azure.com/subscriptions/76cd33dc-2d53-4bf7-a356-1558cc49f261/providers/Microsoft.Network/locations/japaneast/operations/fe64d145-d79e-4812-b06c-9952573752ea?api-version=2018-06-01
result:200
{

  "status": "InProgress"

}
status:InProgress
```

リクエストの完了を確認次第、外した Public IP Address を1号機の NIC に関連付けるリクエストを投げます。そしてリクエストの完了を待ちます。

```
fg-A # waiting for operation:https://management.azure.com/subscriptions/76cd33dc-2d53-4bf7-a356-1558cc49f261/providers/Microsoft.Network/locations/japaneast/operations/fe64d145-d79e-4812-b06c-9952573752ea?api-version=2018-06-01
result:200
{

  "status": "Succeeded"

}
status:Succeeded
end wait:0
remove is done 0
add public ip in nic fg-A-NIC1
result:200
add public ip FGTAPClusterPublicIP in ipconfig ipconfig1
updating nic:fg-A-NIC1
result:200
waiting for operation:https://management.azure.com/subscriptions/76cd33dc-2d53-4bf7-a356-1558cc49f261/providers/Microsoft.Network/locations/japaneast/operations/323415fc-0986-4d38-b48f-bb7c08538c69?api-version=2018-06-01
result:200
{

  "status": "Succeeded"

}
status:Succeeded
end wait:0
```

最後に UDR のネクストホップを1号機の IP アドレスに書き換えます。

```
get route table FGTDefaultAPRouteTable
result:200
matching route:toDefault:toDefault
set route toDefault nexthop 10.0.2.4
updating route table:FGTDefaultAPRouteTable
result:200
waiting for operation:https://management.azure.com/subscriptions/76cd33dc-2d53-4bf7-a356-1558cc49f261/providers/Microsoft.Network/locations/japaneast/operations/5f762608-54b2-4726-8447-01871a496b7a?api-version=2018-06-01
result:200
{

  "status": "Succeeded"

}
status:Succeeded
end wait:0
nexthop and add is done
```

切り替えにかかった時間は約1分半です。

```
System time: Fri Sep 13 21:28:18 2019 # 切り替え開始直前のシステム時刻
System time: Fri Sep 13 21:29:59 2019 # 切り替え完了直後のシステム時刻
```

## まとめ

Active/Passive な FortiGate を Azure 上にデプロイする方法と、切り替え時の挙動を説明しました。Virtual Machine を作るだけで FortiOS側も設定してくれる実装が本当にすばらしい。以前挑戦した PaloAlto では、NIC の追加や PanOS 上の IP アドレス設定などの冗長化に必要な設定を手作業で実施しなければなりませんでした。FortiGate を使えばこの手間から解放されます。

https://aimless.jp/blog/archives/2019/03/deploy-paloalto-on-azure-as-active-passive/

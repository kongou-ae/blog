---
title: Azure上のリソースの設定をPowerShellでテストする
author: kongou_ae

date: 2018-01-24
url: /archives/2018-01-24-azurePester
categories:
  - azure
---

Azure上のリソースの設定をテストするPowerShellモジュール「[azurePester](https://github.com/kongou-ae/azurePester)」を作りました。[azurePester](https://github.com/kongou-ae/azurePester)は次のような課題を解決します。

- Azure上のリソースがあるべき設定かどうかを手で確認するのがしんどい。リソースが複数個あると地獄
- ServerSpecみたいな分かりやすい見た目でテスト結果を表示したい

Virtual Machineの設定をテストする場合は次のように書きます。

```powershell
$vms = Get-AzureRmVM
$vm = $vms[0]
$vm | Test-AzRmVm -Name testvm `
            -VmSize Standard_B1s `
            -Location westeurope `
            -OsType Windows `
            -PrivateIpAddress 10.2.3.4 `
            -AdminUsername aimless `
            -DataDisks_Count 0
            -RelatedNsgName testvm-nsg `
            -DnsServers @("1.1.1.1", "2.2.2.1")
```

テスト結果はPesterのフォーマットで表示されます。

![](https://github.com/kongou-ae/azurePester/raw/master/result.PNG)

## 動作

その名のとおり、[azurePester](https://github.com/kongou-ae/azurePester)は[Pester](https://github.com/pester/Pester)を使ってリソースがあるべき設定かどうかをテストします。`Test-AzRmVm `で仮想マシン名をテストすると、内部では次のようなコードが動いています。Pesterを利用して、受け取ったリソース内の設定（$vm）とユーザが引数に入力したあるべき姿（$name）を比較しています。

```powershell
  Describe "Checking Virtual Machine ($TargetVmName)" {
    if ($name) {
      it "VM name $Method $name" {
        switch ($Method) {
          "Should Be" { $vm.Name | Should Be $name }
          "Should BeExactly" { $vm.Name | Should BeExactly $name }
          "Should Match" { $vm.Name | Should Match $name } 
        }
      }
    }
  }
```

## インストール方法

[README](https://github.com/kongou-ae/azurePester/blob/master/README.md)に書いてあるとおりです。[azurePester](https://github.com/kongou-ae/azurePester)はPowerShellモジュールです。インポートすれば`Test-AzRmxxx`コマンドが使えるようになります。環境によっては[Pester](https://github.com/pester/Pester)をインポートする必要があります。

## 対応するリソース

現時点で次の3つのリソースをサポートします。サポートするリソースと確認できる設定項目は次のとおりです。

- Virtual Machine
    - Name
    - VmSize
    - Location
    - OsType
    - PrivateIpAddress
    - AdminUsername
    - DataDisks_Count
    - RelatedNsgName
    - DnsServers
- Virtual Network
    - Name
    - Location
    - AddressPrefixes
    - DnsServers
    - Storage Account
- StorageAccountName
    - Location
    - SkuName
    - EnableHttpsTrafficOnly

## 今後

実際に仕事で使ってみて、いい感じであれば対応リソースや設定項目を増やしていきます。現時点で「あったら便利だな」と思っているのは次のリソースです。

- Virtual MachineにAzure VM Backupが設定されているか
- NSGにNSG Flow Logsが設定されているか

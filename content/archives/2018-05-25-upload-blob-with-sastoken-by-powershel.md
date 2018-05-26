---
title: BLOB StorageへのアップロードとSAS tokenの生成をPowerShellで自動化する
author: kongou_ae

date: 2018-05-25
url: /archives/2018-05-25-upload-blob-with-sastoken-by-powershel
categories:
  - azure
  - azurestack
---

## やったこと

ストレージアカウント名とローカルのディレクトリパスを渡すと、ディレクトリ内のファイルをストレージアカウントにアップロードしてSAS tokenつきのURLを返すPowerShellスクリプトを書いた。
 
 [kongou-ae/Upload-BlobContentsWithSastoken.ps1](https://github.com/kongou-ae/Upload-BlobContentsWithSastoken.ps1)
 
```
PS C:\Users\hogehoge\Documents\20180526> .\Upload-BlobContentsWithSastoken.ps1 -storageAccountName storageAccountName -targetDir  C:\Users\hogehoge\Documents\20180526
AzureRM isn't installed. Start importing AzureRM
The following files was uploaded to your blob.
https://storageAccountName.blob.core.windows.net/2018-0526-2110/aaa.txt?sv=2017-04-17&sr=c&sig=TZsULmcuvJ8%2BLjWWwJXt36S5%2FtKhr0ydhKHFwKVsYtI%3D&spr=https&se=2018-05-29T12%3A11%3A00Z&sp=r
```

## なぜ？

BLOB Storageを使ってファイルを共有したいときに、Azure Portalやストレージエクスプローラで、「ファイルのアップロードとSAS Tokenの発行、SAS tokenつきURLの確認」を行うのが面倒くさいからです。

[がんばれAzure Stack・・・](https://speakerdeck.com/kongou_ae/ganbareazure-stack)でぼやいたとおり、Azure StackのトラブルをMicrosoftのサポート担当に解析してもらうためには、サポート担当にログを送る必要があります。このログファイルは数ギガバイトになります。容量が大きすぎるので、サポートチケットを起票する際にログファイルをAzureポータルで添付できません。

{{<img src="./../../images/2018-05-25-001.png">}} 

そのため、Microsoftのサポート担当は、チケットオープン後の返信メールで「ログをここにアップロードして」と連絡をしてきます。ポータルの仕組み上仕方がありませんが、ログがサポート担当の手元に届くまで不要な待ち時間と不要なやりとりが発生します。いかに早くサポート担当にログを渡せるかが勝負なので、この待ち時間がもったいない。

そこで、ログファイルを自分のBLOB Storageにログファイルをアップロードしたうえで、SAS tokenつきのURLをサポートチケットに記載するようにしました。この方法であれば、初回問い合わせ時にサポート担当にログファイルを渡せます。しかし、Azure PortalやストレージエクスプローラでファイルのアップロードとSAS Tokenの発行、SAS tokenつきURLの確認を行うと、まー面倒くさい。この面倒くささから解放されるためにスクリプトを書きました。

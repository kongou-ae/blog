
---
title: Hugo なブログを Netlify から Azure App Service Static Web Apps に移行する
author: kongou_ae
date: 2020-05-26
url: /archives/2020/05/migrate-hugo-blog-from-netlify-to-static-web-apps
categories:
  - azure
---

## はじめに

Microsoft Build 2020 にて App Service Static Web Apps がパブリックプレビューになりました。

[Introducing App Service Static Web Apps](https://techcommunity.microsoft.com/t5/azure-app-service/introducing-app-service-static-web-apps/ba-p/1394451)

Static Web Apps が Netlify で利用している次の機能をサポートしていそうだったので、「物は試し」「本番環境からこそ学びがある」ということで Hugo な本ブログを Netlify から Static Web Apps に移行してみました。

- カスタムドメイン
- カスタムドメインの HTTPS 通信
- GitHub からの自動ビルド・デプロイ
- Pull Request を独自環境にデプロイ

## Apex ドメインをやめる

現時点での Static Web Apps は Apex ドメインをサポートしていません。Cloudflare の DNS サーバを使えば Apex ドメインと Static Web Apps を両立できるようなのですが、aimless.jp の権威 DNS を Cloudflare に切り替えるのは嫌なので、ブログのドメインを aimless.jp から blog.aimless.jp に移行しました。

> プレビュー期間中はルート ドメインのサポートは利用できませんが、Static Web App を使用してルート ドメインのサポートを構成する方法の詳細については、Azure Static Web Apps でのルート ドメインの構成に関するブログ投稿で確認できます。

引用：[ルート ドメインを構成する](https://docs.microsoft.com/ja-jp/azure/static-web-apps/custom-domain#configure-a-root-domain)

また、aimless.jp の A レコードが向いている Netlify に次の内容の _redirects を配置して、ルートに来たアクセスと個別の URL に来たアクセスの両方が blog.aimless.jp にリダイレクトされるようにしました。

```txt
/        https://blog.aimless.jp/  301!
/blog/*  https://blog.aimless.jp/:splat  301!
```

## Static Web Apps の構築

ポータルからポチポチして Static Web Apps をデプロイします。デプロイ中にのみ、Static Web Apps と紐づける GitHub のリポジトリを選択できます。

{{< figure src="/images/2020/2020-0525-001.jpg" title="Static Web Apps と GitHub リポジトリの紐づけ" >}}

紐づけの次は、Github Actions のビルド部分で指定するフォルダの情報を入力します。

{{< figure src="/images/2020/2020-0525-002.jpg" title="ビルドとデプロイ周りの設定" >}}

このままデプロイすると、紐づけた GitHub リポジトリに Github Actions 用の設定ファイルが生成されます。

{{< figure src="/images/2020/2020-0525-003.jpg" title="GitHub ation 用の設定ファイル" >}}

そして、先ほどポータルに入力したビルド用のフォルダの情報が このファイルの中の Azure/static-web-apps-deploy@v0.0.1-preview の app_location と api_location、app_artifact_location に挿入されます。

```txt
  build_and_deploy_job:
    if: github.event_name == 'push' || (github.event_name == 'pull_request' && github.event.action != 'closed')
    runs-on: ubuntu-latest
    name: Build and Deploy Job
    steps:
    - uses: actions/checkout@v1
    - name: Build And Deploy
      id: builddeploy
      uses: Azure/static-web-apps-deploy@v0.0.1-preview
      with:
        azure_static_web_apps_api_token: ${{ secrets.AZURE_STATIC_WEB_APPS_API_TOKEN_PROUD_PEBBLE_043E3AE1E }}
        repo_token: ${{ secrets.GITHUB_TOKEN }} # Used for Github integrations (i.e. PR comments)
        action: 'upload'
        ###### Repository/Build Configurations - These values can be configured to match you app requirements. ######
        app_location: '/' # App source code path
        api_location: 'api' # Api source code path - optional
        app_artifact_location: '' # Built app content directory - optional
        ###### End of Repository/Build Configurations ######
```

## Hugo 用のビルド設定

次のドキュメントに記載されている通り、Github Actions 用の設定ファイルを Hugo 仕様に変更します。

[Tutorial: Publish a Hugo site to Azure Static Web Apps Preview](https://docs.microsoft.com/en-us/azure/static-web-apps/publish-hugo)

次に、必要に応じてビルドを実行する hugo コマンドを変更します。私の環境では hugo コマンドを実行する際にテーマの指定と RSS フィードのリネームを実施しているので、次のようにGitHub Actions 用の設定ファイルに記載されている Hugo コマンドを変更しました。

```txt
    - name: Setup Hugo
      uses: peaceiris/actions-hugo@v2.4.8
      with:
        hugo-version: "latest"

    - name: Build
      run: hugo --buildFuture -t hugo-primer-fork -d public && mv public/feed.xml public/feed
```

最後に app_location に Hugo がビルド結果を出力するフォルダを指定します。私の環境では public フォルダにビルド結果を出力するようになっているので、Github Actions 用の設定ファイルを次のように変更しました。

```txt
###### Repository/Build Configurations - These values can be configured to match you app requirements. ######
app_location: 'public' # App source code path
###### End of Repository/Build Configurations ######
```

app_location フォルダにフレームワークを判定するためのファイルが入っていない場合、Azure/static-web-apps-deploy@v0.0.1-preview はビルドをあきらめて app_location フォルダを ZIP で固めて Static Web Apps にアップロードしてくれます。であれば、Azure/static-web-apps-deploy@v0.0.1-preview にはアップロードの処理だけを任せて、ビルドの処理は使い慣れた方法で個別に GitHub Actions に定義する形が良さそうに思えます。

```txt
---End of Oryx build logs---
Oryx was unable to determine the build steps. Continuing assuming the assets in this folder are already built. If this is an unexpected behavior please contact support.
Finished building app with Oryx
Zipping App Artifacts
Done Zipping App Artifacts
Either no Api directory was specified, or the specified directory was not found. Azure Functions will not be created.
Uploading build artifacts.
Finished Upload. Polling on deployment.
Status: InProgress. Time: 0.2646038(s)
Status: InProgress. Time: 16.3076704(s)
Status: InProgress. Time: 31.5421444(s)
Status: Succeeded. Time: 46.6367095(s)
Deployment Complete :)
Visit your site at: https://proud-pebble-043e3ae1e.azurestaticapps.net
```

## カスタムドメインの設定

カスタムドメインの所有者確認のために、Static Web Apps は 追加するカスタムドメインの CNAME が Static Web Apps に向いているかどうかを検証します。カスタムドメインを追加する前に ドメインの CNAME を Static Web Apps に向けます。CNANE の登録さえ完了すれば、あとはポータルからポチポチするだけでカスタムドメインを追加できます。

{{< figure src="/images/2020/2020-0525-004.jpg" title="カスタムドメインの設定画面" >}}

なお、現時点の Static Web Apps は、Front Door や Web Apps がサポートしている 「verify サブドメインを利用した所有者確認」には対応していなそうでした。この機能があれば運用中のドメイン名をダウンタイムを伴わずに Static Web Apps に移行できるので、一般公開のタイミングまでにサポートされると嬉しいです。

- [Azure App Service へのアクティブな DNS 名の移行](https://docs.microsoft.com/ja-jp/azure/app-service/manage-custom-dns-migrate-domain#remap-the-active-dns-name)
- [チュートリアル:Front Door にカスタム ドメインを追加する](https://docs.microsoft.com/ja-jp/azure/frontdoor/front-door-custom-domain#map-the-temporary-afdverify-subdomain)

## 動作確認

次の dig の結果のとおり、blog.aimless.jp を Netlify から Static Web Apps 上に移行できました。Static Web Apps というリソースは West US2 にあるのですが、実際のコンテンツは Traffic Manager で負荷分散されて EastAsia（香港）の App Service にあるようです。体感でのレスポンスは移行前と移行後で差がありません。快適。

```txt
blog.aimless.jp.	60	IN	CNAME	proud-pebble-043e3ae1e.azurestaticapps.net.
proud-pebble-043e3ae1e.azurestaticapps.net. 3600 IN CNAME azurestaticapps.trafficmanager.net.
azurestaticapps.trafficmanager.net. 60 IN CNAME	msha-hk1-0.staticsites-prod-eastasia.p.azurewebsites.net.
msha-hk1-0.staticsites-prod-eastasia.p.azurewebsites.net. 30 IN	CNAME waws-prod-hk1-0a7ad652.sip.p.azurewebsites.windows.net.
waws-prod-hk1-0a7ad652.sip.p.azurewebsites.windows.net.	1800 IN	CNAME waws-prod-hk1-0a7ad652.cloudapp.net.
waws-prod-hk1-0a7ad652.cloudapp.net. 10	IN A	52.175.36.249
```

また、紐づいている GitHub のリポジトリに Pull request を作ると、そのブランチが別環境に自動デプロイされました。本番環境にマージする前に動作確認できます。とても良い。

{{< figure src="/images/2020/2020-0525-005.jpg" title="GitHub ation 用の設定ファイル" >}}

実際に使ってみて、Static Web Apps の良さを再確認しました。今後は、Blob Storage の Static web site では要件を満たさないような場合に Static Web Apps を積極的に活用していきます。

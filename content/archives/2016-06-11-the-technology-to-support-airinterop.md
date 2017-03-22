---
title: airinterop.jpを支える技術
author: kongou_ae
date: 2016-06-11
url: /archives/2016-06-11-the-technology-to-support-airinterop
categories:
  - aws
---

## はじめに

2年前から、「airinterop.jp」という非公認ネタサイトを作っています。簡単なウェブサイトくらい気軽に建てられるくらいのスキルは欲しいので。

例年は、適当にHTMLとCSSを作りVPS上のApacheで公開するだけでした。ですが、今年のairinterop.jpは、製作者のスキル向上に伴い、新しい取り組みを行いました。来年のためにもやったことをメモしておきます

## WEBページ公開

今年のairinterop.jpは、S3の静的ウェブサイトホスティングを利用しました。

去年までのairInterop.jpはConoHaで稼働していました。ですが、経費節約を目的にConoHaを解約したため、Apacheやnginxに頼ることができません。現時点で常時稼働しているVPSは、リモート艦これ用のさくらのVPS for Windows Serverだけです。ですが、このVPSは、艦これのせいでCPUが常時90%を超えているため、サービスを公開するのに不向きです。

![](https://aimless.jp/blog/images/2016-06-11-01.png)

ネタサイトのために再びVPSを借りるのは馬鹿らしいので、S3の静的ウェブサイトホスティングでリリースしました

## 参加者カウンタ

「airinterop.jpの参加者が可視化されたら面白くね？」という思いつきから、Doorkeeperなどのイベント登録サイトのように、参加者のTwitterアイコンを表示するようにしました。公式サイトも来場者数を公表していますし。

![](https://aimless.jp/blog/images/2016-06-11-02.png)

静的ウェブサイトホスティングにしてしまったので、サーバ側でTwitterアイコンを動的に描画することはできません。そこで、API Gateway＋mithril.jsを使って、クライアント側で動的に描画することにしました。

![](https://aimless.jp/blog/images/2016-06-11-04.png)

API Gatewayが返すデータはMockを使いました。DynamoDBやLambdaからデータを返すよりも安上がりで実装も簡単です。Lambdaを利用して#airinteropのハッシュタグをツイートした人のデータを作成し、そのデータを使ってAPI GatewayのMock を更新しました。

初めてaws-sdkでAPI Gatewayを操作したので、updateIntegrationResponseしたあとにcreateDeploymentすることに気が付くのに時間がかかりました。その結果、Mockのデータは更新されているのにAPI Gatewayが返すデータが古いままという事象に数時間悩みました。


```javascript
function(body,callback){
  var apigateway = new AWS.APIGateway();
  var params = {
    httpMethod: 'GET', /* required */
    resourceId: 'xxxxxxxxxx', /* required */
    restApiId: 'xxxxxxxxxx', /* required */
    statusCode: '200', /* required */
    patchOperations: [
      {
        op: 'replace',
        path: '/responseTemplates/application~1json;charset=UTF-8',
        value: JSON.stringify(body)
      }
    ]
  };
  apigateway.updateIntegrationResponse(params, function(err, data) {
    var params = {
      restApiId: 'xxxxxxxxxx', /* required */
      stageName: 'prod', /* required */
    }
    apigateway.createDeployment(params, function(err, data) {
      if (err) {
        console.log(err, err.stack);
      } else {
        callback()  
      }
    });
  });
});
```

mithril.jsは以下のような簡単なコードです。API Gatewayから取得したjsonをデータバインディング用の配列に格納し格納し、Viewでその配列を描画します。なお、いまだにControllerとView Model、Modelの使い分けがわかりません。

```javascript
var register = {}

register.vm = {
    init: function(){

        register.vm.listAry = m.prop([])
        m.request({
            Method:"GET",
            url:"https://xxxxxxxxxx.execute-api.ap-northeast-1.amazonaws.com/prod",
        }).then(function(responce){
            for (var i = 0; i< responce.length; i++){
                register.vm.listAry().push(responce[i])
            }
        });
    }        
};

register.controller = function () {
    register.vm.init()
}

register.view = function(){
    return [
        m("h2",register.vm.listAry().length + '人の参加者'),
        register.vm.listAry().map(function(data){
            return [
                m("div",{class:"resister-icon"},[
                    m("img",{src:data.profile_image_url})
                ])
            ]
        })        
    ]
}

m.mount(document.getElementById("twit-register"), {
  controller: register.controller,
  view: register.view
});
```

参加者の情報は自動で定期更新されるべきですので、Cloudwatch Eventsを使って、MOCKのデータ更新用Lambdaを定期発火しました。lambdaの定期実行は、Lambda側で設定することもできますが、Cloudwatch Eventsを使ったほうがcrontabのように一覧性が高くなるので好きです。

## #airinteopのツイート分析

会期中、本家のBest of show awardsのようなことをやりたくなりました。そこで、Twitter APを使って#airinteropのツイートを収集し、最もリツイート数の多いツイートを、勝手にBest of Airinterop Awardとして表彰しました。

![](https://aimless.jp/blog/images/2016-06-11-03.png)

手作業で集計するのは非常に大変なので、node.jsとtwitを使って集計スクリプトを作りこみました。とりあえず集計優先で動くコードを書きましたが、next_resultsがなくなるまで検索を続ける処理について、もう少し良いアルゴリズムがありそうな気がします。

以下のスクリプトを動かすと、Retweet数トップ5のツイートを埋め込むためのHTMLコード
を取得することができます。

```javascript
var Twit = require('twit');
var async = require('async');

var T = new Twit({
});

var loop = 20
var loopAry = []
for (var k = 0; k<loop; k++){
  loopAry.push(k)
}

var regex = new RegExp(/max_id=(.+)&q=/)
var max_id = ""
var body = []
var param = {
  q: '#airinterop',
  count:100
}

async.eachSeries(loopAry,
  function(item,callback){  
    if (max_id != ""){
      param.max_id = max_id
    }

    T.get('search/tweets', param, function(err, data){
      var statuses = data['statuses'];
      for (var i = 0; i < statuses.length ; i++) {
        // retweetは除く
        if(!statuses[i].retweeted_status){
          var obj = {};
          obj.created_at = statuses[i].created_at;
          obj.screen_name = statuses[i].user.screen_name
          obj.id_str = statuses[i].id_str
          obj.retweet_count = statuses[i].retweet_count;
          obj.text = statuses[i].text;
          body.push(obj)                        
        }
      };
      if (data.search_metadata.next_results){
        max_id = data.search_metadata.next_results.match(regex)[1]          
        callback();
      } else {
        var fakeErr = new Error();
        fakeErr.break = true;
        return callback(fakeErr);
      }
    })    
  },
  function(err){
    body.sort(function(a,b){
      if(a.retweet_count < b.retweet_count ) return 1;
        if(a.retweet_count > b.retweet_count ) return -1;
        return 0
    })

    var awards = []
    for (var j = 0; j < 5;j++){
      awards.push(body[j])
    }

    var paramOembed ={}

    async.eachSeries(awards,function(item,callback){
      paramOembed = {
        id:item.id_str
      }

      T.get('statuses/oembed', paramOembed, function(err, data){
        console.log(data)
        callback()
      })
    })
  }
)
```

## 来年への意気込み

来年は何をしましょうか。やりきってしまった感があります。公式サイトを眺めてもネタが思いつきませんので、独自路線に進むしかありません。BOTが流行っているので、えあーいんたろっぷん的な、皆様がつぶやいた面白展示をご案内するBOTを作ってみたいですね。

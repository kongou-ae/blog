---
title: RedPenで「開いた（平仮名）のほうが読みやすくなる表現一覧」をチェックする
author: kongou_ae
layout: post
date: 2016-02-09
url: /blog/archives/2016-02-09-check-the-readable-expression-by-redpen
categories:
  - redpen
---

RedPenのJavaScript拡張を利用して、[プロの編集が教える「開いた（平仮名）のほうが読みやすくなる表現一覧」が超勉強になると話題](http://www.danshihack.com/2015/06/04/junp/twitter-editter-kana.html)に乗っている修正事項をチェックしてみました。

## Javascript拡張

表現一覧から、日常で使ってしまいそうな表現だけをチェックするようにします。

```
$ cat js/easyReadCheck.js
function validateSentence(sentence) {

  var checkKeywordObj = {
    '更に' : 'さらに',
    '殆ど' : 'ほとんど',
    '下さい' : 'ください',
    '何時か' : 'いつか',
    '事' : 'こと',
    '何時か' : 'いつか',
    '何処か' : 'どこか',
    '何故か' : 'なぜか',
    '後で' : 'あとで',
    '出来るだけ' : 'できるだけ',
    'ひと通り' : 'ひととおり',
    '丁度' : 'ちょうど',
    '時間が経つ' : '時間がたつ',
    '何でも' : 'なんでも',
  }

  // 各センテンスに対して、checkKeywordObj分処理を実施
  for (var i = 0; i < Object.keys(checkKeywordObj).length; i++) {
    // キーワードを正規表現にセット
    var regex = new RegExp(Object.keys(checkKeywordObj)[i])
    // もしセンテンスの文章がcheckKeywordObjにマッチしたら
    if ( sentence.content.match(regex) ){
      // そのセンテンスが自然言語処理された結果を総当たり
      for (var j = 0; j < sentence.tokens.length; j++) {
        // 自然言語解析の結果とキーワードが一致したらエラーメッセージを出力
        if ( sentence.tokens[j].surface == Object.keys(checkKeywordObj)[i] ){
          addError('「' + sentence.tokens[j].surface + '」を「' + checkKeywordObj[Object.keys(checkKeywordObj)[i]] + '」に修正してください', sentence);            
        }
      }
    }
  }
}
```

## テストしてみる

以下の文章をテストしてみます。

```
ごはんの事である。何時かご飯を食べて下さい。

あなたはご飯を食べる事が出来ます。更に、ラーメンを食べることもできます。

事件は会議室で起きてるんじゃない。現場で起きているんだ。
```

ちゃんとエラーになりました。ブログをデプロイしているCircleCIでも使おう。

```
[2016-02-09 01:05:48.540][INFO ] cc.redpen.Main - Configuration file: /home/aimless/study/document/redpen/redpen-distribution-1.4.1/conf/blog.xml
[2016-02-09 01:05:48.549][INFO ] cc.redpen.ConfigurationLoader - Loading config from specified config file: "/home/aimless/study/document/redpen/redpen-distribution-1.4.1/conf/blog.xml"
[2016-02-09 01:05:48.562][INFO ] cc.redpen.ConfigurationLoader - Succeeded to load configuration file
[2016-02-09 01:05:48.563][INFO ] cc.redpen.ConfigurationLoader - Language is set to "ja"
[2016-02-09 01:05:48.563][WARN ] cc.redpen.ConfigurationLoader - No type configuration...
[2016-02-09 01:05:48.564][INFO ] cc.redpen.ConfigurationLoader - No "symbols" block found in the configuration
[2016-02-09 01:05:48.637][INFO ] cc.redpen.config.SymbolTable - "ja" is specified.
[2016-02-09 01:05:48.638][INFO ] cc.redpen.config.SymbolTable - "normal" type is specified
[2016-02-09 01:05:49.178][INFO ] cc.redpen.parser.SentenceExtractor - "[。, ？, ！]" are added as a end of sentence characters
[2016-02-09 01:05:49.178][INFO ] cc.redpen.parser.SentenceExtractor - "[’, ”]" are added as a right quotation characters
[2016-02-09 01:05:49.193][INFO ] cc.redpen.validator.Validator - max_num is set to 1500
[2016-02-09 01:05:49.195][INFO ] cc.redpen.validator.Validator - max_num is not set. Use default value of 5
[2016-02-09 01:05:49.198][INFO ] cc.redpen.validator.JavaScriptValidator - JavaScript validators directory: /home/aimless/study/document/redpen/redpen-distribution-1.4.1/js
test2.md:1: ValidationError[ParagraphNumber], The number of paragraphs exceeds the maximum of 7. at line: 実行
test2.md:12: ValidationError[JavaScript], [spellCheck.js] Fortigateはスペルミスの可能性があります at line: Fortigate
test2.md:14: ValidationError[JavaScript], [spellCheck.js] Javascriptはスペルミスの可能性があります at line: Javascript
test2.md:16: ValidationError[JavaScript], [easyReadCheck.js] 「事」を「こと」に修正してください at line: ごはんの事である。
test2.md:16: ValidationError[JavaScript], [easyReadCheck.js] 「下さい」を「ください」に修正してください at line: 何時かご飯を食べて下さい。
test2.md:18: ValidationError[JavaScript], [easyReadCheck.js] 「事」を「こと」に修正してください at line: あなたはご飯を食べる事が出来ます。
test2.md:18: ValidationError[JavaScript], [easyReadCheck.js] 「更に」を「さらに」に修正してください at line: 更に、ラーメンを食べることもできます。

[2016-02-09 01:05:50.390][ERROR] cc.redpen.Main - The number of errors "7" is larger than specified (limit is "1").
```

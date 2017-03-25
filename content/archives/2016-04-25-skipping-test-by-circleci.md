---
title: CircleCIのテストをスキップする
author: kongou_ae
date: 2016-04-25
url: /archives/2016-04-25-skipping-test-by-circleci
categories:
  - redpen
---

## テストをスキップしたい時もある

下図のようなデプロイメントプロセスでブログを書いています。CircleCIを中心としたプロセスで、それなりに便利なのですが、ブログを公開するためにはRedPenのテストに合格しなければなりません。

{{<img src="http://aimless.jp/blog/images/2016-04-25-001.png">}}

RedPenのJavaScript拡張を利用したスペルチェックのロジックがイマイチなのか、前回のエントリ作成時に「Email」を「Gmail」や「Emacs」のスペルミスと判定する悲劇が起きました。

```
2016-04-18-sending-zabbix-alert-mail-by-gmail.md:17: ValidationError[JavaScript], [spellCheck.js] Emailはスペルミスの可能性があります。Emacsではありませんか？ at line: 管理＞メディアタイプ＞Emailから以下の通り設定します。
2016-04-18-sending-zabbix-alert-mail-by-gmail.md:17: ValidationError[JavaScript], [spellCheck.js] Emailはスペルミスの可能性があります。Gmailではありませんか？ at line: 管理＞メディアタイプ＞Emailから以下の通り設定します。

[2016-04-18 23:50:47.809][ERROR] cc.redpen.Main - The number of errors "2" is larger than specified (limit is "1").

bash ./test-redpen.sh returned exit code 1
```

本来はテストを直すべきなのですが、「テストをスキップしたいことがあるだろう」ということで、任意のコミットについてCircleCIでのテストをスキップする仕組みを実装しました。

## CircleCI標準のスキップ機能

CircleCIに標準実装されている機能は`[skip ci]`です。コミットログに`[skip ci]`を含めるとCircleCIによる処理が行われません。

私の場合、③テストだけをスキップしたいので、`[skip ci]`はやりすぎです。CircleCIによる処理が行われない場合、HUGOによるビルトやGitHub Pagesへの公開がなされないためです。

## 実装

そこでテスト実行のスクリプトに、コミットメッセージに応じた条件分岐を追加することにしました。

直近のコミットメッセージは`git log -n 1 --oneline --pretty=format:"%s"`で取得できます。

```
PS C:\Hugo\aimless.jp> git log -n 1 --oneline
bbe9a63 add image
PS C:\Hugo\aimless.jp> git log -n 1 --oneline --pretty=format:"%s"
add image
```

このコマンドの結果を利用してテスト実行のスクリプトを分岐させることで、コミットメッセージに応じてテストがスキップされるようにします。テスト実行のスクリプトを以下のようにすると、コミットメッセージに`[skip test]`が含まれている場合、RedPenによるテストが実行されません。

```
#!/bin/sh
mv redpen/blog.xml redpen-*/conf
mv redpen/*.js redpen-*/js


filename=`git diff HEAD^ HEAD --name-only`

commitMassage=`git log -n 1 --oneline --pretty=format:"%s"`

if [[ $filename =~ .*\.md$ ]] ;then
    if [[ "$commitMassage" =~ \["skip test"\] ]]; then
        echo "redpen test is skipped."
    else
        echo "start to test $filename...."
        redpen-*/bin/redpen -c redpen-*/conf/blog.xml -f markdown $filename
    fi
else
    echo "$filename is not markdown. Redpen test is skipped."
fi
```

## 動作確認

コミットメッセージを「update」とすると、CircleCIによってRedPenのテストが実行されます。ひらがなにしたほうが読みやすい表現に関するエラーがでています。

{{<img src="http://aimless.jp/blog/images/2016-04-25-002.png">}}

コミットメッセージを「update [skip test]」とすると、CircleCIによるRedPenのテストは実行されません。そのかわりに、スクリプトで設定した`redpen test is skipped.`が表示されます。

{{<img src="http://aimless.jp/blog/images/2016-04-25-003.png">}}

## まとめ

任意のコミットメッセージによって、CircleCIが実行するテスト用スクリプトを分岐させてみました。CIツールが実行する処理を、個々のコマンドを実行する形ではなく、個々のコマンドをまとめたスクリプトを実行する形にすると、コミットメッセージに応じてCIツールのテストの処理を分岐させることができます。これはテストに限らず、いろいろなシーンで活用できそうです。

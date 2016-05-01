﻿function validateSentence(sentence) {

  var levenshteinDistance = function(a, b) {
    var matrix = new Array(a.length + 1);
    for (var i = 0; i < a.length + 1; i++) {
      matrix[i] = new Array(b.length + 1);
    }

    for (var i = 0; i < a.length + 1; i++) {
      matrix[i][0] = i;
    }

    for (var j = 0; j < b.length + 1; j++) {
      matrix[0][j] = j;
    }

    for (var i = 1; i < a.length + 1; i++) {
      for (var j = 1; j < b.length + 1; j++) {
        var x = a[i - 1] == b[j -1] ? 0 : 1;
        matrix[i][j] = Math.min(
          matrix[i - 1][j] + 1,
          matrix[i][j - 1] + 1,
          matrix[i - 1][j- 1] + x
        );
      }
    }

    return matrix[a.length][b.length];
  }

  var checkKeywordArray = [
  "Cookie",
  "WebSocket",
  "Web",
  "O/Rマッ",
  "O/Rマッパ",
  "アイデア",
  "アスタリスク",
  "アーキテクチャ",
  "アクティビティ",
  "アダプタ",
  "アノテーション",
  "アプレット",
  "アプリケーション",
  "アニメータ",
  "アンダースコア",
  "インストーラ",
  "インスパイア",
  "インタフェース",
  "インタプリタ",
  "インデックス",
  "インテント",
  "ウィジェット",
  "ウィルス",
  "ウィンドウ",
  "ウェア",
  "エディタ",
  "エミッタ",
  "エンコーダ",
  "デコーダ",
  "エミュレータ",
  "エンティティ",
  "エントリ",
  "オプション",
  "カウンタ",
  "ガベージ",
  "カテゴリ",
  "キャラクタ",
  "キャッシュ",
  "クエリ文字列",
  "クエリ",
  "クライアント／サーバ",
  "クラスタ",
  "グラウンド",
  "グリッド",
  "クロージャ",
  "クローラ",
  "ゲッタ",
  "コピー&ペースト",
  "コミッタ",
  "コミュニ",
  "コンストラクタ",
  "コンテキスト",
  "コンテントプロバイダ",
  "コンテナ",
  "コンピュータ",
  "コントローラ",
  "サーバ",
  "サーブレット",
  "サーブレット/JSP",
  "ジェネレータ",
  "ジェネレーティブ",
  "ジョブズ",
  "ジオタグ",
  "シミュレー",
  "スカラ",
  "スタンドアローン",
  "ストアド",
  "ストレージ",
  "セキュリティ",
  "セッション",
  "セッタ",
  "セレクタ",
  "ソフトウェア",
  "ダイアグラム",
  "タイムスタンプ",
  "ツイート",
  "ツリーオブジェクト",
  "ツリーエントリ",
  "テーブル",
  "ディレクター",
  "データサービス",
  "データ同期",
  "チェイン",
  "ディスク",
  "ディスパッチャ",
  "ディスプレイ",
  "ディレクトリ",
  "テクノロジ",
  "デザイナ",
  "デバッグ",
  "デフォルト",
  "デプロイ",
  "デベロッパ",
  "デリバリ",
  "ドキュメント",
  "ドライバ",
  "ドラッグ&ドロップ",
  "ハイパーリンク",
  "パーサ",
  "パーマリンク",
  "バッファ",
  "パス",
  "パターン",
  "ハッシュ",
  "バラ",
  "バラエティ",
  "パラメータ",
  "バランサ",
  "ハンドラ",
  "ヒット率",
  "ファイラ",
  "ファクトリ",
  "フィーチャーフォン",
  "ブラウザ",
  "ブラウザ",
  "プライマリ",
  "プラットフォーム",
  "プレフィックス",
  "プレイヤー",
  "プレーヤ",
  "ブレーク",
  "プレーン",
  "プロパティ",
  "ヘビー",
  "レビュア",
  "ビューア",
  "ファイアウォール",
  "フィルタ",
  "フィクスチャ",
  "フェイルオーバー",
  "フェーズ",
  "フッタ",
  "プロキシ",
  "ブログ",
  "プログラマ",
  "プロシージャ",
  "ブロードキャストレシーバ",
  "プロバイダ",
  "ベンダー",
  "ヘッダ",
  "ベクタ",
  "ページャ",
  "ポインタ",
  "ポリモフィズム",
  "マトリックス",
  "マッパ",
  "マネジメント",
  "メーカー",
  "メーリングリスト",
  "メタファ",
  "メモリ",
  "メンテナンス",
  "メンテナ",
  "メンバー",
  "リーダー",
  "レジューム",
  "モジュール",
  "ユーザ",
  "ユーティリティ",
  "ユニットテスト",
  "ライブラリ",
  "ラッパ",
  "リグレッション",
  "リスナ",
  "リバースプロキシ",
  "リファラ",
  "リポジトリ",
  "ルータ",
  "レイヤ",
  "レジストリ",
  "レイテンシ",
  "ローダ",
  "ワーカ",
  "ワンタイムURL",
  "クアッドコアCPU",
  "クアッドコア",
  "デュアルコアCPU",
  "デュアルコア",
  "マスタ",
  "マスタ／スレーブ",
  "バックアップ",
  "スレーブ",
  "記述子",
  "属性",
  "要素",
  "ActionController",
  "ActionMailer",
  "ActionPack",
  "ActionScript",
  "ActionScript Virtual Machine",
  "ActionView",
  "ActiveModel",
  "ActiveRecord",
  "ActiveResource",
  "ActiveSupport",
  "Apache",
  "ASP.NET",
  "Bean",
  "Bigtable",
  "CakePHP",
  "Capistrano",
  "Chrome Web Store",
  "Cygwin",
  "DBFlute",
  "Debian GNU/Linux",
  "DeNA",
  "Dreamweaver",
  "easy_install",
  "Eclipse",
  "ECMAScript",
  "EJB-JARファイル",
  "Elisp",
  "Lisp",
  "Emacs",
  "Emacs Lisp",
  "EventMachine",
  "Excel",
  "express",
  "Facebook",
  "Firebug",
  "Firefox",
  "Flash",
  "Flash Lite",
  "Flash Player",
  "Flashプラットフォーム",
  "Flex Builder",
  "Gears",
  "GHCi",
  "Git",
  "GitHub",
  "Gmail",
  "Google Gadget",
  "Google Maps",
  "Greasemonkey",
  "gzip",
  "Heartbeat",
  "HTML5",
  "I/O",
  "ImageMagick",
  "Internet Explorer",
  "inode",
  "iOS SDK",
  "ISO ",
  "iPad",
  "iPhone",
  "Jade",
  "JARファイル",
  "Java 3D",
  "Java EE",
  "Java SE",
  "JavaBeans",
  "Javadoc",
  "JavaScript",
  "JavaServer Faces",
  "JavaServer Pages",
  "Jenkins",
  "JPEG",
  "JVM",
  "key-value",
  "KitchenSink",
  "Kyoto Cabinet",
  "Kyoto Tycoon",
  "LL",
  "Mac OS",
  "Mac OS X",
  "MacBook",
  "MacPorts",
  "Maven",
  "MeCab",
  "memcached",
  "Microsoft",
  "Migemo",
  "mixi",
  "MongoDB",
  "MySQL",
  "nginx",
  "Node.js",
  "OAuth",
  "OmniAuth",
  "OpenGL",
  "OS",
  "Pandoc",
  "parallel",
  "PC",
  "Pentium 4",
  "Pentium II",
  "Pentium III",
  "Perl",
  "Photoshop",
  "PHPUnit",
  "ping",
  "pip",
  "pixiv",
  "POPFile",
  "PostScript",
  "Python",
  "RADIUS",
  "Rake",
  "Red Hat",
  "Red Hat Linux",
  "Redis",
  "RELAX NG",
  "RPCサービス",
  "Ruby",
  "Ruby on Rails",
  "RubyGems",
  "RubyGems",
  "Scheme",
  "Silverlight",
  "SimpleTest",
  "Sinatra",
  "SkeedCast",
  "Smalltalk",
  "Socket.IO",
  "SourceForge",
  "SpiderMonkey",
  "SQLite",
  "Squid",
  "Subversion",
  "Sun",
  "SunRPC",
  "SUSE",
  "SWFファイル",
  "Symfony2",
  "Twitter",
  "Twitter",
  "Tokyo Cabinet",
  "Tokyo Dystopia",
  "Tokyo Promenade",
  "Tokyo Tyrant",
  "Tritonn",
  "Ubuntu",
  "Unicode",
  "UNIX",
  "UTF-8",
  "vi",
  "Vim",
  "Vimスクリプト",
  "Visual Basic",
  "Visual Studio .NET",
  "VMware",
  "WARファイル",
  "Web",
  "Web API",
  "Web UI",
  "WebLogic",
  "WebSphere",
  "Wi-Fi",
  "Windows 2000",
  "Windows 2000 Server",
  "Windows 3.",
  "Windows 7",
  "Windows 95",
  "Windows 98",
  "Windows Me",
  "Windows NT",
  "Windows Server 2003",
  "Windows Server 2008",
  "Windows Vista",
  "Windows XP",
  "Windows",
  "Word",
  "xAuth",
  "Xcode",
  "XML Schema",
  "Yahoo!",
  "Yahoo!ウィジェット",
  "YouTube",
  "YSlow",
  "ZIPファイル",
  "オライリー・ジャパン",
  "ソフトバンク クリエイティブ",
  "ピアソン・エデュケーション",
  "qwikWeb",
  "C2 Wiki",
  "SearchWiki",
  "MediaWiki",
  "HyperPerl",
  "Nupedia",
  "UseModWiki",
  "TiddlyWiki",
  "MeatballWiki",
  "WikiWikiWeb",
  "Wikia",
  "Wikimedia",
  "Wikipedia",
  "WikiBase",
  "Wiki",
  "モデル",
  "ビュー",
  "コントローラ",
  "アクションクラス",
  "アクションリスナ",
  "アクションマッピング",
  "アクションフォームBean",
  "アクションフォーム",
  "アクションサーブレット",
  "アクション",
  "フォームBean",
  "リクエストオブジェクト",
  "レスポンスオブジェクト",
  "セッションオブジェクト",
  "リモートインタフェース",
  "ホームインタフェース",
  "ローカルインタフェース",
  "サービスインタフェース",
  "エンティティBean",
  "セッションBean",
  "FortiGate",
  "RedPen"
  ]

  console = {
      log: print,
      warn: print,
      error: print
  };

  // 辞書によるスペルチェック 
  for (var i = 0; i < sentence.tokens.length; i++) {
    // 名詞だけを対象に
    if (sentence.tokens[i].tags[0] == '名詞') {
      for (var j=0; j < checkKeywordArray.length; j++) {
        //console.log('checking : ' + sentence.tokens[i].surface + ' and ' + checkKeywordArray[j])
        var dist = levenshteinDistance(sentence.tokens[i].surface,checkKeywordArray[j])
        //console.log(sentence.tokens[i].surface +' is ' + dist)
        if (sentence.tokens[i].surface.length > 4 && dist <= 2 && dist != 0){
          addError(sentence.tokens[i].surface + 'はスペルミスの可能性があります。' + checkKeywordArray[j] + 'ではありませんか？', sentence);
        }
      }
    }
  }
}

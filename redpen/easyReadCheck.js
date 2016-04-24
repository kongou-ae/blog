function validateSentence(sentence) {
    console = {
        log: print,
        warn: print,
        error: print
    };
    // [開いたほうがよい記載,開いたあとの記載,対象を形態素分析までやるか]
    // 事を正規表現だけで処理してしまうと、「事件」がエラーになってしまうので、
    // 短い名詞や副詞、形容詞などは形態素分析で区切った結果がキーワードと一致するかどうかまで見る
    var checkKeywordObj = {
        '更に' : ['さらに',false],
        '殆ど' : ['ほとんど',false],
        '下さい' : ['ください',false],
        '事' : ['こと',true],
        '何時か' : ['いつか',false],
        '何処か' : ['どこか',false],
        '何故か' : ['なぜか',false],
        '後で' : ['あとで',true],
        '出来るだけ' : ['できるだけ',false],
        'ひと通り' : ['ひととおり',false],
        '丁度' : ['ちょうど',false],
        '時間が経つ' : ['時間がたつ',false],
        '何でも' : ['なんでも',false]
    };

    // 各センテンスに対して、checkKeywordObj分処理を実施
    for (var i = 0; i < Object.keys(checkKeywordObj).length; i++) {
        // 開くべきキーワードを正規表現にセット
        var regex = new RegExp(Object.keys(checkKeywordObj)[i]);
        // もしセンテンスの文章がcheckKeywordObjのキーにマッチしたら
        if ( sentence.content.match(regex) ){
            // 誤検知が多いものは、形態素分析が必要であればtokenまで見る
            if ( checkKeywordObj[Object.keys(checkKeywordObj)[i]][1] == true){
                for (var j = 0; j < sentence.tokens.length; j++) {
                    // 自然言語解析の結果とキーワードが一致したらエラーメッセージを出力
                    if ( sentence.tokens[j].surface == Object.keys(checkKeywordObj)[i] ){
                        addError('「' + sentence.tokens[j].surface + '」を「' + checkKeywordObj[Object.keys(checkKeywordObj)[i]][0] + '」に修正してください', sentence);
                    };
                };
            // 形態素分析が不要なキーワードであれば、正規表現だけでにエラーにする
            } else {
                addError('「' + Object.keys(checkKeywordObj)[i] + '」を「' + checkKeywordObj[Object.keys(checkKeywordObj)[i]][0] + '」に修正してください', sentence);
            };
        };
    };
};

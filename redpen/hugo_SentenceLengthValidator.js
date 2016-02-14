function validateSentence(sentence) {
    // HUGOの設定以外のセンテンスに対して、100文字を超えているかどうかチェック
    if (sentence.content.match(/^---title.*categories:$/)){
    } else if (sentence.content.length > 100){
        addError('このセンテンスは100文字を超えています', sentence);
    }
}

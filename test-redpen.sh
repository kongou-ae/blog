#!/bin/sh
mv redpen/blog.xml redpen-*/conf
mv redpen/spellCheck.js redpen-*/js

filename=`git diff --name-only`

if [[ $filename =~ .*.md$ ]] ;then
    redpen-*/bin/redpen -c conf/blog.xml -f markdown aimless.jp/content/blog/archives/$filename
fi

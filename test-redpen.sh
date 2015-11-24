#!/bin/sh
mv redpen/blog.xml redpen-*/conf
mv redpen/spellCheck.js redpen-*/js

filename=`git diff HEAD^ HEAD --name-only`
echo $filename

if [[ $filename =~ .*\.md$ ]] ;then
    echo "testing...$filename"
    redpen-*/bin/redpen -c conf/blog.xml -f markdown aimless.jp/content/blog/archives/$filename
fi

#!/bin/sh
mv redpen/blog.xml redpen-*/conf
mv redpen/spellCheck.js redpen-*/js

filename=`git diff HEAD^ HEAD --name-only`

if [[ $filename =~ .*\.md$ ]] ;then
    echo "start to test $filename...."
    redpen-*/bin/redpen -c redpen-*/conf/blog.xml -f markdown $filename
else
    echo "$filename is not markdown. The test will not be performed."
fi

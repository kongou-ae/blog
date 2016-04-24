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

#!/bin/bash

cd /var/siteBuilderAPI

if [ "$PRODUCTION" = "true" ] ; then
 echo "its prod"
else
 echo "its dev"
 git checkout develop
fi

git pull
rm package-lock.json
npm install

#migrations
db-migrate up

npm run apidoc

echo $1

r1=$(ps aux | grep $1.js | grep -v grep)

if [ $r1 != ""]
then
  cd /var/siteBuilderAPI && pm2 start $1.config.js
else
  echo "111"
fi

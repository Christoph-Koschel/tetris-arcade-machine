#!/bin/bash

START_TIME=$(date +%s)

source $(dirname $0)/config.sh

if [ -d ./out ]; then
  rm -r ./out
fi

mkdir ./out
mkdir ./out/tetris
cp -r ./builder/* ./out
sed -i "s/{{USERNAME}}/$USERNAME/" ./out/tetris.desktop
sed -i "s/{{USERNAME}}/$USERNAME/" ./out/build.sh

cd ./src
npm run pack-linux
cd ..

cp -r ./src/tetris-linux-arm64/* ./out/tetris

cd out
tar -czf ../tetris.tar.gz ./*
cd ..
END_TIME=$(date +%s)
EXECUTION_TIME=$((END_TIME - START_TIME))
echo "Build took $EXECUTION_TIME seconds"
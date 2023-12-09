#!/bin/bash

echo "Executive directory '$(pwd)'"

echo "Test setup"
if [ -d ./app ]; then
    echo "Remove old setup"
    rm -r ./app
fi

echo "Extract data"
mkdir ./app
tar -C ./app -xzf ./tetris.tar.gz

echo "Run build script"
sudo ./app/build.sh

echo "Restart the system"
echo "In 3"
sleep 1
echo "In 2"
sleep 1
echo "In 1"
sleep 1
sudo reboot
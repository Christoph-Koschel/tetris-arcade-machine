#!/bin/bash

SCRIPT_DIR=$(dirname $0)

echo "Overwrite autostart"
sudo cp "$SCRIPT_DIR/tetris.desktop" /etc/xdg/autostart/tetris.desktop

echo "Overwrite desktop config"
sudo mkdir -p /home/{{USERNAME}}/.config/lxsession/LXDE-pi/
sudo mkdir -p /home/{{USERNAME}}/.config/pcmanfm/LXDE-pi/


sudo cp "$SCRIPT_DIR/desktop.conf" /home/{{USERNAME}}/.config/lxsession/LXDE-pi/desktop.conf
sudo cp "$SCRIPT_DIR/wf-panel-pi.ini" /home/{{USERNAME}}/.config/wf-panel-pi.ini
sudo cp "$SCRIPT_DIR/desktop-items-0.conf" /home/{{USERNAME}}/.config/pcmanfm/LXDE-pi/desktop-items-0.conf
sudo cp "$SCRIPT_DIR/pcmanfm.conf" /home/{{USERNAME}}/.config/pcmanfm/LXDE-pi/pcmanfm.conf
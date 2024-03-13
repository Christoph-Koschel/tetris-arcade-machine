/*
 * Copyright (C) 2024 Christoph Koschel - All Rights Reserved
 *
 * You may use, distribute, and modify this code under the
 * terms of the MIT license, which can be found
 * in the accompanying LICENSE.txt.
 *
 * You should have received a copy of the MIT license
 * along with this file. If not, please visit https://github.com/Christoph-Koschel/tetris-arcade-machine.
 */
import {app, BrowserWindow, screen} from "electron";
import * as path from "path";

app.on("ready", () => {
    const win = new BrowserWindow({
        autoHideMenuBar: true,
        show: false,
        fullscreen: true,
        webPreferences: {
            nodeIntegration: true,
            contextIsolation: false
        }
    });
    win.setMenu(null);
    win.loadFile(path.join(__dirname, "index.html")).then(() => {

        win.webContents.openDevTools({
            mode: "right"
        });

        if (!app.isPackaged) {
            const display = screen.getAllDisplays().filter(d => d.id != screen.getPrimaryDisplay().id)[0];
            win.setPosition(display.bounds.x, display.bounds.y);
            win.show();
        } else {
            win.show();
        }
    });
});
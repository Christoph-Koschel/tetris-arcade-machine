import {app, BrowserWindow} from "electron";
import * as path from "path";

app.on("ready", () => {
    const win = new BrowserWindow({
        autoHideMenuBar: true,
        show: false,
        fullscreen: true
    });
    win.setMenu(null);
    win.loadFile(path.join(__dirname, "index.html")).then(() => win.show());
});
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
import {Keyboard, KeyBoardConPress} from "../driver/keyboard";
import Keymap from "../driver/keymap";
import controller, {ControllerClick, ControllerSelect, ControllerUnSelect} from "./playerController";
import {View} from "./view";
import * as fs from "fs";
import * as path from "path";
import sound from "./sound";


import "./views/mainMenu";
import "./views/preSinglePlayer";
import "./views/singlePlayer";
import {Sprite} from "./game/rendering";
import spriteManager from "./game/spriteManager";

window.addEventListener("load", () => {
    load();
});

async function load(): Promise<void> {
    const pre: HTMLPreElement = document.createElement("pre");
    const code: HTMLElement = document.createElement("code");
    pre.style.color = "white";
    pre.appendChild(code);
    document.body.appendChild(pre);

    const write = (text: string): void => {
        code.innerHTML += text + "\n";
    }

    write("Load driver");
    const keyboard: Keyboard = new Keyboard();
    write("Init controller");
    Keymap.init(keyboard);
    console.log(ControllerSelect.logicalName)
    console.log(ControllerUnSelect.logicalName)
    console.log(ControllerClick.logicalName)
    Keymap.on(KeyBoardConPress.KEY_D, () => {
        console.log("Next");
        controller.next();
    });
    Keymap.on(KeyBoardConPress.KEY_A, () => {
        console.log("Previous");
        controller.previous();
    });
    Keymap.on(KeyBoardConPress.KEY_S, () => {
        console.log("Click");
        controller.click();
    });

    write("Load sound");
    sound.playSong("./assets/sfx/theme.mp3");

    write("Load sprites");
    await Promise.all((<(keyof Sprite)[]>Object.keys(Sprite)).map(key => spriteManager.load(path.join(__dirname, "assets", "sprites", Sprite[key]))))

    write("Load views");
    View.views.forEach(view => view.onBuild());

    write("Load css");
    await Promise.all(fs.readdirSync(path.join(__dirname, "assets", "styles")).map(src => {
        let link = document.createElement("link");
        link.href = path.join(__dirname, "assets", "styles", src);
        link.rel = "stylesheet";
        return <Promise<void>>new Promise(resolve => {
            link.addEventListener("load", () => {
                resolve();
            });
            document.head.appendChild(link);
        });
    }));

    View.load("mainMenu");
    controller.setGroup("__main__");

}
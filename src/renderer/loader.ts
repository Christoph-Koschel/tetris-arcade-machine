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
import * as fs from "fs";
import * as path from "path";

import {Keyboard, GameInterrupts} from "../driver/keyboard";
import Keymap from "../driver/keymap";
import {Serial} from "../driver/serial";
import {View} from "./view";
import {Sprite} from "./game/rendering";
import controller from "./playerController";
import spriteManager from "./game/spriteManager";

import "./views";

window.addEventListener("load", async (): Promise<void> => {
    // region Some debug stuff
    const pre: HTMLPreElement = document.createElement("pre");
    const code: HTMLElement = document.createElement("code");
    pre.style.color = "white";
    pre.appendChild(code);
    document.body.appendChild(pre);

    const write = (text: string): void => {
        code.innerHTML += text + "\n";
    }
    // endregion

    write("Load driver");
    const keyboard: Keyboard = new Keyboard();
    const serial: Serial = new Serial();
    write("Init controller");
    Keymap.init(keyboard);
    Keymap.init(serial);
    Keymap.on(GameInterrupts.P1_MOVE_RIGHT, () => {
        controller.next();
    });
    Keymap.on(GameInterrupts.P1_MOVE_LEFT, () => {
        controller.previous();
    });
    Keymap.on(GameInterrupts.P1_FAST_DOWN, () => {
        controller.click();
    });

    write("Load sprites");
    await Promise.all((<(keyof Sprite)[]>Object.keys(Sprite)).map(key => spriteManager.load(path.join(__dirname, "assets", "sprites", Sprite[key]))));

    write("Load views");
    View.views.forEach(view => view.onBuild());

    write("Load css");
    await Promise.all(fs.readdirSync(path.join(__dirname, "assets", "styles")).map(src => {
        let link: HTMLLinkElement = document.createElement("link");
        link.href = path.join(__dirname, "assets", "styles", src);
        link.rel = "stylesheet";
        return <Promise<void>>new Promise(resolve => {
            link.addEventListener("load", () => {
                resolve();
            });
            document.head.appendChild(link);
        });
    }));

    // Loads the mainmenu
    View.load("mainMenu");
    controller.setGroup("main");
});
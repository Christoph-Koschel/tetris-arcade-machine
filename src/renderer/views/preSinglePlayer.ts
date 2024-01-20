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
import {View} from "../view";
import {Selectable} from "../components/selectable";
import {Option} from "../components/option";

enum PlayerModes {
    HARD = "Schwer",
    MEDIUM = "Mittel",
    EASY = "Leicht",

}

new (class _ extends View {
    private root: HTMLElement;
    private panel: HTMLElement;
    private playerMode: Option<PlayerModes>
    private backBTN: Selectable;
    private playBTN: Selectable;

    public onBuild(): void {
        this.root = document.createElement("div");
        this.root.id = "pre-single-player";

        this.playerMode = new Option<PlayerModes>([PlayerModes.EASY, PlayerModes.MEDIUM, PlayerModes.HARD], "__preSinglePlayer__");

        this.backBTN = new Selectable("Zurück", "__preSinglePlayer__");
        this.backBTN.setOnClick(() => {
            View.loadWithGroup("mainMenu", "__main__");
        });
        this.playBTN = new Selectable("Play", "__preSinglePlayer__");
        this.playBTN.setOnClick(() => {
            View.load("singlePlayer");
        });


        this.panel = document.createElement("div");
        this.panel.classList.add("panel");

        // this.animation = new TetrisAnimation("50%", "0", "50%", "100%", 12);

        let row = document.createElement("div");
        row.classList.add("row");


        row.appendChild(this.backBTN.root);
        row.appendChild(this.playBTN.root);
        this.panel.appendChild(this.playerMode.root);
        this.panel.appendChild(row);
        this.root.appendChild(this.panel);

        // this.root.appendChild(this.logo);
        // this.root.appendChild(this.animation.root);
    }

    public onAppend(root: HTMLElement): void {
        root.appendChild(this.root);
    }

    public onDestroy(): void {
    }

})("preSinglePlayer");
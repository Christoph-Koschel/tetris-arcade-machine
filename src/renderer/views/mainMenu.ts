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
import {TetrisAnimation} from "../components/tetris-animation";

new (class _ extends View {
    private root: HTMLElement;
    private panel: HTMLElement;
    private singlePlayerBTN: Selectable;
    private multiPlayerBTN: Selectable
    private logo: HTMLImageElement;
    private animation: TetrisAnimation;

    public onBuild(): void {
        this.root = document.createElement("div");
        this.root.id = "main-menu";

        this.singlePlayerBTN = new Selectable("Singleplayer", "__main__");
        this.singlePlayerBTN.setOnClick(() => {
            View.loadWithGroup("preSinglePlayer", "__preSinglePlayer__");
        });
        this.multiPlayerBTN = new Selectable("Multiplayer", "__main__");

        this.panel = document.createElement("div");
        this.panel.classList.add("panel");

        this.logo = document.createElement("img");
        this.logo.src = "assets/sprites/logo.png";

        this.animation = new TetrisAnimation("50%", "0", "50%", "100%", 12);

        this.panel.appendChild(this.singlePlayerBTN.root);
        this.panel.appendChild(this.multiPlayerBTN.root);
        this.root.appendChild(this.panel);
        this.root.appendChild(this.logo);
        this.root.appendChild(this.animation.root);
    }

    public onAppend(root: HTMLElement): void {
        root.appendChild(this.root);

        this.animation.start();
    }

    public onDestroy(): void {
        this.animation.stop();
    }

})("mainMenu");
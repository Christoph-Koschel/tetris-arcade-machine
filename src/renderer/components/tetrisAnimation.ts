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

import {Generator} from "../gamePlay";
import {GameObject} from "../game/objects";
import {Render} from "../game/rendering";

/**
 * The animation component that is for the animation at the Mainmenu
 * @class
 */
export class TetrisAnimation {
    public root: HTMLCanvasElement;
    private ctx: Render;
    private cellCountX: number;
    private generator: Generator;
    private object1: GameObject;
    private object2: GameObject;
    private object3: GameObject;
    private object4: GameObject;
    private gameLoop: NodeJS.Timeout;

    public constructor(x: string, y: string, width: string, height: string, cellCountX: number) {
        this.cellCountX = cellCountX;
        this.generator = new Generator();

        this.root = document.createElement("canvas");
        this.root.style.position = "absolute";
        this.root.style.left = x;
        this.root.style.top = y;
        this.root.style.width = width;
        this.root.style.height = height;

        this.ctx = this.root.getContext("2d");
    }

    public stop(): void {
        clearInterval(this.gameLoop);
        this.object1 = null;
        this.object2 = null;
        this.object3 = null;
        this.object4 = null;
    }

    public start(): void {
        this.root.width = parseFloat(getComputedStyle(this.root).width);
        this.root.height = parseFloat(getComputedStyle(this.root).height);
        let iterationBreak1: number = 5;
        let iterationBreak2: number = 10;
        let iterationBreak3: number = 15;
        this.gameLoop = setInterval(() => {
            if (!this.object1) {
                this.object1 = this.newGameObject();
            }
            if (!this.object2 && iterationBreak1 == 0) {
                this.object2 = this.newGameObject();
            }
            if (!this.object3 && iterationBreak2 == 0) {
                this.object3 = this.newGameObject();
            }
            if (!this.object4 && iterationBreak3 == 0) {
                this.object4 = this.newGameObject();
            }

            this.object1.down();
            if (!!this.object2) this.object2.down();
            if (!!this.object3) this.object3.down();
            if (!!this.object4) this.object4.down();

            this.ctx.clearRect(0, 0, this.root.width, this.root.height);
            this.object1.draw(this.ctx);
            if (!!this.object2) this.object2.draw(this.ctx);
            if (!!this.object3) this.object3.draw(this.ctx);
            if (!!this.object4) this.object4.draw(this.ctx);

            if (this.object1.getBottom() > 22) this.object1 = null;
            if (!!this.object2 && this.object2.getBottom() > 22) this.object2 = null;
            if (!!this.object3 && this.object3.getBottom() > 22) this.object3 = null;
            if (!!this.object4 && this.object4.getBottom() > 22) this.object4 = null;

            if (iterationBreak1 > 0) iterationBreak1--;
            if (iterationBreak2 > 0) iterationBreak2--;
            if (iterationBreak3 > 0) iterationBreak3--;
        }, 260);
    }

    private newGameObject(): GameObject {
        let obj: GameObject = this.generator.nextMovable();
        // Generate a random number between 0 and CELL_COUNT_X
        const rightMoving: number = Math.floor(Math.random() * (this.cellCountX + 1));
        // Moves the GameObject as long as possible to the right
        for (let i: number = 0; i < rightMoving; i++) {
            if ((obj.getRight() < this.cellCountX - 1)) {
                obj.right();
            } else {
                break;
            }
        }

        return obj;
    }
}
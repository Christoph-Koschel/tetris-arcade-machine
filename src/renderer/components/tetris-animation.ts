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

export class TetrisAnimation {
    public root: HTMLCanvasElement;
    private ctx: CanvasRenderingContext2D;
    private cellCountX: number;

    public constructor(x: string, y: string, width: string, height: string, cellCountX: number) {
        this.cellCountX = cellCountX;

        this.root = document.createElement("canvas");
        this.root.style.position = "absolute";
        this.root.style.left = x;
        this.root.style.top = y;
        this.root.style.width = width;
        this.root.style.height = height;

        this.ctx = this.root.getContext("2d");
    }

    public stop(): void {
    }

    public start(): void {
        this.root.width = parseFloat(getComputedStyle(this.root).width);
        this.root.height = parseFloat(getComputedStyle(this.root).height);

        let cellWidth: number = this.root.width / this.cellCountX;
        this.ctx.fillStyle = "red";
        this.ctx.fillRect(50, 50, cellWidth, cellWidth);
    }
}
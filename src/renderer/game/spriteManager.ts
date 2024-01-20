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
class SpriteManager {
    private sprites: Map<string, HTMLImageElement>;

    public constructor() {
        this.sprites = new Map<string, HTMLImageElement>();
    }

    public load(path: string): Promise<void> {
        return new Promise(resolve => {
            if (this.sprites.has(path)) {
                resolve();
                return;
            }

            const img: HTMLImageElement = document.createElement("img");
            img.addEventListener("load", () => {
                this.sprites.set(path, img);
                resolve();
            });
            img.src = path;
        });
    }

    public get(path: string): HTMLImageElement {
        return this.sprites.get(path);
    }
}

const spriteManager: SpriteManager = new SpriteManager();
export default spriteManager;
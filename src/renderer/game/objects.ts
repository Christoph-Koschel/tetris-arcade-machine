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
import {VirtualPoint} from "./math";
import {Cube, Render, Sprite} from "./rendering";
import {CELL_COUNT_X, CELL_COUNT_Y} from "./constants";
import spriteManager from "./spriteManager";
import * as path from "path";

/**
 * Represents the definition of all possible shapes for GameObjects in the game.
 * @type{GameObjectDefinitions}
 */
export type GameObjectDefinitions =
    typeof Box
    | typeof TBox
    | typeof ZBox
    | typeof RZBox
    | typeof LBox
    | typeof RLBox
    | typeof LineBox

/**
 * Specifies the possible rotation states for GameObjects.
 * @enum {number}
 */
export enum RotationIndex {
    TOP,
    LEFT,
    BOTTOM,
    RIGHT
}

/**
 * Abstract superclass for all GameObjects defined in Tetris.
 * @abstract
 * @class
 */
export abstract class GameObject {
    /**
     * The main block used for calculating the next rotation shape.
     * @type {Cube}
     * @protected
     */
    protected mainShape: Cube;

    /**
     * A list containing all blocks in the current shape.
     * @type {Cube[]}
     * @protected
     */
    protected shapes: Cube[];

    /**
     * The current rotation status.
     * @type {RotationIndex}
     * @protected
     */
    protected rotationIndex: RotationIndex;

    protected constructor(_: VirtualPoint) {
        this.mainShape = null;
        this.shapes = [];
        this.rotationIndex = RotationIndex.BOTTOM;
    }

    /**
     * Draws the current shape of the grid. Needed, for example, for drawing the preview shape.
     * @param {Render} ctx - The rendering context.
     * @param {VirtualPoint} cords - The virtual coordinates for drawing the shape off the grid.
     * @public
     * @returns {void}
     */
    public drawOffGrid(ctx: Render, cords: VirtualPoint): void {
        this.shapes.forEach(s => {
            let fake: Cube = new Cube(s.cords.calc(cords.vx, cords.vy));
            fake.setColor(this.shapes[0].getColor());
            fake.draw(ctx);
        });
    }

    /**
     * Draws the current shape.
     * @param {Render} ctx - The rendering context.
     * @public
     * @returns {void}
     */
    public draw(ctx: Render): void {
        this.shapes.forEach(s => s.draw(ctx));
    }

    /**
     * Moves the shape one block down.
     * @public
     * @returns {void}
     */
    public down(): void {
        this.shapes.forEach(s => s.y = s.y + 1);
    }

    /**
     * Moves the shape one block to the left.
     * @public
     * @returns {void}
     */
    public left(): void {
        this.shapes.forEach(s => s.x = s.x - 1);
    }

    /**
     * Moves the shape one block to the right.
     * @public
     * @returns {void}
     */
    public right(): void {
        this.shapes.forEach(s => s.x = s.x + 1);
    }

    /**
     * Rotates the shape anticlockwise.
     * @public
     * @returns {void}
     */
    public abstract rotate(): void;

    /**
     * Checks if the current shape can rotate to the next status.
     * @param {number[][]} sealed - 2D array representing sealed cells in the game grid.
     * @public
     * @returns {boolean} Returns true if the shape can rotate, false otherwise.
     */
    public abstract canRotate(sealed: number[][]): boolean;

    /**
     * Gets the lowest y-coordinate of the current shape.
     * @public
     * @returns {number} The lowest y-coordinate of the shape.
     */
    public getBottom(): number {
        let y: number = -1;
        this.shapes.forEach(s => {
            if (y == -1) {
                y = s.y;
            } else if (s.y > y) {
                y = s.y;
            }
        });

        return y;
    }

    /**
     * Gets the lowest x-coordinate of the current shape.
     * @public
     * @returns {number} The lowest x-coordinate of the shape.
     */
    public getLeft(): number {
        let x: number = -1;
        this.shapes.forEach(s => {
            if (x == -1) {
                x = s.x;
            } else if (s.x < x) {
                x = s.x;
            }
        });

        return x;
    }


    /**
     * Gets the highest x-coordinate of the current shape.
     * @public
     * @returns {number} The highest x-coordinate of the shape.
     */
    public getRight(): number {
        let x: number = -1;
        this.shapes.forEach(s => {
            if (x == -1) {
                x = s.x;
            } else if (s.x > x) {
                x = s.x;
            }
        });

        return x;
    }

    /**
     * Checks if the current shape can go down any further compared to the current sealed 2D-int array.
     * @param {number[][]} sealed - 2D array representing sealed cells in the game grid.
     * @public
     * @returns {boolean} Returns true if the shape can go down, false otherwise.
     */
    public canGoDown(sealed: number[][]): boolean {
        let points: Map<number, Cube> = new Map<number, Cube>();
        // Find the lowest points on each x-Axes of the shape
        this.shapes.forEach(s => {
            if (points.has(s.x)) {
                if (points.get(s.x).y < s.y) {
                    points.set(s.x, s);
                }
            } else {
                points.set(s.x, s);
            }
        });

        // Check if the lowest point can go down
        // y of current point + 1 in sealed is not 1
        let can: boolean = true;
        points.forEach(s => {
            if (sealed[s.y + 1][s.x] == 1) {
                can = false;
            }
        });

        return can;
    }

    /**
     * Checks if the current shape can go left compared to the current sealed 2D-int array.
     * @param {number[][]} sealed - 2D array representing sealed cells in the game grid.
     * @public
     * @returns {boolean} Returns true if the shape can go left, false otherwise.
     */
    public canGoLeft(sealed: number[][]): boolean {
        let points: Map<number, Cube> = new Map<number, Cube>();
        // Find the highest points on each y-Axes of the shape
        this.shapes.forEach(s => {
            if (points.has(s.y)) {
                if (points.get(s.y).x > s.x) {
                    points.set(s.y, s);
                }
            } else {
                points.set(s.y, s);
            }
        });

        // Check if the leftmost point can go left
        // x of current point - 1 in sealed is not 1
        let can: boolean = true;
        points.forEach(s => {
            if (sealed[s.y][s.x - 1] == 1) {
                can = false;
            }
        });

        return can;
    }

    /**
     * Check if the current shape can go right compared to the current sealed 2D-int array.
     * @param {number[][]} sealed - 2D array representing sealed cells in the game grid.
     * @public
     * @returns {boolean} Returns true if the shape can go left, false otherwise.
     */
    public canGoRight(sealed: number[][]): boolean {
        let points: Map<number, Cube> = new Map<number, Cube>();
        // Find the lowest points on each y-Axes of the shape
        this.shapes.forEach(s => {
            if (points.has(s.y)) {
                if (points.get(s.y).x < s.x) {
                    points.set(s.y, s);
                }
            } else {
                points.set(s.y, s);
            }
        });

        // Check if the rightmost point can go right
        // x of current point + 1 in sealed is not 1
        let can: boolean = true;
        points.forEach(s => {
            if (sealed[s.y][s.x + 1] == 1) {
                can = false;
            }
        });

        return can;
    }

    /**
     * Sets the color of the current shape.
     * @param {string} color - The color to set for the shape.
     * @public
     * @returns {void}
     */
    public setColor(color: string): void {
        this.shapes.forEach(s => s.setColor(color));
    }

    public setSprite(sprite: HTMLImageElement): void {
        this.shapes.forEach(s => s.setSprite(sprite));
    }

    /**
     * Updates the sealed state on the board and returns the cubes of the sealed shape.
     * @param {number[][]} sealed - 2D array representing sealed cells in the game grid.
     * @public
     * @returns {Cube[]} The cubes representing the sealed shape on the board.
     */
    public seal(sealed: number[][]): Cube[] {
        this.shapes.forEach(s => {
            sealed[s.y][s.x] = 1
        });
        return this.shapes;
    }

    /**
     * Checks if the virtual point is in the board boundaries and if the cell is not sealed on the game grid-
     * @param {number[][]} sealed - 2D array representing sealed cells in the game grid.
     * @param {VirtualPoint} p - The virtual coordinate to check.
     * @protected
     * @returns {boolean} Returns true if the coordinate is on the board and not sealed, false otherwise.
     */
    protected check(sealed: number[][], p: VirtualPoint): boolean {
        return p.vx >= 0 && p.vx < CELL_COUNT_X && p.vy >= 0 && p.vy < CELL_COUNT_Y && sealed[p.vy][p.vx] != 1;
    }
}

/**
 * Represents the Box shape in Tetris.
 * @extends {GameObject}
 */
export class Box extends GameObject {
    public constructor(cords: VirtualPoint) {
        super(cords);

        this.shapes.push(
            new Cube(cords),
            new Cube(cords.calc(1, 0)),
            new Cube(cords.calc(0, 1)),
            new Cube(cords.calc(1, 1))
        );

        this.setColor("#ffff00");
        this.setSprite(randomBoxSprite());
    }

    rotate(): void {
    }

    canRotate(): boolean {
        return false;
    }
}

/**
 * Represents the T-Shape in Tetris.
 * @extends {GameObject}
 */
export class TBox extends GameObject {
    public constructor(cords: VirtualPoint) {
        super(cords);

        this.shapes.push(
            new Cube(cords),
            new Cube(cords.calc(1, 0)),
            new Cube(cords.calc(2, 0)),
            new Cube(cords.calc(1, 1)),
        );
        this.mainShape = this.shapes[1];

        this.setColor("#9900ff");
        this.setSprite(randomBoxSprite());
    }

    public rotate(): void {
        if (this.rotationIndex == RotationIndex.BOTTOM) {
            this.rotationIndex = RotationIndex.LEFT;

            this.shapes = [
                this.mainShape,
                new Cube(this.mainShape.cords.calc(0, -1)),
                new Cube(this.mainShape.cords.calc(0, 1)),
                new Cube(this.mainShape.cords.calc(1, 0)),
            ];
        } else if (this.rotationIndex == RotationIndex.LEFT) {
            this.rotationIndex = RotationIndex.TOP;

            this.shapes = [
                this.mainShape,
                new Cube(this.mainShape.cords.calc(-1, 0)),
                new Cube(this.mainShape.cords.calc(1, 0)),
                new Cube(this.mainShape.cords.calc(0, -1)),
            ]
        } else if (this.rotationIndex == RotationIndex.TOP) {
            this.rotationIndex = RotationIndex.RIGHT;

            this.shapes = [
                this.mainShape,
                new Cube(this.mainShape.cords.calc(0, -1)),
                new Cube(this.mainShape.cords.calc(0, 1)),
                new Cube(this.mainShape.cords.calc(-1, 0)),
            ];
        } else if (this.rotationIndex == RotationIndex.RIGHT) {
            this.rotationIndex = RotationIndex.BOTTOM;

            this.shapes = [
                this.mainShape,
                new Cube(this.mainShape.cords.calc(-1, 0)),
                new Cube(this.mainShape.cords.calc(1, 0)),
                new Cube(this.mainShape.cords.calc(0, 1)),
            ]
        }

        this.setColor(this.mainShape.getColor());
        this.setSprite(this.mainShape.getSprite());
    }

    public canRotate(sealed: number[][]): boolean {

        if (this.rotationIndex == RotationIndex.BOTTOM) {
            return this.check(sealed, this.mainShape.cords) &&
                this.check(sealed, this.mainShape.cords.calc(0, -1)) &&
                this.check(sealed, this.mainShape.cords.calc(0, 1)) &&
                this.check(sealed, this.mainShape.cords.calc(1, 0));
        }
        if (this.rotationIndex == RotationIndex.LEFT) {
            return this.check(sealed, this.mainShape.cords) &&
                this.check(sealed, this.mainShape.cords.calc(-1, 0)) &&
                this.check(sealed, this.mainShape.cords.calc(1, 0)) &&
                this.check(sealed, this.mainShape.cords.calc(0, -1));
        }
        if (this.rotationIndex == RotationIndex.TOP) {
            return this.check(sealed, this.mainShape.cords) &&
                this.check(sealed, this.mainShape.cords.calc(0, -1)) &&
                this.check(sealed, this.mainShape.cords.calc(0, 1)) &&
                this.check(sealed, this.mainShape.cords.calc(-1, 0));
        }
        if (this.rotationIndex == RotationIndex.RIGHT) {
            return this.check(sealed, this.mainShape.cords) &&
                this.check(sealed, this.mainShape.cords.calc(-1, 0)) &&
                this.check(sealed, this.mainShape.cords.calc(1, 0)) &&
                this.check(sealed, this.mainShape.cords.calc(0, 1));
        }

        return false;
    }
}

/**
 * Represents the Z-Shape in Tetris.
 * @extends {GameObject}
 */
export class ZBox extends GameObject {
    public constructor(cords: VirtualPoint) {
        super(cords);

        this.shapes.push(
            new Cube(cords.calc(1, 0)),
            new Cube(cords.calc(2, 0)),
            new Cube(cords.calc(1, 1)),
            new Cube(cords.calc(0, 1))
        );
        this.mainShape = this.shapes[2];

        this.setColor("#ff0000");
        this.setSprite(randomBoxSprite());
    }

    public rotate(): void {
        if (this.rotationIndex == RotationIndex.BOTTOM) {
            this.rotationIndex = RotationIndex.LEFT;

            this.shapes = [
                this.mainShape,
                new Cube(this.mainShape.cords.calc(1, 0)),
                new Cube(this.mainShape.cords.calc(1, 1)),
                new Cube(this.mainShape.cords.calc(0, -1))
            ];
        } else if (this.rotationIndex == RotationIndex.LEFT) {
            this.rotationIndex = RotationIndex.TOP;

            this.shapes = [
                this.mainShape,
                new Cube(this.mainShape.cords.calc(1, 0)),
                new Cube(this.mainShape.cords.calc(0, 1)),
                new Cube(this.mainShape.cords.calc(-1, 1))
            ];
        } else if (this.rotationIndex == RotationIndex.TOP) {
            this.rotationIndex = RotationIndex.RIGHT;

            this.shapes = [
                this.mainShape,
                new Cube(this.mainShape.cords.calc(-1, 0)),
                new Cube(this.mainShape.cords.calc(0, 1)),
                new Cube(this.mainShape.cords.calc(-1, -1))
            ];
        } else if (this.rotationIndex == RotationIndex.RIGHT) {
            this.rotationIndex = RotationIndex.BOTTOM;

            this.shapes = [
                this.mainShape,
                new Cube(this.mainShape.cords.calc(0, -1)),
                new Cube(this.mainShape.cords.calc(1, -1)),
                new Cube(this.mainShape.cords.calc(-1, 0))
            ];
        }
        this.setColor(this.mainShape.getColor());
        this.setSprite(this.mainShape.getSprite());
    }


    public canRotate(sealed: number[][]): boolean {
        if (this.rotationIndex == RotationIndex.BOTTOM) {
            return this.check(sealed, this.mainShape.cords) &&
                this.check(sealed, this.mainShape.cords.calc(1, 0)) &&
                this.check(sealed, this.mainShape.cords.calc(1, 1)) &&
                this.check(sealed, this.mainShape.cords.calc(0, -1));

        }
        if (this.rotationIndex == RotationIndex.LEFT) {
            return this.check(sealed, this.mainShape.cords) &&
                this.check(sealed, this.mainShape.cords.calc(1, 0)) &&
                this.check(sealed, this.mainShape.cords.calc(0, 1)) &&
                this.check(sealed, this.mainShape.cords.calc(-1, 1));

        }
        if (this.rotationIndex == RotationIndex.TOP) {
            return this.check(sealed, this.mainShape.cords) &&
                this.check(sealed, this.mainShape.cords.calc(-1, 0)) &&
                this.check(sealed, this.mainShape.cords.calc(0, 1)) &&
                this.check(sealed, this.mainShape.cords.calc(-1, -1));
        }
        if (this.rotationIndex == RotationIndex.RIGHT) {
            return this.check(sealed, this.mainShape.cords) &&
                this.check(sealed, this.mainShape.cords.calc(0, -1)) &&
                this.check(sealed, this.mainShape.cords.calc(1, -1)) &&
                this.check(sealed, this.mainShape.cords.calc(-1, 0));
        }

        return false;
    }
}

/**
 * Represents the Z-Shape in Tetris.
 * @extends {GameObject}
 */
export class RZBox extends GameObject {

    public constructor(cords: VirtualPoint) {
        super(cords);

        this.shapes.push(
            new Cube(cords),
            new Cube(cords.calc(1, 0)),
            new Cube(cords.calc(1, 1)),
            new Cube(cords.calc(2, 1))
        );

        this.mainShape = this.shapes[2];

        this.setColor("#00ff00");
        this.setSprite(randomBoxSprite());
    }

    public rotate(): void {
        if (this.rotationIndex == RotationIndex.BOTTOM) {
            this.rotationIndex = RotationIndex.LEFT;

            this.shapes = [
                this.mainShape,
                new Cube(this.mainShape.cords.calc(0, 1)),
                new Cube(this.mainShape.cords.calc(1, 0)),
                new Cube(this.mainShape.cords.calc(1, -1))
            ];
        } else if (this.rotationIndex == RotationIndex.LEFT) {
            this.rotationIndex = RotationIndex.TOP;

            this.shapes = [
                this.mainShape,
                new Cube(this.mainShape.cords.calc(-1, 0)),
                new Cube(this.mainShape.cords.calc(0, 1)),
                new Cube(this.mainShape.cords.calc(1, 1))
            ];
        } else if (this.rotationIndex == RotationIndex.TOP) {
            this.rotationIndex = RotationIndex.RIGHT;

            this.shapes = [
                this.mainShape,
                new Cube(this.mainShape.cords.calc(1, 0)),
                new Cube(this.mainShape.cords.calc(1, -1)),
                new Cube(this.mainShape.cords.calc(0, 1))
            ];
        } else if (this.rotationIndex == RotationIndex.RIGHT) {
            this.rotationIndex = RotationIndex.BOTTOM;

            this.shapes = [
                this.mainShape,
                new Cube(this.mainShape.cords.calc(1, 0)),
                new Cube(this.mainShape.cords.calc(0, -1)),
                new Cube(this.mainShape.cords.calc(-1, -1))
            ];
        }
        this.setColor(this.mainShape.getColor());
        this.setSprite(this.mainShape.getSprite());
    }

    public canRotate(sealed: number[][]): boolean {
        if (this.rotationIndex == RotationIndex.BOTTOM) {
            return this.check(sealed, this.mainShape.cords) &&
                this.check(sealed, this.mainShape.cords.calc(0, 1)) &&
                this.check(sealed, this.mainShape.cords.calc(1, 0)) &&
                this.check(sealed, this.mainShape.cords.calc(1, -1));
        } else if (this.rotationIndex == RotationIndex.LEFT) {
            return this.check(sealed, this.mainShape.cords) &&
                this.check(sealed, this.mainShape.cords.calc(-1, 0)) &&
                this.check(sealed, this.mainShape.cords.calc(0, 1)) &&
                this.check(sealed, this.mainShape.cords.calc(1, 1));
        } else if (this.rotationIndex == RotationIndex.TOP) {
            return this.check(sealed, this.mainShape.cords) &&
                this.check(sealed, this.mainShape.cords.calc(1, 0)) &&
                this.check(sealed, this.mainShape.cords.calc(1, -1)) &&
                this.check(sealed, this.mainShape.cords.calc(0, 1));
        } else if (this.rotationIndex == RotationIndex.RIGHT) {
            return this.check(sealed, this.mainShape.cords) &&
                this.check(sealed, this.mainShape.cords.calc(1, 0)) &&
                this.check(sealed, this.mainShape.cords.calc(0, -1)) &&
                this.check(sealed, this.mainShape.cords.calc(-1, -1));
        }

        return false;
    }
}

/**
 * Represents the L-Shape in Tetris.
 * @extends {GameObject}
 */
export class LBox extends GameObject {
    public constructor(cords: VirtualPoint) {
        super(cords);

        this.shapes.push(
            new Cube(cords.calc(0, 1)),
            new Cube(cords.calc(1, 1)),
            new Cube(cords.calc(2, 1)),
            new Cube(cords.calc(2, 0))
        );

        this.mainShape = this.shapes[1];

        this.setColor("#ffaa00");
        this.setSprite(randomBoxSprite());
    }

    public rotate(): void {
        if (this.rotationIndex == RotationIndex.BOTTOM) {
            this.rotationIndex = RotationIndex.LEFT;

            this.shapes = [
                this.mainShape,
                new Cube(this.mainShape.cords.calc(0, -1)),
                new Cube(this.mainShape.cords.calc(0, 1)),
                new Cube(this.mainShape.cords.calc(1, 1))
            ];
        } else if (this.rotationIndex == RotationIndex.LEFT) {
            this.rotationIndex = RotationIndex.TOP;

            this.shapes = [
                this.mainShape,
                new Cube(this.mainShape.cords.calc(1, 0)),
                new Cube(this.mainShape.cords.calc(-1, 0)),
                new Cube(this.mainShape.cords.calc(-1, 1))
            ];
        } else if (this.rotationIndex == RotationIndex.TOP) {
            this.rotationIndex = RotationIndex.RIGHT;

            this.shapes = [
                this.mainShape,
                new Cube(this.mainShape.cords.calc(0, 1)),
                new Cube(this.mainShape.cords.calc(0, -1)),
                new Cube(this.mainShape.cords.calc(-1, -1))
            ];
        } else if (this.rotationIndex == RotationIndex.RIGHT) {
            this.rotationIndex = RotationIndex.BOTTOM;

            this.shapes = [
                this.mainShape,
                new Cube(this.mainShape.cords.calc(-1, 0)),
                new Cube(this.mainShape.cords.calc(1, 0)),
                new Cube(this.mainShape.cords.calc(1, -1))
            ];
        }
        this.setColor(this.mainShape.getColor());
        this.setSprite(this.mainShape.getSprite());
    }

    public canRotate(sealed: number[][]): boolean {
        if (this.rotationIndex == RotationIndex.BOTTOM) {
            return this.check(sealed, this.mainShape.cords) &&
                this.check(sealed, this.mainShape.cords.calc(0, -1)) &&
                this.check(sealed, this.mainShape.cords.calc(0, 1)) &&
                this.check(sealed, this.mainShape.cords.calc(1, 1));
        } else if (this.rotationIndex == RotationIndex.LEFT) {
            return this.check(sealed, this.mainShape.cords) &&
                this.check(sealed, this.mainShape.cords.calc(1, 0)) &&
                this.check(sealed, this.mainShape.cords.calc(1, 0)) &&
                this.check(sealed, this.mainShape.cords.calc(-1, 1));
        } else if (this.rotationIndex == RotationIndex.TOP) {
            return this.check(sealed, this.mainShape.cords) &&
                this.check(sealed, this.mainShape.cords.calc(0, 1)) &&
                this.check(sealed, this.mainShape.cords.calc(0, -1)) &&
                this.check(sealed, this.mainShape.cords.calc(-1, -1));
        } else if (this.rotationIndex == RotationIndex.RIGHT) {
            return this.check(sealed, this.mainShape.cords) &&
                this.check(sealed, this.mainShape.cords.calc(-1, 0)) &&
                this.check(sealed, this.mainShape.cords.calc(1, 0)) &&
                this.check(sealed, this.mainShape.cords.calc(1, -1));
        }

        return false;
    }
}

/**
 * Represents the reverse L-Shape in Tetris.
 * @extends {GameObject}
 */
export class RLBox extends GameObject {
    public constructor(cords: VirtualPoint) {
        super(cords);

        this.shapes.push(
            new Cube(cords),
            new Cube(cords.calc(0, 1)),
            new Cube(cords.calc(1, 1)),
            new Cube(cords.calc(2, 1))
        );

        this.mainShape = this.shapes[2];

        this.setColor("#0000ff");
        this.setSprite(randomBoxSprite());
    }

    public rotate(): void {
        if (this.rotationIndex == RotationIndex.BOTTOM) {
            this.rotationIndex = RotationIndex.LEFT;

            this.shapes = [
                this.mainShape,
                new Cube(this.mainShape.cords.calc(0, 1)),
                new Cube(this.mainShape.cords.calc(0, -1)),
                new Cube(this.mainShape.cords.calc(1, -1))
            ];
        } else if (this.rotationIndex == RotationIndex.LEFT) {
            this.rotationIndex = RotationIndex.TOP;

            this.shapes = [
                this.mainShape,
                new Cube(this.mainShape.cords.calc(-1, 0)),
                new Cube(this.mainShape.cords.calc(1, 0)),
                new Cube(this.mainShape.cords.calc(1, 1))
            ];
        } else if (this.rotationIndex == RotationIndex.TOP) {
            this.rotationIndex = RotationIndex.RIGHT;

            this.shapes = [
                this.mainShape,
                new Cube(this.mainShape.cords.calc(0, -1)),
                new Cube(this.mainShape.cords.calc(0, 1)),
                new Cube(this.mainShape.cords.calc(-1, 1))
            ];
        } else if (this.rotationIndex == RotationIndex.RIGHT) {
            this.rotationIndex = RotationIndex.BOTTOM;

            this.shapes = [
                this.mainShape,
                new Cube(this.mainShape.cords.calc(1, 0)),
                new Cube(this.mainShape.cords.calc(-1, 0)),
                new Cube(this.mainShape.cords.calc(-1, -1))
            ];
        }
        this.setColor(this.mainShape.getColor());
        this.setSprite(this.mainShape.getSprite());
    }

    public canRotate(sealed: number[][]): boolean {
        if (this.rotationIndex == RotationIndex.BOTTOM) {
            return this.check(sealed, this.mainShape.cords) &&
                this.check(sealed, this.mainShape.cords.calc(0, 1)) &&
                this.check(sealed, this.mainShape.cords.calc(0, -1)) &&
                this.check(sealed, this.mainShape.cords.calc(1, -1));
        } else if (this.rotationIndex == RotationIndex.LEFT) {
            return this.check(sealed, this.mainShape.cords) &&
                this.check(sealed, this.mainShape.cords.calc(-1, 0)) &&
                this.check(sealed, this.mainShape.cords.calc(1, 0)) &&
                this.check(sealed, this.mainShape.cords.calc(1, 1));
        } else if (this.rotationIndex == RotationIndex.TOP) {
            return this.check(sealed, this.mainShape.cords) &&
                this.check(sealed, this.mainShape.cords.calc(0, -1)) &&
                this.check(sealed, this.mainShape.cords.calc(0, 1)) &&
                this.check(sealed, this.mainShape.cords.calc(-1, 1));
        } else if (this.rotationIndex == RotationIndex.RIGHT) {
            return this.check(sealed, this.mainShape.cords) &&
                this.check(sealed, this.mainShape.cords.calc(1, 0)) &&
                this.check(sealed, this.mainShape.cords.calc(-1, 0)) &&
                this.check(sealed, this.mainShape.cords.calc(-1, -1));
        }

        return false;
    }
}

/**
 * Represents the straight line Shape in Tetris.
 * @extends {GameObject}
 */
export class LineBox extends GameObject {
    public constructor(cords: VirtualPoint) {
        super(cords);

        this.shapes.push(
            new Cube(cords.calc(0, 1)),
            new Cube(cords.calc(1, 1)),
            new Cube(cords.calc(2, 1)),
            new Cube(cords.calc(3, 1))
        );

        this.mainShape = this.shapes[1];

        this.setColor("#00ffff");
        this.setSprite(randomBoxSprite());
    }

    public rotate(): void {
        if (this.rotationIndex == RotationIndex.BOTTOM) {
            this.rotationIndex = RotationIndex.LEFT;

            this.shapes = [
                new Cube(this.mainShape.cords.calc(1, 0)),
                new Cube(this.mainShape.cords.calc(1, -1)),
                new Cube(this.mainShape.cords.calc(1, 1)),
                new Cube(this.mainShape.cords.calc(1, 2))
            ];
            this.setColor(this.mainShape.getColor());
            this.setSprite(this.mainShape.getSprite());
            this.mainShape = this.shapes[0];
        } else if (this.rotationIndex == RotationIndex.LEFT) {
            this.rotationIndex = RotationIndex.TOP;

            this.shapes = [
                new Cube(this.mainShape.cords.calc(0, 1)),
                new Cube(this.mainShape.cords.calc(1, 1)),
                new Cube(this.mainShape.cords.calc(-1, 1)),
                new Cube(this.mainShape.cords.calc(-2, 1))
            ];
            this.setColor(this.mainShape.getColor());
            this.setSprite(this.mainShape.getSprite());
            this.mainShape = this.shapes[0];
        } else if (this.rotationIndex == RotationIndex.TOP) {
            this.rotationIndex = RotationIndex.RIGHT;

            this.shapes = [
                new Cube(this.mainShape.cords.calc(-1, 0)),
                new Cube(this.mainShape.cords.calc(-1, 1)),
                new Cube(this.mainShape.cords.calc(-1, -1)),
                new Cube(this.mainShape.cords.calc(-1, -2))
            ];
            this.setColor(this.mainShape.getColor());
            this.setSprite(this.mainShape.getSprite());
            this.mainShape = this.shapes[0];
        } else if (this.rotationIndex == RotationIndex.RIGHT) {
            this.rotationIndex = RotationIndex.BOTTOM;

            this.shapes = [
                new Cube(this.mainShape.cords.calc(0, -1)),
                new Cube(this.mainShape.cords.calc(-1, -1)),
                new Cube(this.mainShape.cords.calc(1, -1)),
                new Cube(this.mainShape.cords.calc(2, -1))
            ];
            this.setColor(this.mainShape.getColor());
            this.setSprite(this.mainShape.getSprite());
            this.mainShape = this.shapes[0];
        }
    }

    public canRotate(sealed: number[][]): boolean {
        if (this.rotationIndex == RotationIndex.BOTTOM) {
            return this.check(sealed, this.mainShape.cords.calc(1, 0)) &&
                this.check(sealed, this.mainShape.cords.calc(1, -1)) &&
                this.check(sealed, this.mainShape.cords.calc(1, 1)) &&
                this.check(sealed, this.mainShape.cords.calc(1, 2));
        } else if (this.rotationIndex == RotationIndex.LEFT) {
            return this.check(sealed, this.mainShape.cords.calc(0, 1)) &&
                this.check(sealed, this.mainShape.cords.calc(1, 1)) &&
                this.check(sealed, this.mainShape.cords.calc(-1, 1)) &&
                this.check(sealed, this.mainShape.cords.calc(-2, 1));
        } else if (this.rotationIndex == RotationIndex.TOP) {
            return this.check(sealed, this.mainShape.cords.calc(-1, 0)) &&
                this.check(sealed, this.mainShape.cords.calc(-1, 1)) &&
                this.check(sealed, this.mainShape.cords.calc(-1, -1)) &&
                this.check(sealed, this.mainShape.cords.calc(-1, -2));
        } else if (this.rotationIndex == RotationIndex.RIGHT) {
            return this.check(sealed, this.mainShape.cords.calc(0, -1)) &&
                this.check(sealed, this.mainShape.cords.calc(-1, -1)) &&
                this.check(sealed, this.mainShape.cords.calc(1, -1)) &&
                this.check(sealed, this.mainShape.cords.calc(2, -1));
        }

        return false;
    }
}

function randomBoxSprite(): HTMLImageElement {
    const index: number = Math.floor(Math.random() * (Object.keys(Sprite).length));
    return spriteManager.get(path.join(__dirname, "assets", "sprites", Sprite[Object.keys(Sprite)[index]]));
}

/**
 * Represents an array containing definitions of all possible game objects in Tetris.
 * @type {GameObjectDefinitions[]}
 */
export const GAME_OBJECTS: GameObjectDefinitions[] = [Box, TBox, ZBox, RZBox, LBox, RLBox, LineBox];
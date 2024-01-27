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
import {Point, TransformBox, VirtualPoint} from "./math";
import {CELL_SIZE} from "./constants";
import * as path from "path";
import spriteManager from "./spriteManager";

/**
 * Type alias to shorthand the CanvasRenderingContext2D type
 * @type {Render}
 */
export type Render = CanvasRenderingContext2D;


export type RenderLayers = {
    grid: Render;
    movable: Render;
    sealed: Render;
}

/**
 * Game definition for the loader.
 * @interface
 */
export interface Game {
    /**
     * Is called once when the game is loading.
     * @param {RenderLayers} layers - The rendering context.
     * @public
     * @returns {void}
     */
    start(layers: RenderLayers): void;

    /**
     * Is called on any render frame defined by {@link window.requestAnimationFrame}.
     * @param {RenderLayers} layers - The rendering context.
     * @public
     * @returns {void}
     */
    loop(layers: RenderLayers): void;
}

/**
 * Represents an abstract class for rendering elements on the screen.
 * @abstract
 * @class
 */
export abstract class RenderObject {
    /**
     * The color of pixels on the screen rendered by the element.
     * @type {string}
     * @private
     */
    private color: string;

    protected constructor() {
        this.color = "#000000";
    }

    /**
     * Sets the color for the element.
     * @param {string} color - The color to set.
     * @public
     * @returns {void}
     */
    public setColor(color: string): void {
        this.color = color;
    }

    /**
     * Gets the color of the element.
     * @public
     * @returns {string} The color of the element.
     */
    public getColor(): string {
        return this.color;
    }

    /**
     * Draws the element on the screen with the current settings.
     * @param {Render} ctx - The rendering context.
     * @public
     * @returns {void}
     */
    public draw(ctx: Render): void {
        ctx.fillStyle = this.color;
        this.onDraw(ctx);
    }

    /**
     * Event trigger for all child element classes.
     * @abstract
     * @param {Render} ctx - The rendering context.
     * @protected
     * @returns {void}
     */
    protected abstract onDraw(ctx: Render): void;
}

export type RectType = "stroke" | "fill";

/**
 * Represents a class for rendering a rectangular element on the screen.
 * @class
 * @extends {RenderObject}
 */
export class Rect extends RenderObject {
    /**
     * The left top starting coordinates of the rect.
     * @type {Readonly<Point>}
     * @public
     */
    public readonly cords: Readonly<Point>;
    /**
     * The size of the rect.
     * @type {Readonly<TransformBox>}
     * @public
     */
    public readonly size: Readonly<TransformBox>;
    /**
     * Specifies whether the rect is filled or stroked.
     * @type {RectType}
     * @private
     */
    private type: RectType;

    public constructor(cords: Point, size: TransformBox) {
        super();
        this.cords = cords;
        this.size = size;
        this.type = "fill";
    }

    /**
     * Sets the type of the rect (fill or stroke).
     * @param {RectType} type - The type to set.
     * @public
     * @returns {void}
     */
    public setType(type: RectType): void {
        this.type = type;
    }

    protected onDraw(ctx: Render): void {
        if (this.type == "fill") {
            ctx.fillRect(this.cords.x, this.cords.y, this.size.width, this.size.height);
        } else {
            ctx.strokeRect(this.cords.x, this.cords.y, this.size.width, this.size.height);
        }
    }
}

export enum Sprite {
    RED = "red.png",
    BLUE = "blue.png",
    GREEN = "green.png",
    YELLOW = "yellow.png",
    DARKBLUE = "darkblue.png",
    PINK = "pink.png"
}

/**
 * Represents a class for rendering a filled cell in the game grid.
 * @class
 * @extends {RenderObject}
 */
export class Cube extends RenderObject {
    /**
     * Virtual coordinates of the GameGrid.
     * @type {VirtualPoint}
     * @private
     */
    private _cords: VirtualPoint;

    private sprite: HTMLImageElement;

    public constructor(p: VirtualPoint) {
        super();
        this._cords = p;
    }

    protected onDraw(ctx: Render): void {
        if (!!this.sprite) {
            ctx.drawImage(this.sprite, this._cords.x, this._cords.y, 50, 50);
        } else {
            ctx.fillRect(this._cords.x, this._cords.y, CELL_SIZE, CELL_SIZE);
        }
    }

    public setSprite(sprite: HTMLImageElement): void {
        this.sprite = sprite;
    }

    public getSprite(): HTMLImageElement {
        return this.sprite;
    }

    /**
     * Gets the x-coordinate of the virtual coordinates.
     * @type {number}
     * @public
     */
    public get x(): number {
        return this._cords.vx;
    }

    /**
     * Sets the x-coordinate of the virtual coordinates.
     * @param {number} n - The new x-coordinate.
     * @public
     */
    public set x(n: number) {
        this._cords = this._cords.clone(n, this.y);
    }

    /**
     * Gets the y-coordinate of the virtual coordinates.
     * @type {number}
     * @public
     */
    public get y(): number {
        return this._cords.vy;
    }

    /**
     * Sets the y-coordinate of the virtual coordinates.
     * @param {number} n - The new y-coordinate.
     * @public
     */
    public set y(n: number) {
        this._cords = this._cords.clone(this.x, n);
    }

    /**
     * Gets the virtual coordinates of the filled cell.
     * @type {VirtualPoint}
     * @public
     */
    public get cords(): VirtualPoint {
        return this._cords;
    }
}

/**
 * Represents a class for rendering text on the screen.
 * @class
 * @extends {RenderObject}
 */
export class Text extends RenderObject {
    /**
     * The text contents.
     * @type {string}
     * @public
     */
    public text: string;
    /**
     * The left top coordinates for drawing the text.
     * @type {Readonly<Point>}
     * @public
     */
    public readonly cords: Readonly<Point>;
    /**
     * The font size in pixels.
     * @type {number}
     * @private
     */
    private fontSize: number;
    /**
     * The font family identifier string (e.g., Arial).
     * @type {string}
     * @private
     */
    private family: string;

    public constructor(cords: Point) {
        super();
        this.cords = cords;

        this.text = "";
        this.fontSize = 12;
        this.family = "Arial";
    }

    /**
     * Sets the font size in pixels.
     * @param {number} px - The font size to set.
     * @public
     * @returns {void}
     */
    public setFontSize(px: number): void {
        this.fontSize = px;

    }

    /**
     * Sets the font family identifier string.
     * @param {string} family - The font family to set.
     * @public
     * @returns {void}
     */
    public setFontFamily(family: string): void {
        this.family = family;

    }

    protected onDraw(ctx: Render): void {
        ctx.font = `${this.fontSize}px ${this.family}`;
        ctx.fillText(this.text, this.cords.x, this.cords.y);
    }

}
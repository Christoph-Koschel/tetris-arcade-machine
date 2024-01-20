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
import {BOARD_X, BOARD_Y, CELL_SIZE} from "./constants";

/**
 * Represents a simple coordinate point on the screen.
 * @type {Point}
 */
export type Point = {
    x: number;
    y: number;
};

/**
 * Represents a struct for the size of an object.
 * @type {TransformBox}
 */
export type TransformBox = {
    height: number;
    width: number;
}

/**
 * Abstract class for mapping virtual points to real points.
 * @abstract
 * @class
 */
export abstract class VirtualPoint {
    /**
     * The x-coordinate of the virtual point.
     * @type {number}
     * @readonly
     */
    public readonly vx: number;

    /**
     * The y-coordinate of the virtual point.
     * @type {number}
     * @readonly
     */
    public readonly vy: number;

    public constructor(x: number, y: number) {
        this.vx = x;
        this.vy = y;
    }

    /**
     * Abstract getter method for the x-coordinate to get the real point out of the virtual point.
     * @abstract
     * @type {number}
     * @readonly
     */
    public abstract get x(): number;

    /**
     * Abstract getter method for the y-coordinate to get the real point out of the virtual point.
     * @abstract
     * @type {number}
     * @readonly
     */
    public abstract get y(): number;

    /**
     * Returns a new VirtualPoint that is calculated with the offset of x and y to the current point.
     * @param {number} x - The offset in the x-direction.
     * @param {number} y - The offset in the y-direction.
     * @returns {VirtualPoint} A new VirtualPoint with the calculated coordinates.
     */
    public calc(x: number, y: number): VirtualPoint {
        // @ts-ignore
        return new this.constructor(this.vx + x, this.vy + y);
    }

    /**
     * Returns a new instance of the same point child class with the specified coordinates.
     * @param {number} x - The x-coordinate for the clone.
     * @param {number} y - The y-coordinate for the clone.
     * @returns {VirtualPoint} A new instance of the point child class with the specified coordinates.
     */
    public clone(x: number, y: number): VirtualPoint {
        // @ts-ignore
        return new this.constructor(x, y);
    }
}

/**
 * Returns a new Point with the specified x and y coordinates.
 * @param {number} x - The x-coordinate for the Point.
 * @param {number} y - The y-coordinate for the Point.
 * @returns {Point} A new Point with the specified coordinates.
 */
export function pointOf(x: number, y: number): Point {
    return {
        x: x,
        y: y
    }
}

/**
 * Returns a new TransformBox with the specified width and height.
 * @param {number} width - The width of the TransformBox.
 * @param {number} height - The height of the TransformBox.
 * @returns {TransformBox} A new TransformBox with the specified dimensions.
 */
export function sizeOf(width: number, height: number): TransformBox {
    return {
        width: width,
        height: height
    }
}

/**
 * Returns a new instance of a VirtualPoint child class with the specified x and y coordinates.
 * @param {typeof VirtualPoint} constr - The constructor function for the VirtualPoint child class.
 * @param {number} x - The x-coordinate for the new VirtualPoint.
 * @param {number} y - The y-coordinate for the new VirtualPoint.
 * @returns {VirtualPoint} A new instance of the VirtualPoint child class with the specified coordinates.
 */
export function virtualOf(constr: typeof VirtualPoint, x: number, y: number): VirtualPoint {
    // @ts-ignore
    return new constr(x, y);
}

/**
 * Represents a point in the game board, mapping grid coordinates to real screen coordinates.
 * @extends {VirtualPoint}
 */
export class BoardPoint extends VirtualPoint {
    get x(): number {
        return this.vx * CELL_SIZE + BOARD_X;
    }

    get y(): number {
        return this.vy * CELL_SIZE + BOARD_Y;
    }
}
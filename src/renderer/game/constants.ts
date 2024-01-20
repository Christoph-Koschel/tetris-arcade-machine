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

/**
 * The resolution width for a 16:9 aspect ratio.
 * @type {number}
 */
export const SCREEN_WIDTH: number = 500;
/**
 * The resolution height for a 16:9 aspect ratio.
 * @type {number}
 */
export const SCREEN_HEIGHT: number = 900;

/**
 * The number of cells in the x-direction.
 * @type {number}
 */
export const CELL_COUNT_X: number = 10;

/**
 * The number of cells in the y-direction.
 * @type {number}
 */
export const CELL_COUNT_Y: number = 18;

/**
 * The width of the game grid in pixels.
 * @type {number}
 */
export const BOARD_WIDTH: number = 500;

/**
 * The size of a cell in pixels, calculated based on the board width and cell count.
 * @type {number}
 */
export const CELL_SIZE: number = BOARD_WIDTH / CELL_COUNT_X;

/**
 * The height of the game grid in pixels, calculated based on the cell size and cell count.
 * @type {number}
 */
export const BOARD_HEIGHT: number = CELL_SIZE * CELL_COUNT_Y;

/**
 * The x-position of the game grid on the screen in pixels, centered horizontally.
 * @type {number}
 */
export const BOARD_X: number = 0; //SCREEN_WIDTH / 2 - BOARD_WIDTH / 2;

/**
 * The y-position of the game grid on the screen in pixels, centered vertically.
 * @type {number}
 */
export const BOARD_Y: number = 0; //(SCREEN_HEIGHT - BOARD_HEIGHT) / 2;

/**
 * The offset of the details panel to the game grid in pixels.
 * @type {number}
 */
export const DETAILS_MARGIN: number = CELL_SIZE;

/**
 * The x-position of the details panel in pixels, positioned to the right of the game grid.
 * @type {number}
 */
export const DETAILS_X: number = BOARD_X + BOARD_WIDTH + DETAILS_MARGIN;

/**
 * The y-position of the details panel in pixels, aligned with the top of the game grid.
 * @type {number}
 */
export const DETAILS_Y: number = BOARD_Y;

/**
 * The width of the details panel in pixels.
 * @type {number}
 */
export const DETAILS_WIDTH: number = 250;

/**
 * The height of the details panel in pixels, set to match the width.
 * @type {number}
 */
export const DETAILS_HEIGHT: number = DETAILS_WIDTH;
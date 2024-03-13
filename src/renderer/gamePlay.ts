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
import * as path from "path";

import {GameSettings} from "./game";
import {Cube, Rect, RenderLayers, Sprite} from "./game/rendering";
import {GAME_OBJECTS, GameObject, GameObjectDefinitions} from "./game/objects";
import {BOARD_X, BOARD_Y, CELL_COUNT_X, CELL_COUNT_Y, CELL_SIZE, SCREEN_HEIGHT, SCREEN_WIDTH} from "./game/constants";
import {BoardPoint, pointOf, sizeOf, virtualOf} from "./game/math";
import spriteManager from "./game/spriteManager";
import Keymap from "../driver/keymap";
import {GameInterrupts} from "../driver/keyboard";
import {View} from "./view";
import scoreBoard, {GameStats} from "./scoreBoard";

export enum GameType {
    MULTIPLAYER,
    SINGLEPLAYER
}

export class GamePlay {
    /**
     * GameObjects of the cells in the grid.
     * @type {Rect[][]}
     * @private
     */
    private grid: Rect[][];

    /**
     * GameObjects of the cells in the preview grid.
     * @type {Rect[][]}
     * @private
     */
    private previewGrid: Rect[][];

    /**
     * 2D-Int Array for sealed cells when they are blocked by a cube.
     * Is faster for body-collision detection than looping through the {@link buffered} RenderObjects.
     * @type {number[][]}
     * @private
     */
    private sealed: number[][];

    /**
     * Current movable shape.
     * @type {GameObject}
     * @private
     */
    private movable: GameObject;

    /**
     * Next movable shape in the queue.
     * @type {GameObject}
     * @private
     */
    private nextMovable: GameObject;

    /**
     * All cubes from the shapes after placing them.
     * @type {Cube[]}
     * @private
     */
    private buffered: Cube[];

    /**
     * The int handler for the JavaScript setInterval function.
     * @type {number}
     * @private
     */
    private speedLoop: NodeJS.Timeout;

    /**
     * Points of the current score.
     * @type {number}
     * @private
     */
    private points: number;

    /**
     * Defines the number of lines that were cleared since the last level.
     * @type {number}
     * @private
     */
    private cleared: number;

    /**
     * Defines the number of lines that need to be cleared for the next level.
     * @type {number}
     * @private
     */
    private needToClear: number;

    /**
     * The current level.
     * @type {number}
     * @private
     */
    private level: number;

    /**
     * The number of combos increasing by cleared lines in a row.
     * @type {number}
     * @private
     */
    private combo: number;

    /**
     * Flag terminating if the game is actually played
     * @type {boolean}
     * @private
     */
    private isEnabled: boolean;

    /**
     * Flag terminates if the loop needs to render the sealed layer.
     * @type {boolean}
     * @private
     */
    private sealedRenderFlag: boolean;

    /**
     * Flag terminates if the loop needs to render the movable layer.
     * @type {boolean}
     * @private
     */
    private movableRenderFlag: boolean;

    /**
     * Storing the current settings which depends on the difficulty.
     * @type {GameSettings}
     * @private
     */
    private settings: GameSettings;

    /**
     * Terminates if the current game is a singleplayer or multiplayer game.
     * @type {GameType}
     * @private
     */
    private gameType: GameType;

    /**
     * When a multiplayer game is played this field contains the other GameField.
     * @type {GamePlay}
     * @private
     */
    private otherGame: GamePlay;

    /**
     * Generator for generating the next GameObject
     * @type {Generator}
     * @private
     */
    public readonly generator: Generator;

    /**
     * Callback holder for scoring. Is called every time when the score changes.
     * @type {Function}
     */
    public onScoreUpdate: { (score: number): void } | null;

    /**
     * Flag terminating if the current gameplay is played with the player1 controls.
     * @type {boolean}
     */
    public isPlayer1: boolean;

    /**
     * Terminates if the current GameObject touched the ground or another sealed block.
     * @type {boolean}
     * @private
     */
    private lastMove: boolean;
    /**
     * Terminates if the Game was lost. Is only set in multiplayer.
     * @type {boolean}
     * @private
     */
    private wasLoser: boolean;

    /**
     * Field for storing all RenderLayers.
     * @private
     */
    private readonly layers: RenderLayers;

    public constructor(layers: RenderLayers) {
        this.lastMove = true;
        this.wasLoser = false;
        this.layers = layers;
        this.generator = new Generator();
    }

    /**
     * Is called once when the game field is built.
     * @returns {void}
     */
    public start(): void {
        this.isEnabled = false;
        this.sealedRenderFlag = false;
        this.movableRenderFlag = false;

        // Init KeyEvents
        // region Player1
        Keymap.on(GameInterrupts.P1_MOVE_LEFT, () => {
            if (!this.isEnabled || !this.isPlayer1) {
                return;
            }

            if ((this.movable.getLeft() > 0) && this.movable.canGoLeft(this.sealed)) {
                this.movable.left();
            }
            this.movableRenderFlag = true;
            this.loop();
        });
        Keymap.on(GameInterrupts.P1_MOVE_RIGHT, () => {
            if (!this.isEnabled || !this.isPlayer1) {
                return;
            }

            if ((this.movable.getRight() < CELL_COUNT_X - 1) && this.movable.canGoRight(this.sealed)) {
                this.movable.right();
            }
            this.movableRenderFlag = true;
            this.loop();
        });
        Keymap.on(GameInterrupts.P1_SMOOTH_DOWN, () => {
            if (!this.isEnabled || !this.isPlayer1) {
                return;
            }
            this.moveDown();
        });
        Keymap.on(GameInterrupts.P1_ROTATE, () => {
            if (!this.isEnabled || !this.isPlayer1) {
                return;
            }

            if (this.movable.canRotate(this.sealed)) {
                this.movable.rotate();
            }
            this.movableRenderFlag = true;
            this.loop();
        });
        Keymap.on(GameInterrupts.P1_FAST_DOWN, () => {
            if (!this.isEnabled || !this.isPlayer1) {
                return;
            }
            while (true) {
                if (!this.moveDown()) {
                    break;
                }
            }
        });
        // endregion
        // region Player2
        Keymap.on(GameInterrupts.P2_MOVE_LEFT, () => {
            if (!this.isEnabled || this.isPlayer1) {
                return;
            }

            if ((this.movable.getLeft() > 0) && this.movable.canGoLeft(this.sealed)) {
                this.movable.left();
            }
            this.movableRenderFlag = true;
            this.loop();
        });
        Keymap.on(GameInterrupts.P2_MOVE_RIGHT, () => {
            if (!this.isEnabled || this.isPlayer1) {
                return;
            }

            if ((this.movable.getRight() < CELL_COUNT_X - 1) && this.movable.canGoRight(this.sealed)) {
                this.movable.right();
            }
            this.movableRenderFlag = true;
            this.loop();
        });
        Keymap.on(GameInterrupts.P2_SMOOTH_DOWN, () => {
            if (!this.isEnabled || this.isPlayer1) {
                return;
            }
            this.moveDown();
        });
        Keymap.on(GameInterrupts.P2_ROTATE, () => {
            if (!this.isEnabled || this.isPlayer1) {
                return;
            }

            if (this.movable.canRotate(this.sealed)) {
                this.movable.rotate();
            }
            this.movableRenderFlag = true;
            this.loop();
        });
        Keymap.on(GameInterrupts.P2_FAST_DOWN, () => {
            if (!this.isEnabled || this.isPlayer1) {
                return;
            }
            while (true) {
                if (!this.moveDown()) {
                    break;
                }
            }
        });
        // endregion

        // Create the grid cells
        this.grid = [];
        for (let i: number = 0, x: number = 0; i < CELL_COUNT_X; i++, x += CELL_SIZE) {
            let row: Rect[] = [];
            for (let k: number = 0, y: number = 0; k < CELL_COUNT_Y; k++, y += CELL_SIZE) {
                let cell: Rect = new Rect(pointOf(x + BOARD_X, y + BOARD_Y), sizeOf(CELL_SIZE, CELL_SIZE));
                cell.setColor("#000000");
                cell.setType("stroke");

                row.push(cell);
            }

            this.grid.push(row);
        }

        // Create the preview grid cells
        this.previewGrid = [];
        for (let i: number = 0, x: number = 0; i < 4; i++, x += CELL_SIZE) {
            let row: Rect[] = [];
            for (let k: number = 0, y: number = 0; k < 2; k++, y += CELL_SIZE) {
                let cell: Rect = new Rect(pointOf(x, y), sizeOf(CELL_SIZE, CELL_SIZE));
                cell.setColor("#000000");
                cell.setType("stroke");

                row.push(cell);
            }

            this.previewGrid.push(row);
        }

        // Draw basic grid
        this.grid.forEach(row => row.forEach(cell => cell.draw(this.layers.grid)));
        // Draw preview grid
        this.previewGrid.forEach(row => row.forEach(cell => cell.draw(this.layers.previewGrid)));
    }

    /**
     * Draw each layer according to the drawing flags.
     * Is called on demand (ROD)
     * @returns {void}
     */
    public loop(): void {
        if (this.sealedRenderFlag) {
            this.layers.sealed.clearRect(0, 0, SCREEN_WIDTH, SCREEN_HEIGHT);
            this.buffered.forEach(cell => cell.draw(this.layers.sealed));
            this.sealedRenderFlag = false;
        }
        if (this.movableRenderFlag) {
            this.layers.movable.clearRect(0, 0, SCREEN_WIDTH, SCREEN_HEIGHT);
            if (this.settings.movablePrediction) {
                this.layers.movable.beginPath();
                let cubes: Cube[] = this.movable.getEachHorizontal();
                this.layers.movable.moveTo(cubes[0].cords.x, cubes[0].cords.y);
                cubes.forEach(c => {
                    this.layers.movable.lineTo(c.cords.x, c.cords.y);
                    this.layers.movable.lineTo(c.cords.x + CELL_SIZE, c.cords.y);
                });
                this.layers.movable.lineTo(cubes[cubes.length - 1].cords.x + CELL_SIZE, SCREEN_HEIGHT);
                this.layers.movable.lineTo(cubes[0].cords.x, SCREEN_HEIGHT);
                this.layers.movable.fillStyle = "rgba(255,255,255,0.25)";
                this.layers.movable.fill();

            }
            this.movable.draw(this.layers.movable);
            this.movableRenderFlag = false;
        }
    }

    /**
     * Resets the current Game to its initial point.
     * @param settings - The settings which the new games must start.
     * @returns {void}
     */
    public reset(settings: GameSettings): void {
        this.settings = settings;
        this.sealed = Array.from({length: CELL_COUNT_Y}, () => new Array(CELL_COUNT_X).fill(0));

        // Initialize the first movable GameObject
        this.movable = this.newGameObject();
        this.moveRandom();
        this.nextMovable = this.newGameObject();

        // Rest configuration
        this.buffered = [];
        this.points = 0;
        this.level = 1;
        this.combo = 0;
        this.cleared = 0;
        this.needToClear = 5;

        // Clear layers
        this.layers.movable.clearRect(0, 0, SCREEN_WIDTH, SCREEN_HEIGHT);
        this.layers.sealed.clearRect(0, 0, SCREEN_WIDTH, SCREEN_HEIGHT);

        // Draw preview
        this.layers.preview.clearRect(0, 0, 200, 100);
        this.nextMovable.drawOffGrid(this.layers.preview, virtualOf(BoardPoint, 0, 0));
    }

    public enable(): void {
        this.isEnabled = true;
        // Start game
        this.resetSpeedInterval();
    }

    public disable(): void {
        this.isEnabled = false;
        clearInterval(this.speedLoop);
    }

    public setGameType(type: GameType): void {
        this.gameType = type;
    }

    /**
     * Binds one Game to another and allows to communicate with each other. Is only needed in the multiplayer
     * @param game
     * @returns {void}
     */
    public bind(game: GamePlay): void {
        this.otherGame = game;

        // Connect the generators
        this.generator.bind(this.otherGame.generator);
        this.otherGame.generator.bind(this.generator);
    }

    /**
     * Push lines from the bottom
     * @param count - The number of lines
     * @returns {void}
     */
    public pushLine(count: number): void {
        for (let i: number = 0; i < count; i++) {
            let space: number = Math.floor(Math.random() * (CELL_COUNT_X));
            const cubes: Cube[] = [];
            for (let j: number = 0; j < CELL_COUNT_X; j++) {
                if (j == space) {
                    continue;
                }
                const cube: Cube = new Cube(virtualOf(BoardPoint, j, CELL_COUNT_Y - 1))
                cube.setSprite(spriteManager.get(path.join(__dirname, "assets", "sprites", Sprite.GRAY)));
                cube.setColor("#CCCCCC");
                cubes.push(cube);
            }

            this.buffered.forEach(b => b.y--);
            this.sealed.shift();
            this.sealed.push(Array.from({length: CELL_COUNT_X}, (v, k) => k == space ? 0 : 1));
            this.checkAndClearLine();
            this.buffered.push(...cubes);
        }

        this.sealedRenderFlag = true;
        this.loop();
    }

    /**
     * Sends current stats to the scoreboard. Is only needed in the multiplayer to display stats in the winning view.
     * @returns {void}
     */
    public send(): void {
        let stats: GameStats = {
            cleared: this.cleared,
            level: this.level,
            points: this.points,
            isLoser: this.wasLoser
        }
        this.wasLoser = false;
        scoreBoard.setStats(this.isPlayer1, stats);
    }

    /**
     * Resets the speed interval for the Tetris game.
     * @private
     * @returns {void}
     */
    private resetSpeedInterval(): void {
        if (!!this.speedLoop) {
            clearInterval(this.speedLoop);
        }

        let speed: number = 500 - (this.level - 1) * this.settings.speedMultiplier * 10;
        speed = speed <= 0 ? 20 : speed;

        this.speedLoop = setInterval((): void => {
            this.moveDown();
        }, speed);
    }

    /**
     * Creates a new random GameObject from the GAME_OBJECTS array.
     * @private
     * @returns {GameObject} A new random GameObject.
     */
    private newGameObject(): GameObject {
        return this.generator.nextMovable();
    }

    /**
     * Sets the current movable GameObject in a random horizontal position.
     * @private
     * @returns {void}
     */
    private moveRandom(): void {
        // Generate a random number between 0 and CELL_COUNT_X
        const rightMoving: number = Math.floor(Math.random() * (CELL_COUNT_X + 1));
        // Moves the GameObject as long as possible to the right
        for (let i: number = 0; i < rightMoving; i++) {
            if ((this.movable.getRight() < CELL_COUNT_X - 1) && this.movable.canGoRight(this.sealed)) {
                this.movable.right();
            } else {
                break;
            }
        }
    }

    /**
     * Checks and clears lines in the Tetris game grid.
     * Additionally, increases the point counter if needed.
     * @private
     * @returns {void}
     */
    private checkAndClearLine(): void {
        // Keep track of cleared lines
        let cleared: number = 0;
        this.sealed.forEach((l: number[], i: number) => {
            // A line is full if the sum of the sealed cells is equal to the width of the GameGrid
            let sum: number = l.reduce((a: number, b: number) => a + b);
            // When a line is cleared
            if (sum == CELL_COUNT_X) {
                // Removes the sealed line
                this.sealed.splice(i, 1);
                // Insert a new empty array at the removed point
                this.sealed.unshift(new Array(CELL_COUNT_X).fill(0));
                // Removes the unnecessary buffered RenderObjects from the array
                this.buffered = this.buffered.filter(b => b.y != i);
                // Moves all RenderObject above the cleared line one down
                this.buffered.forEach(b => b.y < i ? b.y += 1 : null);
                // And increases the cleared line counter
                cleared++;
            }
        });

        // Increases the points depending on the cleared lines
        if (cleared != 0) {
            // https://tetris.wiki/Scoring
            switch (cleared) {
                case 1:
                    if (this.gameType == GameType.MULTIPLAYER && !!this.otherGame) {
                        this.otherGame.pushLine(1);
                    }
                    this.points += 100 * this.level * this.settings.levelMultiplier;
                    break;
                case 2:
                    if (this.gameType == GameType.MULTIPLAYER && !!this.otherGame) {
                        this.otherGame.pushLine(2);
                    }
                    this.points += 300 * this.level * this.settings.levelMultiplier;
                    break;
                case 3:
                    if (this.gameType == GameType.MULTIPLAYER && !!this.otherGame) {
                        this.otherGame.pushLine(3);
                    }
                    this.points += 500 * this.level * this.settings.levelMultiplier;
                    break;
                default:
                    if (this.gameType == GameType.MULTIPLAYER && !!this.otherGame) {
                        this.otherGame.pushLine(4);
                    }
                    this.points += 1200 * this.level * this.settings.levelMultiplier;
            }
            this.points += 50 * this.combo * this.level * this.settings.levelMultiplier;
            if (!!this.onScoreUpdate) {
                this.onScoreUpdate(this.points);
            }
            // Increases the combo if a line was cleared
            this.combo++;
        } else {
            // Sets the combo to zero when with the current GameObject no line cleared
            this.combo = 0;
        }

        // Adds the cleared line to the global cleared lines
        this.cleared += cleared;
        // Checks and increases the level when the needed clear count was reached
        if (this.cleared >= this.needToClear) {
            this.cleared = this.cleared - this.needToClear;
            this.level++;
            this.needToClear = this.level * 5;
            // Update the speed Interval
            this.resetSpeedInterval();
        }
    }

    /**
     * This method is a utility function for moving the GameObject down.
     * @private
     * @returns {boolean} Returns false when the GameObject cannot go down any further.
     */
    private moveDown(): boolean {
        // Check if the movable GameObject can't go further down
        if (this.movable.getBottom() == CELL_COUNT_Y - 1 || !this.movable.canGoDown(this.sealed)) {
            if (this.lastMove) {
                this.lastMove = false;
                this.loop();
                return true;
            } else {
                // Adds the Cubes of the GameObject to the buffered list
                this.buffered.push(...this.movable.seal(this.sealed));
                // Check for clearing lines
                this.checkAndClearLine();
                // Go in queue one further
                this.movable = this.nextMovable;
                this.moveRandom();
                this.nextMovable = this.newGameObject();
                this.layers.preview.clearRect(0, 0, 200, 100);
                this.nextMovable.drawOffGrid(this.layers.preview, virtualOf(BoardPoint, 0, 0));

                // Trigger sealed layer rendering
                this.sealedRenderFlag = true;
                this.movableRenderFlag = true;

                // Check for GameOver
                if (this.sealed[0].reduce((a: number, b: number) => a + b) != 0 || this.sealed[1].reduce((a: number, b: number) => a + b) != 0) {
                    clearInterval(this.speedLoop);
                    if (this.gameType == GameType.SINGLEPLAYER) {
                        scoreBoard.setUnknown(this.points);
                        View.loadWithGroup("scoreBoardWriter", "scoreBoardWriter");
                    } else {
                        this.wasLoser = true;
                        View.loadWithGroup("winBoard", "winBoard");
                    }
                }
                this.loop();
                return false;
            }
        }

        this.movable.down();
        this.lastMove = true;
        this.movableRenderFlag = true;
        this.loop();
        return true;
    }
}

/**
 * Generates new random GameObjects when needed.
 * Allows in the multiplayer to have the same GameObject sequence.
 */
export class Generator {
    private readonly movables: GameObject[];
    private other: Generator;

    public constructor() {
        this.movables = [];
    }

    public nextMovable(): GameObject {
        this.checkList();
        return this.movables.shift();
    }

    public peekMovable(): GameObject {
        this.checkList();
        return this.movables[0];
    }

    private checkList(): void {
        if (this.movables.length != 0) {
            return;
        }

        if (!!this.other) {
            const [left, right] = this.generateNew(true);
            this.pushBack(left);
            this.other.pushBack(right);
        } else {
            const [left, _] = this.generateNew(false);
            this.pushBack(left);
        }
    }

    private pushBack(obj: GameObject): void {
        this.movables.push(obj);
    }

    private generateNew<B extends boolean>(twice: B): [GameObject, (B extends true ? GameObject : null)] {
        const constr: GameObjectDefinitions = GAME_OBJECTS[Math.floor(Math.random() * (GAME_OBJECTS.length))];

        if (twice) {
            return [new constr(virtualOf(BoardPoint, 0, 0)), new constr(virtualOf(BoardPoint, 0, 0)) as unknown as (B extends true ? GameObject : null)];
        } else {
            return [new constr(virtualOf(BoardPoint, 0, 0)), null as unknown as (B extends true ? GameObject : null)];
        }
    }

    public bind(other: Generator): void {
        this.other = other;
    }
}
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
 * Struct representing the Game modification for the different difficulties.
 */
export type GameSettings = {
    levelMultiplier: number;
    speedMultiplier: number;
    movablePrediction: boolean;
    randomColors: boolean;
}

export enum PlayerModes {
    HARD = "Schwer",
    MEDIUM = "Mittel",
    EASY = "Leicht",
}

export enum PlayerControls {
    PLAYER_1 = "Player 1",
    PLAYER_2 = "Player 2"
}

let currentGameMode: PlayerModes = PlayerModes.EASY;

export function getCurrentGameMode(): PlayerModes {
    return currentGameMode;
}

export function setCurrentGameMode(mode: PlayerModes): void {
    currentGameMode = mode;
}

let randomSprite: boolean = false;

export function setRandomSprite(b: boolean): void {
    randomSprite = b;
}

export function getRandomSprite(): boolean {
    return randomSprite;
}


let currentGameControls: PlayerControls = PlayerControls.PLAYER_1;

export function getCurrentGameControls(): PlayerControls {
    return currentGameControls;
}

export function setCurrentGameControls(control: PlayerControls): void {
    currentGameControls = control;
}
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
import {DriverCon} from "./keymap";

export enum GameInterrupts {
    P1_MOVE_LEFT = 0b1,
    P1_SMOOTH_DOWN = 0b10,
    P1_MOVE_RIGHT = 0b100,
    P1_ROTATE = 0b1000,
    P1_FAST_DOWN = 0b10000,
    P2_MOVE_LEFT = 0b100000,
    P2_SMOOTH_DOWN = 0b1000000,
    P2_MOVE_RIGHT = 0b10000000,
    P2_ROTATE = 0b100000000,
    P2_FAST_DOWN = 0b1000000000,
}

export class Keyboard implements DriverCon<GameInterrupts> {
    private cb: (id: GameInterrupts) => void;

    init(): void {
        window.addEventListener("keyup", (e) => {
            if (!!this.cb) {
                let id: GameInterrupts = e.key == "a" ? GameInterrupts.P1_MOVE_LEFT : e.key == "s" ? GameInterrupts.P1_SMOOTH_DOWN : e.key == "d" ? GameInterrupts.P1_MOVE_RIGHT : e.key == "l" ? GameInterrupts.P1_ROTATE : e.key == " " ? GameInterrupts.P1_FAST_DOWN : null;
                if (!!id) {
                    this.cb(id);
                }
            }
        });
    }

    onSignal(cb: (id: GameInterrupts) => void): void {
        this.cb = cb;
    }

}
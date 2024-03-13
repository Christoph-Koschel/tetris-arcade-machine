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
import {SerialPort} from "serialport";
import {DriverCon} from "./keymap";
import {GameInterrupts} from "./keyboard";

export class Serial implements DriverCon<GameInterrupts> {
    private comPort: SerialPort;
    private cb: (id: GameInterrupts) => void;

    init(): void {
        this.comPort = new SerialPort({
            path: "/dev/ttyACM0",
            baudRate: 9600
        });

        this.comPort.on("data", (buff: Buffer) => {
            const data: string = buff.toString("utf8").trim();
            if (data == "") {
                return;
            }

            const ints: number = parseInt(data);
            const keys: (keyof GameInterrupts)[] = <(keyof GameInterrupts)[]>Object.keys(GameInterrupts);
            for (const key of keys) {
                if ((ints & <number>GameInterrupts[key]) == <number>GameInterrupts[key]) {
                    this.cb(GameInterrupts[key]);
                }
            }
        });
    }

    onSignal(cb: (id: GameInterrupts) => void): void {
        this.cb = cb;
    }

}




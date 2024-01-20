import {DriverCon} from "./keymap";

export enum KeyBoardConPress {
    KEY_A = 0b1,
    KEY_S = 0b10,
    KEY_D = 0b100,
    KEY_L = 0b1000,
    KEY_SPACE = 0b10000,
}

export class Keyboard implements DriverCon<KeyBoardConPress> {
    private cb: (id: KeyBoardConPress) => void;

    init(): void {
        window.addEventListener("keyup", (e) => {
            if (!!this.cb) {
                let id: KeyBoardConPress = e.key == "a" ? KeyBoardConPress.KEY_A : e.key == "s" ? KeyBoardConPress.KEY_S : e.key == "d" ? KeyBoardConPress.KEY_D : e.key == "l" ? KeyBoardConPress.KEY_L : e.key == " " ? KeyBoardConPress.KEY_SPACE : null;
                if (!!id) {
                    this.cb(id);
                }
            }
        });
    }

    onSignal(cb: (id: KeyBoardConPress) => void): void {
        this.cb = cb;
    }

}
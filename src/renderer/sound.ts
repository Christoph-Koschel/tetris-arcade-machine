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
class Sound {
    private sounds: Map<string, HTMLAudioElement>

    public constructor() {
        this.sounds = new Map<string, HTMLAudioElement>();
    }

    public playSong(path: string): void {
        if (!this.sounds.has(path)) {
            this.sounds.set(path, new Audio(path));
        }
        this.sounds.get(path).play();
    }
}

const sound: Sound = new Sound();
export default sound;
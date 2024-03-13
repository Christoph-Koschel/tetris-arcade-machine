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

/*
This file defines the group functions which are for the navigation with the driver.
 */

const groupCount: Map<string, number> = new Map<string, number>();

export function getHighest(group: string): number {
    return groupCount.get(group)
}

export function incGroup(group: string): void {
    groupCount.set(group, getGroup(group) + 1);
}

export function getGroup(group: string): number {
    if (!groupCount.has(group)) {
        groupCount.set(group, 0);
    }
    return groupCount.get(group);
}

export type Group = "main" | "preSinglePlayer" | "preMultiPlayer" | "scoreBoardWriter" | "winBoard";
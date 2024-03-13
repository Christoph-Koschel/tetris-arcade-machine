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

import {getGroup, incGroup, Group} from "../group";
import {ControllerClick, ControllerSelect, ControllerUnSelect} from "../playerController";

/**
 * Component class for creating a clickable UI-Elements.
 */
export class Selectable {
    public root: HTMLElement
    private onClick: Function;

    public constructor(text: string, group: Group) {
        this.root = document.createElement("div");
        this.root.classList.add("selectable");
        this.root.innerHTML = text;
        this.root.setAttribute("data-group", group);

        let index: number = getGroup(group);
        this.root.setAttribute("data-index", index.toString());
        incGroup(group);
        this.root.addEventListener(ControllerSelect.logicalName, () => {
            this.root.classList.add("active");
        });
        this.root.addEventListener(ControllerUnSelect.logicalName, () => {
            this.root.classList.remove("active");
        });
        this.root.addEventListener(ControllerClick.logicalName, () => {
            if (!!this.onClick) {
                this.onClick();
            }
        });
    }

    /**
     * Sets the click function that is triggered when the selectable got "clicked" by the driver.
     * @param cb {Function}
     */
    public setOnClick(cb: Function): void {
        this.onClick = cb;
    }
}
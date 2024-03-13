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
import {getHighest, Group} from "./group";

/**
 * Class for navigating registering elements into a group.
 * Also includes some helper function to navigation between them.
 * @class
 */
class PlayerController {
    private activeGroup: Group;
    private activeIndex: number;
    private isEnabled: boolean;

    public constructor() {
        this.activeGroup = null;
        this.activeIndex = -1;
        this.isEnabled = true;
    }

    /**
     * Unselects the current selected element.
     * @return {void}
     */
    public unselect(): void {
        let element: Element = document.querySelector(`[data-group='${this.activeGroup}'][data-index='${this.activeIndex}']`);
        if (!!element) {
            element.dispatchEvent(new ControllerUnSelect());
        }
    }

    /**
     * Sets the active group.
     * @param group
     * @return {void}
     */
    public setGroup(group: Group): void {
        this.unselect();

        this.activeGroup = group;
        this.activeIndex = -1;
        this.next(true);
    }

    public enable(): void {
        this.isEnabled = true;
    }

    public disable(): void {
        this.isEnabled = false;
    }

    /**
     * Selects the next element in the group.
     * @param noUnselect
     * @return {void}
     */
    public next(noUnselect: boolean = false): void {
        if (!this.isEnabled) {
            return;
        }

        let element: Element;
        if (!noUnselect) {
            element = document.querySelector(`[data-group='${this.activeGroup}'][data-index='${this.activeIndex}']`);
            if (!element) {
                return;
            }
            element.dispatchEvent(new ControllerUnSelect());
        }

        this.activeIndex++;
        if (this.activeIndex == getHighest(this.activeGroup)) {
            this.activeIndex = 0;
        }

        element = document.querySelector(`[data-group='${this.activeGroup}'][data-index='${this.activeIndex}']`);
        if (!element) {
            return;
        }
        element.dispatchEvent(new ControllerSelect());
    }

    /**
     * Selects the previous element in the group
     * @return {void}
     */
    public previous(): void {
        if (!this.isEnabled) {
            return;
        }

        let element: Element = document.querySelector(`[data-group='${this.activeGroup}'][data-index='${this.activeIndex}']`);
        if (!element) {
            return;
        }
        element.dispatchEvent(new ControllerUnSelect());

        this.activeIndex--;
        if (this.activeIndex < 0) {
            this.activeIndex = getHighest(this.activeGroup) - 1;
        }

        element = document.querySelector(`[data-group='${this.activeGroup}'][data-index='${this.activeIndex}']`);
        if (!element) {
            return;
        }
        element.dispatchEvent(new ControllerSelect());
    }

    /**
     * Triggers the Click event on current selected element.
     * @return {void}
     */
    public click(): void {
        if (!this.isEnabled) {
            return;
        }

        let element: Element = document.querySelector(`[data-group='${this.activeGroup}'][data-index='${this.activeIndex}']`);
        if (!element) {
            return;
        }
        element.dispatchEvent(new ControllerClick());
    }
}

/**
 * Custom Event when a selectable is selected
 * @class
 */
export class ControllerSelect extends Event {
    public static logicalName: string = "controller.select";

    public constructor() {
        super(ControllerSelect.logicalName);
    }
}


/**
 * Custom Event when a selectable is unselected
 * @class
 */
export class ControllerUnSelect extends Event {
    public static logicalName: string = "controller.unselect";

    public constructor() {
        super(ControllerUnSelect.logicalName);
    }
}

/**
 * Custom Event when a selectable is "clicked"
 * @class
 */
export class ControllerClick extends Event {
    public static logicalName: string = "controller.click";

    public constructor() {
        super(ControllerClick.logicalName);
    }
}

const controller: PlayerController = new PlayerController();
export default controller;
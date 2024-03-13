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
import playerController from "./playerController";
import {Group} from "./group";

/**
 * Base class for creating Views
 * @class
 */
export abstract class View {
    public static views: Map<string, View> = new Map<string, View>();
    private static currentView: View = null;

    public constructor(name: string) {
        View.views.set(name, this);
    }

    public abstract onBuild(): void;

    public abstract onAppend(root: HTMLElement): void;

    public abstract onDestroy(): void;

    public static load(name: string): void {
        let view: View = this.views.get(name);
        if (!view) {
            console.warn(`View '${name}' don't exist`);
            return;
        }
        playerController.unselect();

        if (!!this.currentView) {
            this.currentView.onDestroy();
        }
        document.body.innerHTML = "";
        view.onAppend(document.body);
        this.currentView = view;
    }

    public static loadWithGroup(name: string, group: Group): void {
        this.load(name);
        playerController.setGroup(group)
    }
}


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
import {Selectable} from "./selectable";
import {Group} from "../group";

export class Option<T> {
    private items: T[];
    private currentIndex: number;
    public root: HTMLElement;
    private previous: Selectable;
    private span: HTMLElement;
    private next: Selectable;

    public get current(): T {
        return this.items[this.currentIndex];
    }

    public constructor(items: T[], group: Group) {
        this.items = items;
        this.currentIndex = 0;

        this.root = document.createElement("div");
        this.root.classList.add("option");


        this.previous = new Selectable("<", group);
        this.previous.setOnClick(() => {
            this.currentIndex--;
            if (this.currentIndex < 0) {
                this.currentIndex = this.items.length - 1;
            }
            this.span.innerHTML = this.current.toString();
        });

        this.span = document.createElement("span");
        this.span.innerHTML = this.current.toString();

        this.next = new Selectable(">", group);
        this.next.setOnClick(() => {
            this.currentIndex++;
            if (this.currentIndex >= this.items.length) {
                this.currentIndex = 0;
            }
            this.span.innerHTML = this.current.toString();
        });

        this.root.appendChild(this.previous.root);
        this.root.appendChild(this.span);
        this.root.appendChild(this.next.root);
    }
}
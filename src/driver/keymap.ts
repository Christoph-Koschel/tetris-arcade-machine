export interface DriverCon<T extends number> {
    init(): void;

    onSignal(cb: (id: T) => void): void;
}

export default class Keymap {
    private static events: Map<number, Function[]> = new Map<number, Function[]>();

    public static init<T extends number>(driver: DriverCon<T>): void {
        driver.onSignal((n) => {
            this.emit(n);
        });

        driver.init();
    }

    public static on(k: number, cb: Function): void {
        if (!this.events.has(k)) {
            this.events.set(k, []);
        }

        this.events.get(k).push(cb);
    }

    private static emit(k: number): void {
        if (!this.events.has(k)) {
            return;
        }

        this.events.get(k).forEach(cb => cb());
    }
}
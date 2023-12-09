export type Serializable = number | boolean | string | Serialization | number[] | boolean[] | string[] | Serialization[] | {
    [KEY in string]: Serializable;
};
export type Config = {
    modules: {
        [Name in string]: string[];
    };
    loaders: {
        [Name in string]: string[];
    };
    dependencies: {
        [Name in string]: string[];
    };
    moduleType: {
        [Name in string]: BuildType;
    };
    plugins: {
        [Name in string]: PluginInformation[];
    };
    queues: {
        [Name in string]: Queue<QueueDataGroup>;
    };
};
export type PluginInformation = {
    name: string;
    parameters: Serializable[];
};
export declare enum QueueKind {
    COMPILE_MODULE = 0,
    COPY = 1,
    REMOVE = 2,
    SYNC_PLUGIN = 3,
    PACK = 4
}
export type QueueDataGroup = CopyData | RemoveData | CompileModuleData | SyncPluginData | PackData;
export type CopyData = {
    from: string;
    to: string;
    overwrite: boolean;
};
export type RemoveData = {
    target: string;
    recursive: boolean;
};
export type CompileModuleData = {
    moduleName: string;
};
export type PackData = {
    moduleName: string;
};
export type SyncPluginData = {};
export type Queue<T> = QueueEntry<T>[];
export type QueueEntry<T> = {
    kind: QueueKind;
    information: T;
};
export type BuildType = "lib" | "module";
export declare abstract class Serialization {
    abstract serialize(data: {
        [key in string]: Serializable;
    }): void;
    abstract deserialize(): {
        [key in string]: Serializable;
    };
}
export declare class QueueBuilder {
    private readonly from;
    private queue;
    private name;
    constructor(from: ConfigBuilder, name: string);
    compile_module(module: string): this;
    remove(path: string, recursive?: boolean): this;
    copy(from: string, to: string, overwrite?: boolean): this;
    pack(module: string): this;
    done(): ConfigBuilder;
}
export declare class ConfigBuilder {
    private modules;
    private loaders;
    private dependencies;
    private moduleType;
    private plugins;
    private queues;
    constructor();
    private current;
    add_module(name: string, paths: string[]): this;
    select_module(name: string): this;
    add_loader(path: string): this;
    use(name: string, ...parameters: Serializable[]): this;
    dependence(name: string): this;
    type(type: BuildType): this;
    create_build_queue(name?: string): QueueBuilder;
    set_queue(name: string, queue: Queue<QueueDataGroup>): void;
    build(): Config;
    write(filePath: string): void;
}
